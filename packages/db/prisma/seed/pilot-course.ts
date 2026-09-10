import {
  AccessLevel,
  ActivityType,
  AttemptStatus,
  AttendanceStatus,
  CertificateKind,
  CertificateStatus,
  CohortStatus,
  CompletionRule,
  ContentStatus,
  EnrollmentStatus,
  QuestionType,
  ResourceKind,
  SessionMode,
  SubmissionStatus,
} from '../../generated/client'
import { prisma } from '../../src/client'
import type { SeededCatalog, SeededCourse, SeededLesson } from './catalog'
import { addMinutes, at, certificateNumber, daysFromNow, get, inBatches, json, log, stableId } from './helpers'
import type { SeededOrganizations } from './organizations'
import type { SeededUser, SeededUsers } from './users'

/**
 * Cours pilote M01 : contenu complet (document, vidéo, audio, lien, quiz, devoir,
 * questionnaire, forum, séance en direct), modèles de certificats, cohorte pilote
 * SYNATEP avec inscriptions, progressions, présences, tentatives, dépôts et certificats.
 */

export const PILOT_COURSE_CODE = 'M01'
export const PILOT_COHORT_CODE = 'COH-M01-2026-SYN1'
export const CODE_DU_TRAVAIL_RESOURCE_SLUG = 'code-du-travail-gabonais-extraits'

export interface SeededPilot {
  course: SeededCourse
  cohortId: string
  cohortCode: string
  quizActivityId: string
  assignmentId: string
  forumId: string
  defaultTemplateId: string
  courseTemplateId: string
  enrollmentIds: Record<string, string>
  certificateNumbers: string[]
  sessionIds: string[]
  resourceId: string
}

interface ActivityRef {
  id: string
  type: ActivityType
  isRequired: boolean
  order: number
}

const QUIZ_KEY = 'm01-quiz'
const SURVEY_KEY = 'm01-survey'

/** Nombre d'activités obligatoires achevées par apprenant (apprenant1..apprenant10). */
const COMPLETED_COUNTS = [13, 13, 10, 9, 7, 6, 5, 4, 3, 2] as const

const VERIFY_CODES = ['K7MP-3QXR-9TVD', 'W4HN-8BZC-2SGK'] as const

function lessonBySlug(course: SeededCourse, slug: string): SeededLesson {
  for (const m of course.modules) {
    const lesson = m.lessons.find((l) => l.slug === slug)
    if (lesson) return lesson
  }
  throw new Error(`Seed : leçon ${slug} introuvable dans ${course.code}`)
}

// -----------------------------------------------------------------------------
// Ressource documentaire + activités complémentaires
// -----------------------------------------------------------------------------

async function seedResource(categoryId: string): Promise<string> {
  const data = {
    title: 'Code du travail gabonais - extraits',
    summary:
      'Extraits commentés du Code du travail de la République gabonaise (loi de 2021) : contrat de travail, représentation du personnel, négociation collective, règlement des différends.',
    kind: ResourceKind.LEGAL_TEXT,
    categoryId,
    accessLevel: AccessLevel.PUBLIC,
    fileUrl: null,
    fileName: null,
    externalUrl: 'https://www.droit-afrique.com/uploads/Gabon-Code-2021-du-travail.pdf',
    mimeType: 'application/pdf',
    language: 'fr' as const,
    source: 'Journal officiel de la République gabonaise - reproduction Droit-Afrique',
    authorName: 'République gabonaise',
    publishedOn: new Date(Date.UTC(2021, 10, 19)),
    keywords: ['code du travail', 'gabon', 'contrat', 'licenciement', 'délégués du personnel'],
    isPremium: false,
    status: ContentStatus.PUBLISHED,
  }
  const resource = await prisma.resource.upsert({
    where: { slug: CODE_DU_TRAVAIL_RESOURCE_SLUG },
    create: { id: stableId('resource', CODE_DU_TRAVAIL_RESOURCE_SLUG), slug: CODE_DU_TRAVAIL_RESOURCE_SLUG, ...data },
    update: data,
    select: { id: true },
  })
  return resource.id
}

interface ExtraActivitySeed {
  key: string
  lessonSlug: string
  position: number
  type: ActivityType
  title: string
  instructions: string
  content: unknown
  lowBandwidthAlternative?: unknown
  resourceId?: string
  durationMinutes: number
  isRequired: boolean
  completionRule: CompletionRule
  maxScore?: number
  passScore?: number
  weight?: number
  dueAt?: Date
}

const VIDEO_TRANSCRIPT =
  'Bienvenue dans cette première séquence vidéo du module Fondamentaux du syndicalisme gabonais. Dans les dix prochaines minutes, nous allons parcourir trois grandes étapes de l’histoire du mouvement des travailleurs au Gabon. Première étape : la période coloniale, avec la reconnaissance progressive du droit syndical aux travailleurs africains et la naissance des premières unions locales sur les chantiers forestiers et dans les ports. Deuxième étape : l’indépendance de 1960 et la structuration d’organisations nationales, dans un contexte où l’État cherche à faire du syndicat un partenaire du développement. Troisième étape : le tournant de 1990, avec la Conférence nationale, le retour du multipartisme et la reconnaissance du pluralisme syndical, qui aboutit au paysage que nous connaissons aujourd’hui. Pour chaque étape, retenez une idée : les droits collectifs ont été conquis, ils se consolident par l’organisation et ils s’exercent dans un cadre juridique que le leader syndical doit connaître. À la fin de cette vidéo, ouvrez l’activité de lecture pour approfondir chacune de ces périodes.'

const AUDIO_TRANSCRIPT =
  'Cette capsule audio de huit minutes présente le paysage syndical gabonais depuis 1990. Vous entendrez d’abord un rappel du contexte de la Conférence nationale, puis une présentation des différents niveaux d’organisation : le syndicat de base dans l’entreprise, le syndicat de branche, la fédération et la confédération. Nous expliquons ensuite le rôle des institutions tripartites qui réunissent l’État, les organisations d’employeurs et les organisations de travailleurs, et la manière dont les réformes du salaire minimum, de la protection sociale et de la formation professionnelle y sont discutées. Enfin, nous décrivons la place d’une fédération comme la FETRAG : mutualiser les compétences, porter les revendications transversales et former les responsables des organisations affiliées. Prenez des notes sur les trois niveaux où une question peut être portée : l’entreprise, la branche et le niveau national.'

