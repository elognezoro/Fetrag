import { idSchema, questionTypeSchema, type QuestionTypeName } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { audit, NotFoundError, paginationArgs, PreconditionError, toPaginated } from '@fetrag/domain'
import { z } from 'zod'
import { resolveActivityContext } from './internal/course-tree'
import type { Db } from './internal/db'
import { assertCan, auditContext } from './lib/access'
import { toJsonValue } from './lib/json'
import { questionConfigSchemas } from './schemas'
import type { Principal, RequestMeta } from './types'

// -----------------------------------------------------------------------------
// Schémas d'entrée
// -----------------------------------------------------------------------------

export const questionOptionInputSchema = z.object({
  id: idSchema.optional(),
  label: z.string().trim().min(1).max(500),
  isCorrect: z.boolean().default(false),
  feedback: z.string().trim().max(1000).nullable().optional(),
  position: z.number().int().min(0).optional(),
  matchValue: z.string().trim().max(500).nullable().optional(),
})
export type QuestionOptionInput = z.input<typeof questionOptionInputSchema>

const questionBaseSchema = z.object({
  type: questionTypeSchema,
  prompt: z.string().trim().min(3).max(5000),
  explanation: z.string().trim().max(5000).nullable().optional(),
  category: z.string().trim().max(120).nullable().optional(),
  difficulty: z.number().int().min(1).max(5).default(1),
  points: z.number().int().min(1).max(100).default(1),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  config: z.unknown().optional(),
  options: z.array(questionOptionInputSchema).max(30).default([]),
  isActive: z.boolean().default(true),
})

/** Contrôles de cohérence par type de question (LMS-03). */
function validateByType(value: z.infer<typeof questionBaseSchema>, ctx: z.RefinementCtx): void {
  const correct = value.options.filter((o) => o.isCorrect).length
  const configResult = questionConfigSchemas[value.type].safeParse(value.config ?? {})
  if (!configResult.success) {
    for (const issue of configResult.error.issues) ctx.addIssue({ code: 'custom', path: ['config', ...issue.path], message: issue.message })
    return
  }
  const config = configResult.data as Record<string, unknown>
  switch (value.type) {
    case 'SINGLE_CHOICE':
      if (value.options.length < 2) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Au moins deux options' })
      if (correct !== 1) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Exactement une option correcte' })
      break
    case 'MULTIPLE_CHOICE':
      if (value.options.length < 2) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Au moins deux options' })
      if (correct < 1) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Au moins une option correcte' })
      break
    case 'TRUE_FALSE':
      if (typeof config.answer !== 'boolean' && !(value.options.length === 2 && correct === 1)) {
        ctx.addIssue({ code: 'custom', path: ['config', 'answer'], message: 'Indiquez la réponse attendue (vrai / faux)' })
      }
      break
    case 'MATCHING':
      if (value.options.length < 2 || value.options.some((o) => !o.matchValue)) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: 'Au moins deux paires, chacune avec une valeur à associer' })
      }
      break
    case 'ORDERING':
      if (value.options.length < 2) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Au moins deux éléments à ordonner' })
      break
    case 'FILL_BLANK':
    case 'SHORT_ANSWER':
    case 'ESSAY':
    default:
      break
  }
}

export const questionInputSchema = questionBaseSchema.superRefine(validateByType)
export type QuestionInput = z.input<typeof questionInputSchema>

export const questionListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  type: questionTypeSchema.optional(),
  category: z.string().trim().max(120).optional(),
  tag: z.string().trim().max(40).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  includeInactive: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})
export type QuestionListQuery = z.input<typeof questionListQuerySchema>

export const addToQuizSchema = z.object({
  quizId: idSchema,
  questionIds: z.array(idSchema).min(1).max(100),
  points: z.number().int().min(1).max(100).optional(),
})

