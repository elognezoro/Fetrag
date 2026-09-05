import { PageSkeleton } from '@/components/learner/loading-skeletons'

/** Chargement des forums. */
export default function Loading() {
  return <PageSkeleton count={3} />
}
