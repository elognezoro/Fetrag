import { ListSkeleton } from '@/components/admin/list-skeleton'

export default function UsersLoading() {
  return <ListSkeleton tiles={4} label="Chargement des utilisateurs" />
}