function extraActivities(resourceId: string): ExtraActivitySeed[] {
  return [
    {
      key: 'video',
      lessonSlug: 'des-origines-coloniales-a-l-independance',
      position: 2,
      type: ActivityType.VIDEO,
      title: 'Vidéo : trois étapes de l’histoire syndicale gabonaise',
      instructions:
        'Regardez la vidéo (10 min). Si votre connexion est lente, utilisez la transcription proposée en alternative bas débit.',
      content: { url: '', provider: 'youtube', transcript: VIDEO_TRANSCRIPT },
      lowBandwidthAlternative: { transcript: VIDEO_TRANSCRIPT, audioUrl: null },
      durationMinutes: 15,
      isRequired: true,
      completionRule: CompletionRule.VIEW,
    },
    {
      key: 'live',
      lessonSlug: 'des-origines-coloniales-a-l-independance',
      position: 3,
      type: ActivityType.LIVE_SESSION,
      title: 'Séance d’ouverture en présentiel',
      instructions:
        'Séance d’ouverture animée par la formatrice au siège de la FETRAG. La présence est enregistrée par émargement et conditionne l’achèvement de cette activité.',
      content: { format: 'in_person', agenda: ['Présentation du programme 2026', 'Histoire du mouvement syndical', 'Attentes des participants'] },
      durationMinutes: 240,
      isRequired: true,
      completionRule: CompletionRule.ATTEND,
    },
    {
      key: 'audio',
      lessonSlug: 'pluralisme-syndical-et-dialogue-social-depuis-1990',
      position: 2,
      type: ActivityType.AUDIO,
      title: 'Capsule audio : le paysage syndical depuis 1990',
      instructions: 'Écoutez la capsule (8 min) ou lisez sa transcription.',
      content: { url: '', transcript: AUDIO_TRANSCRIPT },
      lowBandwidthAlternative: { transcript: AUDIO_TRANSCRIPT, audioUrl: null },
      durationMinutes: 10,
      isRequired: true,
      completionRule: CompletionRule.VIEW,
    },
    {
      key: 'forum',
      lessonSlug: 'pluralisme-syndical-et-dialogue-social-depuis-1990',
      position: 3,
      type: ActivityType.FORUM,
      title: 'Forum : quel héritage pour votre section ?',
      instructions:
        'Partagez en quelques lignes un événement de l’histoire syndicale de votre secteur et ce qu’il vous inspire pour votre action actuelle. Répondez à au moins un autre participant.',
      content: { prompt: 'Quel événement de l’histoire syndicale de votre secteur vous semble le plus marquant, et pourquoi ?' },
      durationMinutes: 20,
      isRequired: false,
      completionRule: CompletionRule.MANUAL,
    },
    {
      key: 'file',
      lessonSlug: 'le-code-du-travail-gabonais',
      position: 2,
      type: ActivityType.FILE,
      title: 'Document : Code du travail gabonais - extraits',
      instructions:
        'Téléchargez les extraits du Code du travail et repérez les articles relatifs au contrat à durée déterminée, à la procédure disciplinaire, au licenciement, aux délégués du personnel et au droit syndical.',
      content: { resourceId, label: 'Code du travail gabonais - extraits (PDF)' },
      resourceId,
      durationMinutes: 45,
      isRequired: true,
      completionRule: CompletionRule.VIEW,
    },
    {
      key: 'link',
      lessonSlug: 'les-conventions-collectives',
      position: 2,
      type: ActivityType.LINK,
      title: 'Lien : base de données NATLEX de l’OIT (Gabon)',
      instructions:
        'Consultez la fiche du Gabon dans la base NATLEX de l’Organisation internationale du Travail et identifiez deux textes relatifs à la négociation collective.',
      content: {
        url: 'https://www.ilo.org/dyn/natlex/natlex4.countrySubjects?p_lang=fr&p_country=GAB',
        label: 'NATLEX - législation du travail du Gabon',
      },
      durationMinutes: 20,
      isRequired: true,
      completionRule: CompletionRule.VIEW,
    },
    {
      key: 'assignment',
      lessonSlug: 'mission-et-valeurs-de-la-fetrag',
      position: 2,
      type: ActivityType.ASSIGNMENT,
      title: 'Devoir : appliquer le triptyque à un cas concret',
      instructions:
        'À partir du cas fourni (annonce d’une baisse d’activité dans une entreprise de votre secteur), rédigez une note de deux pages présentant la position de votre section selon les trois piliers du triptyque fondateur. Dépôt au format PDF ou Word, ou réponse dans le champ texte.',
      content: {
        caseStudy:
          'La direction d’une entreprise de 120 salariés annonce une baisse de 30 % de son activité pour les six prochains mois et évoque « des mesures sur les effectifs ». Aucune information économique n’a été transmise aux représentants du personnel. Des rumeurs de licenciements circulent dans les ateliers.',
      },
      durationMinutes: 120,
      isRequired: true,
      completionRule: CompletionRule.SUBMIT,
      maxScore: 20,
      passScore: 10,
      weight: 2,
      dueAt: daysFromNow(21, 23, 59),
    },
    {
      key: 'quiz',
      lessonSlug: 'le-triptyque-fondateur-en-pratique',
      position: 2,
      type: ActivityType.QUIZ,
      title: 'Évaluation finale du module 01',
      instructions:
        'Huit questions couvrant l’ensemble du module. Trois tentatives autorisées, score minimum de 60 %. La question de composition est corrigée par la formatrice.',
      content: { kind: 'quiz' },
      durationMinutes: 30,
      isRequired: true,
      completionRule: CompletionRule.PASS_SCORE,
      maxScore: 100,
      passScore: 60,
      weight: 3,
    },
    {
      key: 'survey',
      lessonSlug: 'le-triptyque-fondateur-en-pratique',
      position: 3,
      type: ActivityType.SURVEY,
      title: 'Questionnaire de satisfaction',
      instructions: 'Quatre questions anonymes pour améliorer le module. Deux minutes suffisent.',
      content: { kind: 'survey' },
      durationMinutes: 5,
      isRequired: false,
      completionRule: CompletionRule.SUBMIT,
    },
  ]
}

async function seedExtraActivities(course: SeededCourse, resourceId: string): Promise<Record<string, string>> {
  const ids: Record<string, string> = {}
  for (const extra of extraActivities(resourceId)) {
    const lesson = lessonBySlug(course, extra.lessonSlug)
    const id = stableId('activity', course.code, lesson.slug, extra.key)
    const data = {
      type: extra.type,
      title: extra.title,
      instructions: extra.instructions,
      content: json(extra.content),
      lowBandwidthAlternative: extra.lowBandwidthAlternative ? json(extra.lowBandwidthAlternative) : undefined,
      resourceId: extra.resourceId ?? null,
      position: extra.position,
      durationMinutes: extra.durationMinutes,
      isRequired: extra.isRequired,
      completionRule: extra.completionRule,
      maxScore: extra.maxScore ?? null,
      passScore: extra.passScore ?? null,
      weight: extra.weight ?? 1,
      dueAt: extra.dueAt ?? null,
    }
    await prisma.activity.upsert({ where: { id }, create: { id, lessonId: lesson.id, ...data }, update: data })
    ids[extra.key] = id
  }
  return ids
}

