import pluginNext from '@next/eslint-plugin-next'
import { reactConfig } from './react.js'

/** @type {import("eslint").Linter.Config[]} */
export const nextConfig = [
  ...reactConfig,
  {
    plugins: { '@next/next': pluginNext },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
]

export default nextConfig
