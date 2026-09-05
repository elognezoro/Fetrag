import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { MenuEditor } from '@/components/admin/menu-editor'
import { loadMenu } from '@/server/admin/content-queries'
import { requireAdminCan } from '@/server/admin/context'
import { menuLocationLabels } from '@/server/admin/labels'

interface PageProps {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location } = await params
  return { title: menuLocationLabels[location]?.label ?? 'Menu' }
}

/** Éditeur d'arborescence d'un emplacement de menu. */
export default async function EditMenuPage({ params }: PageProps) {
  const { location } = await params
  await requireAdminCan('cms.manage_menus', `/admin/menus/${location}`)
  const menu = await loadMenu(location)
  if (!menu) notFound()
  const meta = menuLocationLabels[menu.location] ?? { label: menu.location, description: '', pillar: 'protection' as const }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title={meta.label}
        description={meta.description}
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Menus', href: '/admin/menus' }, { label: meta.label }]}
      />
      <MenuEditor location={menu.location} locationLabel={meta.label} name={menu.name} items={menu.items} />
    </div>
  )
}
