# Runbook - Restauration de la base de données

| | |
| --- | --- |
| Exigences couvertes | SEC-07 (sauvegardes automatiques et restauration testée), chapitre 28 du CDC, RPO ≤ 1 h / RTO ≤ 4 h (chapitre 24) |
| Rôles | Exploitant (accès console Neon + `.env` de production), Super administrateur FETRAG (validation), Support (communication) |
| Outils | Console Neon, `psql`, `pg_dump` / `pg_restore` 16+, `pnpm`, console Vercel |
| Documents liés | `scripts/backup.md`, `docs/runbooks/supervision.md`, `docs/runbooks/incident-securite.md`, `docs/deployment/VERCEL.md` |

## 1. Quand appliquer ce runbook

- Suppression ou corruption accidentelle de données (mauvaise migration, script de seed lancé contre la production, suppression en masse depuis le back-office).
- Base Neon indisponible ou dégradée au-delà du délai de tolérance (voir `supervision.md`).
- Exercice trimestriel de restauration (obligatoire : une restauration jamais testée n'est pas une sauvegarde).
- Migration vers un autre hébergeur PostgreSQL (réversibilité, chapitre 41).

Avant toute action : ouvrir un ticket d'incident (date, heure UTC, symptôme, dernière opération connue) et prévenir le Super administrateur. Ne jamais lancer `prisma migrate reset`, `prisma db push --force-reset` ni `pnpm db:reset` contre une base de production, quelle que soit l'urgence.

## 2. Deux mécanismes complémentaires

| Mécanisme | Source | Fenêtre | Usage |
| --- | --- | --- | --- |
| **PITR Neon** (restauration à un instant donné par branche) | Historique interne de Neon | Selon l'offre : 1 jour (gratuit) à 30 jours (payant) - vérifier « History retention » dans le projet Neon | Retour arrière rapide après erreur humaine ; RPO de quelques secondes |
| **Sauvegarde logique `pg_dump`** | Fichier `.dump` (format custom) produit quotidiennement, chiffré, stocké hors Neon | 30 jours glissants + 12 mensuelles | Reconstruction sur un hébergeur tiers, archivage, réversibilité |

La chaîne de connexion à utiliser pour `pg_dump` / `pg_restore` est **`DATABASE_URL_UNPOOLED`** (connexion directe). Le pooler (`-pooler` dans l'hôte) ne supporte pas les commandes de session nécessaires à ces outils.

## 3. Procédure A - Restauration PITR sur Neon (erreur humaine récente)

Durée cible : 20 à 40 minutes.

1. **Figer les écritures.** Dans Vercel, désactiver le cron `GET /api/cron/jobs` des deux projets (Settings → Cron Jobs → Disable) pour éviter que des jobs rejouent des envois pendant la restauration. Si un worker Docker tourne, l'arrêter (`docker compose stop worker`).
2. **Déterminer l'instant cible T** : horodatage UTC juste avant l'opération fautive. Sources : `AuditLog` (`SELECT action, "entityType", "createdAt" FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 50`), logs Vercel de la Server Action concernée, témoignage de l'utilisateur.
3. **Créer une branche de restauration** dans la console Neon : Branches → Create branch → « Include data up to a specific date and time » → renseigner T. Nommer la branche `restore-AAAAMMJJ-HHMM`. Neon crée un point de terminaison dédié avec ses propres chaînes de connexion.
4. **Vérifier la branche** avec `psql "<chaîne directe de la branche>"` :
   - `SELECT count(*) FROM "User";`, `SELECT count(*) FROM "Enrollment";`, `SELECT count(*) FROM "Certificate";` - comparer aux volumes attendus.
   - Vérifier que les données perdues sont bien présentes (par exemple la ligne supprimée, retrouvée par son `id` ou sa `reference`).
   - `SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 3;` doit lister les mêmes migrations que la production.
5. **Choisir la stratégie** :
   - *Bascule complète* (la production entière doit revenir à T) : dans Neon, promouvoir la branche de restauration comme branche principale (Branches → « Set as default ») ou, à défaut, mettre à jour `DATABASE_URL` et `DATABASE_URL_UNPOOLED` des deux projets Vercel avec les chaînes de la branche, puis redéployer (Deployments → Redeploy). Les écritures effectuées entre T et maintenant sont perdues : les lister depuis l'`AuditLog` de l'ancienne branche et prévenir les utilisateurs concernés.
   - *Restauration ciblée* (seules quelques lignes ont été perdues) : exporter les lignes depuis la branche (`pg_dump --data-only --table='"Article"'` puis `psql` vers la production, ou `COPY ... TO STDOUT` / `COPY ... FROM STDIN`) en respectant l'ordre des clés étrangères. Préférer cette voie lorsque des paiements ou des inscriptions ont eu lieu depuis T.
6. **Contrôles après bascule** : `https://fetrag.ga/api/health` et `https://formation.fetrag.ga/api/health` répondent `ok: true` ; connexion avec un compte de test ; `pnpm --filter @fetrag/db exec prisma migrate status` indique « Database schema is up to date » ; le back-office affiche les contenus attendus.
7. **Réactiver** les crons Vercel (ou le worker) et surveiller pendant une heure la file de jobs (`supervision.md`, section 4) : les jobs `email.send` créés avant T seront rejoués s'ils étaient `QUEUED` ou `FAILED` - c'est attendu et idempotent.
8. **Clôturer** : conserver la branche de restauration 7 jours puis la supprimer (elle consomme du stockage), compléter le journal d'incident, lancer une sauvegarde logique immédiate (section 5).

## 4. Procédure B - Restauration depuis une sauvegarde `pg_dump` (perte du projet Neon ou changement d'hébergeur)

Durée cible : 1 à 3 heures selon le volume.

1. **Préparer la base cible** : nouveau projet Neon (PostgreSQL 16), ou instance PostgreSQL 16 (`docker compose -f infra/docker/docker-compose.yml up -d postgres` sur un VPS). Créer la base vide `fetrag` et un rôle propriétaire dédié.
2. **Déchiffrer** la sauvegarde la plus récente valide (`age -d` ou `gpg -d`) et vérifier son intégrité : `pg_restore --list fetrag-AAAAMMJJ-HHMM.dump | head -50` doit lister les tables (`"User"`, `"Course"`, `"Enrollment"`...).
3. **Restaurer** :

   ```bash
   pg_restore --clean --if-exists --no-owner --no-privileges --jobs 4 \
     --dbname "$CIBLE_DIRECTE" fetrag-AAAAMMJJ-HHMM.dump
   ```

   Les avertissements « does not exist, skipping » sur une base vide sont normaux. Toute autre erreur doit être lue avant de poursuivre.
4. **Extensions** : la migration `20260904145500_search_extensions` crée `unaccent` et `pg_trgm`. Si la cible refuse (`permission denied to create extension`), les créer avec un rôle superutilisateur : `CREATE EXTENSION IF NOT EXISTS unaccent; CREATE EXTENSION IF NOT EXISTS pg_trgm;`.
5. **Aligner le schéma** : avec un `.env` pointant sur la cible, `pnpm --filter @fetrag/db exec prisma migrate status`. Si des migrations plus récentes que la sauvegarde existent dans le dépôt, `pnpm db:deploy` les applique.
6. **Basculer les applications** : mettre à jour `DATABASE_URL` / `DATABASE_URL_UNPOOLED` (Vercel : les deux projets ; Docker : `.env` puis `docker compose up -d`). Redéployer.
7. **Stockage objet** : les fichiers ne sont pas dans la base. Vérifier que `STORAGE_PROVIDER` et ses identifiants pointent vers un stockage contenant les objets référencés (`MediaAsset.storageKey`, `Attachment.fileUrl`, `Certificate.pdfUrl`). Les PDF de certificats et de reçus manquants peuvent être régénérés en remettant en file `certificate.render` / `receipt.render` (voir `jobs-bloques.md`, section 6).
8. **Contrôles** identiques à la procédure A, étape 6, plus : recherche publique (`/recherche?q=convention`) qui valide les extensions, vérification d'un certificat (`/certificats/verifier/<code>`), téléchargement d'une ressource privée (URL signée).

## 5. Sauvegarde logique - commande de référence

```bash
# Depuis la racine du dépôt, avec le .env de production (chaîne DIRECTE)
export PGDATABASE_URL="$(grep '^DATABASE_URL_UNPOOLED=' .env | cut -d= -f2- | tr -d '"')"
mkdir -p backups
STAMP="$(date -u +%Y%m%d-%H%M)"
pg_dump --format=custom --no-owner --no-privileges --file "backups/fetrag-$STAMP.dump" "$PGDATABASE_URL"
age -r <clé-publique-exploitant> -o "backups/fetrag-$STAMP.dump.age" "backups/fetrag-$STAMP.dump"
rm "backups/fetrag-$STAMP.dump"
```

Planification recommandée : quotidienne à 02:00 UTC (03:00 à Libreville) par un poste d'exploitation ou une action GitHub planifiée disposant du secret `DATABASE_URL_UNPOOLED`, avec dépôt sur un stockage objet distinct du stockage applicatif. Rétention : 30 quotidiennes, 12 mensuelles. Le RPO effectif est de quelques secondes grâce au PITR Neon et de 24 h au plus pour la sauvegarde logique hors Neon ; la combinaison respecte la cible RPO ≤ 1 h du CDC tant que l'offre Neon inclut au moins 24 h d'historique.

## 6. Exercice trimestriel de restauration

1. Créer une branche Neon depuis l'instant courant (ou une base Docker vide) et y restaurer la dernière sauvegarde logique (procédure B, étapes 2 à 5).
2. Pointer un déploiement de prévisualisation Vercel (ou `pnpm dev:web` en local) sur cette base et dérouler la recette minimale : connexion `support@fetrag.ga`, liste des actualités, fiche de cours, vérification d'un certificat.
3. Mesurer la durée totale (objectif < 4 h, RTO) et consigner le résultat dans `docs/CHANGELOG.md` (rubrique « Exploitation ») avec la date, la taille de la sauvegarde et les anomalies.
4. Supprimer la branche et la base de test.

## 7. Erreurs fréquentes

| Symptôme | Cause probable | Correctif |
| --- | --- | --- |
| `pg_dump: error: server version: 16.x; pg_dump version: 15.x` | Outils client trop anciens | Installer le client PostgreSQL 16 (`apt install postgresql-client-16`, `winget install PostgreSQL.PostgreSQL.16`) |
| `SSL connection is required` | Chaîne sans `sslmode=require` | Ajouter `?sslmode=require` à la chaîne Neon |
| `pg_restore: error: ... extension "unaccent" is not available` | Extension absente sur la cible | Installer `postgresql-contrib` ou choisir un hébergeur qui la fournit (Neon, RDS, Scaleway) |
| Après bascule, `prisma migrate status` liste une migration « not yet applied » | Sauvegarde antérieure à une migration | `pnpm db:deploy` |
| Connexion impossible après bascule (`P1001`) | `DATABASE_URL` mis à jour sur un seul projet Vercel | Vérifier les deux projets et redéployer chacun |
