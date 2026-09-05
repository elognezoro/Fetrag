import 'server-only'
import { headers } from 'next/headers'
import type { RequestMeta } from '@fetrag/lms-core'

/** Métadonnées de requête (IP, agent) transmises à l'audit des services lms-core. */
export async function requestMeta(): Promise<RequestMeta> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  return { ip, userAgent: h.get('user-agent'), correlationId: h.get('x-correlation-id') }
}
