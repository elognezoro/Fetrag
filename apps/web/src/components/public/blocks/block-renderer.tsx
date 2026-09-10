import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import type { PageBlock } from '@fetrag/cms'
import { Button, Prose, Reveal, Ribbon, RingBackdrop, Section, SectionHeading, Stagger, StaggerItem, StatTile, TriptychStrip, type Tone } from '@fetrag/ui'
import { FaqAccordion } from '../faq-accordion'
import { PeopleGrid } from './people-grid'
import { Timeline } from './timeline'
import { ValuesGrid } from './values-grid'

interface BlockRendererProps {
  blocks: PageBlock[]
}

function toneOf(value: string | undefined, fallback: Tone = 'blue'): Tone {
  return value === 'blue' || value === 'green' || value === 'gold' || value === 'navy' ? value : fallback
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

function CtaLink({ href, label, variant }: { href: string; label: string; variant: 'primary' | 'outline' | 'gold' | 'accent' }) {
  const content = (
    <>
      {label}
      <ArrowRight aria-hidden="true" />
    </>
  )
  return (
    <Button asChild variant={variant} size="lg">
      {isExternal(href) ? (
        <a href={href} rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <Link href={href}>{content}</Link>
      )}
    </Button>
  )
}

function HeroBlock({ block }: { block: Extract<PageBlock, { type: 'hero' }> }) {
  const tone = toneOf(block.tone)
  return (
    <section id={block.anchor} className="relative isolate overflow-hidden border-b border-neutral-200 bg-white" aria-label={block.title ?? 'Introduction'}>
      <RingBackdrop position="right" rings={4} opacity={0.07} sizeClassName="size-[34rem] sm:size-[48rem]" />
      <div className="container-fetrag relative grid grid-cols-1 gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <Reveal>
          {block.eyebrow ? (
            <Ribbon tone={tone} size="lg" tilt>
              {block.eyebrow}
            </Ribbon>
          ) : null}
          {block.title ? <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-navy text-balance sm:text-5xl lg:text-6xl">{block.title}</h1> : null}
          {block.subtitle ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">{block.subtitle}</p> : null}
          {block.primaryCta || block.secondaryCta ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {block.primaryCta ? <CtaLink href={block.primaryCta.href} label={block.primaryCta.label} variant="primary" /> : null}
              {block.secondaryCta ? <CtaLink href={block.secondaryCta.href} label={block.secondaryCta.label} variant="outline" /> : null}
            </div>
          ) : null}
        </Reveal>
        {block.imageUrl ? (
          <Reveal delay={0.12} y={24} className="relative mx-auto w-full max-w-md">
            <span aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border-[3px] border-blue-500/20" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border-4 border-white bg-neutral-100 shadow-lift">
              <Image src={block.imageUrl} alt={block.imageAlt ?? ''} fill sizes="(min-width: 1024px) 40vw, 90vw" unoptimized={isExternal(block.imageUrl)} className="object-cover" />
            </div>
            <span aria-hidden="true" className="absolute -right-3 -top-3 flex size-12 items-center justify-center rounded-full border-4 border-white bg-gold-500 text-navy shadow-soft">
              <Star className="size-6 fill-navy/90" strokeWidth={1.5} />
            </span>
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}

function RichtextBlock({ block }: { block: Extract<PageBlock, { type: 'richtext' }> }) {
  if (!block.html.trim()) return null
  return (
    <Section id={block.anchor} variant="white" padding="md" containerSize="wide">
      <Reveal>
        {block.title ? <SectionHeading title={block.title} size="md" className="mb-8" /> : null}
        <Prose html={block.html} as="article" />
      </Reveal>
    </Section>
  )
}

function CtaBlock({ block }: { block: Extract<PageBlock, { type: 'cta' }> }) {
  return (
    <Section id={block.anchor} variant="dark" padding="lg">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Ribbon tone={toneOf(block.tone, 'gold')}>{block.title ? 'Rejoindre la Fédération' : 'FETRAG'}</Ribbon>
        {block.title ? <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">{block.title}</h2> : null}
        {block.description ? <p className="mt-4 text-lg leading-relaxed text-white/80">{block.description}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {block.primaryCta ? <CtaLink href={block.primaryCta.href} label={block.primaryCta.label} variant="gold" /> : null}
          {block.secondaryCta ? (
            <Button asChild variant="outline" size="lg" className="border-white/60 text-white hover:bg-white/10">
              {isExternal(block.secondaryCta.href) ? (
                <a href={block.secondaryCta.href} rel="noopener noreferrer">
                  {block.secondaryCta.label}
                </a>
              ) : (
                <Link href={block.secondaryCta.href}>{block.secondaryCta.label}</Link>
              )}
            </Button>
          ) : null}
        </div>
      </Reveal>
    </Section>
  )
}

function StatsBlock({ block }: { block: Extract<PageBlock, { type: 'stats' }> }) {
  if (block.items.length === 0) return null
  const tones: Tone[] = ['blue', 'green', 'gold', 'navy']
  return (
    <Section id={block.anchor} variant="muted" padding="md" bordered>
      {block.title ? <SectionHeading title={block.title} size="md" align="center" className="mb-10" /> : null}
      <Stagger as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {block.items.map((item, index) => (
          <StaggerItem key={`${item.label}-${index}`} as="li">
            <StatTile value={item.value} label={item.label} prefix={item.prefix} suffix={item.suffix} tone={toneOf(item.tone, tones[index % tones.length])} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  )
}

function TriptychBlock({ block }: { block: Extract<PageBlock, { type: 'triptych' }> }) {
  const [protection, prevention, defense] = block.items ?? []
  return (
    <Section id={block.anchor} variant="white" padding="md" rings={{ position: 'left', opacity: 0.05, rings: 3 }}>
      <Reveal>
        <SectionHeading eyebrow="Triptyque fondateur" title={block.title ?? 'Protection, prévention, défense'} size="md" tone="green" className="mb-10" />
        <TriptychStrip
          variant="cards"
          items={{
            protection: protection ? { label: protection.title, description: protection.description } : undefined,
            prevention: prevention ? { label: prevention.title, description: prevention.description } : undefined,
            defense: defense ? { label: defense.title, description: defense.description } : undefined,
          }}
        />
      </Reveal>
    </Section>
  )
}

function FaqBlock({ block }: { block: Extract<PageBlock, { type: 'faq' }> }) {
  const items = (block.items ?? []).map((item, index) => ({ id: `${block.anchor ?? 'faq'}-${index}`, question: item.question, answer: item.answer }))
  if (items.length === 0) return null
  return (
    <Section id={block.anchor} variant="muted" padding="md" containerSize="wide" bordered>
      <SectionHeading eyebrow="Questions fréquentes" title={block.title ?? 'Vos questions, nos réponses'} size="md" tone="gold" className="mb-8" />
      <FaqAccordion items={items} />
    </Section>
  )
}

/**
 * Rend les blocs structurés d'une page CMS (`Page.blocks`) avec les composants signatures FETRAG.
 * Chaque bloc validé par `pageBlockSchema` a son rendu ; les types inconnus sont ignorés.
 */
export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? block.anchor ?? `${block.type}-${index}`
        switch (block.type) {
          case 'hero':
            return <HeroBlock key={key} block={block} />
          case 'richtext':
            return <RichtextBlock key={key} block={block} />
          case 'timeline':
            return <Timeline key={key} id={block.anchor} title={block.title} items={block.items} />
          case 'values':
            return <ValuesGrid key={key} id={block.anchor} title={block.title} items={block.items} />
          case 'people':
            return <PeopleGrid key={key} id={block.anchor} title={block.title} items={block.items} />
          case 'cta':
            return <CtaBlock key={key} block={block} />
          case 'faq':
            return <FaqBlock key={key} block={block} />
          case 'stats':
            return <StatsBlock key={key} block={block} />
          case 'triptych':
            return <TriptychBlock key={key} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