// -----------------------------------------------------------------------------
// Quiz, banque de questions, questionnaire de satisfaction
// -----------------------------------------------------------------------------

interface OptionSeed {
  key: string
  label: string
  isCorrect: boolean
  feedback?: string
  matchValue?: string
}

interface QuestionSeed {
  key: string
  type: QuestionType
  prompt: string
  explanation?: string
  config?: unknown
  points: number
  difficulty: number
  options: OptionSeed[]
  tags: string[]
}

const quizQuestions: QuestionSeed[] = [
  {
    key: 'q1',
    type: QuestionType.SINGLE_CHOICE,
    prompt: 'Quel texte constitue la principale source légale des relations de travail au Gabon ?',
    explanation: 'Le Code du travail organise le contrat de travail, la représentation du personnel, la négociation collective et le règlement des différends.',
    points: 1,
    difficulty: 1,
    tags: ['sources du droit', 'code du travail'],
    options: [
      { key: 'a', label: 'Le Code du travail', isCorrect: true },
      { key: 'b', label: 'Le Code civil', isCorrect: false, feedback: 'Le Code civil régit les rapports privés en général, pas spécifiquement le travail.' },
      { key: 'c', label: 'La Charte des partis politiques', isCorrect: false },
      { key: 'd', label: 'Le Code général des impôts', isCorrect: false },
    ],
  },
  {
    key: 'q2',
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: 'Parmi les éléments suivants, lesquels composent le triptyque fondateur de la FETRAG ? (plusieurs réponses)',
    explanation: 'Le triptyque : protection de l’outil de production, prévention des conflits sociaux, défense des intérêts matériels et moraux des travailleurs.',
    config: { partialCredit: true },
    points: 2,
    difficulty: 2,
    tags: ['fetrag', 'triptyque'],
    options: [
      { key: 'a', label: 'Protection de l’outil de production', isCorrect: true },
      { key: 'b', label: 'Prévention des conflits sociaux', isCorrect: true },
      { key: 'c', label: 'Défense des intérêts matériels et moraux des travailleurs', isCorrect: true },
      { key: 'd', label: 'Gestion des ressources humaines de l’entreprise', isCorrect: false, feedback: 'La gestion des ressources humaines relève de l’employeur.' },
    ],
  },
  {
    key: 'q3',
    type: QuestionType.TRUE_FALSE,
    prompt: 'La liberté syndicale est garantie par la Constitution gabonaise et par la convention n° 87 de l’OIT ratifiée par le Gabon.',
    explanation: 'Vrai : la Constitution garantit la liberté syndicale et le Gabon a ratifié la convention n° 87 sur la liberté syndicale et la protection du droit syndical.',
    config: { answer: true },
    points: 1,
    difficulty: 1,
    tags: ['liberté syndicale', 'oit'],
    options: [
      { key: 'true', label: 'Vrai', isCorrect: true },
      { key: 'false', label: 'Faux', isCorrect: false },
    ],
  },
  {
    key: 'q4',
    type: QuestionType.FILL_BLANK,
    prompt: 'Complétez la phrase.',
    explanation: 'Le Code du travail fixe les règles applicables aux relations individuelles et collectives de travail.',
    config: {
      text: 'Le ___ du travail fixe les règles applicables aux relations individuelles et collectives de travail au Gabon.',
      answers: [['Code', 'code']],
      caseSensitive: false,
    },
    points: 1,
    difficulty: 1,
    tags: ['code du travail'],
    options: [],
  },
  {
    key: 'q5',
    type: QuestionType.MATCHING,
    prompt: 'Associez chaque notion à sa définition.',
    explanation: 'Ces quatre notions sont d’usage quotidien pour un responsable syndical.',
    config: { shuffle: true },
    points: 2,
    difficulty: 2,
    tags: ['vocabulaire'],
    options: [
      { key: 'a', label: 'Convention collective', isCorrect: true, matchValue: 'Accord écrit entre employeurs et syndicats sur les conditions de travail' },
      { key: 'b', label: 'Délégué du personnel', isCorrect: true, matchValue: 'Représentant élu des salariés dans l’entreprise' },
      { key: 'c', label: 'Grève', isCorrect: true, matchValue: 'Cessation collective et concertée du travail' },
      { key: 'd', label: 'Médiation', isCorrect: true, matchValue: 'Intervention d’un tiers pour rapprocher les parties' },
    ],
  },
  {
    key: 'q6',
    type: QuestionType.ORDERING,
    prompt: 'Classez les étapes de la création d’une section syndicale dans l’ordre chronologique.',
    explanation: 'Réunion constitutive, adoption des statuts et élection du bureau, dépôt des statuts, puis information de l’employeur.',
    config: { shuffle: true },
    points: 2,
    difficulty: 2,
    tags: ['organisation syndicale'],
    options: [
      { key: 'a', label: 'Réunion constitutive des adhérents', isCorrect: true, matchValue: '1' },
      { key: 'b', label: 'Adoption des statuts et élection du bureau', isCorrect: true, matchValue: '2' },
      { key: 'c', label: 'Dépôt des statuts auprès des autorités compétentes', isCorrect: true, matchValue: '3' },
      { key: 'd', label: 'Information de l’employeur et désignation des délégués', isCorrect: true, matchValue: '4' },
    ],
  },
  {
    key: 'q7',
    type: QuestionType.SHORT_ANSWER,
    prompt: 'Quelle organisation internationale tripartite adopte les conventions internationales du travail ? (indiquez le sigle)',
    explanation: 'L’Organisation internationale du Travail (OIT), dont le secrétariat est le Bureau international du Travail (BIT).',
    config: { accepted: ['OIT', 'O.I.T.', 'Organisation internationale du Travail', 'ILO'], caseSensitive: false },
    points: 1,
    difficulty: 1,
    tags: ['oit'],
    options: [],
  },
  {
    key: 'q8',
    type: QuestionType.ESSAY,
    prompt:
      'En 150 à 300 mots, expliquez comment le triptyque fondateur de la FETRAG peut guider l’action d’une section syndicale face à un projet de restructuration.',
    explanation: 'Attendus : un raisonnement structuré selon les trois piliers, des exemples concrets et une référence au cadre juridique.',
    config: {
      minWords: 150,
      maxWords: 300,
      rubric: [
        { criterion: 'Les trois piliers sont mobilisés', maxPoints: 2 },
        { criterion: 'Exemples concrets et cadre juridique', maxPoints: 1 },
        { criterion: 'Clarté et structure', maxPoints: 1 },
      ],
    },
    points: 4,
    difficulty: 3,
    tags: ['triptyque', 'composition'],
    options: [],
  },
]

