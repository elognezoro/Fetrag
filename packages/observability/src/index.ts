// Aucune dépendance à `node:crypto` : ce module est importable depuis un composant client ou l'Edge runtime.
const randomUUID = (): string => globalThis.crypto.randomUUID()

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levelWeight: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

const SENSITIVE_KEYS = /pass(word)?|secret|token|authorization|cookie|card|cvv|otp|totp|iban/i

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[depth]'
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1))
  if (value && typeof value === 'object') {
    if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1)
    }
    return out
  }
  return value
}

export interface Logger {
  debug(msg: string, data?: Record<string, unknown>): void
  info(msg: string, data?: Record<string, unknown>): void
  warn(msg: string, data?: Record<string, unknown>): void
  error(msg: string, data?: Record<string, unknown>): void
  child(bindings: Record<string, unknown>): Logger
}

const minLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

/** Logger JSON structuré (SHR-12), sans données sensibles (SEC-09). */
export function createLogger(bindings: Record<string, unknown> = {}): Logger {
  const write = (level: LogLevel, msg: string, data?: Record<string, unknown>) => {
    if (levelWeight[level] < levelWeight[minLevel]) return
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...redact({ ...bindings, ...(data ?? {}) }) as Record<string, unknown>,
    })
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.info(line)
  }
  return {
    debug: (m, d) => write('debug', m, d),
    info: (m, d) => write('info', m, d),
    warn: (m, d) => write('warn', m, d),
    error: (m, d) => write('error', m, d),
    child: (b) => createLogger({ ...bindings, ...b }),
  }
}

export const logger = createLogger({ service: process.env.SERVICE_NAME ?? 'fetrag' })

export function newCorrelationId(): string {
  return randomUUID()
}

/** Extrait ou génère un correlation id à partir des en-têtes HTTP. */
export function correlationIdFrom(headers: Headers | Record<string, string | undefined>): string {
  const get = (k: string) => (headers instanceof Headers ? headers.get(k) : headers[k])
  return get('x-correlation-id') ?? get('x-request-id') ?? newCorrelationId()
}

/** Mesure simple de durée pour les métriques applicatives. */
export async function timed<T>(name: string, fn: () => Promise<T>, log: Logger = logger): Promise<T> {
  const start = performance.now()
  try {
    return await fn()
  } finally {
    log.debug('timing', { name, durationMs: Math.round(performance.now() - start) })
  }
}

export interface HealthCheck {
  name: string
  check: () => Promise<{ ok: boolean; detail?: string }>
}

export async function runHealthChecks(checks: HealthCheck[]) {
  const results = await Promise.all(
    checks.map(async (c) => {
      const start = performance.now()
      try {
        const r = await c.check()
        return { name: c.name, ok: r.ok, detail: r.detail, durationMs: Math.round(performance.now() - start) }
      } catch (error) {
        return {
          name: c.name,
          ok: false,
          detail: error instanceof Error ? error.message : 'erreur',
          durationMs: Math.round(performance.now() - start),
        }
      }
    }),
  )
  return { ok: results.every((r) => r.ok), checks: results, timestamp: new Date().toISOString() }
}
