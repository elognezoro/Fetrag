# Guide de la coordination formation

*Instruire les demandes, planifier les cohortes, animer et certifier*

Plateforme : plateforme de formation formation.fetrag.ga · Rôle : COORDINATOR · Version 1.0 du 2026-09-12 · Lecture : 55 min · 23 sections, 94 étapes.

Version en ligne : https://formation.fetrag.ga/coordination/guide

**À qui s'adresse ce guide ?** Les coordinatrices et coordinateurs formation de la Fédération (rôle « Coordinateur formation ») qui pilotent le programme de formation sur la plateforme : instruction des demandes des organisations, cours, cohortes, sessions, présences, certificats, organisations et rapports.

Vous instruisez les demandes de formation des organisations affiliées, puis vous les transformez en cohortes avec des sessions, un formateur et un suivi de l’assiduité. Vous construisez les cours, publiez leurs versions, émettez les certificats et suivez les indicateurs du programme. Votre travail relie une demande institutionnelle à la remise d’une attestation, en gardant la trace de chaque décision.

## Avant de commencer

- Un compte FETRAG dont l’adresse email est confirmée, avec le rôle **Coordinateur formation** attribué par le super administrateur.
- Le même compte ouvre le site institutionnel et la plateforme de formation (une seule connexion pour les deux).
- Une application d’authentification installée sur votre téléphone (par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP) pour la vérification en deux étapes, à activer sur le site.
- Un téléphone ou un ordinateur connecté à Internet, avec un navigateur récent.

## Prise en main en cinq minutes

1. Connectez-vous à la plateforme avec votre adresse email et votre mot de passe.
   - Élément : `Se connecter` (bouton en haut à droite ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits))
   - Résultat attendu : Votre avatar (vos initiales) apparaît en haut à droite.
2. Ouvrez votre espace de coordination.
   - Élément : `Coordination` (menu de votre compte (cliquez sur votre avatar en haut à droite), ligne **Coordination**)
   - Résultat attendu : Le tableau de bord « Coordination formation » s’affiche avec le menu de gauche : Tableau de bord, Demandes, Cohortes, Sessions, Certificats, Organisations, Rapports.
3. Regardez la case **Demandes à traiter** et les points de vigilance.
   - Où : en haut du tableau de bord
   - Résultat attendu : Vous voyez le nombre de demandes en attente et, le cas échéant, une alerte orange « points de vigilance ».
4. Ouvrez la première demande à instruire.
   - Élément : `Instruire` (section « Demandes à traiter » du tableau de bord, ou menu de gauche › **Demandes**)
   - Résultat attendu : La fiche de la demande s’ouvre avec le panneau « Décision de la coordination ».
5. Pour bâtir un cours, passez dans l’espace Administration.
   - Élément : `Administration` (menu de votre compte (avatar en haut à droite), ligne **Administration**)
   - Résultat attendu : La page « Administration LMS » s’affiche avec les rubriques Cours, Banque de questions, Modèles de certificats.

## Sommaire

