import { Skeleton } from '@fetrag/ui'

/** Squelette de chargement des pages de l'espace personnel. */
export default function AccountLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement de votre espace</span>
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="mt-4 h-9 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
            <Skeleton className="size-11 rounded-full" circle />
            <Skeleton className="mt-4 h-9 w-16" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4" lines={4} />
          </div>
        ))}
      </div>
    </div>
  )
}
