import { isDomainError } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { requestMeta } from '@/server/staff/context'
import { cohortReportCsv, cohortReportPdf, courseReportCsv, courseReportPdf, csvResponse, financeReportCsv, organizationReportCsv, organizationReportPdf } from '@/server/staff/exports'

export const dynamic = 'force-dynamic'

/**
 * Exports de la coordination : `?kind=cours|organisation|cohorte|finances&format=csv|pdf&course=|org=|cohort=|from=|to=`.
 * Les permissions sont vérifiées par les services de rapport (coordination, finance, formateur de la cohorte).
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const principal = await guards.api.requireUser()
    const url = new URL(request.url)
    const kind = url.searchParams.get('kind') ?? 'cours'
    const pdf = url.searchParams.get('format') === 'pdf'
    const meta = await requestMeta()

    if (kind === 'cohorte') {
      const cohortId = url.searchParams.get('cohort')
      if (!cohortId) return new Response('Cohorte manquante', { status: 400 })
      return csvResponse(pdf ? await cohortReportPdf(principal, cohortId, meta) : await cohortReportCsv(principal, cohortId, meta))
    }
    if (kind === 'organisation') {
      const organizationId = url.searchParams.get('org')
      if (!organizationId) return new Response('Organisation manquante', { status: 400 })
      return csvResponse(pdf ? await organizationReportPdf(principal, organizationId, meta) : await organizationReportCsv(principal, organizationId, meta))
    }
    if (kind === 'finances') {
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')
      const range = { from: from ? new Date(from) : undefined, to: to ? new Date(`${to}T23:59:59`) : undefined }
      return csvResponse(await financeReportCsv(principal, { from: range.from && !Number.isNaN(range.from.getTime()) ? range.from : undefined, to: range.to && !Number.isNaN(range.to.getTime()) ? range.to : undefined }, meta))
    }
    const courseId = url.searchParams.get('course')
    if (!courseId) return new Response('Cours manquant', { status: 400 })
    return csvResponse(pdf ? await courseReportPdf(principal, courseId, meta) : await courseReportCsv(principal, courseId, meta))
  } catch (error) {
    if (isDomainError(error)) return new Response(error.message, { status: error.status })
    console.error('[lms-staff] export rapport coordination', error)
    return new Response('Export impossible', { status: 500 })
  }
}
