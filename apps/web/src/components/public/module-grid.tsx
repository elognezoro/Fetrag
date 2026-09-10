import { ModuleCard, Stagger, StaggerItem } from '@fetrag/ui'
import { formatHours, type ProgrammeModule } from '@/server/public/programme'

interface ModuleGridProps {
  modules: ProgrammeModule[]
  /** Préfixe des liens (défaut : fiche formation du site). */
  hrefFor?: (module: ProgrammeModule) => string | undefined
  columns?: 2 | 3
}

/** Grille des modules du programme (ModuleCard numérotées 01-10), révélées en cascade. */
export function ModuleGrid({ modules, hrefFor, columns = 3 }: ModuleGridProps) {
  const resolveHref = hrefFor ?? ((module: ProgrammeModule) => (module.slug ? `/formations/${module.slug}` : undefined))
  return (
    <Stagger as="ol" className={columns === 3 ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-1 gap-5 sm:grid-cols-2'}>
      {modules.map((module) => (
        <StaggerItem key={module.number + (module.slug ?? module.title)} as="li" className="h-full">
          <ModuleCard
            number={module.number}
            title={module.title}
            items={module.items}
            pillar={module.pillar}
            href={resolveHref(module)}
            duration={formatHours(module.durationHours)}
            badge={module.isFeatured ? 'Cours pilote' : module.isFree ? undefined : 'Payant'}
          />
        </StaggerItem>
      ))}
    </Stagger>
  )
}
