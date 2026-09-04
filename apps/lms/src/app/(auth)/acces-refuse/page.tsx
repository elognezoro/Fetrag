import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, LayoutDashboard, Mail, ShieldAlert } from 'lucide-react'
import { Button } from '@fetrag/ui'
import { AuthCard } from '@/components/auth/auth-card'
import { auth } from '@/lib/auth'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Accès refusé',
}

/** Page 403 : le compte est connecté mais ne dispose pas du rôle ou de la portée requis. */
export default async function AccesRefusePage() {
  const session = await auth()
  const email = session?.user?.email ?? null

  return (
    <AuthCard
      eyebrow="Accès restreint"
      title={
        <>
          Accès <span className="italic text-gold-700">refusé</span>
        </>
      }
      description="Cet espace est réservé à un rôle (formateur, responsable d'organisation, coordination, administration) ou à une organisation précise."
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-neutral-800">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
          <p>
            {email ? (
              <>
                Vous êtes connecté en tant que <span className="font-semibold">{email}</span>. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, demandez l&apos;attribution du rôle
                nécessaire à la coordination formation de la FETRAG.
              </>
            ) : (
              <>Connectez-vous avec un compte disposant des droits nécessaires.</>
            )}
          </p>
        </div>
        <div className="grid gap-2">
          {email ? (
            <Button asChild variant="primary" size="lg">
              <Link href="/dashboard">
                <LayoutDashboard aria-hidden="true" />
                Retour au tableau de bord
              </Link>
            </Button>
          ) : (
            <Button asChild variant="primary" size="lg">
              <Link href="/connexion">Se connecter</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="md">
            <Link href="/catalogue">
              <BookOpen aria-hidden="true" />
              Parcourir le catalogue
            </Link>
          </Button>
          <Button asChild variant="ghost" size="md">
            <a href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent('Demande de droits d’accès - plateforme de formation')}`}>
              <Mail aria-hidden="true" />
              Contacter la coordination
            </a>
          </Button>
          {email ? (
            <Link href="/deconnexion" className="text-center text-sm font-semibold text-blue-600 hover:underline">
              Changer de compte
            </Link>
          ) : null}
        </div>
      </div>
    </AuthCard>
  )
}
