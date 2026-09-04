# Déploiement Vercel (recette) puis domaines fetrag.ga / formation.fetrag.ga

## 1. Deux projets Vercel sur le même dépôt

| Projet | Root Directory | Framework | Build | Domaine final |
| --- | --- | --- | --- | --- |
| `fetrag-web` | `apps/web` | Next.js (détection auto) | `pnpm install` puis `next build` | `fetrag.ga` (+ `www`) |
| `fetrag-lms` | `apps/lms` | Next.js (détection auto) | idem | `formation.fetrag.ga` |

Vercel détecte `pnpm-lock.yaml` à la racine, installe tout le monorepo et builde uniquement l'application du Root Directory. Le `postinstall` de `@fetrag/db` génère le client Prisma. Turborepo est disponible mais non requis pour le build Vercel.

Paramètres recommandés : Node 22, région `cdg1` (Paris) au plus proche de Neon `us-east-1` sinon `iad1`, « Include source files outside of the Root Directory » activé (valeur par défaut pour les monorepos).

## 2. Variables d'environnement (identiques sur les deux projets sauf mention)

| Variable | Valeur recette | Production |
| --- | --- | --- |
| `DATABASE_URL` | chaîne poolée Neon (`...-pooler...?sslmode=require`) | idem |
| `DATABASE_URL_UNPOOLED` | chaîne directe Neon | idem |
| `AUTH_SECRET` | `openssl rand -base64 32` - **la même valeur sur les deux projets** | idem |
| `AUTH_TRUST_HOST` | `true` | `true` |
| `AUTH_COOKIE_DOMAIN` | vide (impossible entre deux `*.vercel.app`) | `.fetrag.ga` |
| `FEATURE_LOCAL_AUTH` | `true` | `false` dès que l'IdP OIDC est branché |
| `OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` | vides | valeurs de l'IdP |
| `APP_WEB_URL`, `NEXT_PUBLIC_APP_WEB_URL` | `https://fetrag-web.vercel.app` | `https://fetrag.ga` |
| `APP_LMS_URL`, `NEXT_PUBLIC_APP_LMS_URL` | `https://fetrag-lms.vercel.app` | `https://formation.fetrag.ga` |
| `CRON_SECRET` | aléatoire (Vercel l'ajoute automatiquement à l'en-tête des crons) | idem |
| `PAYMENT_PROVIDER` / `PAYMENT_WEBHOOK_SECRET` | `sandbox` / aléatoire | PSP retenu |
| `EMAIL_PROVIDER` + `SMTP_*` | `console` | `smtp` + identifiants |
| `STORAGE_PROVIDER` + `BLOB_READ_WRITE_TOKEN` | `vercel-blob` (créer un store Blob dans Vercel Storage) | `vercel-blob` ou `s3` |
| `FEATURE_PAYMENTS`, `FEATURE_FORUMS`, `FEATURE_NEWSLETTER` | `true` | selon décision |

Le SSO complet (une seule connexion pour les deux sites) fonctionne uniquement avec `AUTH_COOKIE_DOMAIN=.fetrag.ga` sur les domaines définitifs (ADR-002).

## 3. Base de données

Les migrations sont appliquées depuis un poste (ou la CI) avec le `.env` : `pnpm db:deploy`. Le seed de recette : `pnpm db:seed`. Ne jamais lancer `prisma migrate dev` contre la production.

## 4. Crons

`apps/web/vercel.json` et `apps/lms/vercel.json` déclarent `GET /api/cron/jobs` toutes les 5 minutes (file de jobs : emails, certificats PDF, publications planifiées, rappels). Un seul des deux projets suffit ; désactiver le cron du LMS si souhaité.

## 5. Domaines

1. Dans chaque projet Vercel : Settings → Domains → ajouter `fetrag.ga` (+ `www.fetrag.ga` redirigé) et `formation.fetrag.ga`.
2. Chez le registrar : `A fetrag.ga → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`, `CNAME formation → cname.vercel-dns.com`.
3. Mettre à jour `APP_*_URL`, `NEXT_PUBLIC_APP_*_URL` et `AUTH_COOKIE_DOMAIN=.fetrag.ga`, puis redéployer les deux projets.

## 6. Vérifications après déploiement

- `https://<web>/api/health` et `https://<lms>/api/health` → `{ ok: true }`.
- `https://<web>/api/v1/docs` → documentation OpenAPI.
- Connexion avec `admin@fetrag.ga` / `Fetrag2026!`, publication d'une actualité, inscription à un cours, quiz, certificat, vérification publique `/certificats/verifier/<code>`, paiement sandbox.
