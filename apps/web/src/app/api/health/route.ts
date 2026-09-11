import { NextResponse } from 'next/server'
import { emailProvider, getEnvSafe } from '@fetrag/config'
import { prisma } from '@fetrag/db'
import { runHealthChecks } from '@fetrag/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Sonde de santé : base de données (SELECT 1) et configuration minimale. */
export async function GET(): Promise<NextResponse> {
  const result = await runHealthChecks([
    {
      name: 'database',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
        return { ok: true }
      },
    },
    {
      name: 'config',
      check: async () => {
        const env = getEnvSafe()
        const missing = [
          !env.DATABASE_URL ? 'DATABASE_URL' : null,
          !env.AUTH_SECRET ? 'AUTH_SECRET' : null,
        ].filter((v): v is string => v !== null)
        return missing.length === 0 ? { ok: true } : { ok: false, detail: `Variables manquantes : ${missing.join(', ')}` }
      },
    },
  ])

  return NextResponse.json(
    {
      app: 'web',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      // Diagnostic non sensible : fournisseur email effectif et présence d'un expéditeur configuré.
      email: {
        provider: emailProvider(),
        senderConfigured: Boolean(getEnvSafe().EMAIL_FROM),
        // Noms (jamais les valeurs) des variables d'environnement liées aux emails réellement visibles par la fonction.
        variablesVisibles: Object.keys(process.env).filter((key) => /resend|email_from|email_provider|smtp_host/i.test(key)).sort(),
      },
      ...result,
    },
    { status: result.ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
