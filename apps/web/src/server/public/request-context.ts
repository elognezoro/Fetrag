import 'server-only'
import { headers } from 'next/headers'
import { hashIp } from '@fetrag/domain'

export interface PublicRequestContext {
  ip: string | null
  ipHash: string | null
  userAgent: string | null
}

/** Contexte réseau de la requête (IP brute pour le hachage côté domaine, agent utilisateur tronqué). */
export async function requestContext(): Promise<PublicRequestContext> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  const userAgent = h.get('user-agent')?.slice(0, 300) ?? null
  return { ip, ipHash: hashIp(ip), userAgent }
}