const surveyQuestions: QuestionSeed[] = [
  {
    key: 's1',
    type: QuestionType.SINGLE_CHOICE,
    prompt: 'Le contenu du module répond à mes attentes.',
    points: 0,
    difficulty: 1,
    tags: ['satisfaction'],
    options: [
      { key: 'a', label: 'Tout à fait', isCorrect: false },
      { key: 'b', label: 'Plutôt oui', isCorrect: false },
      { key: 'c', label: 'Plutôt non', isCorrect: false },
      { key: 'd', label: 'Pas du tout', isCorrect: false },
    ],
  },
  {
    key: 's2',
    type: QuestionType.SINGLE_CHOICE,
    prompt: 'Les supports (textes, vidéo, audio, document) étaient clairs et accessibles.',
    points: 0,
    difficulty: 1,
    tags: ['satisfaction'],
    options: [
      { key: 'a', label: 'Tout à fait', isCorrect: false },
      { key: 'b', label: 'Plutôt oui', isCorrect: false },
      { key: 'c', label: 'Plutôt non', isCorrect: false },
      { key: 'd', label: 'Pas du tout', isCorrect: false },
    ],
  },
  {
    key: 's3',
    type: QuestionType.SINGLE_CHOICE,
    prompt: 'Le rythme et la durée du module étaient adaptés.',
    points: 0,
    difficulty: 1,
    tags: ['satisfaction'],
    options: [
      { key: 'a', label: 'Tout à fait', isCorrect: false },
      { key: 'b', label: 'Plutôt oui', isCorrect: false },
      { key: 'c', label: 'Plutôt non', isCorrect: false },
      { key: 'd', label: 'Pas du tout', isCorrect: false },
    ],
  },
  {
    key: 's4',
    type: QuestionType.ESSAY,
    prompt: 'Quelles améliorations suggérez-vous pour ce module ?',
    config: { minWords: 0, maxWords: 200, optional: true },
    points: 0,
    difficulty: 1,
    tags: ['satisfaction'],
    options: [],
  },
]

async function seedQuestionSet(setKey: string, questions: QuestionSeed[], authorId: string, category: string): Promise<void> {
  for (const q of questions) {
    const questionId = stableId('question', setKey, q.key)
    const data = {
      type: q.type,
      category,
      difficulty: q.difficulty,
      prompt: q.prompt,
      explanation: q.explanation ?? null,
      config: q.config ? json(q.config) : undefined,
      points: q.points,
      version: 1,
      authorId,
      tags: q.tags,
      isActive: true,
    }
    await prisma.question.upsert({ where: { id: questionId }, create: { id: questionId, ...data }, update: data })
    await inBatches(q.options, async (option, index) => {
      const optionId = stableId('option', setKey, q.key, option.key)
      const optionData = {
        label: option.label,
        isCorrect: option.isCorrect,
        feedback: option.feedback ?? null,
        position: index + 1,
        matchValue: option.matchValue ?? null,
      }
      await prisma.questionOption.upsert({
        where: { id: optionId },
        create: { id: optionId, questionId, ...optionData },
        update: optionData,
      })
    })
  }
}

async function seedQuiz(activityId: string, questions: QuestionSeed[], setKey: string, isSurvey: boolean): Promise<string> {
  const quiz = await prisma.quiz.upsert({
    where: { activityId },
    create: {
      id: stableId('quiz', setKey),
      activityId,
      description: isSurvey
        ? 'Questionnaire anonyme de satisfaction du module 01.'
        : 'Évaluation finale du module 01 : huit questions couvrant l’histoire, le cadre juridique et le triptyque fondateur.',
      timeLimitMinutes: isSurvey ? null : 30,
      maxAttempts: isSurvey ? 1 : 3,
      shuffleQuestions: false,
      shuffleOptions: !isSurvey,
      showCorrection: !isSurvey,
      passScore: isSurvey ? 0 : 60,
      isSurvey,
    },
    update: { passScore: isSurvey ? 0 : 60, isSurvey, maxAttempts: isSurvey ? 1 : 3 },
    select: { id: true },
  })
  await inBatches(questions, async (q, index) => {
    const questionId = stableId('question', setKey, q.key)
    await prisma.quizQuestion.upsert({
      where: { quizId_questionId: { quizId: quiz.id, questionId } },
      create: { quizId: quiz.id, questionId, position: index + 1, points: q.points },
      update: { position: index + 1, points: q.points },
    })
  })
  return quiz.id
}

async function seedAssignment(activityId: string): Promise<string> {
  const rubric = [
    { criterion: 'Compréhension du cadre juridique', maxPoints: 6 },
    { criterion: 'Analyse du cas selon les trois piliers', maxPoints: 8 },
    { criterion: 'Qualité de la rédaction et de l’argumentation', maxPoints: 6 },
  ]
  const data = {
    description:
      'Note de position de deux pages maximum. Le dépôt peut être un fichier PDF ou Word, ou une réponse rédigée directement dans le champ texte. Les dépôts en retard sont acceptés avec mention.',
    allowFile: true,
    allowText: true,
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxFileSizeMb: 10,
    dueAt: daysFromNow(21, 23, 59),
    lateAllowed: true,
    maxScore: 20,
    rubric: json(rubric),
  }
  const assignment = await prisma.assignment.upsert({
    where: { activityId },
    create: { id: stableId('assignment', 'm01'), activityId, ...data },
    update: data,
    select: { id: true },
  })
  return assignment.id
}

// -----------------------------------------------------------------------------
// Modèles de certificats
// -----------------------------------------------------------------------------

async function seedCertificateTemplates(courseId: string): Promise<{ defaultTemplateId: string; courseTemplateId: string }> {
  const criteria = json({ minScore: 60, minAttendanceRate: 50, requireCompletion: true })
  const defaultId = stableId('certificate-template', 'default-attestation')
  await prisma.certificateTemplate.upsert({
    where: { id: defaultId },
    create: {
      id: defaultId,
      name: 'Attestation de formation FETRAG (modèle par défaut)',
      kind: CertificateKind.ATTESTATION,
      titleText: 'Attestation de formation',
      bodyText: 'a suivi avec succès la formation',
      signatoryName: 'Jocelyn Louis NGOMA',
      signatoryTitle: 'Secrétaire Général de la FETRAG',
      criteria,
      validityMonths: null,
      isDefault: true,
    },
    update: { isDefault: true, criteria, kind: CertificateKind.ATTESTATION },
  })
  const courseTemplateId = stableId('certificate-template', 'm01-certificate')
  await prisma.certificateTemplate.upsert({
    where: { id: courseTemplateId },
    create: {
      id: courseTemplateId,
      name: 'Certificat - Fondamentaux du Syndicalisme Gabonais',
      kind: CertificateKind.CERTIFICATE,
      courseId,
      titleText: 'Certificat de formation',
      bodyText: 'a suivi avec succès et validé le module 01 du Programme de formation des Leaders Syndicaux',
      signatoryName: 'Jocelyn Louis NGOMA',
      signatoryTitle: 'Secrétaire Général de la FETRAG',
      criteria,
      validityMonths: 36,
      isDefault: false,
    },
    update: { courseId, criteria, kind: CertificateKind.CERTIFICATE, validityMonths: 36 },
  })
  return { defaultTemplateId: defaultId, courseTemplateId }
}

