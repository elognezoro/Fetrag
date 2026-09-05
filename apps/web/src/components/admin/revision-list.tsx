import { History, RotateCcw } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@fetrag/ui'
import { restoreRevisionAction } from '@/server/admin/content-actions'
import { ConfirmDialog } from './confirm-dialog'

export interface RevisionItem {
  id: string
  version: number
  title: string
  createdAt: Date
  editor: { name: string | null; email: string } | null
}

export interface RevisionListProps {
  revisions: RevisionItem[]
  currentVersion: number
  canWrite: boolean
}

/** Historique des versions d'une page avec restauration (composant serveur ; confirmation côté client). */
export function RevisionList({ revisions, currentVersion, canWrite }: RevisionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2">
          <History className="size-5 text-blue-600" aria-hidden="true" />
          Versions
        </CardTitle>
        <CardDescription>Chaque enregistrement crée une version ; restaurer une version ancienne en crée une nouvelle.</CardDescription>
      </CardHeader>
      <CardContent>
        {revisions.length === 0 ? (
          <p className="text-sm text-neutral-600">Aucune version enregistrée pour le moment.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-neutral-100">
            {revisions.map((revision) => {
              const current = revision.version === currentVersion
              return (
                <li key={revision.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                      <span className="font-display text-blue-600">v{revision.version}</span>
                      <span className="truncate">{revision.title}</span>
                      {current ? (
                        <Badge variant="success" size="sm">
                          Actuelle
                        </Badge>
                      ) : null}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDateTime(revision.createdAt)}
                      {revision.editor ? ` · ${revision.editor.name ?? revision.editor.email}` : ''}
                    </p>
                  </div>
                  {canWrite && !current ? (
                    <ConfirmDialog
                      trigger={
                        <Button type="button" variant="ghost" size="sm" leftIcon={<RotateCcw aria-hidden="true" />}>
                          Restaurer
                        </Button>
                      }
                      title={`Restaurer la version ${revision.version} ?`}
                      description="Le titre, le contenu et les blocs de cette version remplaceront la version actuelle (conservée dans l’historique)."
                      confirmLabel="Restaurer"
                      onConfirm={restoreRevisionAction.bind(null, revision.id)}
                    />
                  ) : null}
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
