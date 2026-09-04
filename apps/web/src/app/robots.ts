import type { MetadataRoute } from 'next'
import { resolvePublicUrl } from '@fetrag/config'

/** Directives robots : zones privées exclues de l'indexation, plan de site déclaré. */
export default function robots(): MetadataRoute.Robots {
  const base = resolvePublicUrl('web')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/espace', '/api', '/paiement', '/connexion', '/inscription', '/deconnexion', '/acces-refuse'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
