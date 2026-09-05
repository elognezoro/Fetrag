import 'server-only'
import { cookies } from 'next/headers'
import type { Principal } from '@fetrag/domain'
import { resolveOrganization, type OrganizationSummary } from './organizations'

/** Cookie mémorisant l'organisation active du responsable (sélecteur multi-organisations). */
export const ORGANIZATION_COOKIE = 'fetrag-lms-organisation'

/** Lit l'organisation mémorisée (sans garantie d'accès : `resolveOrganization` filtre). */
export async function readOrganizationCookie(): Promise<string | null> {
  try {
    const store = await cookies()
    return store.get(ORGANIZATION_COOKIE)?.value ?? null
  } catch {
    return null
  }
}

/**
 * Organisation active du principal : paramètre explicite, sinon cookie, sinon première visible.
 * Renvoie aussi la liste pour le sélecteur.
 */
export async function currentOrganization(principal: Principal, requestedId?: string | null): Promise<{ organizations: OrganizationSummary[]; current: OrganizationSummary | null }> {
  const remembered = requestedId ?? (await readOrganizationCookie())
  return resolveOrganization(principal, remembered)
}
