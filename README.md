# FETRAG - Écosystème numérique

Site institutionnel **fetrag.ga** et plateforme de formation **formation.fetrag.ga** de la Fédération des Travailleurs du Gabon, réalisés en monorepo `pnpm` + Turborepo + Next.js + TypeScript + PostgreSQL (Neon).

Devise : **Travail · Efficacité · Solidarité**

## Démarrage rapide

```bash
pnpm install                 # dépendances + génération du client Prisma
cp .env.example .env         # puis renseigner DATABASE_URL, AUTH_SECRET...
pnpm db:deploy               # applique les migrations
pnpm db:seed                 # 10 modules, comptes de démo, cours pilote, contenus
pnpm dev:web                 # http://localhost:3000
pnpm dev:lms                 # http://localhost:3001
```

Comptes de démonstration (mot de passe `Fetrag2026!`) : `admin@fetrag.ga`, `coordination@fetrag.ga`, `formateur@fetrag.ga`, `editeur@fetrag.ga`, `services@fetrag.ga`, `finance@fetrag.ga`, `support@fetrag.ga`, `responsable@synatep-demo.ga`, `apprenant1@demo.fetrag.ga` à `apprenant10@demo.fetrag.ga`.

## Structure

```
apps/web        Next.js - site institutionnel + CMS (fetrag.ga)
apps/lms        Next.js - LMS (formation.fetrag.ga)
apps/api        Serveur Hono autonome (déploiement conteneurisé)
apps/worker     Worker de jobs (hors Vercel)
packages/*      ui, design-tokens, contracts, db, auth, domain, cms, lms-core,
                payments, storage, notifications, search, analytics,
                observability, config, jobs, api, testing
infra/          docker, proxy (Caddy), deployment
docs/           specs (CDC), adr, architecture, api, runbooks, guides
```

Voir [CLAUDE.md](CLAUDE.md) pour les conventions, [docs/adr](docs/adr) pour les décisions d'architecture et [docs/specs/FETRAG_CDC_UNIFIE.md](docs/specs/FETRAG_CDC_UNIFIE.md) pour le cahier des charges.

## Déploiement Vercel

Deux projets Vercel pointant sur ce dépôt :

| Projet | Root Directory | Domaine cible |
| --- | --- | --- |
| fetrag-web | `apps/web` | fetrag.ga |
| fetrag-lms | `apps/lms` | formation.fetrag.ga |

Variables d'environnement à définir dans chaque projet : voir `.env.example` (au minimum `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `APP_WEB_URL`, `APP_LMS_URL`, `NEXT_PUBLIC_APP_WEB_URL`, `NEXT_PUBLIC_APP_LMS_URL`, `CRON_SECRET`, `PAYMENT_WEBHOOK_SECRET`, `FEATURE_LOCAL_AUTH=true`). En production avec le domaine réel, ajouter `AUTH_COOKIE_DOMAIN=.fetrag.ga` sur les deux projets pour le SSO.

Le build Vercel exécute `pnpm install` (qui génère le client Prisma) puis `next build`. Les migrations sont appliquées avec `pnpm db:deploy` depuis un poste disposant du `.env` ou via le pipeline CI.

## Qualité

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Licence

Code source propriété de la FETRAG (réversibilité, chapitre 41 du CDC).
