'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Eye, EyeOff, Flag, Lock, MoreHorizontal, Pin, PinOff, Trash2, Unlock } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormField,
  IconButton,
  Textarea,
  toast,
} from '@fetrag/ui'
import { moderateAction, reportPostAction } from '@/server/learner/forum-actions'

interface ThreadModerationProps {
  forumSlug: string
  threadId: string
  isLocked: boolean
  isPinned: boolean
}

/** Menu de modération d'un fil (formateur, coordination) : épingler, verrouiller, masquer, supprimer. */
export function ThreadModerationMenu({ forumSlug, threadId, isLocked, isPinned }: ThreadModerationProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function run(action: 'lock' | 'unlock' | 'pin' | 'unpin' | 'hide' | 'unhide' | 'delete') {
    startTransition(async () => {
      const result = await moderateAction({ targetType: 'thread', targetId: threadId, action, forumSlug, threadId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Modération appliquée.')
      if (result.data.deleted) router.push(`/forums/${forumSlug}`)
      else router.refresh()
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Actions de modération du fil" icon={MoreHorizontal} variant="outline" size="sm" disabled={pending} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>Modération</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => run(isPinned ? 'unpin' : 'pin')}>
            {isPinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
            <span>{isPinned ? 'Retirer l’épingle' : 'Épingler le fil'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => run(isLocked ? 'unlock' : 'lock')}>
            {isLocked ? <Unlock aria-hidden="true" /> : <Lock aria-hidden="true" />}
            <span>{isLocked ? 'Déverrouiller' : 'Verrouiller les réponses'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => run('hide')}>
            <EyeOff aria-hidden="true" />
            <span>Masquer tous les messages</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden="true" />
            <span>Supprimer le fil</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Supprimer ce fil ?</DialogTitle>
            <DialogDescription>Le fil et toutes ses réponses seront définitivement supprimés. Préférez « Masquer » pour conserver une trace.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={pending}
              onClick={() => {
                setConfirmDelete(false)
                run('delete')
              }}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface PostActionsProps {
  forumSlug: string
  threadId: string
  postId: string
  isHidden: boolean
  canModerate: boolean
  isOwn: boolean
}

/** Actions sur un message : signalement (tous), masquer / démasquer / supprimer (modérateurs). */
export function PostActions({ forumSlug, threadId, postId, isHidden, canModerate, isOwn }: PostActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  function moderate(action: 'hide' | 'unhide' | 'delete') {
    startTransition(async () => {
      const result = await moderateAction({ targetType: 'post', targetId: postId, action, forumSlug, threadId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(action === 'delete' ? 'Message supprimé.' : action === 'hide' ? 'Message masqué.' : 'Message rétabli.')
      router.refresh()
    })
  }

  function report() {
    if (reason.trim().length < 3) {
      setReasonError('Précisez le motif du signalement (3 caractères minimum).')
      return
    }
    setReasonError(null)
    startTransition(async () => {
      const result = await reportPostAction({ postId, forumSlug, threadId, reason: reason.trim() })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Signalement transmis à la modération.')
      setReportOpen(false)
      setReason('')
    })
  }

  return (
    <div className="flex items-center gap-1">
      {!isOwn ? <IconButton label="Signaler ce message" icon={Flag} size="sm" onClick={() => setReportOpen(true)} disabled={pending} /> : null}
      {canModerate ? (
        <>
          <IconButton label={isHidden ? 'Rétablir ce message' : 'Masquer ce message'} icon={isHidden ? Eye : EyeOff} size="sm" onClick={() => moderate(isHidden ? 'unhide' : 'hide')} disabled={pending} />
          <IconButton label="Supprimer ce message" icon={Trash2} size="sm" className="text-danger hover:bg-danger-soft" onClick={() => moderate('delete')} disabled={pending} />
        </>
      ) : null}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Signaler un message</DialogTitle>
            <DialogDescription>Le formateur de la cohorte (ou la coordination) sera notifié et pourra masquer le message.</DialogDescription>
          </DialogHeader>
          <FormField label="Motif" htmlFor={`report-${postId}`} required error={reasonError}>
            <Textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Ex. : propos irrespectueux, hors sujet, contenu publicitaire." />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setReportOpen(false)}>
              Annuler
            </Button>
            <Button type="button" variant="primary" loading={pending} onClick={report} leftIcon={<Flag aria-hidden="true" />}>
              Envoyer le signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
