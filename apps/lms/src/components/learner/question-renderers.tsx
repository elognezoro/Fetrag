'use client'

import { Fragment, useId } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { AnswerResponse } from '@fetrag/contracts'
import type { PresentedQuestion } from '@fetrag/lms-core'
import { Checkbox, IconButton, Input, Label, NativeSelect, RadioGroup, RadioGroupItem, Textarea, cn } from '@fetrag/ui'

export interface QuestionRendererProps {
  question: PresentedQuestion
  value: AnswerResponse | undefined
  onChange: (response: AnswerResponse) => void
  disabled?: boolean
}

/** Sépare un texte à trous sur les marqueurs `___` ou `{{n}}`. */
export function splitBlanks(text: string): string[] {
  return text.split(/_{3,}|\{\{\s*\d+\s*\}\}/g)
}

function SingleChoice({ question, value, onChange, disabled }: QuestionRendererProps) {
  const selected = value?.type === 'choice' ? value.optionIds[0] ?? '' : ''
  const baseId = useId()
  return (
    <RadioGroup value={selected} onValueChange={(optionId) => onChange({ type: 'choice', optionIds: [optionId] })} disabled={disabled} aria-label="Choisissez une réponse">
      {question.options.map((option) => {
        const id = `${baseId}-${option.id}`
        return (
          <label key={option.id} htmlFor={id} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm transition-colors', selected === option.id ? 'border-blue-500 bg-blue-50/60' : 'border-neutral-200 hover:border-blue-300')}>
            <RadioGroupItem id={id} value={option.id} />
            <span className="text-ink">{option.label}</span>
          </label>
        )
      })}
    </RadioGroup>
  )
}

function MultipleChoice({ question, value, onChange, disabled }: QuestionRendererProps) {
  const selected = value?.type === 'choice' ? value.optionIds : []
  const baseId = useId()
  function toggle(optionId: string, checked: boolean) {
    const next = checked ? [...new Set([...selected, optionId])] : selected.filter((id) => id !== optionId)
    onChange({ type: 'choice', optionIds: next })
  }
  return (
    <div className="grid gap-3" role="group" aria-label="Cochez toutes les réponses exactes">
      {question.options.map((option) => {
        const id = `${baseId}-${option.id}`
        const checked = selected.includes(option.id)
        return (
          <label key={option.id} htmlFor={id} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm transition-colors', checked ? 'border-blue-500 bg-blue-50/60' : 'border-neutral-200 hover:border-blue-300')}>
            <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={(state) => toggle(option.id, state === true)} />
            <span className="text-ink">{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}

function TrueFalse({ value, onChange, disabled }: QuestionRendererProps) {
  const current = value?.type === 'boolean' ? String(value.value) : ''
  const baseId = useId()
  const choices: Array<{ key: 'true' | 'false'; label: string }> = [
    { key: 'true', label: 'Vrai' },
    { key: 'false', label: 'Faux' },
  ]
  return (
    <RadioGroup value={current} onValueChange={(v) => onChange({ type: 'boolean', value: v === 'true' })} disabled={disabled} className="grid-cols-2" aria-label="Vrai ou faux">
      {choices.map((choice) => {
        const id = `${baseId}-${choice.key}`
        return (
          <label key={choice.key} htmlFor={id} className={cn('flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-base font-semibold transition-colors', current === choice.key ? 'border-blue-500 bg-blue-50/60 text-blue-800' : 'border-neutral-200 text-navy hover:border-blue-300')}>
            <RadioGroupItem id={id} value={choice.key} />
            {choice.label}
          </label>
        )
      })}
    </RadioGroup>
  )
}

function FillBlank({ question, value, onChange, disabled }: QuestionRendererProps) {
  const text = question.blankText ?? question.prompt
  const parts = splitBlanks(text)
  const count = Math.max(question.blankCount ?? 0, parts.length - 1)
  const values = value?.type === 'blanks' ? value.values : []
  const baseId = useId()
  function update(index: number, next: string) {
    const copy = Array.from({ length: count }, (_, i) => values[i] ?? '')
    copy[index] = next
    onChange({ type: 'blanks', values: copy })
  }
  return (
    <p className="rounded-xl border border-neutral-200 bg-white px-4 py-4 text-base leading-[2.6] text-ink">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < count ? (
            <>
              <label htmlFor={`${baseId}-${index}`} className="sr-only">
                Trou {index + 1}
              </label>
              <input
                id={`${baseId}-${index}`}
                type="text"
                autoComplete="off"
                disabled={disabled}
                value={values[index] ?? ''}
                onChange={(event) => update(index, event.target.value)}
                className="mx-1 inline-block h-9 w-40 max-w-full rounded-lg border border-blue-300 bg-blue-50/40 px-2 text-center font-semibold text-navy focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/30"
              />
            </>
          ) : null}
        </Fragment>
      ))}
    </p>
  )
}

function Matching({ question, value, onChange, disabled }: QuestionRendererProps) {
  const pairs = value?.type === 'matching' ? value.pairs : []
  const baseId = useId()
  const targets = question.matchValues ?? []
  function update(optionId: string, target: string) {
    const rest = pairs.filter((p) => p.optionId !== optionId)
    onChange({ type: 'matching', pairs: target ? [...rest, { optionId, value: target }] : rest })
  }
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((option, index) => {
        const id = `${baseId}-${option.id}`
        const current = pairs.find((p) => p.optionId === option.id)?.value ?? ''
        return (
          <div key={option.id} className="grid gap-2 rounded-xl border border-neutral-200 bg-white p-3 sm:grid-cols-[1fr_1.4fr] sm:items-center">
            <Label htmlFor={id} className="text-sm">
              <span className="mr-2 font-display text-base text-blue-600">{String.fromCharCode(65 + index)}</span>
              {option.label}
            </Label>
            <NativeSelect id={id} value={current} disabled={disabled} onChange={(event) => update(option.id, event.target.value)} placeholder="Associer à..." options={targets.map((t) => ({ value: t, label: t }))} />
          </div>
        )
      })}
    </div>
  )
}

