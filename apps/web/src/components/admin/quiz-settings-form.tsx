'use client'

import { useActionState } from 'react'
import { Save } from 'lucide-react'
import { Checkbox, Label } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { updateQuizSettingsAction, type QuizSettingsField } from '@/server/admin/settings-quiz-actions'

/** Paramètres pédagogiques : crédit partiel des questions à choix multiples. */
export function QuizSettingsForm({ partialCredit }: { partialCredit: boolean }) {
  const [state, action] = useActionState<ActionState<QuizSettingsField>, FormData>(updateQuizSettingsAction, idleState)
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormStatus state={state} />
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <Checkbox id="partialCredit" name="partialCredit" defaultChecked={partialCredit} className="mt-0.5" />
        <div>
          <Label htmlFor="partialCredit">Crédit partiel aux questions à choix multiples</Label>
          <p className="text-xs text-neutral-500">Activé : chaque bonne réponse cochée rapporte une fraction des points (les mauvaises en retirent). Désactivé : la question vaut tout ou rien.</p>
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary" size="md" pendingLabel="Enregistrement" className="w-full sm:w-auto" leftIcon={<Save aria-hidden="true" />}>
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  )
}
