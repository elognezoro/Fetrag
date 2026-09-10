import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, BookOpen, ExternalLink, Eye, GitBranch, GraduationCap, Layers, Lock, Pencil, Users } from 'lucide-react'
import { contentStatusLabels, courseLevelLabels, courseModalityLabels, enrollmentStatuses, enrollmentStatusLabels, pillarLabels, pillars, type PillarName } from '@fetrag/contracts'
import { formatDate, isDomainError } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, EmptyState, Pagination, Progress, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, pillarTone } from '@fetrag/ui'
import { CourseForm } from '@/components/staff/course-form'
import { CourseStatusActions } from '@/components/staff/course-status-actions'
import { CourseTrainersPanel } from '@/components/staff/course-trainers-panel'
import { CourseTree } from '@/components/staff/course-tree'
import { EnrollmentStatusActions } from '@/components/staff/enrollment-status-actions'
import { FilterBar } from '@/components/staff/filter-bar'
import { personName } from '@/components/staff/format'
import { buildHref, readPage } from '@/components/staff/href'
import { DetailItem, DetailList, StaffPageHeader } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { DuplicateVersionButton, VersionPanel } from '@/components/staff/version-panel'
import { guards } from '@/lib/auth'
import { loadCourseBuilder } from '@/server/staff/admin-queries'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ onglet?: string; version?: string; statut?: string; q?: string; page?: string }>
}

const TABS = ['informations', 'structure', 'versions', 'formateurs', 'inscriptions', 'apercu'] as const

const enrollmentPolicyLabels: Record<string, string> = {
  SELF: 'Inscription libre',
  APPROVAL: 'Sur validation de la coordination',
  ORGANIZATION: 'Réservée aux organisations',
  PAID: 'Payante (commande requise)',
}

