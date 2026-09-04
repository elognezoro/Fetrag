import { prisma } from '@fetrag/db'
import { z } from 'zod'

/** Lit un paramètre système (SystemSetting) validé par un schéma, avec valeur par défaut. */
export async function getSetting<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key } })
    if (!row) return fallback
    const parsed = schema.safeParse(row.value)
    return parsed.success ? parsed.data : fallback
  } catch {
    return fallback
  }
}

/** Limite de participants par demande de formation (chapitre 14 : paramètre configurable). */
export async function trainingParticipantLimit(): Promise<number> {
  return getSetting('training.participantLimit', z.coerce.number().int().min(1).max(500), 10)
}

/** Paramètres LMS divers avec leurs valeurs par défaut. */
export const settingKeys = {
  participantLimit: 'training.participantLimit',
  certificateSequence: 'certificates.sequence',
  quizPartialCredit: 'quiz.partialCredit',
} as const
