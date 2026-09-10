import { Skeleton } from '@fetrag/ui'

/** Squelette du parcours de paiement. */
export default function PaymentLoading() {
  return (
    <div className="mx-auto max-w-5xl" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement de la commande</span>
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="mt-4 h-10 w-2/3 max-w-lg" />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft lg:col-span-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-5" lines={5} />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft lg:col-span-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-5" lines={4} />
        </div>
      </div>
    </div>
  )
}
