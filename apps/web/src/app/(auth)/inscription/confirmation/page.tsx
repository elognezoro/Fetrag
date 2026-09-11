import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock, Inbox, ShieldAlert } from 'lucide-react'
import { emailSchema } from '@fetrag/contracts'
import { AuthCard } from '@/components/auth/auth-card'
import { FormAlert } from '@/components/auth/form-alert'
import { ResendVerificationForm } from '@/components/auth/resend-verification-form'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Vérifiez votre boîte mail',
}

interface ConfirmationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

const tips = [
  { icon: Inbox, text: 'Vérifiez le dossier « Courrier indésirable » ou « Spam » de votre messagerie.' },
  { icon: Clock, text: 'La réception peut prendre quelques minutes ; le lien reste valable 24 heures.' },
  { icon: ShieldAlert, text: 'Ajoutez l’expéditeur à vos contacts pour recevoir les prochains messages de la FETRAG.' },
]

/** Étape après l'inscription : l'adresse doit être confirmée par le lien reçu avant toute connexion. */
export default async function InscriptionConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const session = await auth()
  if (session?.user?.id) redirect('/espace')

  const params = await searchParams
  const parsedEmail = emailSchema.safeParse(single(params.email) ?? '')
  const email = parsedEmail.success ? parsedEmail.data : null

  return (
    <AuthCard
      eyebrow="Inscription"
      title={
        <>
          Vérifiez votre <span className="italic text-green-700">boîte mail</span>
        </>
      }
      description={
        email ? (
          <>
            Un lien de confirmation vient d&apos;être envoyé à <span className="font-semibold text-navy">{email}</span>. Ouvrez-le pour activer votre compte.
          </>
        ) : (
          <>Un lien de confirmation vient d&apos;être envoyé à l&apos;adresse indiquée lors de votre inscription. Ouvrez-le pour activer votre compte.</>
        )
      }
      footer="Une seule identité pour fetrag.ga et la plateforme de formation. Votre compte restera inactif tant que l'adresse n'est pas confirmée."
    >
      <div className="space-y-6">
        <FormAlert tone="info">Sans confirmation, la connexion à votre espace n&apos;est pas possible.</FormAlert>

        <ul className="space-y-3">
          {tips.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-neutral-700">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="pt-2">{text}</p>
            </li>
          ))}
        </ul>

        <div className="space-y-3 border-t border-neutral-200 pt-5">
          <p className="text-sm text-neutral-600">Vous n&apos;avez rien reçu ?</p>
          {email ? (
            <ResendVerificationForm email={email} label="Renvoyer le lien" idPrefix="confirmation-resend" />
          ) : (
            <ResendVerificationForm editable label="Recevoir un nouveau lien" idPrefix="confirmation-resend" />
          )}
        </div>

        <p className="text-center text-sm text-neutral-600">
          <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
