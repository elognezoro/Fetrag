'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquareText, Send } from 'lucide-react'
import { Button, Checkbox, FormField, Input, Textarea, toast } from '@fetrag/ui'
import { sendCohortMessage } from '@/server/staff/trainer-actions'
import type { FieldErrors } from '@/server/staff/action-state'

export interface CohortMessageFormProps {
  cohortId: string
  memberCount: number
  hasForum: boolean
}

/** Message du formateur aux participants : notification interne, email facultatif, publication dans le forum de cohorte. */
export function CohortMessageForm({ cohortId, memberCount, hasForum }: CohortMessageFormProps) {
  const router = useRouter()
  const id = useId()
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [email, setEmail] = useState(true)
  const [forum, setForum] = useState(hasForum)
  const [errors, setErrors] = useState<FieldErrors>({})

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const state = await sendCohortMessage({ cohortId, title, body, email, forum: forum && hasForum })
      if (state.status === 'success') {
        toast.success(state.message ?? 'Message envoyé')
        setTitle('')
        setBody('')
        setErrors({})
        router.refresh()
      } else if (state.status === 'error') {
        toast.error(state.message)
        setErrors(state.fieldErrors ?? {})
      }
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <MessageSquareText className="size-5 text-green-700" aria-hidden="true" />
        <h3 className="font-display text-lg font-semibold text-navy">Écrire aux participants</h3>
      </div>
      <p className="text-sm text-neutral-600">
        {memberCount} participant(s) recevront une notification dans leur espace. Cochez l’email pour une convocation ou un rappel important.
      </p>
      <FormField label="Objet" htmlFor={`${id}-title`} required error={errors.title}>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Rappel : atelier de négociation vendredi" required />
      </FormField>
      <FormField label="Message" htmlFor={`${id}-body`} required error={errors.body}>
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} maxLength={4000} placeholder="Bonjour à toutes et à tous, ..." required />
      </FormField>
      <div className="flex flex-wrap gap-6">
        <FormField inline label="Envoyer aussi par email" htmlFor={`${id}-email`}>
          <Checkbox checked={email} onCheckedChange={(checked) => setEmail(checked === true)} />
        </FormField>
        <FormField inline label={hasForum ? 'Publier dans le forum de la cohorte' : 'Publier dans le forum (aucun forum pour cette cohorte)'} htmlFor={`${id}-forum`}>
          <Checkbox checked={forum && hasForum} disabled={!hasForum} onCheckedChange={(checked) => setForum(checked === true)} />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="accent" loading={pending} leftIcon={<Send aria-hidden="true" />}>
          Envoyer
        </Button>
      </div>
    </form>
  )
}
