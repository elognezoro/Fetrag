import { ListSkeleton } from '@/components/learner/loading-skeletons'

/** Chargement de la liste des devoirs. */
export default function Loading() {
  return <ListSkeleton rows={5} />
}
