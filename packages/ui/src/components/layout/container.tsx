import * as React from 'react'

import { cn } from '../../lib/cn'

const containerSizes = {
  /** 80rem : largeur standard des pages. */
  default: '',
  /** 64rem : pages de contenu. */
  wide: 'max-w-6xl',
  /** 48rem : formulaires, articles. */
  narrow: 'max-w-3xl',
  /** 42rem : lecture longue. */
  prose: 'max-w-2xl',
} as const

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  size?: keyof typeof containerSizes
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'nav'
}

/** Conteneur centré avec gouttières responsives (`container-fetrag`). Composant serveur. */
export const Container = React.forwardRef<HTMLElement, ContainerProps>(function Container(
  { size = 'default', as: Tag = 'div', className, ...props },
  ref,
) {
  return <Tag ref={ref as React.Ref<HTMLDivElement>} className={cn('container-fetrag', containerSizes[size], className)} {...props} />
})
