import type { Metadata } from 'next'
import { KeyRound, LogIn, ShieldCheck } from 'lucide-react'
import { formatDateTime } from '@fetrag/domain'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Reveal } from '@fetrag/ui'
import { guards } from '@/lib/auth'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { MfaSetup } from '@/components/account/mfa-setup'
import { PasswordForm } from '@/components/account/password-form'
import { loadSecurityState } from '@/server/account/queries'

export const metadata: Metadata = { title: 'Sécurité' }

const auditLabels: Record<string, string> = {
  'auth.login': 'Connexion',
  'auth.password_changed': 'Mot de passe modifié',
  'auth.mfa_enabled': 'Vérification en deux étapes activée',
}

/** Sécurité du compte : MFA TOTP, mot de passe, activité récente. */
export default async function SecurityPage() {
  const principal = await guards.requireUser('/espace/securite')
  const security = await loadSecurityState(principal)

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Sécurité"
        tone="navy"
        title="Protéger mon compte"
        description="Vos données syndicales sont sensibles : activez la vérification en deux étapes et utilisez un mot de passe unique."
        actions={
          <div>
            <Badge variant={security.totpEnabled ? 'success' : 'warning'}>{security.totpEnabled ? 'Vérification en deux étapes active' : 'Vérification en deux étapes inactive'}</Badge>
          </div>
        }
      />

      <Reveal>
        <Card pillar="protection">
          <CardHeader>
            <CardTitle as="h2" className="inline-flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-600" aria-hidden="true" />
              Vérification en deux étapes
            </CardTitle>
            <CardDescription>Un code temporaire est demandé en plus du mot de passe, à chaque connexion.</CardDescription>
          </CardHeader>
          <CardContent>
            <MfaSetup enabled={security.totpEnabled} backupCodesLeft={security.backupCodesLeft} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.06}>
        <Card pillar="prevention">
          <CardHeader>
            <CardTitle as="h2" className="inline-flex items-center gap-2">
              <KeyRound className="size-5 text-green-700" aria-hidden="true" />
              Mot de passe
            </CardTitle>
            <CardDescription>
              {security.hasPassword ? 'Choisissez un mot de passe que vous n’utilisez sur aucun autre service.' : 'Votre compte est géré par un fournisseur d’identité externe : le mot de passe se modifie depuis celui-ci.'}
            </CardDescription>
          </CardHeader>
          {security.hasPassword ? (
            <CardContent>
              <PasswordForm />
            </CardContent>
          ) : null}
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card pillar="defense">
          <CardHeader>
            <CardTitle as="h2" className="inline-flex items-center gap-2">
              <LogIn className="size-5 text-gold-700" aria-hidden="true" />
              Activité récente
            </CardTitle>
            <CardDescription>Dernières connexions et changements de sécurité enregistrés dans le journal d’audit.</CardDescription>
          </CardHeader>
          <CardContent>
            {security.recentLogins.length === 0 ? (
              <p className="text-sm text-neutral-600">Aucune activité enregistrée pour le moment.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {security.recentLogins.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-navy">{auditLabels[entry.action] ?? entry.action}</span>
                    <span className="break-words text-xs text-neutral-500">
                      {formatDateTime(entry.createdAt)}
                      {entry.userAgent ? ` · ${entry.userAgent.slice(0, 60)}${entry.userAgent.length > 60 ? '…' : ''}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
