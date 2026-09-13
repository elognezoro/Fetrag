# Guide du super administrateur

*Piloter le site institutionnel de bout en bout*

Plateforme : site institutionnel fetrag.ga · Rôle : SUPER_ADMIN · Version 1.0 du 2026-09-12 · Lecture : 55 min · 21 sections, 125 étapes.

Version en ligne : https://fetrag.ga/admin/guide/web-administrateur

**À qui s'adresse ce guide ?** Ce guide s’adresse aux personnes disposant du rôle « Super administrateur » : celles qui créent les comptes, attribuent les rôles, règlent les paramètres, surveillent la sécurité, les traitements en arrière-plan et le journal d’audit des deux plateformes de la Fédération.

En tant que super administrateur, vous avez accès à tout le back-office du site institutionnel et vous êtes la seule personne à pouvoir créer des comptes, attribuer ou retirer des rôles, modifier les paramètres et gérer les clés API. Vous surveillez les traitements en arrière-plan, les emails non délivrés et le journal d’audit, et vous intervenez quand un compte doit être sécurisé. Vous déléguez le travail quotidien (contenus, services, finance, assistance, formation) aux rôles prévus pour cela.

## Avant de commencer

- Un compte sur le site institutionnel avec le rôle « Super administrateur » en portée globale (attribué par un autre super administrateur).
- Une application d’authentification installée sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP) pour la vérification en deux étapes, obligatoire pour ce rôle.
- Un ordinateur pour les tâches longues (paramètres, menus, journal d’audit) ; un smartphone suffit pour les vérifications et les actions rapides.
- L’accès aux runbooks du dossier « docs/runbooks » du dépôt (procédures d’exploitation) si vous intervenez sur l’hébergement.

## Prise en main en cinq minutes

1. Connectez-vous avec votre adresse email et votre mot de passe.
   - Élément : `Se connecter` (page « Se connecter », en haut à droite du site)
   - Résultat attendu : Si la vérification en deux étapes est active, le champ **Code de vérification** apparaît.
2. Activez la vérification en deux étapes si ce n’est pas encore fait.
   - Élément : `Activer la vérification en deux étapes` (menu du compte (vos initiales, en haut à droite) › **Sécurité**)
   - Résultat attendu : Le badge **Vérification en deux étapes active** s’affiche et huit codes de secours vous sont donnés une seule fois.
3. Ouvrez le back-office.
   - Élément : `Administration du site` (menu du compte (vos initiales, en haut à droite))
   - Résultat attendu : La page **Tableau de bord** s’ouvre avec la barre latérale marine « Administration ».
4. Lisez l’alerte **Traitements en arrière-plan à surveiller** si elle est affichée.
   - Où : en haut du tableau de bord
   - Résultat attendu : Vous savez s’il y a des tâches en échec ou des emails non délivrés à traiter.
5. Vérifiez qu’au moins un autre super administrateur actif existe.
   - Où : **Utilisateurs et rôles** › tuile **Équipe d’administration**
   - Résultat attendu : Le compteur « N super administrateur(s) » indique au moins 2.
   - Remarque : Un seul super administrateur, c’est un risque : en cas de perte d’accès, personne ne peut réinitialiser votre vérification en deux étapes.

## Sommaire

