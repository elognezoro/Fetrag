import { prisma } from '@fetrag/db'
import { resolvePublicUrl } from '@fetrag/config'
import { formatDateTime, NotFoundError } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { parseReminderSession } from '../payloads'
import { enqueue } from '../queue'
import { JobTypes, type JobHandler } from '../types'

const modeLabels: Record<string, string> = { IN_PERSON: 'Présentiel', VIRTUAL: 'Classe virtuelle', HYBRID: 'Hybride' }

/** Clé d'idempotence : un seul rappel par session. */
export function sessionReminderKey(sessionId: string): string {
  return `reminder.session:${sessionId}`
}

/** Rappelle une session précise à tous les membres de sa cohorte (notification interne + email). */
async function remindSession(sessionId: string): Promise<{ sessionId: string; notified: number }> {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: {
      cohort: {
        select: {
          id: true,
          name: true,
          course: { select: { title: true, slug: true } },
          members: { select: { userId: true, role: true } },
        },
      },
    },
  })
  if (!session) throw new NotFoundError('Session', sessionId)
  const lmsUrl = resolvePublicUrl('lms')
  const calendarUrl = `${lmsUrl}/calendrier`
  let notified = 0
  for (const member of session.cohort.members) {
    const result = await notifyUser(member.userId, {
      title: `Rappel : ${session.title} le ${formatDateTime(session.startsAt)}`,
      body: `Votre session « ${session.title} » de la formation ${session.cohort.course.title} a lieu dans moins de 24 heures (${modeLabels[session.mode] ?? session.mode}${session.location ? `, ${session.location}` : ''}).`,
      href: '/calendrier',
      app: 'lms',
      category: 'sessions',
      email: true,
      emailTemplate: 'session-reminder',
      emailVariables: {
        sessionTitle: session.title,
        courseTitle: session.cohort.course.title,
        startsAt: formatDateTime(session.startsAt),
        endsAt: formatDateTime(session.endsAt),
        mode: modeLabels[session.mode] ?? session.mode,
        location: session.location,
        trainerName: session.trainerName,
        meetingUrl: session.meetingUrl,
        calendarUrl,
      },
    })
    if (result.notificationId) notified++
  }
  return { sessionId, notified }
}

/**
 * Sans `sessionId` : balaye les sessions qui débutent dans la fenêtre (24 h par défaut) et met en file
 * un job par session (clé d'idempotence par session). Avec `sessionId` : envoie les rappels.
 */
export const reminderSessionHandler: JobHandler = async (payload, ctx) => {
  const input = parseReminderSession(payload)
  if (input.sessionId) {
    const result = await remindSession(input.sessionId)
    ctx.logger.info('reminder.session.sent', result)
    return result
  }

  const now = new Date()
  const horizon = new Date(now.getTime() + (input.hoursAhead ?? 24) * 3600_000)
  const sessions = await prisma.trainingSession.findMany({
    where: { startsAt: { gt: now, lte: horizon }, cohort: { status: { in: ['OPEN', 'RUNNING', 'PLANNED'] } } },
    select: { id: true, startsAt: true },
    orderBy: { startsAt: 'asc' },
    take: 500,
  })
  let scheduled = 0
  for (const session of sessions) {
    const job = await enqueue(JobTypes.reminderSession, { sessionId: session.id }, { idempotencyKey: sessionReminderKey(session.id), priority: 4 })
    if (job.created) scheduled++
  }
  ctx.logger.info('reminder.session.scanned', { candidates: sessions.length, scheduled })
  return { candidates: sessions.length, scheduled }
}