1. [Votre rôle en bref](#votre-role)
2. [Avant de commencer : compte, connexion et sécurité](#avant-de-commencer)
3. [Se repérer dans vos espaces](#se-reperer)
4. [Comprendre le cycle d’une formation](#comprendre-le-cycle)
5. [Comment instruire une demande de formation](#traiter-une-demande)
6. [Comment créer une cohorte manuellement](#creer-une-cohorte)
7. [Comment piloter une cohorte](#piloter-une-cohorte)
8. [Comment planifier une session et convoquer](#planifier-les-sessions)
9. [Comment émarger une session](#emarger-une-session)
10. [Comment valider les inscriptions et gérer leurs statuts](#valider-les-inscriptions)
11. [Comment clôturer une cohorte et émettre les certificats](#cloturer-et-certifier)
12. [Comment gérer le registre des certificats](#gerer-les-certificats)
13. [Comment gérer les organisations et leurs gestionnaires](#gerer-les-organisations)
14. [Comment créer, structurer et publier un cours](#creer-un-cours)
15. [Comment gérer la banque de questions](#banque-de-questions)
16. [Comment configurer les modèles de certificats](#modeles-de-certificats)
17. [Comment désigner un formateur](#designer-des-formateurs)
18. [Comment produire un rapport et l’exporter](#produire-des-rapports)
19. [Notifications et emails que vous recevez](#notifications)
20. [Bonnes pratiques et sécurité](#bonnes-pratiques)
21. [Questions fréquentes](#questions-frequentes)
22. [Lexique](#lexique)
23. [Besoin d’aide ?](#besoin-d-aide)

## 1. Votre rôle en bref <a id="votre-role"></a>

*Ce que la plateforme vous permet de faire, ce qu’elle vous interdit, et avec qui vous travaillez.*

Le rôle **Coordinateur formation** pilote le programme de formation de la Fédération. Vous recevez les demandes des organisations affiliées, vous décidez de leur suite, vous les transformez en **cohortes** (groupes de participants qui suivent la même formation ensemble), vous planifiez les **sessions**, vous suivez l’assiduité et vous délivrez les **certificats** et **attestations**. Vous construisez aussi les cours et publiez leurs versions dans l’espace Administration.

### Ce que vous pouvez faire

- [x] Instruire une demande de formation : demander un complément, accepter, proposer une autre date, refuser, ou la planifier en cohortes.
- [x] Créer des cohortes, y inscrire des participants, désigner un formateur, planifier des sessions et convoquer.
- [x] Émarger une session (saisir les présences) pour n’importe quelle cohorte.
- [x] Clôturer une cohorte et émettre les certificats des participants éligibles ; révoquer un certificat avec un motif.
- [x] Créer et modifier des organisations affiliées, y rattacher des gestionnaires.
- [x] Construire les cours (modules, leçons, activités), publier leurs versions et les rendre visibles au catalogue.
- [x] Gérer la banque de questions, les modèles de certificats et consulter les rapports et exports.
- [x] Attribuer le rôle **Formateur** à un compte, sur un cours ou une cohorte.

### Ce que vous ne pouvez pas faire

- Créer un compte, activer ou désactiver un compte, attribuer les autres rôles (hors Formateur), réinitialiser la vérification en deux étapes d’une personne : réservé au super administrateur.
- Modifier les paramètres du système ni rembourser une commande : réservé à la super administration et au rôle Finance.
- Déposer une demande de formation à la place d’une organisation : c’est le gestionnaire de l’organisation qui la dépose.
- Publier ou modifier les pages et actualités du site institutionnel : réservé à l’éditeur communication.

> **Deux espaces, un seul compte** : Votre travail se répartit entre l’espace **Coordination** (demandes, cohortes, sessions, certificats, organisations, rapports) et l’espace **Administration** (cours, questions, modèles). Vous passez de l’un à l’autre par le menu de votre compte, sans vous reconnecter.

*Avec qui vous travaillez*

| Rôle | Ce qu’il fait | Quand le solliciter |
| --- | --- | --- |
| Gestionnaire d’organisation | Dépose les demandes de formation de son organisation, suit ses participants et ses rapports. | Une demande incomplète (« Demander un complément »), un participant à ajouter, un rapport d’organisation à commenter. |
| Formateur | Anime les cohortes, corrige les devoirs et compositions, saisit les présences. | Une cohorte à animer, une correction en attente, un émargement à faire par la personne sur place. |
| Super administrateur | Crée les comptes, attribue les rôles (hors Formateur), règle les paramètres, traite les jobs. | Un compte à créer, un rôle autre que Formateur à attribuer, un paramètre à modifier. |
| Rôle Finance / contrôle | Gère les commandes, les paiements et les remboursements des cours payants. | Une commande ou un remboursement lié à une inscription payante. |

## 2. Avant de commencer : compte, connexion et sécurité <a id="avant-de-commencer"></a>

*Se connecter, activer la vérification en deux étapes, régler l’accès refusé, se déconnecter.*

Vous utilisez votre compte FETRAG habituel : celui du site institutionnel ouvre aussi la plateforme de formation. Le rôle de coordination fait partie des rôles sensibles : selon le réglage de sécurité en vigueur, une **vérification en deux étapes** peut vous être demandée à la connexion.

### Se connecter <a id="se-connecter"></a>

1. Ouvrez la plateforme et cliquez sur `Se connecter`.
   - Où : bouton en haut à droite ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits) en haut à droite
   - Résultat attendu : Le formulaire de connexion s’affiche.
2. Saisissez votre **Adresse email** puis votre **Mot de passe**. Les deux champs sont obligatoires.
   - Remarque : Le bouton « Afficher le mot de passe » permet de vérifier ce que vous tapez.
3. Cliquez sur `Se connecter`.
   - Résultat attendu : Votre avatar (vos initiales) remplace le bouton `Se connecter` en haut à droite.

> **Mot de passe oublié** : Cliquez sur `Mot de passe oublié ?` sous le formulaire. Un lien de réinitialisation est envoyé à votre adresse email. Un mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.

### Activer la vérification en deux étapes <a id="activer-la-verification-en-deux-etapes"></a>

La **vérification en deux étapes** (aussi appelée MFA) ajoute un **code temporaire** à six chiffres, en plus du mot de passe. Elle s’active depuis le site institutionnel, dans votre espace de sécurité, et protège votre compte même si votre mot de passe est connu.

1. Installez une application d’authentification sur votre téléphone.
   - Remarque : Par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP. Elle affiche un code qui change toutes les 30 secondes.
2. Ouvrez la page de sécurité de votre compte sur le site institutionnel.
   - Élément : `Activer la vérification sur fetrag.ga` (bouton de la page « Vérification en deux étapes » ; ou menu du compte › **Sécurité** sur le site)
   - Résultat attendu : La page « Sécurité » s’ouvre sur le site.
3. Scannez le QR code avec l’application, puis conservez précieusement les **codes de secours** affichés.
   - Résultat attendu : Le badge « MFA active » apparaît sur votre compte.
   - Remarque : Les codes de secours servent à vous connecter si vous perdez votre téléphone. Notez-les hors de l’appareil.
4. À la prochaine connexion, saisissez le **Code de vérification** (six chiffres) affiché par l’application.
   - Résultat attendu : La connexion aboutit.

> **Téléphone perdu** : Si vous perdez votre téléphone et vos codes de secours, vous ne pourrez plus vous connecter. Seul le super administrateur peut réinitialiser votre vérification en deux étapes. Contactez-le sans tarder.

### Accès refusé et déconnexion <a id="acces-refuse-et-deconnexion"></a>

Si une page vous répond « Accès refusé », c’est que votre compte n’a pas le droit nécessaire. La page indique en tant que qui vous êtes connecté et propose de contacter la coordination. Vérifiez d’abord que vous êtes connecté avec le bon compte.

1. Pour changer de compte, cliquez sur `Changer de compte` sur la page « Accès refusé ».
   - Résultat attendu : Vous êtes déconnecté et pouvez vous reconnecter avec un autre compte.
2. Pour vous déconnecter normalement, ouvrez le menu de votre compte et cliquez sur `Déconnexion`.
   - Où : avatar en haut à droite (« Menu de {votre nom} ») ; sur mobile, en bas du tiroir « Menu de navigation »
   - Résultat attendu : Vous revenez à la page d’accueil, déconnecté.

> **Appareil partagé** : Déconnectez-vous toujours après votre travail sur un ordinateur ou un téléphone partagé. Votre compte donne accès à des données personnelles de participants et d’organisations.

#### Si ça ne marche pas

- **Le message « Votre session a expiré : reconnectez-vous pour continuer. » s’affiche.** (cause probable : Vous êtes resté inactif trop longtemps ou la connexion a été coupée.) : Reconnectez-vous, puis reprenez votre action. Ce qui n’était pas enregistré est à ressaisir.
- **Le message « Accès refusé » s’affiche alors que vous êtes coordination.** (cause probable : Vous êtes peut-être connecté avec un autre compte, ou le rôle n’a pas encore été attribué.) : Vérifiez votre adresse dans le menu du compte. Si elle est correcte, demandez l’attribution du rôle au super administrateur.

## 3. Se repérer dans vos espaces <a id="se-reperer"></a>

*Le tableau de bord de coordination, l’espace Administration et la navigation sur ordinateur comme sur mobile.*

### Écran : Le tableau de bord « Coordination formation »

Ce que vous voyez en ouvrant l’espace Coordination.

- **Menu de gauche « Coordination »** : Vos rubriques : Tableau de bord, Demandes, Cohortes, Sessions, Certificats, Organisations, Rapports. Un badge sur **Demandes** indique le nombre de demandes en attente.
- **Barre du haut** : Le titre « Coordination » et, sur grand écran, le commutateur `Changer d’espace` (Apprenant, Organisation, Formateur, Coordination, Administration).
- **Boutons d’en-tête** : Raccourcis `Traiter les demandes` et `Nouvelle cohorte`.
- **Tuiles d’indicateurs** : Demandes à traiter, cohortes en cours, apprenants actifs, certificats émis ce mois.
- **Alerte « Points de vigilance »** : Encadré orange listant les demandes en retard, les cohortes sans formateur, les sessions sans émargement, les participants sans certificat. Chaque ligne est un lien.
- **Cartes « Sessions du jour », « Demandes par statut », « Derniers certificats »** : Aperçus cliquables du travail en cours.

### Écran : L’espace « Administration LMS »

Où vous construisez les cours, la banque de questions et les modèles de certificats.

- **Menu de gauche « Administration »** : Vue d’ensemble, Cours, Banque de questions, Modèles de certificats, Utilisateurs et rôles, Paramètres, Journal d’audit.
- **Boutons d’en-tête** : Raccourcis `Nouveau cours` et `Nouvelle question`.
- **Section « Accès rapides »** : Cartes vers chaque rubrique avec un lien « Ouvrir ».

> **Sur mobile** : Le menu de gauche est masqué : ouvrez-le avec le bouton **Ouvrir le menu** (trois traits) en haut à gauche de la barre de l’espace, et refermez-le avec « Fermer le menu ». Le commutateur `Changer d’espace` n’apparaît pas : passez d’un espace à l’autre par le menu de votre compte (avatar en haut à droite) ou par le pied du menu de gauche.

Passer à l’espace Administration : Avatar en haut à droite › Administration (`/admin`)

## 4. Comprendre le cycle d’une formation <a id="comprendre-le-cycle"></a>

*De la demande d’une organisation à la remise des certificats : les grandes étapes et où elles se font.*

Une formation institutionnelle suit toujours le même chemin. Comprendre ce chemin vous aide à savoir où agir à chaque instant. Chaque décision est horodatée et notifiée à l’organisation.

*Les six étapes du cycle*

| Étape | Ce qui se passe | Où agir |
| --- | --- | --- |
| 1. Demande | Un gestionnaire d’organisation dépose une demande ; elle arrive dans votre file. | Menu **Demandes** |
| 2. Décision | Vous demandez un complément, acceptez, proposez une autre date ou refusez. | Fiche de la demande, panneau « Décision de la coordination » |
| 3. Planification | Vous transformez la demande acceptée en cohortes ; les comptes et inscriptions sont créés. | Décision `Planifier` |
| 4. Sessions | Vous planifiez les séances et envoyez les convocations. | Fiche de cohorte, onglet **Sessions** |
| 5. Suivi | Le formateur (ou vous) émarge ; la progression et l’assiduité se calculent. | Espace Formateur, onglet **Présence** |
| 6. Certificats | Vous clôturez la cohorte et émettez les certificats des éligibles. | Fiche de cohorte, `Clôturer` puis onglet **Certificats** |

> **Le fil rouge** : La demande passe automatiquement à « Formation en cours » quand vous démarrez la cohorte, et à « Terminée » quand vous la clôturez. Vous n’avez pas à mettre à jour la demande à la main après la planification.

## 5. Comment instruire une demande de formation <a id="traiter-une-demande"></a>

*Ouvrir une demande, vérifier le dossier, puis choisir une décision et la planifier.*

Une **demande de formation** est déposée par le gestionnaire d’une organisation : elle liste les modules souhaités, les participants et une période. Votre file les présente des plus anciennes aux plus récentes. Le badge de la rubrique **Demandes** compte celles qui attendent une action.

### Ouvrir et lire une demande <a id="ouvrir-et-lire-une-demande"></a>

1. Ouvrez la rubrique **Demandes**.
   - Où : menu de gauche de l’espace Coordination
   - Résultat attendu : La file des demandes s’affiche avec une barre de filtres.
2. Au besoin, filtrez par **Statut** ou **Organisation**, ou tapez une référence dans **Recherche**.
   - Remarque : La recherche porte sur la référence, le nom du contact et le nom de l’organisation. Il n’y a pas de filtre par période.
3. Cliquez sur `Instruire` sur la ligne voulue, ou sur la référence.
   - Résultat attendu : La fiche de la demande s’ouvre.
4. Vérifiez le dossier : organisation, personne ressource, modules demandés, participants, préférences de date et de modalité, pièces jointes, historique.
   - Remarque : Une pièce jointe s’ouvre par le bouton `Ouvrir` : le lien reste valable 15 minutes.

> **Modules non planifiables** : Si un encadré signale que des modules ne sont pas publiés ou n’ont pas de version publiée, vous ne pourrez pas planifier la demande. Publiez d’abord une version de ces cours depuis l’espace Administration.

### Choisir une décision <a id="choisir-une-decision"></a>

Le panneau **Décision de la coordination**, en haut de la fiche, ne propose que les décisions autorisées à ce stade. Choisissez un **Type de décision**, remplissez les champs qui apparaissent, puis validez avec le bouton qui porte le nom de la décision.

1. Pour réclamer des précisions, choisissez `Demander un complément` et écrivez ce qui manque dans **Informations attendues** (obligatoire, 3000 caractères au plus).
   - Résultat attendu : La demande passe à « Complément demandé » ; l’organisation reprend l’assistant et retransmet.
2. Pour retenir la demande, choisissez `Accepter` (commentaire facultatif).
   - Résultat attendu : La demande passe à « Acceptée » : il reste à la planifier.
3. Pour proposer un autre calendrier, choisissez `Proposer une autre date`, renseignez la **Date proposée** (obligatoire) et la **Modalité**.
   - Résultat attendu : La demande passe à « Autre date proposée » ; l’organisation accepte la proposition ou annule.
4. Pour écarter la demande, choisissez `Refuser` et saisissez le **Motif du refus** (obligatoire).
   - Résultat attendu : La demande passe à « Refusée » et l’organisation est informée. Ce statut est définitif.

> **Préférez le complément au refus** : Quand un dossier est seulement incomplet, utilisez `Demander un complément` plutôt que `Refuser` : l’organisation peut corriger et retransmettre, alors qu’un refus est définitif.

### Planifier une demande acceptée <a id="planifier-une-demande"></a>

La **planification** transforme une demande acceptée en cohortes. Le système crée une cohorte privée par module, crée les comptes des participants qui n’en ont pas, les inscrit, et rattache le formateur si vous en désignez un.

1. Sur une demande « Acceptée », choisissez `Planifier` dans le panneau de décision.
   - Résultat attendu : Les champs de planification apparaissent, avec l’encadré « Ce que déclenche la planification ».
2. Renseignez la **Date de démarrage** (obligatoire) et la **Modalité**.
   - Remarque : Le souhait de l’organisation est rappelé sous chaque champ.
3. Choisissez un **Formateur** ou laissez « À désigner plus tard ». Ajustez au besoin le **Nom de la cohorte**.
   - Remarque : Le nom par défaut reprend l’organisation, le module et l’année. Le formateur reste modifiable ensuite.
4. Cliquez sur `Planifier`.
   - Résultat attendu : Un message indique le nombre de cohortes créées, de participants inscrits et de comptes créés. La demande passe à « Planifiée ».

> **Participants sans adresse email** : Un participant sans adresse email ne peut pas recevoir de compte : il est ignoré à la planification et listé dans « Éléments non traités ». Complétez son adresse dans la demande avant de planifier, ou ajoutez-le ensuite depuis la fiche de la cohorte.

> **Aucun mot de passe n’est envoyé** : Les participants sans compte reçoivent un email « définissez votre mot de passe » avec un lien valable 7 jours. L’encadré affiché à l’écran (« Ce que déclenche la planification ») parle d’un « mot de passe temporaire envoyé par email » : en réalité aucun mot de passe n’est transmis, seul ce lien de création part par email. La convocation aux séances, elle, ne part pas à la planification : elle part à la création de chaque session.

### Lire les statuts d’une demande <a id="statuts-des-demandes"></a>

#### Les statuts d’une demande

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Soumise | Transmise à la coordination, en attente d’instruction. | Ouvrez-la et choisissez une décision. |
| Complément demandé | Vous attendez des précisions de l’organisation. | Patientez : l’organisation complète puis retransmet (retour à « Soumise »). |
| Acceptée | Demande retenue ; la planification reste à faire. | Utilisez `Planifier`. |
| Autre date proposée | Vous avez proposé une autre date ou modalité. | L’organisation accepte la proposition ou annule. |
| Refusée | Demande non retenue, motif transmis. Statut définitif. |  |
| Planifiée | Cohortes, comptes et inscriptions créés ; en attente du démarrage. | Complétez la cohorte puis démarrez-la. |
| Formation en cours | La cohorte liée a été démarrée. |  |
| Terminée | La cohorte liée a été clôturée. Statut final. |  |
| Annulée | Demande close sans suite. |  |

#### Si ça ne marche pas

- **Le message « Un commentaire est requis pour cette décision » s’affiche.** (cause probable : Un complément ou un refus a été choisi sans texte.) : Remplissez le champ « Informations attendues » ou « Motif du refus » avant de valider.
- **Le message « Le module « … » n’a pas de version publiée » s’affiche à la planification.** (cause probable : Un des modules demandés n’a pas de version courante publiée.) : Ouvrez ce cours dans l’espace Administration, publiez une version, puis revenez planifier.
- **Aucune décision n’est proposée (encadré « Aucune décision possible »).** (cause probable : La demande est dans un état final ou attend une action de l’organisation.) : Vérifiez le statut : rien n’est attendu de vous tant que l’organisation n’a pas répondu.

## 6. Comment créer une cohorte manuellement <a id="creer-une-cohorte"></a>

*Constituer une cohorte hors demande, choisir le module, sa version et le calendrier.*

Une **cohorte** réunit des participants sur une **version figée** d’un module, avec un formateur, des sessions et un forum. Elle naît d’une demande planifiée, ou d’une création manuelle quand il n’y a pas de demande institutionnelle.

1. Ouvrez **Cohortes** puis cliquez sur `Créer une cohorte`.
   - Où : menu de gauche › **Cohortes** ; ou bouton `Nouvelle cohorte` du tableau de bord
   - Résultat attendu : Le formulaire de création s’ouvre.
2. Choisissez le **Module (cours)** (obligatoire), puis la **Version suivie**.
   - Remarque : Par défaut, la version courante publiée. La version est figée pour toute la cohorte. Sans version publiée, la création est impossible.
3. Renseignez au besoin le **Nom**, l’**Organisation bénéficiaire**, le **Formateur**, la **Modalité**, le **Statut**, les dates de **Début** et **Fin**, la **Capacité**, le **Lieu** et une **Description**.
   - Remarque : Le nom se génère automatiquement si vous le laissez vide. La capacité vide signifie « illimité ».
4. Laissez cochée la case **Cohorte privée** si la cohorte ne doit pas apparaître au catalogue.
   - Remarque : Choisir une organisation rend automatiquement la cohorte privée.
5. Cliquez sur `Créer la cohorte`.
   - Résultat attendu : Le message « Cohorte … créée » s’affiche et la fiche de la cohorte s’ouvre.

> **Les membres s’ajoutent ensuite** : La création ne contient encore aucun participant. Ajoutez-les depuis l’onglet **Membres** de la fiche (voir « Piloter une cohorte »).

### Si ça ne marche pas

- **Le message « Ce cours n’a pas de version publiée » s’affiche.** (cause probable : Le module choisi n’a aucune version publiée.) : Publiez d’abord une version du cours dans l’espace Administration, puis recommencez.
- **Le message « La fin doit être postérieure au début » s’affiche.** (cause probable : La date de fin est avant la date de début.) : Corrigez les dates : la fin doit venir après le début.

## 7. Comment piloter une cohorte <a id="piloter-une-cohorte"></a>

*Ajouter et retirer des membres, faire évoluer le statut, suivre la progression.*

La fiche d’une cohorte réunit ses indicateurs (progression moyenne, assiduité, membres, sessions, certificats) et quatre onglets : **Membres**, **Sessions**, **Certificats** et **Paramètres**. Les boutons d’en-tête changent selon le statut.

### Ajouter et retirer des membres <a id="ajouter-et-retirer-des-membres"></a>

1. Ouvrez l’onglet **Membres** de la cohorte puis cliquez sur `Ajouter des membres`.
   - Résultat attendu : Une fenêtre de recherche des comptes s’ouvre.
2. Cherchez par nom ou email, cochez les personnes voulues, puis cliquez sur `Ajouter`.
   - Résultat attendu : Chaque membre ajouté est inscrit sur la version suivie et reçoit une notification.
   - Remarque : Cochez « Membres de … uniquement » pour limiter la liste à l’organisation de la cohorte. Les comptes se créent sur le site, ou à la planification d’une demande.
3. Pour retirer une personne, cliquez sur `Retirer` sur sa ligne et confirmez.
   - Résultat attendu : Son inscription à cette cohorte est annulée ; sa progression est conservée.

> **Cohorte fermée aux ajouts** : Une cohorte « Clôturée » ou « Annulée » n’accepte plus de nouveaux membres. Un participant est aussi ignoré si son compte est inactif ou si la capacité est atteinte.

### Faire évoluer le statut <a id="faire-evoluer-le-statut"></a>

Les boutons d’en-tête de la fiche font passer la cohorte d’un statut au suivant. Démarrer la cohorte fait passer la demande liée à « Formation en cours ».

1. Cliquez sur `Ouvrir les inscriptions` pour permettre l’ajout de membres (cohorte « Planifiée »).
   - Résultat attendu : Le statut passe à « Inscriptions ouvertes ».
2. Cliquez sur `Démarrer` quand la formation commence, puis confirmez dans le dialogue.
   - Résultat attendu : Le statut passe à « En cours » ; la demande liée passe à « Formation en cours » et les participants sont informés.
3. Cliquez sur `Rouvrir` sur une cohorte clôturée pour corriger ou ajouter des sessions.
   - Résultat attendu : La cohorte repasse « En cours ».

#### Les statuts d’une cohorte

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Planifiée | Créée, pas encore ouverte ni démarrée. | Complétez les membres et les sessions, puis ouvrez ou démarrez. |
| Inscriptions ouvertes | Accepte de nouveaux membres. | Ajoutez les participants, puis démarrez. |
| En cours | Formation démarrée ; sessions et émargements en cours. | Suivez l’assiduité, puis clôturez. |
| Clôturée | Formation terminée ; certificats émis ; plus de nouveaux membres. | Vous pouvez la rouvrir pour des corrections. |
| Annulée | Cohorte abandonnée ; inscriptions visibles mais non animée. |  |

> **Annuler une cohorte** : Le bouton `Annuler` arrête l’animation de la cohorte. Les inscriptions restent visibles mais la cohorte n’est plus suivie. Réservez cette action aux formations qui n’auront pas lieu.

### Modifier les paramètres <a id="modifier-les-parametres"></a>

1. Ouvrez l’onglet **Paramètres** de la cohorte.
   - Résultat attendu : Le formulaire de la cohorte s’affiche (sans le module ni la version, qui sont figés).
2. Modifiez le nom, l’organisation, le formateur, la modalité, les dates, la capacité, le lieu ou la description, puis cliquez sur `Enregistrer la cohorte`.
   - Résultat attendu : Le message « Cohorte mise à jour » s’affiche.

#### Si ça ne marche pas

- **Le message « Cette cohorte n’accepte plus de membres » s’affiche.** (cause probable : La cohorte est clôturée ou annulée.) : Cliquez d’abord sur `Rouvrir` si vous devez ajouter des participants.
- **Le message « Capacité de la cohorte atteinte » s’affiche à l’ajout.** (cause probable : Le nombre maximal de participants est déjà inscrit.) : Augmentez la capacité dans l’onglet Paramètres, ou retirez un membre.

## 8. Comment planifier une session et convoquer <a id="planifier-les-sessions"></a>

*Ajouter une séance à une cohorte, lier une activité, envoyer et renvoyer la convocation.*

Une **session** est une séance datée d’une cohorte (présentiel, classe virtuelle ou hybride). Les sessions se créent depuis la fiche de chaque cohorte, puis apparaissent dans le planning global, le calendrier des membres et le tableau de bord. Les heures sont en heure de Libreville.

1. Ouvrez la fiche de la cohorte, onglet **Sessions**, puis cliquez sur `Ajouter une session`.
   - Résultat attendu : La fenêtre « Nouvelle session de formation » s’ouvre.
2. Renseignez l’**Intitulé** (obligatoire), le **Début** et la **Fin** (obligatoires, la fin après le début).
   - Remarque : Les heures sont en heure de Libreville.
3. Choisissez la **Modalité**, l’**Intervenant**, le **Lieu** et, pour une classe virtuelle, le **Lien de visioconférence**.
   - Remarque : L’intervenant est pré-rempli avec le formateur de la cohorte.
4. Reliez au besoin une **Activité liée (séance en direct)** de la version.
   - Remarque : La présence à cette session validera alors l’achèvement de l’activité pour les participants présents.
5. Laissez cochée la case **Envoyer la convocation aux membres**, puis validez.
   - Résultat attendu : Le message « Session « … » ajoutée et convocations envoyées » s’affiche ; chaque membre reçoit une convocation.

> **Modifier ou supprimer une session** : Le bouton `Modifier` rouvre la session (la convocation n’est renvoyée que si vous recochez la case). Un **rappel** automatique part 24 h avant chaque session.

> **Suppression bloquée si des présences existent** : Le bouton `Supprimer` est refusé dès qu’un émargement a été saisi pour la session (« Des présences ont été enregistrées : la session ne peut pas être supprimée »). Corrigez plutôt la session ou laissez-la dans l’historique.

### Si ça ne marche pas

- **Le message « La fin doit être postérieure au début » s’affiche.** (cause probable : L’heure de fin est avant ou égale à l’heure de début.) : Corrigez l’une des deux heures.
- **Le message « L’activité liée doit être une séance en direct de la version suivie par la cohorte » s’affiche.** (cause probable : L’activité choisie n’est pas une séance en direct de la bonne version.) : Choisissez une activité de type « Séance en direct » de la version suivie, ou laissez « Aucune ».

## 9. Comment émarger une session <a id="emarger-une-session"></a>

*Saisir les présences d’une session depuis l’espace Formateur.*

L’**émargement** (la saisie des présences) se fait dans l’espace **Formateur**, seul endroit qui contient la feuille de présence. La coordination peut émarger toutes les cohortes. Les présents et les retards comptent dans l’**assiduité** ; l’assiduité est le rapport (présents + retards) sur le nombre de sessions déjà passées.

1. Depuis la fiche de la cohorte, onglet **Sessions**, cliquez sur `Émargement`.
   - Résultat attendu : L’espace Formateur s’ouvre sur l’onglet **Présence**.
   - Remarque : Vous pouvez aussi passer par la carte « Espace formateur » puis « Présences et corrections ».
2. Choisissez la bonne **Session** dans le sélecteur.
   - Résultat attendu : La liste des participants et les compteurs de présence s’affichent.
3. Pour chaque participant, cliquez sur `Présent`, `Absent`, `En retard` ou `Excusé`.
   - Remarque : Les boutons `Tous présents`, `Tous absents`, `Tous excusés` remplissent la feuille d’un coup, à ajuster ensuite.
4. Ajoutez une **Note** si nécessaire (300 caractères au plus), puis cliquez sur `Enregistrer la feuille`.
   - Résultat attendu : Le message « Présences enregistrées pour N participant(s) » s’affiche.

### Les statuts d’émargement

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Présent | La personne a assisté à la session ; compte dans l’assiduité. |  |
| En retard | Arrivée tardive ; compte tout de même dans l’assiduité. |  |
| Absent | La personne n’était pas là ; ne compte pas dans l’assiduité. |  |
| Excusé | Absence justifiée ; ne compte pas comme présence. |  |
| Non renseigné | Aucun statut choisi pour ce participant. |  |

### Si ça ne marche pas

- **Le message « Renseignez au moins un statut avant d’enregistrer. » s’affiche.** (cause probable : Aucun participant n’a de statut.) : Cliquez sur au moins un statut, ou utilisez une action de masse, avant d’enregistrer.
- **La feuille est en lecture seule.** (cause probable : Seuls le formateur de la cohorte ou la coordination peuvent émarger.) : Vérifiez que vous êtes bien connecté avec votre compte de coordination.

## 10. Comment valider les inscriptions et gérer leurs statuts <a id="valider-les-inscriptions"></a>

*Valider une inscription en attente, activer, terminer, suspendre ou annuler une inscription.*

Certains cours ont la politique « Sur validation de la coordination » : l’apprenant s’inscrit mais reste **En attente** tant que vous n’avez pas validé. Ces demandes apparaissent sur le tableau de bord et dans la rubrique **Cohortes**.

1. Ouvrez **Cohortes** et repérez la section « Inscriptions à valider ».
   - Où : bas de la page Cohortes
   - Résultat attendu : La liste des inscriptions en attente s’affiche.
2. Cliquez sur `Valider` sur la ligne voulue.
   - Résultat attendu : L’inscription passe « En cours » ; la personne reçoit « Inscription validée » et un email de confirmation.
3. Pour les autres changements de statut, ouvrez le cours dans l’espace Administration, onglet **Inscriptions**.
   - Où : espace Administration › **Cours** › fiche du cours › onglet **Inscriptions**
4. Choisissez l’action : `Activer`, `Terminer`, `Suspendre` ou `Annuler`.
   - Remarque : Un **Motif** est obligatoire pour Terminer, Suspendre et Annuler. « Terminer » force la progression à 100 % et tente l’émission automatique du certificat.

### Les statuts d’une inscription

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| En attente | À valider par la coordination. | Cliquez sur `Valider`. |
| En cours | Inscription active : la personne a accès au contenu. |  |
| Terminée | Formation achevée (progression 100 %) ; certificat possible. |  |
| Suspendue | Accès retiré temporairement. | Réactivable par `Activer`. |
| Annulée | Inscription annulée ; historique conservé. |  |
| Expirée | Inscription arrivée à échéance. |  |

> **L’apprenant est prévenu** : Activer et annuler une inscription envoient un email à l’apprenant. Écrivez un motif clair : il aide la personne et sert de trace pour la Fédération.

## 11. Comment clôturer une cohorte et émettre les certificats <a id="cloturer-et-certifier"></a>

*Clôturer la formation, émettre les certificats des éligibles, traiter les non éligibles.*

Clôturer une cohorte termine la formation et permet d’émettre les certificats. L’**éligibilité** est calculée d’après le modèle de certificat : formation terminée si le modèle l’exige, inscription non annulée, score suffisant, assiduité suffisante. Un score nul (cours sans évaluation notée) ne bloque pas.

1. Sur une cohorte « En cours » ou « Inscriptions ouvertes », cliquez sur `Clôturer`.
   - Résultat attendu : Le dialogue « Clôturer la cohorte » s’ouvre.
2. Laissez cochée la case **Émettre les certificats des participants éligibles**.
   - Remarque : Décochez-la seulement si vous voulez clôturer sans certifier tout de suite.
3. Choisissez le **Modèle de certificat** ou laissez « Modèle par défaut ».
   - Remarque : Sans choix, c’est le modèle du cours, sinon le modèle par défaut global.
4. Cliquez sur `Clôturer et émettre`.
   - Résultat attendu : Le message « Cohorte clôturée : N certificat(s) émis, N participant(s) non éligible(s) » s’affiche, avec la liste des non éligibles et leurs motifs.
5. Pour un participant non éligible, ouvrez l’onglet **Certificats**, corrigez la cause (note, présence, statut d’inscription) puis cliquez sur `Émettre`.
   - Remarque : Le bouton `Émettre quand même` force l’émission malgré l’inéligibilité : cette action est journalisée sous votre responsabilité.

> **Le PDF arrive un peu après** : Chaque certificat porte un numéro FETRAG-AAAA-NNNNNN. Le document PDF est généré par la file de traitement (au plus quelques minutes). Le titulaire reçoit une notification et un email avec un lien de vérification publique.

> **Un seul certificat valide par inscription** : L’émission ne se fait qu’une fois par inscription (« Un certificat existe déjà »). Si les données sont fausses, révoquez le certificat existant avant d’en émettre un nouveau (voir « Le registre des certificats »).

### Si ça ne marche pas

- **Le message « Aucun modèle de certificat n’est configuré pour ce cours. » s’affiche.** (cause probable : Ni le cours ni la plateforme n’ont de modèle applicable.) : Créez un modèle par défaut ou un modèle dédié au cours (voir « Les modèles de certificats »), puis réessayez.
- **Un participant reste non éligible malgré tout.** (cause probable : Un critère du modèle n’est pas satisfait : formation non terminée, score ou assiduité insuffisants.) : Lisez le motif affiché dans l’onglet Certificats, corrigez la donnée, puis émettez ; ou utilisez `Émettre quand même` en connaissance de cause.

## 12. Comment gérer le registre des certificats <a id="gerer-les-certificats"></a>

*Retrouver, révoquer et régénérer les certificats et attestations émis.*

La rubrique **Certificats** est le registre de tous les documents émis. Chaque document porte un numéro séquentiel et un code de vérification publique. Vous y révoquez un certificat avec un motif, vous relancez la génération d’un PDF, et vous accédez à l’émission par cohorte.

1. Ouvrez **Certificats** dans le menu de gauche.
   - Résultat attendu : Le registre paginé s’affiche.
2. Filtrez par **Statut**, **Module** ou **Organisation**, ou tapez un numéro ou un titulaire dans **Recherche**.
3. Pour révoquer un certificat valide, cliquez sur `Révoquer`, saisissez le **Motif de révocation** (3 à 500 caractères), puis confirmez.
   - Résultat attendu : Le message « Certificat … révoqué » s’affiche ; le titulaire est notifié ; la vérification publique indiquera « Révoqué ».
4. Pour relancer un PDF manquant, cliquez sur `Régénérer le PDF`.
   - Résultat attendu : Le message « Régénération du PDF … planifiée » s’affiche ; le document réapparaît « Disponible » après le traitement.

### Les statuts d’un certificat

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Valide | Certificat émis et vérifiable publiquement. |  |
| Révoqué | Certificat annulé avec motif ; la vérification publique affiche « révoqué ». Irréversible. |  |
| Expiré | Date de validité dépassée (pour les modèles avec durée de validité). |  |
| Disponible | Le PDF est prêt et téléchargeable. |  |
| En génération | Le PDF est en attente du traitement. | Patientez quelques minutes, puis rafraîchissez. |

> **La révocation est définitive** : On ne peut pas annuler une révocation. Le numéro d’un certificat révoqué n’est jamais réattribué. En cas d’erreur de nom ou de note, corrigez la donnée source puis réémettez depuis l’onglet Certificats de la cohorte : un nouveau numéro et un nouveau code sont créés.

### Si ça ne marche pas

- **Le bouton `Révoquer` n’apparaît pas.** (cause probable : Le certificat n’est pas au statut « Valide » (déjà révoqué ou expiré).) : On ne révoque qu’un certificat valide. Vérifiez son statut dans la colonne « Statut ».
- **Le dialogue refuse la révocation avec « Indiquez un motif (3 caractères au moins). ».** (cause probable : Le motif est vide ou trop court.) : Saisissez un motif d’au moins 3 caractères, précis et compréhensible par le titulaire.

## 13. Comment gérer les organisations et leurs gestionnaires <a id="gerer-les-organisations"></a>

*Créer la fiche d’une organisation et y rattacher des gestionnaires qui déposeront les demandes.*

Une **organisation** est un syndicat, une section ou une fédération affiliés. Ses **gestionnaires** déposent les demandes de formation et consultent ses rapports. Le compte d’un gestionnaire doit exister avant le rattachement : la personne le crée elle-même sur le site institutionnel.

### Créer une organisation <a id="creer-une-organisation"></a>

1. Ouvrez **Organisations** puis cliquez sur `Nouvelle organisation`.
   - Où : menu de gauche de l’espace Coordination
   - Résultat attendu : Le formulaire de création s’ouvre.
2. Renseignez le **Nom de l’organisation** (obligatoire) et, au besoin, le **Sigle**, le **Secteur**, la **Ville**, les coordonnées et une **Présentation**.
   - Remarque : Le téléphone accepte 6 à 20 caractères ; le site web doit être une adresse valide.
3. Laissez cochée la case **Organisation affiliée à la FETRAG** si c’est le cas, puis cliquez sur `Créer l’organisation`.
   - Résultat attendu : Le message « Organisation « … » créée » s’affiche et la fiche s’ouvre.

### Rattacher un gestionnaire <a id="rattacher-un-gestionnaire"></a>

1. Sur la fiche, allez à la section **Gestionnaires et membres**, formulaire « Rattacher un compte ».
2. Saisissez l’**Email du compte** (obligatoire), la **Fonction**, laissez cochée « Désigner comme gestionnaire », puis cliquez sur `Rattacher`.
   - Résultat attendu : Le message « Gestionnaire rattaché à l’organisation » s’affiche ; le compte peut désormais déposer des demandes.
3. Pour retirer un compte, cliquez sur `Retirer` sur sa ligne et confirmez.
   - Résultat attendu : Le compte perd son rattachement et, le cas échéant, son rôle de gestionnaire.

> **Désactiver une organisation** : Dans la fiche, décochez la case **Organisation active** pour la retirer des sélecteurs. Utilisez le filtre « Inclure les inactives » pour la retrouver ensuite.

#### Si ça ne marche pas

- **Le message « Aucun compte actif ne correspond à cette adresse » s’affiche.** (cause probable : La personne n’a pas encore de compte, ou l’adresse est différente.) : Demandez-lui l’adresse exacte de son compte, ou invitez-la à s’inscrire sur le site. Vous ne créez pas le compte vous-même.
- **Le message « Ce membre a des inscriptions en cours au titre de l’organisation » bloque le retrait.** (cause probable : Le compte a des inscriptions actives ou en attente liées à l’organisation.) : Annulez ou terminez ces inscriptions avant de retirer le compte.

## 14. Comment créer, structurer et publier un cours <a id="creer-un-cours"></a>

*Bâtir un cours dans l’espace Administration, publier sa version et le rendre visible au catalogue.*

Les cours se construisent dans l’espace **Administration**. Un cours porte des **versions figées** : la version courante est celle que suivent les nouvelles inscriptions. Publier un cours le rend visible dans le catalogue de la plateforme et, automatiquement, sur le site institutionnel.

### Créer la fiche du cours <a id="creer-la-fiche"></a>

1. Dans l’espace Administration, ouvrez **Cours** puis cliquez sur `Nouveau cours`.
   - Résultat attendu : Le formulaire de création en quatre blocs s’ouvre.
2. Remplissez l’**Identité du module** : **Titre** et **Code** (obligatoires), et au besoin le résumé, le numéro et le pilier.
   - Remarque : Le code est court et unique (par exemple FETRAG-M03). L’adresse (slug) se génère depuis le titre si vous la laissez vide.
3. Complétez la **Pédagogie** (description, objectifs, prérequis, public, modalité, niveau, **Durée** obligatoire) et l’**Accès et tarification**.
   - Remarque : La politique d’inscription peut être libre, sur validation, réservée aux organisations, ou payante.
4. Cochez les **Formateurs du cours** puis cliquez sur `Créer le cours`.
   - Résultat attendu : Le message « Cours « … » créé (version 1 en brouillon) » s’affiche ; le builder du cours s’ouvre.

### Structurer le cours <a id="structurer-le-cours"></a>

Un cours s’organise en **modules** (grandes parties), qui contiennent des **leçons**, qui contiennent des **activités** (contenu, vidéo, quiz, devoir, séance en direct…). Chaque activité a une **règle d’achèvement** : ce qu’il faut faire pour qu’elle compte comme terminée.

1. Ouvrez l’onglet **Structure** du cours.
   - Résultat attendu : L’arborescence de la version affichée apparaît.
2. Cliquez sur `Ajouter un module`, puis dans le module sur `Leçon`, puis dans la leçon sur `Activité`.
   - Remarque : Réordonnez avec les boutons « Monter » et « Descendre » (il n’y a pas de glisser-déposer).
3. Pour un quiz, enregistrez l’activité, rouvrez-la avec `Modifier`, onglet **Quiz**, puis ajoutez des questions avec `Depuis la banque` ou `Création rapide`.
4. Pour une séance en direct, ouvrez l’onglet **Séances** de l’activité et cliquez sur `Ajouter une séance`.

### Publier une version et le cours <a id="publier-une-version-et-le-cours"></a>

1. Ouvrez l’onglet **Versions** et cliquez sur `Modifier` la version pour régler le **Score minimal**, l’**Assiduité minimale** et le **Journal des modifications**.
2. Cliquez sur `Publier`, puis confirmez dans le dialogue.
   - Résultat attendu : Le message « Version N publiée : elle devient la version courante » s’affiche. Un cours en brouillon passe alors automatiquement à « Publié ».
3. Si le cours n’est pas encore publié, cliquez sur `Publier` dans l’en-tête du cours.
   - Résultat attendu : Le message « Cours visible dans le catalogue » s’affiche.
4. Pour faire évoluer un cours déjà suivi, revenez à l’onglet Structure et cliquez sur `Créer une nouvelle version`, modifiez, puis publiez.
   - Remarque : Les cohortes en cours gardent leur version : elles ne sont pas affectées.

> **Une version publiée est figée** : Publier une version la verrouille : pour la modifier, il faut la dupliquer et publier une nouvelle version. Une version ne peut être publiée que si elle contient au moins un module, une leçon et une activité.

> **Synchronisation avec le site** : Un cours publié avec une version courante apparaît dans le catalogue de la plateforme et, par lecture de la même base, sur les pages Formations du site institutionnel. Vous n’avez rien à recopier.

#### Si ça ne marche pas

- **Le message « Publiez une version du cours avant de rendre le cours visible » s’affiche.** (cause probable : Le cours n’a pas de version courante publiée.) : Publiez d’abord une version dans l’onglet Versions, puis publiez le cours.
- **Le message « La version doit contenir au moins un module, une leçon et une activité avant publication » s’affiche.** (cause probable : La structure de la version est incomplète.) : Ajoutez au moins un module, une leçon et une activité, puis réessayez.
- **Le message « Ce quiz a déjà des tentatives : créez une nouvelle version du cours pour modifier ses questions » s’affiche.** (cause probable : Des apprenants ont déjà répondu au quiz.) : Dupliquez la version pour préparer une évolution ; l’ancienne reste intacte.

## 15. Comment gérer la banque de questions <a id="banque-de-questions"></a>

*Créer, importer (CSV, Moodle XML, GIFT), exporter vers Moodle et réutiliser des questions dans les quiz.*

La **banque de questions** rassemble des questions réutilisables dans plusieurs quiz. Chaque question est **versionnée** : modifier une question déjà répondue crée une nouvelle version et désactive l’ancienne, sans casser les tentatives passées.

1. Dans l’espace Administration, ouvrez **Banque de questions**.
   - Résultat attendu : La liste des questions s’affiche avec ses filtres.
2. Cliquez sur `Nouvelle question`, choisissez le type, saisissez l’énoncé, les options ou réponses, les points, la catégorie et l’explication, puis cliquez sur `Ajouter à la banque`.
   - Remarque : Chaque type a ses règles : par exemple un choix unique demande au moins deux options et exactement une correcte.
3. Pour importer en masse, cliquez sur `Importer (CSV)`, collez les lignes au format indiqué, puis cliquez sur `Importer`.
   - Résultat attendu : Le message « N question(s) importée(s), N ligne(s) rejetée(s) » s’affiche, avec le détail des lignes rejetées.
   - Remarque : Une question par ligne, colonnes séparées par des points-virgules ; import limité à 500 questions par lot.
4. Pour réutiliser une question dans un cours, passez par le builder : activité Quiz, `Depuis la banque`.
   - Remarque : La fiche d’une question ne comporte pas d’action d’ajout à un quiz ; l’ajout se fait depuis le builder.

### Les statuts d’une question

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Active | Proposée dans les quiz. |  |
| Inactive | Désactivée (remplacée par une nouvelle version, ou retirée). |  |

> **Supprimer ou désactiver** : Une question inutilisée est supprimée définitivement. Une question déjà utilisée dans un quiz ou déjà répondue est désactivée plutôt que supprimée, pour préserver l’historique.

## 16. Comment configurer les modèles de certificats <a id="modeles-de-certificats"></a>

*Définir les textes, le signataire, les critères d’éligibilité et le modèle par défaut.*

Un **modèle de certificat** définit les textes imprimés, le signataire, les critères d’éligibilité (score, assiduité, formation terminée) et la validité. Le **modèle par défaut** s’applique aux cours qui n’ont pas de modèle dédié. Sans modèle applicable, aucun certificat ne peut être émis.

1. Dans l’espace Administration, ouvrez **Modèles de certificats** puis cliquez sur `Nouveau modèle`.
   - Résultat attendu : Le dialogue de création s’ouvre avec un aperçu de la mise en page.
2. Renseignez le **Nom**, la **Nature** (Attestation de formation ou Certificat), le **Cours concerné** ou « Tous les cours », et les textes imprimés.
   - Remarque : Les libellés réels sont « Attestation de formation » et « Certificat ».
3. Réglez les **Critères d’éligibilité** : **Score minimal** (60 % par défaut), **Assiduité minimale** (0 % par défaut), case **Formation terminée requise**.
4. Cochez **Modèle par défaut** si ce modèle doit s’appliquer aux cours sans modèle dédié, puis cliquez sur `Créer le modèle`.
   - Résultat attendu : Le message « Modèle de certificat créé » s’affiche.

> **Un modèle qui a servi ne se supprime pas** : Si des certificats ont été émis avec un modèle, sa suppression est refusée. De même, modifier un modèle ne régénère pas automatiquement les PDF déjà émis : utilisez `Régénérer le PDF` sur chaque certificat concerné.

> **Un seul modèle par défaut** : Cocher « Modèle par défaut » sur un modèle décoche automatiquement les autres. À l’émission, l’ordre est : modèle choisi, sinon modèle dédié au cours, sinon modèle par défaut.

## 17. Comment désigner un formateur <a id="designer-des-formateurs"></a>

*Attribuer le rôle Formateur à un compte, sur un cours ou une cohorte.*

La coordination peut attribuer ou retirer **le seul rôle Formateur**, et seulement sur un cours ou une cohorte. Les autres rôles relèvent du super administrateur. Vous désignez aussi les formateurs d’un cours directement depuis son builder.

1. Pour désigner les formateurs d’un cours, ouvrez le cours dans l’espace Administration, onglet **Formateurs**.
   - Résultat attendu : La liste des formateurs du cours s’affiche.
2. Dans « Ajouter un formateur », choisissez un **Compte formateur**, cochez « Référent du cours » si besoin, puis cliquez sur `Ajouter`.
   - Remarque : Le référent est le formateur principal ; les autres enseignent toutes les cohortes du cours.
3. Pour une portée cohorte, ouvrez **Utilisateurs et rôles**, la fiche du compte, section « Rôles et portées ».
   - Où : espace Administration › **Utilisateurs et rôles**
4. Attribuez le rôle **Formateur** avec la portée **Cours** ou **Cohorte** et une expiration facultative.
   - Résultat attendu : Le message « Rôle TRAINER attribué à … » s’affiche.

### Si ça ne marche pas

- **Le message « La coordination ne peut attribuer que le rôle Formateur sur un cours ou une cohorte » s’affiche.** (cause probable : Vous tentez d’attribuer un autre rôle, ou une portée globale.) : Limitez-vous au rôle Formateur, portée Cours ou Cohorte. Pour tout autre rôle, sollicitez le super administrateur.
- **Le compte n’a pas le rôle Formateur alors que vous voulez l’ajouter à un cours.** (cause probable : Aucun compte formateur n’est disponible.) : Attribuez d’abord le rôle Formateur au compte depuis « Utilisateurs et rôles », puis ajoutez-le au cours.

## 18. Comment produire un rapport et l’exporter <a id="produire-des-rapports"></a>

*Consulter les indicateurs par cours, organisation, cohorte et finances, et télécharger les exports.*

La rubrique **Rapports** offre une vue d’ensemble et quatre rapports détaillés : par cours, par organisation, par cohorte, et une synthèse financière. Chaque export CSV ou PDF est journalisé.

1. Ouvrez **Rapports** dans le menu de gauche.
   - Résultat attendu : Les tuiles d’indicateurs et les sections de rapport s’affichent.
2. Dans la section voulue, choisissez le **Module**, l’**Organisation** ou la **Cohorte** (ou la période pour la finance), puis cliquez sur `Afficher`.
   - Résultat attendu : Le tableau du rapport apparaît.
3. Cliquez sur `CSV` ou `PDF` pour télécharger l’export.
   - Résultat attendu : Le fichier se télécharge dans votre navigateur.
   - Remarque : La synthèse financière n’a qu’un export CSV. Le rapport de cohorte est aussi exportable depuis l’onglet Certificats de la cohorte.

> **Données personnelles** : Les exports contiennent des données personnelles de participants. Ne les transmettez qu’aux organisations concernées. Chaque gestionnaire dispose déjà de ses propres rapports d’organisation.

## 19. Notifications et emails que vous recevez <a id="notifications"></a>

*Ce qui vous est notifié, ce que reçoivent les organisations et les participants, et où le lire.*

La plateforme prévient les personnes concernées à chaque étape. Vous recevez surtout les nouvelles demandes ; les organisations et les participants reçoivent le suivi de leurs demandes, inscriptions et certificats.

*Ce que vous recevez*

| Notification ou email | Quand | Ce qu’il faut faire |
| --- | --- | --- |
| « Nouvelle demande de formation » | Une organisation dépose ou retransmet une demande. | Ouvrez la rubrique Demandes et instruisez la demande. |
| « Demande annulée » | Une organisation annule sa demande. | Aucune action ; la file se met à jour. |

> **Où lire vos notifications** : Il n’existe pas de centre de notifications dans les espaces Coordination et Administration. Vos notifications internes (nouvelle demande, demande annulée) se lisent dans le bloc Notifications de votre tableau de bord apprenant. Les emails arrivent dans votre boîte habituelle.

*Ce que déclenchent vos décisions (pour information)*

| Décision ou action | Ce que reçoit le destinataire |
| --- | --- |
| Décision sur une demande | L’organisation reçoit une notification et un email correspondant à la décision (complément, acceptée, refusée, nouvelle date, planifiée). |
| Planification | Les participants sans compte reçoivent un lien « définissez votre mot de passe » (valable 7 jours) ; les autres, une confirmation d’inscription ; le formateur, l’attribution de la cohorte. |
| Création d’une session | Chaque membre reçoit une convocation ; un rappel automatique part 24 h avant. |
| Émission d’un certificat | Le titulaire reçoit « votre certificat / attestation est disponible » avec un lien de vérification. |
| Révocation d’un certificat | Le titulaire est notifié avec le motif. |

## 20. Bonnes pratiques et sécurité <a id="bonnes-pratiques"></a>

*Les réflexes qui protègent les comptes, les données syndicales et la qualité du programme.*

### Sécurité du compte

- [x] Activez la vérification en deux étapes et conservez vos codes de secours hors de votre téléphone.
- [x] Déconnectez-vous toujours après votre travail sur un appareil partagé.
- [x] Ne communiquez jamais votre mot de passe ni un code de vérification, même à un collègue ou au support.

### Confidentialité des données syndicales

- [x] Ne transmettez les exports (participants, présences, notes) qu’aux organisations concernées.
- [x] Ouvrez les pièces jointes des demandes seulement pour instruire le dossier ; le lien expire en 15 minutes.
- [x] Écrivez des motifs de décision courtois et factuels : ils sont lus par les organisations et conservés dans l’historique.

### Qualité du programme

- [x] Traitez les demandes dans l’ordre d’ancienneté et sans laisser traîner : une alerte signale les demandes en retard.
- [x] Préférez « Demander un complément » à un refus quand le dossier est incomplet.
- [x] Vérifiez les critères du modèle de certificat avant de clôturer une cohorte.
- [x] Publiez toujours une nouvelle version pour faire évoluer un cours suivi : ne modifiez jamais une version figée.
- [x] Planifiez les sessions en heure de Libreville : la plateforme convertit à l’affichage.

> **Délai d’instruction** : L’accusé de réception envoyé à l’organisation annonce une réponse sous cinq jours ouvrés. L’alerte de votre tableau de bord, elle, se déclenche après dix jours. Visez le délai le plus court annoncé à l’organisation : cinq jours ouvrés.

## 21. Questions fréquentes <a id="questions-frequentes"></a>

**Où décide-t-on du sort d’une demande de formation ?**

Sur la plateforme, dans le panneau **Décision de la coordination** de la fiche de la demande (rubrique **Demandes**). C’est là que vous demandez un complément, acceptez, proposez une date, refusez ou planifiez.

**La décision « Convertir en cohorte » n’existe pas, comment créer les cohortes depuis une demande ?**

La décision s’appelle `Planifier`. Sur une demande « Acceptée », elle crée une cohorte par module, les comptes des participants et leurs inscriptions.

**Un participant n’a pas d’adresse email. Que se passe-t-il à la planification ?**

Il est ignoré et listé dans « Éléments non traités ». Ajoutez son adresse dans la demande avant de planifier, ou ajoutez-le ensuite depuis la fiche de la cohorte.

**La convocation part-elle dès la planification ?**

Non. La planification envoie l’invitation de compte, la confirmation d’inscription et l’email « Formation planifiée ». Les convocations aux séances partent à la création de chaque session.

**Comment saisir les présences ? Il n’y a pas d’onglet Présence sur la cohorte.**

L’émargement se fait dans l’espace **Formateur**. Depuis l’onglet Sessions de la cohorte, cliquez sur `Émargement` : vous arrivez sur l’onglet **Présence** de l’espace Formateur, où vous pouvez émarger toutes les cohortes.

**Je me suis trompé sur un certificat déjà émis. Que faire ?**

Corrigez la donnée source, révoquez le certificat erroné avec un motif dans la rubrique **Certificats**, puis réémettez depuis l’onglet Certificats de la cohorte : un nouveau numéro et un nouveau code sont créés. La révocation est définitive.

**Pourquoi ne puis-je pas modifier une version de cours déjà publiée ?**

Une version publiée est figée pour garantir que les cohortes suivent un contenu stable. Pour la faire évoluer, dupliquez-la (`Créer une nouvelle version`), modifiez la copie, puis publiez-la : les cohortes en cours gardent leur version.

**Puis-je attribuer un rôle à un compte ?**

Vous pouvez attribuer ou retirer uniquement le rôle **Formateur**, sur un cours ou une cohorte. Tous les autres rôles, ainsi que la création et la désactivation des comptes, relèvent du super administrateur.

**Un cours publié sur la plateforme apparaît-il tout seul sur le site institutionnel ?**

Oui. Un cours « Publié » avec une version courante apparaît dans le catalogue de la plateforme et, par lecture de la même base, sur les pages Formations du site. Vous n’avez rien à recopier.

**Où est passée ma notification de nouvelle demande ?**

Les espaces Coordination et Administration n’ont pas de centre de notifications. Vos notifications internes se lisent dans le bloc Notifications de votre tableau de bord apprenant ; l’email arrive dans votre boîte habituelle.

## 22. Lexique <a id="lexique"></a>

- **Demande de formation** : Dossier déposé par un gestionnaire d’organisation : modules souhaités, participants et période. Vous l’instruisez avant toute cohorte.
- **Cohorte** : Groupe de participants qui suivent ensemble une version figée d’un module, avec un formateur, des sessions et un forum.
- **Session** : Séance datée d’une cohorte (présentiel, classe virtuelle ou hybride). Les heures sont en heure de Libreville.
- **Version (d’un cours)** : État figé du contenu d’un cours. La version courante est celle que suivent les nouvelles inscriptions ; les cohortes gardent la leur.
- **Module, leçon, activité** : Les trois niveaux de la structure d’un cours : le module contient des leçons, la leçon contient des activités (contenu, vidéo, quiz, devoir, séance en direct…).
- **Règle d’achèvement** : Ce qu’il faut faire pour qu’une activité compte comme terminée : consultation, temps passé, score minimal, remise, présence ou validation manuelle.
- **Assiduité** : Part des sessions passées auxquelles un participant a assisté : (présents + retards) divisé par le nombre de sessions passées.
- **Éligibilité** : Le fait qu’un participant remplit les critères du modèle de certificat (formation terminée, score, assiduité) pour recevoir son document.
- **Certificat et attestation** : Documents remis en fin de formation, avec un numéro FETRAG séquentiel et un code de vérification publique. « Certificat » et « Attestation de formation » sont deux natures de modèle.
- **Révocation** : Annulation définitive d’un certificat, avec un motif. La vérification publique affiche « révoqué » ; le numéro n’est jamais réattribué.
- **Gestionnaire d’organisation** : Compte habilité à déposer les demandes de formation de son organisation et à consulter ses rapports.
- **Vérification en deux étapes (MFA)** : Un code temporaire à six chiffres demandé en plus du mot de passe, généré par une application sur votre téléphone. Elle s’active sur le site institutionnel.
- **Brouillon** : Contenu (cours, version, demande) non transmis ou non visible. Modifiable et sans effet public tant qu’il n’est pas publié ou soumis.
- **Banque de questions** : Réserve de questions réutilisables dans les quiz, versionnées : modifier une question déjà répondue crée une nouvelle version.

## 23. Besoin d’aide ? <a id="besoin-d-aide"></a>

*À qui s’adresser*

| Votre problème | Interlocuteur |
| --- | --- |
| Connexion impossible, code de vérification refusé, téléphone perdu, rôle manquant, compte à créer ou à désactiver | Le super administrateur (par le formulaire de contact du site, ou le secrétariat général). |
| Commande, paiement ou remboursement d’un cours payant | Le rôle Finance / contrôle de la Fédération. |
| Dossier d’une demande à compléter, participant à ajouter, rapport d’organisation à commenter | Le gestionnaire de l’organisation concernée. |
| Correction en attente, émargement à faire sur place | Le formateur de la cohorte. |
| Panne, message d’erreur répété, page qui ne se charge pas | Le support, par le formulaire de contact du site. |

### Dans un message d’aide, indiquez

- L’adresse email de votre compte (jamais votre mot de passe ni un code de vérification).
- L’écran concerné (par exemple « Coordination › Demandes › fiche … ») et l’appareil utilisé (téléphone ou ordinateur, navigateur).
- Le message d’erreur exact, recopié tel qu’affiché, et l’heure de l’essai.
- La référence concernée : référence de la demande, code de la cohorte, numéro du certificat ou nom de l’organisation.

### Contacter la Fédération

- [Formulaire de contact du site](https://fetrag.ga/contact) : Support et demandes d’accès (objet conseillé : « Demande de droits d’accès »).
- [Écrire au secrétariat général](mailto:jossngomafm@gmail.com) : Adresse email de la Fédération.
- [Téléphone : 066 23 00 33](tel:+24166230033) : Secrétariat de la Fédération, aux heures de bureau.
- [Téléphone : 077 52 27 98](tel:+24177522798) : Second numéro de la Fédération.

Adresse postale : Fédération des Travailleurs du Gabon (FETRAG), BP 1234 Libreville, Gabon.

## Testez votre maîtrise <a id="autoevaluation"></a>

Vingt-sept questions pour vérifier que vous savez où agir, ce que signifient les statuts, ce qui est irréversible et à qui vous adresser. Comptez quinze minutes ; le corrigé renvoie à la section du guide. Seuil de maîtrise : 70 % de bonnes réponses. 27 questions.

1. Quel rôle pouvez-vous attribuer vous-même à un compte ? *(une seule réponse)*
   - a) N’importe quel rôle.
   - b) Uniquement le rôle Formateur, sur un cours ou une cohorte.
   - c) Aucun rôle : tout relève du super administrateur.

2. Parmi ces actions, lesquelles vous sont interdites ? *(plusieurs réponses possibles)*
   - a) Créer un compte.
   - b) Rembourser une commande.
   - c) Émettre un certificat.
   - d) Créer une cohorte.

3. Où activez-vous la vérification en deux étapes ? *(une seule réponse)*
   - a) Sur le site institutionnel, dans votre espace de sécurité.
   - b) Dans l’espace Coordination de la plateforme.
   - c) Elle s’active toute seule à la première connexion.

4. Un dossier de demande est incomplet. Quelle décision est la plus adaptée ? *(une seule réponse)*
   - a) `Refuser`, puisqu’il manque des informations.
   - b) `Demander un complément`, pour que l’organisation corrige et retransmette.
   - c) `Annuler` la demande.

5. Que fait la décision `Planifier` sur une demande acceptée ? *(une seule réponse)*
   - a) Elle envoie seulement un email à l’organisation.
   - b) Elle crée une cohorte par module, les comptes manquants et les inscriptions.
   - c) Elle publie le cours au catalogue.

6. Le statut « Refusée » d’une demande est définitif. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

7. Que se passe-t-il quand vous cliquez sur `Démarrer` sur une cohorte ? *(une seule réponse)*
   - a) Rien du côté de la demande liée.
   - b) La demande liée passe automatiquement à « Formation en cours ».
   - c) Les certificats sont émis immédiatement.

8. Vous devez supprimer une session, mais le bouton est refusé. Pourquoi ? *(une seule réponse)*
   - a) Des présences ont déjà été enregistrées pour cette session.
   - b) La session est trop ancienne.
   - c) Vous n’êtes pas le formateur.

9. Où saisissez-vous les présences d’une session ? *(une seule réponse)*
   - a) Dans l’onglet Présence de l’espace Formateur.
   - b) Dans l’onglet Sessions de la cohorte.
   - c) Dans la rubrique Rapports.

