#!/usr/bin/env node
/**
 * Lance Playwright avec la configuration racine (`playwright.config.ts`) depuis n'importe quel dossier.
 *
 * `@playwright/test` est une dépendance de développement des applications (`apps/web`, `apps/lms`),
 * pas de la racine du monorepo : `pnpm exec playwright` n'est donc pas résolu à la racine. Ce lanceur
 * retrouve le binaire installé dans `apps/web` et lui transmet les arguments tels quels.
 *
 * Usage :
 *   node scripts/e2e.mjs test                          # tous les projets (web + lms)
 *   node scripts/e2e.mjs test --project=web --grep @smoke
 *   node scripts/e2e.mjs test --ui                     # explorateur interactif
 *   node scripts/e2e.mjs show-report                   # rapport HTML du dernier run
 *   node scripts/e2e.mjs install chromium              # navigateurs (une fois)
 *
 * Sans sous-commande, `test` est utilisé : `node scripts/e2e.mjs --project=lms`.
 * Variables reconnues par la configuration : E2E_WEB_URL, E2E_LMS_URL, E2E_PASSWORD, E2E_START_SERVERS,
 * E2E_USE_BUILD, E2E_DESKTOP (voir docs/architecture/TESTING.md, section 5).
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configPath = path.join(repoRoot, 'playwright.config.ts')

/** Dossiers susceptibles de contenir `@playwright/test` (le premier trouvé est utilisé). */
const candidates = ['apps/web', 'apps/lms', 'packages/testing', '.'].map((dir) => path.join(repoRoot, dir, 'node_modules', '@playwright', 'test'))

function resolveCli() {
  for (const packageDir of candidates) {
    const manifestPath = path.join(packageDir, 'package.json')
    if (!existsSync(manifestPath)) continue
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.playwright
    if (!bin) continue
    const cliPath = path.join(packageDir, bin)
    // Dossier node_modules qui contient @playwright/test : exposé via NODE_PATH pour que la configuration
    // racine et les fichiers .spec.ts (hors de apps/web) résolvent `@playwright/test` vers la même instance.
    const nodeModulesDir = path.dirname(path.dirname(packageDir))
    if (existsSync(cliPath)) return { cliPath, version: manifest.version, nodeModulesDir }
  }
  return null
}

const PLAYWRIGHT_COMMANDS = new Set(['test', 'show-report', 'install', 'install-deps', 'codegen', 'merge-reports', 'show-trace', 'open', 'screenshot', 'pdf', 'clear-cache', 'uninstall'])

function buildArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) return argv
  const [first, ...rest] = argv
  const command = first && PLAYWRIGHT_COMMANDS.has(first) ? first : 'test'
  const args = first && PLAYWRIGHT_COMMANDS.has(first) ? rest : argv
  const needsConfig = command === 'test' || command === 'show-report' || command === 'merge-reports'
  const hasConfig = args.some((arg) => arg === '-c' || arg === '--config' || arg.startsWith('--config='))
  return needsConfig && !hasConfig ? [command, '--config', configPath, ...args] : [command, ...args]
}

const cli = resolveCli()
if (!cli) {
  console.error('Playwright est introuvable : exécuter `pnpm install` à la racine (dépendance @playwright/test de apps/web).')
  process.exit(2)
}
if (!existsSync(configPath)) {
  console.error(`Configuration introuvable : ${configPath}`)
  process.exit(2)
}

const args = buildArgs(process.argv.slice(2))
console.info(`Playwright ${cli.version} - ${args.join(' ')}`)

const nodePath = [cli.nodeModulesDir, process.env.NODE_PATH].filter(Boolean).join(path.delimiter)
const child = spawn(process.execPath, [cli.cliPath, ...args], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: { ...process.env, NODE_PATH: nodePath },
})
child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Playwright interrompu (${signal}).`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})
child.on('error', (error) => {
  console.error('Impossible de lancer Playwright :', error instanceof Error ? error.message : error)
  process.exit(2)
})
