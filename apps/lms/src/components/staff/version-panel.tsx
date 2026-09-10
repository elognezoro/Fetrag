'use client'

import Link from 'next/link'
import { useActionState, useId, useState } from 'react'
import { Copy, GitBranch, GitCompare, Lock, Plus, Rocket, Trash2 } from 'lucide-react'
import { Badge, Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormField, Input, Textarea, cn } from '@fetrag/ui'
import { idleState } from '@/server/staff/action-state'
import { createVersion, duplicateVersion, publishVersion, removeVersion, updateVersion } from '@/server/staff/admin-course-actions'
import { ActionButton } from './action-button'
import { ActionAlert, SubmitButton, useActionFeedback } from './action-feedback'
import { fmtDateTime } from './format'

export interface VersionSummary {
  id: string
  version: number
  label: string | null
  changelog: string | null
  isPublished: boolean
  publishedAt: Date | string | null
  createdAt: Date | string
  counts: { modules: number; enrollments: number; cohorts: number }
}

export interface VersionPanelProps {
  courseId: string
  currentVersionId: string | null
  selectedVersionId: string | null
  versions: VersionSummary[]
  canPublish: boolean
  completionRules?: { passScore: number; minAttendanceRate: number; requireAllActivities: boolean } | null
}

/** Gestion des versions d'un cours : liste, création, duplication, publication, suppression, comparaison des journaux. */
export function VersionPanel({ courseId, currentVersionId, selectedVersionId, versions, canPublish, completionRules }: VersionPanelProps) {
  const [compareOpen, setCompareOpen] = useState(false)
  const selected = versions.find((v) => v.id === selectedVersionId) ?? null
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
          <GitBranch className="size-5 text-blue-600" aria-hidden="true" />
          Versions ({versions.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <VersionDialog mode="create" courseId={courseId} />
          {versions.length > 1 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setCompareOpen(true)} leftIcon={<GitCompare aria-hidden="true" />}>
              Comparer
            </Button>
          ) : null}
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {versions.map((v) => {
          const isSelected = v.id === selectedVersionId
          const isCurrent = v.id === currentVersionId
          const locked = v.isPublished || v.counts.enrollments > 0 || v.counts.cohorts > 0
          return (
            <li key={v.id} className={cn('flex flex-col gap-2 rounded-xl border p-3 text-sm', isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-neutral-200')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/admin/cours/${courseId}?version=${v.id}`} className="font-semibold text-navy hover:underline" aria-current={isSelected ? 'true' : undefined}>
                  Version {v.version}
                  {v.label ? ` · ${v.label}` : ''}
                </Link>
                <span className="flex flex-wrap gap-1">
                  {isCurrent ? <Badge variant="success" size="sm">Courante</Badge> : null}
                  {v.isPublished ? <Badge variant="blue" size="sm">Publiée</Badge> : <Badge variant="neutral" size="sm">Brouillon</Badge>}
                  {locked && !v.isPublished ? (
                    <Badge variant="warning" size="sm">
                      <Lock className="size-3" aria-hidden="true" />
                      Suivie
                    </Badge>
                  ) : null}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                {v.counts.modules} module(s) · {v.counts.enrollments} inscription(s) · {v.counts.cohorts} cohorte(s) · créée le {fmtDateTime(v.createdAt)}
                {v.publishedAt ? ` · publiée le ${fmtDateTime(v.publishedAt)}` : ''}
              </p>
              {v.changelog ? <p className="line-clamp-2 text-xs text-neutral-600">{v.changelog}</p> : null}
              <div className="flex flex-wrap gap-1">
                {!v.isPublished && canPublish ? (
                  <ActionButton
                    variant="accent"
                    size="sm"
                    action={() => publishVersion({ courseVersionId: v.id, publishCourse: true })}
                    confirm={{ title: `Publier la version ${v.version}`, description: 'La version est figée et devient la version courante : les nouvelles inscriptions et cohortes la suivront. Les anciennes cohortes gardent leur version.', confirmLabel: 'Publier' }}
                  >
                    <Rocket aria-hidden="true" />
                    Publier
                  </ActionButton>
                ) : null}
                <VersionDialog mode="duplicate" courseId={courseId} version={v} />
                {!locked ? <VersionDialog mode="edit" courseId={courseId} version={v} completionRules={isSelected ? completionRules ?? null : null} /> : null}
                {!locked && versions.length > 1 ? (
                  <ActionButton variant="ghost" size="sm" action={() => removeVersion({ courseVersionId: v.id })} confirm={{ title: `Supprimer la version ${v.version}`, description: 'Le brouillon et sa structure seront supprimés définitivement.', confirmLabel: 'Supprimer', destructive: true }}>
                    <Trash2 aria-hidden="true" />
                    Supprimer
                  </ActionButton>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      {selected && completionRules ? (
        <p className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
          Règles d’achèvement de la version {selected.version} : score minimal {completionRules.passScore} %, assiduité minimale {completionRules.minAttendanceRate} %, {completionRules.requireAllActivities ? 'toutes les activités obligatoires' : 'activités requises listées'}.
        </p>
      ) : null}

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Comparer les journaux de modifications</DialogTitle>
            <DialogDescription>Chaque version documente ce qui a changé par rapport à la précédente.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {versions.map((v) => (
              <article key={v.id} className="rounded-xl border border-neutral-200 p-3 text-sm">
                <h3 className="font-semibold text-navy">
                  Version {v.version}
                  {v.label ? ` · ${v.label}` : ''} {v.id === currentVersionId ? <Badge variant="success" size="sm">Courante</Badge> : null}
                </h3>
                <p className="text-xs text-neutral-500">
                  {v.counts.modules} module(s) · {v.isPublished ? `publiée le ${fmtDateTime(v.publishedAt)}` : 'brouillon'}
                </p>
                <p className="mt-2 whitespace-pre-line text-neutral-700">{v.changelog || 'Aucun journal renseigné.'}</p>
              </article>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Bouton « Créer une nouvelle version » (LMS-17) : duplique la version figée affichée pour la rendre modifiable.
 * Utilisé par l'onglet Structure lorsque la version est publiée ou déjà suivie.
 */
export function DuplicateVersionButton({ courseId, version }: { courseId: string; version: VersionSummary }) {
  return <VersionDialog mode="duplicate" courseId={courseId} version={version} prominent />
}

function VersionDialog({ mode, courseId, version, completionRules, prominent = false }: { mode: 'create' | 'duplicate' | 'edit'; courseId: string; version?: VersionSummary; completionRules?: { passScore: number; minAttendanceRate: number; requireAllActivities: boolean } | null; prominent?: boolean }) {
  const action = mode === 'create' ? createVersion : mode === 'duplicate' ? duplicateVersion : updateVersion
  const [state, formAction] = useActionState(action, idleState)
  const [open, setOpen] = useState(false)
  const id = useId()
  useActionFeedback(state, { onSuccess: () => setOpen(false) })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  const titles = { create: 'Nouvelle version (structure vide)', duplicate: `Dupliquer la version ${version?.version ?? ''}`, edit: `Modifier la version ${version?.version ?? ''}` }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === 'create' ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} leftIcon={<Plus aria-hidden="true" />}>
          Nouvelle version
        </Button>
      ) : mode === 'duplicate' ? (
        <Button type="button" variant={prominent ? 'primary' : 'ghost'} size="sm" onClick={() => setOpen(true)} leftIcon={<Copy aria-hidden="true" />}>
          {prominent ? 'Créer une nouvelle version' : 'Dupliquer'}
        </Button>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Modifier
        </Button>
      )}
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>{mode === 'duplicate' ? 'La structure complète (modules, leçons, activités, quiz) est copiée dans une nouvelle version brouillon.' : 'Libellé, journal des modifications et règles d’achèvement.'}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === 'create' ? <input type="hidden" name="courseId" value={courseId} /> : <input type="hidden" name="courseVersionId" value={version?.id ?? ''} />}
          <ActionAlert state={state} />
          <FormField label="Libellé" htmlFor={`${id}-label`} error={errors.label}>
            <Input name="label" defaultValue={mode === 'edit' ? version?.label ?? '' : ''} maxLength={120} placeholder="Session 2026 · révision juridique" />
          </FormField>
          <FormField label="Journal des modifications" htmlFor={`${id}-changelog`} error={errors.changelog}>
            <Textarea name="changelog" rows={4} maxLength={5000} defaultValue={mode === 'edit' ? version?.changelog ?? '' : ''} placeholder="Mise à jour du Code du travail, nouveau quiz sur la médiation, ajout d'une étude de cas." />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Score minimal (%)" htmlFor={`${id}-pass`} error={errors['completionRules.passScore']}>
              <Input name="passScore" type="number" min={0} max={100} defaultValue={completionRules?.passScore ?? 60} />
            </FormField>
            <FormField label="Assiduité minimale (%)" htmlFor={`${id}-att`} error={errors['completionRules.minAttendanceRate']}>
              <Input name="minAttendanceRate" type="number" min={0} max={100} defaultValue={completionRules?.minAttendanceRate ?? 0} />
            </FormField>
          </div>
          <FormField inline label="Toutes les activités obligatoires doivent être achevées" htmlFor={`${id}-all`}>
            <Checkbox name="requireAllActivities" value="on" defaultChecked={completionRules?.requireAllActivities ?? true} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pendingLabel="Enregistrement...">{mode === 'create' ? 'Créer' : mode === 'duplicate' ? 'Dupliquer' : 'Enregistrer'}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
