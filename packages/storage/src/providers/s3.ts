import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner'
import { getEnvSafe } from '@fetrag/config'
import { StorageConfigurationError } from '../errors'
import { normalizeKey, stripVisibility, visibilityOf, withVisibility } from '../keys'
import type {
  PutOptions,
  PutResult,
  ResolvableStorageProvider,
  SignedUrlOptions,
  StorageBody,
  StorageResolution,
  StorageVisibility,
  StoredObject,
} from '../types'

export interface S3ProviderOptions {
  endpoint?: string
  region?: string
  publicBucket?: string
  privateBucket?: string
  accessKeyId?: string
  secretAccessKey?: string
  /** URL publique de base (CDN) pour le bucket public ; sinon URL S3 standard ou endpoint path-style. */
  publicBaseUrl?: string
}

/**
 * Fournisseur S3 compatible (AWS S3, MinIO, Scaleway Object Storage) avec deux buckets :
 * public (lecture anonyme) et privé (URL présignées à durée limitée). `S3_ENDPOINT` active
 * le mode path-style requis par MinIO/Scaleway.
 */
export class S3Provider implements ResolvableStorageProvider {
  readonly id = 's3' as const
  private readonly client: S3Client
  private readonly publicBucket: string
  private readonly privateBucket: string
  private readonly endpoint: string | undefined
  private readonly region: string
  private readonly publicBaseUrl: string | undefined

  constructor(options: S3ProviderOptions = {}) {
    const env = getEnvSafe()
    const accessKeyId = options.accessKeyId ?? env.S3_ACCESS_KEY_ID
    const secretAccessKey = options.secretAccessKey ?? env.S3_SECRET_ACCESS_KEY
    if (!accessKeyId || !secretAccessKey) {
      throw new StorageConfigurationError('S3_ACCESS_KEY_ID et S3_SECRET_ACCESS_KEY sont requis pour le fournisseur s3')
    }
    this.endpoint = options.endpoint ?? env.S3_ENDPOINT
    this.region = options.region ?? env.S3_REGION ?? 'eu-west-1'
    this.publicBucket = options.publicBucket ?? env.S3_BUCKET_PUBLIC ?? 'fetrag-public'
    this.privateBucket = options.privateBucket ?? env.S3_BUCKET_PRIVATE ?? 'fetrag-private'
    this.publicBaseUrl = options.publicBaseUrl?.replace(/\/+$/, '')
    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: Boolean(this.endpoint),
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  private bucketFor(visibility: StorageVisibility): string {
    return visibility === 'PUBLIC' ? this.publicBucket : this.privateBucket
  }

  private publicUrl(objectKey: string): string {
    const encoded = objectKey.split('/').map(encodeURIComponent).join('/')
    if (this.publicBaseUrl) return `${this.publicBaseUrl}/${encoded}`
    if (this.endpoint) return `${this.endpoint.replace(/\/+$/, '')}/${this.publicBucket}/${encoded}`
    return `https://${this.publicBucket}.s3.${this.region}.amazonaws.com/${encoded}`
  }

  async put(key: string, data: StorageBody, options: PutOptions): Promise<PutResult> {
    const fullKey = withVisibility(key, options.visibility)
    const body = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data)
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketFor(options.visibility),
        Key: fullKey,
        Body: body,
        ContentType: options.contentType,
        CacheControl:
          options.visibility === 'PUBLIC' ? `public, max-age=${options.cacheControlMaxAge ?? 2592000}` : 'private, no-store',
      }),
    )
    return {
      key: fullKey,
      url: options.visibility === 'PUBLIC' ? this.publicUrl(fullKey) : `s3://${this.privateBucket}/${fullKey}`,
    }
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const fullKey = normalizeKey(key)
    const visibility = visibilityOf(fullKey) ?? 'PRIVATE'
    if (visibility === 'PUBLIC') return this.publicUrl(fullKey)
    return presign(this.client, new GetObjectCommand({ Bucket: this.privateBucket, Key: fullKey }), {
      expiresIn: options.expiresInSeconds ?? 900,
    })
  }

  async delete(key: string): Promise<void> {
    const fullKey = normalizeKey(key)
    const visibility = visibilityOf(fullKey)
    const buckets = visibility ? [this.bucketFor(visibility)] : [this.publicBucket, this.privateBucket]
    for (const bucket of buckets) {
      await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: fullKey }))
    }
  }

  async list(prefix: string): Promise<StoredObject[]> {
    const normalized = prefix ? normalizeKey(prefix) : ''
    const visibility = normalized ? visibilityOf(normalized) : null
    const targets: Array<{ bucket: string; prefix: string; visibility: StorageVisibility }> = visibility
      ? [{ bucket: this.bucketFor(visibility), prefix: normalized, visibility }]
      : [
          { bucket: this.publicBucket, prefix: `public/${stripVisibility(normalized)}`, visibility: 'PUBLIC' },
          { bucket: this.privateBucket, prefix: `private/${stripVisibility(normalized)}`, visibility: 'PRIVATE' },
        ]
    const out: StoredObject[] = []
    for (const target of targets) {
      let token: string | undefined
      do {
        const page = await this.client.send(
          new ListObjectsV2Command({ Bucket: target.bucket, Prefix: target.prefix, ContinuationToken: token }),
        )
        for (const obj of page.Contents ?? []) {
          if (!obj.Key) continue
          out.push({
            key: obj.Key,
            size: obj.Size ?? null,
            url: target.visibility === 'PUBLIC' ? this.publicUrl(obj.Key) : null,
            uploadedAt: obj.LastModified ?? null,
          })
        }
        token = page.IsTruncated ? page.NextContinuationToken : undefined
      } while (token)
    }
    return out
  }

  async resolve(key: string): Promise<StorageResolution | null> {
    const fullKey = normalizeKey(key)
    if (visibilityOf(fullKey) === 'PUBLIC') return { kind: 'url', url: this.publicUrl(fullKey), stream: false }
    const url = await this.getSignedUrl(fullKey, { expiresInSeconds: 120 })
    return { kind: 'url', url, stream: false }
  }
}
