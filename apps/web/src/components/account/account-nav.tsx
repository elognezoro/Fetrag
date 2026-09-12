'use client'

import { ArrowUpRight, Bell, BookOpen, BookOpenCheck, CreditCard, GraduationCap, Inbox, LayoutDashboard, ShieldCheck, User } from 'lucide-react'
import { SidebarNav, type SidebarNavItem } from '@fetrag/ui'

export interface AccountNavProps {
  unread: number
  pendingOrders: number
  lmsUrl: string
}

/** Navigation de l'espace personnel (icônes lucide instanciées côté client). */
export function AccountNav({ unread, pendingOrders, lmsUrl }: AccountNavProps) {
  const items: SidebarNavItem[] = [
    { label: 'Tableau de bord', href: '/espace', icon: LayoutDashboard, exact: true },
    { label: 'Profil', href: '/espace/profil', icon: User },
    { label: 'Mes demandes', href: '/espace/demandes', icon: Inbox },
    { label: 'Mes inscriptions', href: '/espace/inscriptions', icon: BookOpen },
    { label: 'Paiements et reçus', href: '/espace/paiements', icon: CreditCard, badge: pendingOrders > 0 ? pendingOrders : undefined },
    { label: 'Notifications', href: '/espace/notifications', icon: Bell, badge: unread > 0 ? unread : undefined },
    { label: 'Sécurité', href: '/espace/securite', icon: ShieldCheck },
    { label: 'Guide d’utilisation', href: '/espace/guide', icon: BookOpenCheck },
  ]
  return (
    <div className="flex flex-col gap-6">
      <SidebarNav title="Mon compte" items={items} />
      <SidebarNav title="Formation" items={[{ label: 'Plateforme de formation', href: `${lmsUrl}/dashboard`, icon: GraduationCap, external: true }]} />
    </div>
  )
}

/** Pied de barre latérale : rappel de la devise et lien vers la plateforme de formation. */
export function AccountNavFooter({ lmsUrl }: { lmsUrl: string }) {
  return (
    <div className="flex flex-col gap-3">
      <a
        href={`${lmsUrl}/dashboard`}
        className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40"
      >
        <span className="inline-flex items-center gap-2">
          <GraduationCap className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Reprendre ma formation
        </span>
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
      <p className="eyebrow text-center text-[10px] text-neutral-400">Travail · Efficacité · Solidarité</p>
    </div>
  )
}
