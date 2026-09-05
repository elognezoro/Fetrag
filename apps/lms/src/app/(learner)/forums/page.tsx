import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Lock, MessagesSquare, Users } from 'lucide-react'
import { formatRelative } from '@fetrag/domain'
import { Badge, EmptyState, PageHeader, Stagger, StaggerItem, cn } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { listMyForums, type ForumListItem } from '@/server/learner/forum-queries'

export const metadata: Metadata = {
  title: 'Forums',
  description: 'Espaces d’échange de vos formations et cohortes : questions aux formateurs, retours d’expérience, entraide entre leaders syndicaux.',
  robots: { index: false, follow: false },
}

type ForumGroupKey = 'cohort' | 'course' | 'general'

const groupMeta: Record<ForumGroupKey, { number: string; title: string; description: string; tone: 'blue' | 'green' | 'gold' }> = {
  cohort: { number: '01', title: 'Mes cohortes', description: 'Échanges réservés aux participants d’une session et à leur formateur.', tone: 'blue' },
  course: { number: '02', title: 'Mes formations', description: 'Forums ouverts à tous les inscrits d’un module du programme.', tone: 'green' },
  general: { number: '03', title: 'Communauté FETRAG', description: 'Espaces transversaux de la fédération, ouverts à tous les apprenants.', tone: 'gold' },
}

function groupOf(forum: ForumListItem): ForumGroupKey {
  if (forum.cohortId) return 'cohort'
  if (forum.courseId) return 'course'
  return 'general'
}

function ForumCard({ forum }: { forum: ForumListItem }) {
  const group = groupOf(forum)
  const topRule = group === 'cohort' ? 'pillar-top-blue' : group === 'course' ? 'pillar-top-green' : 'pillar-top-gold'
  return (
    <article className={cn('flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift', topRule)}>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <MessagesSquare className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {forum.isLocked ? (
            <Badge variant="neutral" size="sm">
              <Lock className="size-3" aria-hidden="true" />
              Verrouillé
            </Badge>
          ) : null}
          <Badge variant="outline" size="sm">
            {forum._count.threads} fil{forum._count.threads > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      <h3 className="mt-4 text-lg leading-snug">
        <Link href={`/forums/${forum.slug}`} className="hover:text-blue-700 hover:underline">
          {forum.title}
        </Link>
      </h3>
      <p className="mt-1 text-xs text-neutral-500">
        {forum.cohort ? (
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" aria-hidden="true" />
            {forum.cohort.name}
          </span>
        ) : forum.course ? (
          forum.course.title
        ) : (
          'Tous les apprenants'
        )}
      </p>
      {forum.description ? <p className="mt-3 text-sm leading-relaxed text-neutral-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">{forum.description}</p> : null}
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        {forum.lastThread ? (
          <p className="min-w-0 text-xs text-neutral-500">
            <span className="block truncate font-semibold text-neutral-700">{forum.lastThread.title}</span>
            <span>
              {forum.lastThread.author.name ?? 'Un participant'} · {formatRelative(forum.lastThread.updatedAt)}
            </span>
          </p>
        ) : (
          <p className="text-xs text-neutral-500">Aucun fil pour le moment : lancez la discussion.</p>
        )}
        <Link href={`/forums/${forum.slug}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40">
          Ouvrir
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

/** Forums accessibles à l'apprenant, groupés : cohortes, formations, communauté. */
export default async function ForumsPage() {
  const principal = await guards.requireUser('/forums')
  const forums = await listMyForums(principal)
  const groups = (['cohort', 'course', 'general'] as const).map((key) => ({ key, forums: forums.filter((f) => groupOf(f) === key) })).filter((g) => g.forums.length > 0)

  return (
    <>
      <PageHeader
        eyebrow="Forums"
        tone="blue"
        title={
          <>
            Échanger avec la <span className="italic text-blue-600">communauté</span>
          </>
        }
        description="Posez vos questions aux formateurs, partagez vos expériences de terrain et confrontez vos pratiques avec les autres leaders syndicaux en formation. Les échanges sont modérés par l’équipe pédagogique."
        breadcrumbs={[{ label: 'Tableau de bord', href: '/dashboard' }, { label: 'Forums' }]}
        homeHref="/"
      />

      <div className="container-fetrag flex flex-col gap-12 py-10 sm:py-12">
        {groups.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="Aucun forum accessible pour le moment"
            description="Les forums s’ouvrent avec vos inscriptions : chaque formation et chaque cohorte dispose de son espace d’échange."
          />
        ) : (
          groups.map((group) => {
            const meta = groupMeta[group.key]
            return (
              <section key={group.key} aria-labelledby={`forum-group-${group.key}`}>
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className={cn('font-display text-3xl font-semibold leading-none', meta.tone === 'blue' ? 'text-blue-600' : meta.tone === 'green' ? 'text-green-700' : 'text-gold-600')}>
                    {meta.number}
                  </span>
                  <div>
                    <h2 id={`forum-group-${group.key}`} className="text-xl sm:text-2xl">
                      {meta.title}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600">{meta.description}</p>
                  </div>
                </div>
                <Stagger as="ul" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={meta.title}>
                  {group.forums.map((forum) => (
                    <StaggerItem key={forum.id} as="li" className="h-full">
                      <ForumCard forum={forum} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            )
          })
        )}
      </div>
    </>
  )
}
