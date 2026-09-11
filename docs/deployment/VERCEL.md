# Déploiement Vercel (recette) puis domaines fetrag.ga / formation.fetrag.ga

## 1. Deux projets Vercel sur le même dépôt

| Projet | Root Directory | Framework | Build | Domaine final |
| --- | --- | --- | --- | --- |
| `fetrag-web` | `apps/web` | Next.js (détection auto) | `pnpm install` puis `next build` | `fetrag.ga` (+ `www`) |
| `fetrag-lms` | `apps/lms` | Next.js (détection auto) | idem | `formation.fetrag.ga` |

Vercel détecte `pnpm-lock.yaml` à la racine, installe tout le monorepo et builde uniquement l'application du Root Directory. Le `postinstall` de `@fetrag/db` génère le client Prisma. Turborepo est disponible mais non requis pour le build Vercel.

Paramètres recommandés : Node 22, région `cdg1` (Paris) au plus proche de Neon `us-east-1` sinon `iad1`, « Include source files outside of the Root Directory » activé (valeur par défaut pour les monorepos).

### Le Root Directory est obligatoire

Si le journal de build affiche `Packages in scope: @fetrag/api-server` (ou tout autre nom que `@fetrag/web` / `@fetrag/lms`), le projet Vercel pointe sur le mauvais dossier : Vercel construit alors le serveur API Node (`apps/api`), qui n'est pas destiné à Vercel, et le déploiement échoue faute de sortie Next.js.

Correction : Vercel → projet → Settings → General → **Root Directory** → saisir `apps/web` (site) ou `apps/lms` (formation), enregistrer, puis relancer le déploiement (Deployments → Redeploy). Le framework détecté doit être « Next.js » et le journal doit montrer `Packages in scope: @fetrag/web` (ou `@fetrag/lms`) puis `▲ Next.js 15.5`.

Pour la plateforme de formation, créer un second projet Vercel sur le même dépôt avec Root Directory `apps/lms` : un projet Vercel ne construit qu'une application.

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
| `RESEND_API_KEY` | **obligatoire** : clé API Resend (`re_...`) - sans elle, aucun email ne part (fournisseur `console`) et la validation de compte est impossible | idem |
| `EMAIL_FROM` | `FETRAG <onboarding@resend.dev>` tant que le domaine n'est pas vérifié (envois limités à l'adresse du compte Resend) | `FETRAG <no-reply@fetrag.ga>` - domaine **vérifié** chez Resend (section 2 bis) |
| `EMAIL_PROVIDER` | optionnel : `resend`, `smtp` ou `console` ; absent = `resend` si `RESEND_API_KEY` est défini, sinon `smtp` si `SMTP_HOST`, sinon `console` | optionnel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | optionnels : uniquement pour un relais SMTP à la place de Resend | optionnels |
| `STORAGE_PROVIDER` + `BLOB_READ_WRITE_TOKEN` | `vercel-blob` (créer un store Blob dans Vercel Storage) | `vercel-blob` ou `s3` |
| `FEATURE_PAYMENTS`, `FEATURE_FORUMS`, `FEATURE_NEWSLETTER` | `true` | selon décision |

Le SSO complet (une seule connexion pour les deux sites) fonctionne uniquement avec `AUTH_COOKIE_DOMAIN=.fetrag.ga` sur les domaines définitifs (ADR-002).

Les variables ne sont lues qu'au démarrage du processus : après toute modification, redéployer les deux projets (Deployments → Redeploy).

## 2 bis. Emails transactionnels avec Resend

Resend (`https://resend.com`) est le fournisseur email principal (ADR-003). Il porte la confirmation d'adresse à l'inscription, la réinitialisation de mot de passe, les invitations de compte, les convocations et les reçus. La procédure complète, à faire une seule fois :

1. **Créer le compte et la clé** : Resend → API Keys → Create API Key (permission « Sending access », domaine « All domains »). Copier la clé (`re_...`) dans `RESEND_API_KEY` sur les deux projets Vercel. Ne jamais la commiter.
2. **Vérifier temporairement l'envoi sans domaine** (recette) : `EMAIL_FROM="FETRAG <onboarding@resend.dev>"`. Dans ce mode, Resend n'accepte que l'adresse email du compte Resend comme destinataire : suffisant pour valider le parcours inscription → email → confirmation, pas pour des utilisateurs réels.
3. **Ajouter le domaine** : Resend → Domains → Add Domain → `fetrag.ga` (région Europe, `eu-west-1`). Resend affiche les enregistrements DNS à créer chez le registrar du domaine :
   - **DKIM** : un enregistrement `TXT` sur `resend._domainkey.fetrag.ga` (valeur `p=MIGf...` fournie par Resend) ;
   - **SPF** : un enregistrement `MX` sur `send.fetrag.ga` (`feedback-smtp.eu-west-1.amazonses.com`, priorité 10) et un `TXT` sur `send.fetrag.ga` (`v=spf1 include:amazonses.com ~all`) ;
   - **DMARC** (recommandé) : `TXT` sur `_dmarc.fetrag.ga` avec `v=DMARC1; p=none; rua=mailto:postmaster@fetrag.ga` pour commencer, puis `p=quarantine` une fois les rapports propres.
   Ces enregistrements s'ajoutent à ceux de la section 5 (Vercel) et ne les remplacent pas.
4. **Attendre la vérification** : Resend → Domains → bouton « Verify DNS Records ». Le statut passe à « Verified » en quelques minutes à quelques heures selon la propagation DNS.
5. **Basculer l'expéditeur** : `EMAIL_FROM="FETRAG <no-reply@fetrag.ga>"` sur les deux projets, puis redéployer. `EMAIL_PROVIDER` peut rester vide (Resend est choisi dès que `RESEND_API_KEY` est défini).
6. **Contrôler** : créer un compte sur `/inscription` avec une adresse réelle, vérifier la réception de l'email « Confirmez votre adresse email », cliquer sur le lien, se connecter. Dans le back-office, la liste des livraisons (`EmailDelivery`) doit montrer `provider = resend`, statut `SENT` et un `providerRef` (identifiant Resend consultable dans Resend → Emails).

En cas de panne ou d'emails non reçus : `docs/runbooks/panne-email.md`.

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
- Parcours email complet (`docs/RECETTE.md`, section « Emails et validation de compte ») : création de compte sur `/inscription`, réception du lien de confirmation, connexion sur le site puis sur le LMS, réinitialisation depuis `/mot-de-passe-oublie`.
