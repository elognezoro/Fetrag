'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Label,
  cn,
  toast,
} from '@fetrag/ui'
import { uploadMediaAction } from '@/server/admin/content-actions'

export interface RichTextEditorProps {
  name: string
  label: string
  defaultValue?: string | null
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  /** Hauteur minimale de la zone d'édition. */
  minHeightClassName?: string
  /** Dossier de la médiathèque pour les images insérées. */
  folder?: string
}

interface ToolButtonProps {
  label: string
  icon: LucideIcon
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolButton({ label, icon: Icon, active, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 hover:text-navy focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 disabled:opacity-40',
        active && 'bg-blue-50 text-blue-700',
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}

interface ImageDialogProps {
  editor: Editor
  folder: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Insertion d'image : URL ou envoi vers la médiathèque (Server Action). */
function ImageDialog({ editor, folder, open, onOpenChange }: ImageDialogProps) {
  const id = useId()
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [pending, startTransition] = useTransition()

  function insert(src: string) {
    if (!src) return
    editor.chain().focus().setImage({ src, alt }).run()
    setUrl('')
    setAlt('')
    onOpenChange(false)
  }

  function upload(file: File | null) {
    if (!file) return
    const formData = new FormData()
    formData.set('file', file)
    formData.set('folder', folder)
    formData.set('visibility', 'PUBLIC')
    formData.set('alt', alt)
    startTransition(async () => {
      const result = await uploadMediaAction(formData)
      if (result.status !== 'success' || !result.data) {
        toast.error(result.message ?? 'Envoi impossible')
        return
      }
      insert(String(result.data.url))
      toast.success('Image insérée')
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Insérer une image</DialogTitle>
          <DialogDescription>Envoyez une image dans la médiathèque ou indiquez son URL. Le texte alternatif est requis pour l’accessibilité.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <FormField label="Texte alternatif" htmlFor={`${id}-alt`} required hint="Décrit l’image pour les lecteurs d’écran.">
            <Input id={`${id}-alt`} value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={200} />
          </FormField>
          <div>
            <Label htmlFor={`${id}-file`}>Fichier image</Label>
            <input
              id={`${id}-file`}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              disabled={pending || !alt}
              onChange={(event) => upload(event.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {!alt ? <p className="mt-1 text-xs text-neutral-500">Renseignez d’abord le texte alternatif.</p> : null}
          </div>
          <FormField label="Ou URL de l’image" htmlFor={`${id}-url`}>
            <Input id={`${id}-url`} type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" />
          </FormField>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" variant="primary" disabled={!url || !alt || pending} onClick={() => insert(url)} leftIcon={pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : undefined}>
            Insérer par URL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Éditeur riche TipTap (StarterKit, liens, images, tableaux, souligné, placeholder) : barre d'outils lucide,
 * sortie HTML transmise au formulaire parent par un champ caché (assainie côté serveur par `sanitizeHtml`).
 */
export function RichTextEditor({ name, label, defaultValue, placeholder = 'Rédigez le contenu…', hint, error, required, minHeightClassName = 'min-h-[18rem]', folder = 'contenus' }: RichTextEditorProps) {
  const id = useId()
  const [html, setHtml] = useState(defaultValue ?? '')
  const [imageOpen, setImageOpen] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue ?? '',
    editorProps: {
      attributes: {
        id: `${id}-editor`,
        class: cn('prose-fetrag max-w-none px-4 py-3 outline-none', minHeightClassName),
        'aria-multiline': 'true',
        role: 'textbox',
        'aria-label': label,
      },
    },
    onUpdate: ({ editor: instance }) => setHtml(instance.isEmpty ? '' : instance.getHTML()),
  })

  // Synchronise la valeur initiale si le contenu par défaut change après l'hydratation (rechargement d'une révision).
  useEffect(() => {
    if (!editor || defaultValue === undefined || defaultValue === null) return
    if (editor.getHTML() !== defaultValue && editor.isEmpty && defaultValue !== '') {
      editor.commands.setContent(defaultValue, false)
      setHtml(defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  function setLink() {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const value = window.prompt('Adresse du lien (https://… ou /chemin)', previous ?? 'https://')
    if (value === null) return
    if (value.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: value.trim() }).run()
  }

  const ready = Boolean(editor)

  return (
    <FormField label={label} htmlFor={`${id}-editor`} hint={hint} error={error} required={required}>
      <div id={`${id}-wrapper`} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft focus-within:ring-[3px] focus-within:ring-blue-500/40">
        <input type="hidden" name={name} value={html} />
        <div role="toolbar" aria-label="Mise en forme" className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
          <ToolButton label="Gras" icon={Bold} active={editor?.isActive('bold')} disabled={!ready} onClick={() => editor?.chain().focus().toggleBold().run()} />
          <ToolButton label="Italique" icon={Italic} active={editor?.isActive('italic')} disabled={!ready} onClick={() => editor?.chain().focus().toggleItalic().run()} />
          <ToolButton label="Souligné" icon={UnderlineIcon} active={editor?.isActive('underline')} disabled={!ready} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-neutral-200" />
          <ToolButton label="Titre de niveau 2" icon={Heading2} active={editor?.isActive('heading', { level: 2 })} disabled={!ready} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
          <ToolButton label="Titre de niveau 3" icon={Heading3} active={editor?.isActive('heading', { level: 3 })} disabled={!ready} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
          <ToolButton label="Liste à puces" icon={List} active={editor?.isActive('bulletList')} disabled={!ready} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
          <ToolButton label="Liste numérotée" icon={ListOrdered} active={editor?.isActive('orderedList')} disabled={!ready} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
          <ToolButton label="Citation" icon={Quote} active={editor?.isActive('blockquote')} disabled={!ready} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
          <ToolButton label="Séparateur" icon={Minus} disabled={!ready} onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-neutral-200" />
          <ToolButton label="Insérer ou modifier un lien" icon={Link2} active={editor?.isActive('link')} disabled={!ready} onClick={setLink} />
          <ToolButton label="Retirer le lien" icon={Link2Off} disabled={!ready || !editor?.isActive('link')} onClick={() => editor?.chain().focus().unsetLink().run()} />
          <ToolButton label="Insérer une image" icon={ImagePlus} disabled={!ready} onClick={() => setImageOpen(true)} />
          <ToolButton label="Insérer un tableau" icon={TableIcon} disabled={!ready} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
          <ToolButton label="Supprimer le tableau" icon={Trash2} disabled={!ready || !editor?.isActive('table')} onClick={() => editor?.chain().focus().deleteTable().run()} />
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-neutral-200" />
          <ToolButton label="Annuler" icon={Undo2} disabled={!ready || !editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()} />
          <ToolButton label="Rétablir" icon={Redo2} disabled={!ready || !editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()} />
        </div>
        {editor ? <EditorContent editor={editor} /> : <div className={cn('px-4 py-3 text-sm text-neutral-400', minHeightClassName)}>Chargement de l’éditeur…</div>}
      </div>
      {editor ? <ImageDialog editor={editor} folder={folder} open={imageOpen} onOpenChange={setImageOpen} /> : null}
    </FormField>
  )
}
