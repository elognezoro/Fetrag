# Guide du coordinateur formation sur le site

*Organisations, finance en lecture, rapports et médiathèque depuis le site institutionnel*

Plateforme : site institutionnel fetrag.ga · Rôle : COORDINATOR · Version 1.0 du 2026-09-12 · Lecture : 45 min · 20 sections, 131 étapes.

Version en ligne : https://fetrag.ga/admin/guide/web-coordination

**À qui s'adresse ce guide ?** Les coordinatrices et coordinateurs formation de la Fédération (rôle « Coordinateur formation ») qui utilisent le back-office du site institutionnel en complément de la plateforme de formation.

Sur le site institutionnel, vous créez les organisations affiliées et partenaires, vous rattachez leurs membres et vous désignez leurs responsables. Vous consultez la finance, les prises en charge, l’annuaire des comptes et les rapports, sans pouvoir modifier ces données. L’essentiel de votre travail (demandes de formation, cours, cohortes, certificats) se fait sur la plateforme de formation, décrite dans un guide séparé.

## Avant de commencer

- Un compte FETRAG dont l’adresse email est confirmée, avec le rôle **Coordinateur formation** attribué par le super administrateur.
- Une application d’authentification installée sur votre téléphone (Google Authenticator, Microsoft Authenticator ou FreeOTP) pour la vérification en deux étapes.
- Un téléphone ou un ordinateur connecté à Internet, avec un navigateur récent.
- Le guide de la coordination sur la plateforme de formation, pour tout ce qui concerne les demandes, les cours, les cohortes et les certificats.

## Prise en main en cinq minutes

1. Connectez-vous au site avec votre adresse email et votre mot de passe.
   - Élément : `Se connecter` (bouton `Espace personnel` en haut à droite du site ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits))
   - Résultat attendu : Votre avatar (vos initiales) remplace le bouton `Espace personnel`.
2. Activez la vérification en deux étapes si ce n’est pas déjà fait.
   - Où : menu du compte › **Sécurité**
   - Résultat attendu : Le badge « MFA active » apparaît sur votre fiche et un code vous est demandé à chaque connexion.
3. Ouvrez le back-office.
   - Élément : `Administration du site` (menu du compte (cliquez sur votre avatar en haut à droite))
   - Résultat attendu : La page « Bonjour {votre prénom} » s’affiche avec le menu de gauche : Tableau de bord, Médias, Newsletter, Utilisateurs et rôles, Organisations, Finance, Rapports.
4. Vérifiez que chaque organisation qui doit déposer des demandes possède un responsable.
   - Où : menu de gauche › **Organisations** › fiche de l’organisation
   - Résultat attendu : Aucune alerte orange « Aucun responsable n’est désigné » n’apparaît sur la fiche.
   - Remarque : Sans responsable, personne ne peut déposer de demande de formation au nom de l’organisation.
5. Rejoignez la plateforme de formation pour traiter les demandes et les cohortes.
   - Élément : `Coordination LMS` (bouton or de la carte « Plateforme de formation » du tableau de bord, ou en bas du menu de gauche)
   - Résultat attendu : L’espace de coordination de la plateforme s’ouvre dans le navigateur, sans nouvelle connexion.

## Sommaire

