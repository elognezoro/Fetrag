import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert, AlertDescription } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ArticleForm } from '@/components/admin/article-form'
import { EditorLayout } from '@/components/admin/editor-layout'
import { PublishPanel } from '@/components/admin/publish-panel'
import { loadArticleDetail, toArticleFormValues } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { loadCategoryOptions } from '@/server/admin/queries'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cree?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Actualité ${id.slice(0, 8)}` }
}

/** Éditeur d'une actualité existante avec panneau de publication. */
export default async function EditArticlePage({ params, searchParams }: PageProps) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams])
  const principal = await requireAdminCan('cms.read_drafts', `/admin/actualites/${id}`)
  const abilities = adminAbilities(principal)
  const [article, categories] = await Promise.all([loadArticleDetail(id, principal), loadCategoryOptions('article')])
  if (!article) notFound()

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title={article.title}
        description={article.excerpt ?? undefined}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Actualités', href: '/admin/actualites' }, { label: article.title }]}
      />
      {cree === '1' ? (
        <Alert variant="success">
          <AlertDescription>L’actualité a été créée en brouillon. Envoyez-la en relecture ou publiez-la depuis le panneau « Publication ».</AlertDescription>
        </Alert>
      ) : null}
      <EditorLayout
        main={<ArticleForm article={toArticleFormValues(article)} categories={categories} />}
        aside={
          <PublishPanel
            entity="article"
            id={article.id}
            title={article.title}
            status={article.status}
            slug={article.slug}
            publicPath={`/actualites/${article.slug}`}
            publishedAt={article.publishedAt}
            scheduledAt={article.scheduledAt}
            updatedAt={article.updatedAt}
            createdAt={article.createdAt}
            author={article.author?.name ?? article.author?.email ?? null}
            canWrite={abilities.write}
            canPublish={abilities.publish}
            supportsScheduling
            listHref="/admin/actualites"
          >
            <p className="text-xs text-neutral-500">
              {article.viewCount} consultation{article.viewCount > 1 ? 's' : ''}
              {article.readingTime ? ` · ${article.readingTime} min de lecture` : ''}
            </p>
          </PublishPanel>
        }
      />
    </div>
  )
}
