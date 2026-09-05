import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { guards } from '@/lib/auth'
import { publicEnv } from '@/lib/env'
import { AccountNav, AccountNavFooter } from '@/components/account/account-nav'
import { DashboardShell } from '@/components/account/dashboard-shell'
import { loadAccountBadges } from '@/server/account/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Espace personnel', template: '%s | Espace personnel FETRAG' },
  robots: { index: false, follow: false },
}

/** Coquille de l'espace personnel : navigation latérale, badges de notifications et de paiements en attente. */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const principal = await guards.requireUser('/espace')
  const badges = await loadAccountBadges(principal).catch(() => ({ unread: 0, pendingOrders: 0 }))
  const displayName = principal.name?.trim() || principal.email

  return (
    <DashboardShell
      eyebrow="Espace personnel"
      brandTitle={displayName}
      brandDescription={principal.email}
      nav={<AccountNav unread={badges.unread} pendingOrders={badges.pendingOrders} lmsUrl={publicEnv.lmsUrl} />}
      footer={<AccountNavFooter lmsUrl={publicEnv.lmsUrl} />}
    >
      {children}
    </DashboardShell>
  )
}