1. [Votre rôle en bref](#votre-role)
2. [Avant de commencer : compte, connexion et sécurité](#avant-de-commencer)
3. [Se repérer dans le back-office](#se-reperer)
4. [Comment lire le tableau de bord](#lire-le-tableau-de-bord)
5. [Comment créer une organisation affiliée ou partenaire](#creer-une-organisation)
6. [Comment rattacher des membres et désigner un responsable](#gerer-les-membres)
7. [Comment désactiver ou réactiver une organisation](#desactiver-ou-reactiver-une-organisation)
8. [Comment suivre les demandes de formation et les cohortes depuis le site](#suivre-les-demandes-depuis-le-site)
9. [Comment retrouver un compte et vérifier ses rôles](#retrouver-un-compte)
10. [Comment consulter la finance et faire émettre un reçu](#consulter-la-finance)
11. [Comment consulter les prises en charge](#consulter-les-prises-en-charge)
12. [Comment consulter les rapports et exporter un CSV](#consulter-les-rapports)
13. [Comment envoyer un fichier dans la médiathèque](#utiliser-la-mediatheque)
14. [Comment vérifier une formation dans le catalogue public](#verifier-le-catalogue-public)
15. [Comment consulter la lettre d’information](#lettre-d-information)
16. [Notifications et emails que vous recevez](#notifications)
17. [Bonnes pratiques et sécurité](#bonnes-pratiques)
18. [Questions fréquentes](#questions-frequentes)
19. [Lexique](#lexique)
20. [Besoin d’aide ?](#besoin-d-aide)

## 1. Votre rôle en bref <a id="votre-role"></a>

*Ce que le site vous permet de faire, ce qu’il vous interdit, et avec qui vous travaillez.*

Le rôle **Coordinateur formation** pilote la formation de la Fédération. Votre espace principal est la plateforme de formation : c’est là que vous traitez les demandes des organisations, construisez les cours, planifiez les cohortes et émettez les certificats. Le site institutionnel vous donne un accès complémentaire à son back-office (l’espace d’administration réservé au personnel), pour tenir à jour les organisations et consulter les données financières, les comptes et les rapports.

### Ce que vous pouvez faire sur le site

- [x] Créer une organisation affiliée ou partenaire, rattacher des comptes existants, désigner ou retirer un responsable, désactiver ou réactiver une organisation.
- [x] Suivre, depuis la fiche d’une organisation, ses demandes de formation et ses cohortes, avec un lien direct vers la plateforme.
- [x] Consulter la finance : chiffre d’affaires, commandes, paiements, prises en charge ; faire émettre un reçu et relancer le rapprochement des paiements.
- [x] Retrouver un compte dans l’annuaire **Utilisateurs et rôles** et lire ses rôles, ses organisations, ses inscriptions et ses commandes.
- [x] Lire les rapports du site et de la plateforme, télécharger trois exports CSV.
- [x] Envoyer, décrire et supprimer des fichiers dans la **Médiathèque**.
- [x] Vérifier que les cours publiés sur la plateforme apparaissent bien dans le catalogue public **Formations**.

### Ce que vous ne pouvez pas faire sur le site

- Créer un compte, attribuer ou retirer un rôle, désactiver un compte, réinitialiser la vérification en deux étapes d’une autre personne : réservé au super administrateur.
- Accorder, clôturer ou supprimer une prise en charge ; rembourser une commande ; télécharger les exports comptables : réservé au rôle **Finance / contrôle**.
- Rédiger ou publier des pages, actualités, ressources et événements : réservé à l’**Éditeur communication**.
- Lire les messages reçus par les formulaires du site et traiter les demandes de service : réservé au **Responsable services** et au **Support**.
- Modifier le nom ou les coordonnées d’une organisation déjà créée : cette modification se fait sur la plateforme de formation.
- Décider d’une demande de formation, créer une cohorte ou un cours, émettre un certificat : ces actions se font sur la plateforme de formation.

*Avec qui vous travaillez*

| Rôle | Ce qu’il fait | Quand le solliciter |
| --- | --- | --- |
| Super administrateur | Crée les comptes, attribue les rôles, désactive les comptes, règle les paramètres. | Un compte à créer avant de le rattacher à une organisation ; un rôle à attribuer ; un compte à désactiver ; une vérification en deux étapes à réinitialiser. |
| Finance / contrôle | Rembourse, accorde et clôture les prises en charge, exporte la comptabilité. | Une prise en charge à accorder à un bénéficiaire ; un remboursement à traiter ; un export comptable. |
| Responsable d’organisation | Dépose les demandes de formation de son organisation et suit ses participants. | Vous le désignez depuis la fiche de l’organisation ; il vous adresse ses demandes sur la plateforme. |
| Formateur | Anime les cohortes, corrige, saisit les présences. | Vous l’affectez aux cohortes sur la plateforme de formation. |
| Éditeur communication | Rédige et publie les contenus du site. | Un visuel ou un document de la médiathèque à publier sur le site. |
| Support | Aide les utilisateurs sur leur compte et leurs accès. | Un utilisateur qui n’arrive pas à se connecter. |

> **Deux espaces, un seul compte** : Votre compte FETRAG ouvre le site institutionnel et la plateforme de formation sans nouvelle connexion. Tout ce que vous faites sur les organisations depuis le site est visible immédiatement sur la plateforme, et inversement.

- [Guide de la coordination sur la plateforme de formation](https://formation.fetrag.ga/coordination/guide) : Demandes de formation, cours, cohortes, sessions, certificats et rapports détaillés.

## 2. Avant de commencer : compte, connexion et sécurité <a id="avant-de-commencer"></a>

*Se connecter, protéger son compte par la vérification en deux étapes, récupérer un mot de passe, se déconnecter.*

Votre rôle donne accès à des données personnelles et financières. La politique de la Fédération exige donc que les rôles privilégiés (administration, coordination, finance, communication) protègent leur compte par la vérification en deux étapes, appelée aussi MFA : en plus du mot de passe, un code à 6 chiffres affiché par une application sur votre téléphone est demandé à chaque connexion.

*Règles imposées par l’application*

| Élément | Règle |
| --- | --- |
| Mot de passe | 8 caractères minimum, dont une majuscule et un chiffre. |
| Code de vérification | 6 chiffres, renouvelé toutes les 30 secondes par l’application d’authentification. |
| Lien de réinitialisation du mot de passe | Valable 30 minutes après la demande. |
| Codes de secours | Codes à usage unique remis lors de l’activation, à conserver hors du téléphone. |

### Si ça ne marche pas

- **Le message « Accès refusé » s’affiche quand vous ouvrez **Administration du site**.** (cause probable : Votre compte n’a pas (ou plus) le rôle **Coordinateur formation**, ou le rôle a expiré.) : Cliquez sur `Contacter la FETRAG` sur cette page (un email avec l’objet « Demande de droits d’accès » est préparé) ou écrivez au super administrateur.
- **La page « Vérification en deux étapes » s’affiche à chaque tentative d’entrer dans le back-office.** (cause probable : La vérification en deux étapes n’est pas activée sur votre compte et le site l’exige pour votre rôle.) : Cliquez sur `Activer la vérification` et suivez la procédure ci-dessous.
- **Le code à 6 chiffres est refusé.** (cause probable : L’heure du téléphone est décalée, ou vous lisez le code d’un autre compte dans l’application.) : Attendez le code suivant et vérifiez que l’heure du téléphone est réglée automatiquement. En dernier recours, utilisez un code de secours.
- **Vous avez perdu votre téléphone et vos codes de secours.** (cause probable : Sans second facteur, la connexion n’est plus possible.) : Demandez au super administrateur de réinitialiser la MFA de votre compte, puis réactivez-la sur un nouveau téléphone.

### Se connecter au site <a id="se-connecter"></a>

1. Ouvrez le site institutionnel dans votre navigateur.
   - Remarque : Sur téléphone, le navigateur suffit : aucune application à installer.
2. Cliquez sur `Espace personnel`.
   - Où : en haut à droite du site ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits) en haut à droite
   - Résultat attendu : La page « Bienvenue à la FETRAG » s’affiche avec le formulaire de connexion.
3. Saisissez votre **Adresse email**.
   - Remarque : C’est l’adresse avec laquelle votre compte a été créé et confirmé.
4. Saisissez votre **Mot de passe**.
5. Cliquez sur `Se connecter`.
   - Où : sous les champs
   - Résultat attendu : Si la vérification en deux étapes est active, le champ **Code de vérification** apparaît.
6. Ouvrez votre application d’authentification et saisissez le code à 6 chiffres affiché pour votre compte FETRAG.
   - Élément : `Vérifier et se connecter`
   - Résultat attendu : Le site se recharge : votre avatar (vos initiales) apparaît en haut à droite.
   - Remarque : Le code change toutes les 30 secondes ; si le temps restant est très court, attendez le suivant.
7. Cliquez sur votre avatar pour ouvrir le menu du compte.
   - Où : en haut à droite (libellé accessible « Menu de {votre nom} ») ; sur mobile, l’avatar reste visible sans ouvrir le menu du site
   - Résultat attendu : Le menu affiche votre nom, votre email et le badge « Coordinateur formation ».
8. Cliquez sur **Administration du site**.
   - Résultat attendu : Le tableau de bord « Bonjour {votre prénom} » s’ouvre.
   - Remarque : Si la page « Vérification en deux étapes » s’affiche à la place, activez la vérification comme indiqué ci-dessous.

> **À savoir** : Si le site propose un bouton `Se connecter avec Compte FETRAG`, votre organisation utilise un fournisseur d’identité central : cliquez dessus et suivez les écrans, puis revenez sur le site.

### Activer la vérification en deux étapes <a id="activer-la-verification-en-deux-etapes"></a>

À faire une seule fois, avec votre téléphone à portée de main.

1. Installez une application d’authentification sur votre téléphone : Google Authenticator, Microsoft Authenticator ou FreeOTP.
   - Remarque : Ces applications sont gratuites, disponibles sur Android et iPhone, et fonctionnent sans connexion Internet une fois installées.
2. Ouvrez le menu du compte puis **Sécurité**.
   - Où : avatar en haut à droite
   - Résultat attendu : La page « Protéger mon compte » s’affiche.
3. Cliquez sur `Activer la vérification en deux étapes`.
   - Résultat attendu : Un QR code (carré noir et blanc à scanner) s’affiche à l’**Étape 1**, avec une clé à saisir manuellement.
4. Dans l’application d’authentification, ajoutez un compte en scannant le QR code.
   - Résultat attendu : L’application affiche une ligne « FETRAG » avec un code à 6 chiffres.
   - Remarque : Si vous consultez le site depuis le téléphone lui-même, vous ne pouvez pas scanner l’écran : copiez la clé affichée et saisissez-la manuellement dans l’application.
5. Saisissez ce code dans le champ **Code à 6 chiffres affiché par l’application** (Étape 2), puis validez.
   - Résultat attendu : La vérification est activée ; des codes de secours vous sont présentés.
6. Notez les codes de secours et rangez-les hors du téléphone (carnet, coffre, gestionnaire de mots de passe).
   - Remarque : Chaque code de secours ne sert qu’une fois. Ils permettent d’entrer si le téléphone est perdu.

> **Ne désactivez pas la vérification** : La page **Sécurité** permet aussi de désactiver la vérification (bouton `Désactiver la vérification`, avec un code). Pour votre rôle, elle est exigée par la politique de sécurité de la Fédération : ne la désactivez que pour changer de téléphone, et réactivez-la aussitôt.

### Mot de passe oublié <a id="mot-de-passe-oublie"></a>

1. Sur la page de connexion, cliquez sur **Mot de passe oublié ?**.
   - Où : sous le champ **Mot de passe**
   - Résultat attendu : La page « Mot de passe oublié » s’affiche.
2. Saisissez l’**Adresse email du compte** puis cliquez sur `Recevoir le lien de réinitialisation`.
   - Résultat attendu : Un message confirme l’envoi. Pour des raisons de sécurité, le message est le même que l’adresse existe ou non.
3. Ouvrez l’email « Réinitialisation de votre mot de passe FETRAG » et cliquez sur le lien.
   - Remarque : Le lien est valable 30 minutes. Vérifiez le dossier des courriers indésirables si l’email n’arrive pas.
4. Choisissez un nouveau mot de passe : 8 caractères minimum, dont une majuscule et un chiffre.
   - Résultat attendu : La page de connexion affiche « Votre mot de passe a été réinitialisé » ; l’email « Votre mot de passe FETRAG a été modifié » vous est envoyé.

### Se déconnecter <a id="se-deconnecter"></a>

1. Ouvrez le menu du compte et cliquez sur `Déconnexion`.
   - Où : avatar en haut à droite ; tout en bas du menu
   - Résultat attendu : Le bouton indique « Déconnexion en cours », puis le site revient à la page d’accueil : le bouton `Espace personnel` remplace votre avatar.
   - Remarque : Si vous arrivez sur la page « Se déconnecter ? » (par un lien de déconnexion), cliquez sur `Confirmer la déconnexion` ; la page « Vous êtes déconnecté » s’affiche alors.
2. Fermez ensuite le navigateur si l’appareil est partagé.
   - Remarque : La déconnexion sur le site vous déconnecte aussi de la plateforme de formation : c’est le même compte.

> **Attention** : Sur un ordinateur partagé (secrétariat, cybercafé), déconnectez-vous toujours avant de partir : votre session donne accès à des données financières et personnelles.

## 3. Se repérer dans le back-office <a id="se-reperer"></a>

*Le tableau de bord, le menu de gauche (ou le tiroir sur mobile) et le menu du compte.*

### Écran : La page d’accueil « Bonjour {votre prénom} »

Ce que vous voyez en arrivant dans le back-office par **Administration du site**.

- **Barre latérale marine (ordinateur) ou tiroir de navigation (mobile)** : La marque « Administration », puis vos rubriques : **Tableau de bord** (Pilotage), **Médias** (Contenus), **Newsletter** (Relations), **Utilisateurs et rôles**, **Organisations**, **Finance**, **Rapports** (Administration). En bas : votre nom, votre email, le badge « Coordinateur formation » et le lien `Coordination LMS`.
- **Barre supérieure collante** : Sur mobile : le bouton **Ouvrir la navigation** (trois traits), le mot « Back-office » et le titre de la section courante. Sur ordinateur : le lien « Voir le site ».
- **En-tête de page** : Le ruban « Pilotage », le titre « Bonjour {prénom} » et, à droite, le bouton `Rapports détaillés`.
- **Tuiles d’indicateurs** : « Pages vues sur 30 jours », « Formulaires reçus sur 30 jours », « Chiffre d’affaires sur 12 mois ». Sur mobile, deux tuiles par ligne.
- **Cartes « Audience du site », « Formulaires par type », « Ventes mensuelles »** : Graphiques des 30 derniers jours (audience, sans cookie de suivi) et des 12 derniers mois (ventes). La carte « Ventes mensuelles » contient le lien `Finance`.
- **Carte « Contenus les plus consultés »** : Trois colonnes : « Actualités » (vues), « Ressources » (téléchargements), « Formations » (inscriptions, avec lien vers la fiche publique).
- **Carte marine « Plateforme de formation »** : « Apprenants actifs », « Nouvelles inscriptions », « Taux de complétion », « Certificats émis » sur 30 jours, et le bouton or `Coordination LMS` qui ouvre votre espace sur la plateforme.
- **Rangée de raccourcis** : Boutons `Utilisateurs` (annuaire des comptes) et `Voir le site` (ouvre le site public dans un nouvel onglet).

### Écran : La navigation sur mobile

Sur un écran de téléphone, la barre latérale est remplacée par un tiroir.

- **Bouton **Ouvrir la navigation** (trois traits)** : En haut à gauche de la barre supérieure : ouvre le tiroir avec les mêmes rubriques que sur ordinateur.
- **Bouton **Fermer la navigation** (croix)** : Referme le tiroir. Il se referme aussi automatiquement quand vous changez de page.
- **Tableaux** : Les tableaux défilent horizontalement avec le doigt ; certaines colonnes sont masquées sur petit écran (le type ou le statut d’une organisation, par exemple). Ouvrez la fiche pour tout voir.
- **Formulaires** : Les blocs s’empilent les uns sous les autres : le bouton de validation est tout en bas de la page, faites défiler.

### Écran : Le menu du compte (site public)

Il s’ouvre en cliquant sur votre avatar, en haut à droite de toutes les pages du site.

- **En-tête du menu** : Votre nom, votre email et le badge « Coordinateur formation ».
- **Liens personnels** : **Mon espace**, **Mon profil**, **Mes inscriptions**, **Notifications** (badge du nombre de non lues), **Sécurité**.
- ****Administration du site**** : Entrée dans le back-office décrit par ce guide.
- ****Plateforme de formation**** : Ouvre votre tableau de bord sur la plateforme, sans nouvelle connexion.
- **`Déconnexion`** : Tout en bas du menu.

Chemin vers les organisations : Menu de gauche › Organisations (`/admin/organisations`)

Chemin vers la finance : Menu de gauche › Finance (`/admin/finance`)

Chemin vers l’annuaire : Menu de gauche › Utilisateurs et rôles (`/admin/utilisateurs`)

Chemin vers les rapports : Menu de gauche › Rapports (`/admin/rapports`)

Chemin vers la médiathèque : Menu de gauche › Médias (`/admin/medias`)

> **Fil d’Ariane** : Au-dessus du titre de chaque page, un fil d’Ariane (Administration › Organisations › nom de l’organisation) rappelle où vous êtes ; cliquez sur un de ses éléments pour remonter.

## 4. Comment lire le tableau de bord <a id="lire-le-tableau-de-bord"></a>

*Un coup d’œil quotidien sur l’audience, les ventes et l’activité de la plateforme.*

1. Ouvrez **Tableau de bord**.
   - Où : première entrée du menu de gauche (sur mobile : bouton **Ouvrir la navigation**)
   - Résultat attendu : La page « Bonjour {votre prénom} » s’affiche.
2. Lisez les tuiles du haut : « Pages vues sur 30 jours » (avec le nombre de visiteurs uniques), « Formulaires reçus sur 30 jours », « Chiffre d’affaires sur 12 mois » (avec le nombre de commandes payées).
   - Remarque : La tuile « Demandes de service en cours » n’apparaît pas pour votre rôle.
3. Consultez la carte « Ventes mensuelles » : le graphique des 12 derniers mois et la ligne « Panier moyen … · … commande(s) en attente ».
   - Élément : `Finance` (lien en haut à droite de la carte)
   - Résultat attendu : Le lien ouvre le tableau de bord financier.
4. Consultez la carte marine « Plateforme de formation » : apprenants actifs, nouvelles inscriptions, taux de complétion et certificats émis sur les 30 derniers jours.
   - Remarque : Le taux de complétion est la part des inscriptions terminées parmi les inscriptions créées.
5. Cliquez sur `Coordination LMS` pour passer à la plateforme de formation.
   - Où : bouton or de la carte « Plateforme de formation »
   - Résultat attendu : Votre espace de coordination s’ouvre sur la plateforme.
6. Repérez dans « Contenus les plus consultés » les formations qui attirent le plus d’inscriptions.
   - Remarque : Le titre d’une formation ouvre sa fiche publique dans le catalogue.

> **À savoir** : Les cartes « Contenus en relecture », « Dernières demandes de service » et « Messages reçus » sont réservées à d’autres rôles : leur absence est normale.

### Si ça ne marche pas

- **La page reste sur « Chargement de l’administration ».** (cause probable : Connexion Internet lente ou coupée.) : Attendez quelques secondes, puis rechargez la page. Sur mobile, vérifiez que les données ou le Wi-Fi sont actifs.
- **Les chiffres semblent faux ou à zéro.** (cause probable : Les indicateurs sont calculés sur les 30 derniers jours (audience) ou 12 derniers mois (ventes) ; en début d’activité ils sont faibles.) : Comparez avec la page **Rapports**, qui donne le détail par jour et par mois.

## 5. Comment créer une organisation affiliée ou partenaire <a id="creer-une-organisation"></a>

*Enregistrer un syndicat affilié ou un partenaire pour qu’il puisse déposer des demandes de formation.*

Une organisation est un syndicat affilié à la Fédération ou un partenaire non affilié. Elle doit exister sur la plateforme avant que son responsable ne puisse déposer une demande de formation. Aucune organisation n’est créée automatiquement : c’est vous (ou le super administrateur) qui la créez, ici ou depuis la plateforme de formation.

1. Ouvrez **Organisations**.
   - Où : menu de gauche, section « Administration »
   - Résultat attendu : La liste « Organisations » s’affiche avec les tuiles « Organisations affiliées », « Partenaires actifs », « Organisations inactives ».
2. Vérifiez d’abord que l’organisation n’existe pas déjà : saisissez son nom ou son sigle dans le champ **Nom, sigle, secteur ou ville**, puis cliquez sur `Filtrer`.
   - Résultat attendu : La liste ne montre que les organisations correspondantes. Si elle est vide (« Aucune organisation »), vous pouvez créer la fiche.
   - Remarque : Pensez à cocher **Statut** = Inactives : une organisation désactivée peut simplement être réactivée.
3. Cliquez sur `Nouvelle organisation`.
   - Où : en haut à droite de l’en-tête (pleine largeur sur mobile)
   - Résultat attendu : La page « Nouvelle organisation » s’affiche avec les blocs « Identité », « Coordonnées » et « Statut ».
4. Dans « Identité », saisissez le **Nom** (obligatoire, 3 à 160 caractères).
   - Remarque : Exemple de forme : « Syndicat national des … ». Le nom est affiché sur la page publique des organisations.
5. Saisissez le **Sigle** (facultatif, 30 caractères maximum).
   - Remarque : Il est mis en majuscules automatiquement et sert à générer l’adresse de la fiche.
6. Saisissez le **Secteur** (facultatif, 120 caractères maximum).
   - Remarque : Exemples proposés par le champ : énergie et pétrole, enseignement, transports. Le secteur sert de filtre dans la liste.
7. Laissez le **Slug** vide, sauf besoin particulier.
   - Remarque : Le slug est la partie de l’adresse web qui identifie la fiche (minuscules, chiffres et tirets). L’aperçu « Aperçu : … » montre la valeur générée depuis le sigle ou le nom. Il doit être unique.
8. Rédigez une **Présentation** courte (facultatif, 2 000 caractères maximum).
9. Dans « Coordonnées », complétez **Adresse**, **Ville** (« Libreville » par défaut), **Pays (ISO)** (« GA » par défaut, code à 2 lettres), **Téléphone**, **Email** et **Site web** (adresse complète commençant par https://).
   - Remarque : Tous ces champs sont facultatifs. L’email et le téléphone servent de contact institutionnel.
10. Dans « Statut », saisissez l’**Effectif déclaré** (facultatif, nombre entier de travailleurs représentés).
11. Laissez la case **Organisation affiliée** cochée pour un syndicat membre de la Fédération ; décochez-la pour un partenaire non affilié.
12. Laissez la case **Active** cochée.
   - Remarque : Une organisation inactive n’apparaît plus dans les listes de choix et ne peut pas recevoir de demande de formation.
13. Cliquez sur `Créer l’organisation`.
   - Où : en bas de la colonne « Statut » (tout en bas de la page sur mobile)
   - Résultat attendu : La fiche de l’organisation s’ouvre avec l’alerte verte « Organisation créée. Rattachez maintenant un responsable pour lui permettre de déposer des demandes de formation. »
14. Enchaînez avec le rattachement d’un responsable (section suivante).
   - Remarque : Tant qu’aucun responsable n’est désigné, la fiche affiche l’alerte orange « Aucun responsable n’est désigné : personne ne peut déposer de demande de formation au nom de cette organisation. »

> **Pas de modification depuis le site** : Le site ne propose pas de formulaire pour corriger le nom, le sigle ou les coordonnées d’une organisation existante. Pour modifier ces informations, ouvrez la fiche de l’organisation sur la plateforme de formation (espace Coordination › Organisations). Vérifiez donc bien la saisie avant de créer.

### Si ça ne marche pas

- **Le message « Vérifiez les informations de l’organisation. » s’affiche en haut du formulaire.** (cause probable : Un champ ne respecte pas sa règle : nom trop court, code pays qui n’a pas 2 lettres, adresse web invalide, effectif hors limites.) : Lisez le message rouge sous chaque champ concerné (« Nom trop court », « Code pays ISO à 2 lettres », « Adresse web invalide »…) et corrigez.
- **Le message « Slug déjà utilisé » ou « Ce slug est déjà utilisé » apparaît.** (cause probable : Une organisation possède déjà cette adresse, souvent parce qu’elle existe déjà (peut-être inactive).) : Recherchez-la dans la liste avec le filtre **Statut** = Inactives. Si c’est bien une autre organisation, saisissez un slug différent.
- **Le message « L’opération a échoué. Réessayez dans quelques instants. » s’affiche.** (cause probable : Problème temporaire de connexion ou de serveur.) : Réessayez. Si le problème persiste, contactez le support en indiquant l’heure et le nom de l’organisation.
- **Le bouton `Nouvelle organisation` n’apparaît pas.** (cause probable : Votre compte n’a pas le rôle **Coordinateur formation** global.) : Vérifiez votre rôle dans le pied du menu de gauche, puis contactez le super administrateur.

## 6. Comment rattacher des membres et désigner un responsable <a id="gerer-les-membres"></a>

*Rattacher un compte existant à une organisation, lui donner ou lui retirer la responsabilité, le retirer.*

Un **membre** est un compte rattaché à une organisation. Un **responsable** est un membre habilité à déposer les demandes de formation de son organisation, suivre ses participants et consulter ses rapports sur la plateforme. Le compte doit exister avant le rattachement : la personne le crée elle-même par l’inscription sur le site, ou le super administrateur le crée pour elle.

### Les badges de la carte « Membres »

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Responsable | Le membre dépose les demandes de formation et consulte les rapports de l’organisation. | Vous pouvez lui retirer la responsabilité, sauf s’il est le dernier responsable. |
| Membre | Simple rattachement, sans droit particulier. | Vous pouvez le nommer responsable. |
| Compte désactivé | Le compte du membre ne peut plus se connecter (désactivé par le super administrateur). | Si c’est le seul responsable, désignez-en un autre. |
| Principal | Dans la carte « Contacts » : l’interlocuteur principal déclaré lors d’une demande ou de l’adhésion. Lecture seule. |  |

### Si ça ne marche pas

- **Le message « Aucun compte ne correspond à cette adresse ; créez d’abord l’utilisateur. » s’affiche (« Compte introuvable » sous le champ).** (cause probable : La personne n’a pas encore de compte, ou s’est inscrite avec une autre adresse.) : Demandez-lui l’adresse exacte de son compte, ou invitez-la à s’inscrire sur le site. Vous ne pouvez pas créer le compte vous-même : le super administrateur le peut.
- **Le message « Ce compte est déjà membre de l’organisation » s’affiche (« Déjà membre »).** (cause probable : Le rattachement existe déjà.) : Retrouvez la ligne dans « Membres » ; utilisez `Nommer responsable` si c’est la responsabilité qui manque.
- **Le message « Désignez un autre responsable avant de retirer celui-ci » s’affiche.** (cause probable : Vous tentez de retirer le dernier responsable de l’organisation.) : Nommez d’abord un autre membre responsable, puis recommencez.
- **Le membre dit ne pas avoir reçu l’email « Rattachement à … ».** (cause probable : Email arrivé dans les courriers indésirables, ou adresse non consultée.) : La notification est aussi visible dans son espace (menu du compte › **Notifications**). Le rattachement est effectif même sans lecture de l’email.

### Rattacher un compte existant <a id="rattacher-un-compte"></a>

1. Ouvrez **Organisations** puis cliquez sur le nom de l’organisation.
   - Où : colonne « Organisation » du tableau
   - Résultat attendu : La fiche s’ouvre : en-tête avec le badge « Active », cartes « Membres », « Contacts », « Coordonnées », « Demandes de formation », et colonne latérale « Ajouter un membre » et « Activité ».
2. Repérez la carte « Ajouter un membre ».
   - Où : colonne de droite sur ordinateur ; tout en bas de la page sur mobile (faites défiler)
3. Saisissez l’**Adresse email du compte** (obligatoire).
   - Remarque : L’adresse doit être exactement celle du compte existant. L’aide du champ le rappelle : « Le compte doit déjà exister ; sinon créez-le depuis « Utilisateurs ». » (création réservée au super administrateur).
4. Saisissez la **Fonction dans l’organisation** (facultatif, 120 caractères maximum).
   - Remarque : Exemples proposés : secrétaire général, trésorier, délégué.
5. Cochez **Responsable** si cette personne doit déposer les demandes de formation.
   - Remarque : Vous pourrez changer ce choix plus tard depuis la ligne du membre.
6. Cliquez sur `Ajouter le membre`.
   - Résultat attendu : Le message vert « {email} rattaché à {organisation}. » apparaît, le formulaire se vide et la ligne s’ajoute dans « Membres » avec le badge « Responsable » ou « Membre ».
7. Vérifiez que l’alerte orange « Aucun responsable n’est désigné… » a disparu si vous avez coché **Responsable**.
   - Remarque : La personne reçoit la notification « Rattachement à {organisation} » par email et dans son espace.

### Nommer un responsable ou lui retirer la responsabilité <a id="nommer-ou-retirer-un-responsable"></a>

1. Sur la fiche de l’organisation, repérez la ligne du membre dans la carte « Membres ».
   - Où : les boutons d’action sont à l’extrémité droite de la ligne ; sur mobile, faites défiler le tableau vers la droite
2. Cliquez sur `Nommer responsable`.
   - Résultat attendu : Le dialogue « Nommer {membre} responsable ? » rappelle : « Le responsable dépose les demandes de formation, suit les participants et consulte les rapports de l’organisation. »
3. Cliquez sur `Confirmer`.
   - Résultat attendu : Le message « {email} est désormais responsable de {organisation}. » s’affiche et le badge or « Responsable » apparaît sur la ligne.
   - Remarque : Aucun email n’est envoyé pour ce changement (seul le rattachement initial notifie) : prévenez la personne vous-même.
4. Pour retirer la responsabilité, cliquez sur `Retirer la responsabilité` puis sur `Confirmer` dans le dialogue.
   - Résultat attendu : Le message « {email} n’est plus responsable de {organisation}. » s’affiche ; le badge redevient « Membre ».
   - Remarque : Le dialogue prévient : « Le membre ne pourra plus déposer de demandes ni consulter les rapports de l’organisation. » Le retrait est refusé s’il s’agit du dernier responsable.

> **Conseil** : Un responsable désigné ici obtient automatiquement ses droits sur la plateforme de formation, sans qu’un rôle « Responsable d’organisation » ait besoin d’être attribué par le super administrateur.

### Retirer un membre de l’organisation <a id="retirer-un-membre"></a>

> **Réversible, mais vérifiez** : Le retrait supprime seulement l’appartenance (et la responsabilité éventuelle). Le compte, ses inscriptions et ses demandes sont conservés, et vous pouvez rattacher la personne à nouveau. Vérifiez tout de même que vous êtes sur la bonne ligne.

1. Sur la ligne du membre, cliquez sur le bouton rouge `Retirer`.
   - Où : extrémité droite de la ligne dans « Membres »
   - Résultat attendu : Le dialogue « Retirer {membre} de l’organisation ? » s’affiche : « Le compte est conservé ; seules l’appartenance et la responsabilité éventuelle sont retirées. »
2. Cliquez sur `Retirer` (rouge) pour confirmer, ou sur `Annuler`.
   - Résultat attendu : Le message « {email} retiré de {organisation}. » s’affiche et la ligne disparaît.
   - Remarque : Si la personne était le dernier responsable, le message « Désignez un autre responsable avant de retirer celui-ci » bloque l’opération.

## 7. Comment désactiver ou réactiver une organisation <a id="desactiver-ou-reactiver-une-organisation"></a>

*Masquer une organisation qui n’est plus active, sans rien effacer, et la remettre en service plus tard.*

> **Conséquences de la désactivation** : Une organisation désactivée disparaît des listes de choix (filtres, prises en charge, rôles à portée) et ne peut plus recevoir de demande de formation. Ses membres, ses demandes et ses cohortes sont conservés. L’opération est réversible avec `Réactiver`.

1. Ouvrez la fiche de l’organisation.
   - Où : **Organisations** › nom de l’organisation
2. Cliquez sur `Désactiver`.
   - Où : en haut à droite de l’en-tête, à côté du badge « Active »
   - Résultat attendu : Le dialogue « Désactiver {nom} ? » s’affiche : « L’organisation disparaît des listes de choix ; ses membres, demandes et cohortes sont conservés. »
3. Cliquez sur le bouton rouge `Désactiver` pour confirmer.
   - Résultat attendu : Le message « {nom} désactivée. » s’affiche ; le badge devient « Inactive » (gris) et la ligne apparaît estompée dans la liste.
4. Pour la remettre en service, ouvrez la fiche et cliquez sur `Réactiver`, puis confirmez.
   - Résultat attendu : Le message « {nom} réactivée. » s’affiche ; le badge redevient « Active ».
   - Remarque : Pour retrouver une organisation inactive dans la liste, utilisez le filtre **Statut** = Inactives.

### Les badges de la liste des organisations

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Affiliée | Syndicat membre de la Fédération (case « Organisation affiliée » cochée). |  |
| Partenaire | Organisation partenaire non affiliée. |  |
| Active | Sélectionnable dans les formulaires ; peut recevoir des demandes de formation. |  |
| Inactive | Masquée des listes de choix ; données conservées. | `Réactiver` depuis la fiche. |

### Si ça ne marche pas

- **Le message « L’organisation est déjà inactive. » (ou « déjà active ») s’affiche.** (cause probable : Quelqu’un d’autre a changé le statut entre-temps.) : Rechargez la page pour voir l’état actuel.
- **Un responsable signale qu’il ne peut plus déposer de demande.** (cause probable : L’organisation a été désactivée, ou la responsabilité lui a été retirée.) : Vérifiez le badge de l’en-tête et le badge de sa ligne dans « Membres ».

## 8. Comment suivre les demandes de formation et les cohortes depuis le site <a id="suivre-les-demandes-depuis-le-site"></a>

*Lire l’état des demandes et des cohortes d’une organisation sur sa fiche, puis agir sur la plateforme.*

Une **demande de formation** est le dossier déposé par le responsable d’une organisation pour former un groupe sur un ou plusieurs modules. Une **cohorte** est le groupe d’apprenants créé quand la demande est planifiée. Les décisions (complément, acceptation, refus, autre date, planification) se prennent uniquement sur la plateforme de formation ; le site vous permet de voir où en est chaque organisation.

1. Ouvrez la notification « Nouvelle demande de formation » reçue par email ou dans **Notifications**.
   - Résultat attendu : Le lien de la notification ouvre directement la demande sur la plateforme de formation.
   - Remarque : L’email d’accusé de réception envoyé à l’organisation annonce une réponse « sous 5 jours ouvrés » : c’est votre délai de traitement.
2. Pour un suivi par organisation, ouvrez **Organisations** puis la fiche concernée.
   - Où : menu de gauche
   - Résultat attendu : La carte « Demandes de formation » liste les 10 dernières demandes : référence, contact, nombre de modules, date souhaitée, statut, participants, date de dépôt.
3. Cliquez sur la référence d’une demande.
   - Résultat attendu : La demande s’ouvre sur la plateforme de formation, où vous prenez la décision.
4. Cliquez sur `Coordination LMS` dans l’en-tête de la carte pour voir la file complète des demandes de toutes les organisations.
5. Après planification, revenez sur la fiche : la carte « Cohortes » (affichée seulement s’il en existe) montre les 6 dernières cohortes avec leur code, leur cours, le nombre de participants et leur statut.
   - Remarque : Le nom d’une cohorte ouvre sa page sur la plateforme.
6. Lisez la carte « Activité » : « Inscriptions », « Progression moyenne », « Cohortes », « Prises en charge » et le total des commandes réglées de l’organisation.
   - Où : colonne de droite (en bas sur mobile)
7. Cliquez sur `Comptes rattachés` pour ouvrir l’annuaire déjà filtré sur cette organisation, ou sur `Page publique des organisations` pour voir comment l’organisation est présentée aux visiteurs.

### Les statuts d’une demande de formation

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Brouillon | Le responsable prépare encore sa demande ; vous ne la voyez pas. |  |
| Soumise | La demande vous est transmise. | Sur la plateforme : demander un complément, accepter, refuser ou proposer une autre date, sous 5 jours ouvrés. |
| Complément demandé | Vous avez demandé des précisions ; la demande est de retour chez l’organisation. | Attendre la nouvelle soumission. |
| Autre date proposée | Vous avez proposé une autre date ; l’organisation doit répondre. |  |
| Acceptée | La demande est validée et attend la planification. | Planifier sur la plateforme (une cohorte par module). |
| Refusée | Demande refusée avec un motif transmis à l’organisation. Dossier clos. |  |
| Planifiée | Les cohortes sont créées, les participants inscrits et convoqués. |  |
| Formation en cours | Les cohortes ont démarré. |  |
| Terminée | Formation achevée. Dossier clos. |  |
| Annulée | Demande annulée. Dossier clos. |  |

### Les statuts d’une cohorte

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Planifiée | Cohorte créée, dates fixées. |  |
| Inscriptions ouvertes | Des places sont proposées au catalogue public. |  |
| En cours | La formation a commencé. |  |
| Clôturée | Formation terminée ; certificats émis ou à émettre sur la plateforme. |  |
| Annulée | Cohorte annulée. |  |

> **Rien ne se décide sur le site** : Les boutons de décision, les commentaires obligatoires (complément, refus), la limite de participants et les pièces jointes sont décrits dans le guide de la coordination sur la plateforme de formation.

### Si ça ne marche pas

- **La carte « Demandes de formation » affiche « Aucune demande ».** (cause probable : Le responsable n’a rien soumis, ou sa demande est encore en brouillon.) : Vérifiez qu’un responsable est bien désigné (badge « Responsable ») et que l’organisation est active.
- **Le lien vers la demande affiche une page introuvable sur la plateforme.** (cause probable : La demande a été supprimée ou votre session sur la plateforme a expiré.) : Reconnectez-vous puis réessayez depuis la fiche de l’organisation.

## 9. Comment retrouver un compte et vérifier ses rôles <a id="retrouver-un-compte"></a>

*Utiliser l’annuaire des comptes en lecture seule : rôles, organisations, sécurité, inscriptions.*

L’annuaire **Utilisateurs et rôles** regroupe les comptes des deux plateformes. Pour votre rôle, il est en consultation seule : vous pouvez tout lire, mais la création de comptes, l’attribution des rôles et la désactivation sont réservées au super administrateur.

1. Ouvrez **Utilisateurs et rôles**.
   - Où : menu de gauche, section « Administration » ; ou bouton `Utilisateurs` du tableau de bord
   - Résultat attendu : La page affiche les tuiles « Comptes enregistrés », « Apprenants », « Équipe pédagogique », « Équipe d’administration » puis le tableau.
2. Saisissez un nom, une adresse email ou un employeur dans le champ **Nom, email ou employeur**.
3. Affinez si besoin avec les listes **Rôle** (Apprenant, Responsable d’organisation, Formateur, Coordinateur formation…), **Statut** (Actifs / Désactivés) et **Organisation**.
4. Cliquez sur `Filtrer`.
   - Résultat attendu : Le tableau ne montre que les comptes correspondants ; `Réinitialiser` efface les filtres.
   - Remarque : Sur mobile, seules les colonnes « Utilisateur » et « Rôles » sont visibles : ouvrez la fiche pour le reste.
5. Cliquez sur le nom de la personne.
   - Résultat attendu : Sa fiche s’ouvre : en-tête avec « Compte actif » ou « Compte désactivé » et « MFA active » si la vérification en deux étapes est activée.
6. Lisez la carte « Rôles et portées » : chaque ligne indique le rôle, sa portée (Globale, Organisation, Cours ou Cohorte) et son expiration (« Sans limite », « Jusqu’au … », « Expiré le … »).
   - Remarque : Un rôle « (limité) » ne s’applique qu’à une organisation, un cours ou une cohorte précise.
7. Lisez la carte « Organisations » : les appartenances avec le badge « Responsable » (or) ou « Membre ».
   - Remarque : Pour ajouter une appartenance, passez par la fiche de l’organisation (carte « Ajouter un membre ») : le lien du nom de l’organisation vous y mène.
8. Consultez si besoin « Inscriptions à la formation » (statut, progression, score), « Commandes » (référence cliquable vers la finance) et « Dernières connexions ».
9. Cliquez sur `Fiche sur la plateforme de formation` pour ouvrir le même compte côté plateforme.
   - Où : carte « Repères », colonne de droite (en bas sur mobile)

### Les badges de l’annuaire et de la fiche

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Actif / Compte actif | Le compte peut se connecter. |  |
| Désactivé / Compte désactivé | Le compte ne peut plus se connecter. | Seul le super administrateur peut le réactiver. |
| MFA / MFA active | Vérification en deux étapes activée. |  |
| Aucun rôle | Le compte ne peut que consulter les contenus publics et son espace personnel. |  |
| (limité) | Rôle à portée restreinte (organisation, cours ou cohorte). |  |

### Ce que vous ne pouvez pas faire depuis l’annuaire

- `Nouveau compte` : masqué ; si vous saisissez l’adresse de la page, vous êtes redirigé vers « Accès refusé ».
- `Attribuer un rôle` et `Révoquer` : masqués (la carte « Rôles et portées » est en lecture).
- `Désactiver le compte`, `Réinitialiser la MFA`, mot de passe temporaire : masqués (la carte « Compte » indique « Consultation seule. »).
- Le journal d’audit du compte n’est pas affiché.

### Si ça ne marche pas

- **La recherche ne trouve pas la personne.** (cause probable : Elle s’est inscrite avec une autre adresse, ou n’a pas de compte.) : Essayez avec le nom de famille seul, puis avec l’employeur. Si rien n’apparaît, demandez-lui de s’inscrire sur le site.
- **Un formateur ou un responsable a un rôle qui n’apparaît plus.** (cause probable : Le rôle avait une date d’expiration dépassée (« Expiré le … »).) : Demandez au super administrateur de l’attribuer à nouveau.

## 10. Comment consulter la finance et faire émettre un reçu <a id="consulter-la-finance"></a>

*Lire le tableau de bord financier et les commandes ; émettre un reçu ; relancer le rapprochement des paiements.*

La rubrique **Finance** regroupe les commandes et les paiements des deux plateformes (formations, événements, services, ressources), en francs CFA sans centimes. Votre rôle y accède en lecture. Deux actions vous sont ouvertes : faire émettre ou régénérer le reçu d’une commande réglée, et relancer le rapprochement des paiements en attente. Le remboursement et les exports comptables sont réservés au rôle **Finance / contrôle**.

### Les statuts d’une commande

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| En attente | Le paiement n’est pas encore confirmé (ligne sur fond or clair). | Relancer le rapprochement si l’attente dépasse 15 minutes. |
| Payée | Paiement confirmé ; le reçu peut être émis et les livrables (inscription, événement) sont déclenchés. |  |
| Échouée | Le fournisseur de paiement a refusé la transaction ; le motif s’affiche sur la commande. |  |
| Annulée | Commande annulée avant paiement. |  |
| Remboursée | Montant intégralement remboursé par le rôle Finance. |  |
| Partiellement remboursée | Une partie du montant a été remboursée. |  |

### Si ça ne marche pas

- **L’alerte « Indicateurs indisponibles » s’affiche sur le tableau de bord Finance.** (cause probable : Le calcul des statistiques a échoué temporairement.) : Les listes de commandes restent accessibles ; réessayez dans quelques instants.
- **Le bouton `Émettre le reçu` n’apparaît pas.** (cause probable : La commande n’est pas réglée : le reçu ne peut être émis que pour une commande Payée, Partiellement remboursée ou Remboursée.) : Attendez la confirmation du paiement (relancez le rapprochement si nécessaire).
- **Le message « Le PDF n’est pas encore disponible : son rendu est en file d’attente. » reste affiché.** (cause probable : Le PDF est généré en arrière-plan par un traitement périodique.) : Revenez quelques minutes plus tard. Si rien ne change après une heure, signalez la référence de la commande au support.
- **Vous ne trouvez ni bouton `Rembourser` ni `Exporter (CSV)`.** (cause probable : Ces actions exigent le rôle Finance / contrôle.) : Transmettez la demande (référence de la commande, motif) au rôle Finance.

### Lire le tableau de bord financier <a id="lire-le-tableau-de-bord-financier"></a>

1. Ouvrez **Finance**.
   - Où : menu de gauche, section « Administration »
   - Résultat attendu : La page « Finance » s’affiche avec la sous-navigation en pastilles `Tableau de bord`, `Commandes`, `Prises en charge`.
2. Lisez les tuiles : « Chiffre d’affaires du mois », « Commandes en attente » (montant et nombre de paiements à confirmer), « Remboursés sur 12 mois », « Panier moyen ».
3. Parcourez « Chiffre d’affaires mensuel » (12 mois) et « Moyens de paiement » (répartition Formations / Événements / Services / Ressources).
4. Vérifiez la carte « Webhooks de paiement » : un badge « {n} anomalie(s) » signale des notifications de fournisseur en « Erreur » ou « Non vérifié ».
   - Remarque : Un webhook est un message automatique envoyé par le fournisseur de paiement (Mobile Money, carte) pour confirmer une transaction. En cas d’anomalies répétées, prévenez le rôle Finance et le support.
5. Consultez « Dernières commandes » ; cliquez sur `Toutes les commandes` pour la liste complète.
6. Repérez la carte marine « Prises en charge » et son bouton `Gérer les prises en charge` (pour vous : consultation).
   - Où : en bas de la page

### Rechercher une commande <a id="rechercher-une-commande"></a>

1. Cliquez sur la pastille `Commandes`.
   - Où : sous l’en-tête « Finance »
   - Résultat attendu : La page « Commandes » s’affiche.
2. Saisissez la référence, l’email du client ou le libellé dans le champ **Référence, email du client ou libellé**.
3. Affinez avec **Statut**, **Organisation** et la **Période de création** (champs Du / Au), puis cliquez sur `Filtrer`.
   - Remarque : La date « Au » couvre toute la journée.
4. Cliquez sur la référence de la commande.
   - Résultat attendu : La page « Commande {référence} » s’ouvre : « Récapitulatif », « Paiements », « Livrables », « Historique », et à droite « Client », « Reçu », « Rapprochement ».
5. Dans « Récapitulatif », vérifiez la ligne « Remise » : elle indique le code promotionnel ou la prise en charge appliquée et son pourcentage.
6. Dans « Livrables », cliquez sur `Plateforme de formation` pour suivre l’inscription déclenchée par la commande.

### Faire émettre ou régénérer un reçu <a id="emettre-un-recu"></a>

Un reçu est le justificatif de paiement numéroté REC-AAAA-XXXXXX, généré en PDF après confirmation du paiement.

1. Sur la page de la commande, repérez la carte « Reçu ».
   - Où : colonne de droite (en bas sur mobile)
   - Résultat attendu : Elle affiche le numéro et la date d’émission, ou « Aucun reçu émis pour cette commande réglée. »
2. Cliquez sur `Émettre le reçu` (ou `Régénérer le PDF` si un reçu existe déjà).
   - Résultat attendu : Le message « Reçu {numéro} émis ; le PDF est généré en arrière-plan. » s’affiche.
   - Remarque : Pendant l’envoi, le bouton indique « Mise en file ».
3. Revenez quelques minutes plus tard et cliquez sur `Télécharger le PDF`.
   - Résultat attendu : Le reçu s’ouvre ou se télécharge selon votre navigateur.

### Relancer le rapprochement des paiements <a id="relancer-le-rapprochement"></a>

Le rapprochement re-vérifie auprès des fournisseurs les paiements « En attente de confirmation » depuis plus de 15 minutes (100 au maximum par exécution). Il est utile quand un apprenant affirme avoir payé par Mobile Money et que sa commande reste « En attente ».

1. Sur le tableau de bord Finance, cliquez sur `Lancer le rapprochement`.
   - Où : en haut à droite de l’en-tête (pleine largeur sur mobile)
   - Résultat attendu : Le message « {n} paiement(s) vérifié(s), {n} mis à jour. » ou « Aucun paiement en attente à rapprocher. » s’affiche.
   - Remarque : Pendant l’exécution, le bouton indique « Rapprochement en cours ».
2. Pour une seule commande, ouvrez-la et cliquez sur `Relancer le rapprochement` dans la carte « Rapprochement ».
   - Résultat attendu : Si la commande passe « Payée », les livrables se déclenchent et le client reçoit l’email « Paiement confirmé - commande {référence} ».
   - Remarque : Si la carte indique « Aucun paiement de cette commande n’est en attente. », il n’y a rien à rapprocher.

## 11. Comment consulter les prises en charge <a id="consulter-les-prises-en-charge"></a>

*Vérifier les bourses et financements accordés, sans pouvoir les modifier.*

Une **prise en charge** est un pourcentage du montant d’une formation ou d’un événement financé par la Fédération ou par une organisation pour un bénéficiaire. Elle s’applique automatiquement au moment du paiement : si elle couvre 100 %, la commande est validée sans paiement. Sur le site, vous consultez les prises en charge ; leur création, leur clôture et leur suppression sont réservées au rôle **Finance / contrôle**.

> **Aucune décision sur les prises en charge** : Le bouton `Nouvelle prise en charge` et les actions `Clôturer` / `Supprimer` ne vous sont pas proposés. Pour faire accorder une prise en charge à un participant, transmettez au rôle Finance : l’adresse email du bénéficiaire, la formation ou l’événement visé (ou « toute l’offre »), le pourcentage, le financeur (Fédération ou organisation) et la date de fin de validité éventuelle.

1. Ouvrez **Finance** puis la pastille `Prises en charge`.
   - Où : sous l’en-tête « Finance » ; ou bouton `Gérer les prises en charge` en bas du tableau de bord Finance
   - Résultat attendu : La page « Prises en charge » s’affiche avec les tuiles « Prises en charge en cours de validité » et « Prises en charge accordées ».
2. Recherchez par **Bénéficiaire, libellé ou organisation**, filtrez par **Validité** (En cours / Expirées) ou **Organisation**, puis cliquez sur `Filtrer`.
3. Lisez chaque ligne : bénéficiaire (nom cliquable vers sa fiche), libellé et cible (« Formation · … », « Événement · … » ou « Toute l’offre »), taux (badge or si 100 %), financeur (organisation ou « Fédération »), validité, nombre d’utilisations, auteur.
   - Remarque : Sur mobile, le libellé et la cible sont rappelés sous le bénéficiaire ; les autres colonnes sont masquées.
4. Pour vérifier qu’une prise en charge a bien été appliquée, ouvrez la commande du bénéficiaire (**Finance** › `Commandes`) et lisez la ligne « Remise » du récapitulatif.

### La validité d’une prise en charge

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Sans limite | Valable jusqu’à sa clôture par le rôle Finance. |  |
| Jusqu’au {date} | Valable jusqu’à la date indiquée. |  |
| Expirée le {date} | N’est plus appliquée au paiement (ligne estompée). |  |
| Fédération | Financeur : la Fédération elle-même (aucune organisation). |  |
| Toute l’offre | Cible : toutes les formations et tous les événements. |  |

### Si ça ne marche pas

- **Un participant devait être pris en charge mais sa commande affiche le montant plein.** (cause probable : La prise en charge est expirée, cible une autre formation, ou a été créée avec une autre adresse email.) : Retrouvez-la avec le filtre **Validité** = Expirées et vérifiez la cible et le bénéficiaire ; signalez l’écart au rôle Finance.
- **Deux prises en charge concernent la même personne.** (cause probable : C’est possible : au paiement, la plus favorable en cours de validité (spécifique ou générale) est appliquée.) : Aucune action ; vérifiez seulement que la plus favorable est bien celle attendue.

## 12. Comment consulter les rapports et exporter un CSV <a id="consulter-les-rapports"></a>

*Lire les indicateurs du site et de la plateforme, télécharger un export, rejoindre les rapports détaillés.*

1. Ouvrez **Rapports**.
   - Où : menu de gauche, section « Administration » ; ou bouton `Rapports détaillés` en haut du tableau de bord
   - Résultat attendu : La page « Rapports » s’affiche, sans cookie de suivi, avec deux sections : « Site institutionnel · 30 derniers jours » et « Plateforme de formation ».
2. Lisez la section « Site institutionnel » : « Pages vues », « Formulaires reçus », « Inscriptions aux événements », « Conversion des commandes », la carte « Visites » et « Formulaires et recherches » (avec les recherches fréquentes).
3. Lisez la section « Plateforme de formation » : « Apprenants actifs sur 30 jours », « Nouvelles inscriptions sur 30 jours », « Taux de complétion », « Certificats émis sur 30 jours », puis la carte « Inscriptions et complétions » (12 mois).
4. Examinez la carte « Qualité de la formation » : réussite aux évaluations, score moyen, assiduité, enquêtes de satisfaction, temps moyen par inscription, inscriptions en attente, et le bloc « Demandes de formation » par statut.
   - Remarque : C’est ici que vous repérez un module dont la réussite ou l’assiduité décroche.
5. Consultez « Contenus populaires » : actualités, ressources, formations et événements les plus consultés (8 par type).
6. Pour télécharger un export, repérez la carte « Exports CSV » et cliquez sur `Indicateurs du site`, `Indicateurs de formation` ou `Contenus populaires`.
   - Où : colonne de droite ; en bas de la page sur mobile
   - Résultat attendu : Un fichier « fetrag-rapport-{type}-{date}.csv » est téléchargé (UTF-8, séparateur point-virgule). Sur téléphone, il est proposé à l’enregistrement.
   - Remarque : Le CSV s’ouvre avec un tableur. Chaque export est inscrit dans le journal d’audit.
7. Pour les rapports par cohorte, organisation, cours et satisfaction, cliquez sur `Rapports détaillés du LMS`.
   - Où : en haut à droite de l’en-tête
   - Résultat attendu : Les rapports de la plateforme de formation s’ouvrent.

*Contenu des trois exports CSV*

| Export | Contenu |
| --- | --- |
| Indicateurs du site | Visites par jour et synthèse : formulaires, demandes de service, commandes, lettre d’information, recherches. |
| Indicateurs de formation | Synthèse (apprenants actifs, inscriptions, complétion, réussite, assiduité, satisfaction, certificats, cohortes, temps total), inscriptions par statut, séries mensuelles, cours les plus suivis. |
| Contenus populaires | Les 25 premiers contenus par type avec vues, téléchargements ou inscriptions. |

> **Les exports contiennent des données à protéger** : Un export est journalisé et peut contenir des données personnelles ou syndicales. Ne le transmettez qu’aux personnes habilitées, ne l’envoyez pas par une messagerie non professionnelle et supprimez-le de l’appareil quand il n’est plus utile.

### Si ça ne marche pas

- **L’alerte « Indicateurs indisponibles » ou un texte « Indicateurs … indisponibles. » s’affiche.** (cause probable : Le calcul des statistiques a échoué temporairement.) : Rechargez la page dans quelques instants.
- **Le téléchargement affiche un texte « L’export a échoué. » ou « Permission insuffisante ».** (cause probable : Erreur temporaire du serveur, ou rôle expiré.) : Revenez en arrière et réessayez ; si le message persiste, contactez le support avec l’heure de l’essai.
- **Le fichier CSV s’ouvre avec des caractères accentués illisibles.** (cause probable : Le tableur n’a pas reconnu l’encodage UTF-8.) : Ouvrez le fichier par la fonction d’import de votre tableur en choisissant UTF-8 et le séparateur point-virgule.

## 13. Comment envoyer un fichier dans la médiathèque <a id="utiliser-la-mediatheque"></a>

*Déposer des images et des documents réutilisables, les décrire, copier leur adresse, les supprimer.*

La **Médiathèque** stocke les images, documents, audios et vidéos réutilisables dans les contenus du site. Vous ne rédigez pas de pages ni d’actualités : elle vous sert surtout à déposer un visuel ou un document (programme, affiche, support) que l’éditeur communication publiera ensuite, ou dont vous voulez partager l’adresse.

*Fichiers acceptés et tailles maximales*

| Type | Formats acceptés | Taille maximale |
| --- | --- | --- |
| Image | JPEG, PNG, WebP, GIF, AVIF (le SVG est refusé) | 8 Mo |
| Document | PDF, Word, Excel, PowerPoint, OpenDocument texte, texte, CSV | 25 Mo |
| Audio | MP3, MP4 audio, OGG, WAV, WebM | 60 Mo |
| Vidéo | MP4, WebM | 200 Mo |

> **À savoir** : Le dialogue d’envoi annonce « Images (12 Mo) », mais la limite réellement appliquée aux images est de 8 Mo : au-delà, le message « Le fichier dépasse la taille maximale de 8 Mo » s’affiche. Réduisez la photo avant l’envoi.

### Si ça ne marche pas

- **Le message « Type de fichier non autorisé » ou « Extension de fichier refusée » s’affiche.** (cause probable : Le format n’est pas dans la liste (par exemple SVG, ou une archive ZIP).) : Convertissez le fichier dans un format accepté (PNG ou JPEG pour une image, PDF pour un document).
- **Le message « L’extension ne correspond pas au type de fichier » s’affiche.** (cause probable : Le fichier a été renommé avec une extension qui ne correspond pas à son contenu.) : Réenregistrez le fichier depuis l’application d’origine avec la bonne extension.
- **Le message « Copie impossible dans ce navigateur » s’affiche.** (cause probable : Le navigateur bloque l’accès au presse-papiers.) : Ouvrez l’aperçu du fichier dans un nouvel onglet et copiez son adresse depuis la barre du navigateur, ou réessayez depuis un ordinateur.
- **L’envoi échoue sans message précis (« L’envoi du fichier a échoué. »).** (cause probable : Connexion coupée pendant l’envoi, fréquent sur mobile avec un gros fichier.) : Réessayez en Wi-Fi ou avec un fichier plus léger.

### Envoyer un fichier <a id="envoyer-un-fichier"></a>

1. Ouvrez **Médias**.
   - Où : menu de gauche, section « Contenus »
   - Résultat attendu : La page « Médiathèque » affiche les filtres, le bouton `Envoyer un fichier` et la grille des fichiers.
2. Cliquez sur `Envoyer un fichier`.
   - Où : au-dessus de la grille, à droite
   - Résultat attendu : Le dialogue « Envoyer un fichier » s’ouvre.
3. Choisissez le **Fichier** (obligatoire).
   - Remarque : Sur téléphone, le sélecteur propose vos photos et vos documents.
4. Indiquez le **Dossier** (facultatif, « uploads » par défaut ; minuscules, chiffres, tirets).
   - Remarque : Exemple : « formation-2026 ». Le dossier sert à retrouver les fichiers avec le filtre **Dossier**.
5. Choisissez la **Visibilité** : Public (accessible par son adresse) ou Privé (lien signé, réservé aux usages internes).
   - Remarque : Choisissez Privé pour un document qui ne doit pas circuler librement.
6. Pour une image, saisissez le **Texte alternatif** (300 caractères maximum) : une phrase qui décrit l’image pour les personnes qui utilisent un lecteur d’écran.
   - Remarque : Sans texte alternatif, la carte du fichier affiche l’avertissement « Texte alternatif manquant ».
7. Ajoutez une **Légende** si utile (500 caractères maximum), puis cliquez sur `Envoyer`.
   - Résultat attendu : Le message « « {fichier} » envoyé. » s’affiche et la page se recharge avec le nouveau fichier dans la grille.
   - Remarque : Pendant l’envoi, le bouton indique « Envoi en cours » : ne fermez pas la page.

### Copier l’adresse d’un fichier ou corriger ses informations <a id="partager-ou-corriger-un-fichier"></a>

1. Retrouvez le fichier avec le champ **Nom de fichier, texte alternatif** ou les filtres **Dossier**, **Type**, **Visibilité**.
   - Résultat attendu : La grille (une colonne sur mobile) affiche la carte du fichier : aperçu, nom, type, taille, auteur.
2. Cliquez sur `Copier l’URL` (fichier public) ou `Copier la clé` (fichier privé).
   - Résultat attendu : Le message « URL copiée » ou « Clé copiée » s’affiche ; collez l’adresse dans votre message à l’éditeur.
3. Pour corriger la description, cliquez sur `Modifier`.
   - Résultat attendu : Le dialogue « Métadonnées du média » s’ouvre avec **Texte alternatif**, **Légende** et **Dossier**.
4. Corrigez puis cliquez sur `Enregistrer`.
   - Résultat attendu : Le message « Média mis à jour. » s’affiche.

### Supprimer un fichier <a id="supprimer-un-fichier"></a>

> **Suppression définitive** : Le fichier est retiré du stockage et ne peut pas être récupéré. Les pages, actualités ou ressources qui l’utilisent afficheront un lien cassé. Avant de supprimer, demandez à l’éditeur communication si le fichier est utilisé.

1. Sur la carte du fichier, cliquez sur `Supprimer`.
   - Résultat attendu : Le dialogue « Supprimer « {fichier} » ? » rappelle : « Le fichier est retiré du stockage. Les contenus qui l’utilisent afficheront un lien cassé. »
2. Cliquez sur le bouton rouge `Supprimer` pour confirmer, ou sur `Annuler`.
   - Résultat attendu : La carte disparaît de la grille. La suppression est inscrite dans le journal d’audit.

## 14. Comment vérifier une formation dans le catalogue public <a id="verifier-le-catalogue-public"></a>

*Comprendre comment un cours publié sur la plateforme apparaît sur le site, et contrôler sa fiche.*

La page **Formations** du site est alimentée automatiquement par la plateforme de formation : seuls les cours publiés y apparaissent. Vous ne saisissez rien sur le site ; vous publiez sur la plateforme, puis vous contrôlez le résultat côté public.

1. Sur la plateforme de formation, publiez la version du cours puis le cours lui-même.
   - Remarque : Procédure détaillée dans le guide de la coordination sur la plateforme (espace Administration › Cours).
2. Sur le site, ouvrez **Formations** dans la navigation principale.
   - Où : menu du haut ; sur mobile, bouton **Ouvrir le menu** (trois traits)
   - Résultat attendu : Le catalogue « Former les leaders syndicaux de demain » affiche les cours publiés, numérotés, avec les filtres « Pilier » et « Modalité ».
   - Remarque : Tant qu’aucun cours n’est publié, la page affiche l’alerte « Programme officiel 2026 » et les dix modules de repli du programme.
3. Recherchez le module avec le champ **Rechercher un module, un thème, un objectif…** ou les puces de filtre.
4. Ouvrez la fiche du module.
   - Résultat attendu : La fiche affiche le code (par exemple M01), le niveau, la durée, la modalité, les objectifs, le « Programme détaillé » (chapitres, leçons, activités et numéro de version), les prérequis, le tarif, la politique d’inscription, les formateurs et les « Prochaines cohortes ».
   - Remarque : La fiche est mise en cache : une modification publiée sur la plateforme peut mettre jusqu’à 5 minutes à apparaître.
5. Vérifiez la ligne « Inscription » de la colonne « Fiche du module » : « Inscription libre en ligne », « Inscription sur validation de la coordination », « Réservée aux organisations affiliées » ou « Inscription après paiement ».
   - Remarque : Elle traduit la politique d’inscription choisie sur la plateforme. Si elle ne correspond pas, corrigez le cours sur la plateforme.
6. Vérifiez « Prochaines cohortes » : seules les cohortes à venir avec des places restantes sont affichées ; sinon la fiche indique que le module reste accessible à distance.
7. Testez les boutons d’inscription de la fiche : ils mènent à la page du cours sur la plateforme, où l’apprenant est reconnu avec son compte FETRAG.

### Les badges d’une fiche formation publique

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Cours pilote | Cours mis en avant depuis la plateforme. |  |
| Référent | Formateur référent du module. |  |
| Conseillé | Prérequis recommandé mais non obligatoire. |  |
| Programme 2026 | Fiche de repli : le module du programme officiel n’est pas encore publié sur la plateforme. |  |

### Si ça ne marche pas

- **Le cours publié n’apparaît pas dans le catalogue.** (cause probable : Le cours n’est pas au statut Publié sur la plateforme, ou seule la version a été publiée ; ou le cache de 5 minutes n’est pas expiré.) : Vérifiez le statut du cours sur la plateforme, attendez 5 minutes et rechargez la page.
- **La fiche affiche « Le programme détaillé de ce module sera publié prochainement. »** (cause probable : Le cours est publié mais sa version courante n’a pas de contenu publié.) : Publiez la version du cours sur la plateforme.
- **La page « Cette formation est introuvable » s’affiche.** (cause probable : Le cours a été dépublié ou son adresse (slug) a changé.) : Vérifiez l’adresse du cours sur la plateforme et republiez-le si nécessaire.

## 15. Comment consulter la lettre d’information <a id="lettre-d-information"></a>

*Lire la liste des abonnés, en consultation seule.*

1. Ouvrez **Newsletter**.
   - Où : menu de gauche, section « Relations »
   - Résultat attendu : La page « Lettre d’information » affiche les tuiles « Abonnés confirmés », « En attente de confirmation », « Désinscrits ».
2. Recherchez une adresse dans **Adresse email** ou filtrez par **État**, puis cliquez sur `Filtrer`.
   - Résultat attendu : Le tableau affiche l’email, l’état, les dates d’inscription et de confirmation, et l’origine de l’abonnement.

> **Consultation seule** : La suppression d’un abonné n’est pas proposée à votre rôle. Le bouton `Exporter (CSV)` est affiché mais l’export vous est refusé (message « Permission insuffisante ») : demandez-le au responsable services ou à l’éditeur communication.

## 16. Notifications et emails que vous recevez <a id="notifications"></a>

*Ce qui vous parvient, ce qui le déclenche et ce qu’il faut en faire.*

Les notifications internes du site se lisent dans **Notifications** (menu du compte ; badge du nombre de non lues). Celles qui renvoient vers un écran de coordination s’ouvrent sur la plateforme de formation. Les emails arrivent à l’adresse de votre compte.

*Notifications reçues par le coordinateur*

| Sujet | Déclencheur | Que faire |
| --- | --- | --- |
| « Nouvelle demande de formation » – « {organisation} : {modules} ({n} participant(s)). » | Un responsable soumet ou resoumet une demande de formation. Notification interne et email. | Ouvrir le lien vers la demande sur la plateforme et la traiter sous 5 jours ouvrés. |
| « Confirmez votre adresse email - FETRAG » | Création de votre compte ou changement d’adresse. | Cliquer sur le lien pour confirmer. |
| « Réinitialisation de votre mot de passe FETRAG » | Vous avez demandé un lien depuis « Mot de passe oublié ». | Cliquer sur le lien dans les 30 minutes. Si vous n’avez rien demandé, ignorez l’email et prévenez le support. |
| « Votre mot de passe FETRAG a été modifié » | Votre mot de passe vient d’être changé. | Si ce n’est pas vous, contactez immédiatement le support. |

*Notifications que vos actions déclenchent chez les autres*

| Action | Destinataire et message |
| --- | --- |
| Rattacher un membre à une organisation (site) | Le membre reçoit « Rattachement à {organisation} » (email et notification) : version « responsable » ou version « membre » selon la case cochée. |
| Nommer ou retirer un responsable, retirer un membre, désactiver une organisation | Aucune notification : prévenez les personnes concernées vous-même. |
| Envoyer un média, exporter un CSV, relancer le rapprochement, émettre un reçu | Aucune notification ; le client reçoit « Paiement confirmé - commande {référence} » uniquement quand un paiement est confirmé. |
| Décisions sur une demande (plateforme) | Le contact de l’organisation reçoit les emails « Demande … bien reçue », « complément d’information attendu », « acceptée », « réponse de la coordination », « Formation planifiée ». |

### Lire vos notifications sur le site

1. Ouvrez le menu du compte puis **Notifications**.
   - Où : avatar en haut à droite
   - Résultat attendu : La page « Vos notifications » s’affiche avec les filtres `Toutes` et `Non lues (n)`.
2. Cliquez sur une notification pour ouvrir l’écran concerné.
3. Cliquez sur `Tout marquer comme lu` une fois vos notifications traitées.
   - Résultat attendu : Le badge du menu disparaît.

## 17. Bonnes pratiques et sécurité <a id="bonnes-pratiques"></a>

- [x] Activez la vérification en deux étapes dès votre première connexion et gardez vos codes de secours hors du téléphone.
- [x] Déconnectez-vous (menu du compte › `Déconnexion`) sur tout appareil partagé, et ne mémorisez pas votre mot de passe dans le navigateur d’un ordinateur public.
- [x] Ne communiquez jamais votre mot de passe ni un code de vérification, même à un collègue ou à un « support » qui vous le demanderait par téléphone.
- [x] Vérifiez avant de créer une organisation qu’elle n’existe pas déjà (y compris parmi les inactives) : une fiche en double complique le suivi des demandes.
- [x] Désignez toujours au moins un responsable par organisation active et prévenez-le : l’application n’envoie pas d’email lors d’un changement de responsabilité.
- [x] Traitez les demandes « Soumise » sous 5 jours ouvrés, délai annoncé à l’organisation dans l’accusé de réception.
- [x] Préférez « Désactiver » à toute autre solution pour une organisation qui cesse son activité : ses données et son historique restent disponibles.
- [x] Les données de la finance, de l’annuaire et des exports sont confidentielles : ne les partagez qu’avec les rôles habilités, jamais dans un groupe de messagerie.
- [x] Un export CSV contient des données personnelles : supprimez-le de votre appareil quand vous n’en avez plus besoin.
- [x] Avant de supprimer un média, demandez à l’éditeur communication s’il est utilisé : la suppression est définitive.
- [x] Renseignez le texte alternatif de chaque image envoyée : les personnes qui utilisent un lecteur d’écran en dépendent.
- [x] Restez courtois et factuel dans les commentaires transmis aux organisations (compléments, refus) : ils sont conservés dans l’historique de la demande.
- [x] Signalez au super administrateur tout rôle attribué par erreur ou tout compte inconnu dans l’annuaire.

## 18. Questions fréquentes <a id="questions-frequentes"></a>

**Pourquoi le site me demande-t-il un code en plus du mot de passe ?**

Parce que votre rôle donne accès à des données financières et personnelles. La vérification en deux étapes protège votre compte même si votre mot de passe est deviné. Le code est lu dans l’application d’authentification de votre téléphone.

**Puis-je créer le compte d’un responsable d’organisation moi-même ?**

Non. La personne crée son compte par l’inscription sur le site, ou le super administrateur le crée pour elle. Vous rattachez ensuite ce compte depuis la fiche de l’organisation avec son adresse email.

**J’ai fait une faute dans le nom d’une organisation : comment corriger ?**

Le site ne propose pas de formulaire de modification. Ouvrez la fiche de l’organisation sur la plateforme de formation (Coordination › Organisations) et corrigez-la là.

**Puis-je accorder une prise en charge à un participant ?**

Non. Vous consultez seulement les prises en charge. Transmettez au rôle Finance l’email du bénéficiaire, la formation visée, le pourcentage, le financeur et la date de fin de validité.

**Un apprenant dit avoir payé par Mobile Money mais sa commande reste « En attente ». Que faire ?**

Ouvrez la commande dans **Finance** › `Commandes` et cliquez sur `Relancer le rapprochement` (paiement en attente depuis plus de 15 minutes). Si le paiement reste non confirmé, transmettez la référence de la commande et le numéro de transaction au rôle Finance.

**Puis-je rembourser une commande ?**

Non, le remboursement est réservé au rôle Finance / contrôle. Vous pouvez en revanche faire émettre ou régénérer le reçu d’une commande réglée.

**Que se passe-t-il quand je retire un membre d’une organisation ?**

Seule l’appartenance (et la responsabilité éventuelle) est retirée. Le compte, ses inscriptions et ses demandes sont conservés. Vous pouvez le rattacher à nouveau plus tard.

**Pourquoi une organisation n’apparaît-elle plus dans les listes de choix ?**

Elle a été désactivée. Retrouvez-la dans **Organisations** avec le filtre **Statut** = Inactives, ouvrez sa fiche et cliquez sur `Réactiver`.

**Le cours que je viens de publier n’est pas sur la page Formations du site.**

Vérifiez que le cours (et pas seulement sa version) est au statut Publié sur la plateforme, puis attendez jusqu’à 5 minutes : la fiche publique est mise en cache.

**Puis-je supprimer un abonné de la lettre d’information ou exporter la liste ?**

Non. La page **Newsletter** est en consultation seule pour votre rôle ; le bouton d’export affiché renvoie « Permission insuffisante ». Adressez-vous au responsable services ou à l’éditeur communication.

**Je change de téléphone : que faire pour la vérification en deux étapes ?**

Avant de rendre l’ancien téléphone, ouvrez **Sécurité**, désactivez la vérification avec un code, puis réactivez-la en scannant le QR code avec le nouveau téléphone. Si l’ancien téléphone est déjà perdu, utilisez un code de secours ou demandez la réinitialisation au super administrateur.

**Où sont les rapports par cohorte et par organisation ?**

Sur la plateforme de formation : cliquez sur `Rapports détaillés du LMS` en haut de la page **Rapports** du site. Le site ne propose que les indicateurs globaux et trois exports CSV.

## 19. Lexique <a id="lexique"></a>

- **Back-office** : L’espace d’administration du site, réservé au personnel habilité, accessible par **Administration du site** dans le menu du compte.
- **Vérification en deux étapes (MFA)** : Protection du compte par un code à 6 chiffres, affiché par une application d’authentification sur le téléphone, demandé en plus du mot de passe.
- **Application d’authentification** : Application gratuite (Google Authenticator, Microsoft Authenticator, FreeOTP) qui génère les codes de vérification, même sans connexion Internet.
- **Codes de secours** : Codes à usage unique remis à l’activation de la vérification en deux étapes, pour entrer si le téléphone est indisponible.
- **Organisation affiliée** : Syndicat membre de la Fédération (case « Organisation affiliée » cochée). Un partenaire est une organisation non affiliée.
- **Membre** : Compte rattaché à une organisation, sans droit particulier.
- **Responsable (d’organisation)** : Membre habilité à déposer les demandes de formation, suivre les participants et consulter les rapports de son organisation sur la plateforme.
- **Slug** : Partie de l’adresse web qui identifie une fiche (minuscules, chiffres, tirets), par exemple le sigle de l’organisation en minuscules.
- **Demande de formation** : Dossier déposé par le responsable d’une organisation pour former un groupe sur un ou plusieurs modules ; instruit sur la plateforme de formation.
- **Cohorte** : Groupe d’apprenants suivant ensemble un module, avec un formateur et des dates ; créée à la planification d’une demande ou directement sur la plateforme.
- **Prise en charge** : Pourcentage du montant d’une formation ou d’un événement financé par la Fédération ou une organisation pour un bénéficiaire ; appliqué automatiquement au paiement.
- **Commande** : Achat passé sur le site ou la plateforme (formation, événement, service, ressource), avec ses paiements et son statut.
- **Rapprochement** : Vérification automatique auprès des fournisseurs des paiements en attente depuis plus de 15 minutes, pour mettre à jour le statut des commandes.
- **Reçu** : Justificatif de paiement numéroté REC-AAAA-XXXXXX, généré en PDF après confirmation du paiement.
- **Webhook** : Message automatique envoyé par un fournisseur de paiement pour confirmer une transaction ; vérifié par signature avant traitement.
- **Mobile Money** : Paiement par porte-monnaie mobile (opérateur téléphonique), confirmé par le fournisseur puis rapproché par la plateforme.
- **Rôle et portée** : Un rôle définit ce qu’un compte peut faire ; sa portée est « Globale » (toute la plateforme) ou limitée à une organisation, un cours ou une cohorte.
- **Export CSV** : Fichier texte tabulaire (séparateur point-virgule, encodage UTF-8) qui s’ouvre dans un tableur ; chaque export est journalisé.
- **Journal d’audit** : Registre des actions sensibles (organisations, membres, médias, exports, reçus) avec leur auteur et leur date ; consultable par le super administrateur.
- **Médiathèque** : Bibliothèque des fichiers (images, documents, audio, vidéo) réutilisables dans les contenus du site.
- **Texte alternatif** : Phrase qui décrit une image pour les personnes qui utilisent un lecteur d’écran ; obligatoire pour les images informatives.
- **Lien signé** : Adresse temporaire qui permet d’ouvrir un fichier privé de la médiathèque sans le rendre public.
- **Catalogue public** : Page **Formations** du site, alimentée automatiquement par les cours publiés sur la plateforme de formation.
- **Politique d’inscription** : Règle d’accès à un cours : libre en ligne, sur validation de la coordination, réservée aux organisations affiliées, ou après paiement.
- **Fil d’Ariane** : Ligne au-dessus du titre (Administration › Organisations › nom) qui indique où vous êtes et permet de remonter.

## 20. Besoin d’aide ? <a id="besoin-d-aide"></a>

*À qui s’adresser*

| Votre problème | Interlocuteur |
| --- | --- |
| Connexion impossible, code de vérification refusé, téléphone perdu, rôle manquant, compte à créer ou à désactiver, rôle à attribuer | Le super administrateur (par le formulaire de contact du site, ou le secrétariat général). |
| Prise en charge à accorder ou à clôturer, remboursement, export comptable, paiement introuvable | Le rôle Finance / contrôle de la Fédération. |
| Contenu à publier sur le site à partir d’un fichier de la médiathèque, liste d’abonnés à la lettre d’information | L’éditeur communication ou le responsable services. |
| Demande de formation, cours, cohorte, certificat | Votre propre espace sur la plateforme de formation (guide de la coordination sur la plateforme). |
| Panne, message d’erreur répété, page qui ne se charge pas | Le support, par le formulaire de contact du site. |

### Dans un message d’aide, indiquez

- L’adresse email de votre compte (jamais votre mot de passe ni un code de vérification).
- L’écran concerné (par exemple « Organisations › fiche de … › Ajouter un membre ») et l’appareil utilisé (téléphone ou ordinateur, navigateur).
- Le message d’erreur exact, recopié tel qu’affiché, et l’heure de l’essai.
- La référence concernée : nom de l’organisation, référence de la commande ou de la demande.

### Contacter la Fédération

- [Formulaire de contact du site](/contact) : Support et demandes d’accès (objet conseillé : « Demande de droits d’accès »).
- [Écrire au secrétariat général](mailto:jossngomafm@gmail.com) : Adresse email de la Fédération.
- [Téléphone : 066 23 00 33](tel:+24166230033) : Secrétariat de la Fédération, aux heures de bureau.
- [Téléphone : 077 52 27 98](tel:+24177522798) : Second numéro de la Fédération.
- [Espace de coordination sur la plateforme](https://formation.fetrag.ga/coordination) : Demandes, cohortes, certificats et rapports détaillés.

Adresse postale : Fédération des Travailleurs du Gabon (FETRAG), BP 1234 Libreville, Gabon.

## Testez votre maîtrise <a id="autoevaluation"></a>

Vingt questions pour vérifier que vous savez où agir (sur le site ou sur la plateforme), ce qui est réversible et à qui vous adresser. Comptez dix minutes ; le corrigé renvoie à la section du guide. Seuil de maîtrise : 70 % de bonnes réponses. 20 questions.

1. Où prenez-vous la décision (accepter, refuser, demander un complément) sur une demande de formation ? *(une seule réponse)*
   - a) Sur la fiche de l’organisation, dans le back-office du site.
   - b) Sur la plateforme de formation, dans votre espace de coordination.
   - c) Sur la page « Rapports » du site.

2. Parmi ces actions, lesquelles vous sont interdites sur le site ? *(plusieurs réponses possibles)*
   - a) Attribuer un rôle à un compte.
   - b) Rembourser une commande.
   - c) Rattacher un compte existant à une organisation.
   - d) Accorder une prise en charge.

3. Quel lien du menu du compte ouvre le back-office du site ? *(une seule réponse)*
   - a) **Mon espace**
   - b) **Administration du site**
   - c) **Plateforme de formation**

4. Un code de secours peut être utilisé plusieurs fois. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

5. La déconnexion sur le site vous déconnecte aussi de la plateforme de formation. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

6. Sur un téléphone, comment ouvrir la rubrique **Organisations** du back-office ? *(une seule réponse)*
   - a) Avec le bouton **Ouvrir la navigation** (trois traits) en haut à gauche, puis **Organisations**.
   - b) En cliquant sur l’avatar en haut à droite.
   - c) En faisant défiler la page d’accueil jusqu’en bas.

7. Vous avez fait une faute dans le nom d’une organisation que vous venez de créer. Que faites-vous ? *(une seule réponse)*
   - a) Je clique sur `Modifier` dans l’en-tête de la fiche sur le site.
   - b) J’ouvre la fiche de l’organisation sur la plateforme de formation et je corrige le nom.
   - c) Je crée une seconde organisation avec le bon nom.

8. Une organisation est créée automatiquement quand une personne indique un employeur inconnu à l’inscription. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

9. Le message « Aucun compte ne correspond à cette adresse ; créez d’abord l’utilisateur. » s’affiche. Que faites-vous ? *(une seule réponse)*
   - a) Je crée le compte avec `Nouveau compte` dans **Utilisateurs et rôles**.
   - b) Je vérifie l’adresse exacte du compte ; sinon j’invite la personne à s’inscrire ou je demande la création au super administrateur.
   - c) Je coche **Responsable** et je réessaie.

10. Après `Retirer` sur la ligne d’un membre, qu’est-ce qui est conservé ? *(plusieurs réponses possibles)*
   - a) Le compte de la personne.
   - b) Ses inscriptions et ses demandes de formation.
   - c) Sa responsabilité sur l’organisation.

