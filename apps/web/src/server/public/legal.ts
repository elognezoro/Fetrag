import 'server-only'
import type { PublicPage } from '@fetrag/cms'
import { LEGAL_NOTICE_HTML, PRIVACY_HTML } from './institution'
import { loadPage } from './loaders'
import { safeQuery } from './safe'

export type LegalSlug = 'mentions-legales' | 'confidentialite'

export interface LegalPageData {
  title: string
  excerpt: string
  html: string
  updatedAt: Date | null
  /** Vrai lorsque le contenu provient du CMS (sinon texte de repli rédigé par la Fédération). */
  fromCms: boolean
  page: PublicPage | null
}

const fallbacks: Record<LegalSlug, { title: string; excerpt: string; html: string }> = {
  'mentions-legales': {
    title: 'Mentions légales',
    excerpt: "Éditeur, hébergement, propriété intellectuelle et conditions d'utilisation des sites fetrag.ga et formation.fetrag.ga.",
    html: LEGAL_NOTICE_HTML,
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    excerpt: 'Comment la Fédération des Travailleurs du Gabon collecte, utilise et protège vos données personnelles.',
    html: PRIVACY_HTML,
  },
}

/** Page légale : contenu CMS publié si disponible, sinon texte officiel de repli. */
export async function getLegalPage(slug: LegalSlug): Promise<LegalPageData> {
  const page = await safeQuery(`pages.getPublished(${slug})`, () => loadPage(slug), null)
  const fallback = fallbacks[slug]
  if (page && page.content.trim().length > 0) {
    return { title: page.title, excerpt: page.excerpt ?? fallback.excerpt, html: page.content, updatedAt: page.updatedAt, fromCms: true, page }
  }
  return { ...fallback, updatedAt: null, fromCms: false, page }
}
