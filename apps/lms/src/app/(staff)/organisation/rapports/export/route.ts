import { isDomainError } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { requestMeta } from '@/server/staff/context'
import { cohortReportCsv, cohortReportPdf, csvResponse, organizationReportCsv, organizationReportPdf } from '@/server/staff/exports'
import { currentOrganization } from '@/server/staff/org-context'

export const dynamic = 'force-dynamic'

/**
 * Exports des rapports de l'organisation : `?kind=organisation|cohorte&format=csv|pdf&cohort=<id>`.
 * Le rapport de cohorte est refusé si la cohorte n'appartient pas à l'organisation active.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const principal = await guards.api.requireUser()
    const url = new URL(request.url)
    const kind = url.searchParams.get('kind') ?? 'organisation'
    const format = url.searchParams.get('format') === 'pdf' ? 'pdf' : 'csv'
    const meta = await requestMeta()
    const { current } = await currentOrganization(principal, url.searchParams.get('org'))
    if (!current) return new Response('Aucune organisation accessible', { status: 403 })

    if (kind === 'cohorte') {
      const cohortId = url.searchParams.get('cohort')
      if (!cohortId) return new Response('Cohorte manquante', { status: 400 })
      const { prisma } = await import('@fetrag/db')
      const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, select: { organizationId: true } })
      if (!cohort || cohort.organizationId !== current.id) return new Response('Cohorte introuvable pour cette organisation', { status: 404 })
      return csvResponse(format === 'pdf' ? await cohortReportPdf(principal, cohortId, meta) : await cohortReportCsv(principal, cohortId, meta))
    }
    return csvResponse(format === 'pdf' ? await organizationReportPdf(principal, current.id, meta) : await organizationReportCsv(principal, current.id, meta))
  } catch (error) {
    if (isDomainError(error)) return new Response(error.message, { status: error.status })
    console.error('[lms-staff] export rapport organisation', error)
    return new Response('Export impossible', { status: 500 })
  }
}
