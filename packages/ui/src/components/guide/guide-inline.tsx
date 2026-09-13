import * as React from 'react'
import Link from 'next/link'

import { cn } from '../../lib/cn'

export interface GuideBaseUrls {
  web: string
  lms: string
}

export interface RenderGuideInlineOptions {
  /** URL publiques substituées aux marqueurs `{{web}}` et `{{lms}}` (textes et liens). */
  baseUrls?: GuideBaseUrls
}

/** Remplace les marqueurs `{{web}}` et `{{lms}}` par les URL publiques des deux applications. */
export function resolveGuideText(text: string, baseUrls?: GuideBaseUrls): string {
  if (!baseUrls) return text
  return text.replace(/\{\{web\}\}/g, baseUrls.web).replace(/\{\{lms\}\}/g, baseUrls.lms)
}

/** Vrai pour une URL absolue (`https://`, `mailto:`, `tel:`...). */
function isAbsoluteHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')
}

/**
 * Vrai si l'URL absolue utilise un schéma autorisé (liste blanche). Tout autre schéma
 * (`javascript:`, `data:`, `vbscript:`...) est refusé : le lien est alors rendu en texte simple.
 */
function isSafeAbsoluteHref(href: string): boolean {
  if (href.startsWith('//')) return true
  return /^(https?|mailto|tel):/i.test(href)
}

/** Classes de base des pastilles « élément d'interface » (bouton, onglet, touche). */
export const guideKbdClassName = cn(
  'inline-block rounded-md border border-neutral-300 bg-neutral-50 px-1.5 py-px align-baseline font-sans text-[0.9em] font-semibold text-navy',
  'shadow-[inset_0_-1px_0_var(--color-neutral-200)]',
)

/** Classes des liens en ligne des guides. */
export const guideLinkClassName =
  'font-semibold text-blue-700 underline decoration-blue-300 underline-offset-[3px] transition-colors hover:text-blue-800 hover:decoration-blue-600 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 rounded-sm'

/** Lien d'un guide : `next/link` pour les chemins internes, `<a>` (nouvel onglet) pour les URL absolues. */
export function GuideLink({
  href,
  baseUrls,
  className,
  children,
  external,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  baseUrls?: GuideBaseUrls
  /** Force l'ouverture dans un nouvel onglet (lien vers l'autre application). */
  external?: boolean
}) {
  const resolved = resolveGuideText(href, baseUrls)
  const absolute = isAbsoluteHref(resolved)
  const openInNewTab = external || (absolute && (/^https?:/i.test(resolved) || resolved.startsWith('//')))

  if (!absolute && !external && (resolved.startsWith('/') || resolved.startsWith('#'))) {
    return (
      <Link href={resolved} className={cn(guideLinkClassName, className)} {...props}>
        {children}
      </Link>
    )
  }

  // Schéma non autorisé (javascript:, data:...) : on neutralise le lien et on rend le libellé en texte.
  if (absolute && !isSafeAbsoluteHref(resolved)) {
    return <span className={className}>{children}</span>
  }

  return (
    <a
      href={resolved}
      className={cn(guideLinkClassName, className)}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {openInNewTab ? <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span> : null}
    </a>
  )
}

/**
 * Motifs reconnus, dans l'ordre d'apparition dans le texte :
 *   - `**gras**`         : libellé affiché à l'écran ;
 *   - `` `pastille` ``   : bouton, onglet, touche ;
 *   - `[texte](href)`    : lien.
 * Les marqueurs imbriqués simples sont acceptés (`**[Lien](/x)**`, `[**Gras**](/x)`, ``**`Bouton`**``).
 */
const inlinePattern = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/

function parseInline(text: string, baseUrls: GuideBaseUrls | undefined, depth: number, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let rest = text
  let index = 0

  while (rest.length > 0) {
    const match = depth < 3 ? inlinePattern.exec(rest) : null
    if (!match || match.index === undefined) {
      nodes.push(rest)
      break
    }
    if (match.index > 0) nodes.push(rest.slice(0, match.index))

    const key = `${keyPrefix}-${index++}`
    const [, bold, kbd, linkLabel, linkHref] = match

    if (bold !== undefined) {
      nodes.push(<strong key={key}>{parseInline(bold, baseUrls, depth + 1, key)}</strong>)
    } else if (kbd !== undefined) {
      nodes.push(
        <kbd key={key} className={guideKbdClassName}>
          {kbd}
        </kbd>,
      )
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      nodes.push(
        <GuideLink key={key} href={linkHref} baseUrls={baseUrls}>
          {parseInline(linkLabel, baseUrls, depth + 1, key)}
        </GuideLink>,
      )
    }

    rest = rest.slice(match.index + match[0].length)
  }

  return nodes
}

/**
 * Rend la mise en forme en ligne d'un texte de guide : `**gras**` → `<strong>`, `` `pastille` `` → `<kbd>`,
 * `[texte](href)` → lien (`next/link` pour les chemins internes, nouvel onglet pour les URL absolues).
 * Les marqueurs `{{web}}` / `{{lms}}` sont substitués avant l'analyse. Aucun HTML n'est interprété.
 */
export function renderGuideInline(text: string, options: RenderGuideInlineOptions = {}): React.ReactNode {
  const source = resolveGuideText(text, options.baseUrls)
  const nodes = parseInline(source, options.baseUrls, 0, 'gi')
  if (nodes.length === 1 && typeof nodes[0] === 'string') return nodes[0]
  return <>{nodes}</>
}
