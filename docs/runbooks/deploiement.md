# Runbook - Déploiement (Vercel et Docker)

| | |
| --- | --- |
| Exigences couvertes | Chapitre 27 (environnements, pipeline, migrations contrôlées, déploiements indépendants), SHR-03 (migrations versionnées), ADR-001 |
| Rôles | Exploitant (droits Vercel / VPS), Super administrateur (variables), développeur de garde (rollback) |
| Documents liés | `docs/deployment/VERCEL.md` (paramétrage initial), `infra/deployment/README.md` (options d'hébergement), `supervision.md`, `rotation-secrets.md`, `.github/workflows/ci.yml` |

## 1. Environnements

| Environnement | Base | URL | Particularités |
| --- | --- | --- | --- |
| Local | Neon (branche `dev`) ou Docker `postgres` | `http://localhost:3000` / `:3001` | `.env` racine lu par `next.config.ts` ; `EMAIL_PROVIDER=console`, `STORAGE_PROVIDER=local`, `PAYMENT_PROVIDER=sandbox` |
| CI (GitHub Actions) | PostgreSQL 16 éphémère (service) | - | `pnpm install --frozen-lockfile` → `prisma migrate deploy` → lint → typecheck → test → audit → build |
| Recette (Preview Vercel) | Branche Neon `preview` (ou base de recette dédiée) | `https://fetrag-web-<hash>.vercel.app` | Déploiement automatique à chaque PR ; comptes de démo ; sandbox de paiement |
| Production | Branche Neon principale | `https://fetrag.ga`, `https://formation.fetrag.ga` | Déploiement automatique sur `main` ; `AUTH_COOKIE_DOMAIN=.fetrag.ga` ; `FEATURE_LOCAL_AUTH=false` une fois l'IdP branché |

Règle : **jamais** de `prisma migrate dev`, `db push` ou `db:seed` contre la production. Les migrations sont créées en local, revues en PR, appliquées par `prisma migrate deploy`.

## 2. Pipeline standard (Vercel)

1. **PR** : la CI doit être verte (`quality` : lint, typecheck, tests, audit, build). Vercel crée un déploiement Preview par application (`fetrag-web`, `fetrag-lms`).
2. **Migrations** : si la PR contient une migration (`packages/db/prisma/migrations/*`), l'appliquer **avant** la fusion sur la base de production, depuis un poste d'exploitation ou une étape CI manuelle :

   ```bash
   # .env pointant sur la production (DATABASE_URL_UNPOOLED requis par Prisma pour directUrl)
   pnpm --filter @fetrag/db exec prisma migrate status
   pnpm db:deploy
   ```

   Les migrations sont **additives** par défaut (colonnes nullable, nouvelles tables). Une migration destructive (suppression / renommage de colonne) se fait en deux déploiements : 1) ajouter la nouvelle structure + code compatible, 2) supprimer l'ancienne une fois l'ancien code retiré. Un plan de retour arrière est écrit dans la description de la PR.