async function load(id: string, options: { versionId?: string; enrollments?: { q?: string; status?: (typeof enrollmentStatuses)[number]; page?: number } }) {
  const principal = await guards.requireCan('course.author', { courseId: id }, `/admin/cours/${id}`)
  try {
    return await loadCourseBuilder(principal, id, options)
  } catch (error) {
    if (isDomainError(error) && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN')) notFound()
    throw error
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const data = await load(id, {})
  return { title: `${data.course.code} · ${data.course.title}` }
}

/**
 * Builder d'un cours : fiche (Informations), arborescence de la version sélectionnée (Structure),
 * versions figées et publication (Versions), formateurs, inscriptions et prévisualisation.
 */
export default async function AdminCoursePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const tab = (TABS as readonly string[]).includes(sp.onglet ?? '') ? sp.onglet! : 'structure'
  const enrollmentStatus = (enrollmentStatuses as readonly string[]).includes(sp.statut ?? '') ? (sp.statut as (typeof enrollmentStatuses)[number]) : undefined
  const data = await load(id, { versionId: sp.version || undefined, enrollments: { q: sp.q || undefined, status: enrollmentStatus, page: readPage(sp.page) } })
  const { course, selectedVersion, versions, canPublish, canAuthor } = data
  const baseHref = `/admin/cours/${course.id}`
  const versionQuery = sp.version ? { version: sp.version } : {}
  const tabHref = (name: (typeof TABS)[number]) => buildHref(baseHref, { onglet: name, ...versionQuery })
  const pillar = course.pillar && (pillars as readonly string[]).includes(course.pillar) ? (course.pillar as PillarName) : null
  const currentVersion = versions.find((v) => v.id === course.currentVersionId) ?? null
  const selectedSummary = selectedVersion ? (versions.find((v) => v.id === selectedVersion.id) ?? null) : null
  const totalActivities = selectedVersion ? selectedVersion.modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l.activities.length, 0), 0) : 0
  const trainerRows = course.trainers.map((t) => ({ userId: t.user.id, label: personName(t.user), email: t.user.email, isLead: t.isLead }))

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Cours', href: '/admin/cours' }, { label: course.code }]}
        eyebrow={pillar ? pillarLabels[pillar] : 'Cours'}
        title={course.title}
        description={course.subtitle ?? course.summary ?? undefined}
        tone={pillar ? pillarTone[pillar] : 'blue'}
        meta={
          <>
            <StatusBadge status={course.status} labels={contentStatusLabels} />
            <span>{course.code}</span>
            <span>{courseModalityLabels[course.modality]}</span>
            <span>{courseLevelLabels[course.level]}</span>
            <span>{course.durationHours} h</span>
            <span className="inline-flex items-center gap-1">
              <GitBranch className="size-4" aria-hidden="true" />
              {currentVersion ? `Version courante ${currentVersion.version}` : 'Aucune version publiée'}
            </span>
          </>
        }
        actions={
          <>
            {course.status === 'PUBLISHED' ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/cours/${course.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  Voir au catalogue
                </Link>
              </Button>
            ) : null}
            <CourseStatusActions courseId={course.id} status={course.status} hasPublishedVersion={Boolean(course.currentVersionId)} canPublish={canPublish} />
          </>
        }
      />

      <StatGrid
        items={[
          { value: versions.length, label: 'Versions', icon: GitBranch, tone: 'blue', description: `${versions.filter((v) => v.isPublished).length} publiée(s)` },
          { value: selectedVersion?.modules.length ?? 0, label: 'Modules (version affichée)', icon: Layers, tone: 'green', description: `${totalActivities} activité(s)` },
          { value: course._count.enrollments, label: 'Inscriptions', icon: Users, tone: 'gold', description: `${course._count.cohorts} cohorte(s)` },
          { value: course.trainers.length, label: 'Formateurs', icon: GraduationCap, tone: 'navy', description: course.certificateTemplates.length ? `${course.certificateTemplates.length} modèle(s) de certificat` : 'Modèle de certificat par défaut' },
        ]}
      />

      <Tabs defaultValue={tab} className="mt-8">
        <TabsList variant="underline" aria-label="Sections du cours" className="w-full">
          <TabsTrigger value="informations" asChild>
            <Link href={tabHref('informations')}>
              <Pencil aria-hidden="true" />
              Informations
            </Link>
          </TabsTrigger>
          <TabsTrigger value="structure" asChild>
            <Link href={tabHref('structure')}>
              <Layers aria-hidden="true" />
              Structure
            </Link>
          </TabsTrigger>
          <TabsTrigger value="versions" asChild>
            <Link href={tabHref('versions')}>
              <GitBranch aria-hidden="true" />
              Versions
            </Link>
          </TabsTrigger>
          <TabsTrigger value="formateurs" asChild>
            <Link href={tabHref('formateurs')}>
              <GraduationCap aria-hidden="true" />
              Formateurs
            </Link>
          </TabsTrigger>
          <TabsTrigger value="inscriptions" asChild>
            <Link href={tabHref('inscriptions')}>
              <Users aria-hidden="true" />
              Inscriptions
            </Link>
          </TabsTrigger>
          <TabsTrigger value="apercu" asChild>
            <Link href={tabHref('apercu')}>
              <Eye aria-hidden="true" />
              Prévisualisation
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="informations">
          {canAuthor ? (
            <CourseForm
              categories={data.categories}
              trainers={data.trainers}
              course={{
                id: course.id,
                title: course.title,
                code: course.code,
                slug: course.slug,
                subtitle: course.subtitle,
                summary: course.summary,
                description: course.description,
                objectives: course.objectives,
                prerequisitesText: course.prerequisitesText,
                audience: course.audience,
                categoryId: course.categoryId,
                modality: course.modality,
                level: course.level,
                language: course.language,
                durationHours: course.durationHours,
                pillar: course.pillar,
                coverImageUrl: course.coverImageUrl,
                color: course.color,
                enrollmentPolicy: course.enrollmentPolicy,
                isFree: course.isFree,
                priceAmount: course.priceAmount,
                memberPriceAmount: course.memberPriceAmount,
                currency: course.currency,
                capacity: course.capacity,
                isFeatured: course.isFeatured,
                position: course.position,
                trainerIds: course.trainers.map((t) => t.userId),
              }}
            />
          ) : (
            <Card>
              <EmptyState compact icon={Lock} title="Fiche en lecture seule" description="La modification de la fiche est réservée aux auteurs du cours (coordination, formateurs du cours)." />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="structure" className="flex flex-col gap-4">
          {selectedVersion ? (
            <>
              {selectedVersion.locked ? (
                <Alert variant="warning" icon={Lock}>
                  <AlertTitle>
                    Version {selectedVersion.version} en lecture seule
                    {selectedVersion.isPublished ? ' (publiée)' : ''}
                  </AlertTitle>
                  <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {selectedVersion.isPublished ? 'Une version publiée est figée : ' : `Cette version est suivie par ${selectedVersion.counts.enrollments} inscription(s) et ${selectedVersion.counts.cohorts} cohorte(s) : `}
                      créez une nouvelle version pour faire évoluer le contenu sans perturber les apprenants en cours (LMS-17).
                    </span>
                    {canAuthor && selectedSummary ? <DuplicateVersionButton courseId={course.id} version={selectedSummary} /> : null}
                  </AlertDescription>
                </Alert>
              ) : null}
              {versions.length > 1 ? (
                <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                  Version affichée :
                  {versions.map((v) => (
                    <Link key={v.id} href={buildHref(baseHref, { onglet: 'structure', version: v.id })} aria-current={v.id === selectedVersion.id ? 'true' : undefined} className={v.id === selectedVersion.id ? 'rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white' : 'rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-navy hover:border-blue-400'}>
                      v{v.version}
                      {v.id === course.currentVersionId ? ' · courante' : v.isPublished ? ' · publiée' : ' · brouillon'}
                    </Link>
                  ))}
                </p>
              ) : null}
              <CourseTree courseId={course.id} courseVersionId={selectedVersion.id} versionNumber={selectedVersion.version} locked={selectedVersion.locked || !canAuthor} modules={selectedVersion.modules} resources={data.resources} questionCategories={data.questionCategories} />
            </>
          ) : (
            <Card>
              <EmptyState icon={Layers} title="Aucune version" description="Créez une première version depuis l'onglet Versions pour structurer le parcours." action={<Button asChild variant="primary"><Link href={tabHref('versions')}>Gérer les versions</Link></Button>} />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="versions" className="flex flex-col gap-4">
          <p className="text-sm text-neutral-600">Publier une version la fige et la désigne comme version courante ; les cohortes déjà lancées gardent leur version. Dupliquez une version figée pour préparer une évolution.</p>
          <VersionPanel courseId={course.id} currentVersionId={course.currentVersionId} selectedVersionId={selectedVersion?.id ?? null} versions={versions} canPublish={canPublish} completionRules={selectedVersion ? { passScore: selectedVersion.completionRules.passScore, minAttendanceRate: selectedVersion.completionRules.minAttendanceRate, requireAllActivities: selectedVersion.completionRules.requireAllActivities } : null} />
          {selectedVersion ? (
            <Card>
              <CardContent className="p-5">
                <DetailList columns={4}>
                  <DetailItem label="Version affichée">
                    v{selectedVersion.version}
                    {selectedVersion.label ? ` · ${selectedVersion.label}` : ''}
                  </DetailItem>
                  <DetailItem label="Score minimal">{selectedVersion.completionRules.passScore} %</DetailItem>
                  <DetailItem label="Assiduité minimale">{selectedVersion.completionRules.minAttendanceRate} %</DetailItem>
                  <DetailItem label="Achèvement">{selectedVersion.completionRules.requireAllActivities ? 'Toutes les activités obligatoires' : `${selectedVersion.completionRules.requiredActivityIds.length} activité(s) désignée(s)`}</DetailItem>
                </DetailList>
                {selectedVersion.changelog ? <p className="mt-4 whitespace-pre-line text-sm text-neutral-700">{selectedVersion.changelog}</p> : null}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="formateurs">
          <CourseTrainersPanel courseId={course.id} trainers={trainerRows} candidates={data.trainers} canManage={canPublish} />
        </TabsContent>

        <TabsContent value="inscriptions" className="flex flex-col gap-4">
          <FilterBar
            action={baseHref}
            hidden={{ onglet: 'inscriptions', version: sp.version }}
            fields={[
              { name: 'q', label: 'Recherche', placeholder: 'Nom ou email', value: sp.q },
              { name: 'statut', label: 'Statut', type: 'select', value: sp.statut, options: enrollmentStatuses.map((s) => ({ value: s, label: enrollmentStatusLabels[s] })) },
            ]}
          />
          {data.enrollments && data.enrollments.items.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprenant</TableHead>
                    <TableHead>Cohorte / organisation</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.enrollments.items.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <p className="font-semibold text-navy">{e.holderName}</p>
                        <p className="text-xs text-neutral-500">
                          {e.user.email} · inscrit le {formatDate(e.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-neutral-700">
                        {e.cohort ? e.cohort.name : <span className="text-neutral-400">Individuel</span>}
                        {e.organization ? <span className="block text-xs text-neutral-500">{e.organization.name}</span> : null}
                      </TableCell>
                      <TableCell className="min-w-[10rem]">
                        <Progress value={e.progressPercent} size="sm" showValue label={`Progression de ${e.holderName}`} />
                      </TableCell>
                      <TableCell>{e.score === null ? '-' : `${e.score} %`}</TableCell>
                      <TableCell>
                        <StatusBadge status={e.status} labels={enrollmentStatusLabels} size="sm" />
                        {e.certificates[0] ? (
                          <Badge variant="success" size="sm" className="ml-1">
                            <Award className="size-3" aria-hidden="true" />
                            {e.certificates[0].number}
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">{canPublish ? <EnrollmentStatusActions enrollmentId={e.id} courseId={course.id} holderName={e.holderName} allowed={e.allowedTransitions} /> : null}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={data.enrollments.page} totalPages={data.enrollments.totalPages} hrefFor={(p) => buildHref(baseHref, { onglet: 'inscriptions', version: sp.version, q: sp.q, statut: sp.statut, page: p > 1 ? p : undefined })} />
            </>
          ) : (
            <Card>
              <EmptyState compact icon={Users} title="Aucune inscription" description={sp.q || sp.statut ? 'Aucune inscription ne correspond aux filtres.' : 'Les inscriptions individuelles et celles des cohortes apparaîtront ici.'} />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="apercu" className="flex flex-col gap-4">
          <Card pillar={pillar ?? 'protection'}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <BookOpen className="mt-1 size-6 text-blue-600" aria-hidden="true" />
                <div>
                  <p className="font-display text-lg font-semibold text-navy">Fiche publique du cours</p>
                  <p className="text-sm text-neutral-600">
                    {course.status === 'PUBLISHED' ? 'Le cours est visible au catalogue : la fiche présente la version courante, les objectifs, le programme et les prochaines cohortes.' : 'Le cours n’est pas publié : la fiche publique renverra une page introuvable tant que le statut n’est pas « Publié ».'}
                  </p>
                  <p className="mt-2 font-mono text-xs text-neutral-500">/cours/{course.slug}</p>
                </div>
              </div>
              <Button asChild variant={course.status === 'PUBLISHED' ? 'primary' : 'outline'} size="sm">
                <Link href={`/cours/${course.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  Ouvrir la fiche
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <DetailList columns={3}>
                <DetailItem label="Résumé">{course.summary}</DetailItem>
                <DetailItem label="Public visé">{course.audience}</DetailItem>
                <DetailItem label="Prérequis">{course.prerequisitesText}</DetailItem>
                <DetailItem label="Politique d'inscription">{enrollmentPolicyLabels[course.enrollmentPolicy] ?? course.enrollmentPolicy}</DetailItem>
                <DetailItem label="Tarif">{course.isFree ? 'Gratuit' : `${course.priceAmount ?? 0} FCFA${course.memberPriceAmount !== null ? ` · membres ${course.memberPriceAmount} FCFA` : ''}`}</DetailItem>
                <DetailItem label="Catégorie">{course.category?.name}</DetailItem>
              </DetailList>
              {course.objectives.length ? (
                <div className="mt-4">
                  <p className="eyebrow mb-2 text-[11px] text-neutral-500">Objectifs pédagogiques</p>
                  <ul className="grid grid-cols-1 gap-1 text-sm text-neutral-700 sm:grid-cols-2">
                    {course.objectives.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span aria-hidden="true" className="mt-1 size-1.5 shrink-0 rounded-full bg-gold-500" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
