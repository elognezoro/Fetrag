'use client'

import { useState } from 'react'
import { CornerDownRight, Reply } from 'lucide-react'
import { formatDateTime, formatRelative } from '@fetrag/domain'
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, cn, initials } from '@fetrag/ui'
import type { ThreadView } from '@/server/learner/forum-queries'
import { ReplyForm } from './forum-forms'
import { PostActions } from './forum-moderation'

type Post = ThreadView['posts'][number]

interface ForumPostProps {
  post: Post
  forumSlug: string
  threadId: string
  canModerate: boolean
  canReply: boolean
  isFirst: boolean
  /** Message parent (réponse imbriquée). */
  parentAuthor?: string | null
}

function authorName(author: Post['author']): string {
  return author.name?.trim() || [author.firstName, author.lastName].filter(Boolean).join(' ') || 'Participant'
}

/** Message d'un fil : auteur, date relative, contenu, réponse imbriquée et actions. */
export function ForumPost({ post, forumSlug, threadId, canModerate, canReply, isFirst, parentAuthor }: ForumPostProps) {
  const [replying, setReplying] = useState(false)
  const name = authorName(post.author)
  const paragraphs = post.content.split(/\n{2,}/)

  return (
    <article
      id={`message-${post.id}`}
      className={cn('rounded-2xl border bg-white p-5 shadow-soft', post.isHidden ? 'border-dashed border-neutral-300 opacity-80' : isFirst ? 'border-blue-200 pillar-top-blue' : 'border-neutral-200', parentAuthor && 'ml-4 sm:ml-10')}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar size="md">
            {post.author.image ? <AvatarImage src={post.author.image} alt="" /> : null}
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-navy">
              {name}
              {post.isOwn ? <span className="ml-2 text-xs font-normal text-neutral-500">(vous)</span> : null}
            </p>
            <p className="text-xs text-neutral-500">
              <time dateTime={post.createdAt.toISOString()} title={formatDateTime(post.createdAt)}>
                {formatRelative(post.createdAt)}
              </time>
              {parentAuthor ? (
                <span className="ml-2 inline-flex items-center gap-1">
                  <CornerDownRight className="size-3" aria-hidden="true" />
                  en réponse à {parentAuthor}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.isHidden ? (
            <Badge variant="warning" size="sm">
              Masqué{post.hiddenReason ? ` : ${post.hiddenReason}` : ''}
            </Badge>
          ) : null}
          <PostActions forumSlug={forumSlug} threadId={threadId} postId={post.id} isHidden={post.isHidden} canModerate={canModerate} isOwn={post.isOwn} />
        </div>
      </header>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-neutral-800">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
      {canReply && !post.isHidden ? (
        <footer className="mt-4">
          {replying ? (
            <ReplyForm forumSlug={forumSlug} threadId={threadId} parentId={post.id} parentAuthor={name} onCancel={() => setReplying(false)} autoFocus />
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => setReplying(true)} leftIcon={<Reply aria-hidden="true" />}>
              Répondre
            </Button>
          )}
        </footer>
      ) : null}
    </article>
  )
}
