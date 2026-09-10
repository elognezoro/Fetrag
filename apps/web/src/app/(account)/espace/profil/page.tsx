import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ShieldCheck } from 'lucide-react'
import { formatDate } from '@fetrag/domain'
import { Avatar, AvatarFallback, AvatarImage, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Reveal, initials } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ConsentsForm, NotificationPreferencesForm } from '@/components/account/consents-form'
import { ProfileForm } from '@/components/account/profile-form'
import { loadProfile, preferenceCategories } from '@/server/account/queries'

export const metadata: Metadata = { title: 'Mon profil' }

const newsletterLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  confirmed: { label: 'Abonné à la lettre d’information', variant: 'success' },
  pending: { label: 'Abonnement en attente de confirmation', variant: 'warning' },
  unsubscribed: { label: 'Désinscrit de la lettre d’information', variant: 'neutral' },
  none: { label: 'Non abonné à la lettre d’information', variant: 'neutral' },
}

/** Profil : identité, coordonnées, consentements et préférences de notification. */
export default async function ProfilePage() {
  const principal = await guards.requireUser('/espace/profil')
  const profile = await loadProfile(principal)
  const user = profile.user
  if (!user) return null
  const fullName = user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  const newsletter = newsletterLabels[profile.newsletterState] ?? newsletterLabels.none

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading eyebrow="Profil" title="Mes informations" description="Vos coordonnées servent aux convocations, aux attestations et au suivi de vos demandes. Gardez-les à jour." />

      <Reveal>
        <Card className="overflow-hidden">
          <div aria-hidden="true" className="tricolor-band h-1 w-full" />
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <Avatar size="xl" ring>
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback className="bg-blue-500 font-display text-white">{initials(fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-semibold text-navy">{fullName}</p>
              <p className="inline-flex items-center gap-1.5 text-sm text-neutral-600">
                <Mail className="size-4" aria-hidden="true" />
                {user.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">Membre depuis {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</Badge>
                <Badge variant={newsletter?.variant ?? 'neutral'}>{newsletter?.label}</Badge>
              </div>
            </div>
            <Link href="/espace/securite" className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Sécurité du compte
            </Link>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal>
        <Card pillar="protection">
          <CardHeader>
            <CardTitle as="h2">Identité et coordonnées</CardTitle>
            <CardDescription>Ces informations figurent sur vos attestations de formation et vos reçus.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={{ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, jobTitle: user.jobTitle, employer: user.employer, locale: user.locale }} />
          </CardContent>
        </Card>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal>
          <Card pillar="prevention" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Consentements</CardTitle>
              <CardDescription>Choisissez les communications que vous souhaitez recevoir de la FETRAG.</CardDescription>
            </CardHeader>
            <CardContent>
              <ConsentsForm consents={profile.consents} />
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card pillar="defense" className="h-full">
            <CardHeader>
              <CardTitle as="h2">Notifications par email</CardTitle>
              <CardDescription>Les notifications restent visibles dans votre espace ; réglez ici les envois par email.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm categories={preferenceCategories} preferences={profile.emailPreferences} />
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
