/** Helpers purs partagés par les formulaires du back-office (client et serveur). */

const TIMEZONE = 'Africa/Libreville'

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((p) => p.type === type)?.value ?? '00'
}

/** Valeur `datetime-local` (heure de Libreville) à partir d'une date ou chaîne ISO ; vide si absente. */
export function toDateTimeLocal(value: Date | string | null | undefined): string {
  if (!value) return ''
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ''
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d)
  return `${part(parts, 'year')}-${part(parts, 'month')}-${part(parts, 'day')}T${part(parts, 'hour')}:${part(parts, 'minute')}`
}

/** Valeur `date` (AAAA-MM-JJ, heure de Libreville). */
export function toDateInput(value: Date | string | null | undefined): string {
  return toDateTimeLocal(value).slice(0, 10)
}

/** Slug indicatif calculé côté client à partir d'un titre (le serveur reste maître de l'unicité). */
export function previewSlug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 96)
}

/** Options de sélection à partir d'un dictionnaire de libellés. */
export function optionsFrom<T extends string>(labels: Record<T, string>): Array<{ value: T; label: string }> {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }))
}
