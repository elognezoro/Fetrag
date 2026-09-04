import { prisma } from '@fetrag/db'
import { getEnv } from '@fetrag/config'
import { processJobs, registerDefaultHandlers, runScheduledMaintenance } from '@fetrag/jobs'
import { logger } from '@fetrag/observability'
import { reconcile, registerPaymentJobHandlers } from '@fetrag/payments'

/**
 * Worker de jobs asynchrones (ADR-001). Boucle de traitement de la file
 * persistée en PostgreSQL. Sur Vercel, remplacé par le cron /api/cron/jobs.
 */
const env = getEnv()
const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 5000)
const batchSize = Number(process.env.WORKER_BATCH_SIZE ?? 10)
const workerId = `worker-${process.pid}-${Math.random().toString(36).slice(2, 8)}`
let running = true

registerDefaultHandlers()
registerPaymentJobHandlers()
logger.info('Worker FETRAG démarré', { workerId, env: env.NODE_ENV, intervalMs, batchSize })

const MAINTENANCE_EVERY_MS = 5 * 60 * 1000
let lastMaintenanceAt = 0

async function tick(): Promise<void> {
  try {
    if (Date.now() - lastMaintenanceAt > MAINTENANCE_EVERY_MS) {
      lastMaintenanceAt = Date.now()
      await runScheduledMaintenance()
      await reconcile()
    }
    const result = await processJobs({ limit: batchSize, workerId })
    if (result.processed > 0 || result.failed > 0) {
      logger.info('Lot de jobs traité', { ...result, workerId })
    }
  } catch (error) {
    logger.error('Échec du cycle worker', { error: error instanceof Error ? error.message : String(error) })
  }
}

async function loop(): Promise<void> {
  while (running) {
    await tick()
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

async function shutdown(signal: string): Promise<void> {
  logger.info('Arrêt du worker', { signal })
  running = false
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

void loop()
