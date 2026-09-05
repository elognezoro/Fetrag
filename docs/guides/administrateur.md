# Guide de l'administrateur (SUPER_ADMIN)

Ce guide s'adresse au Super administrateur de la FETRAG : la personne qui paramètre les plateformes, attribue les rôles, surveille la sécurité et le journal d'audit. Compte de démonstration : `admin@fetrag.ga` (mot de passe `Fetrag2026!` en recette uniquement).

Deux back-offices distincts partagent la même identité (SSO) :

| Plateforme | Adresse | Périmètre |
| --- | --- | --- |
| Site institutionnel | `https://fetrag.ga/admin` | Contenus, services, formulaires, médias, menus, SEO, commandes, paramètres du site |
| Plateforme de formation | `https://formation.fetrag.ga/admin` | Cours et builder, banque de questions, modèles de certificats, utilisateurs et rôles, paramètres LMS, journal d'audit |

Les captures d'écran sont remplacées par des descriptions : chaque écran suit le design FETRAG (ruban bleu d'entête, titres en serif, cartes à filet tricolore) et une barre latérale repliable sur mobile.

## 1. Se connecter et sécuriser son compte

1. Ouvrir `https://fetrag.ga/connexion`. Saisir « Adresse email » et « Mot de passe », puis « Se connecter ». Si la MFA est activée, un champ « Code de vérification » apparaît : saisir le code à 6 chiffres de l'application d'authentification (ou un code de secours).
2. Après connexion, le menu utilisateur (en haut à droite, avatar avec initiales) donne accès à « Espace personnel », « Administration » et « Se déconnecter ».
3. **Activer la MFA** (obligatoire pour SUPER_ADMIN, COORDINATOR, FINANCE et EDITOR) : `https://fetrag.ga/espace/securite` → « Activer l'authentification à deux facteurs » → scanner le QR code avec une application TOTP (Google Authenticator, Aegis, Microsoft Authenticator) → saisir le code affiché → enregistrer les **codes de secours** dans un lieu sûr (ils ne sont montrés qu'une fois).
4. Changer le mot de passe initial depuis la même page (« Modifier le mot de passe »).

En cas de perte de l'application TOTP : utiliser un code de secours, puis désactiver et réactiver la MFA. Sans code de secours, un autre Super administrateur doit désactiver la MFA du compte (`/admin` → Utilisateurs → fiche → « Réinitialiser la MFA »), action journalisée.

## 2. Gérer les utilisateurs et les rôles

Écran : `https://formation.fetrag.ga/admin` → **Utilisateurs et rôles** (les mêmes comptes servent aux deux sites).

1. **Rechercher** un utilisateur par nom ou email ; la liste affiche le statut (actif / désactivé), la MFA, la dernière connexion et les rôles.
2. **Créer** un compte (« Nouvel utilisateur ») : prénom, nom, email, téléphone, organisation éventuelle. Un email de bienvenue avec un lien d'initialisation du mot de passe est envoyé (en recette, il apparaît dans les logs `console`).
3. **Attribuer un rôle** : fiche utilisateur → « Ajouter un rôle » → choisir le rôle et sa **portée** :
   - `GLOBAL` : rôle sur toute la plateforme (Coordinateur, Éditeur, Finance, Support, Responsable services, Super administrateur).
   - `ORGANIZATION` : responsable d'une organisation précise.
   - `COURSE` ou `COHORT` : formateur limité à un cours ou une cohorte (expert invité, par exemple). Une **date d'expiration** peut être fixée.
4. **Retirer un rôle** : icône « Retirer » sur la ligne du rôle. L'action est journalisée (`role.revoked`) et prend effet immédiatement pour les nouvelles requêtes (la session de la personne reste ouverte mais ses droits sont réévalués à chaque page).
5. **Désactiver** un compte (départ, fraude) : bouton « Désactiver » ; la personne ne peut plus se connecter, ses données (inscriptions, certificats, paiements) sont conservées. Ne jamais supprimer un compte ayant des certificats ou des paiements.

Rappel de la matrice (chapitre 5 du CDC et `packages/domain/src/rbac.ts`) : Super administrateur = tout ; Coordinateur = pilotage LMS, cohortes, certificats, demandes ; Formateur = cours et cohortes affectés ; Éditeur = CMS et publication ; Responsable services = catalogue de services et demandes ; Finance = paiements, remboursements, exports, audit ; Support = assistance et lecture des demandes ; Responsable d'organisation = sa seule organisation.

