import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import type { CertificateVerification } from '@fetrag/contracts'
import { Alert, AlertDescription, AlertTitle, Button, PageHeader, Reveal, Section, SectionHeading } from '@fetrag/ui'
import { CertificateResult } from '@/components/public/certificate-result'
import { CertificateVerifyForm } from '@/components/public/certificate-verify-form'
import { normalizeCodeInput, verifyCertificate } from '@/server/public/certificates'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ code: string }>
}

const unknownResult: CertificateVerification = {
  valid: false,
  status: null,
  number: null,
  holderName: null,
  courseTitle: null,
  issuedAt: null,
  expiresAt: null,
  kind: null,
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const normalized = normalizeCodeInput(decodeURIComponent(code))
  return {
    title: normalized ? `Vérification du certificat ${normalized}` : 'Vérification de certificat',
    description: "Résultat de la vérification d'authenticité d'un certificat délivré par la Fédération des Travailleurs du Gabon.",
    robots: { index: false, follow: false },
  }
}

/** Résultat de vérification : sceau vert (valide), rouge (révoqué), or (expiré) ou gris (introuvable), données minimales. */
export default async function VerifyResultPage({ params }: PageProps) {
  const { code } = await params
  const normalized = normalizeCodeInput(decodeURIComponent(code))
  const outcome = normalized ? await verifyCertificate(normalized) : { code: decodeURIComponent(code).slice(0, 40), result: unknownResult, unavailable: false }
  const result = outcome.result ?? unknownResult

  return (
    <>
      <PageHeader
        eyebrow="Certification"
        tone={result.valid ? 'green' : 'gold'}
        title={
          <>
            Vérification du <span className="italic text-gold-700">certificat</span>
          </>
        }
        description={`Résultat pour le code ${outcome.code}. Chaque consultation est journalisée par la Fédération, sans conservation de données personnelles du vérificateur.`}
        breadcrumbs={[{ label: 'Certificats', href: '/certificats/verifier' }, { label: 'Vérifier', href: '/certificats/verifier' }, { label: outcome.code }]}
        homeHref="/"
      />

      <Section variant="white" padding="md" rings={{ position: 'top-right', opacity: 0.05, rings: 3 }}>
        {outcome.unavailable ? (
          <Alert variant="warning" className="mb-8">
            <AlertTitle>Vérification momentanément indisponible</AlertTitle>
            <AlertDescription>Le service de vérification n&apos;a pas répondu. Réessayez dans quelques instants ; le code saisi n&apos;a pas été altéré.</AlertDescription>
          </Alert>
        ) : (
          <Reveal>
            <CertificateResult code={outcome.code} result={result} />
          </Reveal>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <Reveal delay={0.1} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
            <SectionHeading eyebrow="Nouvelle vérification" tone="blue" size="md" title="Vérifier un autre document" className="mb-6" />
            <CertificateVerifyForm compact />
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col gap-5">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="eyebrow text-[11px] text-neutral-500">Un doute sur un document ?</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                Si le résultat ne correspond pas au document présenté (nom, formation, date), signalez-le à la Fédération : les certificats frauduleux sont
                systématiquement traités.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/contact">
                  <Mail aria-hidden="true" />
                  Signaler un document
                </Link>
              </Button>
            </div>
            <Button asChild variant="ghost" size="md" className="self-start">
              <Link href="/certificats/verifier">
                <ArrowLeft aria-hidden="true" />
                Retour à la vérification
              </Link>
            </Button>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