// -----------------------------------------------------------------------------
// Cohorte, sessions, présences
// -----------------------------------------------------------------------------

async function seedCohort(course: SeededCourse, users: SeededUsers, orgs: SeededOrganizations): Promise<string> {
  const data = {
    name: 'Cohorte pilote SYNATEP - Module 01',
    courseId: course.id,
    courseVersionId: course.versionId,
    organizationId: orgs.synatep.id,
    trainerId: users.formateur.id,
    status: CohortStatus.RUNNING,
    mode: SessionMode.HYBRID,
    capacity: 10,
    startsAt: daysFromNow(-10, 8),
    endsAt: daysFromNow(20, 17),
    location: 'Siège de la FETRAG, Libreville',
    description:
      'Session pilote du module 01 réservée aux cadres désignés par le SYNATEP. Alternance de séances en présentiel au siège de la FETRAG et d’activités à distance sur la plateforme.',
    isPrivate: true,
  }
  const cohort = await prisma.cohort.upsert({
    where: { code: PILOT_COHORT_CODE },
    create: { id: stableId('cohort', PILOT_COHORT_CODE), code: PILOT_COHORT_CODE, ...data },
    update: data,
    select: { id: true },
  })
  await inBatches(users.learners, async (learner) => {
    await prisma.cohortMember.upsert({
      where: { cohortId_userId: { cohortId: cohort.id, userId: learner.id } },
      create: { cohortId: cohort.id, userId: learner.id, role: 'learner', joinedAt: daysFromNow(-12) },
      update: { role: 'learner' },
    })
  })
  return cohort.id
}

interface SessionSeed {
  key: string
  title: string
  description: string
  mode: SessionMode
  startsAt: Date
  endsAt: Date
  location: string | null
  meetingUrl: string | null
  position: number
}

function sessionSeeds(): SessionSeed[] {
  return [
    {
      key: 'ouverture',
      title: 'Séance d’ouverture - Histoire et cadre juridique',
      description: 'Présentation du programme, histoire du mouvement syndical gabonais et repérage dans le Code du travail.',
      mode: SessionMode.IN_PERSON,
      startsAt: daysFromNow(-7, 9),
      endsAt: daysFromNow(-7, 13),
      location: 'Siège de la FETRAG, salle de conférence, Libreville',
      meetingUrl: null,
      position: 1,
    },
    {
      key: 'conventions',
      title: 'Classe virtuelle - Les conventions collectives',
      description: 'Lecture guidée d’une convention collective de branche et questions-réponses.',
      mode: SessionMode.VIRTUAL,
      startsAt: daysFromNow(0, 15),
      endsAt: daysFromNow(0, 17),
      location: null,
      meetingUrl: 'https://meet.jit.si/fetrag-m01-conventions-collectives',
      position: 2,
    },
    {
      key: 'cloture',
      title: 'Séance de clôture - La FETRAG et le triptyque fondateur',
      description: 'Restitution des devoirs, débat sur le triptyque fondateur et remise des certificats.',
      mode: SessionMode.HYBRID,
      startsAt: daysFromNow(12, 9),
      endsAt: daysFromNow(12, 12, 30),
      location: 'Siège de la FETRAG, Libreville (et visioconférence)',
      meetingUrl: 'https://meet.jit.si/fetrag-m01-cloture',
      position: 3,
    },
  ]
}

async function seedSessions(cohortId: string, liveActivityId: string, trainer: SeededUser): Promise<string[]> {
  const ids: string[] = []
  for (const s of sessionSeeds()) {
    const id = stableId('training-session', PILOT_COHORT_CODE, s.key)
    const data = {
      title: s.title,
      description: s.description,
      mode: s.mode,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      location: s.location,
      meetingUrl: s.meetingUrl,
      trainerName: trainer.name,
      position: s.position,
    }
    await prisma.trainingSession.upsert({ where: { id }, create: { id, cohortId, ...data }, update: data })
    ids.push(id)
  }

  // Séance en direct rattachée à l'activité LIVE_SESSION et à la session d'ouverture.
  const openingSessionId = at(ids, 0, 'session d’ouverture')
  const liveId = stableId('live-session', PILOT_COHORT_CODE, 'ouverture')
  const opening = at(sessionSeeds(), 0, 'session d’ouverture')
  const liveData = {
    activityId: liveActivityId,
    trainingSessionId: openingSessionId,
    title: opening.title,
    startsAt: opening.startsAt,
    endsAt: opening.endsAt,
    speakerName: trainer.name,
    meetingUrl: null,
    replayUrl: null,
    transcriptUrl: null,
  }
  await prisma.liveSession.upsert({ where: { id: liveId }, create: { id: liveId, ...liveData }, update: liveData })
  return ids
}

async function seedAttendance(sessionId: string, users: SeededUsers, sessionStart: Date): Promise<void> {
  await inBatches(users.learners, async (learner, index) => {
    const status =
      index === 6 ? AttendanceStatus.LATE : index === 9 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
    const checkedInAt =
      status === AttendanceStatus.ABSENT ? null : addMinutes(sessionStart, status === AttendanceStatus.LATE ? 35 : 5 + index * 2)
    const data = {
      status,
      checkedInAt,
      note: status === AttendanceStatus.ABSENT ? 'Absence signalée par l’organisation (mission de terrain).' : null,
      recordedById: users.formateur.id,
    }
    await prisma.attendance.upsert({
      where: { sessionId_userId: { sessionId, userId: learner.id } },
      create: { sessionId, userId: learner.id, ...data },
      update: data,
    })
  })
}

// -----------------------------------------------------------------------------
// Inscriptions, progression, tentatives, dépôts, certificats
// -----------------------------------------------------------------------------

async function orderedActivities(course: SeededCourse, extraIds: Record<string, string>): Promise<ActivityRef[]> {
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  const activities = await prisma.activity.findMany({
    where: { lessonId: { in: lessonIds } },
    select: { id: true, type: true, isRequired: true, position: true, lesson: { select: { position: true, module: { select: { position: true } } } } },
  })
  activities.sort(
    (a, b) =>
      a.lesson.module.position - b.lesson.module.position ||
      a.lesson.position - b.lesson.position ||
      a.position - b.position,
  )
  const known = new Set([...Object.values(extraIds), ...course.modules.flatMap((m) => m.lessons.map((l) => l.textActivityId))])
  return activities
    .filter((a) => known.has(a.id))
    .map((a, index) => ({ id: a.id, type: a.type, isRequired: a.isRequired, order: index + 1 }))
}