1. [Votre rôle en bref](#votre-role)
2. [Avant de commencer : compte et connexion](#avant-de-commencer)
3. [Se repérer dans le back-office](#se-reperer)
4. [Comment lire le tableau de bord chaque jour](#lire-le-tableau-de-bord)
5. [Comment gérer les utilisateurs](#gerer-les-utilisateurs)
6. [Comment attribuer et retirer des rôles](#attribuer-et-revoquer-des-roles)
7. [Comment sécuriser ou débloquer un compte](#securiser-un-compte)
8. [Comment régler les paramètres de la Fédération](#regler-les-parametres)
9. [Comment gérer les clés API](#gerer-les-cles-api)
10. [Comment superviser les traitements et les emails](#superviser-les-traitements)
11. [Comment modifier les menus de navigation](#modifier-les-menus)
12. [Comment consulter le journal d’audit](#consulter-le-journal-d-audit)
13. [Comment consulter et exporter les rapports](#consulter-les-rapports)
14. [Comment veiller à la sécurité de la plateforme](#securite-de-la-plateforme)
15. [Comment déléguer : quel rôle pour quelle tâche](#deleguer-et-gouverner)
16. [Opérations sensibles et irréversibles](#operations-sensibles)
17. [Notifications et emails que vous recevez](#notifications)
18. [Bonnes pratiques et sécurité](#bonnes-pratiques)
19. [Questions fréquentes](#questions-frequentes)
20. [Lexique](#lexique)
21. [Besoin d’aide ?](#besoin-d-aide)

## 1. Votre rôle en bref <a id="votre-role"></a>

*Ce que le rôle de super administrateur permet, ce qu’il ne permet pas, et avec qui vous travaillez.*

Le super administrateur est le gardien de la plateforme. Il ne rédige pas les actualités, ne traite pas les demandes de service et ne rembourse pas les commandes : il donne les bons droits aux bonnes personnes, règle les paramètres communs et surveille que tout fonctionne. Chacune de vos actions sensibles est inscrite dans le **Journal d’audit** (une trace qui ne peut être ni modifiée ni effacée).

### Ce que vous seul pouvez faire

- [x] Créer un compte pour un membre de l’équipe, un formateur ou un responsable d’organisation (`Nouveau compte`).
- [x] Attribuer un rôle (avec sa portée et une date d’expiration éventuelle) et le révoquer (`Attribuer un rôle`, `Révoquer`).
- [x] Désactiver ou réactiver un compte, réinitialiser la vérification en deux étapes d’une personne, définir un mot de passe temporaire.
- [x] Modifier les **Paramètres** : coordonnées de la Fédération, règles métier, bandeau de maintenance, règle de correction des quiz.
- [x] Générer et révoquer les **Clés API** utilisées par les intégrations externes.
- [x] Relancer ou annuler les tâches de la **File de traitements** (emails, certificats, reçus, publications planifiées).
- [x] Consulter tous les guides d’utilisation, y compris ceux des autres rôles.

### Ce que vous pouvez aussi faire, comme d’autres rôles

- Tout ce que font l’Éditeur communication, le Responsable services, Finance / contrôle, le Support et le Coordinateur formation : le rôle de super administrateur ouvre toutes les entrées du back-office.
- Lire le **Journal d’audit** et l’exporter (comme Finance / contrôle).
- Consulter les **Rapports** et les exporter (comme la coordination, l’édition et la finance).
- Modifier les **Menus** de navigation (comme l’Éditeur communication).

### Ce que l’interface ne permet pas

- Supprimer définitivement un compte : seule la désactivation existe, et les données (inscriptions, certificats, commandes) sont conservées.
- Modifier le nom, l’adresse email ou le téléphone d’un autre utilisateur : chaque personne met à jour son profil depuis son espace personnel.
- Modifier les secrets techniques (base de données, service d’email, paiements) ou les fonctionnalités optionnelles : ils se règlent dans l’environnement d’hébergement, jamais dans le back-office.
- Fermer une session précise d’un utilisateur : les sessions se ferment toutes ensemble en désactivant le compte ou en définissant un mot de passe temporaire.
- Retirer votre propre rôle de super administrateur, désactiver votre propre compte ou retirer le dernier super administrateur actif.

*Avec qui vous travaillez*

| Rôle | Ce qu’il fait | Ce que vous faites pour lui |
| --- | --- | --- |
| Éditeur communication | Pages, actualités, ressources, événements, médias, menus, FAQ, messages de contact. | Créer son compte, attribuer le rôle, vérifier sa vérification en deux étapes. |
| Responsable services | Catalogue des services et demandes de service. | Créer son compte, attribuer le rôle. |
| Finance / contrôle | Commandes, paiements, remboursements, prises en charge, exports, journal d’audit. | Créer son compte, attribuer le rôle, vérifier sa vérification en deux étapes. |
| Support | Assistance aux utilisateurs, lecture des demandes et des messages. | Créer son compte, attribuer le rôle ; il vous signale les comptes à débloquer. |
| Coordinateur formation | Formations, cohortes, certificats, demandes de formation, organisations. | Créer son compte, attribuer le rôle, vérifier sa vérification en deux étapes. |
| Formateur, Responsable d’organisation | Animation d’un cours ou d’une cohorte ; dépôt des demandes d’une organisation. | Attribuer un rôle à portée limitée (cours, cohorte, organisation). |
| Exploitant (hébergement) | Variables d’environnement, secrets, cron, sauvegardes. | Lui transmettre les constats de l’état de santé et des runbooks ; ne jamais lui envoyer un secret par message. |

## 2. Avant de commencer : compte et connexion <a id="avant-de-commencer"></a>

*Se connecter, activer la vérification en deux étapes, retrouver son mot de passe, se déconnecter.*

Votre compte est le même sur le site institutionnel et sur la plateforme de formation. Le rôle de super administrateur exige la **vérification en deux étapes** : en plus du mot de passe, un code à six chiffres généré par une application sur votre téléphone est demandé à chaque connexion. Selon la configuration du déploiement, le back-office peut rester bloqué tant qu’elle n’est pas activée ; dans tous les cas, activez-la dès votre première connexion.

### Se connecter au back-office

1. Ouvrez la page de connexion.
   - Élément : `Se connecter` (en haut à droite du site ; sur mobile, ouvrez d’abord le menu avec le bouton **Menu** (trois traits) en haut à droite)
   - Résultat attendu : Le formulaire avec **Adresse email** et **Mot de passe** s’affiche.
2. Saisissez votre **Adresse email** et votre **Mot de passe**, puis cliquez sur `Se connecter`.
   - Résultat attendu : Si la vérification en deux étapes est active, un message bleu « Ce compte est protégé par une vérification en deux étapes… » apparaît avec le champ **Code de vérification**.
   - Remarque : Sans vérification en deux étapes, vous êtes connecté directement et la page « Vérification en deux étapes » vous propose de l’activer.
3. Ouvrez votre application d’authentification et lisez le code à six chiffres affiché pour « FETRAG ».
   - Remarque : Le code change toutes les 30 secondes. Si vous n’avez plus votre téléphone, saisissez l’un de vos codes de secours (format XXXXX-XXXXX) : chaque code de secours ne sert qu’une fois.
4. Saisissez le code dans **Code de vérification** puis cliquez sur `Vérifier et se connecter`.
   - Résultat attendu : Vous êtes connecté ; vos initiales apparaissent en haut à droite.
5. Ouvrez le menu du compte et cliquez sur **Administration du site**.
   - Où : vos initiales, en haut à droite
   - Résultat attendu : Le back-office s’ouvre sur le **Tableau de bord**. En bas de la barre latérale, la pastille « Super administrateur » confirme votre rôle.
6. Sur mobile, ouvrez la navigation du back-office avec le bouton **Ouvrir la navigation** (trois traits).
   - Où : en haut à gauche de la barre supérieure « Back-office »
   - Résultat attendu : Un tiroir plein écran liste toutes les sections ; il se ferme avec le bouton **Fermer la navigation** (croix) ou dès que vous changez de page.

### Si la connexion ne marche pas

- **Message « Adresse email ou mot de passe incorrect. »** (cause probable : Faute de frappe, ou ancien mot de passe.) : Vérifiez les majuscules et l’adresse. Après plusieurs échecs, utilisez « Mot de passe oublié ? ».
- **Message « Le code de vérification est invalide ou expiré. Réessayez avec un nouveau code. »** (cause probable : Le code a changé pendant la saisie, ou l’heure de votre téléphone est décalée.) : Attendez le code suivant et saisissez-le sans espace. Vérifiez que l’heure du téléphone est réglée automatiquement.
- **Message « Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer. »** (cause probable : Protection contre les essais répétés.) : Attendez quelques minutes avant un nouvel essai. Si vous n’êtes pas à l’origine des tentatives, signalez-le : il peut s’agir d’une attaque sur votre compte.
- **Message « Ce compte est désactivé. Contactez le support de la FETRAG pour le réactiver. »** (cause probable : Votre compte a été désactivé par un autre super administrateur.) : Demandez-lui de le réactiver depuis votre fiche (bouton `Réactiver le compte`).
- **Le menu du compte ne propose pas **Administration du site**.** (cause probable : Votre rôle n’est pas attribué en portée globale, ou il a expiré.) : Demandez à un autre super administrateur de vérifier votre fiche : la ligne « Super administrateur » doit avoir la portée « Globale » et l’expiration « Sans limite » ou une date à venir.
- **La page « Accès refusé » s’affiche en ouvrant une adresse du back-office.** (cause probable : La page demande une permission que votre compte n’a pas (rôle expiré ou retiré).) : Cliquez sur `Aller à mon espace` puis faites vérifier vos rôles. Le lien « Changer de compte » permet de vous reconnecter avec un autre compte.

### Activer votre vérification en deux étapes <a id="activer-la-verification-en-deux-etapes"></a>

1. Installez une application d’authentification sur votre téléphone si vous n’en avez pas.
   - Remarque : Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP conviennent. Aucune de ces applications n’a besoin de connexion Internet pour générer les codes.
2. Ouvrez la page **Sécurité**.
   - Où : menu du compte (vos initiales, en haut à droite) › **Sécurité**
   - Résultat attendu : La page « Protéger mon compte » s’ouvre avec le badge **Vérification en deux étapes inactive**.
3. Cliquez sur `Activer la vérification en deux étapes`.
   - Où : carte **Vérification en deux étapes**
   - Résultat attendu : L’**Étape 1** affiche un QR code et une clé à saisir manuellement.
4. Dans l’application, ajoutez un compte en scannant le QR code (ou en saisissant la clé).
   - Résultat attendu : L’application affiche un code à six chiffres pour « FETRAG ».
   - Remarque : Sur smartphone, vous ne pouvez pas scanner l’écran du même téléphone : utilisez la clé manuelle (copiez-la) ou faites l’activation depuis un ordinateur.
5. Saisissez ce code dans **Code à 6 chiffres affiché par l’application** puis cliquez sur `Confirmer et activer`.
   - Où : **Étape 2**
   - Résultat attendu : L’alerte « Codes de secours - affichés une seule fois » liste huit codes, puis « Vérification en deux étapes activée ».
6. Cliquez sur `Copier les codes` et rangez-les dans un endroit sûr (gestionnaire de mots de passe, coffre, document chiffré).
   - Résultat attendu : Le message « Codes copiés dans le presse-papiers » apparaît.
   - Remarque : Ces codes ne seront plus jamais affichés. Il vous en reste un compteur (« Il vous reste N code(s) de secours ») ; pour en obtenir de nouveaux, désactivez puis réactivez la vérification.
7. Pour désactiver plus tard : saisissez un **Code de vérification ou code de secours** puis cliquez sur `Désactiver la vérification`.
   - Où : bas de la carte **Vérification en deux étapes**
   - Résultat attendu : Le badge repasse à « inactive » ; réactivez-la aussitôt si vous vouliez seulement renouveler vos codes de secours.

> **Téléphone perdu, sans code de secours** : Vous ne pourrez plus vous connecter seul. Un autre super administrateur doit ouvrir votre fiche dans **Utilisateurs et rôles** et cliquer sur `Réinitialiser la MFA` (voir « Sécuriser un compte »). C’est pour cela qu’il faut toujours au moins deux super administrateurs actifs.

### Mot de passe oublié et déconnexion <a id="mot-de-passe-et-deconnexion"></a>

1. Si vous avez oublié votre mot de passe, cliquez sur **Mot de passe oublié ?** sur la page de connexion.
   - Résultat attendu : La page « Mot de passe oublié » demande l’**Adresse email du compte**.
2. Saisissez votre adresse et cliquez sur `Recevoir le lien de réinitialisation`.
   - Résultat attendu : Un email « Réinitialisation de votre mot de passe FETRAG » arrive dans votre boîte ; le lien est valable 30 minutes et ne sert qu’une fois.
   - Remarque : Le nouveau mot de passe doit comporter au moins 8 caractères, une majuscule et un chiffre.
3. Pour changer votre mot de passe sans l’avoir oublié, utilisez la carte **Mot de passe** de la page **Sécurité**.
   - Résultat attendu : Un email « Votre mot de passe FETRAG a été modifié » confirme le changement.
4. Pour vous déconnecter, ouvrez le menu du compte et cliquez sur **Déconnexion**.
   - Où : vos initiales, en haut à droite ; sur mobile, dans le menu **Menu** (trois traits)
   - Résultat attendu : Vous revenez sur le site public. Faites-le systématiquement sur un appareil partagé.

## 3. Se repérer dans le back-office <a id="se-reperer"></a>

*La barre latérale, la barre supérieure, le tableau de bord et les écrans sur mobile.*

### Écran : La coquille « Administration » (toutes les pages du back-office)

Sur ordinateur, une barre latérale marine à gauche et une barre supérieure. Sur mobile (moins de 1024 px de large), la barre latérale devient un tiroir.

- **Barre latérale « Administration » (ordinateur) ou tiroir de navigation (mobile)** : Emblème FETRAG et ruban or « Administration » en haut ; puis les sections **Pilotage**, **Contenus**, **Services**, **Relations** et **Administration**. Un badge chiffré signale les éléments à traiter (contenus en relecture, demandes, messages). Vous voyez toutes les entrées ; les autres rôles ne voient que les leurs.
- **Pied de la barre latérale** : Votre nom, votre email, la pastille de votre rôle dominant (« Super administrateur ») et le bouton `Coordination LMS` qui ouvre l’espace de coordination de la plateforme de formation.
- **Barre supérieure « Back-office »** : Sur mobile, le bouton **Ouvrir la navigation** (trois traits) à gauche ; le titre de la section courante ; le lien **Voir le site** (nouvel onglet, masqué sur les écrans étroits).
- **Zone principale** : Le contenu de la section : titre, courte description, boutons d’action en haut à droite (sur mobile, ils passent sous le titre en pleine largeur), tuiles de chiffres, filtres, tableaux ou formulaires.
- **Page « Élément introuvable »** : S’affiche quand un lien pointe vers un contenu, une demande ou un utilisateur supprimé ou inexistant. Le bouton `Retour au tableau de bord` vous ramène à l’accueil.

*Les entrées de la barre latérale et qui d’autre les voit*

| Section | Entrées | Autres rôles concernés |
| --- | --- | --- |
| Pilotage | Tableau de bord | Tous les rôles du back-office (avec des indicateurs réduits). |
| Contenus | Pages, Actualités, Catégories, Ressources, Médias, Menus, FAQ | Éditeur communication (médias : aussi coordination et services). |
| Services | Catalogue, Demandes | Responsable services (demandes : aussi Support). |
| Relations | Événements, Partenaires et organisations, Messages reçus, Newsletter | Éditeur communication, Responsable services, Support selon l’entrée. |
| Administration | Utilisateurs et rôles, Organisations, Finance, Rapports, Journal d’audit, Paramètres | Support, coordination et finance en lecture pour les utilisateurs ; Finance pour le journal ; **Paramètres** : vous seul. |

### Écran : La page « Tableau de bord »

Vue d’ensemble du site : audience, sollicitations reçues, contenus à valider, activité financière et indicateurs de formation. Sur mobile, les tuiles sont sur deux colonnes et les cartes s’empilent.

- **Alerte « Traitements en arrière-plan à surveiller »** : Visible par vous seul, et seulement s’il y a des tâches en échec ou abandonnées, ou des emails non délivrés sur 24 h. Elle indique aussi combien de tâches sont en file et à exécuter maintenant.
- **Tuiles de chiffres** : **Pages vues sur 30 jours**, **Formulaires reçus sur 30 jours**, **Demandes de service en cours**, **Chiffre d’affaires sur 12 mois**.
- **Cartes d’activité** : **Audience du site**, **Formulaires par type**, **Contenus en relecture** (bouton `Relire` sur chaque contenu), **Dernières demandes de service**, **Messages reçus**, **Ventes mensuelles**, **Contenus les plus consultés**.
- **Carte marine « Plateforme de formation »** : Apprenants actifs, nouvelles inscriptions, taux de complétion et certificats émis sur 30 jours ; bouton or `Coordination LMS`.
- **Raccourcis du bas** : `Nouvelle actualité`, `Utilisateurs`, `Voir le site` ; en haut à droite, `Rapports détaillés`.

Chemin vers vos écrans réservés : Menu du compte › Administration du site › Administration › Utilisateurs et rôles / Journal d’audit / Paramètres (`/admin`)

> **Sur smartphone** : Les tableaux masquent certaines colonnes (organisations, sécurité, dates) et défilent horizontalement dans leur cadre. Pour les tâches longues (paramètres, menus, journal d’audit), préférez un ordinateur ; le smartphone convient aux vérifications et aux actions rapides (relancer une tâche, révoquer un rôle).

## 4. Comment lire le tableau de bord chaque jour <a id="lire-le-tableau-de-bord"></a>

*Une routine de cinq minutes pour repérer ce qui demande votre intervention.*

1. Ouvrez **Tableau de bord**.
   - Où : section **Pilotage** de la barre latérale ; sur mobile, bouton **Ouvrir la navigation** (trois traits) en haut à gauche
   - Résultat attendu : La page « Bonjour <votre prénom> » s’affiche.
2. Regardez s’il y a une alerte **Traitements en arrière-plan à surveiller** en haut de page.
   - Résultat attendu : Elle indique « N tâche(s) en échec ou abandonnée(s) · N email(s) non délivré(s) sur 24 h · N en file, N à exécuter maintenant. »
   - Remarque : Pas d’alerte = rien d’anormal du côté des traitements. Si elle est présente, suivez « Superviser les traitements et les emails ».
3. Parcourez la carte **Contenus en relecture** et les badges de la barre latérale.
   - Résultat attendu : Vous voyez ce qui attend une validation ou une réponse ; ce travail revient normalement à l’Éditeur, au Responsable services ou au Support.
   - Remarque : Si un badge reste élevé plusieurs jours, vérifiez que la personne en charge dispose bien de son rôle et qu’elle se connecte (colonne « Dernière connexion » des utilisateurs).
4. Pour aller plus loin, cliquez sur `Rapports détaillés`.
   - Où : en haut à droite (sous le titre sur mobile)
   - Résultat attendu : La page **Rapports** s’ouvre (voir « Consulter et exporter les rapports »).

## 5. Comment gérer les utilisateurs <a id="gerer-les-utilisateurs"></a>

*Rechercher un compte, lire sa fiche, créer un compte avec invitation par email.*

La page **Utilisateurs et rôles** regroupe les comptes des deux plateformes (site et formation) : un compte créé ici sert aussi sur la plateforme de formation. Le Support, la coordination et la finance peuvent consulter cette page ; vous seul pouvez créer un compte et agir dessus.

Chemin : Barre latérale › Administration › Utilisateurs et rôles (`/admin/utilisateurs`)

### Rechercher et filtrer les comptes <a id="rechercher-un-utilisateur"></a>

1. Ouvrez **Utilisateurs et rôles**.
   - Où : section **Administration** de la barre latérale
   - Résultat attendu : Quatre tuiles résument les comptes : **Comptes enregistrés**, **Apprenants**, **Équipe pédagogique**, **Équipe d’administration** (avec le nombre de super administrateurs).
2. Saisissez un nom, une adresse email ou un employeur dans le champ de recherche « Nom, email ou employeur ».
   - Où : barre de filtres, au-dessus du tableau
   - Remarque : La recherche ignore les majuscules ; 200 caractères au plus.
3. Précisez si besoin le **Rôle**, le **Statut** (« Actifs » / « Désactivés ») ou l’**Organisation**, puis cliquez sur `Filtrer`.
   - Résultat attendu : Le tableau « Utilisateurs » se met à jour et la première tuile devient « Comptes correspondant aux filtres ». Le bouton `Réinitialiser` efface les filtres.
   - Remarque : Sur mobile, les listes de filtres s’empilent en pleine largeur.
4. Lisez les colonnes : **Utilisateur** (nom, email, employeur), **Rôles** (badges ; « (limité) » signale une portée non globale ; « Aucun rôle »), **Organisations**, **Sécurité** (badge « Actif » / « Désactivé », badge « MFA »), **Dernière connexion**, **Créé**.
   - Remarque : Sur mobile, seules les colonnes **Utilisateur** et **Rôles** sont visibles. Les comptes désactivés apparaissent grisés. La liste affiche 20 comptes par page.
5. Cliquez sur le nom d’une personne pour ouvrir sa fiche.
   - Résultat attendu : La fiche « <Nom de l’utilisateur> » s’ouvre.

> **Revue des comptes privilégiés** : Filtrez par **Rôle** = Super administrateur, Coordinateur formation, Finance / contrôle ou Éditeur communication et vérifiez que chaque ligne porte le badge « MFA » dans la colonne **Sécurité** (sur ordinateur). Une personne sans badge doit activer sa vérification en deux étapes.

### Lire la fiche d’un utilisateur <a id="lire-une-fiche-utilisateur"></a>

1. Lisez l’en-tête : email, date de création, dernière connexion, badges **Compte actif** / **Compte désactivé** et **MFA active**.
   - Remarque : Sur votre propre fiche, une alerte rappelle que la désactivation et le retrait de votre rôle de super administrateur sont bloqués.
2. Parcourez les cartes de la colonne principale : **Profil**, **Rôles et portées**, **Organisations**, **Inscriptions à la formation**, **Commandes**, **Consentements**, **Dernières connexions**, **Journal d’audit**.
   - Résultat attendu : La carte **Dernières connexions** liste les dix dernières connexions, échecs et changements de sécurité, avec l’appareil utilisé.
   - Remarque : Sur mobile, ces cartes sont suivies de la colonne latérale (**Compte**, **Repères**) en dessous.
3. Repérez la carte **Compte** dans la colonne latérale : compteurs (inscriptions, certificats, commandes, demandes) et boutons `Désactiver le compte` / `Réactiver le compte`, `Réinitialiser la MFA`, `Mot de passe temporaire`.
   - Remarque : Ces actions sont réservées au super administrateur ; chacune est journalisée.
4. Pour la même personne sur la plateforme de formation, cliquez sur `Fiche sur la plateforme de formation`.
   - Où : carte **Repères**
   - Résultat attendu : La fiche s’ouvre sur la plateforme de formation, avec le même compte.

#### Ce que signifient les badges de la fiche

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Compte actif | La personne peut se connecter. | Aucune action. |
| Compte désactivé | Connexion refusée, sessions fermées, données conservées. | `Réactiver le compte` si la situation le justifie. |
| MFA active | La vérification en deux étapes est activée ; un code est demandé à chaque connexion. | Attendu pour tout rôle privilégié. |
| Vérifié le <date> / Adresse non vérifiée | L’adresse email a été confirmée (ou déclarée vérifiée par l’administration) ou non. | Une adresse non vérifiée bloque la connexion locale jusqu’à confirmation. |
| Mot de passe local défini / Aucun mot de passe local (fournisseur externe) | Le compte se connecte par email et mot de passe, ou uniquement par le fournisseur d’identité externe. | Le mot de passe temporaire n’a de sens que pour un compte à mot de passe local. |
| Responsable / Membre | Qualité dans une organisation ; un responsable dépose les demandes de formation de son organisation. | Se règle depuis la fiche de l’organisation. |
| Accordé / Refusé | Dernier état d’un consentement (conditions, confidentialité, lettre d’information, communications, engagements). | Lecture seule. |

### Créer un compte avec invitation par email <a id="creer-un-compte"></a>

Créez un compte pour un membre de l’équipe, un formateur ou un responsable d’organisation qui ne s’inscrira pas lui-même. L’adresse email est considérée comme vérifiée. La personne reçoit un email d’invitation avec un lien pour définir son mot de passe (valable 7 jours) ; un mot de passe temporaire vous est aussi affiché une seule fois, comme canal de secours.

1. Cliquez sur `Nouveau compte`.
   - Où : en haut à droite de **Utilisateurs et rôles** (sous le titre sur mobile)
   - Résultat attendu : La page « Nouveau compte » s’ouvre avec les sections **Identité** et **Rattachement et rôle**.
2. Renseignez **Prénom** et **Nom** (obligatoires, 2 à 60 caractères chacun).
   - Remarque : Le nom complet affiché sera « Prénom Nom ».
3. Renseignez l’**Adresse email** (obligatoire) : elle sert d’identifiant de connexion.
   - Remarque : Elle est mise en minuscules. Une adresse déjà utilisée est refusée (« Adresse déjà utilisée »).
4. Renseignez si utile **Téléphone** (facultatif, format international accepté, 6 à 20 caractères), **Fonction** (facultatif, 120 caractères) et **Employeur** (facultatif, 160 caractères).
5. Choisissez l’**Organisation** (facultatif) et cochez **Responsable de l’organisation** si la personne doit déposer les demandes de formation de son organisation.
   - Remarque : La case n’a d’effet que si une organisation est choisie.
6. Choisissez le **Rôle initial** (obligatoire ; « Apprenant » par défaut).
   - Remarque : Ce rôle est toujours attribué en portée globale. Pour un rôle limité à une organisation, un cours ou une cohorte, laissez « Apprenant » ici et attribuez le rôle limité depuis la fiche, après création. Les rôles privilégiés exigent la vérification en deux étapes à la première connexion.
7. Cliquez sur `Créer le compte`.
   - Où : en bas à droite (pleine largeur sur mobile)
   - Résultat attendu : L’alerte verte « Compte créé pour <email> » s’affiche, avec le texte « Le mot de passe temporaire ci-dessous n’est affiché qu’une seule fois. Transmettez-le par un canal sûr ; l’utilisateur devra le modifier depuis « Sécurité ». » et un encadré contenant le mot de passe temporaire avec son bouton `Copier`.
   - Remarque : L’écran est identique que l’invitation par email soit partie ou non : il ne confirme ni ne signale l’envoi. Pour savoir si l’email est parti (ou a échoué), vérifiez la **File de traitements** et l’**État de santé** (voir « Superviser les traitements et les emails ») ; dans le doute, transmettez vous-même le mot de passe temporaire par un canal sûr.
8. Si vous devez transmettre le mot de passe temporaire, cliquez sur `Copier` et envoyez-le par un canal sûr (jamais par email, jamais dans un groupe de discussion).
   - Résultat attendu : Le message « Copié dans le presse-papiers » apparaît. Le mot de passe ne sera plus jamais affiché.
   - Remarque : Dans le cas normal, la personne utilise le bouton « Définir mon mot de passe » de son email et vous n’avez pas besoin de transmettre le mot de passe temporaire.
9. Cliquez sur `Ouvrir la fiche` pour attribuer des rôles limités, ou sur `Créer un autre compte`.
   - Résultat attendu : La fiche de la personne s’ouvre, avec son rôle initial dans **Rôles et portées**.

> **Mot de passe temporaire** : Il n’est affiché qu’une seule fois et ne transite jamais par email. Si vous fermez la page sans le copier et que l’invitation n’est pas arrivée, utilisez plus tard `Mot de passe temporaire` depuis la fiche (nouvelle génération) ou demandez à la personne d’utiliser « Mot de passe oublié ? ».

#### Si la création ne marche pas

- **Message « Vérifiez les informations du compte. » avec un texte rouge sous un champ.** (cause probable : Un champ obligatoire est vide ou trop court (« Prénom trop court », « Adresse email invalide », « Numéro de téléphone invalide »).) : Corrigez le champ signalé puis cliquez de nouveau sur `Créer le compte`.
- **Message « Un compte existe déjà avec cette adresse email ».** (cause probable : La personne s’est déjà inscrite (peut-être avec un compte désactivé).) : Recherchez l’adresse dans **Utilisateurs et rôles** avec le statut « Désactivés » inclus, puis réactivez le compte ou attribuez-lui le rôle voulu.
- **Vous ne savez pas si l’invitation par email est bien partie.** (cause probable : L’écran de succès ne signale pas l’envoi ni son échec : il est identique dans les deux cas et n’affiche aucun message à ce sujet.) : Transmettez systématiquement le mot de passe temporaire par un canal sûr, puis vérifiez l’envoi dans la **File de traitements** et dans l’**État de santé** (voir « Superviser les traitements et les emails »). Au besoin, la personne peut aussi utiliser « Mot de passe oublié ? ».
- **La personne dit n’avoir rien reçu.** (cause probable : Email dans les indésirables, adresse mal saisie ou lien expiré (7 jours).) : Faites vérifier le dossier « Courrier indésirable ». Passé 7 jours, la personne utilise « Mot de passe oublié ? » (lien de 30 minutes). Si l’adresse est fausse, créez un nouveau compte avec la bonne adresse et désactivez l’autre.

## 6. Comment attribuer et retirer des rôles <a id="attribuer-et-revoquer-des-roles"></a>

*Donner un rôle avec sa portée et son expiration, le retirer, comprendre les garde-fous.*

Un **rôle** donne des droits ; sa **portée** dit où ils s’appliquent : « Globale » (toute la plateforme), « Une organisation », « Un cours » ou « Une cohorte » (un groupe d’apprenants qui suit une formation ensemble). Une **expiration** facultative retire le rôle automatiquement à une date donnée, pratique pour un remplacement. Tout se fait depuis la carte **Rôles et portées** de la fiche d’un utilisateur.

*Les neuf rôles et leur portée habituelle*

| Rôle | Portée habituelle | Vérification en deux étapes |
| --- | --- | --- |
| Apprenant | Globale | Facultative |
| Responsable d’organisation | Une organisation | Facultative |
| Formateur | Un cours ou une cohorte | Facultative |
| Coordinateur formation | Globale | Obligatoire |
| Éditeur communication | Globale | Obligatoire |
| Responsable services | Globale | Facultative |
| Finance / contrôle | Globale | Obligatoire |
| Support | Globale | Facultative |
| Super administrateur | Globale uniquement | Obligatoire |

> **Piège : super administrateur à portée limitée** : Le dialogue accepte « Super administrateur » avec une portée « Une organisation », « Un cours » ou « Une cohorte », mais un tel rôle n’a aucun effet : seul un super administrateur en portée « Globale » a des droits. Choisissez toujours « Globale (toute la plateforme) » pour ce rôle.

### Attribuer un rôle <a id="attribuer-un-role"></a>

1. Ouvrez la fiche de la personne puis cliquez sur `Attribuer un rôle`.
   - Où : carte **Rôles et portées**, en haut à droite de la carte
   - Résultat attendu : Le dialogue « Attribuer un rôle » s’ouvre (fenêtre centrée, y compris sur mobile).
2. Choisissez le **Rôle** (obligatoire).
   - Remarque : Le sous-titre rappelle que les rôles globaux privilégiés (administration, coordination, finance, édition) exigent la vérification en deux étapes.
3. Choisissez la **Portée** (obligatoire) : **Globale (toute la plateforme)**, **Une organisation**, **Un cours** ou **Une cohorte**.
   - Résultat attendu : Pour une portée limitée, une liste **Choisir** apparaît avec les organisations actives, les cours ou les cohortes planifiées, ouvertes ou en cours.
4. Sélectionnez l’élément de portée dans la liste **Choisir** (obligatoire si la portée n’est pas globale).
5. Renseignez éventuellement **Expiration** (date et heure, facultatif).
   - Remarque : Vide = sans limite. La date doit être dans le futur (« La date d’expiration doit être future »). Personne n’est prévenu à l’expiration : notez-la dans votre agenda si un suivi est nécessaire.
6. Cliquez sur `Attribuer`.
   - Où : en bas du dialogue (pendant l’envoi : « Attribution »)
   - Résultat attendu : Le message « Rôle « X » attribué. » s’affiche, le dialogue se ferme et la nouvelle ligne apparaît dans le tableau avec sa portée et son expiration. La personne reçoit la notification « Nouveau rôle attribué » (interne et par email).
   - Remarque : Si la même combinaison rôle + portée existait déjà, seule l’expiration est mise à jour (« Rôle mis à jour. »). La vérification en deux étapes n’est pas activée automatiquement : la personne doit le faire depuis sa page **Sécurité**.

### Révoquer un rôle <a id="revoquer-un-role"></a>

> **Effet immédiat** : La révocation prend effet dès la page suivante ouverte par la personne. Elle n’est pas prévenue (aucun email) : informez-la vous-même. Pour rétablir le rôle, il faudra l’attribuer de nouveau.

1. Sur la ligne du rôle, cliquez sur `Révoquer`.
   - Où : colonne **Action** du tableau **Rôles et portées**
   - Résultat attendu : La confirmation « Révoquer le rôle « X » ? » précise que l’utilisateur perd immédiatement les droits associés.
2. Cliquez sur `Révoquer` pour confirmer.
   - Résultat attendu : Le message « Rôle « X » révoqué. » s’affiche et la ligne disparaît. Le journal d’audit enregistre « Rôle révoqué ».
3. Si la personne quitte l’équipe, désactivez aussi son compte (voir « Sécuriser un compte ») : la révocation seule ne ferme pas ses sessions.

#### Lire le tableau « Rôles et portées »

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Super administrateur (badge marine) | Rôle le plus élevé ; « Protégé » remplace le bouton `Révoquer` sur votre propre ligne. | Ne peut être retiré ni de vous-même, ni du dernier super administrateur actif. |
| Rôle global (badge bleu) | Le rôle s’applique à toute la plateforme. | Vérifiez la vérification en deux étapes pour les rôles privilégiés. |
| Rôle limité (badge à contour) | Le rôle ne s’applique qu’à l’organisation, au cours ou à la cohorte indiqués dans la colonne **Portée**. | Dans la liste des utilisateurs, ces rôles portent le suffixe « (limité) ». |
| Sans limite | Aucune date d’expiration. | Aucune action. |
| Jusqu’au <date> | Le rôle expirera automatiquement à cette date. | Prolongez-le en attribuant de nouveau le même rôle avec la même portée et une nouvelle date. |
| Expiré le <date> | Le rôle ne donne plus aucun droit ; la ligne reste affichée, grisée. | Révoquez-la pour nettoyer, ou attribuez de nouveau le rôle si nécessaire. |

#### Si l’attribution ou la révocation ne marche pas

- **Message « Une portée limitée exige un identifiant de portée ».** (cause probable : La liste **Choisir** est restée vide.) : Sélectionnez l’organisation, le cours ou la cohorte, ou passez la portée en « Globale ».
- **Message « La portée choisie n’existe pas. ».** (cause probable : L’organisation a été désactivée ou la cohorte fermée entre-temps.) : Rechargez la page et choisissez de nouveau ; vérifiez l’élément dans **Organisations** ou sur la plateforme de formation.
- **Message « Vous ne pouvez pas retirer votre propre rôle de super administrateur ».** (cause probable : Garde-fou contre la perte d’accès.) : Demandez à un autre super administrateur de le faire depuis votre fiche.
- **Message « Au moins un super administrateur actif doit subsister ».** (cause probable : La personne est le dernier super administrateur actif.) : Attribuez d’abord le rôle à une autre personne active, puis révoquez.
- **La personne a bien le rôle mais ne voit pas l’entrée dans le back-office.** (cause probable : Sa page n’a pas été rechargée, le rôle est limité ou expiré, ou elle n’a pas activé la vérification en deux étapes alors que le déploiement l’exige.) : Faites-lui recharger la page ; vérifiez la portée (« Globale ») et l’expiration ; faites-lui activer la vérification depuis **Sécurité**.

## 7. Comment sécuriser ou débloquer un compte <a id="securiser-un-compte"></a>

*Désactiver et réactiver un compte, réinitialiser la vérification en deux étapes, définir un mot de passe temporaire.*

Ces trois actions se trouvent dans la carte **Compte** de la fiche d’un utilisateur (colonne latérale sur ordinateur, sous les autres cartes sur mobile). Chacune demande une confirmation et est inscrite dans le journal d’audit. Aucune ne supprime de données.

### Désactiver puis réactiver un compte <a id="desactiver-et-reactiver-un-compte"></a>

> **Quand désactiver** : Départ d’un membre de l’équipe, compte compromis, usage abusif. La désactivation est réversible : elle bloque la connexion et ferme toutes les sessions ouvertes, mais conserve inscriptions, certificats et commandes. Il n’existe aucune suppression de compte.

1. Ouvrez la fiche de la personne puis cliquez sur `Désactiver le compte`.
   - Où : carte **Compte**
   - Résultat attendu : La confirmation « Désactiver le compte de <nom> ? » rappelle que les sessions seront fermées et les données conservées.
2. Cliquez sur `Désactiver`.
   - Résultat attendu : Le message « Compte <email> désactivé ; ses sessions ont été fermées. » s’affiche ; le badge d’en-tête devient **Compte désactivé**.
   - Remarque : La personne verra « Ce compte est désactivé. Contactez le support de la FETRAG pour le réactiver. » à sa prochaine tentative. Elle ne reçoit aucun email : prévenez-la si nécessaire.
3. Pour rétablir l’accès, cliquez sur `Réactiver le compte` puis sur `Réactiver`.
   - Où : carte **Compte**
   - Résultat attendu : Le message « Compte <email> réactivé. » s’affiche ; la personne peut se reconnecter avec ses identifiants.

### Réinitialiser la vérification en deux étapes d’une personne <a id="reinitialiser-la-mfa"></a>

À utiliser quand une personne a perdu son téléphone et n’a plus de code de secours. Le secret et les codes sont effacés ; elle pourra se reconnecter avec son seul mot de passe puis devra réactiver la vérification depuis **Sécurité** (obligatoire pour un rôle privilégié).

1. Vérifiez l’identité de la personne avant tout (appel sur un numéro connu, question dont seule elle a la réponse).
   - Remarque : Une demande de réinitialisation par simple email peut venir d’un attaquant.
2. Ouvrez sa fiche puis cliquez sur `Réinitialiser la MFA`.
   - Où : carte **Compte** (le bouton est grisé si la vérification n’est pas active)
   - Résultat attendu : La confirmation « Réinitialiser la vérification en deux étapes ? » s’affiche.
3. Cliquez sur `Réinitialiser`.
   - Résultat attendu : Le message « Vérification en deux étapes réinitialisée pour <email>. » s’affiche et le badge **MFA active** disparaît. La personne reçoit la notification « Vérification en deux étapes réinitialisée » (interne et par email).

### Définir un mot de passe temporaire <a id="definir-un-mot-de-passe-temporaire"></a>

> **Action irréversible** : L’ancien mot de passe est remplacé par un mot de passe aléatoire et toutes les sessions de la personne sont fermées. Elle est informée par email (sans le mot de passe) avec un lien pour en choisir un nouveau. Impossible sur votre propre fiche et sur un compte désactivé.

1. Ouvrez la fiche d’un compte actif (autre que le vôtre) puis cliquez sur `Mot de passe temporaire`.
   - Où : carte **Compte**
   - Résultat attendu : Le dialogue « Définir un mot de passe temporaire » rappelle que l’actuel sera remplacé et les sessions fermées.
2. Cliquez sur `Générer et remplacer` (bouton rouge).
   - Résultat attendu : L’alerte « Mot de passe temporaire défini » affiche le nouveau mot de passe (14 caractères) et le message « Copiez-le maintenant : il ne sera plus jamais affiché. »
   - Remarque : Le message de la page précise si l’invitation par email a été envoyée (lien valable 7 jours) ou non.
3. Cliquez sur `Copier` puis transmettez le mot de passe par un canal sûr, seulement si la personne ne peut pas utiliser le lien de l’email.
   - Résultat attendu : Le message « Mot de passe copié » apparaît.
4. Cliquez sur `J’ai transmis le mot de passe`.
   - Résultat attendu : Le dialogue se ferme ; le mot de passe disparaît définitivement.
5. Demandez à la personne de changer ce mot de passe dès sa première connexion.
   - Où : page **Sécurité** › carte **Mot de passe**
   - Remarque : Règle des mots de passe : 8 caractères au moins, une majuscule et un chiffre.

#### Si ça ne marche pas

- **Le bouton `Mot de passe temporaire` n’apparaît pas.** (cause probable : Le compte est désactivé, ou c’est votre propre fiche.) : Réactivez d’abord le compte (« Réactivez le compte avant de définir un mot de passe »). Pour vous-même, utilisez la page **Sécurité**.
- **Le bouton `Réinitialiser la MFA` est grisé.** (cause probable : La vérification en deux étapes n’est pas active sur ce compte.) : Rien à réinitialiser : la personne se connecte avec son mot de passe seul, puis active la vérification.
- **Message « Vous ne pouvez pas désactiver votre propre compte ».** (cause probable : Garde-fou.) : Demandez à un autre super administrateur.
- **La personne a un « fournisseur externe » et pas de mot de passe local.** (cause probable : Son compte est géré par le fournisseur d’identité de la Fédération.) : Le mot de passe se réinitialise chez ce fournisseur, pas dans le back-office.

## 8. Comment régler les paramètres de la Fédération <a id="regler-les-parametres"></a>

*Coordonnées, règles métier, bandeau de maintenance, correction des quiz, et ce qui reste en lecture seule.*

La page **Paramètres** est réservée au super administrateur. Chaque enregistrement est journalisé (« Paramètres modifiés ») avec les valeurs avant et après, et le site public est mis à jour aussitôt. La page est longue : sur mobile, faites-la défiler ; l’ancre « #jobs » ramène à la **File de traitements**.

Chemin : Barre latérale › Administration › Paramètres (`/admin/parametres`)

### Modifier les coordonnées et les règles métier

1. Ouvrez **Paramètres**.
   - Où : section **Administration** de la barre latérale
   - Résultat attendu : Le formulaire du haut affiche les sections **Coordonnées de la fédération**, **Règles métier** et **Maintenance**.
2. Dans **Coordonnées de la fédération**, corrigez **Adresse postale** (obligatoire, 5 à 200 caractères), **Email de contact** (obligatoire), **Email du support** (facultatif, utilisé pour l’assistance) et **Téléphones** (obligatoire : un numéro par ligne, quatre au plus, 6 à 20 caractères chacun).
   - Remarque : Ces coordonnées apparaissent dans le pied de page, les emails et les documents générés (reçus, certificats).
3. Dans **Règles métier**, vérifiez **Devise des tarifs** (code à 3 lettres, « XAF »), **Participants par demande de formation** (entier de 1 à 500) et **Devise institutionnelle** (exactement trois mots séparés par des virgules).
   - Remarque : « Participants par demande de formation » limite le nombre de personnes qu’un responsable d’organisation peut désigner dans une demande. Ne modifiez la devise des tarifs qu’après accord de la finance.
4. Cliquez sur `Enregistrer les paramètres`.
   - Où : en bas du formulaire (pendant l’envoi : « Enregistrement »)
   - Résultat attendu : L’alerte et le message « Paramètres enregistrés. » s’affichent.

### Si l’enregistrement ne marche pas

- **Message « Certains paramètres sont invalides. »** (cause probable : Un champ ne respecte pas sa règle : « Au moins un numéro », « Code devise ISO à 3 lettres », « La devise comporte trois mots ».) : Lisez le texte rouge sous le champ, corrigez, puis enregistrez de nouveau.
- **Le compteur **Dernier numéro séquentiel attribué** ou un drapeau fonctionnel ne peut pas être modifié.** (cause probable : Ces éléments sont en lecture seule dans l’interface (voir ci-dessous).) : Le compteur des certificats avance seul ; les drapeaux se règlent dans l’environnement d’hébergement par l’exploitant.

### Afficher un bandeau de maintenance <a id="bandeau-de-maintenance"></a>

Avant une intervention planifiée, prévenez les utilisateurs par un bandeau affiché sur le site et sur la plateforme de formation. L’accès reste ouvert : le bandeau informe, il ne bloque rien.

1. Dans la section **Maintenance**, cochez **Afficher le bandeau de maintenance**.
   - Où : formulaire du haut de **Paramètres**
2. Rédigez le **Message** (facultatif, 300 caractères au plus), par exemple la date, l’heure et les services concernés.
   - Remarque : Rédigez toujours un message : c’est lui que reprend l’alerte de la page **Paramètres** (sans message, elle indique seulement « Un message de maintenance est affiché sur le site et la plateforme de formation. »).
3. Cliquez sur `Enregistrer les paramètres`.
   - Résultat attendu : L’alerte « Bandeau de maintenance actif » apparaît en haut de la page **Paramètres**.
4. Contrôlez l’affichage sur le site public avec **Voir le site** (nouvel onglet).
   - Où : barre supérieure (sur mobile, depuis le tableau de bord)
   - Remarque : Si le bandeau n’apparaît pas sur le site alors que l’alerte est active dans **Paramètres**, signalez-le à l’équipe de développement (voir « Besoin d’aide ? »).
5. Après l’intervention, décochez la case et cliquez de nouveau sur `Enregistrer les paramètres`.
   - Résultat attendu : L’alerte et le bandeau disparaissent.

### Régler la correction des quiz <a id="correction-des-quiz"></a>

1. Descendez jusqu’à la carte **Évaluations**.
   - Où : page **Paramètres**
   - Résultat attendu : La case **Crédit partiel aux questions à choix multiples** indique la règle en vigueur.
2. Cochez la case pour qu’une bonne réponse cochée rapporte une fraction des points (les mauvaises en retirent), ou décochez-la pour que la question vaille tout ou rien.
   - Remarque : Décidez avec la coordination formation : la règle s’applique à toutes les corrections automatiques futures sur la plateforme de formation.
3. Cliquez sur `Enregistrer` dans la carte.
   - Résultat attendu : « Crédit partiel activé pour les quiz. » ou « Crédit partiel désactivé : une question à choix multiples n’est comptée que si toutes les bonnes réponses sont cochées. »

### Ce qui est affiché mais non modifiable <a id="parametres-en-lecture-seule"></a>

*Cartes en lecture seule de la page Paramètres*

| Carte | Ce qu’elle montre | Qui peut agir |
| --- | --- | --- |
| Certificats | **Dernier numéro séquentiel attribué** : le compteur de numérotation des certificats, incrémenté à chaque émission. | Personne : il avance automatiquement. |
| Drapeaux fonctionnels | **Authentification locale**, **Fournisseur d’identité externe (OIDC)**, **Paiements en ligne**, **Forums de formation**, **Lettre d’information**, avec le badge « Activé » / « Désactivé ». | L’exploitant, dans les variables d’environnement du déploiement. |

> **Demander une bascule** : Pour activer ou désactiver une fonctionnalité optionnelle (paiement en ligne, forums, lettre d’information), adressez une demande écrite à l’exploitant en indiquant le drapeau concerné et la date souhaitée. La modification apparaîtra dans cette carte après redéploiement.

## 9. Comment gérer les clés API <a id="gerer-les-cles-api"></a>

*Donner à une intégration externe un accès à l’API, puis le retirer.*

Une **clé API** est un long code secret qu’un logiciel partenaire présente à chaque appel de l’**API** (l’interface technique qui permet à un autre système de lire ou d’écrire des données de la plateforme). Le back-office ne conserve qu’une empreinte de la clé : elle n’est lisible qu’au moment de sa création. Au plus 20 clés actives peuvent exister.

Chemin : Barre latérale › Administration › Paramètres › Carte « Clés API » (`/admin/parametres`)

### Générer une clé

1. Dans la carte **Clés API**, cliquez sur `Générer une clé`.
   - Où : page **Paramètres**, en haut à droite de la carte
   - Résultat attendu : Le dialogue « Nouvelle clé API » s’ouvre.
2. Saisissez un **Libellé** (obligatoire, 3 à 80 caractères) qui décrit l’usage et le partenaire, par exemple « Tableau de bord externe ».
3. Choisissez la **Portée** : **Lecture seule** (par défaut) ou **Lecture et écriture**.
   - Remarque : Donnez le minimum nécessaire : la lecture seule suffit à la plupart des tableaux de bord externes.
4. Cliquez sur `Générer`.
   - Résultat attendu : L’alerte « Clé générée » affiche la clé une seule fois avec le message « Copiez-la maintenant : elle ne sera plus jamais affichée. »
5. Cliquez sur `Copier` puis transmettez la clé au partenaire par un canal sûr (jamais dans un email en clair, un ticket ou un groupe de discussion).
   - Résultat attendu : Le message « Clé copiée » apparaît.
6. Cliquez sur `J’ai copié la clé`.
   - Résultat attendu : La clé apparaît dans le tableau avec son **Libellé**, son **Préfixe**, sa **Portée** et l’état « Active ».
   - Remarque : Le partenaire envoie la clé dans l’en-tête « X-API-Key » de ses appels. Les détails techniques sont dans la documentation de l’API, pas dans ce guide.

> **Révocation irréversible** : Révoquer une clé la refuse immédiatement et pour toujours ; elle reste listée avec « Révoquée le <date> ». Prévenez le partenaire et donnez-lui la nouvelle clé avant de révoquer l’ancienne.

### Révoquer ou renouveler une clé

1. Pour renouveler, générez d’abord la nouvelle clé (étapes ci-dessus) et transmettez-la au partenaire.
   - Remarque : Les clés n’ont pas de date d’expiration : renouvelez-les à intervalle régulier (au moins une fois par an) et dès qu’une personne ayant eu accès à la clé quitte le partenaire.
2. Sur la ligne de l’ancienne clé, cliquez sur `Révoquer`.
   - Où : colonne **Action** du tableau
   - Résultat attendu : La confirmation « Révoquer « <libellé> » ? » prévient que les intégrations utilisant cette clé seront immédiatement refusées.
3. Cliquez sur `Révoquer` pour confirmer.
   - Résultat attendu : Le message « Clé « X » révoquée. » s’affiche ; l’état passe à « Révoquée le <date> » et le compteur « N clé(s) active(s) · N révoquée(s) » se met à jour.

### États et portées des clés

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Active | La clé est acceptée par l’API. | Vérifiez régulièrement que son usage est toujours justifié. |
| Révoquée le <date> | La clé est définitivement refusée ; la ligne reste pour l’historique. | Aucune action possible. |
| Lecture | La clé ne peut que consulter des données. | Portée à privilégier. |
| Lecture / écriture | La clé peut aussi créer ou modifier des données. | À réserver aux intégrations qui en ont vraiment besoin. |

### Si ça ne marche pas

- **Message « Limite de 20 clés actives atteinte : révoquez une clé avant d’en créer une nouvelle. »** (cause probable : Trop de clés en circulation.) : Révoquez les clés dont le libellé ne correspond plus à une intégration en service.
- **Le partenaire dit que ses appels sont refusés.** (cause probable : Clé révoquée, mal copiée (espace en trop) ou portée insuffisante (écriture demandée avec une clé en lecture).) : Vérifiez l’état et la portée dans le tableau ; si besoin, générez une nouvelle clé avec la bonne portée.
- **Vous avez fermé le dialogue sans copier la clé.** (cause probable : La clé n’est affichée qu’une fois.) : Révoquez cette clé et générez-en une nouvelle.

## 10. Comment superviser les traitements et les emails <a id="superviser-les-traitements"></a>

*Lire la file de traitements, relancer ou annuler une tâche, diagnostiquer les emails non délivrés, consulter l’état de santé.*

Les envois d’emails, les rendus de certificats et de reçus (fichiers PDF), les webhooks de paiement (messages envoyés par le service de paiement), les publications planifiées et les rappels de session ne sont pas exécutés pendant que vous cliquez : ils sont placés dans une **file de traitements** (aussi appelée file de jobs, un « job » étant une tâche de fond) et exécutés en arrière-plan toutes les cinq minutes par un déclencheur automatique (le **cron**). Une tâche qui échoue est réessayée automatiquement avec un délai croissant (2, 4, 8, 16, 32 minutes, jusqu’à 24 h), cinq fois au plus ; ensuite elle est « abandonnée ».

Chemin : Barre latérale › Administration › Paramètres › Section « File de traitements » (`/admin/parametres#jobs`)

### Lire la file de traitements <a id="lire-la-file-de-traitements"></a>

1. Ouvrez **Paramètres** et descendez jusqu’à la section **File de traitements**.
   - Où : ancre « #jobs » en bas de la page
   - Résultat attendu : Quatre tuiles : **En file d’attente** (avec « N à exécuter maintenant · N en cours »), **Réussies**, **En échec (réessai planifié)** (avec « N abandonnée(s) »), **Emails non délivrés sur 24 h**.
2. Si une alerte « N tâche(s) en échec ou abandonnée(s) · N email(s) non délivré(s) sur 24 h » est affichée, filtrez la liste : **Statut** = « En échec » ou « Abandonnées », **Type** au choix, puis `Filtrer`.
   - Résultat attendu : Le tableau « Tâches de fond » (10 par page) ne montre plus que ces tâches ; les lignes en échec ou abandonnées sont surlignées en or.
3. Lisez la colonne **Dernière erreur** (ordinateur) pour comprendre la cause.
   - Remarque : Sur mobile, seules les colonnes **Tâche**, **Statut** et les actions sont visibles ; passez sur un ordinateur pour lire l’erreur complète.

#### Statuts des tâches de fond

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| En file d’attente | La tâche sera exécutée dès sa date prévue, au prochain passage du cron. | Annulable avec `Annuler`. |
| En cours | Un exécutant a verrouillé la tâche. | Si elle reste « En cours » plus de 10 minutes, elle est reprise automatiquement. |
| Réussi | Terminée sans erreur. | Aucune action. |
| Échoué | La tâche a échoué et sera réessayée avec un délai croissant. La pastille affiche « Échoué » ; le filtre **Statut** et la tuile parlent, eux, d’« En échec ». | `Relancer` pour ne pas attendre, `Annuler` si elle n’a plus de sens. |
| Abandonné | Tentatives épuisées ou annulation manuelle (motif dans **Dernière erreur**). | `Relancer` après avoir corrigé la cause. |

*Types de tâches et ce qu’un échec signifie*

| Type | Ce que fait la tâche | Si elle échoue |
| --- | --- | --- |
| Envoi d’email | Envoie un email (invitation, confirmation, notification). | Le destinataire ne reçoit rien ; vérifiez le service d’email (état de santé). |
| Rendu de certificat | Produit le PDF d’un certificat. | L’apprenant ne peut pas télécharger son certificat ; relancez. |
| Rendu de reçu | Produit le PDF d’un reçu de paiement. | Le reçu manque dans l’espace de l’acheteur ; relancez. |
| Notification | Crée une notification interne et son email éventuel. | La personne n’est pas prévenue ; relancez. |
| Webhook de paiement | Traite un message du service de paiement. | Une commande peut rester « en attente » ; prévenez la finance. |
| Publication planifiée | Publie un contenu à la date prévue. | Le contenu reste en attente ; prévenez l’éditeur. |
| Rappel de session | Envoie les rappels avant une session de formation. | Les apprenants ne sont pas rappelés ; prévenez la coordination. |
| Export | Produit un fichier d’export. | Relancez ou refaites l’export. |
| Expiration d’inscription | Clôture les inscriptions arrivées à échéance. | Relancez ; sans conséquence immédiate pour les apprenants. |

### Relancer ou annuler une tâche <a id="relancer-ou-annuler-une-tache"></a>

1. Pour relancer une tâche « En échec » ou « Abandonnée », cliquez sur `Relancer` sur sa ligne.
   - Où : colonne des actions (à droite sur ordinateur, empilée sous la tâche sur mobile)
   - Résultat attendu : La confirmation « Relancer « <type> » ? » rappelle que le compteur de tentatives repart de zéro.
2. Cliquez sur `Relancer` pour confirmer.
   - Résultat attendu : Le message « Tâche « <type> » remise en file. » s’affiche ; la tâche passe « En file d’attente » et sera exécutée au prochain passage (cinq minutes au plus).
   - Remarque : Relancer sans avoir corrigé la cause (service d’email en panne, par exemple) produira un nouvel échec.
3. Pour annuler une tâche « En file d’attente » ou « En échec » devenue inutile, cliquez sur `Annuler` puis sur `Annuler la tâche`.
   - Résultat attendu : Le message « Tâche « <type> » annulée. » s’affiche ; la tâche passe « Abandonnée » avec le motif « Annulée par <votre email> ».
4. Pour revenir à la liste après un filtrage ou un changement de page, utilisez l’ancre « #jobs » de l’adresse ou faites défiler jusqu’à la section.

> **Avant d’annuler** : L’annulation empêche définitivement l’exécution (une tâche annulée peut toutefois être relancée). N’annulez jamais un « Webhook de paiement » sans l’accord de Finance / contrôle : il peut confirmer un paiement réel.

### Diagnostiquer les emails non délivrés <a id="diagnostiquer-les-emails"></a>

Il n’existe pas d’écran listant chaque email envoyé. Vous disposez du compteur **Emails non délivrés sur 24 h** (emails en échec ou rejetés par le destinataire), des tâches « Envoi d’email » en échec, et de l’**État de santé** qui indique quel service d’email est effectivement utilisé.

1. Lisez la tuile **Emails non délivrés sur 24 h** dans la section **File de traitements**.
   - Remarque : Quelques échecs isolés sont normaux (adresse erronée, boîte pleine). Une hausse brutale signale une panne du service d’email.
2. Filtrez les tâches par **Type** = « Envoi d’email » et **Statut** = « En échec », puis lisez **Dernière erreur**.
   - Résultat attendu : Une même erreur répétée (clé refusée, service injoignable) confirme un problème de fournisseur.
3. Cliquez sur `État de santé`.
   - Où : en haut à droite de la page **Paramètres**
   - Résultat attendu : Un nouvel onglet affiche un texte technique (JSON) : « ok », le fournisseur d’email effectif (« console », « resend » ou « smtp »), si un expéditeur est configuré et les contrôles « database » et « config ».
   - Remarque : « console » signifie qu’aucun email n’est réellement envoyé : c’est un réglage de test à corriger par l’exploitant. Le rapport ne montre jamais de valeur secrète, seulement des noms de variables.
4. Transmettez le constat à l’exploitant avec le runbook « panne-email » du dépôt (dossier docs/runbooks) ; une fois le service rétabli, les emails en échec sont remis en file automatiquement (pendant 7 jours, cinq tentatives), ou relancez-les vous-même.

#### Si la file n’avance pas

- **Le compteur « N à exécuter maintenant » grossit sans que rien ne passe en « Réussies ».** (cause probable : Le déclencheur automatique (cron) ne s’exécute plus, ou son secret a changé.) : Prévenez l’exploitant avec le runbook « jobs-bloques » : le cron doit être actif chez l’hébergeur et la variable de son secret valide.
- **Une tâche reste « En cours » depuis longtemps.** (cause probable : Un exécutant s’est arrêté en cours de route.) : Attendez 10 minutes : la tâche est reprise automatiquement. Si cela se répète, signalez-le.
- **L’**État de santé** affiche « ok : false » ou une page d’erreur.** (cause probable : Base de données injoignable ou variable de configuration manquante (« Variables manquantes : … »).) : Incident prioritaire : prévenez immédiatement l’exploitant (runbook « supervision »).

## 11. Comment modifier les menus de navigation <a id="modifier-les-menus"></a>

*Ajouter, réordonner et supprimer les liens des menus du site et de la plateforme de formation.*

Quatre emplacements sont modifiables : **Navigation principale** (barre du site), **Pied de page**, **Pied de page secondaire** (liens légaux) et **Navigation de la plateforme de formation**. L’Éditeur communication dispose du même écran. Un menu vide laisse la navigation par défaut. Rien n’est enregistré avant `Enregistrer le menu` : recharger la page annule vos modifications.

Chemin : Barre latérale › Contenus › Menus › Modifier l’arborescence (`/admin/menus`)

1. Ouvrez **Menus** puis cliquez sur `Modifier l’arborescence` sur la carte de l’emplacement voulu.
   - Où : section **Contenus** de la barre latérale
   - Résultat attendu : L’éditeur s’ouvre avec le champ **Nom du menu**, le badge « N entrée(s) » et la liste des entrées.
2. Pour chaque entrée, renseignez **Libellé** (obligatoire, 1 à 80 caractères) et **Adresse** (obligatoire : un chemin commençant par « / » ou une adresse complète en https).
   - Remarque : **Icône** (facultatif) attend un nom d’icône du jeu « lucide » ; laissez vide en cas de doute. Cochez **Lien externe** pour un site tiers (c’est automatique pour une adresse en https).
3. Réordonnez avec les boutons **Monter** et **Descendre**.
   - Remarque : Sur ordinateur, vous pouvez aussi glisser-déposer une entrée avec sa poignée « Glisser pour réordonner » (entre entrées de même niveau). Sur mobile, la poignée est masquée : utilisez les boutons.
4. Pour créer un sous-menu, cliquez sur **Transformer en sous-menu** : l’entrée se rattache à celle du dessus. **Remonter d’un niveau** fait l’inverse ; **Ajouter une sous-entrée** crée un enfant.
   - Remarque : Deux niveaux au plus dans l’éditeur ; les sous-entrées sont indentées avec un filet vert.
5. Cliquez sur `Ajouter une entrée` pour un nouvel élément de premier niveau.
   - Où : en bas à gauche
   - Résultat attendu : Une entrée vide apparaît avec l’adresse « / ».
6. Pour retirer un lien, cliquez sur **Supprimer <libellé>** (bouton rouge) sur son entrée.
   - Remarque : Supprimer une entrée de premier niveau supprime aussi ses sous-entrées.
7. Cliquez sur `Enregistrer le menu`.
   - Où : en bas à droite (pendant l’envoi : « Enregistrement »)
   - Résultat attendu : Le message « Menu « <nom> » enregistré (N entrée(s) de premier niveau). » s’affiche et le site public est mis à jour.
8. Vérifiez le résultat avec **Voir le site** (nouvel onglet).
   - Où : barre supérieure (sur mobile, depuis le tableau de bord)

### Si l’enregistrement ne marche pas

- **Message « URL invalide (http(s) ou chemin relatif) » sous une adresse.** (cause probable : L’adresse ne commence ni par « / » ni par « http ».) : Saisissez par exemple « /formations » pour une page du site, ou l’adresse complète « https://… » pour un site externe.
- **Message « Un menu ne peut pas contenir plus de 120 entrées » ou « Un menu ne peut pas dépasser 3 niveaux ».** (cause probable : Limites du menu (40 entrées de premier niveau, 30 sous-entrées par entrée).) : Regroupez ou supprimez des entrées.
- **Le menu du site ne change pas après enregistrement.** (cause probable : Page du site encore en cache dans votre navigateur.) : Rechargez la page du site ; si le menu est vide, la navigation par défaut est affichée.

## 12. Comment consulter le journal d’audit <a id="consulter-le-journal-d-audit"></a>

*Retrouver qui a fait quoi et quand, lire le détail avant / après, exporter en CSV.*

Le **Journal d’audit** est la trace immuable des actions sensibles : connexions, rôles, paiements, certificats, publications, exports et paramètres. Il ne peut être ni modifié ni effacé depuis l’interface. Les adresses IP y sont conservées sous forme d’empreinte (un code qui ne permet pas de retrouver l’adresse). Finance / contrôle y a aussi accès.

Chemin : Barre latérale › Administration › Journal d’audit (`/admin/audit`)

1. Ouvrez **Journal d’audit**.
   - Où : section **Administration** de la barre latérale
   - Résultat attendu : Trois tuiles (**Entrées journalisées**, **Types d’action distincts**, **Types d’entité concernés**) puis le tableau, 20 entrées par page, les plus récentes en premier.
2. Filtrez : champ de recherche (identifiant d’entité, email de l’acteur ou corrélation), liste **Action**, liste **Entité**, **Période** (**Du** / **Au**), champ **Acteur (email)** ; puis cliquez sur `Filtrer`.
   - Remarque : Le filtre **Action** fonctionne par préfixe : « Connexion » capte aussi les « Échec de connexion » (même famille), mais pas les déconnexions, qui ont leur propre entrée « Déconnexion » dans la liste **Action**. Pour une revue de sécurité, filtrez explicitement par « Échec de connexion » (voir « Faire la revue mensuelle des comptes privilégiés »). La date **Au** est incluse jusqu’à la fin de la journée. Sur mobile, les deux dates sont côte à côte.
3. Sur une ligne, cliquez sur `Détail` pour ouvrir les colonnes **Avant** et **Après**.
   - Résultat attendu : Le contenu technique (JSON) montre les valeurs modifiées ; sur mobile, il défile dans un cadre.
   - Remarque : Sur mobile, seules les colonnes **Horodatage**, **Action** (avec le badge d’entité) et **Détail** sont visibles ; **Acteur** et **Entité** apparaissent sur ordinateur. L’acteur « Système » désigne une tâche automatique.
4. Depuis la fiche d’un utilisateur, cliquez sur **Tout le journal** dans la carte **Journal d’audit**.
   - Résultat attendu : Le journal s’ouvre déjà filtré sur l’email de cette personne.
5. Pour conserver ou analyser les entrées, cliquez sur `Exporter (CSV)`.
   - Où : en haut à droite (sous le titre sur mobile)
   - Résultat attendu : Un fichier « fetrag-journal-audit-<horodatage>.csv » est téléchargé avec les filtres courants (5 000 lignes au plus, séparateur point-virgule, dates en UTC). L’export est lui-même journalisé (« Export généré »).

*Actions à surveiller et ce qu’elles signifient*

| Action affichée | Ce qui s’est passé | Quand s’inquiéter |
| --- | --- | --- |
| Échec de connexion | Mot de passe ou code refusé. | Rafale sur un même compte ou depuis une même empreinte IP : tentative d’intrusion. |
| Rôle attribué / Rôle révoqué | Un droit a été donné ou retiré. | Action que vous n’avez pas faite : compte de super administrateur compromis. |
| Compte créé / Compte modifié | Création, désactivation, réinitialisation MFA, mot de passe temporaire. | Création inattendue d’un compte privilégié. |
| Paramètres modifiés | Paramètres, clé API, relance ou annulation de tâche. | Modification hors d’une intervention connue. |
| Export généré | Un fichier CSV a été téléchargé (audit, rapports, finance). | Exports répétés de données personnelles. |
| Paiement réussi / Remboursement | Mouvement financier. | À rapprocher avec Finance / contrôle. |
| Certificat émis / Certificat révoqué | Cycle de vie d’un certificat. | Révocation non justifiée par la coordination. |
| Contenu publié | Une page, actualité ou ressource est en ligne. | Publication hors du circuit de relecture. |

### Si vous ne trouvez pas une entrée

- **Aucune entrée pour une action que vous savez récente.** (cause probable : Filtre trop restrictif (période, acteur) ou action portée par « Système ».) : Cliquez sur `Réinitialiser` puis filtrez seulement par **Action** ; laissez **Acteur (email)** vide pour inclure les tâches automatiques.
- **L’action apparaît sous un code technique (par exemple « auth.login ») sans libellé.** (cause probable : Action non traduite dans la liste des libellés.) : Le code reste lisible : la première partie indique la famille (auth, role, payment, content…).
- **L’export s’arrête à 5 000 lignes.** (cause probable : Limite volontaire de l’export.) : Réduisez la **Période** et exportez en plusieurs fois.

## 13. Comment consulter et exporter les rapports <a id="consulter-les-rapports"></a>

*Indicateurs du site et de la plateforme de formation, contenus populaires, exports CSV.*

Chemin : Barre latérale › Administration › Rapports (`/admin/rapports`)

1. Ouvrez **Rapports**.
   - Où : section **Administration** de la barre latérale, ou bouton `Rapports détaillés` du tableau de bord
   - Résultat attendu : La section **Site institutionnel · 30 derniers jours** (pages vues, formulaires, inscriptions aux événements, conversion des commandes) puis la section **Plateforme de formation** (apprenants actifs, inscriptions, complétion, certificats, qualité) et la carte **Contenus populaires**.
   - Remarque : Les statistiques sont calculées sans cookie de suivi. Si un calcul échoue, une alerte « Indicateurs indisponibles » invite à réessayer plus tard.
2. Pour exporter, cliquez sur `Indicateurs du site`, `Indicateurs de formation` ou `Contenus populaires` dans la carte **Exports CSV**.
   - Résultat attendu : Un fichier « fetrag-rapport-<type>-<horodatage>.csv » est téléchargé (UTF-8, séparateur point-virgule) ; l’export est journalisé.
3. Pour les rapports détaillés de la formation, cliquez sur `Rapports détaillés du LMS`.
   - Où : en haut à droite
   - Résultat attendu : L’espace de coordination de la plateforme de formation s’ouvre sur ses rapports.

> **Qui utilise ces rapports** : La coordination, l’édition et la finance ont le même accès. Votre rôle est surtout de vérifier que les chiffres sont cohérents avec l’activité (par exemple, aucune inscription pendant une semaine peut signaler un problème technique) et de transmettre les exports demandés par le secrétariat général.

## 14. Comment veiller à la sécurité de la plateforme <a id="securite-de-la-plateforme"></a>

*Revue mensuelle des comptes privilégiés, rotation des secrets, réaction à un incident, sessions.*

La sécurité repose sur trois habitudes : des comptes privilégiés nominatifs et protégés, des secrets techniques renouvelés hors du back-office, et une lecture régulière du journal d’audit. Les procédures détaillées sont dans les **runbooks** (fiches d’exploitation pas à pas) du dossier « docs/runbooks » du dépôt : « rotation-secrets », « incident-securite », « supervision », « jobs-bloques », « panne-email », « restauration-base », « deploiement ».

### Faire la revue mensuelle des comptes privilégiés <a id="revue-mensuelle-des-comptes"></a>

1. Ouvrez **Utilisateurs et rôles** et filtrez par **Rôle** = « Super administrateur ».
   - Résultat attendu : Vérifiez que chaque compte correspond à une personne en fonction, que le badge « MFA » est présent et que la **Dernière connexion** est récente.
2. Répétez avec « Coordinateur formation », « Finance / contrôle » et « Éditeur communication ».
   - Remarque : Ces trois rôles doivent aussi avoir la vérification en deux étapes ; rappelez-la aux personnes sans badge.
3. Filtrez par **Statut** = « Actifs » et repérez les comptes de l’équipe jamais connectés ou inactifs depuis des mois.
   - Résultat attendu : Révoquez les rôles inutiles et désactivez les comptes des personnes parties.
4. Ouvrez **Journal d’audit**, filtrez **Action** = « Échec de connexion » sur le mois écoulé.
   - Résultat attendu : Une rafale d’échecs sur un compte privilégié doit être signalée à la personne et traitée comme un incident potentiel.
5. Ouvrez **Paramètres** › **Clés API** et confirmez que chaque clé active correspond à une intégration toujours en service.

### Renouveler les secrets techniques (hors interface) <a id="rotation-des-secrets"></a>

Les secrets techniques (clé de session, accès à la base de données, secret du cron, secret des webhooks de paiement, clé du service d’email, stockage, fournisseur d’identité) ne sont pas visibles ni modifiables dans le back-office : ils vivent dans les variables d’environnement de l’hébergeur. Seules les clés API des partenaires se gèrent dans l’interface.

1. Planifiez la rotation avec l’exploitant en suivant le runbook « rotation-secrets » : générer la nouvelle valeur, la déployer sur les deux applications, redéployer, vérifier, révoquer l’ancienne.
   - Remarque : Périodicité indicative : au moins une fois par an, et immédiatement après le départ d’une personne ayant eu accès ou en cas de fuite soupçonnée.
2. Prévenez les utilisateurs si la clé de session est renouvelée : tout le monde est déconnecté des deux plateformes.
   - Remarque : Planifiez-la en heure creuse et affichez le bandeau de maintenance avant.
3. Après la rotation, cliquez sur `État de santé` dans **Paramètres** et vérifiez « ok : true ».
   - Résultat attendu : Les contrôles « database » et « config » sont au vert.
4. Notez la rotation (date, secret concerné, personne) dans le journal d’exploitation, sans jamais écrire la valeur.

> **Jamais de secret en clair** : Ne collez jamais un secret, une clé API ou un mot de passe dans un email, un ticket, un groupe de discussion ou ce guide. Si une valeur a circulé, considérez-la comme compromise et renouvelez-la.

### Réagir à un incident de sécurité <a id="reagir-a-un-incident"></a>

1. Qualifiez l’incident avec le runbook « incident-securite » (gravité P1 à P3) : compte compromis, fuite de données, intrusion, indisponibilité.
2. Contenez : désactivez le compte suspect (`Désactiver le compte`) ou définissez-lui un mot de passe temporaire (`Mot de passe temporaire`) pour fermer ses sessions ; révoquez les rôles ou clés API concernés.
   - Résultat attendu : Chaque action est journalisée et servira au rapport d’incident.
3. Collectez les preuves : exportez le **Journal d’audit** sur la période concernée (`Exporter (CSV)`).
4. Informez le secrétariat général et l’exploitant ; ne communiquez pas les détails techniques en dehors de ce cercle avant la fin de l’analyse.

> **Sessions ouvertes** : La fiche d’un utilisateur affiche « N session(s) ouverte(s) » mais ne permet pas de fermer une session précise. Pour déconnecter quelqu’un de partout : désactivez le compte (puis réactivez-le) ou définissez un mot de passe temporaire.

## 15. Comment déléguer : quel rôle pour quelle tâche <a id="deleguer-et-gouverner"></a>

*Confier chaque activité au bon rôle, garder pour vous les opérations sensibles, retrouver les guides des autres rôles.*

Vous pouvez tout faire, mais vous ne devez pas tout faire : un super administrateur qui rédige des actualités ou traite des remboursements avec son compte rend le journal d’audit illisible et concentre les risques. Attribuez le rôle adapté et renvoyez chaque personne vers son guide.

*Qui fait quoi*

| Activité | Rôle à attribuer | Guide à transmettre |
| --- | --- | --- |
| Pages, actualités, catégories, ressources, médias, menus, FAQ, événements, partenaires, messages de contact, d’adhésion et de partenariat, newsletter | Éditeur communication | [Guide de l’éditeur](/admin/guide/web-editeur) |
| Catalogue des services, demandes de service, messages de type service | Responsable services | [Guide du responsable services](/admin/guide/web-services) |
| Commandes, paiements, remboursements, prises en charge, exports financiers, journal d’audit | Finance / contrôle | [Guide de la finance](/admin/guide/web-finance) |
| Assistance aux utilisateurs, lecture des demandes et des messages d’assistance, consultation des comptes | Support | [Guide du support](/admin/guide/web-support) |
| Formations, cohortes, certificats, demandes de formation, organisations, rapports | Coordinateur formation | [Guide de la coordination](/admin/guide/web-coordination) et espace de coordination de la plateforme de formation |
| Animation d’un cours, correction, présence | Formateur (portée cours ou cohorte) | Guide du formateur, sur la plateforme de formation |
| Dépôt des demandes de formation d’une organisation | Responsable d’organisation (portée organisation) | Guide du responsable d’organisation, dans l’espace personnel |

### À garder pour le super administrateur

- [x] Création de comptes, attribution et révocation de rôles.
- [x] Désactivation et réactivation de comptes, réinitialisation de la vérification en deux étapes, mots de passe temporaires.
- [x] Paramètres de la Fédération, bandeau de maintenance, règle de correction des quiz.
- [x] Clés API et file de traitements.
- [x] Relation avec l’exploitant : état de santé, secrets, incidents.

### Tous les guides

- [Guides du site institutionnel](/admin/guide) : Liste de tous les guides du back-office ; vous seul les voyez tous.
- [Guide du membre](/espace/guide) : Compte, espace personnel, sécurité : le guide commun à tous les comptes.
- [Guide du super administrateur de la plateforme de formation](https://formation.fetrag.ga/admin/guide) : Cours, banque de questions, modèles de certificats, réglages de la plateforme de formation.
- [Espace de coordination de la plateforme de formation](https://formation.fetrag.ga/coordination) : Cohortes, demandes de formation, certificats, rapports détaillés.

> **Guides et accès** : Chaque rôle ne voit que son guide et le guide commun. Quand vous attribuez un rôle, indiquez à la personne où trouver son guide : dans le back-office pour les rôles institutionnels, dans l’espace personnel pour le responsable d’organisation, sur la plateforme de formation pour les formateurs et les apprenants.

## 16. Opérations sensibles et irréversibles <a id="operations-sensibles"></a>

*Le récapitulatif de ce qui ne se défait pas, et de ce qui se défait.*

*Avant de cliquer*

| Opération | Réversible ? | Conséquence immédiate |
| --- | --- | --- |
| Désactiver un compte | Oui (`Réactiver le compte`) | Connexion refusée, sessions fermées, données conservées. |
| Révoquer un rôle | Oui (attribuer de nouveau) | Droits retirés dès la page suivante ; personne n’est prévenu. |
| Réinitialiser la MFA | Non (la personne doit la réactiver) | Secret et codes de secours effacés ; email envoyé. |
| Mot de passe temporaire | Non (ancien mot de passe perdu) | Sessions fermées ; email d’invitation envoyé sans le mot de passe. |
| Révoquer une clé API | Non | Intégration refusée immédiatement. |
| Annuler une tâche | Partiellement (`Relancer` possible) | La tâche n’est plus exécutée ; motif conservé. |
| Relancer une tâche | Oui (`Annuler`) | Exécution au prochain passage du cron. |
| Enregistrer un menu | Non (l’ancien arbre est remplacé) | Navigation du site mise à jour ; l’ancienne version n’est pas conservée. |
| Enregistrer les paramètres | Oui (ressaisir les valeurs) | Site public mis à jour ; valeurs avant / après dans le journal. |
| Exporter (CSV) | Sans objet | Fichier de données personnelles sur votre appareil ; export journalisé. |

> **Notez le motif** : Le journal d’audit enregistre l’action, pas l’intention. Avant une opération sensible, notez le motif (demande écrite, date, personne) dans votre journal d’exploitation pour pouvoir le justifier plus tard.

## 17. Notifications et emails que vous recevez <a id="notifications"></a>

*Ce qui arrive dans votre boîte email et dans vos notifications, et ce qu’il faut en faire.*

Le rôle de super administrateur ne déclenche aucune notification qui lui soit propre : les alertes de traitements sont affichées dans le back-office, pas envoyées par email. Vous recevez les emails de compte de tout utilisateur, et vous voyez vos notifications dans **Notifications** (menu du compte).

*Emails et notifications*

| Sujet ou titre | Déclencheur | Ce qu’il faut faire |
| --- | --- | --- |
| « Réinitialisation de votre mot de passe FETRAG » | Vous avez cliqué sur « Mot de passe oublié ? ». | Cliquer sur le lien dans les 30 minutes. Si vous n’êtes pas à l’origine de la demande, ignorez-le et signalez-le. |
| « Votre mot de passe FETRAG a été modifié » | Changement de mot de passe (par vous ou par un mot de passe temporaire). | Si vous n’êtes pas à l’origine du changement : incident de sécurité, prévenez un autre super administrateur. |
| « Nouveau rôle attribué » | Un autre super administrateur vous a attribué un rôle. | Vérifier la portée dans votre fiche ; activer la vérification en deux étapes si ce n’est pas fait. |
| « Vérification en deux étapes réinitialisée » | Un autre super administrateur a réinitialisé votre vérification. | Réactiver la vérification depuis **Sécurité** sans attendre. |
| Alerte « Traitements en arrière-plan à surveiller » (à l’écran) | Tâches en échec ou abandonnées, emails non délivrés sur 24 h. | Suivre « Superviser les traitements et les emails ». |

*Ce que reçoivent les personnes concernées par vos actions*

| Votre action | La personne reçoit |
| --- | --- |
| Créer un compte | Email « Votre compte de formation FETRAG est prêt : définissez votre mot de passe » (lien 7 jours) et notification interne « Bienvenue sur la plateforme FETRAG ». |
| Attribuer un rôle | Notification « Nouveau rôle attribué » (interne et email). |
| Réinitialiser la MFA | Notification « Vérification en deux étapes réinitialisée » (interne et email). |
| Mot de passe temporaire | Email d’invitation (lien 7 jours, sans le mot de passe) et notification interne « Mot de passe réinitialisé par un administrateur ». |
| Révoquer un rôle, désactiver ou réactiver un compte, modifier des paramètres, gérer une clé API ou une tâche | Rien : seul le journal d’audit garde une trace. Prévenez la personne vous-même si nécessaire. |

## 18. Bonnes pratiques et sécurité <a id="bonnes-pratiques"></a>

- [x] Un compte de super administrateur nominatif par personne ; jamais de compte partagé ni de mot de passe transmis par email.
- [x] Toujours au moins deux super administrateurs actifs, chacun avec la vérification en deux étapes et ses codes de secours rangés en lieu sûr.
- [x] Déconnectez-vous (**Déconnexion**) sur tout appareil partagé ou prêté, et ne laissez jamais le back-office ouvert sans surveillance.
- [x] Donnez le rôle le plus bas qui suffit, avec une portée limitée quand c’est possible, et une date d’expiration pour les remplacements.
- [x] Vérifiez l’identité d’une personne (appel, question de contrôle) avant de réinitialiser sa vérification en deux étapes ou de lui définir un mot de passe temporaire.
- [x] Transmettez mots de passe temporaires et clés API par un canal sûr, une seule fois, puis demandez leur changement.
- [x] Consultez le tableau de bord chaque jour ouvré et le journal d’audit chaque semaine ; faites la revue des comptes privilégiés chaque mois.
- [x] Notez le motif de chaque opération sensible dans votre journal d’exploitation, sans y écrire de secret.
- [x] Les données des utilisateurs (adresses, téléphones, employeurs, inscriptions, consentements) sont des données personnelles et syndicales : ne les exportez que sur demande justifiée, protégez le fichier et supprimez-le après usage.
- [x] Restez courtois et factuel dans les messages aux utilisateurs et aux partenaires ; ne promettez jamais une fonction qui n’existe pas dans l’interface.
- [x] Prévenez avant toute intervention visible (bandeau de maintenance) et confirmez après (retrait du bandeau, état de santé au vert).
- [x] Ne modifiez pas les règles métier (devise, participants par demande) sans l’accord de la finance ou de la coordination.

## 19. Questions fréquentes <a id="questions-frequentes"></a>

**Puis-je supprimer définitivement un compte ?**

Non. L’interface ne propose que la désactivation (`Désactiver le compte`), qui bloque la connexion et conserve inscriptions, certificats et commandes. C’est volontaire : les certificats et les paiements doivent rester vérifiables.

**Comment corriger le nom ou l’adresse email d’un utilisateur ?**

Le back-office ne le permet pas : la personne modifie elle-même son profil depuis son espace personnel. Si l’adresse est fausse et qu’elle ne peut pas se connecter, créez un nouveau compte avec la bonne adresse et désactivez l’ancien.

**Une personne a perdu son téléphone et ses codes de secours. Que faire ?**

Vérifiez son identité, puis cliquez sur `Réinitialiser la MFA` dans la carte **Compte** de sa fiche. Elle se reconnectera avec son mot de passe et devra réactiver la vérification depuis **Sécurité**. Si c’est vous qui êtes bloqué, un autre super administrateur doit le faire.

**Pourquoi ne puis-je pas retirer mon propre rôle de super administrateur ?**

C’est un garde-fou : la ligne affiche « Protégé ». De même, le dernier super administrateur actif ne peut pas être retiré. Demandez à un autre super administrateur si c’est vraiment nécessaire.

**J’ai attribué un rôle mais la personne ne voit rien de nouveau.**

Faites-lui recharger la page. Vérifiez ensuite la portée (un rôle institutionnel doit être « Globale ») et l’expiration. Si le déploiement exige la vérification en deux étapes, elle doit d’abord l’activer depuis **Sécurité**.

**Le mot de passe temporaire est-il envoyé par email ?**

Jamais. L’email contient seulement un lien « Définir mon mot de passe » valable 7 jours. Le mot de passe temporaire n’est affiché qu’à vous, une seule fois, comme solution de secours à transmettre par un canal sûr.

**Un rôle expiré est-il retiré automatiquement ?**

Il ne donne plus aucun droit dès la date passée, mais la ligne reste affichée avec « Expiré le <date> ». Personne n’est prévenu : révoquez la ligne pour nettoyer, ou attribuez de nouveau le rôle avec une nouvelle date.

**Comment savoir si les emails partent vraiment ?**

Regardez la tuile **Emails non délivrés sur 24 h** dans la **File de traitements** et ouvrez `État de santé` : le fournisseur d’email doit être « resend » ou « smtp ». « console » signifie qu’aucun email n’est envoyé ; prévenez l’exploitant.

**Puis-je activer les paiements en ligne ou les forums depuis le back-office ?**

Non. La carte **Drapeaux fonctionnels** de la page **Paramètres** est en lecture seule : ces fonctionnalités se règlent dans l’environnement d’hébergement. Faites une demande écrite à l’exploitant.

**Je dois donner un accès à un partenaire pour lire des données. Faut-il lui créer un compte ?**

Non : si son logiciel appelle l’API, générez une **Clé API** en portée « Lecture seule » et transmettez-la par un canal sûr. Un compte utilisateur sert à une personne, une clé API à un logiciel.

**Le journal d’audit peut-il être modifié ou purgé ?**

Non, ni depuis l’interface ni par un rôle quelconque. Vous pouvez seulement le filtrer et l’exporter ; chaque export est lui-même inscrit dans le journal.

**Que se passe-t-il si je coche « Afficher le bandeau de maintenance » ?**

Un bandeau d’information apparaît sur le site et sur la plateforme de formation, mais l’accès reste ouvert : rien n’est bloqué. Pensez à le décocher après l’intervention.

**Combien de temps un contenu planifié met-il à se publier ?**

La publication planifiée est vérifiée toutes les dix minutes par une tâche de fond, elle-même déclenchée toutes les cinq minutes. Comptez jusqu’à un quart d’heure après l’heure prévue ; au-delà, regardez la **File de traitements**.

## 20. Lexique <a id="lexique"></a>

- **Back-office** : La partie du site réservée à l’équipe (« Administration du site »), par opposition au site public vu par tout le monde.
- **Rôle** : Ensemble de droits attribué à un compte : Apprenant, Responsable d’organisation, Formateur, Coordinateur formation, Éditeur communication, Responsable services, Finance / contrôle, Support, Super administrateur.
- **Portée** : Étendue d’un rôle : « Globale » (toute la plateforme), « Une organisation », « Un cours » ou « Une cohorte ». Un rôle à portée limitée est marqué « (limité) ».
- **Cohorte** : Groupe d’apprenants qui suit une formation ensemble, avec ses dates et son formateur.
- **Expiration (d’un rôle)** : Date après laquelle un rôle ne donne plus de droits. La ligne reste affichée avec « Expiré le <date> ».
- **Vérification en deux étapes (MFA)** : Code à six chiffres généré par une application sur votre téléphone, demandé en plus du mot de passe. Obligatoire pour les super administrateurs, la coordination, la finance et l’édition.
- **Codes de secours** : Huit codes à usage unique (format XXXXX-XXXXX) donnés une seule fois à l’activation de la vérification en deux étapes ; ils remplacent le code de l’application si le téléphone est perdu.
- **Mot de passe temporaire** : Mot de passe aléatoire de 14 caractères généré par le super administrateur, affiché une seule fois, jamais envoyé par email ; la personne le remplace à sa première connexion.
- **Invitation** : Email « définissez votre mot de passe » contenant un lien à usage unique valable 7 jours, envoyé à la création d’un compte ou après un mot de passe temporaire.
- **Jeton** : Code secret contenu dans un lien (invitation, réinitialisation) qui prouve que la personne a bien reçu l’email ; il expire et ne sert qu’une fois.
- **Session** : Connexion ouverte sur un appareil. Désactiver un compte ou définir un mot de passe temporaire ferme toutes les sessions de la personne.
- **Journal d’audit** : Trace immuable des actions sensibles (qui, quoi, quand, avant / après). Ni modifiable ni effaçable.
- **Empreinte IP** : Version codée de l’adresse Internet d’un appareil, conservée dans le journal sans permettre de retrouver l’adresse réelle.
- **Corrélation** : Identifiant commun à plusieurs entrées du journal issues d’une même opération, utile pour les retrouver ensemble.
- **File de traitements (file de jobs)** : Liste des tâches exécutées en arrière-plan (emails, PDF, webhooks, publications planifiées, rappels). Un « job » est l’une de ces tâches.
- **Cron** : Déclencheur automatique qui lance le traitement de la file toutes les cinq minutes chez l’hébergeur.
- **Webhook** : Message envoyé automatiquement par un service externe (par exemple le service de paiement) pour signaler un événement ; il est traité comme une tâche de fond.
- **API et clé API** : L’API est l’interface technique par laquelle un autre logiciel lit ou écrit des données de la plateforme ; la clé API est le code secret qui l’identifie, affiché une seule fois.
- **Empreinte SHA-256** : Résumé codé d’une clé API conservé à la place de la clé : il permet de la reconnaître sans pouvoir la reconstituer.
- **État de santé** : Page technique (`État de santé` dans **Paramètres**) qui indique si la base de données et la configuration répondent, et quel service d’email est utilisé.
- **Drapeau fonctionnel** : Fonctionnalité optionnelle (paiement en ligne, forums, lettre d’information, connexion locale, fournisseur d’identité externe) activée ou non dans l’environnement d’hébergement.
- **Fournisseur d’identité externe (OIDC)** : Service de connexion tiers auquel un compte peut être rattaché ; un tel compte n’a pas de mot de passe local.
- **Bandeau de maintenance** : Message d’information affiché en haut du site et de la plateforme de formation avant une intervention ; l’accès reste ouvert.
- **CSV** : Fichier texte de données tabulaires (séparateur point-virgule) lisible par un tableur ; les exports contiennent des données personnelles.
- **Runbook** : Fiche d’exploitation pas à pas (dossier « docs/runbooks » du dépôt) : rotation des secrets, incident de sécurité, supervision, file bloquée, panne email, restauration, déploiement.
- **Exploitant** : Personne ou prestataire qui administre l’hébergement (variables d’environnement, secrets, cron, sauvegardes), en dehors du back-office.
- **Devise institutionnelle** : Les trois mots de la devise de la Fédération, affichés sur le site (paramètre « Devise institutionnelle », à ne pas confondre avec la devise des tarifs, le code monétaire).

## 21. Besoin d’aide ? <a id="besoin-d-aide"></a>

*À qui s’adresser selon le problème, et quoi indiquer dans votre message.*

*À qui s’adresser*

| Problème | Interlocuteur | Comment |
| --- | --- | --- |
| Vous êtes bloqué (vérification en deux étapes, compte désactivé, rôle manquant) | Un autre super administrateur | Par téléphone ou en personne, après vérification d’identité. |
| Panne d’email, file de traitements bloquée, état de santé en erreur, secrets, fonctionnalités optionnelles, sauvegardes | L’exploitant de l’hébergement | Par le canal convenu avec lui, avec le runbook concerné et le résultat de `État de santé` (sans secret). |
| Question sur une formation, une cohorte, un certificat, une organisation | La coordination formation | Espace de coordination de la plateforme de formation, ou message interne. |
| Question sur une commande, un paiement, un remboursement | Finance / contrôle | Section **Finance** du back-office. |
| Demande d’un utilisateur (accès, mot de passe, message d’erreur) | Le Support | Il vous transmet les cas qui exigent une action de super administrateur. |
| Décision de gouvernance (nouveau rôle, nouvelle intégration, export de données) | Le secrétariat général de la Fédération | Demande écrite, conservée avec le motif. |
| Anomalie de l’application, besoin d’une fonction absente | L’équipe de développement, via le secrétariat général | Décrire l’écran, l’action et le message exact ; toute évolution structurante passe par un ADR (décision d’architecture) du dépôt. |

### Coordonnées de la Fédération

- [Formulaire de contact du site](/contact) : Pour joindre le support de la FETRAG (choisir le type « assistance »).
- [Écrire à la Fédération](mailto:jossngomafm@gmail.com) : Adresse email de contact affichée dans les paramètres.
- [Appeler : 066 23 00 33 ou 077 52 27 98](tel:+24166230033) : Aux heures de bureau, Libreville.
- [Adresse postale](/contact) : BP 1234 Libreville, Gabon.

### Dans un message d’aide, indiquez

- L’adresse email de votre compte (jamais votre mot de passe ni vos codes de secours).
- L’écran concerné (par exemple « Utilisateurs et rôles › fiche de … › Attribuer un rôle ») et l’heure approximative.
- Le message exact affiché (« Au moins un super administrateur actif doit subsister », « ok : false »…).
- Ce que vous avez déjà essayé (rechargement, autre navigateur, autre appareil).
- Pour un problème d’email ou de tâches : les chiffres des tuiles de la **File de traitements** et le fournisseur indiqué par `État de santé`.

> **Runbooks** : Les procédures d’exploitation détaillées sont dans le dossier « docs/runbooks » du dépôt du projet : supervision, jobs-bloques, panne-email, rotation-secrets, incident-securite, restauration-base, deploiement. Elles s’adressent à vous et à l’exploitant ; elles ne contiennent aucun secret et ne doivent jamais en contenir.

## Testez votre maîtrise <a id="autoevaluation"></a>

Quatorze questions pour vérifier que vous savez où agir dans le back-office, ce qui est irréversible et à qui vous adresser. Comptez sept minutes ; le corrigé renvoie à la section du guide. Seuil de maîtrise : 70 % de bonnes réponses. 14 questions.

1. Vous avez perdu votre téléphone et vos codes de secours. Qui peut vous redonner accès à votre compte ? *(une seule réponse)*
   - a) Vous-même, depuis la page « Mot de passe oublié ? ».
   - b) Un autre super administrateur, avec le bouton `Réinitialiser la MFA` de votre fiche.
   - c) Le Support, depuis la page **Utilisateurs et rôles**.

2. Sur un smartphone, comment ouvrez-vous la liste des sections du back-office ? *(une seule réponse)*
   - a) Avec le bouton **Ouvrir la navigation** (trois traits), en haut à gauche de la barre « Back-office ».
   - b) En cliquant sur vos initiales en haut à droite.
   - c) La navigation n’est pas disponible sur smartphone.

3. Le mot de passe temporaire affiché à la création d’un compte est aussi envoyé par email à la personne. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

4. Vous voulez qu’un formateur n’intervienne que sur une cohorte précise. Que choisissez-vous dans le dialogue « Attribuer un rôle » ? *(une seule réponse)*
   - a) Rôle « Formateur », portée « Globale (toute la plateforme) ».
   - b) Rôle « Formateur », portée « Une cohorte », puis la cohorte dans la liste **Choisir**.
   - c) Rôle « Coordinateur formation », portée « Une cohorte ».

5. Un rôle « Super administrateur » attribué avec la portée « Une organisation » donne les droits de super administrateur sur cette organisation. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

6. Que se passe-t-il quand vous cliquez sur `Désactiver le compte` puis `Désactiver` ? *(plusieurs réponses possibles)*
   - a) La personne ne peut plus se connecter.
   - b) Ses sessions ouvertes sont fermées.
   - c) Ses certificats et ses commandes sont supprimés.
   - d) Elle reçoit un email l’informant de la désactivation.

7. La coordination vous demande d’activer les « Forums de formation ». Que faites-vous ? *(une seule réponse)*
   - a) Vous cochez le drapeau dans la carte **Drapeaux fonctionnels** de la page **Paramètres**.
   - b) Vous demandez à la coordination formation de l’activer depuis son espace de coordination.
   - c) Vous adressez une demande écrite à l’exploitant, car la carte **Drapeaux fonctionnels** est en lecture seule.

8. Vous avez fermé le dialogue « Nouvelle clé API » sans copier la clé. Comment la récupérer ? *(une seule réponse)*
   - a) En cliquant sur son **Préfixe** dans le tableau.
   - b) Impossible : il faut révoquer cette clé et en générer une nouvelle.
   - c) En demandant à l’exploitant de la lire dans la base de données.

9. Quelles tâches peuvent être relancées avec le bouton `Relancer` ? *(une seule réponse)*
   - a) Les tâches « En échec » et « Abandonnée ».
   - b) Toutes les tâches, y compris « Réussi ».
   - c) Seulement les tâches « En file d’attente ».

10. L’**État de santé** indique le fournisseur d’email « console ». Qu’est-ce que cela signifie ? *(une seule réponse)*
   - a) Les emails partent normalement par le service de la Fédération.
   - b) Aucun email n’est réellement envoyé : c’est un réglage de test à corriger par l’exploitant.
   - c) Les emails sont envoyés mais sans expéditeur.

