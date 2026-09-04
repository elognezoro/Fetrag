import type { MetadataRoute } from 'next'

/** Manifeste PWA de la plateforme de formation (installable, chapitre 22 du CDC). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FETRAG Formation',
    short_name: 'FETRAG',
    description: 'Plateforme de formation syndicale de la Fédération des Travailleurs du Gabon.',
    lang: 'fr',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F7F8FC',
    theme_color: '#0259C7',
    categories: ['education'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/brand/logo-fetrag-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
