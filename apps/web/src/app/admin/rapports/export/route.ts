import type { NextRequest } from 'next/server'
import { adminRequestContext } from '@/server/admin/context'
import { handleExport, queryParam } from '@/server/admin/export'
import { oneOf } from '@/server/admin/list-params'
import { exportContentReportCsv, exportLmsReportCsv, exportWebReportCsv, reportExportKinds } from '@/server/admin/reports-queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Export CSV d'un rapport (`type=web|lms|contenus`, défaut `web`). Permission `reports.read` ; journalisé (`export.generated`). */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const kind = oneOf(queryParam(url, 'type'), reportExportKinds) ?? 'web'
  return handleExport('reports.read', `rapport-${kind}`, async (principal) => {
    const ctx = await adminRequestContext()
    if (kind === 'lms') return exportLmsReportCsv(principal, ctx)
    if (kind === 'contenus') return exportContentReportCsv(principal, ctx)
    return exportWebReportCsv(principal, ctx)
  })
}
