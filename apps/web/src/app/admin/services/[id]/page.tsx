import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, Button } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { EditorLayout } from '@/components/admin/editor-layout'
import { PublishPanel } from '@/components/admin/publish-panel'
import { ServiceForm } from '@/components/admin/service-form'
import { loadServiceDetail, toServiceFormValues } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminAny } from '@/server/admin/context'
import { loadCategoryOptions } from '@/server/admin/queries'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cree?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Service ${id.slice(0, 8)}` }
}

/** Éditeur d'un service existant avec panneau de publication et accès aux demandes reçues. */
export default async function EditServicePage({ params, searchParams }: PageProps) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams])
  const principal = await requireAdminAny(['services.manage', 'cms.read_drafts'], `/admin/services/${id}`)
  const abilities = adminAbilities(principal)
  const [service, categories] = await Promise.all([loadServiceDetail(id, principal), loadCategoryOptions('service')])
  if (!service) notFound()

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Services"
        title={service.name}
        description={service.summary ?? undefined}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Services', href: '/admin/services' }, { label: service.name }]}
      />
      {cree === '1' ? (
        <Alert variant="success">
          <AlertDescription>Le service a été créé en brouillon. Publiez-le pour l’afficher dans le catalogue public.</AlertDescription>
        </Alert>
      ) : null}
      {!abilities.manageServices ? (
        <Alert variant="info">
          <AlertDescription>Vous consultez ce service en lecture seule : seule l’équipe des services peut le modifier.</AlertDescription>
        </Alert>
      ) : null}
      <EditorLayout
        main={<ServiceForm service={toServiceFormValues(service)} categories={categories} />}
        aside={
          <PublishPanel
            entity="service"
            id={service.id}
            title={service.name}
            status={service.status}
            slug={service.slug}
            publicPath={`/services/${service.slug}`}
            updatedAt={service.updatedAt}
            createdAt={service.createdAt}
            canWrite={abilities.manageServices}
            canPublish={abilities.manageServices || abilities.publish}
            listHref="/admin/services"
          >
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs text-neutral-600">
              <dt className="font-semibold text-navy">Tarif</dt>
              <dd>{service.isPaid ? formatMoney(service.priceAmount ?? 0, service.currency) : 'Gratuit'}</dd>
              <dt className="font-semibold text-navy">Demandes</dt>
              <dd>{service._count.requests}</dd>
              <dt className="font-semibold text-navy">Formulaire</dt>
              <dd>{service.formSchema?.length ? `${service.formSchema.length} champ${service.formSchema.length > 1 ? 's' : ''} spécifique${service.formSchema.length > 1 ? 's' : ''}` : 'Champs standards'}</dd>
            </dl>
            {abilities.handleRequests ? (
              <Button asChild variant="secondary" size="sm" className="self-start">
                <Link href={`/admin/demandes?service=${service.id}`}>Voir les demandes</Link>
              </Button>
            ) : null}
          </PublishPanel>
        }
      />
    </div>
  )
}
