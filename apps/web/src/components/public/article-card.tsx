import Link from 'next/link'
import { ArrowRight, Clock, Megaphone } from 'lucide-react'
import type { ArticleCard as ArticleCardData } from '@fetrag/cms'
import { formatDate } from '@fetrag/domain'
import { Badge, cn } from '@fetrag/ui'
import { CoverImage } from './cover-image'

interface ArticleCardProps {
  article: ArticleCardData
  /** Carte mise en avant (image plus haute, titre plus grand). */
  featured?: boolean
  priority?: boolean
  className?: string
}

/** Carte d'actualité : visuel, catégorie, communiqué, titre serif, extrait, date et temps de lecture. */
export function ArticleCard({ article, featured = false, priority = false, className }: ArticleCardProps) {
  const href = `/actualites/${article.slug}`
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft transition-[transform,box-shadow] duration-180 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift',
        article.isCommunique ? 'pillar-top-gold' : 'pillar-top-blue',
        className,
      )}
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <CoverImage
          src={article.coverImageUrl}
          alt={article.coverAlt ?? ''}
          priority={priority}
          tone={article.isCommunique ? 'gold' : 'blue'}
          aspectClassName={featured ? 'aspect-[16/9]' : 'aspect-[16/10]'}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.isCommunique ? (
            <Badge variant="gold">
              <Megaphone aria-hidden="true" />
              Communiqué
            </Badge>
          ) : null}
          {article.category ? <Badge variant="blue">{article.category.name}</Badge> : null}
          {article.isFeatured && !article.isCommunique ? <Badge variant="green">À la une</Badge> : null}
        </div>
        <h3 className={cn('font-display font-semibold leading-tight tracking-tight text-navy', featured ? 'text-2xl sm:text-3xl' : 'text-xl')}>
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {article.title}
          </Link>
        </h3>
        {article.excerpt ? <p className={cn('text-neutral-600', featured ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm')}>{article.excerpt}</p> : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs font-semibold text-neutral-500">
          <span className="inline-flex items-center gap-2">
            {article.publishedAt ? <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time> : null}
            {article.readingTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {article.readingTime} min
              </span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-1 text-blue-600">
            Lire
            <ArrowRight className="size-3.5 transition-transform duration-180 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  )
}
