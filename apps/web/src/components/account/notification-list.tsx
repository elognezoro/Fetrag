'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import { formatRelative } from '@fetrag/domain'
import { Badge, Button, EmptyState, cn, toast } from '@fetrag/ui'
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/server/account/notifications'

export interface NotificationItem {
  id: string
  category: string
  title: string
  body: string
  href: string | null
  readAt: string | null
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  general: 'Général',
  account: 'Compte',
  training: 'Formation',
  sessions: 'Séances',
  assignments: 'Devoirs',
  results: 'Résultats',
  certificates: 'Certificats',
  payments: 'Paiements',
  requests: 'Demandes',
  forum: 'Forum',
  security: 'Sécurité',
  marketing: 'Informations',
}

interface NotificationListProps {
  items: NotificationItem[]
  unread: number
  nextCursor: string | null
  unreadOnly: boolean
}

/** Liste des notifications internes avec marquage individuel ou global comme lu. */
export function NotificationList({ items, unread, nextCursor, unreadOnly }: NotificationListProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function markOne(id: string) {
    startTransition(async () => {
      const result = await markNotificationReadAction(id)
      if (result.status === 'error') toast.error(result.message ?? 'Action impossible')
      router.refresh()
    })
  }

  function markAll() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction()
      if (result.status === 'error') toast.error(result.message ?? 'Action impossible')
      else toast.success(result.message ?? 'Notifications marquées comme lues')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="Filtrer les notifications">
          <Button asChild variant={unreadOnly ? 'ghost' : 'secondary'} size="sm">
            <Link href="/espace/notifications">Toutes</Link>
          </Button>
          <Button asChild variant={unreadOnly ? 'secondary' : 'ghost'} size="sm">
            <Link href="/espace/notifications?non-lues=1">Non lues {unread > 0 ? `(${unread})` : ''}</Link>
          </Button>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={markAll} disabled={pending || unread === 0} leftIcon={<CheckCheck aria-hidden="true" />}>
          Tout marquer comme lu
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title={unreadOnly ? 'Aucune notification non lue' : 'Aucune notification'} description="Les convocations, résultats, certificats et réponses à vos demandes apparaîtront ici." />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const isUnread = !item.readAt
            return (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-2 rounded-2xl border bg-white p-4 shadow-soft transition sm:flex-row sm:items-start sm:gap-4',
                  isUnread ? 'border-blue-200 pillar-top-blue' : 'border-neutral-200',
                )}
              >
                <span aria-hidden="true" className={cn('mt-1 hidden size-2.5 shrink-0 rounded-full sm:block', isUnread ? 'bg-green-500' : 'bg-neutral-200')} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn('font-semibold', isUnread ? 'text-navy' : 'text-neutral-700')}>{item.title}</p>
                    <Badge variant="outline" size="sm">
                      {categoryLabels[item.category] ?? item.category}
                    </Badge>
                    {isUnread ? <span className="sr-only">Non lue</span> : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.body}</p>
                  <p className="mt-1 text-xs text-neutral-400">{formatRelative(item.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {item.href ? (
                    <Button asChild variant="link" size="sm">
                      {/^https?:\/\//.test(item.href) ? (
                        <a href={item.href}>
                          Ouvrir
                          <ExternalLink aria-hidden="true" />
                        </a>
                      ) : (
                        <Link href={item.href} onClick={() => (isUnread ? markOne(item.id) : undefined)}>
                          Ouvrir
                        </Link>
                      )}
                    </Button>
                  ) : null}
                  {isUnread ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => markOne(item.id)} disabled={pending} leftIcon={<Check aria-hidden="true" />}>
                      Lu
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {nextCursor ? (
        <div className="flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href={`/espace/notifications?curseur=${nextCursor}${unreadOnly ? '&non-lues=1' : ''}`}>Notifications plus anciennes</Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
