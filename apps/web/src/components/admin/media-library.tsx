'use client'

import { useActionState, useEffect, useId, useState, useTransition } from 'react'
import { Copy, FileAudio, FileText, FileVideo, Image as ImageIcon, Lock, Pencil, Trash2, UploadCloud } from 'lucide-react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  FormField,
  Input,
  NativeSelect,
  Textarea,
  cn,
  toast,
} from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { deleteContentAction, updateMediaAction, uploadMediaAction } from '@/server/admin/content-actions'
import { ConfirmDialog } from './confirm-dialog'

export interface MediaItem {
  id: string
  url: string
  key: string
  fileName: string
  mimeType: string
  size: number
  alt: string | null
  caption: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  folder: string
  createdAt: string
  uploadedBy: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function KindIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} aria-hidden="true" />
  if (mimeType.startsWith('video/')) return <FileVideo className={className} aria-hidden="true" />
  if (mimeType.startsWith('audio/')) return <FileAudio className={className} aria-hidden="true" />
  return <FileText className={className} aria-hidden="true" />
}

/** Dialogue d'envoi d'un fichier dans la médiathèque. */
function UploadDialog({ folders, defaultFolder }: { folders: string[]; defaultFolder?: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      setError('Sélectionnez un fichier.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await uploadMediaAction(formData)
      if (result.status === 'error') {
        setError(result.message ?? 'Envoi impossible')
        toast.error(result.message ?? 'Envoi impossible')
        return
      }
      toast.success(result.message ?? 'Fichier envoyé')
      setOpen(false)
      window.location.reload()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="primary" size="md" leftIcon={<UploadCloud aria-hidden="true" />}>
          Envoyer un fichier
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Envoyer un fichier</DialogTitle>
          <DialogDescription>Images (12 Mo), documents PDF ou bureautiques, audio et vidéo. Les fichiers privés ne sont accessibles que par lien signé.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          {error ? (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <FormField label="Fichier" htmlFor={`${id}-file`} required>
            <input
              id={`${id}-file`}
              name="file"
              type="file"
              required
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Dossier" htmlFor={`${id}-folder`} hint="Minuscules, chiffres, tirets.">
              <Input id={`${id}-folder`} name="folder" defaultValue={defaultFolder ?? 'uploads'} list={`${id}-folders`} pattern="[a-z0-9][a-z0-9/_-]*" maxLength={80} />
              <datalist id={`${id}-folders`}>
                {folders.map((folder) => (
                  <option key={folder} value={folder} />
                ))}
              </datalist>
            </FormField>
            <FormField label="Visibilité" htmlFor={`${id}-visibility`}>
              <NativeSelect id={`${id}-visibility`} name="visibility" defaultValue="PUBLIC" options={[{ value: 'PUBLIC', label: 'Public' }, { value: 'PRIVATE', label: 'Privé (lien signé)' }]} />
            </FormField>
          </div>
          <FormField label="Texte alternatif" htmlFor={`${id}-alt`} hint="Décrit l’image pour les lecteurs d’écran.">
            <Input id={`${id}-alt`} name="alt" maxLength={300} />
          </FormField>
          <FormField label="Légende" htmlFor={`${id}-caption`}>
            <Input id={`${id}-caption`} name="caption" maxLength={500} />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={pending} loadingLabel="Envoi en cours" leftIcon={<UploadCloud aria-hidden="true" />}>
              Envoyer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Dialogue de modification des métadonnées d'un média. */
function EditDialog({ item, folders }: { item: MediaItem; folders: string[] }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<ActionState, FormData>(updateMediaAction, idleState)

  useEffect(() => {
    if (state.status === 'success') setOpen(false)
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" leftIcon={<Pencil aria-hidden="true" />}>
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Métadonnées du média</DialogTitle>
          <DialogDescription>{item.fileName}</DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="id" value={item.id} />
          <FormStatus state={state} />
          <FormField label="Texte alternatif" htmlFor={`${id}-alt`} hint="Obligatoire pour les images informatives.">
            <Input id={`${id}-alt`} name="alt" defaultValue={item.alt ?? ''} maxLength={300} />
          </FormField>
          <FormField label="Légende" htmlFor={`${id}-caption`}>
            <Textarea id={`${id}-caption`} name="caption" defaultValue={item.caption ?? ''} rows={2} maxLength={500} />
          </FormField>
          <FormField label="Dossier" htmlFor={`${id}-folder`}>
            <Input id={`${id}-folder`} name="folder" defaultValue={item.folder} list={`${id}-folders`} pattern="[a-z0-9][a-z0-9/_-]*" maxLength={80} />
            <datalist id={`${id}-folders`}>
              {folders.map((folder) => (
                <option key={folder} value={folder} />
              ))}
            </datalist>
          </FormField>
          <div className="flex justify-end">
            <SubmitButton variant="primary" pendingLabel="Enregistrement">
              Enregistrer
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function copyToClipboard(value: string, label: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    toast.error('Copie impossible dans ce navigateur')
    return
  }
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success(`${label} copiée`))
    .catch(() => toast.error('Copie impossible'))
}

export interface MediaLibraryProps {
  items: MediaItem[]
  folders: string[]
  defaultFolder?: string
}

/** Médiathèque : grille de fichiers, envoi, édition des métadonnées, copie d'URL et suppression. */
export function MediaLibrary({ items, folders, defaultFolder }: MediaLibraryProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <UploadDialog folders={folders} defaultFolder={defaultFolder} />
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70">
          <EmptyState icon={ImageIcon} title="Aucun média" description="Envoyez des images, documents et vidéos pour les réutiliser dans les pages, actualités et ressources." />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const isImage = item.mimeType.startsWith('image/') && item.visibility === 'PUBLIC'
            return (
              <li key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
                <div className={cn('relative flex aspect-[4/3] items-center justify-center bg-neutral-100', isImage && 'bg-[repeating-conic-gradient(#f2f4f9_0_25%,#ffffff_0_50%)] bg-[length:16px_16px]')}>
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.alt ?? ''} className="size-full object-contain" loading="lazy" />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <KindIcon mimeType={item.mimeType} className="size-6" />
                    </span>
                  )}
                  <div className="absolute left-2 top-2 flex gap-1">
                    <Badge variant="neutral" size="sm">
                      {item.folder}
                    </Badge>
                    {item.visibility === 'PRIVATE' ? (
                      <Badge variant="gold" size="sm">
                        <Lock className="size-3" aria-hidden="true" />
                        Privé
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="truncate text-sm font-semibold text-navy" title={item.fileName}>
                    {item.fileName}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {item.mimeType} · {formatSize(item.size)}
                    {item.uploadedBy ? ` · ${item.uploadedBy}` : ''}
                  </p>
                  {!item.alt && item.mimeType.startsWith('image/') ? <p className="text-xs font-semibold text-gold-700">Texte alternatif manquant</p> : null}
                  <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.visibility === 'PRIVATE' ? item.key : item.url, item.visibility === 'PRIVATE' ? 'Clé' : 'URL')}
                      leftIcon={<Copy aria-hidden="true" />}
                    >
                      {item.visibility === 'PRIVATE' ? 'Copier la clé' : 'Copier l’URL'}
                    </Button>
                    <EditDialog item={item} folders={folders} />
                    <ConfirmDialog
                      trigger={
                        <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                          Supprimer
                        </Button>
                      }
                      title={`Supprimer « ${item.fileName} » ?`}
                      description="Le fichier est retiré du stockage. Les contenus qui l’utilisent afficheront un lien cassé."
                      confirmLabel="Supprimer"
                      destructive
                      onConfirm={() => deleteContentAction('media', item.id)}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
