import { ListSkeleton } from '@/components/admin/list-skeleton'

export default function ReportsLoading() {
  return <ListSkeleton tiles={4} rows={4} label="Chargement des rapports" />
}
