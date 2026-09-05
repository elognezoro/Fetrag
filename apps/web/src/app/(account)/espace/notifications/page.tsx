import type { Metadata } from 'next'
import { guards } from '@/lib/auth'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { NotificationList } from '@/components/account/notification-list'
import { loadUserNotifications } from '@/server/account/queries'

export const metadata: Metadata = { title: 'Notifications' }

interface PageProps {
  searchParams: Promise<{ curseur?: string; 'non-lues'?: string }>
}

/** Centre de notifications de l'espace personnel. */
export default async function NotificationsPage({ searchParams }: PageProps) {
  const principal = await guards.requireUser('/espace/notifications')
  const params = await searchParams
  const unreadOnly = params['non-lues'] === '1'
  const data = await loadUserNotifications(principal, params.curseur, unreadOnly)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Notifications"
        title={
          <>
            Vos <span className="italic text-green-700">notifications</span>
          </>
        }
        description="Convocations aux séances, résultats, certificats, avancement de vos demandes et messages de la fédération."
      />
      <NotificationList
        unread={data.unread}
        unreadOnly={unreadOnly}
        nextCursor={data.nextCursor}
        items={data.items.map((item) => ({
          id: item.id,
          category: item.category,
          title: item.title,
          body: item.body,
          href: item.href,
          readAt: item.readAt ? item.readAt.toISOString() : null,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
