# Stratégie de test

Référence : chapitre 29 du CDC (tests unitaires, intégration, E2E, autorisations négatives, mobile, performance, accessibilité, vulnérabilités) et chapitre 37.1 (Definition of Done). Outils : Vitest 3, Testing Library, Playwright 1.62, PostgreSQL 16 (service CI ou Neon).

## 1. Pyramide

| Niveau | Objet | Outil | Où | Quand |
| --- | --- | --- | --- | --- |
| Unitaire | Règles métier pures : `can()`, références, argent, slugs, transitions, correction automatique (`gradeAnswer`), backoff des jobs, totaux de commande, assainissement HTML | Vitest (`environment: node`) | `packages/*/src/**/*.test.ts` | À chaque PR (CI) |
| Intégration | Services avec base réelle de test : inscriptions, progression, certification, workflow institutionnel, checkout sandbox + webhook, publication, file de jobs | Vitest + PostgreSQL (`DATABASE_URL` de test, migrations appliquées) | `packages/{cms,lms-core,payments,jobs}/src/**/*.test.ts` | À chaque PR (CI, service PostgreSQL) |
| Composants | Composants `@fetrag/ui` et formulaires des apps (rendu, accessibilité de base, états) | Vitest `jsdom` + Testing Library | `packages/ui/src/**/*.test.tsx`, `apps/*/src/**/*.test.tsx` | À chaque PR |
| E2E | Parcours utilisateur complets sur les deux applications | Playwright | `packages/testing/e2e/{web,lms}/*.spec.ts` | Avant une mise en production, en recette, à la demande (non lancés par la CI par défaut) |
| Non fonctionnel | Performance (Web Vitals, charge), accessibilité, vulnérabilités | Lighthouse / PageSpeed, axe (via Playwright), `pnpm audit`, revue indépendante | Manuel ou scripts dédiés | Avant go-live, puis trimestriel |

## 2. Commandes

```bash
pnpm test                                   # tous les tests Vitest du monorepo (Turborepo, cache)
pnpm --filter @fetrag/lms-core test         # un package
pnpm --filter @fetrag/lms-core exec vitest run src/certification.test.ts
pnpm --filter @fetrag/lms-core exec vitest --watch

pnpm lint && pnpm typecheck && pnpm test && pnpm build   # Definition of Done

# E2E (voir section 5) - lanceur scripts/e2e.mjs : config racine playwright.config.ts,
# binaire @playwright/test résolu depuis apps/web (non installé à la racine)
node scripts/e2e.mjs test                    # les deux projets
node scripts/e2e.mjs test --project=web
node scripts/e2e.mjs test --project=lms --grep "quiz"
node scripts/e2e.mjs test --ui               # exploration interactive
node scripts/e2e.mjs show-report             # rapport HTML du dernier run
```

Les tests Vitest n'ont besoin d'aucun `.env` réel : `packages/testing/src/vitest-preset.ts` injecte un environnement neutre (`testEnv` : `EMAIL_PROVIDER=console`, `STORAGE_PROVIDER=local`, `PAYMENT_PROVIDER=sandbox`, secrets factices). Seule `DATABASE_URL` est reprise de l'environnement si elle existe (tests d'intégration).

## 3. Preset Vitest partagé

`packages/testing/src/vitest-preset.ts` exporte `vitestPreset(options)` :

```ts
// packages/<nom>/vitest.config.ts
import { defineConfig } from 'vitest/config'
import { vitestPreset } from '@fetrag/testing/vitest-preset'

export default defineConfig(vitestPreset())

// apps/web/vitest.config.ts (composants React)
export default defineConfig(vitestPreset({ environment: 'jsdom', setupFiles: ['./vitest.setup.ts'] }))
```

