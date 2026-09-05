# Guide du support (SUPPORT)

Le support assure le premier niveau d'assistance aux visiteurs, utilisateurs, apprenants et responsables d'organisation, et le diagnostic des incidents fonctionnels, **sans accès excessif au dossier pédagogique** (chapitre 5 du CDC). Compte de démonstration : `support@fetrag.ga`.

## 1. Périmètre et droits

| Le support peut | Le support ne peut pas |
| --- | --- |
| Consulter les comptes (identité, rôles, statut, dernière connexion, MFA activée) | Modifier les rôles, désactiver un compte (Super administrateur) |
| Lire les formulaires reçus (contact, assistance, adhésion, partenariat) et les demandes de service, changer leur statut, ajouter des notes | Traiter le fond d'une demande de service (Responsable services) |
| Voir l'état des envois d'emails et des notifications d'un utilisateur, renvoyer un email | Lire les réponses aux évaluations, les dépôts de devoirs, noter |
| Consulter les organisations (fiche, responsables) | Émettre / révoquer un certificat, décider une demande de formation (Coordination) |
| Voir l'état d'une commande et d'un paiement | Rembourser, confirmer un paiement hors ligne (Finance) |
| Consulter les statistiques d'usage | Accéder au journal d'audit complet (Super administrateur, Finance) |

Chaque consultation reste tracée dans les logs applicatifs ; n'ouvrez que les dossiers nécessaires au ticket en cours.

## 2. Écrans

- Vitrine : `https://fetrag.ga/admin` → **Assistance** (formulaires reçus, filtre « Assistance »), **Utilisateurs** (lecture), **Commandes** (lecture), **Système → Emails** (livraisons).
- LMS : `https://formation.fetrag.ga/admin` → **Utilisateurs et rôles** (lecture), **Organisations** (lecture) ; `https://formation.fetrag.ga/coordination` en lecture pour l'état des demandes et cohortes.
- Santé : `https://fetrag.ga/api/health`, `https://formation.fetrag.ga/api/health`.

## 3. Traiter une demande d'assistance

