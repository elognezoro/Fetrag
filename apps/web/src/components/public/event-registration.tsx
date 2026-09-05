'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { BadgeCheck, Clock, CreditCard, LogIn, Mail, Ticket, User, UserPlus, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Badge, Button, FormField, Input, cn } from '@fetrag/ui'
import {
  cancelEventRegistrationAction,
  joinWaitingListAction,
  registerEventAction,
  type EventActionState,
} from '@/server/public/actions/events'
import { FormStatus } from './form-status'
import { HoneypotField } from './honeypot-field'
import { SubmitButton } from './submit-button'

export type ViewerRegistration = 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED' | null

interface EventRegistrationProps {
  eventId: string
  slug: string
  isPast: boolean
  isFull: boolean
  isFree: boolean
  priceLabel: string | null
  remainingSeats: number | null
  /** Visiteur connecté ou non. */
  authenticated: boolean
  viewerRegistration: ViewerRegistration
  className?: string
}

const initial: EventActionState = { status: 'idle' }

function WaitingListForm({ eventId, slug }: { eventId: string; slug: string }) {
  const [state, action] = useActionState(joinWaitingListAction, initial)
  if (state.status === 'success') return <FormStatus state={state} successTitle="Liste d'attente" withToast />
  return (
    <form action={action} noValidate className="relative flex flex-col gap-4">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="slug" value={slug} />
      <HoneypotField id="waiting-website" />
      <FormStatus state={state} withToast={false} />
      <FormField label="Nom complet" htmlFor="waiting-fullName" error={state.fieldErrors?.fullName} required>
        <Input name="fullName" autoComplete="name" leadingIcon={User} defaultValue={state.values?.fullName} maxLength={120} required />
      </FormField>
      <FormField label="Adresse email" htmlFor="waiting-email" error={state.fieldErrors?.email} required>
        <Input type="email" name="email" inputMode="email" autoComplete="email" leadingIcon={Mail} defaultValue={state.values?.email} maxLength={160} required />
      </FormField>
      <SubmitButton variant="gold" size="lg" pendingLabel="Inscription sur la liste d'attente" leftIcon={<Clock aria-hidden="true" />}>
        Rejoindre la liste d&apos;attente
      </SubmitButton>
    </form>
  )
}

/**
 * Bloc d'inscription à un événement : inscription (gratuite ou payante avec redirection vers le paiement),
 * annulation, liste d'attente lorsque l'événement est complet, invitation à se connecter sinon.
 */
export function EventRegistration({ eventId, slug, isPast, isFull, isFree, priceLabel, remainingSeats, authenticated, viewerRegistration, className }: EventRegistrationProps) {
  const [registerState, registerAction] = useActionState(registerEventAction, initial)
  const [cancelState, cancelAction] = useActionState(cancelEventRegistrationAction, initial)
  const loginHref = `/connexion?callbackUrl=${encodeURIComponent(`/evenements/${slug}`)}`

  if (isPast) {
    return (
      <Alert variant="info" className={className}>
        <AlertTitle>Inscriptions closes</AlertTitle>
        <AlertDescription>Cet événement est terminé. Retrouvez les prochains rendez-vous de la Fédération dans l&apos;agenda.</AlertDescription>
      </Alert>
    )
  }

  const registered = viewerRegistration === 'REGISTERED' || viewerRegistration === 'ATTENDED'
  const waitlisted = viewerRegistration === 'WAITLISTED'

  if (authenticated && (registered || waitlisted) && cancelState.status !== 'success') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <Alert variant={registered ? 'success' : 'warning'} icon={registered ? BadgeCheck : Clock}>
          <AlertTitle>{registered ? 'Vous êtes inscrit' : "Vous êtes sur la liste d'attente"}</AlertTitle>
          <AlertDescription>
            {registered
              ? 'Votre place est confirmée. Un rappel vous sera envoyé avant le début de l’événement.'
              : 'Nous vous préviendrons par email dès qu’une place se libère.'}
          </AlertDescription>
        </Alert>
        {viewerRegistration !== 'ATTENDED' ? (
          <form action={cancelAction} className="flex flex-col gap-3">
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="slug" value={slug} />
            <FormStatus state={cancelState} withToast={false} />
            <SubmitButton variant="outline" size="md" pendingLabel="Annulation en cours" leftIcon={<XCircle aria-hidden="true" />}>
              Annuler mon inscription
            </SubmitButton>
          </form>
        ) : null}
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {isFull ? (
          <>
            <Alert variant="warning">
              <AlertTitle>Événement complet</AlertTitle>
              <AlertDescription>Laissez vos coordonnées : nous vous préviendrons si une place se libère.</AlertDescription>
            </Alert>
            <WaitingListForm eventId={eventId} slug={slug} />
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-neutral-600">
              L&apos;inscription se fait depuis votre espace personnel FETRAG : elle est confirmée immédiatement pour les événements gratuits
              {!isFree && priceLabel ? ` et après règlement de ${priceLabel} pour celui-ci` : ''}.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="primary" size="lg">
                <Link href={loginHref}>
                  <LogIn aria-hidden="true" />
                  Se connecter pour s&apos;inscrire
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/inscription">
                  <UserPlus aria-hidden="true" />
                  Créer un compte
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <FormStatus state={cancelState} withToast={false} />
      <form action={registerAction} className="flex flex-col gap-4">
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="slug" value={slug} />
        <FormStatus state={registerState} successTitle="Inscription" withToast />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isFree ? 'green' : 'gold'}>
            <Ticket aria-hidden="true" />
            {isFree ? 'Gratuit' : (priceLabel ?? 'Payant')}
          </Badge>
          {remainingSeats !== null ? (
            <Badge variant={isFull ? 'warning' : 'neutral'}>{isFull ? 'Complet' : `${remainingSeats} place${remainingSeats > 1 ? 's' : ''} restante${remainingSeats > 1 ? 's' : ''}`}</Badge>
          ) : null}
        </div>
        {registerState.status !== 'success' ? (
          <SubmitButton
            variant={isFull ? 'gold' : 'primary'}
            size="lg"
            pendingLabel="Inscription en cours"
            leftIcon={isFull ? <Clock aria-hidden="true" /> : isFree ? <BadgeCheck aria-hidden="true" /> : <CreditCard aria-hidden="true" />}
          >
            {isFull ? "Rejoindre la liste d'attente" : isFree ? "S'inscrire gratuitement" : `S'inscrire et payer${priceLabel ? ` ${priceLabel}` : ''}`}
          </SubmitButton>
        ) : null}
      </form>
    </div>
  )
}
