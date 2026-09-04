import { hostname } from 'node:os'
import { randomUUID } from 'node:crypto'
import { prisma, Prisma, type BackgroundJob, type JobStatus } from '@fetrag/db'
import { NotFoundError, ValidationError } from '@fetrag/domain'
import { EMAIL_MAX_ATTEMPTS } from '@fetrag/notifications'
import { logger } from '@fetrag/observability'
import { isExhausted, nextRunAt, zombieThreshold } from './backoff'
import { getHandler } from './registry'
import type { EnqueueOptions, EnqueuedJob, JobPayload, ProcessOptions, ProcessResult } from './types'

const DEFAULT_MAX_ATTEMPTS = 5
const MAX_ERROR_LENGTH = 1000

function defaultWorkerId(): string {
  return `${hostname()}-${process.pid}-${randomUUID().slice(0, 8)}`
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

/** Convertit un résultat de handler en valeur JSON stockable. */
function toJsonResult(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined
  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
  } catch {
    return { note: 'résultat non sérialisable' }
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, MAX_ERROR_LENGTH)
  return String(error).slice(0, MAX_ERROR_LENGTH)
}

function toEnqueued(job: Pick<BackgroundJob, 'id' | 'type' | 'status' | 'runAt'>, created: boolean): EnqueuedJob {
  return { id: job.id, type: job.type, status: job.status, runAt: job.runAt, created }
}

/**
 * Met un job en file. Idempotent : si `idempotencyKey` est fourni et qu'un job la porte déjà,
 * ce job est renvoyé sans en créer un second (course concurrente couverte par l'unicité en base).
 */
export async function enqueue(type: string, payload: JobPayload, options: EnqueueOptions = {}): Promise<EnqueuedJob> {
  if (!type || type.length > 80) throw new ValidationError('Type de job invalide', { field: 'type' })
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('La charge utile du job doit être un objet', { field: 'payload' })
  }
  const priority = Math.min(9, Math.max(1, Math.round(options.priority ?? 5)))
  const maxAttempts = Math.min(20, Math.max(1, Math.round(options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS)))
  const idempotencyKey = options.idempotencyKey?.trim() || null
  if (idempotencyKey && idempotencyKey.length > 200) {
    throw new ValidationError('Clé d’idempotence trop longue', { field: 'idempotencyKey' })
  }

  if (idempotencyKey) {
    const existing = await prisma.backgroundJob.findUnique({
      where: { idempotencyKey },
      select: { id: true, type: true, status: true, runAt: true },
    })
    if (existing) return toEnqueued(existing, false)
  }

  try {
    const job = await prisma.backgroundJob.create({
      data: {
        type,
        payload: payload as Prisma.InputJsonObject,
        priority,
        maxAttempts,
        idempotencyKey,
        runAt: options.runAt ?? new Date(),
      },
      select: { id: true, type: true, status: true, runAt: true },
    })
    return toEnqueued(job, true)
  } catch (error) {
    if (idempotencyKey && isUniqueViolation(error)) {
      const existing = await prisma.backgroundJob.findUnique({
        where: { idempotencyKey },
        select: { id: true, type: true, status: true, runAt: true },
      })
      if (existing) return toEnqueued(existing, false)
    }
    throw error
  }
}

/** Tente de verrouiller un job de façon atomique (updateMany conditionnel). */
async function claim(jobId: string, workerId: string, now: Date): Promise<BackgroundJob | null> {
  const result = await prisma.backgroundJob.updateMany({
    where: {
      id: jobId,
      OR: [
        { status: { in: ['QUEUED', 'FAILED'] }, lockedAt: null, runAt: { lte: now } },
        { status: 'RUNNING', lockedAt: { lt: zombieThreshold(now) } },
      ],
    },
    data: { status: 'RUNNING', lockedAt: now, lockedBy: workerId, attempts: { increment: 1 } },
  })
  if (result.count !== 1) return null
  return prisma.backgroundJob.findUnique({ where: { id: jobId } })
}

/** Exécute un job verrouillé et enregistre l'issue (SUCCEEDED / FAILED avec backoff / DEAD). */
async function run(job: BackgroundJob, workerId: string): Promise<boolean> {
  const log = logger.child({ jobId: job.id, jobType: job.type, attempt: job.attempts, workerId })
  const handler = getHandler(job.type)
  const startedAt = Date.now()

  if (!handler) {
    const message = `Aucun handler enregistré pour ${job.type}`
    log.warn('job.no_handler')
    await settleFailure(job, message)
    return false
  }

  try {
    const payload = (job.payload ?? {}) as JobPayload
    const result = await handler(payload, {
      jobId: job.id,
      type: job.type,
      attempt: job.attempts,
      maxAttempts: job.maxAttempts,
      workerId,
      logger: log,
    })
    await prisma.backgroundJob.update({
      where: { id: job.id },
      data: {
        status: 'SUCCEEDED',
        result: toJsonResult(result),
        completedAt: new Date(),
        lockedAt: null,
        lockedBy: null,
        lastError: null,
      },
    })
    log.info('job.succeeded', { durationMs: Date.now() - startedAt })
    return true
  } catch (error) {
    const message = errorMessage(error)
    log.error('job.failed', { error: message, durationMs: Date.now() - startedAt })
    await settleFailure(job, message)
    return false
  }
}

