#!/usr/bin/env node
/**
 * Audit mobile automatisé (Playwright/Chromium) : pour chaque route et chaque largeur d'écran,
 * détecte le débordement horizontal (scrollWidth > largeur), liste les éléments fautifs,
 * vérifie l'ouverture du menu mobile et enregistre une capture pleine page.
 *
 * Usage :
 *   node scripts/mobile-audit.mjs --base http://localhost:3000 --app web [--login admin@fetrag.ga:Fetrag2026!] [--out .audit/web]
 *   node scripts/mobile-audit.mjs --base http://localhost:3001 --app lms --login apprenant1@demo.fetrag.ga:Fetrag2026!
 * Options : --routes "/,/actualites" (liste explicite), --widths 375,390,430, --no-shots
 * Résultat : <out>/report.json + captures <out>/<width>/<route>.png ; code de sortie 1 si un débordement est détecté.
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

const base = (args.base ?? 'http://localhost:3000').replace(/\/+$/, '')
const app = args.app ?? 'web'
const out = args.out ?? path.join('.audit', app)
const widths = (args.widths ?? '375,390,430').split(',').map((w) => Number(w.trim()))
const shots = args['no-shots'] !== 'true'

const defaultRoutes = {
  web: [
    '/', '/la-fetrag', '/organisations', '/actualites', '/formations', '/services', '/ressources', '/evenements',
    '/adhesion', '/partenariat', '/contact', '/recherche?q=travail', '/faq', '/certificats/verifier',
    '/certificats/verifier/K7MP-3QXR-9TVD', '/connexion', '/inscription', '/mentions-legales',
    '/espace', '/espace/profil', '/espace/inscriptions', '/espace/paiements', '/espace/notifications', '/espace/securite',
    '/admin', '/admin/actualites', '/admin/pages', '/admin/services', '/admin/demandes', '/admin/finance', '/admin/utilisateurs', '/admin/rapports',
  ],
  lms: [
    '/', '/catalogue', '/cours/fondamentaux-du-syndicalisme-gabonais', '/connexion', '/dashboard', '/mes-formations',
    '/devoirs', '/forums', '/calendrier', '/certificats', '/demande-formation', '/organisation', '/formateur', '/coordination', '/admin',
  ],
}
const routes = args.routes ? args.routes.split(',').map((r) => r.trim()) : defaultRoutes[app] ?? defaultRoutes.web

/** Connexion par le flux Auth.js (credentials) via le contexte de requêtes : pose le cookie de session. */
async function login(context, email, password) {
  const csrfRes = await context.request.get(`${base}/api/auth/csrf`, { timeout: 180_000 })
  const { csrfToken } = await csrfRes.json()
  const res = await context.request.post(`${base}/api/auth/callback/credentials`, {
    form: { csrfToken, email, password, callbackUrl: `${base}/` },
    maxRedirects: 0,
    timeout: 180_000,
  })
  const location = res.headers()['location'] ?? ''
  if (location.includes('error=')) throw new Error(`Connexion refusée pour ${email} : ${location}`)
  return true
}

