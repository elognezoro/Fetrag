import 'server-only'
import type { RequestContext } from '@fetrag/cms'
import { prisma, type Prisma } from '@fetrag/db'
import { audit, type Principal } from '@fetrag/domain'
import { toCsv, type CsvCell } from '@fetrag/jobs'
import { auditActionLabels } from './labels'
import type { ListParams } from './list-params'

/** Libellés des entités les plus fréquentes du journal. */
export const auditEntityLabels: Record<string, string> = {
  User: 'Utilisateur',
  RoleAssignment: 'Attribution de rôle',
  Organization: 'Organisation',
  Sponsorship: 'Prise en charge',
  Order: 'Commande',
  Payment: 'Paiement',
  Refund: 'Remboursement',
  Certificate: 'Certificat',
  Enrollment: 'Inscription',
  Cohort: 'Cohorte',
  Course: 'Cours',
  TrainingRequest: 'Demande de formation',
  ServiceRequest: 'Demande de service',
  FormSubmission: 'Formulaire',
  Page: 'Page',
  Article: 'Actualité',
  Resource: 'Ressource',
  Event: 'Événement',
  Service: 'Service',
  Partner: 'Partenaire',
  SystemSetting: 'Paramètre système',
  BackgroundJob: 'Tâche de fond',
  Report: 'Rapport',
  Newsletter: 'Newsletter',
}

const EXPORT_LIMIT = 5000

/** Clause `where` du journal d'audit (mêmes filtres que la liste : action, entité, acteur, période, recherche). */
export function auditWhere(params: ListParams): Prisma.AuditLogWhereInput {
  const from = params.filters.du ? new Date(params.filters.du) : undefined
  const to = params.filters.au ? new Date(`${params.filters.au}T23:59:59.999Z`) : undefined
  const validFrom = from && !Number.isNaN(from.getTime()) ? from : undefined
  const validTo = to && !Number.isNaN(to.getTime()) ? to : undefined
  return {
    ...(params.filters.action ? { action: { startsWith: params.filters.action } } : {}),
    ...(params.filters.entite ? { entityType: params.filters.entite } : {}),
    ...(params.filters.acteur ? { actorEmail: { contains: params.filters.acteur, mode: 'insensitive' } } : {}),
    ...(validFrom || validTo ? { createdAt: { ...(validFrom ? { gte: validFrom } : {}), ...(validTo ? { lte: validTo } : {}) } } : {}),
    ...(params.q ? { OR: [{ entityId: { contains: params.q } }, { actorEmail: { contains: params.q, mode: 'insensitive' } }, { correlationId: { contains: params.q } }] } : {}),
  }
}

/** Export CSV du journal d'audit selon les filtres courants (audit.read ; l'export est lui-même journalisé). */
export async function exportAuditCsv(principal: Principal, params: ListParams, ctx: RequestContext): Promise<string> {
  const where = auditWhere(params)
  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: EXPORT_LIMIT,
    select: { id: true, createdAt: true, action: true, entityType: true, entityId: true, actorEmail: true, actorId: true, ipHash: true, userAgent: true, correlationId: true, before: true, after: true },
  })
  const data: CsvCell[][] = rows.map((r) => [
    r.createdAt.toISOString(),
    auditActionLabels[r.action] ?? r.action,
    r.action,
    auditEntityLabels[r.entityType] ?? r.entityType,
    r.entityId ?? '',
    r.actorEmail ?? '',
    r.actorId ?? '',
    r.ipHash ?? '',
    r.correlationId ?? '',
    r.before === null || r.before === undefined ? '' : JSON.stringify(r.before),
    r.after === null || r.after === undefined ? '' : JSON.stringify(r.after),
    r.userAgent ?? '',
  ])
  await audit('export.generated', { type: 'AuditLog' }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent, correlationId: ctx.correlationId }, {
    after: { kind: 'audit', rows: rows.length, filters: { action: params.filters.action ?? null, entity: params.filters.entite ?? null, actor: params.filters.acteur ?? null, from: params.filters.du ?? null, to: params.filters.au ?? null, q: params.q ?? null }, truncated: rows.length >= EXPORT_LIMIT },
  })
  return toCsv(['Horodatage (UTC)', 'Action', 'Code action', 'Entité', 'Identifiant', 'Acteur', 'Identifiant acteur', 'Empreinte IP', 'Corrélation', 'Avant', 'Après', 'Agent utilisateur'], data)
}
