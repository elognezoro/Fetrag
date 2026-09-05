import Link from 'next/link'
import { ArrowRight, CalendarDays, FileDown, Hash } from 'lucide-react'
import { certificateStatusLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { CertificateSeal, StatusBadge, cn, resolveTone, toneClasses } from '@fetrag/ui'
import type { CertificateListItem } from '@/server/learner/certificate-queries'

interface CertificateCardProps {
  item: CertificateListItem
}

/** Carte d'un certificat ou d'une attestation : sceau, numéro, formation, date, statut effectif. */
export function CertificateCard({ item }: CertificateCardProps) {
  const { certificate, pillar, effectiveStatus } = item
  const tone = resolveTone(pillar)
  const classes = toneClasses[tone]
  const isCertificate = certificate.kind === 'CERTIFICATE'
  const valid = effectiveStatus === 'ISSUED'
  return (
    <article className={cn('flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift sm:p-6', classes.topRule, !valid && 'opacity-90')}>
      <div className="flex items-start gap-4">
        <CertificateSeal size={72} label={isCertificate ? 'CERTIFICAT' : 'ATTESTATION'} variant={valid ? 'color' : 'mono'} className={cn('shrink-0', !valid && 'text-neutral-400')} title={isCertificate ? 'Sceau du certificat' : "Sceau de l'attestation"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow text-[10px] text-neutral-500">{isCertificate ? 'Certificat' : 'Attestation'}</span>
            <StatusBadge status={effectiveStatus} size="sm" labels={certificateStatusLabels} />
          </div>
          <h3 className="mt-2 text-lg leading-snug">
            <Link href={`/certificats/${certificate.id}`} className="hover:text-blue-700 hover:underline">
              {certificate.courseTitle}
            </Link>
          </h3>
          <dl className="mt-3 flex flex-col gap-1 text-xs text-neutral-600">
            <div className="inline-flex items-center gap-1.5">
              <Hash className="size-3.5 text-neutral-400" aria-hidden="true" />
              <dt className="sr-only">Numéro</dt>
              <dd className="font-mono font-semibold tracking-wide text-navy">{certificate.number}</dd>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-neutral-400" aria-hidden="true" />
              <dt className="sr-only">Délivré le</dt>
              <dd>
                Délivré le {formatDate(certificate.issuedAt)}
                {certificate.expiresAt ? ` · valable jusqu'au ${formatDate(certificate.expiresAt)}` : ''}
              </dd>
            </div>
            {certificate.cohort ? (
              <div className="inline-flex items-center gap-1.5">
                <dt className="sr-only">Cohorte</dt>
                <dd className="truncate">{certificate.cohort.name}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
          <FileDown className="size-3.5" aria-hidden="true" />
          {certificate.pdfUrl ? 'PDF disponible' : 'PDF à générer'}
        </span>
        <Link href={`/certificats/${certificate.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
          Consulter
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
