import type { Metadata } from 'next'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ArticleForm } from '@/components/admin/article-form'
import { requireAdminCan } from '@/server/admin/context'
import { loadCategoryOptions } from '@/server/admin/queries'

export const metadata: Metadata = { title: 'Nouvelle actualité' }

/** Rédaction d'une nouvelle actualité ou d'un communiqué (brouillon). */
export default async function NewArticlePage() {
  await requireAdminCan('cms.write', '/admin/actualites/nouveau')
  const categories = await loadCategoryOptions('article')
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Nouvelle actualité"
        description="Rédigez le texte, choisissez une catégorie et une image de couverture avec son texte alternatif ; l’actualité est créée en brouillon."
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Actualités', href: '/admin/actualites' }, { label: 'Nouvelle actualité' }]}
      />
      <ArticleForm categories={categories} />
    </div>
  )
}
