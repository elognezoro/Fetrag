import pluginNext from '@next/eslint-plugin-next'
import { reactConfig } from './react.js'

/** @type {import("eslint").Linter.Config[]} */
export const nextConfig = [
  ...reactConfig,
  {
    // Fichiers générés par Next.js et augmentations de types (références triple-slash légitimes).
    ignores: ['next-env.d.ts', 'src/types/**/*.d.ts', '.next/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    plugins: { '@next/next': pluginNext },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
]

export default nextConfig
