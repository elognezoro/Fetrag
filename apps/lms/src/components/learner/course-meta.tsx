import { Clock, Layers, MapPin, Tag } from 'lucide-react'
import { courseLevelLabels, courseModalityLabels, pillarLabels, type PillarName } from '@fetrag/contracts'
import { formatMoney } from '@fetrag/domain'
import { Badge, cn, pillarTone, toneClasses } from '@fetrag/ui'

export interface CourseMetaProps {
  modality: 'ASYNC' | 'SYNC' | 'HYBRID'
  level: 'INITIATION' | 'INTERMEDIAIRE' | 'AVANCE'
  durationHours: number
  isFree: boolean
  priceAmount: number | null
  currency: string
  pillar?: PillarName | null
  /** Sur fond sombre (hero). */
  inverted?: boolean
  className?: string
}

/** Libellé de prix : « Gratuit » ou montant XAF formaté. */
export function priceLabel(isFree: boolean, priceAmount: number | null, currency: string): string {
  if (isFree || !priceAmount) return 'Gratuit'
  return formatMoney(priceAmount, currency)
}

/** Ligne de métadonnées d'une formation : pilier, durée, modalité, niveau, tarif. */
export function CourseMeta({ modality, level, durationHours, isFree, priceAmount, currency, pillar, inverted = false, className }: CourseMetaProps) {
  const chip = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
    inverted ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-neutral-100 text-neutral-700',
  )
  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Caractéristiques de la formation">
      {pillar ? (
        <li>
          <Badge variant={pillarTone[pillar]} size="md" className={cn(inverted && 'border-white/20 bg-white/10 text-white')}>
            <span className={cn('size-1.5 rounded-full', toneClasses[pillarTone[pillar]].bg)} aria-hidden="true" />
            {pillarLabels[pillar]}
          </Badge>
        </li>
      ) : null}
      <li className={chip}>
        <Clock aria-hidden="true" className="size-3.5" />
        {durationHours} h
      </li>
      <li className={chip}>
        <MapPin aria-hidden="true" className="size-3.5" />
        {courseModalityLabels[modality]}
      </li>
      <li className={chip}>
        <Layers aria-hidden="true" className="size-3.5" />
        {courseLevelLabels[level]}
      </li>
      <li className={cn(chip, !inverted && (isFree || !priceAmount ? 'bg-green-50 text-green-800' : 'bg-gold-50 text-gold-800'))}>
        <Tag aria-hidden="true" className="size-3.5" />
        {priceLabel(isFree, priceAmount, currency)}
      </li>
    </ul>
  )
}
