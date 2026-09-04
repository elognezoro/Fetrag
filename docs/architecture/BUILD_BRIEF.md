# Brief de réalisation - équipe parallèle FETRAG

Ce document est lu par chaque agent de réalisation avant de coder. Il complète `CLAUDE.md`, `docs/architecture/DESIGN_SYSTEM.md`, `docs/specs/FETRAG_CDC_UNIFIE.md` et `docs/specs/programme_formation_2026.md`.

## 0. Règles de coopération (impératives)

1. **Propriété de répertoires** : chaque agent n'écrit que dans les répertoires qui lui sont attribués. Il ne modifie jamais un fichier appartenant à un autre lot. S'il lui manque quelque chose d'un autre lot, il crée un helper local dans son propre répertoire et le signale dans son rapport final.
2. **Aucune installation de dépendance** (`pnpm add` interdit) : tout est déjà installé. Liste des bibliothèques disponibles : next 15.5, react 19, next-auth 5 beta, @auth/prisma-adapter, @prisma/client 6.19, zod 3.25, hono 4 + @hono/zod-openapi + @hono/swagger-ui, motion 12 (`import { motion } from 'motion/react'`), lucide-react, radix-ui (accordion, avatar, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, select, separator, slot, switch, tabs, toggle-group, tooltip), class-variance-authority, clsx, tailwind-merge, sonner, react-hook-form + @hookform/resolvers, date-fns 4, sanitize-html, @tiptap/react + starter-kit + extensions (link, image, table*, placeholder, underline), recharts, qrcode, pdf-lib, nodemailer, otplib, bcryptjs, @vercel/blob, @aws-sdk/client-s3 + s3-request-presigner, server-only, tailwindcss 4 (+ @tailwindcss/postcss), vitest, @testing-library/react, @playwright/test.
3. **Pas de `pnpm install`, pas de `git`**. Vous pouvez lancer `pnpm exec tsc --noEmit` dans votre package/app pour vérifier vos types (depuis le dossier du package). Ne lancez pas `next build` (long) ; `pnpm --filter <pkg> typecheck` suffit.
4. **Vérification** : avant de rendre, chaque agent exécute le typecheck de son lot et corrige ses erreurs. Les erreurs provenant d'un autre lot (import manquant) sont listées dans le rapport, pas corrigées à sa place.
5. **Interface** : aucun emoji. Icônes `lucide-react`. Français. Mobile-first. Accessibilité (labels, focus, aria). Respecter le design system (`DESIGN_SYSTEM.md`).
6. **Sécurité** : chaque Server Action / route valide avec Zod, vérifie le principal (`requireUser`, `requireCan`) et filtre par organisation. Les montants sont des entiers XAF.
7. **Chemins Windows** : le dépôt est `C:\Users\elogn\OneDrive\Documents\Administration-EduWeb\FETRAG`. Utilisez le Write tool pour créer les fichiers.

## 0bis. Sens des dépendances entre packages (déjà déclaré dans les package.json)

`jobs` → db, domain, config, notifications, storage, observability (les handlers de jobs utilisent `prisma` directement, jamais `lms-core`/`cms`). `notifications` → db, domain, config. `payments` → db, domain, config, jobs, notifications. `cms` → db, domain, config, jobs, notifications, storage. `lms-core` → db, domain, config, jobs, notifications, storage. `api` → tout. Aucun package ne dépend d'une app. Ne pas créer de cycle.

## 1. Fondations déjà écrites (ne pas modifier)

