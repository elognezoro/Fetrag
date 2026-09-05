'use server'

import { revalidatePath } from 'next/cache'
import { idSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { activityInputSchema, activityUpdateSchema, assignmentInputSchema, courseBuilder, courseInputSchema, courseUpdateSchema, liveSessionInputSchema, questionBank, questionInputSchema, quizInputSchema, versionInputSchema } from '@fetrag/lms-core'
import { successState, type ActionState } from './action-state'
import { formBoolean, formDate, formInt, formJson, formLines, formList, formNullable, formOptional, formString, runAction } from './context'

function revalidateCourse(courseId: string) {
  revalidatePath('/admin/cours')
  revalidatePath(`/admin/cours/${courseId}`)
  revalidatePath('/catalogue')
}

async function courseIdOfVersion(courseVersionId: string): Promise<string> {
  const version = await prisma.courseVersion.findUnique({ where: { id: courseVersionId }, select: { courseId: true } })
  return version?.courseId ?? ''
}

async function courseIdOfActivity(activityId: string): Promise<string> {
  const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { lesson: { select: { module: { select: { courseVersion: { select: { courseId: true } } } } } } } })
  return activity?.lesson.module.courseVersion.courseId ?? ''
}

// -----------------------------------------------------------------------------
// Cours
// -----------------------------------------------------------------------------

function courseInputFromForm(formData: FormData) {
  const priceAmount = formInt(formData, 'priceAmount')
  const memberPriceAmount = formInt(formData, 'memberPriceAmount')
  return {
    title: formString(formData, 'title'),
    code: formString(formData, 'code'),
    slug: formOptional(formData, 'slug'),
    subtitle: formNullable(formData, 'subtitle'),
    summary: formNullable(formData, 'summary'),
    description: formString(formData, 'description'),
    objectives: formLines(formData, 'objectives'),
    prerequisitesText: formNullable(formData, 'prerequisitesText'),
    audience: formNullable(formData, 'audience'),
    categoryId: formNullable(formData, 'categoryId'),
    modality: formString(formData, 'modality') || 'HYBRID',
    level: formString(formData, 'level') || 'INITIATION',
    language: formString(formData, 'language') || 'fr',
    durationHours: formInt(formData, 'durationHours') ?? 12,
    pillar: formNullable(formData, 'pillar'),
    coverImageUrl: formNullable(formData, 'coverImageUrl'),
    color: formNullable(formData, 'color'),
    enrollmentPolicy: formString(formData, 'enrollmentPolicy') || 'SELF',
    isFree: formBoolean(formData, 'isFree'),
    priceAmount: priceAmount ?? null,
    memberPriceAmount: memberPriceAmount ?? null,
    currency: formString(formData, 'currency') || 'XAF',
    capacity: formInt(formData, 'capacity') ?? null,
    isFeatured: formBoolean(formData, 'isFeatured'),
    position: formInt(formData, 'position') ?? 0,
    trainerIds: formList(formData, 'trainerIds'),
  }
}

export async function createCourse(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const data = courseInputSchema.parse(courseInputFromForm(formData))
    const course = await courseBuilder.createCourse(principal, data, meta)
    revalidateCourse(course.id)
    return successState(`Cours « ${course.title} » créé (version 1 en brouillon)`, { id: course.id, redirectTo: `/admin/cours/${course.id}` })
  })
}

export async function updateCourse(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseId = idSchema.parse(formString(formData, 'courseId'))
    const data = courseUpdateSchema.parse(courseInputFromForm(formData))
    await courseBuilder.updateCourse(principal, courseId, data, meta)
    revalidateCourse(courseId)
    return successState('Fiche du cours enregistrée')
  })
}

export async function setCourseStatus(input: { courseId: string; status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED' }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseId = idSchema.parse(input.courseId)
    const status = z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).parse(input.status)
    await courseBuilder.setCourseStatus(principal, courseId, status, meta)
    revalidateCourse(courseId)
    return successState(status === 'PUBLISHED' ? 'Cours visible dans le catalogue' : status === 'ARCHIVED' ? 'Cours archivé' : 'Statut du cours mis à jour')
  })
}

export async function setCourseTrainers(input: { courseId: string; trainers: Array<{ userId: string; isLead: boolean }> }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseId = idSchema.parse(input.courseId)
    await courseBuilder.setTrainers(principal, courseId, input.trainers, meta)
    revalidateCourse(courseId)
    return successState('Formateurs du cours mis à jour')
  })
}

