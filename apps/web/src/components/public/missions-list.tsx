import { Gavel, GraduationCap, HeartPulse, Landmark, Scale, type LucideIcon } from 'lucide-react'
import { Reveal, Section, SectionHeading, Stagger, StaggerItem, cn, padNumber, toneAt, toneClasses } from '@fetrag/ui'
import { MISSIONS } from '@/server/public/institution'

const icons: LucideIcon[] = [Landmark, GraduationCap, Scale, Gavel, HeartPulse]

/** Les missions statutaires de la Fédération, en cartes numérotées à filet tricolore alterné. */
export function MissionsList() {
  return (
    <Section variant="muted" padding="md" bordered aria-labelledby="missions-title">
      <Reveal>
        <SectionHeading
          eyebrow="Nos missions"
          tone="blue"
          title={
            <span id="missions-title">
              Ce que la Fédération <span className="italic text-blue-600">fait</span> pour les travailleurs
            </span>
          }
          description="Représentation, formation, appui juridique, dialogue social et santé au travail : cinq missions au service des organisations affiliées et de leurs adhérents."
          className="mb-10"
        />
      </Reveal>
      <Stagger as="ol" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MISSIONS.map((mission, index) => {
          const tone = toneAt(index)
          const classes = toneClasses[tone]
          const Icon = icons[index % icons.length] ?? Landmark
          return (
            <StaggerItem key={mission} as="li" className="h-full">
              <article className={cn('flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', classes.topRule)}>
                <div className="flex items-center justify-between">
                  <span className={cn('inline-flex size-11 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', classes.text)}>
                    {padNumber(index + 1)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">
                  <span className="sr-only">Mission {padNumber(index + 1)} : </span>
                  {mission}
                </p>
              </article>
            </StaggerItem>
          )
        })}
      </Stagger>
    </Section>
  )
}
