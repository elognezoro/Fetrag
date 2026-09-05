import { ListPageSkeleton } from '@/components/public/skeletons'

/** Chargement des actualités : en-tête, barre de recherche et grille d'articles. */
export default function NewsLoading() {
  return <ListPageSkeleton count={6} columns={3} withImage />
}
