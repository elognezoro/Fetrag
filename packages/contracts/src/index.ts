import { z } from 'zod'
import { roles } from './roles'

// -----------------------------------------------------------------------------
// Primitives partagées
// -----------------------------------------------------------------------------

export const idSchema = z.string().uuid()
export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (minuscules, chiffres, tirets)')
export const emailSchema = z.string().trim().toLowerCase().email('Adresse email invalide')
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+0-9 ().-]{6,20}$/, 'Numéro de téléphone invalide')
export const localeSchema = z.enum(['fr', 'en'])
export const currencySchema = z.string().length(3).default('XAF')
export const moneySchema = z.number().int().nonnegative()

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  sort: z.string().max(60).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})
export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const cursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
}
export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// -----------------------------------------------------------------------------
// Erreurs API (format unique)
// -----------------------------------------------------------------------------

export const apiErrorCodes = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'PAYMENT_REQUIRED',
  'IDEMPOTENCY_KEY_REQUIRED',
  'PRECONDITION_FAILED',
  'INTERNAL_ERROR',
] as const
export type ApiErrorCode = (typeof apiErrorCodes)[number]

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.enum(apiErrorCodes),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    correlationId: z.string().optional(),
  }),
})
export type ApiError = z.infer<typeof apiErrorSchema>

// -----------------------------------------------------------------------------
// Enums miroirs (identiques à Prisma, utilisables côté client sans @prisma/client)
// -----------------------------------------------------------------------------

export { roles }
export const roleSchema = z.enum(roles)
export type RoleName = z.infer<typeof roleSchema>

export const roleLabels: Record<RoleName, string> = {
  LEARNER: 'Apprenant',
  ORG_MANAGER: "Responsable d'organisation",
  TRAINER: 'Formateur',
  COORDINATOR: 'Coordinateur formation',
  EDITOR: 'Éditeur communication',
  SERVICES_MANAGER: 'Responsable services',
  FINANCE: 'Finance / contrôle',
  SUPPORT: 'Support',
  SUPER_ADMIN: 'Super administrateur',
}

export const privilegedRoles: RoleName[] = ['SUPER_ADMIN', 'COORDINATOR', 'FINANCE', 'EDITOR']

export const scopeTypes = ['GLOBAL', 'ORGANIZATION', 'COURSE', 'COHORT'] as const
export const scopeTypeSchema = z.enum(scopeTypes)
export type ScopeTypeName = z.infer<typeof scopeTypeSchema>

