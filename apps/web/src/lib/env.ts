import { features, getEnv, getEnvSafe, isProduction, resolvePublicUrl } from '@fetrag/config'

/** Retire la barre oblique finale d'une URL de base. */
function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const candidate = value && value.trim().length > 0 ? value.trim() : fallback
  return candidate.replace(/\/+$/, '')
}

/**
 * Variables publiques inlinées côté client par Next.js.
 * Elles doivent être référencées littéralement (`process.env.NEXT_PUBLIC_*`) pour être remplacées au build.
 */
export const publicEnv = {
  webUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_WEB_URL, 'http://localhost:3000'),
  lmsUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_LMS_URL, 'http://localhost:3001'),
  siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'FETRAG',
} as const

/** Identifiant de l'application pour Auth.js, l'analytics et les logs. */
export const APP_KIND = 'web' as const

export { features, getEnv, getEnvSafe, isProduction, resolvePublicUrl }