## 3. Paramètres du système

Écran : `https://formation.fetrag.ga/admin` → **Paramètres**. Chaque valeur est enregistrée dans `SystemSetting` et journalisée (`settings.updated`).

| Paramètre | Clé | Effet |
| --- | --- | --- |
| Limite de participants par demande de formation | `training.participantLimit` (10 par défaut) | Nombre maximal de cadres désignés dans une demande institutionnelle |
| Séquence des numéros de certificat | `certificates.sequence` | Ne pas modifier manuellement sauf migration |
| Crédit partiel aux QCM | `quiz.partialCredit` | Barème des questions à choix multiples |
| Clés API partenaires | `api.keys` | Accès `X-API-Key` à l'API `/api/v1` (créer, dater, révoquer) |

Les fonctionnalités optionnelles (paiement en ligne, forums, newsletter) et les fournisseurs (email, stockage, paiement, IdP) se règlent par variables d'environnement, pas dans l'interface : voir `docs/deployment/VERCEL.md` et `docs/runbooks/rotation-secrets.md`. Une modification de ces variables est du ressort de l'exploitant.

## 4. Journal d'audit

Écran : `https://formation.fetrag.ga/admin` → **Journal d'audit** (rôles SUPER_ADMIN et FINANCE).

- Filtres : action (`auth.login`, `role.granted`, `payment.succeeded`, `certificate.revoked`, `content.published`...), acteur, type d'entité, période.
- Chaque entrée montre l'acteur (email), la date UTC convertie en heure de Libreville, l'entité et, quand c'est pertinent, l'état avant / après.
- Le journal est **fonctionnellement immuable** : aucune suppression ni modification depuis l'interface. Export CSV disponible (journalisé lui-même comme `export.generated`).
- Utilisations : enquête sur un accès suspect (`docs/runbooks/incident-securite.md`), justification d'une décision (révocation, refus de demande), contrôle financier.

## 5. Surveiller la plateforme

- **Santé** : `https://fetrag.ga/api/health` et `https://formation.fetrag.ga/api/health` doivent afficher `"ok": true`.
- **File de jobs** : `/admin` → Système → File de jobs (compteurs `QUEUED`, `RUNNING`, `FAILED`, `DEAD`, jobs en retard, relance individuelle). Si l'écran n'est pas disponible dans la version déployée, les requêtes SQL de `docs/runbooks/jobs-bloques.md` s'appliquent.
- **Emails** : `/admin` → Système → Emails (livraisons `SENT` / `FAILED`, erreur du fournisseur, renvoi).
- **Tableau de bord** : `https://fetrag.ga/admin` (trafic, formulaires reçus, demandes de service, ventes) et `https://formation.fetrag.ga/admin` (apprenants actifs, inscriptions, complétion, certificats, revenus).

Les seuils d'alerte et les actions correspondantes sont décrits dans `docs/runbooks/supervision.md`.

## 6. Contenus, cours, paiements : renvois

Le Super administrateur possède tous les droits, mais les procédures détaillées vivent dans les guides métier :

- Publier une page, une actualité, une ressource, un service, un événement : `docs/guides/editeur.md`.
- Créer un cours, une version, des activités, une cohorte, émettre un certificat, traiter une demande de formation : `docs/guides/coordinateur.md`.
- Rembourser, confirmer un paiement hors ligne, exporter les ventes : rôle FINANCE (`/admin` → Commandes) et `docs/runbooks/psp-indisponible.md`.
- Répondre aux demandes d'assistance : `docs/guides/support.md`.

## 7. Bonnes pratiques

- Un seul compte SUPER_ADMIN nominatif par personne ; jamais de compte partagé.
- Vérifier chaque mois la liste des rôles privilégiés et la MFA (`docs/runbooks/incident-securite.md`, section 4).
- Avant toute modification en production (rôle, paramètre, désactivation), noter le motif : le journal d'audit enregistre l'action, pas l'intention.
- Les exports de données personnelles (CSV, `scripts/export-data.ts`) sont chiffrés, conservés le temps strictement nécessaire, puis supprimés.
- Toute demande d'évolution fonctionnelle passe par `docs/BACKLOG.md` ; toute évolution structurante par un ADR (`docs/adr`).
