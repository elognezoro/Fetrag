'use client'

import * as React from 'react'
import { ArrowUp, CalendarDays, ClipboardList, Clock, ListChecks, ListTree, Mail, MapPin, Phone, Printer, Rocket, Tag, User, Users } from 'lucide-react'
import { guideStats, type Guide, type GuideMeta, type GuideSection } from '@fetrag/contracts'

import { cn } from '../../lib/cn'
import { toneClasses } from '../../lib/tones'
import { Button } from '../button'
import { Breadcrumbs, type BreadcrumbItem } from '../breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '../card'
import { IconButton } from '../icon-button'
import { GradientDivider } from '../brand/gradient-divider'
import { Ribbon } from '../brand/ribbon'
import { Reveal } from '../motion/reveal'
import { GuideBlockView, GuideLinks, GuideList, GuideSteps } from './guide-blocks'
import { GuideCard } from './guide-card'
import { guideIcon } from './guide-icons'
import { renderGuideInline, resolveGuideText, type GuideBaseUrls } from './guide-inline'
import { formatGuideDate, guideOrdinal, normalizeSearchText, sectionSearchText } from './guide-text'
import { GuideToc, type GuideTocEntry } from './guide-toc'

export interface GuideReaderProps {
  guide: Guide
  /** URL publiques des deux applications, substituées aux marqueurs `{{web}}` / `{{lms}}`. */
  baseUrls: GuideBaseUrls
  /** « Vous consultez ce guide en tant que … » */
  viewerRoleLabel?: string
  breadcrumbs?: BreadcrumbItem[]
  /** Cartes « Vos autres guides » affichées en fin de guide. */
  otherGuides?: Array<{ meta: GuideMeta; href: string; external?: boolean }>
  /** Carte de contact affichée en fin de guide. */
  contact?: { email: string; phones: string[]; address?: string }
  className?: string
}

const platformLabels = { web: 'site institutionnel', lms: 'plateforme de formation' } as const

/** Suit la section visible à l'écran (IntersectionObserver), sans dépendre du routeur. */
function useActiveSection(ids: string[]): string | null {
  const [activeId, setActiveId] = React.useState<string | null>(ids[0] ?? null)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top)
          else visible.delete(entry.target.id)
        }
        if (visible.size === 0) return
        // Section la plus haute parmi celles visibles.
        const [top] = [...visible.entries()].sort((a, b) => a[1] - b[1])
        if (top) setActiveId(top[0])
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1] },
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

/** Affiche le bouton « Haut de page » une fois la page défilée. */
function useScrolled(offset = 600): boolean {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const update = () => setScrolled(window.scrollY > offset)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [offset])
  return scrolled
}

function MetaItem({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: 'true' }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden="true" strokeWidth={1.75} className="size-4 text-neutral-400" />
      {children}
    </span>
  )
}

function SectionHeader({
  section,
  index,
  tone,
  baseUrls,
}: {
  section: GuideSection
  index: number
  tone: Guide['tone']
  baseUrls: GuideBaseUrls
}) {
  const t = toneClasses[tone]
  const Icon = guideIcon(section.icon, ListTree)
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-start gap-3 sm:gap-4">
        <span aria-hidden="true" className={cn('font-display text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl', t.text)}>
          {guideOrdinal(index)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', t.soft, t.softText)}>
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <h2 id={`${section.id}-titre`} className="font-display text-2xl font-semibold leading-tight tracking-tight text-navy text-wrap sm:text-3xl">
              <a href={`#${section.id}`} className="rounded-sm no-underline hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
                {section.title}
              </a>
            </h2>
          </div>
          {section.summary ? <p className="text-base leading-relaxed text-neutral-600">{renderGuideInline(section.summary, { baseUrls })}</p> : null}
        </div>
      </div>
      <div aria-hidden="true" className={cn('h-[3px] w-16 rounded-full', t.bg)} />
    </header>
  )
}

/**
 * Lecteur de guide d'utilisation : en-tête, prise en main, sommaire collant avec recherche,
 * sections à blocs typés, guides liés, autres guides et contact. Imprimable (« Enregistrer en PDF »).
 */
