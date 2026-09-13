# Guide de l’éditeur communication

*Publier et animer le site institutionnel : pages, actualités, ressources, agenda, partenaires et messages reçus*

Plateforme : site institutionnel fetrag.ga · Rôle : EDITOR · Version 1.0 du 2026-09-12 · Lecture : 55 min · 22 sections, 157 étapes.

Version en ligne : https://fetrag.ga/admin/guide/web-editeur

**À qui s'adresse ce guide ?** Les personnes de la Fédération chargées de la communication et disposant du rôle « Éditeur communication » sur le site institutionnel : rédaction des actualités et des communiqués, mise à jour des pages, dépôt des documents, agenda des événements, partenaires, questions fréquentes et suivi des messages reçus.

Avec le rôle « Éditeur communication », vous rédigez, relisez et publiez vous-même les contenus du site institutionnel : pages, actualités, ressources documentaires, événements, questions fréquentes et partenaires. Vous alimentez la médiathèque, classez les contenus par catégories et suivez les messages envoyés depuis les formulaires du site ainsi que les abonnés à la lettre d’information. Ce guide décrit chaque écran du back-office, le cycle de publication (brouillon, relecture, planifié, publié, archivé) et les bonnes pratiques éditoriales et de sécurité.

## Avant de commencer

- Un compte FETRAG dont l’adresse email est confirmée (le lien de confirmation est envoyé par email à la création du compte).
- Le rôle « Éditeur communication », attribué par le super administrateur (sans ce rôle, la page « Accès refusé » s’affiche).
- Une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP) : la vérification en deux étapes est exigée pour votre rôle.
- Un ordinateur ou un téléphone connecté à Internet. Sur ordinateur, les tableaux affichent plus de colonnes et l’éditeur de texte est plus confortable ; sur téléphone, tout reste faisable.
- Les textes, images et documents validés par le Secrétariat général avant leur mise en ligne.

## Prise en main en cinq minutes

1. Connectez-vous avec votre adresse email et votre mot de passe.
   - Élément : `Se connecter` (page **Connexion**, bouton en bas du formulaire)
   - Résultat attendu : Votre espace personnel s’ouvre.
2. Activez la vérification en deux étapes depuis **Sécurité** si ce n’est pas déjà fait.
   - Où : menu de votre compte (vos initiales, en haut à droite) > **Sécurité**
   - Résultat attendu : Le badge « Vérification en deux étapes active » s’affiche et vos codes de secours apparaissent une seule fois.
3. Ouvrez le menu de votre compte puis choisissez **Administration du site**.
   - Où : vos initiales, en haut à droite du site
   - Résultat attendu : Le tableau de bord du back-office s’affiche avec le message « Bonjour {votre prénom} ».
4. Ouvrez **Actualités** dans la section « Contenus » du menu, puis cliquez sur `Nouvelle actualité`.
   - Où : menu de gauche sur ordinateur ; sur mobile, bouton **Ouvrir la navigation** (trois traits) en haut à gauche
   - Résultat attendu : Le formulaire « Nouvelle actualité » s’affiche avec les onglets `Contenu`, `Classement et image` et `SEO`.
5. Rédigez le titre et le texte, puis cliquez sur `Créer l’actualité`.
   - Où : bouton en bas à droite du formulaire (pleine largeur sur mobile)
   - Résultat attendu : Le bandeau vert « L’actualité a été créée en brouillon… » s’affiche sur la fiche de l’actualité.
6. Publiez depuis le panneau « Publication » avec `Actions` puis `Publier`.
   - Où : panneau à droite du formulaire sur ordinateur, sous le formulaire sur mobile
   - Résultat attendu : Le message « « {titre} » a été publié. » apparaît et l’actualité est visible sur le site.

## Sommaire

