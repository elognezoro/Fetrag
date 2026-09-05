import type { NextRequest } from 'next/server'
import { exportAuditCsv } from '@/server/admin/audit-queries'
import { adminRequestContext } from '@/server/admin/context'
import { handleExport } from '@/server/admin/export'
import { readListParams } from '@/server/admin/list-params'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Export CSV du journal d'audit selon les filtres courants (`audit.read` ; l'export est lui-même journalisé). */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const params = readListParams(Object.fromEntries(url.searchParams.entries()), ['action', 'entite', 'acteur', 'du', 'au'])
  return handleExport('audit.read', 'journal-audit', async (principal) => {
    const ctx = await adminRequestContext()
    return exportAuditCsv(principal, params, ctx)
  })
}
