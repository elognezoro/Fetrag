import { Role, ScopeType, ConsentKind, NotificationChannel } from '../../generated/client'
import { prisma } from '../../src/client'
import { DEMO_PASSWORD, demoAccounts, learnerAccounts, staffAccounts, type DemoAccount } from '../../src/seed-data'
import { hashDemoPassword, inBatches, log, stableId } from './helpers'

export interface SeededUser {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
}

export interface SeededUsers {
  byEmail: Record<string, SeededUser>
  admin: SeededUser
  coordination: SeededUser
  formateur: SeededUser
  editeur: SeededUser
  services: SeededUser
  finance: SeededUser
  support: SeededUser
  responsable: SeededUser
  /** Les 10 apprenants dans l'ordre apprenant1..apprenant10. */
  learners: SeededUser[]
}

/** Upsert d'un compte de démonstration (clé naturelle : email). */
async function upsertAccount(account: DemoAccount, passwordHash: string): Promise<SeededUser> {
  const name = `${account.firstName} ${account.lastName}`
  const data = {
    name,
    firstName: account.firstName,
    lastName: account.lastName,
    phone: account.phone,
    jobTitle: account.jobTitle,
    employer: account.employer,
    passwordHash,
    emailVerified: new Date(),
    isActive: true,
    locale: 'fr' as const,
    timezone: 'Africa/Libreville',
  }
  const user = await prisma.user.upsert({
    where: { email: account.email },
    create: { id: stableId('user', account.email), email: account.email, ...data },
    update: data,
    select: { id: true, email: true, name: true, firstName: true, lastName: true },
  })
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? name,
    firstName: user.firstName ?? account.firstName,
    lastName: user.lastName ?? account.lastName,
  }
}

/** Attribue un rôle global s'il n'existe pas déjà (scopeId null : pas de clé composée utilisable). */
async function ensureGlobalRole(userId: string, role: Role, grantedById: string | null): Promise<void> {
  const existing = await prisma.roleAssignment.findFirst({
    where: { userId, role, scopeType: ScopeType.GLOBAL, scopeId: null },
    select: { id: true },
  })
  if (existing) return
  await prisma.roleAssignment.create({
    data: { id: stableId('role', userId, role, 'GLOBAL'), userId, role, scopeType: ScopeType.GLOBAL, grantedById },
  })
}

/** Consentements de base et préférence de notification interne pour chaque compte. */
async function ensureConsents(userId: string): Promise<void> {
  for (const kind of [ConsentKind.TERMS, ConsentKind.PRIVACY]) {
    await prisma.consent.upsert({
      where: { id: stableId('consent', userId, kind) },
      create: { id: stableId('consent', userId, kind), userId, kind, granted: true, version: '1.0' },
      update: { granted: true },
    })
  }
  await prisma.notificationPreference.upsert({
    where: { userId_channel_category: { userId, channel: NotificationChannel.IN_APP, category: 'general' } },
    create: { userId, channel: NotificationChannel.IN_APP, category: 'general', enabled: true },
    update: { enabled: true },
  })
  await prisma.notificationPreference.upsert({
    where: { userId_channel_category: { userId, channel: NotificationChannel.EMAIL, category: 'training' } },
    create: { userId, channel: NotificationChannel.EMAIL, category: 'training', enabled: true },
    update: { enabled: true },
  })
}

/**
 * Crée les comptes de démonstration (BUILD_BRIEF §3) avec le mot de passe commun,
 * leurs rôles globaux, consentements et préférences.
 */
export async function seedUsers(): Promise<SeededUsers> {
  log.step('Utilisateurs et rôles')
  const passwordHash = await hashDemoPassword(DEMO_PASSWORD)

  const users = await inBatches(demoAccounts, (account) => upsertAccount(account, passwordHash), 4)
  const byEmail: Record<string, SeededUser> = {}
  for (const user of users) byEmail[user.email] = user

  const pick = (email: string): SeededUser => {
    const user = byEmail[email]
    if (!user) throw new Error(`Seed : compte ${email} introuvable`)
    return user
  }
  const admin = pick('admin@fetrag.ga')

  // Rôles globaux : l'administrateur s'auto-attribue, les autres sont attribués par lui.
  await ensureGlobalRole(admin.id, Role.SUPER_ADMIN, null)
  await inBatches(
    demoAccounts.filter((a) => a.email !== admin.email),
    async (account) => {
      await ensureGlobalRole(pick(account.email).id, account.role, admin.id)
    },
    4,
  )
  await inBatches(users, (user) => ensureConsents(user.id), 4)

  log.done(`${staffAccounts.length} comptes d'équipe et ${learnerAccounts.length} apprenants (mot de passe : ${DEMO_PASSWORD})`)

  return {
    byEmail,
    admin,
    coordination: pick('coordination@fetrag.ga'),
    formateur: pick('formateur@fetrag.ga'),
    editeur: pick('editeur@fetrag.ga'),
    services: pick('services@fetrag.ga'),
    finance: pick('finance@fetrag.ga'),
    support: pick('support@fetrag.ga'),
    responsable: pick('responsable@synatep-demo.ga'),
    learners: learnerAccounts.map((a) => pick(a.email)),
  }
}
