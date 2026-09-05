// Documentation OpenAPI 3 (`/api/v1/openapi.json`) et Swagger UI (`/api/v1/docs`).
import { swaggerUI } from '@hono/swagger-ui'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { ApiEnv } from './env'

export const API_VERSION = '1.0.0'
export const API_BASE_PATH = '/api/v1'

export const securitySchemes = {
  ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'Clé API (SystemSetting `api.keys`), hachée SHA-256 côté serveur.' },
  SessionCookie: { type: 'apiKey', in: 'cookie', name: 'authjs.session-token', description: 'Cookie de session Auth.js partagé (SSO .fetrag.ga) ; `__Secure-authjs.session-token` en HTTPS.' },
} as const

/** Sécurité déclarée sur les routes protégées (l'une ou l'autre méthode suffit). */
export const protectedSecurity: Array<Record<string, string[]>> = [{ ApiKeyAuth: [] }, { SessionCookie: [] }]

export const apiTags = [
  { name: 'Santé', description: 'Supervision de la plateforme' },
  { name: 'Formations', description: 'Catalogue public du LMS formation.fetrag.ga' },
  { name: 'Contenus', description: 'Actualités, événements, services, ressources du site fetrag.ga' },
  { name: 'Recherche', description: 'Recherche transverse sur les contenus publiés' },
  { name: 'Certificats', description: 'Vérification publique et émission' },
  { name: 'Formulaires', description: 'Contact, assistance, adhésion, partenariat, newsletter' },
  { name: 'Compte', description: 'Profil, inscriptions, certificats et commandes de l’utilisateur connecté' },
  { name: 'Apprentissage', description: 'Inscriptions, progression, évaluations' },
  { name: 'Demandes de formation', description: 'Workflow institutionnel des organisations affiliées' },
  { name: 'Organisations', description: 'Rapports d’organisation' },
  { name: 'Paiements', description: 'Commandes, paiement, webhooks PSP' },
  { name: 'Administration', description: 'Statistiques et supervision des jobs' },
]

export function registerOpenApi<E extends ApiEnv>(app: OpenAPIHono<E, Record<string, never>, typeof API_BASE_PATH>): void {
  for (const [name, scheme] of Object.entries(securitySchemes)) {
    app.openAPIRegistry.registerComponent('securitySchemes', name, scheme)
  }
  app.doc('/openapi.json', {
    openapi: '3.0.3',
    info: {
      title: 'API FETRAG',
      version: API_VERSION,
      description:
        'API REST de l’écosystème numérique de la Fédération des Travailleurs du Gabon : catalogue de formation, contenus institutionnels, ' +
        'espace apprenant, workflow des demandes de formation, paiements et certificats. Toutes les réponses sont en JSON ; ' +
        'les erreurs suivent le format `{ error: { code, message, details?, correlationId } }`.',
      contact: { name: 'FETRAG', email: 'jossngomafm@gmail.com', url: 'https://fetrag.ga' },
    },
    servers: [{ url: API_BASE_PATH, description: 'Préfixe commun (fetrag.ga, formation.fetrag.ga ou serveur API autonome)' }],
    tags: apiTags,
  })
  app.get('/docs', swaggerUI({ url: `${API_BASE_PATH}/openapi.json`, title: 'API FETRAG' }))
}
