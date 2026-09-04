import type { MetadataRoute } from 'next'

/** Manifeste PWA du site institutionnel. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FETRAG - Fédération des Travailleurs du Gabon',
    short_name: 'FETRAG',
    description:
      "Site institutionnel de la Fédération des Travailleurs du Gabon : actualités, services, ressources et formation syndicale.",
    lang: 'fr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F7F8FC',
    theme_color: '#0259C7',
    categories: ['education', 'news', 'social'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/brand/logo-fetrag-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
