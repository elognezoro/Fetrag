#!/usr/bin/env node
/**
 * Audit des guides d'utilisation par rôle (Playwright/Chromium) : pour chaque compte de démonstration,
 * vérifie que les pages de guide autorisées s'affichent (bon guide), que les guides des autres rôles
 * sont refusés (redirection vers /acces-refuse ou /connexion), qu'aucun débordement horizontal
 * n'apparaît sur mobile, et enregistre des captures (mobile + ordinateur).
 *
 * Usage :
 *   node scripts/guides-audit.mjs --app web --base http://localhost:3000 [--password Fetrag2026!] [--out .audit/guides-web] [--no-shots]
 *   node scripts/guides-audit.mjs --app lms --base http://localhost:3001
 * Code de sortie 1 si une attente n'est pas satisfaite.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
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

const app = args.app ?? 'web'
const base = (args.base ?? (app === 'web' ? 'http://localhost:3000' : 'http://localhost:3001')).replace(/\/+$/, '')
const password = args.password ?? process.env.DEMO_PASSWORD ?? 'Fetrag2026!'
const out = args.out ?? path.join('.audit', `guides-${app}`)
const shots = args['no-shots'] !== 'true'

const accounts = {
  apprenant: 'apprenant1@demo.fetrag.ga',
  responsable: 'responsable@synatep-demo.ga',
  formateur: 'formateur@fetrag.ga',
  editeur: 'editeur@fetrag.ga',
  services: 'services@fetrag.ga',
  finance: 'finance@fetrag.ga',
  support: 'support@fetrag.ga',
  coordination: 'coordination@fetrag.ga',
  admin: 'admin@fetrag.ga',
}

/**
 * Attentes : `guide` = identifiant du guide attendu (data-guide-id ou titre), `denied` = redirection attendue
 * vers /acces-refuse, `login` = redirection vers /connexion, `other` = page 200 mais pas un guide (ex. « aucune organisation »).
 */
const matrix = {
  web: [
    { account: null, route: '/espace/guide', expect: 'login' },
    { account: null, route: '/admin/guide', expect: 'login' },
    { account: 'apprenant', route: '/espace/guide', expect: 'guide', guide: 'web-membre', shot: true },
    { account: 'apprenant', route: '/espace/guide/web-editeur', expect: 'denied' },
    { account: 'apprenant', route: '/espace/guide/web-organisation', expect: 'denied' },
    { account: 'apprenant', route: '/admin/guide', expect: 'denied' },
    { account: 'apprenant', route: '/espace/guide/inconnu', expect: 'notfound' },
    { account: 'responsable', route: '/espace/guide/web-organisation', expect: 'guide', guide: 'web-organisation', shot: true },
    { account: 'responsable', route: '/espace/guide/web-finance', expect: 'denied' },
    { account: 'responsable', route: '/admin/guide', expect: 'denied' },
    { account: 'formateur', route: '/espace/guide', expect: 'guide', guide: 'web-membre' },
    { account: 'formateur', route: '/espace/guide/web-coordination', expect: 'denied' },
    { account: 'editeur', route: '/admin/guide', expect: 'guide', guide: 'web-editeur', shot: true },
    { account: 'editeur', route: '/admin/guide/web-finance', expect: 'denied' },
    { account: 'editeur', route: '/espace/guide/web-editeur', expect: 'guide', guide: 'web-editeur' },
    { account: 'services', route: '/admin/guide', expect: 'guide', guide: 'web-services', shot: true },
    { account: 'services', route: '/admin/guide/web-editeur', expect: 'denied' },
    { account: 'finance', route: '/admin/guide', expect: 'guide', guide: 'web-finance', shot: true },
    { account: 'finance', route: '/admin/guide/web-support', expect: 'denied' },
    { account: 'support', route: '/admin/guide', expect: 'guide', guide: 'web-support', shot: true },
    { account: 'support', route: '/admin/guide/web-administrateur', expect: 'denied' },
    { account: 'coordination', route: '/admin/guide', expect: 'guide', guide: 'web-coordination', shot: true },
    { account: 'coordination', route: '/admin/guide/web-finance', expect: 'denied' },
    { account: 'admin', route: '/admin/guide', expect: 'guide', guide: 'web-administrateur', shot: true },
    { account: 'admin', route: '/admin/guide/web-finance', expect: 'guide', guide: 'web-finance' },
    { account: 'admin', route: '/espace/guide', expect: 'guide', guide: 'web-membre' },
  ],
  lms: [
    { account: null, route: '/guide', expect: 'login' },
    { account: null, route: '/coordination/guide', expect: 'login' },
    { account: 'apprenant', route: '/guide', expect: 'guide', guide: 'lms-apprenant', shot: true },
    { account: 'apprenant', route: '/formateur/guide', expect: 'denied' },
    { account: 'apprenant', route: '/coordination/guide', expect: 'denied' },
    { account: 'apprenant', route: '/admin/guide', expect: 'denied' },
    { account: 'apprenant', route: '/organisation/guide', expect: 'other' },
    { account: 'responsable', route: '/organisation/guide', expect: 'guide', guide: 'lms-organisation', shot: true },
    { account: 'responsable', route: '/formateur/guide', expect: 'denied' },
    { account: 'formateur', route: '/formateur/guide', expect: 'guide', guide: 'lms-formateur', shot: true },
    { account: 'formateur', route: '/coordination/guide', expect: 'denied' },
    { account: 'formateur', route: '/guide', expect: 'guide', guide: 'lms-apprenant' },
    { account: 'editeur', route: '/guide', expect: 'guide', guide: 'lms-apprenant' },
    { account: 'editeur', route: '/formateur/guide', expect: 'denied' },
    { account: 'coordination', route: '/coordination/guide', expect: 'guide', guide: 'lms-coordination', shot: true },
    { account: 'coordination', route: '/admin/guide', expect: 'guide', guide: 'lms-coordination' },
    { account: 'coordination', route: '/formateur/guide', expect: 'denied' },
    { account: 'admin', route: '/admin/guide', expect: 'guide', guide: 'lms-administrateur', shot: true },
    { account: 'admin', route: '/coordination/guide', expect: 'guide', guide: 'lms-coordination' },
    { account: 'admin', route: '/guide', expect: 'guide', guide: 'lms-apprenant' },
  ],
}