- `packages/db/prisma/schema.prisma` : schéma complet (lire attentivement les modèles et enums avant de coder). Migrations déjà appliquées sur Neon.
- `packages/db/src` : `import { prisma, Prisma, <Enums> } from '@fetrag/db'`.
- `packages/contracts/src/index.ts` : schémas Zod, enums miroirs + libellés FR, transitions du workflow, DTO. **Réutiliser, ne pas dupliquer.**
- `packages/domain/src` : `DomainError` et dérivées, `makeReference`, `formatCertificateNumber`, `makeVerifyCode`, `formatMoney`, `computeTotals`, `slugify`, `uniqueSlug`, `excerpt`, `formatDate*`, `can(principal, action, resource)`, `hasGlobalRole`, `isSuperAdmin`, `organizationFilter`, `audit(action, entity, ctx, diff)`, `emit(eventName, payload)`, `on(eventName, handler)`, `paginationArgs`, `toPaginated`, `safeOrderBy`.
- `packages/config/src` : `getEnv()`, `getEnvSafe()`, `features.*`, `site` (nom, devise, contact, SG), `resolvePublicUrl('web'|'lms')`.
- `packages/auth/src` : `createAuth('web'|'lms')` → `{ handlers, auth, signIn, signOut }` ; `createGuards(auth)` → `{ getPrincipal, requireUser, requireRole, requireCan, api.requireUser, api.requireCan }` ; `edgeAuth` pour `middleware.ts` ; `hashPassword/verifyPassword` ; MFA `generateTotpSecret/totpQrDataUrl/enableMfa/verifyMfaForUser`. Erreurs de connexion : codes `invalid_credentials`, `mfa_required`, `inactive`.
- `packages/observability/src` : `logger`, `createLogger`, `correlationIdFrom`, `runHealthChecks`.
- `packages/design-tokens` : `tokens` TS + `theme.css` Tailwind v4.
- `packages/ui/src/styles/globals.css` (importer dans chaque app : `import '@fetrag/ui/styles/globals.css'`), `packages/ui/src/index.ts` = **contrat d'export** que le lot UI implémente.

## 2. Contrats d'export entre lots (à respecter à la lettre)

### `@fetrag/ui` (lot UI)
Tous les exports listés dans `packages/ui/src/index.ts`. Props attendues :
- `Button` : `variant` = `primary | secondary | accent | gold | outline | ghost | link | danger`, `size` = `sm | md | lg | xl | icon`, `asChild`, `loading`, `leftIcon`, `rightIcon`.
- `Badge` : `variant` = `blue | green | gold | navy | neutral | success | warning | danger | outline`.
- `StatusBadge` : `status: string`, `labels?: Record<string,string>` (mappe automatiquement les statuts courants : PUBLISHED, DRAFT, ACTIVE, COMPLETED, PENDING, SUCCEEDED, FAILED, ISSUED, REVOKED, ACCEPTED, REJECTED, SUBMITTED...).
- `Ribbon` : `tone = blue | green | gold | navy`, enfant = texte de l'eyebrow.
- `SectionHeading` : `eyebrow?`, `title` (ReactNode), `description?`, `align = left | center`, `tone?`, `as?`.
- `ArcRing` : `size`, `stroke`, `progress (0-100)`, `tone`, `animate`, `children` (contenu centré).
- `ProgressArc` : `value (0-100)`, `label?`, `size?`.
- `Emblem` : SVG vectoriel original (anneau bleu, arc vert ouvert, étoile or, deux silhouettes bras levés) - `size`, `variant = color | mono | white`.
- `Logo` : image officielle `/brand/logo-fetrag.webp` (next/image) avec fallback texte ; props `size`, `withText`.
- `ModuleCard` : `number ('01')`, `title`, `items: string[]`, `pillar`, `href?`, `duration?`, `badge?`.
- `PillarCard` : `index`, `title`, `description`, `icon?`, `pillar`.
- `TriptychStrip` : affiche les 3 piliers (`pillarLabels` de contracts).
- `StatTile` : `value`, `label`, `icon?`, `tone?`, `suffix?`, `animate?`.
- `CertificateSeal` : sceau circulaire bleu/or avec étoile, `size`.
- `MottoStrip` : « Travail · Efficacité · Solidarité » en ruban tricolore.
- `Reveal` : `delay?`, `y?`, `once?`, `as?`, `className?`. `Stagger` + `StaggerItem`. `Counter` : `to`, `duration?`, `suffix?`, `prefix?`. `Marquee` : `speed?`, `pauseOnHover?`. `HoverLift`. `PageTransition`.
- `AppShell` (+ `AppShellSidebar`, `AppShellTopbar`, `AppShellMain`) : coquille dashboard responsive avec sidebar repliable en drawer mobile. `SidebarNav` : `items: { label, href, icon?: LucideIcon, badge?, exact? }[]`, `title?`.
- `Pagination` : `page`, `totalPages`, `hrefFor(page) => string` ou `onChange`.
- `EmptyState` : `icon?`, `title`, `description?`, `action?`.
- `FormField` : `label`, `htmlFor`, `error?`, `hint?`, `required?`, `children`.
- `Toaster` (sonner) + `toast`.
- `fr` (dictionnaire) + `t(key)`.
Tous les composants interactifs sont `'use client'` ; les composants purement présentatifs restent serveur-compatibles.

