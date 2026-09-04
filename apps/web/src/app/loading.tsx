import { Skeleton } from '@fetrag/ui'

/** Squelette de chargement générique (en-tête de page + grille de cartes). */
export default function Loading() {
  return (
    <div className="container-fetrag py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <Skeleton className="h-4 w-32 rounded-full" />
      <Skeleton className="mt-4 h-10 w-3/4 max-w-xl" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <Skeleton className="mt-2 h-5 w-2/3 max-w-xl" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="mt-4 h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
