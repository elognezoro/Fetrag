import { ListPageSkeleton } from '@/components/public/skeletons'

/** Chargement du catalogue des services : en-tête et grille de cartes. */
export default function ServicesLoading() {
  return <ListPageSkeleton count={6} columns={3} withImage={false} />
}
