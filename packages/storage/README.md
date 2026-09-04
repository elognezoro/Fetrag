# @fetrag/storage

Stockage objet avec trois adaptateurs (ADR-003) derrière une interface unique :

```ts
import { getStorage, buildKey, validateUpload } from '@fetrag/storage'

const storage = getStorage() // selon STORAGE_PROVIDER : local | vercel-blob | s3
const { key, url } = await storage.put(buildKey('certificates', 'attestation.pdf'), pdfBytes, {
  contentType: 'application/pdf',
  visibility: 'PRIVATE',
})
const link = await storage.getSignedUrl(key, { expiresInSeconds: 600 })
```

## Clés

`buildKey(folder, fileName)` produit `folder/aaaa/mm/<uuid>-<slug>.<ext>`. Le fournisseur ajoute le préfixe de
visibilité et renvoie la clé canonique à conserver en base : `public/...` ou `private/...`. Toutes les opérations
suivantes (`getSignedUrl`, `delete`, `list`, `resolve`) reçoivent cette clé canonique.

## Fournisseurs

| Fournisseur | Variables | Public | Privé |
| --- | --- | --- | --- |
| `local` (développement) | aucune | `.storage/public/<clé>` servi par `/api/storage/<clé>` | `.storage/private/<clé>` servi par `/api/storage/<clé>?exp&sig` |
| `vercel-blob` | `BLOB_READ_WRITE_TOKEN` | URL directe du blob | clé `private/<jeton aléatoire>/...` stockée en accès public, relayée par la route applicative après vérification de la signature HMAC |
| `s3` (AWS, MinIO, Scaleway) | `S3_*` | URL publique du bucket public | URL présignée S3 (bucket privé) |

Les URL signées utilisent `AUTH_SECRET` (HMAC-SHA256 sur chemin + paramètres, `exp` en secondes UNIX).

## Route applicative à exposer (lot shells)

Chaque application Next doit créer `src/app/api/storage/[...key]/route.ts` :

```ts
import { serveStorageRequest } from '@fetrag/storage'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const r = await serveStorageRequest(req.url)
  if (r.status === 200) return new Response(r.body, { status: 200, headers: r.headers })
  if (r.status === 302) return new Response(null, { status: 302, headers: { ...r.headers, Location: r.location } })
  return new Response(r.message, { status: r.status, headers: r.headers })
}
```

Cette route est indispensable pour le fournisseur `local` et pour les objets privés de `vercel-blob`.
Ajouter `?download=1` pour forcer le téléchargement.

## Validation des envois

`validateUpload(file, { maxMb, mimeTypes })` vérifie la taille, le type MIME (jokers `image/*` acceptés), la
cohérence extension/type et bloque les extensions exécutables. Elle lève `StorageValidationError` (exportée aussi
sous le nom `ValidationError`), de forme identique à `ValidationError` de `@fetrag/domain` (`code`, `status`, `details`).