Options : `environment` (`node` | `jsdom`), `setupFiles`, `include`, `env`, `coverage`. Valeurs communes : tests colocalisés `src/**/*.test.{ts,tsx}` et `__tests__`, exclusion de `e2e/`, `clearMocks` / `restoreMocks`, délais réalistes (10 s par test, 20 s par hook) pour les tests touchant PostgreSQL, reporters `dot` + `junit` en CI (`coverage/junit.xml`), couverture V8 optionnelle.

Les packages qui possèdent déjà un `vitest.config.ts` minimal (`cms`, `jobs`, `lms-core`, `payments`) peuvent migrer vers le preset sans changement de comportement ; `@fetrag/testing` doit alors figurer dans leurs `devDependencies`.

## 4. Fabriques et helpers

`@fetrag/testing` (`packages/testing/src/index.ts`) :

- `makePrincipal({ globalRoles, scoped, organizationIds, managedOrganizationIds, mfaVerified })` : principal de test pour `can()` et les services.
- `testIds` : identifiants stables (`orgA`, `orgB`, `courseA`, `cohortA`) pour les scénarios d'isolation.
- `makeQuestion(type, options, config)` : question minimale pour la correction automatique.

Modèle de test d'autorisation négatif (obligatoire pour chaque endpoint protégé, chapitre 37) :

```ts
import { describe, expect, it } from 'vitest'
import { can } from '@fetrag/domain'
import { makePrincipal, testIds } from '@fetrag/testing'

describe('reports.org', () => {
  it('autorise le responsable de son organisation', () => {
    const p = makePrincipal({ managedOrganizationIds: [testIds.orgA] })
    expect(can(p, 'reports.org', { organizationId: testIds.orgA })).toBe(true)
  })
  it('refuse une autre organisation', () => {
    const p = makePrincipal({ managedOrganizationIds: [testIds.orgA] })
    expect(can(p, 'reports.org', { organizationId: testIds.orgB })).toBe(false)
  })
})
```

Pour les services (`lms-core`, `cms`, `payments`), le test appelle la fonction avec un principal non autorisé et attend `ForbiddenError` / `UnauthenticatedError` (`await expect(fn()).rejects.toBeInstanceOf(ForbiddenError)`).

## 5. Tests E2E Playwright

### 5.1 Configuration

`playwright.config.ts` (racine) :

