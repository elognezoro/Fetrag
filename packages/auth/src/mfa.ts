import { createHash, randomBytes } from 'node:crypto'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { prisma } from '@fetrag/db'
import { audit } from '@fetrag/domain'

const ISSUER = 'FETRAG'

authenticator.options = { window: 1 }

export function generateTotpSecret(): string {
  return authenticator.generateSecret()
}

export function totpUri(email: string, secret: string): string {
  return authenticator.keyuri(email, ISSUER, secret)
}

export async function totpQrDataUrl(email: string, secret: string): Promise<string> {
  return QRCode.toDataURL(totpUri(email, secret), { margin: 1, width: 220, color: { dark: '#042768' } })
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: token.replace(/\s+/g, ''), secret })
  } catch {
    return false
  }
}

function hashBackupCode(code: string): string {
  return createHash('sha256').update(code.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex')
}

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString('hex').toUpperCase()
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`
  })
}

/** Active la MFA pour un utilisateur après vérification d'un premier code valide. */
export async function enableMfa(userId: string, secret: string, token: string): Promise<{ backupCodes: string[] } | null> {
  if (!verifyTotp(token, secret)) return null
  const backupCodes = generateBackupCodes()
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: secret, totpEnabled: true, backupCodes: backupCodes.map(hashBackupCode) },
  })
  await audit('auth.mfa_enabled', { type: 'User', id: userId }, { actorId: userId })
  return { backupCodes }
}

export async function disableMfa(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: null, totpEnabled: false, backupCodes: [] } })
}

/** Vérifie un code TOTP ou un code de secours (consommé s'il est utilisé). */
export async function verifyMfaForUser(
  user: { id: string; totpSecret: string | null; backupCodes: unknown },
  token: string,
): Promise<boolean> {
  if (user.totpSecret && verifyTotp(token, user.totpSecret)) return true
  const codes = Array.isArray(user.backupCodes) ? (user.backupCodes as string[]) : []
  const hashed = hashBackupCode(token)
  if (codes.includes(hashed)) {
    await prisma.user.update({ where: { id: user.id }, data: { backupCodes: codes.filter((c) => c !== hashed) } })
    return true
  }
  return false
}
