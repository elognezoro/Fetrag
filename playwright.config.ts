import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

/**
 * Configuration Playwright du monorepo FETRAG (chapitre 29 du CDC, docs/architecture/TESTING.md).
 *
 * Deux projets : `web` (site institutionnel, port 3000) et `lms` (plateforme de formation, port 3001).
 * Les serveurs ne sont PAS démarrés par la configuration : lancer `pnpm dev:web` et `pnpm dev:lms`
 * (ou les builds) avant les tests, ou définir `E2E_START_SERVERS=1` pour les démarrer automatiquement
 * (`E2E_USE_BUILD=1` utilise `next start` sur un build existant au lieu de `next dev`).
 *
 * Variables :
 *   E2E_WEB_URL / E2E_LMS_URL   adresses des applications (défaut http://localhost:3000 / :3001)
 *   E2E_PASSWORD                mot de passe des comptes de démonstration (défaut Fetrag2026!)
 *   E2E_START_SERVERS=1         démarre les serveurs (webServer) ; E2E_USE_BUILD=1 pour `next start`
 *   E2E_DESKTOP=1               remplace le viewport mobile par un viewport bureau 1280x800
 *
 * Lancement : `node scripts/e2e.mjs test [--project=web|lms] [--grep @smoke]` (le binaire `@playwright/test`
 * est installé dans apps/web et apps/lms, pas à la racine ; le lanceur impose cette configuration).
 * Le workflow CI n'exécute pas ces tests (voir TESTING.md, section 5.5).
 */

const webUrl = process.env.E2E_WEB_URL ?? 'http://localhost:3000'
const lmsUrl = process.env.E2E_LMS_URL ?? 'http://localhost:3001'
const startServers = process.env.E2E_START_SERVERS === '1'
const useBuild = process.env.E2E_USE_BUILD === '1'
const desktop = process.env.E2E_DESKTOP === '1'
const isCi = Boolean(process.env.CI)

const e2eRoot = path.join(__dirname, 'packages', 'testing', 'e2e')

/** Mobile-first (DESIGN_SYSTEM.md section 8) : Pixel 7 par défaut, bureau sur demande. */
const baseDevice = desktop
  ? { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }
  : { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }

function webServerFor(app: 'web' | 'lms', url: string) {
  const port = app === 'web' ? 3000 : 3001
  return {
    command: useBuild ? `pnpm --filter @fetrag/${app} start` : `pnpm --filter @fetrag/${app} dev`,
    url: `${url}/api/health`,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: 'ignore' as const,
    stderr: 'pipe' as const,
    env: { PORT: String(port), NEXT_TELEMETRY_DISABLED: '1' },
  }
}

export default defineConfig({
  testDir: e2eRoot,
  testMatch: /.*\.spec\.ts$/,
  outputDir: path.join(__dirname, 'test-results'),
  fullyParallel: false,
  workers: 1,
  retries: isCi ? 1 : 0,
  forbidOnly: isCi,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: isCi
    ? [['list'], ['html', { open: 'never', outputFolder: path.join(__dirname, 'playwright-report') }]]
    : [['list'], ['html', { open: 'on-failure', outputFolder: path.join(__dirname, 'playwright-report') }]],
  use: {
    ...baseDevice,
    locale: 'fr-GA',
    timezoneId: 'Africa/Libreville',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'web',
      testDir: path.join(e2eRoot, 'web'),
      use: { baseURL: webUrl },
    },
    {
      name: 'lms',
      testDir: path.join(e2eRoot, 'lms'),
      use: { baseURL: lmsUrl },
    },
  ],
  webServer: startServers ? [webServerFor('web', webUrl), webServerFor('lms', lmsUrl)] : undefined,
})
