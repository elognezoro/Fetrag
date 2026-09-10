import { Skeleton } from '@fetrag/ui'

/** Squelette de chargement générique (en-tête, indicateurs, liste de cartes). */
export default function Loading() {
  return (
    <div className="container-fetrag py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <Skeleton className="h-4 w-28 rounded-full" />
      <Skeleton className="mt-4 h-9 w-2/3 max-w-lg" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
            <Skeleton circle className="h-14 w-14 shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="mt-4 h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-4 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
