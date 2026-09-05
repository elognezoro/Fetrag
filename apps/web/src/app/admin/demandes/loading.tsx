import { ListSkeleton } from '@/components/admin/list-skeleton'

export default function RequestsLoading() {
  return <ListSkeleton tiles={4} label="Chargement des demandes" />
}
