# Sécurité - matrice des exigences et état de mise en œuvre

Référence : chapitre 23 du CDC (SEC-01 à SEC-10), chapitre 15 (identité), chapitre 17 (contrats, idempotence, webhooks). Les états sont évalués sur le code du dépôt à la version 0.1.0 ; « à vérifier » signale un point que ce document ne peut pas confirmer sans exécution ou sans décision de cadrage.

Légende : **Livré** (implémenté dans le socle), **Partiel** (implémenté avec réserves), **Procédure** (couvert par un runbook ou une action d'exploitation, pas par du code), **À faire** (avant go-live).

## 1. Matrice SEC-01 à SEC-10

| ID | Exigence | Mise en œuvre | État |
| --- | --- | --- | --- |
| SEC-01 | TLS partout, HSTS, CSP, cookies Secure/HttpOnly/SameSite, protections CSRF et clickjacking | `next.config.ts` (web et lms) : `Strict-Transport-Security max-age=63072000; includeSubDomains; preload`, `Content-Security-Policy` (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `upgrade-insecure-requests` en production), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Cookies Auth.js `__Secure-authjs.session-token` (HttpOnly, Secure, SameSite=Lax, domaine `.fetrag.ga`), CSRF `__Host-authjs.csrf-token`. Server Actions Next.js protégées par jeton d'origine ; Caddy (`infra/proxy/Caddyfile`) applique les mêmes en-têtes en auto-hébergement. TLS fourni par Vercel ou Caddy. | Livré. Réserve : la CSP autorise `'unsafe-inline'` pour `script-src` et `style-src` (contrainte Next.js / next/font) - durcissement par nonces à étudier après MVP |
| SEC-02 | MFA obligatoire pour administrateurs et rôles privilégiés via l'IdP | `mfaRequiredRoles = SUPER_ADMIN, COORDINATOR, FINANCE, EDITOR` ; TOTP `otplib` + codes de secours (`enableMfa`, `verifyMfaForUser`), écran `/espace/securite`, champ « Code de vérification » au login ; avec IdP OIDC, MFA déléguée. L'obligation stricte aux gardes (`enforceMfa`) est activée par `AUTH_ENFORCE_MFA=true`. | Partiel : le mécanisme est livré ; l'obligation est un réglage à activer en production (`AUTH_ENFORCE_MFA=true`) et à imposer côté IdP au cadrage |
| SEC-03 | Validation stricte des entrées côté serveur, contrôle MIME/taille des uploads, antivirus recommandé | Zod au bord du système (`@fetrag/contracts`, schémas d'entrée des packages `cms`, `lms-core`, `payments`), `parseInput` ; `validateUpload(file, { maxMb, mimeTypes })` (`@fetrag/storage`) avec listes `imageMimeTypes`, `documentMimeTypes`, `mediaMimeTypes` ; pièces des demandes limitées (PDF, JPEG, PNG, Word, 10 Mo) ; HTML éditorial assaini (`sanitize-html`, liste blanche) ; `serverActions.bodySizeLimit = 12mb`. | Livré pour la validation et le MIME/taille. À faire : analyse antivirus des pièces externes (service tiers ou ClamAV en auto-hébergement) - recommandation, décision au cadrage |
| SEC-04 | Rate limiting : authentification, formulaires, recherche, certificats, paiements, API sensibles | `checkRateLimit(key, limit, windowMs)` (`apps/*/src/lib/rate-limit.ts`, fenêtre fixe, en mémoire) appliqué aux Server Actions de connexion / inscription et aux formulaires ; recherche limitée en longueur (`MAX_QUERY_LENGTH = 100`) et routée avec limitation ; API Hono avec middleware de limitation mémoire ; vérification de certificat journalisée par IP hachée. | Partiel : compteurs par instance serverless (non partagés). Suffisant en V1 ; compteur partagé (PostgreSQL / Redis) ou pare-feu Vercel à prévoir si abus constatés. Couverture exacte des routes de paiement et de certificat : à vérifier dans les lots web/lms |
| SEC-05 | Secrets hors dépôt, variables chiffrées / secret manager, rotation documentée | `.env` ignoré par Git, `.env.example` sans valeur ; `getEnv()` (`@fetrag/config`) valide et centralise ; variables chiffrées Vercel ; secrets GitHub Actions ; runbook `docs/runbooks/rotation-secrets.md` (inventaire, périodicité, procédures) ; valeurs par défaut `change-me` détectées (cron refuse `change-me`). | Livré (code + procédure). À faire avant go-live : rotation initiale et remplacement de tous les `change-me` (liste de vérification de `deploiement.md`) |
| SEC-06 | Dépendances auditées, SAST, scans de conteneur, correction des vulnérabilités critiques | CI (`.github/workflows/ci.yml`) : `pnpm install --frozen-lockfile`, lint, typecheck, tests, `pnpm audit --audit-level high` (non bloquant), build ; images Docker `node:22-alpine` sans root (`USER fetrag`). | Partiel : audit non bloquant, pas de SAST dédié ni de scan d'image dans la CI. À faire : rendre `pnpm audit` bloquant sur « critical », ajouter CodeQL (SAST) et Trivy (scan d'image) - voir `docs/BACKLOG.md` |
| SEC-07 | Sauvegardes automatiques de la base et des contenus, restauration testée | PITR Neon + `pg_dump` quotidien chiffré (`scripts/backup.md`), stockage objet versionné ou copié ; runbook `docs/runbooks/restauration-base.md` avec exercice trimestriel ; export de réversibilité `scripts/export-data.ts`. | Procédure documentée. À faire : planifier réellement la tâche de sauvegarde et exécuter le premier test de restauration avant la recette finale (critère de recette 10) |
| SEC-08 | Moindre privilège : base, stockage, CI/CD, comptes d'exploitation | Rôle Neon applicatif dédié (chaînes poolée / directe), buckets public / privé séparés avec URL signées à durée limitée, RBAC applicatif avec portées et expiration des rôles, conteneurs non root, `CRON_SECRET` pour le cron, clés API par partenaire avec expiration. | Livré côté application. Procédure : revue trimestrielle des accès Vercel / Neon / GitHub (`incident-securite.md`, section 4) ; séparation des rôles Neon lecture/écriture : à vérifier au cadrage |
| SEC-09 | Aucune donnée personnelle sensible inutile dans les logs, traces ou analytics | Logger JSON avec caviardage automatique des clés `password`, `secret`, `token`, `authorization`, `cookie`, `card`, `cvv`, `otp`, `totp`, `iban` (`@fetrag/observability`) ; IP hachées (`hashIp`) dans `AuditLog` et `CertificateVerificationEvent` ; analytics avec identifiant utilisateur haché (`hashUserId`) et chemins nettoyés ; `maskEmail` pour les logs email ; export de réversibilité sans hash ni secret. | Livré. Vigilance : ne pas logger de payloads bruts dans les nouveaux handlers (revue de code) |
| SEC-10 | Revue de sécurité indépendante avant go-live ou après changement majeur | Non réalisable par le code. Le périmètre recommandé est décrit en section 4. | À faire : à planifier au cadrage (chapitre 34, « audit de sécurité ») |

## 2. Contrôles transverses (chapitres 15 et 17)

| Contrôle | Mise en œuvre | Référence |
| --- | --- | --- |
| Identité fédérée OIDC, pas de SSO maison | Auth.js v5 : provider OIDC générique (PKCE, state), Credentials local temporaire (`FEATURE_LOCAL_AUTH`), session JWT partagée sur `.fetrag.ga` | ADR-002, `packages/auth/src/config.ts` |
| Mots de passe (mode local) | bcrypt (`hashPassword` / `verifyPassword`), politique `passwordSchema` (8+ caractères, majuscule, chiffre), échecs audités (`auth.login_failed`), comptes désactivables (`isActive`) | `packages/auth/src/password.ts`, `@fetrag/contracts` |
| RBAC + portées | `can(principal, action, resource)` avec `globalGrants`, `scopedGrants`, `organizationFilter` ; gardes `requireUser` / `requireRole` / `requireCan` ; `SUPER_ADMIN` implicite ; rôles à expiration | `packages/domain/src/rbac.ts`, `packages/auth/src/guards.ts` |
| Isolation organisationnelle | Filtre `organizationId` systématique (`scopedOrganizationFilter`, `assertOrganizationAccess` de `lms-core`) ; tests d'autorisation négatifs attendus par lot | CDC 16.1, `docs/architecture/TESTING.md` |
| Journal d'audit | `audit(action, entity, ctx, diff)` pour auth, rôles, contenus, cours, inscriptions, notes, présences, certificats, demandes, commandes, paiements, paramètres, exports ; immuable fonctionnellement ; consultable par SUPER_ADMIN et FINANCE (`audit.read`) | SHR-07, `packages/domain/src/audit.ts` |
| Idempotence | `checkoutInputSchema.idempotencyKey` obligatoire ; `BackgroundJob.idempotencyKey` unique ; `ActivityCompletion` unique par inscription + activité ; `WebhookEvent` unique par `provider + externalId` | CDC 17 |
| Webhooks | Signature vérifiée par l'adaptateur (HMAC-SHA256 à temps constant pour le sandbox), journalisation avant traitement, rejet journalisé (`verified = false`), traitement asynchrone, contrôle du montant | `packages/payments/src/webhooks.ts` |
| Contenus privés | URL signées à durée limitée (`getSignedUrl`, `signUrl` / `verifySignedUrl`), route `/api/storage/[...key]` (LMS) qui vérifie la signature, niveaux d'accès des ressources appliqués côté serveur (`resources.canAccess`) | SHR-04, `packages/storage` |
| Injection | Prisma (requêtes paramétrées) ; SQL brut de la recherche via `Prisma.sql` avec paramètres liés et requête assainie (`sanitizeQuery`) ; CSV avec neutralisation des formules (`csvCell`) | `packages/search`, `scripts/export-data.ts` |
| Consentements | `Consent(kind, granted, version, createdAt)`, `hasConsent` / `hasNewsletterConsent` avant tout envoi non essentiel, double opt-in newsletter, désinscription | SHR-08, WEB-13 |
| Champ anti-robot | Champ `website` (honeypot) dans les formulaires publics (`contactFormSchema`, `newsletterSchema`) | WEB-06 |

## 3. Données personnelles

- Catégories traitées : identité et contact (utilisateurs, participants, contacts d'organisation), données pédagogiques (progression, résultats, présences, dépôts), documents (certificats, pièces jointes), transactions (commandes, paiements - sans numéro de carte ni de compte : le PSP les détient), journaux (audit avec IP hachée).
- Minimisation : la vérification publique d'un certificat n'expose que nom du titulaire, intitulé, dates et statut (WEB-16) ; les analytics n'identifient pas l'utilisateur.
- Droits des personnes : consultation et modification dans `/espace/profil` ; demandes d'accès / effacement traitées par le Super administrateur (procédure `guides/support.md`, section 4.7). Les durées de conservation exactes et le texte des mentions légales sont à valider par le conseil juridique de la FETRAG (chapitre 23) : le dépôt fournit des pages `mentions-legales` et `confidentialite` à compléter.
- Exports : journalisés (`export.generated`), chiffrés, supprimés après remise (`scripts/backup.md`).

## 4. Revue de sécurité indépendante (SEC-10) - périmètre recommandé

1. Authentification : force brute, énumération de comptes, réinitialisation de mot de passe, MFA (contournement, codes de secours), fixation et durée de session, SSO cookie de domaine.
2. Autorisations : accès croisés entre organisations (ORG_MANAGER A → données de B), formateur hors de sa cohorte, apprenant → tentatives d'un autre, escalade vers `/admin` et `/coordination`, API `X-API-Key`.
3. Paiements : forge de webhook, rejeu, montant modifié, idempotence du checkout, coupons, remboursements.
4. Contenus et uploads : XSS via l'éditeur riche (assainissement), types MIME trompeurs, taille, accès aux fichiers privés sans signature, exposition par le sitemap / la recherche de contenus non publiés.
5. Infrastructure : en-têtes, TLS, dépendances, secrets, images Docker, configuration Vercel (variables Preview vs Production), Neon (rôles, IP allow-list si disponible).
6. Journalisation : absence de données sensibles, complétude de l'audit sur les actions listées en SHR-07.

Les tests d'autorisation négatifs automatisés (chapitre 29) et les scénarios E2E de `packages/testing/e2e` servent de base à la recette ; ils ne remplacent pas la revue indépendante.

## 5. Actions avant go-live (résumé)

| Action | Responsable | Référence |
| --- | --- | --- |
| Activer `AUTH_ENFORCE_MFA=true`, MFA sur tous les comptes privilégiés | Super administrateur | `rotation-secrets.md` section 9 |
| Remplacer les secrets `change-me`, rotation initiale | Exploitant | `rotation-secrets.md` |
| Désactiver les comptes de démonstration, `FEATURE_LOCAL_AUTH=false` dès l'IdP branché | Super administrateur | ADR-002 |
| Rendre `pnpm audit` bloquant, ajouter SAST + scan d'image | Développeur | `BACKLOG.md` |
| Première sauvegarde + test de restauration | Exploitant | `restauration-base.md` |
| Supervision et alertes actives | Exploitant | `supervision.md` |
| Revue de sécurité indépendante ou dérogation écrite | Secrétariat général | section 4 |
| Validation juridique des mentions légales, conservation, cookies | Conseil juridique | chapitre 23 |
