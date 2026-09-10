#!/usr/bin/env node
/**
 * Captures « écran par écran » (taille du viewport, pas pleine page) d'une liste de routes en
 * largeur mobile, pour revue visuelle. Complète scripts/mobile-audit.mjs (qui mesure).
 *
 * Usage :
 *   node scripts/mobile-screens.mjs --base http://localhost:3000 --routes "/,/actualites" [--login email:mdp] [--width 375] [--screens 6] [--out .audit/screens/web]
 * Sortie : <out>/<route>-<index>.png (index = écran successif de haut en bas) + <out>/index.json
 * Sous Git Bash, préfixer par MSYS_NO_PATHCONV=1 pour que "/" ne soit pas converti en chemin Windows.
 */
import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let chromium
try {
  ;({ chromium } = require(path.resolve(process.cwd(), 'apps/web/node_modules/@playwright/test')))
} catch {
  ;({ chromium } = require('@playwright/test'))
}

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a, i, arr) => (a.startsWith('--') ? [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]] : null))
    .filter(Boolean),
)
const base = (args.base ?? 'http://localhost:3000').replace(/\/+$/, '')
const routes = (args.routes ?? '/').split(',').map((r) => r.trim()).filter(Boolean)
const width = Number(args.width ?? 375)
const height = width < 400 ? 812 : 932
const maxScreens = Number(args.screens ?? 6)
const out = args.out ?? path.join('.audit', 'screens')
await mkdir(out, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-GA' })

if (args.login) {
  const [email, password] = args.login.split(':')
  const csrfRes = await context.request.get(`${base}/api/auth/csrf`, { timeout: 180_000 })
  const { csrfToken } = await csrfRes.json()
  const res = await context.request.post(`${base}/api/auth/callback/credentials`, {
    form: { csrfToken, email, password, callbackUrl: `${base}/` },
    maxRedirects: 0,
    timeout: 180_000,
  })
  const location = res.headers()['location'] ?? ''
  if (location.includes('error=')) console.error(`Connexion refusée pour ${email} : ${location}`)
}

const page = await context.newPage()
page.setDefaultTimeout(120_000)
const index = []

for (const route of routes) {
  const slug = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'accueil'
  try {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120_000 })
    await page.waitForTimeout(800)
    // déclenche les animations de révélation en parcourant la page, puis remonte
    const total = await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo(0, 0)
      return document.body.scrollHeight
    })
    await page.waitForTimeout(500)
    const screens = Math.min(maxScreens, Math.max(1, Math.ceil(total / height)))
    const files = []
    for (let i = 0; i < screens; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * height)
      await page.waitForTimeout(450)
      const file = path.join(out, `${slug}-${i}.png`)
      await page.screenshot({ path: file })
      files.push(file)
    }
    index.push({ route, status: response?.status() ?? null, finalUrl: page.url().replace(base, ''), height: total, files })
    console.log(`${response?.status() ?? '---'} ${route} -> ${files.length} écran(s), hauteur ${total}px`)
  } catch (error) {
    index.push({ route, error: error instanceof Error ? error.message.split('\n')[0] : String(error) })
    console.log(`ERREUR ${route} : ${error instanceof Error ? error.message.split('\n')[0] : error}`)
  }
}

await browser.close()
await writeFile(path.join(out, 'index.json'), JSON.stringify({ base, width, generatedAt: new Date().toISOString(), pages: index }, null, 2))
console.log(`Captures : ${out}`)
