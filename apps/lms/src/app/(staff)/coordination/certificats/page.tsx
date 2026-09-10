import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, FileCheck2, FileWarning } from 'lucide-react'
import { certificateStatuses, certificateStatusLabels } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { certification } from '@fetrag/lms-core'
import { Badge, Button, Card, CardContent, CertificateSeal, EmptyState, Pagination, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { CertificateRowActions } from '@/components/staff/certificate-actions'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref, readPage } from '@/components/staff/href'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { countCertificatesToIssue, listCohortsForSelect } from '@/server/staff/coordination-queries'
import { listCoursesForSelect, listOrganizationsForSelect } from '@/server/staff/queries'

export const metadata: Metadata = { title: 'Certificats' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; statut?: string; cours?: string; organisation?: string; page?: string }>
}

/** Registre des certificats : liste filtrée, révocation motivée, régénération PDF, accès à l'émission par cohorte. */
export default async function CoordinationCertificatesPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('certificate.issue', {}, '/coordination/certificats')
  const params = await searchParams
  const status = (certificateStatuses as readonly string[]).includes(params.statut ?? '') ? (params.statut as (typeof certificateStatuses)[number]) : undefined
  const page = readPage(params.page)
  const [list, courses, organizations, cohorts, toIssue] = await Promise.all([
    certification.list(principal, { q: params.q || undefined, status, courseId: params.cours || undefined, organizationId: params.organisation || undefined, page, pageSize: 25 }),
    listCoursesForSelect(),
    listOrganizationsForSelect(),
    listCohortsForSelect(),
    countCertificatesToIssue(),
  ])
  const hrefFor = (p: number) => buildHref('/coordination/certificats', { q: params.q, statut: params.statut, cours: params.cours, organisation: params.organisation, page: p > 1 ? p : undefined })
  const activeCohorts = cohorts.filter((c) => c.status === 'RUNNING' || c.status === 'CLOSED').slice(0, 8)

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Coordination', href: '/coordination' }, { label: 'Certificats' }]}
        eyebrow="Certification"
        title={
          <>
            Registre des <span className="italic text-gold-700">attestations et certificats</span>
          </>
        }
        description="Chaque document porte un numéro séquentiel FETRAG et un code de vérification publique. L'émission se fait par cohorte après contrôle d'éligibilité ; la révocation est motivée et journalisée."
        tone="gold"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/certificats">Modèles de certificats</Link>
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card pillar="defense" className="lg:col-span-2">
          <CardContent className="flex items-center gap-5 p-5">
            <CertificateSeal size={84} decorative />
            <div className="text-sm text-neutral-700">
              <p className="font-display text-lg font-semibold text-navy">{list.total} document(s) au registre</p>
              <p>
                {toIssue ? (
                  <span className="inline-flex items-center gap-1 text-gold-800">
                    <FileWarning className="size-4" aria-hidden="true" />
                    {toIssue} participant(s) ayant terminé sans certificat : émettez depuis la fiche de leur cohorte.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-green-800">
                    <FileCheck2 className="size-4" aria-hidden="true" />
                    Tous les participants ayant terminé disposent d’un certificat.
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow mb-2 text-[11px] text-neutral-500">Émettre pour une cohorte</p>
            {activeCohorts.length ? (
              <ul className="flex flex-col gap-1 text-sm">
                {activeCohorts.map((c) => (
                  <li key={c.id}>
                    <Link href={`/coordination/cohortes/${c.id}?onglet=certificats`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-neutral-50">
                      <span className="truncate font-medium text-navy">{c.name}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Aucune cohorte en cours ou clôturée.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <FilterBar
        action="/coordination/certificats"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Numéro ou titulaire', value: params.q },
          { name: 'statut', label: 'Statut', type: 'select', value: params.statut, options: certificateStatuses.map((s) => ({ value: s, label: certificateStatusLabels[s] })) },
          { name: 'cours', label: 'Module', type: 'select', value: params.cours, options: courses.map((c) => ({ value: c.id, label: `${c.code} · ${c.title}` })) },
          { name: 'organisation', label: 'Organisation', type: 'select', value: params.organisation, placeholder: 'Toutes', options: organizations.map((o) => ({ value: o.id, label: o.acronym ?? o.name })) },
        ]}
      />

      <StaffSection number="01" title="Certificats émis" tone="gold">
        {list.items.length ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Titulaire</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Émis le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/certificats/${c.id}`} className="font-semibold text-navy hover:underline">
                        {c.number}
                      </Link>
                      <span className="block text-xs text-neutral-500">{c.kind === 'CERTIFICATE' ? 'Certificat' : 'Attestation'}</span>
                    </TableCell>
                    <TableCell>
                      {c.holderName}
                      {c.enrollment?.organization ? <span className="block text-xs text-neutral-500">{c.enrollment.organization.name}</span> : null}
                    </TableCell>
                    <TableCell>
                      {c.courseTitle}
                      {c.cohort ? <span className="block text-xs text-neutral-500">{c.cohort.name}</span> : null}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {formatDate(c.issuedAt)}
                      {c.expiresAt ? <span className="block text-xs">Expire le {formatDate(c.expiresAt)}</span> : null}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} labels={certificateStatusLabels} size="sm" />
                      {c.revokedReason ? <span className="block max-w-[12rem] truncate text-xs text-neutral-500">{c.revokedReason}</span> : null}
                    </TableCell>
                    <TableCell>{c.pdfUrl ? <Badge variant="success" size="sm">Disponible</Badge> : <Badge variant="neutral" size="sm">En génération</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <CertificateRowActions certificateId={c.id} number={c.number} status={c.status} hasPdf={Boolean(c.pdfUrl)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" />
          </>
        ) : (
          <Card>
            <EmptyState icon={Award} title="Aucun certificat" description={params.q || params.statut ? 'Aucun certificat ne correspond aux filtres.' : "Les certificats émis à la clôture des cohortes s'afficheront ici."} />
          </Card>
        )}
      </StaffSection>
    </>
  )
}