- Deux projets : `web` (`baseURL` = `E2E_WEB_URL` ou `http://localhost:3000`, `testDir` = `packages/testing/e2e/web`) et `lms` (`E2E_LMS_URL` ou `http://localhost:3001`, `packages/testing/e2e/lms`), Chromium, viewport mobile-first 390 × 844 par défaut, locale `fr-GA`, fuseau `Africa/Libreville`.
- **`webServer` désactivé par défaut** : les applications doivent tourner (dev ou build) ; `E2E_START_SERVERS=1` lance `pnpm dev:web` et `pnpm dev:lms` automatiquement.
- Reporter `list` (+ HTML dans `playwright-report/` en cas d'échec), traces et captures conservées uniquement sur échec, `retries` = 1 en CI, `workers` = 1 par défaut (les scénarios écrivent en base).
- Délais : 60 s par test, 15 s par attente, 30 s par navigation (Server Components + base distante).
- `packages/testing/e2e/package.json` (`"type": "commonjs"`, hors espace de travail pnpm) : le package `@fetrag/testing` est en ESM, or Playwright transpile les `.spec.ts` selon le `type` du package.json le plus proche ; en CommonJS, `@playwright/test` est résolu via `NODE_PATH` vers l'instance unique installée dans `apps/web`. `node scripts/e2e.mjs test --list` doit afficher « Total: 52 tests in 10 files » (vérification sans navigateur ni serveur).

### 5.2 Prérequis

1. Base de recette seedée : `pnpm db:deploy && pnpm db:seed` (comptes `admin@fetrag.ga`... mot de passe `Fetrag2026!`, cours pilote M01, certificats `K7MP-3QXR-9TVD` et `W4HN-8BZC-2SGK`, offres payantes M08/M09, sandbox de paiement).
2. Variables : `.env` avec `FEATURE_LOCAL_AUTH=true`, `PAYMENT_PROVIDER=sandbox`, `EMAIL_PROVIDER=console`.
3. Applications lancées : `pnpm dev:web` et `pnpm dev:lms` (ou `pnpm build` puis `pnpm --filter @fetrag/web start` / `... lms start`).
4. Navigateurs Playwright installés une fois : `node scripts/e2e.mjs install chromium`.

### 5.3 Lancer

`@playwright/test` est une dépendance de développement de `apps/web` et `apps/lms`, pas de la racine : `pnpm exec playwright` n'y est pas résolu et la configuration racine ne trouverait pas le module. Le lanceur `scripts/e2e.mjs` retrouve le binaire installé (`apps/web/node_modules/@playwright/test`), expose ce dossier via `NODE_PATH` (même instance du module pour la configuration et les fichiers `.spec.ts`), impose la configuration racine et transmet les arguments (sous-commande `test` par défaut). Équivalent manuel : `NODE_PATH=apps/web/node_modules pnpm --filter @fetrag/web exec playwright test --config ../../playwright.config.ts`.

```bash
node scripts/e2e.mjs test                                  # les deux projets
node scripts/e2e.mjs test --project=web                    # vitrine seule
node scripts/e2e.mjs test --project=lms --grep "@smoke"    # scénarios en lecture seule
node scripts/e2e.mjs test --list                           # vérifie la configuration sans navigateur
E2E_WEB_URL=https://fetrag-web.vercel.app E2E_LMS_URL=https://fetrag-lms.vercel.app node scripts/e2e.mjs test --grep "@smoke"
E2E_START_SERVERS=1 node scripts/e2e.mjs test              # démarre les serveurs de dev
E2E_DESKTOP=1 node scripts/e2e.mjs test --project=web      # viewport bureau 1280 × 800 (back-office)
```

Ne jamais lancer les scénarios d'écriture (`@write` : publication d'actualité, demande institutionnelle, quiz, paiement) contre la production : ils créent des données. Les scénarios `@smoke` sont en lecture seule.

### 5.4 Scénarios livrés

| Fichier | Couverture | Étiquettes |
| --- | --- | --- |
| `e2e/web/accueil-navigation.spec.ts` | Accueil (titre, mission, triptyque, devise), navigation principale, pages publiques, recherche, 404, responsive | `@smoke` |
| `e2e/web/connexion.spec.ts` | Connexion `admin@fetrag.ga`, redirection `callbackUrl`, identifiants invalides, déconnexion, accès refusé sans session | `@smoke` (lecture), `@auth` |
| `e2e/web/publication-actualite.spec.ts` | Éditeur : création d'une actualité, publication, vérification sur le site public | `@write` |
| `e2e/web/verification-certificat.spec.ts` | Vérification publique d'un code valide, d'un code inconnu, formulaire de saisie | `@smoke` |
| `e2e/web/demande-service-contact.spec.ts` | Formulaire de contact (validation, honeypot, accusé) et demande de service | `@write` |
| `e2e/web/paiement-sandbox.spec.ts` | Checkout d'une offre payante, simulation sandbox (succès puis échec), reçu et statut dans l'espace personnel | `@write` |
| `e2e/lms/accueil-catalogue.spec.ts` | Accueil LMS, catalogue des 10 modules, fiche de cours, accès protégé | `@smoke` |
| `e2e/lms/connexion.spec.ts` | Connexion apprenant et coordination, redirection par rôle, accès refusé | `@auth` |
| `e2e/lms/demande-institutionnelle.spec.ts` | Responsable SYNATEP : soumission d'une demande (modules, participants, engagements) puis suivi ; coordination : décision | `@write` |
| `e2e/lms/parcours-cours-quiz.spec.ts` | Apprenant : inscription libre, lecteur, progression, quiz (tentative, soumission, résultat), certificats | `@write` |

