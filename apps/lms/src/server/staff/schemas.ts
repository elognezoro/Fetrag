/**
 * Schémas Zod propres aux formulaires des espaces institutionnels.
 * Module pur (zod + contracts) : importable par les composants client et les Server Actions.
 * Les schémas métier de référence restent ceux de @fetrag/contracts et @fetrag/lms-core.
 */
import {
  attendanceStatusSchema,
  emailSchema,
  idSchema,
  phoneSchema,
  sessionModeSchema,
  trainingRequestParticipantSchema,
  z,
} from '@fetrag/contracts'

// -----------------------------------------------------------------------------
// Assistant de demande de formation (chapitre 14)
// -----------------------------------------------------------------------------

export const wizardParticipantSchema = trainingRequestParticipantSchema.extend({
  email: z.union([emailSchema, z.literal('')]).default(''),
  phone: z.union([phoneSchema, z.literal('')]).default(''),
  jobTitle: z.string().trim().max(120).default(''),
})
export type WizardParticipant = z.infer<typeof wizardParticipantSchema>

/** Valeurs du formulaire de l'assistant (chaînes vides autorisées pour les champs facultatifs). */
export const wizardFormSchema = z.object({
  organizationId: idSchema,
  contactName: z.string().trim().min(2, 'Indiquez le nom de la personne ressource').max(120),
  contactRole: z.string().trim().max(120).default(''),
  contactEmail: emailSchema,
  contactPhone: z.union([phoneSchema, z.literal('')]).default(''),
  courseIds: z.array(idSchema).min(1, 'Sélectionnez au moins un module'),
  participants: z.array(wizardParticipantSchema).min(1, 'Désignez au moins un participant'),
  preferredStart: z.string().default(''),
  preferredMode: sessionModeSchema.default('HYBRID'),
  motivation: z.string().trim().max(3000, '3000 caractères au plus').default(''),
  commitmentsAccepted: z.boolean().default(false),
})
export type WizardFormValues = z.infer<typeof wizardFormSchema>
export type WizardFormInput = z.input<typeof wizardFormSchema>

/** Champs validés à chaque étape de l'assistant. */
export const wizardStepFields: Record<number, Array<keyof WizardFormValues>> = {
  1: ['organizationId', 'contactName', 'contactRole', 'contactEmail', 'contactPhone'],
  2: ['courseIds'],
  3: ['participants'],
  4: ['preferredStart', 'preferredMode', 'motivation'],
  5: ['commitmentsAccepted'],
  6: [],
}

/** Brouillon partiel enregistré à chaque étape (helper local, voir organizations.ts). */
export const draftRequestSchema = wizardFormSchema
  .partial()
  .extend({
    requestId: idSchema.optional(),
    organizationId: idSchema,
    contactName: z.string().trim().min(2).max(120),
    contactEmail: emailSchema,
    courseIds: z.array(idSchema).default([]),
    participants: z.array(wizardParticipantSchema).default([]),
  })
export type DraftRequestInput = z.input<typeof draftRequestSchema>

/** Soumission finale : brouillon existant (optionnel) + valeurs complètes. */
export const submitRequestSchema = wizardFormSchema.extend({
  requestId: idSchema.optional(),
  commitmentsAccepted: z.literal(true, { errorMap: () => ({ message: 'Les engagements doivent être acceptés' }) }),
})
export type SubmitRequestInput = z.input<typeof submitRequestSchema>

export const cancelRequestSchema = z.object({
  requestId: idSchema,
  reason: z.string().trim().max(1000).optional(),
})

/** Découpe des lignes collées « Nom;email;téléphone » (séparateurs ; , ou tabulation). */
export function parseParticipantLines(text: string): WizardParticipant[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [fullName = '', email = '', phone = '', jobTitle = ''] = line.split(/[;\t,]/).map((c) => c.trim())
      return { fullName, email: email.toLowerCase(), phone, jobTitle }
    })
    .filter((p) => p.fullName.length >= 2)
}

// -----------------------------------------------------------------------------
// Formateur
// -----------------------------------------------------------------------------

export const attendanceFormSchema = z.object({
  sessionId: idSchema,
  entries: z.array(z.object({ userId: idSchema, status: attendanceStatusSchema, note: z.string().max(300).optional() })).min(1, 'Aucun participant à émarger'),
})