1. [Votre rôle en bref](#votre-role)
2. [Avant de commencer : compte, connexion et vérification en deux étapes](#avant-de-commencer)
3. [Se repérer dans le back-office](#se-reperer)
4. [Comprendre le cycle de publication](#cycle-de-publication)
5. [Comment rédiger et publier une actualité ou un communiqué](#rediger-une-actualite)
6. [Comment créer ou modifier une page institutionnelle](#modifier-une-page)
7. [Comment déposer une ressource documentaire](#deposer-une-ressource)
8. [Comment gérer la médiathèque](#mediatheque)
9. [Comment gérer les catégories](#gerer-les-categories)
10. [Comment gérer les questions fréquentes](#gerer-la-faq)
11. [Comment programmer un événement et suivre les inscrits](#programmer-un-evenement)
12. [Comment ajouter ou masquer un partenaire](#gerer-les-partenaires)
13. [Comment modifier un menu de navigation](#modifier-un-menu)
14. [Comment traiter un message reçu depuis le site](#traiter-les-messages-recus)
15. [Comment gérer les abonnés à la lettre d’information](#gerer-la-newsletter)
16. [Comment consulter l’audience et exporter les rapports](#consulter-les-rapports)
17. [Comment supprimer un contenu (et quand ne pas le faire)](#supprimer-un-contenu)
18. [Notifications et emails que vous recevez](#notifications)
19. [Bonnes pratiques éditoriales et sécurité](#bonnes-pratiques)
20. [Questions fréquentes](#questions-frequentes)
21. [Lexique](#lexique)
22. [Besoin d’aide ?](#besoin-d-aide)

## 1. Votre rôle en bref <a id="votre-role"></a>

*Ce que le rôle « Éditeur communication » vous permet de faire, ce qu’il ne permet pas, et avec qui vous travaillez.*

Le rôle « Éditeur communication » vous donne accès au back-office du site (la partie « Administration du site », réservée aux personnels de la Fédération). Vous y rédigez et publiez tout ce que les visiteurs lisent : pages institutionnelles, actualités et communiqués, documents à télécharger, agenda des événements, questions fréquentes, logos des partenaires. Vous êtes à la fois rédacteur, relecteur et responsable de la publication : aucune autre validation technique n’est demandée par le site, mais la validation de fond revient au Secrétariat général.

### Ce que vous pouvez faire

- [x] Créer, modifier, envoyer en relecture, planifier, publier, archiver et supprimer des pages et des actualités (menus **Pages** et **Actualités**).
- [x] Restaurer une version précédente d’une page (carte « Versions »).
- [x] Déposer des ressources documentaires (guides, textes juridiques, rapports, formulaires, vidéos) et fixer leur niveau d’accès (menu **Ressources**).
- [x] Envoyer, décrire et supprimer des fichiers dans la médiathèque (menu **Médias**).
- [x] Créer et modifier les catégories de tous les domaines, et supprimer celles qui ne sont plus utilisées (menu **Catégories**).
- [x] Modifier les arborescences des quatre menus du site et de la plateforme de formation (menu **Menus**).
- [x] Rédiger, masquer et supprimer les questions fréquentes (menu **FAQ**).
- [x] Programmer des événements, suivre les inscrits, marquer les présences et exporter la liste des participants (menu **Événements**).
- [x] Ajouter, masquer et supprimer des partenaires et organisations affiliées (menu **Partenaires et organisations**).
- [x] Lire et traiter les messages envoyés depuis les formulaires du site, les attribuer et les exporter (menu **Messages reçus**).
- [x] Consulter et exporter la liste des abonnés à la lettre d’information, supprimer un abonné à sa demande (menu **Newsletter**).
- [x] Consulter les indicateurs d’audience du site et exporter des rapports (menu **Rapports**).
- [x] Consulter le catalogue des services en lecture, et publier ou archiver un service déjà rédigé par le responsable des services (menu **Catalogue**).

### Ce que vous ne pouvez pas faire

- Créer, modifier ou supprimer un service du catalogue : la fiche s’ouvre en lecture seule avec le bandeau « Vous consultez ce service en lecture seule : seule l’équipe des services peut le modifier. »
- Traiter les demandes de service (menu **Demandes**, réservé au responsable des services et au support).
- Voir les utilisateurs, les organisations, la finance, le journal d’audit ou les paramètres : ces pages affichent « Accès refusé ».
- Ouvrir les espaces de coordination de la plateforme de formation : les boutons `Coordination LMS` et `Rapports détaillés du LMS` mènent à une page « Accès refusé » pour votre rôle.
- Envoyer une lettre d’information ou un email groupé depuis le back-office : seule la liste des abonnés est gérée (voir la section « Newsletter »).
- Répondre à un message reçu depuis le site : la réponse part de votre messagerie habituelle (bouton `Répondre par email`).

*Avec qui vous travaillez*

| Rôle | Ce qu’il fait pour vous | Quand le solliciter |
| --- | --- | --- |
| Secrétariat général | Valide le fond des textes officiels, des communiqués et des prises de position. | Avant de publier un communiqué, une page institutionnelle ou un texte juridique (mentions légales, confidentialité). |
| Responsable services | Rédige les fiches du catalogue des services ; traite les demandes de service. | Pour annoncer un nouveau service sur le site, ou quand un message reçu est en réalité une demande de service. |
| Support | Aide les membres qui ont un problème de compte ; traite les messages de type « Assistance ». | Quand un message reçu concerne un problème de connexion ou de compte. |
| Coordination formation | Gère la plateforme de formation, ses cours et ses sessions ; partage avec vous les catégories du domaine « Formations ». | Pour publier une actualité sur une formation ou un événement de type « Formation ». |
| Finance | Suit les paiements des ressources « Premium » et des événements payants. | Quand un participant signale un problème de paiement. |
| Super administrateur | Attribue les rôles, gère les comptes et les paramètres du site. | Pour obtenir un droit manquant, réinitialiser votre vérification en deux étapes ou créer le compte d’un collègue. |

## 2. Avant de commencer : compte, connexion et vérification en deux étapes <a id="avant-de-commencer"></a>

*Se connecter, retrouver un mot de passe oublié, activer la vérification en deux étapes exigée pour votre rôle, se déconnecter.*

Vous utilisez le même compte que tous les membres de la Fédération. C’est le rôle attribué à ce compte qui ouvre le back-office. Si le menu de votre compte n’affiche pas **Administration du site**, le rôle n’a pas encore été attribué : demandez-le au super administrateur.

> **Vérification en deux étapes exigée** : Votre rôle fait partie des rôles privilégiés (administration, coordination, finance, communication) qui doivent protéger leur compte par un second facteur : un code temporaire demandé en plus du mot de passe, à chaque connexion. Activez-la dès votre première connexion (voir ci-dessous). Selon le réglage du site, l’accès au back-office peut être bloqué tant qu’elle n’est pas activée : la page « Vérification en deux étapes » s’affiche alors avec le bouton `Activer la vérification`.

### Se connecter <a id="se-connecter"></a>

1. Ouvrez la page **Connexion** du site.
   - Où : lien **Connexion** en haut à droite du site ; sur mobile, dans le menu du site
   - Résultat attendu : Le formulaire de connexion s’affiche.
2. Saisissez votre **Adresse email** (obligatoire).
   - Remarque : Utilisez l’adresse avec laquelle votre compte a été créé, sans faute de frappe. Cette adresse doit avoir été confirmée par le lien reçu par email.
3. Saisissez votre **Mot de passe** (obligatoire).
4. Cliquez sur `Se connecter`.
   - Où : en bas du formulaire
   - Résultat attendu : Si la vérification en deux étapes est active, le champ **Code de vérification** apparaît. Sinon, votre espace personnel s’ouvre.
5. Saisissez le code à 6 chiffres affiché par votre application d’authentification, ou l’un de vos codes de secours.
   - Où : champ **Code de vérification**
   - Résultat attendu : Votre espace personnel s’ouvre (rubriques Tableau de bord, Profil, Mes inscriptions, Notifications, Sécurité).
6. Ouvrez le menu de votre compte puis cliquez sur **Administration du site**.
   - Où : vos initiales, en haut à droite
   - Résultat attendu : Le back-office s’ouvre sur le tableau de bord « Bonjour {votre prénom} ». Sous le menu de gauche, la pastille or « Éditeur communication » confirme votre rôle.

- **Un message indique que l’adresse n’est pas vérifiée.** (cause probable : Vous n’avez pas encore cliqué sur le lien de confirmation reçu par email (valable 24 heures).) : Demandez un nouveau lien depuis la page de connexion, ouvrez l’email « Confirmez votre adresse email - FETRAG » et cliquez sur son lien. Vérifiez aussi le dossier des indésirables.
- **La page « Accès refusé » s’affiche quand j’ouvre l’administration.** (cause probable : Votre compte n’a pas (encore) le rôle « Éditeur communication », ou vous êtes connecté avec un autre compte.) : Vérifiez l’adresse indiquée sur la page. Utilisez « Changer de compte » si besoin, sinon cliquez sur `Contacter la FETRAG` pour demander l’attribution du rôle.
- **Le champ **Code de vérification** apparaît alors que je n’ai plus mon téléphone.** (cause probable : La vérification en deux étapes est active et l’application n’est plus disponible.) : Utilisez l’un des codes de secours notés lors de l’activation. Sans code de secours, demandez au super administrateur de réinitialiser la vérification en deux étapes de votre compte.
- **Le message « Le code de vérification est invalide ou expiré. Réessayez avec un nouveau code. » s’affiche.** (cause probable : L’heure de votre téléphone est décalée : les codes dépendent de l’heure exacte.) : Activez l’heure automatique dans les réglages du téléphone, attendez un nouveau code et recommencez. Après plusieurs échecs, le message « Trop de tentatives » impose une pause de quelques minutes.

### Retrouver un mot de passe oublié <a id="mot-de-passe-oublie"></a>

1. Cliquez sur **Mot de passe oublié ?**.
   - Où : sous le champ **Mot de passe** de la page **Connexion**
   - Résultat attendu : La page « Mot de passe oublié » s’affiche.
2. Saisissez l’adresse email de votre compte (obligatoire) puis validez.
   - Résultat attendu : Un message vous invite à consulter votre boîte email.
3. Ouvrez l’email « Réinitialisation de votre mot de passe FETRAG » et cliquez sur son lien.
   - Résultat attendu : La page de choix d’un nouveau mot de passe s’affiche.
   - Remarque : Le lien est valable 30 minutes. Passé ce délai, recommencez la demande.
4. Choisissez un nouveau mot de passe puis validez.
   - Résultat attendu : Vous pouvez vous connecter avec le nouveau mot de passe. Un email « Votre mot de passe FETRAG a été modifié » vous est envoyé.
   - Remarque : Règles imposées : au moins 8 caractères, au moins une majuscule et au moins un chiffre. Choisissez un mot de passe que vous n’utilisez sur aucun autre service.

- **Je ne reçois pas l’email de réinitialisation.** (cause probable : Faute de frappe dans l’adresse, email arrivé dans les indésirables, ou adresse différente de celle du compte.) : Vérifiez le dossier des indésirables, puis recommencez avec l’adresse exacte du compte. Si rien n’arrive après quelques minutes, écrivez au support par le formulaire de contact.

### Activer la vérification en deux étapes (obligatoire pour votre rôle) <a id="activer-la-verification-en-deux-etapes"></a>

1. Installez une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP).
   - Remarque : Ces applications génèrent un code à 6 chiffres qui change toutes les 30 secondes, même sans connexion Internet.
2. Ouvrez **Sécurité**.
   - Où : menu de votre compte (vos initiales, en haut à droite) > **Sécurité** ; ou rubrique **Sécurité** de votre espace personnel
   - Résultat attendu : La page « Protéger mon compte » s’affiche avec le badge « Vérification en deux étapes inactive ».
3. Cliquez sur `Activer la vérification en deux étapes`.
   - Où : carte « Vérification en deux étapes »
   - Résultat attendu : Un QR code et une clé à saisir manuellement apparaissent (« Étape 1 »).
4. Scannez le QR code avec votre application (ou saisissez la clé manuellement).
   - Résultat attendu : L’application affiche un code à 6 chiffres pour « FETRAG ».
   - Remarque : Sur téléphone, vous ne pouvez pas scanner l’écran que vous regardez : copiez la clé affichée sous « Scannez ce code ou saisissez la clé manuellement : » et collez-la dans l’application.
5. Saisissez le **Code à 6 chiffres affiché par l’application** puis cliquez sur `Confirmer et activer`.
   - Où : « Étape 2 »
   - Résultat attendu : Le message « La vérification en deux étapes est activée. Conservez vos codes de secours en lieu sûr. » s’affiche.
6. Cliquez sur `Copier les codes` ou notez les codes de secours, puis rangez-les en lieu sûr (hors du téléphone).
   - Où : alerte or « Codes de secours - affichés une seule fois »
   - Remarque : Chaque code de secours remplace une fois le code de l’application, si vous perdez votre téléphone. Pour en obtenir de nouveaux, il faut désactiver puis réactiver la vérification.

> **Désactivation** : Désactiver la vérification en deux étapes demande un code de vérification ou un code de secours (champ « Code de vérification ou code de secours », bouton `Désactiver la vérification`). Ne la désactivez que pour la réactiver aussitôt (changement de téléphone) : elle est exigée pour votre rôle. Sans aucun code, seul le super administrateur peut réinitialiser la vérification de votre compte.

- **Le message « Le code saisi est invalide. » s’affiche à l’activation.** (cause probable : Le code a expiré (il change toutes les 30 secondes) ou vous avez scanné un ancien QR code.) : Attendez le code suivant dans l’application et saisissez-le sans attendre. Si l’erreur persiste, cliquez sur `Annuler` puis recommencez l’activation avec un nouveau QR code.

### Se déconnecter <a id="se-deconnecter"></a>

1. Ouvrez le menu de votre compte.
   - Où : vos initiales, en haut à droite du site (le back-office affiche aussi votre nom et votre rôle en bas du menu de gauche)
2. Cliquez sur **Déconnexion**.
   - Résultat attendu : Vous revenez au site public ; le menu affiche de nouveau **Connexion**.
3. Sur un appareil partagé (ordinateur d’une section, téléphone prêté), fermez aussi le navigateur.
   - Remarque : Les messages reçus contiennent des données personnelles et les brouillons peuvent contenir des informations non encore publiques : ne laissez jamais une session ouverte.

## 3. Se repérer dans le back-office <a id="se-reperer"></a>

*Le tableau de bord, le menu de navigation, l’écran d’édition d’un contenu et leurs équivalents sur téléphone.*

### Écran : Le tableau de bord (« Bonjour {votre prénom} »)

La première page du back-office. Elle résume l’activité du site filtrée selon vos droits : vous n’y voyez ni chiffres financiers ni demandes de service.

- **Menu de gauche (ordinateur) ou tiroir de navigation (mobile)** : Les rubriques du back-office groupées par sections : « Pilotage » (Tableau de bord), « Contenus » (Pages, Actualités, Catégories, Ressources, Médias, Menus, FAQ), « Services » (Catalogue, en lecture), « Relations » (Événements, Partenaires et organisations, Messages reçus, Newsletter), « Administration » (Rapports), « Aide » (Guide de mon rôle, qui ouvre ce guide). En bas : votre nom, votre email et la pastille or « Éditeur communication ».
- **Barre du haut** : Le mot « Back-office », le titre de la page courante (« Tableau de bord », « Pages », « Actualités »…) et le lien « Voir le site » qui ouvre le site public dans un nouvel onglet (masqué sur les petits écrans ; utilisez alors le raccourci `Voir le site` du tableau de bord).
- **Pastilles sur le menu** : Un nombre à côté de « Messages reçus » indique les messages « Nouveau » à lire ; un nombre à côté de « Tableau de bord » indique les contenus « En relecture » qui attendent une décision.
- **Tuiles de chiffres** : « Pages vues sur 30 jours » (avec le nombre de visiteurs uniques) et « Formulaires reçus sur 30 jours » (avec le nombre « à traiter »). Deux tuiles par ligne sur mobile. Le bouton `Rapports détaillés` ouvre la page « Rapports ».
- **Cartes « Audience du site » et « Formulaires par type »** : Un graphique des pages vues et des visiteurs uniques sur 30 jours (mesure sans cookie) et la répartition des formulaires reçus (Contact, Adhésion / intérêt, Partenariat, Assistance, Demande de service).
- **Carte « Contenus en relecture »** : Les contenus en statut « En relecture », avec leur type (Page, Actualité, Ressource, Événement, Service), la date de dernière modification et un bouton `Relire` qui ouvre la fiche. Vide : « Rien à relire ». En dessous, « Publications planifiées » liste les cinq prochaines pages et actualités programmées.
- **Carte « Messages reçus »** : Les six derniers messages envoyés depuis les formulaires du site (objet ou type, expéditeur, date, badge de statut) et le lien `Boîte de réception`.
- **Cartes « Contenus les plus consultés » et « Plateforme de formation »** : Les cinq actualités les plus vues, ressources les plus téléchargées et formations les plus suivies ; les indicateurs de la plateforme de formation (apprenants actifs, inscriptions, taux de complétion, certificats). Le bouton `Coordination LMS` mène à un espace réservé au coordinateur : il affichera « Accès refusé » pour vous.
- **Raccourcis** : En bas de page : `Nouvelle actualité` (ouvre directement le formulaire de création) et `Voir le site`.

### Écran : La navigation sur téléphone

Sous 1024 pixels de large (tous les téléphones et la plupart des tablettes), le menu de gauche disparaît.

- **Bouton **Ouvrir la navigation** (trois traits)** : En haut à gauche de la barre du haut. Il ouvre un tiroir marine avec les mêmes sections que le menu de gauche. Le tiroir se ferme avec le bouton « Fermer la navigation » ou automatiquement quand vous ouvrez une page.
- **Tableaux** : Les colonnes secondaires (Gabarit, Statut, Version, Modifiée, Vues, Auteur…) sont masquées ; le badge de statut est répété sous le titre. Le tableau peut défiler de gauche à droite avec le doigt.
- **Filtres et boutons** : Les champs de filtre s’empilent ; les boutons `Filtrer`, `Réinitialiser` et les boutons de création prennent toute la largeur.
- **Menu d’actions d’une ligne** : Le bouton icône « Actions pour {titre} » (trois points), à droite de chaque ligne, ouvre la liste : `Modifier`, `Prévisualiser`, les changements de statut et `Supprimer`.

### Écran : L’écran d’édition d’un contenu (page, actualité, ressource, événement)

Le même agencement pour tous les contenus qui suivent le cycle de publication.

- **Fil d’Ariane et titre** : En haut : « Administration > Pages > {titre} ». Le titre du contenu et, en dessous, son extrait ou son résumé.
- **Formulaire (à gauche sur ordinateur, en premier sur mobile)** : Les onglets soulignés (`Contenu`, `Blocs`, `Réglages`, `SEO` pour une page ; `Contenu`, `Classement et image`, `SEO` pour une actualité ; `Général`, `Dates et lieu`, `Intervenant`, `Inscriptions`, `SEO` pour un événement). Sur mobile, les onglets défilent horizontalement. En bas : le bouton `Enregistrer…`.
- **Panneau « Publication » (à droite sur ordinateur, sous le formulaire sur mobile)** : Le badge de statut, le bouton `Actions` (changements de statut, suppression), le bouton `Prévisualiser` ou `Voir en ligne`, puis les informations : Adresse, Publié le, Planifié le, Modifié le, Créé le, Auteur, Version. En bas : `Retour à la liste`.
- **Carte « Versions » (pages seulement)** : Les douze dernières versions de la page avec un bouton `Restaurer` sur chaque version ancienne.
- **Carte « Participants » (événements seulement)** : Sous le formulaire : la liste des inscrits, les boutons `Présent` / `Retirer` et le bouton `Exporter (CSV)`.
- **Messages** : Un bandeau vert (succès) ou rouge (erreur) apparaît en haut du formulaire et une notification passagère (« toast ») en bas de l’écran. Les erreurs de champ sont écrites en rouge sous le champ concerné.

Chemin vers les actualités : Menu de gauche › Contenus › Actualités (`/admin/actualites`)

Chemin vers les pages : Menu de gauche › Contenus › Pages (`/admin/pages`)

Chemin vers les messages reçus : Menu de gauche › Relations › Messages reçus (`/admin/messages`)

## 4. Comprendre le cycle de publication <a id="cycle-de-publication"></a>

*Les cinq statuts d’un contenu, qui fait quoi, et comment changer de statut.*

Les pages, actualités, ressources, événements et services suivent le même cycle. Un contenu est créé en **Brouillon** : il n’est visible que dans le back-office. Vous décidez ensuite de le publier directement, de le programmer à une date ou de le mettre d’abord « En relecture » pour qu’un collègue éditeur (ou vous-même, plus tard) le relise depuis le tableau de bord. Un contenu publié peut être archivé (retiré du site, conservé) ou repassé en brouillon.

### Les statuts affichés

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Brouillon | Contenu en cours de rédaction, visible seulement dans le back-office. C’est le statut à la création. | Modifiez-le librement, puis envoyez-le en relecture, planifiez-le ou publiez-le. |
| En relecture | Contenu soumis à validation. Il apparaît dans la carte « Contenus en relecture » du tableau de bord et compte dans la pastille du menu. Non visible sur le site. | Relisez-le avec le bouton `Relire`, puis publiez-le, planifiez-le ou repassez-le en brouillon pour le corriger. |
| Planifié | Page ou actualité qui sera publiée automatiquement à la date et à l’heure choisies (heure de Libreville), dans les dix minutes qui suivent l’échéance. La date apparaît sous « Planifié le ». | Rien à faire. Pour annuler, repassez le contenu en brouillon ou publiez-le immédiatement. |
| Publié | Visible sur le site, dans la recherche et dans le plan du site. La date « Publié le » est conservée même si vous republiez plus tard. | Toute modification enregistrée est visible immédiatement. Archivez le contenu quand il n’a plus lieu d’être. |
| Archivé | Retiré du site mais conservé dans le back-office avec son historique. | Repassez-le en brouillon pour le retravailler et le republier. |

*Les passages possibles d’un statut à l’autre*

| Depuis | Vers | Action dans le menu |
| --- | --- | --- |
| Brouillon | En relecture, Planifié ou Publié | `Envoyer en relecture`, `Planifier la publication`, `Publier` |
| En relecture | Brouillon, Planifié ou Publié | `Repasser en brouillon`, `Planifier la publication`, `Publier` |
| Planifié | Brouillon, En relecture ou Publié | `Repasser en brouillon`, `Envoyer en relecture`, `Publier` |
| Publié | Archivé ou Brouillon | `Archiver`, `Repasser en brouillon` (retire aussi du site) |
| Archivé | Brouillon | `Repasser en brouillon` |

> **Qui valide quoi** : Le site ne demande aucune validation par un autre rôle : l’éditeur communication rédige, relit et publie. La relecture est une étape facultative, utile quand plusieurs éditeurs travaillent ensemble ou pour laisser reposer un texte. La validation de fond (communiqués, textes officiels, mentions légales) se fait en dehors du site, avec le Secrétariat général, avant de cliquer sur `Publier`.

> **Publier et archiver sont immédiats** : Aucune fenêtre de confirmation n’apparaît avant `Publier`, `Archiver`, `Envoyer en relecture` ou `Repasser en brouillon` : l’action s’applique au clic. Seule la planification ouvre un dialogue et seule la suppression demande une confirmation. Relisez avant de cliquer ; en cas d’erreur, `Repasser en brouillon` retire aussitôt le contenu du site.

### Changer le statut d’un contenu <a id="changer-le-statut"></a>

1. Ouvrez la liste du contenu (**Pages**, **Actualités**, **Ressources** ou **Événements**) ou la fiche du contenu.
   - Où : menu de gauche, section « Contenus » ou « Relations » ; sur mobile, bouton **Ouvrir la navigation**
2. Ouvrez le menu d’actions.
   - Où : dans la liste : bouton icône « Actions pour {titre} » à droite de la ligne ; sur la fiche : bouton `Actions` du panneau « Publication »
   - Résultat attendu : La liste s’ouvre avec le statut courant en tête, puis `Modifier` (liste seulement), `Prévisualiser`, les changements de statut disponibles et `Supprimer`.
3. Cliquez sur le changement souhaité : `Envoyer en relecture`, `Publier`, `Repasser en brouillon` ou `Archiver`.
   - Résultat attendu : Le message « « {titre} » a été publié. » (ou « envoyé en relecture », « archivé », « repassé en brouillon ») apparaît et le badge de statut change.
   - Remarque : Si le contenu est déjà dans ce statut, le message « Le contenu était déjà dans ce statut. » s’affiche sans rien changer.
4. Pour un contenu publié, vérifiez le résultat sur le site avec `Voir en ligne`.
   - Où : panneau « Publication »
   - Résultat attendu : La page publique s’ouvre dans un nouvel onglet.

### Planifier une publication (pages et actualités) <a id="planifier-une-publication"></a>

1. Ouvrez le menu d’actions de la page ou de l’actualité, puis cliquez sur `Planifier la publication`.
   - Résultat attendu : Le dialogue « Planifier la publication » s’ouvre : « Le contenu sera publié automatiquement à la date choisie (heure de Libreville). »
2. Renseignez **Date et heure de publication** (obligatoire, dans le futur).
   - Remarque : Le bouton `Planifier` reste grisé tant que la date est vide. Une date passée est refusée : « La date de publication planifiée doit être dans le futur ».
3. Cliquez sur `Planifier`.
   - Résultat attendu : Le message « « {titre} » a été planifié. » apparaît ; le statut passe à « Planifié » et la date s’affiche sous « Planifié le ». Le tableau de bord la liste dans « Publications planifiées ».
4. Le jour venu, vérifiez sur le site que le contenu est bien en ligne.
   - Remarque : La publication automatique se fait dans les dix minutes qui suivent l’heure choisie. Le journal enregistre alors « système » comme auteur de la publication.

> **Ressources, événements et services** : La planification n’existe que pour les pages et les actualités. Pour les autres contenus, publiez au moment voulu. Le champ « Publication planifiée » présent dans les formulaires de page et d’actualité ne remplace pas l’action `Planifier la publication` : c’est cette action, avec sa date, qui programme réellement la mise en ligne.

### Prévisualiser avant de publier <a id="previsualiser"></a>

Le bouton `Prévisualiser` (liste et panneau « Publication ») ouvre l’adresse publique du contenu avec un paramètre d’aperçu. Dans la version actuelle du site, cet aperçu n’affiche pas encore les brouillons : la page publique ne montre que les contenus publiés et répond « introuvable » pour un brouillon. La vérification visuelle se fait donc après publication, au moment le plus calme possible.

1. Relisez le contenu dans le formulaire du back-office (titre, extrait, texte, image et texte alternatif, catégorie, SEO).
   - Remarque : Relisez à voix basse et sur téléphone si possible : c’est ainsi que la plupart des visiteurs liront.
2. Publiez avec `Actions` puis `Publier`, puis cliquez sur `Voir en ligne`.
   - Résultat attendu : Le contenu s’affiche tel que le voient les visiteurs.
3. En cas de défaut important, cliquez sur `Actions` puis `Repasser en brouillon`, corrigez, puis publiez de nouveau.
   - Remarque : Pour une simple coquille, corrigez et cliquez sur `Enregistrer…` : la modification est en ligne immédiatement, sans repasser en brouillon.

### Si ça ne marche pas <a id="depannage-publication"></a>

- **Le message « Transition « X » vers « Y » non autorisée » s’affiche.** (cause probable : Le passage demandé n’existe pas (par exemple Archivé vers Publié directement), ou un collègue a changé le statut entre-temps.) : Rechargez la page pour voir le statut réel, puis suivez le tableau des passages possibles (passez par « Brouillon » si besoin).
- **Le contenu publié n’apparaît pas sur le site.** (cause probable : Vous regardez une page mise en cache par votre navigateur, ou le contenu est « Planifié » et l’heure n’est pas encore passée.) : Rechargez la page publique. Vérifiez le badge de statut et la date « Planifié le » dans le panneau « Publication ». Pour une page institutionnelle, vérifiez que son slug correspond à une adresse réellement servie par le site (voir la section sur les pages).
- **Le message « Permission insuffisante » s’affiche.** (cause probable : Votre rôle a été retiré ou a expiré, ou vous tentez de modifier un service (réservé au responsable des services).) : Déconnectez-vous puis reconnectez-vous. Si le problème persiste, contactez le super administrateur.

## 5. Comment rédiger et publier une actualité ou un communiqué <a id="rediger-une-actualite"></a>

*Créer l’actualité, la mettre en forme, insérer une image ou un lien, la classer, la référencer et la publier.*

Les actualités regroupent les informations de la Fédération, les prises de position officielles (« Communiqué officiel ») et les retours sur les événements. Une actualité « À la une » est mise en avant sur la page d’accueil. Chaque actualité a une adresse publique de la forme /actualites/{slug}, où le slug est le nom court de l’adresse, généré à partir du titre.

Chemin : Menu de gauche › Contenus › Actualités › Nouvelle actualité (`/admin/actualites/nouveau`)

### Créer l’actualité <a id="creer-une-actualite"></a>

1. Ouvrez **Actualités** puis cliquez sur `Nouvelle actualité`.
   - Où : menu de gauche, section « Contenus » ; bouton en haut à droite de la liste (pleine largeur sur mobile). Le raccourci `Nouvelle actualité` du tableau de bord mène au même endroit.
   - Résultat attendu : Le formulaire « Nouvelle actualité » s’affiche, onglet `Contenu` ouvert.
2. Saisissez le **Titre** (obligatoire, 2 à 200 caractères).
   - Remarque : Un titre court et précis, sans majuscules partout : « La FETRAG signe l’accord sur le dialogue social » plutôt que « ACCORD SIGNÉ ».
3. Saisissez le **Chapô** (facultatif, 500 caractères maximum) : deux ou trois phrases qui résument l’information.
   - Remarque : Si vous le laissez vide, le site reprend automatiquement les 160 premiers caractères du texte. Le chapô sert dans les listes et les partages sur les réseaux sociaux.
4. Rédigez le **Texte de l’actualité** (obligatoire) dans l’éditeur de texte riche.
   - Remarque : Voir la sous-section « Mettre en forme le texte ». Le texte est nettoyé à l’enregistrement : les mises en forme copiées depuis un traitement de texte (couleurs, polices) sont retirées.
5. Cliquez sur `Créer l’actualité`.
   - Où : bouton en bas à droite du formulaire (pleine largeur sur mobile) ; il affiche « Enregistrement » pendant l’envoi
   - Résultat attendu : La fiche de l’actualité s’ouvre avec le bandeau vert « L’actualité a été créée en brouillon. Envoyez-la en relecture ou publiez-la depuis le panneau « Publication ». »

- **Le message « Certains champs sont invalides. » s’affiche.** (cause probable : Un champ obligatoire est vide ou dépasse la longueur autorisée.) : Parcourez les onglets : le message rouge sous le champ concerné indique la correction à faire.
- **Le message « Ce slug est déjà utilisé » s’affiche.** (cause probable : Vous avez saisi un slug (onglet `Classement et image`) déjà pris par une autre actualité.) : Videz le champ **Slug (adresse)** pour laisser le site le générer, ou choisissez un autre nom court.

### Mettre en forme le texte <a id="mettre-en-forme-le-texte"></a>

La barre « Mise en forme » se trouve au-dessus de la zone de texte. Sur téléphone, elle s’étale sur plusieurs lignes. Chaque bouton est une icône ; son nom apparaît au survol sur ordinateur.

*Les boutons de la barre « Mise en forme »*

| Bouton | Effet | Conseil |
| --- | --- | --- |
| Gras, Italique, Souligné | Met en valeur le texte sélectionné. | Le gras pour un mot clé, jamais pour un paragraphe entier. |
| Titre de niveau 2, Titre de niveau 3 | Transforme la ligne en sous-titre. | Le titre de l’actualité est déjà le titre principal : commencez vos sous-titres au niveau 2 et utilisez le niveau 3 pour les sous-parties. |
| Liste à puces, Liste numérotée | Crée une liste. | Numérotez seulement quand l’ordre compte (étapes, classement). |
| Citation | Met le paragraphe en retrait comme une citation. | Pour les propos rapportés, avec le nom de la personne citée. |
| Séparateur | Insère une ligne horizontale. | À utiliser avec parcimonie. |
| Insérer ou modifier un lien, Retirer le lien | Ajoute un lien sur le texte sélectionné. | Écrivez un texte de lien parlant (« consulter le communiqué ») plutôt que « cliquez ici ». |
| Insérer une image | Ouvre le dialogue « Insérer une image ». | Le texte alternatif est obligatoire (voir ci-dessous). |
| Insérer un tableau, Supprimer le tableau | Insère un tableau de 3 lignes et 3 colonnes avec une ligne d’en-tête. | Sur téléphone, les tableaux larges sont difficiles à lire : préférez une liste. |
| Annuler, Rétablir | Revient en arrière ou rétablit la dernière modification. | Tant que vous n’avez pas enregistré, tout est réversible. |

#### Insérer un lien

1. Sélectionnez le texte qui portera le lien.
2. Cliquez sur le bouton **Insérer ou modifier un lien**.
   - Où : barre « Mise en forme »
   - Résultat attendu : Une petite fenêtre du navigateur demande « Adresse du lien (https://… ou /chemin) ».
3. Collez l’adresse complète (commençant par https://) ou un chemin du site (commençant par /), puis validez.
   - Résultat attendu : Le texte sélectionné devient un lien.
   - Remarque : Laisser l’adresse vide retire le lien. Le bouton **Retirer le lien** fait la même chose.

#### Insérer une image dans le texte

1. Placez le curseur à l’endroit voulu, puis cliquez sur le bouton **Insérer une image**.
   - Résultat attendu : Le dialogue « Insérer une image » s’ouvre : « Envoyez une image dans la médiathèque ou indiquez son URL. Le texte alternatif est requis pour l’accessibilité. »
2. Saisissez d’abord le **Texte alternatif** (obligatoire, 200 caractères maximum) : une phrase qui décrit l’image pour les personnes qui ne la voient pas.
   - Remarque : Tant que ce champ est vide, le choix du fichier est désactivé (« Renseignez d’abord le texte alternatif. »). Exemple : « Le Secrétaire général signe l’accord devant les délégués ».
3. Choisissez un **Fichier image** (png, jpeg, webp, gif ou avif ; 8 Mo maximum) ou collez une adresse dans **Ou URL de l’image** puis cliquez sur `Insérer par URL`.
   - Résultat attendu : Le fichier est envoyé immédiatement dans la médiathèque (visibilité publique, dossier « actualites ») et le message « Image insérée » apparaît. L’image s’affiche dans le texte.

> **Documents à télécharger** : L’éditeur de texte n’insère que des images. Pour proposer un document (PDF, formulaire), déposez-le d’abord dans **Médias** ou, mieux, créez une ressource documentaire (menu **Ressources**), puis insérez un lien vers son adresse dans le texte.

- **La zone de texte affiche « Chargement de l’éditeur… » et ne réagit pas.** (cause probable : La connexion est lente ou le navigateur est ancien.) : Attendez quelques secondes ; si rien ne change, rechargez la page. Sur téléphone, fermez les autres onglets.
- **Le message « Le fichier dépasse la taille maximale de 8 Mo » ou « Type de fichier non autorisé » s’affiche.** (cause probable : L’image est trop lourde ou dans un format refusé (SVG, HEIC, BMP…).) : Réduisez l’image (moins de 500 Ko suffit pour le web) et enregistrez-la en JPEG, PNG ou WebP avant de recommencer.
- **Après enregistrement, ma mise en forme a disparu (couleurs, polices, tailles).** (cause probable : Le texte est nettoyé à l’enregistrement : seuls les titres, listes, gras, italique, liens, images, citations et tableaux sont conservés.) : C’est normal : la charte du site applique la mise en forme. Utilisez les boutons de la barre plutôt qu’un copier-coller mis en forme.

### Classer, illustrer et référencer l’actualité <a id="classer-et-illustrer-une-actualite"></a>

#### Onglet « Classement et image »

1. Ouvrez l’onglet `Classement et image`.
   - Où : onglets soulignés en haut du formulaire (défilent horizontalement sur mobile)
   - Résultat attendu : La carte « Classement, image et publication » s’affiche.
2. Choisissez la **Catégorie** (facultatif) parmi les catégories du domaine « Actualités ».
   - Remarque : La catégorie alimente le filtre de la page publique des actualités. Créez-en de nouvelles depuis le menu **Catégories** si besoin.
3. Saisissez des **Mots-clés** séparés par des virgules (facultatif, 20 maximum, 40 caractères chacun).
   - Remarque : Exemple : « dialogue social, formation, droit du travail ». Ils aident la recherche du site.
4. Laissez le **Slug (adresse)** vide pour qu’il soit généré depuis le titre.
   - Remarque : L’aperçu « /actualites/{slug} » s’affiche sous le champ. Ne changez plus le slug une fois l’actualité publiée et partagée : les anciens liens ne fonctionneraient plus, sans redirection automatique.
5. Ajoutez l’**Image de couverture** avec `Choisir un fichier` (envoi immédiat dans la médiathèque) ou `Saisir une URL`.
   - Résultat attendu : Le message « « {fichier} » envoyé. » apparaît.
   - Remarque : Format paysage recommandé : 1600 × 900 pixels, 8 Mo maximum. L’image officielle doit conserver sa pastille blanche. L’aperçu affiche la vignette, le nom, le type et la taille ; `Retirer` enlève l’image.
6. Renseignez le **Texte alternatif de l’image** (200 caractères maximum) dès qu’une image est fournie.
   - Remarque : Le formulaire l’indique comme obligatoire pour l’accessibilité ; ne le laissez pas vide même si l’enregistrement l’accepte.
7. Cochez **Communiqué officiel** pour une prise de position officielle (mise en avant dans la rubrique « Communiqués ») et **À la une** pour l’afficher sur la page d’accueil (étoile or).
   - Remarque : Limitez le nombre d’actualités « À la une » : l’accueil doit rester lisible.

#### Onglet « SEO » (référencement)

Le référencement, c’est la façon dont les moteurs de recherche et les réseaux sociaux présentent votre contenu. Tous les champs sont facultatifs.

1. Ouvrez l’onglet `SEO`.
   - Résultat attendu : La carte « Référencement » s’affiche : « Titre et description affichés par les moteurs de recherche et les réseaux sociaux. »
2. Saisissez un **Titre SEO** (70 caractères maximum) si le titre de l’actualité est trop long pour un résultat de recherche.
3. Saisissez une **Méta-description** (200 caractères maximum) : la phrase affichée sous le titre dans les moteurs de recherche.
   - Remarque : Si elle est vide, le chapô est utilisé.
4. Indiquez une **Image de partage** (1200 × 630 pixels recommandés) si vous voulez une image différente de la couverture sur les réseaux sociaux.
5. Cochez **Exclure des moteurs** seulement pour un contenu que les moteurs de recherche ne doivent pas indexer (information temporaire ou interne).
   - Remarque : Le champ **URL canonique** ne sert que si le même texte est publié ailleurs en premier : indiquez alors l’adresse d’origine. Dans le doute, laissez-le vide.
6. Cliquez sur `Enregistrer l’actualité`.
   - Où : en bas du formulaire
   - Résultat attendu : Le message « Actualité « {titre} » enregistrée. » apparaît.

### Publier, corriger ou retirer l’actualité <a id="publier-une-actualite"></a>

1. Relisez la fiche complète (onglets `Contenu`, `Classement et image`, `SEO`).
   - Remarque : Pour une relecture par un collègue, cliquez sur `Actions` puis `Envoyer en relecture` : l’actualité apparaît dans « Contenus en relecture » sur son tableau de bord.
2. Cliquez sur `Actions` puis `Publier` (ou `Planifier la publication` pour une date ultérieure).
   - Où : panneau « Publication », à droite sur ordinateur, sous le formulaire sur mobile
   - Résultat attendu : Le message « « {titre} » a été publié. » apparaît. Le badge passe à « Publié » et la date « Publié le » s’affiche.
3. Cliquez sur `Voir en ligne` et vérifiez l’actualité sur le site, ainsi que la liste des actualités et, si elle est « À la une », la page d’accueil.
   - Résultat attendu : Le panneau affiche ensuite « N consultation(s) · N min de lecture » (temps calculé sur 200 mots par minute).
4. Pour corriger une actualité publiée : modifiez le texte puis cliquez sur `Enregistrer l’actualité`.
   - Remarque : La correction est en ligne immédiatement, sans repasser par la relecture. Pour une réécriture importante, repassez d’abord en brouillon.
5. Pour retirer une actualité dépassée : `Actions` puis `Archiver`.
   - Résultat attendu : L’actualité disparaît du site mais reste dans la liste avec le badge « Archivé ».

- **L’actualité n’apparaît pas sur la page d’accueil.** (cause probable : La case **À la une** n’est pas cochée, ou l’actualité n’est pas encore « Publié ».) : Ouvrez l’onglet `Classement et image`, cochez **À la une**, enregistrez, puis vérifiez le badge de statut.
- **Le compteur « N consultation(s) » reste à zéro.** (cause probable : L’actualité vient d’être publiée ou n’a pas encore été ouverte par des visiteurs.) : Le compteur s’incrémente à chaque ouverture de la page publique. Partagez l’adresse et revenez plus tard.

## 6. Comment créer ou modifier une page institutionnelle <a id="modifier-une-page"></a>

*Le formulaire de page, l’éditeur de blocs structurés, les réglages, et la restauration d’une version précédente.*

Les pages sont les textes durables du site : présentation de la Fédération, mentions légales, politique de confidentialité, pages d’atterrissage. Elles se modifient comme une actualité, avec deux particularités : un onglet `Blocs` pour composer des sections riches (bandeau, chiffres clés, équipe, chronologie…) et un historique de versions restaurables.

> **Quelles pages sont réellement affichées** : Dans la version actuelle du site, seules trois pages du back-office sont servies au public : « la-fetrag » (blocs et contenu), « mentions-legales » et « confidentialite » (contenu seul). Si l’une d’elles n’est pas publiée ou est vide, le site affiche un texte de repli. Une page créée avec un autre slug est enregistrée mais n’a pas encore d’adresse publique, même si le panneau affiche « Adresse /{slug} ». Demandez au super administrateur avant de créer une nouvelle page destinée au public.

Chemin : Menu de gauche › Contenus › Pages (`/admin/pages`)

### Ouvrir et modifier une page <a id="ouvrir-et-modifier-une-page"></a>

1. Ouvrez **Pages**.
   - Où : menu de gauche, section « Contenus »
   - Résultat attendu : La liste « Pages » s’affiche avec les colonnes Page, Gabarit, Statut, Version et Modifiée (les colonnes secondaires sont masquées sur mobile).
2. Retrouvez la page avec le champ **Titre ou slug** et la liste **Statut**, puis cliquez sur `Filtrer`.
   - Remarque : `Réinitialiser` efface les filtres. La liste affiche 20 pages par page ; la pagination est sous le tableau.
3. Cliquez sur le titre de la page (ou ouvrez le menu d’actions puis `Modifier`).
   - Résultat attendu : La fiche de la page s’ouvre avec les onglets `Contenu`, `Blocs`, `Réglages`, `SEO`, le panneau « Publication » et la carte « Versions ».
4. Onglet `Contenu` : modifiez le **Titre** (obligatoire), l’**Extrait** (facultatif, 500 caractères) et le **Contenu** dans l’éditeur de texte riche.
   - Remarque : L’éditeur est le même que pour les actualités (voir « Mettre en forme le texte »). Les images sont envoyées dans le dossier « pages » de la médiathèque.
5. Onglet `Réglages` : vérifiez le **Slug (adresse)**, le **Gabarit** (Standard, Institutionnel (La FETRAG), Page d’atterrissage, Page légale), la **Langue**, l’**Image de couverture** (1600 × 900 pixels recommandés) et la case **Inclure dans le plan du site**.
   - Remarque : Décochez « Inclure dans le plan du site » pour une page technique ou temporaire. Le gabarit « Institutionnel (La FETRAG) » est celui de la page de présentation avec ses blocs.
6. Onglet `SEO` : renseignez si besoin le titre SEO, la méta-description, l’image de partage et la case d’exclusion des moteurs.
7. Cliquez sur `Enregistrer la page`.
   - Où : en bas du formulaire
   - Résultat attendu : Le message « Page « {titre} » enregistrée (version N). » apparaît. Une nouvelle version est créée seulement si le titre, le contenu ou les blocs ont changé.
8. Publiez ou republiez depuis le panneau « Publication » si la page n’est pas déjà « Publié ».
   - Remarque : Une page publiée modifiée est mise à jour en ligne dès l’enregistrement.

#### Créer une nouvelle page

1. Cliquez sur `Nouvelle page`.
   - Où : en haut à droite de la liste « Pages » (pleine largeur sur mobile)
   - Résultat attendu : Le formulaire « Nouvelle page » s’affiche : « La page est créée en brouillon ; publiez-la depuis son panneau de publication une fois relue. »
2. Renseignez au minimum le **Titre**, puis les onglets utiles, et cliquez sur `Créer la page`.
   - Résultat attendu : La fiche de la page s’ouvre avec le bandeau « La page a été créée en brouillon. Complétez-la puis publiez-la depuis le panneau « Publication ». »

### Composer les blocs structurés <a id="composer-les-blocs"></a>

L’onglet `Blocs` permet de composer des sections riches rendues avant ou à la place du contenu selon le gabarit : bandeau d’en-tête, texte riche, triptyque fondateur, valeurs, chronologie, équipe et dirigeants, chiffres clés, questions fréquentes, appel à l’action. Les blocs sont décrits dans un format texte appelé JSON (une écriture avec des accolades, des crochets et des guillemets, lue par le site). Vous n’avez pas à l’écrire vous-même : des modèles s’insèrent d’un clic et vous remplacez seulement les textes.

1. Ouvrez l’onglet `Blocs`.
   - Résultat attendu : La carte « Blocs structurés » s’affiche avec la ligne « Ajouter un bloc : », la zone « Blocs structurés (JSON) » et la liste « Blocs détectés ».
2. Cliquez sur un modèle : `Bandeau d’en-tête`, `Texte riche`, `Triptyque fondateur`, `Valeurs`, `Chronologie`, `Équipe / dirigeants`, `Chiffres clés`, `Questions fréquentes` ou `Appel à l’action`.
   - Où : ligne « Ajouter un bloc : »
   - Résultat attendu : Le modèle est ajouté à la fin de la zone de texte et la liste « Blocs détectés » affiche une nouvelle pastille (« 1. hero · Titre »).
3. Dans la zone de texte, remplacez uniquement les textes entre guillemets (titres, phrases, dates, noms) par vos contenus.
   - Remarque : Ne supprimez ni les guillemets, ni les virgules, ni les accolades. Limites : 60 blocs, titres de 200 caractères, 40 étapes de chronologie, 12 valeurs, 40 personnes, 30 questions, 8 chiffres clés, 3 volets de triptyque. Les liens ont un libellé (1 à 80 caractères) et une adresse https:// ou un chemin commençant par /.
4. Cliquez sur `Reformater` pour remettre le texte en ordre et vérifier qu’il est lisible par le site.
   - Résultat attendu : Le texte est réindenté. En cas d’erreur, un message rouge l’indique en direct : « JSON invalide : … », « Le bloc n° N doit contenir une propriété « type ». » ou « Le document doit être un tableau de blocs ([...]). »
5. Cliquez sur `Enregistrer la page`.
   - Résultat attendu : Le message « Page « {titre} » enregistrée (version N). » apparaît.

> **Travailler sur ordinateur** : L’édition des blocs est possible sur téléphone mais bien plus confortable sur ordinateur, avec un clavier. Laissez la zone vide pour n’utiliser que le contenu riche de l’onglet `Contenu`.

- **Le message « JSON invalide : … » ne disparaît pas.** (cause probable : Un guillemet, une virgule ou une accolade a été supprimé ou ajouté par erreur.) : Utilisez `Annuler` du navigateur (Ctrl + Z) pour revenir en arrière, ou supprimez le bloc fautif et réinsérez le modèle. En dernier recours, restaurez une version précédente de la page.
- **Le message « Le document JSON est invalide. » s’affiche à l’enregistrement.** (cause probable : Le texte est lisible mais un bloc ne respecte pas les limites (type inconnu, trop d’éléments, lien mal formé).) : Vérifiez le type de chaque bloc dans « Blocs détectés » (hero, richtext, timeline, values, people, cta, faq, stats, triptych) et les adresses des liens.

### Restaurer une version précédente <a id="restaurer-une-version"></a>

1. Sur la fiche de la page, repérez la carte **Versions**.
   - Où : sous le panneau « Publication » sur ordinateur ; sous le formulaire sur mobile
   - Résultat attendu : Les douze dernières versions s’affichent (« vN {titre} », date, éditeur), la version en cours porte le badge « Actuelle ».
2. Cliquez sur `Restaurer` à côté de la version à retrouver.
   - Résultat attendu : Le dialogue « Restaurer la version N ? » s’ouvre : « Le titre, le contenu et les blocs de cette version remplaceront la version actuelle (conservée dans l’historique). »
3. Cliquez sur `Restaurer`.
   - Résultat attendu : Le message « Version N restaurée… » apparaît et une nouvelle version est créée avec l’ancien contenu. Le statut de la page ne change pas.
   - Remarque : Le message peut annoncer que la page est repassée en brouillon : ce n’est pas le cas dans la version actuelle. Si la page était publiée, l’ancien contenu est donc en ligne immédiatement ; vérifiez-le avec `Voir en ligne`.

> **Rien n’est perdu** : La restauration ne supprime aucune version : elle en crée une nouvelle. Vous pouvez toujours revenir à la version que vous venez de remplacer. Les réglages (slug, gabarit, image de couverture) et le SEO ne font pas partie des versions.

## 7. Comment déposer une ressource documentaire <a id="deposer-une-ressource"></a>

*Mettre un document, une vidéo ou un lien à disposition des travailleurs et des organisations, avec le bon niveau d’accès.*

La bibliothèque documentaire regroupe les guides pratiques, textes juridiques, rapports, formulaires et médias. Le niveau d’accès détermine qui peut télécharger : tout le monde, les comptes connectés, les membres d’une organisation, ou les personnes ayant acheté le document.

Chemin : Menu de gauche › Contenus › Ressources › Nouvelle ressource (`/admin/ressources/nouveau`)

1. Ouvrez **Ressources** puis cliquez sur `Nouvelle ressource`.
   - Où : menu de gauche, section « Contenus » ; bouton en haut à droite de la liste
   - Résultat attendu : Le formulaire « Nouvelle ressource » s’affiche avec trois cartes : « Description », « Fichier ou lien », « Accès et métadonnées ».
2. Carte « Description » : saisissez le **Titre** (obligatoire, 2 à 200 caractères), le **Résumé** (facultatif, 1 000 caractères), le **Type de ressource** (Document, Guide pratique, Rapport, Texte juridique, Formulaire, Vidéo, Audio, Présentation), la **Catégorie** (domaine « Ressources ») et la **Langue**.
   - Remarque : Laissez le **Slug (adresse)** vide : il est généré depuis le titre (aperçu « /ressources/{slug} »).
3. Carte « Accès et métadonnées » : choisissez d’abord le **Niveau d’accès** (obligatoire) : Public, Membres, Organisation ou Premium.
   - Remarque : Choisissez-le avant d’envoyer le fichier : il détermine si le fichier est stocké en privé. « Membres : compte connecté ; Organisation : membres de l’organisation rattachée ; Premium : achat. »
4. Pour le niveau Organisation, choisissez l’**Organisation rattachée**. Pour le niveau Premium, saisissez le **Tarif (XAF)** (obligatoire, montant entier en francs CFA) ; la **Devise** reste XAF.
   - Remarque : Le tarif crée automatiquement l’offre d’achat. Sans organisation rattachée, une ressource « Organisation » est ouverte aux membres de toutes les organisations : ne l’oubliez pas.
5. Carte « Fichier ou lien » : cliquez sur `Choisir un fichier` et sélectionnez le document, ou saisissez une **URL externe** si le document est hébergé ailleurs (site officiel, vidéo en ligne).
   - Résultat attendu : Le message « « {fichier} » envoyé. » apparaît et l’aperçu affiche le nom, le type et la taille.
   - Remarque : Au moins l’un des deux est obligatoire. Formats acceptés : PDF, Word, Excel, PowerPoint, texte, CSV (25 Mo), audio (60 Mo), vidéo (200 Mo). L’aide indique « Stocké en privé : servi uniquement par lien signé aux ayants droit. » pour les niveaux réservés, « Stocké en public. » sinon.
6. Ajoutez si besoin une **Image d’aperçu** (vignette de la bibliothèque), puis renseignez la **Source** (institution d’origine, par exemple « Ministère du Travail »), l’**Auteur**, la **Date du document** et les **Mots-clés**.
   - Remarque : Ces champs sont facultatifs mais très utiles pour la recherche et la crédibilité du document : remplissez-les systématiquement.
7. Cliquez sur `Créer la ressource`.
   - Résultat attendu : La fiche s’ouvre avec le bandeau « La ressource a été créée en brouillon. Vérifiez le fichier et le niveau d’accès avant publication. »
8. Vérifiez le niveau d’accès dans le panneau « Publication » (lignes « Accès », « Offre », « Organisation »), puis cliquez sur `Actions` et `Publier`.
   - Résultat attendu : Le message « « {titre} » a été publié. » apparaît. La ressource est visible dans la bibliothèque du site ; la ligne « Téléchargements » comptera chaque téléchargement autorisé.
   - Remarque : Pas de planification ni d’onglet SEO pour les ressources. Seules les ressources « Public » entrent dans le plan du site.

### Les niveaux d’accès

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Public | Téléchargeable par tous les visiteurs. Fichier stocké en public. |  |
| Membres | Réservé aux personnes connectées. Fichier stocké en privé, servi par un lien signé valable 15 minutes. |  |
| Organisation | Réservé aux membres de l’organisation rattachée (ou de toute organisation si aucune n’est rattachée). Fichier privé. |  |
| Premium | Réservé aux personnes ayant payé l’offre créée à partir du tarif. Fichier privé. | Les paiements sont suivis par la Finance. |

> **Données personnelles et documents internes** : Ne déposez jamais en « Public » un document contenant des noms, des adresses ou des informations syndicales internes (listes de membres, procès-verbaux nominatifs). Choisissez le niveau « Membres » ou « Organisation », ou ne le déposez pas sur le site.

- **Le message « Indiquez un fichier ou une URL externe. » s’affiche.** (cause probable : Aucun fichier n’a été envoyé et le champ **URL externe** est vide.) : Cliquez sur `Choisir un fichier` et attendez le message « envoyé », ou collez l’adresse complète (https://…) du document.
- **Un membre me dit que le lien du document « ne marche plus ».** (cause probable : Il a copié un lien signé, valable 15 minutes seulement.) : Demandez-lui d’ouvrir la page de la ressource sur le site et de cliquer de nouveau sur le bouton de téléchargement, connecté avec son compte.
- **Le fichier est refusé (« Type de fichier non autorisé »).** (cause probable : Format non pris en charge (image, archive ZIP, SVG…).) : Convertissez le document en PDF, ou déposez une image via la médiathèque plutôt qu’en ressource.

## 8. Comment gérer la médiathèque <a id="mediatheque"></a>

*Envoyer des fichiers réutilisables, compléter les textes alternatifs, copier une adresse, supprimer un fichier.*

La médiathèque rassemble tous les fichiers envoyés (images, documents, audio, vidéo), y compris ceux ajoutés depuis les formulaires de page, d’actualité, de ressource, d’événement ou de partenaire. Chaque fichier est rangé dans un dossier (« pages », « actualites », « ressources », « evenements », « intervenants », « partenaires », « uploads »…) et porte une visibilité : Public ou Privé (lien signé).

Chemin : Menu de gauche › Contenus › Médias (`/admin/medias`)

*Formats et tailles acceptés*

| Type | Formats | Taille maximale |
| --- | --- | --- |
| Images | JPEG, PNG, WebP, GIF, AVIF (SVG refusé) | 8 Mo |
| Documents | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ODT, TXT, CSV | 25 Mo |
| Audio | MP3, MP4 audio, OGG, WAV, WebM | 60 Mo |
| Vidéo | MP4, WebM | 200 Mo |

> **À propos de « Images (12 Mo) »** : Le dialogue d’envoi annonce « Images (12 Mo) », mais la limite réellement appliquée aux images est de 8 Mo. Pour le web, une image de moins de 500 Ko suffit largement : réduisez vos photos avant de les envoyer.

### Envoyer un fichier

1. Ouvrez **Médias** puis cliquez sur `Envoyer un fichier`.
   - Où : menu de gauche, section « Contenus » ; bouton à droite au-dessus de la grille
   - Résultat attendu : Le dialogue « Envoyer un fichier » s’ouvre.
2. Choisissez le **Fichier** (obligatoire).
   - Remarque : Renommez-le clairement avant l’envoi (« communique-smig-2026.pdf ») : le nom d’origine est conservé et affiché.
3. Indiquez le **Dossier** (minuscules, chiffres, tirets ; « uploads » par défaut) en choisissant une suggestion ou en saisissant un nom.
4. Choisissez la **Visibilité** : Public, ou Privé (lien signé) pour un fichier réservé.
   - Remarque : Un fichier privé n’a pas d’adresse publique : on copie sa « clé », pas son URL, et il est servi par un lien temporaire.
5. Pour une image, saisissez le **Texte alternatif** (300 caractères maximum) et, si utile, une **Légende** (500 caractères).
   - Remarque : Le texte alternatif décrit l’image pour les lecteurs d’écran. Il est indispensable pour une image qui porte une information (affiche, graphique, photo d’événement).
6. Cliquez sur `Envoyer`.
   - Résultat attendu : Le bouton affiche « Envoi en cours », puis le message « « {fichier} » envoyé. » apparaît et la page se recharge avec le nouveau fichier en tête de grille.

### Retrouver, réutiliser et corriger un fichier

1. Filtrez la grille avec le champ **Nom de fichier, texte alternatif** et les listes **Dossier**, **Type** (Images, Documents, Vidéos, Audio) et **Visibilité** (Publics, Privés), puis cliquez sur `Filtrer`.
   - Résultat attendu : La grille affiche les fichiers correspondants (24 par page) avec le compteur « N fichier(s) ».
2. Cliquez sur `Copier l’URL` (ou `Copier la clé` pour un fichier privé) sur la carte du fichier.
   - Résultat attendu : Le message « URL copiée » (ou « Clé copiée ») apparaît. Collez l’adresse dans un champ « Saisir une URL » d’un formulaire ou dans un lien de l’éditeur de texte.
3. Cliquez sur `Modifier` pour compléter le **Texte alternatif**, la **Légende** ou changer le **Dossier**, puis sur `Enregistrer`.
   - Résultat attendu : Le message « Média mis à jour. » apparaît.
   - Remarque : Les images sans texte alternatif portent l’avertissement or « Texte alternatif manquant » : traitez-les en priorité.

> **Supprimer un fichier est définitif** : Le dialogue rappelle : « Le fichier est retiré du stockage. Les contenus qui l’utilisent afficheront un lien cassé. » Avant de cliquer sur `Supprimer`, vérifiez qu’aucune page, actualité, ressource ou fiche partenaire n’utilise ce fichier. Dans le doute, laissez-le.

- **Le message « Copie impossible dans ce navigateur » s’affiche.** (cause probable : Le navigateur bloque l’accès au presse-papiers (navigation privée, ancien navigateur).) : Ouvrez le fichier dans un nouvel onglet et copiez son adresse depuis la barre d’adresse, ou utilisez un autre navigateur.
- **Le message « Dossier invalide » s’affiche.** (cause probable : Le nom du dossier contient des majuscules, des espaces ou des accents.) : Utilisez seulement des minuscules, des chiffres et des tirets (« evenements-2026 »).
- **Le message « Le fichier est vide » s’affiche.** (cause probable : Le fichier sélectionné fait 0 octet (export raté, téléchargement interrompu).) : Ouvrez le fichier sur votre appareil pour vérifier qu’il fonctionne, puis renvoyez-le.

## 9. Comment gérer les catégories <a id="gerer-les-categories"></a>

*Créer, modifier et supprimer les catégories qui classent actualités, ressources, formations, services et événements.*

Une catégorie appartient à un domaine : Actualités, Ressources, Formations, Services ou Événements. Les catégories « Actualités » alimentent le filtre de la page des actualités, celles de « Ressources » le filtre de la bibliothèque. Les catégories « Formations » sont partagées avec la coordination de la plateforme et celles de « Services » avec le responsable des services : prévenez-les avant de modifier les leurs.

Chemin : Menu de gauche › Contenus › Catégories (`/admin/categories`)

1. Ouvrez **Catégories**, filtrez par **Domaine** si besoin, puis cliquez sur `Nouvelle catégorie`.
   - Où : menu de gauche, section « Contenus » ; bouton en haut à droite
   - Résultat attendu : Le dialogue « Nouvelle catégorie » s’ouvre, le domaine pré-rempli avec le filtre courant.
2. Saisissez le **Nom** (obligatoire, 2 à 120 caractères) et vérifiez le **Domaine**.
3. Complétez si besoin la **Description** (500 caractères), le **Slug** (généré si vide), la **Couleur** (sélecteur, format #RRGGBB, bleu FETRAG par défaut) et l’**Ordre** (nombre à partir de 0 ; les petites valeurs s’affichent en premier).
4. Cliquez sur `Créer la catégorie`.
   - Résultat attendu : Le message « Catégorie « {nom} » enregistrée. » apparaît et le dialogue se ferme.
5. Pour modifier une catégorie, cliquez sur `Modifier` sur sa ligne, changez les champs, puis cliquez sur `Enregistrer`.
   - Où : à droite de la ligne (les colonnes Domaine, Utilisations et Ordre sont masquées sur mobile)
6. Pour supprimer une catégorie inutilisée, cliquez sur `Supprimer` puis confirmez avec `Supprimer` dans le dialogue « Supprimer « {nom} » ? ».
   - Résultat attendu : Le message « Élément supprimé. » apparaît.
   - Remarque : La suppression est refusée tant que des contenus utilisent la catégorie (« Cette catégorie est encore utilisée par des contenus ») : la colonne « Utilisations » vous indique combien.

- **Le message « Couleur hexadécimale attendue (#RRGGBB) » s’affiche.** (cause probable : La couleur a été saisie à la main dans un autre format.) : Utilisez le sélecteur de couleur, ou saisissez un code de six caractères précédé de # (par exemple #0259C7).
- **Je ne peux pas supprimer une catégorie pourtant vide de mes contenus.** (cause probable : Des formations, services ou événements gérés par d’autres rôles l’utilisent encore.) : Regardez la colonne « Utilisations » et demandez à la coordination ou au responsable des services de reclasser leurs contenus.

## 10. Comment gérer les questions fréquentes <a id="gerer-la-faq"></a>

*Ajouter, modifier, masquer et supprimer les questions affichées sur la page FAQ du site et dans les blocs de page.*

Les questions fréquentes sont regroupées par thème et affichées dans l’ordre choisi sur la page FAQ du site. Les thèmes connus du site portent un titre lisible : general (« Questions générales »), adhesion (« Adhésion et affiliation »), formation (« Formation et certificats »), services (« Services aux adhérents »), evenements (« Événements »), paiement (« Paiements et reçus »), compte (« Compte et sécurité »). Un autre thème s’affiche avec son nom technique.

Chemin : Menu de gauche › Contenus › FAQ (`/admin/faq`)

1. Ouvrez **FAQ** puis cliquez sur `Nouvelle question`.
   - Où : menu de gauche, section « Contenus » ; bouton en haut à droite
   - Résultat attendu : Le dialogue « Nouvelle question fréquente » s’ouvre.
2. Saisissez la **Question** (obligatoire, 5 à 300 caractères), formulée comme la poserait un membre.
3. Saisissez la **Réponse** (obligatoire, 2 à 20 000 caractères) en texte simple ou en HTML léger (paragraphes, listes, liens).
   - Remarque : La réponse est nettoyée à l’enregistrement. Restez court : trois à cinq phrases, puis un lien vers la page utile.
4. Choisissez le **Thème** (minuscules, chiffres et tirets ; « general » par défaut) parmi les suggestions, et l’**Ordre** (nombre à partir de 0).
5. Laissez la case **Visible** cochée, puis cliquez sur `Ajouter la question`.
   - Résultat attendu : Le message « Question enregistrée. » apparaît ; la question est en ligne immédiatement, sans étape de publication.
6. Pour masquer une question sans la supprimer : `Modifier`, décochez **Visible**, puis `Enregistrer`.
   - Résultat attendu : Le badge passe de « Visible » (vert) à « Masquée » (gris) ; la question disparaît de la page FAQ.
7. Pour supprimer définitivement : `Supprimer`, puis `Supprimer` dans le dialogue « Supprimer cette question ? ».
   - Résultat attendu : Le message « Élément supprimé. » apparaît.

> **Questions dans une page** : Un bloc « Questions fréquentes » d’une page institutionnelle peut afficher les questions d’un thème donné : indiquez le nom du thème dans le bloc (onglet `Blocs` de la page). Les questions se gèrent toujours depuis le menu **FAQ**.

- **Le message « Groupe invalide (minuscules, chiffres, tirets) » s’affiche.** (cause probable : Le thème contient une majuscule, un espace ou un accent.) : Écrivez le thème en minuscules sans accent : « adhesion » et non « Adhésion ».
- **Ma question apparaît sous un titre bizarre sur le site.** (cause probable : Le thème saisi n’est pas l’un des sept thèmes connus : il s’affiche avec son nom technique.) : Reclassez la question dans l’un des thèmes connus, ou demandez au super administrateur d’ajouter le nouveau thème au site.

## 11. Comment programmer un événement et suivre les inscrits <a id="programmer-un-evenement"></a>

*Créer l’événement, ouvrir les inscriptions en le publiant, marquer les présences le jour J et exporter la liste des participants.*

L’agenda regroupe les événements de la Fédération : master class, webinaires, assemblées, formations ponctuelles. Une fois l’événement publié, les visiteurs connectés s’inscrivent depuis le site ; au-delà de la capacité, ils rejoignent automatiquement une liste d’attente. Les inscriptions se ferment d’elles-mêmes quand la date est passée.

Chemin : Menu de gauche › Relations › Événements › Nouvel événement (`/admin/evenements/nouveau`)

### Créer l’événement <a id="creer-un-evenement"></a>

1. Ouvrez **Événements** puis cliquez sur `Nouvel événement`.
   - Où : menu de gauche, section « Relations » ; bouton en haut à droite
   - Résultat attendu : Le formulaire « Nouvel événement » s’affiche avec les onglets `Général`, `Dates et lieu`, `Intervenant`, `Inscriptions`, `SEO` (ils défilent horizontalement sur mobile).
2. Onglet `Général` : saisissez le **Titre** (obligatoire), le **Type** (Événement, Master Class, Webinaire, Assemblée, Formation), le **Résumé** (600 caractères, affiché dans l’agenda), le **Programme et description** (éditeur de texte riche), la **Catégorie** et le **Visuel** (image).
   - Remarque : Cochez **Mettre en avant** pour afficher l’événement sur la page d’accueil et en tête de l’agenda.
3. Onglet `Dates et lieu` : renseignez le **Début** (obligatoire, date et heure de Libreville), la **Fin** (facultative, après le début) et la **Modalité** : Présentiel, Classe virtuelle ou Hybride.
   - Remarque : En Présentiel, renseignez la **Ville** et le **Lieu** (salle, adresse) ; en Classe virtuelle, le **Lien de la classe virtuelle** (transmis aux inscrits dans la convocation) ; en Hybride, les deux. Le champ inutile est masqué automatiquement.
4. Onglet `Intervenant` : indiquez le **Nom**, la **Fonction**, la **Biographie** et le **Portrait** de l’intervenant principal (tous facultatifs).
   - Remarque : Portrait vertical recommandé : 600 × 900 pixels. Demandez l’accord de la personne avant de publier sa photo.
5. Onglet `Inscriptions` : fixez la **Capacité** (vide = illimitée ; au-delà, liste d’attente automatique) et laissez **Événement gratuit** coché, ou décochez-le et saisissez le **Tarif (XAF)** (entier strictement positif).
   - Remarque : Cochez **Délivre une attestation de participation** si les personnes marquées présentes doivent recevoir une attestation FETRAG.
6. Onglet `SEO` : complétez si besoin, puis cliquez sur `Créer l’événement`.
   - Résultat attendu : La fiche s’ouvre avec le bandeau « L’événement a été créé en brouillon. Publiez-le pour ouvrir les inscriptions. »

- **Le message « La date de fin doit être postérieure à la date de début » s’affiche.** (cause probable : La fin est avant le début (souvent une erreur de jour ou d’heure).) : Corrigez la **Fin** ou laissez-la vide pour un événement sans heure de fin.
- **Le message « Un événement payant doit avoir un tarif strictement positif » s’affiche.** (cause probable : La case **Événement gratuit** est décochée mais le tarif est vide ou à 0.) : Saisissez le tarif en francs CFA, ou recochez **Événement gratuit**.

### Publier et ouvrir les inscriptions <a id="publier-un-evenement"></a>

1. Relisez la fiche, puis cliquez sur `Actions` et `Publier`.
   - Où : panneau « Publication »
   - Résultat attendu : Le message « « {titre} » a été publié. » apparaît. Le panneau affiche « Tarif », « Places » (« N restante(s) » ou « Illimitées ») et « Attestation ».
2. Cliquez sur `Voir en ligne` pour vérifier l’événement dans l’agenda du site.
   - Résultat attendu : La page publique affiche le bouton d’inscription. Un événement payant renvoie vers le paiement en ligne.
3. Communiquez : rédigez une actualité qui renvoie vers l’adresse de l’événement (voir « Rédiger une actualité »).
   - Remarque : Les inscrits reçoivent automatiquement l’email « Inscription confirmée : {titre} » ou « Liste d’attente : {titre} ». Aucun rappel automatique n’est envoyé la veille : si nécessaire, prévenez-les depuis votre messagerie avec l’export CSV.

> **Modifier un événement publié** : Changer la date, le lieu ou le lien de classe virtuelle après publication n’envoie aucun email aux inscrits. Prévenez-les vous-même (export CSV puis message depuis votre messagerie).

### Suivre les inscrits, marquer les présences et exporter <a id="suivre-les-participants"></a>

1. Ouvrez la fiche de l’événement et faites défiler jusqu’à la carte **Participants**.
   - Où : sous le formulaire
   - Résultat attendu : La ligne « N inscrits · N présents · N en liste d’attente » et le tableau des participants (nom, email, téléphone, employeur, date d’inscription, statut) s’affichent. Vide : « Aucun inscrit ».
2. Le jour de l’événement, cliquez sur `Présent` sur la ligne de chaque personne présente.
   - Où : colonne « Présence », à droite
   - Résultat attendu : Le message « Participant marqué présent. » apparaît et le badge passe à « Présent ». `Retirer` annule la présence (« Présence retirée. »).
   - Remarque : Seuls les participants « Inscrit » peuvent être marqués présents : une personne en liste d’attente ou annulée ne l’est pas.
3. Cliquez sur `Exporter (CSV)` pour obtenir la feuille d’émargement.
   - Où : en haut de la carte « Participants » (visible dès qu’il y a au moins un participant)
   - Résultat attendu : Le fichier « participants-{slug}.csv » se télécharge (colonnes Nom, Email, Téléphone, Employeur, Statut, Inscrit le, Présent le, Commande). L’export est enregistré dans le journal d’audit.
4. Après l’événement, renseignez le **Lien du replay** (onglet `Dates et lieu`) puis cliquez sur `Enregistrer l’événement`.
   - Résultat attendu : Le message « Événement « {titre} » enregistré. » apparaît.
5. Quand l’événement n’a plus lieu d’être affiché, cliquez sur `Actions` puis `Archiver`.
   - Remarque : Un événement passé reste visible dans la partie « passés » de l’agenda tant qu’il est publié, avec le badge « Passé » dans la liste du back-office.

#### Statuts d’un participant

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Inscrit | Inscription confirmée ; compte dans les places occupées. | Marquez-le `Présent` le jour J. |
| Liste d’attente | La capacité était atteinte. Pour un événement gratuit, la première personne en attente est promue automatiquement quand un inscrit annule (email « Une place s’est libérée »). | Augmentez la **Capacité** si vous pouvez accueillir plus de monde. |
| Annulé | La personne a annulé son inscription. |  |
| Présent | Présence marquée par vous ; la personne reçoit l’attestation si l’option est cochée. | `Retirer` en cas d’erreur. |

> **Données personnelles des participants** : L’export contient noms, emails, téléphones et employeurs. Conservez-le sur un appareil protégé, ne le transmettez qu’aux personnes qui en ont besoin pour l’événement et supprimez-le ensuite.

- **Le message « Seuls les inscrits confirmés peuvent être marqués présents » s’affiche.** (cause probable : La personne est en liste d’attente ou a annulé.) : Si elle est bien présente, augmentez la capacité puis demandez-lui de se réinscrire, ou notez sa présence sur la feuille papier.
- **Le bouton `Exporter (CSV)` n’apparaît pas.** (cause probable : Aucun participant n’est encore inscrit.) : Le bouton apparaît dès la première inscription.

## 12. Comment ajouter ou masquer un partenaire <a id="gerer-les-partenaires"></a>

*Les organisations affiliées, partenaires et institutions dont le logo défile sur l’accueil et qui figurent sur la page des organisations.*

Les partenaires n’ont pas de cycle de publication : une fiche « Visible sur le site » apparaît immédiatement dans le bandeau des logos de l’accueil et sur la page des organisations. Quatre types existent : Organisation affiliée, Partenaire, Institution, Partenaire international.

Chemin : Menu de gauche › Relations › Partenaires et organisations › Nouveau partenaire (`/admin/partenaires/nouveau`)

1. Ouvrez **Partenaires et organisations** puis cliquez sur `Nouveau partenaire`.
   - Où : menu de gauche, section « Relations » ; bouton en haut à droite
   - Résultat attendu : Le formulaire « Nouveau partenaire » s’affiche avec les cartes « Identité » et « Logo et coordonnées ».
2. Carte « Identité » : saisissez le **Nom** (obligatoire, 2 à 160 caractères), le **Sigle** (30 caractères ; il sert de base au slug), le **Type**, le **Secteur** (par exemple « énergie et pétrole »), l’**Ordre d’affichage** (les petites valeurs en premier) et la **Présentation** (2 000 caractères).
3. Carte « Logo et coordonnées » : envoyez le **Logo** avec `Choisir un fichier` (PNG ou WebP sur fond transparent ou blanc ; SVG refusé), puis renseignez le **Site web**, la **Ville** et le **Pays (code ISO)** (GA par défaut).
   - Remarque : Le logo doit être lisible sur fond blanc. Demandez au partenaire son logo officiel plutôt que de le récupérer sur Internet.
4. Laissez **Visible sur le site** coché, puis cliquez sur `Créer le partenaire`.
   - Résultat attendu : La fiche s’ouvre avec le bandeau « Le partenaire a été enregistré et apparaît immédiatement sur le site s’il est visible. »
5. Pour retirer temporairement un partenaire : ouvrez sa fiche, décochez **Visible sur le site**, puis cliquez sur `Enregistrer`.
   - Résultat attendu : Le badge de la carte « Fiche » passe à « Masqué » et le logo disparaît du site. La fiche est conservée.
6. Pour retirer définitivement : `Supprimer le partenaire` (carte « Fiche »), puis confirmez.
   - Remarque : Le dialogue rappelle : « Cette action est définitive. Préférez masquer le partenaire si la relation est suspendue. »

> **Suppression définitive** : Un partenaire supprimé ne peut pas être récupéré. Masquez plutôt que supprimer, sauf en cas d’erreur de saisie (doublon).

- **Le logo est flou ou déformé dans le bandeau.** (cause probable : Image trop petite ou fond non transparent.) : Demandez un logo d’au moins 600 pixels de large en PNG ou WebP, puis remplacez le fichier avec `Remplacer le fichier`.
- **Le message « Ce slug est déjà utilisé » s’affiche.** (cause probable : Un partenaire avec le même sigle ou nom court existe déjà (doublon probable).) : Recherchez le partenaire existant dans la liste avant de créer un doublon ; sinon, saisissez un slug différent.

## 13. Comment modifier un menu de navigation <a id="modifier-un-menu"></a>

*Les quatre emplacements de menus, l’ajout et le classement des entrées, les sous-menus.*

Quatre emplacements sont éditables : « Navigation principale » (barre de navigation du site), « Pied de page » (colonnes de liens), « Pied de page secondaire » (liens légaux et utilitaires) et « Navigation de la plateforme de formation ». Un menu vide laisse la navigation par défaut. Deux niveaux au plus : des entrées et leurs sous-entrées.

> **Effet sur le site** : Dans la version actuelle, le site et la plateforme de formation affichent encore leur navigation par défaut : les menus enregistrés ici sont conservés mais pas encore appliqués à l’écran. Préparez-les sans attendre un changement visible ; le super administrateur vous informera de leur mise en service.

Chemin : Menu de gauche › Contenus › Menus (`/admin/menus`)

1. Ouvrez **Menus** puis cliquez sur `Modifier l’arborescence` sur la carte de l’emplacement voulu.
   - Où : menu de gauche, section « Contenus » ; quatre cartes avec le badge « N entrée(s) »
   - Résultat attendu : L’éditeur du menu s’ouvre avec le champ **Nom du menu**, la liste des entrées et, en bas, les boutons `Ajouter une entrée` et `Enregistrer le menu`. Vide : « Ce menu est vide. Ajoutez une première entrée. »
2. Cliquez sur `Ajouter une entrée`.
   - Résultat attendu : Une carte d’entrée apparaît avec les champs **Libellé**, **Adresse** et **Icône**.
3. Saisissez le **Libellé** (obligatoire, 1 à 80 caractères) et l’**Adresse** (obligatoire : un chemin du site comme /formations, ou une adresse https://).
   - Remarque : L’**Icône** (nom d’icône lucide, par exemple « calendar ») est facultative. Cochez **Lien externe** pour une adresse hors du site ; c’est automatique pour une adresse https://.
4. Classez les entrées avec les boutons icône « Monter » et « Descendre ».
   - Remarque : Sur ordinateur, vous pouvez aussi glisser une entrée avec la poignée « Glisser pour réordonner » ; cette poignée est masquée sur téléphone.
5. Pour créer un sous-menu : cliquez sur « Ajouter une sous-entrée » sur une entrée de premier niveau, ou sur « Transformer en sous-menu » pour placer une entrée sous l’entrée précédente.
   - Résultat attendu : Les sous-entrées apparaissent indentées avec un filet vert.
   - Remarque : « Remonter d’un niveau » fait l’inverse. Le bouton « Supprimer {libellé} » retire l’entrée sans confirmation : attention.
6. Cliquez sur `Enregistrer le menu`.
   - Où : en bas de la page
   - Résultat attendu : Le message « Menu « {nom} » enregistré (N entrée(s) de premier niveau). » apparaît. L’arbre entier remplace l’ancien.

> **L’enregistrement remplace tout le menu** : Les entrées supprimées dans l’éditeur disparaissent définitivement à l’enregistrement. Limites : 40 entrées de premier niveau, 30 sous-entrées par entrée, 120 entrées au total.

- **Le message « URL invalide (http(s) ou chemin relatif) » s’affiche.** (cause probable : L’adresse ne commence ni par / ni par https://.) : Pour une page du site, commencez par une barre oblique (« /actualites ») ; pour un site externe, collez l’adresse complète.
- **Le message « Nom d’icône lucide invalide » s’affiche.** (cause probable : Le nom contient des majuscules, des espaces ou des accents.) : Laissez le champ vide, ou utilisez un nom en minuscules avec des tirets (« file-text »).

## 14. Comment traiter un message reçu depuis le site <a id="traiter-les-messages-recus"></a>

*Lire, répondre par email, changer le statut, attribuer un responsable, exporter et supprimer les messages des formulaires du site.*

Chaque formulaire du site (contact, demande d’adhésion ou d’information, proposition de partenariat, assistance, demande de service) crée un message avec une référence MSG-… L’expéditeur reçoit automatiquement un accusé de réception qui promet une réponse sous 48 heures ouvrées : c’est votre délai. Vous êtes notifié des messages Contact, Adhésion / intérêt et Partenariat ; les messages « Demande de service » sont destinés au responsable des services et « Assistance » au support, mais vous les voyez aussi.

Chemin : Menu de gauche › Relations › Messages reçus (`/admin/messages`)

1. Ouvrez **Messages reçus**.
   - Où : menu de gauche, section « Relations » ; la pastille indique le nombre de messages « Nouveau »
   - Résultat attendu : Les tuiles « Nouveaux », « Attribués », « Répondus », « Clôturés » et la liste s’affichent ; les lignes « Nouveau » sont surlignées en or clair.
2. Filtrez si besoin avec le champ de recherche (référence, nom, email, objet ou texte), les listes **Statut**, **Type** et **Responsable**, puis cliquez sur `Filtrer`.
3. Cliquez sur l’objet du message pour l’ouvrir.
   - Résultat attendu : La fiche affiche l’expéditeur (nom, email, téléphone), le badge de type, le texte du message, la carte « Informations complémentaires » (organisation, secteur, employeur, fonction, intérêt…) et les cartes « Traitement » et « Attribution ».
4. Cliquez sur `Répondre par email`.
   - Où : carte « Traitement »
   - Résultat attendu : Votre messagerie s’ouvre avec l’objet « [FETRAG {référence}] Votre message ». Rédigez et envoyez la réponse depuis votre messagerie.
   - Remarque : Restez courtois et factuel ; ne promettez rien qui dépasse votre mandat. Pour une demande d’adhésion, joignez les informations pratiques ou orientez vers la page du site.
5. Revenez sur la fiche et cliquez sur `Marquer répondu`.
   - Résultat attendu : Le message « Message {référence} mis à jour. » apparaît ; la date de réponse est enregistrée.
6. Pour confier le message à un collègue : carte **Attribution**, choisissez le **Responsable**, puis cliquez sur `Enregistrer`.
   - Résultat attendu : Le message « Message attribué. » apparaît ; un message « Nouveau » passe en « Attribué ».
7. Une fois le dossier terminé, cliquez sur `Clôturer`. Pour un spam, cliquez sur `Indésirable`. En cas d’erreur, `Remettre en nouveau`.
   - Remarque : Les boutons affichés dépendent du statut courant.
8. Pour exporter la liste (selon les filtres en cours, 5 000 lignes maximum), cliquez sur `Exporter (CSV)` en haut de la liste.
   - Résultat attendu : Un fichier CSV se télécharge ; l’export est enregistré dans le journal d’audit.

### Statuts d’un message

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Nouveau | Message à lire, personne ne s’en occupe encore. | Ouvrez-le, répondez ou attribuez-le. |
| Attribué | Un responsable est désigné. | Le responsable répond puis marque le message répondu. |
| Répondu | Une réponse a été envoyée ; la date est enregistrée. | Clôturez quand l’échange est terminé. |
| Clôturé | Dossier terminé. | Peut être supprimé (droit à l’effacement). |
| Indésirable | Spam ou message sans objet. | Peut être supprimé. |

> **Supprimer un message** : Le bouton `Supprimer le message` n’est utilisable que pour un message « Indésirable » ou « Clôturé ». La suppression est définitive (« droit à l’effacement ou message indésirable »). Ne supprimez un message clôturé qu’à la demande de son expéditeur ou selon la règle de conservation fixée par la Fédération.

- **`Répondre par email` n’ouvre rien.** (cause probable : Aucune application de messagerie n’est associée au navigateur (fréquent sur ordinateur partagé).) : Copiez l’adresse email de l’expéditeur (lien sous son nom) et la référence MSG-…, puis écrivez depuis votre messagerie habituelle en indiquant « [FETRAG {référence}] » dans l’objet.
- **Le lien « compte {nom} » affiche « Accès refusé ».** (cause probable : Il mène à la fiche utilisateur, réservée au super administrateur.) : C’est normal pour votre rôle. Les informations nécessaires sont déjà sur la fiche du message.
- **Le message « Seuls les messages indésirables ou clôturés peuvent être supprimés » s’affiche.** (cause probable : Le message est encore Nouveau, Attribué ou Répondu.) : Clôturez-le d’abord (ou classez-le Indésirable), puis supprimez-le.

## 15. Comment gérer les abonnés à la lettre d’information <a id="gerer-la-newsletter"></a>

*Consulter, exporter et supprimer les abonnés ; ce que le site fait et ne fait pas.*

Les visiteurs s’abonnent depuis le pied de page ou le formulaire de contact. L’inscription se fait en deux temps (double opt-in) : la personne reçoit l’email « Confirmez votre inscription à la lettre d’information FETRAG » et doit cliquer sur son lien. Le back-office gère la liste des abonnés, l’export des consentements et la suppression. Il n’envoie aucune lettre : l’envoi se fait avec un outil externe choisi par la Fédération.

Chemin : Menu de gauche › Relations › Newsletter (`/admin/newsletter`)

1. Ouvrez **Newsletter**.
   - Où : menu de gauche, section « Relations »
   - Résultat attendu : Les tuiles « Abonnés confirmés », « En attente de confirmation », « Désinscrits » et la liste des adresses s’affichent.
2. Filtrez sur **État** = Confirmé, puis cliquez sur `Exporter (CSV)`.
   - Où : bouton en haut de la page
   - Résultat attendu : Un fichier CSV se télécharge (Email, État, Inscrit le, Confirmé le, Désinscrit le, Source ; 20 000 lignes maximum). L’export est enregistré dans le journal d’audit.
3. Importez uniquement les adresses « Confirmé » dans l’outil d’envoi, et retirez-en les « Désinscrit » à chaque nouvel envoi.
   - Remarque : Les dates de confirmation servent de preuve du consentement. N’ajoutez jamais une adresse qui ne s’est pas abonnée elle-même.
4. Pour supprimer un abonné à sa demande : cliquez sur `Supprimer` sur sa ligne, puis confirmez.
   - Résultat attendu : Le message « Abonné supprimé. » apparaît.
   - Remarque : Le dialogue rappelle : « L’adresse et son historique de consentement sont effacés définitivement. »

> **Fichier d’abonnés** : L’export contient des adresses personnelles. Conservez-le sur un appareil protégé, ne le partagez pas en dehors de l’équipe communication et supprimez les anciennes versions.

- **Une personne dit s’être abonnée mais reste « En attente de confirmation ».** (cause probable : Elle n’a pas cliqué sur le lien de l’email de confirmation (souvent dans les indésirables).) : Demandez-lui de chercher l’email « Confirmez votre inscription… » et de cliquer sur son lien, ou de se réinscrire depuis le site (un nouvel envoi est possible après 10 minutes).

## 16. Comment consulter l’audience et exporter les rapports <a id="consulter-les-rapports"></a>

*Les indicateurs du site sur 30 jours, les contenus populaires et les exports CSV.*

Chemin : Menu de gauche › Administration › Rapports (`/admin/rapports`)

1. Ouvrez **Rapports** (ou cliquez sur `Rapports détaillés` sur le tableau de bord).
   - Où : menu de gauche, section « Administration »
   - Résultat attendu : La section « Site institutionnel · 30 derniers jours » affiche les tuiles « Pages vues », « Formulaires reçus », « Inscriptions aux événements », « Conversion des commandes », puis les cartes « Visites » et « Formulaires et recherches » (avec les « Recherches fréquentes »).
2. Consultez la carte **Contenus populaires** : actualités les plus vues, ressources les plus téléchargées, formations et événements avec le plus d’inscriptions.
   - Remarque : Les « Recherches fréquentes » vous indiquent ce que les visiteurs cherchent sans trouver : une bonne source d’idées d’actualités, de ressources ou de questions fréquentes.
3. Dans la carte **Exports CSV**, cliquez sur `Indicateurs du site`, `Indicateurs de formation` ou `Contenus populaires`.
   - Résultat attendu : Un fichier « fetrag-rapport-{type}-{date}.csv » se télécharge (UTF-8, séparateur point-virgule). Chaque export est enregistré dans le journal d’audit. Ces fichiers ne contiennent aucune donnée personnelle.

- **Le message « Indicateurs indisponibles » s’affiche.** (cause probable : Le calcul des statistiques a échoué momentanément.) : Réessayez dans quelques instants. Si le problème persiste plusieurs heures, signalez-le au super administrateur.
- **Le bouton `Rapports détaillés du LMS` affiche « Accès refusé ».** (cause probable : Il mène à l’espace de coordination de la plateforme de formation, réservé au coordinateur.) : C’est normal pour votre rôle. Les indicateurs de formation utiles vous sont déjà présentés sur la page « Rapports ».

## 17. Comment supprimer un contenu (et quand ne pas le faire) <a id="supprimer-un-contenu"></a>

*La suppression est définitive : préférez archiver ou masquer.*

> **Aucune corbeille** : La suppression est physique et immédiate : une page part avec toutes ses versions, un événement avec ses inscriptions, une actualité avec ses statistiques. Préférez `Archiver` (pages, actualités, ressources, événements) ou masquer (partenaires, questions fréquentes) pour conserver l’historique. Ne supprimez que les doublons et les erreurs de saisie.

1. Ouvrez le menu d’actions du contenu (liste) ou le bouton `Actions` du panneau « Publication » (fiche), puis cliquez sur `Supprimer`.
   - Résultat attendu : Le dialogue « Supprimer « {titre} » ? » s’ouvre : « Cette action est définitive. Les contenus publiés ne peuvent être supprimés que par un rôle disposant du droit de publication. »
2. Relisez le titre affiché dans le dialogue pour être certain du contenu visé.
3. Cliquez sur `Supprimer définitivement` (ou `Annuler`).
   - Résultat attendu : Le message « Élément supprimé. » apparaît et vous revenez à la liste.

*Supprimer ou plutôt retirer ?*

| Contenu | Pour retirer du site | Suppression |
| --- | --- | --- |
| Page, actualité, ressource, événement | `Archiver` (ou `Repasser en brouillon`) | Définitive ; les versions, inscriptions et statistiques sont perdues. |
| Partenaire | Décocher **Visible sur le site** | Définitive. |
| Question fréquente | Décocher **Visible** | Définitive. |
| Catégorie | Rien : elle n’est visible que si des contenus l’utilisent | Refusée tant qu’elle est utilisée. |
| Fichier de la médiathèque | Retirer le fichier des contenus qui l’utilisent | Définitive ; les contenus qui l’utilisent affichent un lien cassé. |
| Message reçu | Clôturer ou classer Indésirable | Définitive ; réservée aux messages clôturés ou indésirables. |
| Abonné à la lettre | Il se désinscrit lui-même par le lien de l’email | Définitive, à la demande de la personne. |

## 18. Notifications et emails que vous recevez <a id="notifications"></a>

*Ce qui vous est envoyé, quand, et ce qu’il faut en faire.*

Vos notifications internes se consultent dans le menu de votre compte (vos initiales, en haut à droite) > **Notifications**. Les emails arrivent à l’adresse de votre compte. Le site ne vous envoie aucun email lors d’une mise en relecture, d’une publication ou d’une publication planifiée : seul le journal d’audit les enregistre.

*Notifications et emails de votre rôle*

| Sujet | Déclencheur | Ce qu’il faut faire |
| --- | --- | --- |
| Notification « Nouveau message : {type} » | Un formulaire Contact, Adhésion / intérêt ou Partenariat a été envoyé depuis le site. | Ouvrez le lien vers le message, répondez sous 48 heures ouvrées, puis marquez-le répondu. |
| Pastille sur « Messages reçus » (menu) | Des messages sont encore au statut « Nouveau ». | Traitez-les ou attribuez-les. |
| Pastille sur « Tableau de bord » (menu) | Des contenus sont « En relecture ». | Relisez-les depuis la carte « Contenus en relecture » puis publiez ou repassez en brouillon. |
| Email « Bienvenue à la FETRAG » | Création de votre compte. | Conservez-le ; il rappelle l’adresse du compte. |
| Email « Confirmez votre adresse email - FETRAG » | Création du compte ou changement d’adresse (lien valable 24 heures). | Cliquez sur le lien avant de vous connecter. |
| Email « Votre compte de formation FETRAG est prêt : définissez votre mot de passe » | Votre compte a été créé par l’administration (lien valable 7 jours). | Cliquez sur le lien et choisissez votre mot de passe. |
| Email « Réinitialisation de votre mot de passe FETRAG » | Vous avez demandé un nouveau mot de passe (lien valable 30 minutes). | Cliquez sur le lien. Si vous n’avez rien demandé, ignorez l’email et prévenez le support. |
| Email « Votre mot de passe FETRAG a été modifié » | Votre mot de passe vient d’être changé. | Si ce n’est pas vous, changez-le immédiatement et prévenez le super administrateur. |

*Emails automatiques envoyés à des tiers par les contenus que vous gérez (vous n’en recevez pas de copie)*

| Sujet | Destinataire | Déclencheur |
| --- | --- | --- |
| « Nous avons bien reçu votre message ({référence}) » | L’expéditeur d’un formulaire | Envoi d’un formulaire du site ; promet une réponse sous 48 heures ouvrées. |
| « Inscription confirmée : {événement} » | Une personne inscrite | Inscription à un événement publié. |
| « Liste d’attente : {événement} » | Une personne en attente | Inscription alors que la capacité est atteinte. |
| « Une place s’est libérée : {événement} » | La première personne en attente | Un inscrit annule (événement gratuit). |
| « Confirmez votre inscription à la lettre d’information FETRAG » | Un nouvel abonné | Abonnement depuis le site (double opt-in). |

## 19. Bonnes pratiques éditoriales et sécurité <a id="bonnes-pratiques"></a>

*Écrire pour être lu et compris, rendre les contenus accessibles, protéger les données et votre compte.*

### Rédaction et ton institutionnel

- [x] Écrivez des titres courts et précis (moins de 70 caractères), sans majuscules partout ni points d’exclamation.
- [x] Placez l’information essentielle dans le chapô : qui, quoi, quand, où. Le lecteur sur téléphone lit souvent seulement les premières lignes.
- [x] Une idée par paragraphe ; des sous-titres de niveau 2 tous les trois ou quatre paragraphes ; des listes pour les énumérations.
- [x] Employez le ton de la Fédération : factuel, respectueux, sans attaque personnelle. Un communiqué engage la FETRAG : faites-le valider par le Secrétariat général.
- [x] Reprenez mot pour mot les textes officiels (mission, devise, mot du Secrétaire général) sans les paraphraser.
- [x] Citez vos sources (texte de loi, rapport, institution) et datez les documents déposés en ressource.
- [x] Relisez avant de publier : orthographe, noms propres, dates, liens qui fonctionnent. Publier est immédiat et sans confirmation.
- [x] Ne changez pas le slug d’un contenu déjà publié et partagé : les anciens liens casseraient.

### Images et accessibilité

- [x] Renseignez le texte alternatif de chaque image informative : une phrase qui dit ce que montre l’image. Laissez-le vide seulement pour une image purement décorative.
- [x] Réduisez les images avant l’envoi (moins de 500 Ko, 1600 × 900 pixels pour une couverture) : le site est consulté sur des connexions mobiles.
- [x] Ne mettez pas de texte important dans une image (affiche) sans le reprendre dans le texte.
- [x] Écrivez des liens parlants (« télécharger le guide de l’adhérent ») plutôt que « cliquez ici ».
- [x] Pas d’emoji ni de symboles décoratifs dans les contenus : la charte du site s’en charge.
- [x] Utilisez les listes et les titres de l’éditeur plutôt que des tirets ou des majuscules pour structurer.
- [x] Évitez les tableaux larges : sur téléphone, ils deviennent illisibles.

### Données personnelles et confidentialité

- [x] Ne publiez jamais de noms, adresses, numéros de téléphone ou situations individuelles sans l’accord écrit des personnes.
- [x] Demandez l’accord des personnes photographiées avant de publier une photo d’événement où elles sont reconnaissables.
- [x] Les documents internes (listes de membres, procès-verbaux nominatifs) ne vont pas sur le site, ou seulement en niveau « Membres » ou « Organisation ».
- [x] Les exports (messages, participants, abonnés) contiennent des données personnelles : stockez-les sur un appareil protégé, ne les envoyez pas par WhatsApp, supprimez-les après usage.
- [x] Répondez aux messages reçus avec courtoisie, sans divulguer d’informations sur d’autres personnes.
- [x] Supprimez un message ou un abonné quand la personne le demande (droit à l’effacement), après clôture.

### Sécurité de votre compte

- [x] Activez la vérification en deux étapes dès votre première connexion : elle est exigée pour votre rôle.
- [x] Conservez vos codes de secours hors du téléphone (papier dans un lieu sûr, gestionnaire de mots de passe).
- [x] Choisissez un mot de passe unique (au moins 8 caractères, une majuscule, un chiffre) que vous n’utilisez nulle part ailleurs.
- [x] Déconnectez-vous et fermez le navigateur sur tout appareil partagé ou prêté.
- [x] Ne communiquez jamais votre mot de passe ni un code de vérification, même à une personne se présentant comme le support ou l’administrateur.
- [x] Si vous recevez « Votre mot de passe FETRAG a été modifié » sans l’avoir demandé, changez-le immédiatement et prévenez le super administrateur.
- [x] Toutes vos actions (création, modification, publication, suppression, export) sont enregistrées dans le journal d’audit avec la date et l’appareil utilisé.

## 20. Questions fréquentes <a id="questions-frequentes"></a>

**Dois-je faire valider mes contenus par quelqu’un avant de publier ?**

Le site ne l’impose pas : votre rôle rédige, relit et publie. Le statut « En relecture » est un outil pour vous et vos collègues éditeurs. La validation de fond (communiqués, textes officiels, pages légales) se fait avec le Secrétariat général, hors du site, avant de cliquer sur `Publier`.

**Comment voir mon brouillon tel qu’il apparaîtra sur le site ?**

Dans la version actuelle, le bouton `Prévisualiser` ne montre pas encore les brouillons (la page répond « introuvable »). Relisez soigneusement dans le formulaire, publiez, vérifiez avec `Voir en ligne`, et repassez en brouillon en cas de problème.

**J’ai publié par erreur. Que faire ?**

Ouvrez le menu `Actions` du panneau « Publication » et cliquez sur `Repasser en brouillon` : le contenu disparaît immédiatement du site. Corrigez, puis publiez de nouveau.

**Puis-je programmer la publication d’une ressource ou d’un événement ?**

Non : la planification n’existe que pour les pages et les actualités. Publiez la ressource ou l’événement au moment voulu.

**J’ai modifié une page mais le site affiche l’ancien texte.**

Rechargez la page publique. Vérifiez que la page est bien « Publié » et que son slug est l’un de ceux servis par le site (« la-fetrag », « mentions-legales », « confidentialite »). Une page avec un autre slug n’a pas encore d’adresse publique.

**Puis-je récupérer une actualité supprimée ?**

Non : la suppression est définitive, sans corbeille. Pour retirer un contenu du site sans le perdre, utilisez `Archiver`.

**Comment retrouver une ancienne version d’une page ?**

Sur la fiche de la page, la carte « Versions » liste les douze dernières versions avec un bouton `Restaurer`. La restauration crée une nouvelle version ; rien n’est perdu. Seules les pages ont cet historique.

**Le lien de téléchargement d’une ressource « Membres » que j’ai copié ne fonctionne plus.**

Les fichiers des niveaux Membres, Organisation et Premium sont servis par un lien signé valable 15 minutes. Partagez l’adresse de la page de la ressource, pas le lien du fichier.

**Puis-je envoyer la lettre d’information depuis le back-office ?**

Non. Le back-office gère seulement les abonnés (liste, export CSV des consentements, suppression). L’envoi se fait avec l’outil externe retenu par la Fédération, à partir des adresses « Confirmé », en retirant les « Désinscrit ».

**Un inscrit à un événement ne peut plus s’inscrire ou annuler.**

Les inscriptions sont closes une fois la date de l’événement passée, et un participant marqué « Présent » ne peut plus annuler. Pour un cas particulier, notez la présence sur place.

**Que se passe-t-il si je change le slug d’une actualité déjà partagée ?**

Les anciens liens (réseaux sociaux, WhatsApp, emails) mènent à une page introuvable, sans redirection automatique. Ne changez le slug qu’avant la première publication.

**Pourquoi le bouton `Coordination LMS` affiche-t-il « Accès refusé » ?**

Il mène à l’espace de coordination de la plateforme de formation, réservé au coordinateur. Votre rôle n’y a pas accès ; c’est normal.

**Je n’ai plus mon téléphone et je ne peux plus saisir le code de vérification.**

Utilisez un code de secours noté lors de l’activation. Sans code de secours, demandez au super administrateur de réinitialiser la vérification en deux étapes de votre compte, puis réactivez-la avec votre nouveau téléphone.

## 21. Lexique <a id="lexique"></a>

- **Back-office** : La partie « Administration du site », réservée aux personnels de la Fédération, où l’on rédige et publie les contenus.
- **Brouillon** : Contenu en cours de rédaction, visible seulement dans le back-office. Statut à la création.
- **En relecture** : Contenu soumis à validation, listé sur le tableau de bord dans « Contenus en relecture ». Non visible sur le site.
- **Planifié** : Page ou actualité qui sera publiée automatiquement à la date et à l’heure choisies (heure de Libreville).
- **Publié** : Contenu visible sur le site, dans la recherche et dans le plan du site.
- **Archivé** : Contenu retiré du site mais conservé dans le back-office ; peut repasser en brouillon.
- **Slug** : Nom court qui forme l’adresse d’un contenu (par exemple « accord-dialogue-social » dans /actualites/accord-dialogue-social). Minuscules, chiffres et tirets ; généré depuis le titre.
- **Chapô (ou extrait)** : Les deux ou trois phrases qui résument un contenu, affichées dans les listes et les partages. Généré depuis le texte s’il est vide.
- **Éditeur de texte riche** : La zone de rédaction avec la barre « Mise en forme » (titres, listes, liens, images, tableaux). Le texte est nettoyé à l’enregistrement.
- **Blocs structurés (JSON)** : Les sections riches d’une page (bandeau, chiffres clés, équipe…) décrites dans un format texte à accolades et guillemets. Des modèles s’insèrent d’un clic.
- **Gabarit** : La mise en page d’une page : Standard, Institutionnel (La FETRAG), Page d’atterrissage, Page légale.
- **Version (révision)** : Copie d’une page enregistrée à chaque modification du titre, du contenu ou des blocs ; restaurable depuis la carte « Versions ».
- **SEO (référencement)** : Titre, description et image que les moteurs de recherche et les réseaux sociaux affichent pour un contenu. « Exclure des moteurs » demande de ne pas indexer la page.
- **Texte alternatif** : Phrase qui décrit une image pour les personnes qui ne la voient pas (lecteurs d’écran, image non chargée). Indispensable pour l’accessibilité.
- **Médiathèque** : Le menu **Médias** : tous les fichiers envoyés (images, documents, audio, vidéo), rangés par dossier, publics ou privés.
- **Lien signé** : Adresse temporaire (15 minutes) qui donne accès à un fichier privé. Un lien signé copié cesse de fonctionner rapidement.
- **Niveau d’accès** : Qui peut télécharger une ressource : Public (tous), Membres (compte connecté), Organisation (membres de l’organisation rattachée), Premium (achat).
- **Catégorie** : Étiquette de classement d’un contenu, propre à un domaine (Actualités, Ressources, Formations, Services, Événements).
- **Liste d’attente** : File des personnes inscrites à un événement complet ; la première est promue automatiquement quand une place se libère (événement gratuit).
- **Double opt-in** : Abonnement à la lettre d’information en deux temps : la personne s’inscrit puis confirme en cliquant sur le lien reçu par email.
- **Vérification en deux étapes** : Un code temporaire à 6 chiffres, généré par une application sur votre téléphone, demandé en plus du mot de passe à chaque connexion. Exigée pour votre rôle.
- **Codes de secours** : Codes à usage unique remis à l’activation de la vérification en deux étapes, pour se connecter sans le téléphone.
- **Journal d’audit** : Registre de qui a fait quoi et quand (création, modification, publication, suppression, export). Consultable par le super administrateur seulement.
- **CSV** : Fichier texte de tableau (colonnes séparées par des points-virgules) lisible dans un tableur.
- **Accusé de réception** : Email automatique envoyé à toute personne qui utilise un formulaire du site, avec sa référence MSG-… et la promesse d’une réponse sous 48 heures ouvrées.

## 22. Besoin d’aide ? <a id="besoin-d-aide"></a>

*À qui s’adresser selon le problème, et quoi indiquer dans votre message.*

*Qui contacter*

| Votre problème | À qui s’adresser |
| --- | --- |
| Connexion impossible, mot de passe, adresse non vérifiée, vérification en deux étapes perdue | Le support, par le formulaire de contact du site ; la réinitialisation de la vérification en deux étapes relève du super administrateur. |
| Rôle manquant (« Accès refusé »), nouveau collègue à équiper, nouveau thème de FAQ, nouvelle page à rendre publique | Le super administrateur. |
| Validation d’un communiqué, d’un texte officiel, d’une page légale | Le Secrétariat général. |
| Un message reçu concerne une demande de service ou un problème de compte | Attribuez-le au responsable des services ou au support depuis la carte « Attribution ». |
| Paiement d’une ressource Premium ou d’un événement payant | Le service Finance. |
| Une catégorie « Formations » ou « Services » à modifier | La coordination formation ou le responsable des services. |
| Un écran qui ne fonctionne pas (message d’erreur inattendu, page blanche) | Le support, avec les informations ci-dessous. |

### Ce qu’il faut indiquer dans votre message

- [x] L’adresse email de votre compte (jamais votre mot de passe).
- [x] L’écran concerné (par exemple « Actualités > fiche de l’actualité », « Médias ») et l’heure approximative.
- [x] Le message d’erreur exact, recopié, ou la référence du contenu (titre, slug, référence MSG-…).
- [x] L’appareil et le navigateur utilisés (téléphone ou ordinateur, Chrome, Safari…).
- [x] Ce que vous avez déjà essayé (rechargement, autre navigateur, déconnexion).

### Coordonnées

- [Formulaire de contact du site](/contact) : Pour joindre le support ou le secrétariat ; vous recevrez un accusé de réception avec une référence.
- [Écrire au secrétariat](mailto:jossngomafm@gmail.com) : Adresse email de la Fédération.
- [Appeler la Fédération](tel:+24166230033) : 066 23 00 33 ou 077 52 27 98, aux heures de bureau.
- [Adresse postale](/contact) : FETRAG, BP 1234 Libreville, Gabon.
- [Protéger mon compte](/espace/securite) : Activer la vérification en deux étapes, changer de mot de passe, voir l’activité récente.

## Testez votre maîtrise <a id="autoevaluation"></a>

Vingt et une questions pour vérifier que vous savez où cliquer, ce que signifie chaque statut, ce qui est irréversible et à qui vous adresser. Comptez dix minutes ; le corrigé renvoie à la section du guide. Seuil de maîtrise : 70 % de bonnes réponses. 21 questions.

1. Quel contenu ne pouvez-vous pas modifier avec le rôle « Éditeur communication » ? *(une seule réponse)*
   - a) Une actualité déjà publiée.
   - b) Une fiche du catalogue des services.
   - c) Une question fréquente masquée.
   - d) Le logo d’un partenaire.

2. Où activez-vous la vérification en deux étapes ? *(une seule réponse)*
   - a) Dans le menu de votre compte (vos initiales), rubrique **Sécurité**.
   - b) Dans le tableau de bord du back-office, carte « Messages reçus ».
   - c) Dans le menu **Rapports**.

3. Les codes de secours peuvent être réaffichés plus tard depuis la page « Protéger mon compte ». *(vrai ou faux)*
   - a) Vrai
   - b) Faux

4. Sur téléphone, comment ouvrez-vous la navigation du back-office ? *(une seule réponse)*
   - a) Avec le bouton **Ouvrir la navigation** (trois traits), en haut à gauche.
   - b) En balayant l’écran vers le bas.
   - c) Avec le lien « Voir le site ».

5. Quels statuts rendent un contenu invisible pour les visiteurs du site ? *(plusieurs réponses possibles)*
   - a) Brouillon
   - b) En relecture
   - c) Publié
   - d) Archivé

6. Une fenêtre de confirmation s’affiche avant que le contenu soit publié quand vous cliquez sur `Publier`. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

7. Quels contenus peuvent être planifiés à une date de publication ? *(une seule réponse)*
   - a) Les pages et les actualités seulement.
   - b) Tous les contenus, y compris les ressources et les événements.
   - c) Les événements seulement.

8. Vous avez publié une actualité et constatez une grosse erreur. Que faites-vous en premier ? *(une seule réponse)*
   - a) `Actions` puis `Supprimer` : l’actualité disparaît du site.
   - b) `Actions` puis `Repasser en brouillon`, puis corriger et republier.
   - c) Rien : la correction n’est possible qu’après 24 heures.

9. Dans le dialogue « Insérer une image », pourquoi le choix du fichier est-il désactivé ? *(une seule réponse)*
   - a) Le champ **Texte alternatif** est encore vide.
   - b) La médiathèque est pleine.
   - c) Vous n’avez pas le droit d’insérer des images.

10. Changer le slug d’une actualité déjà partagée redirige automatiquement les anciens liens vers la nouvelle adresse. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

11. Que se passe-t-il quand vous restaurez une ancienne version d’une page ? *(une seule réponse)*
   - a) Les versions plus récentes sont effacées.
   - b) Une nouvelle version est créée avec l’ancien contenu ; rien n’est supprimé.
   - c) La page est automatiquement archivée.

