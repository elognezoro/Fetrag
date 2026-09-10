import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'
import { Badge, Button, Card, EmptyState, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref, readPage } from '@/components/staff/href'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listOrganizationsAdmin } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Organisations affiliées' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; inactives?: string; page?: string }>
}

/** Organisations affiliées : liste, recherche, accès aux fiches et création. */
export default async function CoordinationOrganizationsPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('organization.read', {}, '/coordination/organisations')
  const params = await searchParams
  const page = readPage(params.page)
  const list = await listOrganizationsAdmin(principal, { q: params.q || undefined, inactive: params.inactives === '1', page, pageSize: 20 })
  const hrefFor = (p: number) => buildHref('/coordination/organisations', { q: params.q, inactives: params.inactives, page: p > 1 ? p : undefined })

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Organisations' }]}
        eyebrow="Organisations affiliées"
        title={
          <>
            {list.total} organisation{list.total > 1 ? 's' : ''} <span className="italic text-blue-600">membres de la Fédération</span>
          </>
        }
        description="Syndicats, sections et fédérations affiliés : gestionnaires désignés, demandes de formation, cohortes et participants."
        actions={
          <Button asChild variant="primary" size="sm">
            <Link href="/coordination/organisations/nouvelle">
              <Plus aria-hidden="true" />
              Nouvelle organisation
            </Link>
          </Button>
        }
      />

      <FilterBar
        action="/coordination/organisations"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Nom, sigle, ville', value: params.q },
          { name: 'inactives', label: 'Périmètre', type: 'select', value: params.inactives, placeholder: 'Actives uniquement', options: [{ value: '1', label: 'Inclure les inactives' }] },
        ]}
      />

      {list.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Membres</TableHead>
                <TableHead>Demandes</TableHead>
                <TableHead>Cohortes</TableHead>
                <TableHead>Inscriptions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="min-w-[16rem]">
                    <Link href={`/coordination/organisations/${o.id}`} className="font-semibold text-navy hover:underline">
                      {o.acronym ? `${o.acronym} - ` : ''}
                      {o.name}
                    </Link>
                    <span className="mt-1 flex gap-1">
                      {o.isAffiliate ? <Badge variant="blue" size="sm">Affiliée</Badge> : <Badge variant="neutral" size="sm">Partenaire</Badge>}
                      {!o.isActive ? <Badge variant="danger" size="sm">Inactive</Badge> : null}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[9rem] text-neutral-700">{o.sector ?? '-'}</TableCell>
                  <TableCell className="whitespace-nowrap text-neutral-700">{o.city ?? '-'}</TableCell>
                  <TableCell>{o._count.memberships}</TableCell>
                  <TableCell>{o._count.trainingRequests}</TableCell>
                  <TableCell>{o._count.cohorts}</TableCell>
                  <TableCell>{o._count.enrollments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" />
        </>
      ) : (
        <Card>
          <EmptyState icon={Building2} title="Aucune organisation" description="Créez la fiche d'une organisation affiliée pour lui rattacher des gestionnaires." />
        </Card>
      )}
    </>
  )
}
