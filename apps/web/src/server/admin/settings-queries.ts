import 'server-only'
import { features, getEnvSafe } from '@fetrag/config'
import { prisma, type JobStatus } from '@fetrag/db'
import { getJobStats, jobTypeList, listJobs } from '@fetrag/jobs'
import type { ListParams } from './list-params'

const jobStatuses: readonly JobStatus[] = ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'DEAD']

/** Libellés des types de jobs connus. */
export const jobTypeLabels: Record<string, string> = {
  'email.send': 'Envoi d’email',
  'certificate.render': 'Rendu de certificat',
  'receipt.render': 'Rendu de reçu',
  'notification.dispatch': 'Notification',
  'webhook.process': 'Webhook de paiement',
  'content.publish-scheduled': 'Publication planifiée',
  'reminder.session': 'Rappel de session',
  'export.generate': 'Export',
  'enrollment.expire': 'Expiration d’inscription',
}

/** État de la file de jobs : compteurs par statut, liste filtrable (statut, type) et emails en échec sur 24 h. */
export async function loadJobsPanel(params: ListParams) {
  const status = jobStatuses.find((s) => s === params.status)
  const type = jobTypeList.find((t) => t === params.filters.type) ?? (params.filters.type || undefined)
  const [stats, jobs, failedEmails24h] = await Promise.all([
    getJobStats(),
    listJobs({ status, type, page: params.page, pageSize: params.pageSize }),
    prisma.emailDelivery.count({ where: { status: { in: ['FAILED', 'BOUNCED'] }, createdAt: { gte: new Date(Date.now() - 24 * 3600_000) } } }).catch(() => 0),
  ])
  return { stats, jobs, failedEmails24h, types: [...jobTypeList] }
}

export type AdminJobRow = Awaited<ReturnType<typeof loadJobsPanel>>['jobs']['items'][number]

export interface FeatureFlagView {
  key: string
  label: string
  description: string
  enabled: boolean
}

/** Drapeaux fonctionnels lus depuis l'environnement (`@fetrag/config`), en lecture seule. */
export function loadFeatureFlags(): FeatureFlagView[] {
  const env = getEnvSafe()
  return [
    { key: 'FEATURE_LOCAL_AUTH', label: 'Authentification locale', description: 'Connexion par email et mot de passe (recette et secours).', enabled: features.localAuth() },
    { key: 'OIDC_*', label: 'Fournisseur d’identité externe (OIDC)', description: env.OIDC_ISSUER ? `Émetteur : ${env.OIDC_ISSUER}` : 'Aucun fournisseur configuré.', enabled: features.oidc() },
    { key: 'FEATURE_PAYMENTS', label: 'Paiements en ligne', description: 'Parcours de commande, mobile money et reçus.', enabled: features.payments() },
    { key: 'FEATURE_FORUMS', label: 'Forums de formation', description: 'Espaces d’échange par cours et cohorte sur le LMS.', enabled: features.forums() },
    { key: 'FEATURE_NEWSLETTER', label: 'Lettre d’information', description: 'Inscription et envoi de la newsletter depuis le site.', enabled: features.newsletter() },
  ]
}

/** Paramètres pédagogiques (crédit partiel des quiz) lus dans `SystemSetting`. */
export async function loadQuizSettings(): Promise<{ partialCredit: boolean }> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'quiz.partialCredit' } }).catch(() => null)
  return { partialCredit: row?.value === true }
}
