// Déclaration ambiante de bcryptjs : rend l'import typé dans tout programme TypeScript qui compile ce fichier
// (apps Next via transpilePackages), y compris avant que `pnpm install` ait lié la dépendance déclarée.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
import { randomBytes, scryptSync } from 'node:crypto'

const BCRYPT_ROUNDS = 11

interface BcryptLike {
  hash(plain: string, rounds: number): Promise<string>
}

let bcryptModule: BcryptLike | null | undefined

/** Charge bcryptjs à la demande (même algorithme que @fetrag/auth pour la connexion locale). */
async function loadBcrypt(): Promise<BcryptLike | null> {
  if (bcryptModule !== undefined) return bcryptModule
  try {
    const loaded = await import('bcryptjs')
    const hash = loaded.hash ?? loaded.default?.hash
    bcryptModule = typeof hash === 'function' ? { hash } : null
  } catch {
    bcryptModule = null
  }
  return bcryptModule
}

/**
 * Hache un mot de passe pour un compte créé par le workflow institutionnel.
 * Utilise bcryptjs (compatible `verifyPassword` de @fetrag/auth). Si la bibliothèque
 * n'est pas disponible dans le processus, un hash scrypt non exploitable pour la connexion
 * est stocké : le participant devra passer par la réinitialisation du mot de passe
 * (lien d'invitation), ce qui reste le parcours nominal.
 */
export async function hashPassword(plain: string): Promise<string> {
  const bcrypt = await loadBcrypt()
  if (bcrypt) return bcrypt.hash(plain, BCRYPT_ROUNDS)
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(plain, salt, 64).toString('hex')
  return `$scrypt$${salt}$${derived}`
}
