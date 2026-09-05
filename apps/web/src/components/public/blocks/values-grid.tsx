import { Award, Handshake, HeartHandshake, Lightbulb, Scale, ShieldCheck, Sparkles, Target, Users, type LucideIcon } from 'lucide-react'
import { Reveal, Section, SectionHeading, Stagger, StaggerItem, cn, padNumber, toneAt, toneClasses, type Tone } from '@fetrag/ui'

export interface ValueItem {
  title: string
  description?: string
  icon?: string
  tone?: Tone
}

interface ValuesGridProps {
  id?: string
  title?: string
  eyebrow?: string
  description?: string
  items: ValueItem[]
  className?: string
}

const icons: Record<string, LucideIcon> = {
  award: Award,
  handshake: Handshake,
  'heart-handshake': HeartHandshake,
  lightbulb: Lightbulb,
  scale: Scale,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  target: Target,
  users: Users,
}

const defaultIcons: LucideIcon[] = [Award, Target, HeartHandshake, ShieldCheck, Scale, Users]

/** Grille de valeurs : cartes numérotées avec filet coloré, icône lucide dans une pastille. Composant serveur. */
export function ValuesGrid({ id, title = 'Nos valeurs', eyebrow = 'Ce qui nous guide', description, items, className }: ValuesGridProps) {
  if (items.length === 0) return null
  return (
    <Section id={id} variant="muted" padding="md" bordered className={className}>
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} size="md" tone="gold" className="mb-10" />
      </Reveal>
      <Stagger as="ol" className={cn('grid gap-5', items.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')}>
        {items.map((item, index) => {
          const tone = item.tone ?? toneAt(index)
          const classes = toneClasses[tone]
          const Icon = (item.icon ? icons[item.icon] : undefined) ?? defaultIcons[index % defaultIcons.length] ?? Award
          return (
            <StaggerItem key={`${item.title}-${index}`} as="li" className="h-full">
              <article className={cn('flex h-full flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', classes.topRule)}>
                <div className="flex items-center justify-between">
                  <span className={cn('inline-flex size-11 items-center justify-center rounded-full', classes.soft, classes.softText)}>
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', classes.text)}>
                    {padNumber(index + 1)}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold leading-tight text-navy">{item.title}</h3>
                {item.description ? <p className="text-sm leading-relaxed text-neutral-600">{item.description}</p> : null}
              </article>
            </StaggerItem>
          )
        })}
      </Stagger>
    </Section>
  )
}