interface AttemptPlan {
  learnerIndex: number
  percent: number
  score: number
  /** Réponses par clé de question. */
  answers: Record<string, { response: unknown; isCorrect: boolean; score: number; feedback?: string }>
}

function optionId(setKey: string, qKey: string, optKey: string): string {
  return stableId('option', setKey, qKey, optKey)
}

function attemptPlans(): AttemptPlan[] {
  const o = (q: string, k: string) => optionId(QUIZ_KEY, q, k)
  const matchingAll = ['a', 'b', 'c', 'd'].map((k) => ({
    optionId: o('q5', k),
    value: get(
      {
        a: 'Accord écrit entre employeurs et syndicats sur les conditions de travail',
        b: 'Représentant élu des salariés dans l’entreprise',
        c: 'Cessation collective et concertée du travail',
        d: 'Intervention d’un tiers pour rapprocher les parties',
      },
      k,
    ),
  }))
  const essayText =
    'Face à un projet de restructuration, la section syndicale mobilise d’abord le pilier de la protection de l’outil de production : elle demande les informations économiques, analyse la réalité des difficultés et propose des alternatives qui préservent l’activité et les emplois. Le pilier de la prévention des conflits sociaux la conduit ensuite à ouvrir immédiatement le dialogue avec la direction, à informer les salariés de manière transparente pour couper court aux rumeurs et à privilégier la négociation d’un accord de méthode. Enfin, le pilier de la défense des intérêts matériels et moraux impose de vérifier que chaque mesure respecte le Code du travail et la convention collective, que les critères d’ordre sont objectifs et que les salariés concernés bénéficient de mesures d’accompagnement. Ce raisonnement en trois temps évite la réaction à chaud et donne à la section une position à la fois responsable et ferme, ce qui renforce sa crédibilité auprès des adhérents comme de l’employeur. Il rappelle enfin que le syndicat n’est pas seulement une force de contestation mais un acteur de la pérennité de l’entreprise et des droits des travailleurs.'
  return [
    {
      learnerIndex: 0,
      percent: 93,
      score: 13,
      answers: {
        q1: { response: { type: 'choice', optionIds: [o('q1', 'a')] }, isCorrect: true, score: 1 },
        q2: { response: { type: 'choice', optionIds: [o('q2', 'a'), o('q2', 'b'), o('q2', 'c')] }, isCorrect: true, score: 2 },
        q3: { response: { type: 'boolean', value: true }, isCorrect: true, score: 1 },
        q4: { response: { type: 'blanks', values: ['Code'] }, isCorrect: true, score: 1 },
        q5: { response: { type: 'matching', pairs: matchingAll }, isCorrect: true, score: 2 },
        q6: { response: { type: 'ordering', optionIds: ['a', 'b', 'c', 'd'].map((k) => o('q6', k)) }, isCorrect: true, score: 2 },
        q7: { response: { type: 'text', value: 'OIT' }, isCorrect: true, score: 1 },
        q8: {
          response: { type: 'text', value: essayText },
          isCorrect: true,
          score: 3,
          feedback: 'Très bonne mobilisation des trois piliers. Le cadre juridique aurait pu être cité plus précisément (articles du Code du travail).',
        },
      },
    },
    {
      learnerIndex: 1,
      percent: 71,
      score: 10,
      answers: {
        q1: { response: { type: 'choice', optionIds: [o('q1', 'a')] }, isCorrect: true, score: 1 },
        q2: { response: { type: 'choice', optionIds: [o('q2', 'a'), o('q2', 'c')] }, isCorrect: false, score: 1, feedback: 'Réponse incomplète : la prévention des conflits sociaux fait partie du triptyque.' },
        q3: { response: { type: 'boolean', value: true }, isCorrect: true, score: 1 },
        q4: { response: { type: 'blanks', values: ['code'] }, isCorrect: true, score: 1 },
        q5: { response: { type: 'matching', pairs: matchingAll }, isCorrect: true, score: 2 },
        q6: { response: { type: 'ordering', optionIds: ['b', 'a', 'c', 'd'].map((k) => o('q6', k)) }, isCorrect: false, score: 0, feedback: 'La réunion constitutive précède l’adoption des statuts.' },
        q7: { response: { type: 'text', value: 'oit' }, isCorrect: true, score: 1 },
        q8: {
          response: { type: 'text', value: essayText },
          isCorrect: true,
          score: 3,
          feedback: 'Raisonnement clair. Développez davantage les mesures d’accompagnement.',
        },
      },
    },
  ]
}

async function seedEnrollments(
  course: SeededCourse,
  cohortId: string,
  users: SeededUsers,
  orgs: SeededOrganizations,
  activities: ActivityRef[],
  quizPercentByLearner: Record<number, number>,
): Promise<Record<string, string>> {
  const required = activities.filter((a) => a.isRequired)
  const ids: Record<string, string> = {}
  const startedAt = daysFromNow(-10, 8)

  for (const [index, learner] of users.learners.entries()) {
    const count = at(COMPLETED_COUNTS, index, 'compteur de progression')
    const completed = required.slice(0, count)
    const progressPercent = Math.round((count / required.length) * 100)
    const isCompleted = count >= required.length
    const quizPercent = quizPercentByLearner[index]
    const lastCompleted = completed[completed.length - 1]
    const timeSpentSeconds = completed.reduce((sum, a) => sum + (a.type === ActivityType.TEXT ? 900 : 1500), 0)
    const completedAt = isCompleted ? daysFromNow(-1, 18) : null

    const enrollmentId = stableId('enrollment', course.code, PILOT_COHORT_CODE, learner.email)
    const data = {
      courseVersionId: course.versionId,
      organizationId: orgs.synatep.id,
      status: isCompleted ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
      source: 'organization',
      progressPercent,
      score: quizPercent ?? null,
      timeSpentSeconds,
      lastActivityId: lastCompleted?.id ?? null,
      lastActivityAt: lastCompleted ? daysFromNow(-10 + Math.floor((count * 9) / required.length), 18) : null,
      startedAt,
      completedAt,
    }
    const existing = await prisma.enrollment.findFirst({
      where: { userId: learner.id, courseId: course.id, cohortId },
      select: { id: true },
    })
    const enrollment = existing
      ? await prisma.enrollment.update({ where: { id: existing.id }, data, select: { id: true } })
      : await prisma.enrollment.create({
          data: { id: enrollmentId, userId: learner.id, courseId: course.id, cohortId, ...data },
          select: { id: true },
        })
    ids[learner.email] = enrollment.id

    await inBatches(completed, async (activity, k) => {
      const completedAtActivity = daysFromNow(-10 + Math.floor(((k + 1) * 9) / required.length), 10 + (k % 8))
      const score = activity.type === ActivityType.QUIZ ? (quizPercent ?? null) : null
      const completionData = {
        completed: true,
        score,
        timeSpentSeconds: activity.type === ActivityType.TEXT ? 900 : 1500,
        progressData: json({ source: 'seed', order: activity.order }),
        completedAt: completedAtActivity,
      }
      await prisma.activityCompletion.upsert({
        where: { enrollmentId_activityId: { enrollmentId: enrollment.id, activityId: activity.id } },
        create: { enrollmentId: enrollment.id, activityId: activity.id, ...completionData },
        update: completionData,
      })
    })

    if (isCompleted) {
      const eventId = stableId('status-event', 'enrollment', enrollment.id, 'COMPLETED')
      await prisma.statusEvent.upsert({
        where: { id: eventId },
        create: {
          id: eventId,
          entityType: 'Enrollment',
          entityId: enrollment.id,
          enrollmentId: enrollment.id,
          fromStatus: EnrollmentStatus.ACTIVE,
          toStatus: EnrollmentStatus.COMPLETED,
          actorId: null,
          comment: 'Toutes les activités obligatoires sont achevées (règles d’achèvement de la version 1).',
          createdAt: completedAt ?? new Date(),
        },
        update: {},
      })
    }
  }
  return ids
}

