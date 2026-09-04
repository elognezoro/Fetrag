import 'server-only'
import { createAuth, createGuards } from '@fetrag/auth'

/**
 * Instance Auth.js de l'application web (fetrag.ga).
 * `handlers` alimente la route /api/auth/[...nextauth], `auth` lit la session côté serveur,
 * `signIn` / `signOut` sont utilisés par les Server Actions.
 */
export const { handlers, auth, signIn, signOut } = createAuth('web')

/** Gardes serveur : identité + rôle + portée (redirigent vers /connexion ou /acces-refuse). */
export const guards = createGuards(auth)
