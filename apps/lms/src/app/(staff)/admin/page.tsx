import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Award, BookOpen, GitBranch, HelpCircle, Plus, ScrollText, Settings, Shield, Users, type LucideIcon } from 'lucide-react'
import { contentStatusLabels, pillarLabels, type PillarName } from '@fetrag/contracts'
import { formatDate } from '@fetrag/domain'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Reveal, Stagger, StaggerItem, StatusBadge, pillarTone, type Tone } from '@fetrag/ui'
import { AuditLogTable } from '@/components/staff/audit-log-table'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { adminOverview } from '@/server/staff/admin-queries'
import { adminNav, canAccessAdminSpace } from '@/server/staff/navigation'

export const metadata: Metadata = { title: 'Administration' }
export const dynamic = 'force-dynamic'

const quickLinkIcons: Record<string, LucideIcon> = {
  '/admin/cours': BookOpen,
  '/admin/questions': HelpCircle,
  '/admin/certificats': Award,
  '/admin/utilisateurs': Users,
  '/admin/parametres': Settings,
  '/admin/audit': ScrollText,
}

const quickLinkDescriptions: Record<string, string> = {
  '/admin/cours': 'Fiches, structure, versions, formateurs et inscriptions des modules du programme.',
  '/admin/questions': 'Questions réutilisables par type, catégorie et étiquette ; import CSV.',
  '/admin/certificats': 'Modèles d’attestations et de certificats, critères d’éligibilité, PDF émis.',
  '/admin/utilisateurs': 'Comptes, rôles LMS et portées, organisations, inscriptions.',
  '/admin/parametres': 'Paramètres système de la formation et file de jobs.',
  '/admin/audit': 'Journal des actions LMS : cours, inscriptions, notes, présences, certificats, rôles.',
}

