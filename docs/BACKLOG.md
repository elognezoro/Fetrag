# Backlog produit - état des exigences du CDC

Source : `docs/specs/FETRAG_CDC_UNIFIE.md` (chapitres 9, 10, 11, 32). Statuts évalués à la version 0.1.0 à partir du brief de réalisation (`docs/architecture/BUILD_BRIEF.md`) et des packages livrés en vague 1 ; les écrans des lots web/lms étant en cours d'assemblage au moment de la rédaction, tout point non confirmé est marqué **à vérifier** (à trancher lors de la recette, critère par critère).

Statuts : **Livré MVP** (fonctionnel de bout en bout), **Partiel** (socle livré, complément nécessaire), **Après MVP** (phase 2 ou option, chapitre 32), **À vérifier**.

Règle du chapitre 37 : aucune fonction métier n'est ajoutée sans figurer ici ; une évolution structurante passe par un ADR (`docs/adr`).

## 1. Site institutionnel (WEB)

| ID | Priorité | Exigence | Statut | Notes / reste à faire |
| --- | --- | --- | --- | --- |
| WEB-01 | MUST | Responsive mobile-first, navigation claire, CTA visibles | Livré MVP - à vérifier | Design system mobile-first (360-430 px), header/footer du lot shells ; validation sur appareils Android/iOS réels à faire en recette |
| WEB-02 | MUST | CMS intégré : pages, actualités, médias, documents, menus, formulaires, SEO, comptes éditeurs | Livré MVP - à vérifier | `@fetrag/cms` complet (pages, articles, médias, menus, SEO, formulaires, révisions, publication) ; écrans `/admin` du lot web à valider avec un éditeur non technique |
| WEB-03 | MUST | Catalogue de services : fiches, conditions, tarifs, demande et suivi | Livré MVP - à vérifier | `services`, `serviceRequests`, offres de service (`Offer.kind = SERVICE`), suivi dans `/espace/demandes` |
| WEB-04 | MUST | Catalogue public de formations alimenté par le LMS | Livré MVP | `catalog.listPublished` partagé ; `/formations` et `/formations/[slug]` lisent la même source que `/catalogue` |
| WEB-05 | MUST | Compte unique et SSO vitrine ↔ LMS | Livré MVP | Auth.js, cookie `.fetrag.ga` (ADR-002) ; le SSO complet exige les domaines définitifs (impossible entre deux `*.vercel.app`) |
| WEB-06 | MUST | Formulaires configurables : contact, assistance, service, adhésion, partenariat | Livré MVP | `forms.submit(kind, input, ctx)`, accusé de réception, statut, export ; « configurable » = champs définis dans `@fetrag/contracts` (pas de constructeur de formulaires visuel : après MVP) |
| WEB-07 | SHOULD | Recherche pages, actualités, ressources, services, formations | Livré MVP | `@fetrag/search` (FTS french + trigram), `/recherche` avec filtres par type |
| WEB-08 | MUST | Paiement en ligne via adaptateur PSP | Partiel | Sandbox complet (checkout, webhook signé, reçu, rapprochement, remboursement) ; adaptateurs Airtel Money / Moov Money à finaliser avec les identifiants du PSP retenu (chapitre 36) |
| WEB-09 | SHOULD | Offres gratuites/payantes : tarif, période, quota, coupon, gratuité, prise en charge | Livré MVP - à vérifier | `Offer` (tiers standard/adhérent/organisation, validité, quota), `Coupon`, `Sponsorship` ; écrans d'administration des offres à vérifier |
| WEB-10 | SHOULD | Espace personnel : profil, demandes, inscriptions, paiements/reçus, notifications, accès LMS | Livré MVP | `/espace/*` (lot web) |
| WEB-11 | SHOULD | Agenda / événements : inscription, jauge, liste d'attente, calendrier | Livré MVP - à vérifier | `events.register`, `joinWaitingList`, export participants ; rappel J-1 par job |
| WEB-12 | MUST | Bibliothèque documentaire : catégories, métadonnées, aperçu, téléchargement, niveaux d'accès | Livré MVP | `resources` avec `accessLevel` appliqué côté serveur, URL signées ; aperçu PDF en ligne : à vérifier |
| WEB-13 | SHOULD | Newsletter et notifications opt-in, consentement, désinscription | Partiel | Abonnement double opt-in, consentements tracés, export ; l'envoi de campagnes n'est pas intégré (outil externe) |
| WEB-14 | MUST | Internationalisation : français, structure prête pour l'anglais | Partiel | `Locale` sur les contenus, dictionnaire `fr` centralisé, `Intl` fr-GA ; routage `/[locale]` et dictionnaire `en` après MVP (ADR-005) |
| WEB-15 | SHOULD | Tableau de bord admin : trafic, demandes, ventes, conversions, contenus populaires | Livré MVP - à vérifier | `@fetrag/analytics` (`webStats`, `financeStats`, `topContent`) ; exports à vérifier |
| WEB-16 | COULD | Vérification publique de certificat par code / QR | Livré MVP | `/certificats/verifier/[code]`, données minimales, journalisation |
| WEB-17 | MUST | SEO technique : métadonnées, sitemap, robots, Open Graph, canonical, données structurées | Livré MVP - à vérifier | `SeoRecord`, `sitemap.ts`, `robots.ts`, `generateMetadata` ; données structurées (`Organization`, `NewsArticle`, `Event`, `Course`) et audit SEO sans erreur bloquante à vérifier |
| WEB-18 | MUST | Statuts éditoriaux : brouillon, relecture, publication, archivage, planification | Livré MVP | `publishing.transition`, `publishScheduled`, droits `cms.write` / `cms.publish` |

