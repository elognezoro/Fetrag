# Runbook - File de jobs bloquée ou en retard

| | |
| --- | --- |
| Exigences couvertes | SHR-05 (jobs rejouables et journalisés), ADR-001 (file PostgreSQL + cron Vercel / worker) |
| Rôles | Exploitant ; Support pour l'impact utilisateur |
| Composants | `packages/jobs` (`enqueue`, `processJobs`, `getJobStats`, `listJobs`, `retryJob`, `cancelJob`, `runScheduledMaintenance`), table `BackgroundJob`, route `GET /api/cron/jobs` (web et lms), `apps/worker` |
| Documents liés | `supervision.md`, `panne-email.md`, `psp-indisponible.md` |

## 1. Fonctionnement à connaître

- **Statuts** : `QUEUED` (à exécuter dès `runAt`), `RUNNING` (verrouillé par `lockedBy` / `lockedAt`), `SUCCEEDED`, `FAILED` (sera rejoué à `runAt` recalculé), `DEAD` (tentatives épuisées : `attempts >= maxAttempts`, 5 par défaut).
- **Backoff** : après un échec, `runAt = maintenant + 2^attempts minutes` (2, 4, 8, 16, 32... plafonné à 24 h).
- **Zombies** : un job `RUNNING` depuis plus de 10 minutes (`ZOMBIE_LOCK_MINUTES`) est repris par le prochain cycle - un processus tué en plein traitement ne bloque rien.
- **Priorité** : 1 = le plus urgent (`webhook.process` = 2, `email.send` rejoué = 3, maintenance = 4 à 7, défaut = 5).
- **Idempotence** : `idempotencyKey` unique ; un second `enqueue` avec la même clé renvoie le job existant (`created: false`). Les handlers sont idempotents : rejouer un job terminé ne duplique ni email, ni certificat, ni confirmation de paiement.
- **Déclenchement** : sur Vercel, cron `*/5 * * * *` sur `/api/cron/jobs` (les deux projets le déclarent ; un seul suffit). Chaque appel traite jusqu'à 25 jobs (`limit`), en 60 s au plus (`maxDuration`). Hors Vercel, `apps/worker` boucle toutes les 5 s (`WORKER_INTERVAL_MS`, `WORKER_BATCH_SIZE`).
- **Maintenance périodique** (`runScheduledMaintenance`) : met en file `content.publish-scheduled` (toutes les 10 min), `reminder.session` (balayage horaire), `enrollment.expire` (horaire), avec une clé d'idempotence par tranche horaire.

| Type de job | Effet | Impact utilisateur si bloqué |
| --- | --- | --- |
| `email.send` | Envoie une `EmailDelivery` | Emails en retard (convocations, reçus, confirmations) |
| `webhook.process` | Confirme un paiement à partir d'un `WebhookEvent` | Commande reste `PENDING`, inscription non activée |
| `certificate.render` | Génère le PDF + QR du certificat dans le stockage privé | Certificat visible mais PDF « en préparation » |
| `receipt.render` | Génère le PDF du reçu | Reçu non téléchargeable |
| `notification.dispatch` | Notification interne (+ email optionnel) | Notification absente |
| `content.publish-scheduled` | Publie les contenus `SCHEDULED` échus | Article/page planifié non publié à l'heure |
| `reminder.session` | Rappels de séances à venir | Pas de rappel J-1 |
| `export.generate` | Exports CSV demandés depuis les tableaux de bord | Export jamais prêt |
| `enrollment.expire` | Passe en `EXPIRED` les inscriptions échues | Accès conservés au-delà de la date |

## 2. Détecter

