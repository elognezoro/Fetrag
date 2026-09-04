# FETRAG - Écosystème numérique (monorepo)

Site institutionnel **fetrag.ga** (`apps/web`) + LMS **formation.fetrag.ga** (`apps/lms`), API partagée, worker, packages de domaine.
Source de vérité fonctionnelle : `docs/specs/FETRAG_CDC_UNIFIE.md` (chapitre 37 : ne pas improviser de fonctions métier ; toute évolution structurante passe par un ADR dans `docs/adr`).

## Commandes

```bash
pnpm install              # installe + prisma generate (postinstall de @fetrag/db)
pnpm dev:web              # http://localhost:3000
pnpm dev:lms              # http://localhost:3001
pnpm db:push              # synchronise le schéma Prisma avec Neon (dev)
pnpm db:migrate           # crée une migration versionnée
pnpm db:seed              # charge les 10 modules, comptes de démo, cours pilote...
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Le fichier `.env` racine (jamais commité) est lu par les apps Next.js via `next.config.ts` et par les scripts via `dotenv-cli`.

## Architecture (voir `docs/adr`)

- `apps/web`, `apps/lms` : Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4. Pages = Server Components ; mutations = Server Actions ou routes API.
- `packages/api` : routeur Hono `/v1` (Zod OpenAPI) monté dans chaque app sous `/api/v1/[[...route]]` et exposé seul par `apps/api` (Node) pour un hébergement conteneurisé.
- `packages/jobs` : file de jobs persistée en PostgreSQL (`BackgroundJob`). Sur Vercel : `GET /api/cron/jobs` (protégé par `CRON_SECRET`). Ailleurs : `apps/worker`.
- `packages/auth` : Auth.js v5. Mode local email + mot de passe (`FEATURE_LOCAL_AUTH`) pour la recette, fournisseur OIDC externe via `OIDC_*`. SSO = cookie de session partagé sur `AUTH_COOKIE_DOMAIN=.fetrag.ga`. MFA TOTP pour rôles privilégiés.
- `packages/db` : Prisma 6 + Neon PostgreSQL. `prisma` est le client singleton.
- `packages/domain` : erreurs, références, argent, slugs, audit, événements, politique RBAC (`can()`).
- `packages/cms`, `packages/lms-core`, `packages/payments`, `packages/storage`, `packages/notifications`, `packages/search`, `packages/analytics` : services métier. **Jamais de logique métier dans les composants React.**
- `packages/ui` : design system FETRAG (voir `docs/architecture/DESIGN_SYSTEM.md`). `packages/design-tokens` : couleurs/typos/motion issus du logo.
- `packages/contracts` : schémas Zod et types partagés client/API. Pas de duplication de types entre web, LMS et API.

Règle de dépendance : apps → packages ; packages de domaine → jamais vers apps ; adaptateurs (payments, storage, notifications) → contrats du domaine.

## Conventions de code

- TypeScript strict, pas de `any` sans justification locale. Imports de type inline (`import { type X }`).
- Validation Zod au bord du système (Server Actions, routes API, webhooks). Ne jamais faire confiance au payload client.
- Toute action sensible vérifie identité + rôle + portée côté serveur via `requireUser()` / `requireRole()` / `can()` de `@fetrag/auth`.
- Filtrer systématiquement par `organizationId` pour les accès organisationnels.
- Montants en entiers (XAF sans sous-unité) + code devise. Dates en UTC en base, affichage `Africa/Libreville`.
- Journaliser dans `AuditLog` : auth, rôles, paiements, notes, certificats, publications.
- Jobs idempotents (`idempotencyKey`). Webhooks vérifiés et journalisés (`WebhookEvent`) avant traitement.
- Aucun secret en Git ni dans les logs. Lire l'environnement via `getEnv()` de `@fetrag/config`.
- Textes d'interface en français (fr-GA), structure prête pour l'anglais (`Locale`).

## Interface

- **Pas d'emoji** dans l'interface : icônes `lucide-react` uniquement.
- Mobile-first (360–430 px d'abord), WCAG 2.2 AA : focus visible, labels, erreurs associées aux champs, `prefers-reduced-motion` respecté.
- Charte : bleu `#0259C7`, vert `#9CC102`, or `#F9C804`, marine `#042768`. Titres `Fraunces`, texte `Manrope`.
- Animations : `motion` (framer-motion v12) via les helpers de `@fetrag/ui` (`Reveal`, `Stagger`, `ArcRing`, `Counter`).

## Definition of Done

Critères d'acceptation couverts, UI responsive et accessible, permissions testées, états d'erreur/chargement traités, migration/seed si besoin, documentation à jour, `pnpm lint && pnpm typecheck && pnpm test && pnpm build` verts.
