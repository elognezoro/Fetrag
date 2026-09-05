/**
 * Formatage de dates et nombres utilisable côté client (sans dépendance à `@fetrag/domain`,
 * dont l'index charge le client Prisma). Affichage en heure de Libreville, locale fr-GA.
 */

const TIMEZONE = 'Africa/Libreville'
const LOCALE = 'fr-GA'

type DateLike = Date | string | number | null | undefined

function toDate(value: DateLike): Date | null {
  if (value === null || value === undefined || value === '') return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function fmtDate(value: DateLike, options: Intl.DateTimeFormatOptions = {}): string {
  const d = toDate(value)
  if (!d) return ''
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, day: 'numeric', month: 'long', year: 'numeric', ...options }).format(d)
}

export function fmtDateShort(value: DateLike): string {
  return fmtDate(value, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function fmtDateTime(value: DateLike): string {
  return fmtDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function fmtTime(value: DateLike): string {
  const d = toDate(value)
  if (!d) return ''
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' }).format(d)
}

/** Jour de la semaine + date courte (planning). */
export function fmtWeekday(value: DateLike): string {
  return fmtDate(value, { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Valeur pour un `<input type="date">` (heure locale de Libreville). */
export function toInputDate(value: DateLike): string {
  const d = toDate(value)
  if (!d) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** Valeur pour un `<input type="datetime-local">` (heure locale de Libreville, UTC+1 sans changement d'heure). */
export function toInputDateTime(value: DateLike): string {
  const d = toDate(value)
  if (!d) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const hour = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
}

/** Convertit une valeur `datetime-local` saisie en heure de Libreville (UTC+1) en ISO UTC. */
export function fromInputDateTime(value: string): string {
  if (!value) return ''
  return `${value}:00+01:00`
}

export function fmtDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

export function fmtSeconds(seconds: number | null | undefined): string {
  if (!seconds) return '0 min'
  return fmtDuration(Math.round(seconds / 60)) || '< 1 min'
}

export function fmtPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return `${Math.round(value)} %`
}

export function fmtNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('fr-FR').format(value)
}

export function fmtMoney(amount: number | null | undefined, currency = 'XAF'): string {
  if (amount === null || amount === undefined) return '-'
  return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency === 'XAF' ? 'FCFA' : currency}`
}

export function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/** Nom affichable d'un utilisateur (client-safe). */
export function personName(user: { name?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null } | null | undefined): string {
  if (!user) return 'Utilisateur'
  if (user.name && user.name.trim()) return user.name.trim()
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return composed || user.email || 'Utilisateur'
}

/** Pluriel simple. */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${fmtNumber(count)} ${count > 1 ? pluralForm : singular}`
}
