# Sauvegardes et exports - scripts d'exploitation

Ce mémo décrit les commandes de sauvegarde, d'export et de vérification disponibles dans `scripts/`. Les procédures complètes (qui fait quoi, dans quel ordre, avec quels contrôles) sont dans `docs/runbooks/restauration-base.md` et `docs/runbooks/supervision.md`.

## 1. Sauvegarde de la base PostgreSQL (Neon)

Neon conserve un historique permettant la restauration à un instant donné (PITR, « Point-in-Time Restore ») sur la fenêtre de rétention du projet (7 jours par défaut sur l'offre gratuite, jusqu'à 30 jours sur les offres payantes - à vérifier dans la console Neon). Cette protection ne remplace pas une sauvegarde logique hors Neon (exigence SEC-07 : sauvegarde automatique **et** restauration testée).

Sauvegarde logique complète (format personnalisé, compressé) depuis un poste disposant du `.env` :

```bash
# Chaîne DIRECTE (non poolée) obligatoire pour pg_dump
export PGDATABASE_URL="$(grep '^DATABASE_URL_UNPOOLED=' .env | cut -d= -f2- | tr -d '"')"
pg_dump --format=custom --no-owner --no-privileges \
  --file "backups/fetrag-$(date +%Y%m%d-%H%M).dump" "$PGDATABASE_URL"
```

Sous PowerShell :

```powershell
$env:PGDATABASE_URL = (Get-Content .env | Select-String '^DATABASE_URL_UNPOOLED=').ToString().Split('=',2)[1].Trim('"')
pg_dump --format=custom --no-owner --no-privileges --file "backups/fetrag-$(Get-Date -Format yyyyMMdd-HHmm).dump" $env:PGDATABASE_URL
```

Recommandations :

- `pg_dump` et `pg_restore` doivent être de version supérieure ou égale à celle du serveur (PostgreSQL 16 chez Neon).
- Planifier l'exécution quotidienne (cron d'un poste d'exploitation, GitHub Actions planifié avec un secret `DATABASE_URL_UNPOOLED`, ou un conteneur `postgres:16-alpine` sur le VPS) et conserver 30 jours glissants + 12 sauvegardes mensuelles.
- Chiffrer les fichiers au repos (`age`, `gpg` ou coffre chiffré) : ils contiennent des données personnelles.
- Vérifier chaque sauvegarde : `pg_restore --list fichier.dump | head` doit lister les tables.
- Tester la restauration au moins une fois par trimestre sur une branche Neon jetable (runbook « restauration-base »).

## 2. Sauvegarde du stockage objet

| Fournisseur (`STORAGE_PROVIDER`) | Méthode |
| --- | --- |
| `vercel-blob` | Copie périodique via l'API Blob (`list` + téléchargement) vers un bucket S3 ou un disque chiffré. Aucun snapshot natif : la copie est indispensable. |
| `s3` (S3, MinIO, Scaleway) | Versioning du bucket + réplication ou `aws s3 sync s3://fetrag-private ./backups/private`. |
| `local` (développement) | Le dossier `.storage/` n'est pas un stockage de production. |

Les certificats PDF (`Certificate.pdfUrl` = clé de stockage privé) et les reçus peuvent être régénérés par les jobs `certificate.render` et `receipt.render` à partir de la base ; les pièces jointes des demandes institutionnelles et les médias du CMS ne le peuvent pas : ils doivent être sauvegardés.

## 3. Export de réversibilité (JSON + CSV)

```bash
pnpm --filter @fetrag/db exec tsx ../../scripts/export-data.ts
pnpm --filter @fetrag/db exec tsx ../../scripts/export-data.ts --out ../../exports/2026-09-04 --format csv
pnpm --filter @fetrag/db exec tsx ../../scripts/export-data.ts --only users,certificates,payments
```

Jeux de données : `users`, `organizations`, `courses`, `cohorts`, `enrollments`, `results`, `certificates`, `payments`, `training-requests`. Un `manifest.json` récapitule les volumes. Les hash de mots de passe, secrets TOTP, codes de secours et jetons ne sont jamais exportés. Le dossier `exports/` doit être ajouté au `.gitignore` local s'il est créé dans le dépôt (il n'y figure pas par défaut) et supprimé après remise.

Les contenus éditoriaux (pages, actualités, ressources, services, événements) sont couverts par la sauvegarde `pg_dump` ; un export CSV ciblé est disponible dans le back-office (`/admin`, exports des listes) pour les éditeurs.

## 4. Contrôle « aucun emoji »

```bash
node scripts/check-no-emoji.mjs          # apps/ et packages/ (.ts, .tsx, .md)
node scripts/check-no-emoji.mjs docs     # inclut docs/
```

Code de sortie 1 si un emoji est trouvé (liste `fichier:ligne:colonne`). À exécuter avant chaque publication ; le workflow CI peut l'ajouter comme étape après le lint.

## 5. Restauration rapide (rappel)

1. Créer une branche Neon depuis l'instant voulu (PITR) ou une base vierge.
2. `pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$CIBLE" fichier.dump`.
3. `pnpm --filter @fetrag/db exec prisma migrate status` doit indiquer « Database schema is up to date ».
4. Basculer `DATABASE_URL` / `DATABASE_URL_UNPOOLED` sur les projets Vercel, redéployer, vérifier `/api/health`.

Détails, contrôles et communication : `docs/runbooks/restauration-base.md`.
