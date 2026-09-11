# ADR-003 - Adaptateurs paiement, stockage et email

- Statut : accepté (septembre 2026), mis à jour le 11 septembre 2026 (choix de Resend comme fournisseur email principal)
- Contexte : SHR-04, SHR-06, chapitre 19-20. Le PSP mobile money (Airtel Money / Moov Money au Gabon) et le stockage objet seront choisis au cadrage ; le fournisseur email est retenu (voir « Email »).

## Décision

- **Paiements** (`packages/payments`) : interface `PaymentProvider { createPayment, getStatus, refund, handleWebhook, reconcile }`. Adaptateur `sandbox` livré (paiement simulé : succès, échec, remboursement, webhook signé HMAC) pour les tests automatisés et la recette. Squelettes `airtel-money` et `moov-money` documentés. Le domaine ne connaît que `PaymentProvider`. Toute création de paiement exige une `Idempotency-Key`.
- **Stockage** (`packages/storage`) : interface `StorageProvider { put, getSignedUrl, delete, list }`. Adaptateurs `local` (dossier `.storage`, dev), `vercel-blob` (Vercel), `s3` (S3/MinIO/Scaleway). Buckets public/privé séparés ; contenus privés servis par URL signée à durée limitée.
- **Email** (`packages/notifications`) : interface `EmailProvider { send }`. Adaptateurs `resend` (fournisseur principal), `smtp` (Nodemailer, relais de secours) et `console` (développement). Les envois passent par `EmailDelivery` + job `email.send` rejouable. SMS/WhatsApp sont des adaptateurs optionnels, non requis.

### Fournisseur email retenu : Resend (mise à jour du 11 septembre 2026)

- **Choix** : Resend est le fournisseur email principal de la plateforme (confirmation d'adresse, réinitialisation de mot de passe, invitations de compte, convocations, reçus, notifications).
- **Motivations** : API HTTP simple appelée avec `fetch` natif (aucun SDK ni dépendance supplémentaire, compatible avec les fonctions serverless Vercel sans connexion SMTP sortante persistante) ; identifiant de message (`providerRef`) et journal consultable pour le support ; vérification de domaine guidée (DKIM, SPF) et région Europe ; offre gratuite suffisante pour la recette, tarification progressive ensuite ; expéditeur de test `onboarding@resend.dev` pour valider le parcours avant la vérification du domaine.
- **Sélection** : `emailProvider()` de `@fetrag/config` choisit `EMAIL_PROVIDER` s'il est défini, sinon `resend` dès que `RESEND_API_KEY` existe, sinon `smtp` si `SMTP_HOST` existe, sinon `console`. L'expéditeur commun est `EMAIL_FROM` (domaine vérifié chez Resend), `SMTP_FROM` restant accepté pour compatibilité.
- **Réversibilité** : l'adaptateur SMTP est conservé et testé ; changer de fournisseur revient à définir `EMAIL_PROVIDER=smtp` et les `SMTP_*`, sans modification de code (chapitre 41 du CDC).
- **Sécurité** : la clé Resend ne transite que par les variables d'environnement Vercel ; rotation décrite dans `docs/runbooks/rotation-secrets.md` ; aucun mot de passe n'est jamais envoyé par email (les comptes créés par l'administration ou la coordination reçoivent un lien à usage unique « définir mon mot de passe », valable 7 jours).

## Conséquences

- Aucun fournisseur codé en dur dans le domaine ; changement de fournisseur = nouvelle classe + variable `*_PROVIDER`.
- Les webhooks sont d'abord journalisés (`WebhookEvent`, signature vérifiée) puis traités par un job idempotent.
- `RESEND_API_KEY` et `EMAIL_FROM` deviennent obligatoires en recette et en production (`docs/deployment/VERCEL.md`) : sans elles, la validation de compte à l'inscription et la réinitialisation de mot de passe sont impossibles.
- Le runbook `docs/runbooks/panne-email.md` couvre le diagnostic Resend (codes d'erreur, statut de l'API, relance des jobs `email.send`).
