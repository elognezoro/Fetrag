# Runbook - Panne du service email

| | |
| --- | --- |
| Exigences couvertes | SHR-05 (notifications asynchrones rejouables), LMS-11, chapitre 20 et 28 du CDC |
| Rôles | Exploitant, Support (communication aux utilisateurs), Super administrateur (rotation d'identifiants SMTP) |
| Composants | `packages/notifications` (`sendEmail`, `deliverQueuedEmail`, adaptateurs `console` / `smtp`), `packages/jobs` (job `email.send`, `requeueFailedEmails`), table `EmailDelivery`, table `BackgroundJob` |
| Documents liés | `jobs-bloques.md`, `supervision.md`, `rotation-secrets.md` |

## 1. Comment fonctionne l'envoi

1. Un service métier appelle `sendEmail({ to, template, variables })`. Une ligne `EmailDelivery` est créée en statut `QUEUED` avec le template et les variables sérialisées (le message peut être rejoué sans l'appelant).
2. L'envoi est tenté immédiatement par le fournisseur configuré (`EMAIL_PROVIDER` = `console` en recette, `smtp` en production via Nodemailer). Succès → `SENT` (avec `providerRef`, `sentAt`) ; échec → `FAILED` avec `error`, puis un job `email.send` (`idempotencyKey = email.send:<deliveryId>`) est mis en file.
3. Le job est rejoué par le cron Vercel (`GET /api/cron/jobs`, toutes les 5 minutes) ou par `apps/worker`, avec backoff exponentiel (2, 4, 8, 16 min... plafonné à 24 h) et au plus `EMAIL_MAX_ATTEMPTS = 5` tentatives par livraison.
4. À chaque cycle, `requeueFailedEmails()` remet en file les livraisons `FAILED` ou `QUEUED` depuis plus de 5 minutes (créées dans les 7 derniers jours, moins de 5 tentatives) qui n'auraient pas de job : aucun email ne reste orphelin si le processus émetteur n'a pas pu joindre la file.

Les emails **non essentiels** (catégorie marketing / newsletter) exigent un consentement `NEWSLETTER` ; leur absence d'envoi est un `SKIPPED` volontaire, pas une panne.

## 2. Détecter la panne

Signaux (voir `supervision.md`) :

- Alerte « EmailDelivery FAILED > 10 sur 15 min » ou « aucun SENT depuis 2 h en heures ouvrées ».
- Tickets support : « je n'ai pas reçu ma convocation / mon reçu / le lien de confirmation ».
- Vérification directe :

```sql
SELECT status, count(*) FROM "EmailDelivery"
WHERE "createdAt" > now() - interval '24 hours' GROUP BY status;

SELECT id, "to", subject, attempts, error, "createdAt" FROM "EmailDelivery"
WHERE status = 'FAILED' ORDER BY "createdAt" DESC LIMIT 20;
```

Le champ `error` contient le message du fournisseur (tronqué à 500 caractères). Les adresses des destinataires sont des données personnelles : ne pas les recopier dans un canal de discussion externe (`maskEmail` de `@fetrag/notifications` est disponible pour les logs).

## 3. Diagnostic par message d'erreur

| `error` observé | Cause | Action |
| --- | --- | --- |
| `Invalid login`, `535 Authentication failed` | Identifiants SMTP révoqués ou expirés | Rotation `SMTP_USER` / `SMTP_PASSWORD` (`rotation-secrets.md`, section 5), redéployer |
| `ECONNREFUSED`, `ETIMEDOUT`, `getaddrinfo ENOTFOUND` | Hôte SMTP injoignable, port bloqué, DNS | Vérifier `SMTP_HOST` / `SMTP_PORT` (587 STARTTLS ou 465 TLS), état du fournisseur ; depuis un poste : `openssl s_client -starttls smtp -connect $SMTP_HOST:587` |
| `Daily sending quota exceeded`, `Too many messages` | Quota du fournisseur atteint | Attendre la fenêtre de reset ; les jobs se rejouent seuls avec backoff. Si récurrent, relever le quota ou changer d'offre |
| `Message rejected: sender address not verified` | `SMTP_FROM` non autorisé chez le fournisseur | Vérifier le domaine expéditeur (SPF/DKIM) et la valeur `SMTP_FROM` (`FETRAG <no-reply@fetrag.ga>` par défaut) |
| Aucune erreur, statut `QUEUED` qui ne bouge pas | Le cron ou le worker ne tourne pas | Voir `jobs-bloques.md` |
| Emails `SENT` mais jamais reçus | Délivrabilité (spam) | Contrôler SPF, DKIM, DMARC du domaine `fetrag.ga` ; consulter les journaux du fournisseur avec `providerRef` |

## 4. Rétablir le service

1. **Vérifier la configuration** dans Vercel (Settings → Environment Variables) : `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`. Une valeur manquante fait basculer silencieusement sur `console` (les emails sont alors seulement journalisés : statut `SENT` avec `provider = console`).
2. **Corriger** la cause (identifiants, hôte, quota) et redéployer les deux projets Vercel si une variable a changé (les variables ne sont lues qu'au démarrage du processus).
3. **Forcer un cycle de traitement** sans attendre le cron : `curl -H "Authorization: Bearer $CRON_SECRET" https://fetrag.ga/api/cron/jobs`. La réponse JSON indique `processed`, `failed`, `remaining`.
4. **Rejouer les livraisons épuisées** (5 tentatives atteintes, donc ignorées par `requeueFailedEmails`) après correction de la cause :

```sql
-- Remettre les compteurs à zéro pour les échecs des 48 dernières heures
UPDATE "EmailDelivery" SET attempts = 0, status = 'FAILED'
WHERE status = 'FAILED' AND attempts >= 5 AND "createdAt" > now() - interval '48 hours';
```

   Le prochain cycle les reprend automatiquement (nouveau job `email.send` par livraison, clé d'idempotence différente si l'ancien job est `DEAD` : dans ce cas, passer l'ancien job à `SUCCEEDED` ou le supprimer, voir `jobs-bloques.md`, section 5).
5. **Contrôler** : la requête de la section 2 doit montrer la colonne `SENT` qui progresse et `FAILED` qui décroît.

## 5. Mode dégradé pendant la panne

- Les opérations métier **ne sont jamais bloquées** par l'email : inscription, paiement, certificat, décision de demande de formation s'enregistrent normalement ; seul l'accusé de réception est différé.
- Les notifications internes (`Notification`, visibles dans `/espace/notifications` sur la vitrine et dans le LMS) continuent de fonctionner : inviter les utilisateurs à les consulter.
- Les documents importants restent accessibles sans email : reçus (`/espace/paiements/<orderId>`), certificats (`/certificats` sur le LMS), convocations (`/calendrier`).
- Le support peut renvoyer manuellement une information critique depuis sa messagerie professionnelle en s'appuyant sur les données de l'espace personnel, jamais en recopiant des mots de passe.

## 6. Prévention

- Surveiller quotidiennement le ratio `FAILED / (SENT + FAILED)` (< 2 % attendu).
- Tester l'envoi après chaque rotation d'identifiants SMTP : depuis le back-office, déclencher un formulaire de contact de test (`/contact`) et vérifier l'accusé de réception.
- Conserver le fournisseur `console` en recette uniquement ; un déploiement de production avec `EMAIL_PROVIDER=console` doit lever une alerte de configuration (contrôle manuel dans la liste de vérification de `deploiement.md`).
- Rétention : purger les `EmailDelivery` de plus de 12 mois (données personnelles) via une tâche trimestrielle ; le contenu rendu n'est pas stocké, seules les variables le sont.
