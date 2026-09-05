# Journal des versions

Format inspiré de « Keep a Changelog » ; versions sémantiques. Les dates sont celles de la mise à disposition en recette. Chaque version renvoie aux ADR et aux exigences du CDC concernées ; la rubrique « Exploitation » consigne les opérations notables (rotations de secrets, exercices de restauration) sans valeur sensible.

## [0.1.0] - 2026-09-05

Première version de recette de l'écosystème numérique FETRAG : socle monorepo, design system, deux applications Next.js, packages de domaine, seed de démonstration, documentation d'exploitation.

### Ajouté

**Socle et architecture**

- Monorepo `pnpm` + Turborepo : `apps/web` (fetrag.ga), `apps/lms` (formation.fetrag.ga), `apps/api` (Hono autonome), `apps/worker` (file de jobs), 17 packages partagés (ADR-001).
- Schéma PostgreSQL Prisma 6 couvrant les 12 domaines du CDC (identité, organisations, CMS, catalogue, apprentissage, sessions, workflow institutionnel, certification, commerce, événements, communication, exploitation) ; migrations `init` et `search_extensions` (`unaccent`, `pg_trgm`).
- `@fetrag/contracts` : schémas Zod, enums miroirs avec libellés français, transitions du workflow institutionnel, DTO publics.
- `@fetrag/config` : environnement validé (`getEnv`), feature flags (`FEATURE_LOCAL_AUTH`, `FEATURE_PAYMENTS`, `FEATURE_FORUMS`, `FEATURE_NEWSLETTER`), constantes produit.
- `@fetrag/domain` : erreurs typées, références (`CMD-`, `DEM-`, `FETRAG-AAAA-NNNNNN`), argent XAF, slugs, dates Africa/Libreville, politique RBAC `can()` avec portées, audit, événements internes, pagination.
- `@fetrag/observability` : logger JSON caviardé, `correlationId`, `runHealthChecks`.

**Identité et sécurité**

- `@fetrag/auth` : Auth.js v5, provider Credentials (recette) et OIDC générique, SSO par cookie `.fetrag.ga`, gardes `requireUser` / `requireRole` / `requireCan`, MFA TOTP avec codes de secours, middleware Edge (ADR-002).
- En-têtes de sécurité (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy), limiteur de débit, honeypot des formulaires publics, journal d'audit immuable.

**Design system**

- `@fetrag/design-tokens` (couleurs, typographies Fraunces / Manrope, motion issus du logo) et `@fetrag/ui` « Le Cercle et l'Étoile » : `Ribbon`, `ArcRing`, `Emblem`, `RingBackdrop`, `PillarCard`, `ModuleCard` 01-10, `StatTile`, `CertificateSeal`, `TriptychStrip`, `MottoStrip`, animations `Reveal` / `Stagger` / `Counter` / `Marquee`, coquille `AppShell`, formulaires accessibles (SHR-11, `docs/architecture/DESIGN_SYSTEM.md`).

**Site institutionnel (apps/web)**

- Pages publiques : accueil, La FETRAG, organisations, actualités, ressources, formations (catalogue synchronisé avec le LMS), services, événements, adhésion, contact, partenariat, recherche, vérification de certificat, FAQ, mentions légales, confidentialité (WEB-01, 04, 07, 12, 16, 17).
- CMS `@fetrag/cms` et back-office `/admin` : pages avec révisions, actualités, catégories, médias, menus, SEO, partenaires, services et demandes de service, événements avec jauge et liste d'attente, FAQ, newsletter double opt-in, formulaires (contact, assistance, service, adhésion, partenariat), workflow éditorial brouillon → relecture → publié → archivé + planification (WEB-02, 03, 06, 11, 13, 18).
- Espace personnel `/espace` : profil, demandes, inscriptions, paiements et reçus, notifications, sécurité / MFA (WEB-10).
- Paiement `@fetrag/payments` : interface `PaymentProvider`, adaptateur sandbox complet (checkout idempotent, webhook signé HMAC, confirmation transactionnelle, exécution de commande, reçu PDF, rapprochement, remboursement, coupons, prises en charge), squelettes Airtel Money / Moov Money (WEB-08, 09, SHR-06, ADR-003).

**Plateforme de formation (apps/lms)**