// -----------------------------------------------------------------------------
// Versions
// -----------------------------------------------------------------------------

function versionInputFromForm(formData: FormData) {
  const passScore = formInt(formData, 'passScore')
  const minAttendanceRate = formInt(formData, 'minAttendanceRate')
  const hasRules = formData.has('passScore') || formData.has('minAttendanceRate') || formData.has('requireAllActivities')
  return versionInputSchema.parse({
    label: formNullable(formData, 'label'),
    changelog: formNullable(formData, 'changelog'),
    completionRules: hasRules
      ? { passScore: passScore ?? undefined, minAttendanceRate: minAttendanceRate ?? undefined, requireAllActivities: formBoolean(formData, 'requireAllActivities') }
      : undefined,
  })
}

export async function createVersion(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseId = idSchema.parse(formString(formData, 'courseId'))
    const version = await courseBuilder.createVersion(principal, courseId, versionInputFromForm(formData), meta)
    revalidateCourse(courseId)
    return successState(`Version ${version.version} créée (structure vide)`, { id: version.id, redirectTo: `/admin/cours/${courseId}?version=${version.id}` })
  })
}

export async function duplicateVersion(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseVersionId = idSchema.parse(formString(formData, 'courseVersionId'))
    const version = await courseBuilder.duplicateVersion(principal, courseVersionId, versionInputFromForm(formData), meta)
    revalidateCourse(version.courseId)
    return successState(`Version ${version.version} dupliquée et modifiable`, { id: version.id, redirectTo: `/admin/cours/${version.courseId}?version=${version.id}` })
  })
}

export async function updateVersion(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseVersionId = idSchema.parse(formString(formData, 'courseVersionId'))
    const version = await courseBuilder.updateVersion(principal, courseVersionId, versionInputFromForm(formData), meta)
    revalidateCourse(version.courseId)
    return successState('Version enregistrée')
  })
}

export async function publishVersion(input: { courseVersionId: string; publishCourse: boolean }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseVersionId = idSchema.parse(input.courseVersionId)
    const result = await courseBuilder.publishVersion(principal, courseVersionId, { publishCourse: input.publishCourse }, meta)
    revalidateCourse(result.course.id)
    return successState(`Version ${result.version.version} publiée : elle devient la version courante`)
  })
}

export async function removeVersion(input: { courseVersionId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseVersionId = idSchema.parse(input.courseVersionId)
    const courseId = await courseIdOfVersion(courseVersionId)
    await courseBuilder.removeVersion(principal, courseVersionId, meta)
    revalidateCourse(courseId)
    return successState('Version brouillon supprimée', { redirectTo: `/admin/cours/${courseId}` })
  })
}

// -----------------------------------------------------------------------------
// Arborescence : modules, leçons
// -----------------------------------------------------------------------------

function moduleInputFromForm(formData: FormData) {
  return { title: formString(formData, 'title'), summary: formNullable(formData, 'summary'), durationMinutes: formInt(formData, 'durationMinutes') ?? null, isOptional: formBoolean(formData, 'isOptional') }
}

export async function saveModule(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const moduleId = formOptional(formData, 'moduleId')
    const courseVersionId = idSchema.parse(formString(formData, 'courseVersionId'))
    const courseId = await courseIdOfVersion(courseVersionId)
    if (moduleId) await courseBuilder.updateModule(principal, idSchema.parse(moduleId), moduleInputFromForm(formData), meta)
    else await courseBuilder.addModule(principal, courseVersionId, moduleInputFromForm(formData), meta)
    revalidateCourse(courseId)
    return successState(moduleId ? 'Module enregistré' : 'Module ajouté')
  })
}

export async function removeModule(input: { moduleId: string; courseId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await courseBuilder.removeModule(principal, idSchema.parse(input.moduleId), meta)
    revalidateCourse(input.courseId)
    return successState('Module supprimé')
  })
}

function moveInList(ids: string[], id: string, direction: 'up' | 'down'): string[] {
  const index = ids.indexOf(id)
  if (index < 0) return ids
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= ids.length) return ids
  const copy = [...ids]
  const a = copy[index]
  const b = copy[target]
  if (a === undefined || b === undefined) return ids
  copy[index] = b
  copy[target] = a
  return copy
}