/** Connexion par le flux Auth.js (credentials) : pose le cookie de session dans le contexte. */
async function login(context, email) {
  const csrfRes = await context.request.get(`${base}/api/auth/csrf`, { timeout: 180_000 })
  const { csrfToken } = await csrfRes.json()
  const res = await context.request.post(`${base}/api/auth/callback/credentials`, {
    form: { csrfToken, email, password, callbackUrl: `${base}/` },
    maxRedirects: 0,
    timeout: 180_000,
  })
  const location = res.headers()['location'] ?? ''
  if (location.includes('error=')) throw new Error(`Connexion refusée pour ${email} : ${location}`)
}

function slug(value) {
  return value.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'racine'
}

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
const results = []
let failures = 0

const byAccount = new Map()
for (const check of matrix[app] ?? []) {
  const key = check.account ?? '__anonyme__'
  if (!byAccount.has(key)) byAccount.set(key, [])
  byAccount.get(key).push(check)
}

for (const [key, checks] of byAccount) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, locale: 'fr-GA' })
  const account = key === '__anonyme__' ? null : key
  try {
    if (account) await login(context, accounts[account])
  } catch (error) {
    console.log(`ERREUR connexion ${account} : ${error.message.split('\n')[0]}`)
    failures += checks.length
    await context.close()
    continue
  }
  for (const check of checks) {
    const page = await context.newPage()
    const entry = { account, route: check.route, expect: check.expect }
    try {
      const response = await page.goto(`${base}${check.route}`, { waitUntil: 'networkidle', timeout: 120_000 })
      await page.waitForTimeout(600)
      const finalUrl = page.url().replace(base, '')
      const status = response?.status() ?? null
      const guideId = await page.locator('[data-guide-id]').first().getAttribute('data-guide-id').catch(() => null)
      const h1 = (await page.locator('h1').first().textContent().catch(() => '') ?? '').replace(/\s+/g, ' ').trim()
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth))
      Object.assign(entry, { status, finalUrl, guideId, h1, overflow })

      let ok = false
      if (check.expect === 'guide') ok = status === 200 && (guideId === check.guide || (guideId === null && h1.length > 0)) && !finalUrl.includes('acces-refuse') && !finalUrl.includes('connexion')
      else if (check.expect === 'denied') ok = finalUrl.includes('/acces-refuse')
      else if (check.expect === 'login') ok = finalUrl.includes('/connexion')
      // En dev, Next.js renvoie parfois 200 pour une page notFound() ; on valide donc le comportement :
      // aucun guide rendu, pas de redirection vers un espace, et une page « introuvable ».
      else if (check.expect === 'notfound')
        ok = status === 404 || (guideId === null && !finalUrl.includes('acces-refuse') && !finalUrl.includes('connexion') && /introuvable|not[\s-]?found|404|n['’]existe pas/i.test(h1))
      else if (check.expect === 'other') ok = status === 200 && guideId === null && !finalUrl.includes('acces-refuse')
      if (check.expect === 'guide' && guideId !== null && guideId !== check.guide) ok = false
      if (check.expect === 'guide' && overflow > 0) {
        entry.overflowNote = `débordement horizontal de ${overflow}px à 375px`
        ok = false
      }
      entry.ok = ok
      if (!ok) failures++

      if (ok && check.expect === 'guide' && check.shot && shots) {
        const name = `${account ?? 'anonyme'}-${slug(check.route)}`
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 60))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForTimeout(400)
        await page.screenshot({ path: path.join(out, `${name}-mobile.png`), fullPage: false })
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.waitForTimeout(500)
        await page.screenshot({ path: path.join(out, `${name}-desktop.png`), fullPage: false })
        await page.setViewportSize({ width: 375, height: 812 })
        entry.shots = [`${name}-mobile.png`, `${name}-desktop.png`]
      }
      console.log(`${ok ? 'OK ' : 'KO '} ${(account ?? 'anonyme').padEnd(13)} ${check.route.padEnd(36)} attendu=${check.expect}${check.guide ? `(${check.guide})` : ''} obtenu=${status} ${finalUrl}${guideId ? ` guide=${guideId}` : ''}${entry.overflowNote ? ` ${entry.overflowNote}` : ''}`)
    } catch (error) {
      entry.ok = false
      entry.error = error instanceof Error ? error.message.split('\n')[0] : String(error)
      failures++
      console.log(`KO  ${(account ?? 'anonyme').padEnd(13)} ${check.route.padEnd(36)} ERREUR ${entry.error}`)
    } finally {
      results.push(entry)
      await page.close()
    }
  }
  await context.close()
}

await browser.close()
await writeFile(path.join(out, 'report.json'), JSON.stringify({ app, base, generatedAt: new Date().toISOString(), failures, results }, null, 2))
console.log(`\n${results.length - failures}/${results.length} vérifications réussies. Rapport : ${path.join(out, 'report.json')}`)
process.exit(failures > 0 ? 1 : 0)
