# @fetrag/payments

Couche d'adaptation PSP (ADR-003, chapitre 19). Le domaine ne connaît que `PaymentProvider` :

```ts
interface PaymentProvider {
  id: 'sandbox' | 'airtel-money' | 'moov-money'
  createPayment(ctx): Promise<{ providerRef, status, nextAction }>
  getStatus(providerRef): Promise<{ providerRef, status }>
  refund(providerRef, amount): Promise<{ providerRef, status }>
  handleWebhook(headers, rawBody): Promise<ParsedWebhook> // vérifie la signature
  reconcile(): Promise<{ providerRef, status }[]>
}
```

Le fournisseur est choisi par `PAYMENT_PROVIDER` (`sandbox` par défaut).

## Parcours

1. `createCheckout(principal, input)` : vérifie l'offre (active, validité, contenu publié, quota), applique le coupon
   (`applyCoupon`) puis la prise en charge (`Sponsorship`) du bénéficiaire, crée `Order` (référence `CMD-AAAA-XXXXXX`,
   `idempotencyKey` unique → renvoie la commande existante), `OrderLine`, `Payment` INITIATED. Total nul → paiement
   validé immédiatement (`FREE` ou `SPONSORSHIP`) et commande délivrée ; sinon `provider.createPayment` et `nextAction`.
2. Le client suit `nextAction` (`redirect` vers `/paiement/<orderId>/sandbox?paymentId=` en sandbox).
3. Le PSP appelle le webhook : `processWebhook(providerId, headers, rawBody)` journalise `WebhookEvent`
   (doublons ignorés sur `provider + externalId`) et met en file `webhook.process`.
4. Le job appelle `processWebhookEvent` → `confirmPayment(paymentId, status, providerRef)` (transaction Payment + Order +
   StatusEvent, audit, événements `payment.succeeded|failed`), puis `fulfillOrder` (inscription cours, inscription
   événement, demande de service liée, ressource accessible par commande payée), `issueReceipt` (numéro `REC-…`, job
   `receipt.render`) et l'email `payment-succeeded`.
5. `reconcile()` (cron toutes les 15-30 min) re-vérifie les paiements PENDING depuis plus de 15 minutes.
6. `refundPayment(principal, paymentId, amount, reason)` exige `finance.refund`.

## Sandbox

- `createPayment` → `PENDING`, `providerRef = SBX-XXXXXXXXXX`, redirection vers la page de simulation.
- Webhook signé HMAC-SHA256 du corps brut avec `PAYMENT_WEBHOOK_SECRET`, en-tête `x-fetrag-signature` (hex).
- `sandbox.simulate(paymentId, 'success' | 'failure')` génère le webhook signé, le journalise et le traite immédiatement.
- Les paiements PENDING depuis plus de 24 h sont considérés abandonnés (`FAILED`) par le rapprochement.

Route webhook à exposer (lot API / shells) :

```ts
export async function POST(req: Request, { params }: { params: { provider: string } }) {
  const rawBody = await req.text() // ne jamais re-sérialiser : la signature porte sur les octets reçus
  const result = await processWebhook(params.provider, req.headers, rawBody)
  return Response.json({ received: true, duplicate: result.duplicate })
}
```

## Worker / cron

`@fetrag/jobs` ne peut pas importer `@fetrag/payments` (cycle). Le worker et la route `/api/cron/jobs` doivent donc
importer `@fetrag/payments` (ou appeler `registerPaymentJobHandlers()`) après `registerDefaultHandlers()` pour que le job
`webhook.process` sache confirmer les paiements.

## Airtel Money / Moov Money

Les classes `AirtelMoneyProvider` et `MoovMoneyProvider` lèvent `PreconditionError` (« non configuré ») tant que
l'intégration n'est pas faite. Points à brancher (voir les commentaires des classes) :

| Fournisseur | Authentification | Encaissement | Statut | Remboursement | Webhook |
| --- | --- | --- | --- | --- | --- |
| Airtel Money | `POST /auth/oauth2/token` | `POST /merchant/v1/payments/` (push USSD, `transaction.id` = clé d'idempotence) | `GET /standard/v1/payments/{id}` | `POST /standard/v1/payments/refund` | callback JSON signé (clé partagée) |
| Moov Money | `POST /api/v1/auth/token` | `POST /api/v1/merchant/push` (`reference` = clé d'idempotence, `callbackUrl`) | `GET /api/v1/merchant/status/{reference}` | `POST /api/v1/merchant/refund` | `POST callbackUrl` avec signature HMAC |

Variables à ajouter au schéma d'environnement (`@fetrag/config`) lors de l'intégration : `AIRTEL_CLIENT_ID`,
`AIRTEL_CLIENT_SECRET`, `AIRTEL_BASE_URL`, `MOOV_MERCHANT_ID`, `MOOV_API_KEY`, `MOOV_BASE_URL`, `MOOV_CALLBACK_SECRET`.
Chaque adaptateur doit : exiger `phoneNumber` (MSISDN gabonais), renvoyer `nextAction.type = 'instructions'`
(« validez le paiement sur votre téléphone »), normaliser les statuts du PSP vers `PaymentStatus`, et vérifier la
signature des callbacks avant de renvoyer un `ParsedWebhook` (`paymentWebhookSchema`).
