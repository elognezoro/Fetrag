'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Archive, CalendarClock, ChevronDown, Eye, FileEdit, MoreHorizontal, Pencil, Send, Trash2, Undo2, Upload } from 'lucide-react'
import { contentStatusLabels } from '@fetrag/contracts'
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
  Input,
  toast,
} from '@fetrag/ui'
import { deleteContentAction, transitionContentAction, type DeletableEntity, type PublishableEntity } from '@/server/admin/content-actions'
import { ConfirmDialog } from './confirm-dialog'

type ContentStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'

/** Transitions du workflow éditorial (miroir de `publishing.contentTransitions`). */
const transitions: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['REVIEW', 'SCHEDULED', 'PUBLISHED'],
  REVIEW: ['DRAFT', 'SCHEDULED', 'PUBLISHED'],
  SCHEDULED: ['DRAFT', 'REVIEW', 'PUBLISHED'],
  PUBLISHED: ['ARCHIVED', 'DRAFT'],
  ARCHIVED: ['DRAFT'],
}

const transitionMeta: Record<ContentStatus, { label: string; icon: typeof Send }> = {
  DRAFT: { label: 'Repasser en brouillon', icon: Undo2 },
  REVIEW: { label: 'Envoyer en relecture', icon: Send },
  SCHEDULED: { label: 'Planifier la publication', icon: CalendarClock },
  PUBLISHED: { label: 'Publier', icon: Upload },
  ARCHIVED: { label: 'Archiver', icon: Archive },
}

export interface StatusActionsProps {
  entity: PublishableEntity
  id: string
  title: string
  status: string
  /** Lien d'édition (affiché en premier). */
  editHref?: string
  /** Lien de prévisualisation (public avec `?preview=1`). */
  previewHref?: string
  /** Droits du principal (calculés côté serveur). */
  canWrite: boolean
  canPublish: boolean
  /** Planification disponible (pages, actualités). */
  supportsScheduling?: boolean
  /** Redirection après suppression (sinon rafraîchissement). */
  afterDeleteHref?: string
  /** Variante compacte (icône seule) pour les tableaux. */
  compact?: boolean
}

/** Menu d'actions d'un contenu : éditer, prévisualiser, transitions du workflow (avec planification), supprimer. */
export function StatusActions({ entity, id, title, status, editHref, previewHref, canWrite, canPublish, supportsScheduling = false, afterDeleteHref, compact = true }: StatusActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const current = (status.toUpperCase() as ContentStatus) in transitions ? (status.toUpperCase() as ContentStatus) : 'DRAFT'
  const available = transitions[current].filter((to) => {
    if (to === 'SCHEDULED' && !supportsScheduling) return false
    const needsPublish = to === 'PUBLISHED' || to === 'ARCHIVED'
    return needsPublish ? canPublish : canWrite
  })

  function run(to: ContentStatus, when?: string) {
    startTransition(async () => {
      const result = await transitionContentAction(entity, id, to, when ? new Date(when).toISOString() : undefined)
      if (result.status === 'error') {
        toast.error(result.message ?? 'Transition impossible')
        return
      }
      toast.success(result.message ?? 'Statut mis à jour')
      setScheduleOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {compact ? (
            <IconButton label={`Actions pour ${title}`} icon={MoreHorizontal} size="sm" variant="ghost" disabled={pending} />
          ) : (
            <Button type="button" variant="outline" size="sm" loading={pending} loadingLabel="Mise à jour" rightIcon={<ChevronDown aria-hidden="true" />}>
              Actions
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{contentStatusLabels[current]}</DropdownMenuLabel>
          {editHref ? (
            <DropdownMenuItem asChild>
              <Link href={editHref}>
                <Pencil aria-hidden="true" />
                Modifier
              </Link>
            </DropdownMenuItem>
          ) : null}
          {previewHref ? (
            <DropdownMenuItem asChild>
              <a href={previewHref} target="_blank" rel="noopener noreferrer">
                <Eye aria-hidden="true" />
                Prévisualiser
              </a>
            </DropdownMenuItem>
          ) : null}
          {available.length > 0 ? <DropdownMenuSeparator /> : null}
          {available.map((to) => {
            const meta = transitionMeta[to]
            const Icon = meta.icon
            return (
              <DropdownMenuItem
                key={to}
                onSelect={(event) => {
                  event.preventDefault()
                  if (to === 'SCHEDULED') setScheduleOpen(true)
                  else run(to)
                }}
              >
                <Icon aria-hidden="true" />
                {meta.label}
              </DropdownMenuItem>
            )
          })}
          {canWrite ? (
            <>
              <DropdownMenuSeparator />
              <ConfirmDialog
                trigger={
                  <DropdownMenuItem destructive onSelect={(event) => event.preventDefault()}>
                    <Trash2 aria-hidden="true" />
                    Supprimer
                  </DropdownMenuItem>
                }
                title={`Supprimer « ${title} » ?`}
                description="Cette action est définitive. Les contenus publiés ne peuvent être supprimés que par un rôle disposant du droit de publication."
                confirmLabel="Supprimer définitivement"
                destructive
                onConfirm={() => deleteContentAction(entity as DeletableEntity, id)}
                redirectTo={afterDeleteHref}
              />
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Planifier la publication</DialogTitle>
            <DialogDescription>Le contenu sera publié automatiquement à la date choisie (heure de Libreville).</DialogDescription>
          </DialogHeader>
          <FormField label="Date et heure de publication" htmlFor={`schedule-${id}`} required hint="La date doit être dans le futur.">
            <Input id={`schedule-${id}`} type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setScheduleOpen(false)}>
              Annuler
            </Button>
            <Button type="button" variant="primary" onClick={() => run('SCHEDULED', scheduledAt)} disabled={!scheduledAt} loading={pending} leftIcon={<FileEdit aria-hidden="true" />}>
              Planifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
