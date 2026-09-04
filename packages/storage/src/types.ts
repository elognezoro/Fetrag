/**
 * Contrats du stockage objet (ADR-003).
 * Les clés sont toujours préfixées par leur visibilité (`public/...` ou `private/...`)
 * afin qu'un fournisseur puisse retrouver la politique d'accès à partir de la clé seule.
 */

export type StorageVisibility = 'PUBLIC' | 'PRIVATE'

export type StorageProviderId = 'local' | 'vercel-blob' | 's3'

export type StorageBody = Buffer | Uint8Array | string

export interface PutOptions {
  /** Type MIME servi lors de la lecture (ex: application/pdf). */
  contentType: string
  /** PUBLIC : URL stable et lisible par tous. PRIVATE : accès uniquement par URL signée. */
  visibility: StorageVisibility
  /** Durée de cache navigateur/CDN en secondes (contenus publics uniquement). */
  cacheControlMaxAge?: number
}

export interface PutResult {
  /** Clé canonique à conserver en base (ex: `private/certificates/2026/09/<uuid>-fetrag-2026-000012.pdf`). */
  key: string
  /**
   * URL de lecture. Pour un objet PUBLIC : URL directe et durable.
   * Pour un objet PRIVATE : URL de la route applicative (non signée) ; utiliser `getSignedUrl`.
   */
  url: string
}

export interface SignedUrlOptions {
  /** Durée de validité du lien (par défaut 15 minutes). */
  expiresInSeconds?: number
}

export interface StoredObject {
  key: string
  size: number | null
  url: string | null
  uploadedAt: Date | null
}

/** Interface stable consommée par le domaine (cms, lms-core, jobs). */
export interface StorageProvider {
  readonly id: StorageProviderId
  put(key: string, data: StorageBody, options: PutOptions): Promise<PutResult>
  getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>
  delete(key: string): Promise<void>
  list(prefix: string): Promise<StoredObject[]>
}

/**
 * Résolution interne d'une clé pour la route applicative `/api/storage/[...key]`.
 * - `file` : contenu à lire sur disque (fournisseur local).
 * - `url` : contenu distant à rediriger (`stream: false`) ou à relayer (`stream: true`).
 */
export type StorageResolution =
  | { kind: 'file'; path: string; contentType: string }
  | { kind: 'url'; url: string; stream: boolean }

/** Fournisseur capable de servir ses objets via la route applicative. */
export interface ResolvableStorageProvider extends StorageProvider {
  resolve(key: string): Promise<StorageResolution | null>
}
