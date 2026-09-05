import { getStorage, keyFromRoutePath, visibilityOf } from '@fetrag/storage'

/**
 * Helpers purs de lecture des contenus pédagogiques (JSON tolérant) et de résolution des fichiers.
 * Ce module est importé par les composants serveur ; aucune directive « use server ».
 */

export interface LowBandwidth {
  transcript: string | null
  audioUrl: string | null
  documentUrl: string | null
  label: string | null
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

/**
 * Normalise `Activity.lowBandwidthAlternative` : accepte le format du seed
 * (`{ transcript, audioUrl }`) et le schéma lms-core (`{ kind, url, text, label }`).
 */
export function readLowBandwidth(raw: unknown): LowBandwidth | null {
  const record = asRecord(raw)
  if (Object.keys(record).length === 0) return null
  const kind = str(record.kind)
  const url = str(record.url)
  const out: LowBandwidth = {
    transcript: str(record.transcript) ?? str(record.text),
    audioUrl: str(record.audioUrl) ?? (kind === 'audio' ? url : null),
    documentUrl: str(record.documentUrl) ?? (kind === 'document' || kind === 'low-res' ? url : null),
    label: str(record.label),
  }
  if (!out.transcript && !out.audioUrl && !out.documentUrl) return null
  return out
}

/** Contenu brut d'une activité média lu de façon tolérante (une `url` vide signifie « pas de média »). */
export interface MediaContent {
  url: string | null
  provider: 'youtube' | 'vimeo' | 'file' | 'other'
  transcript: string | null
  posterUrl: string | null
  label: string | null
  embedUrl: string | null
}

export function readMediaContent(raw: unknown): MediaContent {
  const record = asRecord(raw)
  const provider = str(record.provider)
  return {
    url: str(record.url),
    provider: provider === 'youtube' || provider === 'vimeo' || provider === 'file' ? provider : 'other',
    transcript: str(record.transcript),
    posterUrl: str(record.posterUrl),
    label: str(record.label),
    embedUrl: str(record.embedUrl),
  }
}

export function readTextHtml(raw: unknown): string {
  return str(asRecord(raw).html) ?? ''
}

export function readStringList(raw: unknown, key: string): string[] {
  const value = asRecord(raw)[key]
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

export function readString(raw: unknown, key: string): string | null {
  return str(asRecord(raw)[key])
}

/** Identifiant YouTube extrait d'une URL (watch, youtu.be, embed, shorts). */
export function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return parsed.pathname.slice(1).split('/')[0] || null
    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v')
      const match = parsed.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/)
      return match?.[1] ?? null
    }
  } catch {
    return null
  }
  return null
}

/** URL d'intégration YouTube sans cookies (jamais d'autoplay). */
export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1` : null
}

/** URL d'intégration Vimeo (lecteur officiel). */
export function vimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('vimeo.com')) return null
    const id = parsed.pathname.split('/').filter(Boolean).pop()
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?dnt=1` : null
  } catch {
    return null
  }
}

/** Une valeur ressemble-t-elle à une clé du stockage objet (`public/...`, `private/...`) ? */
export function isStorageKey(value: string): boolean {
  return visibilityOf(value) !== null
}

/**
 * Résout une référence de fichier (clé de stockage, route applicative ou URL externe)
 * en URL consultable par l'apprenant (signée si l'objet est privé).
 */
export async function resolveFileUrl(reference: string | null | undefined, options: { download?: boolean; expiresInSeconds?: number } = {}): Promise<string | null> {
  if (!reference) return null
  let key: string | null = null
  if (isStorageKey(reference)) key = reference
  else if (reference.startsWith('/api/storage/')) key = keyFromRoutePath(reference)
  else if (/^https?:\/\//.test(reference)) {
    try {
      const parsed = new URL(reference)
      const fromRoute = keyFromRoutePath(parsed.pathname)
      if (fromRoute && isStorageKey(fromRoute)) key = fromRoute
    } catch {
      key = null
    }
  }
  if (!key) return reference
  try {
    const signed = await getStorage().getSignedUrl(key, { expiresInSeconds: options.expiresInSeconds ?? 900 })
    if (!options.download) return signed
    const separator = signed.includes('?') ? '&' : '?'
    return `${signed}${separator}download=1`
  } catch (error) {
    console.error('[learner] URL signée impossible', key, error instanceof Error ? error.message : error)
    return null
  }
}

/** Le fichier est-il un PDF (type MIME ou extension) ? */
export function isPdf(url: string | null | undefined, mimeType?: string | null): boolean {
  if (mimeType && mimeType.toLowerCase().includes('pdf')) return true
  if (!url) return false
  try {
    return new URL(url, 'http://fetrag.local').pathname.toLowerCase().endsWith('.pdf')
  } catch {
    return false
  }
}
