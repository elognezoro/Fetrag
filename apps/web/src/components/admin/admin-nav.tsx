'use client'

import {
  BarChart3,
  BookMarked,
  CalendarDays,
  FileText,
  HandCoins,
  Handshake,
  HelpCircle,
  Image,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  ListTree,
  Mail,
  Newspaper,
  ScrollText,
  Send,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { SidebarNav, type SidebarNavItem } from '@fetrag/ui'
import type { AdminIconKey, AdminNavSection } from '@/server/admin/navigation'

const icons: Record<AdminIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  pages: FileText,
  news: Newspaper,
  tags: Tags,
  library: BookMarked,
  image: Image,
  menu: ListTree,
  help: HelpCircle,
  services: LifeBuoy,
  inbox: Inbox,
  calendar: CalendarDays,
  handshake: Handshake,
  mail: Mail,
  newsletter: Send,
  users: Users,
  finance: HandCoins,
  reports: BarChart3,
  audit: ScrollText,
  settings: Settings,
}

export interface AdminNavProps {
  sections: AdminNavSection[]
  /** Compteurs affichés en badge (clé = href). */
  badges?: Record<string, number>
}

/** Navigation du back-office : sections filtrées côté serveur selon les permissions, icônes instanciées ici. */
export function AdminNav({ sections, badges = {} }: AdminNavProps) {
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => {
        const items: SidebarNavItem[] = section.items.map((item) => ({
          label: item.label,
          href: item.href,
          icon: icons[item.icon],
          exact: item.exact,
          badge: badges[item.href] ? badges[item.href] : undefined,
        }))
        return <SidebarNav key={section.title} title={section.title} items={items} />
      })}
    </div>
  )
}