10. Quels statuts d’émargement comptent dans l’assiduité ? *(plusieurs réponses possibles)*
   - a) Présent
   - b) En retard
   - c) Absent
   - d) Excusé

11. À quel moment les certificats d’une cohorte s’émettent-ils en groupe ? *(une seule réponse)*
   - a) À la création de la cohorte.
   - b) Dans le dialogue de clôture, avec `Clôturer et émettre`.
   - c) Automatiquement chaque semaine.

12. On peut annuler la révocation d’un certificat. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

13. Vous voulez modifier un cours déjà suivi par des cohortes. Que faites-vous ? *(une seule réponse)*
   - a) Je modifie directement la version courante.
   - b) Je crée une nouvelle version, je la modifie, puis je la publie.
   - c) Je supprime le cours et je le recrée.

14. Le message « Aucun compte actif ne correspond à cette adresse » s’affiche au rattachement d’un gestionnaire. Pourquoi ? *(une seule réponse)*
   - a) La personne n’a pas encore de compte, ou l’adresse est différente.
   - b) L’organisation est inactive.
   - c) Vous n’avez pas le droit de rattacher des membres.

15. Que devez-vous indiquer dans un message d’aide au support ? *(plusieurs réponses possibles)*
   - a) L’adresse email de votre compte.
   - b) Le message d’erreur exact et l’heure de l’essai.
   - c) Votre mot de passe.
   - d) Votre code de vérification en cours.

