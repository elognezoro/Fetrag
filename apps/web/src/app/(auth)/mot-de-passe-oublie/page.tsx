import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
}

/** Demande d'un lien de réinitialisation envoyé par email (valable 30 minutes, réponse neutre). */
export default function MotDePasseOubliePage() {
  return (
    <AuthCard
      eyebrow="Assistance"
      title={
        <>
          Mot de passe <span className="italic text-blue-600">oublié</span>
        </>
      }
      description="Indiquez l'adresse email de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe."
      footer="Le lien est valable 30 minutes et ne peut être utilisé qu'une seule fois. Si vous ne recevez rien, vérifiez votre dossier de courrier indésirable."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