const questionInclude = {
  options: { orderBy: { position: 'asc' as const } },
  author: { select: { id: true, name: true } },
  _count: { select: { quizzes: true, answers: true } },
} satisfies Prisma.QuestionInclude

// -----------------------------------------------------------------------------
// Lecture
// -----------------------------------------------------------------------------

export async function list(principal: Principal, query: QuestionListQuery = {}) {
  assertCan(principal, 'question_bank.write')
  const q = questionListQuerySchema.parse(query)
  const where: Prisma.QuestionWhereInput = {
    ...(q.includeInactive ? {} : { isActive: true }),
    ...(q.type ? { type: q.type } : {}),
    ...(q.category ? { category: q.category } : {}),
    ...(q.tag ? { tags: { has: q.tag } } : {}),
    ...(q.difficulty ? { difficulty: q.difficulty } : {}),
    ...(q.q ? { OR: [{ prompt: { contains: q.q, mode: 'insensitive' } }, { tags: { has: q.q } }] } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.question.findMany({ where, orderBy: { updatedAt: 'desc' }, ...paginationArgs(q), include: questionInclude }),
    prisma.question.count({ where }),
  ])
  return toPaginated(items, total, q)
}

/** Toutes les questions correspondant aux filtres, avec leurs options, pour l'export (Moodle XML / GIFT). */
export async function exportAll(principal: Principal, query: QuestionListQuery = {}) {
  assertCan(principal, 'question_bank.write')
  const q = questionListQuerySchema.parse(query)
  const where: Prisma.QuestionWhereInput = {
    ...(q.includeInactive ? {} : { isActive: true }),
    ...(q.type ? { type: q.type } : {}),
    ...(q.category ? { category: q.category } : {}),
    ...(q.tag ? { tags: { has: q.tag } } : {}),
    ...(q.difficulty ? { difficulty: q.difficulty } : {}),
    ...(q.q ? { OR: [{ prompt: { contains: q.q, mode: 'insensitive' } }, { tags: { has: q.q } }] } : {}),
  }
  return prisma.question.findMany({ where, orderBy: [{ category: 'asc' }, { createdAt: 'asc' }], take: 2000, include: questionInclude })
}

export async function get(principal: Principal, questionId: string) {
  assertCan(principal, 'question_bank.write')
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { ...questionInclude, quizzes: { include: { quiz: { select: { id: true, activity: { select: { id: true, title: true } } } } } } },
  })
  if (!question) throw new NotFoundError('Question', questionId)
  return question
}

/** Catégories distinctes de la banque (avec effectifs). */
export async function categories(principal: Principal) {
  assertCan(principal, 'question_bank.write')
  const rows = await prisma.question.groupBy({ by: ['category'], where: { isActive: true }, _count: { _all: true }, orderBy: { category: 'asc' } })
  return rows.map((r) => ({ category: r.category, count: r._count._all }))
}

/** Étiquettes distinctes de la banque. */
export async function tags(principal: Principal) {
  assertCan(principal, 'question_bank.write')
  const rows = await prisma.question.findMany({ where: { isActive: true }, select: { tags: true } })
  const counts = new Map<string, number>()
  for (const row of rows) for (const tag of row.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr')).map(([tag, count]) => ({ tag, count }))
}

// -----------------------------------------------------------------------------
// Écriture
// -----------------------------------------------------------------------------

function normalizeOptions(type: QuestionTypeName, options: z.infer<typeof questionOptionInputSchema>[]) {
  return options.map((o, index) => ({
    id: o.id,
    label: o.label,
    isCorrect: type === 'ORDERING' || type === 'MATCHING' ? false : o.isCorrect,
    feedback: o.feedback ?? null,
    position: o.position ?? index,
    matchValue: o.matchValue ?? null,
  }))
}

async function createQuestionTx(tx: Db, data: z.infer<typeof questionInputSchema>, authorId: string | null, version = 1) {
  return tx.question.create({
    data: {
      type: data.type,
      prompt: data.prompt,
      explanation: data.explanation ?? null,
      category: data.category ?? null,
      difficulty: data.difficulty,
      points: data.points,
      tags: data.tags,
      config: toJsonValue(questionConfigSchemas[data.type].parse(data.config ?? {})),
      version,
      authorId,
      isActive: data.isActive,
      options: { create: normalizeOptions(data.type, data.options).map(({ id: _id, ...o }) => o) },
    },
    include: questionInclude,
  })
}

export async function create(principal: Principal, input: QuestionInput, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'question_bank.write')
  const data = questionInputSchema.parse(input)
  const question = await createQuestionTx(prisma, data, p.id)
  await audit('content.created', { type: 'Question', id: question.id }, auditContext(p, meta), { after: { type: question.type, prompt: question.prompt.slice(0, 120) } })
  return question
}

