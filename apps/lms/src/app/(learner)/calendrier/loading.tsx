import { Skeleton } from '@fetrag/ui'
import { HeaderSkeleton } from '@/components/learner/loading-skeletons'

/** Chargement du calendrier : grille mensuelle et liste latérale. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement du calendrier</span>
      <HeaderSkeleton />
      <div className="container-fetrag grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton circle className="size-11" />
            <Skeleton className="h-8 w-44" />
            <Skeleton circle className="size-11" />
          </div>
          <Skeleton className="mt-4 h-[28rem] w-full rounded-2xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
