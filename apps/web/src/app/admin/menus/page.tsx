import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ListTree } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Stagger, StaggerItem } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { loadMenus } from '@/server/admin/content-queries'
import { requireAdminCan } from '@/server/admin/context'
import { menuLocationLabels } from '@/server/admin/labels'

export const metadata: Metadata = { title: 'Menus' }

/** Emplacements de menus éditables. */
export default async function AdminMenusPage() {
  await requireAdminCan('cms.manage_menus', '/admin/menus')
  const menus = await loadMenus()

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Menus"
        description="Arborescences de navigation du site et de la plateforme de formation. Deux niveaux au plus ; un menu vide laisse la navigation par défaut."
      />
      <Stagger className="grid gap-4 sm:grid-cols-2">
        {menus.map((menu) => {
          const meta = menuLocationLabels[menu.location] ?? { label: menu.location, description: '', pillar: 'protection' as const }
          return (
            <StaggerItem key={menu.location}>
              <Card pillar={meta.pillar} interactive className="h-full">
                <CardHeader className="flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle as="h2">{menu.name ?? meta.label}</CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                  </div>
                  <Badge variant={menu.itemCount > 0 ? 'blue' : 'neutral'} size="sm">
                    {menu.itemCount} entrée{menu.itemCount > 1 ? 's' : ''}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/menus/${menu.location}`}>
                      <ListTree aria-hidden="true" />
                      Modifier l’arborescence
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </Stagger>
    </div>
  )
}
