import { ListSkeleton } from '@/components/admin/list-skeleton'

export default function AuditLoading() {
  return <ListSkeleton tiles={3} rows={8} label="Chargement du journal d’audit" />
}