export const contentStatuses = ['DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] as const
export const contentStatusSchema = z.enum(contentStatuses)
export const contentStatusLabels: Record<(typeof contentStatuses)[number], string> = {
  DRAFT: 'Brouillon',
  REVIEW: 'En relecture',
  SCHEDULED: 'Planifié',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
}

export const accessLevels = ['PUBLIC', 'MEMBER', 'ORGANIZATION', 'PREMIUM'] as const
export const accessLevelSchema = z.enum(accessLevels)
export const accessLevelLabels: Record<(typeof accessLevels)[number], string> = {
  PUBLIC: 'Public',
  MEMBER: 'Membres',
  ORGANIZATION: 'Organisation',
  PREMIUM: 'Premium',
}

export const courseModalities = ['ASYNC', 'SYNC', 'HYBRID'] as const
export const courseModalitySchema = z.enum(courseModalities)
export const courseModalityLabels: Record<(typeof courseModalities)[number], string> = {
  ASYNC: 'À distance (asynchrone)',
  SYNC: 'En direct (synchrone)',
  HYBRID: 'Hybride',
}

export const courseLevels = ['INITIATION', 'INTERMEDIAIRE', 'AVANCE'] as const
export const courseLevelLabels: Record<(typeof courseLevels)[number], string> = {
  INITIATION: 'Initiation',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
}

export const enrollmentPolicies = ['SELF', 'APPROVAL', 'ORGANIZATION', 'PAID'] as const
export const enrollmentPolicySchema = z.enum(enrollmentPolicies)

export const enrollmentStatuses = ['PENDING', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED', 'EXPIRED'] as const
export const enrollmentStatusLabels: Record<(typeof enrollmentStatuses)[number], string> = {
  PENDING: 'En attente',
  ACTIVE: 'En cours',
  COMPLETED: 'Terminée',
  SUSPENDED: 'Suspendue',
  CANCELLED: 'Annulée',
  EXPIRED: 'Expirée',
}

export const activityTypes = [
  'TEXT',
  'FILE',
  'LINK',
  'AUDIO',
  'VIDEO',
  'PRESENTATION',
  'QUIZ',
  'ASSIGNMENT',
  'SURVEY',
  'FORUM',
  'LIVE_SESSION',
  'H5P',
  'SCORM',
] as const
export const activityTypeSchema = z.enum(activityTypes)
export type ActivityTypeName = z.infer<typeof activityTypeSchema>
export const activityTypeLabels: Record<ActivityTypeName, string> = {
  TEXT: 'Contenu',
  FILE: 'Document',
  LINK: 'Lien',
  AUDIO: 'Audio',
  VIDEO: 'Vidéo',
  PRESENTATION: 'Présentation',
  QUIZ: 'Évaluation',
  ASSIGNMENT: 'Devoir',
  SURVEY: 'Questionnaire',
  FORUM: 'Forum',
  LIVE_SESSION: 'Séance en direct',
  H5P: 'Contenu interactif',
  SCORM: 'Module SCORM',
}

export const completionRules = ['VIEW', 'TIME_SPENT', 'PASS_SCORE', 'SUBMIT', 'ATTEND', 'MANUAL'] as const
export const completionRuleSchema = z.enum(completionRules)

export const questionTypes = [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'FILL_BLANK',
  'MATCHING',
  'ORDERING',
  'SHORT_ANSWER',
  'ESSAY',
] as const
export const questionTypeSchema = z.enum(questionTypes)
export type QuestionTypeName = z.infer<typeof questionTypeSchema>
export const questionTypeLabels: Record<QuestionTypeName, string> = {
  SINGLE_CHOICE: 'Choix unique',
  MULTIPLE_CHOICE: 'Choix multiples',
  TRUE_FALSE: 'Vrai / Faux',
  FILL_BLANK: 'Texte à trous',
  MATCHING: 'Appariement',
  ORDERING: 'Classement',
  SHORT_ANSWER: 'Réponse courte',
  ESSAY: 'Composition',
}

export const sessionModes = ['IN_PERSON', 'VIRTUAL', 'HYBRID'] as const
export const sessionModeSchema = z.enum(sessionModes)
export const sessionModeLabels: Record<(typeof sessionModes)[number], string> = {
  IN_PERSON: 'Présentiel',
  VIRTUAL: 'Classe virtuelle',
  HYBRID: 'Hybride',
}

export const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const
export const attendanceStatusSchema = z.enum(attendanceStatuses)
export const attendanceStatusLabels: Record<(typeof attendanceStatuses)[number], string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'En retard',
  EXCUSED: 'Excusé',
}

export const cohortStatuses = ['PLANNED', 'OPEN', 'RUNNING', 'CLOSED', 'CANCELLED'] as const
export const cohortStatusLabels: Record<(typeof cohortStatuses)[number], string> = {
  PLANNED: 'Planifiée',
  OPEN: 'Inscriptions ouvertes',
  RUNNING: 'En cours',
  CLOSED: 'Clôturée',
  CANCELLED: 'Annulée',
}

export const trainingRequestStatuses = [
  'DRAFT',
  'SUBMITTED',
  'INFO_REQUESTED',
  'ACCEPTED',
  'REJECTED',
  'RESCHEDULED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const
export const trainingRequestStatusSchema = z.enum(trainingRequestStatuses)
export type TrainingRequestStatusName = z.infer<typeof trainingRequestStatusSchema>
export const trainingRequestStatusLabels: Record<TrainingRequestStatusName, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
  INFO_REQUESTED: 'Complément demandé',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
  RESCHEDULED: 'Autre date proposée',
  SCHEDULED: 'Planifiée',
  IN_PROGRESS: 'Formation en cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
}

/** Transitions autorisées du workflow institutionnel (chapitre 14). */
export const trainingRequestTransitions: Record<TrainingRequestStatusName, TrainingRequestStatusName[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['INFO_REQUESTED', 'ACCEPTED', 'REJECTED', 'RESCHEDULED', 'CANCELLED'],
  INFO_REQUESTED: ['SUBMITTED', 'CANCELLED'],
  RESCHEDULED: ['ACCEPTED', 'SUBMITTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
}

export const certificateStatuses = ['ISSUED', 'REVOKED', 'EXPIRED'] as const
export const certificateStatusLabels: Record<(typeof certificateStatuses)[number], string> = {
  ISSUED: 'Valide',
  REVOKED: 'Révoqué',
  EXPIRED: 'Expiré',
}

export const orderStatuses = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'] as const
export const orderStatusLabels: Record<(typeof orderStatuses)[number], string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  FAILED: 'Échouée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
  PARTIALLY_REFUNDED: 'Partiellement remboursée',
}

export const paymentStatuses = ['INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED'] as const
export const paymentStatusSchema = z.enum(paymentStatuses)
export const paymentStatusLabels: Record<(typeof paymentStatuses)[number], string> = {
  INITIATED: 'Initié',
  PENDING: 'En attente de confirmation',
  SUCCEEDED: 'Réussi',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé',
  REFUNDED: 'Remboursé',
}

export const paymentMethods = ['MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'CASH', 'SPONSORSHIP', 'FREE'] as const
export const paymentMethodSchema = z.enum(paymentMethods)
export const paymentMethodLabels: Record<(typeof paymentMethods)[number], string> = {
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte bancaire',
  BANK_TRANSFER: 'Virement',
  CASH: 'Espèces',
  SPONSORSHIP: 'Prise en charge',
  FREE: 'Gratuit',
}

export const eventKinds = ['EVENT', 'MASTERCLASS', 'WEBINAR', 'ASSEMBLY', 'TRAINING'] as const
export const eventKindLabels: Record<(typeof eventKinds)[number], string> = {
  EVENT: 'Événement',
  MASTERCLASS: 'Master Class',
  WEBINAR: 'Webinaire',
  ASSEMBLY: 'Assemblée',
  TRAINING: 'Formation',
}

export const serviceRequestStatuses = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'] as const
export const serviceRequestStatusLabels: Record<(typeof serviceRequestStatuses)[number], string> = {
  NEW: 'Nouvelle',
  IN_REVIEW: 'En examen',
  IN_PROGRESS: 'En traitement',
  RESOLVED: 'Traitée',
  REJECTED: 'Refusée',
  CLOSED: 'Clôturée',
}

export const formKinds = ['CONTACT', 'SUPPORT', 'SERVICE', 'MEMBERSHIP', 'PARTNERSHIP'] as const
export const formKindSchema = z.enum(formKinds)
export const formKindLabels: Record<(typeof formKinds)[number], string> = {
  CONTACT: 'Contact',
  SUPPORT: 'Assistance',
  SERVICE: 'Demande de service',
  MEMBERSHIP: 'Adhésion / intérêt',
  PARTNERSHIP: 'Partenariat',
}

export const resourceKinds = ['DOCUMENT', 'GUIDE', 'REPORT', 'LEGAL_TEXT', 'FORM', 'VIDEO', 'AUDIO', 'PRESENTATION'] as const
export const resourceKindLabels: Record<(typeof resourceKinds)[number], string> = {
  DOCUMENT: 'Document',
  GUIDE: 'Guide pratique',
  REPORT: 'Rapport',
  LEGAL_TEXT: 'Texte juridique',
  FORM: 'Formulaire',
  VIDEO: 'Vidéo',
  AUDIO: 'Audio',
  PRESENTATION: 'Présentation',
}

export const pillars = ['protection', 'prevention', 'defense'] as const
export const pillarSchema = z.enum(pillars)
export type PillarName = z.infer<typeof pillarSchema>
export const pillarLabels: Record<PillarName, string> = {
  protection: "Protection de l'outil de production",
  prevention: 'Prévention des conflits sociaux',
  defense: 'Défense des intérêts matériels et moraux',
}

// -----------------------------------------------------------------------------
// Formulaires publics (WEB-06)
// -----------------------------------------------------------------------------

export const contactFormSchema = z.object({
  kind: formKindSchema.default('CONTACT'),
  fullName: z.string().trim().min(2, 'Nom trop court').max(120),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  subject: z.string().trim().min(3).max(160).optional(),
  message: z.string().trim().min(10, 'Message trop court (10 caractères minimum)').max(4000),
  organization: z.string().trim().max(160).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter le traitement de vos données' }) }),
  /** Champ anti-robot (doit rester vide). */
  website: z.string().max(0).optional(),
})
export type ContactFormInput = z.infer<typeof contactFormSchema>

export const membershipFormSchema = contactFormSchema.extend({
  kind: z.literal('MEMBERSHIP').default('MEMBERSHIP'),
  sector: z.string().trim().max(120).optional(),
  employer: z.string().trim().max(160).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  interest: z.enum(['adhesion', 'information', 'creation-section', 'orientation']).default('information'),
})

export const partnershipFormSchema = contactFormSchema.extend({
  kind: z.literal('PARTNERSHIP').default('PARTNERSHIP'),
  organization: z.string().trim().min(2).max(160),
  partnershipType: z.enum(['institutionnel', 'formation', 'financier', 'media', 'autre']).default('autre'),
})

export const serviceRequestFormSchema = z.object({
  serviceId: idSchema,
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  organization: z.string().trim().max(160).optional(),
  message: z.string().trim().max(4000).optional(),
  payload: z.record(z.unknown()).optional(),
  consent: z.literal(true),
})

export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true),
  website: z.string().max(0).optional(),
})

