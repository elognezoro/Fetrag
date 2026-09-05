import { Skeleton } from '@fetrag/ui'

/** Chargement d'une évaluation : en-tête et carte de démarrage. */
export default function Loading() {
  return (
    <div className="container-fetrag py-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement de l&apos;évaluation</span>
      <Skeleton className="h-4 w-64 rounded-full" />
      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="mt-4 h-9 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-4 h-4 w-2/3" />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <Skeleton lines={4} />
          <Skeleton className="mt-6 h-12 w-48 rounded-full" />
        </div>
      </div>
    </div>
  )
}