### `@fetrag/cms` (lot CMS)
Namespaces exportés : `pages`, `articles`, `categories`, `partners`, `services`, `serviceRequests`, `resources`, `media`, `menus`, `seo`, `forms`, `newsletter`, `faq`, `events`, `revisions`, `publishing`. Chacun expose : `list(query, principal?)`, `getById(id)`, `create(input, principal)`, `update(id, input, principal)`, `remove(id, principal)`, plus des lecteurs publics : `pages.getPublished(slug)`, `articles.listPublished({page,pageSize,categorySlug?,q?})`, `articles.getPublished(slug)`, `articles.related(id)`, `resources.listPublished(query, principal?)` (applique `accessLevel`), `resources.canAccess(resource, principal?)`, `services.listPublished()`, `services.getPublished(slug)`, `partners.listActive(kind?)`, `events.listUpcoming()`, `events.listPast()`, `events.getPublished(slug)`, `events.register(principal, eventId)`, `events.cancelRegistration`, `events.joinWaitingList`, `menus.get(location)`, `seo.forEntity(...)`, `forms.submit(kind, input, ctx)`, `newsletter.subscribe/confirm/unsubscribe`, `faq.listActive(group?)`, `publishing.transition(entity, id, toStatus, principal)`, `publishing.publishScheduled()`. Export aussi `sanitizeHtml(html)`, `renderExcerpt`. Schémas d'entrée Zod exportés (`pageInputSchema`, `articleInputSchema`, `serviceInputSchema`, `resourceInputSchema`, `eventInputSchema`, `partnerInputSchema`, `menuInputSchema`).

### `@fetrag/lms-core` (lot LMS core)
Namespaces exportés : `catalog`, `courseBuilder`, `enrollments`, `progress`, `quizzes`, `questionBank`, `assignments`, `cohorts`, `attendance`, `trainingRequests`, `certification`, `forums`, `reports`, `dashboards`, `surveys`.
- `catalog.listPublished({q?, pillar?, modality?, page?, pageSize?})`, `catalog.getPublished(slug)` (avec version courante, modules, leçons, activités, formateurs, prochaines cohortes), `catalog.listFeatured()`, `catalog.toPublicCourse(course)`.
- `courseBuilder` : CRUD `Course`, `CourseVersion` (`createVersion`, `publishVersion` = figer + `currentVersionId`), `CourseModule`, `Lesson`, `Activity` (+ `Quiz`, `Assignment`, `LiveSession`), réordonnancement, `duplicateVersion`.
- `enrollments.enroll(principal, courseId, {cohortId?, organizationId?, orderId?, source})` applique `enrollmentPolicy` (SELF direct, APPROVAL → PENDING, ORGANIZATION → réservé, PAID → exige orderId payé), `enrollments.listForUser`, `enrollments.get`, `enrollments.setStatus`.
- `progress.report(principal, enrollmentId, ProgressReport)` idempotent, recalcule `progressPercent`, marque COMPLETED selon `completionRules`, émet `course.completed`. `progress.summary(enrollmentId)`, `progress.nextActivity(enrollmentId)`.
- `quizzes.start(principal, activityId)`, `quizzes.submit(principal, SubmitAttemptInput)` corrige automatiquement tous les types sauf ESSAY (note manuelle via `quizzes.gradeEssay`), `quizzes.listAttempts`, `quizzes.getAttemptReview`.
- `questionBank.*` CRUD + `import`, `duplicate`, `addToQuiz`.
- `assignments.saveDraft/submit(principal, SubmissionInput)`, `assignments.grade(principal, GradeInput)`, `assignments.listForTrainer(cohortId|courseId)`, `assignments.listForUser`.
- `cohorts.create`, `cohorts.addMembers(userIds)`, `cohorts.listForTrainer`, `cohorts.listForOrganization`, `cohorts.get`, `cohorts.close` ; `sessions` inclus (`cohorts.addSession`, `cohorts.listUpcomingSessions(principal)`).
- `attendance.record(principal, AttendanceInput)`, `attendance.rateFor(enrollment)`, `attendance.sheet(sessionId)`.
- `trainingRequests.create(principal, TrainingRequestInput)` (DRAFT→SUBMITTED), `trainingRequests.decide(principal, TrainingRequestDecisionInput)` (vérifie `trainingRequestTransitions`, écrit `DecisionHistory`, SCHEDULED crée la cohorte + comptes participants (User si email inconnu, mot de passe aléatoire) + inscriptions + notifications), `trainingRequests.listForOrganization`, `trainingRequests.listForCoordination(filter)`, `trainingRequests.get`, `trainingRequests.addAttachment`.
- `certification.checkEligibility(enrollmentId)`, `certification.issue(principal, enrollmentId, templateId?)` → numéro séquentiel + `verifyCode`, enqueue `certificate.render`, `certification.revoke`, `certification.verify(code)` → `CertificateVerification` + `CertificateVerificationEvent`, `certification.listForUser`, `certification.issueForCohort`.
- `forums.listForUser`, `forums.get`, `forums.createThread`, `forums.reply`, `forums.moderate`.
- `reports.cohortReport(cohortId)`, `reports.organizationReport(orgId)`, `reports.courseReport(courseId)`, `reports.financeReport(range)`, `reports.toCsv(rows)`.
- `dashboards.learner(principal)`, `dashboards.trainer(principal)`, `dashboards.organization(principal, orgId)`, `dashboards.coordination(principal)`, `dashboards.admin(principal)`.

