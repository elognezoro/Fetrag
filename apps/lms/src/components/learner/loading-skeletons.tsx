import { Skeleton, cn } from '@fetrag/ui'

interface SkeletonProps {
  className?: string
}

/** Squelette d'en-tête de page (ruban, titre, accroche). */
export function HeaderSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('border-b border-neutral-200 bg-white py-10 sm:py-14', className)} aria-hidden="true">
      <div className="container-fetrag">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="mt-5 h-10 w-3/4 max-w-xl" />
        <Skeleton className="mt-4 h-5 w-full max-w-lg" />
      </div>
    </div>
  )
}

/** Grille de cartes (catalogue, formations, certificats). */
export function GridSkeleton({ count = 6, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <div className="flex gap-5">
            <Skeleton className="h-12 w-10" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="mt-3 h-6 w-4/5" />
              <Skeleton lines={3} className="mt-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Page standard : en-tête + grille. */
export function PageSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag py-10">
        <GridSkeleton count={count} />
      </div>
    </div>
  )
}

/** Page de détail : en-tête + deux colonnes. */
export function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag grid grid-cols-1 gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <Skeleton lines={5} />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton lines={4} />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <Skeleton circle className="mx-auto size-24" />
          <Skeleton className="mt-6 h-11 w-full rounded-full" />
          <Skeleton lines={3} className="mt-6" />
        </div>
      </div>
    </div>
  )
}

/** Lecteur pédagogique : barre latérale + zone de contenu. */
export function ReaderSkeleton() {
  return (
    <div className="container-fetrag py-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement de la leçon</span>
      <Skeleton className="h-4 w-48 rounded-full" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft lg:block">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-3 h-2 w-full rounded-full" />
          <div className="mt-6 flex flex-col gap-3">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className={cn('h-9', index % 3 === 0 ? 'w-full' : 'ml-4 w-[calc(100%-1rem)]')} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="mt-4 h-9 w-2/3" />
          <Skeleton className="mt-6 h-64 w-full rounded-xl" />
          <Skeleton lines={6} className="mt-6" />
        </div>
      </div>
    </div>
  )
}

/** Liste (devoirs, forums, calendrier). */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag flex flex-col gap-3 py-10">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
            <Skeleton circle className="size-11 shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