1. `https://fetrag.ga/admin` → Formulaires → filtre **Assistance** (statut « Nouvelle »). Chaque demande contient : nom, email, téléphone, organisation, message, date, accusé de réception envoyé (oui / non).
2. Prendre en charge : « M'assigner », statut « En cours ».
3. Diagnostiquer avec les fiches de la section 4 ; noter les vérifications faites dans « Notes internes ».
4. Répondre à l'utilisateur depuis la messagerie du support (pas depuis la plateforme dans cette version) en citant la référence du formulaire.
5. Clore : statut « Traitée » (ou « Sans suite » si aucune réponse de l'utilisateur après relance). Si le problème dépasse le support, escalader (section 5) et laisser le ticket « En cours » avec la référence de l'escalade.

Délai cible : première réponse sous 1 jour ouvré, résolution sous 2 jours ouvrés.

## 4. Fiches de diagnostic

### 4.1 « Je n'arrive pas à me connecter »

1. Vérifier le compte (`/admin` → Utilisateurs) : existe-t-il ? Est-il **actif** ? L'email saisi est-il celui du compte (fautes, majuscules) ?
2. Message « Identifiants invalides » : proposer « Mot de passe oublié ? » sur `https://fetrag.ga/mot-de-passe-oublie`. Vérifier ensuite que l'email de réinitialisation est parti (`/admin` → Système → Emails, filtrer par destinataire ; statut `SENT`). S'il est `FAILED`, appliquer la section 4.4.
3. Message « Code de vérification » demandé : la MFA est activée sur ce compte. L'utilisateur doit utiliser son application TOTP ou un code de secours. Perte totale : escalade au Super administrateur (réinitialisation MFA), après vérification d'identité (rappel de l'organisation, du téléphone enregistré).
4. « Compte désactivé » : escalade au Super administrateur avec le motif de la demande.
5. Trop de tentatives (message d'attente) : le limiteur de débit bloque quelques minutes ; inviter à réessayer plus tard.
6. Connecté sur `fetrag.ga` mais redemandé sur `formation.fetrag.ga` : normal en recette (adresses `*.vercel.app`) ; en production, escalade à l'exploitant (cookie de domaine `.fetrag.ga`).

### 4.2 « Je ne vois pas ma formation / mon inscription »

1. `/admin` → Utilisateurs → fiche → onglet Inscriptions : statut (`En attente` = attend la validation de la coordination ; `Active` ; `Suspendue` ; `Expirée`).
2. `En attente` sur un cours payant : la commande est-elle payée ? (`/admin` → Commandes, référence `CMD-...`). Si le paiement est `PENDING` depuis plus d'une heure, voir 4.5.
3. Cours réservé à une organisation : l'utilisateur doit passer par son responsable (demande institutionnelle) ; vérifier dans `/coordination` → Demandes que la demande est `Planifiée` et que le participant y figure (email identique).
4. Aucun problème apparent : demander une capture d'écran et l'heure, puis escalade Coordination.

### 4.3 « Ma progression / mon quiz n'a pas été enregistré »

1. Demander le cours, la leçon, l'heure et le type de connexion (mobile, faible débit).
2. Sans accès aux réponses, le support vérifie seulement l'inscription (active) et la santé de la plateforme (`/api/health`, pas d'incident en cours).
3. Rassurer : la progression est idempotente et rejouée automatiquement au retour du réseau ; une tentative de quiz soumise apparaît dans les résultats de l'apprenant sous une minute.
4. Si le problème persiste : escalade Formateur / Coordination (ils voient les tentatives) avec les éléments recueillis.

### 4.4 « Je n'ai pas reçu l'email »

1. `/admin` → Système → Emails : rechercher le destinataire. Statuts : `SENT` (parti : demander de vérifier les indésirables), `QUEUED` (en attente de la tâche de fond : jusqu'à 5 minutes), `FAILED` (erreur du fournisseur : bouton « Renvoyer »), `SKIPPED` (email marketing sans consentement : normal).
2. Vérifier l'adresse enregistrée (faute de frappe) ; la correction se fait par l'utilisateur dans `/espace/profil` ou par le Super administrateur.
3. Plusieurs `FAILED` pour des destinataires différents : incident email → escalade exploitant (`docs/runbooks/panne-email.md`).
4. Rappeler que les informations sont aussi disponibles dans la plateforme : notifications (`/espace/notifications`), reçus (`/espace/paiements`), convocations (`/calendrier`), certificats (`/certificats`).

### 4.5 « J'ai payé mais rien ne se passe »

1. `/admin` → Commandes → rechercher par email ou référence `CMD-...` : statut de la commande (`En attente`, `Payée`, `Échouée`) et du paiement (`Initié`, `En attente de confirmation`, `Réussi`, `Échoué`).
2. `En attente de confirmation` depuis moins de 15 minutes : le PSP n'a pas encore notifié ; le rapprochement automatique interroge le PSP toutes les 5 minutes après ce délai. Inviter à patienter et à consulter `/espace/paiements/<commande>`.
3. `En attente` depuis plus d'une heure alors que l'utilisateur a une preuve de débit (SMS de l'opérateur) : escalade **Finance** avec la référence de la commande et la preuve ; ne jamais promettre une confirmation manuelle.
4. `Échoué` : l'utilisateur peut « Reprendre le paiement » depuis la page de la commande (`https://fetrag.ga/paiement/<commande>`). En cas de double débit : escalade Finance (remboursement).
5. Reçu introuvable : il est généré quelques minutes après le paiement ; s'il manque après 30 minutes, escalade exploitant (`docs/runbooks/jobs-bloques.md`).

### 4.6 « Mon certificat est introuvable / la vérification échoue »

1. Le certificat est émis par la coordination une fois les conditions remplies (pas automatiquement à la fin du cours dans tous les cas) : vérifier l'état de la cohorte dans `/coordination` (lecture).
2. La vérification publique (`https://fetrag.ga/certificats/verifier/<code>`) exige le code exact (format `XXXX-XXXX-XXXX`) ; un résultat « Introuvable » signifie une faute de saisie ou un document non émis par la FETRAG.
3. Statut « Révoqué » : orienter vers la coordination (contestation) ; le support ne commente pas le motif.
4. PDF « en préparation » depuis plus de 30 minutes : escalade exploitant (`jobs-bloques.md`).

### 4.7 « Je veux modifier / supprimer mes données »

- Modification : `/espace/profil` par l'utilisateur ; sinon Super administrateur.
- Consentements (newsletter, communications) : `/espace/profil` → préférences ; désinscription newsletter par le lien en pied d'email.
- Demande d'accès ou d'effacement : transmettre au Super administrateur et au Secrétariat général (procédure validée par le conseil juridique de la FETRAG) ; les certificats, paiements et journaux d'audit sont conservés selon les obligations légales même après désactivation du compte.

## 5. Escalade

| Sujet | Vers | Canal |
| --- | --- | --- |
| Rôles, MFA, désactivation, paramètres | Super administrateur | ticket interne + `admin@fetrag.ga` (recette) |
| Demandes de formation, cohortes, certificats, inscriptions | Coordination | `coordination@fetrag.ga` |
| Notes, dépôts, corrections, forums | Formateur de la cohorte, puis Coordination | via `/coordination` → cohorte → formateur |
| Paiements, remboursements, reçus | Finance | `finance@fetrag.ga` |
| Demandes de service (fond) | Responsable services | `services@fetrag.ga` |
| Contenus du site, actualités | Éditeur | `editeur@fetrag.ga` |
| Panne, lenteur, emails en échec massif, jobs, sécurité | Exploitant | astreinte définie dans `docs/runbooks/incident-securite.md` (section 5) |

Un incident touchant plusieurs utilisateurs (impossible de se connecter, site indisponible, aucun email) est signalé immédiatement à l'exploitant, puis une information est publiée si la panne dépasse 30 minutes (bandeau CMS par l'éditeur, message sur les réseaux de la FETRAG).

## 6. Rappels

- Ne jamais demander ni accepter un mot de passe ; ne jamais saisir un code MFA à la place de l'utilisateur.
- Vérifier l'identité avant toute action sur un compte (email enregistré, organisation, téléphone).
- Consigner chaque ticket (référence, diagnostic, action, escalade) ; les tickets récurrents alimentent la FAQ (`https://fetrag.ga/faq`, mise à jour par l'éditeur) et le `docs/BACKLOG.md`.