// -----------------------------------------------------------------------------
// Authentification (mode local)
// -----------------------------------------------------------------------------

export const passwordSchema = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .max(128)
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[0-9]/, 'Au moins un chiffre')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
  callbackUrl: z.string().optional(),
})

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2).max(60),
    lastName: z.string().trim().min(2).max(60),
    email: emailSchema,
    phone: phoneSchema.optional().or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
    organizationName: z.string().trim().max(160).optional(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter les conditions' }) }),
    newsletter: z.boolean().default(false),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Les mots de passe ne correspondent pas',
  })
export type RegisterInput = z.infer<typeof registerSchema>

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  phone: phoneSchema.optional().or(z.literal('')),
  jobTitle: z.string().trim().max(120).optional(),
  employer: z.string().trim().max(160).optional(),
  locale: localeSchema.default('fr'),
})

// -----------------------------------------------------------------------------
// LMS - inscriptions, progression, évaluations
// -----------------------------------------------------------------------------

export const completionRulesSchema = z.object({
  requireAllActivities: z.boolean().default(true),
  requiredActivityIds: z.array(idSchema).default([]),
  passScore: z.number().int().min(0).max(100).default(60),
  minAttendanceRate: z.number().int().min(0).max(100).default(0),
})
export type CompletionRules = z.infer<typeof completionRulesSchema>

