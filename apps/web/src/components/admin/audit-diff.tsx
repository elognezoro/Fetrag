import { ChevronDown } from 'lucide-react'

export interface AuditDiffProps {
  before: unknown
  after: unknown
  /** Identifiant unique de l'entrée (pour les attributs ARIA). */
  id: string
}

function pretty(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

/** Détail avant / après d'une entrée du journal d'audit, repliable sans JavaScript (`details`). Composant serveur. */
export function AuditDiff({ before, after, id }: AuditDiffProps) {
  const hasBefore = before !== null && before !== undefined
  const hasAfter = after !== null && after !== undefined
  if (!hasBefore && !hasAfter) return <span className="text-xs text-neutral-400">—</span>
  return (
    <details className="group text-xs">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full px-2 py-1 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
        <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
        Détail
      </summary>
      <div className="mt-2 grid gap-2 sm:grid-cols-2" id={`audit-diff-${id}`}>
        {hasBefore ? (
          <div className="min-w-0">
            <p className="eyebrow mb-1 text-[10px] text-neutral-500">Avant</p>
            <pre className="max-h-64 overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-3 font-mono text-[11px] leading-relaxed text-neutral-800">{pretty(before)}</pre>
          </div>
        ) : null}
        {hasAfter ? (
          <div className="min-w-0">
            <p className="eyebrow mb-1 text-[10px] text-green-700">Après</p>
            <pre className="max-h-64 overflow-auto rounded-xl border border-green-100 bg-green-50/60 p-3 font-mono text-[11px] leading-relaxed text-neutral-800">{pretty(after)}</pre>
          </div>
        ) : null}
      </div>
    </details>
  )
}
