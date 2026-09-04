'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTransition } from 'react'
import {
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardList,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from '@fetrag/ui'
import { logoutAction } from '@/lib/actions/auth'

/** Clés d'icônes sérialisables (le serveur ne peut pas transmettre de composant). */
export type UserMenuIcon =
  | 'user'
  | 'shield'
  | 'graduation'
  | 'bell'
  | 'lock'
  | 'layout'
  | 'building'
  | 'users'
  | 'settings'
  | 'award'
  | 'book'
  | 'calendar'
  | 'clipboard'
  | 'globe'

export type UserMenuGroup = 'personal' | 'roles' | 'cross'

export interface UserMenuLink {
  label: string
  href: string
  icon?: UserMenuIcon
  external?: boolean
  /** Sépare visuellement les liens personnels, les liens de rôle et les liens vers le site institutionnel. */
  group?: UserMenuGroup
}

/** Représentation sérialisable de l'utilisateur connecté pour le menu. */
export interface UserMenuUser {
  id: string
  name: string
  email: string
  initials: string
  image: string | null
  roleLabel: string
  /** Espace d'atterrissage selon le rôle dominant (`defaultDashboard`). */
  homeHref: string
  links: UserMenuLink[]
}

const icons: Record<UserMenuIcon, LucideIcon> = {
  user: User,
  shield: Shield,
  graduation: GraduationCap,
  bell: Bell,
  lock: Lock,
  layout: LayoutDashboard,
  building: Building2,
  users: Users,
  settings: Settings,
  award: Award,
  book: BookOpen,
  calendar: Calendar,
  clipboard: ClipboardList,
  globe: Globe,
}

const groupOrder: UserMenuGroup[] = ['personal', 'roles', 'cross']

interface UserMenuClientProps {
  user: UserMenuUser
  /** Variante compacte (avatar seul) pour les barres étroites. */
  compact?: boolean
  className?: string
}

/** Menu utilisateur du LMS (avatar + liens de rôle + retour au site + déconnexion). */
export function UserMenuClient({ user, compact = false, className }: UserMenuClientProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const groups = groupOrder
    .map((key) => ({ key, links: user.links.filter((link) => (link.group ?? 'personal') === key) }))
    .filter((group) => group.links.length > 0)

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'touch-target flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-navy shadow-soft transition hover:border-blue-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
            compact && 'pr-1',
            className,
          )}
          aria-label={`Menu de ${user.name}`}
        >
          <Avatar size="sm">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="bg-blue-500 text-white">{user.initials}</AvatarFallback>
          </Avatar>
          {!compact ? (
            <>
              <span className="max-w-[9rem] truncate">{user.name}</span>
              <ChevronDown className="size-4 text-neutral-500" aria-hidden="true" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="truncate text-sm font-semibold text-navy">{user.name}</span>
          <span className="truncate text-xs text-neutral-500">{user.email}</span>
          <span className="mt-1.5 inline-flex w-fit rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-green-800">
            {user.roleLabel}
          </span>
        </div>
        {groups.map((group) => (
          <DropdownMenuGroup key={group.key}>
            <DropdownMenuSeparator />
            {group.links.map((link) => {
              const Icon = link.icon ? icons[link.icon] : User
              return (
                <DropdownMenuItem key={link.href} asChild>
                  {link.external ? (
                    <a href={link.href}>
                      <Icon aria-hidden="true" />
                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <Link href={link.href}>
                      <Icon aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
          <span>{pending ? 'Déconnexion en cours' : 'Déconnexion'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
