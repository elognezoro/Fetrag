import 'server-only'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { RequestContext } from '@fetrag/cms'
import { can, isSuperAdmin, type Action, type Principal, type Resource } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { canAccessAdmin, canAny } from './navigation'

export type { ActionState, FormAction } from '@/server/account/types'
export { idleState } from '@/server/account/types'

/** Principal autorisé à ouvrir le back-office (au moins une permission d'administration). */
export async function requireAdmin(returnTo = '/admin'): Promise<Principal> {
  const principal = await guards.requireUser(returnTo)
  if (!canAccessAdmin(principal)) redirect('/acces-refuse')
  return principal
}

/** Principal disposant d'une permission précise (redirige vers /acces-refuse sinon). */
export async function requireAdminCan(action: Action, returnTo?: string, resource: Resource = {}): Promise<Principal> {
  return guards.requireCan(action, resource, returnTo)
}

/** Principal disposant d'au moins une des permissions listées. */
export async function requireAdminAny(actions: Action[], returnTo?: string): Promise<Principal> {
  const principal = await guards.requireUser(returnTo)
  if (!canAny(principal, actions)) redirect('/acces-refuse')
  return principal
}

/** Variante pour les Server Actions et routes : lève au lieu de rediriger. */
export async function requireActionCan(action: Action, resource: Resource = {}): Promise<Principal> {
  return guards.api.requireCan(action, resource)
}

/** Super administrateur uniquement (paramètres, rôles). */
export async function requireSuperAdmin(returnTo?: string): Promise<Principal> {
  const principal = await guards.requireUser(returnTo)
  if (!isSuperAdmin(principal)) redirect('/acces-refuse')
  return principal
}

/** Contexte de requête (IP, agent) transmis aux services pour l'audit. */
export async function adminRequestContext(): Promise<RequestContext> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  return { ip, userAgent: h.get('user-agent')?.slice(0, 300) ?? null, correlationId: h.get('x-correlation-id') }
}

/** Permissions courantes exposées aux pages pour masquer ou afficher les actions. */
export function adminAbilities(principal: Principal) {
  const check = (action: Action) => isSuperAdmin(principal) || can(principal, action)
  return {
    isSuperAdmin: isSuperAdmin(principal),
    readDrafts: check('cms.read_drafts'),
    write: check('cms.write'),
    publish: check('cms.publish'),
    manageMedia: check('cms.manage_media'),
    manageMenus: check('cms.manage_menus'),
    manageServices: check('services.manage'),
    handleRequests: check('services.handle_requests'),
    readForms: check('forms.read'),
    readFinance: check('finance.read'),
    refund: check('finance.refund'),
    exportFinance: check('finance.export'),
    readUsers: check('users.read'),
    manageUsers: check('users.manage'),
    manageRoles: check('roles.manage'),
    readAudit: check('audit.read'),
    manageSettings: check('settings.manage'),
    readReports: check('reports.read'),
  }
}

export type AdminAbilities = ReturnType<typeof adminAbilities>
