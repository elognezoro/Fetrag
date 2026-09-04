import { prisma } from '@fetrag/db'
import { audit, emit } from '@fetrag/domain'
import { parseContentPublishScheduled } from '../payloads'
import type { JobHandler } from '../types'

/**
 * Publie les contenus SCHEDULED dont l'échéance est atteinte (mise à jour Prisma directe, sans `@fetrag/cms`).
 * - Page / Article : `scheduledAt <= now` (ou absent).
 * - Event / Course : `publishedAt <= now` (la date planifiée est portée par `publishedAt`) ou absent.
 * - Service / Resource : aucun champ de date, publiés au prochain passage.
 */
export const contentPublishScheduledHandler: JobHandler = async (payload, ctx) => {
  const { now: nowIso } = parseContentPublishScheduled(payload)
  const now = nowIso ? new Date(nowIso) : new Date()
  const published: Record<string, string[]> = {}

  const pages = await prisma.page.findMany({
    where: { status: 'SCHEDULED', OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
    select: { id: true },
  })
  if (pages.length > 0) {
    await prisma.page.updateMany({ where: { id: { in: pages.map((p) => p.id) } }, data: { status: 'PUBLISHED', publishedAt: now } })
    published.Page = pages.map((p) => p.id)
  }

  const articles = await prisma.article.findMany({
    where: { status: 'SCHEDULED', OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
    select: { id: true },
  })
  if (articles.length > 0) {
    await prisma.article.updateMany({ where: { id: { in: articles.map((a) => a.id) } }, data: { status: 'PUBLISHED', publishedAt: now } })
    published.Article = articles.map((a) => a.id)
  }

  const services = await prisma.service.findMany({ where: { status: 'SCHEDULED' }, select: { id: true } })
  if (services.length > 0) {
    await prisma.service.updateMany({ where: { id: { in: services.map((s) => s.id) } }, data: { status: 'PUBLISHED' } })
    published.Service = services.map((s) => s.id)
  }

  const resources = await prisma.resource.findMany({ where: { status: 'SCHEDULED' }, select: { id: true } })
  if (resources.length > 0) {
    await prisma.resource.updateMany({ where: { id: { in: resources.map((r) => r.id) } }, data: { status: 'PUBLISHED' } })
    published.Resource = resources.map((r) => r.id)
  }

  const events = await prisma.event.findMany({
    where: { status: 'SCHEDULED', OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
    select: { id: true, publishedAt: true },
  })
  if (events.length > 0) {
    await prisma.event.updateMany({ where: { id: { in: events.map((e) => e.id) }, publishedAt: null }, data: { publishedAt: now } })
    await prisma.event.updateMany({ where: { id: { in: events.map((e) => e.id) } }, data: { status: 'PUBLISHED' } })
    published.Event = events.map((e) => e.id)
  }

  const courses = await prisma.course.findMany({
    where: { status: 'SCHEDULED', OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
    select: { id: true },
  })
  if (courses.length > 0) {
    await prisma.course.updateMany({ where: { id: { in: courses.map((c) => c.id) }, publishedAt: null }, data: { publishedAt: now } })
    await prisma.course.updateMany({ where: { id: { in: courses.map((c) => c.id) } }, data: { status: 'PUBLISHED' } })
    published.Course = courses.map((c) => c.id)
  }

  let total = 0
  for (const [entityType, ids] of Object.entries(published)) {
    total += ids.length
    for (const id of ids) {
      await audit('content.published', { type: entityType, id }, { correlationId: ctx.jobId }, { after: { status: 'PUBLISHED', scheduled: true } })
      await emit('content.published', { entityType, id, scheduled: true }, { correlationId: ctx.jobId })
    }
  }
  ctx.logger.info('content.publish-scheduled.done', { total })
  return { total, published }
}