const findOverflow = () => {
  const vw = window.innerWidth
  const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
  /** 'scroll' = conteneur défilable (tableau large : acceptable), 'hidden' = contenu réellement coupé, null = non rogné. */
  const clipKind = (el) => {
    let p = el.parentElement
    while (p && p !== document.documentElement) {
      const s = getComputedStyle(p)
      const ox = s.overflowX === 'visible' ? s.overflow : s.overflowX
      if (/(auto|scroll)/.test(ox)) return 'scroll'
      if (/(hidden|clip)/.test(ox)) return 'hidden'
      p = p.parentElement
    }
    return null
  }
  const clipped = (el) => clipKind(el) !== null
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : ''
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 4).join('.') : ''
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` « ${text} »` : ''}`
  }
  const offenders = []
  const cutText = []
  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0)
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const s = getComputedStyle(el)
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) continue
    const outside = r.right > vw + 1 || r.left < -1
    if (!outside) continue
    if (!clipped(el)) {
      if (offenders.length < 12) offenders.push({ el: describe(el), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) })
    } else if (clipKind(el) === 'hidden' && hasOwnText(el) && s.textOverflow !== 'ellipsis' && !el.closest('[class*="marquee"], .sr-only, [aria-hidden="true"]')) {
      // texte visible coupé par un conteneur overflow-hidden (débordement perçu par l'utilisateur)
      if (cutText.length < 12) cutText.push({ el: describe(el), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) })
    }
  }
  return { vw, docWidth, overflow: docWidth > vw + 1, offenders, cutText }
}

const testMobileMenu = async (page) => {
  // le bouton du tiroir de navigation d'abord (aria-controls) : connecté, le menu utilisateur a aussi aria-expanded
  const trigger = page.locator('header button[aria-controls="menu-mobile"], header button[aria-controls], header button[aria-label*="menu" i], header button[aria-label*="navigation" i], header button[aria-expanded]').first()
  if ((await trigger.count()) === 0) return { present: false }
  const visible = await trigger.isVisible()
  if (!visible) return { present: true, visible: false }
  // l'hydratation React peut n'être pas terminée au premier clic : on réessaie quelques fois
  let expanded = null
  for (let attempt = 0; attempt < 6; attempt++) {
    await trigger.click()
    await page.waitForTimeout(500)
    expanded = await trigger.getAttribute('aria-expanded')
    if (expanded === 'true') break
    await page.waitForTimeout(700)
  }
  const controls = await trigger.getAttribute('aria-controls')
  let drawer = controls ? page.locator(`#${controls}`) : page.locator('[role="dialog"], nav[aria-label*="mobile" i], #mobile-menu, [data-mobile-menu]').first()
  const drawerVisible = (await drawer.count()) > 0 ? await drawer.first().isVisible() : false
  const box = drawerVisible ? await drawer.first().boundingBox() : null
  const links = drawerVisible ? await drawer.first().locator('a').count() : 0
  // referme le menu
  await page.keyboard.press('Escape').catch(() => {})
  return { present: true, visible: true, expanded, drawerVisible, drawerWidth: box ? Math.round(box.width) : null, links }
}

const browser = await chromium.launch()
const report = { base, app, generatedAt: new Date().toISOString(), widths, results: [] }
let failures = 0

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width < 400 ? 812 : 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
    locale: 'fr-GA',
  })
  if (args.login) {
    const [email, password] = args.login.split(':')
    try {
      await login(context, email, password)
    } catch (error) {
      console.error(String(error))
    }
  }
  const page = await context.newPage()
  page.setDefaultTimeout(60_000)
  await mkdir(path.join(out, String(width)), { recursive: true })

  for (const route of routes) {
    const url = `${base}${route}`
    const entry = { width, route, status: null, error: null }
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 })
      entry.status = response?.status() ?? null
      entry.finalUrl = page.url().replace(base, '')
      await page.waitForTimeout(800)
      // fait défiler pour déclencher les animations de révélation, puis remonte
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 60))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(400)
      const overflow = await page.evaluate(findOverflow)
      entry.overflow = overflow
      if (overflow.overflow) failures++
      if (overflow.cutText?.length) failures++
      if (route === '/' || route === '/catalogue' || route === '/connexion') {
        entry.menu = await testMobileMenu(page)
        if (entry.menu.present && !(entry.menu.visible && entry.menu.drawerVisible)) failures++
      }
      if (shots) {
        const file = path.join(out, String(width), route.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'accueil') + '.png'
        await page.screenshot({ path: file, fullPage: true })
        entry.screenshot = file
      }
    } catch (error) {
      entry.error = error instanceof Error ? error.message.split('\n')[0] : String(error)
      failures++
    }
    report.results.push(entry)
    const cut = entry.overflow?.cutText?.length ? ` | ${entry.overflow.cutText.length} texte(s) coupé(s)` : ''
    const flag = entry.error ? 'ERREUR' : entry.overflow?.overflow ? `DÉBORDEMENT ${entry.overflow.docWidth}px` : 'ok'
    const menu = entry.menu ? ` | menu: ${entry.menu.present ? (entry.menu.drawerVisible ? 'ok' : 'KO') : 'absent'}` : ''
    console.log(`[${width}] ${entry.status ?? '---'} ${route} -> ${flag}${cut}${menu}${entry.error ? ` (${entry.error})` : ''}`)
    if (entry.overflow?.offenders?.length) {
      for (const o of entry.overflow.offenders.slice(0, 4)) console.log(`      débordement : ${o.el} [${o.left}..${o.right}]`)
    }
    if (entry.overflow?.cutText?.length) {
      for (const o of entry.overflow.cutText.slice(0, 4)) console.log(`      texte coupé : ${o.el} [${o.left}..${o.right}]`)
    }
  }
  await context.close()
}

await browser.close()
await mkdir(out, { recursive: true })
await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
console.log(`\nRapport : ${path.join(out, 'report.json')} - ${failures} problème(s)`)
process.exit(failures > 0 ? 1 : 0)