12. Quel niveau d’accès choisir pour un procès-verbal nominatif destiné aux seuls membres d’une organisation ? *(une seule réponse)*
   - a) Public
   - b) Organisation, avec l’organisation rattachée renseignée.
   - c) Premium

13. Quelle est la taille maximale réellement acceptée pour une image dans la médiathèque ? *(une seule réponse)*
   - a) 8 Mo
   - b) 12 Mo
   - c) 25 Mo

14. Une catégorie encore utilisée par des contenus peut être supprimée : les contenus passent alors « Sans catégorie ». *(vrai ou faux)*
   - a) Vrai
   - b) Faux

15. Le jour de l’événement, quel bouton marque la présence d’une personne inscrite ? *(une seule réponse)*
   - a) `Présent`, dans la colonne « Présence » de la carte « Participants ».
   - b) `Publier`, dans le panneau « Publication ».
   - c) `Exporter (CSV)`.

16. Une relation avec un partenaire est suspendue. Que faites-vous ? *(une seule réponse)*
   - a) Décocher **Visible sur le site** puis `Enregistrer`.
   - b) Cliquer sur `Supprimer le partenaire`.
   - c) Envoyer la fiche en relecture.

17. Quels messages reçus peuvent être supprimés ? *(plusieurs réponses possibles)*
   - a) Un message « Clôturé ».
   - b) Un message « Indésirable ».
   - c) Un message « Nouveau ».
   - d) Un message « Attribué ».

