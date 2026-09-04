# ADR-001 - Hébergement Vercel : API Hono montée dans Next.js, worker remplacé par une file PostgreSQL + Cron

- Statut : accepté (septembre 2026)
- Contexte : le CDC (chapitres 6-8) recommande une API Fastify autonome et un worker Node/Redis (BullMQ). La FETRAG a choisi de déployer d'abord sur Vercel (deux projets : `apps/web` et `apps/lms`) avec PostgreSQL managé Neon. Vercel n'héberge ni processus long (worker) ni Redis managé sans service tiers.

## Décision

1. La logique d'API vit dans `packages/api` sous forme d'application **Hono** avec `@hono/zod-openapi` (REST `/v1`, OpenAPI généré, validation Zod). Elle est **montée dans chaque application Next.js** via `app/api/v1/[[...route]]/route.ts` (`hono/vercel`) et exposée seule par `apps/api` (`@hono/node-server`) pour un hébergement conteneurisé (Docker dans `infra/docker`).
2. Les pages lisent les données via des Server Components et des services de `packages/*` ; les mutations passent par des Server Actions ou par l'API. Aucun accès base depuis le navigateur.
3. Les traitements asynchrones utilisent une **file persistée en PostgreSQL** (`BackgroundJob`, verrouillage optimiste, retries, dead-letter `DEAD`). Sur Vercel, `vercel.json` déclenche `GET /api/cron/jobs` (protégé par `CRON_SECRET`) toutes les 5 minutes ; hors Vercel, `apps/worker` boucle sur le même processeur `@fetrag/jobs`.
4. Redis/BullMQ reste une évolution possible (adaptateur de file) si la volumétrie l'exige ; l'interface `enqueue(type, payload, { idempotencyKey })` ne change pas.

## Conséquences

- Un seul dépôt, deux déploiements indépendants (Turborepo filtre `@fetrag/web...` / `@fetrag/lms...`).
- Les exigences MUST SHR-05 (jobs rejouables), SHR-10 (API versionnée documentée) et 17 (contrats, idempotence, webhooks journalisés) sont respectées sans service externe.
- Le temps de latence des jobs est borné par la fréquence du cron (5 min) ; les envois critiques (confirmation de paiement) sont tentés immédiatement puis rejoués par la file.
