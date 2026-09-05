import { Skeleton } from '@fetrag/ui'
import { HeaderSkeleton } from '@/components/public/skeletons'

/** Chargement de la FAQ : en-tête, sommaire et accordéons. */
export default function FaqLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag grid gap-10 py-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Skeleton lines={5} />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
