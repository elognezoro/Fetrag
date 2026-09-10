import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Clock, Megaphone, Tag, User } from 'lucide-react'
import { articles, seo } from '@fetrag/cms'
import { resolvePublicUrl } from '@fetrag/config'
import { formatDate } from '@fetrag/domain'
import { Badge, Breadcrumbs, Button, Container, GradientDivider, Prose, Reveal, Ribbon, RingBackdrop, Section, SectionHeading, Stagger, StaggerItem } from '@fetrag/ui'
import { ArticleCard } from '@/components/public/article-card'
import { CoverImage } from '@/components/public/cover-image'
import { JsonLd } from '@/components/public/json-ld'
import { NewsletterSection } from '@/components/public/newsletter-section'
import { ShareButtons } from '@/components/public/share-buttons'
import { loadArticle } from '@/server/public/loaders'
import { toMetadata } from '@/server/public/metadata'
import { safeQuery } from '@/server/public/safe'
import { buildHref } from '@/server/public/search-params'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await safeQuery('articles.getPublished(metadata)', () => loadArticle(slug), null)
  if (!article) return { title: 'Article introuvable', robots: { index: false, follow: false } }
  return toMetadata(seo.buildMetadata('article', article))
}

/** Article complet : en-tête éditorial, visuel, contenu riche, mots clés, partage et articles liés. */
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await loadArticle(slug)
  if (!article) notFound()

  const related = await safeQuery('articles.related', () => articles.related(article.id, 3), [])
  const canonical = `${resolvePublicUrl('web')}/actualites/${article.slug}`
  const authorName = article.author?.name?.trim() || null

  return (
    <>
      <JsonLd data={seo.jsonLd('article', article)} />
      <article>
        <header className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <RingBackdrop position="top-right" rings={4} opacity={0.06} />
          <Container size="wide" className="relative py-10 sm:py-14">
            <Breadcrumbs items={[{ label: 'Actualités', href: '/actualites' }, { label: article.title }]} homeHref="/" className="mb-6" />
            <Reveal className="flex max-w-3xl flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                {article.isCommunique ? (
                  <Ribbon tone="gold">
                    <span className="inline-flex items-center gap-1.5">
                      <Megaphone className="size-3.5" aria-hidden="true" />
                      Communiqué officiel
                    </span>
                  </Ribbon>
                ) : (
                  <Ribbon tone="blue">Actualité</Ribbon>
                )}
                {article.category ? (
                  <Badge variant="blue">
                    <Link href={buildHref('/actualites', {}, { categorie: article.category.slug })}>{article.category.name}</Link>
                  </Badge>
                ) : null}
              </div>
              <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-navy text-balance sm:text-4xl lg:text-5xl">{article.title}</h1>
              {article.excerpt ? <p className="text-lg leading-relaxed text-neutral-600 sm:text-xl">{article.excerpt}</p> : null}
              <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                {article.publishedAt ? (
                  <div className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-blue-600" aria-hidden="true" />
                    <dt className="sr-only">Publié le</dt>
                    <dd>
                      <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>
                    </dd>
                  </div>
                ) : null}
                {article.readingTime ? (
                  <div className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 text-blue-600" aria-hidden="true" />
                    <dt className="sr-only">Temps de lecture</dt>
                    <dd>{article.readingTime} min de lecture</dd>
                  </div>
                ) : null}
                <div className="inline-flex items-center gap-1.5">
                  <User className="size-4 text-blue-600" aria-hidden="true" />
                  <dt className="sr-only">Auteur</dt>
                  <dd>{authorName ?? 'Secrétariat général de la FETRAG'}</dd>
                </div>
              </dl>
              <GradientDivider width="lg" />
            </Reveal>
          </Container>
        </header>

        <Section variant="white" padding="md" containerSize="wide">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
            <div className="min-w-0">
              {article.coverImageUrl ? (
                <Reveal className="mb-8 overflow-hidden rounded-2xl border border-neutral-200 shadow-soft">
                  <CoverImage src={article.coverImageUrl} alt={article.coverAlt ?? ''} priority sizes="(min-width: 1024px) 60vw, 100vw" aspectClassName="aspect-[16/9]" />
                </Reveal>
              ) : null}
              <Reveal delay={0.05}>
                <Prose html={article.content} size="lg" />
              </Reveal>
              {article.tags.length > 0 ? (
                <nav aria-label="Mots clés" className="mt-10 flex flex-wrap items-center gap-2">
                  <Tag className="size-4 text-neutral-500" aria-hidden="true" />
                  {article.tags.map((entry) => (
                    <Link
                      key={entry}
                      href={buildHref('/actualites', {}, { tag: entry })}
                      className="inline-flex min-h-9 items-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-navy transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
                    >
                      #{entry}
                    </Link>
                  ))}
                </nav>
              ) : null}
              <div className="mt-10 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <ShareButtons url={canonical} title={article.title} />
                <Button asChild variant="ghost" size="md">
                  <Link href="/actualites">
                    <ArrowLeft aria-hidden="true" />
                    Toutes les actualités
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 pillar-top-blue">
                <p className="eyebrow text-[11px] text-neutral-500">À propos</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  Les communiqués et prises de position publiés ici engagent la Fédération des Travailleurs du Gabon et sont validés par son Secrétariat général.
                </p>
              </div>
              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <p className="eyebrow text-[11px] text-gold-800">Une question ?</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">Les services de la Fédération répondent aux travailleurs et aux organisations sous cinq jours ouvrés.</p>
                <Button asChild variant="gold" size="sm" className="mt-4">
                  <Link href="/contact">Nous contacter</Link>
                </Button>
              </div>
            </aside>
          </div>
        </Section>
      </article>

      {related.length > 0 ? (
        <Section variant="muted" padding="md" bordered aria-labelledby="related-title">
          <Reveal>
            <SectionHeading
              eyebrow="À lire aussi"
              tone="gold"
              size="md"
              title={
                <span id="related-title">
                  Autres <span className="italic text-gold-700">publications</span>
                </span>
              }
              className="mb-8"
            />
          </Reveal>
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <StaggerItem key={item.id} as="li" className="h-full">
                <ArticleCard article={item} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}

      <NewsletterSection />
    </>
  )
}