3. **Fusion sur `main`** : Vercel construit et déploie les deux projets en parallèle (chacun n'est reconstruit que si ses fichiers ou ses packages ont changé, grâce à Turborepo). Durée typique : 3 à 6 minutes par projet.
4. **Smoke tests** (5 minutes, à faire pour chaque mise en production) :
   - `curl -sS https://fetrag.ga/api/health` et `https://formation.fetrag.ga/api/health` → `"ok": true`, `version` = SHA court du commit déployé.
   - Page d'accueil, une actualité, le catalogue `/formations`, la fiche du cours pilote `formation.fetrag.ga/cours/fondamentaux-du-syndicalisme-gabonais`.
   - Connexion avec un compte de test (rôle LEARNER dédié à la recette de production), ouverture du LMS sans ressaisie (SSO).
   - `/api/v1/docs` répond (documentation OpenAPI).
   - Un appel cron manuel réussit (`jobs-bloques.md`, section 4).
   - Optionnel : `node scripts/e2e.mjs test --grep @smoke` avec `E2E_WEB_URL` / `E2E_LMS_URL` pointés sur la production (tests en lecture seule uniquement ; voir `docs/architecture/TESTING.md`, section 5).
5. **Annoncer** la version dans `docs/CHANGELOG.md` (déjà rédigé dans la PR) et au support (nouveautés visibles).

## 3. Variables d'environnement

La liste complète et les valeurs par environnement sont dans `docs/deployment/VERCEL.md` (section 2) et `.env.example`. Points de vigilance à chaque déploiement :

- Une variable ajoutée par une PR doit être créée dans Vercel **avant** la fusion, sinon `getEnv()` lève « Configuration invalide » au démarrage (visible dans `/api/health` → contrôle `config`).
- `AUTH_SECRET` identique sur les deux projets ; `NEXT_PUBLIC_*` nécessitent un rebuild (inlinées au build).
- Après modification d'une variable : Deployments → Redeploy (sans cache si `NEXT_PUBLIC_*`).

## 4. Retour arrière (rollback)

| Situation | Action | Durée |
| --- | --- | --- |
| Régression fonctionnelle sans migration | Vercel → Deployments → déploiement précédent → « Promote to Production » (instantané, sur les deux projets si les deux ont changé) | 1 min |
| Régression avec migration additive | Rollback du code (ci-dessus) ; la migration reste en place (colonnes inutilisées) ; corriger en avant | 1 min |
| Migration défectueuse (échec de `migrate deploy`) | La migration n'est pas marquée appliquée : corriger le SQL, `prisma migrate resolve --rolled-back <nom>` si Prisma la considère « failed », puis `pnpm db:deploy` | 15 min |
| Données corrompues par le nouveau code | `restauration-base.md` (PITR à l'instant du déploiement) + rollback du code | 30 à 60 min |
| Panne Vercel | Bascule vers l'environnement Docker de secours (section 5) si celui-ci est maintenu ; sinon attendre (SLA Vercel) et communiquer | variable |

Le déploiement précédent reste disponible dans Vercel ; ne pas supprimer les déploiements récents.

## 5. Déploiement Docker (auto-hébergé ou secours)

Référence : `infra/docker/docker-compose.yml`, `infra/docker/Dockerfile.next`, `infra/docker/Dockerfile.node`, `infra/proxy/Caddyfile`.

### 5.1 Prérequis

- Serveur Linux (4 vCPU, 8 Go RAM, 80 Go SSD recommandés), Docker 24+ et Docker Compose v2, ports 80/443 ouverts, DNS `fetrag.ga`, `www`, `formation`, `api` pointés vers le serveur.
- Fichier `.env` racine complet (`STORAGE_PROVIDER=s3` vers MinIO ou un S3 externe, `EMAIL_PROVIDER=smtp`, `PAYMENT_PROVIDER` réel, `AUTH_COOKIE_DOMAIN=.fetrag.ga`, `APP_*_URL` en https).
- Base : PostgreSQL 16 du compose (`postgres`) ou Neon (préférable pour les sauvegardes managées).

### 5.2 Première mise en service

```bash
git clone <dépôt> fetrag && cd fetrag
cp .env.example .env && nano .env                    # renseigner les valeurs de production
docker compose -f infra/docker/docker-compose.yml build web lms api worker
docker compose -f infra/docker/docker-compose.yml up -d postgres minio
docker compose -f infra/docker/docker-compose.yml run --rm api sh -c "cd /repo && pnpm --filter @fetrag/db exec prisma migrate deploy"
docker compose -f infra/docker/docker-compose.yml up -d web lms api worker proxy
```

Créer les buckets MinIO `fetrag-public` (lecture publique) et `fetrag-private` (privé) depuis la console `:9001`. Caddy obtient les certificats TLS automatiquement (Let's Encrypt) dès que le DNS résout.

### 5.3 Mise à jour

```bash
git pull
docker compose -f infra/docker/docker-compose.yml build web lms api worker
docker compose -f infra/docker/docker-compose.yml run --rm api sh -c "cd /repo && pnpm --filter @fetrag/db exec prisma migrate deploy"
docker compose -f infra/docker/docker-compose.yml up -d web lms api worker
docker compose -f infra/docker/docker-compose.yml ps
curl -sS https://fetrag.ga/api/health
```

Le worker remplace le cron Vercel : il traite la file toutes les 5 secondes et lance la maintenance périodique toutes les 5 minutes. Ne pas activer en plus un cron externe sur `/api/cron/jobs` (inutile).

### 5.4 Rollback Docker

`git checkout <tag précédent>` puis rebuild + `up -d`. Les images précédentes restent en cache local ; `docker compose up -d --no-build` après `docker tag` de l'image antérieure évite un rebuild.

## 6. Liste de vérification avant mise en production (go-live)

- [ ] CI verte sur `main`, `docs/CHANGELOG.md` à jour.
- [ ] Migrations appliquées (`prisma migrate status` : « up to date »).
- [ ] Variables de production complètes ; aucun `change-me` (`CRON_SECRET`, `PAYMENT_WEBHOOK_SECRET`) ; `EMAIL_PROVIDER=smtp` ; `STORAGE_PROVIDER` non `local`.
- [ ] Comptes de démonstration désactivés ou mots de passe changés ; MFA activée sur les rôles privilégiés (`rotation-secrets.md`, section 9).
- [ ] Domaines et TLS actifs ; `AUTH_COOKIE_DOMAIN=.fetrag.ga` ; SSO vérifié.
- [ ] Sauvegarde logique initiale réalisée et restauration testée (`restauration-base.md`, section 6).
- [ ] Supervision en place (`supervision.md`) : uptime, alertes 5xx, jobs, webhooks.
- [ ] Revue de sécurité indépendante réalisée ou dérogation écrite (SEC-10).
- [ ] Guides utilisateurs remis (`docs/guides/`), runbooks accessibles à l'équipe FETRAG.
