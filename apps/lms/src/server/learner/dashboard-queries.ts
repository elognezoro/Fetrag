import 'server-only'
import type { Principal } from '@fetrag/domain'
import { dashboards } from '@fetrag/lms-core'
import { getRecentNotifications } from './queries'

export type LearnerDashboard = Awaited<ReturnType<typeof dashboards.learner>>
export type DashboardNotification = Awaited<ReturnType<typeof getRecentNotifications>>[number]

export interface DashboardView {
  dashboard: LearnerDashboard
  notifications: DashboardNotification[]
  /** Prénom ou nom affichable pour la salutation. */
  greetingName: string
}

export async function getDashboard(principal: Principal): Promise<DashboardView> {
  const [dashboard, notifications] = await Promise.all([dashboards.learner(principal), getRecentNotifications(principal.id, 6)])
  const user = dashboard.user
  const greetingName = user?.firstName?.trim() || user?.displayName?.split(/\s+/)[0] || principal.name?.split(/\s+/)[0] || principal.email
  return { dashboard, notifications, greetingName }
}
