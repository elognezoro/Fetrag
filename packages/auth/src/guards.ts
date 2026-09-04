import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import {
  can,
  ForbiddenError,
  hasGlobalRole,
  requiresMfa,
  UnauthenticatedError,
  type Action,
  type Principal,
  type Resource,
} from '@fetrag/domain'
import type { RoleName } from '@fetrag/contracts'
import { loadPrincipal } from './principal'

export type SessionGetter = () => Promise<Session | null>

export interface Guards {
  /** Principal courant ou null (sans redirection). */
  getPrincipal(): Promise<Principal | null>
  /** Principal courant ; redirige vers /connexion si absent. */
  requireUser(returnTo?: string): Promise<Principal>
  /** Exige un rôle global parmi la liste (SUPER_ADMIN implicite). */
  requireRole(roles: RoleName[], returnTo?: string): Promise<Principal>
  /** Exige une permission (action + portée). */
  requireCan(action: Action, resource?: Resource, returnTo?: string): Promise<Principal>
  /** Variante API : lève des DomainError au lieu de rediriger. */
  api: {
    requireUser(): Promise<Principal>
    requireCan(action: Action, resource?: Resource): Promise<Principal>
  }
}

/**
 * Fabrique les gardes serveur d'une application à partir de sa fonction `auth()` Auth.js.
 * Chaque garde vérifie identité + rôle + portée côté serveur (chapitre 15 du CDC).
 */
export function createGuards(getSession: SessionGetter, options: { loginPath?: string; mfaPath?: string } = {}): Guards {
  const loginPath = options.loginPath ?? '/connexion'
  const mfaPath = options.mfaPath ?? '/connexion/mfa'

  async function getPrincipal(): Promise<Principal | null> {
    const session = await getSession()
    const id = session?.user?.id
    if (!id) return null
    return loadPrincipal(id, Boolean(session?.user?.mfaVerified))
  }

  function loginRedirect(returnTo?: string): never {
    const target = returnTo ? `${loginPath}?callbackUrl=${encodeURIComponent(returnTo)}` : loginPath
    redirect(target)
  }

  async function requireUser(returnTo?: string): Promise<Principal> {
    const p = await getPrincipal()
    if (!p) loginRedirect(returnTo)
    return p
  }

  function enforceMfa(p: Principal, returnTo?: string): void {
    // MFA exigée pour les rôles privilégiés uniquement quand l'utilisateur l'a activée
    // (en mode local, l'activation est proposée au premier accès admin ; avec un IdP, elle est déléguée).
    if (requiresMfa(p) && p.mfaVerified === false && process.env.AUTH_ENFORCE_MFA === 'true') {
      redirect(returnTo ? `${mfaPath}?callbackUrl=${encodeURIComponent(returnTo)}` : mfaPath)
    }
  }

  async function requireRole(roles: RoleName[], returnTo?: string): Promise<Principal> {
    const p = await requireUser(returnTo)
    if (!hasGlobalRole(p, ...roles)) redirect('/acces-refuse')
    enforceMfa(p, returnTo)
    return p
  }

  async function requireCan(action: Action, resource: Resource = {}, returnTo?: string): Promise<Principal> {
    const p = await requireUser(returnTo)
    if (!can(p, action, resource)) redirect('/acces-refuse')
    enforceMfa(p, returnTo)
    return p
  }

  return {
    getPrincipal,
    requireUser,
    requireRole,
    requireCan,
    api: {
      async requireUser() {
        const p = await getPrincipal()
        if (!p) throw new UnauthenticatedError()
        return p
      },
      async requireCan(action, resource = {}) {
        const p = await getPrincipal()
        if (!p) throw new UnauthenticatedError()
        if (!can(p, action, resource)) throw new ForbiddenError('Permission insuffisante', { action })
        return p
      },
    },
  }
}
