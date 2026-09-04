import type { DomainEvent, DomainEventName } from '@fetrag/contracts'

type Handler = (event: DomainEvent) => Promise<void> | void

const handlers = new Map<DomainEventName, Set<Handler>>()

/**
 * Bus d'événements internes typés (chapitre 17). In-process : les handlers
 * enregistrent en général un job persistant (@fetrag/jobs) pour le travail asynchrone.
 */
export function on(name: DomainEventName, handler: Handler): () => void {
  if (!handlers.has(name)) handlers.set(name, new Set())
  handlers.get(name)!.add(handler)
  return () => handlers.get(name)?.delete(handler)
}

export async function emit(
  name: DomainEventName,
  payload: Record<string, unknown>,
  meta: { actorId?: string; correlationId?: string } = {},
): Promise<void> {
  const event: DomainEvent = { name, payload, occurredAt: new Date(), ...meta }
  const set = handlers.get(name)
  if (!set) return
  await Promise.all(
    [...set].map(async (h) => {
      try {
        await h(event)
      } catch (error) {
        console.error(`[events] handler ${name} a échoué`, error)
      }
    }),
  )
}

export function clearHandlers(): void {
  handlers.clear()
}
