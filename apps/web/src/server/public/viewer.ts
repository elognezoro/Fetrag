import 'server-only'
import type { Principal } from '@fetrag/domain'
import { guards } from '@/lib/auth'

/**
 * Visiteur courant (ou null) pour les pages publiques : la lecture de session ne doit
 * jamais faire échouer une page consultable sans compte (base indisponible, cookie invalide).
 */
export async function getViewer(): Promise<Principal | null> {
  try {
    return await guards.getPrincipal()
  } catch (error) {
    console.warn('[web:public] session illisible :', error instanceof Error ? error.message : error)
    return null
  }
}

/** Nom d'affichage du visiteur (prénom + nom, sinon email). */
export function viewerName(principal: Principal | null): string | null {
  if (!principal) return null
  const name = principal.name?.trim()
  return name && name.length > 0 ? name : null
}
