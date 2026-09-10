import type { Metadata } from 'next'
import Link from 'next/link'
import { HelpCircle, Mail } from 'lucide-react'
import { stripHtml } from '@fetrag/cms'
import { Button, PageHeader, Reveal, Section, SectionHeading, cn, toneAt, toneClasses } from '@fetrag/ui'
import { FaqAccordion } from '@/components/public/faq-accordion'
import { JsonLd } from '@/components/public/json-ld'
import { siteConfig } from '@/lib/site'
import { getFaqGroups, type FaqGroup } from '@/server/public/faq'
import { FAQ_FALLBACK } from '@/server/public/faq-fallback'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description: `Adhésion, formation et certificats, services, paiements, compte et sécurité : les réponses de la ${siteConfig.fullName} aux questions les plus fréquentes.`,
  alternates: { canonical: '/faq' },
}

function faqJsonLd(groups: FaqGroup[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: stripHtml(item.answer) },
      })),
    ),
  }
}

/** Questions fréquentes : groupes thématiques en accordéon, sommaire ancré, contenu de repli rédigé par la Fédération. */
export default async function FaqPage() {
  const loaded = await getFaqGroups()
  const groups = loaded.length > 0 ? loaded : FAQ_FALLBACK
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <>
      <JsonLd data={faqJsonLd(groups)} />
      <PageHeader
        eyebrow="Aide"
        tone="gold"
        title={
          <>
            Questions <span className="italic text-gold-700">fréquentes</span>
          </>
        }
        description="Adhésion, formation et certificats, services aux adhérents, paiements, compte et sécurité : les réponses aux questions que l'on nous pose le plus souvent."
        breadcrumbs={[{ label: 'FAQ' }]}
        homeHref="/"
        meta={
          <span>
            {total} question{total > 1 ? 's' : ''} · {groups.length} thème{groups.length > 1 ? 's' : ''}
          </span>
        }
      />

      <Section variant="white" padding="md" containerSize="wide" rings={{ position: 'left', opacity: 0.05, rings: 3 }}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Thèmes" className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow text-[11px] text-neutral-500">Thèmes</p>
            <ol className="mt-3 flex flex-wrap gap-2 lg:flex-col">
              {groups.map((group, index) => {
                const classes = toneClasses[toneAt(index)]
                return (
                  <li key={group.key}>
                    <a
                      href={`#faq-${group.key}`}
                      className={cn(
                        'inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-navy transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
                      )}
                    >
                      <span aria-hidden="true" className={cn('size-2 rounded-full', classes.bg)} />
                      {group.label}
                      <span className="text-xs text-neutral-500">{group.items.length}</span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="flex flex-col gap-12">
            {groups.map((group, index) => (
              <Reveal key={group.key} as="section" id={`faq-${group.key}`} className="scroll-mt-24" aria-labelledby={`faq-${group.key}-title`}>
                <SectionHeading eyebrow={group.label} tone={toneAt(index)} size="md" title={<span id={`faq-${group.key}-title`}>{group.label}</span>} className="mb-5" />
                <FaqAccordion items={group.items.map((item) => ({ id: item.id, question: item.question, answer: item.answer }))} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section variant="soft" padding="md" bordered aria-labelledby="faq-contact-title">
        <Reveal className="flex flex-col items-start gap-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-soft sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-800">
              <HelpCircle className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 id="faq-contact-title" className="font-display text-2xl font-semibold leading-tight text-navy">
                Vous n&apos;avez pas trouvé votre réponse ?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
                Le Secrétariat général répond à toutes les questions des travailleurs et des organisations sous cinq jours ouvrés.
              </p>
            </div>
          </div>
          <Button asChild variant="primary" size="lg" className="shrink-0">
            <Link href="/contact">
              <Mail aria-hidden="true" />
              Poser ma question
            </Link>
          </Button>
        </Reveal>
      </Section>
    </>
  )
}
