import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@fetrag/ui'
import { AuthCard } from '@/components/auth/auth-card'
import { FormAlert } from '@/components/auth/form-alert'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Nouveau mot de passe',
}

interface ReinitialiserPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Page atteinte depuis le lien de réinitialisation (jeton à usage unique, valable 30 minutes). */
export default async function ReinitialiserMotDePassePage({ searchParams }: ReinitialiserPageProps) {
  const params = await searchParams
  const token = single(params.token)?.trim() ?? ''
  const hasToken = token.length >= 16 && token.length <= 200

  if (!hasToken) {
    return (
      <AuthCard
        eyebrow="Assistance"
        title={
          <>
            Lien <span className="italic text-gold-700">invalide</span>
          </>
        }
        description="Ce lien de réinitialisation est incomplet ou a expiré. Demandez un nouveau lien depuis la page « Mot de passe oublié »."
      >
        <div className="space-y-5">
          <FormAlert tone="danger">Aucun jeton de réinitialisation valide n&apos;accompagne ce lien.</FormAlert>
          <Button asChild variant="primary" size="lg" className="w-full">
            <Link href="/mot-de-passe-oublie">Demander un nouveau lien</Link>
          </Button>
          <p className="text-center text-sm text-neutral-600">
            <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      eyebrow="Sécurité"
      title={
        <>
          Nouveau <span className="italic text-blue-600">mot de passe</span>
        </>
      }
      description="Choisissez un nouveau mot de passe pour votre compte FETRAG. Il servira sur le site institutionnel et sur la plateforme de formation."
      footer="Ce lien est à usage unique et valable 30 minutes après son envoi."
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  )
}
