import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, AlertTriangle, ArrowUpRight, Award, Ban, Cog, Flag, KeyRound, ListChecks, MailWarning, RotateCcw, Timer } from 'lucide-react'
import { formatDateTime, formatRelative } from '@fetrag/domain'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, NativeSelect, Stagger, StaggerItem, StatTile, StatusBadge } from '@fetrag/ui'
import { DashboardHeading } from '@/components/account/dashboard-heading'
import { ApiKeysPanel, type ApiKeyView } from '@/components/admin/api-keys-panel'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { DataTable } from '@/components/admin/data-table'
import { QuizSettingsForm } from '@/components/admin/quiz-settings-form'
import { SettingsForm, type SettingsFormValues } from '@/components/admin/settings-form'
import { requireAdminCan } from '@/server/admin/context'
import { pageHref, readListParams, type SearchParams } from '@/server/admin/list-params'
import { loadSettings } from '@/server/admin/queries'
import { cancelJobAction, retryJobAction } from '@/server/admin/settings-jobs-actions'
import { jobTypeLabels, loadFeatureFlags, loadJobsPanel, loadQuizSettings } from '@/server/admin/settings-queries'

export const metadata: Metadata = { title: 'Paramètres' }

const BASE = '/admin/parametres'

const jobStatusOptions = [
  { value: 'QUEUED', label: 'En file d’attente' },
  { value: 'RUNNING', label: 'En cours' },
  { value: 'SUCCEEDED', label: 'Réussies' },
  { value: 'FAILED', label: 'En échec' },
  { value: 'DEAD', label: 'Abandonnées' },
]

function jobLabel(type: string): string {
  return jobTypeLabels[type] ?? type
}

