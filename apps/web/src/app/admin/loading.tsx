import { ListSkeleton } from '@/components/admin/list-skeleton'

/** Squelette générique du back-office (les sections disposent de leur propre squelette). */
export default function AdminLoading() {
  return <ListSkeleton tiles={4} rows={5} label="Chargement de l’administration" />
}
