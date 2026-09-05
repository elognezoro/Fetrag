import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@fetrag/ui'

interface SectionLinkProps {
  href: string
  children: React.ReactNode
  external?: boolean
  tone?: 'blue' | 'green' | 'gold' | 'white'
  className?: string
}

const tones = {
  blue: 'text-blue-600 hover:text-blue-700',
  green: 'text-green-700 hover:text-green-800',
  gold: 'text-gold-700 hover:text-gold-800',
  white: 'text-white hover:text-gold-300',
} as const

/** Lien d'action de section (« Toutes les actualités ») avec flèche animée au survol. */
export function SectionLink({ href, children, external = false, tone = 'blue', className }: SectionLinkProps) {
  const classes = cn(
    'group inline-flex min-h-11 items-center gap-1.5 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40',
    tones[tone],
    className,
  )
  const Icon = external ? ArrowUpRight : ArrowRight
  const icon = <Icon className="size-4 transition-transform duration-180 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
  if (external) {
    return (
      <a href={href} className={classes}>
        {children}
        {icon}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
      {icon}
    </Link>
  )
}
