import type { Db } from './db'
import { percent } from '../lib/text'

export interface AttendanceRateResult {
  /** Taux en % (présents + retards / sessions passées) ; null si aucune session n'est passée. */
  rate: number | null
  pastSessions: number
  totalSessions: number
  attended: number
}

/** Calcule l'assiduité d'un utilisateur sur les sessions passées d'une cohorte. */
export async function computeAttendanceRate(db: Db, userId: string, cohortId: string, now: Date = new Date()): Promise<AttendanceRateResult> {
  const sessions = await db.trainingSession.findMany({ where: { cohortId }, select: { id: true, endsAt: true } })
  const past = sessions.filter((s) => s.endsAt.getTime() <= now.getTime()).map((s) => s.id)
  if (past.length === 0) return { rate: null, pastSessions: 0, totalSessions: sessions.length, attended: 0 }
  const attended = await db.attendance.count({
    where: { userId, sessionId: { in: past }, status: { in: ['PRESENT', 'LATE'] } },
  })
  return { rate: percent(attended, past.length), pastSessions: past.length, totalSessions: sessions.length, attended }
}

/** Assiduité de tous les membres d'une cohorte en une requête groupée. */
export async function computeCohortAttendance(
  db: Db,
  cohortId: string,
  now: Date = new Date(),
): Promise<{ pastSessions: number; totalSessions: number; byUser: Map<string, number> }> {
  const sessions = await db.trainingSession.findMany({ where: { cohortId }, select: { id: true, endsAt: true } })
  const past = sessions.filter((s) => s.endsAt.getTime() <= now.getTime()).map((s) => s.id)
  const byUser = new Map<string, number>()
  if (past.length === 0) return { pastSessions: 0, totalSessions: sessions.length, byUser }
  const grouped = await db.attendance.groupBy({
    by: ['userId'],
    where: { sessionId: { in: past }, status: { in: ['PRESENT', 'LATE'] } },
    _count: { _all: true },
  })
  for (const row of grouped) byUser.set(row.userId, percent(row._count._all, past.length))
  return { pastSessions: past.length, totalSessions: sessions.length, byUser }
}
