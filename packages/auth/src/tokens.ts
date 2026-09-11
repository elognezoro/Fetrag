import { prisma } from '@fetrag/db'
import { randomToken, sha256Hex } from '@fetrag/domain'

/** Usages des jetons envoyés par email (table VerificationToken d'Auth.js). */
export type EmailTokenPurpose = 'verify-email' | 'reset-password'

const DEFAULT_TTL_MINUTES: Record<EmailTokenPurpose, number> = {
  'verify-email': 24 * 60,
  'reset-password': 30,
}

function identifierFor(purpose: EmailTokenPurpose, email: string): string {
  return `${purpose}:${email.trim().toLowerCase()}`
}

function hashToken(raw: string): string {
  return sha256Hex(`fetrag-token:${raw}`)
}

/**
 * Crée un jeton à usage unique pour une adresse et un usage donnés. Seule l'empreinte est stockée ;
 * la valeur brute (à mettre dans le lien) n'est jamais persistée. Tout jeton précédent du même usage est invalidé.
 */
export async function createEmailToken(
  email: string,
  purpose: EmailTokenPurpose,
  ttlMinutes: number = DEFAULT_TTL_MINUTES[purpose],
): Promise<{ token: string; expires: Date }> {
  const identifier = identifierFor(purpose, email)
  const token = randomToken(32)
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000)
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({ data: { identifier, token: hashToken(token), expires } }),
  ])
  return { token, expires }
}

/**
 * Consomme un jeton : renvoie l'adresse email associée si le jeton existe et n'est pas expiré, sinon null.
 * Le jeton est supprimé dans tous les cas où il est trouvé (usage unique).
 */
export async function consumeEmailToken(rawToken: string, purpose: EmailTokenPurpose): Promise<string | null> {
  const raw = rawToken.trim()
  if (raw.length < 16 || raw.length > 200) return null
  const record = await prisma.verificationToken.findFirst({
    where: { token: hashToken(raw), identifier: { startsWith: `${purpose}:` } },
  })
  if (!record) return null
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } })
  if (record.expires.getTime() < Date.now()) return null
  return record.identifier.slice(purpose.length + 1)
}

/** Supprime les jetons expirés (à appeler par le cron de maintenance). */
export async function purgeExpiredEmailTokens(): Promise<number> {
  const result = await prisma.verificationToken.deleteMany({ where: { expires: { lt: new Date() } } })
  return result.count
}
