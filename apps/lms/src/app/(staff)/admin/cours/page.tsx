import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'
import { contentStatuses, contentStatusLabels, courseModalityLabels, pillarLabels, pillars, type PillarName } from '@fetrag/contracts'
import { can, formatDate } from '@fetrag/domain'
import { Badge, Button, Card, EmptyState, Pagination, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, pillarTone } from '@fetrag/ui'
import { CourseStatusActions } from '@/components/staff/course-status-actions'
import { FilterBar } from '@/components/staff/filter-bar'
import { buildHref, readPage } from '@/components/staff/href'
import { StaffPageHeader } from '@/components/staff/staff-page'
import { guards } from '@/lib/auth'
import { listCoursesAdmin } from '@/server/staff/admin-queries'

export const metadata: Metadata = { title: 'Cours' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; statut?: string; pilier?: string; page?: string }>
}

/** Cours du programme : liste filtrée (statut, pilier, recherche), version courante, inscriptions, formateurs, publication. */
export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const principal = await guards.requireCan('course.author', {}, '/admin/cours')
  const params = await searchParams
  const status = (contentStatuses as readonly string[]).includes(params.statut ?? '') ? (params.statut as (typeof contentStatuses)[number]) : undefined
  const pillar = (pillars as readonly string[]).includes(params.pilier ?? '') ? params.pilier : undefined
  const page = readPage(params.page)
  const list = await listCoursesAdmin(principal, { q: params.q || undefined, status, pillar, page, pageSize: 20 })
  const hrefFor = (p: number) => buildHref('/admin/cours', { q: params.q, statut: params.statut, pilier: params.pilier, page: p > 1 ? p : undefined })
  const canPublish = can(principal, 'course.publish')

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Cours' }]}
        eyebrow="Cours et modules"
        title={
          <>
            {list.total} cours <span className="italic text-blue-600">du programme de formation</span>
          </>
        }
        description="Chaque cours porte des versions figées (LMS-17) : la version courante est celle suivie par les nouvelles inscriptions. Publier un cours le rend visible au catalogue et sur fetrag.ga."
        meta={
          <>
            {(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] as const).map((s) =>
              list.statusCounts[s] ? (
                <Link key={s} href={buildHref('/admin/cours', { statut: s })} className="inline-flex items-center gap-1 hover:underline">
                  <StatusBadge status={s} labels={contentStatusLabels} size="sm" />
                  <span className="font-semibold text-navy">{list.statusCounts[s]}</span>
                </Link>
              ) : null,
            )}
          </>
        }
        actions={
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/cours/nouveau">
              <Plus aria-hidden="true" />
              Nouveau cours
            </Link>
          </Button>
        }
      />

      <FilterBar
        action="/admin/cours"
        className="mb-6"
        fields={[
          { name: 'q', label: 'Recherche', placeholder: 'Titre ou code', value: params.q },
          { name: 'statut', label: 'Statut', type: 'select', value: params.statut, options: contentStatuses.filter((s) => s !== 'SCHEDULED').map((s) => ({ value: s, label: contentStatusLabels[s] })) },
          { name: 'pilier', label: 'Pilier', type: 'select', value: params.pilier, options: pillars.map((p) => ({ value: p, label: pillarLabels[p] })) },
        ]}
      />

      {list.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Pilier</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Version courante</TableHead>
                <TableHead>Inscriptions</TableHead>
                <TableHead>Formateurs</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <span aria-hidden="true" className="font-display text-2xl font-semibold leading-none text-blue-600">
                        {String(c.position).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/admin/cours/${c.id}`} className="font-semibold text-navy hover:underline">
                          {c.title}
                        </Link>
                        <p className="text-xs text-neutral-500">
                          {c.code} · {courseModalityLabels[c.modality]}
                          {c.isFeatured ? ' · à la une' : ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.pillar && (pillars as readonly string[]).includes(c.pillar) ? (
                      <Badge variant={pillarTone[c.pillar as PillarName]} size="sm">
                        {pillarLabels[c.pillar as PillarName]}
                      </Badge>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} labels={contentStatusLabels} size="sm" />
                    {c.publishedAt ? <span className="block text-xs text-neutral-500">{formatDate(c.publishedAt)}</span> : null}
                  </TableCell>
                  <TableCell>
                    {c.currentVersion ? (
                      <>
                        <span className="font-semibold text-navy">v{c.currentVersion.version}</span>
                        {c.currentVersion.label ? <span className="block max-w-[12rem] truncate text-xs text-neutral-500">{c.currentVersion.label}</span> : null}
                      </>
                    ) : (
                      <Badge variant="warning" size="sm">Aucune version publiée</Badge>
                    )}
                    <span className="block text-xs text-neutral-500">{c._count.versions} version(s)</span>
                  </TableCell>
                  <TableCell>
                    {c._count.enrollments}
                    <span className="block text-xs text-neutral-500">{c._count.cohorts} cohorte(s)</span>
                  </TableCell>
                  <TableCell>
                    {c.trainerNames.length ? (
                      <ul className="text-sm">
                        {c.trainerNames.slice(0, 3).map((t) => (
                          <li key={t.id} className={t.isLead ? 'font-semibold text-navy' : 'text-neutral-700'}>
                            {t.name}
                          </li>
                        ))}
                        {c.trainerNames.length > 3 ? <li className="text-xs text-neutral-500">+{c.trainerNames.length - 3}</li> : null}
                      </ul>
                    ) : (
                      <Badge variant="warning" size="sm">À désigner</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/cours/${c.id}`}>Ouvrir</Link>
                      </Button>
                      {canPublish ? <CourseStatusActions courseId={c.id} status={c.status} hasPublishedVersion={Boolean(c.currentVersion)} canPublish={canPublish} /> : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={list.page} totalPages={list.totalPages} hrefFor={hrefFor} className="mt-6" />
        </>
      ) : (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Aucun cours"
            description={params.q || params.statut || params.pilier ? 'Aucun cours ne correspond aux filtres.' : 'Créez le premier module du programme : fiche descriptive, puis structure de la version 1.'}
            action={
              <Button asChild variant="primary">
                <Link href="/admin/cours/nouveau">Créer un cours</Link>
              </Button>
            }
          />
        </Card>
      )}
    </>
  )
}
