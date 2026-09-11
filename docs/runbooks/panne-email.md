# Runbook - Panne du service email

| | |
| --- | --- |
| Exigences couvertes | SHR-05 (notifications asynchrones rejouables), LMS-11, chapitre 20 et 28 du CDC |
| Rôles | Exploitant, Support (communication aux utilisateurs), Super administrateur (rotation de la clé Resend ou des identifiants SMTP) |
| Composants | `packages/notifications` (`sendEmail`, `deliverQueuedEmail`, adaptateurs `resend` / `smtp` / `console`), `packages/jobs` (job `email.send`, `requeueFailedEmails`), table `EmailDelivery`, table `BackgroundJob` |
| Documents liés | `jobs-bloques.md`, `supervision.md`, `rotation-secrets.md`, `docs/deployment/VERCEL.md` (section 2 bis, configuration Resend) |

## 1. Comment fonctionne l'envoi

1. Un service métier appelle `sendEmail({ to, template, variables })`. Une ligne `EmailDelivery` est créée en statut `QUEUED` avec le template et les variables sérialisées (le message peut être rejoué sans l'appelant).
2. L'envoi est tenté immédiatement par le fournisseur effectif : `resend` (API HTTP `https://api.resend.com/emails`, délai maximal 20 s) dès que `RESEND_API_KEY` est défini, sinon `smtp` (Nodemailer) si `SMTP_HOST` est défini, sinon `console` (journal, aucun envoi) ; `EMAIL_PROVIDER` force le choix. Succès → `SENT` (avec `provider`, `providerRef` = identifiant Resend du message, `sentAt`) ; échec → `FAILED` avec `error`, puis un job `email.send` (`idempotencyKey = email.send:<deliveryId>`) est mis en file.
3. Le job est rejoué par le cron Vercel (`GET /api/cron/jobs`, toutes les 5 minutes) ou par `apps/worker`, avec backoff exponentiel (2, 4, 8, 16 min... plafonné à 24 h) et au plus `EMAIL_MAX_ATTEMPTS = 5` tentatives par livraison.
4. À chaque cycle, `requeueFailedEmails()` remet en file les livraisons `FAILED` ou `QUEUED` depuis plus de 5 minutes (créées dans les 7 derniers jours, moins de 5 tentatives) qui n'auraient pas de job : aucun email ne reste orphelin si le processus émetteur n'a pas pu joindre la file.

Les emails **non essentiels** (catégorie marketing / newsletter) exigent un consentement `NEWSLETTER` ; leur absence d'envoi est un `SKIPPED` volontaire, pas une panne.

## 2. Détecter la panne

Signaux (voir `supervision.md`) :

- Alerte « EmailDelivery FAILED > 10 sur 15 min » ou « aucun SENT depuis 2 h en heures ouvrées ».
- Tickets support : « je n'ai pas reçu ma convocation / mon reçu / le lien de confirmation ».
- Vérification directe :

```sql
SELECT status, provider, count(*) FROM "EmailDelivery"
WHERE "createdAt" > now() - interval '24 hours' GROUP BY status, provider;

SELECT id, "to", subject, template, provider, "providerRef", attempts, error, "createdAt" FROM "EmailDelivery"
WHERE status = 'FAILED' ORDER BY "createdAt" DESC LIMIT 20;
```

Le champ `error` contient le message du fournisseur (tronqué à 500 caractères). Les adresses des destinataires sont des données personnelles : ne pas les recopier dans un canal de discussion externe (`maskEmail` de `@fetrag/notifications` est disponible pour les logs).

Un `provider = console` en production signifie que ni `RESEND_API_KEY` ni `SMTP_HOST` n'est défini : les emails sont journalisés (`SENT`) mais jamais envoyés. C'est une erreur de configuration, pas une panne du fournisseur.

## 3. Diagnostic par message d'erreur

### 3.1 Resend (fournisseur principal)

Les erreurs Resend sont enregistrées sous la forme `Resend <statut HTTP> <nom> : <message>`.

| `error` observé | Cause | Action |
| --- | --- | --- |
| `Resend 401 ... API key is invalid`, `missing_api_key` | Clé `RESEND_API_KEY` absente, révoquée ou tronquée | Créer une nouvelle clé (Resend → API Keys), la mettre à jour sur les deux projets Vercel, redéployer (`rotation-secrets.md`, section 5) |
| `Resend 403 validation_error: ... domain is not verified` | `EMAIL_FROM` utilise un domaine non vérifié chez Resend | Resend → Domains : ajouter/vérifier `fetrag.ga` (DKIM, SPF), ou revenir temporairement à `FETRAG <onboarding@resend.dev>` (`VERCEL.md`, section 2 bis) |
| `Resend 403 ... You can only send testing emails to your own email address` | Expéditeur de test `onboarding@resend.dev` avec un destinataire réel | Vérifier le domaine `fetrag.ga` puis passer `EMAIL_FROM` sur ce domaine |
| `Resend 422 validation_error: ...` | Adresse destinataire ou expéditeur mal formée | Contrôler la valeur `EMAIL_FROM` (`Nom <adresse@domaine>`) et l'adresse du destinataire dans `EmailDelivery` |
| `Resend 429 rate_limit_exceeded` ou `daily_quota_exceeded` | Limite de débit (2 requêtes/s par défaut) ou quota journalier de l'offre atteint | Aucune action immédiate : le job rejoue avec backoff. Si récurrent, relever le quota (Resend → Settings → Plan) |
| `Resend 5xx ...`, `This operation was aborted` (délai de 20 s dépassé), `fetch failed` | Incident Resend ou réseau sortant | Consulter le statut du service (`https://resend-status.com`) ; les jobs se rejouent seuls. Contrôler la clé et le réseau avec `curl` (section 4, étape 1) |

### 3.2 SMTP (relais optionnel)

| `error` observé | Cause | Action |
| --- | --- | --- |
| `Invalid login`, `535 Authentication failed` | Identifiants SMTP révoqués ou expirés | Rotation `SMTP_USER` / `SMTP_PASSWORD` (`rotation-secrets.md`, section 5), redéployer |
| `ECONNREFUSED`, `ETIMEDOUT`, `getaddrinfo ENOTFOUND` | Hôte SMTP injoignable, port bloqué, DNS | Vérifier `SMTP_HOST` / `SMTP_PORT` (587 STARTTLS ou 465 TLS), état du fournisseur ; depuis un poste : `openssl s_client -starttls smtp -connect $SMTP_HOST:587` |
| `Daily sending quota exceeded`, `Too many messages` | Quota du fournisseur atteint | Attendre la fenêtre de reset ; les jobs se rejouent seuls avec backoff. Si récurrent, relever le quota ou changer d'offre |
| `Message rejected: sender address not verified` | `EMAIL_FROM` / `SMTP_FROM` non autorisé chez le fournisseur | Vérifier le domaine expéditeur (SPF/DKIM) et la valeur `EMAIL_FROM` (`FETRAG <no-reply@fetrag.ga>` par défaut) |

### 3.3 Quel que soit le fournisseur

| Symptôme | Cause | Action |
| --- | --- | --- |
| Aucune erreur, statut `QUEUED` qui ne bouge pas | Le cron ou le worker ne tourne pas | Voir `jobs-bloques.md` |
| Emails `SENT` mais jamais reçus | Délivrabilité (spam) ou adresse erronée | Contrôler SPF, DKIM, DMARC du domaine `fetrag.ga` ; retrouver le message dans Resend → Emails avec `providerRef` (statut `delivered`, `bounced`, `complained`) |
| « Je ne peux pas me connecter : confirmez d'abord votre adresse » | L'email `email-verification` n'est pas arrivé (voir ci-dessus) | Une fois l'envoi rétabli, l'utilisateur redemande le lien depuis `/inscription/confirmation` ; le support peut vérifier `EmailDelivery` avec `template = 'email-verification'` pour cette adresse |

## 4. Rétablir le service

1. **Vérifier la configuration** dans Vercel (Settings → Environment Variables) : `RESEND_API_KEY` et `EMAIL_FROM` (ou `SMTP_*` si `EMAIL_PROVIDER=smtp`). Une clé manquante fait basculer silencieusement sur `console` (les emails sont alors seulement journalisés : statut `SENT` avec `provider = console`). Contrôler la clé et l'état de l'API depuis un poste :

```bash
curl -s -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/domains
# 200 + liste des domaines (status "verified" attendu pour fetrag.ga) : clé et API opérationnelles
# 401 : clé invalide ; 5xx ou délai dépassé : incident Resend (https://resend-status.com)
```

2. **Corriger** la cause (clé, domaine, quota, identifiants SMTP) et redéployer les deux projets Vercel si une variable a changé (les variables ne sont lues qu'au démarrage du processus).
3. **Forcer un cycle de traitement** sans attendre le cron : `curl -H "Authorization: Bearer $CRON_SECRET" https://fetrag.ga/api/cron/jobs`. La réponse JSON indique `processed`, `failed`, `remaining`. Les jobs `email.send` en attente ou en échec sont visibles dans `BackgroundJob` (`type = 'email.send'`, statuts `PENDING`, `FAILED`, `DEAD`).
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

- Surveiller quotidiennement le ratio `FAILED / (SENT + FAILED)` (< 2 % attendu) et, dans Resend → Emails, les taux de `bounced` / `complained`.
- Tester l'envoi après chaque rotation de la clé Resend (ou des identifiants SMTP) : demander un lien depuis `/mot-de-passe-oublie` avec une adresse de l'équipe, ou déclencher un formulaire de contact de test (`/contact`), et vérifier la réception.
- Conserver le fournisseur `console` en développement uniquement ; un déploiement de recette ou de production sans `RESEND_API_KEY` doit lever une alerte de configuration (contrôle manuel dans la liste de vérification de `deploiement.md`).
- Les jetons de confirmation et de réinitialisation expirent (24 h et 30 min ; 7 jours pour les invitations de compte) : un email rejoué tardivement peut contenir un lien périmé, l'utilisateur redemande alors un lien depuis `/inscription/confirmation` ou `/mot-de-passe-oublie`.
- Rétention : purger les `EmailDelivery` de plus de 12 mois (données personnelles) via une tâche trimestrielle ; le contenu rendu n'est pas stocké, seules les variables le sont.