export async function moveModule(input: { moduleId: string; courseVersionId: string; direction: 'up' | 'down' }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const courseVersionId = idSchema.parse(input.courseVersionId)
    const rows = await prisma.courseModule.findMany({ where: { courseVersionId }, orderBy: { position: 'asc' }, select: { id: true } })
    const ordered = moveInList(rows.map((r) => r.id), input.moduleId, input.direction)
    await courseBuilder.reorderModules(principal, courseVersionId, ordered, meta)
    revalidateCourse(await courseIdOfVersion(courseVersionId))
    return successState('Ordre des modules mis à jour')
  })
}

function lessonInputFromForm(formData: FormData) {
  return { title: formString(formData, 'title'), slug: formOptional(formData, 'slug'), summary: formNullable(formData, 'summary'), durationMinutes: formInt(formData, 'durationMinutes') ?? null, isPreview: formBoolean(formData, 'isPreview') }
}

export async function saveLesson(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const lessonId = formOptional(formData, 'lessonId')
    const moduleId = idSchema.parse(formString(formData, 'moduleId'))
    const courseId = formString(formData, 'courseId')
    if (lessonId) await courseBuilder.updateLesson(principal, idSchema.parse(lessonId), lessonInputFromForm(formData), meta)
    else await courseBuilder.addLesson(principal, moduleId, lessonInputFromForm(formData), meta)
    revalidateCourse(courseId)
    return successState(lessonId ? 'Leçon enregistrée' : 'Leçon ajoutée')
  })
}

export async function removeLesson(input: { lessonId: string; courseId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await courseBuilder.removeLesson(principal, idSchema.parse(input.lessonId), meta)
    revalidateCourse(input.courseId)
    return successState('Leçon supprimée')
  })
}

export async function moveLesson(input: { lessonId: string; moduleId: string; courseId: string; direction: 'up' | 'down' }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const moduleId = idSchema.parse(input.moduleId)
    const rows = await prisma.lesson.findMany({ where: { moduleId }, orderBy: { position: 'asc' }, select: { id: true } })
    await courseBuilder.reorderLessons(principal, moduleId, moveInList(rows.map((r) => r.id), input.lessonId, input.direction), meta)
    revalidateCourse(input.courseId)
    return successState('Ordre des leçons mis à jour')
  })
}

// -----------------------------------------------------------------------------
// Activités
// -----------------------------------------------------------------------------

/** Construit le contenu JSON selon le type d'activité à partir des champs du panneau d'édition. */
function activityContentFromForm(type: string, formData: FormData): unknown {
  const url = formString(formData, 'contentUrl')
  const label = formOptional(formData, 'contentLabel')
  const transcript = formOptional(formData, 'transcript')
  switch (type) {
    case 'TEXT':
      return { html: formString(formData, 'html') }
    case 'VIDEO':
      return { url, provider: formString(formData, 'provider') || 'other', transcript, posterUrl: formOptional(formData, 'posterUrl') }
    case 'AUDIO':
      return { url, transcript }
    case 'LINK':
      return { url, label }
    case 'FILE': {
      const resourceId = formOptional(formData, 'resourceId')
      return { resourceId, fileUrl: url || undefined, label }
    }
    case 'PRESENTATION':
      return { url, embedUrl: formOptional(formData, 'embedUrl') }
    case 'H5P':
      return { embedUrl: formOptional(formData, 'embedUrl'), packageUrl: formOptional(formData, 'packageUrl'), height: formInt(formData, 'height') }
    case 'SCORM':
      return { packageUrl: formString(formData, 'packageUrl'), launchPath: formString(formData, 'launchPath') || 'index.html', version: formOptional(formData, 'scormVersion') }
    case 'SURVEY':
      return { intro: formOptional(formData, 'intro'), anonymous: formBoolean(formData, 'anonymous') }
    case 'LIVE_SESSION':
      return { intro: formOptional(formData, 'intro'), format: formString(formData, 'liveFormat') || 'hybrid', agenda: formLines(formData, 'agenda') }
    case 'ASSIGNMENT':
      return { intro: formOptional(formData, 'intro'), caseStudy: formOptional(formData, 'caseStudy') }
    default:
      return { intro: formOptional(formData, 'intro') }
  }
}

