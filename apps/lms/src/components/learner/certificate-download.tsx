'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FileDown, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, Button, toast } from '@fetrag/ui'
import { renderCertificateAction } from '@/server/learner/certificate-actions'

interface CertificateDownloadProps {
  certificateId: string
  /** URL signée du PDF (null tant qu'il n'a pas été rendu). */
  initialPdfUrl: string | null
  revoked: boolean
  verifyUrl: string
}

/**
 * Téléchargement du PDF : lien signé si le document existe, sinon « Générer le PDF »
 * (job `certificate.render` traité immédiatement), avec message d'état et relance possible.
 */
export function CertificateDownload({ certificateId, initialPdfUrl, revoked, verifyUrl }: CertificateDownloadProps) {
  const router = useRouter()
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl)
  const [message, setMessage] = useState<{ tone: 'info' | 'warning' | 'danger'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function generate() {
    setMessage(null)
    startTransition(async () => {
      const result = await renderCertificateAction(certificateId)
      if (!result.ok) {
        setMessage({ tone: 'danger', text: result.error })
        toast.error(result.error)
        return
      }
      if (result.data.ready && result.data.pdfUrl) {
        setPdfUrl(result.data.pdfUrl)
        setMessage({ tone: 'info', text: result.data.message })
        toast.success(result.data.message)
        router.refresh()
      } else {
        setMessage({ tone: 'warning', text: result.data.message })
      }
    })
  }

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      {revoked ? (
        <Alert variant="danger">
          <AlertDescription>Ce document a été révoqué par la coordination : il ne peut plus être téléchargé ni présenté comme valide.</AlertDescription>
        </Alert>
      ) : pdfUrl ? (
        <>
          <Button asChild variant="gold" size="lg" className="w-full">
            <a href={pdfUrl} download rel="noopener">
              <FileDown aria-hidden="true" />
              Télécharger le PDF
            </a>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={generate} disabled={pending} leftIcon={pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}>
            Régénérer le document
          </Button>
        </>
      ) : (
        <>
          <Button type="button" variant="gold" size="lg" className="w-full" onClick={generate} loading={pending} loadingLabel="Génération du PDF en cours" leftIcon={<FileDown aria-hidden="true" />}>
            Générer le PDF
          </Button>
          <p className="text-xs text-neutral-500">Le document officiel (PDF signé, QR de vérification) est produit à la demande. Comptez quelques secondes.</p>
        </>
      )}

      {message ? (
        <Alert variant={message.tone}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <Button asChild variant="outline" size="md" className="w-full">
        <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
          <ShieldCheck aria-hidden="true" />
          Vérification publique
        </a>
      </Button>
    </div>
  )
}
