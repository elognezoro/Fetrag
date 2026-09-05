import { Skeleton } from '@fetrag/ui'

/** Chargement du tableau de bord : bandeau sombre, cartes « Reprendre », deux colonnes de listes. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement du tableau de bord</span>
      <div className="bg-navy-gradient py-12 sm:py-14">
        <div className="container-fetrag grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <Skeleton className="h-4 w-28 rounded-full bg-white/20" />
            <Skeleton className="mt-4 h-10 w-2/3 max-w-md bg-white/20" />
            <Skeleton className="mt-4 h-5 w-full max-w-xl bg-white/15" />
            <div className="mt-7 flex gap-3">
              <Skeleton className="h-12 w-44 rounded-full bg-white/20" />
              <Skeleton className="h-12 w-36 rounded-full bg-white/15" />
            </div>
            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-20 rounded-2xl bg-white/15" />
              ))}
            </div>
          </div>
          <Skeleton circle className="mx-auto size-48 bg-white/15 lg:mx-0" />
        </div>
      </div>
      <div className="container-fetrag flex flex-col gap-12 py-10">
        <div>
          <Skeleton className="h-8 w-48" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-52 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, column) => (
            <div key={column}>
              <Skeleton className="h-8 w-40" />
              <div className="mt-4 flex flex-col gap-2">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-16 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
