import type { Metadata } from 'next'
import { seo } from '@fetrag/cms'
import { JsonLd } from '@/components/public/json-ld'
import { LegalPage } from '@/components/public/legal-page'
import { getLegalPage } from '@/server/public/legal'
import { toMetadata } from '@/server/public/metadata'

export const revalidate = 3600

const SLUG = 'confidentialite' as const

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLegalPage(SLUG)
  if (data.page) return { ...toMetadata(seo.buildMetadata('page', data.page)), alternates: { canonical: `/${SLUG}` } }
  return { title: data.title, description: data.excerpt, alternates: { canonical: `/${SLUG}` } }
}

/** Politique de confidentialité : page CMS publiée si disponible, sinon texte officiel de repli. */
export default async function PrivacyPage() {
  const data = await getLegalPage(SLUG)
  const jsonLd = data.page ? seo.jsonLd('page', data.page) : seo.jsonLd('page', { slug: SLUG, title: data.title, excerpt: data.excerpt })
  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalPage slug={SLUG} data={data} />
    </>
  )
}
