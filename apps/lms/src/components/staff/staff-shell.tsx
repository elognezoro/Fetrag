'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Settings,
  Shield,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { AppShell, AppShellSidebar, AppShellTopbar, Emblem, MottoStrip, Ribbon, SidebarNav, cn, type SidebarNavItem, type Tone } from '@fetrag/ui'

/** Clés d'icônes sérialisables : un layout serveur ne peut pas transmettre de composant. */
export type StaffIconKey =
  | 'dashboard'
  | 'requests'
  | 'wizard'
  | 'cohorts'
  | 'sessions'
  | 'certificates'
  | 'organizations'
  | 'reports'
  | 'participants'
  | 'courses'
  | 'questions'
  | 'users'
  | 'settings'
  | 'audit'
  | 'trainer'
  | 'admin'

const icons: Record<StaffIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  requests: ClipboardList,
  wizard: ListChecks,
  cohorts: UsersRound,
  sessions: CalendarDays,
  certificates: Award,
  organizations: Building2,
  reports: BarChart3,
  participants: Users,
  courses: BookOpen,
  questions: HelpCircle,
  users: Users,
  settings: Settings,
  audit: ScrollText,
  trainer: GraduationCap,
  admin: Shield,
}

export interface StaffNavItem {
  label: string
  href: string
  icon: StaffIconKey
  badge?: string | number
  exact?: boolean
}

export interface StaffSpaceLink {
  label: string
  href: string
  icon: StaffIconKey
}

export interface StaffShellProps {
  /** Nom de l'espace (« Coordination », « Formateur »...). */
  space: string
  /** Sous-titre affiché dans la barre latérale (organisation active, rôle). */
  subtitle?: string
  tone?: Tone
  items: StaffNavItem[]
  /** Groupe secondaire (liens transverses). */
  secondaryItems?: StaffNavItem[]
  secondaryTitle?: string
  /** Autres espaces accessibles à l'utilisateur (commutateur dans la barre supérieure). */
  spaces?: StaffSpaceLink[]
  children: ReactNode
}

/**
 * Coquille des espaces institutionnels du LMS : barre latérale repliable (AppShell),
 * navigation contextuelle et commutateur d'espaces. Elle s'insère sous la barre
 * globale de la plateforme (`--header-height`) et ne redéclare pas de `main`.
 */
export function StaffShell({ space, subtitle, tone = 'blue', items, secondaryItems, secondaryTitle, spaces = [], children }: StaffShellProps) {
  const pathname = usePathname() ?? ''
  const navItems: SidebarNavItem[] = items.map((item) => ({ label: item.label, href: item.href, icon: icons[item.icon], badge: item.badge, exact: item.exact }))
  const secondary: SidebarNavItem[] = (secondaryItems ?? []).map((item) => ({ label: item.label, href: item.href, icon: icons[item.icon], badge: item.badge, exact: item.exact }))

  return (
    <AppShell className="min-h-[calc(100dvh-var(--header-height))] bg-neutral-50">
      <AppShellSidebar
        className="lg:top-[var(--header-height)]"
        label={`Navigation de l'espace ${space}`}
        brand={
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-soft ring-4 ring-green-50">
              <Emblem size={30} decorative />
            </span>
            <div className="min-w-0">
              <Ribbon tone={tone} size="sm">
                {space}
              </Ribbon>
              {subtitle ? <p className="mt-1 truncate text-xs text-neutral-500">{subtitle}</p> : null}
            </div>
          </div>
        }
        footer={
          <div className="flex flex-col gap-3">
            <MottoStrip variant="inline" size="sm" />
            <Link href="/dashboard" className="text-xs font-semibold text-blue-700 hover:underline">
              Mon espace apprenant
            </Link>
          </div>
        }
      >
        <SidebarNav title={space} items={navItems} />
        {secondary.length ? <SidebarNav title={secondaryTitle ?? 'Autres espaces'} items={secondary} className="mt-6" /> : null}
      </AppShellSidebar>

      <AppShellTopbar
        className="top-[var(--header-height)] bg-white/90"
        title={space}
        actions={
          spaces.length ? (
            <nav aria-label="Changer d'espace" className="hidden items-center gap-1 md:flex">
              {spaces.map((link) => {
                const Icon = icons[link.icon]
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors',
                      active ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-100 hover:text-navy',
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          ) : null
        }
      />

      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
    </AppShell>
  )
}
