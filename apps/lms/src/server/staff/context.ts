import 'server-only'
import { headers } from 'next/headers'
import { ZodError } from 'zod'
import { hashIp, isDomainError, type Principal } from '@fetrag/domain'
import type { RequestMeta } from '@fetrag/lms-core'
import { isStorageError } from '@fetrag/storage'
import { guards } from '@/lib/auth'
import { failureState, type ActionState, type FieldErrors } from './action-state'

/** Métadonnées de requête (IP hachée, agent, corrélation) transmises à l'audit des services métier. */
export async function requestMeta(): Promise<RequestMeta> {
  try {
    const h = await headers()
    const forwarded = h.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
    return { ip: hashIp(ip), userAgent: h.get('user-agent'), correlationId: h.get('x-correlation-id') }
  } catch {
    return {}
  }
}

/** Première erreur Zod par champ (chemin joint par des points : `participants.2.email`). */
export function zodFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join('.') : '_form'
    if (!(key in out)) out[key] = issue.message
  }
  return out
}

/** Convertit toute erreur en état d'action lisible, sans fuiter de détail interne. */
export function errorState(error: unknown, fallback = 'Une erreur est survenue. Réessayez dans quelques instants.'): ActionState {
  if (error instanceof ZodError) {
    const fieldErrors = zodFieldErrors(error)
    const first = Object.values(fieldErrors)[0]
    return failureState(first ? `Vérifiez les informations saisies : ${first}` : 'Vérifiez les informations saisies.', fieldErrors)
  }
  if (isDomainError(error) || isStorageError(error)) return failureState(error.message)
  if (error && typeof error === 'object' && 'digest' in error && typeof (error as { digest?: unknown }).digest === 'string') {
    // Erreurs de navigation Next (redirect / notFound) : à relancer.
    throw error
  }
  console.error('[lms-staff] action échouée', error instanceof Error ? error.message : error)
  return failureState(fallback)
}

/**
 * Exécute une action avec le principal courant et transforme les exceptions en état d'action.
 * Les gardes de permission restent à la charge de l'action (requireCan / assertCan des services).
 */
export async function runAction(fn: (principal: Principal, meta: RequestMeta) => Promise<ActionState>): Promise<ActionState> {
  let principal: Principal
  try {
    principal = await guards.api.requireUser()
  } catch {
    return failureState('Votre session a expiré : reconnectez-vous pour continuer.')
  }
  try {
    return await fn(principal, await requestMeta())
  } catch (error) {
    return errorState(error)
  }
}

// -----------------------------------------------------------------------------
// Lecture tolérante des FormData
// -----------------------------------------------------------------------------

export function formString(fd: FormData, name: string): string {
  const value = fd.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export function formOptional(fd: FormData, name: string): string | undefined {
  const value = formString(fd, name)
  return value.length ? value : undefined
}

/** Valeur nulle explicite pour vider un champ optionnel en base. */
export function formNullable(fd: FormData, name: string): string | null {
  const value = formString(fd, name)
  return value.length ? value : null
}

export function formNumber(fd: FormData, name: string): number | undefined {
  const value = formString(fd, name)
  if (!value) return undefined
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

export function formInt(fd: FormData, name: string): number | undefined {
  const n = formNumber(fd, name)
  return n === undefined ? undefined : Math.round(n)
}

export function formBoolean(fd: FormData, name: string): boolean {
  const value = fd.get(name)
  return value === 'on' || value === 'true' || value === '1'
}

export function formDate(fd: FormData, name: string): Date | undefined {
  const value = formString(fd, name)
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function formList(fd: FormData, name: string): string[] {
  return fd
    .getAll(name)
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
}

/** Lignes non vides d'un textarea. */
export function formLines(fd: FormData, name: string): string[] {
  return formString(fd, name)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

export function formJson<T = unknown>(fd: FormData, name: string): T | undefined {
  const value = formString(fd, name)
  if (!value) return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export function formFile(fd: FormData, name: string): File | null {
  const value = fd.get(name)
  return value instanceof File && value.size > 0 ? value : null
}
