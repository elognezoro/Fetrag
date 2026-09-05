import 'server-only'
import { services, type ServiceCard } from '@fetrag/cms'
import { safeQuery } from './safe'

export interface ServicesIndex {
  services: ServiceCard[]
  /** Vrai si le catalogue n'a pas pu être lu (base indisponible). */
  degraded: boolean
}

/** Catalogue public des services (publiés, ordonnés par position). */
export async function getServicesIndex(): Promise<ServicesIndex> {
  const rows = await safeQuery('services.listPublished', () => services.listPublished(), null)
  return { services: rows ?? [], degraded: rows === null }
}

/** Autres services publiés (hors service courant), pour la fiche d'un service. */
export async function getOtherServices(excludeId: string, limit = 3): Promise<ServiceCard[]> {
  const rows = await safeQuery('services.listPublished(other)', () => services.listPublished(), [])
  return rows.filter((service) => service.id !== excludeId).slice(0, limit)
}
