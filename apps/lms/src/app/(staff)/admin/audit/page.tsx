import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ScrollText } from 'lucide-react'
import { can, isSuperAdmin } from '@fetrag/domain'
import { Pagination } from '@fetrag/ui'
import { AuditLogTable, auditActionLabels, auditEntityLabel } from '@/components/staff/audit-log-table'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref, readPage } from '@/components/staff/href'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listLmsAudit } from '@/server/staff/admin-queries'

export const metadata: Metadata = { title: 'Journal d’audit' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; action?: string; entite?: string; page?: string }>
}

/** Journal d'audit LMS : cours, inscriptions, notes, présences, certificats, demandes, rôles et paramètres, avec détail avant / après. */
export default async function AdminAuditPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/admin/audit')
  if (!isSuperAdmin(principal) && !can(principal, 'audit.read') && !can(principal, 'reports.read')) redirect('/acces-refuse')
  const params = await searchParams
  const page = readPage(params.page)
  const list = await listLmsAudit(principal, { q: params.q || undefined, action: params.action || undefined, entityType: params.entite || undefined, page, pageSize: 30 })
  const hrefFor = (p: number) => buildHref('/admin/audit', { q: params.q, action: params.action, entite: params.entite, page: p > 1 ? p : undefined })
  const filtered = Boolean(params.q || params.action || params.entite)

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Journal d’audit' }]}
        eyebrow="Traçabilité"
        title={
          <>
            {list.total} entrée{list.total > 1 ? 's' : ''} <span className="italic text-gold-700">au journal d’audit LMS</span>
          </>
        }
        description="Chaque action sensible (publication, inscription, note, présence, certificat, décision sur une demande, rôle, paramètre) est journalisée avec son auteur, l'entité concernée et l'état avant / après. Le journal est en lecture seule."
        tone="gold"
        meta={
          <span className="inline-flex items-center gap-1">
            <ScrollText className="size-4" aria-hidden="true" />
            {list.actions.length} type(s) d’action · {list.entityTypes.length} type(s) d’entité
          </span>
        }
      />

      <FilterBar
        action="/admin/audit"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Email de l’acteur, identifiant, corrélation', value: params.q },
          { name: 'action', label: 'Action', type: 'select', value: params.action, placeholder: 'Toutes', options: list.actions.map((a) => ({ value: a.action, label: `${auditActionLabels[a.action] ?? a.action} (${a.count})` })) },
          { name: 'entite', label: 'Entité', type: 'select', value: params.entite, placeholder: 'Toutes', options: list.entityTypes.map((e) => ({ value: e.entityType, label: `${auditEntityLabel(e.entityType)} (${e.count})` })) },
        ]}
      />

      <AuditLogTable rows={list.items.map((row) => ({ id: row.id, action: row.action, entityType: row.entityType, entityId: row.entityId, actorEmail: row.actorEmail, createdAt: row.createdAt, before: row.before, after: row.after, ipHash: row.ipHash, correlationId: row.correlationId }))} />
      {list.items.length ? <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" /> : filtered ? <p className="mt-4 text-sm text-neutral-500">Aucune entrée ne correspond aux filtres.</p> : null}
    </>
  )
}