/** Paramètres système (super administrateur) : coordonnées et règles, drapeaux fonctionnels, quiz, clés API, file de jobs, santé. */
export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminCan('settings.manage', BASE)
  const params = readListParams(await searchParams, ['type'], { pageSize: 10 })
  const [settings, quiz, jobs] = await Promise.all([loadSettings(), loadQuizSettings(), loadJobsPanel(params)])
  const flags = loadFeatureFlags()
  const values: SettingsFormValues = {
    address: settings.contact.address,
    email: settings.contact.email,
    supportEmail: settings.contact.supportEmail ?? null,
    phones: settings.contact.phones,
    currency: settings.currency,
    participantLimit: settings.participantLimit,
    motto: settings.motto,
    maintenance: settings.maintenance,
  }
  const apiKeys: ApiKeyView[] = settings.apiKeys.map((key) => ({
    id: key.id,
    label: key.label,
    prefix: key.prefix,
    scope: key.scope,
    createdAt: key.createdAt,
    createdBy: key.createdBy ?? null,
    revokedAt: key.revokedAt ?? null,
  }))
  const jobsToWatch = jobs.stats.FAILED + jobs.stats.DEAD
  const jobsHref = (page: number) => `${pageHref(BASE, params)(page)}#jobs`
  const hasJobFilters = Boolean(params.status || params.filters.type)

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeading
        eyebrow="Administration"
        title="Paramètres"
        description="Réglages de la fédération, règles métier, intégrations et traitements en arrière-plan. Chaque modification est journalisée ; les drapeaux fonctionnels se règlent dans l’environnement de déploiement."
        actions={
          <Button asChild variant="outline" size="md">
            <a href="/api/health" target="_blank" rel="noopener noreferrer">
              <Activity aria-hidden="true" />
              État de santé
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        }
      />

      {settings.maintenance.enabled ? (
        <Alert variant="warning" icon={AlertTriangle}>
          <AlertTitle>Bandeau de maintenance actif</AlertTitle>
          <AlertDescription>{settings.maintenance.message || 'Un message de maintenance est affiché sur le site et la plateforme de formation.'}</AlertDescription>
        </Alert>
      ) : null}

      <SettingsForm values={values} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card pillar="defense">
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <Award className="size-5 text-gold-700" aria-hidden="true" />
              Certificats
            </CardTitle>
            <CardDescription>Le compteur de numérotation est incrémenté par la plateforme à chaque émission ; il n’est pas modifiable.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatTile value={settings.certificateSequence} label="Dernier numéro séquentiel attribué" tone="gold" animate={false} description="Clé SystemSetting « certificates.sequence », lecture seule." />
          </CardContent>
        </Card>
        <Card pillar="prevention">
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <Flag className="size-5 text-green-700" aria-hidden="true" />
              Drapeaux fonctionnels
            </CardTitle>
            <CardDescription>Lus depuis les variables d’environnement (`FEATURE_*`, `OIDC_*`) ; modifiables uniquement au déploiement.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-neutral-100">
              {flags.map((flag) => (
                <li key={flag.key} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy">{flag.label}</p>
                    <p className="text-xs text-neutral-500">
                      <span className="font-mono">{flag.key}</span> · {flag.description}
                    </p>
                  </div>
                  <Badge variant={flag.enabled ? 'success' : 'neutral'} size="sm" dot>
                    {flag.enabled ? 'Activé' : 'Désactivé'}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card pillar="protection">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <ListChecks className="size-5 text-blue-600" aria-hidden="true" />
            Évaluations
          </CardTitle>
          <CardDescription>Règle de correction automatique appliquée à tous les quiz de la plateforme de formation.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuizSettingsForm partialCredit={quiz.partialCredit} />
        </CardContent>
      </Card>

      <Card pillar="defense">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2">
            <KeyRound className="size-5 text-gold-700" aria-hidden="true" />
            Clés API
          </CardTitle>
          <CardDescription>Intégrations externes authentifiées par l’en-tête X-API-Key sur /api/v1. Seule l’empreinte SHA-256 de chaque clé est conservée.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysPanel keys={apiKeys} />
        </CardContent>
      </Card>

      <section id="jobs" aria-labelledby="jobs-title" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex flex-col gap-1">
          <h2 id="jobs-title" className="flex items-center gap-2 font-display text-2xl font-semibold text-navy">
            <Cog className="size-6 text-blue-600" aria-hidden="true" />
            File de traitements
          </h2>
          <p className="text-sm text-neutral-600">Emails, rendus PDF, webhooks, publications planifiées et rappels sont exécutés en arrière-plan (cron sur Vercel, worker ailleurs). Les tâches en échec sont réessayées avec un délai croissant.</p>
        </div>
        {jobsToWatch > 0 || jobs.failedEmails24h > 0 ? (
          <Alert variant="warning" icon={AlertTriangle}>
            <AlertDescription>
              {jobsToWatch > 0 ? `${jobsToWatch} tâche${jobsToWatch > 1 ? 's' : ''} en échec ou abandonnée${jobsToWatch > 1 ? 's' : ''}` : null}
              {jobsToWatch > 0 && jobs.failedEmails24h > 0 ? ' · ' : null}
              {jobs.failedEmails24h > 0 ? `${jobs.failedEmails24h} email${jobs.failedEmails24h > 1 ? 's' : ''} non délivré${jobs.failedEmails24h > 1 ? 's' : ''} sur 24 h` : null}
            </AlertDescription>
          </Alert>
        ) : null}
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StaggerItem>
            <StatTile value={jobs.stats.QUEUED} label="En file d’attente" icon={Timer} tone="blue" description={`${jobs.stats.dueNow} à exécuter maintenant · ${jobs.stats.RUNNING} en cours`} />
          </StaggerItem>
          <StaggerItem>
            <StatTile value={jobs.stats.SUCCEEDED} label="Réussies" tone="green" />
          </StaggerItem>
          <StaggerItem>
            <StatTile value={jobs.stats.FAILED} label="En échec (réessai planifié)" icon={AlertTriangle} tone="gold" description={`${jobs.stats.DEAD} abandonnée${jobs.stats.DEAD > 1 ? 's' : ''} après épuisement des tentatives`} />
          </StaggerItem>
          <StaggerItem>
            <StatTile value={jobs.failedEmails24h} label="Emails non délivrés sur 24 h" icon={MailWarning} tone="navy" />
          </StaggerItem>
        </Stagger>
        <form method="get" action={BASE} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft sm:p-4 lg:flex-row lg:items-end">
          <div className="w-full lg:w-56">
            <label htmlFor="jobs-statut" className="mb-1 block text-xs font-semibold text-neutral-600">
              Statut
            </label>
            <NativeSelect id="jobs-statut" name="statut" defaultValue={params.status ?? ''} options={[{ value: '', label: 'Tous' }, ...jobStatusOptions]} />
          </div>
          <div className="w-full lg:w-72">
            <label htmlFor="jobs-type" className="mb-1 block text-xs font-semibold text-neutral-600">
              Type
            </label>
            <NativeSelect id="jobs-type" name="type" defaultValue={params.filters.type ?? ''} options={[{ value: '', label: 'Tous' }, ...jobs.types.map((t) => ({ value: t, label: jobLabel(t) }))]} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="submit" variant="secondary" size="md">
              Filtrer
            </Button>
            {hasJobFilters ? (
              <Button asChild variant="ghost" size="md">
                <Link href={`${BASE}#jobs`}>
                  <RotateCcw aria-hidden="true" />
                  Réinitialiser
                </Link>
              </Button>
            ) : null}
          </div>
        </form>
        <DataTable
          rows={jobs.jobs.items}
          rowKey={(row) => row.id}
          caption="Tâches de fond"
          dense
          rowClassName={(row) => (row.status === 'FAILED' || row.status === 'DEAD' ? 'bg-gold-50/40' : undefined)}
          empty={{ icon: Cog, title: 'Aucune tâche', description: hasJobFilters ? 'Aucune tâche ne correspond aux filtres.' : 'Les traitements en arrière-plan apparaîtront ici dès leur mise en file.' }}
          pagination={{ page: jobs.jobs.page, totalPages: jobs.jobs.totalPages, total: jobs.jobs.total, pageSize: jobs.jobs.pageSize, hrefFor: jobsHref }}
          columns={[
            {
              key: 'type',
              header: 'Tâche',
              cell: (row) => (
                <span className="text-sm">
                  <span className="block font-semibold text-navy">{jobLabel(row.type)}</span>
                  <span className="block font-mono text-[11px] text-neutral-500">
                    {row.type} · priorité {row.priority}
                  </span>
                </span>
              ),
            },
            { key: 'status', header: 'Statut', cell: (row) => <StatusBadge status={row.status} size="sm" /> },
            {
              key: 'attempts',
              header: 'Tentatives',
              align: 'center',
              hideBelow: 'sm',
              cell: (row) => (
                <span className="text-sm tabular-nums text-navy">
                  {row.attempts} / {row.maxAttempts}
                </span>
              ),
            },
            {
              key: 'runAt',
              header: 'Exécution',
              hideBelow: 'md',
              cell: (row) => (
                <span className="text-xs text-neutral-600" title={formatDateTime(row.runAt)}>
                  {row.completedAt ? `Terminée ${formatRelative(row.completedAt)}` : row.lockedAt ? `Verrouillée ${formatRelative(row.lockedAt)}${row.lockedBy ? ` (${row.lockedBy})` : ''}` : `Prévue ${formatRelative(row.runAt)}`}
                  <span className="block">Créée {formatRelative(row.createdAt)}</span>
                </span>
              ),
            },
            {
              key: 'error',
              header: 'Dernière erreur',
              hideBelow: 'lg',
              cell: (row) =>
                row.lastError ? (
                  <span className="block max-w-xs truncate text-xs text-red-700" title={row.lastError}>
                    {row.lastError}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">—</span>
                ),
            },
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              align: 'right',
              cell: (row) => (
                <div className="flex flex-wrap items-center justify-end gap-1">
                  {row.status === 'FAILED' || row.status === 'DEAD' ? (
                    <ConfirmDialog
                      trigger={
                        <Button type="button" variant="ghost" size="sm" leftIcon={<RotateCcw aria-hidden="true" />}>
                          Relancer
                        </Button>
                      }
                      title={`Relancer « ${jobLabel(row.type)} » ?`}
                      description="La tâche est remise en file immédiatement et son compteur de tentatives repart de zéro. L’opération est journalisée."
                      confirmLabel="Relancer"
                      onConfirm={retryJobAction.bind(null, row.id)}
                    />
                  ) : null}
                  {row.status === 'QUEUED' || row.status === 'FAILED' ? (
                    <ConfirmDialog
                      trigger={
                        <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" leftIcon={<Ban aria-hidden="true" />}>
                          Annuler
                        </Button>
                      }
                      title={`Annuler « ${jobLabel(row.type)} » ?`}
                      description="La tâche ne sera plus exécutée (statut « abandonnée » avec motif). L’opération est journalisée."
                      confirmLabel="Annuler la tâche"
                      destructive
                      onConfirm={cancelJobAction.bind(null, row.id)}
                    />
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  )
}
