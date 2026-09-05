'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquarePlus, Reply, Send, X } from 'lucide-react'
import { Alert, AlertDescription, Button, FormField, Input, Textarea, toast } from '@fetrag/ui'
import { createThreadAction, replyAction } from '@/server/learner/forum-actions'
import { initialForumFormState } from '@/server/learner/types'

/** Formulaire de création d'un fil (titre + premier message), repliable. */
export function NewThreadForm({ forumSlug, locked }: { forumSlug: string; locked: boolean }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createThreadAction, initialForumFormState)

  useEffect(() => {
    if (state.status === 'error' && state.message) toast.error(state.message)
  }, [state])

  if (locked) {
    return (
      <Alert variant="info">
        <AlertDescription>Ce forum est verrouillé : la lecture reste possible mais aucun nouveau fil ne peut être ouvert.</AlertDescription>
      </Alert>
    )
  }

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)} leftIcon={<MessageSquarePlus aria-hidden="true" />}>
        Ouvrir un nouveau fil
      </Button>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-soft" aria-label="Nouveau fil de discussion">
      <input type="hidden" name="forumSlug" value={forumSlug} />
      <div className="flex items-center justify-between">
        <h3 className="text-lg">Nouveau fil de discussion</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} leftIcon={<X aria-hidden="true" />}>
          Annuler
        </Button>
      </div>
      <FormField label="Titre" htmlFor="thread-title" required error={state.fieldErrors?.title} hint="Un titre précis aide les autres participants à vous répondre.">
        <Input name="title" defaultValue={state.values?.title ?? ''} maxLength={200} required placeholder="Ex. : Comment préparer une réunion de négociation ?" />
      </FormField>
      <FormField label="Message" htmlFor="thread-content" required error={state.fieldErrors?.content}>
        <Textarea name="content" rows={6} defaultValue={state.values?.content ?? ''} maxLength={20000} required placeholder="Exposez votre question ou votre témoignage. Restez courtois et concret." />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={pending} leftIcon={<Send aria-hidden="true" />}>
          Publier le fil
        </Button>
      </div>
    </form>
  )
}

interface ReplyFormProps {
  forumSlug: string
  threadId: string
  /** Réponse imbriquée à un message donné. */
  parentId?: string | null
  parentAuthor?: string | null
  onCancel?: () => void
  autoFocus?: boolean
}

/** Formulaire de réponse dans un fil (réponse directe ou imbriquée). */
export function ReplyForm({ forumSlug, threadId, parentId = null, parentAuthor = null, onCancel, autoFocus = false }: ReplyFormProps) {
  const router = useRouter()
  const [state, action, pending] = useActionState(replyAction, initialForumFormState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Réponse publiée.')
      formRef.current?.reset()
      router.refresh()
      onCancel?.()
    } else if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const fieldId = parentId ? `reply-${parentId}` : 'reply-thread'
  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft" aria-label={parentAuthor ? `Répondre à ${parentAuthor}` : 'Répondre au fil'}>
      <input type="hidden" name="forumSlug" value={forumSlug} />
      <input type="hidden" name="threadId" value={threadId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <FormField label={parentAuthor ? `Répondre à ${parentAuthor}` : 'Votre réponse'} htmlFor={fieldId} required error={state.fieldErrors?.content}>
        <Textarea name="content" rows={parentId ? 3 : 5} maxLength={20000} required autoFocus={autoFocus} placeholder="Partagez votre expérience ou apportez un complément." />
      </FormField>
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        ) : null}
        <Button type="submit" variant="primary" size="sm" loading={pending} leftIcon={<Reply aria-hidden="true" />}>
          Publier
        </Button>
      </div>
    </form>
  )
}
