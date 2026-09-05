import { Check, X } from 'lucide-react'
import { questionTypeLabels, type QuestionTypeName } from '@fetrag/contracts'
import { Badge } from '@fetrag/ui'

export interface QuestionPreviewProps {
  type: QuestionTypeName
  prompt: string
  explanation: string | null
  config: Record<string, unknown>
  options: Array<{ id: string; label: string; isCorrect: boolean; feedback: string | null; matchValue: string | null; position: number }>
}

function lines(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => (Array.isArray(v) ? v.map(String).join(' | ') : String(v))) : []
}

/** Rendu en lecture seule d'une question : énoncé, options ou configuration selon le type, explication. */
export function QuestionPreview({ type, prompt, explanation, config, options }: QuestionPreviewProps) {
  const hasOptions = type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' || type === 'MATCHING' || type === 'ORDERING'
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow mb-1 text-[11px] text-neutral-500">Énoncé · {questionTypeLabels[type]}</p>
        <p className="whitespace-pre-line text-base leading-relaxed text-ink">{prompt}</p>
      </div>

      {hasOptions ? (
        <ol className="flex flex-col gap-2">
          {options.map((option, index) => (
            <li key={option.id} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-sm">
              {type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' ? (
                <span className={option.isCorrect ? 'mt-0.5 text-green-700' : 'mt-0.5 text-neutral-400'} aria-label={option.isCorrect ? 'Bonne réponse' : 'Mauvaise réponse'}>
                  {option.isCorrect ? <Check className="size-4" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}
                </span>
              ) : (
                <span aria-hidden="true" className="font-display text-lg font-semibold leading-none text-blue-600">
                  {index + 1}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{option.label}</span>
                {type === 'MATCHING' && option.matchValue ? <span className="block text-xs text-neutral-600">Associé à : {option.matchValue}</span> : null}
                {option.feedback ? <span className="block text-xs text-neutral-500">Commentaire : {option.feedback}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {type === 'TRUE_FALSE' ? (
        <p className="text-sm">
          Réponse attendue : <Badge variant={config.answer === false ? 'danger' : 'success'} size="sm">{config.answer === false ? 'Faux' : 'Vrai'}</Badge>
        </p>
      ) : null}

      {type === 'FILL_BLANK' ? (
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-1 text-[11px] text-neutral-500">Texte à trous</p>
            <p className="whitespace-pre-line rounded-xl bg-neutral-50 p-3">{typeof config.text === 'string' ? config.text : '-'}</p>
          </div>
          <div>
            <p className="eyebrow mb-1 text-[11px] text-neutral-500">Réponses acceptées (par trou)</p>
            <ol className="list-decimal pl-5">
              {lines(config.answers).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      {type === 'SHORT_ANSWER' ? (
        <div className="text-sm">
          <p className="eyebrow mb-1 text-[11px] text-neutral-500">Réponses acceptées {config.caseSensitive ? '(sensible à la casse)' : ''}</p>
          <ul className="flex flex-wrap gap-2">
            {lines(config.accepted).map((a, i) => (
              <li key={i}>
                <Badge variant="outline" size="sm">
                  {a}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {type === 'ESSAY' ? (
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p>
            Longueur attendue : {typeof config.minWords === 'number' ? `${config.minWords} mots minimum` : 'libre'}
            {typeof config.maxWords === 'number' ? ` · ${config.maxWords} mots maximum` : ''}
          </p>
          {Array.isArray(config.rubric) && config.rubric.length ? (
            <div>
              <p className="eyebrow mb-1 text-[11px] text-neutral-500">Grille de correction</p>
              <ul className="flex flex-col gap-1">
                {(config.rubric as Array<Record<string, unknown>>).map((c, i) => (
                  <li key={i} className="flex justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-1.5">
                    <span>{String(c.label ?? c.criterion ?? '')}</span>
                    <span className="font-semibold text-navy">{String(c.points ?? c.maxPoints ?? 0)} pt</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {type === 'MATCHING' && Array.isArray(config.distractors) && config.distractors.length ? (
        <p className="text-sm text-neutral-600">Distracteurs : {lines(config.distractors).join(', ')}</p>
      ) : null}

      {explanation ? (
        <div className="rounded-xl border border-green-200 bg-green-50/50 p-3 text-sm">
          <p className="eyebrow mb-1 text-[11px] text-green-800">Explication affichée après correction</p>
          <p className="whitespace-pre-line text-neutral-800">{explanation}</p>
        </div>
      ) : null}
    </div>
  )
}
