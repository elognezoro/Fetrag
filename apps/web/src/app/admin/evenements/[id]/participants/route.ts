import { NextResponse, type NextRequest } from 'next/server'
import { events } from '@fetrag/cms'
import { idSchema } from '@fetrag/contracts'
import { isDomainError } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { adminRequestContext } from '@/server/admin/context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Export CSV des participants d'un événement (cms.write ou reports.read ; journalisé). */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await context.params
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Événement inconnu.' } }, { status: 404 })
  try {
    const principal = await guards.api.requireUser()
    const ctx = await adminRequestContext()
    const result = await events.attendees(parsed.data, principal, ctx)
    return new NextResponse(result.csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    if (isDomainError(error)) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
    console.error('[admin] export participants impossible', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'L’export a échoué.' } }, { status: 500 })
  }
}