### `@fetrag/payments`, `@fetrag/storage`, `@fetrag/notifications`, `@fetrag/jobs`, `@fetrag/search`, `@fetrag/analytics` (lot plateforme)
- payments : `getPaymentProvider()`, interface `PaymentProvider { id, createPayment(ctx), getStatus(ref), refund(ref, amount), handleWebhook(headers, rawBody) → ParsedWebhook, reconcile() }` ; `createCheckout(principal, CheckoutInput)` → `{ orderId, paymentId, status, nextAction: { type: 'redirect'|'instructions'|'none', url?, message? } }` ; `confirmPayment(paymentId, status, providerRef?)` (transaction + `fulfillOrder`) ; `fulfillOrder(orderId)` (inscription cours / inscription événement / demande de service → statut) ; `processWebhook(providerId, headers, rawBody)` (journalise `WebhookEvent`, vérifie signature HMAC `PAYMENT_WEBHOOK_SECRET`, enqueue `webhook.process`) ; `refundPayment(principal, paymentId, amount, reason)` ; `orders.listForUser`, `orders.get`, `orders.listAll(query)` ; `applyCoupon(code, amount)` ; `sandbox.simulate(paymentId, 'success'|'failure')` ; `issueReceipt(orderId)`.
- storage : `getStorage()` → `{ put(key, data: Buffer|Uint8Array|string, { contentType, visibility }) → { key, url }, getSignedUrl(key, { expiresInSeconds }) → string, delete(key), list(prefix) }` ; `buildKey(folder, fileName)` ; `validateUpload(file, { maxMb, mimeTypes })`.
- notifications : `sendEmail({ to, subject, template, variables, html?, text? })` (crée `EmailDelivery`, tente l'envoi, sinon job), `notifyUser(userId, { title, body, href?, category?, email?: boolean })`, `notifyRole(role, ...)`, `renderTemplate(key, vars)` avec templates FR pour : bienvenue, demande soumise / complément / acceptée / refusée / planifiée, convocation session, inscription confirmée, devoir en retard, résultat, certificat émis, paiement réussi / échoué / remboursé, formulaire reçu (accusé), newsletter confirmation. Layout email HTML aux couleurs FETRAG (tables, inline CSS, sans emoji).
- jobs : `enqueue(type, payload, { idempotencyKey?, runAt?, priority? })`, `processJobs({ limit?, workerId? })` → `{ processed, failed, remaining }`, `registerHandler(type, handler)`, `registerDefaultHandlers()`, constantes `JobTypes` : `email.send`, `certificate.render` (pdf-lib + QR vers le stockage privé, met à jour `Certificate.pdfUrl`), `receipt.render`, `notification.dispatch`, `webhook.process`, `content.publish-scheduled`, `reminder.session`, `export.generate`, `enrollment.expire`. Verrouillage par `lockedAt/lockedBy`, backoff exponentiel, `DEAD` après `maxAttempts`.
- search : `searchPublic(q, { types?, limit? })` → `{ groups: { type, items: { id, slug, title, excerpt, href, badge? }[] }[] , total }` via SQL brut `to_tsvector('french', unaccent(...))` + `similarity()`.
- analytics : `track(name, { app, path?, userId?, properties? })`, `webStats()`, `lmsStats()`, `financeStats(range?)`, `orgStats(orgId)`, `topContent()`.

### `@fetrag/api` (lot API, phase 2)
`export const app` (Hono avec `@hono/zod-openapi`, `basePath('/api/v1')`), `export const apiRoutes`, `export function createApiApp()`, doc OpenAPI sur `/api/v1/openapi.json` et Swagger sur `/api/v1/docs`. Middlewares : correlation id, rate limit mémoire, gestion `DomainError` → `ApiError`, auth par cookie de session Auth.js (le principal est injecté par les apps via `c.set('principal', ...)`) ou clé API `X-API-Key` (SystemSetting `api.keys`).

## 3. Comptes de démonstration (créés par le seed, mot de passe commun `Fetrag2026!`)

| Email | Rôle | Usage |
| --- | --- | --- |
| admin@fetrag.ga | SUPER_ADMIN | Tout |
| coordination@fetrag.ga | COORDINATOR | Pilotage LMS |
| formateur@fetrag.ga | TRAINER | Formateur du cours pilote |
| editeur@fetrag.ga | EDITOR | CMS vitrine |
| services@fetrag.ga | SERVICES_MANAGER | Services et demandes |
| finance@fetrag.ga | FINANCE | Paiements |
| support@fetrag.ga | SUPPORT | Assistance |
| responsable@synatep-demo.ga | ORG_MANAGER | Organisation de démo SYNATEP (fictive) |
| apprenant1@demo.fetrag.ga … apprenant10@demo.fetrag.ga | LEARNER | 10 apprenants |

Organisation de démo : « Syndicat National des Travailleurs de l'Énergie et du Pétrole (SYNATEP) » - fictive, Libreville.

## 4. Routes (chapitre 38) et groupes de routes

- `apps/web/src/app/(public)/…` : `/`, `/la-fetrag`, `/organisations`, `/actualites`, `/actualites/[slug]`, `/ressources`, `/ressources/[slug]`, `/formations`, `/formations/[slug]`, `/services`, `/services/[slug]`, `/evenements`, `/evenements/[slug]`, `/adhesion`, `/contact`, `/partenariat`, `/recherche`, `/certificats/verifier`, `/certificats/verifier/[code]`, `/mentions-legales`, `/confidentialite`, `/faq`.
- `apps/web/src/app/(auth)/…` : `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/connexion/mfa`, `/deconnexion`, `/acces-refuse` (lot shells).
- `apps/web/src/app/(account)/espace/…` : `/espace`, `/espace/profil`, `/espace/demandes`, `/espace/inscriptions`, `/espace/paiements`, `/espace/paiements/[orderId]`, `/espace/notifications`, `/espace/securite` (MFA), `/paiement/[orderId]` (checkout), `/paiement/[orderId]/retour`.
- `apps/web/src/app/admin/…` : back-office vitrine.
- `apps/lms/src/app/(learner)/…` : `/`, `/catalogue`, `/cours/[slug]`, `/dashboard`, `/mes-formations`, `/apprendre/[courseId]/[lessonId]`, `/evaluations/[activityId]`, `/devoirs`, `/devoirs/[assignmentId]`, `/forums`, `/forums/[slug]`, `/forums/[slug]/[threadId]`, `/calendrier`, `/certificats`, `/certificats/[id]`.
- `apps/lms/src/app/(staff)/…` : `/demande-formation` (+ `/demande-formation/[id]`), `/organisation`, `/organisation/demandes/[id]`, `/organisation/participants`, `/organisation/rapports`, `/formateur`, `/formateur/cohortes/[id]` (participants, présence, corrections, messages), `/coordination` (demandes, cohortes, sessions, certificats, rapports, organisations), `/admin` (cours, builder, banque de questions, modèles de certificats, utilisateurs/rôles, paramètres, audit).
- `apps/lms/src/app/(auth)/…` : `/connexion`, `/deconnexion`, `/acces-refuse` (lot shells).
- Routes techniques (lot shells) : `app/api/auth/[...nextauth]/route.ts`, `app/api/v1/[[...route]]/route.ts`, `app/api/cron/jobs/route.ts`, `app/api/health/route.ts`, `sitemap.ts`, `robots.ts`, `manifest.ts`.

## 5. Fichiers d'infrastructure des apps (lot shells)

- `next.config.ts` : `transpilePackages` (tous les `@fetrag/*`), `images.remotePatterns` (vercel blob, fetrag.ga), headers de sécurité (HSTS, CSP raisonnable compatible next/font + inline scripts Next, X-Frame-Options, Referrer-Policy, Permissions-Policy), chargement du `.env` racine en local (parser manuel, sans dépendance), `experimental.serverActions.bodySizeLimit = '12mb'`.
- `src/lib/auth.ts` : `export const { handlers, auth, signIn, signOut } = createAuth('web')` et `export const guards = createGuards(auth)`.
- `src/lib/env.ts`, `src/lib/site.ts` (navigation, liens vers l'autre app via `NEXT_PUBLIC_APP_LMS_URL` / `NEXT_PUBLIC_APP_WEB_URL`), `src/lib/actions/*` (Server Actions communes : login, register, logout).
- Layout racine : polices `next/font/google` Fraunces (`variable: '--font-fraunces'`, axes `opsz`, `wght` 300-900) + Manrope (`--font-manrope`), classes sur `<html lang="fr">`, `Toaster`, `TooltipProvider`, skip-link, header + footer (web) / topbar (lms).

## 6. Contenus institutionnels officiels (à reprendre mot pour mot)

**Mission** : « La FETRAG s'engage à défendre les droits des travailleurs gabonais et à promouvoir un dialogue social constructif. Notre mission est de créer un environnement de travail équitable et respectueux pour tous. »

**Mot du Secrétaire Général, Jocelyn Louis NGOMA** (photo : `/brand/sg-ngoma.webp`, portrait 900×1350) :

> Au nom de la Fédération des Travailleurs du Gabon, je vous souhaite la bienvenue sur la plateforme officielle de la FETRAG.
>
> Dans un monde du travail en pleine mutation, où les défis sociaux, économiques et professionnels deviennent chaque jour plus complexes, notre responsabilité est claire : bâtir un syndicalisme nouveau, moderne, crédible et profondément attaché à la défense de la dignité du travailleur gabonais.
>
> La FETRAG est née d'une conviction forte : le progrès social ne peut se construire sans des organisations syndicales responsables, compétentes, réformatrices et capables de dialoguer avec intelligence, fermeté et vision. Nous portons un syndicalisme de propositions, un syndicalisme de résultats, un syndicalisme qui refuse la résignation et qui croit en la capacité des travailleurs du Gabon à devenir des acteurs majeurs du développement national.

**Contact** : BP 1234 Libreville, Gabon · jossngomafm@gmail.com · 066 23 00 33 · 077 52 27 98.

**Devise** : Travail · Efficacité · Solidarité. **Triptyque fondateur** : 01 Protection de l'outil de production · 02 Prévention des conflits sociaux · 03 Défense des intérêts matériels et moraux des travailleurs. **Slogan du programme** : « Ensemble, construisons l'avenir du mouvement syndical ».

**Logo** : `/brand/logo-fetrag.webp` (fond blanc, 1024×1024) ; ne jamais le placer directement sur un fond coloré sans pastille blanche.
