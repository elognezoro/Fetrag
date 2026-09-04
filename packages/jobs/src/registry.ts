import type { JobHandler } from './types'

const handlers = new Map<string, JobHandler>()

/** Enregistre (ou remplace) le handler d'un type de job. */
export function registerHandler(type: string, handler: JobHandler): void {
  handlers.set(type, handler)
}

export function unregisterHandler(type: string): void {
  handlers.delete(type)
}

export function getHandler(type: string): JobHandler | undefined {
  return handlers.get(type)
}

export function listHandlers(): string[] {
  return [...handlers.keys()]
}

/** Vide le registre (tests). */
export function clearHandlers(): void {
  handlers.clear()
}
