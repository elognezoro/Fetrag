# Runbook - Rotation des secrets

| | |
| --- | --- |
| Exigences couvertes | SEC-05 (secrets hors dépôt, rotation documentée), SEC-08 (moindre privilège), chapitre 39 du CDC |
| Rôles | Super administrateur (détenteur des accès Vercel / Neon / PSP / SMTP), Exploitant, Finance (secret PSP) |
| Où vivent les secrets | Variables d'environnement Vercel (chiffrées) pour `fetrag-web` et `fetrag-lms` ; `.env` racine (jamais commité) sur les postes d'exploitation ; secrets GitHub Actions pour la CI ; coffre de l'équipe (gestionnaire de mots de passe) pour les valeurs maîtres |
| Documents liés | `incident-securite.md`, `deploiement.md`, `docs/deployment/VERCEL.md`, `.env.example` |

## 1. Inventaire et périodicité

| Secret | Rôle | Rotation planifiée | Rotation immédiate si |
| --- | --- | --- | --- |
| `AUTH_SECRET` | Signature des JWT de session Auth.js (SSO) | 12 mois | Fuite du dépôt/.env, départ d'un administrateur, incident |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (mot de passe du rôle Neon) | Accès base | 6 mois | Fuite, poste compromis |
| `CRON_SECRET` | Autorise `GET /api/cron/jobs` | 12 mois | Fuite |
| `PAYMENT_WEBHOOK_SECRET` | Vérification HMAC des webhooks PSP | Selon le PSP (12 mois) | Fuite, changement de PSP |
| Clés API du PSP (`PAYMENT_*` selon adaptateur) | Création de paiements, remboursements | Selon le PSP | Fuite, départ Finance |
| `SMTP_USER` / `SMTP_PASSWORD` | Envoi d'emails | 6 mois | Fuite, spam émis |
| `BLOB_READ_WRITE_TOKEN` ou `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Stockage objet | 6 mois | Fuite |
| `OIDC_CLIENT_SECRET` | Client OIDC des deux apps | 12 mois | Fuite, changement d'IdP |
| Clés API `SystemSetting api.keys` | Intégrations tierces (`X-API-Key`) | 12 mois par clé | Fuite, fin de partenariat |
| Mots de passe des comptes de démonstration (`Fetrag2026!`) | Recette uniquement | À désactiver en production | Toujours avant le go-live |

Règles : une valeur par environnement (recette et production ne partagent aucun secret) ; génération avec `openssl rand -base64 32` ; ne jamais coller un secret dans un ticket, un message ou un commit ; l'échange se fait par le coffre de l'équipe.

## 2. Procédure générale (toutes rotations)

1. **Générer** la nouvelle valeur et l'enregistrer dans le coffre avec la date et l'auteur.
2. **Déployer** : Vercel → projet → Settings → Environment Variables → modifier la variable pour l'environnement concerné (Production, Preview). Répéter sur le second projet quand la variable est partagée (`AUTH_SECRET`, `DATABASE_URL*`, `PAYMENT_WEBHOOK_SECRET`, `STORAGE_*`, `SMTP_*`, `OIDC_*`). Puis Deployments → Redeploy (les variables ne sont lues qu'au démarrage).
3. **Mettre à jour** le `.env` des postes d'exploitation et les secrets GitHub (Settings → Secrets and variables → Actions) si la CI utilise la valeur.
4. **Vérifier** (section 8) puis **révoquer** l'ancienne valeur chez le fournisseur (Neon, PSP, SMTP, stockage) - jamais avant la vérification.
5. **Journaliser** la rotation : date, secret, opérateur, motif (planifiée / incident) dans le journal d'exploitation (`docs/CHANGELOG.md`, rubrique « Exploitation », sans la valeur).

## 3. `AUTH_SECRET` (sessions et SSO)

Effet : tous les JWT de session signés avec l'ancienne valeur deviennent invalides. **Tous les utilisateurs sont déconnectés** des deux sites et doivent se reconnecter (leur mot de passe ou l'IdP ne changent pas).

1. Choisir un créneau de faible activité (soir, hors sessions de formation en direct) et prévenir le support.
2. Générer : `openssl rand -base64 32`.
3. Mettre **exactement la même valeur** sur `fetrag-web` et `fetrag-lms` (sinon le SSO se rompt : un utilisateur connecté sur l'un sera inconnu de l'autre).
4. Redéployer les deux projets dans la foulée.
5. Vérifier : connexion sur fetrag.ga, puis ouverture de formation.fetrag.ga sans ressaisie (avec `AUTH_COOKIE_DOMAIN=.fetrag.ga`).

## 4. Mot de passe de la base (Neon)

1. Console Neon → Roles → rôle applicatif → « Reset password ». Neon affiche le nouveau mot de passe une seule fois ; les deux chaînes (poolée et directe) changent.
2. Mettre à jour `DATABASE_URL` (chaîne `-pooler`) et `DATABASE_URL_UNPOOLED` (chaîne directe) sur les deux projets Vercel et sur les postes d'exploitation ; redéployer.
3. Fenêtre d'indisponibilité : entre la réinitialisation et le redéploiement, les requêtes échouent (`P1000`). Pour l'éviter : créer un **second rôle** Neon avec les mêmes droits, basculer les applications dessus, puis supprimer l'ancien rôle. C'est la voie recommandée en production.
4. Vérifier `/api/health` (contrôle `database`) sur les deux applications.

## 5. Identifiants SMTP

1. Créer un nouvel identifiant (ou mot de passe d'application) chez le fournisseur ; conserver l'ancien actif.
2. Mettre à jour `SMTP_USER` / `SMTP_PASSWORD` sur les deux projets, redéployer.
3. Tester : soumettre le formulaire `/contact` en recette de production avec une adresse interne et contrôler `EmailDelivery.status = SENT` avec `provider = smtp`.
4. Révoquer l'ancien identifiant.

## 6. `PAYMENT_WEBHOOK_SECRET` et clés PSP

1. Chez le PSP, générer un nouveau secret de signature (ou pour le sandbox, une valeur aléatoire).
2. Si le PSP supporte deux secrets actifs simultanément, ajouter le nouveau avant de retirer l'ancien. Sinon, planifier la rotation à une heure creuse : les webhooks reçus entre le changement côté PSP et le redéploiement seront journalisés en `verified = false` et rattrapés par `reconcile()` (voir `psp-indisponible.md`, section 3.4).
3. Mettre à jour la variable sur `fetrag-web` (et `fetrag-lms` si le LMS reçoit des webhooks), redéployer.
4. En sandbox : ouvrir un paiement de test et simuler un succès ; le `WebhookEvent` doit être `verified = true`.
5. Clés API du PSP (création de paiement, remboursement) : même schéma ; vérifier ensuite un `createCheckout` et, avec Finance, un remboursement de 100 XAF sur une commande de test.

## 7. Stockage objet, `CRON_SECRET`, OIDC, clés API

- **Vercel Blob** : Storage → store → « Regenerate token » ; mettre à jour `BLOB_READ_WRITE_TOKEN` sur les deux projets. Les URL publiques existantes restent valides ; les URL signées privées sont régénérées à la demande (`getSignedUrl`).
- **S3 / MinIO** : créer une nouvelle paire de clés pour l'utilisateur applicatif (droits limités aux deux buckets `fetrag-public`, `fetrag-private`), déployer, révoquer l'ancienne.
- **`CRON_SECRET`** : nouvelle valeur sur les deux projets ; Vercel l'injecte automatiquement dans les appels planifiés. Vérifier qu'un appel manuel avec l'ancienne valeur renvoie `401`.
- **OIDC** : régénérer le secret client dans l'IdP, mettre à jour `OIDC_CLIENT_SECRET` sur les deux projets, redéployer, tester une connexion « Se connecter avec Compte FETRAG ».
- **Clés API partenaires** (`SystemSetting` clé `api.keys`) : depuis `/admin` (Paramètres → Clés API) ou en SQL, ajouter la nouvelle clé avec sa date d'expiration, prévenir le partenaire, supprimer l'ancienne après confirmation. Chaque usage est tracé par le `correlationId` des logs API.

## 8. Vérifications après rotation

| Contrôle | Commande / écran | Résultat attendu |
| --- | --- | --- |
| Santé | `curl https://fetrag.ga/api/health` et `https://formation.fetrag.ga/api/health` | `"ok": true`, contrôles `database` et `config` ok |
| Session / SSO | Connexion sur la vitrine puis ouverture du LMS | Aucune ressaisie |
| Cron | `curl -H "Authorization: Bearer $CRON_SECRET" https://fetrag.ga/api/cron/jobs` | `200` avec `processed`/`remaining` ; `401` avec l'ancienne valeur |
| Email | Formulaire de contact | `EmailDelivery.SENT` |
| Paiement | Checkout sandbox ou 100 XAF réels | `Payment.SUCCEEDED`, reçu généré |
| Stockage | Téléversement d'un média dans `/admin` puis affichage | Image visible ; document privé accessible par URL signée uniquement |

## 9. Avant le go-live : comptes de démonstration

Les comptes seedés (`admin@fetrag.ga`... mot de passe `Fetrag2026!`) n'existent que pour la recette. Avant l'ouverture au public : changer les mots de passe de chaque compte de rôle réellement utilisé (via `/espace/securite` → « Modifier le mot de passe », ou `hashPassword` de `@fetrag/auth` dans un script), activer la MFA (`/espace/securite`) pour SUPER_ADMIN, COORDINATOR, FINANCE et EDITOR, désactiver (`isActive = false`) les comptes `apprenantN@demo.fetrag.ga` et `responsable@synatep-demo.ga`, et passer `FEATURE_LOCAL_AUTH=false` dès que l'IdP OIDC est branché (ADR-002).