16. Sur mobile, comment ouvrez-vous le menu de gauche de votre espace ? *(une seule réponse)*
   - a) Avec le bouton « Ouvrir le menu » (trois traits) en haut à gauche de la barre de l’espace.
   - b) Le menu de gauche reste toujours affiché sur mobile.
   - c) En faisant pivoter le téléphone à l’horizontale.

17. Après la planification, vous devez mettre la demande à jour à la main pour la passer à « Terminée ». *(vrai ou faux)*
   - a) Vrai
   - b) Faux

18. À la création manuelle d’une cohorte, que signifie une capacité laissée vide ? *(une seule réponse)*
   - a) Une capacité illimitée.
   - b) Aucun participant autorisé.
   - c) Une capacité de dix participants par défaut.

19. Que provoque l’action `Terminer` sur une inscription ? *(une seule réponse)*
   - a) Elle force la progression à 100 % et tente l’émission automatique du certificat.
   - b) Elle supprime définitivement l’inscription et son historique.
   - c) Elle suspend temporairement l’accès de l’apprenant.

20. Pour quelles actions sur une inscription un motif est-il obligatoire ? *(plusieurs réponses possibles)*
   - a) Terminer
   - b) Suspendre
   - c) Annuler
   - d) Valider

21. Que se passe-t-il quand vous modifiez une question de la banque déjà répondue ? *(une seule réponse)*
   - a) Une nouvelle version est créée et l’ancienne est désactivée, sans casser les tentatives passées.
   - b) Les tentatives passées sont effacées.
   - c) La modification est refusée tant que le quiz existe.