function rubricFromForm(formData: FormData) {
  const raw = formJson<unknown>(formData, 'rubric')
  const parsed = z.array(z.object({ label: z.string().trim().min(1).max(200), points: z.coerce.number().int().min(0).max(1000) })).safeParse(raw)
  return parsed.success ? parsed.data : undefined
}

function activityInputFromForm(type: string, formData: FormData) {
  const completionRule = formOptional(formData, 'completionRule')
  const lowBandwidthText = formOptional(formData, 'lowBandwidthText')
  const lowBandwidthUrl = formOptional(formData, 'lowBandwidthUrl')
  const isQuizLike = type === 'QUIZ' || type === 'SURVEY'
  return {
    type,
    title: formString(formData, 'title'),
    instructions: formNullable(formData, 'instructions'),
    content: activityContentFromForm(type, formData),
    resourceId: type === 'FILE' ? formNullable(formData, 'resourceId') : undefined,
    durationMinutes: formInt(formData, 'durationMinutes') ?? null,
    isRequired: formBoolean(formData, 'isRequired'),
    completionRule,
    maxScore: formInt(formData, 'maxScore') ?? null,
    passScore: formInt(formData, 'passScore') ?? null,
    weight: formInt(formData, 'weight') ?? 1,
    lowBandwidthAlternative: lowBandwidthText || lowBandwidthUrl ? { kind: formString(formData, 'lowBandwidthKind') || 'transcript', url: lowBandwidthUrl, text: lowBandwidthText } : null,
    availableFrom: formDate(formData, 'availableFrom') ?? null,
    dueAt: formDate(formData, 'dueAt') ?? null,
    quiz: isQuizLike
      ? quizInputSchema.partial().parse({
          description: formNullable(formData, 'quizDescription'),
          timeLimitMinutes: formInt(formData, 'timeLimitMinutes') ?? null,
          maxAttempts: formInt(formData, 'maxAttempts'),
          shuffleQuestions: formBoolean(formData, 'shuffleQuestions'),
          shuffleOptions: formBoolean(formData, 'shuffleOptions'),
          showCorrection: formBoolean(formData, 'showCorrection'),
          passScore: formInt(formData, 'quizPassScore'),
          isSurvey: type === 'SURVEY',
        })
      : undefined,
    assignment:
      type === 'ASSIGNMENT'
        ? assignmentInputSchema.partial().parse({
            description: formNullable(formData, 'assignmentDescription'),
            allowFile: formBoolean(formData, 'allowFile'),
            allowText: formBoolean(formData, 'allowText'),
            maxFileSizeMb: formInt(formData, 'maxFileSizeMb'),
            dueAt: formDate(formData, 'assignmentDueAt') ?? null,
            lateAllowed: formBoolean(formData, 'lateAllowed'),
            maxScore: formInt(formData, 'assignmentMaxScore'),
            rubric: rubricFromForm(formData) ?? null,
          })
        : undefined,
  }
}

export async function saveActivity(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const activityId = formOptional(formData, 'activityId')
    const lessonId = idSchema.parse(formString(formData, 'lessonId'))
    const courseId = formString(formData, 'courseId')
    const type = formString(formData, 'type')
    if (activityId) {
      const { type: _type, ...rest } = activityInputFromForm(type, formData)
      await courseBuilder.updateActivity(principal, idSchema.parse(activityId), activityUpdateSchema.parse(rest), meta)
    } else {
      await courseBuilder.addActivity(principal, lessonId, activityInputSchema.parse(activityInputFromForm(type, formData)), meta)
    }
    revalidateCourse(courseId)
    return successState(activityId ? 'Activité enregistrée' : 'Activité ajoutée')
  })
}

export async function removeActivity(input: { activityId: string; courseId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await courseBuilder.removeActivity(principal, idSchema.parse(input.activityId), meta)
    revalidateCourse(input.courseId)
    return successState('Activité supprimée')
  })
}

export async function moveActivity(input: { activityId: string; lessonId: string; courseId: string; direction: 'up' | 'down' }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const lessonId = idSchema.parse(input.lessonId)
    const rows = await prisma.activity.findMany({ where: { lessonId }, orderBy: { position: 'asc' }, select: { id: true } })
    await courseBuilder.reorderActivities(principal, lessonId, moveInList(rows.map((r) => r.id), input.activityId, input.direction), meta)
    revalidateCourse(input.courseId)
    return successState('Ordre des activités mis à jour')
  })
}

