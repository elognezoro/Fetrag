/**
 * Pont vers la file de jobs sans dépendance de compilation sur `@fetrag/jobs`
 * (jobs dépend de notifications : un import statique créerait un cycle).
 *
 * Deux mécanismes complémentaires :
 * 1. `@fetrag/jobs` s'enregistre lui-même via `registerJobEnqueuer` lors de `registerDefaultHandlers()`.
 * 2. À défaut, un import dynamique de `@fetrag/jobs` est tenté à l'exécution (résolu si le module est
 *    accessible depuis le processus courant). En cas d'échec, la livraison reste en base au statut FAILED
 *    et le balayage `requeueFailedEmails` du worker la remettra en file.
 */

export interface EnqueueOptionsLike {
  idempotencyKey?: string
  runAt?: Date
  priority?: number
}

export type JobEnqueuer = (
  type: string,
  payload: Record<string, unknown>,
  options?: EnqueueOptionsLike,
) => Promise<unknown>

let registered: JobEnqueuer | null = null

/** Enregistre la fonction `enqueue` de `@fetrag/jobs` (appelé par jobs à l'initialisation). */
export function registerJobEnqueuer(enqueue: JobEnqueuer | null): void {
  registered = enqueue
}

async function resolveEnqueuer(): Promise<JobEnqueuer | null> {
  if (registered) return registered
  try {
    const specifier = '@fetrag/jobs'
    const mod = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ specifier)) as { enqueue?: unknown }
    if (typeof mod.enqueue === 'function') {
      registered = mod.enqueue as JobEnqueuer
      return registered
    }
  } catch {
    // Module non résolvable dans ce contexte : repli sur le balayage du worker.
  }
  return null
}

/** Clé d'idempotence du job d'envoi d'une livraison. */
export function emailJobKey(deliveryId: string): string {
  return `email.send:${deliveryId}`
}

/** Met en file le renvoi d'une livraison ; renvoie `false` si aucune file n'est accessible. */
export async function enqueueEmailJob(deliveryId: string, runAt?: Date): Promise<boolean> {
  const enqueue = await resolveEnqueuer()
  if (!enqueue) return false
  try {
    await enqueue('email.send', { deliveryId }, { idempotencyKey: emailJobKey(deliveryId), runAt, priority: 3 })
    return true
  } catch (error) {
    console.error('[notifications] mise en file du job email.send impossible', error)
    return false
  }
}
