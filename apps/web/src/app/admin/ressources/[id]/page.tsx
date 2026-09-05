import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { accessLevelLabels } from '@fetrag/contracts'
import { formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { EditorLayout } from '@/components/admin/editor-layout'
import { PublishPanel } from '@/components/admin/publish-panel'
import { ResourceForm } from '@/components/admin/resource-form'
import { loadResourceDetail, toResourceFormValues } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { loadCategoryOptions, loadOrganizationOptions } from '@/server/admin/queries'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cree?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Ressource ${id.slice(0, 8)}` }
}

/** Éditeur d'une ressource documentaire existante. */
export default async function EditResourcePage({ params, searchParams }: PageProps) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams])
  const principal = await requireAdminCan('cms.read_drafts', `/admin/ressources/${id}`)
  const abilities = adminAbilities(principal)
  const [resource, categories, organizations] = await Promise.all([loadResourceDetail(id, principal), loadCategoryOptions('resource'), loadOrganizationOptions()])
  if (!resource) notFound()
  const offer = resource.offers[0]

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title={resource.title}
        description={resource.summary ?? undefined}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Ressources', href: '/admin/ressources' }, { label: resource.title }]}
      />
      {cree === '1' ? (
        <Alert variant="success">
          <AlertDescription>La ressource a été créée en brouillon. Vérifiez le fichier et le niveau d’accès avant publication.</AlertDescription>
        </Alert>
      ) : null}
      <EditorLayout
        main={<ResourceForm resource={toResourceFormValues(resource)} categories={categories} organizations={organizations} />}
        aside={
          <PublishPanel
            entity="resource"
            id={resource.id}
            title={resource.title}
            status={resource.status}
            slug={resource.slug}
            publicPath={`/ressources/${resource.slug}`}
            updatedAt={resource.updatedAt}
            createdAt={resource.createdAt}
            canWrite={abilities.write}
            canPublish={abilities.publish}
            listHref="/admin/ressources"
          >
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs text-neutral-600">
              <dt className="font-semibold text-navy">Accès</dt>
              <dd>{accessLevelLabels[resource.accessLevel]}</dd>
              <dt className="font-semibold text-navy">Téléchargements</dt>
              <dd>{resource.downloadCount}</dd>
              {offer ? (
                <>
                  <dt className="font-semibold text-navy">Offre</dt>
                  <dd>{formatMoney(offer.amount, offer.currency)}</dd>
                </>
              ) : null}
              {resource.organization ? (
                <>
                  <dt className="font-semibold text-navy">Organisation</dt>
                  <dd className="truncate">{resource.organization.name}</dd>
                </>
              ) : null}
            </dl>
          </PublishPanel>
        }
      />
    </div>
  )
}
