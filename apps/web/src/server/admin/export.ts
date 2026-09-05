import 'server-only'
import { NextResponse } from 'next/server'
import { isDomainError, type Action, type Principal } from '@fetrag/domain'
import { guards } from '@/lib/auth'
import { exportFileName } from './list-params'

/** Réponse HTTP d'un export CSV (UTF-8 avec BOM, téléchargement forcé, jamais mis en cache). */
export function csvResponse(csv: string, prefix: string): NextResponse {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFileName(prefix)}"`,
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * Enveloppe des routes d'export : vérifie la permission (levée d'erreur, pas de redirection),
 * exécute la génération et traduit les erreurs de domaine en réponses HTTP lisibles.
 */
export async function handleExport(action: Action, prefix: string, produce: (principal: Principal) => Promise<string>): Promise<NextResponse> {
  try {
    const principal = await guards.api.requireCan(action)
    const csv = await produce(principal)
    return csvResponse(csv, prefix)
  } catch (error) {
    if (isDomainError(error)) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: { 'Cache-Control': 'no-store' } })
    }
    console.error('[admin] export impossible', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'L’export a échoué.' } }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

/** Lit un paramètre de requête (première valeur, chaîne vide → undefined). */
export function queryParam(url: URL, name: string): string | undefined {
  const value = url.searchParams.get(name)?.trim()
  return value ? value : undefined
}
