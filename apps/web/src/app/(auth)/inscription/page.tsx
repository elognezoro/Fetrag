import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { features, getEnvSafe } from '@fetrag/config'
import { Button } from '@fetrag/ui'
import { AuthCard } from '@/components/auth/auth-card'
import { FormAlert } from '@/components/auth/form-alert'
import { RegisterForm } from '@/components/auth/register-form'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Créez votre compte FETRAG pour accéder aux services, aux ressources et à la plateforme de formation.',
}

/** Page d'inscription (mode local). Avec un IdP OIDC seul, renvoie vers la connexion. */
export default async function InscriptionPage() {
  const session = await auth()
  if (session?.user?.id) redirect('/espace')

  const localAuth = features.localAuth()
  const oidcName = features.oidc() ? (getEnvSafe().OIDC_DISPLAY_NAME ?? 'Compte FETRAG') : null

  return (
    <AuthCard
      wide
      eyebrow="Inscription"
      title={
        <>
          Rejoignez l&apos;espace <span className="italic text-green-700">FETRAG</span>
        </>
      }
      description="Un compte unique pour le site institutionnel et la plateforme de formation : demandes de services, ressources réservées, inscriptions aux formations et aux événements."
      footer={
        <>
          Vous représentez une organisation affiliée ? Créez votre compte puis contactez la coordination pour être rattaché à votre organisation.
        </>
      }
    >
      {localAuth ? (
        <RegisterForm />
      ) : (
        <div className="space-y-5">
          <FormAlert tone="info">
            La création de compte par mot de passe est désactivée. {oidcName ? `Connectez-vous avec ${oidcName} : votre compte sera créé automatiquement.` : 'Contactez le support de la FETRAG pour obtenir un accès.'}
          </FormAlert>
          <Button asChild variant="primary" size="lg" className="w-full">
            <Link href="/connexion">Aller à la connexion</Link>
          </Button>
        </div>
      )}
    </AuthCard>
  )
}
