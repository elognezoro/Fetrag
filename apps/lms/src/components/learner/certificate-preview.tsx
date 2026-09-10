import { certificateStatusLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { CertificateSeal, Emblem, MottoStrip, StatusBadge, cn } from '@fetrag/ui'
import { siteConfig } from '@/lib/site'
import type { CertificateView } from '@/server/learner/queries'

interface CertificatePreviewProps {
  view: CertificateView
  className?: string
}

/**
 * Aperçu stylé du document (sans PDF) : bande tricolore, emblème, mention, titulaire en serif,
 * formation, numéro, résultats, signataire, QR de vérification et sceau. Filigrane si révoqué.
 */
export function CertificatePreview({ view, className }: CertificatePreviewProps) {
  const { certificate, qrDataUrl, verifyUrl } = view
  const isCertificate = certificate.kind === 'CERTIFICATE'
  const template = certificate.template
  const title = template?.titleText ?? (isCertificate ? 'Certificat de formation' : 'Attestation de formation')
  const body = template?.bodyText ?? 'a suivi avec succès la formation'
  const signatoryName = template?.signatoryName ?? siteConfig.secretaryGeneral
  const signatoryTitle = template?.signatoryTitle ?? 'Secrétaire Général de la FETRAG'
  const revoked = certificate.status === 'REVOKED'
  const expired = certificate.status === 'EXPIRED' || (certificate.expiresAt !== null && certificate.expiresAt.getTime() < Date.now())

  return (
    <figure className={cn('relative isolate overflow-hidden rounded-2xl border-[6px] border-blue-600 bg-white shadow-soft', className)} aria-label={`Aperçu : ${title} n° ${certificate.number}`}>
      <div aria-hidden="true" className="tricolor-band h-2 w-full" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 size-72 rounded-full border-[18px] border-blue-50" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 -z-10 size-80 rounded-full border-[18px] border-green-50" />

      {revoked || expired ? (
        <p aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="-rotate-12 rounded-xl border-4 border-danger/60 px-6 py-2 font-display text-4xl font-bold uppercase tracking-[0.2em] text-danger/60 sm:text-6xl">{revoked ? 'Révoqué' : 'Expiré'}</span>
        </p>
      ) : null}

      <div className="px-6 py-8 text-center sm:px-12 sm:py-12">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex size-20 items-center justify-center rounded-full bg-white shadow-soft ring-4 ring-gold-100">
            <Emblem size={56} decorative />
          </span>
          <p className="font-display text-sm font-semibold tracking-tight text-navy sm:text-base">{siteConfig.fullName}</p>
          <p className="eyebrow text-[10px] text-neutral-500">Programme de formation des leaders syndicaux · Session 2026</p>
        </div>

        <h2 className="mt-8 font-display text-3xl font-semibold uppercase tracking-[0.08em] text-blue-700 sm:text-4xl">{title}</h2>
        <p className="mt-6 text-sm text-neutral-600">La Fédération des Travailleurs du Gabon certifie que</p>
        <p className="mt-3 font-display text-3xl font-semibold text-navy sm:text-5xl">{certificate.holderName}</p>
        <p className="mt-4 text-sm text-neutral-600">{body}</p>
        <p className="mt-2 font-display text-xl font-semibold italic text-green-800 sm:text-2xl">« {certificate.courseTitle} »</p>

        <dl className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="eyebrow text-[10px] text-neutral-500">Délivré le</dt>
            <dd className="mt-1 font-semibold text-navy">{formatDate(certificate.issuedAt)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[10px] text-neutral-500">Numéro</dt>
            <dd className="mt-1 font-mono text-xs font-semibold tracking-wide text-navy sm:text-sm">{certificate.number}</dd>
          </div>
          {certificate.score !== null ? (
            <div>
              <dt className="eyebrow text-[10px] text-neutral-500">Résultat</dt>
              <dd className="mt-1 font-semibold text-navy">{certificate.score} %</dd>
            </div>
          ) : null}
          {certificate.attendanceRate !== null ? (
            <div>
              <dt className="eyebrow text-[10px] text-neutral-500">Assiduité</dt>
              <dd className="mt-1 font-semibold text-navy">{certificate.attendanceRate} %</dd>
            </div>
          ) : null}
          {certificate.expiresAt ? (
            <div>
              <dt className="eyebrow text-[10px] text-neutral-500">Validité</dt>
              <dd className="mt-1 font-semibold text-navy">jusqu&apos;au {formatDate(certificate.expiresAt)}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-10 grid grid-cols-1 items-end gap-6 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col items-center sm:items-start">
            {/* Code QR généré côté serveur en data URL : aucune optimisation next/image possible ni utile. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`Code QR de vérification du document ${certificate.number}`} width={112} height={112} className="size-28 rounded-lg border border-neutral-200 bg-white p-1" />
            <p className="mt-2 max-w-[14rem] break-all text-left text-[10px] leading-snug text-neutral-500">{verifyUrl}</p>
          </div>
          <CertificateSeal size={120} label={isCertificate ? 'CERTIFICAT' : 'ATTESTATION'} className="mx-auto" title="Sceau officiel de la FETRAG" />
          <div className="flex flex-col items-center sm:items-end">
            <p className="font-display text-xl italic text-navy">{signatoryName}</p>
            <div aria-hidden="true" className="mt-1 h-px w-40 bg-gradient-to-r from-blue-600 via-green-500 to-gold-500" />
            <p className="mt-1 text-xs text-neutral-600 sm:text-right">{signatoryTitle}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <MottoStrip variant="inline" size="sm" />
          <StatusBadge status={revoked ? 'REVOKED' : expired ? 'EXPIRED' : 'ISSUED'} labels={certificateStatusLabels} size="sm" />
        </div>
      </div>
      <figcaption className="sr-only">
        {title} n° {certificate.number}, délivré à {certificate.holderName} le {formatDate(certificate.issuedAt)} pour la formation {certificate.courseTitle}.
      </figcaption>
    </figure>
  )
}
