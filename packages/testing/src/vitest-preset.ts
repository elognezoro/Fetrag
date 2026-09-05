import type { UserConfig } from 'vitest/config'

/**
 * Configuration Vitest partagée (chapitre 29 du CDC : tests unitaires et d'intégration).
 *
 * Utilisation dans un package :
 *
 *   import { defineConfig } from 'vitest/config'
 *   import { vitestPreset } from '@fetrag/testing/vitest-preset'
 *   export default defineConfig(vitestPreset())
 *
 * Dans une application Next.js (composants React) :
 *
 *   export default defineConfig(vitestPreset({ environment: 'jsdom', setupFiles: ['./vitest.setup.ts'] }))
 */

export interface VitestPresetOptions {
  /** `node` (défaut, packages métier) ou `jsdom` (composants React). */
  environment?: 'node' | 'jsdom'
  /** Fichiers de mise en place supplémentaires (ex. `@testing-library/jest-dom/vitest`). */
  setupFiles?: string[]
  /** Motifs de fichiers de test supplémentaires ou de remplacement. */
  include?: string[]
  /** Variables d'environnement injectées avant le chargement des tests. */
  env?: Record<string, string>
  /** Active la couverture (désactivée par défaut pour garder `pnpm test` rapide). */
  coverage?: boolean
}

/** Valeurs d'environnement neutres : aucun test ne doit dépendre d'un `.env` réel. */
export const testEnv: Record<string, string> = {
  NODE_ENV: 'test',
  TZ: 'UTC',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://fetrag:fetrag@localhost:5432/fetrag_test',
  AUTH_SECRET: 'test-secret-0123456789abcdef0123456789',
  AUTH_TRUST_HOST: 'true',
  FEATURE_LOCAL_AUTH: 'true',
  EMAIL_PROVIDER: 'console',
  STORAGE_PROVIDER: 'local',
  PAYMENT_PROVIDER: 'sandbox',
  PAYMENT_WEBHOOK_SECRET: 'test-webhook-secret',
  CRON_SECRET: 'test-cron-secret',
  APP_WEB_URL: 'http://localhost:3000',
  APP_LMS_URL: 'http://localhost:3001',
}

/** Motifs par défaut : tests colocalisés (`*.test.ts`) et dossiers `__tests__`. */
export const defaultInclude = ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{test,spec}.{ts,tsx}']

/** Fichiers exclus de la collecte et de la couverture. */
export const defaultExclude = ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**', '**/e2e/**', '**/playwright-report/**']

/**
 * Construit la configuration Vitest commune : environnement, motifs, isolation, délais réalistes
 * pour des tests qui touchent PostgreSQL (10 s), reporters lisibles en CI et exclusion des E2E.
 */
export function vitestPreset(options: VitestPresetOptions = {}): UserConfig {
  const coverage = options.coverage ?? false
  return {
    test: {
      environment: options.environment ?? 'node',
      include: options.include ?? defaultInclude,
      exclude: defaultExclude,
      setupFiles: options.setupFiles ?? [],
      env: { ...testEnv, ...(options.env ?? {}) },
      globals: false,
      passWithNoTests: true,
      clearMocks: true,
      restoreMocks: true,
      testTimeout: 10_000,
      hookTimeout: 20_000,
      reporters: process.env.CI ? ['dot', 'junit'] : ['default'],
      outputFile: process.env.CI ? { junit: './coverage/junit.xml' } : undefined,
      coverage: {
        enabled: coverage,
        provider: 'v8',
        reporter: ['text-summary', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [...defaultExclude, 'src/**/*.test.{ts,tsx}', 'src/**/__tests__/**', 'src/**/*.d.ts'],
      },
    },
  }
}

export default vitestPreset
