'use server'

import { revalidatePath } from 'next/cache'
import { idSchema, roleSchema, scopeTypeSchema, z } from '@fetrag/contracts'
import { prisma } from '@fetrag/db'
import { audit, isSuperAdmin, PreconditionError } from '@fetrag/domain'
import { notifyUser } from '@fetrag/notifications'
import { roleLabels } from '@fetrag/contracts'
import { adminRequestContext, requireActionCan, type ActionState } from './context'
import { nullableDate, relationId, successState, text, toErrorState } from './form-helpers'

export type RoleField = 'role' | 'scopeType' | 'scopeId' | 'expiresAt'

const grantSchema = z
  .object({
    userId: idSchema,
    role: roleSchema,
    scopeType: scopeTypeSchema,
    scopeId: z.string().uuid().nullable(),
    expiresAt: z.date().nullable(),
  })
  .refine((d) => d.scopeType === 'GLOBAL' || Boolean(d.scopeId), { path: ['scopeId'], message: 'Une portée limitée exige un identifiant de portée' })
  .refine((d) => !d.expiresAt || d.expiresAt.getTime() > Date.now(), { path: ['expiresAt'], message: 'La date d’expiration doit être future' })

/** Attribue un rôle (portée globale ou limitée) - réservé au super administrateur (roles.manage). */
export async function grantRoleAction(_previous: ActionState<RoleField>, formData: FormData): Promise<ActionState<RoleField>> {
  const parsed = grantSchema.safeParse({
    userId: text(formData, 'userId'),
    role: text(formData, 'role'),
    scopeType: text(formData, 'scopeType') || 'GLOBAL',
    scopeId: text(formData, 'scopeType') === 'GLOBAL' ? null : relationId(formData, 'scopeId'),
    expiresAt: nullableDate(formData, 'expiresAt') ?? null,
  })
  if (!parsed.success) {
    const fieldErrors: Partial<Record<RoleField, string>> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !(key in fieldErrors)) fieldErrors[key as RoleField] = issue.message
    }
    return { status: 'error', message: 'Vérifiez les informations du rôle.', fieldErrors }
  }
  const data = parsed.data
  try {
    const principal = await requireActionCan('roles.manage')
    const ctx = await adminRequestContext()
    if (data.scopeType !== 'GLOBAL' && data.scopeId) {
      const exists =
        data.scopeType === 'ORGANIZATION'
          ? await prisma.organization.findUnique({ where: { id: data.scopeId }, select: { id: true } })
          : data.scopeType === 'COURSE'
            ? await prisma.course.findUnique({ where: { id: data.scopeId }, select: { id: true } })
            : await prisma.cohort.findUnique({ where: { id: data.scopeId }, select: { id: true } })
      if (!exists) return { status: 'error', message: 'La portée choisie n’existe pas.', fieldErrors: { scopeId: 'Portée introuvable' } }
    }
    const user = await prisma.user.findUnique({ where: { id: data.userId }, select: { id: true, email: true, isActive: true } })
    if (!user) return { status: 'error', message: 'Utilisateur introuvable.' }
    const existing = await prisma.roleAssignment.findFirst({ where: { userId: data.userId, role: data.role, scopeType: data.scopeType, scopeId: data.scopeId } })
    const assignment = existing
      ? await prisma.roleAssignment.update({ where: { id: existing.id }, data: { expiresAt: data.expiresAt, grantedById: principal.id } })
      : await prisma.roleAssignment.create({ data: { userId: data.userId, role: data.role, scopeType: data.scopeType, scopeId: data.scopeId, expiresAt: data.expiresAt, grantedById: principal.id } })
    await audit('role.granted', { type: 'RoleAssignment', id: data.userId }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: existing ? { expiresAt: existing.expiresAt?.toISOString() ?? null } : undefined,
      after: { assignmentId: assignment.id, userEmail: user.email, role: data.role, scopeType: data.scopeType, scopeId: data.scopeId, expiresAt: data.expiresAt?.toISOString() ?? null },
    })
    await notifyUser(data.userId, {
      title: 'Nouveau rôle attribué',
      body: `Le rôle « ${roleLabels[data.role]} » vous a été attribué sur la plateforme FETRAG${data.scopeType !== 'GLOBAL' ? ' pour une portée limitée' : ''}.`,
      href: '/espace',
      category: 'account',
      email: true,
    }).catch(() => undefined)
    revalidatePath(`/admin/utilisateurs/${data.userId}`)
    revalidatePath('/admin/utilisateurs')
    return successState(existing ? 'Rôle mis à jour.' : `Rôle « ${roleLabels[data.role]} » attribué.`)
  } catch (error) {
    return toErrorState<RoleField>(error)
  }
}

