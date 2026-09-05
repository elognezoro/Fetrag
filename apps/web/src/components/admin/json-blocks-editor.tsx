'use client'

import { useId, useMemo, useState } from 'react'
import { Braces, Plus, Sparkles } from 'lucide-react'
import { Badge, Button, FormField, Textarea, cn } from '@fetrag/ui'

/** Modèles de blocs (miroir des types de `pageBlockSchema`). */
const templates: Array<{ type: string; label: string; sample: Record<string, unknown> }> = [
  { type: 'hero', label: 'Bandeau d’en-tête', sample: { type: 'hero', eyebrow: 'La FETRAG', title: 'Titre du bandeau', subtitle: 'Accroche en une phrase.', tone: 'blue', primaryCta: { label: 'En savoir plus', href: '/la-fetrag' } } },
  { type: 'richtext', label: 'Texte riche', sample: { type: 'richtext', title: 'Section', html: '<p>Contenu de la section.</p>' } },
  { type: 'triptych', label: 'Triptyque fondateur', sample: { type: 'triptych', title: 'Notre triptyque fondateur' } },
  { type: 'values', label: 'Valeurs', sample: { type: 'values', title: 'Nos valeurs', items: [{ title: 'Travail', description: 'Rigueur et engagement au service des travailleurs.', icon: 'briefcase', tone: 'blue' }, { title: 'Efficacité', description: 'Des résultats concrets dans le dialogue social.', icon: 'target', tone: 'green' }, { title: 'Solidarité', description: 'Une fédération unie autour de ses membres.', icon: 'users', tone: 'gold' }] } },
  { type: 'timeline', label: 'Chronologie', sample: { type: 'timeline', title: 'Dates clés', items: [{ date: '2026', title: 'Lancement de la plateforme de formation', description: 'Programme de formation des leaders syndicaux.' }] } },
  { type: 'people', label: 'Équipe / dirigeants', sample: { type: 'people', title: 'Le bureau exécutif', items: [{ name: 'Jocelyn Louis NGOMA', role: 'Secrétaire Général', imageUrl: '/brand/sg-ngoma.webp' }] } },
  { type: 'stats', label: 'Chiffres clés', sample: { type: 'stats', title: 'La FETRAG en chiffres', items: [{ value: 10, label: 'modules de formation', tone: 'blue' }, { value: 3, label: 'piliers fondateurs', tone: 'green' }] } },
  { type: 'faq', label: 'Questions fréquentes', sample: { type: 'faq', title: 'Questions fréquentes', group: 'general' } },
  { type: 'cta', label: 'Appel à l’action', sample: { type: 'cta', title: 'Rejoignez la FETRAG', description: 'Adhérez ou créez une section syndicale dans votre entreprise.', tone: 'navy', primaryCta: { label: 'Adhérer', href: '/adhesion' } } },
]

export interface JsonBlocksEditorProps {
  name?: string
  label?: string
  defaultValue?: unknown
  error?: string
  hint?: string
}

function pretty(value: unknown): string {
  if (value === null || value === undefined) return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ''
  }
}

/**
 * Éditeur JSON assisté des blocs structurés d'une page : validation à la volée, insertion de modèles de blocs,
 * reformatage. La valeur est transmise au formulaire parent par le `Textarea` nommé.
 */
export function JsonBlocksEditor({ name = 'blocks', label = 'Blocs structurés (JSON)', defaultValue, error, hint }: JsonBlocksEditorProps) {
  const id = useId()
  const [text, setText] = useState(() => pretty(defaultValue))

  const parsed = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return { ok: true as const, blocks: [] as Array<Record<string, unknown>> }
    try {
      const value: unknown = JSON.parse(trimmed)
      if (!Array.isArray(value)) return { ok: false as const, message: 'Le document doit être un tableau de blocs ([...]).' }
      const invalid = value.findIndex((b) => !b || typeof b !== 'object' || typeof (b as { type?: unknown }).type !== 'string')
      if (invalid >= 0) return { ok: false as const, message: `Le bloc n° ${invalid + 1} doit contenir une propriété « type ».` }
      return { ok: true as const, blocks: value as Array<Record<string, unknown>> }
    } catch (err) {
      return { ok: false as const, message: err instanceof Error ? `JSON invalide : ${err.message}` : 'JSON invalide' }
    }
  }, [text])

  function append(sample: Record<string, unknown>) {
    const current = parsed.ok ? parsed.blocks : []
    setText(pretty([...current, sample]))
  }

  function format() {
    if (parsed.ok) setText(pretty(parsed.blocks))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <Plus className="size-3.5" aria-hidden="true" />
          Ajouter un bloc :
        </span>
        {templates.map((template) => (
          <Button key={template.type} type="button" variant="outline" size="sm" onClick={() => append(template.sample)}>
            {template.label}
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={format} disabled={!parsed.ok} leftIcon={<Sparkles aria-hidden="true" />}>
          Reformater
        </Button>
      </div>
      <FormField
        label={label}
        htmlFor={`${id}-blocks`}
        error={error ?? (parsed.ok ? undefined : parsed.message)}
        hint={hint ?? 'Types disponibles : hero, richtext, timeline, values, people, cta, faq, stats, triptych. Laissez vide pour n’utiliser que le contenu riche.'}
      >
        <Textarea
          id={`${id}-blocks`}
          name={name}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={14}
          spellCheck={false}
          className={cn('font-mono text-xs leading-relaxed', !parsed.ok && 'border-red-400')}
        />
      </FormField>
      {parsed.ok && parsed.blocks.length > 0 ? (
        <ol className="flex flex-wrap gap-2" aria-label="Blocs détectés">
          {parsed.blocks.map((block, index) => (
            <li key={index}>
              <Badge variant="outline" size="sm">
                <Braces className="size-3" aria-hidden="true" />
                {index + 1}. {String(block.type)}
                {typeof block.title === 'string' && block.title ? ` · ${block.title.slice(0, 30)}` : ''}
              </Badge>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
