import 'server-only'
import { revalidatePath } from 'next/cache'
import type { SeoInput } from '@fetrag/cms'
import { bool, nullableText, text } from '@/server/account/common'

export { bool, date, firstErrors, int, json, list, nullableInt, nullableText, optionalText, successState, text, toErrorState } from '@/server/account/common'

/** Lit l'onglet SEO d'un formulaire d'édition (préfixe `seo`). */
export function readSeo(formData: FormData): SeoInput | undefined {
  if (!formData.has('seoTitle') && !formData.has('seoDescription')) return undefined
  return {
    title: nullableText(formData, 'seoTitle'),
    description: nullableText(formData, 'seoDescription'),
    canonical: nullableText(formData, 'seoCanonical'),
    ogImageUrl: nullableText(formData, 'seoOgImageUrl'),
    noIndex: bool(formData, 'seoNoIndex'),
  }
}

/** Slug optionnel : vide = généré à partir du titre. */
export function optionalSlug(formData: FormData): string | undefined {
  const value = text(formData, 'slug').trim().toLowerCase()
  return value.length > 0 ? value : undefined
}

/** Date `datetime-local` ou `date` → Date, `null` si vide, `undefined` si absente du formulaire. */
export function nullableDate(formData: FormData, name: string): Date | null | undefined {
  if (!formData.has(name)) return undefined
  const value = text(formData, name).trim()
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Montant entier XAF ; `null` si vide. */
export function nullableMoney(formData: FormData, name: string): number | null {
  const value = text(formData, name).replace(/\s/g, '')
  if (!value) return null
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** JSON optionnel d'un champ texte ; `null` si vide. Lève `SyntaxError` si invalide (converti par `toErrorState`). */
export function nullableJson<T = unknown>(formData: FormData, name: string): T | null {
  const value = text(formData, name).trim()
  if (!value) return null
  return JSON.parse(value) as T
}

/** Identifiant de relation : `null` si vide ou valeur « aucun ». */
export function relationId(formData: FormData, name: string): string | null {
  const value = text(formData, name).trim()
  return value && value !== 'none' ? value : null
}

/** Chemins publics à revalider après une publication ou une suppression (par type de contenu). */
export function revalidateContent(entity: string, slug?: string | null): void {
  const map: Record<string, string[]> = {
    page: ['/'],
    article: ['/', '/actualites'],
    resource: ['/ressources'],
    event: ['/', '/evenements'],
    service: ['/', '/services'],
    partner: ['/', '/organisations', '/partenariat'],
    category: ['/actualites', '/ressources', '/services'],
    faq: ['/faq'],
    menu: ['/'],
    media: [],
  }
  for (const path of map[entity] ?? []) revalidatePath(path)
  if (slug) {
    const detail: Record<string, string> = { page: `/${slug}`, article: `/actualites/${slug}`, resource: `/ressources/${slug}`, event: `/evenements/${slug}`, service: `/services/${slug}` }
    if (detail[entity]) revalidatePath(detail[entity])
  }
  if (entity === 'menu' || entity === 'page') revalidatePath('/', 'layout')
}
