import type { NextRequest } from 'next/server'
import { adminRequestContext } from '@/server/admin/context'
import { handleExport, queryParam } from '@/server/admin/export'
import { exportOrdersCsv, exportPaymentsCsv, type ExportRange } from '@/server/admin/finance-queries'
import { toDate } from '@/server/admin/list-params'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Export CSV des commandes (`type=commandes`, défaut) ou des paiements (`type=paiements`) sur une période
 * (`du`, `au` au format AAAA-MM-JJ). Permission `finance.export` ; chaque export est journalisé (`export.generated`).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const kind = queryParam(url, 'type') === 'paiements' ? 'paiements' : 'commandes'
  const range: ExportRange = { from: toDate(queryParam(url, 'du')), to: toDate(queryParam(url, 'au'), true) }
  return handleExport('finance.export', kind, async (principal) => {
    const ctx = await adminRequestContext()
    return kind === 'paiements' ? exportPaymentsCsv(principal, range, ctx) : exportOrdersCsv(principal, range, ctx)
  })
}
