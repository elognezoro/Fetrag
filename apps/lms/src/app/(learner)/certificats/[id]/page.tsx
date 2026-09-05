import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Eye, Hash, KeyRound, Users } from 'lucide-react'
import { certificateStatusLabels } from '@fetrag/contracts'
import { formatDate, formatDateTime } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Breadcrumbs, Button, Card, CardContent, Ribbon, StatusBadge } from '@fetrag/ui'
import { CertificateDownload } from '@/components/learner/certificate-download'
import { CertificatePreview } from '@/components/learner/certificate-preview'
import { guards } from '@/lib/auth'
import { getCertificateMeta } from '@/server/learner/certificate-queries'
import { getCertificateView } from '@/server/learner/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const principal = await guards.getPrincipal()
  const meta = principal ? await getCertificateMeta(principal, id) : null
  return {
    title: meta ? `${meta.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'} ${meta.number}` : 'Certificat',
    robots: { index: false, follow: false },
  }
}

/** Détail d'un certificat : aperçu stylé, téléchargement / génération du PDF, informations et vérification publique. */
export default async function CertificatePage({ params }: PageProps) {
  const { id } = await params
  const principal = await guards.requireUser(`/certificats/${id}`)
  const view = await getCertificateView(principal, id)
  if (!view) notFound()

  const { certificate, verifyUrl, pdfUrl, pillar } = view
  const isCertificate = certificate.kind === 'CERTIFICATE'
  const revoked = certificate.status === 'REVOKED'
  const expired = !revoked && (certificate.status === 'EXPIRED' || (certificate.expiresAt !== null && certificate.expiresAt.getTime() < Date.now()))
  const effectiveStatus = revoked ? 'REVOKED' : expired ? 'EXPIRED' : 'ISSUED'
  const tone = pillar === 'prevention' ? 'green' : pillar === 'defense' ? 'gold' : 'blue'
  const isOwner = certificate.userId === principal.id
  const validCount = certificate.verifications.filter((v) => v.result === 'valid').length

  return (
    <div className="container-fetrag py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Certificats', href: '/certificats' }, { label: certificate.number }]} homeHref="/dashboard" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <header>
            <Ribbon tone={tone}>{isCertificate ? 'Certificat' : 'Attestation'}</Ribbon>
            <h1 className="mt-4 text-2xl sm:text-3xl">{certificate.courseTitle}</h1>
            <p className="mt-2 text-sm text-neutral-600">
              {isOwner ? 'Délivré à votre nom' : `Délivré à ${certificate.holderName}`} le {formatDate(certificate.issuedAt)}
              {certificate.cohort ? ` · ${certificate.cohort.name}` : ''}
            </p>
          </header>

          {revoked ? (
            <Alert variant="danger">
              <AlertTitle>Document révoqué</AlertTitle>
              <AlertDescription>
                Ce document a été révoqué le {certificate.revokedAt ? formatDate(certificate.revokedAt) : 'à une date non précisée'}
                {certificate.revokedReason ? ` : ${certificate.revokedReason}` : '.'} Il ne peut plus être présenté comme valide. Contactez la coordination de la FETRAG pour toute question.
              </AlertDescription>
            </Alert>
          ) : expired ? (
            <Alert variant="warning">
              <AlertTitle>Validité dépassée</AlertTitle>
              <AlertDescription>La période de validité de ce document a expiré le {certificate.expiresAt ? formatDate(certificate.expiresAt) : ''}. Une nouvelle session du module permet de le renouveler.</AlertDescription>
            </Alert>
          ) : null}

          <CertificatePreview view={view} />
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <Card pillar={tone}>
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow text-[11px] text-neutral-500">Document officiel</p>
                <StatusBadge status={effectiveStatus} labels={certificateStatusLabels} size="sm" />
              </div>
              <CertificateDownload certificateId={certificate.id} initialPdfUrl={pdfUrl} revoked={revoked} verifyUrl={verifyUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg">Informations</h2>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Hash className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-neutral-500">Numéro</dt>
                    <dd className="break-all font-mono font-semibold text-navy">{certificate.number}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <KeyRound className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-neutral-500">Code de vérification</dt>
                    <dd className="break-all font-mono font-semibold text-navy">{certificate.verifyCode}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-neutral-500">Titulaire</dt>
                    <dd className="font-semibold text-navy">{certificate.holderName}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-neutral-500">Vérifications publiques</dt>
                    <dd className="text-neutral-800">
                      {validCount} contrôle{validCount > 1 ? 's' : ''} réussi{validCount > 1 ? 's' : ''}
                      {certificate.verifications[0] ? ` · dernier le ${formatDateTime(certificate.verifications[0].createdAt)}` : ''}
                    </dd>
                  </div>
                </div>
                {certificate.template ? (
                  <div>
                    <dt className="text-xs text-neutral-500">Modèle</dt>
                    <dd className="text-neutral-800">{certificate.template.name}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-5 flex flex-col gap-2">
                {certificate.enrollment ? (
                  <Button asChild variant="outline" size="md">
                    <Link href={`/cours/${certificate.enrollment.course.slug}`}>
                      <BookOpen aria-hidden="true" />
                      Fiche de la formation
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="ghost" size="md">
                  <Link href="/certificats">
                    <ArrowLeft aria-hidden="true" />
                    Tous mes certificats
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
