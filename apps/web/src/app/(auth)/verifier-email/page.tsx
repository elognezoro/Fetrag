import type { Metadata } from 'next'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { Button } from '@fetrag/ui'
import { AuthCard } from '@/components/auth/auth-card'
import { FormAlert } from '@/components/auth/form-alert'
import { ResendVerificationForm } from '@/components/auth/resend-verification-form'
import { confirmEmailWithToken, type EmailConfirmationResult } from '@/lib/actions/auth-support'

export const metadata: Metadata = {
  title: 'Confirmation de votre adresse email',
}

/** Le jeton est consommé à l'affichage : la page ne doit jamais être mise en cache. */
export const dynamic = 'force-dynamic'

interface VerifierEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

async function confirm(token: string | undefined): Promise<EmailConfirmationResult> {
  const raw = token?.trim() ?? ''
  if (raw.length < 16 || raw.length > 200) return { status: 'invalid' }
  try {
    return await confirmEmailWithToken(raw)
  } catch (error) {
    console.error('[auth] confirmation d’adresse impossible', error instanceof Error ? error.message : error)
    return { status: 'invalid' }
  }
}

/** Page publique atteinte depuis le lien reçu par email : confirme l'adresse (usage unique, 24 h). */
export default async function VerifierEmailPage({ searchParams }: VerifierEmailPageProps) {
  const params = await searchParams
  const result = await confirm(single(params.token))

  if (result.status === 'verified' || result.status === 'already_verified') {
    const verified = result.status === 'verified'
    return (
      <AuthCard
        eyebrow="Compte activé"
        title={
          <>
            Adresse <span className="italic text-green-700">confirmée</span>
          </>
        }
        description={
          verified
            ? `${result.firstName ? `${result.firstName}, votre` : 'Votre'} compte FETRAG est maintenant actif. Un email de bienvenue vient de vous être envoyé.`
            : 'Cette adresse email a déjà été confirmée : votre compte est actif.'
        }
        footer="Une seule identité pour fetrag.ga et la plateforme de formation."
      >
        <div className="space-y-4">
          <FormAlert tone="success">
            {verified ? 'Merci, votre adresse email est confirmée.' : 'Aucune action supplémentaire n’est nécessaire.'}
          </FormAlert>
          <Button asChild variant="primary" size="lg" className="w-full">
            <Link href="/connexion?verifie=1">
              <LogIn aria-hidden="true" />
              Se connecter
            </Link>
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      eyebrow="Confirmation"
      title={
        <>
          Lien <span className="italic text-gold-700">invalide</span> ou expiré
        </>
      }
      description="Le lien de confirmation a déjà été utilisé, a expiré (24 heures) ou est incomplet. Indiquez votre adresse pour en recevoir un nouveau."
      footer="Si vous avez déjà confirmé votre adresse, connectez-vous directement."
    >
      <div className="space-y-5">
        <FormAlert tone="danger">Ce lien de confirmation ne peut pas être utilisé.</FormAlert>
        <ResendVerificationForm editable label="Recevoir un nouveau lien" idPrefix="verify-resend" variant="primary" />
        <p className="text-center text-sm text-neutral-600">
          <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
