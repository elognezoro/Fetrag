import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
}

/** Demande de réinitialisation transmise au support (aucun lien automatique n'est envoyé). */
export default function MotDePasseOubliePage() {
  return (
    <AuthCard
      eyebrow="Assistance"
      title={
        <>
          Mot de passe <span className="italic text-blue-600">oublié</span>
        </>
      }
      description="Indiquez l'adresse email de votre compte : le support de la FETRAG vérifiera votre identité puis vous accompagnera pour définir un nouveau mot de passe."
      footer="Pour des raisons de sécurité, aucun lien de réinitialisation n'est envoyé automatiquement."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