export const cohortMessageSchema = z.object({
  cohortId: idSchema,
  title: z.string().trim().min(3, 'Titre trop court').max(160),
  body: z.string().trim().min(10, 'Message trop court (10 caractères minimum)').max(4000),
  email: z.boolean().default(false),
  /** Publie aussi le message comme fil dans le forum de cohorte. */
  forum: z.boolean().default(false),
})
export type CohortMessageInput = z.input<typeof cohortMessageSchema>

// -----------------------------------------------------------------------------
// Coordination / administration
// -----------------------------------------------------------------------------

export const organizationFormSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(160),
  acronym: z.string().trim().max(30).optional(),
  sector: z.string().trim().max(120).optional(),
  description: z.string().trim().max(3000).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(120).optional(),
  phone: z.union([phoneSchema, z.literal('')]).optional(),
  email: z.union([emailSchema, z.literal('')]).optional(),
  website: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
  isAffiliate: z.boolean().default(true),
  isActive: z.boolean().default(true),
  memberCount: z.number().int().min(0).max(1000000).optional(),
})
export type OrganizationFormInput = z.input<typeof organizationFormSchema>

export const organizationManagerSchema = z.object({
  organizationId: idSchema,
  email: emailSchema,
  title: z.string().trim().max(120).optional(),
  isManager: z.boolean().default(true),
})

export const roleGrantSchema = z.object({
  userId: idSchema,
  role: z.enum(['LEARNER', 'ORG_MANAGER', 'TRAINER', 'COORDINATOR', 'EDITOR', 'SERVICES_MANAGER', 'FINANCE', 'SUPPORT', 'SUPER_ADMIN']),
  scopeType: z.enum(['GLOBAL', 'ORGANIZATION', 'COURSE', 'COHORT']).default('GLOBAL'),
  scopeId: z.union([idSchema, z.literal('')]).optional(),
  expiresAt: z.string().optional(),
})

export const settingSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9_.-]+$/i, 'Clé invalide (lettres, chiffres, points, tirets)'),
  value: z.string().max(20000),
  description: z.string().trim().max(500).optional(),
})

/** Ligne CSV de la banque de questions : type;question;points;catégorie;options (A|B|C);correctes (index séparés par |). */
export function parseQuestionCsv(text: string): unknown[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const rows = lines[0]?.toLowerCase().startsWith('type') ? lines.slice(1) : lines
  return rows.map((line) => {
    const cells = line.split(';').map((c) => c.trim())
    const [type = '', prompt = '', pointsRaw = '1', category = '', optionsRaw = '', correctRaw = ''] = cells
    const options = optionsRaw ? optionsRaw.split('|').map((o) => o.trim()).filter(Boolean) : []
    const correct = new Set(
      correctRaw
        .split('|')
        .map((c) => Number.parseInt(c.trim(), 10) - 1)
        .filter((n) => Number.isInteger(n) && n >= 0),
    )
    const upper = type.toUpperCase()
    const config =
      upper === 'TRUE_FALSE'
        ? { answer: correctRaw.trim().toLowerCase().startsWith('v') || correctRaw.trim() === '1' }
        : upper === 'SHORT_ANSWER'
          ? { accepted: options.length ? options : [correctRaw].filter(Boolean) }
          : upper === 'FILL_BLANK'
            ? { text: prompt, answers: options.map((o) => o.split('/').map((s) => s.trim()).filter(Boolean)) }
            : {}
    return {
      type: upper,
      prompt,
      points: Number.parseInt(pointsRaw, 10) || 1,
      category: category || undefined,
      config,
      options:
        upper === 'SINGLE_CHOICE' || upper === 'MULTIPLE_CHOICE'
          ? options.map((label, index) => ({ label, isCorrect: correct.has(index), position: index }))
          : upper === 'ORDERING'
            ? options.map((label, index) => ({ label, position: index }))
            : upper === 'MATCHING'
              ? options.map((pair, index) => {
                  const [label = '', matchValue = ''] = pair.split('=').map((s) => s.trim())
                  return { label, matchValue, position: index }
                })
              : [],
    }
  })
}