/**
 * Mise à jour versionnée (LMS-18) : une question jamais répondue est modifiée en place (version + 1) ;
 * une question déjà utilisée dans des tentatives est remplacée par une nouvelle version (nouvel enregistrement),
 * l'ancienne est désactivée et les quiz sans tentative pointent vers la nouvelle.
 */
export async function update(principal: Principal, questionId: string, input: QuestionInput, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'question_bank.write')
  const existing = await prisma.question.findUnique({ where: { id: questionId }, include: { ...questionInclude, quizzes: { include: { quiz: { include: { _count: { select: { attempts: true } } } } } } } })
  if (!existing) throw new NotFoundError('Question', questionId)
  const data = questionInputSchema.parse(input)

  if (existing._count.answers === 0) {
    const question = await prisma.$transaction(async (tx) => {
      const options = normalizeOptions(data.type, data.options)
      const keepIds = options.filter((o) => o.id).map((o) => o.id as string)
      await tx.questionOption.deleteMany({ where: { questionId, id: { notIn: keepIds } } })
      for (const option of options) {
        const { id, ...rest } = option
        if (id && existing.options.some((o) => o.id === id)) await tx.questionOption.update({ where: { id }, data: rest })
        else await tx.questionOption.create({ data: { questionId, ...rest } })
      }
      return tx.question.update({
        where: { id: questionId },
        data: {
          type: data.type,
          prompt: data.prompt,
          explanation: data.explanation ?? null,
          category: data.category ?? null,
          difficulty: data.difficulty,
          points: data.points,
          tags: data.tags,
          config: toJsonValue(questionConfigSchemas[data.type].parse(data.config ?? {})),
          version: { increment: 1 },
          isActive: data.isActive,
        },
        include: questionInclude,
      })
    })
    await audit('content.updated', { type: 'Question', id: questionId }, auditContext(p, meta), { before: { version: existing.version }, after: { version: question.version } })
    return { question, supersededId: null }
  }

  const question = await prisma.$transaction(async (tx) => {
    const created = await createQuestionTx(tx, data, p.id, existing.version + 1)
    await tx.question.update({ where: { id: questionId }, data: { isActive: false } })
    for (const link of existing.quizzes) {
      if (link.quiz._count.attempts === 0) {
        await tx.quizQuestion.update({ where: { id: link.id }, data: { questionId: created.id } })
      }
    }
    return created
  })
  await audit('content.updated', { type: 'Question', id: question.id }, auditContext(p, meta), {
    before: { supersededId: questionId, version: existing.version },
    after: { version: question.version },
  })
  return { question, supersededId: questionId }
}

/** Supprime une question inutilisée ; sinon la désactive. */
export async function remove(principal: Principal, questionId: string, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'question_bank.write')
  const existing = await prisma.question.findUnique({ where: { id: questionId }, include: { _count: { select: { quizzes: true, answers: true } } } })
  if (!existing) throw new NotFoundError('Question', questionId)
  if (existing._count.quizzes > 0 || existing._count.answers > 0) {
    const question = await prisma.question.update({ where: { id: questionId }, data: { isActive: false } })
    await audit('content.archived', { type: 'Question', id: questionId }, auditContext(p, meta), { after: { isActive: false } })
    return { deleted: false, question }
  }
  await prisma.question.delete({ where: { id: questionId } })
  await audit('content.archived', { type: 'Question', id: questionId }, auditContext(p, meta), { before: { prompt: existing.prompt.slice(0, 120) } })
  return { deleted: true, question: existing }
}

