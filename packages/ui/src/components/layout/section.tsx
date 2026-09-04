import * as React from 'react'

import { cn } from '../../lib/cn'
import { RingBackdrop, type RingBackdropProps } from '../brand/ring-backdrop'
import { Container, type ContainerProps } from './container'

const sectionVariants = {
  /** Transparent : hérite du fond de page (neutral-50). */
  default: '',
  muted: 'bg-neutral-50',
  white: 'bg-white',
  /** Dégradé marine → bleu, texte blanc, arc vert décoratif. */
  dark: 'bg-navy-gradient text-white',
  /** Bleu très clair. */
  soft: 'bg-blue-50',
} as const

const sectionPaddings = {
  none: '',
  sm: 'py-8 sm:py-10',
  md: 'py-12 sm:py-16 lg:py-20',
  lg: 'py-16 sm:py-24 lg:py-28',
} as const

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof sectionVariants
  padding?: keyof typeof sectionPaddings
  as?: 'section' | 'div' | 'article' | 'aside' | 'header' | 'footer'
  /** Enveloppe les enfants dans un `Container` (défaut). */
  container?: boolean
  containerSize?: ContainerProps['size']
  containerClassName?: string
  /** Trame d'anneaux décorative (activée par défaut sur `dark`). */
  rings?: boolean | RingBackdropProps
  /** Bordure supérieure fine. */
  bordered?: boolean
}

/** Section de page avec variantes de fond et espacement vertical responsive. Composant serveur. */
export function Section({
  variant = 'default',
  padding = 'md',
  as: Tag = 'section',
  container = true,
  containerSize,
  containerClassName,
  rings,
  bordered = false,
  className,
  children,
  ...props
}: SectionProps) {
  const isDark = variant === 'dark'
  const showRings = rings === undefined ? isDark : Boolean(rings)
  const ringProps: RingBackdropProps =
    typeof rings === 'object' ? rings : { scheme: isDark ? 'light' : 'brand', opacity: isDark ? 0.1 : 0.06, position: 'top-right' }

  return (
    <Tag
      className={cn(
        'relative',
        (showRings || isDark) && 'overflow-hidden',
        sectionVariants[variant],
        sectionPaddings[padding],
        bordered && 'border-t border-neutral-200',
        className,
      )}
      {...props}
    >
      {showRings ? <RingBackdrop {...ringProps} /> : null}
      {container ? (
        <Container size={containerSize} className={cn('relative', containerClassName)}>
          {children}
        </Container>
      ) : (
        <div className="relative">{children}</div>
      )}
    </Tag>
  )
}
