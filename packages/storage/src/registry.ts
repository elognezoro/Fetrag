import { getEnvSafe } from '@fetrag/config'
import { LocalStorageProvider } from './providers/local'
import { S3Provider } from './providers/s3'
import { VercelBlobProvider } from './providers/vercel-blob'
import type { StorageProvider, StorageProviderId } from './types'

let instance: StorageProvider | undefined

/** Instancie explicitement un fournisseur (tests, scripts). */
export function createStorage(providerId: StorageProviderId): StorageProvider {
  switch (providerId) {
    case 'vercel-blob':
      return new VercelBlobProvider()
    case 's3':
      return new S3Provider()
    case 'local':
    default:
      return new LocalStorageProvider()
  }
}

/** Fournisseur courant selon `STORAGE_PROVIDER` (singleton par process). */
export function getStorage(): StorageProvider {
  if (!instance) {
    instance = createStorage(getEnvSafe().STORAGE_PROVIDER ?? 'local')
  }
  return instance
}

/** Remplace le fournisseur courant (tests) ; `undefined` réinitialise le singleton. */
export function setStorage(provider: StorageProvider | undefined): void {
  instance = provider
}
