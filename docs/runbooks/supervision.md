# Runbook - Supervision, alertes et santé des services

| | |
| --- | --- |
| Exigences couvertes | SHR-12 (observabilité), chapitre 24 (cibles de service), chapitre 28 (supervision uptime, alertes 5xx, base, stockage, worker, webhooks, paiements) |
| Rôles | Exploitant (configuration des sondes), Support (premier niveau), Finance (alertes paiement) |
| Composants | `GET /api/health` (web et lms), logs JSON `@fetrag/observability`, tables `BackgroundJob`, `EmailDelivery`, `WebhookEvent`, `AuditLog`, `AnalyticsEvent`, console Vercel (Logs, Analytics, Speed Insights), console Neon (Monitoring) |
| Documents liés | `jobs-bloques.md`, `panne-email.md`, `psp-indisponible.md`, `incident-securite.md`, `deploiement.md` |

## 1. Cibles de service (chapitre 24 du CDC)

| Indicateur | Cible V1 | Mesure |
| --- | --- | --- |
| Disponibilité mensuelle (vitrine, LMS, API) | ≥ 99,5 % hors maintenance planifiée | Sondes uptime externes sur `/api/health` |
| Core Web Vitals pages publiques (p75 mobile) | LCP < 2,5 s ; INP < 200 ms ; CLS < 0,1 | Vercel Speed Insights ou PageSpeed Insights hebdomadaire |
| API lectures courantes | p95 < 500 ms | Logs `timing` (`durationMs`) et Vercel Observability |
| RPO / RTO | ≤ 1 h / ≤ 4 h | `restauration-base.md` |
| File de jobs | `dueNow` < 50, aucun `DEAD` critique | Section 4 |
| Emails | échecs < 2 % sur 24 h | Section 5 |

## 2. Sonde de santé

`GET /api/health` (chaque application) exécute `runHealthChecks` : `database` (`SELECT 1`) et `config` (présence de `DATABASE_URL`, `AUTH_SECRET`). Réponse `200` `{ ok: true, app, version, environment, checks: [...] }` ou `503` si un contrôle échoue. Cache désactivé.

Configurer un service d'uptime externe (UptimeRobot, Better Stack, Checkly, ou l'équivalent retenu) :

| Sonde | URL | Fréquence | Alerte si |
| --- | --- | --- | --- |
| Vitrine - santé | `https://fetrag.ga/api/health` | 1 min | statut ≠ 200 pendant 2 vérifications |
| LMS - santé | `https://formation.fetrag.ga/api/health` | 1 min | idem |
| Vitrine - accueil | `https://fetrag.ga/` (mot-clé « FETRAG ») | 5 min | statut ≠ 200 ou mot-clé absent |
| Catalogue LMS | `https://formation.fetrag.ga/catalogue` | 5 min | idem |
| API | `https://fetrag.ga/api/v1/health` | 5 min | statut ≠ 200 |
| Certificat TLS | `fetrag.ga`, `formation.fetrag.ga` | quotidien | expiration < 14 jours |
| Domaine | `fetrag.ga` | quotidien | expiration < 30 jours |

Destinataires : exploitant + support (email et, si disponible, SMS pour les sondes de santé). Une page de statut publique peut être publiée par le même service.

## 3. Erreurs applicatives (5xx)