/** Révoque une attribution de rôle (roles.manage). Un super administrateur ne peut pas retirer son propre rôle SUPER_ADMIN. */
export async function revokeRoleAction(assignmentId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(assignmentId)
  if (!parsed.success) return { status: 'error', message: 'Attribution inconnue.' }
  try {
    const principal = await requireActionCan('roles.manage')
    const ctx = await adminRequestContext()
    const assignment = await prisma.roleAssignment.findUnique({ where: { id: parsed.data }, include: { user: { select: { email: true } } } })
    if (!assignment) return { status: 'error', message: 'Attribution introuvable.' }
    if (assignment.userId === principal.id && assignment.role === 'SUPER_ADMIN') {
      throw new PreconditionError('Vous ne pouvez pas retirer votre propre rôle de super administrateur')
    }
    if (assignment.role === 'SUPER_ADMIN' && assignment.scopeType === 'GLOBAL') {
      const others = await prisma.roleAssignment.count({ where: { role: 'SUPER_ADMIN', scopeType: 'GLOBAL', id: { not: assignment.id }, user: { isActive: true } } })
      if (others === 0) throw new PreconditionError('Au moins un super administrateur actif doit subsister')
    }
    await prisma.roleAssignment.delete({ where: { id: assignment.id } })
    await audit('role.revoked', { type: 'RoleAssignment', id: assignment.userId }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { assignmentId: assignment.id, userEmail: assignment.user.email, role: assignment.role, scopeType: assignment.scopeType, scopeId: assignment.scopeId },
    })
    revalidatePath(`/admin/utilisateurs/${assignment.userId}`)
    revalidatePath('/admin/utilisateurs')
    return successState(`Rôle « ${roleLabels[assignment.role]} » révoqué.`)
  } catch (error) {
    return toErrorState(error)
  }
}

/** Active ou désactive un compte (users.manage). Un compte désactivé ne peut plus se connecter. */
export async function setUserActiveAction(userId: string, active: boolean): Promise<ActionState> {
  const parsed = idSchema.safeParse(userId)
  if (!parsed.success) return { status: 'error', message: 'Utilisateur inconnu.' }
  try {
    const principal = await requireActionCan('users.manage')
    const ctx = await adminRequestContext()
    if (parsed.data === principal.id && !active) throw new PreconditionError('Vous ne pouvez pas désactiver votre propre compte')
    const user = await prisma.user.findUnique({ where: { id: parsed.data }, select: { id: true, email: true, isActive: true } })
    if (!user) return { status: 'error', message: 'Utilisateur introuvable.' }
    if (user.isActive === active) return successState(active ? 'Le compte est déjà actif.' : 'Le compte est déjà désactivé.')
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { isActive: active } }),
      ...(active ? [] : [prisma.session.deleteMany({ where: { userId: user.id } })]),
    ])
    await audit('user.updated', { type: 'User', id: user.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { isActive: user.isActive },
      after: { isActive: active, email: user.email },
    })
    revalidatePath(`/admin/utilisateurs/${user.id}`)
    revalidatePath('/admin/utilisateurs')
    return successState(active ? `Compte ${user.email} réactivé.` : `Compte ${user.email} désactivé ; ses sessions ont été fermées.`)
  } catch (error) {
    return toErrorState(error)
  }
}

/** Réinitialise la vérification en deux étapes d'un utilisateur ayant perdu son appareil (super administrateur). */
export async function resetUserMfaAction(userId: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(userId)
  if (!parsed.success) return { status: 'error', message: 'Utilisateur inconnu.' }
  try {
    const principal = await requireActionCan('users.manage')
    if (!isSuperAdmin(principal)) throw new PreconditionError('Réservé au super administrateur')
    const ctx = await adminRequestContext()
    const user = await prisma.user.findUnique({ where: { id: parsed.data }, select: { id: true, email: true, totpEnabled: true } })
    if (!user) return { status: 'error', message: 'Utilisateur introuvable.' }
    if (!user.totpEnabled) return successState('La vérification en deux étapes n’est pas active sur ce compte.')
    await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: false, totpSecret: null, backupCodes: [] } })
    await audit('user.updated', { type: 'User', id: user.id }, { actorId: principal.id, actorEmail: principal.email, ip: ctx.ip, userAgent: ctx.userAgent }, {
      before: { totpEnabled: true },
      after: { totpEnabled: false, reason: 'reset_by_admin' },
    })
    await notifyUser(user.id, {
      title: 'Vérification en deux étapes réinitialisée',
      body: 'Un administrateur a réinitialisé votre vérification en deux étapes. Réactivez-la depuis « Sécurité » dans votre espace personnel.',
      href: '/espace/securite',
      category: 'security',
      email: true,
    }).catch(() => undefined)
    revalidatePath(`/admin/utilisateurs/${user.id}`)
    return successState(`Vérification en deux étapes réinitialisée pour ${user.email}.`)
  } catch (error) {
    return toErrorState(error)
  }
}
