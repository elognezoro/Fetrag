import { NextResponse } from 'next/server'
import { isDomainError } from '@fetrag/domain'
import { progress } from '@fetrag/lms-core'
import { z } from 'zod'
import { guards } from '@/lib/auth'
import { progressInputSchema } from '@/server/learner/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const beaconSchema = z.object({ reports: z.array(progressInputSchema).min(1).max(20) })

/**
 * Point de remontée « à la sortie » (`navigator.sendBeacon`) du lecteur pédagogique :
 * reçoit un lot de rapports de progression (temps passé) et les applique de façon idempotente.
 * Répond toujours rapidement ; les erreurs métier sont journalisées, jamais renvoyées au navigateur.
 */
export async function POST(request: Request): Promise<Response> {
  let principal
  try {
    principal = await guards.api.requireUser()
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const parsed = beaconSchema.safeParse(payload)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })

  let applied = 0
  for (const report of parsed.data.reports) {
    try {
      await progress.report(principal, report.enrollmentId, {
        activityId: report.activityId,
        timeSpentSeconds: report.timeSpentSeconds,
        completed: report.completed,
        progressData: report.progressData,
      })
      applied++
    } catch (error) {
      if (!isDomainError(error)) console.error('[beacon] progression non appliquée', error instanceof Error ? error.message : error)
    }
  }
  return NextResponse.json({ ok: true, applied }, { headers: { 'Cache-Control': 'no-store' } })
}