function Ordering({ question, value, onChange, disabled }: QuestionRendererProps) {
  const initial = question.options.map((o) => o.id)
  const order = value?.type === 'ordering' && value.optionIds.length === initial.length ? value.optionIds : initial
  const labels = new Map(question.options.map((o) => [o.id, o.label] as const))
  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= order.length) return
    const next = [...order]
    const a = next[index]
    const b = next[target]
    if (a === undefined || b === undefined) return
    next[index] = b
    next[target] = a
    onChange({ type: 'ordering', optionIds: next })
  }
  return (
    <ol className="flex flex-col gap-2" aria-label="Classez les éléments dans le bon ordre à l’aide des boutons monter et descendre">
      {order.map((optionId, index) => (
        <li key={optionId} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
          <span className="font-display text-lg font-semibold text-blue-600">{index + 1}</span>
          <span className="flex-1 text-ink">{labels.get(optionId)}</span>
          <div className="flex items-center gap-1">
            <IconButton label={`Monter « ${labels.get(optionId) ?? ''} »`} icon={ArrowUp} size="sm" variant="secondary" disabled={disabled || index === 0} onClick={() => move(index, -1)} />
            <IconButton label={`Descendre « ${labels.get(optionId) ?? ''} »`} icon={ArrowDown} size="sm" variant="secondary" disabled={disabled || index === order.length - 1} onClick={() => move(index, 1)} />
          </div>
        </li>
      ))}
    </ol>
  )
}

function ShortAnswer({ value, onChange, disabled }: QuestionRendererProps) {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id} className="sr-only">
        Votre réponse
      </Label>
      <Input id={id} value={value?.type === 'text' ? value.value : ''} disabled={disabled} autoComplete="off" placeholder="Votre réponse en quelques mots" onChange={(event) => onChange({ type: 'text', value: event.target.value })} />
    </div>
  )
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function Essay({ question, value, onChange, disabled }: QuestionRendererProps) {
  const id = useId()
  const text = value?.type === 'text' ? value.value : ''
  const words = countWords(text)
  const tooShort = question.minWords !== undefined && words < question.minWords
  const tooLong = question.maxWords !== undefined && words > question.maxWords
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="sr-only">
        Votre composition
      </Label>
      <Textarea id={id} rows={10} value={text} disabled={disabled} placeholder="Rédigez votre réponse argumentée..." onChange={(event) => onChange({ type: 'text', value: event.target.value })} aria-describedby={`${id}-count`} />
      <p id={`${id}-count`} className={cn('text-xs', tooShort || tooLong ? 'font-semibold text-gold-800' : 'text-neutral-500')}>
        {words} mot{words > 1 ? 's' : ''}
        {question.minWords !== undefined ? ` · minimum ${question.minWords}` : ''}
        {question.maxWords !== undefined ? ` · maximum ${question.maxWords}` : ''}
        {' · corrigée par le formateur'}
      </p>
    </div>
  )
}

/** Rendu d'une question selon son type, avec réponse contrôlée au format `answerResponseSchema`. */
export function QuestionRenderer(props: QuestionRendererProps) {
  switch (props.question.type) {
    case 'SINGLE_CHOICE':
      return <SingleChoice {...props} />
    case 'MULTIPLE_CHOICE':
      return <MultipleChoice {...props} />
    case 'TRUE_FALSE':
      return <TrueFalse {...props} />
    case 'FILL_BLANK':
      return <FillBlank {...props} />
    case 'MATCHING':
      return <Matching {...props} />
    case 'ORDERING':
      return <Ordering {...props} />
    case 'SHORT_ANSWER':
      return <ShortAnswer {...props} />
    case 'ESSAY':
      return <Essay {...props} />
    default:
      return null
  }
}

/** Une réponse est-elle considérée comme renseignée ? */
export function isAnswered(response: AnswerResponse | undefined): boolean {
  if (!response) return false
  switch (response.type) {
    case 'choice':
    case 'ordering':
      return response.optionIds.length > 0
    case 'boolean':
      return true
    case 'text':
      return response.value.trim().length > 0
    case 'blanks':
      return response.values.some((v) => v.trim().length > 0)
    case 'matching':
      return response.pairs.length > 0
    default:
      return false
  }
}
