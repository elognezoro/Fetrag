import { Skeleton, cn } from '@fetrag/ui'

interface HeaderSkeletonProps {
  dark?: boolean
}

/** Squelette d'un en-tête de page (fil d'Ariane, ruban, titre, accroche). */
export function HeaderSkeleton({ dark = false }: HeaderSkeletonProps) {
  return (
    <div className={cn('border-b py-10 sm:py-14', dark ? 'border-transparent bg-navy-gradient' : 'border-neutral-200 bg-white')}>
      <div className="container-fetrag">
        <Skeleton className={cn('h-4 w-40 rounded-full', dark && 'opacity-30')} />
        <Skeleton className={cn('mt-6 h-6 w-32 rounded-full', dark && 'opacity-30')} />
        <Skeleton className={cn('mt-4 h-11 w-3/4 max-w-2xl', dark && 'opacity-30')} />
        <Skeleton className={cn('mt-4 h-5 w-full max-w-xl', dark && 'opacity-30')} />
        <Skeleton className={cn('mt-2 h-5 w-2/3 max-w-lg', dark && 'opacity-30')} />
      </div>
    </div>
  )
}

interface CardsSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
  withImage?: boolean
}

/** Grille de cartes en attente de chargement. */
export function CardsSkeleton({ count = 6, columns = 3, withImage = true }: CardsSkeletonProps) {
  const cols = columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <div className={cn('grid gap-5', cols)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft">
          {withImage ? <Skeleton className="h-36 w-full rounded-xl" /> : <Skeleton className="size-12 rounded-full" />}
          <Skeleton className="mt-4 h-5 w-4/5" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/5" />
        </div>
      ))}
    </div>
  )
}

/** Squelette d'une page de liste : en-tête, barre de filtres et grille. */
export function ListPageSkeleton({ count = 6, columns = 3, withImage = true }: CardsSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag py-10">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="mt-8">
          <CardsSkeleton count={count} columns={columns} withImage={withImage} />
        </div>
      </div>
    </div>
  )
}

/** Squelette d'une page de détail : en-tête, colonne de lecture et encart latéral. */
export function DetailPageSkeleton({ dark = false }: HeaderSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours</span>
      <HeaderSkeleton dark={dark} />
      <div className="container-fetrag grid grid-cols-1 gap-10 py-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="mt-8" lines={6} />
          <Skeleton className="mt-6" lines={4} />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="mt-4" lines={3} />
          <Skeleton className="mt-6 h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
