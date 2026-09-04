import type { Metadata } from 'next'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { Button } from '@fetrag/ui'
import { AuthCard } from '@/components/auth/auth-card'
import { FormAlert } from '@/components/auth/form-alert'
import { logoutAction } from '@/lib/actions/auth'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Déconnexion',
}

/** Confirmation de déconnexion (la fermeture de session passe par une Server Action, jamais par un simple GET). */
export default async function DeconnexionPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <AuthCard eyebrow="Session" title="Vous êtes déconnecté" description="Votre session est fermée. À bientôt sur la plateforme de formation.">
        <div className="space-y-3">
          <FormAlert tone="success">Aucune session active sur cet appareil.</FormAlert>
          <Button asChild variant="primary" size="lg" className="w-full">
            <Link href="/connexion">Se reconnecter</Link>
          </Button>
          <Button asChild variant="ghost" size="md" className="w-full">
            <Link href="/catalogue">Parcourir le catalogue</Link>
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      eyebrow="Session"
      title={
        <>
          Se <span className="italic text-green-700">déconnecter</span> ?
        </>
      }
      description={
        <>
          Vous êtes connecté en tant que <span className="font-semibold text-navy">{session.user.email ?? session.user.name}</span>. Votre progression est enregistrée.
        </>
      }
    >
      <form action={logoutAction} className="space-y-3">
        <Button type="submit" variant="primary" size="lg" className="w-full" leftIcon={<LogOut aria-hidden="true" />}>
          Confirmer la déconnexion
        </Button>
        <Button asChild variant="ghost" size="md" className="w-full">
          <Link href="/dashboard">Annuler et rester connecté</Link>
        </Button>
      </form>
    </AuthCard>
  )
}
