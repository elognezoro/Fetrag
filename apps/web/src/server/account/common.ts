import 'server-only'
import { headers } from 'next/headers'
import { isDomainError, hashIp } from '@fetrag/domain'
import type { z } from '@fetrag/contracts'
import type { ActionState } from './types'

export type { ActionState, FormAction } from './types'
export { idleState } from './types'

/** Contexte réseau de la requête (IP hachée, agent utilisateur) pour l'audit. */
export async function requestContext(): Promise<{ ip: string | null; ipHash: string | null; userAgent: string | null }> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  return { ip, ipHash: hashIp(ip), userAgent: h.get('user-agent')?.slice(0, 300) ?? null }
}

/** Lit une valeur texte d'un FormData (chaîne vide si absente). */
export function text(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Texte nettoyé ; `undefined` si vide. */
export function optionalText(formData: FormData, name: string): string | undefined {
  const value = text(formData, name).trim()
  return value.length > 0 ? value : undefined
}

/** Texte nettoyé ; `null` si vide (pour les colonnes nullables). */
export function nullableText(formData: FormData, name: string): string | null {
  const value = text(formData, name).trim()
  return value.length > 0 ? value : null
}

/** Case à cocher / interrupteur : `on`, `true` ou `1`. */
export function bool(formData: FormData, name: string): boolean {
  const value = formData.get(name)
  return value === 'on' || value === 'true' || value === '1'
}

/** Entier optionnel (undefined si vide ou invalide). */
export function int(formData: FormData, name: string): number | undefined {
  const value = text(formData, name).trim()
  if (!value) return undefined
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : undefined
}

/** Entier nullable (null si vide). */
export function nullableInt(formData: FormData, name: string): number | null {
  const n = int(formData, name)
  return n === undefined ? null : n
}

/** Date optionnelle (`datetime-local` ou ISO). */
export function date(formData: FormData, name: string): Date | undefined {
  const value = text(formData, name).trim()
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

/** Liste de valeurs séparées par des virgules ou des retours à la ligne. */
export function list(formData: FormData, name: string): string[] {
  return text(formData, name)
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
}

/** JSON optionnel ; lève une erreur lisible si le document est invalide. */
export function json<T = unknown>(formData: FormData, name: string): T | undefined {
  const value = text(formData, name).trim()
  if (!value) return undefined
  return JSON.parse(value) as T
}

/** Première erreur Zod par champ (chemin de premier niveau). */
export function firstErrors<F extends string>(issues: z.ZodIssue[]): Partial<Record<F, string>> {
  const out: Partial<Record<F, string>> = {}
  for (const issue of issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in out)) out[key as F] = issue.message
  }
  return out
}

/** Erreurs par champ issues d'une ValidationError du domaine (`details.fieldErrors`). */
function fieldErrorsFromDetails<F extends string>(details: Record<string, unknown> | undefined): Partial<Record<F, string>> | undefined {
  if (!details) return undefined
  const raw = details.fieldErrors ?? details.issues
  if (!raw || typeof raw !== 'object') return undefined
  const out: Partial<Record<F, string>> = {}
  if (Array.isArray(raw)) {
    for (const item of raw as Array<{ path?: string; message?: string }>) {
      const key = item.path?.split('.')[0]
      if (key && item.message && !(key in out)) out[key as F] = item.message
    }
  } else {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      const message = Array.isArray(value) ? String(value[0] ?? '') : typeof value === 'string' ? value : ''
      if (message) out[key as F] = message
    }
  }
  if (typeof details.field === 'string' && !(details.field in out)) {
    out[details.field as F] = typeof details.message === 'string' ? details.message : 'Valeur invalide'
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/** Convertit une erreur (domaine, Zod, inconnue) en état de formulaire affichable. */
export function toErrorState<F extends string = string>(error: unknown, fallback = 'L’opération a échoué. Réessayez dans quelques instants.'): ActionState<F> {
  if (error instanceof SyntaxError) {
    return { status: 'error', message: 'Le document JSON est invalide.' }
  }
  if (isDomainError(error)) {
    const fieldErrors = fieldErrorsFromDetails<F>(error.details)
    const message =
      error.code === 'INTERNAL_ERROR'
        ? fallback
        : error.code === 'VALIDATION_ERROR' && fieldErrors
          ? 'Certains champs sont invalides.'
          : error.message
    return { status: 'error', message, fieldErrors }
  }
  if (error && typeof error === 'object' && 'issues' in error && Array.isArray((error as { issues: unknown }).issues)) {
    return { status: 'error', message: 'Certains champs sont invalides.', fieldErrors: firstErrors<F>((error as { issues: z.ZodIssue[] }).issues) }
  }
  console.error('[web] action échouée', error instanceof Error ? error.message : error)
  return { status: 'error', message: fallback }
}

export function successState<F extends string = string>(message: string, data?: Record<string, unknown>): ActionState<F> {
  return { status: 'success', message, data }
}
