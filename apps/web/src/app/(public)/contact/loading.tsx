import { Skeleton } from '@fetrag/ui'
import { HeaderSkeleton } from '@/components/public/skeletons'

/** Chargement de la page contact : en-tête, coordonnées, plan et formulaire. */
export default function ContactLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag grid grid-cols-1 gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Skeleton lines={4} />
          <Skeleton className="mt-8 aspect-[10/7] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[32rem] w-full rounded-2xl" />
      </div>
    </div>
  )
}
