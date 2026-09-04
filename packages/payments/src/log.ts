/**
 * Journal JSON minimal du package (même format que `@fetrag/observability`, qui n'est pas
 * une dépendance déclarée de payments). Jamais de données sensibles : références et identifiants uniquement.
 */
type Level = 'info' | 'warn' | 'error'

function write(level: Level, msg: string, data: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, service: 'payments', ...data })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.info(line)
}

export const log = {
  info: (msg: string, data?: Record<string, unknown>) => write('info', msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => write('warn', msg, data),
  error: (msg: string, data?: Record<string, unknown>) => write('error', msg, data),
}
