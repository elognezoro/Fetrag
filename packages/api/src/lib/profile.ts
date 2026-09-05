// Helper local (aucun package n'expose la lecture du profil) : profil public d'un utilisateur
// et organisations d'appartenance, sans champs sensibles (mot de passe, secret MFA, codes de secours).
import { prisma } from '@fetrag/db'

export async function loadProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      image: true,
      phone: true,
      jobTitle: true,
      employer: true,
      locale: true,
      timezone: true,
      totpEnabled: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      memberships: {
        select: {
          isManager: true,
          title: true,
          joinedAt: true,
          organization: { select: { id: true, slug: true, name: true, acronym: true, sector: true, city: true, isAffiliate: true } },
        },
      },
    },
  })
  if (!user) return null
  const { memberships, ...profile } = user
  return {
    profile,
    organizations: memberships.map((m) => ({ ...m.organization, isManager: m.isManager, title: m.title, joinedAt: m.joinedAt })),
  }
}
