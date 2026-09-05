'use client'

import { useId, useState } from 'react'
import { ArrowDown, ArrowUp, ListPlus, Trash2 } from 'lucide-react'
import { Badge, Button, Checkbox, FormField, IconButton, Input, Label, NativeSelect } from '@fetrag/ui'

/** Types de champs acceptés par `serviceFormFieldSchema` (@fetrag/cms). */
export const formFieldTypes = ['text', 'textarea', 'email', 'phone', 'number', 'date', 'select', 'checkbox', 'file'] as const
export type FormFieldType = (typeof formFieldTypes)[number]

export const formFieldTypeLabels: Record<FormFieldType, string> = {
  text: 'Texte court',
  textarea: 'Texte long',
  email: 'Adresse email',
  phone: 'Téléphone',
  number: 'Nombre',
  date: 'Date',
  select: 'Liste de choix',
  checkbox: 'Case à cocher',
  file: 'Pièce jointe',
}

/** Champ du formulaire de demande (miroir de `ServiceFormField`). */
export interface BuilderField {
  name: string
  label: string
  type: FormFieldType
  required: boolean
  placeholder?: string
  help?: string
  options?: string[]
}

interface Row extends BuilderField {
  key: string
}

let counter = 0
function nextKey(): string {
  counter += 1
  return `field-${counter}-${Date.now().toString(36)}`
}

/** Identifiant technique dérivé du libellé (lettres, chiffres, soulignés ; commence par une lettre). */
export function fieldNameFrom(label: string): string {
  const base = label
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
  const candidate = /^[a-zA-Z]/.test(base) ? base : `champ_${base}`
  return candidate.slice(0, 40)
}

function toRows(fields: BuilderField[] | null | undefined): Row[] {
  return (fields ?? []).map((field) => ({ ...field, key: nextKey() }))
}

function serialize(rows: Row[]): string {
  if (rows.length === 0) return ''
  const fields: BuilderField[] = rows.map((row) => ({
    name: row.name || fieldNameFrom(row.label),
    label: row.label,
    type: row.type,
    required: row.required,
    ...(row.placeholder ? { placeholder: row.placeholder } : {}),
    ...(row.help ? { help: row.help } : {}),
    ...(row.type === 'select' ? { options: (row.options ?? []).filter((o) => o.trim().length > 0) } : {}),
  }))
  return JSON.stringify(fields)
}

export interface FormSchemaBuilderProps {
  /** Nom du champ caché transmis au formulaire parent (JSON). */
  name?: string
  defaultValue?: BuilderField[] | null
  error?: string
}

/**
 * Constructeur simple du formulaire d'une demande de service : liste ordonnée de champs
 * (libellé, identifiant, type, obligatoire, aide, options). Sérialisé en JSON pour `serviceFormSchema`.
 */
export function FormSchemaBuilder({ name = 'formSchema', defaultValue, error }: FormSchemaBuilderProps) {
  const id = useId()
  const [rows, setRows] = useState<Row[]>(() => toRows(defaultValue))

  function update(key: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function move(key: string, direction: -1 | 1) {
    setRows((current) => {
      const index = current.findIndex((row) => row.key === key)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      const [item] = next.splice(index, 1)
      if (item) next.splice(target, 0, item)
      return next
    })
  }

  function add() {
    setRows((current) => [...current, { key: nextKey(), name: '', label: '', type: 'text', required: false }])
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name={name} value={serialize(rows)} />
      {error ? (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
          Aucun champ spécifique : le demandeur renseigne uniquement son identité, ses coordonnées et un message. Ajoutez des champs pour collecter des informations
          propres à ce service (matricule, employeur, nature du litige, pièces à joindre).
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <li key={row.key} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-display text-lg font-semibold text-navy">
                  <span className="text-blue-600">{String(index + 1).padStart(2, '0')}</span>
                  {row.label || 'Nouveau champ'}
                  <Badge variant="outline" size="sm">
                    {formFieldTypeLabels[row.type]}
                  </Badge>
                </span>
                <div className="flex items-center gap-1">
                  <IconButton label="Monter" icon={ArrowUp} size="sm" disabled={index === 0} onClick={() => move(row.key, -1)} />
                  <IconButton label="Descendre" icon={ArrowDown} size="sm" disabled={index === rows.length - 1} onClick={() => move(row.key, 1)} />
                  <IconButton label={`Supprimer le champ ${row.label || index + 1}`} icon={Trash2} size="sm" className="text-red-700 hover:bg-red-50" onClick={() => setRows((c) => c.filter((r) => r.key !== row.key))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField label="Libellé" htmlFor={`${id}-${row.key}-label`} required>
                  <Input
                    id={`${id}-${row.key}-label`}
                    value={row.label}
                    maxLength={120}
                    onChange={(event) => update(row.key, { label: event.target.value, name: row.name || fieldNameFrom(event.target.value) })}
                  />
                </FormField>
                <FormField label="Identifiant" htmlFor={`${id}-${row.key}-name`} hint="Lettres, chiffres, soulignés.">
                  <Input id={`${id}-${row.key}-name`} value={row.name} maxLength={40} pattern="[a-zA-Z][a-zA-Z0-9_]*" onChange={(event) => update(row.key, { name: event.target.value })} />
                </FormField>
                <FormField label="Type" htmlFor={`${id}-${row.key}-type`}>
                  <NativeSelect
                    id={`${id}-${row.key}-type`}
                    value={row.type}
                    onChange={(event) => update(row.key, { type: event.target.value as FormFieldType })}
                    options={formFieldTypes.map((type) => ({ value: type, label: formFieldTypeLabels[type] }))}
                  />
                </FormField>
                <div className="flex items-center gap-3 self-end rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                  <Checkbox id={`${id}-${row.key}-required`} checked={row.required} onCheckedChange={(value) => update(row.key, { required: value === true })} />
                  <Label htmlFor={`${id}-${row.key}-required`}>Obligatoire</Label>
                </div>
                <FormField label="Texte indicatif" htmlFor={`${id}-${row.key}-placeholder`}>
                  <Input id={`${id}-${row.key}-placeholder`} value={row.placeholder ?? ''} maxLength={160} onChange={(event) => update(row.key, { placeholder: event.target.value })} />
                </FormField>
                <FormField label="Aide" htmlFor={`${id}-${row.key}-help`} className="sm:col-span-2 lg:col-span-1">
                  <Input id={`${id}-${row.key}-help`} value={row.help ?? ''} maxLength={300} onChange={(event) => update(row.key, { help: event.target.value })} />
                </FormField>
                {row.type === 'select' ? (
                  <FormField label="Options" htmlFor={`${id}-${row.key}-options`} hint="Séparées par des virgules." className="sm:col-span-2">
                    <Input
                      id={`${id}-${row.key}-options`}
                      value={(row.options ?? []).join(', ')}
                      onChange={(event) => update(row.key, { options: event.target.value.split(',').map((o) => o.trim()) })}
                    />
                  </FormField>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
      <div>
        <Button type="button" variant="outline" size="sm" onClick={add} leftIcon={<ListPlus aria-hidden="true" />}>
          Ajouter un champ
        </Button>
      </div>
    </div>
  )
}