export const certificateCriteriaSchema = z.object({
  minScore: z.number().int().min(0).max(100).default(60),
  minAttendanceRate: z.number().int().min(0).max(100).default(0),
  requireCompletion: z.boolean().default(true),
})
export type CertificateCriteria = z.infer<typeof certificateCriteriaSchema>

export const progressReportSchema = z.object({
  activityId: idSchema,
  timeSpentSeconds: z.number().int().min(0).max(60 * 60 * 6).default(0),
  completed: z.boolean().optional(),
  progressData: z.record(z.unknown()).optional(),
})
export type ProgressReport = z.infer<typeof progressReportSchema>

/** Réponse à une question selon son type. */
export const answerResponseSchema = z.union([
  z.object({ type: z.literal('choice'), optionIds: z.array(idSchema) }),
  z.object({ type: z.literal('boolean'), value: z.boolean() }),
  z.object({ type: z.literal('text'), value: z.string().max(20000) }),
  z.object({ type: z.literal('blanks'), values: z.array(z.string().max(200)) }),
  z.object({ type: z.literal('matching'), pairs: z.array(z.object({ optionId: idSchema, value: z.string() })) }),
  z.object({ type: z.literal('ordering'), optionIds: z.array(idSchema) }),
])
export type AnswerResponse = z.infer<typeof answerResponseSchema>

export const submitAttemptSchema = z.object({
  attemptId: idSchema,
  answers: z.array(z.object({ questionId: idSchema, response: answerResponseSchema })),
})

export const submissionInputSchema = z.object({
  assignmentId: idSchema,
  text: z.string().max(50000).optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().max(255).optional(),
  submit: z.boolean().default(false),
})

export const gradeInputSchema = z.object({
  submissionId: idSchema,
  score: z.number().int().min(0),
  feedback: z.string().max(5000).optional(),
  rubricScores: z.record(z.number()).optional(),
})

export const attendanceInputSchema = z.object({
  sessionId: idSchema,
  entries: z.array(
    z.object({
      userId: idSchema,
      status: attendanceStatusSchema,
      note: z.string().max(300).optional(),
    }),
  ),
})

// -----------------------------------------------------------------------------
// Workflow institutionnel (chapitre 14)
// -----------------------------------------------------------------------------

export const trainingRequestParticipantSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  jobTitle: z.string().trim().max(120).optional(),
})

