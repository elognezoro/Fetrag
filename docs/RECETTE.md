# Recette - état de vérification (5 septembre 2026)

Référence : chapitre 30 « Critères de recette globale » du cahier des charges unifié v2.0. Les vérifications ci-dessous ont été réalisées sur l'environnement de développement (Neon, serveurs Next.js locaux) avec les comptes de démonstration du seed. Colonne « État » : Vérifié = testé de bout en bout ; Livré = code présent et typé, à tester en recette ; Partiel = livré avec limitation documentée.

| # | Critère (CDC §30) | État | Preuve / commentaire |
| --- | --- | --- | --- |
| 1 | 100 % des exigences MUST livrées ou dérogation écrite | Partiel | Voir `docs/BACKLOG.md` (statut par exigence WEB/LMS/SHR). Dérogations documentées : IdP OIDC externe à brancher (ADR-002), PSP réel à brancher (ADR-003), antivirus des pièces jointes non intégré. |
| 2 | Deux domaines en HTTPS avec charte commune | Livré | Design system `@fetrag/ui` partagé ; HTTPS fourni par Vercel ; domaines à rattacher (`docs/deployment/VERCEL.md`). |
| 3 | SSO portail ↔ LMS sans ressaisie | Partiel | Vérifié en local (cookie partagé sur `localhost`). En production : `AUTH_COOKIE_DOMAIN=.fetrag.ga`. Impossible entre deux URL `*.vercel.app`. |
| 4 | Un administrateur non technique publie page, actualité, ressource, formation | Livré | Back-office `/admin` (pages, actualités, ressources, services, événements, menus, médias, SEO) et `/admin/cours` LMS ; workflow brouillon → relecture → publié → archivé ; éditeur TipTap. Pages rendues sans erreur pour le compte `editeur@fetrag.ga`/`admin@fetrag.ga`. |
| 5 | Une organisation soumet une demande, désigne ses participants, suit la décision | Livré | Assistant `/demande-formation` (6 étapes), suivi `/organisation/demandes/[id]`, décisions `/coordination/demandes/[id]` (complément, acceptation, refus, report, planification = cohorte + inscriptions + convocations). Seed : une demande par statut. |
| 6 | Cohorte pilote : ≥ 3 types de ressources, une évaluation, une présence | Vérifié | Cours pilote M01 : texte, PDF, vidéo/transcription, audio, lien, quiz 8 types, devoir, sondage, forum, séance en direct ; cohorte SYNATEP RUNNING, 3 sessions, présences seedées. Pages lecteur, quiz, devoir rendues (200) pour `apprenant1`. |
| 7 | Certificat émis selon règle, identifiant/QR, vérification publique | Vérifié | `GET /api/v1/certificates/verify/K7MP-3QXR-9TVD` → valide (FETRAG-2026-000001) ; page `/certificats/verifier/[code]` → « Certificat valide ». PDF généré par le job `certificate.render` (pdf-lib + QR). |
| 8 | Paiement sandbox ou prise en charge → inscription conditionnelle | Livré | Checkout `/paiement/[orderId]`, simulateur `/paiement/[orderId]/sandbox`, webhook signé HMAC, `fulfillOrder` (inscription / événement / service), prises en charge `/admin/finance/prises-en-charge`. Seed : paiement réussi, échoué, remboursé. |
| 9 | Rapports par organisation, session, finance exploitables | Livré | `/organisation/rapports`, `/coordination/rapports`, `/admin/rapports`, `/admin/finance` avec exports CSV (route handlers protégés, audit `export.generated`). |
| 10 | Sauvegardes et restauration testées | Partiel | Procédure `docs/runbooks/restauration-base.md` (Neon PITR + pg_dump) ; test de restauration à réaliser avant go-live. |
| 11 | Aucune vulnérabilité critique connue | Partiel | En-têtes de sécurité, CSP, rate limiting, validation Zod, RBAC testé (tests API 36/36, tests lms-core 32). Audit de dépendances et revue externe à faire (SEC-06, SEC-10). |
| 12 | Accès, guides, runbooks et code source remis | Livré | Dépôt GitHub `elognezoro/Fetrag` ; guides d'utilisation par rôle intégrés à l'application (`@fetrag/guides`, chaque rôle ne voit que le sien) et exportés dans `docs/guides/*` (13 guides + README), avec un module d'autoévaluation « Testez votre maîtrise » par guide (tentatives en base `GuideAssessmentAttempt`) ; `docs/runbooks/*` (9), `docs/adr/*` (5), `scripts/export-data.ts` (réversibilité). |

