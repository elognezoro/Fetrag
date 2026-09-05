// Variables de contexte Hono partagées par tous les middlewares et routes de l'API.
import type { Principal } from '@fetrag/domain'
import type { Logger } from '@fetrag/observability'

/** Mode d'authentification retenu pour la requête. */
export type AuthMethod = 'session' | 'api-key' | 'none'

/** Informations non sensibles sur la clé API utilisée (jamais le secret). */
export interface ApiKeyContext {
  id: string
  name: string
  scopes: string[]
}

export interface ApiVariables {
  /** Principal authentifié (session Auth.js, clé API) ou `null` pour un visiteur anonyme. */
  principal: Principal | null
  /** Identifiant de corrélation lu ou généré (`x-correlation-id`). */
  correlationId: string
  /** Logger JSON lié à la requête. */
  logger: Logger
  authMethod: AuthMethod
  apiKey: ApiKeyContext | null
  /** Horodatage de début (performance.now()) pour la mesure de durée. */
  requestStartedAt: number
}

/** Environnement Hono de l'API : identique à celui injecté par les apps Next (`principal`). */
export type ApiEnv = { Variables: ApiVariables }
