import type { NextRequest } from 'next/server'
import { serviceRequests } from '@fetrag/cms'
import { serviceRequestStatuses } from '@fetrag/contracts'
import { adminRequestContext } from '@/server/admin/context'
import { handleExport, queryParam } from '@/server/admin/export'
import { oneOf } from '@/server/admin/list-params'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Export CSV des demandes de service selon les filtres courants (services.handle_requests ; journalisé). */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  return handleExport('services.handle_requests', 'demandes-de-service', async (principal) => {
    const ctx = await adminRequestContext()
    const responsable = queryParam(url, 'responsable')
    return serviceRequests.exportCsv(
      {
        q: queryParam(url, 'q'),
        status: oneOf(queryParam(url, 'statut'), serviceRequestStatuses),
        serviceId: queryParam(url, 'service'),
        assigneeId: responsable === 'moi' ? principal.id : responsable,
      },
      principal,
      ctx,
    )
  })
}