/** Import en masse (JSON validé question par question) : renvoie créations et erreurs indexées. */
export async function importQuestions(principal: Principal, items: unknown[], meta: RequestMeta = {}) {
  const p = assertCan(principal, 'question_bank.write')
  if (!Array.isArray(items) || items.length === 0) throw new PreconditionError('Aucune question à importer')
  if (items.length > 500) throw new PreconditionError('Import limité à 500 questions par lot')
  const created: string[] = []
  const errors: Array<{ index: number; message: string }> = []
  for (const [index, item] of items.entries()) {
    const parsed = questionInputSchema.safeParse(item)
    if (!parsed.success) {
      errors.push({ index, message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' ; ') })
      continue
    }
    try {
      const question = await createQuestionTx(prisma, parsed.data, p.id)
      created.push(question.id)
    } catch (error) {
      errors.push({ index, message: error instanceof Error ? error.message : 'Erreur inconnue' })
    }
  }
  await audit('content.created', { type: 'Question', id: null }, auditContext(p, meta), { after: { imported: created.length, errors: errors.length } })
  return { created, errors }
}

export { importQuestions as import }

export async function duplicate(principal: Principal, questionId: string, meta: RequestMeta = {}) {
  const p = assertCan(principal, 'question_bank.write')
  const source = await prisma.question.findUnique({ where: { id: questionId }, include: { options: { orderBy: { position: 'asc' } } } })
  if (!source) throw new NotFoundError('Question', questionId)
  const question = await prisma.question.create({
    data: {
      type: source.type,
      prompt: `${source.prompt} (copie)`,
      explanation: source.explanation,
      category: source.category,
      difficulty: source.difficulty,
      points: source.points,
      tags: source.tags,
      config: toJsonValue(source.config),
      version: 1,
      authorId: p.id,
      isActive: true,
      options: { create: source.options.map((o) => ({ label: o.label, isCorrect: o.isCorrect, feedback: o.feedback, position: o.position, matchValue: o.matchValue })) },
    },
    include: questionInclude,
  })
  await audit('content.created', { type: 'Question', id: question.id }, auditContext(p, meta), { after: { duplicatedFrom: questionId } })
  return question
}

// -----------------------------------------------------------------------------
// Liaison quiz <-> questions
// -----------------------------------------------------------------------------

async function assertQuizEditable(principal: Principal, quizId: string) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { _count: { select: { attempts: true, questions: true } } } })
  if (!quiz) throw new NotFoundError('Quiz', quizId)
  const ctx = await resolveActivityContext(prisma, quiz.activityId)
  const p = assertCan(principal, 'course.author', { courseId: ctx.course.id })
  if (quiz._count.attempts > 0) {
    throw new PreconditionError('Ce quiz a déjà des tentatives : créez une nouvelle version du cours pour modifier ses questions')
  }
  return { quiz, ctx, principal: p }
}

