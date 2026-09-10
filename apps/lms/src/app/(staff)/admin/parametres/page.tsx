import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AlertTriangle, Clock, ListChecks, Lock, Settings, Skull } from 'lucide-react'
import { formatDateTime, hasGlobalRole, isSuperAdmin } from '@fetrag/domain'
import { Badge, Card, CardContent, EmptyState, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@fetrag/ui'
import { ProcessJobsButton } from '@/components/staff/admin-job-actions'
import { RemoveSettingButton, SettingForm } from '@/components/staff/setting-form'
import { StaffPageHeader, StaffSection } from '@/components/staff/staff-page'
import { StatGrid } from '@/components/staff/stat-grid'
import { guards } from '@/lib/auth'
import { adminSettingsOverview } from '@/server/staff/admin-queries'

export const metadata: Metadata = { title: 'Paramètres' }
export const dynamic = 'force-dynamic'

const jobStatusLabels: Record<string, string> = { QUEUED: 'En attente', RUNNING: 'En cours', SUCCEEDED: 'Terminé', FAILED: 'En échec', DEAD: 'Abandonné' }

function formatSettingValue(value: unknown, kind: 'number' | 'boolean' | 'text'): string {
  if (kind === 'boolean') return value === true ? 'Activé' : 'Désactivé'
  if (kind === 'number') return typeof value === 'number' ? new Intl.NumberFormat('fr-FR').format(value) : String(value ?? '')
  if (typeof value === 'string') return value.trim() ? value : '(message par défaut)'
  const json = JSON.stringify(value)
  return json.length > 80 ? `${json.slice(0, 77)}...` : json
}

function formatOtherValue(value: unknown): string {
  if (typeof value === 'string') return value
  const json = JSON.stringify(value)
  return json.length > 80 ? `${json.slice(0, 77)}...` : json
}

/** Paramètres système de la formation (SystemSetting), autres clés, état de la file de jobs et traitement manuel. */
export default async function AdminSettingsPage() {
  const principal = await guards.requireUser('/admin/parametres')
  if (!isSuperAdmin(principal) && !hasGlobalRole(principal, 'COORDINATOR')) redirect('/acces-refuse')
  const { managed, others, jobStats, jobs, canProcessJobs, canEdit } = await adminSettingsOverview(principal)

  return (
    <>
      <StaffPageHeader
        breadcrumbs={[{ label: 'Administration', href: '/admin' }, { label: 'Paramètres' }]}
        eyebrow="Paramètres système"
        title={
          <>
            Réglages de la <span className="italic text-blue-600">plateforme de formation</span>
          </>
        }
        description="Limites des demandes de formation, correction des quiz, compteur des certificats, message d'accueil et supervision de la file de jobs (emails, PDF, notifications). Chaque modification est journalisée."
        tone="navy"
        meta={canEdit ? <span>Modification autorisée (super administration)</span> : <span>Consultation : la modification est réservée à la super administration</span>}
        actions={canProcessJobs ? <ProcessJobsButton dueNow={jobStats?.dueNow ?? 0} /> : undefined}
      />

      {jobStats ? (
        <StatGrid
          items={[
            { value: jobStats.dueNow, label: 'Jobs à traiter', icon: Clock, tone: 'blue', description: `${jobStats.QUEUED} en attente · ${jobStats.RUNNING} en cours` },
            { value: jobStats.SUCCEEDED, label: 'Jobs terminés', icon: ListChecks, tone: 'green', description: 'Depuis la mise en service' },
            { value: jobStats.FAILED, label: 'En échec (relance automatique)', icon: AlertTriangle, tone: 'gold', description: 'Nouvelle tentative avec délai croissant' },
            { value: jobStats.DEAD, label: 'Abandonnés', icon: Skull, tone: 'navy', description: 'Tentatives épuisées : intervention requise' },
          ]}
        />
      ) : (
        <Card>
          <EmptyState compact icon={AlertTriangle} title="File de jobs indisponible" description="Impossible de lire l'état de la file : vérifiez la connexion à la base de données." />
        </Card>
      )}

      <StaffSection number="01" title="Paramètres de la formation" className="mt-10" tone="navy" description="Clés lues par les services métier (demandes, quiz, certificats, tableau de bord apprenant).">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paramètre</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Mis à jour</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managed.map((m) => (
              <TableRow key={m.key}>
                <TableCell className="min-w-[12rem]">
                  <span className="font-semibold text-navy">{m.label}</span>
                  <span className="block break-all font-mono text-[11px] text-neutral-500">{m.key}</span>
                </TableCell>
                <TableCell className="min-w-[10rem]">
                  <span className={m.kind === 'text' ? 'line-clamp-2 max-w-xs text-sm text-neutral-700' : 'font-mono text-sm font-semibold text-navy'}>{formatSettingValue(m.value, m.kind)}</span>
                  {!m.exists ? <Badge variant="neutral" size="sm" className="mt-1">Valeur par défaut</Badge> : null}
                </TableCell>
                <TableCell className="min-w-[16rem] max-w-sm text-sm text-neutral-600">{m.storedDescription ?? m.description}</TableCell>
                <TableCell className="whitespace-nowrap text-neutral-600">{m.updatedAt ? formatDateTime(m.updatedAt) : '-'}</TableCell>
                <TableCell className="text-right">
                  {m.readOnly ? (
                    <Badge variant="outline" size="sm">
                      <Lock className="size-3" aria-hidden="true" />
                      Automatique
                    </Badge>
                  ) : m.canEdit ? (
                    <SettingForm setting={{ key: m.key, value: m.value, description: m.storedDescription ?? m.description }} />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StaffSection>

      <StaffSection number="02" title="Autres paramètres" tone="blue" description="Clés techniques (site, API, intégrations). Les clés requises par la plateforme ne peuvent pas être supprimées." actions={canEdit ? <SettingForm /> : undefined}>
        {others.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clé</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mis à jour</TableHead>
                {canEdit ? (
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {others.map((s) => (
                <TableRow key={s.key}>
                  <TableCell className="whitespace-nowrap font-mono text-sm font-semibold text-navy">{s.key}</TableCell>
                  <TableCell className="min-w-[10rem] max-w-xs truncate font-mono text-xs text-neutral-700">{s.key === 'api.keys' ? '(masqué)' : formatOtherValue(s.value)}</TableCell>
                  <TableCell className="min-w-[14rem] max-w-sm text-sm text-neutral-600">{s.description ?? '-'}</TableCell>
                  <TableCell className="whitespace-nowrap text-neutral-600">{formatDateTime(s.updatedAt)}</TableCell>
                  {canEdit ? (
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        <SettingForm setting={{ key: s.key, value: s.value, description: s.description }} />
                        <RemoveSettingButton settingKey={s.key} />
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <EmptyState compact icon={Settings} title="Aucun autre paramètre" description="Les clés techniques créées par les intégrations apparaîtront ici." />
          </Card>
        )}
      </StaffSection>

      <StaffSection number="03" title="Derniers jobs" tone="gold" description="Sur Vercel, la file est traitée par le cron /api/cron/jobs ; ailleurs par le worker. Le traitement manuel exécute un lot de 10 jobs pour la recette.">
        {jobs && jobs.items.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Tentatives</TableHead>
                <TableHead>Planifié</TableHead>
                <TableHead>Dernière erreur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.items.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="min-w-[13rem]">
                    <span className="break-all font-mono text-sm font-semibold text-navy">{j.type}</span>
                    <span className="block text-xs text-neutral-500">créé {formatDateTime(j.createdAt)}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={j.status} labels={jobStatusLabels} size="sm" />
                    {j.lockedBy ? <span className="block max-w-[10rem] truncate text-xs text-neutral-500">{j.lockedBy}</span> : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-neutral-700">
                    {j.attempts}/{j.maxAttempts}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-neutral-600">
                    {formatDateTime(j.runAt)}
                    {j.completedAt ? <span className="block text-xs text-neutral-500">terminé {formatDateTime(j.completedAt)}</span> : null}
                  </TableCell>
                  <TableCell className="min-w-[14rem] max-w-xs">{j.lastError ? <span className="line-clamp-2 text-xs text-danger">{j.lastError}</span> : <span className="text-neutral-400">-</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <CardContent className="p-0">
              <EmptyState compact icon={ListChecks} title="Aucun job" description="Les envois d'emails, générations de PDF et notifications en file apparaîtront ici." />
            </CardContent>
          </Card>
        )}
      </StaffSection>
    </>
  )
}
