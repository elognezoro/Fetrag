import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import { baseConfig } from './base.js'

/** @type {import("eslint").Linter.Config[]} */
export const reactConfig = [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  {
    plugins: { 'react-hooks': pluginReactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
    },
  },
]

export default reactConfig