/** Accueil de l'administration LMS : indicateurs, liens rapides, cours récents, dernières actions journalisées. */
export default async function AdminHomePage() {
  const principal = await guards.requireUser('/admin')
  if (!canAccessAdminSpace(principal)) redirect('/acces-refuse')
  const overview = await adminOverview(principal)
  const links = adminNav(principal).filter((item) => item.href !== '/admin')

  return (
    <>
      <StaffPageHeader
        eyebrow="Administration LMS"
        title={
          <>
            Administrer la <span className="italic text-blue-600">plateforme de formation</span>
          </>
        }
        description="Cours et versions figées, banque de questions, modèles de certificats, comptes et rôles, paramètres et journal d'audit. Toute publication est journalisée."
        tone="navy"
        actions={
          <>
            <Button asChild variant="primary" size="sm">
              <Link href="/admin/cours/nouveau">
                <Plus aria-hidden="true" />
                Nouveau cours
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/questions/nouvelle">
                <HelpCircle aria-hidden="true" />
                Nouvelle question
              </Link>
            </Button>
          </>
        }
      />

      <StatGrid
        items={[
          { value: overview.courses.published, label: 'Cours publiés', icon: BookOpen, tone: 'blue', description: `${overview.courses.draft} brouillon(s)${overview.courses.review ? ` dont ${overview.courses.review} en relecture` : ''}` },
          { value: overview.versions.total, label: 'Versions de cours', icon: GitBranch, tone: 'green', description: `${overview.versions.published} publiée(s) et figée(s)` },
          { value: overview.questions, label: 'Questions actives', icon: HelpCircle, tone: 'gold', description: 'Banque de questions réutilisable' },
          { value: overview.templates, label: 'Modèles de certificats', icon: Award, tone: 'navy', description: `${overview.certificatesIssued} certificat(s) émis` },
        ]}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow text-[11px] text-neutral-500">Utilisateurs</p>
            <p className="mt-1 font-display text-3xl font-semibold text-navy">{overview.users.total}</p>
            <p className="text-sm text-neutral-600">{overview.users.active30Days} actif(s) sur 30 jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow text-[11px] text-neutral-500">Inscriptions</p>
            <p className="mt-1 font-display text-3xl font-semibold text-navy">{overview.enrollments.active}</p>
            <p className="text-sm text-neutral-600">
              en cours · {overview.enrollments.completed} terminée(s)
              {overview.enrollments.pending ? ` · ${overview.enrollments.pending} à valider` : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="eyebrow text-[11px] text-neutral-500">File de jobs</p>
            {overview.jobs ? (
              <>
                <p className="mt-1 font-display text-3xl font-semibold text-navy">{overview.jobs.dueNow}</p>
                <p className="text-sm text-neutral-600">
                  à traiter · {overview.jobs.FAILED} en échec
                  {overview.jobs.DEAD ? (
                    <Badge variant="danger" size="sm" className="ml-2">
                      {overview.jobs.DEAD} abandonné(s)
                    </Badge>
                  ) : null}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-neutral-500">Indisponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      <StaffSection number="01" title="Accès rapides" className="mt-10" tone="navy">
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item, index) => {
            const Icon = quickLinkIcons[item.href] ?? Shield
            const tone: Tone = (['blue', 'green', 'gold'] as const)[index % 3] ?? 'blue'
            const pillar = tone === 'blue' ? 'protection' : tone === 'green' ? 'prevention' : 'defense'
            return (
              <StaggerItem key={item.href}>
                <Card pillar={pillar} interactive className="h-full">
                  <Link href={item.href} className="flex h-full flex-col gap-3 p-5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
                    <span className="flex size-11 items-center justify-center rounded-full bg-neutral-50 text-blue-600 shadow-soft">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="font-display text-lg font-semibold text-navy">{item.label}</span>
                    <span className="text-sm text-neutral-600">{quickLinkDescriptions[item.href]}</span>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                      Ouvrir
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Card>
              </StaggerItem>
            )
          })}
        </Stagger>
      </StaffSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <StaffSection
          number="02"
          title="Cours récemment modifiés"
          className="lg:col-span-2"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/cours">
                Tous les cours
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          <Reveal>
            <Card>
              <CardContent className="p-0">
                {overview.recentCourses.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {overview.recentCourses.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                        <div className="min-w-0">
                          <Link href={`/admin/cours/${c.id}`} className="font-semibold text-navy hover:underline">
                            {c.title}
                          </Link>
                          <p className="text-xs text-neutral-500">
                            {c.code}
                            {c.pillar ? ` · ${pillarLabels[c.pillar as PillarName] ?? c.pillar}` : ''} · v{c.currentVersion?.version ?? '-'} · {c._count.enrollments} inscrit(s) · {formatDate(c.updatedAt)}
                          </p>
                        </div>
                        <StatusBadge status={c.status} labels={contentStatusLabels} size="sm" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState compact icon={BookOpen} title="Aucun cours" description="Créez le premier module du programme." />
                )}
              </CardContent>
            </Card>
          </Reveal>
        </StaffSection>

        <StaffSection
          number="03"
          title="Dernières actions journalisées"
          className="lg:col-span-3"
          tone="gold"
          actions={
            overview.canSeeAudit ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/audit">
                  Journal complet
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : undefined
          }
        >
          {overview.canSeeAudit ? (
            <Reveal delay={0.05}>
              <AuditLogTable rows={overview.recentAudit} compact />
            </Reveal>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle as="h3">Journal réservé</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-600">Le journal d’audit est consultable par la coordination, la finance et la super administration.</CardContent>
            </Card>
          )}
        </StaffSection>
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        Piliers du programme : {(['protection', 'prevention', 'defense'] as const).map((p, i) => (
          <span key={p}>
            {i ? ' · ' : ''}
            <Badge variant={pillarTone[p]} size="sm">
              {pillarLabels[p]}
            </Badge>
          </span>
        ))}
      </p>
    </>
  )
}
