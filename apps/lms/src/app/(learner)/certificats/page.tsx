import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, BookOpen, QrCode, ShieldCheck, Star } from 'lucide-react'
import { Button, CertificateSeal, EmptyState, PageHeader, Reveal, Stagger, StaggerItem, StatTile } from '@fetrag/ui'
import { CertificateCard } from '@/components/learner/certificate-card'
import { guards } from '@/lib/auth'
import { webHref } from '@/lib/site'
import { listMyCertificates } from '@/server/learner/certificate-queries'

export const metadata: Metadata = {
  title: 'Mes certificats',
  description: 'Attestations et certificats numérotés délivrés par la FETRAG à l’issue de vos formations, avec code de vérification publique.',
  robots: { index: false, follow: false },
}

/** Liste des attestations et certificats de l'apprenant : cartes avec sceau, compteurs, explication de la vérification. */
export default async function CertificatesPage() {
  const principal = await guards.requireUser('/certificats')
  const items = await listMyCertificates(principal)
  const valid = items.filter((item) => item.effectiveStatus === 'ISSUED').length
  const certificates = items.filter((item) => item.certificate.kind === 'CERTIFICATE').length
  const attestations = items.length - certificates

  return (
    <>
      <PageHeader
        eyebrow="Certificats"
        tone="gold"
        title={
          <>
            Vos <span className="italic text-gold-600">attestations</span> et certificats
          </>
        }
        description="Chaque module validé donne lieu à un document numéroté, signé par le Secrétaire Général et vérifiable publiquement grâce à son code QR."
        breadcrumbs={[{ label: 'Tableau de bord', href: '/dashboard' }, { label: 'Certificats' }]}
        homeHref="/"
        aside={<CertificateSeal size={150} label="CERTIFICAT" title="Sceau des certificats FETRAG" className="drop-shadow-[0_8px_24px_rgba(249,200,4,0.35)]" />}
      />

      <div className="container-fetrag flex flex-col gap-10 py-10 sm:py-12">
        {items.length > 0 ? (
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3" role="list" aria-label="Récapitulatif">
              <StatTile role="listitem" animate value={valid} label="Documents valides" icon={ShieldCheck} tone="green" />
              <StatTile role="listitem" animate value={certificates} label="Certificats" icon={Award} tone="gold" />
              <StatTile role="listitem" animate value={attestations} label="Attestations" icon={Star} tone="blue" />
            </div>
          </Reveal>
        ) : null}

        {items.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Aucun certificat pour le moment"
            description="Terminez toutes les activités obligatoires d’un module et atteignez le seuil de réussite pour recevoir votre attestation ou votre certificat numéroté."
            action={
              <Button asChild variant="primary">
                <Link href="/mes-formations">
                  <BookOpen aria-hidden="true" />
                  Reprendre mes formations
                </Link>
              </Button>
            }
          />
        ) : (
          <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Mes certificats">
            {items.map((item) => (
              <StaggerItem key={item.certificate.id} as="li" className="h-full">
                <CertificateCard item={item} />
              </StaggerItem>
            ))}
          </Stagger>
        )}

        <section aria-labelledby="verification-title" className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft pillar-top-gold sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-gold-50 text-gold-700">
            <QrCode className="size-8" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div>
            <h2 id="verification-title" className="text-xl sm:text-2xl">
              Un document vérifiable par tous
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Chaque document porte un numéro unique et un code QR renvoyant vers la page de vérification publique de la FETRAG. Un employeur, une organisation ou un partenaire peut
              y confirmer en quelques secondes l&apos;authenticité, le titulaire, la formation et la validité du document.
            </p>
            <Button asChild variant="link" className="mt-3 px-0">
              <a href={webHref('/certificats/verifier')} target="_blank" rel="noopener noreferrer">
                <ShieldCheck aria-hidden="true" />
                Ouvrir la page de vérification publique
              </a>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