11. Un super administrateur peut supprimer une entrée du journal d’audit depuis le back-office. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

12. Où se renouvellent les secrets techniques (accès à la base de données, clé du service d’email) ? *(une seule réponse)*
   - a) Dans la page **Paramètres** du back-office.
   - b) Dans les variables d’environnement de l’hébergeur, avec l’exploitant et le runbook « rotation-secrets ».
   - c) Dans la carte **Clés API**.

13. Une personne doit publier les actualités et gérer les médias du site. Quel rôle lui attribuez-vous ? *(une seule réponse)*
   - a) Éditeur communication.
   - b) Responsable services.
   - c) Super administrateur, pour qu’elle ne soit jamais bloquée.

14. Parmi ces opérations, lesquelles ne peuvent pas être annulées après confirmation ? *(plusieurs réponses possibles)*
   - a) Révoquer une clé API.
   - b) Définir un mot de passe temporaire.
   - c) Désactiver un compte.
   - d) Révoquer un rôle.

### Corrigé

1. **b** : Seul un super administrateur peut réinitialiser la vérification en deux étapes d’un compte : voir « Activer votre vérification en deux étapes ».
2. **a** : Sous 1024 px, la barre latérale devient un tiroir ouvert par le bouton **Ouvrir la navigation** : voir « Se repérer dans le back-office ».
3. **b** : L’email ne contient qu’un lien « Définir mon mot de passe » valable 7 jours ; le mot de passe temporaire ne vous est affiché qu’une fois : voir « Créer un compte avec invitation par email ».
4. **b** : Un rôle limité s’attribue avec sa portée et l’élément choisi : voir « Attribuer un rôle ».
5. **b** : Un super administrateur n’a de droits qu’en portée « Globale » ; toute autre portée est sans effet : voir « Comment attribuer et retirer des rôles ».
6. **a, b** : La désactivation bloque la connexion et ferme les sessions, mais conserve toutes les données et n’envoie aucun email : voir « Désactiver puis réactiver un compte ».
7. **c** : Les drapeaux fonctionnels sont affichés mais non modifiables dans le back-office : voir « Ce qui est affiché mais non modifiable ».
8. **b** : Seule l’empreinte de la clé est conservée ; elle n’est affichée qu’une fois : voir « Comment gérer les clés API ».
9. **a** : `Relancer` remet en file une tâche en échec ou abandonnée, tentatives à zéro : voir « Relancer ou annuler une tâche ».
10. **b** : Le fournisseur « console » n’envoie rien ; il faut « resend » ou « smtp » : voir « Diagnostiquer les emails non délivrés ».
11. **b** : Le journal est immuable : on le filtre et on l’exporte, rien de plus. Chaque export est lui-même journalisé : voir « Comment consulter le journal d’audit ».
12. **b** : Seules les clés API des partenaires se gèrent dans l’interface ; les autres secrets vivent chez l’hébergeur : voir « Renouveler les secrets techniques ».
13. **a** : Donnez le rôle le plus bas qui suffit ; les contenus reviennent à l’Éditeur communication : voir « Comment déléguer : quel rôle pour quelle tâche ».
14. **a, b** : Une clé révoquée l’est pour toujours et l’ancien mot de passe est perdu ; un compte se réactive et un rôle se réattribue : voir « Opérations sensibles et irréversibles ».

## Guides liés

- [Guide du membre](/espace/guide) : Le guide commun à tous les comptes du site : espace personnel, profil, sécurité.
- [Guide du super administrateur de la plateforme de formation](https://formation.fetrag.ga/admin/guide) : Le même rôle sur la plateforme de formation : cours, questions, certificats, réglages.
- [Guide de la coordination](/admin/guide/web-coordination) : Formations, cohortes, demandes de formation et organisations.
