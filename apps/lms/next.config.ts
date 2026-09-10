import fs from 'node:fs'
import path from 'node:path'
import type { NextConfig } from 'next'

/** Racine du monorepo (utile pour le tracing des fichiers et le .env partagé). */
const monorepoRoot = path.join(__dirname, '../../')

/**
 * Charge le fichier .env racine en développement local uniquement.
 * Parser minimal sans dépendance : ignore commentaires et lignes vides, gère les guillemets,
 * n'écrase jamais une variable déjà présente dans l'environnement.
 */
function loadRootEnv(): void {
  if (process.env.VERCEL || process.env.CI) return
  const envPath = path.join(monorepoRoot, '.env')
  if (!fs.existsSync(envPath)) return
  let content = ''
  try {
    content = fs.readFileSync(envPath, 'utf8')
  } catch {
    return
  }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator <= 0) continue
    const key = line.slice(0, separator).trim().replace(/^export\s+/, '')
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    let value = line.slice(separator + 1).trim()
    const first = value.charAt(0)
    const last = value.charAt(value.length - 1)
    if (value.length >= 2 && ((first === '"' && last === '"') || (first === "'" && last === "'"))) {
      value = value.slice(1, -1)
      if (first === '"') value = value.replace(/\\n/g, '\n')
    } else {
      const comment = value.indexOf(' #')
      if (comment >= 0) value = value.slice(0, comment).trim()
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadRootEnv()

const isDev = process.env.NODE_ENV !== 'production'

/** Politique de sécurité de contenu compatible next/font (auto-hébergé), scripts inline de Next et médias pédagogiques. */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https:${isDev ? ' ws: wss:' : ''}`,
  "media-src 'self' blob: https:",
  "frame-src 'self' https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  transpilePackages: [
    '@fetrag/analytics',
    '@fetrag/api',
    '@fetrag/auth',
    '@fetrag/cms',
    '@fetrag/config',
    '@fetrag/contracts',
    '@fetrag/db',
    '@fetrag/design-tokens',
    '@fetrag/domain',
    '@fetrag/jobs',
    '@fetrag/lms-core',
    '@fetrag/notifications',
    '@fetrag/observability',
    '@fetrag/payments',
    '@fetrag/search',
    '@fetrag/storage',
    '@fetrag/ui',
  ],
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs', 'nodemailer', 'pdf-lib'],
  outputFileTracingRoot: monorepoRoot,
  // Le moteur Prisma (fichier .node) doit accompagner chaque fonction serverless (Vercel).
  outputFileTracingIncludes: {
    '/**': ['../../packages/db/generated/client/**/*.node', '../../packages/db/generated/client/schema.prisma'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'fetrag.ga' },
      { protocol: 'https', hostname: '*.fetrag.ga' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
