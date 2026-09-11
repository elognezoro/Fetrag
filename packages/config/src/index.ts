import { z } from 'zod'

/**
 * Configuration runtime validée (chapitre 39 du CDC).
 * Toute variable est lue ici, jamais via process.env directement dans le code métier.
 */
const bool = z
  .union([z.boolean(), z.string()])
  .default('false')
  .transform((v) => (typeof v === 'boolean' ? v : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())))

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined))

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  VERCEL_URL: optionalString,

  DATABASE_URL: z.string().min(1, 'DATABASE_URL est obligatoire'),
  DATABASE_URL_UNPOOLED: optionalString,

  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET doit contenir au moins 16 caractères'),
  AUTH_URL: optionalString,
  AUTH_TRUST_HOST: bool,
  AUTH_COOKIE_DOMAIN: optionalString,
  FEATURE_LOCAL_AUTH: bool.default('true'),

  OIDC_ISSUER: optionalString,
  OIDC_CLIENT_ID: optionalString,
  OIDC_CLIENT_SECRET: optionalString,
  OIDC_DISPLAY_NAME: z.string().default('Compte FETRAG'),

  APP_WEB_URL: z.string().url().default('http://localhost:3000'),
  APP_LMS_URL: z.string().url().default('http://localhost:3001'),
  API_URL: optionalString,

  /** console | resend | smtp. Absent : déduit de RESEND_API_KEY puis SMTP_HOST (voir emailProvider()). */
  EMAIL_PROVIDER: z.enum(['console', 'resend', 'smtp']).optional(),
  /** Expéditeur commun à tous les fournisseurs, ex. « FETRAG <no-reply@fetrag.ga> » (domaine vérifié chez Resend). */
  EMAIL_FROM: optionalString,
  RESEND_API_KEY: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  SMTP_FROM: optionalString,

  STORAGE_PROVIDER: z.enum(['local', 'vercel-blob', 's3']).default('local'),
  BLOB_READ_WRITE_TOKEN: optionalString,
  S3_ENDPOINT: optionalString,
  S3_REGION: z.string().default('eu-west-1'),
  S3_BUCKET_PUBLIC: z.string().default('fetrag-public'),
  S3_BUCKET_PRIVATE: z.string().default('fetrag-private'),
  S3_ACCESS_KEY_ID: optionalString,
  S3_SECRET_ACCESS_KEY: optionalString,

  PAYMENT_PROVIDER: z.enum(['sandbox', 'airtel-money', 'moov-money', 'stripe']).default('sandbox'),
  PAYMENT_WEBHOOK_SECRET: z.string().default('change-me'),

  CRON_SECRET: z.string().default('change-me'),

  FEATURE_PAYMENTS: bool.default('true'),
  FEATURE_FORUMS: bool.default('true'),
  FEATURE_NEWSLETTER: bool.default('true'),
})

export type Env = z.infer<typeof envSchema>

let cached: Env | undefined

/**
 * Lit et valide l'environnement une seule fois par process.
 * Lance une erreur explicite listant les variables manquantes.
 */
/**
 * Tolère une variable saisie avec une casse différente dans l'hébergeur (ex. `resend_api_key`) :
 * la valeur est recopiée sous le nom attendu si celui-ci est absent.
 */
function normalizeEnvCase(): void {
  const expected = ['RESEND_API_KEY', 'EMAIL_FROM', 'EMAIL_PROVIDER', 'CRON_SECRET', 'PAYMENT_WEBHOOK_SECRET', 'BLOB_READ_WRITE_TOKEN']
  for (const name of expected) {
    if (process.env[name]) continue
    const alias = Object.keys(process.env).find((key) => key !== name && key.toUpperCase() === name)
    if (alias && process.env[alias]) process.env[name] = process.env[alias]
  }
}

export function getEnv(): Env {
  if (cached) return cached
  normalizeEnvCase()
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Configuration invalide :\n${issues}`)
  }
  cached = parsed.data
  return cached
}

/** Variante non bloquante pour les contextes de build (Next.js collecte les pages sans env complet). */
export function getEnvSafe(): Partial<Env> {
  normalizeEnvCase()
  const parsed = envSchema.safeParse(process.env)
  return parsed.success ? parsed.data : (process.env as unknown as Partial<Env>)
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/** Résout l'URL publique de l'application en tenant compte de Vercel. */
export function resolvePublicUrl(kind: 'web' | 'lms'): string {
  const env = getEnvSafe()
  const explicit = kind === 'web' ? env.APP_WEB_URL : env.APP_LMS_URL
  if (explicit && !explicit.includes('localhost')) return explicit
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return explicit ?? (kind === 'web' ? 'http://localhost:3000' : 'http://localhost:3001')
}

export const features = {
  localAuth: () => getEnvSafe().FEATURE_LOCAL_AUTH !== false,
  payments: () => getEnvSafe().FEATURE_PAYMENTS !== false,
  forums: () => getEnvSafe().FEATURE_FORUMS !== false,
  newsletter: () => getEnvSafe().FEATURE_NEWSLETTER !== false,
  oidc: () => {
    const e = getEnvSafe()
    return Boolean(e.OIDC_ISSUER && e.OIDC_CLIENT_ID && e.OIDC_CLIENT_SECRET)
  },
}

/** Fournisseur email effectif : explicite, sinon Resend si sa clé existe, sinon SMTP si un hôte existe, sinon console. */
export function emailProvider(): 'console' | 'resend' | 'smtp' {
  const e = getEnvSafe()
  if (e.EMAIL_PROVIDER) return e.EMAIL_PROVIDER
  if (e.RESEND_API_KEY) return 'resend'
  if (e.SMTP_HOST) return 'smtp'
  return 'console'
}

/** Constantes produit partagées. */
export const site = {
  name: 'FETRAG',
  fullName: 'Fédération des Travailleurs du Gabon',
  motto: ['Travail', 'Efficacité', 'Solidarité'] as const,
  domains: { web: 'fetrag.ga', lms: 'formation.fetrag.ga' },
  contact: {
    address: 'BP 1234 Libreville, Gabon',
    email: 'jossngomafm@gmail.com',
    phones: ['066 23 00 33', '077 52 27 98'],
  },
  secretaryGeneral: 'Jocelyn Louis NGOMA',
  locale: 'fr-GA',
  timezone: 'Africa/Libreville',
  currency: 'XAF',
} as const
