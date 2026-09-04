import { prisma, type Prisma } from '@fetrag/db'

/** Client Prisma ou client transactionnel : permet de réutiliser les helpers dans une transaction. */
export type Db = Prisma.TransactionClient | typeof prisma

export { prisma }