22. Que se passe-t-il quand vous cochez « Modèle par défaut » sur un modèle de certificat ? *(une seule réponse)*
   - a) Les autres modèles sont automatiquement décochés : il n’y a qu’un seul modèle par défaut.
   - b) Tous les cours utilisent aussitôt ce modèle, même ceux qui ont un modèle dédié.
   - c) Plusieurs modèles par défaut peuvent coexister.

23. Dans un cours, qu’est-ce qu’un formateur « référent du cours » ? *(une seule réponse)*
   - a) Le formateur principal du cours.
   - b) Un formateur limité à une seule cohorte.
   - c) Un formateur en attente de validation par le super administrateur.

24. Quel rapport ne propose qu’un export CSV, sans PDF ? *(une seule réponse)*
   - a) La synthèse financière.
   - b) Le rapport par cours.
   - c) Le rapport par organisation.

25. Où lisez-vous vos notifications internes (nouvelle demande, demande annulée) ? *(une seule réponse)*
   - a) Dans le bloc Notifications de votre tableau de bord apprenant.
   - b) Dans un centre de notifications de l’espace Coordination.
   - c) Uniquement par message texte sur votre téléphone.

26. Sous quel délai l’accusé de réception annonce-t-il une réponse à l’organisation ? *(une seule réponse)*
   - a) Cinq jours ouvrés.
   - b) Dix jours ouvrés.
   - c) Vingt-quatre heures.

