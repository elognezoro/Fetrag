import { PrismaClient } from '../generated/client'

// Modules Node résolus à l'exécution (process.getBuiltinModule, Node >= 20.16) : aucune référence statique
// à node:fs / node:path, afin que ce fichier reste inoffensif s'il est atteint par un bundle client.
type FsLike = { existsSync(p: string): boolean }
type PathLike = { join(...parts: string[]): string }
function builtin<T>(name: string): T | undefined {
  const getter = (process as { getBuiltinModule?: (id: string) => unknown }).getBuiltinModule
  return typeof getter === 'function' ? (getter.call(process, name) as T) : undefined
}

declare global {
  // eslint-disable-next-line no-var
  var __fetragPrisma: PrismaClient | undefined
}

/**
 * Sur Vercel, le client généré est bundlé par Next.js : Prisma ne peut plus déduire l'emplacement
 * du moteur natif (« could not locate the Query Engine »). On le lui indique explicitement quand
 * le fichier tracé est présent (voir outputFileTracingIncludes dans next.config.ts).
 */
function pointToQueryEngine(): void {
  if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) return
  const platformFile =
    process.platform === 'win32'
      ? 'query_engine-windows.dll.node'
      : process.platform === 'darwin'
        ? process.arch === 'arm64'
          ? 'libquery_engine-darwin-arm64.dylib.node'
          : 'libquery_engine-darwin.dylib.node'
        : 'libquery_engine-rhel-openssl-3.0.x.so.node'
  const fs = builtin<FsLike>('node:fs')
  const path = builtin<PathLike>('node:path')
  if (!fs || !path) return
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, 'packages/db/generated/client', platformFile),
    path.join(cwd, '../../packages/db/generated/client', platformFile),
    path.join(cwd, '../packages/db/generated/client', platformFile),
    path.join(cwd, 'generated/client', platformFile),
  ]
  const found = candidates.find((candidate) => fs.existsSync(candidate))
  if (found) process.env.PRISMA_QUERY_ENGINE_LIBRARY = found
}

function createClient(): PrismaClient {
  pointToQueryEngine()
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

/**
 * Client Prisma singleton (évite l'épuisement des connexions en dev / serverless).
 * Le client est généré dans packages/db/generated/client (voir schema.prisma) afin que
 * Next.js embarque le moteur natif dans les fonctions serverless Vercel.
 * Utiliser la chaîne poolée (Neon pgbouncer) dans DATABASE_URL.
 */
export const prisma: PrismaClient = globalThis.__fetragPrisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__fetragPrisma = prisma
}

export type { PrismaClient }
