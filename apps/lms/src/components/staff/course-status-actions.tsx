'use client'

import { Archive, Eye, FileEdit, Globe } from 'lucide-react'
import { setCourseStatus } from '@/server/staff/admin-course-actions'
import { ActionButton } from './action-button'

/** Cycle de vie d'un cours : brouillon, relecture, publié (catalogue), archivé. */
export function CourseStatusActions({ courseId, status, hasPublishedVersion, canPublish }: { courseId: string; status: string; hasPublishedVersion: boolean; canPublish: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'DRAFT' ? (
        <ActionButton variant="outline" action={() => setCourseStatus({ courseId, status: 'REVIEW' })}>
          <Eye aria-hidden="true" />
          Soumettre à relecture
        </ActionButton>
      ) : null}
      {status !== 'PUBLISHED' && status !== 'ARCHIVED' && canPublish ? (
        <ActionButton
          variant="accent"
          action={() => setCourseStatus({ courseId, status: 'PUBLISHED' })}
          confirm={{
            title: 'Publier le cours au catalogue',
            description: hasPublishedVersion ? 'Le cours devient visible dans le catalogue de formation.fetrag.ga et sur le site institutionnel.' : 'Aucune version publiée : publiez d’abord une version depuis le panneau des versions, sinon le cours sera visible sans contenu.',
            confirmLabel: 'Publier',
          }}
        >
          <Globe aria-hidden="true" />
          Publier
        </ActionButton>
      ) : null}
      {status === 'PUBLISHED' && canPublish ? (
        <ActionButton variant="outline" action={() => setCourseStatus({ courseId, status: 'DRAFT' })} confirm={{ title: 'Retirer du catalogue', description: 'Le cours repasse en brouillon ; les inscriptions existantes sont conservées.', confirmLabel: 'Retirer' }}>
          <FileEdit aria-hidden="true" />
          Retirer du catalogue
        </ActionButton>
      ) : null}
      {status !== 'ARCHIVED' && canPublish ? (
        <ActionButton variant="ghost" action={() => setCourseStatus({ courseId, status: 'ARCHIVED' })} confirm={{ title: 'Archiver le cours', description: 'Le cours ne sera plus proposé ni dans le catalogue ni dans les demandes de formation.', confirmLabel: 'Archiver', destructive: true }}>
          <Archive aria-hidden="true" />
          Archiver
        </ActionButton>
      ) : null}
      {status === 'ARCHIVED' && canPublish ? (
        <ActionButton variant="outline" action={() => setCourseStatus({ courseId, status: 'DRAFT' })}>
          <FileEdit aria-hidden="true" />
          Restaurer en brouillon
        </ActionButton>
      ) : null}
    </div>
  )
}
