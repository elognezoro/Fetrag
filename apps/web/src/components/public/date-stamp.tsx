import { cn } from '@fetrag/ui'

const TIMEZONE = 'Africa/Libreville'

interface DateStampProps {
  date: Date | string
  /** Événement passé : timbre grisé. */
  muted?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/** Date en « timbre » bleu : jour en grand chiffre serif, mois abrégé et année. */
export function DateStamp({ date, muted = false, size = 'md', className }: DateStampProps) {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = new Intl.DateTimeFormat('fr-GA', { timeZone: TIMEZONE, day: '2-digit' }).format(d)
  const month = new Intl.DateTimeFormat('fr-GA', { timeZone: TIMEZONE, month: 'short' }).format(d).replace('.', '')
  const year = new Intl.DateTimeFormat('fr-GA', { timeZone: TIMEZONE, year: 'numeric' }).format(d)
  const iso = d.toISOString()

  return (
    <time
      dateTime={iso}
      className={cn(
        'inline-flex shrink-0 flex-col items-center justify-center rounded-xl border-2 text-center leading-none shadow-soft',
        size === 'md' ? 'min-w-[4.5rem] px-3 py-2.5' : 'min-w-[3.5rem] px-2 py-2',
        muted ? 'border-neutral-300 bg-neutral-100 text-neutral-600' : 'border-blue-500 bg-blue-500 text-white',
        className,
      )}
    >
      <span className={cn('font-display font-semibold', size === 'md' ? 'text-3xl' : 'text-2xl')}>{day}</span>
      <span className={cn('eyebrow mt-1 text-[10px]', muted ? 'text-neutral-500' : 'text-white/85')}>{month}</span>
      <span className={cn('mt-0.5 text-[10px] font-semibold', muted ? 'text-neutral-500' : 'text-white/70')}>{year}</span>
    </time>
  )
}
