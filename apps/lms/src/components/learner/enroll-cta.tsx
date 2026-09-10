'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArrowRight, Building2, Clock, CreditCard, LogIn, Play, Send } from 'lucide-react'
import { Alert, AlertDescription, Button, FormMessage, ProgressArc, toast } from '@fetrag/ui'
import { checkoutAction, enrollAction } from '@/server/learner/enrollment-actions'

export interface EnrollCtaProps {
  courseId: string
  slug: string
  policy: 'SELF' | 'APPROVAL' | 'ORGANIZATION' | 'PAID'
  isFree: boolean
  priceLabel: string
  offerId: string | null
  authenticated: boolean
  enrollment: { status: string; progressPercent: number } | null
  resumeHref: string | null
  /** Clé d'idempotence générée côté serveur pour la commande. */
  idempotencyKey: string
  webRegisterHref: string
  requestHref: string
}

/** Bouton d'action contextuel de la fiche de cours : commencer, demander, réserver, payer ou reprendre. */
export function EnrollCta(props: EnrollCtaProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (props.enrollment && props.enrollment.status !== 'PENDING') {
    const done = props.enrollment.status === 'COMPLETED'
    return (
      <div className="flex flex-wrap items-center gap-5">
        <ProgressArc value={props.enrollment.progressPercent} size={96} label={done ? 'Terminée' : 'Progression'} />
        <div className="flex min-w-[15rem] flex-1 flex-col gap-2">
          <Button asChild variant={done ? 'secondary' : 'accent'} size="lg" className="w-full">
            <Link href={props.resumeHref ?? `/apprendre/${props.courseId}`}>
              <Play aria-hidden="true" />
              {done ? 'Revoir la formation' : 'Reprendre'}
            </Link>
          </Button>
          {done ? (
            <Button asChild variant="link" size="sm">
              <Link href="/certificats">
                Mes certificats
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  if (props.enrollment?.status === 'PENDING') {
    return (
      <Alert variant="info" icon={Clock}>
        <AlertDescription>Votre demande d’inscription est en attente de validation par la coordination. Vous serez notifié dès qu’elle sera acceptée.</AlertDescription>
      </Alert>
    )
  }

  if (!props.authenticated) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
            <Link href={`/connexion?callbackUrl=${encodeURIComponent(`/cours/${props.slug}`)}`}>
              <LogIn aria-hidden="true" />
              Se connecter pour s’inscrire
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href={props.webRegisterHref}>Créer un compte</a>
          </Button>
        </div>
        <p className="text-sm text-neutral-600">Un seul compte FETRAG donne accès au site institutionnel et à la plateforme de formation.</p>
      </div>
    )
  }

  if (props.policy === 'ORGANIZATION') {
    return (
      <div className="flex flex-col gap-3">
        <Button asChild variant="gold" size="lg">
          <Link href={props.requestHref}>
            <Building2 aria-hidden="true" />
            Réservé aux organisations
          </Link>
        </Button>
        <p className="text-sm text-neutral-600">Ce module est dispensé en cohorte à la demande d’une organisation affiliée. Le responsable de votre organisation peut déposer une demande de formation.</p>
      </div>
    )
  }

  function enroll() {
    setError(null)
    startTransition(async () => {
      const result = await enrollAction({ courseId: props.courseId, slug: props.slug })
      if (!result.ok) {
        setError(result.error)
        return
      }
      if (result.data.href) {
        toast.success('Inscription confirmée. Bonne formation.')
        router.push(result.data.href)
        return
      }
      setNotice('Votre demande d’inscription a été transmise à la coordination.')
      toast.success('Demande envoyée')
      router.refresh()
    })
  }

  function checkout() {
    if (!props.offerId) {
      setError('Aucune offre tarifaire active pour ce module. Contactez la coordination.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await checkoutAction({ offerId: props.offerId as string, slug: props.slug, idempotencyKey: props.idempotencyKey })
      if (result && !result.ok) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {props.policy === 'PAID' && !props.isFree ? (
        <Button type="button" variant="gold" size="lg" loading={pending} onClick={checkout} leftIcon={<CreditCard aria-hidden="true" />}>
          S’inscrire - {props.priceLabel}
        </Button>
      ) : props.policy === 'APPROVAL' ? (
        <Button type="button" variant="primary" size="lg" loading={pending} onClick={enroll} leftIcon={<Send aria-hidden="true" />}>
          Demander l’inscription
        </Button>
      ) : (
        <Button type="button" variant="accent" size="lg" loading={pending} onClick={enroll} leftIcon={<Play aria-hidden="true" />}>
          Commencer
        </Button>
      )}
      {props.policy === 'PAID' && !props.isFree ? (
        <p className="text-sm text-neutral-600">Paiement sécurisé par Mobile Money ou carte sur fetrag.ga. L’accès s’ouvre dès la confirmation du règlement.</p>
      ) : null}
      {notice ? (
        <Alert variant="success">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <FormMessage>{error}</FormMessage>
    </div>
  )
}
