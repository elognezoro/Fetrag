# ADR-003 - Adaptateurs paiement, stockage et email

- Statut : accepté (septembre 2026)
- Contexte : SHR-04, SHR-06, chapitre 19-20. Le PSP mobile money (Airtel Money / Moov Money au Gabon), le stockage objet et le fournisseur email seront choisis au cadrage.

## Décision

- **Paiements** (`packages/payments`) : interface `PaymentProvider { createPayment, getStatus, refund, handleWebhook, reconcile }`. Adaptateur `sandbox` livré (paiement simulé : succès, échec, remboursement, webhook signé HMAC) pour les tests automatisés et la recette. Squelettes `airtel-money` et `moov-money` documentés. Le domaine ne connaît que `PaymentProvider`. Toute création de paiement exige une `Idempotency-Key`.
- **Stockage** (`packages/storage`) : interface `StorageProvider { put, getSignedUrl, delete, list }`. Adaptateurs `local` (dossier `.storage`, dev), `vercel-blob` (Vercel), `s3` (S3/MinIO/Scaleway). Buckets public/privé séparés ; contenus privés servis par URL signée à durée limitée.
- **Email** (`packages/notifications`) : interface `EmailProvider { send }`. Adaptateurs `console` (dev/recette) et `smtp` (Nodemailer). Les envois passent par `EmailDelivery` + job `email.send` rejouable. SMS/WhatsApp sont des adaptateurs optionnels, non requis.

## Conséquences

- Aucun fournisseur codé en dur dans le domaine ; changement de fournisseur = nouvelle classe + variable `*_PROVIDER`.
- Les webhooks sont d'abord journalisés (`WebhookEvent`, signature vérifiée) puis traités par un job idempotent.
