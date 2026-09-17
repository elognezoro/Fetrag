// Assainissement du HTML riche (éditeur TipTap) : liste blanche stricte (ADR-005).
// Appliqué à l'écriture (create/update) et exposé pour le rendu côté serveur.
import sanitize, { type Attributes, type IOptions } from 'sanitize-html'
// Import ciblé (sans client Prisma) : ce module reste pur et testable unitairement.
import { excerpt } from '@fetrag/domain/slug'

/** Hôtes autorisés pour les iframes (vidéo uniquement). */
export const allowedIframeHostnames = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'www.vimeo.com',
]

/** Balises autorisées dans les contenus éditoriaux. */
export const allowedTags = [
  'h2',
  'h3',
  'h4',
  'p',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'u',
  's',
  'a',
  'img',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
  'br',
  'code',
  'pre',
  'figure',
  'figcaption',
  'iframe',
  // Bloc dépliable (consignes, corrigés révélables) : balises structurelles inertes, sans attribut.
  'details',
  'summary',
]

/** Force `rel="noopener noreferrer"` sur les liens ouverts dans un nouvel onglet ; retire les autres cibles. */
function transformAnchor(tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } {
  const next: Attributes = { ...attribs }
  if (next.target === '_blank') {
    next.rel = 'noopener noreferrer'
  } else {
    delete next.target
    delete next.rel
  }
  return { tagName, attribs: next }
}

/** Ajoute le chargement paresseux et retire les dimensions non numériques des images. */
function transformImage(tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } {
  const next: Attributes = { ...attribs }
  for (const dim of ['width', 'height'] as const) {
    const value = next[dim]
    if (value !== undefined && !/^\d{1,4}$/.test(value)) delete next[dim]
  }
  if (next.alt === undefined) next.alt = ''
  next.loading = 'lazy'
  return { tagName, attribs: next }
}

/** Options sanitize-html partagées (exportées pour les tests et les rendus spécialisés). */
export const sanitizeOptions: IOptions = {
  allowedTags,
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder', 'loading'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'], iframe: ['https'] },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  allowedIframeHostnames,
  disallowedTagsMode: 'discard',
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'template'],
  transformTags: {
    a: transformAnchor,
    img: transformImage,
  },
  // Une iframe dont la source a été rejetée (hôte non autorisé) ou une image sans source est supprimée entièrement.
  exclusiveFilter: (frame) => (frame.tag === 'iframe' || frame.tag === 'img') && !frame.attribs.src,
  parser: { lowerCaseTags: true, decodeEntities: true },
}

/**
 * Assainit un fragment HTML selon la liste blanche FETRAG.
 * Renvoie une chaîne vide pour une valeur absente.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitize(html, sanitizeOptions)
}

/** Assainissement « texte seul » (aucune balise), utile pour les champs courts saisis en HTML. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return decodeEntities(sanitize(html, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, ' ')
    .trim()
}

const entityMap: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&#160;': ' ',
  '&laquo;': '«',
  '&raquo;': '»',
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&agrave;': 'à',
  '&ccedil;': 'ç',
  '&ecirc;': 'ê',
  '&ocirc;': 'ô',
  '&ugrave;': 'ù',
  '&rsquo;': '’',
  '&hellip;': '…',
}

/** Décode les entités HTML courantes (suffisant pour un extrait de texte). */
export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&[a-z]+;/gi, (m) => entityMap[m.toLowerCase()] ?? m)
}

/**
 * Produit un extrait texte (sans balise, entités décodées) tronqué proprement au mot,
 * utilisé pour les cartes, les métadonnées SEO et l'extrait automatique des contenus.
 */
export function renderExcerpt(html: string | null | undefined, max = 160): string {
  if (!html) return ''
  const withBreaks = html.replace(/<\/(p|h[1-6]|li|blockquote|tr|figcaption|summary|details)>/gi, ' ').replace(/<br\s*\/?>/gi, ' ')
  return excerpt(decodeEntities(withBreaks), max)
}
