'use client'

import { CalendarCheck, XCircle } from 'lucide-react'
import { cancelTrainingRequest, resubmitTrainingRequest } from '@/server/staff/training-request-actions'
import { ActionButton } from './action-button'

/** Actions de l'organisation sur sa demande : accepter une date proposée (re-transmission) ou annuler. */
export function RequestOrgActions({ requestId, canCancel, canResubmit }: { requestId: string; canCancel: boolean; canResubmit: boolean }) {
  return (
    <>
      {canResubmit ? (
        <ActionButton
          variant="accent"
          action={() => resubmitTrainingRequest({ requestId })}
          confirm={{
            title: 'Accepter la date proposée',
            description: 'La demande sera transmise à nouveau à la coordination avec le calendrier proposé, pour acceptation et planification.',
            confirmLabel: 'Transmettre',
          }}
        >
          <CalendarCheck aria-hidden="true" />
          Accepter la proposition
        </ActionButton>
      ) : null}
      {canCancel ? (
        <ActionButton
          variant="ghost"
          action={(reason) => cancelTrainingRequest({ requestId, reason })}
          confirm={{
            title: 'Annuler la demande',
            description: 'Cette action est définitive : la demande sera close et la coordination informée.',
            confirmLabel: 'Annuler la demande',
            reasonLabel: 'Motif',
            reasonPlaceholder: 'Report du projet, participants indisponibles...',
            destructive: true,
          }}
        >
          <XCircle aria-hidden="true" />
          Annuler
        </ActionButton>
      ) : null}
    </>
  )
}
