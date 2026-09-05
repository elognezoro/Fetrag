'use client'

import { useId, useRef, useState, useTransition } from 'react'
import { FileText, Image as ImageIcon, Link2, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { Button, FormField, Input, cn, toast } from '@fetrag/ui'
import { uploadMediaAction } from '@/server/admin/content-actions'

export interface UploadedFileMeta {
  url: string
  key: string
  fileName: string
  mimeType: string
  size: number
}

export interface FileUploadProps {
  /** Nom du champ caché portant l'URL (ou la clé) du fichier. */
  name: string
  label: string
  defaultValue?: string | null
  /** Métadonnées initiales (ressources). */
  defaultMeta?: Partial<UploadedFileMeta> | null
  /** Types acceptés (attribut `accept`). */
  accept?: string
  folder?: string
  visibility?: 'PUBLIC' | 'PRIVATE'
  hint?: string
  error?: string
  required?: boolean
  /** Ajoute les champs cachés `<name>Name`, `<name>Size`, `<name>Mime` (ressources documentaires). */
  withMeta?: boolean
  /** Autorise la saisie manuelle d'une URL. */
  allowUrl?: boolean
  onUploaded?: (meta: UploadedFileMeta) => void
  className?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/**
 * Champ de fichier relié à la médiathèque : envoi immédiat via `uploadMediaAction`, aperçu image,
 * URL manuelle en repli. La valeur transmise au formulaire parent est l'URL (ou la clé privée) du fichier.
 */
export function FileUpload({
  name,
  label,
  defaultValue,
  defaultMeta,
  accept,
  folder = 'uploads',
  visibility = 'PUBLIC',
  hint,
  error,
  required,
  withMeta = false,
  allowUrl = true,
  onUploaded,
  className,
}: FileUploadProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(defaultValue ?? '')
  const [meta, setMeta] = useState<Partial<UploadedFileMeta> | null>(defaultMeta ?? null)
  const [urlMode, setUrlMode] = useState(false)
  const isImage = (meta?.mimeType ?? '').startsWith('image/') || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(value)

  function handleFile(file: File | null) {
    if (!file) return
    const formData = new FormData()
    formData.set('file', file)
    formData.set('folder', folder)
    formData.set('visibility', visibility)
    startTransition(async () => {
      const result = await uploadMediaAction(formData)
      if (result.status !== 'success' || !result.data) {
        toast.error(result.message ?? 'Envoi impossible')
        return
      }
      const uploaded: UploadedFileMeta = {
        url: String(result.data.url),
        key: String(result.data.key),
        fileName: String(result.data.fileName),
        mimeType: String(result.data.mimeType),
        size: Number(result.data.size),
      }
      // Les objets privés sont référencés par clé (URL signée générée à la lecture).
      setValue(visibility === 'PRIVATE' ? uploaded.key : uploaded.url)
      setMeta(uploaded)
      onUploaded?.(uploaded)
      toast.success(result.message ?? 'Fichier envoyé')
    })
  }

  function clear() {
    setValue('')
    setMeta(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <FormField label={label} htmlFor={`${id}-file`} hint={hint} error={error} required={required} className={className}>
      <div id={`${id}-field`} className="flex flex-col gap-3">
        <input type="hidden" name={name} value={value} />
        {withMeta ? (
          <>
            <input type="hidden" name={`${name}Name`} value={meta?.fileName ?? ''} />
            <input type="hidden" name={`${name}Size`} value={meta?.size ? String(meta.size) : ''} />
            <input type="hidden" name={`${name}Mime`} value={meta?.mimeType ?? ''} />
          </>
        ) : null}
        {value ? (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            {isImage && !value.startsWith('private/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                {isImage ? <ImageIcon className="size-5" aria-hidden="true" /> : <FileText className="size-5" aria-hidden="true" />}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{meta?.fileName ?? value.split('/').pop()}</p>
              <p className="truncate text-xs text-neutral-500">
                {meta?.mimeType ?? (value.startsWith('private/') ? 'Fichier privé' : 'URL')}
                {meta?.size ? ` · ${formatSize(meta.size)}` : ''}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={clear} leftIcon={<Trash2 aria-hidden="true" />}>
              Retirer
            </Button>
          </div>
        ) : null}
        <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center', pending && 'opacity-70')}>
          <label
            htmlFor={`${id}-file`}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-dashed border-blue-300 bg-blue-50/60 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50 focus-within:ring-[3px] focus-within:ring-blue-500/40"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <UploadCloud className="size-4" aria-hidden="true" />}
            {pending ? 'Envoi en cours' : value ? 'Remplacer le fichier' : 'Choisir un fichier'}
            <input
              ref={inputRef}
              id={`${id}-file`}
              type="file"
              accept={accept}
              className="sr-only"
              disabled={pending}
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {allowUrl ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setUrlMode((v) => !v)} leftIcon={<Link2 aria-hidden="true" />}>
              {urlMode ? 'Masquer la saisie d’URL' : 'Saisir une URL'}
            </Button>
          ) : null}
        </div>
        {urlMode ? (
          <Input
            id={`${id}-url`}
            type="url"
            placeholder="https://… ou /brand/…"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setMeta(null)
            }}
            aria-label={`URL du fichier pour ${label}`}
          />
        ) : null}
      </div>
    </FormField>
  )
}
