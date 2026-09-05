import { PageSkeleton } from '@/components/learner/loading-skeletons'

/** Chargement de la liste des inscriptions. */
export default function Loading() {
  return <PageSkeleton count={6} />
}
