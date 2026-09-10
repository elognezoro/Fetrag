import { Skeleton } from '@fetrag/ui'
import { HeaderSkeleton } from '@/components/public/skeletons'

/** Chargement de la vérification de certificat : en-tête et bloc de résultat. */
export default function VerifyLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Vérification en cours</span>
      <HeaderSkeleton />
      <div className="container-fetrag grid grid-cols-1 gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  )
}
