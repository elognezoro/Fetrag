'use client'

import { ArcRing, Counter, cn, type Tone } from '@fetrag/ui'

/** Anneau de progression (arc du logo) avec valeur en serif au centre et libellé. */
export function ProgressRing({ value, label, size = 128, tone, className, suffix = '%' }: { value: number; label: string; size?: number; tone?: Tone; className?: string; suffix?: string }) {
  const bounded = Math.max(0, Math.min(100, Math.round(value)))
  const resolved: Tone = tone ?? (bounded >= 100 ? 'blue' : bounded < 50 ? 'gold' : 'green')
  return (
    <div className={cn('flex flex-col items-center gap-2 text-center', className)} role="img" aria-label={`${label} : ${bounded} ${suffix}`}>
      <ArcRing size={size} stroke={Math.max(8, Math.round(size / 12))} progress={bounded} tone={resolved}>
        <span className="font-display text-2xl font-semibold tabular-nums text-navy">
          <Counter to={bounded} suffix={suffix === '%' ? ' %' : suffix} />
        </span>
      </ArcRing>
      <span className="text-sm font-semibold text-neutral-600">{label}</span>
    </div>
  )
}
