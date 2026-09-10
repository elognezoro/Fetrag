import { BadgeCheck, CalendarDays, FileQuestion, GraduationCap, Hash, User, XCircle, type LucideIcon } from 'lucide-react'
import type { CertificateVerification } from '@fetrag/contracts'
import { certificateStatusLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { Badge, CertificateSeal, cn } from '@fetrag/ui'

interface CertificateResultProps {
  code: string
  result: CertificateVerification
  className?: string
}

type Outcome = 'valid' | 'revoked' | 'expired' | 'unknown'

const outcomes: Record<Outcome, { label: string; description: string; icon: LucideIcon; ring: string; badge: 'success' | 'danger' | 'warning' | 'neutral'; sealClass: string }> = {
  valid: {
    label: 'Certificat valide',
    description: 'Ce document a bien été émis par la Fédération des Travailleurs du Gabon et est toujours en vigueur.',
    icon: BadgeCheck,
    ring: 'border-green-500 bg-green-50',
    badge: 'success',
    sealClass: 'text-green-700',
  },
  revoked: {
    label: 'Certificat révoqué',
    description: 'Ce document a été révoqué par la Fédération : il ne doit plus être considéré comme valide.',
    icon: XCircle,
    ring: 'border-danger bg-danger-soft',
    badge: 'danger',
    sealClass: 'text-danger',
  },
  expired: {
    label: 'Certificat expiré',
    description: "La période de validité de ce document est dépassée. Le titulaire peut se rapprocher de la Fédération pour un renouvellement.",
    icon: XCircle,
    ring: 'border-gold-500 bg-gold-50',
    badge: 'warning',
    sealClass: 'text-gold-700',
  },
  unknown: {
    label: 'Certificat introuvable',
    description: "Aucun certificat ne correspond à ce code. Vérifiez la saisie (12 caractères, tirets facultatifs) ou le numéro figurant sur le document.",
    icon: FileQuestion,
    ring: 'border-neutral-300 bg-neutral-100',
    badge: 'neutral',
    sealClass: 'text-neutral-400',
  },
}

function outcomeOf(result: CertificateVerification): Outcome {
  if (result.valid) return 'valid'
  if (result.status === 'REVOKED') return 'revoked'
  if (result.status === 'EXPIRED') return 'expired'
  return 'unknown'
}

/** Résultat de vérification d'un certificat : sceau coloré (vert / rouge / gris), verdict et données minimales. */
export function CertificateResult({ code, result, className }: CertificateResultProps) {
  const outcome = outcomeOf(result)
  const meta = outcomes[outcome]
  const Icon = meta.icon
  const kindLabel = result.kind === 'CERTIFICATE' ? 'Certificat' : result.kind === 'ATTESTATION' ? 'Attestation' : 'Certificat'

  return (
    <section aria-live="polite" className={cn('overflow-hidden rounded-2xl border-2 bg-white shadow-lift', meta.ring, className)}>
      <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="mx-auto flex flex-col items-center gap-3">
          <div className={cn('relative', meta.sealClass)}>
            <CertificateSeal size={176} label={kindLabel} variant={outcome === 'valid' ? 'color' : 'mono'} title={meta.label} className={outcome === 'unknown' ? 'opacity-60' : undefined} />
            <span
              aria-hidden="true"
              className={cn(
                'absolute -bottom-2 -right-2 flex size-12 items-center justify-center rounded-full border-4 border-white shadow-soft',
                outcome === 'valid' ? 'bg-green-500 text-navy' : outcome === 'unknown' ? 'bg-neutral-300 text-neutral-700' : outcome === 'expired' ? 'bg-gold-500 text-navy' : 'bg-danger text-white',
              )}
            >
              <Icon className="size-6" strokeWidth={2} />
            </span>
          </div>
          <Badge variant={meta.badge} size="lg">
            {meta.label}
          </Badge>
        </div>

        <div className="min-w-0">
          <p className="eyebrow text-[11px] text-neutral-500">Résultat de la vérification</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-navy sm:text-3xl">{meta.label}</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">{meta.description}</p>
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <Hash className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-neutral-500">Code vérifié</dt>
                <dd className="break-all font-mono text-sm font-semibold text-navy">{result.number ?? code}</dd>
              </div>
            </div>
            {result.holderName ? (
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <User className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-neutral-500">Titulaire</dt>
                  <dd className="text-sm font-semibold text-navy">{result.holderName}</dd>
                </div>
              </div>
            ) : null}
            {result.courseTitle ? (
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:col-span-2">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-neutral-500">Formation</dt>
                  <dd className="text-sm font-semibold text-navy">{result.courseTitle}</dd>
                </div>
              </div>
            ) : null}
            {result.issuedAt ? (
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-neutral-500">Émis le</dt>
                  <dd className="text-sm font-semibold text-navy">{formatDate(result.issuedAt)}</dd>
                </div>
              </div>
            ) : null}
            {result.expiresAt ? (
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-neutral-500">{result.status === 'EXPIRED' ? 'Expiré le' : 'Valable jusqu’au'}</dt>
                  <dd className="text-sm font-semibold text-navy">{formatDate(result.expiresAt)}</dd>
                </div>
              </div>
            ) : null}
            {result.status ? (
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-neutral-500">Statut</dt>
                  <dd className="text-sm font-semibold text-navy">{certificateStatusLabels[result.status]}</dd>
                </div>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  )
}
