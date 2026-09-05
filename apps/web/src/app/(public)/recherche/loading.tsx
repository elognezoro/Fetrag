import { Skeleton } from '@fetrag/ui'
import { HeaderSkeleton } from '@/components/public/skeletons'

/** Chargement de la recherche : en-tête avec barre de recherche et liste de résultats. */
export default function SearchLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Recherche en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag flex flex-col gap-4 py-10">
        <Skeleton className="h-6 w-48 rounded-full" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
