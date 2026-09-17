/**
 * Import du séminaire FETRAG - SETRAG « L'action syndicale et le droit du travail gabonais »
 * (Loi n°022/2021 du 19 novembre 2021 portant Code du travail en République Gabonaise)
 * dans le LMS, à partir des données pédagogiques extraites de la plateforme source
 * (`scripts/data/fetrag-setrag.json`).
 *
 * Lancement (depuis la racine du dépôt ; `tsx` et le client Prisma sont fournis par @fetrag/db) :
 *
 *   pnpm --filter @fetrag/db exec tsx ../../scripts/import-fetrag-setrag.ts
 *
 * Le script est idempotent : identifiants déterministes `stableId()` et upserts partout,
 * comme le seed (`packages/db/prisma/seed`). Relancer met à jour sans dupliquer.
 *
 * Contenu créé :
 *   - catégorie de cours « Droit du travail et contentieux » (position 2) ;
 *   - cours publié DTC-SETRAG (version 1) : module de présentation (syllabus, cadre, méthode),
 *     quatre modules de formation (cours TEXT, activités interactives, étude de cas en devoir,
 *     débat en forum, quiz de module) et un module d'évaluation finale
 *     (entraînement chronométré rejouable + examen final à tentative unique) ;
 *   - questions de la banque (catégorie « Droit du travail gabonais - SETRAG ») réutilisables ;
 *   - livret du formateur (corrigés des études de cas) : docs/formation/DTC-SETRAG-corriges.md.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// -----------------------------------------------------------------------------
// Localisation du dépôt et chargement de l'environnement (.env racine)
// -----------------------------------------------------------------------------

function findRepoRoot(start: string): string {
  let current = path.resolve(start)
  for (let i = 0; i < 10; i += 1) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  throw new Error('Racine du monorepo introuvable (pnpm-workspace.yaml).')
}

const scriptDir = typeof __dirname === 'string' ? __dirname : process.cwd()
const repoRoot = findRepoRoot(scriptDir)

/** Parser .env minimal (mêmes règles que next.config.ts) ; n'écrase jamais une variable existante. */
function loadRootEnv(): void {
  const envPath = path.join(repoRoot, '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator <= 0) continue
    const key = line.slice(0, separator).trim().replace(/^export\s+/, '')
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    let value = line.slice(separator + 1).trim()
    const first = value.charAt(0)
    const last = value.charAt(value.length - 1)
    if (value.length >= 2 && ((first === '"' && last === '"') || (first === "'" && last === "'"))) {
      value = value.slice(1, -1)
    } else {
      const comment = value.indexOf(' #')
      if (comment >= 0) value = value.slice(0, comment).trim()
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

if (!process.env.DATABASE_URL) loadRootEnv()
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL est introuvable (environnement ou .env racine).')
  process.exit(2)
}

// -----------------------------------------------------------------------------
// Données source
// -----------------------------------------------------------------------------

interface BankQuestion {
  id: string
  mod: string
  type: 'qcm' | 'vf' | 'trou' | 'appar'
  q: string
  /** QCM : [libellé, 1 si correct] */
  o?: Array<[string, number]>
  /** trou : valeurs acceptées par trou ; appar : index de la cible dans `d` pour chaque `g[i]` */
  sol?: string[][] | number[]
  /** vf : 1 = vrai */
  vrai?: number
  fb?: string
  g?: string[]
  d?: string[]
}

interface ModuleMeta {
  code: string
  titre: string
  ancrage: string
  duree: string
  objectifs: string[]
  ancrage_html: string
  livrable: string
}

interface CaseQuestion {
  q: string
  r: string
}

interface QcmItem {
  q: string
  o: Array<[string, number]>
  fb?: string
}

interface ActiviteItem {
  t: string
  d: string
  kind: 'trou' | 'cas' | 'debat' | 'classer' | 'qcm'
  data: {
    consigne?: string
    q?: string
    sol?: string[][]
    situation?: string
    questions?: CaseQuestion[] | QcmItem[]
    colonnes?: string[]
    items?: Array<{ s: string; col: number }>
  }
}

interface PageSection {
  id?: string
  titre?: string
  t?: string
  title?: string
  html?: string
  h?: string
}

interface EvalMode {
  dureeMin?: number
  feedback?: boolean
  rejouable?: boolean
  seuil?: number
  taille?: number
}

interface SourceData {
  COURS: Record<string, string>
  MODULES: ModuleMeta[]
  BANK: BankQuestion[]
  ACTIVITES: Record<string, ActiviteItem[]>
  EVAL_CFG: Record<string, EvalMode>
  PAGES: PageSection[]
}

const DATA_PATH = path.join(repoRoot, 'scripts', 'data', 'fetrag-setrag.json')

// -----------------------------------------------------------------------------
// Nettoyage du HTML source (charte FETRAG : pas d'emoji, HTML assaini)
// -----------------------------------------------------------------------------

/** Supprime les emoji et pictogrammes (charte FETRAG : icônes lucide uniquement, jamais d'emoji). */
function stripEmoji(input: string): string {
  return input
    .replace(/[\u{1F000}-\u{1FBFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/ {2,}/g, ' ')
}

/** HTML prêt pour le lecteur LMS : sans emoji, sans classes/styles/boutons de la plateforme source. */
function cleanHtml(html: string): string {
  return stripEmoji(html)
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/\s(?:class|style|id|onclick|data-[\w-]+)="[^"]*"/gi, '')
    .replace(/<(?:span|div)>\s*<\/(?:span|div)>/gi, '')
    .trim()
}

/** Texte brut (objectifs, critères, résumés). */
function plainText(html: string): string {
  return stripEmoji(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Normalise les marqueurs de trous de la source (`__`) vers le format LMS (`___`). */
function normalizeBlanks(text: string): string {
  return plainText(text).replace(/_{2,}/g, '___')
}

// -----------------------------------------------------------------------------
// Import
// -----------------------------------------------------------------------------

const COURSE_CODE = 'DTC-SETRAG'
const COURSE_SLUG = 'action-syndicale-et-droit-du-travail-gabonais'
const SET_KEY = 'setrag'
const QUESTION_CATEGORY = 'Droit du travail gabonais - SETRAG'

async function main(): Promise<void> {
  const raw = fs.readFileSync(DATA_PATH, 'utf8')
  const data = JSON.parse(raw) as SourceData
  if (!data.COURS || !data.MODULES?.length || !data.BANK?.length) {
    throw new Error('Données source incomplètes (COURS / MODULES / BANK attendus).')
  }

  const { prisma } = await import('../packages/db/src/client')
  const { ActivityType, CompletionRule, ContentStatus, QuestionType } = await import('../packages/db/generated/client')
  const { json, log, stableId, slugify } = await import('../packages/db/prisma/seed/helpers')

  type QType = (typeof QuestionType)[keyof typeof QuestionType]

  // ---------------------------------------------------------------------------
  // Comptes de référence (créés par le seed, présents en base partagée)
  // ---------------------------------------------------------------------------
  log.step('Import du séminaire FETRAG - SETRAG dans le LMS')
  const coordination = await prisma.user.findUnique({ where: { email: 'coordination@fetrag.ga' }, select: { id: true } })
  const formateur = await prisma.user.findUnique({ where: { email: 'formateur@fetrag.ga' }, select: { id: true } })
  if (!coordination || !formateur) {
    throw new Error('Comptes coordination@fetrag.ga / formateur@fetrag.ga introuvables : exécuter le seed avant cet import.')
  }

  // ---------------------------------------------------------------------------
  // 1. Catégorie de cours « Droit du travail et contentieux » (position 2)
  // ---------------------------------------------------------------------------
  const categoryData = {
    name: 'Droit du travail et contentieux',
    kind: 'course',
    color: '#042768',
    position: 2,
    description:
      'Formations au Code du travail gabonais (Loi n°022/2021 du 19 novembre 2021) : contrats, discipline, salaires, contentieux et défense des travailleurs.',
  }
  const category = await prisma.category.upsert({
    where: { slug: 'droit-du-travail-et-contentieux' },
    create: { id: stableId('category', 'droit-du-travail-et-contentieux'), slug: 'droit-du-travail-et-contentieux', ...categoryData },
    update: categoryData,
    select: { id: true, slug: true },
  })
  log.done(`Catégorie « ${categoryData.name} » (position 2)`)

  // ---------------------------------------------------------------------------
  // 2. Cours publié + version 1
  // ---------------------------------------------------------------------------
  const publishedAt = new Date()
  const objectives = data.MODULES.flatMap((m) => m.objectifs.slice(0, 2).map(plainText))
  const summary =
    'Quatre modules (30 h) pour maîtriser la Loi n°022/2021 du 19 novembre 2021 portant Code du travail en République Gabonaise : ' +
    'statut syndical et protection des délégués, contrats et sécurité au travail, discipline et licenciement, salaires, contentieux et droit de grève.'
  const description = [
    `<p>Séminaire de formation syndicale conçu pour la FETRAG et les délégués de la SETRAG, transféré sur la plateforme de formation de la Fédération. Il couvre l'ensemble du Code du travail gabonais issu de la <b>Loi n°022/2021 du 19 novembre 2021</b>, sous l'angle de l'action syndicale : représentation du personnel, protection des délégués, contrats, santé et sécurité, discipline, rupture, salaires, contentieux et grève.</p>`,
    `<p>Chaque module associe un cours structuré, des activités interactives corrigées automatiquement, une étude de cas à déposer (corrigée par le formateur) et un débat guidé. La formation se conclut par un entraînement chronométré rejouable puis un examen final en une seule tentative (20 questions, 30 minutes, seuil de réussite 70 %).</p>`,
    `<p><b>Volume :</b> 30 heures (4 modules de 7 h 30). <b>Public :</b> délégués du personnel et délégués syndicaux.</p>`,
  ].join('\n')

  const courseData = {
    title: "L'action syndicale et le droit du travail gabonais",
    subtitle: 'Séminaire de formation FETRAG - SETRAG',
    summary,
    description,
    objectives,
    prerequisitesText:
      "Exercer ou préparer un mandat de délégué du personnel ou de délégué syndical. Aucun prérequis juridique : les textes sont expliqués et cités à l'appui de chaque notion.",
    audience: 'Délégués du personnel et délégués syndicaux (SETRAG et entreprises adhérentes de la FETRAG).',
    categoryId: category.id,
    modality: 'HYBRID' as const,
    level: 'INTERMEDIAIRE' as const,
    language: 'fr' as const,
    durationHours: 30,
    pillar: 'defense',
    color: '#F9C804',
    enrollmentPolicy: 'SELF' as const,
    isFree: true,
    priceAmount: null,
    memberPriceAmount: null,
    currency: 'XAF',
    capacity: 40,
    status: ContentStatus.PUBLISHED,
    isFeatured: true,
    position: 1,
    publishedAt,
    createdById: coordination.id,
  }

  const course = await prisma.course.upsert({
    where: { code: COURSE_CODE },
    create: { id: stableId('course', COURSE_CODE), code: COURSE_CODE, slug: COURSE_SLUG, ...courseData },
    update: { slug: COURSE_SLUG, ...courseData },
    select: { id: true, slug: true, title: true },
  })

  const version = await prisma.courseVersion.upsert({
    where: { courseId_version: { courseId: course.id, version: 1 } },
    create: {
      id: stableId('course-version', COURSE_CODE, 1),
      courseId: course.id,
      version: 1,
      label: 'Version initiale - Séminaire FETRAG-SETRAG',
      changelog: 'Transfert du séminaire « L\'action syndicale et le droit du travail gabonais » depuis la plateforme source.',
      isPublished: true,
      publishedAt,
      completionRules: json({ requireAllActivities: true, requiredActivityIds: [], passScore: 70, minAttendanceRate: 0 }),
    },
    update: {
      isPublished: true,
      completionRules: json({ requireAllActivities: true, requiredActivityIds: [], passScore: 70, minAttendanceRate: 0 }),
    },
    select: { id: true },
  })
  await prisma.course.update({ where: { id: course.id }, data: { currentVersionId: version.id } })

  await prisma.courseTrainer.upsert({
    where: { courseId_userId: { courseId: course.id, userId: formateur.id } },
    create: { courseId: course.id, userId: formateur.id, isLead: true },
    update: { isLead: true },
  })

  await prisma.seoRecord.upsert({
    where: { courseId: course.id },
    create: {
      id: stableId('seo-course', COURSE_CODE),
      courseId: course.id,
      title: `${courseData.title} - Formation FETRAG`,
      description: summary.slice(0, 160),
    },
    update: { title: `${courseData.title} - Formation FETRAG`, description: summary.slice(0, 160) },
  })
  log.done(`Cours ${COURSE_CODE} « ${course.title} » (version 1 publiée)`)

  // ---------------------------------------------------------------------------
  // Aides de création (mêmes formats que le seed : content-format.md)
  // ---------------------------------------------------------------------------

  async function upsertModule(position: number, title: string, summaryText: string, durationMinutes: number, isOptional = false) {
    const moduleId = stableId('course-module', COURSE_CODE, position)
    const moduleData = { title, summary: summaryText, position, durationMinutes, isOptional }
    await prisma.courseModule.upsert({
      where: { id: moduleId },
      create: { id: moduleId, courseVersionId: version.id, ...moduleData },
      update: moduleData,
    })
    return moduleId
  }

  async function upsertLesson(moduleId: string, position: number, title: string, summaryText: string, durationMinutes: number) {
    const slug = slugify(title)
    const lessonData = { title, summary: summaryText, position, durationMinutes, isPreview: false }
    const lesson = await prisma.lesson.upsert({
      where: { moduleId_slug: { moduleId, slug } },
      create: { id: stableId('lesson', COURSE_CODE, slug), moduleId, slug, ...lessonData },
      update: lessonData,
      select: { id: true, slug: true },
    })
    return lesson
  }

  interface ActivityInput {
    lessonId: string
    key: string[]
    position: number
    type: (typeof ActivityType)[keyof typeof ActivityType]
    title: string
    instructions: string | null
    content: unknown
    durationMinutes: number
    isRequired?: boolean
    completionRule: (typeof CompletionRule)[keyof typeof CompletionRule]
    maxScore?: number | null
    passScore?: number | null
    weight?: number
  }

  async function upsertActivity(input: ActivityInput): Promise<string> {
    const activityId = stableId('activity', COURSE_CODE, ...input.key)
    const activityData = {
      type: input.type,
      title: input.title,
      instructions: input.instructions,
      content: json(input.content),
      position: input.position,
      durationMinutes: input.durationMinutes,
      isRequired: input.isRequired ?? true,
      completionRule: input.completionRule,
      maxScore: input.maxScore ?? null,
      passScore: input.passScore ?? null,
      weight: input.weight ?? 1,
    }
    await prisma.activity.upsert({
      where: { id: activityId },
      create: { id: activityId, lessonId: input.lessonId, ...activityData },
      update: activityData,
    })
    return activityId
  }

  interface QuestionInput {
    key: string
    type: QType
    prompt: string
    explanation?: string | null
    config?: unknown
    points?: number
    tags: string[]
    options: Array<{ key: string; label: string; isCorrect: boolean; feedback?: string | null; matchValue?: string | null }>
  }

  async function upsertQuestion(input: QuestionInput): Promise<string> {
    const questionId = stableId('question', SET_KEY, input.key)
    const questionData = {
      type: input.type,
      category: QUESTION_CATEGORY,
      difficulty: 2,
      prompt: input.prompt,
      explanation: input.explanation ?? null,
      config: input.config === undefined ? undefined : json(input.config),
      points: input.points ?? 1,
      version: 1,
      authorId: formateur.id,
      tags: input.tags,
      isActive: true,
    }
    await prisma.question.upsert({ where: { id: questionId }, create: { id: questionId, ...questionData }, update: questionData })
    for (const [index, option] of input.options.entries()) {
      const optionId = stableId('option', SET_KEY, input.key, option.key)
      const optionData = {
        label: option.label,
        isCorrect: option.isCorrect,
        feedback: option.feedback ?? null,
        position: index + 1,
        matchValue: option.matchValue ?? null,
      }
      await prisma.questionOption.upsert({ where: { id: optionId }, create: { id: optionId, questionId, ...optionData }, update: optionData })
    }
    return questionId
  }

  interface QuizInput {
    activityId: string
    key: string[]
    description: string
    timeLimitMinutes: number | null
    maxAttempts: number
    shuffleQuestions: boolean
    shuffleOptions: boolean
    showCorrection: boolean
    passScore: number
    questionIds: string[]
  }

  async function upsertQuiz(input: QuizInput): Promise<void> {
    const quizData = {
      description: input.description,
      timeLimitMinutes: input.timeLimitMinutes,
      maxAttempts: input.maxAttempts,
      shuffleQuestions: input.shuffleQuestions,
      shuffleOptions: input.shuffleOptions,
      showCorrection: input.showCorrection,
      passScore: input.passScore,
      isSurvey: false,
    }
    const quiz = await prisma.quiz.upsert({
      where: { activityId: input.activityId },
      create: { id: stableId('quiz', SET_KEY, ...input.key), activityId: input.activityId, ...quizData },
      update: quizData,
      select: { id: true },
    })
    for (const [index, questionId] of input.questionIds.entries()) {
      await prisma.quizQuestion.upsert({
        where: { quizId_questionId: { quizId: quiz.id, questionId } },
        create: { quizId: quiz.id, questionId, position: index + 1, points: 1 },
        update: { position: index + 1, points: 1 },
      })
    }
  }

  /** Convertit une question de la banque source vers la banque LMS. */
  async function importBankQuestion(q: BankQuestion): Promise<string> {
    const tags = ['setrag', 'code-du-travail', q.mod.toLowerCase()]
    const prompt = plainText(q.q)
    const explanation = q.fb ? plainText(q.fb) : null
    if (q.type === 'qcm') {
      return upsertQuestion({
        key: q.id,
        type: QuestionType.SINGLE_CHOICE,
        prompt,
        explanation,
        tags,
        options: (q.o ?? []).map(([label, correct], i) => ({ key: String(i), label: plainText(label), isCorrect: correct === 1 })),
      })
    }
    if (q.type === 'vf') {
      const answer = q.vrai === 1
      return upsertQuestion({
        key: q.id,
        type: QuestionType.TRUE_FALSE,
        prompt,
        explanation,
        config: { answer },
        tags,
        options: [
          { key: 'true', label: 'Vrai', isCorrect: answer },
          { key: 'false', label: 'Faux', isCorrect: !answer },
        ],
      })
    }
    if (q.type === 'trou') {
      const answers = (q.sol ?? []) as string[][]
      return upsertQuestion({
        key: q.id,
        type: QuestionType.FILL_BLANK,
        prompt: 'Complétez le texte.',
        explanation,
        config: { text: normalizeBlanks(q.q), answers, caseSensitive: false },
        tags,
        options: [],
      })
    }
    // appar : g[i] doit être associé à d[sol[i]]
    const targets = q.d ?? []
    const solution = (q.sol ?? []) as number[]
    return upsertQuestion({
      key: q.id,
      type: QuestionType.MATCHING,
      prompt,
      explanation,
      config: { shuffle: true },
      tags,
      options: (q.g ?? []).map((label, i) => ({
        key: String(i),
        label: plainText(label),
        isCorrect: true,
        matchValue: plainText(targets[solution[i] ?? i] ?? ''),
      })),
    })
  }

  // ---------------------------------------------------------------------------
  // 3. Module de présentation (syllabus, cadre et méthode) depuis PAGES
  // ---------------------------------------------------------------------------
  const pageTitle = (p: PageSection): string => plainText(p.titre ?? p.t ?? p.title ?? '')
  const pageHtml = (p: PageSection): string => cleanHtml(p.html ?? p.h ?? '')
  const pages = (data.PAGES ?? []).filter((p) => pageHtml(p).length > 0)

  const introModuleId = await upsertModule(
    1,
    'Présentation du séminaire',
    'Syllabus, cadre juridique de référence et méthode de travail de la formation.',
    30,
  )
  const introHtml = pages
    .map((p) => {
      const title = pageTitle(p)
      return (title ? `<h3>${title}</h3>\n` : '') + pageHtml(p)
    })
    .join('\n')
  const introLesson = await upsertLesson(
    introModuleId,
    1,
    'Syllabus, cadre et méthode',
    'Présentation générale du séminaire : objectifs, programme des quatre modules, évaluation et références.',
    30,
  )
  await upsertActivity({
    lessonId: introLesson.id,
    key: [introLesson.slug, 'text'],
    position: 1,
    type: ActivityType.TEXT,
    title: 'Syllabus, cadre et méthode',
    instructions: 'Lisez attentivement le contenu ci-dessous puis passez à l\'activité suivante.',
    content: { html: introHtml },
    durationMinutes: 30,
    completionRule: CompletionRule.VIEW,
  })
  log.done('Module 1 : présentation du séminaire')

  // ---------------------------------------------------------------------------
  // 4. Modules M1 à M4 : cours, activités, étude de cas, débat, quiz de module
  // ---------------------------------------------------------------------------
  const corrigés: string[] = [
    '# Livret du formateur - Séminaire FETRAG-SETRAG',
    '',
    "Corrigés des études de cas et des activités du cours DTC-SETRAG « L'action syndicale et le droit du travail gabonais »",
    '(Loi n°022/2021 du 19 novembre 2021). Document réservé au formateur et à la coordination pédagogique.',
    '',
  ]

  for (const [index, meta] of data.MODULES.entries()) {
    const code = meta.code // M1..M4
    const position = index + 2
    const courseHtml = data.COURS[code] ?? ''
    const activites = data.ACTIVITES?.[code] ?? []
    const bank = data.BANK.filter((q) => q.mod === code)

    const moduleId = await upsertModule(
      position,
      `Module ${index + 1} - ${plainText(meta.titre)}`,
      `${plainText(meta.ancrage)} - Livrable : ${plainText(meta.livrable)}`,
      450,
    )
    corrigés.push(`## Module ${index + 1} - ${plainText(meta.titre)}`, '')

    // Leçon 1 : cours
    const objectifsHtml = meta.objectifs.map((o) => `<li>${cleanHtml(o)}</li>`).join('\n')
    const lessonCourseHtml = [
      `<h3>Objectifs du module</h3>`,
      `<ul>${objectifsHtml}</ul>`,
      cleanHtml(meta.ancrage_html),
      cleanHtml(courseHtml),
      `<h3>Livrable du module</h3>`,
      `<p>${cleanHtml(meta.livrable)}</p>`,
    ].join('\n')
    const courseLesson = await upsertLesson(
      moduleId,
      1,
      `Cours - ${plainText(meta.titre)}`,
      `Cours du module (${plainText(meta.duree)}) : ${plainText(meta.ancrage)}.`,
      120,
    )
    await upsertActivity({
      lessonId: courseLesson.id,
      key: [courseLesson.slug, 'text'],
      position: 1,
      type: ActivityType.TEXT,
      title: `Cours - ${plainText(meta.titre)}`,
      instructions: 'Lisez attentivement le contenu ci-dessous puis passez à l\'activité suivante.',
      content: { html: lessonCourseHtml },
      durationMinutes: 120,
      completionRule: CompletionRule.VIEW,
    })

    // Leçon 2 : activités pratiques (exercice à trous, classement, étude de cas, débat)
    const practiceLesson = await upsertLesson(
      moduleId,
      2,
      `Activités pratiques - Module ${index + 1}`,
      'Exercices interactifs corrigés automatiquement, étude de cas à déposer et débat guidé.',
      180,
    )
    let activityPosition = 0
    for (const [aIndex, act] of activites.entries()) {
      const title = plainText(act.t)
      if (act.kind === 'trou' && act.data.q && act.data.sol) {
        activityPosition += 1
        const qid = await upsertQuestion({
          key: `${code}-exo-${aIndex}`,
          type: QuestionType.FILL_BLANK,
          prompt: plainText(act.data.consigne ?? act.d),
          config: { text: normalizeBlanks(act.data.q), answers: act.data.sol, caseSensitive: false },
          tags: ['setrag', 'exercice', code.toLowerCase()],
          options: [],
        })
        const activityId = await upsertActivity({
          lessonId: practiceLesson.id,
          key: [practiceLesson.slug, 'exo', String(aIndex)],
          position: activityPosition,
          type: ActivityType.QUIZ,
          title,
          instructions: plainText(act.data.consigne ?? act.d),
          content: { kind: 'quiz' },
          durationMinutes: 15,
          completionRule: CompletionRule.PASS_SCORE,
          maxScore: 100,
          passScore: 60,
        })
        await upsertQuiz({
          activityId,
          key: [code, 'exo', String(aIndex)],
          description: plainText(act.d),
          timeLimitMinutes: null,
          maxAttempts: 10,
          shuffleQuestions: false,
          shuffleOptions: false,
          showCorrection: true,
          passScore: 60,
          questionIds: [qid],
        })
        corrigés.push(`### ${title}`, '', `Réponses attendues : ${act.data.sol.map((s) => s[0]).join(' ; ')}.`, '')
      } else if (act.kind === 'classer' && act.data.items && act.data.colonnes) {
        activityPosition += 1
        const columns = act.data.colonnes.map(plainText)
        const qid = await upsertQuestion({
          key: `${code}-exo-${aIndex}`,
          type: QuestionType.MATCHING,
          prompt: plainText(act.data.consigne ?? act.d),
          config: { shuffle: true },
          tags: ['setrag', 'exercice', code.toLowerCase()],
          options: act.data.items.map((item, i) => ({
            key: String(i),
            label: plainText(item.s),
            isCorrect: true,
            matchValue: columns[item.col] ?? '',
          })),
        })
        const activityId = await upsertActivity({
          lessonId: practiceLesson.id,
          key: [practiceLesson.slug, 'exo', String(aIndex)],
          position: activityPosition,
          type: ActivityType.QUIZ,
          title,
          instructions: plainText(act.data.consigne ?? act.d),
          content: { kind: 'quiz' },
          durationMinutes: 15,
          completionRule: CompletionRule.PASS_SCORE,
          maxScore: 100,
          passScore: 60,
        })
        await upsertQuiz({
          activityId,
          key: [code, 'exo', String(aIndex)],
          description: plainText(act.d),
          timeLimitMinutes: null,
          maxAttempts: 10,
          shuffleQuestions: false,
          shuffleOptions: false,
          showCorrection: true,
          passScore: 60,
          questionIds: [qid],
        })
        corrigés.push(
          `### ${title}`,
          '',
          ...act.data.items.map((item) => `- ${plainText(item.s)} : **${columns[item.col] ?? ''}**`),
          '',
        )
      } else if (act.kind === 'qcm' && Array.isArray(act.data.questions)) {
        activityPosition += 1
        const items = act.data.questions as QcmItem[]
        const qids: string[] = []
        for (const [qIndex, item] of items.entries()) {
          qids.push(
            await upsertQuestion({
              key: `${code}-exo-${aIndex}-${qIndex}`,
              type: QuestionType.SINGLE_CHOICE,
              prompt: plainText(item.q),
              explanation: item.fb ? plainText(item.fb) : null,
              tags: ['setrag', 'exercice', code.toLowerCase()],
              options: (item.o ?? []).map(([label, correct], i) => ({
                key: String(i),
                label: plainText(label),
                isCorrect: correct === 1,
              })),
            }),
          )
        }
        const activityId = await upsertActivity({
          lessonId: practiceLesson.id,
          key: [practiceLesson.slug, 'exo', String(aIndex)],
          position: activityPosition,
          type: ActivityType.QUIZ,
          title,
          instructions: plainText(act.data.consigne ?? act.d),
          content: { kind: 'quiz' },
          durationMinutes: 15,
          completionRule: CompletionRule.PASS_SCORE,
          maxScore: 100,
          passScore: 60,
        })
        await upsertQuiz({
          activityId,
          key: [code, 'exo', String(aIndex)],
          description: plainText(act.d),
          timeLimitMinutes: null,
          maxAttempts: 10,
          shuffleQuestions: false,
          shuffleOptions: false,
          showCorrection: true,
          passScore: 60,
          questionIds: qids,
        })
        corrigés.push(
          `### ${title}`,
          '',
          ...items.map((item) => `- ${plainText(item.q)} Réponse : **${plainText((item.o.find(([, c]) => c === 1) ?? ['-'])[0])}**`),
          '',
        )
      } else if (act.kind === 'cas' && act.data.situation) {
        activityPosition += 1
        const questions = (act.data.questions ?? []) as CaseQuestion[]
        const questionsHtml = questions.length
          ? `<h4>Questions</h4>\n<ol>${questions.map((cq) => `<li>${plainText(cq.q).replace(/^Q\d+\s*:\s*/, '')}</li>`).join('\n')}</ol>`
          : ''
        const caseStudy = `<p>${cleanHtml(act.data.situation)}</p>\n${questionsHtml}`
        const activityId = await upsertActivity({
          lessonId: practiceLesson.id,
          key: [practiceLesson.slug, 'cas'],
          position: activityPosition,
          type: ActivityType.ASSIGNMENT,
          title,
          instructions: `${plainText(act.data.consigne ?? act.d)} Fondez chaque réponse sur les articles du Code du travail (Loi n°022/2021). Répondez dans le champ texte ou déposez un fichier PDF ou Word.`,
          content: { caseStudy },
          durationMinutes: 60,
          completionRule: CompletionRule.SUBMIT,
          maxScore: 20,
          passScore: 10,
          weight: 2,
        })
        const per = questions.length > 0 ? Math.floor(20 / questions.length) : 20
        const rubric = questions.map((cq, i) => ({
          criterion: plainText(cq.q).replace(/^Q\d+\s*:\s*/, ''),
          maxPoints: i === 0 ? 20 - per * (questions.length - 1) : per,
        }))
        const assignmentData = {
          description:
            'Étude de cas corrigée par le formateur. Chaque réponse doit citer les articles du Code du travail qui la fondent. Dépôt en PDF ou Word, ou réponse rédigée directement dans le champ texte.',
          allowFile: true,
          allowText: true,
          allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          maxFileSizeMb: 10,
          dueAt: null,
          lateAllowed: true,
          maxScore: 20,
          rubric: json(rubric.length ? rubric : [{ criterion: 'Analyse juridique du cas', maxPoints: 20 }]),
        }
        await prisma.assignment.upsert({
          where: { activityId },
          create: { id: stableId('assignment', SET_KEY, code), activityId, ...assignmentData },
          update: assignmentData,
        })
        corrigés.push(`### ${title}`, '', `Situation : ${plainText(act.data.situation)}`, '')
        for (const cq of questions) {
          corrigés.push(`**${plainText(cq.q)}**`, '', plainText(cq.r), '')
        }
      } else if (act.kind === 'debat') {
        activityPosition += 1
        const prompt = plainText(act.data.consigne ?? act.d)
        const activityId = await upsertActivity({
          lessonId: practiceLesson.id,
          key: [practiceLesson.slug, 'debat'],
          position: activityPosition,
          type: ActivityType.FORUM,
          title,
          instructions: `${prompt} Publiez votre position argumentée puis répondez à au moins un autre participant.`,
          content: { prompt },
          durationMinutes: 30,
          isRequired: false,
          completionRule: CompletionRule.MANUAL,
        })
        const forumData = {
          title,
          description: prompt,
          courseId: course.id,
          activityId,
          isModerated: true,
          isLocked: false,
        }
        const forumSlug = slugify(`debat-setrag-${code}-${title}`)
        await prisma.forum.upsert({
          where: { activityId },
          create: { id: stableId('forum', SET_KEY, code), slug: forumSlug, ...forumData },
          update: forumData,
        })
      }
    }

    // Leçon 3 : quiz du module (5 questions de la banque)
    const quizLesson = await upsertLesson(
      moduleId,
      3,
      `Évaluation du module ${index + 1}`,
      'Quiz de validation des acquis du module, corrigé automatiquement.',
      30,
    )
    const questionIds: string[] = []
    for (const q of bank) questionIds.push(await importBankQuestion(q))
    const quizActivityId = await upsertActivity({
      lessonId: quizLesson.id,
      key: [quizLesson.slug, 'quiz'],
      position: 1,
      type: ActivityType.QUIZ,
      title: `Quiz du module ${index + 1}`,
      instructions: `${bank.length} questions sur le module. Trois tentatives autorisées, correction affichée à l'issue de chaque tentative, score minimum de 60 %.`,
      content: { kind: 'quiz' },
      durationMinutes: 30,
      completionRule: CompletionRule.PASS_SCORE,
      maxScore: 100,
      passScore: 60,
      weight: 2,
    })
    await upsertQuiz({
      activityId: quizActivityId,
      key: [code, 'quiz'],
      description: `Évaluation du module ${index + 1} : ${plainText(meta.titre)}.`,
      timeLimitMinutes: null,
      maxAttempts: 3,
      shuffleQuestions: false,
      shuffleOptions: true,
      showCorrection: true,
      passScore: 60,
      questionIds,
    })
    log.info(`${code} : ${activites.length} activités, ${bank.length} questions`)
  }
  log.done('Modules M1 à M4 importés')

  // ---------------------------------------------------------------------------
  // 5. Évaluation finale : entraînement chronométré + examen final (EVAL_CFG)
  // ---------------------------------------------------------------------------
  const evalCfg = data.EVAL_CFG ?? {}
  const training: EvalMode = evalCfg['entrainement'] ?? evalCfg['entraînement'] ?? {}
  const exam: EvalMode = evalCfg['examen'] ?? {}
  const trainingSeuil = training.seuil ?? 70
  const examSeuil = exam.seuil ?? 70
  const examSize = exam.taille ?? 20

  const finalModuleId = await upsertModule(
    data.MODULES.length + 2,
    'Évaluation finale',
    "Entraînement chronométré rejouable puis examen final en une seule tentative, sur l'ensemble du séminaire.",
    60,
  )
  const finalLesson = await upsertLesson(
    finalModuleId,
    1,
    'Entraînement et examen final',
    "Préparez-vous avec l'entraînement chronométré (correction affichée), puis passez l'examen final.",
    60,
  )

  const moduleCodes = new Set(data.MODULES.map((m) => m.code))
  // Questions transversales (mod « Final ») : importées ici, elles n'appartiennent à aucun module.
  for (const q of data.BANK.filter((question) => !moduleCodes.has(question.mod))) {
    await importBankQuestion(q)
  }
  const allBankIds = data.BANK.map((q) => stableId('question', SET_KEY, q.id))
  const examBank = data.BANK.filter((q) => moduleCodes.has(q.mod)).slice(0, examSize)
  const examIds = (examBank.length >= examSize ? examBank : data.BANK.slice(0, examSize)).map((q) => stableId('question', SET_KEY, q.id))

  const trainingActivityId = await upsertActivity({
    lessonId: finalLesson.id,
    key: [finalLesson.slug, 'entrainement'],
    position: 1,
    type: ActivityType.QUIZ,
    title: 'Entraînement chronométré',
    instructions: `Toutes les questions du séminaire en ${training.dureeMin ?? 20} minutes. Rejouable à volonté, correction affichée à chaque tentative, seuil indicatif de ${trainingSeuil} %.`,
    content: { kind: 'quiz' },
    durationMinutes: training.dureeMin ?? 20,
    isRequired: false,
    completionRule: CompletionRule.PASS_SCORE,
    maxScore: 100,
    passScore: trainingSeuil,
  })
  await upsertQuiz({
    activityId: trainingActivityId,
    key: ['entrainement'],
    description: "Entraînement chronométré sur l'ensemble de la banque de questions du séminaire, correction affichée.",
    timeLimitMinutes: training.dureeMin ?? 20,
    maxAttempts: 20,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrection: training.feedback ?? true,
    passScore: trainingSeuil,
    questionIds: allBankIds,
  })

  const examActivityId = await upsertActivity({
    lessonId: finalLesson.id,
    key: [finalLesson.slug, 'examen'],
    position: 2,
    type: ActivityType.QUIZ,
    title: 'Examen final',
    instructions: `${examIds.length} questions en ${exam.dureeMin ?? 30} minutes, une seule tentative, sans correction affichée. Score minimum : ${examSeuil} %.`,
    content: { kind: 'quiz' },
    durationMinutes: exam.dureeMin ?? 30,
    completionRule: CompletionRule.PASS_SCORE,
    maxScore: 100,
    passScore: examSeuil,
    weight: 3,
  })
  await upsertQuiz({
    activityId: examActivityId,
    key: ['examen'],
    description: 'Examen final du séminaire : une seule tentative, questions et options mélangées, correction non affichée.',
    timeLimitMinutes: exam.dureeMin ?? 30,
    maxAttempts: 1,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrection: exam.feedback ?? false,
    passScore: examSeuil,
    questionIds: examIds,
  })
  log.done(`Évaluation finale : entraînement (${allBankIds.length} questions) + examen (${examIds.length} questions)`)

  // ---------------------------------------------------------------------------
  // 6. Livret du formateur (corrigés des études de cas)
  // ---------------------------------------------------------------------------
  const corrigesPath = path.join(repoRoot, 'docs', 'formation', 'DTC-SETRAG-corriges.md')
  fs.mkdirSync(path.dirname(corrigesPath), { recursive: true })
  fs.writeFileSync(corrigesPath, `${corrigés.join('\n')}\n`, 'utf8')
  log.done(`Livret du formateur : ${path.relative(repoRoot, corrigesPath)}`)

  // ---------------------------------------------------------------------------
  // Récapitulatif
  // ---------------------------------------------------------------------------
  const counts = await prisma.courseModule.count({ where: { courseVersionId: version.id } })
  const lessonCount = await prisma.lesson.count({ where: { module: { courseVersionId: version.id } } })
  const activityCount = await prisma.activity.count({ where: { lesson: { module: { courseVersionId: version.id } } } })
  log.step('Récapitulatif')
  log.info(`Cours : ${COURSE_CODE} - /catalogue/${course.slug}`)
  log.info(`${counts} modules, ${lessonCount} leçons, ${activityCount} activités`)
  log.info(`${data.BANK.length} questions de banque importées (catégorie « ${QUESTION_CATEGORY} »)`)
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  process.exitCode = 1
})
