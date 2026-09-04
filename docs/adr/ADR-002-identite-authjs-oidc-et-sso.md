# ADR-002 - Identité : Auth.js v5, fournisseur OIDC externe configurable, SSO par cookie de domaine, MFA TOTP

- Statut : accepté (septembre 2026)
- Contexte : SHR-01 impose OIDC/OAuth2 via un fournisseur d'identité dédié et interdit un protocole SSO « maison ». Le fournisseur (Keycloak, Zitadel, Auth0, Logto...) n'est pas encore choisi (chapitre 36). La recette sur Vercel doit fonctionner sans IdP.

## Décision

1. `packages/auth` utilise **Auth.js v5** (`next-auth@5`) avec l'adaptateur Prisma. Les deux apps sont des **clients OIDC** du même fournisseur dès que `OIDC_ISSUER`, `OIDC_CLIENT_ID` et `OIDC_CLIENT_SECRET` sont renseignés (provider générique `oidc`). Le profil applicatif est lié au `sub` OIDC via la table `Account` ; aucun mot de passe n'est dupliqué.
2. Tant que l'IdP n'est pas branché (`FEATURE_LOCAL_AUTH=true`), un provider **Credentials** (email + mot de passe bcrypt) permet la recette avec les comptes de démonstration. Ce mode est un mode de transition et se désactive par variable d'environnement.
3. **SSO** : session JWT signée par `AUTH_SECRET` commun, cookie `__Secure-authjs.session-token` posé sur `AUTH_COOKIE_DOMAIN=.fetrag.ga`. Un utilisateur connecté sur fetrag.ga est reconnu sur formation.fetrag.ga sans ressaisie. Sur les URL `*.vercel.app` (suffixe public), le cookie ne peut pas être partagé : chaque app demande une connexion, avec les mêmes identifiants.
4. **MFA** : exigée pour SUPER_ADMIN, COORDINATOR, FINANCE et EDITOR (rôles privilégiés). Avec un IdP externe, la MFA est appliquée par l'IdP (`acr`). En mode local, un second facteur **TOTP** (`otplib`) avec codes de secours est imposé au premier accès à une zone d'administration.
5. **RBAC + portées** : `RoleAssignment(role, scopeType, scopeId, expiresAt)`. `@fetrag/domain` expose `can(user, action, resource)` ; `@fetrag/auth` expose `requireUser`, `requireRole`, `requireScope`. Chaque route protégée possède un test positif et négatif.

## Conséquences

- Aucune cryptographie ni protocole maison : Auth.js gère PKCE, state, nonce, rotation.
- Le passage à l'IdP définitif = configuration + import des utilisateurs (email comme clé de rapprochement).
