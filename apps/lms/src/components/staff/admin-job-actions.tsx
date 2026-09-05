'use client'

import { Play } from 'lucide-react'
import { processJobsNow } from '@/server/staff/admin-actions'
import { ActionButton } from './action-button'

/** Traitement manuel d'un lot de jobs (recette hors planificateur). */
export function ProcessJobsButton({ dueNow }: { dueNow: number }) {
  return (
    <ActionButton
      variant="primary"
      size="md"
      action={() => processJobsNow()}
      confirm={{
        title: 'Lancer le traitement des jobs',
        description: dueNow ? `${dueNow} job(s) sont prêts à être traités. Un lot de 10 jobs au plus sera exécuté immédiatement (emails, PDF de certificats, notifications).` : 'Aucun job n’est en attente ; le traitement vérifiera tout de même les jobs en échec à relancer.',
        confirmLabel: 'Traiter maintenant',
      }}
    >
      <Play aria-hidden="true" />
      Lancer le traitement des jobs
    </ActionButton>
  )
}
