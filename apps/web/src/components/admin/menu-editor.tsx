'use client'

import { useActionState, useId, useState, type DragEvent } from 'react'
import { ArrowDown, ArrowUp, CornerDownRight, CornerLeftUp, GripVertical, Plus, Save, Trash2 } from 'lucide-react'
import { Badge, Button, Checkbox, FormField, IconButton, Input, Label, cn } from '@fetrag/ui'
import { FormStatus } from '@/components/account/form-status'
import { SubmitButton } from '@/components/account/submit-button'
import { idleState, type ActionState } from '@/server/account/types'
import { saveMenuAction } from '@/server/admin/content-actions'

/** Entrée de menu telle que renvoyée par `menus.get` (sérialisable). */
export interface MenuEditorItem {
  label: string
  href: string
  icon: string | null
  isExternal: boolean
  children: MenuEditorItem[]
}

interface Node {
  key: string
  label: string
  href: string
  icon: string
  isExternal: boolean
  children: Node[]
}

let counter = 0
function nextKey(): string {
  counter += 1
  return `menu-${counter}-${Date.now().toString(36)}`
}

function toNodes(items: MenuEditorItem[]): Node[] {
  return items.map((item) => ({ key: nextKey(), label: item.label, href: item.href, icon: item.icon ?? '', isExternal: item.isExternal, children: toNodes(item.children ?? []) }))
}

function serialize(nodes: Node[]): unknown[] {
  return nodes.map((node) => ({
    label: node.label,
    href: node.href,
    icon: node.icon ? node.icon : null,
    isExternal: node.isExternal,
    ...(node.children.length > 0 ? { children: serialize(node.children) } : {}),
  }))
}

type Path = number[]

function getSiblings(root: Node[], path: Path): Node[] {
  let siblings = root
  for (const index of path.slice(0, -1)) {
    const node = siblings[index]
    if (!node) return siblings
    siblings = node.children
  }
  return siblings
}

/** Applique une mutation immuable sur l'arbre. */
function mutate(root: Node[], fn: (draft: Node[]) => void): Node[] {
  const clone = (nodes: Node[]): Node[] => nodes.map((n) => ({ ...n, children: clone(n.children) }))
  const draft = clone(root)
  fn(draft)
  return draft
}

function countAll(nodes: Node[]): number {
  return nodes.reduce((sum, node) => sum + 1 + countAll(node.children), 0)
}

export interface MenuEditorProps {
  location: string
  locationLabel: string
  name: string
  items: MenuEditorItem[]
  /** Deux niveaux maximum (menu principal et sous-menu). */
  maxDepth?: number
}

/**
 * Éditeur d'arbre de menu : édition en ligne, réordonnancement (boutons ou glisser-déposer entre frères),
 * indentation (sous-menu) et désindentation. L'arbre est envoyé en JSON à `saveMenuAction`.
 */
