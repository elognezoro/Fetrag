import type { Metadata } from 'next'
import { Pagination } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { FilterBar } from '@/components/admin/filter-bar'
import { MediaLibrary, type MediaItem } from '@/components/admin/media-library'
import { loadMedia } from '@/server/admin/content-queries'
import { requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'

export const metadata: Metadata = { title: 'Médiathèque' }

const BASE = '/admin/medias'

/** Médiathèque : fichiers envoyés (images, documents, audio, vidéo) avec dossiers et visibilité. */
export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const principal = await requireAdminCan('cms.manage_media', BASE)
  const params = readListParams(await searchParams, ['dossier', 'visibilite', 'type'], { pageSize: 24 })
  const { list, folders } = await loadMedia(principal, params)
  const items: MediaItem[] = list.items.map((m) => ({
    id: m.id,
    url: m.url,
    key: m.key,
    fileName: m.fileName,
    mimeType: m.mimeType,
    size: m.size,
    alt: m.alt,
    caption: m.caption,
    visibility: m.visibility,
    folder: m.folder,
    createdAt: m.createdAt.toISOString(),
    uploadedBy: m.uploadedBy?.name ?? null,
  }))

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeading
        eyebrow="Contenus"
        title="Médiathèque"
        description="Images, documents, audio et vidéo réutilisables dans les pages, actualités et ressources. Renseignez le texte alternatif des images pour l’accessibilité."
      />
      <FilterBar
        action={BASE}
        q={params.q}
        searchPlaceholder="Nom de fichier, texte alternatif"
        selects={[
          { name: 'dossier', label: 'Dossier', value: params.filters.dossier, options: folders.map((f) => ({ value: f.folder, label: `${f.folder} (${f.count})` })) },
          { name: 'type', label: 'Type', value: params.filters.type, options: [{ value: 'image', label: 'Images' }, { value: 'document', label: 'Documents' }, { value: 'video', label: 'Vidéos' }, { value: 'audio', label: 'Audio' }] },
          { name: 'visibilite', label: 'Visibilité', value: params.filters.visibilite, options: [{ value: 'PUBLIC', label: 'Publics' }, { value: 'PRIVATE', label: 'Privés' }], allLabel: 'Toutes' },
        ]}
      />
      <MediaLibrary items={items} folders={folders.map((f) => f.folder)} defaultFolder={params.filters.dossier} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          {list.total} fichier{list.total > 1 ? 's' : ''}
        </p>
        <Pagination page={list.page} totalPages={list.totalPages} hrefFor={pageHref(BASE, params)} />
      </div>
    </div>
  )
}
