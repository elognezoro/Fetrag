'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { Button } from '@fetrag/ui'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/** Limite d'erreur de l'application : message clair, réessai et retour à l'accueil. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[web] erreur de rendu', error.digest ?? error.message)
  }, [error])

  return (
    <div className="container-fetrag flex flex-col items-center py-20 text-center sm:py-28">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="h-9 w-9" aria-hidden="true" />
      </div>
      <h1 className="text-3xl sm:text-4xl">Une erreur est survenue</h1>
      <p className="mt-4 max-w-lg text-neutral-600">
        Le contenu n&apos;a pas pu être affiché. Vous pouvez réessayer ; si le problème persiste, contactez le support de la FETRAG.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-neutral-400">
          Référence : <code className="rounded bg-neutral-100 px-1.5 py-0.5">{error.digest}</code>
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button type="button" variant="primary" size="md" onClick={reset} leftIcon={<RotateCcw aria-hidden="true" />}>
          Réessayer
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/">
            <Home aria-hidden="true" />
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    </div>
  )
}
