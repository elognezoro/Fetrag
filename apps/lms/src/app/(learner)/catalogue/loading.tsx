import { PageSkeleton } from '@/components/learner/loading-skeletons'

/** Chargement du catalogue. */
export default function Loading() {
  return <PageSkeleton count={6} />
}
