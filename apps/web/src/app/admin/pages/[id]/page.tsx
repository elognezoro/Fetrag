import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert, AlertDescription } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { EditorLayout } from '@/components/admin/editor-layout'
import { PageForm } from '@/components/admin/page-form'
import { PublishPanel } from '@/components/admin/publish-panel'
import { RevisionList } from '@/components/admin/revision-list'
import { loadPageDetail, toPageFormValues } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cree?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Page ${id.slice(0, 8)}` }
}

/** Éditeur d'une page existante : contenu, blocs, réglages, SEO, workflow de publication et versions. */
export default async function EditPagePage({ params, searchParams }: PageProps) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams])
  const principal = await requireAdminCan('cms.read_drafts', `/admin/pages/${id}`)
  const abilities = adminAbilities(principal)
  const detail = await loadPageDetail(id, principal)
  if (!detail) notFound()
  const { page, revisions } = detail

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title={page.title}
        description={page.excerpt ?? undefined}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Pages', href: '/admin/pages' }, { label: page.title }]}
      />
      {cree === '1' ? (
        <Alert variant="success">
          <AlertDescription>La page a été créée en brouillon. Complétez-la puis publiez-la depuis le panneau « Publication ».</AlertDescription>
        </Alert>
      ) : null}
      <EditorLayout
        main={<PageForm page={toPageFormValues(page)} />}
        aside={
          <>
            <PublishPanel
              entity="page"
              id={page.id}
              title={page.title}
              status={page.status}
              slug={page.slug}
              publicPath={`/${page.slug}`}
              publishedAt={page.publishedAt}
              scheduledAt={page.scheduledAt}
              updatedAt={page.updatedAt}
              createdAt={page.createdAt}
              author={page.author?.name ?? page.author?.email ?? null}
              version={page.version}
              canWrite={abilities.write}
              canPublish={abilities.publish}
              supportsScheduling
              listHref="/admin/pages"
            />
            <RevisionList revisions={revisions} currentVersion={page.version} canWrite={abilities.write} />
          </>
        }
      />
    </div>
  )
}
