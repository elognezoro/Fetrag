import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { features, getEnvSafe } from '@fetrag/config'
import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'
import { auth } from '@/lib/auth'
import { authQueryErrorMessage, safeCallbackUrl } from '@/lib/actions/auth-types'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Accédez à votre espace personnel FETRAG : demandes, inscriptions, paiements et notifications.',
}

interface ConnexionPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Page de connexion (entrée SSO du site institutionnel). */
export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(single(params.callbackUrl), '/espace')

  const session = await auth()
  if (session?.user?.id) redirect(callbackUrl)

  const env = getEnvSafe()
  const oidcName = features.oidc() ? (env.OIDC_DISPLAY_NAME ?? 'Compte FETRAG') : null
  const localAuth = features.localAuth()
  const initialError = authQueryErrorMessage(single(params.error), single(params.code))
  const notice =
    single(params.inscrit) === '1'
      ? 'Votre compte a été créé. Connectez-vous pour accéder à votre espace.'
      : single(params.deconnecte) === '1'
        ? 'Vous avez été déconnecté.'
        : null

  return (
    <AuthCard
      eyebrow="Espace personnel"
      title={
        <>
          Bienvenue à la <span className="italic text-blue-600">FETRAG</span>
        </>
      }
      description="Connectez-vous pour suivre vos demandes, vos inscriptions et vos formations."
      footer={
        <>
          Une seule identité pour fetrag.ga et la plateforme de formation. Besoin d&apos;aide ? Écrivez au support de la FETRAG.
        </>
      }
    >
      <LoginForm callbackUrl={callbackUrl} oidcName={oidcName} localAuth={localAuth} initialError={initialError} notice={notice} />
    </AuthCard>
  )
}
