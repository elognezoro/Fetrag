import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eventKindLabels, sessionModeLabels } from '@fetrag/contracts'
import { formatDateTime, formatMoney } from '@fetrag/domain'
import { Alert, AlertDescription, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { AttendeeTable } from '@/components/admin/attendee-table'
import { EditorLayout } from '@/components/admin/editor-layout'
import { EventForm } from '@/components/admin/event-form'
import { PublishPanel } from '@/components/admin/publish-panel'
import { loadEventAttendees, loadEventDetail, toEventFormValues } from '@/server/admin/content-queries'
import { adminAbilities, requireAdminCan } from '@/server/admin/context'
import { loadCategoryOptions } from '@/server/admin/queries'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cree?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Événement ${id.slice(0, 8)}` }
}

/** Éditeur d'un événement : contenu, publication, participants et présences. */
export default async function EditEventPage({ params, searchParams }: PageProps) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams])
  const principal = await requireAdminCan('cms.read_drafts', `/admin/evenements/${id}`)
  const abilities = adminAbilities(principal)
  const [event, categories] = await Promise.all([loadEventDetail(id, principal), loadCategoryOptions('event')])
  if (!event) notFound()
  const attendees = abilities.write || abilities.readReports ? await loadEventAttendees(event.id, principal) : null

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title={event.title}
        description={`${eventKindLabels[event.kind]} · ${formatDateTime(event.startsAt)} · ${sessionModeLabels[event.mode]}${event.city ? ` · ${event.city}` : ''}`}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Événements', href: '/admin/evenements' }, { label: event.title }]}
      />
      {cree === '1' ? (
        <Alert variant="success">
          <AlertDescription>L’événement a été créé en brouillon. Publiez-le pour ouvrir les inscriptions.</AlertDescription>
        </Alert>
      ) : null}
      <EditorLayout
        main={
          <>
            <EventForm event={toEventFormValues(event)} categories={categories} />
            {attendees ? (
              <Card pillar="prevention">
                <CardHeader>
                  <CardTitle as="h2">Participants</CardTitle>
                  <CardDescription>
                    {event.registeredCount} inscrit{event.registeredCount > 1 ? 's' : ''}
                    {event.capacity ? ` sur ${event.capacity} place${event.capacity > 1 ? 's' : ''}` : ''}
                    {event.waitingCount > 0 ? ` · ${event.waitingCount} en liste d’attente` : ''}. Marquez les présences le jour de l’événement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendeeTable eventId={event.id} attendees={attendees} canMark={abilities.write} exportHref={`/admin/evenements/${event.id}/participants`} />
                </CardContent>
              </Card>
            ) : null}
          </>
        }
        aside={
          <PublishPanel
            entity="event"
            id={event.id}
            title={event.title}
            status={event.status}
            slug={event.slug}
            publicPath={`/evenements/${event.slug}`}
            publishedAt={event.publishedAt}
            updatedAt={event.updatedAt}
            createdAt={event.createdAt}
            canWrite={abilities.write}
            canPublish={abilities.publish}
            listHref="/admin/evenements"
          >
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs text-neutral-600">
              <dt className="font-semibold text-navy">Tarif</dt>
              <dd>{event.isFree ? 'Gratuit' : formatMoney(event.priceAmount ?? 0, event.currency)}</dd>
              <dt className="font-semibold text-navy">Places</dt>
              <dd>{event.capacity ? `${event.remainingSeats ?? 0} restante${(event.remainingSeats ?? 0) > 1 ? 's' : ''}` : 'Illimitées'}</dd>
              {event.issuesCertificate ? (
                <>
                  <dt className="font-semibold text-navy">Attestation</dt>
                  <dd>Délivrée aux présents</dd>
                </>
              ) : null}
            </dl>
          </PublishPanel>
        }
      />
    </div>
  )
}
