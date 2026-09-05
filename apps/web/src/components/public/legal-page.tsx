import Link from 'next/link'
import { CalendarDays, FileText, Mail, ShieldCheck } from 'lucide-react'
import { formatDate } from '@fetrag/domain'
import { Button, PageHeader, Prose, Reveal, Section } from '@fetrag/ui'
import type { LegalPageData, LegalSlug } from '@/server/public/legal'

interface LegalPageProps {
  slug: LegalSlug
  data: LegalPageData
}

/** Mise en page commune des pages légales : en-tête, colonne de lecture et encart de contact. */
export function LegalPage({ slug, data }: LegalPageProps) {
  const isPrivacy = slug === 'confidentialite'
  const Icon = isPrivacy ? ShieldCheck : FileText
  return (
    <>
      <PageHeader
        eyebrow={isPrivacy ? 'Vos données' : 'Informations légales'}
        tone={isPrivacy ? 'green' : 'navy'}
        title={data.title}
        description={data.excerpt}
        breadcrumbs={[{ label: data.title }]}
        homeHref="/"
        meta={
          data.updatedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-blue-600" aria-hidden="true" />
              Dernière mise à jour le <time dateTime={data.updatedAt.toISOString()}>{formatDate(data.updatedAt)}</time>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Icon className="size-4 text-blue-600" aria-hidden="true" />
              Texte de référence de la Fédération des Travailleurs du Gabon
            </span>
          )
        }
      />
      <Section variant="white" padding="md" containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
          <Reveal>
            <Prose html={data.html} as="article" size="lg" />
          </Reveal>
          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 pillar-top-blue">
              <p className="eyebrow text-[11px] text-neutral-500">Une question sur ce texte ?</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                Le Secrétariat général de la Fédération répond à toute demande relative à ces informations, y compris pour l&apos;exercice de vos droits.
              </p>
              <Button asChild variant="primary" size="sm" className="mt-4">
                <Link href="/contact">
                  <Mail aria-hidden="true" />
                  Nous écrire
                </Link>
              </Button>
            </div>
            <nav aria-label="Autres textes" className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
              <p className="eyebrow text-[11px] text-neutral-500">Textes associés</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm font-semibold">
                <li>
                  <Link href={isPrivacy ? '/mentions-legales' : '/confidentialite'} className="text-blue-700 underline-offset-2 hover:underline">
                    {isPrivacy ? 'Mentions légales' : 'Politique de confidentialité'}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-blue-700 underline-offset-2 hover:underline">
                    Questions fréquentes
                  </Link>
                </li>
                <li>
                  <Link href="/certificats/verifier" className="text-blue-700 underline-offset-2 hover:underline">
                    Vérifier un certificat
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </Section>
    </>
  )
}
