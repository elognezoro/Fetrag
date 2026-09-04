import NextAuth, { type NextAuthConfig } from 'next-auth'

/**
 * Configuration Auth.js « edge-safe » (sans Prisma ni bcrypt) pour le middleware Next.js.
 * Elle partage secret, stratégie JWT et cookies avec la configuration complète,
 * ce qui permet de décoder la session dans le middleware.
 */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // 14 jours

function isSecure(): boolean {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.APP_WEB_URL ?? ''
  return process.env.NODE_ENV === 'production' || url.startsWith('https://')
}

export function sessionCookieName(): string {
  return isSecure() ? '__Secure-authjs.session-token' : 'authjs.session-token'
}

export function buildCookieOptions(): NextAuthConfig['cookies'] {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim()
  const secure = isSecure()
  if (!domain) return undefined
  return {
    sessionToken: {
      name: sessionCookieName(),
      options: { domain, httpOnly: true, sameSite: 'lax', path: '/', secure },
    },
    callbackUrl: {
      name: secure ? '__Secure-authjs.callback-url' : 'authjs.callback-url',
      options: { domain, sameSite: 'lax', path: '/', secure },
    },
    csrfToken: {
      name: secure ? '__Host-authjs.csrf-token' : 'authjs.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure },
    },
  }
}

export const edgeAuthConfig: NextAuthConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
  pages: { signIn: '/connexion', error: '/connexion' },
  cookies: buildCookieOptions(),
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.mfaVerified = Boolean(token.mfaVerified)
      }
      return session
    },
  },
}

/** `auth` utilisable dans middleware.ts (Edge runtime). */
export const { auth: edgeAuth } = NextAuth(edgeAuthConfig)
