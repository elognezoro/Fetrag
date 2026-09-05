import type { NextRequest } from 'next/server'
import { newsletter } from '@fetrag/cms'
import { adminRequestContext } from '@/server/admin/context'
import { handleExport, queryParam } from '@/server/admin/export'
import { oneOf } from '@/server/admin/list-params'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Export CSV des abonnés et de leurs consentements horodatés (forms.read ; journalisé). */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  return handleExport('forms.read', 'newsletter', async (principal) => {
    const ctx = await adminRequestContext()
    return newsletter.exportCsv(principal, { q: queryParam(url, 'q'), state: oneOf(queryParam(url, 'statut'), ['pending', 'confirmed', 'unsubscribed'] as const) }, ctx)
  })
}
