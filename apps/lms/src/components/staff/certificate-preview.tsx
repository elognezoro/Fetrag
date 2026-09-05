import { QrCode } from 'lucide-react'
import { CertificateSeal, Emblem, MottoStrip, cn } from '@fetrag/ui'

export interface CertificatePreviewProps {
  kind: string
  titleText: string
  bodyText: string
  signatoryName: string
  signatoryTitle: string
  /** Titre de formation d'exemple (cours lié ou libellé générique). */
  courseTitle?: string | null
  validityMonths?: number | null
  className?: string
}

/**
 * Aperçu visuel d'un modèle de certificat : reprend la mise en page du PDF (sceau, anneau bleu,
 * titre serif, mention, signataire, numéro séquentiel et code QR de vérification).
 */
export function CertificatePreview({ kind, titleText, bodyText, signatoryName, signatoryTitle, courseTitle, validityMonths, className }: CertificatePreviewProps) {
  const label = kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'
  return (
    <figure className={cn('overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft', className)} aria-label={`Aperçu du modèle : ${titleText}`}>
      <div className="relative border-[6px] border-blue-600/90 bg-[radial-gradient(circle_at_top,rgba(2,89,199,0.06),transparent_60%)] p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold-400/70" aria-hidden="true" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-soft ring-4 ring-green-50">
                <Emblem size={36} decorative />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-navy">Fédération des Travailleurs du Gabon</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Programme de formation 2026</p>
              </div>
            </div>
            <CertificateSeal size={72} label={label} decorative />
          </div>

          <div className="text-center">
            <p className="eyebrow text-[11px] text-blue-600">{label}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{titleText}</h3>
            <p className="mt-4 text-sm text-neutral-600">Délivré à</p>
            <p className="font-display text-xl font-semibold text-ink">Prénom NOM du titulaire</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-700">
              {bodyText} <span className="font-semibold text-navy">« {courseTitle ?? 'Intitulé du module suivi'} »</span>
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-neutral-600">
              <span className="flex size-14 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-500" aria-hidden="true">
                <QrCode className="size-8" strokeWidth={1.5} />
              </span>
              <div>
                <p className="font-mono text-sm font-semibold text-navy">FETRAG-2026-000000</p>
                <p>Vérification : fetrag.ga/certificats/verifier</p>
                <p>{validityMonths ? `Validité : ${validityMonths} mois` : 'Sans date d’expiration'}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-display text-base font-semibold text-navy">{signatoryName}</p>
              <p className="text-neutral-600">{signatoryTitle}</p>
              <p className="mt-1 text-xs text-neutral-500">Libreville, le jour de l’émission</p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="border-t border-neutral-100 bg-neutral-50 px-4 py-2">
        <MottoStrip variant="inline" size="sm" />
      </figcaption>
    </figure>
  )
}