11. Désactiver une organisation efface ses demandes de formation et ses cohortes. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

12. Quel délai de réponse l’accusé de réception annonce-t-il à l’organisation qui a déposé une demande ? *(une seule réponse)*
   - a) 48 heures.
   - b) 5 jours ouvrés.
   - c) 30 jours.

13. Sur la fiche d’un formateur, son rôle affiche « Expiré le … ». Que faites-vous ? *(une seule réponse)*
   - a) Je clique sur `Attribuer un rôle` sur sa fiche.
   - b) Je demande au super administrateur de lui attribuer le rôle à nouveau.
   - c) Je le rattache à une organisation comme responsable.

14. Un apprenant affirme avoir payé par Mobile Money il y a une heure, mais sa commande reste « En attente ». Quel bouton utilisez-vous ? *(une seule réponse)*
   - a) `Rembourser`
   - b) `Relancer le rapprochement`
   - c) `Émettre le reçu`

15. Vous pouvez émettre le reçu d’une commande encore « En attente ». *(vrai ou faux)*
   - a) Vrai
   - b) Faux

16. Une organisation finance à 100 % la formation d’un de ses membres. Comment faire appliquer cette prise en charge ? *(une seule réponse)*
   - a) Je clique sur `Nouvelle prise en charge` dans **Finance**.
   - b) Je transmets au rôle Finance l’email du bénéficiaire, la formation, le pourcentage, le financeur et la date de fin.
   - c) Je crée un code promotionnel sur la plateforme.

