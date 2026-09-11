#!/usr/bin/env node
/**
 * Lance le serveur de développement d'une app avec le fournisseur email « console »
 * (aucun email réel : les messages, liens de confirmation et de réinitialisation sont
 * journalisés dans la sortie du serveur). Utile pour tester les parcours d'inscription
 * et de mot de passe sans consommer d'envois Resend.
 *
 * Usage : node scripts/dev-mail-console.mjs web|lms [--port 3000]
 */
import { spawn } from 'node:child_process'
import path from 'node:path'

const app = process.argv[2] === 'lms' ? 'lms' : 'web'
const portIndex = process.argv.indexOf('--port')
const port = portIndex > -1 ? process.argv[portIndex + 1] : app === 'lms' ? '3001' : '3000'
const cwd = path.resolve(process.cwd(), 'apps', app)
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

const child = spawn(pnpm, ['exec', 'next', 'dev', '--port', port], {
  cwd,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, EMAIL_PROVIDER: 'console', RESEND_API_KEY: '' },
})
child.on('exit', (code) => process.exit(code ?? 0))
