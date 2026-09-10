import * as React from 'react'

import { cn } from '../../lib/cn'
import { type Tone } from '../../lib/tones'
import { Breadcrumbs, type BreadcrumbItem } from '../breadcrumbs'
import { RingBackdrop } from '../brand/ring-backdrop'
import { Ribbon } from '../brand/ribbon'
import { Container, type ContainerProps } from './container'

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode
  eyebrow?: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  /** Ajoute « Accueil » en tête du fil d'Ariane. */
  homeHref?: string
  /** Boutons ou liens affichés sous la description (ou à droite sur grand écran). */
  actions?: React.ReactNode
  /** Métadonnées (date, auteur, durée...) affichées sous le titre. */
  meta?: React.ReactNode
  tone?: Tone
  variant?: 'light' | 'dark'
  align?: 'left' | 'center'
  size?: 'md' | 'lg'
  containerSize?: ContainerProps['size']
  /** Visuel affiché à droite sur grand écran (image, emblème, arc). */
  aside?: React.ReactNode
}

/** En-tête de page : fil d'Ariane, ruban, titre serif, description, fond avec anneaux. Composant serveur. */
export function PageHeader({
  title,
  eyebrow,
  description,
  breadcrumbs,
  homeHref,
  actions,
  meta,
  tone = 'blue',
  variant = 'light',
  align = 'left',
  size = 'md',
  containerSize,
  aside,
  className,
  children,
  ...props
}: PageHeaderProps) {
  const dark = variant === 'dark'
  const centered = align === 'center'

  return (
    <header
      className={cn(
        'relative overflow-hidden border-b',
        dark ? 'bg-navy-gradient border-transparent text-white' : 'border-neutral-200 bg-white text-ink',
        size === 'lg' ? 'py-14 sm:py-20' : 'py-10 sm:py-14',
        className,
      )}
      {...props}
    >
      <RingBackdrop scheme={dark ? 'light' : 'brand'} opacity={dark ? 0.12 : 0.06} position={centered ? 'center' : 'top-right'} />
      <Container size={containerSize} className="relative">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} homeHref={homeHref} inverted={dark} className={cn('mb-6', centered && 'justify-center [&_ol]:justify-center')} />
        ) : null}
        <div className={cn('flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between', centered && 'items-center text-center lg:flex-col lg:items-center')}>
          <div className={cn('flex max-w-3xl flex-col gap-4', centered && 'items-center')}>
            {eyebrow ? <Ribbon tone={tone}>{eyebrow}</Ribbon> : null}
            <h1
              className={cn(
                'font-display font-semibold leading-[1.05] tracking-tight text-balance',
                size === 'lg' ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl lg:text-5xl',
                dark ? 'text-white' : 'text-navy',
              )}
            >
              {title}
            </h1>
            {description ? (
              <p className={cn('max-w-2xl text-base leading-relaxed sm:text-lg', dark ? 'text-white/80' : 'text-neutral-600')}>{description}</p>
            ) : null}
            {meta ? (
              <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-sm', dark ? 'text-white/70' : 'text-neutral-500', centered && 'justify-center')}>
                {meta}
              </div>
            ) : null}
            {actions ? <div className={cn('mt-2 flex flex-wrap items-center gap-3 [&>*]:max-w-full', centered && 'justify-center')}>{actions}</div> : null}
          </div>
          {aside ? <div className="flex shrink-0 justify-center lg:max-w-sm lg:justify-end">{aside}</div> : null}
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </header>
  )
}