export function MenuEditor({ location, locationLabel, name, items, maxDepth = 2 }: MenuEditorProps) {
  const id = useId()
  const [state, action] = useActionState<ActionState, FormData>(saveMenuAction, idleState)
  const [nodes, setNodes] = useState<Node[]>(() => toNodes(items))
  const [dragging, setDragging] = useState<string | null>(null)

  function update(path: Path, patch: Partial<Node>) {
    setNodes((root) =>
      mutate(root, (draft) => {
        const siblings = getSiblings(draft, path)
        const index = path[path.length - 1] ?? 0
        const node = siblings[index]
        if (node) Object.assign(node, patch)
      }),
    )
  }

  function remove(path: Path) {
    setNodes((root) =>
      mutate(root, (draft) => {
        getSiblings(draft, path).splice(path[path.length - 1] ?? 0, 1)
      }),
    )
  }

  function move(path: Path, direction: -1 | 1) {
    setNodes((root) =>
      mutate(root, (draft) => {
        const siblings = getSiblings(draft, path)
        const index = path[path.length - 1] ?? 0
        const target = index + direction
        if (target < 0 || target >= siblings.length) return
        const [node] = siblings.splice(index, 1)
        if (node) siblings.splice(target, 0, node)
      }),
    )
  }

  function indent(path: Path) {
    if (path.length >= maxDepth) return
    setNodes((root) =>
      mutate(root, (draft) => {
        const siblings = getSiblings(draft, path)
        const index = path[path.length - 1] ?? 0
        if (index === 0) return
        const [node] = siblings.splice(index, 1)
        const previous = siblings[index - 1]
        if (node && previous) previous.children.push(node)
      }),
    )
  }

  function outdent(path: Path) {
    if (path.length < 2) return
    setNodes((root) =>
      mutate(root, (draft) => {
        const parentPath = path.slice(0, -1)
        const parentSiblings = getSiblings(draft, parentPath)
        const parentIndex = parentPath[parentPath.length - 1] ?? 0
        const parent = parentSiblings[parentIndex]
        if (!parent) return
        const [node] = parent.children.splice(path[path.length - 1] ?? 0, 1)
        if (node) parentSiblings.splice(parentIndex + 1, 0, node)
      }),
    )
  }

  function add(parentPath: Path | null) {
    setNodes((root) =>
      mutate(root, (draft) => {
        const target = parentPath ? getSiblings(draft, [...parentPath, 0]) : draft
        target.push({ key: nextKey(), label: '', href: '/', icon: '', isExternal: false, children: [] })
      }),
    )
  }

  /** Glisser-déposer entre frères d'un même niveau. */
  function onDrop(event: DragEvent<HTMLLIElement>, targetPath: Path) {
    event.preventDefault()
    const sourceKey = event.dataTransfer.getData('text/plain') || dragging
    setDragging(null)
    if (!sourceKey) return
    setNodes((root) =>
      mutate(root, (draft) => {
        const siblings = getSiblings(draft, targetPath)
        const sourceIndex = siblings.findIndex((n) => n.key === sourceKey)
        const targetIndex = targetPath[targetPath.length - 1] ?? 0
        if (sourceIndex < 0 || sourceIndex === targetIndex) return
        const [node] = siblings.splice(sourceIndex, 1)
        if (node) siblings.splice(targetIndex, 0, node)
      }),
    )
  }

  function renderNodes(list: Node[], parentPath: Path) {
    return (
      <ol className={cn('flex flex-col gap-2', parentPath.length > 0 && 'ml-4 border-l-2 border-green-200 pl-4 sm:ml-8')}>
        {list.map((node, index) => {
          const path = [...parentPath, index]
          const depth = path.length
          return (
            <li
              key={node.key}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', node.key)
                event.dataTransfer.effectAllowed = 'move'
                setDragging(node.key)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, path)}
              onDragEnd={() => setDragging(null)}
              className={cn('rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft transition', dragging === node.key && 'opacity-50')}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <span className="hidden cursor-grab items-center self-center text-neutral-400 lg:flex" aria-hidden="true" title="Glisser pour réordonner">
                  <GripVertical className="size-5" />
                </span>
                <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr_8rem]">
                  <FormField label="Libellé" htmlFor={`${id}-${node.key}-label`} required>
                    <Input id={`${id}-${node.key}-label`} value={node.label} maxLength={80} onChange={(event) => update(path, { label: event.target.value })} />
                  </FormField>
                  <FormField label="Adresse" htmlFor={`${id}-${node.key}-href`} required hint="Chemin (/formations) ou URL https.">
                    <Input id={`${id}-${node.key}-href`} value={node.href} maxLength={2048} onChange={(event) => update(path, { href: event.target.value })} />
                  </FormField>
                  <FormField label="Icône" htmlFor={`${id}-${node.key}-icon`} hint="Nom lucide (facultatif).">
                    <Input id={`${id}-${node.key}-icon`} value={node.icon} maxLength={40} onChange={(event) => update(path, { icon: event.target.value })} />
                  </FormField>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox id={`${id}-${node.key}-external`} checked={node.isExternal} onCheckedChange={(value) => update(path, { isExternal: value === true })} />
                    <Label htmlFor={`${id}-${node.key}-external`} className="text-xs">
                      Lien externe
                    </Label>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <IconButton label="Monter" icon={ArrowUp} size="sm" disabled={index === 0} onClick={() => move(path, -1)} />
                    <IconButton label="Descendre" icon={ArrowDown} size="sm" disabled={index === list.length - 1} onClick={() => move(path, 1)} />
                    <IconButton label="Transformer en sous-menu" icon={CornerDownRight} size="sm" disabled={index === 0 || depth >= maxDepth} onClick={() => indent(path)} />
                    <IconButton label="Remonter d’un niveau" icon={CornerLeftUp} size="sm" disabled={depth < 2} onClick={() => outdent(path)} />
                    {depth < maxDepth ? <IconButton label="Ajouter une sous-entrée" icon={Plus} size="sm" onClick={() => add(path)} /> : null}
                    <IconButton label={`Supprimer ${node.label || 'cette entrée'}`} icon={Trash2} size="sm" className="text-red-700 hover:bg-red-50" onClick={() => remove(path)} />
                  </div>
                </div>
              </div>
              {node.children.length > 0 ? <div className="mt-3">{renderNodes(node.children, path)}</div> : null}
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="items" value={JSON.stringify(serialize(nodes))} />
      <FormStatus state={state} />
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft sm:flex-row sm:items-end sm:justify-between">
        <FormField label="Nom du menu" htmlFor={`${id}-name`} hint={`Emplacement : ${locationLabel}.`} className="sm:max-w-sm">
          <Input id={`${id}-name`} name="name" defaultValue={name} maxLength={80} />
        </FormField>
        <Badge variant="blue" size="md">
          {countAll(nodes)} entrée{countAll(nodes) > 1 ? 's' : ''}
        </Badge>
      </div>
      {nodes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">Ce menu est vide. Ajoutez une première entrée.</p>
      ) : (
        renderNodes(nodes, [])
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => add(null)} leftIcon={<Plus aria-hidden="true" />}>
          Ajouter une entrée
        </Button>
        <SubmitButton variant="primary" size="lg" pendingLabel="Enregistrement" leftIcon={<Save aria-hidden="true" />}>
          Enregistrer le menu
        </SubmitButton>
      </div>
    </form>
  )
}
