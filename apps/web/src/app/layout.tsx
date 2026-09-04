import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Fraunces, Manrope } from 'next/font/google'
import { resolvePublicUrl } from '@fetrag/config'
import { Providers } from '@/components/site/providers'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { loadUserMenuProps } from '@/components/site/user-menu'
import { siteConfig } from '@/lib/site'
import './globals.css'

/** Serif à axe optique pour les titres (écho du lettrage du logo). */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
})

/** Sans-serif pour l'interface et le corps de texte. */
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const defaultTitle = `${siteConfig.name} - ${siteConfig.fullName}`

export const metadata: Metadata = {
  metadataBase: new URL(resolvePublicUrl('web')),
  title: { default: defaultTitle, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ['FETRAG', 'syndicat', 'Gabon', 'travailleurs', 'formation syndicale', 'droit du travail', 'dialogue social'],
  authors: [{ name: siteConfig.fullName, url: siteConfig.url }],
  creator: siteConfig.fullName,
  publisher: siteConfig.fullName,
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: 'website',
    locale: 'fr_GA',
    siteName: siteConfig.name,
    title: defaultTitle,
    description: siteConfig.description,
    url: '/',
    images: [{ url: '/brand/logo-fetrag-512.png', width: 512, height: 512, alt: `Logo ${siteConfig.name}` }],
  },
  twitter: {
    card: 'summary',
    title: defaultTitle,
    description: siteConfig.description,
    images: ['/brand/logo-fetrag-512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon-32.png'],
  },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0259C7',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
}

/** Coquille du site institutionnel : polices, lien d'évitement, header, contenu, footer. */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await loadUserMenuProps()
  return (
    <html lang="fr" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <a href="#contenu" className="skip-link">
          Aller au contenu principal
        </a>
        <Providers>
          <SiteHeader user={user} />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