export function GuideReader({ guide, baseUrls, viewerRoleLabel, breadcrumbs, otherGuides, contact, className }: GuideReaderProps) {
  const t = toneClasses[guide.tone]
  const stats = React.useMemo(() => guideStats(guide), [guide])
  const Icon = guideIcon(guide.icon)
  const [query, setQuery] = React.useState('')
  const [printing, setPrinting] = React.useState(false)
  const scrolled = useScrolled()

  const sectionIds = React.useMemo(() => guide.sections.map((section) => section.id), [guide.sections])
  const activeId = useActiveSection(sectionIds)

  const searchIndex = React.useMemo(() => guide.sections.map((section) => sectionSearchText(section)), [guide.sections])
  const normalizedQuery = normalizeSearchText(query)
  const matching = React.useMemo(() => {
    const set = new Set<string>()
    guide.sections.forEach((section, index) => {
      if (!normalizedQuery || searchIndex[index]?.includes(normalizedQuery)) set.add(section.id)
    })
    return set
  }, [guide.sections, normalizedQuery, searchIndex])

  const tocEntries = React.useMemo<GuideTocEntry[]>(
    () => guide.sections.map((section, index) => ({ id: section.id, title: section.title, icon: section.icon, index })).filter((entry) => matching.has(entry.id)),
    [guide.sections, matching],
  )

  // Impression : ouvre toutes les questions, marque le document, imprime, puis nettoie.
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const cleanup = () => {
      delete document.documentElement.dataset.print
      setPrinting(false)
    }
    window.addEventListener('afterprint', cleanup)
    return () => {
      window.removeEventListener('afterprint', cleanup)
      if (document.documentElement.dataset.print === 'guide') delete document.documentElement.dataset.print
    }
  }, [])

  const handlePrint = React.useCallback(() => {
    document.documentElement.dataset.print = 'guide'
    setPrinting(true)
    window.setTimeout(() => window.print(), 80)
  }, [])

  const scrollToTop = React.useCallback(() => {
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [])

  const blockContext = { baseUrls, tone: guide.tone, expandAll: printing } as const

  return (
    <article className={cn('flex flex-col gap-8 sm:gap-10', className)} data-guide-id={guide.id}>
      {/* En-tête */}
      <Reveal as="header" className="flex flex-col gap-4">
        {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} data-print-hide="" /> : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 max-w-3xl flex-col gap-3">
            <Ribbon tone={guide.tone} size="sm">
              Guide d’utilisation · {platformLabels[guide.platform]}
            </Ribbon>
            <div className="flex items-start gap-3 sm:gap-4">
              <span aria-hidden="true" className={cn('mt-1 flex size-12 shrink-0 items-center justify-center rounded-full sm:size-14', t.bg, t.onTone)}>
                <Icon className="size-6 sm:size-7" strokeWidth={1.75} />
              </span>
              <div className="flex min-w-0 flex-col gap-2">
                <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy text-wrap sm:text-4xl lg:text-5xl">{guide.title}</h1>
                <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">{guide.subtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:shrink-0" data-print-hide="">
            <Button variant="outline" leftIcon={<Printer aria-hidden="true" />} onClick={handlePrint}>
              Imprimer ou enregistrer en PDF
            </Button>
          </div>
        </div>

        <div className={cn('flex gap-3 rounded-2xl border p-4', t.soft, 'border-transparent')}>
          <Users aria-hidden="true" strokeWidth={1.75} className={cn('mt-0.5 size-5 shrink-0', t.text)} />
          <p className="text-sm leading-relaxed text-neutral-800 sm:text-base">
            <span className="font-semibold text-navy">Ce guide s’adresse à </span>
            {renderGuideInline(guide.audience, { baseUrls })}
          </p>
        </div>

        <p className="max-w-3xl text-base leading-relaxed text-neutral-700 sm:text-lg">{renderGuideInline(guide.summary, { baseUrls })}</p>

        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600">
          <div className="contents">
            <dt className="sr-only">Temps de lecture</dt>
            <dd>
              <MetaItem icon={Clock}>{guide.readingMinutes} min de lecture</MetaItem>
            </dd>
          </div>
          <div className="contents">
            <dt className="sr-only">Contenu</dt>
            <dd className="inline-flex flex-wrap items-center gap-x-5 gap-y-2">
              <MetaItem icon={ListTree}>
                {stats.sections} {stats.sections > 1 ? 'sections' : 'section'}
              </MetaItem>
              {stats.steps > 0 ? (
                <MetaItem icon={ListChecks}>
                  {stats.steps} {stats.steps > 1 ? 'étapes' : 'étape'}
                </MetaItem>
              ) : null}
            </dd>
          </div>
          <div className="contents">
            <dt className="sr-only">Mise à jour</dt>
            <dd>
              <MetaItem icon={CalendarDays}>
                Mis à jour le <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
              </MetaItem>
            </dd>
          </div>
          <div className="contents">
            <dt className="sr-only">Version</dt>
            <dd>
              <MetaItem icon={Tag}>Version {guide.version}</MetaItem>
            </dd>
          </div>
        </dl>

        {viewerRoleLabel ? (
          <p className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-soft" data-print-hide="">
            <User aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-blue-600" />
            <span>
              Vous consultez ce guide en tant que <strong className="text-navy">{viewerRoleLabel}</strong>.
            </span>
          </p>
        ) : null}

        <GradientDivider width="lg" />
      </Reveal>

      {/* Avant de commencer et prise en main */}
      {guide.prerequisites?.length || guide.quickStart?.length ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {guide.prerequisites?.length ? (
            <Reveal>
              <Card as="section" pillar={guide.tone} className="h-full" aria-labelledby="guide-prerequis">
                <CardHeader className="gap-2 p-5 sm:p-6">
                  <p className={cn('eyebrow text-[11px]', t.text)}>Prérequis</p>
                  <CardTitle as="h2" id="guide-prerequis" className="flex items-center gap-2.5">
                    <ClipboardList aria-hidden="true" strokeWidth={1.75} className={cn('size-5', t.text)} />
                    Avant de commencer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
                  <GuideList items={guide.prerequisites} style="check" baseUrls={baseUrls} />
                </CardContent>
              </Card>
            </Reveal>
          ) : null}
          {guide.quickStart?.length ? (
            <Reveal delay={0.08}>
              <Card as="section" pillar={guide.tone} className="h-full" aria-labelledby="guide-prise-en-main">
                <CardHeader className="gap-2 p-5 sm:p-6">
                  <p className={cn('eyebrow text-[11px]', t.text)}>Démarrage</p>
                  <CardTitle as="h2" id="guide-prise-en-main" className="flex items-center gap-2.5">
                    <Rocket aria-hidden="true" strokeWidth={1.75} className={cn('size-5', t.text)} />
                    Prise en main en cinq minutes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
                  <GuideSteps items={guide.quickStart} baseUrls={baseUrls} tone={guide.tone} />
                </CardContent>
              </Card>
            </Reveal>
          ) : null}
        </div>
      ) : null}

      {/* Sommaire et sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <GuideToc entries={tocEntries} activeId={activeId} tone={guide.tone} query={query} onQueryChange={setQuery} total={matching.size} />

        <div className="flex min-w-0 flex-col gap-10 sm:gap-14">
          {normalizedQuery && matching.size === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-600" role="status">
              Aucune section ne contient « {query.trim()} ».{' '}
              <button type="button" onClick={() => setQuery('')} className="font-semibold text-blue-700 underline underline-offset-[3px]">
                Effacer la recherche
              </button>
            </div>
          ) : null}

          {guide.sections.map((section, index) => (
            <Reveal
              key={section.id}
              as="section"
              id={section.id}
              aria-labelledby={`${section.id}-titre`}
              hidden={!matching.has(section.id)}
              className="scroll-mt-[calc(var(--header-height)+1rem)] flex flex-col gap-6"
            >
              <SectionHeader section={section} index={index} tone={guide.tone} baseUrls={baseUrls} />
              <div className="flex flex-col gap-6">
                {section.blocks.map((block, blockIndex) => (
                  <GuideBlockView key={blockIndex} block={block} headingLevel={3} {...blockContext} />
                ))}
              </div>
              {section.subsections?.map((sub) => (
                <section key={sub.id} id={sub.id} aria-labelledby={`${sub.id}-titre`} className="scroll-mt-[calc(var(--header-height)+1rem)] flex flex-col gap-5 border-l-2 border-neutral-200 pl-4 sm:pl-6">
                  <h3 id={`${sub.id}-titre`} className="font-display text-xl font-semibold leading-tight tracking-tight text-navy text-wrap sm:text-2xl">
                    <a href={`#${sub.id}`} className="rounded-sm no-underline hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
                      {sub.title}
                    </a>
                  </h3>
                  {sub.blocks.map((block, blockIndex) => (
                    <GuideBlockView key={blockIndex} block={block} headingLevel={4} {...blockContext} />
                  ))}
                </section>
              ))}
            </Reveal>
          ))}
        </div>
      </div>

      {/* Guides liés, autres guides, contact */}
      {guide.related?.length || otherGuides?.length || contact ? (
        <>
          <GradientDivider width="lg" />
          <div className="flex flex-col gap-10">
            {guide.related?.length ? (
              <Reveal as="section" aria-labelledby="guide-lies">
                <div className="flex flex-col gap-4">
                  <h2 id="guide-lies" className="font-display text-2xl font-semibold tracking-tight text-navy">
                    Guides liés
                  </h2>
                  <GuideLinks items={guide.related} baseUrls={baseUrls} tone={guide.tone} />
                </div>
              </Reveal>
            ) : null}

            {otherGuides?.length ? (
              <Reveal as="section" aria-labelledby="guide-autres" data-print-hide="">
                <div className="flex flex-col gap-4">
                  <h2 id="guide-autres" className="font-display text-2xl font-semibold tracking-tight text-navy">
                    Vos autres guides
                  </h2>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {otherGuides.map((item) => (
                      <li key={item.meta.id} className="min-w-0">
                        <GuideCard meta={item.meta} href={resolveGuideText(item.href, baseUrls)} external={item.external} current={item.meta.id === guide.id} />
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}

            {contact ? (
              <Reveal as="section" aria-labelledby="guide-contact">
                <Card pillar="navy" className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="eyebrow text-[11px] text-navy">Contact</p>
                      <h2 id="guide-contact" className="font-display text-2xl font-semibold tracking-tight text-navy">
                        Besoin d’aide ?
                      </h2>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        Indiquez dans votre message l’adresse email de votre compte, l’écran concerné et le message d’erreur affiché.
                      </p>
                    </div>
                    <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                      <li>
                        <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
                          <Mail aria-hidden="true" strokeWidth={1.75} className="size-4" />
                          {contact.email}
                        </a>
                      </li>
                      {contact.phones.map((phone) => (
                        <li key={phone}>
                          <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-green-50 px-4 text-sm font-semibold text-green-800 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
                            <Phone aria-hidden="true" strokeWidth={1.75} className="size-4" />
                            {phone}
                          </a>
                        </li>
                      ))}
                      {contact.address ? (
                        <li className="inline-flex min-h-11 items-center gap-2 px-1 text-sm text-neutral-700">
                          <MapPin aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-gold-700" />
                          <span className="text-wrap">{contact.address}</span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                </Card>
              </Reveal>
            ) : null}
          </div>
        </>
      ) : null}

      {/* Haut de page (mobile) */}
      <div
        className={cn(
          'fixed bottom-4 right-4 z-30 transition-[opacity,transform] duration-180 ease-out-expo lg:hidden',
          scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        )}
        data-print-hide=""
      >
        <IconButton
          label="Haut de page"
          icon={ArrowUp}
          variant="primary"
          size="lg"
          className="shadow-lift"
          onClick={scrollToTop}
          tabIndex={scrolled ? 0 : -1}
          aria-hidden={scrolled ? undefined : 'true'}
        />
      </div>
    </article>
  )
}
