import type { Metadata } from 'next'
import type { SiteMetadata } from '@fetrag/cms'

/**
 * Convertit l'objet SEO du CMS (`seo.buildMetadata`) en `Metadata` Next.js typé.
 * Les champs « article » (dates) ne sont posés que sur le type OpenGraph correspondant.
 */
export function toMetadata(site: SiteMetadata): Metadata {
  const og = site.openGraph
  const openGraph: Metadata['openGraph'] = og
    ? og.type === 'article'
      ? {
          type: 'article',
          title: og.title,
          description: og.description,
          url: og.url,
          siteName: og.siteName,
          locale: og.locale,
          images: og.images,
          publishedTime: og.publishedTime,
          modifiedTime: og.modifiedTime,
        }
      : {
          type: 'website',
          title: og.title,
          description: og.description,
          url: og.url,
          siteName: og.siteName,
          locale: og.locale,
          images: og.images,
        }
    : undefined

  return {
    title: site.title,
    description: site.description,
    keywords: site.keywords,
    alternates: site.alternates,
    openGraph,
    twitter: site.twitter,
    robots: site.robots,
  }
}
