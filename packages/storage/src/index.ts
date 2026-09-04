// @fetrag/storage - Stockage objet : adaptateurs local / Vercel Blob / S3, URL signées, politiques d'accès (ADR-003).

export type {
  PutOptions,
  PutResult,
  ResolvableStorageProvider,
  SignedUrlOptions,
  StorageBody,
  StorageProvider,
  StorageProviderId,
  StorageResolution,
  StorageVisibility,
  StoredObject,
} from './types'

export { getStorage, createStorage, setStorage } from './registry'
export { LocalStorageProvider, contentTypeFromKey, findMonorepoRoot } from './providers/local'
export type { LocalStorageOptions } from './providers/local'
export { VercelBlobProvider } from './providers/vercel-blob'
export type { VercelBlobOptions } from './providers/vercel-blob'
export { S3Provider } from './providers/s3'
export type { S3ProviderOptions } from './providers/s3'

export {
  buildKey,
  normalizeKey,
  withVisibility,
  stripVisibility,
  visibilityOf,
  sanitizeFolder,
  slugifyFileName,
  extensionOf,
  displayNameFromKey,
} from './keys'

export {
  validateUpload,
  sanitizeFileName,
  DEFAULT_MAX_UPLOAD_MB,
  imageMimeTypes,
  documentMimeTypes,
  mediaMimeTypes,
} from './validate'
export type { UploadCandidate, UploadRules, ValidatedUpload } from './validate'

export {
  signUrl,
  verifySignedUrl,
  storageRoutePath,
  keyFromRoutePath,
  STORAGE_ROUTE_PREFIX,
  SIGNATURE_PARAM,
  EXPIRES_PARAM,
} from './signing'
export type { SignedUrlVerification } from './signing'

export { serveStorageRequest } from './serve'
export type { StorageServeResult } from './serve'

export {
  StorageError,
  StorageValidationError,
  StorageValidationError as ValidationError,
  StorageConfigurationError,
  StorageNotFoundError,
  isStorageError,
} from './errors'
export type { StorageErrorCode } from './errors'
