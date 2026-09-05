import { isDomainError } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { requestMeta } from '@/server/staff/context'
import { csvResponse, organizationParticipantsCsv } from '@/server/staff/exports'
import { currentOrganization } from '@/server/staff/org-context'

export const dynamic = 'force-dynamic'

/** Export CSV des participants de l'organisation active (filtrage strict par organisation). */
export async function GET(request: Request): Promise<Response> {
  try {
    const principal = await guards.api.requireUser()
    const url = new URL(request.url)
    const { current } = await currentOrganization(principal, url.searchParams.get('org'))
    if (!current) return new Response('Aucune organisation accessible', { status: 403 })
    return csvResponse(await organizationParticipantsCsv(principal, current.id, await requestMeta()))
  } catch (error) {
    if (isDomainError(error)) return new Response(error.message, { status: error.status })
    console.error('[lms-staff] export participants', error)
    return new Response('Export impossible', { status: 500 })
  }
}
