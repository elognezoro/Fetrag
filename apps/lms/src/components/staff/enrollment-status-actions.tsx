'use client'

import { Ban, CheckCircle2, PauseCircle, PlayCircle } from 'lucide-react'
import { setEnrollmentStatusAdmin } from '@/server/staff/admin-actions'
import { ActionButton } from './action-button'

export interface EnrollmentStatusActionsProps {
  enrollmentId: string
  courseId: string
  holderName: string
  /** Transitions autorisées depuis le statut courant (calculées côté serveur). */
  allowed: string[]
}

/** Changement de statut d'une inscription (transitions validées par lms-core, motif journalisé). */
export function EnrollmentStatusActions({ enrollmentId, courseId, holderName, allowed }: EnrollmentStatusActionsProps) {
  if (!allowed.length) return <span className="text-xs text-neutral-500">Aucune transition</span>
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {allowed.includes('ACTIVE') ? (
        <ActionButton variant="secondary" size="sm" action={() => setEnrollmentStatusAdmin({ enrollmentId, courseId, status: 'ACTIVE' })} aria-label={`Activer l'inscription de ${holderName}`}>
          <PlayCircle aria-hidden="true" />
          Activer
        </ActionButton>
      ) : null}
      {allowed.includes('COMPLETED') ? (
        <ActionButton
          variant="outline"
          size="sm"
          action={(reason) => setEnrollmentStatusAdmin({ enrollmentId, courseId, status: 'COMPLETED', comment: reason })}
          confirm={{ title: `Marquer terminée l'inscription de ${holderName}`, description: 'La progression passe à 100 % et le certificat est émis si les critères du modèle sont remplis.', confirmLabel: 'Marquer terminée', reasonLabel: 'Motif (validation manuelle)', reasonPlaceholder: 'Formation suivie en présentiel, résultats validés par le formateur.' }}
          aria-label={`Marquer terminée l'inscription de ${holderName}`}
        >
          <CheckCircle2 aria-hidden="true" />
          Terminer
        </ActionButton>
      ) : null}
      {allowed.includes('SUSPENDED') ? (
        <ActionButton
          variant="ghost"
          size="sm"
          action={(reason) => setEnrollmentStatusAdmin({ enrollmentId, courseId, status: 'SUSPENDED', comment: reason })}
          confirm={{ title: `Suspendre l'inscription de ${holderName}`, description: 'L’apprenant perd temporairement l’accès au contenu ; l’inscription peut être réactivée.', confirmLabel: 'Suspendre', reasonLabel: 'Motif', destructive: true }}
          aria-label={`Suspendre l'inscription de ${holderName}`}
        >
          <PauseCircle aria-hidden="true" />
          Suspendre
        </ActionButton>
      ) : null}
      {allowed.includes('CANCELLED') ? (
        <ActionButton
          variant="ghost"
          size="sm"
          action={(reason) => setEnrollmentStatusAdmin({ enrollmentId, courseId, status: 'CANCELLED', comment: reason })}
          confirm={{ title: `Annuler l'inscription de ${holderName}`, description: 'L’apprenant est notifié par email. La progression est conservée pour l’historique.', confirmLabel: 'Annuler l’inscription', reasonLabel: 'Motif', destructive: true }}
          aria-label={`Annuler l'inscription de ${holderName}`}
        >
          <Ban aria-hidden="true" />
          Annuler
        </ActionButton>
      ) : null}
    </div>
  )
}
