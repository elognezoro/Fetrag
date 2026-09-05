'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { formatRelative } from '@fetrag/domain'
import { Button, EmptyState, cn, toast } from '@fetrag/ui'
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/server/learner/notification-actions'

export interface NotificationItem {
  id: string
  title: string
  body: string
  href: string | null
  read: boolean
  /** Date ISO (sérialisable). */
  createdAt: string
}

interface NotificationListProps {
  notifications: NotificationItem[]
  unreadCount: number
}

function isInternal(href: string): boolean {
  return href.startsWith('/')
}

/** Notifications internes récentes : lecture au clic, « tout marquer comme lu ». */
export function NotificationList({ notifications, unreadCount }: NotificationListProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [items, markRead] = useOptimistic(notifications, (state, id: string | 'all') => state.map((n) => (id === 'all' || n.id === id ? { ...n, read: true } : n)))
  const unread = items.filter((n) => !n.read).length

  function readOne(id: string, href: string | null) {
    startTransition(async () => {
      markRead(id)
      const result = await markNotificationReadAction(id)
      if (!result.ok) toast.error(result.error)
      if (href) {
        if (isInternal(href)) router.push(href)
        else window.location.assign(href)
      } else {
        router.refresh()
      }
    })
  }

  function readAll() {
    startTransition(async () => {
      markRead('all')
      const result = await markAllNotificationsReadAction()
      if (!result.ok) toast.error(result.error)
      else toast.success('Notifications marquées comme lues.')
      router.refresh()
    })
  }

  if (items.length === 0) {
    return <EmptyState compact icon={Bell} title="Aucune notification" description="Convocations, résultats et messages de la coordination apparaîtront ici." />
  }

  return (
    <div className="flex flex-col gap-3">
      {unread > 0 || unreadCount > items.length ? (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={readAll} disabled={pending} leftIcon={<CheckCheck aria-hidden="true" />}>
            Tout marquer comme lu
          </Button>
        </div>
      ) : null}
      <ul className="flex flex-col gap-2" aria-live="polite">
        {items.map((notification) => {
          const inner = (
            <>
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', notification.read ? 'bg-neutral-300' : 'bg-green-500')} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm leading-snug', notification.read ? 'font-medium text-neutral-700' : 'font-semibold text-navy')}>
                  {notification.title}
                  {!notification.read ? <span className="sr-only"> (non lue)</span> : null}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-neutral-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{notification.body}</span>
                <time dateTime={notification.createdAt} className="mt-1 block text-[11px] text-neutral-400">
                  {formatRelative(new Date(notification.createdAt))}
                </time>
              </span>
            </>
          )
          const className = cn(
            'flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
            notification.read ? 'border-neutral-200 bg-white' : 'border-green-200 bg-green-50/50 hover:bg-green-50',
          )
          return (
            <li key={notification.id}>
              {notification.read && notification.href ? (
                isInternal(notification.href) ? (
                  <Link href={notification.href} className={className}>
                    {inner}
                  </Link>
                ) : (
                  <a href={notification.href} className={className}>
                    {inner}
                  </a>
                )
              ) : (
                <button type="button" className={className} disabled={pending} onClick={() => readOne(notification.id, notification.href)}>
                  {inner}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
