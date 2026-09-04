import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { features, getEnvSafe } from '@fetrag/config'
import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'
import { auth } from '@/lib/auth'
import { authQueryErrorMessage, safeCallbackUrl } from '@/lib/actions/auth-types'
import { webHref } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Accédez à vos formations, vos évaluations et vos certificats sur la plateforme de formation de la FETRAG.',
}

interface ConnexionPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Page de connexion de la plateforme (SSO partagé avec fetrag.ga). */
export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(single(params.callbackUrl), '/dashboard')

  const session = await auth()
  if (session?.user?.id) redirect(callbackUrl)

  const env = getEnvSafe()
  const oidcName = features.oidc() ? (env.OIDC_DISPLAY_NAME ?? 'Compte FETRAG') : null
  const localAuth = features.localAuth()
  const initialError = authQueryErrorMessage(single(params.error), single(params.code))
  const notice = single(params.deconnecte) === '1' ? 'Vous avez été déconnecté.' : null

  return (
    <AuthCard
      eyebrow="Plateforme de formation"
      title={
        <>
          Reprenez votre <span className="italic text-green-700">parcours</span>
        </>
      }
      description="Connectez-vous avec votre compte FETRAG pour accéder à vos formations, vos évaluations et vos certificats."
      footer="Le même compte fonctionne sur fetrag.ga et sur la plateforme de formation."
    >
      <LoginForm
        callbackUrl={callbackUrl}
        oidcName={oidcName}
        localAuth={localAuth}
        initialError={initialError}
        notice={notice}
        registerHref={webHref('/inscription')}
        forgotHref={webHref('/mot-de-passe-oublie')}
      />
    </AuthCard>
  )
}
