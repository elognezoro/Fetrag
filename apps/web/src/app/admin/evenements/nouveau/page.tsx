import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { EventForm } from '@/components/admin/event-form'
import { requireAdminCan } from '@/server/admin/context'
import { loadCategoryOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Nouvel événement' }

/** Programmation d'un nouvel événement (brouillon). */
export default async function NewEventPage() {
  await requireAdminCan('cms.write', '/admin/evenements/nouveau')
  const categories = await loadCategoryOptions('event')
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Relations"
        title="Nouvel événement"
        description="Renseignez la présentation, les dates, le lieu ou le lien de classe virtuelle, l’intervenant et les conditions d’inscription."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Événements', href: '/admin/evenements' }, { label: 'Nouvel événement' }]}
      />
      <EventForm categories={categories} />
    </div>
  )
}