export const trainingRequestInputSchema = z.object({
  organizationId: idSchema,
  contactName: z.string().trim().min(2).max(120),
  contactRole: z.string().trim().max(120).optional(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema.optional().or(z.literal('')),
  courseIds: z.array(idSchema).min(1, 'Sélectionnez au moins un module'),
  participants: z.array(trainingRequestParticipantSchema).min(1, 'Désignez au moins un participant'),
  preferredStart: z.coerce.date().optional(),
  preferredMode: sessionModeSchema.default('HYBRID'),
  motivation: z.string().trim().max(3000).optional(),
  commitmentsAccepted: z.literal(true, { errorMap: () => ({ message: 'Les engagements doivent être acceptés' }) }),
})
export type TrainingRequestInput = z.infer<typeof trainingRequestInputSchema>

export const trainingRequestDecisionSchema = z.object({
  requestId: idSchema,
  decision: z.enum(['INFO_REQUESTED', 'ACCEPTED', 'REJECTED', 'RESCHEDULED', 'SCHEDULED', 'CANCELLED']),
  comment: z.string().trim().max(3000).optional(),
  proposedStart: z.coerce.date().optional(),
  proposedMode: sessionModeSchema.optional(),
  cohortName: z.string().trim().max(160).optional(),
  trainerId: idSchema.optional(),
})

// -----------------------------------------------------------------------------
// Commerce
// -----------------------------------------------------------------------------

export const checkoutInputSchema = z.object({
  offerId: idSchema,
  quantity: z.number().int().min(1).max(50).default(1),
  couponCode: z.string().trim().max(40).optional(),
  method: paymentMethodSchema.default('MOBILE_MONEY'),
  phoneNumber: phoneSchema.optional().or(z.literal('')),
  idempotencyKey: z.string().min(8).max(120),
})
export type CheckoutInput = z.infer<typeof checkoutInputSchema>

export const paymentWebhookSchema = z.object({
  provider: z.string(),
  eventType: z.string(),
  externalId: z.string(),
  paymentRef: z.string(),
  status: paymentStatusSchema,
  amount: moneySchema.optional(),
  currency: currencySchema.optional(),
  raw: z.record(z.unknown()).optional(),
})

// -----------------------------------------------------------------------------
// Événements internes typés (chapitre 17)
// -----------------------------------------------------------------------------

export const domainEventNames = [
  'user.registered',
  'training.request.submitted',
  'training.request.approved',
  'training.request.rejected',
  'training.request.info_requested',
  'enrollment.created',
  'course.completed',
  'quiz.graded',
  'assignment.submitted',
  'assignment.graded',
  'session.attendance.recorded',
  'certificate.issued',
  'certificate.revoked',
  'order.created',
  'payment.succeeded',
  'payment.failed',
  'payment.refunded',
  'event.registered',
  'content.published',
  'form.submitted',
] as const
export const domainEventNameSchema = z.enum(domainEventNames)
export type DomainEventName = z.infer<typeof domainEventNameSchema>

export const domainEventSchema = z.object({
  name: domainEventNameSchema,
  occurredAt: z.coerce.date(),
  actorId: idSchema.optional(),
  correlationId: z.string().optional(),
  payload: z.record(z.unknown()),
})
export type DomainEvent = z.infer<typeof domainEventSchema>

// -----------------------------------------------------------------------------
// DTO publics (catalogue synchronisé vitrine <- LMS)
// -----------------------------------------------------------------------------

export const publicCourseSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  code: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  summary: z.string().nullable(),
  pillar: pillarSchema.nullable(),
  modality: courseModalitySchema,
  level: z.enum(courseLevels),
  durationHours: z.number().int(),
  isFree: z.boolean(),
  priceAmount: z.number().int().nullable(),
  currency: z.string(),
  coverImageUrl: z.string().nullable(),
  objectives: z.array(z.string()),
  publishedAt: z.coerce.date().nullable(),
})
export type PublicCourse = z.infer<typeof publicCourseSchema>

export const certificateVerificationSchema = z.object({
  valid: z.boolean(),
  status: z.enum(certificateStatuses).nullable(),
  number: z.string().nullable(),
  holderName: z.string().nullable(),
  courseTitle: z.string().nullable(),
  issuedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  kind: z.enum(['CERTIFICATE', 'ATTESTATION']).nullable(),
})
export type CertificateVerification = z.infer<typeof certificateVerificationSchema>

export { z }
export * from './guides'
export * from './guides-assessment'