/** Ajoute des questions de la banque à un quiz (positions en fin de liste). */
export async function addToQuiz(principal: Principal, input: z.input<typeof addToQuizSchema>, meta: RequestMeta = {}) {
  const data = addToQuizSchema.parse(input)
  const { quiz, principal: p } = await assertQuizEditable(principal, data.quizId)
  const questions = await prisma.question.findMany({ where: { id: { in: data.questionIds }, isActive: true }, select: { id: true } })
  const found = new Set(questions.map((q) => q.id))
  const missing = data.questionIds.filter((id) => !found.has(id))
  if (missing.length) throw new NotFoundError('Question', missing.join(', '))
  const existing = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id }, select: { questionId: true, position: true } })
  const already = new Set(existing.map((e) => e.questionId))
  let position = existing.reduce((max, e) => Math.max(max, e.position + 1), 0)
  const toCreate = data.questionIds.filter((id) => !already.has(id))
  if (toCreate.length) {
    await prisma.quizQuestion.createMany({ data: toCreate.map((questionId) => ({ quizId: quiz.id, questionId, position: position++, points: data.points ?? null })) })
  }
  await audit('content.updated', { type: 'Quiz', id: quiz.id }, auditContext(p, meta), { after: { added: toCreate } })
  return listQuizQuestions(principal, quiz.id)
}

export async function removeFromQuiz(principal: Principal, quizId: string, questionId: string, meta: RequestMeta = {}) {
  const { quiz, principal: p } = await assertQuizEditable(principal, quizId)
  await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id, questionId } })
  const rows = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id }, orderBy: { position: 'asc' }, select: { id: true } })
  await prisma.$transaction(rows.map((row, position) => prisma.quizQuestion.update({ where: { id: row.id }, data: { position } })))
  await audit('content.updated', { type: 'Quiz', id: quiz.id }, auditContext(p, meta), { after: { removed: questionId } })
  return listQuizQuestions(principal, quiz.id)
}

export async function reorderQuizQuestions(principal: Principal, quizId: string, questionIds: string[], meta: RequestMeta = {}) {
  const { quiz, principal: p } = await assertQuizEditable(principal, quizId)
  const rows = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id }, select: { id: true, questionId: true } })
  const byQuestion = new Map(rows.map((r) => [r.questionId, r.id] as const))
  if (rows.length !== questionIds.length || questionIds.some((id) => !byQuestion.has(id))) {
    throw new PreconditionError('La liste ne correspond pas aux questions du quiz')
  }
  await prisma.$transaction(questionIds.map((questionId, position) => prisma.quizQuestion.update({ where: { id: byQuestion.get(questionId) as string }, data: { position } })))
  await audit('content.updated', { type: 'Quiz', id: quiz.id }, auditContext(p, meta), { after: { order: questionIds } })
  return listQuizQuestions(principal, quiz.id)
}

/** Barème spécifique d'une question dans un quiz (null = points par défaut de la question). */
export async function setQuizQuestionPoints(principal: Principal, quizId: string, questionId: string, points: number | null, meta: RequestMeta = {}) {
  const { quiz, principal: p } = await assertQuizEditable(principal, quizId)
  const value = points === null ? null : z.number().int().min(1).max(100).parse(points)
  await prisma.quizQuestion.update({ where: { quizId_questionId: { quizId: quiz.id, questionId } }, data: { points: value } })
  await audit('content.updated', { type: 'Quiz', id: quiz.id }, auditContext(p, meta), { after: { questionId, points: value } })
  return listQuizQuestions(principal, quiz.id)
}

/** Questions d'un quiz avec leurs options (vue auteur / formateur). */
export async function listQuizQuestions(principal: Principal, quizId: string) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true, activityId: true, passScore: true, isSurvey: true } })
  if (!quiz) throw new NotFoundError('Quiz', quizId)
  const ctx = await resolveActivityContext(prisma, quiz.activityId)
  assertCan(principal, 'course.teach', { courseId: ctx.course.id })
  const questions = await prisma.quizQuestion.findMany({
    where: { quizId },
    orderBy: { position: 'asc' },
    include: { question: { include: { options: { orderBy: { position: 'asc' } } } } },
  })
  return {
    quiz,
    questions: questions.map((qq) => ({ id: qq.id, position: qq.position, points: qq.points ?? qq.question.points, question: qq.question })),
    maxScore: questions.reduce((s, qq) => s + (qq.points ?? qq.question.points), 0),
  }
}
