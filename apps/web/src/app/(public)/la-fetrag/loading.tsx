import { Skeleton } from '@fetrag/ui'
import { CardsSkeleton, HeaderSkeleton } from '@/components/public/skeletons'

/** Chargement de la page institutionnelle : hero, chiffres clés et sections en cartes. */
export default function InstitutionLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="mt-12">
          <CardsSkeleton count={3} columns={3} withImage={false} />
        </div>
      </div>
    </div>
  )
}
