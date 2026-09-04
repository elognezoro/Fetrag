import type { MetadataRoute } from 'next'
import { resolvePublicUrl } from '@fetrag/config'

/** Directives robots : seuls l'accueil, le catalogue et les fiches de cours sont indexables. */
export default function robots(): MetadataRoute.Robots {
  const base = resolvePublicUrl('lms')
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/catalogue', '/cours/'],
        disallow: [
          '/admin',
          '/espace',
          '/api',
          '/dashboard',
          '/mes-formations',
          '/apprendre',
          '/evaluations',
          '/devoirs',
          '/forums',
          '/calendrier',
          '/certificats',
          '/organisation',
          '/formateur',
          '/coordination',
          '/demande-formation',
          '/connexion',
          '/deconnexion',
          '/acces-refuse',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
