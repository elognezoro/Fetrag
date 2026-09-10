import { ScrollText } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Card, EmptyState, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from '@fetrag/ui'

export interface AuditRow {
  id: string
  action: string
  entityType: string
  entityId: string | null
  actorEmail: string | null
  createdAt: Date | string
  before?: unknown
  after?: unknown
  ipHash?: string | null
  correlationId?: string | null
}

/** Libellés français des actions d'audit LMS. */
export const auditActionLabels: Record<string, string> = {
  'course.published': 'Cours publié',
  'course.version_created': 'Version créée',
  'enrollment.created': 'Inscription créée',
  'enrollment.status_changed': 'Statut d’inscription modifié',
  'grade.recorded': 'Note enregistrée',
  'attendance.recorded': 'Présence enregistrée',
  'certificate.issued': 'Certificat émis',
  'certificate.revoked': 'Certificat révoqué',
  'training_request.submitted': 'Demande de formation soumise',
  'training_request.decided': 'Décision sur une demande',
  'role.granted': 'Rôle attribué',
  'role.revoked': 'Rôle retiré',
  'content.created': 'Contenu créé',
  'content.updated': 'Contenu modifié',
  'content.published': 'Contenu publié',
  'content.archived': 'Contenu archivé ou supprimé',
  'settings.updated': 'Paramètre modifié',
}

const entityLabels: Record<string, string> = {
  Course: 'Cours',
  CourseVersion: 'Version de cours',
  CourseModule: 'Module',
  Lesson: 'Leçon',
  Activity: 'Activité',
  Quiz: 'Quiz',
  Assignment: 'Devoir',
  LiveSession: 'Séance en direct',
  Question: 'Question',
  CertificateTemplate: 'Modèle de certificat',
  Certificate: 'Certificat',
  Cohort: 'Cohorte',
  TrainingSession: 'Session',
  Enrollment: 'Inscription',
  Organization: 'Organisation',
  User: 'Utilisateur',
  SystemSetting: 'Paramètre',
  TrainingRequest: 'Demande de formation',
  Submission: 'Remise',
  Attendance: 'Présence',
}

export function auditEntityLabel(entityType: string): string {
  return entityLabels[entityType] ?? entityType
}

function actionTone(action: string): 'blue' | 'green' | 'gold' | 'danger' | 'neutral' {
  if (action.endsWith('.revoked') || action.endsWith('.archived') || action === 'enrollment.status_changed') return 'gold'
  if (action.endsWith('.issued') || action.endsWith('.published') || action.endsWith('.granted')) return 'green'
  if (action.startsWith('role.') || action.startsWith('settings.')) return 'blue'
  return 'neutral'
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null
  return (
    <div className="min-w-0">
      <p className="eyebrow mb-1 text-[11px] text-neutral-500">{label}</p>
      <pre className="max-h-64 overflow-auto rounded-lg bg-neutral-900 p-3 text-xs leading-relaxed text-neutral-100">{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

/** Tableau du journal d'audit avec détail dépliable (avant / après) par entrée. */
export function AuditLogTable({ rows, compact = false, className }: { rows: AuditRow[]; compact?: boolean; className?: string }) {
  if (!rows.length) {
    return (
      <Card className={className}>
        <EmptyState compact icon={ScrollText} title="Aucune entrée" description="Les actions LMS (cours, inscriptions, notes, présences, certificats, demandes, rôles) apparaîtront ici." />
      </Card>
    )
  }
  return (
    <Table wrapperClassName={className}>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entité</TableHead>
          <TableHead>Acteur</TableHead>
          {!compact ? <TableHead>Détail</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const hasDetail = !compact && (row.before !== null && row.before !== undefined || row.after !== null && row.after !== undefined)
          return (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-neutral-600">{formatDateTime(row.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={actionTone(row.action) === 'danger' ? 'danger' : actionTone(row.action)} size="sm">
                  {auditActionLabels[row.action] ?? row.action}
                </Badge>
                <span className="mt-1 block font-mono text-[11px] text-neutral-500">{row.action}</span>
              </TableCell>
              <TableCell>
                <span className="font-medium text-navy">{auditEntityLabel(row.entityType)}</span>
                {row.entityId ? <span className={cn('block max-w-[14rem] truncate font-mono text-[11px] text-neutral-500')}>{row.entityId}</span> : null}
              </TableCell>
              <TableCell className="text-neutral-700">{row.actorEmail ?? <span className="text-neutral-400">Système</span>}</TableCell>
              {!compact ? (
                <TableCell>
                  {hasDetail ? (
                    <details className="group">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
                        <span className="group-open:hidden">Voir le détail</span>
                        <span className="hidden group-open:inline">Masquer</span>
                      </summary>
                      <div className="mt-2 grid grid-cols-1 w-[min(36rem,80vw)] gap-3 sm:grid-cols-2">
                        <JsonBlock label="Avant" value={row.before} />
                        <JsonBlock label="Après" value={row.after} />
                        {row.correlationId ? <p className="text-[11px] text-neutral-500 sm:col-span-2">Corrélation : {row.correlationId}</p> : null}
                      </div>
                    </details>
                  ) : (
                    <span className="text-xs text-neutral-400">-</span>
                  )}
                </TableCell>
              ) : null}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
