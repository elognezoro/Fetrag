import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eye, Lock, MessageSquare, Pin, Search, ShieldCheck, Users } from 'lucide-react'
import { formatRelative } from '@fetrag/domain'
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, EmptyState, Input, PageHeader, Pagination, cn, initials } from '@fetrag/ui'
import { NewThreadForm } from '@/components/learner/forum-forms'
import { guards } from '@/lib/auth'
import { getForumTitle, getForumView } from '@/server/learner/forum-queries'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const title = await getForumTitle(slug)
  return { title: title ? `Forum - ${title}` : 'Forum', robots: { index: false, follow: false } }
}

function authorName(author: { name: string | null; firstName: string | null; lastName: string | null }): string {
  return author.name?.trim() || [author.firstName, author.lastName].filter(Boolean).join(' ') || 'Participant'
}

/** Un forum : fils épinglés puis récents, recherche, pagination, création de fil. */
export default async function ForumPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const principal = await guards.requireUser(`/forums/${slug}`)
  const q = first(sp.q)?.trim() || undefined
  const page = Math.max(1, Number(first(sp.page)) || 1)
  const view = await getForumView(principal, slug, { page, q })
  if (!view) notFound()
  const { forum, threads } = view

  const hrefFor = (target: number) => `/forums/${slug}?${new URLSearchParams({ ...(q ? { q } : {}), ...(target > 1 ? { page: String(target) } : {}) }).toString()}`.replace(/\?$/, '')

  return (
    <>
      <PageHeader
        eyebrow={forum.cohort ? 'Forum de cohorte' : forum.course ? 'Forum de formation' : 'Forum communautaire'}
        tone={forum.cohort ? 'blue' : forum.course ? 'green' : 'gold'}
        title={forum.title}
        description={forum.description ?? 'Espace d’échange modéré par l’équipe pédagogique de la FETRAG. Restez courtois, concrets et bienveillants.'}
        breadcrumbs={[{ label: 'Forums', href: '/forums' }, { label: forum.title }]}
        homeHref="/dashboard"
        meta={
          <div className="flex flex-wrap items-center gap-2">
            {forum.cohort ? (
              <Badge variant="blue" size="sm">
                <Users className="size-3" aria-hidden="true" />
                {forum.cohort.name}
              </Badge>
            ) : null}
            {forum.course ? (
              <Badge variant="green" size="sm">
                <Link href={`/cours/${forum.course.slug}`}>{forum.course.title}</Link>
              </Badge>
            ) : null}
            {forum.isLocked ? (
              <Badge variant="neutral" size="sm">
                <Lock className="size-3" aria-hidden="true" />
                Verrouillé
              </Badge>
            ) : null}
            {forum.canModerate ? (
              <Badge variant="gold" size="sm">
                <ShieldCheck className="size-3" aria-hidden="true" />
                Vous modérez ce forum
              </Badge>
            ) : null}
          </div>
        }
      />

      <div className="container-fetrag flex flex-col gap-8 py-10 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form action={`/forums/${slug}`} method="get" role="search" className="flex w-full max-w-md gap-2">
            <label htmlFor="forum-search" className="sr-only">
              Rechercher un fil
            </label>
            <Input id="forum-search" name="q" type="search" defaultValue={q ?? ''} leadingIcon={Search} placeholder="Rechercher un fil par titre" />
            <Button type="submit" variant="secondary" size="md" className="shrink-0">
              Rechercher
            </Button>
          </form>
          <NewThreadForm forumSlug={slug} locked={forum.isLocked} />
        </div>

        {threads.items.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={q ? `Aucun fil ne correspond à « ${q} »` : 'Aucun fil de discussion pour le moment'}
            description={q ? 'Essayez un autre mot-clé ou affichez tous les fils.' : 'Soyez le premier à ouvrir la discussion : une question, un retour d’expérience, une ressource utile.'}
            action={
              q ? (
                <Button asChild variant="secondary">
                  <Link href={`/forums/${slug}`}>Tous les fils</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="text-sm text-neutral-600" aria-live="polite">
              {threads.total} fil{threads.total > 1 ? 's' : ''}
              {q ? ` pour « ${q} »` : ''}
            </p>
            <ol className="flex flex-col gap-3" aria-label="Fils de discussion">
              {threads.items.map((thread) => {
                const name = authorName(thread.author)
                return (
                  <li key={thread.id}>
                    <Link
                      href={`/forums/${slug}/${thread.id}`}
                      className={cn(
                        'flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-soft transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 sm:p-5',
                        thread.isPinned ? 'border-gold-200 pillar-top-gold' : 'border-neutral-200',
                      )}
                    >
                      <Avatar size="md" className="mt-0.5 shrink-0">
                        {thread.author.image ? <AvatarImage src={thread.author.image} alt="" /> : null}
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          {thread.isPinned ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gold-700">
                              <Pin className="size-3" aria-hidden="true" />
                              Épinglé
                            </span>
                          ) : null}
                          {thread.isLocked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                              <Lock className="size-3" aria-hidden="true" />
                              Verrouillé
                            </span>
                          ) : null}
                        </span>
                        <span className="block truncate text-base font-semibold text-navy">{thread.title}</span>
                        <span className="mt-1 block text-xs text-neutral-500">
                          Par {name} · ouvert {formatRelative(thread.createdAt)}
                          {thread.lastPost && thread.replyCount > 0 ? ` · dernière réponse ${formatRelative(thread.lastPost.createdAt)}` : ''}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1 text-xs text-neutral-500">
                        <span className="inline-flex items-center gap-1 font-semibold text-navy">
                          <MessageSquare className="size-3.5 text-blue-600" aria-hidden="true" />
                          {thread.replyCount}
                          <span className="sr-only"> réponse{thread.replyCount > 1 ? 's' : ''}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3.5" aria-hidden="true" />
                          {thread.viewCount}
                          <span className="sr-only"> vue{thread.viewCount > 1 ? 's' : ''}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
            <Pagination page={threads.page} totalPages={threads.totalPages} hrefFor={hrefFor} label="Pagination des fils" />
          </>
        )}
      </div>
    </>
  )
}
