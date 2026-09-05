import { Skeleton } from '@fetrag/ui'
import { CardsSkeleton, HeaderSkeleton } from '@/components/public/skeletons'

/** Chargement de la page partenariat : en-tête, types de coopération et formulaire. */
export default function PartnershipLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag py-10">
        <CardsSkeleton count={6} columns={3} withImage={false} />
        <Skeleton className="mt-12 h-96 w-full rounded-2xl" />
      </div>
    </div>
  )
}