async function seedAttempts(quizId: string, users: SeededUsers, enrollmentIds: Record<string, string>): Promise<void> {
  for (const plan of attemptPlans()) {
    const learner = at(users.learners, plan.learnerIndex, 'apprenant')
    const attemptId = stableId('attempt', QUIZ_KEY, learner.email, 1)
    const startedAt = daysFromNow(-2, 19)
    const data = {
      quizId,
      userId: learner.id,
      enrollmentId: enrollmentIds[learner.email] ?? null,
      number: 1,
      status: AttemptStatus.GRADED,
      score: plan.score,
      maxScore: 14,
      percent: plan.percent,
      passed: plan.percent >= 60,
      startedAt,
      submittedAt: addMinutes(startedAt, 22),
      gradedAt: daysFromNow(-1, 10),
      timeSpentSeconds: 22 * 60,
    }
    await prisma.attempt.upsert({ where: { id: attemptId }, create: { id: attemptId, ...data }, update: data })
    await inBatches(Object.entries(plan.answers), async ([qKey, answer]) => {
      const questionId = stableId('question', QUIZ_KEY, qKey)
      const answerData = {
        response: json(answer.response),
        isCorrect: answer.isCorrect,
        score: answer.score,
        feedback: answer.feedback ?? null,
      }
      await prisma.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId } },
        create: { attemptId, questionId, ...answerData },
        update: answerData,
      })
    })
  }
}

async function seedSubmissions(assignmentId: string, users: SeededUsers, enrollmentIds: Record<string, string>): Promise<void> {
  const text1 =
    'Note de position de la section SYNATEP - Annonce d’une baisse d’activité. 1. Protection de l’outil de production : la section demande la communication des comptes des deux derniers exercices et du carnet de commandes, et propose d’étudier le chômage partiel et l’aménagement du temps de travail avant toute mesure sur les effectifs. 2. Prévention des conflits sociaux : une réunion d’information des salariés est organisée sous quarante-huit heures avec la direction pour couper court aux rumeurs, et un accord de méthode fixant un calendrier de réunions est proposé. 3. Défense des intérêts matériels et moraux : toute mesure devra respecter la procédure d’information-consultation des délégués du personnel, des critères d’ordre objectifs et les indemnités conventionnelles ; la section saisira l’inspection du travail en cas de manquement.'
  const text2 =
    'La section rappelle que la direction ne peut engager de mesures sur les effectifs sans avoir informé et consulté les représentants du personnel. Elle demande la transmission des informations économiques, propose une rencontre avec la direction dans la semaine et s’engage à informer les salariés de manière transparente. Elle exigera le respect du Code du travail et de la convention collective pour toute mesure envisagée.'
  const plans = [
    {
      learnerIndex: 0,
      status: SubmissionStatus.GRADED,
      text: text1,
      fileUrl: null,
      fileName: null,
      submittedAt: daysFromNow(-3, 21),
      grade: {
        score: 16,
        feedback:
          'Excellente note de position, structurée selon les trois piliers et appuyée sur des mesures concrètes. Pour aller plus loin, citez les articles du Code du travail applicables à l’information-consultation.',
        rubricScores: { 'Compréhension du cadre juridique': 4, 'Analyse du cas selon les trois piliers': 7, 'Qualité de la rédaction et de l’argumentation': 5 },
      },
    },
    {
      learnerIndex: 1,
      status: SubmissionStatus.SUBMITTED,
      text: text2,
      fileUrl: null,
      fileName: 'note-de-position-synatep.pdf',
      submittedAt: daysFromNow(-2, 20),
      grade: null,
    },
    {
      learnerIndex: 2,
      status: SubmissionStatus.DRAFT,
      text: 'Brouillon : reprendre les trois piliers et demander les informations économiques à la direction avant la réunion de section.',
      fileUrl: null,
      fileName: null,
      submittedAt: null,
      grade: null,
    },
  ]
  for (const plan of plans) {
    const learner = at(users.learners, plan.learnerIndex, 'apprenant')
    const data = {
      enrollmentId: enrollmentIds[learner.email] ?? null,
      text: plan.text,
      fileUrl: plan.fileUrl,
      fileName: plan.fileName,
      status: plan.status,
      submittedAt: plan.submittedAt,
      isLate: false,
      graderId: plan.grade ? users.formateur.id : null,
    }
    const submission = await prisma.submission.upsert({
      where: { assignmentId_userId: { assignmentId, userId: learner.id } },
      create: { id: stableId('submission', 'm01', learner.email), assignmentId, userId: learner.id, ...data },
      update: data,
      select: { id: true },
    })
    if (plan.grade) {
      const gradeData = {
        score: plan.grade.score,
        maxScore: 20,
        feedback: plan.grade.feedback,
        rubricScores: json(plan.grade.rubricScores),
        gradedAt: daysFromNow(-1, 11),
      }
      await prisma.grade.upsert({
        where: { submissionId: submission.id },
        create: { id: stableId('grade', submission.id), submissionId: submission.id, ...gradeData },
        update: gradeData,
      })
    }
  }
}

