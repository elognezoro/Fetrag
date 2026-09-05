import { ListSkeleton } from '@/components/admin/list-skeleton'

export default function OrganizationsLoading() {
  return <ListSkeleton tiles={3} label="Chargement des organisations" />
}
