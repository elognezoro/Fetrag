// @fetrag/auth - Auth.js v5, SSO, MFA, gardes serveur (ADR-002)
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./next-auth.d.ts" />
export { createAuth, createAuthConfig, MfaRequiredError, InvalidCredentialsError, InactiveAccountError, EmailNotVerifiedError } from './config'
export { createEmailToken, consumeEmailToken, purgeExpiredEmailTokens } from './tokens'
export type { EmailTokenPurpose } from './tokens'
export type { AppKind, FetragAuth } from './config'
export { createGuards } from './guards'
export type { Guards, SessionGetter } from './guards'
export { loadPrincipal } from './principal'
export { hashPassword, verifyPassword } from './password'
export {
  generateTotpSecret,
  totpUri,
  totpQrDataUrl,
  verifyTotp,
  generateBackupCodes,
  enableMfa,
  disableMfa,
  verifyMfaForUser,
} from './mfa'
export { edgeAuth, edgeAuthConfig, buildCookieOptions, sessionCookieName, SESSION_MAX_AGE } from './edge'
