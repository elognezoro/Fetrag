import { PageSkeleton } from '@/components/learner/loading-skeletons'

/** Chargement de l'accueil formation. */
export default function Loading() {
  return <PageSkeleton count={6} />
}