// -----------------------------------------------------------------------------
// Quiz builder
// -----------------------------------------------------------------------------

export async function addQuestionsToQuiz(input: { quizId: string; questionIds: string[]; courseId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const result = await questionBank.addToQuiz(principal, { quizId: input.quizId, questionIds: input.questionIds }, meta)
    revalidateCourse(input.courseId)
    return successState(`${input.questionIds.length} question(s) ajoutée(s) : barème ${result.maxScore} point(s)`)
  })
}

export async function removeQuestionFromQuiz(input: { quizId: string; questionId: string; courseId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await questionBank.removeFromQuiz(principal, idSchema.parse(input.quizId), idSchema.parse(input.questionId), meta)
    revalidateCourse(input.courseId)
    return successState('Question retirée du quiz')
  })
}

export async function moveQuizQuestion(input: { quizId: string; questionId: string; courseId: string; direction: 'up' | 'down' }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const rows = await prisma.quizQuestion.findMany({ where: { quizId: input.quizId }, orderBy: { position: 'asc' }, select: { questionId: true } })
    await questionBank.reorderQuizQuestions(principal, input.quizId, moveInList(rows.map((r) => r.questionId), input.questionId, input.direction), meta)
    revalidateCourse(input.courseId)
    return successState('Ordre des questions mis à jour')
  })
}

/** Création rapide d'une question depuis le builder, aussitôt ajoutée au quiz. */
export async function quickCreateQuestion(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const quizId = idSchema.parse(formString(formData, 'quizId'))
    const courseId = formString(formData, 'courseId')
    const type = formString(formData, 'type') || 'SINGLE_CHOICE'
    const optionLines = formLines(formData, 'options')
    const correctIndexes = new Set(formList(formData, 'correct').map((v) => Number.parseInt(v, 10)))
    const options = optionLines.map((label, index) => ({ label, isCorrect: correctIndexes.has(index), position: index }))
    const config = type === 'TRUE_FALSE' ? { answer: formString(formData, 'answer') === 'true' } : type === 'SHORT_ANSWER' ? { accepted: optionLines } : {}
    const question = await questionBank.create(
      principal,
      questionInputSchema.parse({
        type,
        prompt: formString(formData, 'prompt'),
        explanation: formNullable(formData, 'explanation'),
        category: formNullable(formData, 'category'),
        points: formInt(formData, 'points') ?? 1,
        options: type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' ? options : [],
        config,
      }),
      meta,
    )
    await questionBank.addToQuiz(principal, { quizId, questionIds: [question.id] }, meta)
    revalidateCourse(courseId)
    revalidatePath('/admin/questions')
    return successState('Question créée et ajoutée au quiz')
  })
}

// -----------------------------------------------------------------------------
// Séances en direct rattachées à une activité
// -----------------------------------------------------------------------------

function liveSessionInputFromForm(formData: FormData) {
  return {
    title: formString(formData, 'title'),
    startsAt: formDate(formData, 'startsAt'),
    endsAt: formDate(formData, 'endsAt'),
    speakerName: formNullable(formData, 'speakerName'),
    meetingUrl: formNullable(formData, 'meetingUrl'),
    replayUrl: formNullable(formData, 'replayUrl'),
    transcriptUrl: formNullable(formData, 'transcriptUrl'),
    trainingSessionId: formNullable(formData, 'trainingSessionId'),
  }
}

export async function saveLiveSession(_previous: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    const liveSessionId = formOptional(formData, 'liveSessionId')
    const activityId = idSchema.parse(formString(formData, 'activityId'))
    const data = liveSessionInputSchema.parse(liveSessionInputFromForm(formData))
    if (liveSessionId) await courseBuilder.updateLiveSession(principal, idSchema.parse(liveSessionId), data, meta)
    else await courseBuilder.addLiveSession(principal, activityId, data, meta)
    revalidateCourse(await courseIdOfActivity(activityId))
    return successState(liveSessionId ? 'Séance mise à jour' : 'Séance en direct ajoutée')
  })
}

export async function removeLiveSession(input: { liveSessionId: string; courseId: string }): Promise<ActionState> {
  return runAction(async (principal, meta) => {
    await courseBuilder.removeLiveSession(principal, idSchema.parse(input.liveSessionId), meta)
    revalidateCourse(input.courseId)
    return successState('Séance supprimée')
  })
}