## 2. Plateforme de formation (LMS)

| ID | Priorité | Exigence | Statut | Notes / reste à faire |
| --- | --- | --- | --- | --- |
| LMS-01 | MUST | Catalogue : catégories, objectifs, prérequis, durée, modalités, langue, public, prix, sessions | Livré MVP | 10 modules seedés, `catalog.listPublished` avec filtres pilier / modalité |
| LMS-02 | MUST | Cours async / sync / hybrides ; texte, vidéo, audio, PDF, présentations, liens, interactifs | Livré MVP - à vérifier | Cours pilote M01 seedé avec document, vidéo, audio, lien, quiz, devoir, questionnaire, forum, séance en direct ; lecteur `/apprendre` du lot lms à vérifier pour chaque type ; H5P / SCORM : voir LMS-13 |
| LMS-03 | MUST | Évaluations : QCU, QCM, vrai/faux, trous, appariement, ordre, réponse courte, composition, devoir, sondage | Livré MVP | `quizzes` (correction automatique sauf composition), `assignments`, `surveys` ; barèmes et tentatives conservés |
| LMS-04 | MUST | Cohortes, groupes, sessions, calendriers, quotas, inscriptions | Livré MVP | `cohorts` (privées par organisation), sessions, `/calendrier` avec export |
| LMS-05 | MUST | Workflow de demande de formation institutionnelle | Livré MVP | `trainingRequests` (transitions, historique, pièces, planification = cohorte + comptes + inscriptions + convocations) |
| LMS-06 | MUST | Présences et émargement présentiel / virtuel | Livré MVP | `attendance.record`, `sheet`, `rateFor` ; feuille visible dans le rapport de cohorte |
| LMS-07 | MUST | Certificats : numéro unique, QR, critères, statut, révocation | Livré MVP | `certification` (éligibilité, numéro séquentiel, `verifyCode`, PDF + QR par job, révocation auditée) |
| LMS-08 | MUST | Tableau de bord apprenant : progression, échéances, résultats, certificats, historique | Livré MVP - à vérifier | `dashboards.learner` ; lisibilité smartphone à valider en recette |
| LMS-09 | SHOULD | Tableau de bord organisation : demandes, participants, progression agrégée, résultats, documents | Livré MVP | `dashboards.organization`, `reports.organizationReport`, isolation par `organizationId` |
| LMS-10 | MUST | Tableau de bord formateur : participants, contenus, corrections, présence, messagerie, statistiques | Livré MVP - à vérifier | `dashboards.trainer`, `assignments.listForTrainer`, forums ; « messagerie » = forums de cohorte (pas de messagerie privée : après MVP) |
| LMS-11 | SHOULD | Notifications email + internes, adaptateurs SMS/WhatsApp optionnels | Partiel | Email + internes livrés avec rappels (session, devoir en retard, résultat, certificat) ; SMS / WhatsApp après MVP (chapitre 32) |
| LMS-12 | SHOULD | Forums modérés par cours ou cohorte | Livré MVP | `forums` (accès limité aux inscrits, modération), flag `FEATURE_FORUMS` |
| LMS-13 | SHOULD | Interopérabilité H5P / SCORM / xAPI | Partiel | Types d'activité `H5P` et `SCORM` prévus dans le modèle ; lecteur H5P embarqué et import SCORM : après MVP, périmètre à fixer (chapitre 36, point 10) |
| LMS-14 | SHOULD | Bibliothèque de ressources pédagogiques transversales et recherche | Partiel | Ressources documentaires de la vitrine réutilisables (accès `MEMBER` / `ORGANIZATION`) ; bibliothèque interne au builder (réutilisation d'un même fichier dans plusieurs cours) : à vérifier / après MVP |
| LMS-15 | SHOULD | Master Class : inscription, paiement, intervenant, synchrone, replay, certificat optionnel | Livré MVP - à vérifier | Événement `MASTERCLASS` seedé avec offre payante ; replay = activité vidéo ; certificat optionnel via modèle : à vérifier de bout en bout |
| LMS-16 | SHOULD | Questionnaires de satisfaction et impact | Livré MVP | `surveys` (activité `SURVEY`, agrégation par module / session) ; questionnaire d'impact différé (J+90) après MVP |
| LMS-17 | MUST | Versionnement des cours et traçabilité | Livré MVP | `CourseVersion` figée à la publication, inscriptions et cohortes liées à une version (ADR-004) |
| LMS-18 | MUST | Banque de questions réutilisable, catégorisée, versionnée | Livré MVP | `questionBank` (CRUD, import, duplication, `addToQuiz`) |
| LMS-19 | MUST | Devoirs : dépôt de fichiers, texte riche, date limite, correction, feedback | Livré MVP | `assignments` (brouillon, dépôt, retard, note, grille) |
| LMS-20 | SHOULD | Reprise après coupure, bas débit, téléchargement contrôlé | Partiel | Progression idempotente (`progress.report`), alternatives bas débit par activité, documents téléchargeables selon autorisation ; PWA installable et cache hors ligne : après MVP (chapitre 22) |
| LMS-21 | MUST | Rapports : actifs, inscrits, complétion, réussite, assiduité, temps, certificats, revenus, satisfaction | Livré MVP | `reports.*` + `toCsv` ; XLSX / PDF : CSV livré, autres formats après MVP |
| LMS-22 | MUST | Règles d'achèvement configurables par activité, séquence et cours | Livré MVP | `completionRule` par activité, `completionRules` par version, critères par modèle de certificat |

## 3. Exigences partagées (SHR)

| ID | Priorité | Exigence | Statut | Notes / reste à faire |
| --- | --- | --- | --- | --- |
| SHR-01 | MUST | Identité fédérée OIDC avec IdP dédié, MFA admin au niveau de l'IdP | Partiel | Client OIDC générique prêt ; IdP non choisi (chapitre 36) : mode local `FEATURE_LOCAL_AUTH` avec MFA TOTP en transition (ADR-002) |
| SHR-02 | MUST | RBAC avec portées globale, organisation, cours, session | Livré MVP | `can()`, `RoleAssignment` avec expiration ; tests d'autorisation négatifs par lot : à vérifier (couverture) |
| SHR-03 | MUST | PostgreSQL, migrations versionnées | Livré MVP | Prisma 6, migrations `init` et `search_extensions`, CI applique `migrate deploy` sur base vierge |
| SHR-04 | MUST | Stockage objet S3-compatible, URL signées | Livré MVP | `@fetrag/storage` (local / Vercel Blob / S3), buckets public / privé, signature |
| SHR-05 | MUST | Notifications asynchrones, file de jobs, reprise sur erreur | Livré MVP | `@fetrag/jobs` (PostgreSQL, retries, backoff, `DEAD`), `EmailDelivery` rejouable (ADR-001) |
| SHR-06 | MUST | Paiements via interface PSP, aucun fournisseur codé en dur | Livré MVP | `PaymentProvider`, sandbox ; adaptateurs réels : voir WEB-08 |
| SHR-07 | MUST | Journal d'audit : auth, rôles, paiements, notes, certificats, publications | Livré MVP | `audit()` + `AuditLog`, consultation `audit.read` ; écran `/admin` → Journal d'audit : à vérifier |
| SHR-08 | MUST | Consentements et préférences de communication | Livré MVP | `Consent`, `NotificationPreference`, contrôle avant envoi non essentiel |
| SHR-09 | SHOULD | Recherche unifiée PostgreSQL FTS / trigram | Livré MVP | ADR-005 |
| SHR-10 | MUST | API versionnée et documentée (OpenAPI) | Partiel | Routeur Hono `/api/v1` monté dans les apps, `apps/api` autonome ; la version 0.1.0 du package `@fetrag/api` n'expose que `/health` : routes métier OpenAPI + Swagger `/api/v1/docs` = lot API (phase 2 du brief), à vérifier |
| SHR-11 | MUST | Design system commun FETRAG | Livré MVP | `@fetrag/design-tokens`, `@fetrag/ui` (« Le Cercle et l'Étoile ») |
| SHR-12 | MUST | Observabilité : logs structurés, métriques, erreurs, santé | Partiel | Logs JSON caviardés, `correlationId`, `/api/health`, indicateurs de jobs ; métriques OpenTelemetry / APM et alertes automatisées : à mettre en place à l'hébergement (`docs/runbooks/supervision.md`) |

## 4. Sécurité et exploitation (SEC, chapitres 27-28)

| Sujet | Statut | Référence |
| --- | --- | --- |
| SEC-01 en-têtes, cookies, CSRF | Livré MVP (CSP avec `unsafe-inline`) | `docs/architecture/SECURITY.md` |
| SEC-02 MFA obligatoire | Partiel (`AUTH_ENFORCE_MFA` à activer) | idem |
| SEC-03 validation / uploads / antivirus | Partiel (antivirus à décider) | idem |
| SEC-04 rate limiting | Partiel (mémoire par instance) | idem |
| SEC-05 secrets et rotation | Livré + runbook | `docs/runbooks/rotation-secrets.md` |
| SEC-06 audit dépendances, SAST, scan conteneur | Partiel (audit non bloquant, pas de SAST) | ajouter CodeQL + Trivy, `pnpm audit` bloquant |
| SEC-07 sauvegardes / restauration testée | Procédure (test à réaliser) | `docs/runbooks/restauration-base.md` |
| SEC-08 moindre privilège | Livré + revue périodique | `docs/runbooks/incident-securite.md` |
| SEC-09 pas de données sensibles dans les logs | Livré | `@fetrag/observability` |
| SEC-10 revue indépendante | À faire | cadrage |
| Runbooks (restauration, email, PSP, secrets, certificat, incident, jobs, déploiement, supervision) | Livré | `docs/runbooks/` |
| Guides utilisateurs (7 rôles) | Livré | `docs/guides/` |
| Docker, Caddy, options d'hébergement, SLA / RPO / RTO | Livré (proposition) | `infra/`, `infra/deployment/README.md` |
| Export de réversibilité | Livré | `scripts/export-data.ts` |
| Contrôle « aucun emoji » | Livré (à brancher en CI) | `scripts/check-no-emoji.mjs` |
| Tests E2E Playwright | Livré (non lancés en CI par défaut) | `packages/testing/e2e`, `docs/architecture/TESTING.md` |

## 5. Après MVP (chapitre 32) et améliorations identifiées

| Élément | Origine | Priorité proposée |
| --- | --- | --- |
| Adaptateurs PSP réels (Airtel Money, Moov Money) et rapprochement bancaire | WEB-08 | Haute (avant monétisation) |
| Bascule IdP OIDC + `FEATURE_LOCAL_AUTH=false` | SHR-01 | Haute (avant go-live) |
| Routes métier de l'API `/api/v1` + OpenAPI + Swagger | SHR-10 | Haute |
| CI : `pnpm audit` bloquant, CodeQL, Trivy, job E2E manuel, `check-no-emoji` | SEC-06 | Haute |
| Rate limiting partagé (PostgreSQL ou Redis) | SEC-04 | Moyenne |
| CSP avec nonces (retrait de `unsafe-inline`) | SEC-01 | Moyenne |
| PWA LMS (installable, cache des ressources autorisées) | LMS-20 | Moyenne |
| Lecteur H5P embarqué, import SCORM / xAPI | LMS-13 | Moyenne (périmètre à fixer) |
| Multilingue anglais (dictionnaire `en`, routage `/[locale]`) | WEB-14 | Moyenne |
| Exports XLSX / PDF des rapports | LMS-21 | Basse |
| Envoi de campagnes newsletter intégré | WEB-13 | Basse |
| Messagerie privée formateur ↔ apprenant | LMS-10 | Basse |
| Questionnaire d'impact différé (J+90) | LMS-16 | Basse |
| SMS / WhatsApp | LMS-11 | Option |
| Application mobile native, proctoring, marketplace, CRM d'adhésion, visio propriétaire | chapitre 35 | Hors périmètre sauf décision |

## 6. Décisions de cadrage en attente (chapitre 36)

IdP OIDC et politique MFA ; PSP et opérateurs mobile money ; hébergement définitif (Vercel + Neon vs Docker/VPS vs cloud managé, voir `infra/deployment/README.md`) et localisation des données ; règles exactes de certification / expiration ; politique tarifaire ; solution de classe virtuelle et replay ; limites de fichiers et quotas ; durées de conservation ; niveau de multilingue ; périmètre H5P / SCORM ; contenus existants à migrer ; SLA, RPO, RTO contractuels.