async function seedCertificates(
  course: SeededCourse,
  cohortId: string,
  templateId: string,
  users: SeededUsers,
  enrollmentIds: Record<string, string>,
  quizPercentByLearner: Record<number, number>,
): Promise<string[]> {
  const numbers: string[] = []
  for (const [index, verifyCode] of VERIFY_CODES.entries()) {
    const learner = at(users.learners, index, 'apprenant certifié')
    const number = certificateNumber(index + 1)
    const issuedAt = daysFromNow(-1, 12)
    const data = {
      verifyCode,
      kind: CertificateKind.CERTIFICATE,
      status: CertificateStatus.ISSUED,
      userId: learner.id,
      enrollmentId: enrollmentIds[learner.email] ?? null,
      cohortId,
      templateId,
      courseTitle: course.title,
      holderName: learner.name,
      score: quizPercentByLearner[index] ?? null,
      attendanceRate: 100,
      issuedAt,
      expiresAt: new Date(Date.UTC(issuedAt.getUTCFullYear() + 3, issuedAt.getUTCMonth(), issuedAt.getUTCDate())),
      pdfUrl: null,
      metadata: json({ courseCode: course.code, cohortCode: PILOT_COHORT_CODE, sequence: index + 1, issuedBy: 'seed' }),
    }
    await prisma.certificate.upsert({
      where: { number },
      create: { id: stableId('certificate', number), number, ...data },
      update: data,
    })
    numbers.push(number)
  }
  return numbers
}

// -----------------------------------------------------------------------------
// Forum de la cohorte
// -----------------------------------------------------------------------------

async function seedForum(course: SeededCourse, cohortId: string, activityId: string, users: SeededUsers): Promise<string> {
  const slug = 'm01-fondamentaux-cohorte-pilote'
  const forum = await prisma.forum.upsert({
    where: { slug },
    create: {
      id: stableId('forum', slug),
      slug,
      title: 'Forum du module 01 - Cohorte pilote SYNATEP',
      description: 'Espace d’échange modéré entre les participants et la formatrice du module 01.',
      courseId: course.id,
      cohortId,
      activityId,
      isModerated: true,
      isLocked: false,
    },
    update: { courseId: course.id, cohortId, activityId, isModerated: true, isLocked: false },
    select: { id: true },
  })

  const threadId = stableId('forum-thread', slug, 'heritage')
  await prisma.forumThread.upsert({
    where: { id: threadId },
    create: {
      id: threadId,
      forumId: forum.id,
      authorId: users.formateur.id,
      title: 'Quel héritage syndical pour votre section ?',
      isPinned: true,
      createdAt: daysFromNow(-6, 14),
    },
    update: { isPinned: true },
  })
  const posts = [
    {
      key: 'p1',
      authorId: users.formateur.id,
      content:
        'Bienvenue sur le forum de la cohorte. Pour lancer la discussion : quel événement de l’histoire syndicale de votre secteur vous semble le plus marquant, et qu’en retenez-vous pour votre action aujourd’hui ?',
      createdAt: daysFromNow(-6, 14),
    },
    {
      key: 'p2',
      authorId: at(users.learners, 0, 'apprenant').id,
      content:
        'Dans le secteur pétrolier, les négociations de branche des années 2000 ont montré qu’une délégation préparée, avec des chiffres, obtient plus qu’une mobilisation improvisée. C’est ce que je retiens pour notre section : préparer les dossiers avant de revendiquer.',
      createdAt: daysFromNow(-5, 19),
    },
    {
      key: 'p3',
      authorId: at(users.learners, 3, 'apprenant').id,
      content:
        'Je rejoins Marc. J’ajouterais l’importance de la formation des délégués : beaucoup de conflits dans nos ateliers viennent de représentants qui ne connaissent pas la procédure disciplinaire.',
      createdAt: daysFromNow(-4, 8),
    },
  ]
  for (const post of posts) {
    const id = stableId('forum-post', slug, post.key)
    await prisma.forumPost.upsert({
      where: { id },
      create: { id, threadId, authorId: post.authorId, content: post.content, createdAt: post.createdAt },
      update: { content: post.content },
    })
  }
  return forum.id
}

// -----------------------------------------------------------------------------
// Orchestration du pilote
// -----------------------------------------------------------------------------

/**
 * Enrichit M01 en cours pilote complet et crée la cohorte de démonstration SYNATEP.
 */
export async function seedPilotCourse(users: SeededUsers, orgs: SeededOrganizations, catalog: SeededCatalog): Promise<SeededPilot> {
  log.step('Cours pilote M01 et cohorte SYNATEP')
  const course = get(catalog.courses, PILOT_COURSE_CODE, 'cours pilote')
  const legalCategory = get(catalog.categories, 'textes-juridiques', 'catégorie')

  const resourceId = await seedResource(legalCategory.id)
  const extraIds = await seedExtraActivities(course, resourceId)
  log.done('activités complémentaires (vidéo, audio, document, lien, devoir, quiz, questionnaire, forum, séance)')

  await seedQuestionSet(QUIZ_KEY, quizQuestions, users.formateur.id, 'M01 - Fondamentaux')
  await seedQuestionSet(SURVEY_KEY, surveyQuestions, users.coordination.id, 'Satisfaction')
  const quizId = await seedQuiz(get(extraIds, 'quiz'), quizQuestions, QUIZ_KEY, false)
  await seedQuiz(get(extraIds, 'survey'), surveyQuestions, SURVEY_KEY, true)
  const assignmentId = await seedAssignment(get(extraIds, 'assignment'))
  log.done(`quiz (${quizQuestions.length} questions), questionnaire (${surveyQuestions.length}), devoir`)

  const templates = await seedCertificateTemplates(course.id)
  const cohortId = await seedCohort(course, users, orgs)
  const sessionIds = await seedSessions(cohortId, get(extraIds, 'live'), users.formateur)
  const opening = at(sessionSeeds(), 0, 'session d’ouverture')
  await seedAttendance(at(sessionIds, 0, 'session'), users, opening.startsAt)
  const forumId = await seedForum(course, cohortId, get(extraIds, 'forum'), users)
  log.done(`cohorte ${PILOT_COHORT_CODE} : 10 membres, ${sessionIds.length} sessions, présences, forum`)

  const activities = await orderedActivities(course, extraIds)
  const quizPercentByLearner: Record<number, number> = {}
  for (const plan of attemptPlans()) quizPercentByLearner[plan.learnerIndex] = plan.percent
  const enrollmentIds = await seedEnrollments(course, cohortId, users, orgs, activities, quizPercentByLearner)
  await seedAttempts(quizId, users, enrollmentIds)
  await seedSubmissions(assignmentId, users, enrollmentIds)
  const certificateNumbers = await seedCertificates(course, cohortId, templates.courseTemplateId, users, enrollmentIds, quizPercentByLearner)
  log.done(`10 inscriptions (progressions ${COMPLETED_COUNTS.map((c) => Math.round((c / 13) * 100)).join(' / ')} %), 2 tentatives, 3 dépôts, certificats ${certificateNumbers.join(', ')}`)

  return {
    course,
    cohortId,
    cohortCode: PILOT_COHORT_CODE,
    quizActivityId: get(extraIds, 'quiz'),
    assignmentId,
    forumId,
    defaultTemplateId: templates.defaultTemplateId,
    courseTemplateId: templates.courseTemplateId,
    enrollmentIds,
    certificateNumbers,
    sessionIds,
    resourceId,
  }
}
