'use server'

import { revalidatePath } from 'next/cache'
import { z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit } from '@fetrag/domain'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { bool, successState, toErrorState } from './form-helpers'

export type QuizSettingsField = 'partialCredit'

const quizSettingsSchema = z.object({ partialCredit: z.boolean() })

/** Paramètres pédagogiques : crédit partiel des questions à choix multiples (SystemSetting `quiz.partialCredit`, settings.manage). */
export async function updateQuizSettingsAction(_previous: ActionState<QuizSettingsField>, formData: FormData): Promise<ActionState<QuizSettingsField>> {
  const parsed = quizSettingsSchema.safeParse({ partialCredit: bool(formData, 'partialCredit') })
  if (!parsed.success) return { status: 'error', message: 'Paramètre invalide.' }
  try {
    const principal = await requireActionCan('settings.manage')
    const ctx = await adminRequestContext()
    const before = await prisma.systemSetting.findUnique({ where: { key: 'quiz.partialCredit' } })
    await prisma.systemSetting.upsert({
      where: { key: 'quiz.partialCredit' },
      create: { key: 'quiz.partialCredit', value: parsed.data.partialCredit, description: 'Crédit partiel des questions à choix multiples lors de la correction automatique des quiz.' },
      update: { value: parsed.data.partialCredit },
    })
    await audit('settings.updated', { type: 'SystemSetting', id: 'quiz.partialCredit' }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { 'quiz.partialCredit': before?.value ?? null },
      after: { 'quiz.partialCredit': parsed.data.partialCredit },
    })
    revalidatePath('/admin/parametres')
    return successState(parsed.data.partialCredit ? 'Crédit partiel activé pour les quiz.' : 'Crédit partiel désactivé : une question à choix multiples n’est comptée que si toutes les bonnes réponses sont cochées.')
  } catch (error) {
    return toErrorState<QuizSettingsField>(error)
  }
}
