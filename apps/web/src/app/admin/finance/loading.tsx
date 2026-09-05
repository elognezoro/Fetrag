import { ListSkeleton } from '@/components/admin/list-skeleton'

export default function FinanceLoading() {
  return <ListSkeleton tiles={4} label="Chargement de la finance" />
}
