import { PageSkeleton } from '@/components/learner/loading-skeletons'

/** Chargement de la liste des certificats. */
export default function Loading() {
  return <PageSkeleton count={3} />
}