17. Quel est le format des exports proposés sur la page **Rapports** du site ? *(une seule réponse)*
   - a) Trois fichiers CSV (UTF-8, séparateur point-virgule), chaque export étant journalisé.
   - b) Un classeur Excel par cohorte.
   - c) Un rapport PDF mensuel envoyé par email.

18. Un fichier supprimé de la médiathèque peut être restauré par le super administrateur. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

19. Vous avez publié un cours sur la plateforme il y a deux minutes, mais il n’apparaît pas encore sur la page **Formations** du site. Que faites-vous ? *(une seule réponse)*
   - a) J’attends jusqu’à 5 minutes (la fiche est mise en cache) et je recharge la page.
   - b) Je saisis le cours dans le back-office du site.
   - c) Je contacte immédiatement le support.

20. Que devez-vous indiquer dans un message d’aide au support ? *(plusieurs réponses possibles)*
   - a) L’adresse email de votre compte.
   - b) Le message d’erreur exact et l’heure de l’essai.
   - c) Votre mot de passe.
   - d) Votre code de vérification en cours.

### Corrigé

1. **b** : Le site ne fait que montrer l’état des demandes ; les décisions se prennent sur la plateforme. Voir « Votre rôle en bref ».
2. **a, b, d** : Les rôles relèvent du super administrateur, le remboursement et les prises en charge du rôle Finance. Le rattachement d’un membre vous est ouvert. Voir « Votre rôle en bref ».
3. **b** : **Administration du site** mène au tableau de bord « Bonjour {prénom} ». Voir « Se connecter au site ».
4. **b** : Chaque code de secours ne sert qu’une fois ; conservez-les hors du téléphone. Voir « Activer la vérification en deux étapes ».
5. **a** : Le compte est le même sur les deux plateformes. Voir « Se déconnecter ».
6. **a** : Sur mobile, la barre latérale devient un tiroir ouvert par **Ouvrir la navigation**. Voir « Se repérer dans le back-office ».
7. **b** : Le site ne propose pas de formulaire de modification ; la correction se fait sur la plateforme. Voir « Comment créer une organisation affiliée ou partenaire ».
8. **b** : Aucune création automatique : c’est vous (ou le super administrateur) qui créez la fiche. Voir « Comment créer une organisation affiliée ou partenaire ».
9. **b** : Le compte doit exister avant le rattachement et vous ne pouvez pas le créer vous-même. Voir « Rattacher un compte existant ».
10. **a, b** : Seules l’appartenance et la responsabilité éventuelle sont retirées ; le compte et son historique restent. Voir « Retirer un membre de l’organisation ».
11. **b** : La désactivation masque seulement l’organisation des listes de choix ; tout est conservé et `Réactiver` la remet en service. Voir « Comment désactiver ou réactiver une organisation ».
12. **b** : L’email « Demande de formation … bien reçue » mentionne « sous 5 jours ouvrés ». Voir « Comment suivre les demandes de formation et les cohortes depuis le site ».
13. **b** : L’annuaire est en consultation seule pour votre rôle ; l’attribution des rôles relève du super administrateur. Voir « Comment retrouver un compte et vérifier ses rôles ».
14. **b** : Le rapprochement re-vérifie les paiements en attente depuis plus de 15 minutes. Voir « Relancer le rapprochement des paiements ».
15. **b** : Le reçu n’est émis que pour une commande réglée (Payée, Partiellement remboursée ou Remboursée). Voir « Faire émettre ou régénérer un reçu ».
16. **b** : La création des prises en charge est réservée au rôle Finance ; vous les consultez seulement. Voir « Comment consulter les prises en charge ».
17. **a** : Seuls trois exports CSV existent sur le site ; les rapports par cohorte sont sur la plateforme. Voir « Comment consulter les rapports et exporter un CSV ».
18. **b** : La suppression est définitive : le fichier est retiré du stockage et les contenus qui l’utilisent affichent un lien cassé. Voir « Supprimer un fichier ».
19. **a** : Le catalogue est alimenté automatiquement par la plateforme, avec un cache de 5 minutes. Voir « Comment vérifier une formation dans le catalogue public ».
20. **a, b** : Jamais de mot de passe ni de code de vérification dans un message. Voir « Besoin d’aide ? ».

## Guides liés

- [Guide du membre](/espace/guide) : Votre compte, votre profil, vos notifications et votre sécurité sur le site.
- [Guide de la coordination sur la plateforme de formation](https://formation.fetrag.ga/coordination/guide) : Demandes de formation, cours, cohortes, sessions, certificats et rapports détaillés.
