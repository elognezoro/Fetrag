import { ListPageSkeleton } from '@/components/public/skeletons'

/** Chargement de l'agenda : en-tête, filtres et grille d'événements. */
export default function EventsLoading() {
  return <ListPageSkeleton count={6} columns={3} withImage />
}
