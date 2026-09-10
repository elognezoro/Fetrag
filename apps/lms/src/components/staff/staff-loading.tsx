import { Skeleton } from '@fetrag/ui'

/** Squelette de chargement d'une page d'espace institutionnel (en-tête, indicateurs, tableau). */
export function StaffLoading({ tiles = 4, rows = 6 }: { tiles?: number; rows?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="mt-4 h-9 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-4 w-full max-w-lg" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: tiles }, (_, index) => (
          <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
            <Skeleton circle className="h-11 w-11" />
            <Skeleton className="mt-4 h-9 w-1/2" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-neutral-100 py-3 last:border-0">
            <Skeleton circle className="h-9 w-9 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="hidden h-4 w-16 sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
