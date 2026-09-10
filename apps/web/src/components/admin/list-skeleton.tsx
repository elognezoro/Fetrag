import { Skeleton } from '@fetrag/ui'

export interface ListSkeletonProps {
  /** Nombre de tuiles d'indicateurs affichées au-dessus de la liste. */
  tiles?: number
  rows?: number
  label?: string
}

/** Squelette de chargement d'une page de liste du back-office (en-tête, filtres, tableau). */
export function ListSkeleton({ tiles = 0, rows = 6, label = 'Chargement de la section' }: ListSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">{label}</span>
      <div>
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="mt-4 h-9 w-2/3 max-w-md" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      </div>
      {tiles > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: tiles }, (_, index) => (
            <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
              <Skeleton className="size-11 rounded-full" circle />
              <Skeleton className="mt-4 h-9 w-16" />
              <Skeleton className="mt-2 h-4 w-24" />
            </div>
          ))}
        </div>
      ) : null}
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex flex-col divide-y divide-neutral-100 px-4">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Squelette d'un éditeur (formulaire + panneau latéral). */
export function EditorSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Chargement de l’éditeur</span>
      <div>
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="mt-4 h-9 w-2/3 max-w-md" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-6 h-11 w-full" />
          <Skeleton className="mt-4 h-24 w-full" />
          <Skeleton className="mt-4 h-72 w-full" />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-6" lines={5} />
        </div>
      </div>
    </div>
  )
}