Requête de référence (ou `getJobStats()` depuis `/admin` → Système → File de jobs si l'écran est disponible) :

```sql
SELECT status, count(*) FROM "BackgroundJob" GROUP BY status;

-- Jobs éligibles mais non traités (retard)
SELECT type, count(*), min("runAt") FROM "BackgroundJob"
WHERE status IN ('QUEUED','FAILED') AND "runAt" <= now()
GROUP BY type ORDER BY 2 DESC;

-- Zombies (verrou de plus de 10 minutes)
SELECT id, type, "lockedBy", "lockedAt" FROM "BackgroundJob"
WHERE status = 'RUNNING' AND "lockedAt" < now() - interval '10 minutes';

-- Jobs morts récents et leur dernière erreur
SELECT id, type, attempts, "lastError", "createdAt" FROM "BackgroundJob"
WHERE status = 'DEAD' ORDER BY "completedAt" DESC LIMIT 20;
```

Seuils d'alerte (voir `supervision.md`) : `dueNow > 50` pendant 15 minutes, ou `min(runAt)` plus vieux que 30 minutes, ou tout nouveau `DEAD` sur `webhook.process` / `certificate.render`.

## 3. Diagnostic

| Constat | Cause probable | Vérification |
| --- | --- | --- |
| `QUEUED` s'accumulent, `SUCCEEDED` n'augmente pas | Le cron n'appelle plus la route | Vercel → projet → Settings → Cron Jobs (activé ? dernière exécution ?) ; Logs filtrés sur `/api/cron/jobs` |
| La route répond `401` | `CRON_SECRET` invalide ou resté à `change-me` ; appel manuel sans porteur | Vérifier la variable sur le projet ; les appels planifiés Vercel portent l'en-tête `x-vercel-cron` et sont acceptés |
| La route répond `500` `processing_failed` | Exception au chargement des handlers (`@fetrag/jobs`, `@fetrag/payments`) ou base injoignable | Logs Vercel `cron.jobs.failed` ; `/api/health` |
| La route répond `200` avec `skipped: true` | Processeur non disponible (build partiel) | Redéployer ; vérifier que `@fetrag/jobs` est dans `transpilePackages` |
| `remaining` reste élevé à chaque cycle | Volume supérieur à 25 jobs / 5 min (300 / h) | Passer le worker Docker en complément, ou augmenter `limit` (≤ 100) et la fréquence du cron (plan Vercel) |
| Tous les jobs d'un type échouent avec la même `lastError` | Dépendance externe (SMTP, PSP, stockage) | Appliquer `panne-email.md` / `psp-indisponible.md` / vérifier `STORAGE_*` |
| Jobs `RUNNING` anciens | Processus interrompu (timeout 60 s, redéploiement) | Ils sont repris automatiquement après 10 min ; si `lockedAt` est plus vieux d'une heure et qu'ils ne bougent pas, le cron ne tourne pas (première ligne) |
| `DEAD` sur `certificate.render` avec erreur de police / stockage | Stockage privé inaccessible ou clé absente | Tester `getStorage().put` via un téléversement admin |

## 4. Rétablir le traitement

1. **Forcer un cycle** : `curl -sS -H "Authorization: Bearer $CRON_SECRET" https://fetrag.ga/api/cron/jobs` → `{ ok, processed, failed, remaining }`. Répéter tant que `remaining > 0` (chaque appel traite 25 jobs).
2. **Cron désactivé** : Vercel → Settings → Cron Jobs → Enable ; ou vérifier que `apps/web/vercel.json` est bien déployé (le cron est déclaré par le fichier, pas par la console).
3. **Rattrapage massif** (plusieurs centaines de jobs) : lancer temporairement le worker depuis un poste d'exploitation avec le `.env` de production : `pnpm --filter @fetrag/worker exec tsx src/main.ts` (variable `WORKER_BATCH_SIZE=50`). Il utilise le même verrouillage que le cron : les deux peuvent tourner en parallèle sans doublon. Arrêter avec Ctrl+C une fois `remaining = 0`.
4. **Base saturée** (`P2024` timeouts) : réduire `limit`, vérifier le plan Neon (compute autosuspend, connexions).

## 5. Rejouer, annuler, nettoyer

- **Rejouer un job `DEAD` ou `FAILED`** après correction de la cause : `retryJob(jobId)` (remet `QUEUED`, `attempts = 0`, `runAt = maintenant`) depuis l'écran `/admin` → Système → File de jobs, ou en SQL :

```sql
UPDATE "BackgroundJob" SET status = 'QUEUED', attempts = 0, "runAt" = now(), "lastError" = NULL, "lockedAt" = NULL, "lockedBy" = NULL
WHERE id = '<jobId>';
```

- **Rejouer tous les morts d'un type** (par exemple après une panne SMTP) :

```sql
UPDATE "BackgroundJob" SET status = 'QUEUED', attempts = 0, "runAt" = now(), "lastError" = NULL
WHERE status = 'DEAD' AND type = 'email.send' AND "createdAt" > now() - interval '7 days';
```

- **Annuler** un job devenu inutile (`cancelJob(jobId, reason)`) : statut `DEAD` avec `lastError = motif`. Utile pour un `export.generate` demandé par erreur ou un rappel de session annulée.
- **Nettoyer** : les jobs `SUCCEEDED` de plus de 30 jours et `DEAD` de plus de 90 jours peuvent être supprimés (`DELETE FROM "BackgroundJob" WHERE status = 'SUCCEEDED' AND "completedAt" < now() - interval '30 days';`). Conserver les `webhook.process` 12 mois pour le rapprochement financier.

## 6. Remettre en file un traitement manquant

Quand un document n'a jamais été généré (par exemple après une restauration de base sans le stockage) :

```sql
-- Certificats émis sans PDF
INSERT INTO "BackgroundJob" (id, type, payload, status, priority, "idempotencyKey", "runAt")
SELECT gen_random_uuid(), 'certificate.render', jsonb_build_object('certificateId', c.id), 'QUEUED', 3,
       'certificate.render:' || c.id || ':regen-' || to_char(now(), 'YYYYMMDD'), now()
FROM "Certificate" c WHERE c.status = 'ISSUED' AND c."pdfUrl" IS NULL;

-- Reçus manquants pour les commandes payées
INSERT INTO "BackgroundJob" (id, type, payload, status, priority, "idempotencyKey", "runAt")
SELECT gen_random_uuid(), 'receipt.render', jsonb_build_object('orderId', o.id), 'QUEUED', 4,
       'receipt.render:' || o.id || ':regen-' || to_char(now(), 'YYYYMMDD'), now()
FROM "Order" o LEFT JOIN "Receipt" r ON r."orderId" = o.id
WHERE o.status = 'PAID' AND (r.id IS NULL OR r."pdfUrl" IS NULL);
```

Depuis le code (script d'exploitation), préférer `enqueue(JobTypes.certificateRender, { certificateId }, { idempotencyKey })` qui applique les mêmes règles.

## 7. Prévention

- Un seul des deux projets Vercel doit garder le cron actif en production (éviter deux appels simultanés inutiles ; le verrouillage les tolère mais ils consomment du temps d'exécution).
- Surveiller `dueNow` et le nombre de `DEAD` par type (tableau de bord `supervision.md`).
- Tout nouveau type de job doit : valider sa charge utile (`parse*` de `@fetrag/jobs`), être idempotent, fixer `maxAttempts` adapté (1 pour un export, 5 pour un email, 8 pour un webhook), et être documenté dans le tableau de la section 1.
