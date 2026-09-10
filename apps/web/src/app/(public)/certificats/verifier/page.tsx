import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { GraduationCap, QrCode, ScanSearch, ShieldCheck } from 'lucide-react'
import { CertificateSeal, PageHeader, Reveal, Section, SectionHeading } from '@fetrag/ui'
import { CertificateVerifyForm } from '@/components/public/certificate-verify-form'
import { StepsList } from '@/components/public/steps-list'
import { lmsHref, siteConfig } from '@/lib/site'
import { normalizeCodeInput } from '@/server/public/certificates'
import { single, type SearchParamsRecord } from '@/server/public/search-params'

export const metadata: Metadata = {
  title: 'Vérifier un certificat',
  description: `Vérifiez l'authenticité d'une attestation ou d'un certificat de formation délivré par la ${siteConfig.fullName} grâce à son code de vérification ou à son numéro.`,
  alternates: { canonical: '/certificats/verifier' },
}

interface PageProps {
  searchParams: Promise<SearchParamsRecord>
}

const steps = [
  { title: 'Repérer le code', description: "Sur le document, sous le QR code, figure un code de vérification ; en en-tête, le numéro du certificat (FETRAG-…).", icon: QrCode },
  { title: 'Saisir le code', description: 'Recopiez-le dans le formulaire, avec ou sans tirets, ou scannez le QR code qui mène directement au résultat.', icon: ScanSearch },
  { title: 'Lire le résultat', description: "Sceau vert : certificat valide. Rouge : révoqué. Gris : introuvable. Seules les données minimales sont affichées.", icon: ShieldCheck },
]

/** Vérification publique d'un certificat : formulaire GET redirigé vers la page de résultat par code. */
export default async function VerifyCertificatePage({ searchParams }: PageProps) {
  const params = await searchParams
  const raw = single(params.code)
  const normalized = raw ? normalizeCodeInput(raw) : null
  if (normalized) redirect(`/certificats/verifier/${encodeURIComponent(normalized)}`)
  const error = raw && !normalized ? 'Format invalide : 4 à 40 caractères, lettres, chiffres et tirets uniquement.' : undefined

  return (
    <>
      <PageHeader
        eyebrow="Certification"
        tone="gold"
        title={
          <>
            Vérifier <span className="italic text-gold-700">l&apos;authenticité</span> d&apos;un certificat
          </>
        }
        description="Chaque attestation et chaque certificat délivrés par la Fédération portent un numéro unique et un code de vérification. Employeurs, organisations et institutions peuvent contrôler leur validité en quelques secondes."
        breadcrumbs={[{ label: 'Certificats', href: '/certificats/verifier' }, { label: 'Vérifier' }]}
        homeHref="/"
        aside={
          <Reveal delay={0.1} y={24} className="mx-auto">
            <CertificateSeal size={180} label="Certificat" decorative />
          </Reveal>
        }
      />

      <Section variant="white" padding="md" rings={{ position: 'left', opacity: 0.05, rings: 3 }}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <Reveal className="rounded-2xl border border-gold-200 bg-white p-6 shadow-lift pillar-top-gold sm:p-8">
            <SectionHeading eyebrow="Vérification" tone="gold" size="md" title="Saisir le code du document" className="mb-6" />
            <CertificateVerifyForm defaultCode={raw} error={error} />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-5">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="eyebrow text-[11px] text-neutral-500">Ce que la vérification affiche</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-neutral-700">
                <li>Le statut du document : valide, révoqué, expiré ou introuvable.</li>
                <li>Le nom du titulaire et l&apos;intitulé de la formation.</li>
                <li>La date d&apos;émission et, le cas échéant, la date de fin de validité.</li>
              </ul>
              <p className="mt-3 text-xs text-neutral-500">Aucune autre donnée personnelle n&apos;est exposée. Chaque consultation est journalisée par la Fédération.</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
              <p className="eyebrow text-[11px] text-neutral-500">Vous êtes titulaire ?</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">Retrouvez vos attestations et certificats, avec leur QR code, dans votre espace sur la plateforme de formation.</p>
              <Link href={lmsHref('/certificats')} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline">
                <GraduationCap className="size-4" aria-hidden="true" />
                Mes certificats
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section variant="muted" padding="md" bordered aria-labelledby="verify-steps-title">
        <Reveal>
          <SectionHeading
            eyebrow="Comment ça marche"
            tone="blue"
            size="md"
            title={
              <span id="verify-steps-title">
                Trois étapes, un <span className="italic text-blue-600">résultat</span> immédiat
              </span>
            }
            className="mb-8"
          />
        </Reveal>
        <StepsList steps={steps} columns={3} />
      </Section>
    </>
  )
}
