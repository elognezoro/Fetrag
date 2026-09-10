import Image from 'next/image'
import { Star } from 'lucide-react'
import { Prose, Reveal, Section, SectionHeading, Stagger, StaggerItem, cn, initials } from '@fetrag/ui'

export interface PersonItem {
  name: string
  role?: string
  imageUrl?: string
  /** HTML assaini par le CMS. */
  bio?: string
}

interface PeopleGridProps {
  id?: string
  title?: string
  eyebrow?: string
  description?: string
  items: PersonItem[]
  className?: string
}

function isExternal(src: string): boolean {
  return /^https?:\/\//i.test(src) && !/(^|\.)fetrag\.ga$/i.test(new URL(src).hostname)
}

/** Portrait dans un anneau bleu avec étoile or ; initiales en serif à défaut d'image. */
function Portrait({ person, large }: { person: PersonItem; large: boolean }) {
  return (
    <span className={cn('relative block shrink-0', large ? 'size-32 sm:size-36' : 'size-20')}>
      <span aria-hidden="true" className="absolute inset-0 rounded-full border-[3px] border-blue-500" />
      <span aria-hidden="true" className="absolute inset-1.5 rounded-full border border-dashed border-gold-500" />
      <span className="absolute inset-3 overflow-hidden rounded-full bg-blue-50">
        {person.imageUrl ? (
          <Image src={person.imageUrl} alt="" fill sizes={large ? '144px' : '80px'} unoptimized={isExternal(person.imageUrl)} className="object-cover object-top" />
        ) : (
          <span className={cn('flex size-full items-center justify-center font-display font-semibold text-blue-700', large ? 'text-3xl' : 'text-xl')}>
            {initials(person.name)}
          </span>
        )}
      </span>
      <span aria-hidden="true" className="absolute -top-1 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-white p-0.5 shadow-soft">
        <Star className={cn('fill-gold-500 text-gold-500', large ? 'size-5' : 'size-4')} strokeWidth={1.5} />
      </span>
    </span>
  )
}

/** Gouvernance / équipe : portraits en sceau, nom serif, fonction, biographie. Composant serveur. */
export function PeopleGrid({ id, title = 'Gouvernance', eyebrow = 'Les responsables', description, items, className }: PeopleGridProps) {
  if (items.length === 0) return null
  const featured = items.length === 1
  return (
    <Section id={id} variant="white" padding="md" rings={{ position: 'bottom-left', opacity: 0.05, rings: 3 }} className={className}>
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} size="md" className="mb-10" />
      </Reveal>
      <Stagger as="ul" className={cn('grid grid-cols-1 gap-5', featured ? 'max-w-3xl' : 'sm:grid-cols-2 lg:grid-cols-3')}>
        {items.map((person, index) => (
          <StaggerItem key={`${person.name}-${index}`} as="li" className="h-full">
            <article className={cn('flex h-full gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft', featured ? 'flex-col sm:flex-row sm:items-start' : 'flex-col items-start')}>
              <Portrait person={person} large={featured} />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold leading-tight text-navy">{person.name}</h3>
                {person.role ? <p className="eyebrow mt-1.5 text-[11px] text-blue-700">{person.role}</p> : null}
                {person.bio ? <Prose html={person.bio} className="mt-3 text-sm" /> : null}
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  )
}