async function settleFailure(job: BackgroundJob, message: string): Promise<void> {
  const now = new Date()
  const dead = isExhausted(job.attempts, job.maxAttempts)
  await prisma.backgroundJob.update({
    where: { id: job.id },
    data: dead
      ? { status: 'DEAD', lastError: message, lockedAt: null, lockedBy: null, completedAt: now }
      : { status: 'FAILED', lastError: message, lockedAt: null, lockedBy: null, runAt: nextRunAt(job.attempts, now) },
  })
}

/**
 * Remet en file les livraisons email en échec (ou jamais tentées) qui n'ont pas de job associé :
 * couvre les processus où `@fetrag/jobs` n'était pas joignable au moment de l'envoi.
 */
export async function requeueFailedEmails(limit = 200): Promise<number> {
  const now = Date.now()
  const deliveries = await prisma.emailDelivery.findMany({
    where: {
      attempts: { lt: EMAIL_MAX_ATTEMPTS },
      createdAt: { gt: new Date(now - 7 * 24 * 3600_000) },
      OR: [{ status: 'FAILED' }, { status: 'QUEUED', createdAt: { lt: new Date(now - 5 * 60_000) } }],
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true },
  })
  let created = 0
  for (const delivery of deliveries) {
    const job = await enqueue('email.send', { deliveryId: delivery.id }, { idempotencyKey: `email.send:${delivery.id}`, priority: 3 })
    if (job.created) created++
  }
  return created
}

/**
 * Traite jusqu'à `limit` jobs éligibles : QUEUED/FAILED dont `runAt` est échu, ou RUNNING verrouillés
 * depuis plus de 10 minutes (zombies). Priorité croissante (1 = urgent), puis `runAt`.
 */
export async function processJobs(options: ProcessOptions = {}): Promise<ProcessResult> {
  const limit = Math.min(100, Math.max(1, Math.round(options.limit ?? 10)))
  const workerId = options.workerId ?? defaultWorkerId()
  const now = new Date()

  if (options.sweepEmails !== false) {
    try {
      await requeueFailedEmails()
    } catch (error) {
      logger.warn('jobs.email_sweep_failed', { error: errorMessage(error) })
    }
  }

  const candidates = await prisma.backgroundJob.findMany({
    where: {
      OR: [
        { status: { in: ['QUEUED', 'FAILED'] }, runAt: { lte: now } },
        { status: 'RUNNING', lockedAt: { lt: zombieThreshold(now) } },
      ],
    },
    orderBy: [{ priority: 'asc' }, { runAt: 'asc' }, { createdAt: 'asc' }],
    take: limit * 2,
    select: { id: true },
  })

  let processed = 0
  let failed = 0
  for (const candidate of candidates) {
    if (processed + failed >= limit) break
    const job = await claim(candidate.id, workerId, new Date())
    if (!job) continue
    const ok = await run(job, workerId)
    if (ok) processed++
    else failed++
  }

  const remaining = await prisma.backgroundJob.count({
    where: { status: { in: ['QUEUED', 'FAILED'] }, runAt: { lte: new Date() } },
  })
  return { processed, failed, remaining }
}

/** Compteurs par statut pour la supervision. */
export async function getJobStats(): Promise<Record<JobStatus, number> & { dueNow: number }> {
  const groups = await prisma.backgroundJob.groupBy({ by: ['status'], _count: { _all: true } })
  const counts: Record<JobStatus, number> = { QUEUED: 0, RUNNING: 0, SUCCEEDED: 0, FAILED: 0, DEAD: 0 }
  for (const g of groups) counts[g.status] = g._count._all
  const dueNow = await prisma.backgroundJob.count({
    where: { status: { in: ['QUEUED', 'FAILED'] }, runAt: { lte: new Date() } },
  })
  return { ...counts, dueNow }
}

export interface JobListQuery {
  status?: JobStatus
  type?: string
  page?: number
  pageSize?: number
}

/** Liste paginée des jobs (administration). */
export async function listJobs(query: JobListQuery = {}) {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20))
  const where: Prisma.BackgroundJobWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.type ? { type: query.type } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.backgroundJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        status: true,
        priority: true,
        attempts: true,
        maxAttempts: true,
        runAt: true,
        lockedAt: true,
        lockedBy: true,
        lastError: true,
        completedAt: true,
        createdAt: true,
      },
    }),
    prisma.backgroundJob.count({ where }),
  ])
  return { items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

/** Relance un job FAILED ou DEAD immédiatement (compteur de tentatives remis à zéro). */
export async function retryJob(jobId: string): Promise<EnqueuedJob> {
  const job = await prisma.backgroundJob.findUnique({ where: { id: jobId } })
  if (!job) throw new NotFoundError('Job', jobId)
  if (job.status !== 'FAILED' && job.status !== 'DEAD') {
    throw new ValidationError('Seuls les jobs FAILED ou DEAD peuvent être relancés', { status: job.status })
  }
  const updated = await prisma.backgroundJob.update({
    where: { id: jobId },
    data: { status: 'QUEUED', attempts: 0, runAt: new Date(), lockedAt: null, lockedBy: null, lastError: null, completedAt: null },
    select: { id: true, type: true, status: true, runAt: true },
  })
  return toEnqueued(updated, false)
}

/** Annule un job non encore exécuté (statut DEAD avec motif explicite). */
export async function cancelJob(jobId: string, reason = 'Annulé manuellement'): Promise<boolean> {
  const result = await prisma.backgroundJob.updateMany({
    where: { id: jobId, status: { in: ['QUEUED', 'FAILED'] } },
    data: { status: 'DEAD', lastError: reason, completedAt: new Date() },
  })
  return result.count > 0
}