27. D’après le lexique, comment se calcule l’assiduité d’un participant ? *(une seule réponse)*
   - a) (présents + retards) divisé par le nombre de sessions passées.
   - b) Le nombre de sessions auxquelles il est inscrit.
   - c) Les présents seuls, divisés par le total des sessions prévues.

### Corrigé

1. **b** : La coordination attribue uniquement le rôle Formateur, sur un cours ou une cohorte. Voir « Votre rôle en bref » et « Comment désigner un formateur ».
2. **a, b** : La création de compte relève du super administrateur, le remboursement du rôle Finance. Émettre un certificat et créer une cohorte font partie de votre travail. Voir « Votre rôle en bref ».
3. **a** : La vérification en deux étapes s’active sur le site (menu du compte › Sécurité). Voir « Activer la vérification en deux étapes ».
4. **b** : Un refus est définitif ; « Demander un complément » laisse l’organisation corriger. Voir « Choisir une décision ».
5. **b** : La planification crée les cohortes, les comptes et les inscriptions. Voir « Planifier une demande acceptée ».
6. **a** : « Refusée » est un statut final. Voir « Lire les statuts d’une demande ».
7. **b** : Démarrer la cohorte fait passer la demande à « Formation en cours ». Les certificats s’émettent à la clôture. Voir « Faire évoluer le statut ».
8. **a** : Une session avec des émargements ne peut pas être supprimée. Voir « Comment planifier une session et convoquer ».
9. **a** : La feuille d’émargement vit dans l’espace Formateur ; le bouton `Émargement` de la cohorte y mène. Voir « Comment émarger une session ».
10. **a, b** : L’assiduité compte les présents et les retards. Voir « Comment émarger une session ».
11. **b** : L’émission groupée se fait à la clôture ; après, on émet participant par participant. Voir « Comment clôturer une cohorte et émettre les certificats ».
12. **b** : La révocation est définitive. En cas d’erreur, on corrige la donnée et on réémet un nouveau certificat. Voir « Comment gérer le registre des certificats ».
13. **b** : Une version publiée est figée : on duplique pour la faire évoluer ; les cohortes en cours gardent leur version. Voir « Publier une version et le cours ».
14. **a** : Le compte doit exister et être actif avant le rattachement. Voir « Rattacher un gestionnaire ».
15. **a, b** : Jamais de mot de passe ni de code de vérification dans un message. Voir « Besoin d’aide ? ».
16. **a** : Sur mobile, le menu de gauche est masqué : ouvrez-le avec « Ouvrir le menu » (trois traits). Voir « Se repérer dans vos espaces ».
17. **b** : La demande passe seule à « Formation en cours » au démarrage de la cohorte et à « Terminée » à sa clôture. Voir « Comprendre le cycle d’une formation ».
18. **a** : Une capacité laissée vide signifie « illimité ». Voir « Comment créer une cohorte manuellement ».
19. **a** : « Terminer » force la progression à 100 % et tente l’émission du certificat. Voir « Comment valider les inscriptions et gérer leurs statuts ».
20. **a, b, c** : Un motif est obligatoire pour Terminer, Suspendre et Annuler, mais pas pour Valider. Voir « Comment valider les inscriptions et gérer leurs statuts ».
21. **a** : Modifier une question déjà répondue crée une nouvelle version et désactive l’ancienne. Voir « Comment gérer la banque de questions ».
22. **a** : Cocher « Modèle par défaut » décoche les autres : un seul modèle par défaut existe. Voir « Comment configurer les modèles de certificats ».
23. **a** : Le référent est le formateur principal du cours ; les autres enseignent toutes ses cohortes. Voir « Comment désigner un formateur ».
24. **a** : La synthèse financière n’a qu’un export CSV ; les autres rapports proposent CSV et PDF. Voir « Comment produire un rapport et l’exporter ».
25. **a** : Les espaces Coordination et Administration n’ont pas de centre de notifications : elles se lisent sur le tableau de bord apprenant. Voir « Notifications et emails que vous recevez ».
26. **a** : L’accusé annonce une réponse sous cinq jours ouvrés ; l’alerte du tableau de bord se déclenche, elle, après dix jours. Voir « Bonnes pratiques et sécurité ».
27. **a** : L’assiduité rapporte (présents + retards) au nombre de sessions déjà passées. Voir « Lexique ».

## Guides liés

- [Guide de l’apprenant](/guide) : Suivre une formation, faire les activités et récupérer ses certificats sur la plateforme.
- [Guide du formateur](/formateur/guide) : Animer une cohorte, corriger et saisir les présences dans l’espace Formateur.
- [Guide du coordinateur formation sur le site](https://fetrag.ga/admin/guide) : Organisations, finance en lecture, rapports et médiathèque depuis le site institutionnel.
