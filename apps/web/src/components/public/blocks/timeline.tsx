import { Star } from 'lucide-react'
import { Reveal, Section, SectionHeading, Stagger, StaggerItem, cn, toneAt, toneClasses } from '@fetrag/ui'

export interface TimelineItem {
  date: string
  title: string
  description?: string
}

interface TimelineProps {
  id?: string
  title?: string
  eyebrow?: string
  description?: string
  items: TimelineItem[]
  className?: string
}

/**
 * Frise historique : filet vertical tricolore, jalons en anneaux colorés (bleu, vert, or en alternance),
 * dernier jalon marqué d'une étoile or. Composant serveur.
 */
export function Timeline({ id, title = 'Notre histoire', eyebrow = 'Repères', description, items, className }: TimelineProps) {
  if (items.length === 0) return null
  return (
    <Section id={id} variant="white" padding="md" rings={{ position: 'top-right', opacity: 0.05, rings: 3 }} className={className}>
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} size="md" className="mb-10" />
      </Reveal>
      <Stagger as="ol" className="relative flex flex-col gap-8 pl-2 sm:pl-4">
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[1.35rem] top-3 w-0.5 rounded-full bg-gradient-to-b from-blue-500 via-green-500 to-gold-500 sm:left-[1.85rem]"
        />
        {items.map((item, index) => {
          const tone = toneAt(index)
          const classes = toneClasses[tone]
          const last = index === items.length - 1
          return (
            <StaggerItem key={`${item.date}-${index}`} as="li" className="relative flex gap-5 sm:gap-7">
              <span className={cn('relative z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] bg-white shadow-soft', classes.border)}>
                {last ? <Star className="size-4 fill-gold-500 text-gold-500" strokeWidth={1.5} aria-hidden="true" /> : <span className={cn('size-2.5 rounded-full', classes.bg)} />}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft sm:p-6">
                <p className={cn('eyebrow text-[11px]', classes.text)}>{item.date}</p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-navy">{item.title}</h3>
                {item.description ? <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">{item.description}</p> : null}
              </div>
            </StaggerItem>
          )
        })}
      </Stagger>
    </Section>
  )
}
