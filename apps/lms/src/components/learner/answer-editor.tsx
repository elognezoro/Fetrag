'use client'

import { useEffect, useId } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading3,
  Italic,
  List,
  ListOrdered,
  RemoveFormatting,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@fetrag/ui'

/**
 * Éditeur de réponse des évaluations subjectives (études de cas, livrables, compositions) :
 * mêmes outils de mise en forme que le support source (gras, italique, souligné, barré,
 * indice, exposant, titre, listes, alignements, couleurs de la charte, tableaux).
 * La sortie HTML est assainie côté serveur à l'écriture (liste blanche `sanitizeHtml`).
 */

/** Couleurs de texte proposées : palette de la charte, en phase avec la liste blanche du sanitizer. */
const ANSWER_COLORS: Array<{ name: string; value: string }> = [
  { name: 'marine', value: '#042768' },
  { name: 'bleu', value: '#0259C7' },
  { name: 'vert', value: '#9CC102' },
  { name: 'or', value: '#F9C804' },
  { name: 'rouge', value: '#C62828' },
]

function ToolButton({ label, icon: Icon, active, disabled, onClick }: { label: string; icon: LucideIcon; active?: boolean; disabled?: boolean; onClick: () => void }) {
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

/** Bouton texte compact (opérations de tableau, comme les pastilles du support source). */
function ToolChip({ label, srLabel, disabled, onClick }: { label: string; srLabel?: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={srLabel ?? label}
      title={srLabel ?? label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex h-9 items-center rounded-lg px-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-navy focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 disabled:opacity-40"
    >
      {label}
    </button>
  )
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-neutral-200" />
}

function ColorSwatch({ editor, name, value, disabled }: { editor: Editor | null; name: string; value: string; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label={`Texte en ${name}`}
      title={`Texte en ${name}`}
      aria-pressed={editor?.isActive('textStyle', { color: value })}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => editor?.chain().focus().setColor(value).run()}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 disabled:opacity-40',
        editor?.isActive('textStyle', { color: value }) && 'bg-blue-50',
      )}
    >
      <span aria-hidden="true" className="size-4 rounded-full border border-neutral-300" style={{ backgroundColor: value }} />
    </button>
  )
}

export interface AnswerEditorProps {
  /** Libellé accessible de la zone d'édition. */
  label: string
  /** HTML courant (chaîne vide = aucune réponse). */
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  minHeightClassName?: string
}

export function AnswerEditor({ label, value, onChange, placeholder = 'Rédigez votre réponse...', disabled = false, minHeightClassName = 'min-h-[10rem]' }: AnswerEditorProps) {
  const id = useId()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [3] } }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    editorProps: {
      attributes: {
        id: `${id}-editor`,
        class: cn('prose-fetrag max-w-none px-4 py-3 outline-none', minHeightClassName),
        'aria-multiline': 'true',
        role: 'textbox',
        'aria-label': label,
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.isEmpty ? '' : instance.getHTML()),
  })

  // Réinitialisation externe (« Effacer » / « Réinitialiser ») : vide l'éditeur quand la valeur revient à ''.
  useEffect(() => {
    if (!editor) return
    if (value === '' && !editor.isEmpty) editor.commands.clearContent(true)
  }, [editor, value])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  const ready = Boolean(editor) && !disabled
  const inTable = Boolean(editor?.isActive('table'))

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft focus-within:ring-[3px] focus-within:ring-blue-500/40">
      <div role="toolbar" aria-label="Mise en forme de la réponse" className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
        <ToolButton label="Gras" icon={Bold} active={editor?.isActive('bold')} disabled={!ready} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolButton label="Italique" icon={Italic} active={editor?.isActive('italic')} disabled={!ready} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <ToolButton label="Souligné" icon={UnderlineIcon} active={editor?.isActive('underline')} disabled={!ready} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
        <ToolButton label="Barré" icon={Strikethrough} active={editor?.isActive('strike')} disabled={!ready} onClick={() => editor?.chain().focus().toggleStrike().run()} />
        <ToolButton label="Indice" icon={SubscriptIcon} active={editor?.isActive('subscript')} disabled={!ready} onClick={() => editor?.chain().focus().toggleSubscript().run()} />
        <ToolButton label="Exposant" icon={SuperscriptIcon} active={editor?.isActive('superscript')} disabled={!ready} onClick={() => editor?.chain().focus().toggleSuperscript().run()} />
        <Divider />
        <ToolButton label="Titre" icon={Heading3} active={editor?.isActive('heading', { level: 3 })} disabled={!ready} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolButton label="Liste à puces" icon={List} active={editor?.isActive('bulletList')} disabled={!ready} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolButton label="Liste numérotée" icon={ListOrdered} active={editor?.isActive('orderedList')} disabled={!ready} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <Divider />
        <ToolButton label="Aligner à gauche" icon={AlignLeft} active={editor?.isActive({ textAlign: 'left' })} disabled={!ready} onClick={() => editor?.chain().focus().setTextAlign('left').run()} />
        <ToolButton label="Centrer" icon={AlignCenter} active={editor?.isActive({ textAlign: 'center' })} disabled={!ready} onClick={() => editor?.chain().focus().setTextAlign('center').run()} />
        <ToolButton label="Aligner à droite" icon={AlignRight} active={editor?.isActive({ textAlign: 'right' })} disabled={!ready} onClick={() => editor?.chain().focus().setTextAlign('right').run()} />
        <ToolButton label="Justifier" icon={AlignJustify} active={editor?.isActive({ textAlign: 'justify' })} disabled={!ready} onClick={() => editor?.chain().focus().setTextAlign('justify').run()} />
        <Divider />
        {ANSWER_COLORS.map((color) => (
          <ColorSwatch key={color.value} editor={editor} name={color.name} value={color.value} disabled={!ready} />
        ))}
        <ToolChip label="Auto" srLabel="Couleur par défaut" disabled={!ready} onClick={() => editor?.chain().focus().unsetColor().run()} />
        <Divider />
        <ToolButton label="Insérer un tableau" icon={TableIcon} active={inTable} disabled={!ready} onClick={() => editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()} />
        <ToolChip label="+ ligne" srLabel="Ajouter une ligne au tableau" disabled={!ready || !inTable} onClick={() => editor?.chain().focus().addRowAfter().run()} />
        <ToolChip label="+ col." srLabel="Ajouter une colonne au tableau" disabled={!ready || !inTable} onClick={() => editor?.chain().focus().addColumnAfter().run()} />
        <ToolChip label="- ligne" srLabel="Supprimer la ligne du tableau" disabled={!ready || !inTable} onClick={() => editor?.chain().focus().deleteRow().run()} />
        <ToolChip label="- col." srLabel="Supprimer la colonne du tableau" disabled={!ready || !inTable} onClick={() => editor?.chain().focus().deleteColumn().run()} />
        <ToolChip label="Suppr. tableau" srLabel="Supprimer le tableau" disabled={!ready || !inTable} onClick={() => editor?.chain().focus().deleteTable().run()} />
        <Divider />
        <ToolButton label="Effacer la mise en forme" icon={RemoveFormatting} disabled={!ready} onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().unsetColor().run()} />
      </div>
      {editor ? <EditorContent editor={editor} /> : <div className={cn('px-4 py-3 text-sm text-neutral-400', minHeightClassName)}>Chargement de l&apos;éditeur...</div>}
    </div>
  )
}
