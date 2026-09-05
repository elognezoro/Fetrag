import { ListPageSkeleton } from '@/components/public/skeletons'

/** Chargement de la bibliothèque : en-tête, filtres et grille de documents. */
export default function ResourcesLoading() {
  return <ListPageSkeleton count={6} columns={3} withImage={false} />
}
