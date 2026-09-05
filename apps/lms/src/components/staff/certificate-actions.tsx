'use client'

import { useId, useState } from 'react'
import { Award, Ban, RefreshCw } from 'lucide-react'
import { NativeSelect } from '@fetrag/ui'
import { issueCertificate, regenerateCertificatePdf, revokeCertificate } from '@/server/staff/coordination-actions'
import { ActionButton } from './action-button'

export interface CertificateRowActionsProps {
  certificateId: string
  number: string
  status: string
  hasPdf: boolean
}

/** Actions sur un certificat émis : révocation motivée, régénération du PDF. */
export function CertificateRowActions({ certificateId, number, status, hasPdf }: CertificateRowActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {status === 'ISSUED' ? (
        <ActionButton
          variant="ghost"
          size="sm"
          action={(reason) => revokeCertificate({ certificateId, reason: reason ?? '' })}
          confirm={{
            title: `Révoquer le certificat ${number}`,
            description: 'La vérification publique indiquera « révoqué ». Le titulaire est notifié. Cette action est journalisée.',
            confirmLabel: 'Révoquer',
            reasonLabel: 'Motif de révocation',
            reasonPlaceholder: 'Erreur d’identité, fraude constatée, décision de la commission...',
            destructive: true,
          }}
          aria-label={`Révoquer le certificat ${number}`}
        >
          <Ban aria-hidden="true" />
          Révoquer
        </ActionButton>
      ) : null}
      <ActionButton variant="ghost" size="sm" action={() => regenerateCertificatePdf({ certificateId })} aria-label={`Régénérer le PDF du certificat ${number}`}>
        <RefreshCw aria-hidden="true" />
        {hasPdf ? 'Régénérer le PDF' : 'Générer le PDF'}
      </ActionButton>
    </div>
  )
}

export interface IssueCertificateButtonProps {
  enrollmentId: string
  holderName: string
  eligible: boolean
  reasons: string[]
  existingCertificateId: string | null
  templates: Array<{ id: string; name: string; isDefault: boolean }>
}

/** Émission manuelle d'un certificat pour une inscription (après vérification d'éligibilité). */
export function IssueCertificateButton({ enrollmentId, holderName, eligible, reasons, existingCertificateId, templates }: IssueCertificateButtonProps) {
  const id = useId()
  const [templateId, setTemplateId] = useState('')
  if (existingCertificateId) return <span className="text-xs text-neutral-500">Déjà émis</span>
  return (
    <div className="flex flex-wrap items-center gap-2">
      {templates.length > 1 ? (
        <>
          <label htmlFor={`${id}-t`} className="sr-only">
            Modèle pour {holderName}
          </label>
          <NativeSelect id={`${id}-t`} value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="w-52" options={[{ value: '', label: 'Modèle par défaut' }, ...templates.map((t) => ({ value: t.id, label: t.name }))]} />
        </>
      ) : null}
      <ActionButton
        variant={eligible ? 'primary' : 'outline'}
        size="sm"
        action={() => issueCertificate({ enrollmentId, templateId: templateId || null })}
        confirm={
          eligible
            ? undefined
            : {
                title: `Émettre malgré l'inéligibilité de ${holderName}`,
                description: `Critères non satisfaits : ${reasons.join(' ; ') || 'non précisés'}. L'émission manuelle est journalisée sous votre responsabilité.`,
                confirmLabel: 'Émettre quand même',
              }
        }
        aria-label={`Émettre le certificat de ${holderName}`}
      >
        <Award aria-hidden="true" />
        Émettre
      </ActionButton>
    </div>
  )
}