## Vérifications automatisées exécutées

| Vérification | Résultat |
| --- | --- |
| `tsc --noEmit` sur les 19 packages/apps | 0 erreur |
| ESLint packages + apps | 0 erreur |
| Vitest : `api` 36 tests, `lms-core` 32 tests, `cms` 25 tests, `jobs` 8, `payments` 10 | verts |
| Pages publiques web (13 routes + 5 fiches) | 200, aucune erreur d'exécution |
| Espace personnel (7 routes) et back-office (28 routes) avec session admin | 200 |
| LMS apprenant (11 routes dont lecteur, quiz, sondage, devoir, certificats) | 200 |
| LMS coordination (14 routes), formateur (2), organisation (4) | 200 |
| Tests négatifs : apprenant sur `/coordination`, `/admin` (LMS et web) | redirection `/acces-refuse`, aucun contenu divulgué |
| Scan emoji (`scripts/check-no-emoji.mjs`) | 0 occurrence |
| Débordement horizontal à 1280 px (accueil web) | corrigé (en-tête) |

## Points d'attention pour la recette FETRAG

- Les emails ne partent que si `RESEND_API_KEY` est défini (fournisseur Resend, ADR-003) ; sans clé, ils sont seulement journalisés (`provider = console`) et la validation de compte à l'inscription est impossible. Configuration : `docs/deployment/VERCEL.md`, section 2 bis ; parcours à vérifier : section « Emails et validation de compte » ci-dessous.
- Le stockage `local` n'est pas disponible sur Vercel : utiliser `vercel-blob` (créer un store Blob) ou `s3`.
- Le navigateur intégré de l'outil de développement n'exécute pas les scripts de streaming React ; les vérifications de rendu ont été faites sur le HTML complet. Une passe visuelle sur mobile réel (360-430 px) reste à faire.
- Le job `certificate.render` s'exécute via le cron Vercel (5 min) ou le bouton « Générer le PDF » du LMS.

## Emails et validation de compte (11 septembre 2026)

Les emails transactionnels partent via Resend (`RESEND_API_KEY`, `EMAIL_FROM`). La connexion locale exige désormais une adresse confirmée (`User.emailVerified`) ; les comptes créés par l'administration ou la coordination sont considérés comme validés et reçoivent une invitation à définir leur mot de passe. Les jetons sont à usage unique, stockés sous forme d'empreinte (`VerificationToken`), et les réponses des formulaires sont neutres (elles ne révèlent jamais si une adresse correspond à un compte). Templates concernés : `email-verification`, `welcome`, `password-reset`, `password-changed`, `account-invitation`.

### Parcours 1 - Inscription, confirmation, connexion

| Étape | Où | Attendu |
| --- | --- | --- |
| 1. Créer un compte | `fetrag.ga/inscription` | Formulaire validé (Zod), compte créé sans session ouverte, message invitant à consulter sa messagerie. Limitation de débit par adresse IP. |
| 2. Email de confirmation | Messagerie | Email « Confirmez votre adresse email - FETRAG » (`email-verification`), lien valable 24 h. `EmailDelivery` : `template = email-verification`, `provider = resend`, statut `SENT`. |
| 3. Tentative de connexion avant confirmation | `fetrag.ga/connexion` ou `formation.fetrag.ga/connexion` | Refus avec le message « Confirmez d'abord votre adresse email » et un lien « Renvoyer le lien de confirmation » vers `fetrag.ga/inscription/confirmation?email=<adresse>`. Aucune session ouverte. |
| 4. Renvoyer le lien | `fetrag.ga/inscription/confirmation` | Réponse neutre (« Si un compte est associé à cette adresse... »), limitation de débit, nouveau jeton qui invalide le précédent. |
| 5. Confirmer | Lien de l'email | `emailVerified` renseigné, jeton consommé (un second clic sur le même lien est refusé : lien expiré ou déjà utilisé), email de bienvenue (`welcome`), audit. |
| 6. Se connecter | `fetrag.ga/connexion` puis `formation.fetrag.ga` | Connexion acceptée ; le même compte fonctionne sur les deux sites (SSO avec `AUTH_COOKIE_DOMAIN=.fetrag.ga`). |
| 7. Lien expiré | Lien de plus de 24 h | Page de confirmation en erreur avec proposition de renvoi ; aucun compte activé. |

### Parcours 2 - Mot de passe oublié

