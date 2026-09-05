// Authentification : principal injecté par les apps Next (cookie déjà décodé), clé API `X-API-Key`,
// ou cookie de session Auth.js décodé localement (serveur autonome). Gardes requirePrincipal / requireCan.
import type { Context, MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { getEnvSafe } from '@fetrag/config'
import { loadPrincipal, sessionCookieName } from '@fetrag/auth'
import { can, ForbiddenError, isSuperAdmin, UnauthenticatedError, type Action, type Principal, type Resource } from '@fetrag/domain'
import { readSessionToken } from '../auth/session-token'
import type { ApiEnv } from '../env'
import { resolveApiKey } from '../lib/api-keys'

export const API_KEY_HEADER = 'x-api-key'

async function principalFromSessionCookie(headers: Headers): Promise<Principal | null> {
  const secret = getEnvSafe().AUTH_SECRET
  if (!secret) return null
  const cookieName = sessionCookieName()
  const payload = readSessionToken({ headers, cookieName, secret, salt: cookieName })
  if (!payload?.sub) return null
  try {
    return await loadPrincipal(payload.sub, Boolean(payload.mfaVerified))
  } catch {
    return null
  }
}

/**
 * Résolution du principal, dans l'ordre :
 * 1. principal déjà injecté par l'app hôte (`c.set('principal', …)` avant le montage) ;
 * 2. clé API `X-API-Key` (SystemSetting `api.keys`) ;
 * 3. cookie de session Auth.js décodé localement, uniquement si l'hôte n'a rien injecté.
 */
export const authMiddleware = createMiddleware<ApiEnv>(async (c, next) => {
  const injected = c.get('principal') as Principal | null | undefined
  c.set('apiKey', null)

  if (injected) {
    c.set('principal', injected)
    c.set('authMethod', 'session')
    await next()
    return
  }

  const rawKey = c.req.header(API_KEY_HEADER)
  if (rawKey) {
    const resolved = await resolveApiKey(rawKey)
    if (!resolved) throw new UnauthenticatedError('Clé API invalide, révoquée ou expirée')
    c.set('principal', resolved.principal)
    c.set('apiKey', { id: resolved.record.id, name: resolved.record.name, scopes: resolved.record.scopes })
    c.set('authMethod', 'api-key')
    await next()
    return
  }

  let principal: Principal | null = null
  if (injected === undefined) principal = await principalFromSessionCookie(c.req.raw.headers)
  c.set('principal', principal)
  c.set('authMethod', principal ? 'session' : 'none')
  await next()
})

/** Principal courant ou 401. */
export function requirePrincipal(c: Context<ApiEnv>): Principal {
  const principal = c.get('principal')
  if (!principal) throw new UnauthenticatedError()
  return principal
}

/** Principal courant disposant de la permission (action + portée) ou 401 / 403. */
export function requireCan(c: Context<ApiEnv>, action: Action, resource: Resource = {}): Principal {
  const principal = requirePrincipal(c)
  if (!can(principal, action, resource)) throw new ForbiddenError('Permission insuffisante', { action })
  return principal
}

/** Super administrateur global uniquement. */
export function requireSuperAdmin(c: Context<ApiEnv>): Principal {
  const principal = requirePrincipal(c)
  if (!isSuperAdmin(principal)) throw new ForbiddenError('Réservé au super administrateur')
  return principal
}

/** Middleware de route : exige un principal authentifié. */
export const authenticated: MiddlewareHandler<ApiEnv> = createMiddleware<ApiEnv>(async (c, next) => {
  requirePrincipal(c)
  await next()
})

/** Middleware de route : exige une permission globale (la portée fine est vérifiée dans le handler). */
export function authorize(action: Action): MiddlewareHandler<ApiEnv> {
  return createMiddleware<ApiEnv>(async (c, next) => {
    requireCan(c, action)
    await next()
  })
}
