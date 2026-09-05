import { ListPageSkeleton } from '@/components/public/skeletons'

/** Chargement du catalogue des formations : en-tête, filtres et grille de modules. */
export default function CoursesLoading() {
  return <ListPageSkeleton count={6} columns={3} withImage={false} />
}
