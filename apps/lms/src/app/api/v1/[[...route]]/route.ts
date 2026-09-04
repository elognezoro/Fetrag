import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { app } from '@fetrag/api'
import type { Principal } from '@fetrag/domain'
import { guards } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type MountEnv = { Variables: { principal: Principal | null } }

/**
 * Montage de l'API Hono dans Next.js. Le principal issu du cookie de session Auth.js
 * est injecté dans le contexte (`c.get('principal')`) avant de déléguer à @fetrag/api.
 */
const mounted = new Hono<MountEnv>()

mounted.use('*', async (c, next) => {
  let principal: Principal | null = null
  try {
    principal = await guards.getPrincipal()
  } catch {
    principal = null
  }
  c.set('principal', principal)
  await next()
})

mounted.route('/', app)

const handler = handle(mounted)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
