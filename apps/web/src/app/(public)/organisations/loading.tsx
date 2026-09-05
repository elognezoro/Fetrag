import { ListPageSkeleton } from '@/components/public/skeletons'

/** Chargement de l'annuaire des organisations : en-tête, filtres et grille de sceaux. */
export default function OrganizationsLoading() {
  return <ListPageSkeleton count={8} columns={4} withImage={false} />
}
