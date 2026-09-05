import type { NextRequest } from 'next/server'
import { forms, formSubmissionStatuses } from '@fetrag/cms'
import { formKinds } from '@fetrag/contracts'
import { adminRequestContext } from '@/server/admin/context'
import { handleExport, queryParam } from '@/server/admin/export'
import { oneOf } from '@/server/admin/list-params'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Export CSV des messages reçus selon les filtres courants (forms.read ; journalisé). */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  return handleExport('forms.read', 'messages-recus', async (principal) => {
    const ctx = await adminRequestContext()
    return forms.exportCsv(
      {
        q: queryParam(url, 'q'),
        status: oneOf(queryParam(url, 'statut'), formSubmissionStatuses),
        kind: oneOf(queryParam(url, 'type'), formKinds),
        assignedTo: queryParam(url, 'responsable'),
      },
      principal,
      ctx,
    )
  })
}