18. Le back-office permet d’envoyer la lettre d’information aux abonnés confirmés. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

19. Pour retirer du site un événement passé sans perdre la liste de ses inscrits, vous choisissez : *(une seule réponse)*
   - a) `Archiver`
   - b) `Supprimer définitivement`
   - c) `Exporter (CSV)`

20. Vous recevez l’email « Votre mot de passe FETRAG a été modifié » sans l’avoir demandé. Que faites-vous ? *(une seule réponse)*
   - a) Vous changez immédiatement votre mot de passe et prévenez le super administrateur.
   - b) Vous ignorez l’email : c’est un message automatique sans importance.
   - c) Vous répondez à l’email en indiquant votre mot de passe actuel.

21. À qui demander la réinitialisation de votre vérification en deux étapes quand vous n’avez plus ni téléphone ni code de secours ? *(une seule réponse)*
   - a) Au super administrateur.
   - b) Au responsable des services.
   - c) À la coordination formation.

### Corrigé

1. **b** : Les services s’ouvrent en lecture seule : seule l’équipe des services les modifie. Voir « Votre rôle en bref ».
2. **a** : La page « Protéger mon compte » se trouve sous **Sécurité**. Voir « Activer la vérification en deux étapes ».
3. **b** : Ils sont affichés une seule fois. Pour en obtenir de nouveaux, il faut désactiver puis réactiver la vérification. Voir « Activer la vérification en deux étapes ».
4. **a** : Sous 1024 pixels, le menu de gauche devient un tiroir ouvert par ce bouton. Voir « Se repérer dans le back-office ».
5. **a, b, d** : Seul « Publié » est visible sur le site ; « Planifié » le devient à l’heure choisie. Voir « Comprendre le cycle de publication ».
6. **b** : Publier, archiver et repasser en brouillon sont immédiats ; seules la planification et la suppression ouvrent un dialogue. Voir « Comprendre le cycle de publication ».
7. **a** : La planification n’existe que pour les pages et les actualités. Voir « Planifier une publication ».
8. **b** : Repasser en brouillon retire aussitôt le contenu du site sans rien perdre ; la suppression est définitive. Voir « Prévisualiser avant de publier ».
9. **a** : Le texte alternatif est obligatoire avant l’envoi : « Renseignez d’abord le texte alternatif. » Voir « Mettre en forme le texte ».
10. **b** : Aucune redirection n’est créée : les anciens liens mènent à une page introuvable. Voir « Classer, illustrer et référencer l’actualité ».
11. **b** : La restauration crée une version supplémentaire et ne change pas le statut. Voir « Restaurer une version précédente ».
12. **b** : Le niveau Organisation réserve le fichier aux membres de l’organisation rattachée ; sans organisation rattachée, toutes les organisations y accèdent. Voir « Comment déposer une ressource documentaire ».
13. **a** : Le dialogue annonce 12 Mo mais la limite appliquée aux images est 8 Mo (25 Mo pour les documents). Voir « Comment gérer la médiathèque ».
14. **b** : La suppression est refusée tant que des contenus utilisent la catégorie. Voir « Comment gérer les catégories ».
15. **a** : Seuls les participants « Inscrit » peuvent être marqués présents ; `Retirer` annule. Voir « Suivre les inscrits, marquer les présences et exporter ».
16. **a** : Masquer conserve la fiche ; la suppression est définitive. Les partenaires n’ont pas de cycle de publication. Voir « Comment ajouter ou masquer un partenaire ».
17. **a, b** : Seuls les statuts Indésirable et Clôturé autorisent la suppression, qui est définitive. Voir « Comment traiter un message reçu depuis le site ».
18. **b** : Le back-office gère seulement la liste, l’export CSV des consentements et la suppression ; l’envoi se fait avec un outil externe. Voir « Comment gérer les abonnés à la lettre d’information ».
19. **a** : La suppression emporte les inscriptions ; l’archivage retire du site en conservant tout. Voir « Comment supprimer un contenu (et quand ne pas le faire) ».
20. **a** : Un changement que vous n’avez pas fait signale un accès non autorisé. Voir « Bonnes pratiques éditoriales et sécurité ».
21. **a** : La réinitialisation de la vérification en deux étapes relève du super administrateur. Voir « Besoin d’aide ? ».

## Guides liés

- [Guide du membre](/espace/guide) : Votre compte, votre espace personnel, vos notifications et la sécurité de votre compte.
- [Guide de l’apprenant](https://formation.fetrag.ga/guide) : Suivre une formation sur la plateforme de formation avec le même compte.
