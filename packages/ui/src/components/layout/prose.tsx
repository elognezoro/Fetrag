import * as React from 'react'

import { cn } from '../../lib/cn'

export interface ProseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dangerouslySetInnerHTML'> {
  /**
   * HTML DÉJÀ ASSAINI (via `sanitizeHtml` de `@fetrag/cms`). Ne jamais passer
   * de contenu utilisateur brut : ce composant ne filtre rien.
   */
  html?: string
  as?: 'div' | 'article' | 'section'
  size?: 'base' | 'lg'
}

/**
 * Contenu riche (articles, pages, leçons) stylé par `prose-fetrag`.
 * Rend `html` via `dangerouslySetInnerHTML`, ou les enfants React sinon.
 */
export function Prose({ html, as: Tag = 'div', size = 'base', className, children, ...props }: ProseProps) {
  const classes = cn('prose-fetrag max-w-none', size === 'lg' && 'text-lg', className)
  if (html !== undefined) {
    return <Tag className={classes} dangerouslySetInnerHTML={{ __html: html }} {...props} />
  }
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}
