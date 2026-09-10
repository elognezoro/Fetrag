import { Building2, CalendarDays, GraduationCap, Users } from 'lucide-react'
import { Container, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import type { HomeStats } from '@/server/public/home'

export interface StatsBandProps {
  stats: HomeStats
}

/** Bande de chiffres clés animés (Counter) : organisations, modules, apprenants, sessions. */
export function StatsBand({ stats }: StatsBandProps) {
  const tiles = [
    { value: stats.affiliates, label: 'Organisations affiliées', icon: Building2, tone: 'blue' as const },
    { value: stats.modules, label: 'Modules de formation', icon: GraduationCap, tone: 'green' as const },
    { value: stats.learners, label: 'Apprenants accompagnés', icon: Users, tone: 'gold' as const },
    { value: stats.sessions, label: 'Sessions de formation', icon: CalendarDays, tone: 'navy' as const },
  ]
  return (
    <div className="relative border-t border-neutral-200 bg-neutral-50/80">
      <Container className="py-10">
        <h2 className="sr-only">Chiffres clés de la Fédération</h2>
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" as="ul">
          {tiles.map((tile) => (
            <StaggerItem key={tile.label} as="li">
              <StatTile value={tile.value} label={tile.label} icon={tile.icon} tone={tile.tone} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </div>
  )
}
