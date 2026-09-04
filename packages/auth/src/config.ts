import NextAuth, { CredentialsSignin, type NextAuthConfig, type NextAuthResult } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@fetrag/db'
import { features, getEnvSafe } from '@fetrag/config'
import { loginSchema } from '@fetrag/contracts'
import { audit, requiresMfa } from '@fetrag/domain'
import { verifyPassword } from './password'
import { verifyMfaForUser } from './mfa'
import { loadPrincipal } from './principal'
import { buildCookieOptions, SESSION_MAX_AGE } from './edge'

export type AppKind = 'web' | 'lms'

export class MfaRequiredError extends CredentialsSignin {
  override code = 'mfa_required'
}
export class InvalidCredentialsError extends CredentialsSignin {
  override code = 'invalid_credentials'
}
export class InactiveAccountError extends CredentialsSignin {
  override code = 'inactive'
}

/**
 * Configuration Auth.js complète (Node runtime) : adaptateur Prisma, providers, callbacks.
 * Les deux applications partagent secret, cookies et callbacks => SSO sur .fetrag.ga (ADR-002).
 */
export function createAuthConfig(app: AppKind): NextAuthConfig {
  const env = getEnvSafe()
  const providers: NextAuthConfig['providers'] = []

  if (features.oidc()) {
    providers.push({
      id: 'oidc',
      name: env.OIDC_DISPLAY_NAME ?? 'Compte FETRAG',
      type: 'oidc',
      issuer: env.OIDC_ISSUER,
      clientId: env.OIDC_CLIENT_ID,
      clientSecret: env.OIDC_CLIENT_SECRET,
      checks: ['pkce', 'state'],
      profile(profile: Record<string, unknown>) {
        return {
          id: String(profile.sub),
          email: (profile.email as string) ?? null,
          name: (profile.name as string) ?? null,
          image: (profile.picture as string) ?? null,
          emailVerified: profile.email_verified ? new Date() : null,
        }
      },
    })
  }

  if (features.localAuth()) {
    providers.push(
      Credentials({
        id: 'credentials',
        name: 'Email et mot de passe',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Mot de passe', type: 'password' },
          code: { label: 'Code de vérification', type: 'text' },
        },
        async authorize(raw) {
          const parsed = loginSchema.safeParse({ email: raw?.email, password: raw?.password })
          if (!parsed.success) throw new InvalidCredentialsError()
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              passwordHash: true,
              isActive: true,
              totpEnabled: true,
              totpSecret: true,
              backupCodes: true,
            },
          })
          const ok = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false
          if (!user || !ok) {
            await audit('auth.login_failed', { type: 'User', id: user?.id ?? null }, { actorEmail: parsed.data.email })
            throw new InvalidCredentialsError()
          }
          if (!user.isActive) throw new InactiveAccountError()

          let mfaVerified = !user.totpEnabled
          if (user.totpEnabled) {
            const code = typeof raw?.code === 'string' ? raw.code.trim() : ''
            if (!code) throw new MfaRequiredError()
            const valid = await verifyMfaForUser(user, code)
            if (!valid) throw new MfaRequiredError()
            mfaVerified = true
          }

          await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
          await audit('auth.login', { type: 'User', id: user.id }, { actorId: user.id, actorEmail: user.email })
          return { id: user.id, email: user.email, name: user.name, image: user.image, mfaVerified }
        },
      }),
    )
  }

  return {
    adapter: PrismaAdapter(prisma),
    providers,
    secret: env.AUTH_SECRET,
    trustHost: true,
    session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
    pages: { signIn: '/connexion', error: '/connexion', newUser: '/espace' },
    cookies: buildCookieOptions(),
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.sub = user.id
          token.email = user.email ?? token.email
          token.name = user.name ?? token.name
          token.picture = user.image ?? token.picture
          token.mfaVerified = (user as { mfaVerified?: boolean }).mfaVerified ?? false
          token.app = app
        }
        if (trigger === 'update' && session && typeof session === 'object') {
          const s = session as { name?: string; mfaVerified?: boolean; image?: string | null }
          if (typeof s.name === 'string') token.name = s.name
          if (typeof s.mfaVerified === 'boolean') token.mfaVerified = s.mfaVerified
          if (s.image !== undefined) token.picture = s.image
        }
        return token
      },
      async session({ session, token }) {
        if (token.sub) {
          session.user.id = token.sub
          session.user.mfaVerified = Boolean(token.mfaVerified)
        }
        return session
      },
    },
    events: {
      async signIn({ user, account }) {
        if (account?.provider && account.provider !== 'credentials' && user?.id) {
          await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => undefined)
          await audit('auth.login', { type: 'User', id: user.id }, { actorId: user.id, actorEmail: user.email ?? null })
        }
      },
    },
    logger: {
      error(error) {
        console.error('[auth]', error.name, error.message)
      },
      warn(code) {
        console.warn('[auth]', code)
      },
      debug() {},
    },
  }
}

export interface FetragAuth extends NextAuthResult {
  app: AppKind
}

/** Instancie Auth.js pour une application donnée. À appeler une seule fois par app. */
export function createAuth(app: AppKind): FetragAuth {
  const result = NextAuth(createAuthConfig(app))
  return Object.assign(result, { app })
}

export { loadPrincipal, requiresMfa }
