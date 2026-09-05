import { ListSkeleton } from '@/components/admin/list-skeleton'

export default function MessagesLoading() {
  return <ListSkeleton tiles={4} label="Chargement des messages" />
}
