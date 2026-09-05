# Runbook - Prestataire de paiement (PSP) indisponible

| | |
| --- | --- |
| Exigences couvertes | WEB-08, SHR-06 (adaptateur PSP), chapitre 19 et 28 du CDC |
| Rôles | Exploitant, Finance / contrôle (`finance@fetrag.ga` : rapprochement, remboursements), Support (communication), Super administrateur (feature flag) |
| Composants | `packages/payments` (`createCheckout`, `processWebhook`, `reconcile`, `refundPayment`), tables `Order`, `Payment`, `WebhookEvent`, `BackgroundJob`, feature flag `FEATURE_PAYMENTS` |
| Documents liés | `jobs-bloques.md`, `supervision.md`, `rotation-secrets.md`, ADR-003 |

## 1. Rappel du parcours de paiement

1. L'utilisateur choisit une offre (formation, événement, service, ressource premium) ; `createCheckout(principal, input)` crée `Order` (référence `CMD-AAAA-XXXXXX`, statut `PENDING`) et `Payment` (`INITIATED` → `PENDING`) avec une `idempotencyKey` fournie par le client : un double clic ne crée jamais deux commandes.
2. L'adaptateur (`PAYMENT_PROVIDER` : `sandbox`, `airtel-money`, `moov-money`, `stripe`) renvoie une `nextAction` : redirection vers la page du PSP, instructions (USSD, code marchand) ou rien.
3. Le PSP notifie le résultat par **webhook** : `processWebhook(providerId, headers, rawBody)` vérifie la signature (HMAC `PAYMENT_WEBHOOK_SECRET` pour le sandbox), journalise `WebhookEvent` (unicité `provider + externalId`), puis met en file le job `webhook.process` (priorité 2).
4. Le job appelle `confirmPayment(paymentId, status)` dans une transaction : `Payment.SUCCEEDED`, `Order.PAID`, puis `fulfillOrder` (inscription au cours, inscription à l'événement, statut de la demande de service), reçu (`receipt.render`) et email « paiement réussi ».
5. **Rapprochement** : `reconcile()` (appelé à chaque cycle cron / worker) interroge `getStatus(providerRef)` pour les paiements `PENDING` de plus de 15 minutes (`RECONCILE_AFTER_MS`) et applique le statut réel. Un webhook perdu est donc rattrapé sans intervention.

## 2. Symptômes d'un PSP indisponible

| Symptôme | Où le voir |
| --- | --- |
| Erreur à l'étape « Payer » (`createPayment` lève une exception) | Logs Vercel de la Server Action de checkout ; message utilisateur « Le service de paiement est momentanément indisponible » |
| Paiements qui restent `PENDING` plus de 30 minutes | `SELECT count(*) FROM "Payment" WHERE status = 'PENDING' AND "createdAt" < now() - interval '30 minutes';` |
| Webhooks rejetés | `SELECT * FROM "WebhookEvent" WHERE verified = false ORDER BY "createdAt" DESC LIMIT 20;` (`eventType = 'rejected'`, `error` = signature absente/invalide, JSON illisible) |
| Jobs `webhook.process` en `FAILED` / `DEAD` | `SELECT id, attempts, "lastError" FROM "BackgroundJob" WHERE type = 'webhook.process' AND status IN ('FAILED','DEAD');` |
| Page de statut du PSP dégradée | Site de statut du prestataire retenu (à renseigner au cadrage, chapitre 36) |

## 3. Procédure de réponse

### 3.1 Qualifier (10 minutes)

1. Confirmer que la panne vient du PSP et non de la plateforme : `GET /api/health` des deux applications doit répondre `ok: true` ; la file de jobs doit avancer (`supervision.md`, section 4).
2. Relever l'heure de début (premier paiement `PENDING` non confirmé, premier webhook rejeté) et l'étendue (un moyen de paiement, un opérateur mobile money, tout le PSP).
3. Ouvrir un ticket d'incident et prévenir Finance et Support.

### 3.2 Contenir

- **Panne partielle ou courte (< 1 h)** : ne rien changer ; informer le support ; les paiements en attente seront confirmés par webhook ou par le rapprochement dès le retour du PSP.
- **Panne longue ou totale** : désactiver temporairement le paiement en ligne avec `FEATURE_PAYMENTS=false` sur le projet `fetrag-web` (et `fetrag-lms` si le LMS propose un checkout), puis redéployer. Les pages d'offres affichent alors le message de prise en charge manuelle et le lien vers `/contact`. Les commandes existantes restent consultables (`/espace/paiements`).
- **Ne pas** modifier manuellement `Order.status` en `PAID` sans preuve de paiement du PSP : toute confirmation passe par `confirmPayment` (transaction, audit, exécution de la commande).

### 3.3 Mode dégradé métier

Le CDC prévoit des voies alternatives (chapitre 19 : prise en charge, exonération, sponsoring) :

1. Pour une inscription urgente (session imminente), la coordination peut créer une **prise en charge** (`Sponsorship`) ou inscrire directement le participant via le workflow institutionnel (source `ORGANIZATION`), ce qui ne dépend pas du PSP.
2. Un paiement reçu hors ligne (virement, espèces au siège, BP 1234 Libreville) est enregistré par Finance comme paiement `BANK_TRANSFER` ou `CASH` confirmé manuellement : `confirmPayment(paymentId, 'SUCCEEDED', providerRef = numéro de reçu papier)` depuis le back-office (`/admin`, commandes → « Confirmer un paiement hors ligne »). L'action est auditée (`payment.succeeded`, `actorEmail`).
3. Communiquer un message unique (support + bandeau d'information si disponible) : « Le paiement en ligne est temporairement indisponible. Vos inscriptions restent enregistrées ; nous vous informerons dès la reprise. Pour une session imminente, contactez le support. »

### 3.4 Rétablir

1. Réactiver `FEATURE_PAYMENTS=true` et redéployer.
2. Forcer un rapprochement : `curl -H "Authorization: Bearer $CRON_SECRET" https://fetrag.ga/api/cron/jobs` (le handler appelle `reconcile()` avant `processJobs`).
3. Rejouer les webhooks reçus pendant la panne : les événements `WebhookEvent` avec `verified = true` et `processedAt IS NULL` ont un job associé ; relancer les jobs `FAILED`/`DEAD` (`jobs-bloques.md`, section 5). Les webhooks `verified = false` ne peuvent pas être rejoués : demander au PSP un renvoi ou s'appuyer sur `reconcile()`.
4. Vérifier avec Finance le rapprochement du jour : pour chaque `Payment.SUCCEEDED` du PSP, une commande `PAID` et un reçu ; pour chaque paiement débité côté PSP sans commande `PAID`, appliquer la section 3.3 point 2 ou rembourser (`refundPayment`, action `finance.refund`).

## 4. Cas particuliers

- **Double débit** (le client a payé deux fois pendant l'instabilité) : `refundPayment(principal, paymentId, amount, reason)` sur le second paiement ; la commande passe en `REFUNDED` / `PARTIALLY_REFUNDED`, un email « paiement remboursé » est envoyé. Le remboursement suit le délai du PSP.
- **Montant incohérent** dans un webhook (`error = Montant incohérent`) : le job est marqué `skipped: amount_mismatch` et ne confirme rien. Vérifier avec le PSP ; ne jamais forcer.
- **Secret de webhook compromis ou changé** par le PSP : rotation `PAYMENT_WEBHOOK_SECRET` (`rotation-secrets.md`, section 6). Pendant le délai de propagation, les webhooks arrivent en `verified = false` : les traiter par rapprochement.
- **Changement de PSP** : nouvel adaptateur implémentant `PaymentProvider` (ADR-003), variable `PAYMENT_PROVIDER`, aucun changement dans le domaine métier. Les commandes historiques conservent `Payment.provider`.

## 5. Sandbox (recette)

En recette (`PAYMENT_PROVIDER=sandbox`), aucun appel externe : la page `/paiement/<orderId>/sandbox?paymentId=<id>` permet de choisir « Paiement réussi » ou « Paiement refusé » ; `sandbox.simulate` génère un webhook signé et le traite comme en production. Si cette page renvoie une erreur de signature, `PAYMENT_WEBHOOK_SECRET` diffère entre l'émetteur et le récepteur (même projet Vercel, donc même valeur : vérifier qu'elle n'est pas restée à `change-me`).
