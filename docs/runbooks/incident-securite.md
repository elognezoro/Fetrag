# Runbook - Incident de sécurité

| | |
| --- | --- |
| Exigences couvertes | SEC-01 à SEC-10, SHR-07 (audit), chapitre 28 (journal d'incident et post-mortem) |
| Rôles | Responsable de l'incident (Super administrateur ou exploitant désigné), Finance (si paiements), Support (communication), Secrétariat général (décisions et communication externe), conseil juridique (obligations de notification) |
| Documents liés | `rotation-secrets.md`, `restauration-base.md`, `supervision.md`, `docs/architecture/SECURITY.md` |

## 1. Classification

| Niveau | Exemples | Délai de prise en charge |
| --- | --- | --- |
| **P1 - critique** | Accès non autorisé confirmé à la base, fuite de données personnelles, compromission d'un compte SUPER_ADMIN / FINANCE, paiements détournés, défacement du site | Immédiat, 24 h/24 |
| **P2 - majeur** | Vulnérabilité exploitable découverte (injection, contournement d'autorisation), compte privilégié sans MFA utilisé depuis une origine inconnue, force brute massive, webhook forgé | < 4 h en heures ouvrées |
| **P3 - mineur** | Tentatives de connexion échouées répétées, scan de vulnérabilités, dépendance vulnérable sans exploitation connue, signalement externe non confirmé | < 2 jours ouvrés |

## 2. Signaux et où les lire

| Signal | Source |
| --- | --- |
| Connexions échouées en rafale | `SELECT "actorEmail", count(*) FROM "AuditLog" WHERE action = 'auth.login_failed' AND "createdAt" > now() - interval '1 hour' GROUP BY 1 ORDER BY 2 DESC;` |
| Attribution / retrait de rôle inattendu | `AuditLog` actions `role.granted`, `role.revoked` (acteur, entité, avant/après) |
| Modification de paramètres | `AuditLog` action `settings.updated` |
| Webhooks rejetés (signature invalide) | `WebhookEvent` avec `verified = false` |
| Exports de données | `AuditLog` action `export.generated` |
| Erreurs 5xx ou 403 anormales | Logs Vercel (filtre `level:error`, `correlationId`) |
| Vérifications de certificats massives | `CertificateVerificationEvent` par `ipHash` |
| Alerte dépendances | `pnpm audit` en CI, alertes GitHub Dependabot |

Les logs applicatifs sont JSON et **caviardés** (`password`, `secret`, `token`, `authorization`, `cookie`, `card`, `otp`... remplacés par `[redacted]`) : ils ne contiennent ni mot de passe ni jeton. Les adresses IP ne sont stockées que hachées (`hashIp`).

## 3. Réponse en cinq étapes

### 3.1 Détecter et qualifier (responsable de l'incident)

1. Ouvrir le journal d'incident (modèle en section 6) : horodatage UTC, découvreur, symptôme, niveau provisoire.
2. Préserver les preuves avant toute correction : exporter les entrées `AuditLog` et `WebhookEvent` de la fenêtre concernée (`\copy` psql vers un fichier chiffré), capturer les logs Vercel (Logs → « Download »), noter les `correlationId`.
3. Ne pas redémarrer, ne pas supprimer de données, ne pas « nettoyer » le dépôt tant que les preuves ne sont pas conservées.

### 3.2 Contenir

Selon le vecteur :

- **Compte compromis** : `UPDATE "User" SET "isActive" = false WHERE email = '...'` (ou `/admin` → Utilisateurs → Désactiver) ; retirer les `RoleAssignment` privilégiés ; les sessions JWT existantes restent valides jusqu'à 14 jours → **faire tourner `AUTH_SECRET`** (`rotation-secrets.md`, section 3) pour invalider toutes les sessions si le compte était privilégié.
- **Secret exposé** (commit, capture d'écran, ticket) : rotation immédiate du secret concerné, puis de ceux accessibles depuis lui (une chaîne de base exposée implique aussi la rotation des clés de stockage si elles figurent dans la même source).
- **Vulnérabilité applicative exploitable** : désactiver la fonctionnalité par feature flag (`FEATURE_PAYMENTS`, `FEATURE_FORUMS`, `FEATURE_NEWSLETTER`) ou rediriger la route concernée depuis `middleware.ts` vers une page d'indisponibilité ; à défaut, revenir au déploiement précédent (Vercel → Deployments → « Promote to Production » sur le dernier déploiement sain).
- **Force brute** : le limiteur de débit en mémoire (`checkRateLimit`, SEC-04) borne les tentatives par instance ; ajouter au besoin une règle de pare-feu Vercel (Firewall → Rules) sur l'IP ou le pays, temporaire.
- **Défacement / contenu malveillant** : passer les contenus concernés en `DRAFT` via `publishing.transition`, retirer les médias du stockage, invalider les caches (redéploiement).
- **Fuite de données** : identifier le périmètre (tables, volume, catégories de personnes), couper l'accès (rotation base + stockage), passer au 3.4.

### 3.3 Éradiquer et restaurer

1. Corriger la cause (correctif de code via PR revue, mise à jour de dépendance, configuration).
2. Vérifier l'intégrité des données : comparer avec la dernière sauvegarde saine ; si des données ont été altérées, `restauration-base.md` (restauration ciblée ou PITR).
3. Rotation complète des secrets si l'attaquant a pu lire l'environnement (`rotation-secrets.md`, section 1 : tout l'inventaire).
4. Redéployer, puis dérouler la recette de sécurité minimale : connexion + MFA d'un compte privilégié, tentative d'accès croisé entre deux organisations (doit renvoyer `/acces-refuse`), webhook sans signature (doit être rejeté), en-têtes de sécurité (`curl -I https://fetrag.ga` : HSTS, CSP, `X-Frame-Options: DENY`).

### 3.4 Notifier

- **Interne** : Secrétariat général et Finance dès la qualification P1/P2.
- **Personnes concernées** : en cas de fuite de données personnelles, informer les utilisateurs touchés (nature des données, mesures prises, recommandations : changer de mot de passe, vigilance) dans les meilleurs délais. Le texte est validé par le Secrétariat général et le conseil juridique.
- **Autorités** : la FETRAG fait valider par son conseil les obligations de notification applicables au droit gabonais (protection des données personnelles) et, le cas échéant, dépose plainte. Ce runbook ne présume pas des délais légaux exacts (CDC, chapitre 23).
- **Prestataires** : PSP (paiements suspects), Neon / Vercel (support, si l'infrastructure est en cause), IdP OIDC.
- **Utilisateurs en général** : message de statut sobre si le service a été interrompu ; ne pas publier de détails techniques exploitables.

### 3.5 Clôturer et apprendre

1. Post-mortem sous 10 jours ouvrés (modèle en section 6) : chronologie, cause racine, ce qui a bien / mal fonctionné, actions correctives avec responsables et échéances.
2. Ajouter les actions au `docs/BACKLOG.md` (rubrique Sécurité) et, si l'architecture change, rédiger un ADR.
3. Mettre à jour `SECURITY.md` (état des exigences) et ce runbook si la procédure a montré des manques.

## 4. Vérifications de routine (prévention)

| Fréquence | Contrôle |
| --- | --- |
| À chaque PR | CI verte : lint, typecheck, tests (dont tests d'autorisation négatifs), `pnpm audit --audit-level high` |
| Hebdomadaire | Revue des `auth.login_failed`, des `role.granted`, des webhooks non vérifiés ; alertes Dependabot |
| Mensuelle | Liste des comptes privilégiés (SUPER_ADMIN, COORDINATOR, FINANCE, EDITOR) et de leur MFA ; comptes inactifs depuis 6 mois à désactiver ; clés API et leurs expirations |
| Trimestrielle | Exercice de restauration ; revue des accès Vercel / Neon / GitHub (moindre privilège) ; rotation des secrets arrivés à échéance |
| Avant go-live et après changement majeur | Revue de sécurité indépendante (SEC-10) : test d'intrusion ciblé sur authentification, autorisations croisées, paiements, uploads |

## 5. Contacts (à compléter au cadrage)

| Fonction | Contact |
| --- | --- |
| Responsable de l'incident (astreinte) | à renseigner |
| Secrétariat général FETRAG | jossngomafm@gmail.com · 066 23 00 33 · 077 52 27 98 |
| Conseil juridique | à renseigner |
| Support Vercel / Neon | consoles respectives (plan payant requis pour un support prioritaire) |
| PSP | à renseigner au choix du prestataire |

## 6. Modèles

**Journal d'incident** (un fichier par incident, hors dépôt public) :

```
Référence : INC-AAAA-NN
Niveau : P1 / P2 / P3
Ouvert le (UTC) : ... par : ...
Symptôme initial : ...
Périmètre (services, données, personnes) : ...
Chronologie (UTC) :
  - HH:MM détection ...
  - HH:MM containment ...
Preuves conservées : (chemins des exports chiffrés, correlationIds)
Secrets tournés : (liste, sans valeurs)
Notifications effectuées : (interne / personnes / autorités / prestataires)
Clôturé le : ...
```

**Post-mortem** : contexte, impact (durée, utilisateurs, données), cause racine, facteurs contributifs, détection (comment, délai), réponse (ce qui a fonctionné, ce qui a manqué), actions correctives (quoi, qui, quand), leçons.
