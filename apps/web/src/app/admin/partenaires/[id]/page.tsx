import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Trash2 } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EditorLayout } from '@/components/admin/editor-layout'
import { PartnerForm, partnerKindLabels } from '@/components/admin/partner-form'
import { deleteContentAction } from '@/server/admin/content-actions'
import { loadPartnerDetail, toPartnerFormValues } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cree?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Partenaire ${id.slice(0, 8)}` }
}

/** Fiche et édition d'un partenaire. */
export default async function EditPartnerPage({ params, searchParams }: PageProps) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams])
  const principal = await requireAdminCan('cms.read_drafts', `/admin/partenaires/${id}`)
  const abilities = adminAbilities(principal)
  const partner = await loadPartnerDetail(id)
  if (!partner) notFound()

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title={partner.name}
        description={partner.description ?? undefined}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Partenaires', href: '/admin/partenaires' }, { label: partner.name }]}
      />
      {cree === '1' ? (
        <Alert variant="success">
          <AlertDescription>Le partenaire a été enregistré et apparaît immédiatement sur le site s’il est visible.</AlertDescription>
        </Alert>
      ) : null}
      <EditorLayout
        main={<PartnerForm partner={toPartnerFormValues(partner)} />}
        aside={
          <Card pillar="defense">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle as="h2">Fiche</CardTitle>
              <Badge variant={partner.isActive ? 'success' : 'neutral'} size="sm" dot>
                {partner.isActive ? 'Visible' : 'Masqué'}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs text-neutral-600">
                <dt className="font-semibold text-navy">Type</dt>
                <dd>{partnerKindLabels[partner.kind]}</dd>
                <dt className="font-semibold text-navy">Slug</dt>
                <dd className="truncate font-mono">{partner.slug}</dd>
                <dt className="font-semibold text-navy">Modifié le</dt>
                <dd>{formatDateTime(partner.updatedAt)}</dd>
              </dl>
              {partner.website ? (
                <Button asChild variant="ghost" size="sm" className="self-start">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    Site web
                    <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
              {abilities.write ? (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" size="sm" className="self-start text-red-700 hover:bg-red-50" leftIcon={<Trash2 aria-hidden="true" />}>
                      Supprimer le partenaire
                    </Button>
                  }
                  title={`Supprimer « ${partner.name} » ?`}
                  description="Cette action est définitive. Préférez masquer le partenaire si la relation est suspendue."
                  confirmLabel="Supprimer"
                  destructive
                  onConfirm={deleteContentAction.bind(null, 'partner', partner.id)}
                  redirectTo="/admin/partenaires"
                />
              ) : null}
              <Button asChild variant="link" size="sm" className="self-start px-0">
                <Link href="/admin/partenaires">Retour à la liste</Link>
              </Button>
            </CardContent>
          </Card>
        }
      />
    </div>
  )
}
