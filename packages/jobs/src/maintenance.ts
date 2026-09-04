import { enqueue } from './queue'
import { JobTypes } from './types'

/** Tranche horaire utilisée comme clé d'idempotence (une exécution par tranche). */
function bucket(date: Date, minutes: number): string {
  const ms = minutes * 60 * 1000
  return String(Math.floor(date.getTime() / ms))
}

export interface MaintenanceResult {
  enqueued: string[]
  skipped: string[]
}

/**
 * Met en file les jobs périodiques (appelé par le cron Vercel ou le worker) :
 * publication planifiée toutes les 10 min, balayage des rappels de session et
 * expiration des inscriptions une fois par heure. Idempotent par tranche horaire.
 */
export async function runScheduledMaintenance(now: Date = new Date()): Promise<MaintenanceResult> {
  const plan: Array<{ type: string; payload: Record<string, unknown>; key: string; priority?: number }> = [
    {
      type: JobTypes.contentPublishScheduled,
      payload: {},
      key: `${JobTypes.contentPublishScheduled}:${bucket(now, 10)}`,
      priority: 4,
    },
    {
      type: JobTypes.reminderSession,
      payload: {},
      key: `${JobTypes.reminderSession}:sweep:${bucket(now, 60)}`,
      priority: 4,
    },
    {
      type: JobTypes.enrollmentExpire,
      payload: {},
      key: `${JobTypes.enrollmentExpire}:${bucket(now, 60)}`,
      priority: 7,
    },
  ]

  const enqueued: string[] = []
  const skipped: string[] = []
  for (const item of plan) {
    const job = await enqueue(item.type, item.payload, { idempotencyKey: item.key, priority: item.priority })
    ;(job.created ? enqueued : skipped).push(item.type)
  }
  return { enqueued, skipped }
}