Les sélecteurs privilégient `getByRole`, `getByLabel`, `getByText` avec des libellés français stables (`FormField`, boutons du design system). Les écrans réalisés par d'autres lots pouvant évoluer, les helpers `gotoOrSkip` (route absente = 404 → test ignoré, 5xx → échec), `skipUnlessVisible` et `firstVisible` (`e2e/helpers/ui.ts`) transforment un écran absent en test **ignoré avec motif** plutôt qu'en faux échec ; le rapport Playwright liste ces cas à traiter. Autres helpers : `login` / `logout` / `loginExpectingError` / `expectLoginRedirect` (`helpers/auth.ts`), comptes et données du seed (`helpers/accounts.ts` : codes de certificats, slugs des modules M01 et M08, actualité seedée), `openMainNavigation` (bureau ou tiroir mobile), `fillRequiredFields` (champs dynamiques d'un service), `uniqueLabel` / `uniqueEmail` (données identifiables « E2E », adresses `example.com` non routables).

Scénarios sériels (`test.describe.configure({ mode: 'serial' })`) : publication d'actualité, demande institutionnelle et paiement sandbox enchaînent des étapes dépendantes ; un échec en amont ignore la suite. Rejouabilité : le paiement sandbox exige un apprenant non encore inscrit au module M08 (`apprenant10@demo.fetrag.ga` dans le seed) ; relancer `pnpm db:seed` pour réinitialiser.

### 5.5 Intégration continue

Le workflow `.github/workflows/ci.yml` ne lance pas les E2E (durée, seed, navigateurs). Pour les exécuter en CI, ajouter un job dédié déclenché manuellement (`workflow_dispatch`) ou nocturne :

```yaml
  e2e:
    if: github.event_name == 'workflow_dispatch'
    needs: quality
    runs-on: ubuntu-latest
    services: { postgres: { image: postgres:16-alpine, env: { POSTGRES_USER: fetrag, POSTGRES_PASSWORD: fetrag, POSTGRES_DB: fetrag }, ports: ['5432:5432'] } }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9.15.9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @fetrag/db exec prisma migrate deploy && pnpm db:seed
      - run: node scripts/e2e.mjs install --with-deps chromium
      - run: pnpm build
      - run: E2E_START_SERVERS=1 E2E_USE_BUILD=1 node scripts/e2e.mjs test
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report }
```

## 6. Accessibilité, mobile, performance

- **Accessibilité** : chaque scénario E2E vérifie un `h1` unique et l'absence d'erreur serveur ; ajouter `@axe-core/playwright` (non installé, dépendance à valider) pour un audit automatique des pages publiques ; revue manuelle clavier + lecteur d'écran sur connexion, inscription, lecteur, quiz, checkout (WCAG 2.2 AA).
- **Mobile** : projet Playwright en 390 × 844 par défaut ; ajouter un projet `desktop` (1280 × 800) pour les back-offices ; tests sur appareils réels Android convenus au cadrage.
- **Performance** : Lighthouse sur `/`, `/actualites`, `/formations`, `/catalogue`, `/cours/[slug]` (cibles chapitre 24 : LCP < 2,5 s, INP < 200 ms, CLS < 0,1 au p75 mobile) ; test de charge (k6 ou Artillery) sur inscription, publication et Master Class avant go-live.
- **Vulnérabilités** : `pnpm audit`, revue indépendante (`SECURITY.md`, section 4).

## 7. Definition of Done (rappel)

Critères d'acceptation couverts ; UI responsive et accessible ; permissions testées (positif + négatif) ; états d'erreur et de chargement traités ; logs utiles sans données sensibles ; tests unitaires / intégration / E2E appropriés ; migration et seed si nécessaire ; documentation à jour ; `pnpm lint && pnpm typecheck && pnpm test && pnpm build` verts ; `node scripts/check-no-emoji.mjs docs` sans résultat.