- `@fetrag/lms-core` : catalogue, builder (cours → version → module → leçon → activité), 13 types d'activités, inscriptions selon politique (libre, validation, organisation, payant), progression idempotente et règles d'achèvement, quiz à correction automatique (8 types de questions) et compositions notées, banque de questions, devoirs avec dépôt et notation, cohortes et sessions, présences, forums modérés, questionnaires de satisfaction, rapports CSV, tableaux de bord par rôle (LMS-01 à 04, 06, 08 à 10, 12, 16 à 19, 21, 22 ; ADR-004).
- Workflow de demande de formation institutionnelle : soumission par le responsable d'organisation, décisions de la coordination (complément, acceptation, refus, autre date), planification créant cohorte, comptes, inscriptions et convocations, historique des décisions (LMS-05).
- Certification : éligibilité, numéro séquentiel, code de vérification, PDF avec QR (pdf-lib) dans le stockage privé, révocation auditée, vérification publique (LMS-07).
- Écrans : catalogue, fiche de cours, tableau de bord, mes formations, lecteur, évaluations, devoirs, forums, calendrier (export iCalendar), certificats, demande de formation, espace organisation, espace formateur, coordination, administration LMS.

**Plateforme**

- `@fetrag/jobs` : file persistée `BackgroundJob` (idempotence, verrouillage, backoff exponentiel, `DEAD`), handlers `email.send`, `certificate.render`, `receipt.render`, `notification.dispatch`, `webhook.process`, `content.publish-scheduled`, `reminder.session`, `export.generate`, `enrollment.expire`, maintenance périodique ; cron Vercel `/api/cron/jobs` et `apps/worker` (SHR-05).
- `@fetrag/notifications` : email (console / SMTP), notifications internes, templates français aux couleurs FETRAG, `EmailDelivery` rejouable, respect des consentements (SHR-08, LMS-11).
- `@fetrag/storage` : adaptateurs local / Vercel Blob / S3, URL signées, validation d'upload (SHR-04).
- `@fetrag/search` : recherche transverse PostgreSQL (SHR-09, ADR-005) ; `@fetrag/analytics` : événements d'usage hachés et indicateurs (WEB-15).
- `@fetrag/api` : routeur Hono `/api/v1` monté dans les deux applications (santé ; routes métier et OpenAPI en lot API, SHR-10 partiel).

**Données de démonstration**

- Seed : 10 modules du Programme de formation des Leaders Syndicaux 2026, cours pilote M01 complet (document, vidéo, audio, lien, quiz, devoir, questionnaire, forum, séance en direct), organisation fictive SYNATEP avec responsable, 10 apprenants, formateur, coordinateur, éditeur, responsable services, finance, support, super administrateur, cohorte pilote avec progressions, présences et certificats vérifiables, pages et actualités institutionnelles, ressources, services gratuits et payants, événements (dont une Master Class), commandes sandbox (réussie, échouée, remboursée), demandes institutionnelles dans les statuts majeurs (chapitre 40).

**Exploitation, qualité et documentation**

- CI GitHub Actions : installation immuable, migrations sur PostgreSQL 16, lint, typecheck, tests, audit des dépendances, build.
- Docker : `Dockerfile.next`, `Dockerfile.node`, `docker-compose.yml` (PostgreSQL, MinIO, Mailpit, web, lms, api, worker, Caddy), `Caddyfile` avec TLS et en-têtes.
- Configuration Playwright racine (projets `web` et `lms`, serveurs non démarrés par défaut) et scénarios E2E : accueil et navigation, connexion, publication d'actualité, vérification de certificat, contact et demande de service, paiement sandbox, catalogue LMS, demande institutionnelle, parcours de cours et quiz ; preset Vitest partagé et fabriques de test (`@fetrag/testing`).
- Scripts : `check-no-emoji.mjs`, `export-data.ts` (export JSON/CSV de réversibilité), `e2e.mjs` (lanceur Playwright avec la configuration racine), `backup.md`.
- Documentation : ADR-001 à 005, `ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md`, `DESIGN_SYSTEM.md`, `BUILD_BRIEF.md`, `VERCEL.md`, `infra/deployment/README.md` (options d'hébergement, coûts, SLA / RPO / RTO), 9 runbooks (`docs/runbooks`), 7 guides utilisateurs (`docs/guides`), `BACKLOG.md`.

### Connu / limitations

- Adaptateurs de paiement réels, IdP OIDC définitif et routes métier de l'API à finaliser (voir `docs/BACKLOG.md`, sections 3 et 5).
- Limiteur de débit en mémoire par instance ; CSP avec `unsafe-inline` ; audit de dépendances non bloquant en CI.
- Écrans des lots web / lms assemblés en parallèle : statuts « à vérifier » dans `docs/BACKLOG.md` jusqu'à la recette.

### Exploitation

- 2026-09-04 : migrations `20260904145123_init` et `20260904145500_search_extensions` appliquées sur Neon (recette).
- Sauvegarde logique initiale et premier exercice de restauration : à réaliser avant la recette finale (`docs/runbooks/restauration-base.md`, section 6).
