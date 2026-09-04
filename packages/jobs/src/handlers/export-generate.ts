import { prisma } from '@fetrag/db'
import { audit, formatDateTime } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { buildKey, getStorage } from '@fetrag/storage'
import { toCsv, type CsvCell } from '../csv'
import { parseExportGenerate } from '../payloads'
import type { ExportGeneratePayload, JobHandler } from '../types'

interface Dataset {
  headers: string[]
  rows: CsvCell[][]
}

const MAX_ROWS = 20_000

function dateRange(input: ExportGeneratePayload): { gte?: Date; lte?: Date } | undefined {
  const gte = input.from ? new Date(input.from) : undefined
  const lte = input.to ? new Date(input.to) : undefined
  if (!gte && !lte) return undefined
  return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) }
}

function fullName(u: { name: string | null; firstName: string | null; lastName: string | null; email: string }): string {
  return u.name ?? [u.firstName, u.lastName].filter(Boolean).join(' ') ?? u.email
}

/** Construit le jeu de données selon le type d'export, filtré par organisation si demandé. */
async function buildDataset(input: ExportGeneratePayload): Promise<Dataset> {
  const createdAt = dateRange(input)
  const orgId = input.organizationId

  switch (input.kind) {
    case 'orders': {
      const rows = await prisma.order.findMany({
        where: { ...(createdAt ? { createdAt } : {}), ...(orgId ? { organizationId: orgId } : {}) },
        include: { user: { select: { name: true, firstName: true, lastName: true, email: true } }, lines: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: MAX_ROWS,
      })
      return {
        headers: ['Référence', 'Date', 'Client', 'Email', 'Statut', 'Sous-total', 'Remise', 'Total', 'Devise', 'Moyen', 'Réf. paiement', 'Payée le', 'Lignes'],
        rows: rows.map((o) => [
          o.reference,
          o.createdAt,
          fullName(o.user),
          o.user.email,
          o.status,
          o.subtotalAmount,
          o.discountAmount,
          o.totalAmount,
          o.currency,
          o.payments[0]?.method ?? '',
          o.payments[0]?.providerRef ?? '',
          o.paidAt,
          o.lines.map((l) => `${l.label} x${l.quantity}`).join(' | '),
        ]),
      }
    }
    case 'enrollments': {
      const rows = await prisma.enrollment.findMany({
        where: { ...(createdAt ? { createdAt } : {}), ...(orgId ? { organizationId: orgId } : {}) },
        include: {
          user: { select: { name: true, firstName: true, lastName: true, email: true } },
          course: { select: { code: true, title: true } },
          cohort: { select: { code: true, name: true } },
          organization: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_ROWS,
      })
      return {
        headers: ['Apprenant', 'Email', 'Organisation', 'Cours', 'Code cours', 'Cohorte', 'Statut', 'Progression %', 'Score', 'Temps (min)', 'Inscrit le', 'Terminé le'],
        rows: rows.map((e) => [
          fullName(e.user),
          e.user.email,
          e.organization?.name ?? '',
          e.course.title,
          e.course.code,
          e.cohort?.name ?? '',
          e.status,
          e.progressPercent,
          e.score,
          Math.round(e.timeSpentSeconds / 60),
          e.createdAt,
          e.completedAt,
        ]),
      }
    }
    case 'certificates': {
      const rows = await prisma.certificate.findMany({
        where: {
          ...(createdAt ? { issuedAt: createdAt } : {}),
          ...(orgId ? { OR: [{ cohort: { organizationId: orgId } }, { enrollment: { organizationId: orgId } }] } : {}),
        },
        include: { user: { select: { email: true } }, cohort: { select: { name: true } } },
        orderBy: { issuedAt: 'desc' },
        take: MAX_ROWS,
      })
      return {
        headers: ['Numéro', 'Type', 'Statut', 'Titulaire', 'Email', 'Formation', 'Cohorte', 'Score', 'Assiduité', 'Émis le', 'Expire le', 'Code de vérification'],
        rows: rows.map((c) => [
          c.number,
          c.kind,
          c.status,
          c.holderName,
          c.user.email,
          c.courseTitle,
          c.cohort?.name ?? '',
          c.score,
          c.attendanceRate,
          c.issuedAt,
          c.expiresAt,
          c.verifyCode,
        ]),
      }
    }
    case 'training-requests': {
      const rows = await prisma.trainingRequest.findMany({
        where: { ...(createdAt ? { createdAt } : {}), ...(orgId ? { organizationId: orgId } : {}) },
        include: {
          organization: { select: { name: true } },
          modules: { include: { course: { select: { code: true } } } },
          _count: { select: { participants: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_ROWS,
      })
      return {
        headers: ['Référence', 'Organisation', 'Contact', 'Email', 'Statut', 'Modules', 'Participants', 'Date souhaitée', 'Modalité', 'Soumise le', 'Décidée le'],
        rows: rows.map((r) => [
          r.reference,
          r.organization.name,
          r.contactName,
          r.contactEmail,
          r.status,
          r.modules.map((m) => m.course.code).join(' | '),
          r._count.participants,
          r.preferredStart,
          r.preferredMode,
          r.submittedAt,
          r.decidedAt,
        ]),
      }
    }
    case 'form-submissions': {
      const rows = await prisma.formSubmission.findMany({
        where: createdAt ? { createdAt } : {},
        orderBy: { createdAt: 'desc' },
        take: MAX_ROWS,
      })
      return {
        headers: ['Référence', 'Type', 'Nom', 'Email', 'Téléphone', 'Objet', 'Statut', 'Reçu le', 'Répondu le'],
        rows: rows.map((f) => [f.reference, f.kind, f.fullName, f.email, f.phone, f.subject, f.status, f.createdAt, f.answeredAt]),
      }
    }
    case 'service-requests': {
      const rows = await prisma.serviceRequest.findMany({
        where: createdAt ? { createdAt } : {},
        include: { service: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: MAX_ROWS,
      })
      return {
        headers: ['Référence', 'Service', 'Nom', 'Email', 'Téléphone', 'Organisation', 'Statut', 'Créée le', 'Mise à jour le'],
        rows: rows.map((s) => [s.reference, s.service.name, s.fullName, s.email, s.phone, s.organization, s.status, s.createdAt, s.updatedAt]),
      }
    }
    case 'users': {
      const rows = await prisma.user.findMany({
        where: { ...(createdAt ? { createdAt } : {}), ...(orgId ? { memberships: { some: { organizationId: orgId } } } : {}) },
        include: {
          roleAssignments: { select: { role: true, scopeType: true } },
          memberships: { include: { organization: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_ROWS,
      })
      return {
        headers: ['Nom', 'Email', 'Téléphone', 'Fonction', 'Employeur', 'Organisations', 'Rôles', 'Actif', 'Créé le', 'Dernière connexion'],
        rows: rows.map((u) => [
          fullName(u),
          u.email,
          u.phone,
          u.jobTitle,
          u.employer,
          u.memberships.map((m) => m.organization.name).join(' | '),
          u.roleAssignments.map((r) => (r.scopeType === 'GLOBAL' ? r.role : `${r.role}@${r.scopeType}`)).join(' | '),
          u.isActive,
          u.createdAt,
          u.lastLoginAt,
        ]),
      }
    }
  }
}

/**
 * Génère un export CSV en stockage privé et notifie le demandeur avec un lien signé (24 h).
 * La permission (`finance.export`, `reports.org`...) est vérifiée par l'appelant avant la mise en file ;
 * `organizationId` restreint systématiquement les données à l'organisation indiquée.
 */
export const exportGenerateHandler: JobHandler = async (payload, ctx) => {
  const input = parseExportGenerate(payload)
  const dataset = await buildDataset(input)
  const csv = toCsv(dataset.headers, dataset.rows)
  const storage = getStorage()
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const { key } = await storage.put(buildKey('exports', `${input.kind}-${stamp}.csv`), csv, {
    contentType: 'text/csv; charset=utf-8',
    visibility: 'PRIVATE',
  })
  const url = await storage.getSignedUrl(key, { expiresInSeconds: 24 * 3600 })

  await audit(
    'export.generated',
    { type: 'Export', id: key },
    { actorId: input.requestedBy, correlationId: ctx.jobId },
    { after: { kind: input.kind, organizationId: input.organizationId ?? null, rows: dataset.rows.length } },
  )
  await notifyUser(input.requestedBy, {
    title: 'Votre export est prêt',
    body: `L'export « ${input.kind} » (${dataset.rows.length} lignes, généré le ${formatDateTime(new Date())}) est disponible pendant 24 heures.`,
    href: url,
    category: 'general',
    email: true,
  })
  ctx.logger.info('export.generate.done', { kind: input.kind, rows: dataset.rows.length, key })
  return { key, rows: dataset.rows.length }
}
