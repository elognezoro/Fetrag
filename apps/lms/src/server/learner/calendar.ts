/**
 * Helpers purs du calendrier apprenant (fuseau Africa/Libreville, UTC+1 sans heure d'été).
 * Aucune dépendance serveur : utilisables par les composants serveur et les tests.
 */

export const CALENDAR_TIMEZONE = 'Africa/Libreville'
/** Décalage fixe de Libreville par rapport à UTC (heures). */
const LIBREVILLE_OFFSET_HOURS = 1

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: CALENDAR_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const monthLabelFormatter = new Intl.DateTimeFormat('fr-GA', { timeZone: CALENDAR_TIMEZONE, month: 'long', year: 'numeric' })

export interface MonthRef {
  year: number
  /** 1-12 */
  month: number
}

/** Mois courant (Libreville). */
export function currentMonth(now: Date = new Date()): MonthRef {
  const key = dayKeyFormatter.format(now)
  const [y, m] = key.split('-')
  return { year: Number(y), month: Number(m) }
}

/** Lit `?mois=YYYY-MM` ; repli sur le mois courant si absent ou invalide. */
export function monthFromParam(value: string | undefined, now: Date = new Date()): MonthRef {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split('-').map(Number)
    if (y && m && m >= 1 && m <= 12 && y >= 2000 && y <= 2100) return { year: y, month: m }
  }
  return currentMonth(now)
}

export function monthParam(ref: MonthRef): string {
  return `${ref.year}-${String(ref.month).padStart(2, '0')}`
}

export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
  const index = ref.year * 12 + (ref.month - 1) + delta
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

/** Instant UTC correspondant à minuit (heure de Libreville) du jour donné. */
export function localMidnightUtc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, -LIBREVILLE_OFFSET_HOURS, 0, 0, 0))
}

/** Bornes [début du mois, début du mois suivant[ en UTC. */
export function monthRange(ref: MonthRef): { from: Date; to: Date } {
  const next = shiftMonth(ref, 1)
  return { from: localMidnightUtc(ref.year, ref.month, 1), to: localMidnightUtc(next.year, next.month, 1) }
}

/** Clé `YYYY-MM-DD` (heure de Libreville) d'un instant. */
export function dayKey(date: Date): string {
  return dayKeyFormatter.format(date)
}

/** Libellé « septembre 2026 » avec majuscule initiale. */
export function monthLabel(ref: MonthRef): string {
  const label = monthLabelFormatter.format(localMidnightUtc(ref.year, ref.month, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export interface CalendarCell {
  key: string
  day: number
  /** Le jour appartient au mois affiché (sinon jour de remplissage). */
  inMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

/** Grille du mois : semaines commençant le lundi, remplies avec les jours voisins. */
export function buildMonthGrid(ref: MonthRef, now: Date = new Date()): CalendarCell[][] {
  const todayKey = dayKey(now)
  const first = new Date(Date.UTC(ref.year, ref.month - 1, 1))
  // 0 = lundi ... 6 = dimanche
  const leading = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(ref.year, ref.month, 0)).getUTCDate()
  const weekCount = Math.ceil((leading + daysInMonth) / 7)
  const cursor = new Date(Date.UTC(ref.year, ref.month - 1, 1 - leading))
  const weeks: CalendarCell[][] = []
  for (let w = 0; w < weekCount; w++) {
    const week: CalendarCell[] = []
    for (let d = 0; d < 7; d++) {
      const y = cursor.getUTCFullYear()
      const m = cursor.getUTCMonth() + 1
      const day = cursor.getUTCDate()
      const key = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      week.push({ key, day, inMonth: m === ref.month && y === ref.year, isToday: key === todayKey, isWeekend: d >= 5 })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export const weekDayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const
