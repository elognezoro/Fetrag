import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, GraduationCap, HelpCircle, LifeBuoy, ShieldCheck } from 'lucide-react'
import { Button, PageHeader, Reveal, Section, SectionHeading } from '@fetrag/ui'
import { ContactDetails } from '@/components/public/contact-details'
import { InquiryForm } from '@/components/public/inquiry-form'
import { JsonLd } from '@/components/public/json-ld'
import { StaticMap } from '@/components/public/static-map'
import { lmsHref, siteConfig } from '@/lib/site'
import { getViewer } from '@/server/public/viewer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Écrire ou rencontrer la ${siteConfig.fullName} : adresse du siège à Libreville, email, téléphones, permanence et formulaire de contact.`,
  alternates: { canonical: '/contact' },
}

/** Page contact : coordonnées officielles, plan stylisé du siège, formulaire, orientation vers les bons services. */
export default async function ContactPage() {
  const viewer = await getViewer()
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact - ${siteConfig.fullName}`,
    url: `${siteConfig.url}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.fullName,
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phones[0],
      address: { '@type': 'PostalAddress', streetAddress: siteConfig.contact.address, addressLocality: 'Libreville', addressCountry: 'GA' },
    },
  }

  return (
    <>
      <JsonLd data={contactJsonLd} />
      <PageHeader
        eyebrow="Contact"
        tone="blue"
        title={
          <>
            Nous <span className="italic text-blue-600">écrire</span> ou nous rencontrer
          </>
        }
        description="Le Secrétariat général de la Fédération répond aux travailleurs, aux organisations syndicales, aux institutions et aux médias. Une permanence vous accueille au siège, à Libreville, du lundi au vendredi."
        breadcrumbs={[{ label: 'Contact' }]}
        homeHref="/"
      />

      <Section variant="white" padding="md" containerSize="wide" rings={{ position: 'left', opacity: 0.05, rings: 3 }}>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="flex flex-col gap-8">
            <Reveal>
              <SectionHeading eyebrow="Coordonnées" tone="blue" size="md" title="Le siège de la Fédération" className="mb-6" />
              <ContactDetails />
            </Reveal>
            <Reveal delay={0.1}>
              <StaticMap />
            </Reveal>
          </div>

          <Reveal delay={0.05} id="formulaire" className="scroll-mt-24 rounded-2xl border border-blue-100 bg-white p-6 shadow-soft sm:p-8">
            <SectionHeading
              eyebrow="Formulaire"
              tone="green"
              size="md"
              title={
                <>
                  Envoyer un <span className="italic text-green-700">message</span>
                </>
              }
              description="Vous recevez un accusé de réception avec une référence de suivi ; nous répondons sous cinq jours ouvrés."
              className="mb-6"
            />
            <InquiryForm variant="contact" defaults={{ fullName: viewer?.name, email: viewer?.email }} />
          </Reveal>
        </div>
      </Section>

      <Section variant="muted" padding="md" bordered aria-labelledby="orientation-title">
        <Reveal>
          <SectionHeading
            eyebrow="Gagner du temps"
            tone="gold"
            size="md"
            title={
              <span id="orientation-title">
                Votre demande concerne peut-être un <span className="italic text-gold-700">service dédié</span>
              </span>
            }
            className="mb-8"
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OrientationCard icon={LifeBuoy} title="Demande de service" description="Conseil juridique, médiation, création de section : déposez une demande suivie." href="/services" label="Voir les services" />
          <OrientationCard icon={GraduationCap} title="Formation" description="Inscriptions, demandes de formation groupée et suivi des parcours sur la plateforme." href={lmsHref('/')} label="Plateforme de formation" external />
          <OrientationCard icon={ShieldCheck} title="Vérifier un certificat" description="Contrôlez l'authenticité d'une attestation délivrée par la Fédération." href="/certificats/verifier" label="Vérifier" />
          <OrientationCard icon={HelpCircle} title="Questions fréquentes" description="Adhésion, formation, services, compte : les réponses aux questions les plus courantes." href="/faq" label="Consulter la FAQ" />
        </div>
      </Section>
    </>
  )
}

function OrientationCard({ icon: Icon, title, description, href, label, external = false }: { icon: typeof LifeBuoy; title: string; description: string; href: string; label: string; external?: boolean }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft pillar-top-blue">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold leading-tight text-navy">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
      <Button asChild variant="link" size="sm" className="mt-auto justify-start px-0">
        {external ? (
          <a href={href}>
            {label}
            <ArrowUpRight aria-hidden="true" />
          </a>
        ) : (
          <Link href={href}>{label}</Link>
        )}
      </Button>
    </article>
  )
}
