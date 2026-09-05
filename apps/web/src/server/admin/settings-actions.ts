'use server'

import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { emailSchema, z } from '@fetrag/contracts'
import { prisma, type Prisma } from '@fetrag/db'
import { audit } from '@fetrag/domain'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { firstErrors, list, successState, text, toErrorState } from './form-helpers'
import type { ApiKeyRecord } from './queries'

export type SettingsField = 'address' | 'email' | 'phones' | 'supportEmail' | 'currency' | 'participantLimit' | 'motto' | 'maintenanceMessage'

const siteSettingsSchema = z.object({
  address: z.string().trim().min(5).max(200),
  email: emailSchema,
  supportEmail: emailSchema.optional().or(z.literal('')),
  phones: z.array(z.string().trim().min(6).max(20)).min(1, 'Au moins un numéro').max(4),
  currency: z.string().trim().length(3, 'Code devise ISO à 3 lettres').toUpperCase(),
  participantLimit: z.coerce.number().int().min(1).max(500),
  motto: z.array(z.string().trim().min(2).max(30)).length(3, 'La devise comporte trois mots'),
  maintenanceEnabled: z.boolean(),
  maintenanceMessage: z.string().trim().max(300),
})

async function writeSetting(key: string, value: unknown, description: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value: value as Prisma.InputJsonValue, description },
    update: { value: value as Prisma.InputJsonValue, description },
  })
}

/** Coordonnées du site, devise, limite de participants, devise institutionnelle et mode maintenance (settings.manage). */
export async function updateSiteSettingsAction(_previous: ActionState<SettingsField>, formData: FormData): Promise<ActionState<SettingsField>> {
  const parsed = siteSettingsSchema.safeParse({
    address: text(formData, 'address'),
    email: text(formData, 'email'),
    supportEmail: text(formData, 'supportEmail').trim(),
    phones: list(formData, 'phones'),
    currency: text(formData, 'currency') || 'XAF',
    participantLimit: text(formData, 'participantLimit') || '10',
    motto: list(formData, 'motto'),
    maintenanceEnabled: formData.get('maintenanceEnabled') === 'on',
    maintenanceMessage: text(formData, 'maintenanceMessage'),
  })
  if (!parsed.success) {
    return { status: 'error', message: 'Certains paramètres sont invalides.', fieldErrors: firstErrors<SettingsField>(parsed.error.issues) }
  }
  const data = parsed.data
  try {
    const principal = await requireActionCan('settings.manage')
    const ctx = await adminRequestContext()
    const before = await prisma.systemSetting.findMany({ where: { key: { in: ['site.contact', 'site.currency', 'training.participantLimit', 'site.motto', 'site.maintenance'] } } })
    await Promise.all([
      writeSetting('site.contact', { address: data.address, email: data.email, phones: data.phones, supportEmail: data.supportEmail || null }, 'Coordonnées publiques de la fédération.'),
      writeSetting('site.currency', data.currency, 'Devise des tarifs affichés (code ISO 4217).'),
      writeSetting('training.participantLimit', data.participantLimit, 'Nombre maximal de participants par demande de formation institutionnelle (chapitre 14).'),
      writeSetting('site.motto', data.motto, 'Devise affichée dans le ruban tricolore.'),
      writeSetting('site.maintenance', { enabled: data.maintenanceEnabled, message: data.maintenanceMessage }, 'Bandeau de maintenance affiché sur les deux plateformes.'),
    ])
    await audit('settings.updated', { type: 'SystemSetting' }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: Object.fromEntries(before.map((b) => [b.key, b.value])),
      after: { 'site.contact': { address: data.address, email: data.email, phones: data.phones }, 'site.currency': data.currency, 'training.participantLimit': data.participantLimit, 'site.motto': data.motto, 'site.maintenance': { enabled: data.maintenanceEnabled } },
    })
    revalidatePath('/admin/parametres')
    revalidatePath('/', 'layout')
    return successState('Paramètres enregistrés.')
  } catch (error) {
    return toErrorState<SettingsField>(error)
  }
}

export type ApiKeyField = 'label' | 'scope'

const apiKeySchema = z.object({ label: z.string().trim().min(3, 'Libellé trop court').max(80), scope: z.enum(['read', 'write']) })

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/** Génère une clé API (affichée une seule fois) et stocke son empreinte SHA-256 dans `api.keys`. */
export async function createApiKeyAction(_previous: ActionState<ApiKeyField>, formData: FormData): Promise<ActionState<ApiKeyField>> {
  const parsed = apiKeySchema.safeParse({ label: text(formData, 'label'), scope: text(formData, 'scope') || 'read' })
  if (!parsed.success) return { status: 'error', message: 'Vérifiez le libellé et la portée.', fieldErrors: firstErrors<ApiKeyField>(parsed.error.issues) }
  try {
    const principal = await requireActionCan('settings.manage')
    const ctx = await adminRequestContext()
    const secret = `fetrag_${parsed.data.scope === 'write' ? 'rw' : 'ro'}_${randomBytes(24).toString('base64url')}`
    const record: ApiKeyRecord = {
      id: randomUUID(),
      label: parsed.data.label,
      prefix: secret.slice(0, 14),
      hash: hashApiKey(secret),
      scope: parsed.data.scope,
      createdAt: new Date().toISOString(),
      createdBy: principal.email,
      revokedAt: null,
    }
    const existing = await prisma.systemSetting.findUnique({ where: { key: 'api.keys' } })
    const current = Array.isArray(existing?.value) ? (existing.value as unknown as ApiKeyRecord[]) : []
    if (current.filter((k) => !k.revokedAt).length >= 20) return { status: 'error', message: 'Limite de 20 clés actives atteinte : révoquez une clé avant d’en créer une nouvelle.' }
    await writeSetting('api.keys', [...current, record], 'Clés API (hash, libellé, portée) pour les intégrations X-API-Key.')
    await audit('settings.updated', { type: 'SystemSetting', id: 'api.keys' }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      after: { created: record.id, label: record.label, scope: record.scope, prefix: record.prefix },
    })
    revalidatePath('/admin/parametres')
    return successState('Clé API générée : copiez-la maintenant, elle ne sera plus affichée.', { secret, id: record.id, label: record.label })
  } catch (error) {
    return toErrorState<ApiKeyField>(error)
  }
}

/** Révoque une clé API (conservée dans l'historique avec sa date de révocation). */
export async function revokeApiKeyAction(keyId: string): Promise<ActionState> {
  const parsed = z.string().uuid().safeParse(keyId)
  if (!parsed.success) return { status: 'error', message: 'Clé inconnue.' }
  try {
    const principal = await requireActionCan('settings.manage')
    const ctx = await adminRequestContext()
    const existing = await prisma.systemSetting.findUnique({ where: { key: 'api.keys' } })
    const current = Array.isArray(existing?.value) ? (existing.value as unknown as ApiKeyRecord[]) : []
    const target = current.find((k) => k.id === parsed.data)
    if (!target) return { status: 'error', message: 'Clé introuvable.' }
    if (target.revokedAt) return successState('Cette clé est déjà révoquée.')
    const next = current.map((k) => (k.id === parsed.data ? { ...k, revokedAt: new Date().toISOString() } : k))
    await writeSetting('api.keys', next, 'Clés API (hash, libellé, portée) pour les intégrations X-API-Key.')
    await audit('settings.updated', { type: 'SystemSetting', id: 'api.keys' }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      after: { revoked: target.id, label: target.label },
    })
    revalidatePath('/admin/parametres')
    return successState(`Clé « ${target.label} » révoquée.`)
  } catch (error) {
    return toErrorState(error)
  }
}