| Étape | Où | Attendu |
| --- | --- | --- |
| 1. Demander un lien | `fetrag.ga/mot-de-passe-oublie` (le LMS y redirige) | Réponse neutre quelle que soit l'adresse ; limitation de débit (3 demandes par heure et par adresse). |
| 2. Email | Messagerie | Email « Réinitialisation de votre mot de passe FETRAG » (`password-reset`), lien valable 30 minutes. Aucun email si l'adresse est inconnue, sans que la réponse à l'écran change. |
| 3. Choisir un nouveau mot de passe | `fetrag.ga/reinitialiser-mot-de-passe?token=...` | Règles de `passwordSchema` appliquées (longueur, majuscule, minuscule, chiffre, symbole), confirmation identique, jeton consommé, sessions existantes fermées, audit `auth.password_changed`. |
| 4. Confirmation | Messagerie | Email « Votre mot de passe FETRAG a été modifié » (`password-changed`) avec la date et un lien de connexion. |
| 5. Connexion | `fetrag.ga/connexion` | Ancien mot de passe refusé, nouveau accepté. Un lien de plus de 30 minutes ou déjà utilisé est refusé avec proposition d'en demander un nouveau. |

### Parcours 3 - Comptes créés par l'administration ou la coordination

| Étape | Où | Attendu |
| --- | --- | --- |
| 1. Création manuelle | `fetrag.ga/admin/utilisateurs/nouveau` | Compte créé avec `emailVerified` renseigné ; mot de passe temporaire affiché une seule fois (canal de secours) ; email « Votre compte de formation FETRAG est prêt : définissez votre mot de passe » (`account-invitation`) avec un lien valable 7 jours. Audit `user.registered` (`source = admin`, `invitationSent`). |
| 2. Réinitialisation forcée | Fiche utilisateur → « Mot de passe temporaire » (super administrateur) | Sessions fermées, mot de passe temporaire affiché une seule fois, même email d'invitation (lien 7 jours), audit `user.updated`. Le mot de passe temporaire n'apparaît jamais dans un email. |
| 3. Planification d'une demande institutionnelle | `formation.fetrag.ga/coordination/demandes/<id>` → décision « Planifier » | Pour chaque participant sans compte : compte créé et validé, rôle LEARNER, adhésion à l'organisation, inscription aux cohortes, email `account-invitation` mentionnant la formation et l'organisation (lien 7 jours), audit `user.registered` (`source = coordination`). Les participants déjà inscrits reçoivent une notification d'inscription, pas d'invitation. |
| 4. Définir le mot de passe | Lien de l'email | Même page `reinitialiser-mot-de-passe` que le parcours 2 ; connexion possible ensuite sur les deux sites sans autre confirmation. |

### Vérifications techniques

- `EmailDelivery` : un enregistrement par email avec `template`, `provider = resend`, `providerRef` (identifiant Resend), statut `SENT` ; en cas d'échec, job `email.send` rejoué par le cron (`docs/runbooks/panne-email.md`).
- `VerificationToken` : une ligne par jeton actif (`identifier = <usage>:<email>`), supprimée à la consommation ; les jetons expirés sont purgés par la maintenance.
- `AuditLog` : `user.registered`, `auth.password_changed`, `user.updated` avec l'acteur, l'adresse IP et l'agent utilisateur.
- Aucun mot de passe, temporaire ou non, dans les emails, les journaux ou `EmailDelivery.variables`.

## Revue mobile (10 septembre 2026)

Audit Playwright (`scripts/mobile-audit.mjs`, largeurs 375 et 360 px, sessions admin et coordination) sur les déploiements `fetrag.vercel.app` et `fetrag-academy.vercel.app` après le commit `20d40b4` :

| Périmètre | Routes | Débordement horizontal | Texte coupé | Menu mobile |
| --- | --- | --- | --- | --- |
| Site web (public, espace, back-office) | 32 | 0 | 0 | ouvre un tiroir plein écran (vérifié après hydratation) |
| LMS (apprenant, organisation, formateur, coordination, administration) | 27 | 0 | 0 | idem |

Correctifs livrés : 66 ajustements responsive issus de la revue page par page (grilles en colonne unique, tuiles de chiffres en deux colonnes, filtres et onglets défilables, tableaux avec colonnes secondaires masquées et fondu de défilement, boutons pleine largeur, barre du triptyque empilée, libellés multilignes, coquilles compactes, fil d'Ariane réduit), plus les corrections structurelles : tiroir de navigation rendu dans un portail (le `backdrop-filter` de l'en-tête bloquait `position: fixed`), logo compact, ruban multiligne, grilles Tailwind explicites.
