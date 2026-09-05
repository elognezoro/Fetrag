import type { LucideIcon } from 'lucide-react'
import { Stagger, StaggerItem, StatTile, toneAt, type Tone } from '@fetrag/ui'

export interface StatItem {
  value: number | string
  label: string
  icon?: LucideIcon
  tone?: Tone
  suffix?: string
  description?: string
}

/** Grille d'indicateurs animés (compteurs) avec alternance bleu / vert / or. */
export function StatGrid({ items, columns = 4 }: { items: StatItem[]; columns?: 3 | 4 }) {
  const cols = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
  return (
    <Stagger className={`grid gap-4 ${cols}`}>
      {items.map((item, index) => (
        <StaggerItem key={index}>
          <StatTile value={item.value} label={item.label} icon={item.icon} tone={item.tone ?? toneAt(index)} suffix={item.suffix} description={item.description} className="h-full" />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