- **Vercel → Observability / Logs** : filtrer `level:error`. Chaque ligne JSON porte `msg`, `service`, `correlationId` et le contexte caviardé. Les erreurs Next.js non gérées sont rendues par `app/error.tsx` (page « Une erreur est survenue ») et remontent dans les logs.
- **Alerte** : Vercel → Project → Settings → Notifications (ou l'intégration Slack/email de l'équipe) sur « Error rate » : > 1 % des requêtes en 5xx sur 5 minutes, ou > 20 erreurs en 5 minutes. Ajouter une alerte « Function duration » si le p95 des fonctions dépasse 10 s (jobs trop lourds).
- **Diagnostic** : rechercher le `correlationId` (renvoyé dans les réponses d'erreur API `error.correlationId`) pour reconstituer la requête ; vérifier `/api/health` (base) et l'état Neon avant de suspecter le code ; consulter le dernier déploiement (Deployments) si l'erreur est apparue à une heure précise → `deploiement.md`, section 4.
- **Erreurs métier** (`DomainError` → réponses 400/403/404/409/412) ne sont pas des 5xx : elles n'alertent pas mais leur hausse soudaine (par exemple 403 massifs) est un signal de sécurité (`incident-securite.md`).

## 4. File de jobs

Indicateurs (`getJobStats()` ou requêtes SQL de `jobs-bloques.md`, section 2) : `QUEUED`, `RUNNING`, `FAILED`, `DEAD`, `dueNow`.

| Alerte | Seuil | Runbook |
| --- | --- | --- |
| Retard de traitement | `dueNow > 50` pendant 15 min, ou plus vieux job éligible > 30 min | `jobs-bloques.md` |
| Cron silencieux | Aucune ligne `cron.jobs` dans les logs depuis 15 min | `jobs-bloques.md`, section 3 |
| Job critique mort | Nouveau `DEAD` sur `webhook.process`, `certificate.render`, `receipt.render` | `jobs-bloques.md`, section 5 ; `psp-indisponible.md` |
| Zombies récurrents | > 5 jobs `RUNNING` de plus de 10 min | Charge trop lourde pour 60 s : réduire `limit`, basculer sur le worker |

Mise en œuvre sans outil supplémentaire : une requête SQL planifiée (poste d'exploitation, ou fonction Neon / action GitHub planifiée toutes les 15 min) qui envoie un email si les seuils sont dépassés. Le cron Vercel journalise à chaque exécution `cron.jobs { processed, failed, remaining, durationMs }` : une alerte de logs Vercel sur `remaining > 50` est la solution la plus simple.

## 5. Emails

- `SELECT status, count(*) FROM "EmailDelivery" WHERE "createdAt" > now() - interval '24 hours' GROUP BY status;`
- Alerte : `FAILED` > 10 sur 15 min, ou `FAILED / (SENT + FAILED)` > 2 % sur 24 h, ou aucun `SENT` depuis 2 h en heures ouvrées alors que des `QUEUED` existent → `panne-email.md`.
- Délivrabilité : surveiller les rapports DMARC du domaine `fetrag.ga` (adresse `rua` à configurer chez le fournisseur DNS).

## 6. Webhooks et paiements

- `SELECT verified, count(*) FROM "WebhookEvent" WHERE "createdAt" > now() - interval '24 hours' GROUP BY verified;` → alerte si `verified = false` > 5 sur 1 h (signature invalide : secret désynchronisé ou tentative de forge).
- `SELECT count(*) FROM "WebhookEvent" WHERE verified = true AND "processedAt" IS NULL AND "createdAt" < now() - interval '30 minutes';` → alerte si > 0 (jobs `webhook.process` bloqués).
- `SELECT count(*) FROM "Payment" WHERE status = 'PENDING' AND "createdAt" < now() - interval '1 hour';` → alerte si > 10 (PSP dégradé ou rapprochement inactif) → `psp-indisponible.md`.
- Finance reçoit chaque matin le rapport de rapprochement (`reports.financeReport`, exportable en CSV depuis `/coordination` → Rapports ou `/admin`).

## 7. Base de données et stockage

- **Neon → Monitoring** : CPU, connexions actives, taille du stockage, temps d'autosuspend. Alertes Neon (plan payant) ou vérification hebdomadaire : stockage > 80 % du quota, connexions proches de la limite du pooler, latence > 100 ms.
- Requêtes lentes : activer `pg_stat_statements` sur Neon (Extensions) et revoir mensuellement le top 10.
- **Stockage objet** : volume et nombre d'objets (Vercel Blob → Storage ; MinIO → console) ; alerte à 80 % du quota. Contrôler une fois par mois qu'une URL signée expirée renvoie bien `403` (`SHR-04`).
- **Sauvegardes** : la tâche quotidienne `pg_dump` doit produire un fichier daté ; alerte si le dernier fichier a plus de 26 h (`restauration-base.md`, section 5).

## 8. Sécurité (rappel)

Voir `incident-securite.md`, section 2 : connexions échouées, rôles modifiés, exports, webhooks non vérifiés, vérifications de certificats massives. Les revues hebdomadaires et mensuelles y sont décrites.

## 9. Journal d'exploitation et communication

- Chaque alerte traitée est consignée (date, alerte, action, durée) dans le journal d'exploitation de l'équipe ; les incidents majeurs suivent le modèle de `incident-securite.md`, section 6, même s'ils ne sont pas de nature sécurité.
- Maintenance planifiée : annoncer 48 h à l'avance (bannière CMS + email aux organisations si le LMS est concerné), choisir un créneau hors sessions de formation (consulter `/coordination` → Sessions), déclarer la fenêtre dans le service d'uptime pour ne pas dégrader la disponibilité mesurée.
- Rapport mensuel de service (une page) au Secrétariat général : disponibilité par domaine, incidents, temps de rétablissement, volumes (inscriptions, certificats, paiements), actions prévues.
