import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Eye, Lock, MessageSquare, Pin } from 'lucide-react'
import { formatDateTime, formatRelative } from '@fetrag/domain'
import { Alert, AlertDescription, Badge, Breadcrumbs, Button, Ribbon } from '@fetrag/ui'
import { ReplyForm } from '@/components/learner/forum-forms'
import { ThreadModerationMenu } from '@/components/learner/forum-moderation'
import { ForumPost } from '@/components/learner/forum-post'
import { guards } from '@/lib/auth'
import { getThreadTitle, getThreadView, type ThreadView } from '@/server/learner/forum-queries'

interface PageProps {
  params: Promise<{ slug: string; threadId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { threadId } = await params
  const title = await getThreadTitle(threadId)
  return { title: title ?? 'Fil de discussion', robots: { index: false, follow: false } }
}

type Post = ThreadView['posts'][number]

function authorName(author: Post['author']): string {
  return author.name?.trim() || [author.firstName, author.lastName].filter(Boolean).join(' ') || 'Participant'
}

/** Ordonne les messages : racines dans l'ordre chronologique, chaque réponse imbriquée sous son parent. */
function orderPosts(posts: Post[]): Array<{ post: Post; parentAuthor: string | null }> {
  const byParent = new Map<string, Post[]>()
  const byId = new Map(posts.map((p) => [p.id, p] as const))
  for (const post of posts) {
    if (post.parentId && byId.has(post.parentId)) {
      const list = byParent.get(post.parentId) ?? []
      list.push(post)
      byParent.set(post.parentId, list)
    }
  }
  const out: Array<{ post: Post; parentAuthor: string | null }> = []
  const visit = (post: Post, parentAuthor: string | null) => {
    out.push({ post, parentAuthor })
    for (const child of byParent.get(post.id) ?? []) visit(child, authorName(post.author))
  }
  for (const post of posts) {
    if (!post.parentId || !byId.has(post.parentId)) visit(post, null)
  }
  return out
}

/** Un fil : message initial, réponses (imbriquées), formulaire de réponse, modération visible pour l'équipe pédagogique. */
export default async function ThreadPage({ params }: PageProps) {
  const { slug, threadId } = await params
  const principal = await guards.requireUser(`/forums/${slug}/${threadId}`)
  const thread = await getThreadView(principal, threadId)
  if (!thread) notFound()
  if (thread.forum.slug !== slug) redirect(`/forums/${thread.forum.slug}/${thread.id}`)

  const ordered = orderPosts(thread.posts)
  const replyCount = Math.max(0, thread.posts.filter((p) => !p.isHidden).length - 1)
  const name = authorName(thread.author)

  return (
    <div className="container-fetrag py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Forums', href: '/forums' }, { label: thread.forum.title, href: `/forums/${slug}` }, { label: thread.title }]} homeHref="/dashboard" />

      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft pillar-top-blue sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="min-w-0">
            <Ribbon tone="blue">Fil de discussion</Ribbon>
            <h1 className="mt-4 text-2xl sm:text-3xl">{thread.title}</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Ouvert par <span className="font-semibold text-navy">{name}</span> le {formatDateTime(thread.createdAt)} · dernière activité {formatRelative(thread.updatedAt)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm">
                <MessageSquare className="size-3" aria-hidden="true" />
                {replyCount} réponse{replyCount > 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" size="sm">
                <Eye className="size-3" aria-hidden="true" />
                {thread.viewCount} vue{thread.viewCount > 1 ? 's' : ''}
              </Badge>
              {thread.isPinned ? (
                <Badge variant="gold" size="sm">
                  <Pin className="size-3" aria-hidden="true" />
                  Épinglé
                </Badge>
              ) : null}
              {thread.isLocked || thread.forum.isLocked ? (
                <Badge variant="neutral" size="sm">
                  <Lock className="size-3" aria-hidden="true" />
                  Verrouillé
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/forums/${slug}`}>
                <ArrowLeft aria-hidden="true" />
                Retour au forum
              </Link>
            </Button>
            {thread.canModerate ? <ThreadModerationMenu forumSlug={slug} threadId={thread.id} isLocked={thread.isLocked} isPinned={thread.isPinned} /> : null}
          </div>
        </header>

        <ol className="flex flex-col gap-4" aria-label="Messages du fil">
          {ordered.map(({ post, parentAuthor }, index) => (
            <li key={post.id}>
              <ForumPost post={post} forumSlug={slug} threadId={thread.id} canModerate={thread.canModerate} canReply={thread.canReply} isFirst={index === 0} parentAuthor={parentAuthor} />
            </li>
          ))}
        </ol>

        {thread.canReply ? (
          <section aria-labelledby="reply-title">
            <h2 id="reply-title" className="mb-3 text-xl">
              Participer à la discussion
            </h2>
            <ReplyForm forumSlug={slug} threadId={thread.id} />
          </section>
        ) : (
          <Alert variant="info" icon={Lock}>
            <AlertDescription>Ce fil est verrouillé : la lecture reste possible mais aucune nouvelle réponse ne peut être publiée.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
