'use server'

import { revalidatePath } from 'next/cache'
import { profileUpdateSchema } from '@fetrag/contracts'
import { prisma, type ConsentKind } from '@fetrag/db'
import { audit } from '@fetrag/domain'
import { notificationCategories, setNotificationPreference, type NotificationCategory } from '@fetrag/notifications'
import { guards } from '@/lib/auth'
import { bool, firstErrors, requestContext, successState, text, toErrorState, type ActionState } from './common'
import { consentKinds } from './queries'

export type ProfileField = 'firstName' | 'lastName' | 'phone' | 'jobTitle' | 'employer' | 'locale'

/** Met à jour l'identité et les coordonnées du compte (profileUpdateSchema). */
export async function updateProfileAction(_previous: ActionState<ProfileField>, formData: FormData): Promise<ActionState<ProfileField>> {
  const principal = await guards.requireUser('/espace/profil')
  const parsed = profileUpdateSchema.safeParse({
    firstName: text(formData, 'firstName'),
    lastName: text(formData, 'lastName'),
    phone: text(formData, 'phone').trim(),
    jobTitle: text(formData, 'jobTitle').trim() || undefined,
    employer: text(formData, 'employer').trim() || undefined,
    locale: text(formData, 'locale') || 'fr',
  })
  if (!parsed.success) {
    return { status: 'error', message: 'Certains champs sont invalides.', fieldErrors: firstErrors<ProfileField>(parsed.error.issues) }
  }
  try {
    const ctx = await requestContext()
    const before = await prisma.user.findUnique({
      where: { id: principal.id },
      select: { firstName: true, lastName: true, phone: true, jobTitle: true, employer: true, locale: true },
    })
    const data = parsed.data
    await prisma.user.update({
      where: { id: principal.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone ? data.phone : null,
        jobTitle: data.jobTitle ?? null,
        employer: data.employer ?? null,
        locale: data.locale,
      },
    })
    await audit('user.updated', { type: 'User', id: principal.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before,
      after: { firstName: data.firstName, lastName: data.lastName, phone: data.phone || null, jobTitle: data.jobTitle ?? null, employer: data.employer ?? null, locale: data.locale },
    })
    revalidatePath('/espace', 'layout')
    return successState('Votre profil a été mis à jour.')
  } catch (error) {
    return toErrorState<ProfileField>(error)
  }
}

/** Enregistre les consentements facultatifs (lettre d'information, informations formations). */
export async function updateConsentsAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const principal = await guards.requireUser('/espace/profil')
  try {
    const ctx = await requestContext()
    const changes: Array<{ kind: ConsentKind; granted: boolean }> = []
    for (const kind of consentKinds) {
      const granted = bool(formData, `consent-${kind}`)
      const last = await prisma.consent.findFirst({ where: { userId: principal.id, kind }, orderBy: { createdAt: 'desc' }, select: { granted: true } })
      if ((last?.granted ?? false) !== granted) changes.push({ kind, granted })
    }
    if (changes.length > 0) {
      await prisma.consent.createMany({
        data: changes.map((c) => ({ userId: principal.id, kind: c.kind, granted: c.granted, ipAddress: ctx.ipHash, userAgent: ctx.userAgent })),
      })
      const newsletter = changes.find((c) => c.kind === 'NEWSLETTER')
      if (newsletter) {
        await prisma.newsletterSubscription.upsert({
          where: { email: principal.email },
          create: { email: principal.email, userId: principal.id, confirmedAt: newsletter.granted ? new Date() : null, unsubscribedAt: newsletter.granted ? null : new Date(), source: 'espace' },
          update: newsletter.granted ? { userId: principal.id, confirmedAt: new Date(), unsubscribedAt: null } : { unsubscribedAt: new Date() },
        })
      }
      await audit('user.updated', { type: 'Consent', id: principal.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
        after: Object.fromEntries(changes.map((c) => [c.kind, c.granted])),
      })
    }
    revalidatePath('/espace/profil')
    return successState(changes.length > 0 ? 'Vos préférences de consentement ont été enregistrées.' : 'Aucun changement à enregistrer.')
  } catch (error) {
    return toErrorState(error)
  }
}

/** Enregistre les préférences de notification par email (catégorie par catégorie). */
export async function updateNotificationPreferencesAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const principal = await guards.requireUser('/espace/profil')
  try {
    for (const category of notificationCategories) {
      if (!formData.has(`pref-${category}-present`)) continue
      const enabled = bool(formData, `pref-${category}`)
      await setNotificationPreference(principal.id, 'EMAIL', category as NotificationCategory, enabled)
    }
    revalidatePath('/espace/profil')
    return successState('Vos préférences de notification ont été enregistrées.')
  } catch (error) {
    return toErrorState(error)
  }
}
