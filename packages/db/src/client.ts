import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __fetragPrisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

/**
 * Client Prisma singleton (évite l'épuisement des connexions en dev / serverless).
 * Utiliser la chaîne poolée (Neon pgbouncer) dans DATABASE_URL.
 */
export const prisma: PrismaClient = globalThis.__fetragPrisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__fetragPrisma = prisma
}

export type { PrismaClient }
