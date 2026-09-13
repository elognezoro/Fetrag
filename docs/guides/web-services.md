# Guide du responsable des services

*Gérer le catalogue des services et instruire les demandes des travailleurs et des organisations*

Plateforme : site institutionnel fetrag.ga · Rôle : SERVICES_MANAGER · Version 1.0 du 2026-09-12 · Lecture : 45 min · 21 sections, 146 étapes.

Version en ligne : https://fetrag.ga/admin/guide/web-services

**À qui s'adresse ce guide ?** Les personnes de la Fédération chargées des services aux travailleurs et aux organisations (assistance juridique, médiation sociale, accompagnement, formation à la demande) et disposant du rôle « Responsable services » sur le site institutionnel.

Avec le rôle « Responsable services », vous décrivez les services proposés par la Fédération et vous les publiez dans le catalogue public. Vous recevez les demandes déposées par les membres, vous les attribuez, vous les faites avancer d’un statut à l’autre et vous informez le demandeur à chaque étape. Vous gérez aussi les catégories de services, la médiathèque et les messages reçus qui concernent les services.

## Avant de commencer

- Un compte FETRAG dont l’adresse email est confirmée.
- Le rôle « Responsable services », attribué par le super administrateur (sans ce rôle, la page « Accès refusé » s’affiche).
- Un téléphone ou un ordinateur connecté à Internet. Sur ordinateur, les tableaux affichent plus de colonnes ; sur téléphone, tout reste faisable.
- Conseillé : une application d’authentification (Google Authenticator, Microsoft Authenticator, Aegis, FreeOTP) pour activer la vérification en deux étapes.

## Prise en main en cinq minutes

1. Connectez-vous avec votre adresse email et votre mot de passe.
   - Élément : `Se connecter` (page **Connexion**, bouton en bas du formulaire)
   - Résultat attendu : Votre espace personnel s’ouvre.
2. Ouvrez le menu de votre compte puis choisissez **Administration du site**.
   - Où : vos initiales, en haut à droite du site
   - Résultat attendu : Le tableau de bord du back-office s’affiche avec le message « Bonjour {votre prénom} ».
3. Ouvrez **Demandes** dans la section « Services » du menu.
   - Où : menu de gauche sur ordinateur ; sur mobile, bouton **Ouvrir la navigation** (trois traits) en haut à gauche
   - Résultat attendu : La liste « Demandes de service » s’affiche avec les tuiles « Nouvelles », « En examen ou en traitement », « Traitées » et « Demandes ouvertes ».
4. Ouvrez une demande « Nouvelle » et attribuez-la vous avec `Enregistrer l’attribution`.
   - Où : panneau « Attribution », sous l’historique
   - Résultat attendu : Le message « Demande {référence} attribuée à {votre nom}. » apparaît et la demande passe « En examen ».
5. Ouvrez **Catalogue** dans la section « Services » pour vérifier les services publiés.
   - Résultat attendu : La liste « Catalogue des services » s’affiche avec le statut de chaque service.

## Sommaire

1. [Votre rôle en bref](#votre-role)
2. [Avant de commencer : compte et connexion](#avant-de-commencer)
3. [Se repérer dans le back-office](#se-reperer)
4. [Comment créer un service](#creer-un-service)
5. [Comment publier un service dans le catalogue](#publier-un-service)
6. [Comment modifier, archiver ou supprimer un service](#modifier-archiver-supprimer-un-service)
7. [Ce que voient les membres : la fiche publique et le dépôt d’une demande](#ce-que-voient-les-membres)
8. [Comment repérer et trier les demandes](#reperer-les-demandes)
9. [Comment instruire une demande](#instruire-une-demande)
10. [Comment suivre une demande sur un service payant](#demandes-payantes)
11. [Comment supprimer une demande (droit à l’effacement)](#supprimer-une-demande)
12. [Comment exporter la liste des demandes](#exporter-les-demandes)
13. [Comment gérer les catégories de services](#gerer-les-categories)
14. [Comment ajouter une image ou un document](#mediatheque)
15. [Comment traiter un message reçu de type « Demande de service »](#messages-recus)
16. [Consulter les autres contenus du site (lecture seule)](#consulter-les-contenus)
17. [Notifications et emails que vous recevez](#notifications)
18. [Bonnes pratiques et sécurité](#bonnes-pratiques)
19. [Questions fréquentes](#questions-frequentes)
20. [Lexique](#lexique)
21. [Besoin d’aide ?](#besoin-d-aide)

## 1. Votre rôle en bref <a id="votre-role"></a>

*Ce que le rôle « Responsable services » vous permet de faire, ce qu’il ne permet pas, et avec qui vous travaillez.*

Le rôle « Responsable services » vous donne accès au back-office du site (la partie « Administration du site », réservée aux personnels de la Fédération). Vous y gérez le catalogue des services et vous instruisez les demandes déposées par les travailleurs et les organisations. Chaque action importante est enregistrée dans le journal d’audit (une trace de qui a fait quoi, et quand).

### Ce que vous pouvez faire

- [x] Créer, modifier, publier, archiver et supprimer des services (menu **Catalogue**).
- [x] Composer le formulaire de demande de chaque service (les questions posées au demandeur).
- [x] Lire toutes les demandes de service, les attribuer, changer leur statut avec un commentaire envoyé au demandeur, ajouter une note interne et exporter la liste (menu **Demandes**).
- [x] Supprimer une demande clôturée ou refusée (droit à l’effacement).
- [x] Créer des catégories du domaine « Services » et modifier les catégories existantes (menu **Catégories**).
- [x] Envoyer, décrire et supprimer des fichiers dans la médiathèque (menu **Médias**).
- [x] Lire et traiter les messages reçus depuis les formulaires du site, en particulier ceux de type « Demande de service » (menu **Messages reçus**).
- [x] Consulter les abonnés à la lettre d’information (menu **Newsletter**).
- [x] Consulter en lecture les pages, actualités, ressources, événements, questions de la FAQ et partenaires, y compris les brouillons.

### Ce que vous ne pouvez pas faire

- Créer, enregistrer ou publier une page, une actualité, une ressource, un événement, une question de FAQ ou un partenaire : c’est le travail de l’éditeur. Vous pouvez seulement les lire.
- Modifier les menus du site (**Menus** n’apparaît pas dans votre navigation).
- Supprimer ou réordonner des catégories (réservé à l’éditeur).
- Voir les utilisateurs, les organisations, la finance, les rapports, le journal d’audit ou les paramètres : ces pages affichent « Accès refusé ».
- Voir le détail d’une commande ou d’un paiement : pour un problème de paiement, orientez vers le service Finance.
- Envoyer un email libre depuis la plateforme : seul le commentaire lié à un changement de statut est envoyé au demandeur. Pour un échange plus long, utilisez votre messagerie en rappelant la référence de la demande.

*Avec qui vous travaillez*

| Rôle | Ce qu’il fait pour vous | Quand le solliciter |
| --- | --- | --- |
| Support | Voit les mêmes demandes que vous, peut les attribuer et changer leur statut (mais pas les supprimer). | Pour partager la charge de traitement ou diagnostiquer un problème de compte du demandeur. |
| Éditeur | Publie les pages, actualités et la FAQ ; supprime ou réordonne les catégories. | Pour annoncer un nouveau service sur le site ou corriger une page qui parle des services. |
| Finance | Suit les commandes et les paiements des services payants, rembourse. | Quand une demande payante reste « En attente » de paiement ou qu’un demandeur signale un double débit. |
| Super administrateur | Attribue les rôles, gère les comptes et les paramètres. | Pour obtenir un droit manquant, réinitialiser la vérification en deux étapes d’un collègue ou désactiver un compte. |
| Secrétariat général | Décide des services proposés, de leurs tarifs et des réponses de fond. | Pour toute décision qui dépasse votre mandat (nouveau service payant, refus sensible). |

## 2. Avant de commencer : compte et connexion <a id="avant-de-commencer"></a>

*Se connecter, retrouver un mot de passe oublié, protéger le compte et se déconnecter.*

Vous utilisez le même compte que tous les membres de la Fédération. C’est le rôle attribué à ce compte qui ouvre le back-office. Si le menu de votre compte n’affiche pas **Administration du site**, le rôle n’a pas encore été attribué : demandez-le au super administrateur.

> **Vérification en deux étapes** : Pour votre rôle, la vérification en deux étapes (un code temporaire demandé en plus du mot de passe) n’est pas obligatoire, mais elle est fortement conseillée : vous manipulez des données personnelles et syndicales.

### Se connecter <a id="se-connecter"></a>

1. Ouvrez la page **Connexion** du site.
   - Où : lien **Connexion** en haut à droite du site ; sur mobile, dans le menu du site
   - Résultat attendu : Le formulaire de connexion s’affiche.
2. Saisissez votre **Adresse email** (obligatoire).
   - Remarque : Utilisez l’adresse avec laquelle vous avez créé votre compte, sans faute de frappe.
3. Saisissez votre **Mot de passe** (obligatoire).
4. Si la vérification en deux étapes est active sur votre compte, saisissez le **Code de vérification** affiché par votre application d’authentification.
   - Remarque : Ce champ n’apparaît que si vous avez activé la vérification en deux étapes.
5. Cliquez sur `Se connecter` (ou `Vérifier et se connecter` avec le code).
   - Où : en bas du formulaire
   - Résultat attendu : Votre espace personnel s’ouvre (rubriques Tableau de bord, Profil, Mes demandes, Mes inscriptions, Paiements et reçus, Notifications, Sécurité).
6. Ouvrez le menu de votre compte puis cliquez sur **Administration du site**.
   - Où : vos initiales, en haut à droite
   - Résultat attendu : Le back-office s’ouvre sur le tableau de bord « Bonjour {votre prénom} ».

- **Un message indique que l’adresse n’est pas vérifiée.** (cause probable : Vous n’avez pas encore cliqué sur le lien de confirmation reçu par email.) : Cliquez sur `Renvoyer le lien de confirmation` sous le formulaire, ouvrez l’email reçu et cliquez sur son lien. Vérifiez aussi le dossier des indésirables.
- **La page « Accès refusé » s’affiche quand j’ouvre l’administration.** (cause probable : Votre compte n’a pas (encore) le rôle « Responsable services », ou vous êtes connecté avec un autre compte.) : Vérifiez l’adresse indiquée dans « Vous êtes connecté en tant que… ». Utilisez « Changer de compte » si besoin, sinon cliquez sur « Contacter la FETRAG » pour demander l’attribution du rôle.
- **Le champ **Code de vérification** apparaît alors que je n’ai plus mon téléphone.** (cause probable : La vérification en deux étapes est active et l’application n’est plus disponible.) : Utilisez l’un des codes de secours notés lors de l’activation. Sans code de secours, demandez au super administrateur de réinitialiser la vérification en deux étapes.

### Retrouver un mot de passe oublié <a id="mot-de-passe-oublie"></a>

1. Cliquez sur **Mot de passe oublié ?**.
   - Où : sous le champ **Mot de passe** de la page **Connexion**
   - Résultat attendu : La page « Mot de passe oublié » s’affiche.
2. Saisissez l’**Adresse email du compte** (obligatoire).
3. Cliquez sur `Recevoir le lien de réinitialisation`.
   - Résultat attendu : Un message vous invite à consulter votre boîte email.
4. Ouvrez l’email reçu et cliquez sur son lien.
   - Résultat attendu : La page de choix d’un nouveau mot de passe s’affiche.
5. Saisissez le **Nouveau mot de passe** puis répétez-le dans **Confirmer le nouveau mot de passe** (les deux sont obligatoires).
   - Remarque : Règles imposées : au moins 8 caractères, au moins une majuscule et au moins un chiffre (la liste « Règles du mot de passe » se coche au fur et à mesure). Choisissez un mot de passe que vous n’utilisez sur aucun autre service.
6. Cliquez sur `Définir le nouveau mot de passe`.
   - Où : en bas du formulaire (le bouton affiche « Enregistrement en cours »)
   - Résultat attendu : Vous pouvez vous connecter avec le nouveau mot de passe.

- **Je ne reçois pas l’email de réinitialisation.** (cause probable : Faute de frappe dans l’adresse, email arrivé dans les indésirables, ou adresse différente de celle du compte.) : Vérifiez le dossier des indésirables, puis recommencez avec l’adresse exacte du compte. Si rien n’arrive après quelques minutes, contactez le support par le formulaire de contact.

### Activer la vérification en deux étapes (conseillé) <a id="activer-la-verification-en-deux-etapes"></a>

1. Installez une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP).
   - Remarque : Ces applications génèrent un code à 6 chiffres qui change toutes les 30 secondes.
2. Ouvrez **Sécurité** dans votre espace personnel.
   - Où : menu de gauche de l’espace personnel, ou menu de votre compte (initiales en haut à droite) > **Sécurité**
   - Résultat attendu : La page « Protéger mon compte » s’affiche avec le badge « Vérification en deux étapes inactive ».
3. Cliquez sur `Activer la vérification en deux étapes`.
   - Où : carte « Vérification en deux étapes »
   - Résultat attendu : Un QR code et une clé à saisir manuellement apparaissent (« Étape 1 »).
4. Scannez le QR code avec votre application (ou saisissez la clé manuellement).
   - Résultat attendu : L’application affiche un code à 6 chiffres pour « FETRAG ».
5. Saisissez le **Code à 6 chiffres affiché par l’application** puis cliquez sur `Confirmer et activer`.
   - Où : « Étape 2 »
   - Résultat attendu : Le badge passe à « Vérification en deux étapes active » et vos codes de secours s’affichent.
6. Copiez ou notez les codes de secours et rangez-les en lieu sûr.
   - Remarque : Ils sont affichés une seule fois. Chaque code de secours remplace le code de l’application une fois, si vous perdez votre téléphone.

> **Désactivation** : Désactiver la vérification en deux étapes demande un code de vérification ou un code de secours. Sans aucun des deux, seul le super administrateur peut réinitialiser la vérification de votre compte.

### Se déconnecter <a id="se-deconnecter"></a>

1. Ouvrez le menu de votre compte.
   - Où : vos initiales, en haut à droite du site (le back-office affiche aussi votre nom et votre rôle en bas du menu de gauche)
2. Cliquez sur **Déconnexion**.
   - Où : dernière ligne du menu de votre compte (le bouton affiche « Déconnexion en cours » pendant l’envoi)
   - Résultat attendu : Vous revenez au site public ; le menu affiche de nouveau **Connexion**.
3. Sur un appareil partagé (ordinateur d’une section, téléphone prêté), fermez aussi le navigateur.
   - Remarque : Les demandes contiennent des données personnelles : ne laissez jamais une session ouverte.

## 3. Se repérer dans le back-office <a id="se-reperer"></a>

*Le tableau de bord, le menu de navigation et leurs équivalents sur téléphone.*

### Écran : Le tableau de bord (« Bonjour {votre prénom} »)

La première page du back-office. Elle résume l’activité du site filtrée selon vos droits : vous n’y voyez ni chiffres financiers ni rapports.

- **Menu de gauche (ordinateur) ou tiroir de navigation (mobile)** : Les rubriques du back-office groupées par sections : « Pilotage », « Contenus », « Services », « Relations ». En bas : votre nom, votre email et la pastille de rôle « Responsable services ».
- **Barre du haut** : Le mot « Back-office », le titre de la page courante (« Catalogue », « Demandes », « Médias »…) et le lien « Voir le site » qui ouvre le site public dans un nouvel onglet (ce lien est masqué sur les petits écrans).
- **Tuiles de chiffres** : « Pages vues sur 30 jours », « Formulaires reçus sur 30 jours » (avec le nombre « à traiter ») et « Demandes de service en cours » (demandes Nouvelle, En examen et En traitement, avec le nombre de nouvelles). Deux tuiles par ligne sur mobile.
- **Carte « Contenus en relecture »** : Les contenus envoyés en relecture, y compris vos services en statut « En relecture » (type « Service »), avec un bouton « Relire ». Vide : « Rien à relire ».
- **Carte « Dernières demandes de service »** : Les six dernières demandes (service, référence, nom du demandeur, badge de statut) et le lien « Toutes les demandes ».
- **Carte « Messages reçus »** : Les six derniers messages des formulaires du site et le lien « Boîte de réception ».
- **Cartes « Audience du site », « Formulaires par type », « Contenus les plus consultés »** : Statistiques de consultation (sans cookie de suivi) et répartition des formulaires reçus. Utiles pour mesurer l’intérêt pour les services.

### Écran : Le menu de navigation

Sur ordinateur, le menu est toujours visible à gauche (fond marine). Sur téléphone, il est caché : ouvrez-le avec le bouton **Ouvrir la navigation** (icône à trois traits) en haut à gauche de la barre collante ; fermez-le avec le bouton **Fermer la navigation** (croix). Le tiroir se ferme tout seul quand vous changez de page.

- **Pilotage** : **Tableau de bord**.
- **Contenus** : **Pages**, **Actualités**, **Catégories**, **Ressources**, **Médias**, **FAQ**. Vous lisez les pages, actualités, ressources et FAQ ; vous agissez sur **Catégories** (domaine « Services ») et **Médias**.
- **Services** : **Catalogue** (vos services) et **Demandes** (les demandes à instruire). Le badge à côté de **Demandes** indique le nombre de demandes « Nouvelle » et « En examen ».
- **Relations** : **Événements** et **Partenaires et organisations** (lecture), **Messages reçus** (badge = messages « Nouveau ») et **Newsletter**.
- **Aide** : **Guide de mon rôle** : ce guide, accessible à tout moment (/admin/guide).
- **Pied du menu** : Votre nom, votre email, la pastille « Responsable services » et un lien « Coordination LMS » (affiché à tous les administrateurs mais inaccessible à votre rôle).

> **Sur téléphone** : Les tableaux cachent certaines colonnes pour tenir dans la largeur de l’écran ; le statut est alors rappelé sous le nom de la ligne. Vous pouvez faire glisser un tableau horizontalement avec le doigt. Les boutons de validation occupent toute la largeur.

Chemin vers le catalogue : Menu de gauche › Services › Catalogue (`/admin/services`)

Chemin vers les demandes : Menu de gauche › Services › Demandes (`/admin/demandes`)

*Messages généraux du back-office*

| Message | Signification | Que faire |
| --- | --- | --- |
| « Chargement de l’administration » | La page est en train de se charger. | Patientez quelques secondes. |
| « Élément introuvable » | Le service, la demande ou le contenu n’existe pas ou a été supprimé. | Cliquez sur « Retour au tableau de bord » et rouvrez l’élément depuis sa liste. |
| « Accès refusé » | La page est réservée à un autre rôle. | Revenez en arrière ; si la page vous est nécessaire, demandez le droit au super administrateur. |
| « Permission insuffisante » | Vous avez tenté une action que votre rôle n’autorise pas (par exemple enregistrer une actualité). | Aucune donnée n’a été modifiée. Confiez l’action à la personne compétente. |

## 4. Comment créer un service <a id="creer-un-service"></a>

*Décrire un service, fixer ses modalités et son tarif, composer son formulaire de demande.*

Un service est une fiche du catalogue public : un nom, un résumé, une description, des conditions d’accès, un tarif éventuel et le formulaire que remplira le demandeur. À la création, le service est un brouillon : il n’est visible que dans le back-office tant que vous ne le publiez pas.

Chemin : Menu de gauche › Services › Catalogue › Nouveau service (`/admin/services/nouveau`)

### Ouvrir le formulaire de création

1. Ouvrez **Catalogue** dans la section « Services ».
   - Où : menu de gauche ; sur mobile, bouton **Ouvrir la navigation**
   - Résultat attendu : La page « Catalogue des services » s’affiche.
2. Cliquez sur `Nouveau service`.
   - Où : en haut à droite de la page (sous le titre sur mobile)
   - Résultat attendu : La page « Nouveau service » s’ouvre avec quatre onglets : `Présentation`, `Modalités et tarif`, `Formulaire de demande`, `SEO`.

> **Préparez le contenu avant de saisir** : Faites valider par le Secrétariat général le nom du service, ses conditions d’accès, son tarif et le délai annoncé. Les informations saisies sont visibles par tous une fois le service publié.

### Onglet « Présentation » <a id="onglet-presentation"></a>

1. Saisissez le **Nom du service** (obligatoire, 2 à 160 caractères).
   - Remarque : Choisissez un nom compréhensible par tous : « Assistance juridique individuelle » plutôt qu’un sigle.
2. Renseignez l’**Icône lucide** (facultatif, 40 caractères maximum, lettres, chiffres et tirets).
   - Remarque : Exemples proposés par l’écran : scale, handshake, shield-check. L’icône apparaît dans la pastille colorée de la carte du service. Un nom inconnu provoque l’erreur « Nom d’icône lucide invalide ».
3. Rédigez le **Résumé** (facultatif, 500 caractères maximum).
   - Remarque : Il est affiché dans le catalogue, sur trois lignes au maximum. S’il est vide, un extrait est généré automatiquement depuis la description.
4. Rédigez la **Description détaillée** dans l’éditeur de texte (facultatif).
   - Résultat attendu : Sur la fiche publique, ce texte forme la section « En quoi consiste ce service ».
   - Remarque : La barre d’outils propose Gras, Italique, Souligné, Titre de niveau 2 et 3, listes, Citation, Séparateur, liens, images et tableaux. Les scripts et styles copiés depuis d’autres logiciels sont retirés à l’enregistrement.
5. Rédigez les **Conditions d’accès** (facultatif) : qui peut solliciter le service, pièces à fournir, délais.
   - Résultat attendu : Sur la fiche publique, ce texte forme l’encadré « Conditions ».
6. Choisissez une **Catégorie** (facultatif) parmi les catégories du domaine « Services », ou laissez « Sans catégorie ».
   - Remarque : Pour créer une nouvelle catégorie, voir « Comment gérer les catégories de services ».
7. Laissez le **Slug (adresse)** vide pour qu’il soit généré depuis le nom, ou saisissez-le (2 à 120 caractères, minuscules, chiffres et tirets).
   - Remarque : Le slug est la fin de l’adresse de la fiche publique : l’aide affiche « Aperçu : /services/{slug} ». Il doit être unique.
8. Renseignez l’**Ordre d’affichage** (facultatif, entier de 0 à 10 000, 0 par défaut).
   - Remarque : Les services sont classés du plus petit ordre au plus grand dans le catalogue public. C’est le seul moyen de les ordonner.

### Onglet « Modalités et tarif » <a id="onglet-modalites-et-tarif"></a>

1. Cliquez sur l’onglet `Modalités et tarif`.
   - Où : ligne d’onglets sous le titre ; sur mobile, faites défiler les onglets vers la droite
   - Résultat attendu : La carte « Modalités et tarif » s’affiche.
2. Laissez la case **Compte requis** cochée (par défaut) si le demandeur doit être connecté.
   - Remarque : Avec un compte, le demandeur suit sa demande dans son espace personnel. Sans compte, n’importe quel visiteur peut déposer une demande, mais il ne recevra que les emails et la fiche affichera « Sans compte ».
3. Cochez **Service payant** seulement si le service est facturé.
   - Résultat attendu : Les champs **Tarif (XAF)** et **Devise** apparaissent.
4. Si le service est payant, saisissez le **Tarif (XAF)** (obligatoire dans ce cas : nombre entier strictement positif, en francs CFA, sans centimes).
   - Remarque : Un tarif vide ou nul provoque l’erreur « Tarif requis » ou « Un service payant doit avoir un tarif strictement positif ». La **Devise** est XAF par défaut (3 lettres).
5. Renseignez le **Délai indicatif (jours)** (facultatif, entier de 0 à 365).
   - Remarque : Il est annoncé au public (« Réponse sous {n} jours ») et sert à calculer l’« Échéance » dans votre liste de demandes. Laissez vide si vous ne voulez pas annoncer de délai.

> **Service payant : conséquences** : Un service payant impose la connexion du demandeur et déclenche un paiement en ligne (Mobile Money ou carte) avant tout traitement. Une offre de paiement est créée automatiquement. Ne cochez cette case qu’avec l’accord du Secrétariat général et du service Finance.

### Onglet « Formulaire de demande » <a id="onglet-formulaire-de-demande"></a>

Les champs d’identité (nom complet, adresse email), de coordonnées (téléphone, organisation) et le message complémentaire sont toujours présents dans le formulaire public. Vous ajoutez ici uniquement les informations propres au service : matricule, employeur, nature du litige, nom d’une pièce à fournir…

1. Cliquez sur l’onglet `Formulaire de demande`.
   - Résultat attendu : La carte « Champs du formulaire de demande » s’affiche. Si elle est vide, un texte explique que le demandeur ne renseigne que son identité, ses coordonnées et un message.
2. Cliquez sur `Ajouter un champ`.
   - Résultat attendu : Une carte numérotée (01, 02…) apparaît avec les réglages du champ.
3. Saisissez le **Libellé** (obligatoire, 1 à 120 caractères) : la question telle que le demandeur la lira.
4. Vérifiez l’**Identifiant** (obligatoire, 40 caractères maximum : une lettre, puis lettres, chiffres et soulignés).
   - Remarque : C’est le nom technique du champ ; il sert à retrouver la réponse dans la demande et dans l’export. Un identifiant incorrect provoque l’erreur « Nom de champ invalide ».
5. Choisissez le **Type** : Texte court, Texte long, Adresse email, Téléphone, Nombre, Date, Liste de choix, Case à cocher ou Pièce jointe.
   - Remarque : Le type « Pièce jointe » ne permet pas d’envoyer un fichier : le demandeur indique seulement le nom du document, qui lui sera demandé plus tard.
6. Cochez **Obligatoire** si le demandeur ne peut pas déposer sa demande sans répondre.
7. Renseignez le **Texte indicatif** (facultatif, 160 caractères maximum) et l’**Aide** (facultatif, 300 caractères maximum).
   - Remarque : Le texte indicatif est l’exemple grisé dans le champ ; l’aide est la phrase affichée sous le champ.
8. Pour une **Liste de choix**, saisissez les **Options** séparées par des virgules (50 options maximum, 120 caractères chacune).
9. Ordonnez les champs avec les boutons **Monter** et **Descendre** ; retirez un champ avec **Supprimer le champ {libellé}**.
   - Où : boutons à icône en haut à droite de chaque carte de champ
   - Remarque : Un formulaire accepte 30 champs au maximum. Un formulaire court est plus souvent rempli jusqu’au bout, surtout sur téléphone.

### Onglet « SEO » (facultatif) <a id="onglet-seo"></a>

Le SEO (référencement) règle la façon dont la fiche apparaît dans les moteurs de recherche et lors d’un partage sur les réseaux. Tout est facultatif : par défaut, le titre et le résumé du service sont utilisés.

1. Cliquez sur l’onglet `SEO`.
   - Résultat attendu : La carte « Référencement » s’affiche.
2. Renseignez si besoin le **Titre SEO** (70 caractères maximum) et la **Méta-description** (200 caractères maximum).
3. Renseignez l’**Image de partage (Open Graph)** avec l’adresse d’une image de la médiathèque (1200 × 630 pixels recommandés).
   - Remarque : L’adresse doit commencer par http(s) ou par « / », sinon l’erreur « URL invalide (http(s) ou chemin relatif) » s’affiche.
4. Ne cochez **Exclure des moteurs de recherche (noindex)** que pour un service qui ne doit pas être trouvé par un moteur de recherche (il reste accessible par son adresse).

### Enregistrer le service <a id="enregistrer-le-nouveau-service"></a>

1. Cliquez sur `Créer le service`.
   - Où : en bas du formulaire (pleine largeur sur mobile) ; le bouton affiche « Enregistrement » pendant l’envoi
   - Résultat attendu : La fiche du service s’ouvre avec l’alerte verte « Le service a été créé en brouillon. Publiez-le pour l’afficher dans le catalogue public. »
2. Vérifiez le panneau « Publication » à droite (sous le formulaire sur mobile) : le badge indique « Brouillon ».
   - Résultat attendu : Le panneau affiche aussi l’« Adresse » de la fiche, le « Tarif », le nombre de « Demandes » et le nombre de champs du « Formulaire ».

- **Le message « Certains champs sont invalides. » s’affiche.** (cause probable : Un champ ne respecte pas ses règles (longueur, format, tarif manquant).) : Parcourez les quatre onglets : le champ fautif porte un message rouge. Corrigez puis cliquez de nouveau sur `Créer le service`.
- **« Ce slug est déjà utilisé ».** (cause probable : Un autre service (même archivé) porte la même adresse.) : Modifiez le **Slug (adresse)** ou videz-le pour qu’il soit généré à partir du nom.
- **« L’opération a échoué. Réessayez dans quelques instants. »** (cause probable : Problème de réseau ou incident passager.) : Attendez quelques instants puis réessayez. Si le problème persiste, signalez-le au support avec l’heure et le nom du service.

## 5. Comment publier un service dans le catalogue <a id="publier-un-service"></a>

*Faire passer un service de « Brouillon » à « Publié », le vérifier en ligne, et comprendre chaque statut.*

Seuls les services au statut « Publié » apparaissent sur la page publique des services et acceptent des demandes. Le passage d’un statut à l’autre se fait depuis le menu `Actions` de la fiche ou de la liste. Contrairement aux pages et actualités, un service ne peut pas être planifié à une date future.

1. Ouvrez la fiche du service depuis **Catalogue** (cliquez sur son nom).
   - Résultat attendu : La fiche s’ouvre avec le panneau « Publication ».
2. Relisez la fiche : nom, résumé, tarif, délai, formulaire.
   - Remarque : Le bouton « Prévisualiser » ne permet pas de voir la fiche publique d’un brouillon : la page publique ne charge que les services publiés et affiche « Ce service est introuvable ». Relisez donc directement dans le formulaire.
3. Si une seconde personne doit relire, cliquez sur `Actions` puis **Envoyer en relecture**.
   - Où : panneau « Publication », bouton `Actions` (menu déroulant)
   - Résultat attendu : Le message « « {nom} » a été envoyé en relecture. » apparaît ; le service est listé dans « Contenus en relecture » du tableau de bord (type « Service »).
4. Cliquez sur `Actions` puis **Publier**.
   - Où : panneau « Publication » de la fiche, ou bouton « Actions pour {nom} » à droite de la ligne dans le catalogue
   - Résultat attendu : Le message « « {nom} » a été publié. » apparaît et le badge passe à « Publié ».
5. Cliquez sur « Voir en ligne » pour vérifier la fiche telle que la voient les membres.
   - Où : panneau « Publication »
   - Résultat attendu : La fiche publique s’ouvre : nom, badge de tarif, « Réponse sous {n} jour(s) ouvré(s) », bouton « Déposer une demande ».
6. Sur téléphone, vérifiez aussi la carte du service dans la liste publique des services.
   - Remarque : Le catalogue public se met à jour immédiatement après la publication, et au plus tard toutes les 5 minutes.

### Les statuts d’un service

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Brouillon | Visible uniquement dans le back-office ; absent du catalogue public. | Complétez la fiche puis « Publier » ou « Envoyer en relecture ». |
| En relecture | Soumis à une seconde lecture ; toujours invisible du public ; listé dans « Contenus en relecture ». | « Publier » ou « Repasser en brouillon » pour corriger. |
| Publié | Visible dans le catalogue public et dans la recherche du site ; accepte des demandes. | Modifiez librement (changements immédiats), « Archiver » pour le retirer, « Repasser en brouillon » pour une refonte. |
| Archivé | Retiré du catalogue mais conservé avec ses demandes. | « Repasser en brouillon » puis « Publier » pour le remettre en ligne. |
| Planifié | Statut réservé aux pages et actualités : jamais proposé pour un service. | Aucune action. |

> **Retirer un service retire aussi le dépôt de demandes** : « Repasser en brouillon » ou « Archiver » un service publié le fait disparaître immédiatement du catalogue : plus personne ne peut déposer de demande tant qu’il n’est pas republié. Les demandes déjà déposées restent visibles dans **Demandes**.

- **« Transition « {statut} » vers « {statut} » non autorisée ».** (cause probable : Le passage demandé n’existe pas (par exemple « Archivé » vers « Publié » directement).) : Passez par « Repasser en brouillon » puis « Publier ».
- **Le service est « Publié » mais n’apparaît pas dans la liste publique.** (cause probable : La page publique n’a pas encore été rafraîchie, ou vous consultez une page gardée en mémoire par le navigateur.) : Rechargez la page. Après 5 minutes, si le service manque toujours, signalez-le au support avec le nom du service.
- **« Le contenu était déjà dans ce statut. »** (cause probable : Un collègue a effectué la même action juste avant vous.) : Rien à faire : rechargez la page pour voir le statut à jour.

## 6. Comment modifier, archiver ou supprimer un service <a id="modifier-archiver-supprimer-un-service"></a>

*Corriger une fiche publiée, la retirer temporairement ou la supprimer définitivement.*

### Modifier un service

1. Ouvrez **Catalogue** puis cliquez sur le nom du service (ou sur « Actions pour {nom} » puis **Modifier**).
   - Résultat attendu : La fiche s’ouvre avec les quatre onglets remplis.
2. Utilisez la barre de filtres pour retrouver un service : recherche « Nom ou résumé », listes **Statut**, **Catégorie**, **Tarif**, puis `Filtrer`.
   - Remarque : Le bouton `Réinitialiser` n’apparaît que si un filtre est actif. La liste affiche 20 services par page, classés par « Ordre d’affichage ».
3. Modifiez les champs voulus puis cliquez sur `Enregistrer le service`.
   - Où : en bas du formulaire
   - Résultat attendu : Le message « Service « {nom} » enregistré. » apparaît.
4. Si le service est publié, vérifiez la fiche publique avec « Voir en ligne ».
   - Remarque : Les modifications d’un service publié sont visibles immédiatement. Pour une refonte importante, passez d’abord le service en brouillon.

> **Passer de payant à gratuit, et inversement** : Décocher **Service payant** efface le tarif et désactive l’offre de paiement. Cocher **Service payant** sur un service gratuit exige un tarif strictement positif. Les demandes déjà déposées ne sont pas modifiées.

### Archiver un service (réversible)

1. Ouvrez la fiche puis cliquez sur `Actions` et **Archiver**.
   - Où : panneau « Publication »
   - Résultat attendu : « « {nom} » a été archivé. » : le service disparaît du catalogue public mais reste dans la liste avec le badge « Archivé ».
2. Pour le remettre en ligne, cliquez sur `Actions`, **Repasser en brouillon**, puis de nouveau `Actions` et **Publier**.
   - Résultat attendu : Le badge revient à « Publié ».

> **La suppression est définitive** : Un service supprimé disparaît pour toujours, avec son formulaire et ses réglages SEO. Préférez toujours « Archiver ». La suppression est de toute façon refusée si au moins une demande a été déposée sur le service.

### Supprimer un service (irréversible)

1. Ouvrez la fiche puis cliquez sur `Actions` et **Supprimer**.
   - Résultat attendu : Le dialogue « Supprimer « {nom} » ? » s’affiche avec l’avertissement « Cette action est définitive. »
2. Cliquez sur `Supprimer définitivement` pour confirmer, ou `Annuler` pour renoncer.
   - Résultat attendu : Le message « Élément supprimé. » apparaît et vous revenez au catalogue.

- **« Ce service a des demandes associées : archivez-le plutôt que de le supprimer ».** (cause probable : Au moins une demande a été déposée sur ce service ; les demandes doivent rester consultables.) : Utilisez `Actions` puis **Archiver**.
- **Le bouton `Enregistrer le service` répond « Permission insuffisante ».** (cause probable : Votre rôle « Responsable services » a été retiré ou votre session a expiré.) : Déconnectez-vous puis reconnectez-vous. Si le problème persiste, contactez le super administrateur.

## 7. Ce que voient les membres : la fiche publique et le dépôt d’une demande <a id="ce-que-voient-les-membres"></a>

*Comprendre le parcours du demandeur pour mieux rédiger vos fiches et répondre aux questions.*

### Écran : La page publique « Services »

Accessible depuis le menu **Services** du site. Elle liste uniquement les services publiés, classés par « Ordre d’affichage » puis par nom.

- **Cartes de service** : Icône dans une pastille colorée, badge « Gratuit » (vert) ou montant en XAF (or), nom, résumé, « Réponse sous {n} jours », « Compte requis » et le lien « Faire une demande ».
- **Section « Comment ça marche »** : Trois étapes : « Choisir un service », « Déposer la demande », « Suivre le traitement ». Le texte annonce que le responsable des services instruit la demande et que les services payants se règlent en ligne.
- **Bloc « Situation urgente ? »** : Bouton « Joindre la permanence » qui mène au formulaire de contact.
- **État vide** : Si aucun service n’est publié : « Le catalogue des services est en préparation » avec un lien « Nous contacter ».

### Écran : La fiche publique d’un service

Ouverte depuis une carte du catalogue. Sur téléphone, la colonne « En bref » et l’encadré « Conditions » passent sous le formulaire.

- **En-tête** : Badge de catégorie, badge de tarif, nom, résumé, mentions « Réponse sous {n} jour(s) ouvré(s) », « Compte FETRAG requis », « Paiement en ligne sécurisé », bouton « Déposer une demande ».
- **« En quoi consiste ce service »** : Votre **Description détaillée**.
- **Section « Déposer une demande »** : Le formulaire : « Vos coordonnées » (Nom complet, Adresse email, Téléphone, Organisation), « Informations sur votre demande » (vos champs), « Message complémentaire » (4 000 caractères maximum), case de consentement, bouton `Déposer ma demande` ou `Déposer et payer`.
- **Colonne « En bref »** : Tarif, Délai indicatif, Accès (« Compte FETRAG requis » ou « Ouvert à tous »), « Demandes traitées » (nombre total de demandes déposées), encadré « Conditions » (vos **Conditions d’accès**), boutons de partage, « Autres services ».

### Le parcours du demandeur (service gratuit)

Utile pour guider un membre par téléphone.

1. Le membre ouvre **Services** dans le menu du site puis clique sur le service voulu.
2. Si le service exige un compte et qu’il n’est pas connecté, il voit l’alerte « Compte FETRAG requis » et clique sur « Se connecter » (ou « Créer un compte »).
   - Résultat attendu : Après connexion, il revient automatiquement sur la fiche du service.
3. Il remplit « Vos coordonnées » (nom et email sont préremplis s’il est connecté), vos champs spécifiques et le « Message complémentaire ».
4. Il coche la case de consentement (obligatoire) puis clique sur `Déposer ma demande`.
5. Il voit le bloc « Demande enregistrée » avec le message « Votre demande « {service} » a été enregistrée sous la référence SRV-… Un accusé de réception vous a été envoyé par email. »
   - Résultat attendu : De votre côté, la demande apparaît en statut « Nouvelle » dans **Demandes** et vous recevez une notification interne.
6. Il suit l’avancement dans **Mes demandes** de son espace personnel : référence, service, date, statut, « Suivi par » (votre nom ou « En attente d’attribution »).

*Règles appliquées au formulaire public*

| Champ | Règle | Message d’erreur affiché au demandeur |
| --- | --- | --- |
| Nom complet | Obligatoire, 2 à 120 caractères. | « Champ obligatoire » |
| Adresse email | Obligatoire, adresse valide (mise en minuscules). | « Adresse email invalide » |
| Téléphone | Facultatif, 6 à 20 caractères (chiffres, espaces, +, parenthèses, tirets, points). | « Numéro de téléphone invalide » |
| Organisation | Facultatif, 160 caractères maximum. | — |
| Vos champs spécifiques | Obligatoires si cochés ; liste de choix limitée aux options ; nombre, date et email vérifiés ; 5 000 caractères maximum par champ. | « Champ obligatoire », « Valeur non autorisée », « Nombre attendu », « Date invalide », « Texte trop long » |
| Message complémentaire | Facultatif, 4 000 caractères maximum. | « Texte trop long » |
| Consentement | Obligatoire. | « Vous devez accepter le traitement de vos données. » |
| Nombre de dépôts | 5 demandes par heure et par compte (ou adresse Internet). | « Trop de demandes envoyées. Réessayez dans {délai}. » |

> **Quand un membre dit « je n’arrive pas à déposer ma demande »** : Demandez-lui le message affiché. « Ce service n’est plus disponible. » signifie que le service n’est plus publié ; « Connectez-vous pour déposer cette demande. » que le service exige un compte ; « Le formulaire est incomplet : vérifiez les champs signalés. » qu’un champ obligatoire est vide ou mal rempli.

## 8. Comment repérer et trier les demandes <a id="reperer-les-demandes"></a>

*Trouver les nouvelles demandes, filtrer la liste et lire les échéances.*

Chemin : Menu de gauche › Services › Demandes (`/admin/demandes`)

Quatre signaux vous indiquent qu’une demande attend : le badge à côté de **Demandes** dans le menu (demandes « Nouvelle » et « En examen »), la tuile « Nouvelles » (« À attribuer ») en haut de la liste, les lignes surlignées en jaune pâle dans le tableau, et la notification interne « Nouvelle demande de service » dans votre espace personnel.

1. Ouvrez **Demandes** dans la section « Services ».
   - Où : menu de gauche ; sur mobile, bouton **Ouvrir la navigation**
   - Résultat attendu : La page « Demandes de service » s’affiche : quatre tuiles, une barre de filtres, le tableau et le bouton `Exporter (CSV)`.
2. Lisez les tuiles : « Nouvelles » (à attribuer), « En examen ou en traitement », « Traitées » (avec le nombre de clôturées) et « Demandes ouvertes » (avec le nombre de refusées).
3. Pour retrouver une demande, saisissez sa référence, le nom, l’email ou l’organisation du demandeur dans le champ de recherche, puis cliquez sur `Filtrer`.
   - Où : barre de filtres au-dessus du tableau (champs empilés sur mobile)
4. Affinez avec les listes **Statut**, **Service** et **Responsable**.
   - Remarque : La liste **Responsable** propose « Mes demandes » pour ne voir que les demandes qui vous sont attribuées.
5. Cliquez sur le nom du service dans la colonne « Demande » pour ouvrir une demande.
   - Résultat attendu : La fiche de la demande s’ouvre.
6. Cliquez sur `Réinitialiser` pour revenir à la liste complète.
   - Remarque : La liste affiche 20 demandes par page, de la plus récente à la plus ancienne. Utilisez la pagination en bas.

*Les colonnes du tableau (certaines sont masquées sur téléphone)*

| Colonne | Contenu | Visible sur téléphone ? |
| --- | --- | --- |
| Demande | Nom du service (cliquable) et référence SRV-AAAA-XXXXXX ; le badge de statut y est rappelé sur mobile. | Oui |
| Demandeur | Nom, puis email et organisation. | Oui |
| Statut | Badge « Nouvelle », « En examen », « En traitement », « Traitée », « Refusée » ou « Clôturée ». | Non (rappelé sous le nom) |
| Échéance | Badge « {n} j restants » (vert), « Échéance aujourd’hui » ou « {n} j restant(s) » (orange à 2 jours ou moins), « Échéance dépassée de {n} j » (rouge). « — » si le service n’a pas de délai ou si la demande est terminée. | Non |
| Responsable | Nom de la personne attribuée ou « Non attribuée ». | Non |
| Déposée | Date relative (« il y a 2 jours ») ; la date exacte apparaît au survol. | Non |
| Paiement | « Commande liée » (payée), « En attente » (service payant non réglé) ou « Gratuit ». | Non |

> **L’échéance est indicative** : L’échéance est calculée en jours calendaires depuis la date de dépôt, à partir du « Délai indicatif (jours) » du service. Aucun rappel automatique n’est envoyé : consultez la liste régulièrement et triez mentalement par couleur (rouge d’abord).

- **Le tableau affiche « Aucune demande ».** (cause probable : Aucune demande ne correspond aux filtres, ou aucune demande n’a encore été déposée.) : Cliquez sur `Réinitialiser`. Si la liste reste vide, vérifiez que vos services sont bien « Publié ».
- **Je ne vois pas la colonne « Échéance » ou « Responsable ».** (cause probable : L’écran est trop étroit : ces colonnes sont masquées sur téléphone.) : Ouvrez la demande pour voir tous les détails, ou tournez le téléphone en mode paysage.

## 9. Comment instruire une demande <a id="instruire-une-demande"></a>

*Lire la demande, l’attribuer, changer son statut en informant le demandeur, garder une note interne.*

### Écran : La fiche d’une demande

Titre = nom du service ; sous-titre « Demande {référence} déposée le {date} par {nom} » ; grand badge de statut à droite (sous le titre sur mobile). Sur téléphone, les cartes sont empilées et les trois panneaux d’action apparaissent après l’historique.

- **Carte « Demandeur »** : Nom, « Compte : {email} » ou « Sans compte », email (cliquable pour écrire depuis votre messagerie), téléphone, organisation et le bloc « Message » rédigé par le demandeur.
- **Carte « Informations saisies »** : Les réponses aux champs spécifiques de votre formulaire (« — » si vide, « Oui » / « Non » pour une case à cocher). Absente si le service n’a pas de champ spécifique.
- **Carte « Paiement » (services payants)** : « Commande CMD-… · {montant} · payée le {date} » avec le statut de la commande, ou « Service payant ({montant}) : aucune commande réglée n’est encore associée. »
- **Carte « Historique »** : La frise des changements : « {ancien statut} → {nouveau statut} {date} » avec le commentaire transmis. Le dépôt crée toujours une première ligne vers « Nouvelle ».
- **Panneau « Attribution »** : Liste **Responsable** et bouton `Enregistrer l’attribution`.
- **Panneau « Changer le statut »** : Liste **Nouveau statut**, zone **Commentaire pour le demandeur** et bouton `Appliquer le statut`.
- **Panneau « Note interne »** : Zone **Note** et bouton `Enregistrer la note`. Visible uniquement par l’équipe des services.

> **Lien vers le compte du demandeur** : Le lien « Compte : {email} » mène à la fiche utilisateur, réservée à d’autres rôles : votre rôle obtient « Accès refusé ». Ce n’est pas une panne. Pour une question sur le compte du demandeur, adressez-vous au support ou au super administrateur.

### Attribuer la demande <a id="attribuer-une-demande"></a>

1. Ouvrez la demande depuis **Demandes** (ou depuis la notification « Nouvelle demande de service », ou depuis la carte « Dernières demandes de service » du tableau de bord).
   - Résultat attendu : La fiche s’affiche avec le badge « Nouvelle ».
2. Lisez la carte « Demandeur », le « Message » et les « Informations saisies ».
   - Remarque : Pour un service payant, vérifiez la carte « Paiement » : n’instruisez pas une demande dont le paiement est « En attente ».
3. Dans le panneau « Attribution », choisissez un **Responsable** (vous-même ou un collègue).
   - Où : colonne de droite sur ordinateur ; après l’historique sur mobile
   - Remarque : Seules les personnes ayant le rôle « Responsable services », « Support » ou « Super administrateur » peuvent être désignées. La liste affiche aussi des éditeurs, mais leur désignation est refusée.
4. Cliquez sur `Enregistrer l’attribution` (le bouton affiche « Attribution » pendant l’envoi).
   - Résultat attendu : « Demande {référence} attribuée à {nom}. » ; une demande « Nouvelle » passe automatiquement « En examen » et une ligne s’ajoute à l’« Historique ».
5. Si vous attribuez la demande à un collègue, prévenez-le : il reçoit seulement une notification interne « Demande de service attribuée », sans email.

- **« Le responsable désigné doit avoir le rôle Responsable services ou Support ».** (cause probable : La personne choisie est un éditeur ou n’a plus le rôle requis.) : Choisissez une autre personne de l’équipe des services ou du support.
- **« Vous n’avez pas accès à cette demande ».** (cause probable : Votre session a expiré ou votre rôle a changé.) : Reconnectez-vous ; si le message persiste, contactez le super administrateur.

### Faire avancer le statut et informer le demandeur <a id="changer-le-statut"></a>

Chaque changement de statut envoie un email au demandeur (sujet « Demande {référence} : {statut} ») avec votre commentaire. Le commentaire est aussi conservé dans l’« Historique ». C’est votre seul moyen de répondre par écrit depuis la plateforme : rédigez-le avec soin.

1. Dans le panneau « Changer le statut », choisissez le **Nouveau statut** (obligatoire).
   - Remarque : L’aide rappelle « Statut actuel : {statut} ». La liste ne propose que les passages autorisés.
2. Rédigez le **Commentaire pour le demandeur** (facultatif, 3 000 caractères maximum) : ce que vous avez compris, ce qu’il doit fournir, le prochain contact.
   - Remarque : Vouvoyez, saluez, signez au nom de la Fédération. N’y mettez aucune information sur une autre personne.
3. Cliquez sur `Appliquer le statut` (le bouton affiche « Mise à jour » pendant l’envoi).
   - Résultat attendu : « Demande {référence} mise à jour ; le demandeur est informé par email. » Le badge et l’« Historique » sont mis à jour.
4. Passez la demande « En traitement » dès que vous commencez à y travailler.
   - Résultat attendu : Le demandeur voit « En traitement » dans **Mes demandes** et reçoit l’email « Demande {référence} : En traitement ».
5. Quand la réponse est apportée, passez la demande « Traitée » avec un commentaire qui résume la réponse.
   - Remarque : Si un complément est nécessaire ensuite, « Traitée » peut revenir « En traitement ».
6. Si la demande est hors périmètre ou irrecevable, passez-la « Refusée » avec un commentaire courtois expliquant le motif et, si possible, une orientation (autre service, formulaire de contact).
   - Remarque : Une demande « Refusée » peut revenir « En examen » si de nouveaux éléments arrivent.
7. Quand plus aucun échange n’est attendu, passez la demande « Clôturée ».
   - Résultat attendu : Le panneau affiche « Cette demande est clôturée : aucune transition n’est possible. »

#### Les statuts d’une demande et les passages autorisés

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Nouvelle | Vient d’être déposée, personne ne s’en occupe encore. Comptée dans « À attribuer » et dans le badge du menu. | Attribuer (passe automatiquement « En examen »), ou passer « En traitement », « Refusée », « Clôturée ». |
| En examen | Attribuée à un responsable, ou paiement confirmé pour un service payant. L’équipe vérifie la recevabilité. | Passer « En traitement », « Traitée », « Refusée » ou « Clôturée ». |
| En traitement | Instruction en cours ; le demandeur en a été informé par email. | Passer « Traitée », « Refusée » ou « Clôturée ». |
| Traitée | La réponse a été apportée. N’entre plus dans le calcul d’échéance. | Passer « Clôturée », ou revenir « En traitement » pour un complément. |
| Refusée | Demande non recevable ou hors périmètre. Peut être supprimée. | Passer « Clôturée », ou revenir « En examen ». |
| Clôturée | Dossier fermé définitivement : plus aucun passage possible. Peut être supprimée (droit à l’effacement). | Aucune action, sauf suppression. |

> **« Clôturée » est définitif** : Une demande clôturée ne peut plus changer de statut. Si un échange est encore possible, préférez « Traitée » (réversible vers « En traitement ») ou « Refusée » (réversible vers « En examen »).

- **« Choisissez un statut » ou « Statut invalide. »** (cause probable : Aucun statut n’a été sélectionné dans la liste.) : Sélectionnez un **Nouveau statut** puis cliquez de nouveau sur `Appliquer le statut`.
- **« Transition « {statut} » vers « {statut} » non autorisée ».** (cause probable : Un collègue a changé le statut entre-temps, ou le passage n’existe pas.) : Rechargez la page et choisissez un statut proposé dans la liste.
- **Le demandeur dit ne pas avoir reçu l’email.** (cause probable : Email dans les indésirables, adresse mal saisie au dépôt, ou incident d’envoi.) : Demandez-lui de vérifier les indésirables. S’il a un compte, il retrouve le message dans **Notifications** de son espace. Sinon, écrivez-lui depuis votre messagerie en rappelant la référence.

### Garder une note interne <a id="note-interne"></a>

1. Dans le panneau « Note interne », rédigez la **Note** (facultatif, 5 000 caractères maximum) : vérifications faites, personnes contactées, décision prise.
   - Remarque : La note n’est jamais transmise au demandeur, mais elle est lue par toute l’équipe des services et du support : restez factuel et respectueux.
2. Cliquez sur `Enregistrer la note` (le bouton affiche « Enregistrement » pendant l’envoi).
   - Résultat attendu : « Note interne enregistrée. » La note remplace la précédente : reprenez son contenu si vous voulez le conserver.
3. Si le demandeur vous écrit par email, répondez depuis votre messagerie en citant la référence SRV, puis résumez l’échange dans la note.
   - Remarque : Les échanges par email ne sont pas enregistrés dans la plateforme : la note interne est le seul endroit où en garder la trace.

## 10. Comment suivre une demande sur un service payant <a id="demandes-payantes"></a>

*Comprendre le lien entre la demande, la commande et le paiement, et savoir vers qui orienter.*

Pour un service payant, le membre doit être connecté. Après avoir cliqué sur `Déposer et payer`, sa demande est créée en statut « Nouvelle », puis une commande (référence CMD-…) est créée et il est dirigé vers la page de paiement (Mobile Money ou carte). La demande n’est instruite qu’après confirmation du paiement.

1. Dans **Demandes**, regardez la colonne « Paiement » (ordinateur) ou ouvrez la demande et lisez la carte « Paiement » (téléphone).
   - Résultat attendu : « En attente » : aucun paiement confirmé ; « Commande liée » : le paiement est confirmé.
2. Tant que la carte affiche « Service payant ({montant}) : aucune commande réglée n’est encore associée. », attendez : ne passez pas la demande « En traitement ».
   - Remarque : Le demandeur peut régler plus tard depuis **Paiements et reçus** de son espace personnel.
3. Dès que le paiement est confirmé, la demande passe automatiquement de « Nouvelle » à « En examen » avec la ligne d’historique « Paiement reçu (CMD-…) ».
   - Résultat attendu : La carte « Paiement » affiche « Commande CMD-… · {montant} · payée le {date} » et le statut de la commande (« Payée »).
4. Attribuez-vous la demande et instruisez-la comme une demande gratuite.
5. En cas de question sur le paiement (double débit, paiement débité mais « En attente », remboursement), transmettez la référence de la demande et la référence CMD au service Finance.
   - Remarque : Le bouton « Voir la commande » n’apparaît pas pour votre rôle : vous ne voyez pas le détail des paiements.

### Statuts de commande affichés dans la carte « Paiement »

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Payée | Le paiement est confirmé ; la demande est instruite normalement. |  |
| En attente | Le paiement n’a pas encore été confirmé par l’opérateur. | Patienter ; au-delà d’une heure avec preuve de débit, orienter vers Finance. |
| Échouée / Annulée | Le paiement n’a pas abouti. | Le demandeur peut reprendre le paiement depuis son espace personnel. |
| Remboursée / Partiellement remboursée | Finance a remboursé tout ou partie du montant. | Clôturer la demande avec un commentaire si le service n’est pas rendu. |

- **Le membre a vu « Le paiement n’a pas pu être initié : vous pourrez le régler depuis votre espace personnel. »** (cause probable : Le passage vers la page de paiement a échoué au moment du dépôt ; la demande existe quand même.) : Indiquez-lui de régler depuis **Paiements et reçus** dans son espace personnel. La demande passera « En examen » à la confirmation.
- **Le membre a vu « Le paiement de ce service sera proposé depuis votre espace personnel. »** (cause probable : L’offre de paiement du service n’était pas disponible au moment du dépôt.) : Enregistrez de nouveau la fiche du service (cela resynchronise l’offre) puis prévenez le service Finance si le problème persiste.

## 11. Comment supprimer une demande (droit à l’effacement) <a id="supprimer-une-demande"></a>

*Effacer définitivement une demande clôturée ou refusée, à la demande de la personne concernée.*

Toute personne peut demander l’effacement de ses données. Vous pouvez supprimer une demande seulement si elle est « Clôturée » ou « Refusée ». Le support ne peut pas le faire : cette action est réservée à votre rôle.

> **Irréversible** : La suppression efface la demande, les informations saisies et tout son historique de statut. Seule une trace dans le journal d’audit (référence et statut) est conservée. Vérifiez la référence deux fois avant de confirmer.

1. Ouvrez la demande et vérifiez son statut dans le grand badge.
   - Remarque : Si elle n’est ni « Clôturée » ni « Refusée », le bouton de suppression n’apparaît pas : passez-la d’abord « Clôturée » avec `Appliquer le statut`.
2. Cliquez sur le bouton rouge « Supprimer la demande ».
   - Où : en bas de la colonne des panneaux d’action
   - Résultat attendu : Le dialogue « Supprimer la demande {référence} ? » s’affiche avec la mention « Suppression définitive (droit à l’effacement). »
3. Cliquez sur `Supprimer` pour confirmer, ou `Annuler`.
   - Résultat attendu : « Demande supprimée. » et retour à la liste des demandes.
4. Confirmez l’effacement à la personne depuis votre messagerie.

- **« Seules les demandes clôturées ou refusées peuvent être supprimées ».** (cause probable : Le statut a changé entre l’ouverture de la page et la confirmation.) : Rechargez la page, passez la demande « Clôturée », puis recommencez.

## 12. Comment exporter la liste des demandes <a id="exporter-les-demandes"></a>

*Produire un fichier tableur pour un bilan ou une réunion.*

Votre rôle n’a pas accès aux rapports du back-office. Les seuls indicateurs disponibles sont les tuiles de la page **Demandes**, celles du tableau de bord et l’export CSV (un fichier tableur lisible dans Excel ou LibreOffice).

1. Ouvrez **Demandes** et appliquez les filtres souhaités (statut, service, responsable, recherche).
   - Remarque : L’export respecte les filtres en cours. La recherche de l’export porte sur la référence, le nom et l’email (pas sur l’organisation).
2. Cliquez sur `Exporter (CSV)`.
   - Où : en haut à droite de la page (icône de téléchargement)
   - Résultat attendu : Un fichier nommé fetrag-demandes-de-service-{date}.csv se télécharge.
3. Ouvrez le fichier dans votre tableur.
   - Remarque : Colonnes : Référence, Service, Statut, Nom, Email, Téléphone, Organisation, Responsable, Créée le, Mise à jour le. Séparateur « ; ». 5 000 lignes au maximum : affinez les filtres pour les longues périodes.
4. Supprimez le fichier de l’appareil une fois le bilan terminé.
   - Remarque : Le fichier contient des données personnelles. Ne l’envoyez jamais par WhatsApp ni sur une messagerie non professionnelle. Chaque export est enregistré dans le journal d’audit.

- **Le message « L’export a échoué. » s’affiche.** (cause probable : Incident passager ou session expirée.) : Rechargez la page, reconnectez-vous si nécessaire et recommencez.
- **Les accents sont mal affichés dans le tableur.** (cause probable : Le tableur n’a pas reconnu l’encodage.) : Ouvrez le fichier via « Données » > « À partir d’un fichier texte » en choisissant l’encodage UTF-8 et le séparateur « ; ».

## 13. Comment gérer les catégories de services <a id="gerer-les-categories"></a>

*Créer et corriger les catégories qui classent vos services.*

Chemin : Menu de gauche › Contenus › Catégories (`/admin/categories`)

Les catégories classent tous les contenus du site (actualités, ressources, formations, services, événements). Vous voyez toutes les catégories, mais vous ne pouvez créer que des catégories du domaine « Services ». Vous pouvez modifier n’importe quelle catégorie ; vous ne pouvez ni en supprimer ni les réordonner (réservé à l’éditeur).

1. Ouvrez **Catégories** dans la section « Contenus ».
   - Résultat attendu : La page « Catégories » s’affiche avec un tableau (nom, domaine, utilisations, ordre).
2. Choisissez « Services » dans la liste **Domaine** puis cliquez sur `Filtrer`.
   - Résultat attendu : Seules les catégories de services sont affichées ; le domaine « Services » sera présélectionné à la création.
3. Cliquez sur `Nouvelle catégorie`.
   - Où : en haut à droite
   - Résultat attendu : Le dialogue « Nouvelle catégorie » s’ouvre.
4. Saisissez le **Nom** (obligatoire, 2 à 120 caractères).
5. Vérifiez que **Domaine** indique « Services ».
   - Remarque : Le dialogue propose tous les domaines, mais le serveur refuse toute création hors « Services » avec « Permission insuffisante ».
6. Renseignez si besoin la **Description** (500 caractères maximum), le **Slug** (généré si vide), la **Couleur** (format #RRGGBB, bleu de la charte par défaut) et l’**Ordre** (0 à 10 000).
7. Cliquez sur `Créer la catégorie`.
   - Résultat attendu : « Catégorie « {nom} » enregistrée. » ; le dialogue se ferme et la liste se rafraîchit.
8. Pour corriger une catégorie, cliquez sur **Modifier** sur sa ligne, changez les champs puis cliquez sur `Enregistrer`.
   - Où : bouton à droite de la ligne
9. Rattachez la catégorie à un service depuis l’onglet `Présentation` de sa fiche (liste **Catégorie**), puis `Enregistrer le service`.

- **« Permission insuffisante » à la création.** (cause probable : Le **Domaine** choisi n’est pas « Services ».) : Rouvrez le dialogue et choisissez « Services ».
- **Je veux supprimer une catégorie inutile.** (cause probable : La suppression est réservée à l’éditeur et refusée si la catégorie est utilisée.) : Retirez d’abord la catégorie des services concernés, puis demandez la suppression à l’éditeur.

## 14. Comment ajouter une image ou un document <a id="mediatheque"></a>

*Envoyer un fichier dans la médiathèque et l’utiliser dans la description d’un service.*

Chemin : Menu de gauche › Contenus › Médias (`/admin/medias`)

La médiathèque rassemble les fichiers réutilisables du site : images, documents, audio, vidéo. Chaque fichier a une adresse que vous pouvez coller dans un lien de la description ou des conditions d’un service. Les images insérées directement depuis l’éditeur de description sont rangées automatiquement dans le dossier « services ».

*Formats et tailles acceptés*

| Type | Formats | Taille maximale |
| --- | --- | --- |
| Images | JPEG, PNG, WebP, GIF, AVIF (le SVG est refusé) | 8 Mo |
| Documents | PDF, Word, Excel, PowerPoint, ODT, TXT, CSV | 25 Mo |
| Audio | MP3, MP4 audio, OGG, WAV, WebM | 60 Mo |
| Vidéo | MP4, WebM | 200 Mo |

### Envoyer un fichier

1. Ouvrez **Médias** dans la section « Contenus ».
   - Résultat attendu : La page « Médiathèque » affiche une grille de fichiers (une colonne sur téléphone).
2. Cliquez sur `Envoyer un fichier`.
   - Résultat attendu : Le dialogue « Envoyer un fichier » s’ouvre.
3. Choisissez le **Fichier** (obligatoire) sur votre appareil.
   - Remarque : Le dialogue indique « Images (12 Mo) » mais la limite réellement appliquée aux images est 8 Mo.
4. Indiquez le **Dossier** (facultatif, par exemple « services » : minuscules, chiffres, tirets).
5. Choisissez la **Visibilité** : « Public » (par défaut) ou « Privé (lien signé) ».
   - Remarque : Un fichier privé n’est accessible que par un lien temporaire (15 minutes par défaut) : réservez-le aux documents internes.
6. Pour une image, renseignez le **Texte alternatif** (300 caractères maximum) : une phrase qui décrit l’image pour les personnes malvoyantes.
7. Cliquez sur `Envoyer` (le bouton affiche « Envoi en cours »).
   - Résultat attendu : « « {nom} » envoyé. » et la page se recharge avec le nouveau fichier.
8. Cliquez sur **Copier l’URL** sur la carte du fichier (ou **Copier la clé** pour un fichier privé).
   - Résultat attendu : « URL copiée » : collez l’adresse dans un lien de la description ou des conditions du service.

### Insérer une image dans la description d’un service

1. Dans l’onglet `Présentation` de la fiche du service, placez le curseur dans la **Description détaillée** puis cliquez sur le bouton **Insérer une image** de la barre d’outils.
   - Résultat attendu : Le dialogue « Insérer une image » s’ouvre.
2. Saisissez d’abord le **Texte alternatif** (obligatoire).
   - Remarque : Le choix du fichier reste désactivé tant que ce champ est vide (« Renseignez d’abord le texte alternatif. »).
3. Choisissez le **Fichier image** (PNG, JPEG, WebP, GIF ou AVIF), ou collez une adresse dans **Ou URL de l’image** puis cliquez sur `Insérer par URL`.
   - Résultat attendu : L’image apparaît dans la description ; elle est stockée dans le dossier « services » de la médiathèque.
4. Cliquez sur `Enregistrer le service` pour conserver la modification.

> **Supprimer un fichier casse les liens** : Le dialogue « Supprimer « {fichier} » ? » prévient : « Les contenus qui l’utilisent afficheront un lien cassé. » Avant de supprimer, vérifiez qu’aucun service ni aucune page ne l’utilise.

- **« Le fichier dépasse la taille maximale de {n} Mo ».** (cause probable : Le fichier est trop lourd.) : Réduisez l’image (par exemple en la ré-enregistrant en JPEG ou WebP) ou compressez le document, puis réessayez.
- **« Type de fichier non autorisé ».** (cause probable : Le format n’est pas dans la liste (par exemple SVG, ZIP).) : Convertissez le fichier dans un format accepté.
- **« Copie impossible dans ce navigateur ».** (cause probable : Le navigateur bloque l’accès au presse-papiers.) : Ouvrez le fichier dans un nouvel onglet et copiez son adresse depuis la barre d’adresse.
- **La carte affiche « Texte alternatif manquant ».** (cause probable : L’image a été envoyée sans description.) : Cliquez sur **Modifier**, renseignez le **Texte alternatif**, puis `Enregistrer`.

## 15. Comment traiter un message reçu de type « Demande de service » <a id="messages-recus"></a>

*Répondre aux personnes qui ont écrit par le formulaire de contact plutôt que par le catalogue.*

Chemin : Menu de gauche › Relations › Messages reçus (`/admin/messages`)

Les formulaires du site (contact, assistance, adhésion, partenariat, demande de service) arrivent dans **Messages reçus** avec une référence MSG-AAAA-XXXXXX. Chaque expéditeur reçoit un accusé de réception annonçant une réponse sous 48 heures ouvrées. Les messages de type « Demande de service » vous sont notifiés en interne ; les autres types sont suivis par l’éditeur ou le support.

1. Ouvrez **Messages reçus** dans la section « Relations ».
   - Résultat attendu : La page affiche les tuiles « Nouveaux », « Attribués », « Répondus », « Clôturés », les filtres et le tableau (lignes « Nouveau » surlignées).
2. Choisissez « Demande de service » dans la liste **Type** puis cliquez sur `Filtrer`.
3. Cliquez sur un message pour l’ouvrir.
   - Résultat attendu : La fiche affiche l’expéditeur, le message, les « Informations complémentaires » et les panneaux « Traitement » et « Attribution ».
4. Dans « Attribution », choisissez-vous comme **Responsable** puis cliquez sur `Enregistrer`.
   - Résultat attendu : « Message attribué. » ; le statut passe « Attribué ».
5. Cliquez sur « Répondre par email » dans le panneau « Traitement ».
   - Résultat attendu : Votre messagerie s’ouvre avec l’objet « [FETRAG {référence}] Votre message ». Rédigez et envoyez la réponse depuis votre messagerie.
6. Si la demande relève d’un service du catalogue, invitez la personne à déposer une demande depuis la page **Services** du site : elle obtiendra une référence SRV et un suivi.
7. De retour sur la fiche, cliquez sur « Marquer répondu ».
   - Résultat attendu : « Message {référence} mis à jour. » ; la date de réponse est enregistrée.
8. Quand l’échange est terminé, cliquez sur « Clôturer ». Pour un courrier indésirable, cliquez sur « Indésirable ».
   - Remarque : « Remettre en nouveau » annule une prise en charge. Seuls les messages « Indésirable » ou « Clôturé » peuvent être supprimés (bouton « Supprimer le message », définitif).

### Statuts d’un message reçu

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Nouveau | Personne ne l’a encore pris en charge. | Attribuer. |
| Attribué | Une personne en est responsable. | Répondre par email puis « Marquer répondu ». |
| Répondu | Une réponse a été envoyée ; la date est enregistrée. | « Clôturer » quand l’échange est terminé. |
| Clôturé | Échange terminé. | Supprimable si nécessaire. |
| Indésirable | Courrier non sollicité. | Supprimable. |

> **Lettre d’information** : Le menu **Newsletter** vous montre les abonnés (« Confirmé », « En attente de confirmation », « Désinscrit ») et permet un export CSV des consentements. Ne supprimez un abonné qu’à sa demande explicite : l’adresse et son historique de consentement sont effacés définitivement.

- **« Seuls les messages indésirables ou clôturés peuvent être supprimés ».** (cause probable : Le message est encore « Nouveau », « Attribué » ou « Répondu ».) : Cliquez d’abord sur « Clôturer » ou « Indésirable ».
- **Le lien « compte {nom} » affiche « Accès refusé ».** (cause probable : La fiche utilisateur est réservée à d’autres rôles.) : Ce n’est pas une panne. Utilisez l’email affiché pour contacter la personne.

## 16. Consulter les autres contenus du site (lecture seule) <a id="consulter-les-contenus"></a>

*Ce que vous pouvez lire dans Pages, Actualités, Ressources, Événements, FAQ et Partenaires, et ce que vous ne pouvez pas y faire.*

Votre rôle vous permet de lire tous les contenus du site, y compris les brouillons, pour vérifier par exemple qu’une actualité annonce correctement un service. Vous ne pouvez rien y modifier : les boutons de création sont masqués et l’enregistrement répond « Permission insuffisante ».

1. Ouvrez **Pages**, **Actualités**, **Ressources** ou **FAQ** (section « Contenus »), ou **Événements** et **Partenaires et organisations** (section « Relations »).
   - Résultat attendu : La liste s’affiche avec ses filtres et ses statuts, sans bouton « Nouvelle… ».
2. Cliquez sur « Actions » à droite d’une ligne puis **Modifier** pour ouvrir la fiche en lecture, ou **Prévisualiser** pour voir la version publique.
   - Remarque : Le menu ne propose ni changement de statut ni suppression.
3. Ne cliquez pas sur le bouton d’enregistrement d’une fiche : il est affiché mais le serveur refuse (« Permission insuffisante »). Aucune donnée n’est modifiée.
4. Pour demander une correction, envoyez à l’éditeur le titre du contenu, la phrase à corriger et la phrase de remplacement.

*Pages du back-office refusées à votre rôle*

| Page | Pourquoi | À qui s’adresser |
| --- | --- | --- |
| Menus, création de pages / actualités / ressources / événements / partenaires | Réservé à l’éditeur. | Éditeur |
| Utilisateurs et rôles, Organisations, Paramètres, Journal d’audit | Réservé au super administrateur (et à certains rôles pour la lecture). | Super administrateur |
| Finance | Réservé au service Finance. | Finance |
| Rapports | Réservé aux rôles de pilotage. | Coordination ou super administrateur |
| « Coordination LMS » (lien en bas du menu) | Réservé à la coordination des formations. | Coordination |

## 17. Notifications et emails que vous recevez <a id="notifications"></a>

*Ce que la plateforme vous envoie, où le lire, et ce qu’il faut en faire.*

La plateforme ne vous envoie aucun email en tant que responsable des services : vous recevez uniquement des notifications internes, visibles dans **Notifications** de votre espace personnel (menu de votre compte, initiales en haut à droite). Le back-office n’affiche pas de cloche : prenez l’habitude d’ouvrir **Notifications** ou la page **Demandes** chaque jour.

*Notifications internes reçues par votre rôle*

| Titre | Déclencheur | Que faire |
| --- | --- | --- |
| « Nouvelle demande de service » | Un membre a déposé une demande sur un service publié. Corps : « {nom} - {service} ({référence}) ». | Ouvrir la notification (elle mène à la demande), attribuer et instruire. |
| « Demande de service attribuée » | Un collègue vous a attribué une demande. Corps : « La demande {référence} vous a été attribuée. » | Ouvrir la demande et la faire avancer. |
| « Nouveau message : Demande de service » | Un visiteur a utilisé le formulaire de contact avec le type « Demande de service ». | Ouvrir le message, l’attribuer, répondre par email et le marquer « Répondu ». |

*Emails envoyés au demandeur par vos actions*

| Sujet | Déclencheur | Contenu |
| --- | --- | --- |
| « Votre demande {référence} - {service} » | Dépôt de la demande (automatique). | Accusé de réception, délai indicatif s’il existe, bouton « Suivre ma demande ». Pour un service payant : « Elle sera traitée dès confirmation du paiement. » |
| « Demande {référence} : {statut} » | Chaque `Appliquer le statut`. | Référence, service, nouveau statut et votre « Commentaire pour le demandeur », bouton « Voir ma demande ». Une notification interne est aussi créée si le demandeur a un compte. |
| Aucun email | Attribution, note interne, paiement confirmé (le passage automatique « En examen » n’envoie pas d’email de statut). | Prévenez le demandeur vous-même si nécessaire lors du prochain changement de statut. |

### Lire et classer vos notifications

1. Ouvrez le menu de votre compte puis **Notifications** (ou **Mon espace** puis **Notifications** dans le menu de gauche).
   - Où : vos initiales, en haut à droite
   - Résultat attendu : La page « Vos notifications » s’affiche ; le badge du menu indique le nombre de non lues.
2. Cliquez sur une notification pour ouvrir la demande ou le message concerné.
3. Cliquez sur `Tout marquer comme lu` quand vous avez traité la liste.
   - Résultat attendu : Le filtre des non lues affiche « Aucune notification non lue ».

> **Pas de rappel automatique** : Aucune relance n’est envoyée quand une échéance approche ou est dépassée, et aucune notification n’est créée quand un service est envoyé en relecture ou publié. Organisez une revue quotidienne de la page **Demandes**.

## 18. Bonnes pratiques et sécurité <a id="bonnes-pratiques"></a>

*Délais, courtoisie, confidentialité et protection de votre compte.*

### Traitement des demandes

- [x] Attribuez chaque demande « Nouvelle » le jour même : le demandeur voit alors « Suivi par {votre nom} » au lieu de « En attente d’attribution ».
- [x] Passez « En traitement » dès que vous commencez et écrivez un commentaire même court : l’email rassure le demandeur.
- [x] Respectez le délai annoncé par le service ; si vous ne pouvez pas, dites-le au demandeur dans un commentaire avant l’échéance.
- [x] Ne promettez jamais un résultat (issue d’une médiation, d’un litige) : décrivez ce que la Fédération va faire.
- [x] Un refus s’explique toujours, avec courtoisie et une orientation (autre service, formulaire de contact, permanence).
- [x] Clôturez seulement quand plus aucun échange n’est attendu ; « Traitée » reste réversible, « Clôturée » ne l’est pas.
- [x] Notez dans « Note interne » toute vérification ou tout échange par email ou téléphone : c’est la mémoire du dossier pour vos collègues.

### Catalogue

- [x] Relisez chaque fiche sur téléphone avant de publier : c’est ainsi que la majorité des membres la liront.
- [x] Faites valider tarif, délai et conditions par le Secrétariat général avant publication ; un service payant engage aussi le service Finance.
- [x] Limitez le formulaire de demande aux informations indispensables et expliquez chaque champ avec l’**Aide**.
- [x] Préférez « Archiver » à « Supprimer » ; renseignez le texte alternatif de chaque image.

### Confidentialité et sécurité

- [x] Les demandes contiennent des données personnelles et syndicales (litiges, employeur, situation) : n’ouvrez que les dossiers dont vous avez la charge et n’en parlez qu’aux personnes concernées.
- [x] Ne recopiez jamais le contenu d’une demande dans WhatsApp, un SMS ou une messagerie personnelle ; utilisez la note interne et la messagerie professionnelle.
- [x] Dans un commentaire au demandeur, ne mentionnez aucune information sur une autre personne.
- [x] Activez la vérification en deux étapes et choisissez un mot de passe unique (au moins 8 caractères, une majuscule, un chiffre).
- [x] Déconnectez-vous sur tout appareil partagé et fermez le navigateur ; ne laissez pas votre téléphone déverrouillé avec le back-office ouvert.
- [x] Ne communiquez jamais votre mot de passe ni un code de vérification, même à un collègue ou à une personne se présentant comme le support.
- [x] Supprimez les exports CSV de votre appareil après usage.
- [x] Toutes vos actions (publication, attribution, statut, export, suppression) sont enregistrées dans le journal d’audit avec la date et l’appareil utilisé.

## 19. Questions fréquentes <a id="questions-frequentes"></a>

**Le bouton « Prévisualiser » affiche « Ce service est introuvable ». Est-ce normal ?**

Oui : la page publique n’affiche que les services publiés, et le mode de prévisualisation n’est pas pris en charge pour les services. Relisez la fiche dans le formulaire du back-office, ou publiez le service et utilisez « Voir en ligne ».

**Comment changer l’ordre des services dans le catalogue public ?**

Modifiez le champ **Ordre d’affichage** (onglet `Présentation`) de chaque service : les plus petits numéros apparaissent en premier, puis l’ordre alphabétique. Il n’existe pas de glisser-déposer.

**Puis-je répondre au demandeur sans changer le statut ?**

Non. Seul le « Commentaire pour le demandeur » lié à `Appliquer le statut` est envoyé par email. Pour un simple message, utilisez le lien email de la carte « Demandeur » depuis votre messagerie, puis résumez l’échange dans la « Note interne ».

**Le demandeur peut-il joindre un document (contrat, bulletin de paie) ?**

Pas depuis le formulaire : le type de champ « Pièce jointe » demande seulement le nom du document. Convenez ensuite avec le demandeur d’un mode d’envoi sûr (remise en main propre, messagerie professionnelle) et notez-le dans la note interne.

**Je ne trouve pas le bouton « Supprimer la demande ».**

Il n’apparaît que sur une demande « Clôturée » ou « Refusée ». Passez d’abord la demande dans l’un de ces statuts. Le support ne dispose pas de ce bouton.

**Pourquoi ne puis-je pas supprimer un service ?**

Parce qu’au moins une demande a été déposée sur ce service : les demandes doivent rester consultables. Utilisez « Archiver » : le service disparaît du catalogue mais ses demandes restent accessibles.

**Une demande payante reste « Nouvelle » depuis plusieurs jours.**

Le paiement n’a pas été confirmé (colonne « Paiement » = « En attente »). Le demandeur peut régler depuis « Paiements et reçus » de son espace personnel. S’il affirme avoir payé, transmettez la référence de la demande au service Finance : vous n’avez pas accès au détail des commandes.

**Je veux attribuer une demande à un éditeur et le serveur refuse.**

Seules les personnes ayant le rôle « Responsable services », « Support » ou « Super administrateur » peuvent instruire une demande. La liste affiche aussi les éditeurs, mais leur désignation est refusée. Demandez au super administrateur d’attribuer le bon rôle à la personne.

**Puis-je créer une catégorie « Actualités » pour un article qui parle des services ?**

Non : vous ne pouvez créer que des catégories du domaine « Services ». Demandez la catégorie à l’éditeur.

**Le tableau de bord parle d’« activité financière » mais je ne vois aucun chiffre.**

C’est normal : la tuile « Chiffre d’affaires » et les cartes financières sont réservées au service Finance. Votre tableau de bord affiche l’audience, les formulaires, les demandes et les contenus en relecture.

**Comment savoir qui a changé un statut et quand ?**

Ouvrez la demande : la carte « Historique » liste chaque passage avec la date et le commentaire. L’attribution figure aussi dans l’historique. Le journal d’audit complet est réservé au super administrateur.

**Que se passe-t-il si je repasse un service publié en brouillon ?**

Il disparaît immédiatement du catalogue public et plus personne ne peut déposer de demande. Les demandes déjà déposées restent visibles dans **Demandes**. Republiez-le avec `Actions` puis **Publier**.

## 20. Lexique <a id="lexique"></a>

- **Back-office** : La partie « Administration du site », réservée aux personnels de la Fédération, où l’on gère les contenus, les services et les demandes.
- **Catalogue des services** : La liste des services publiés, visible par tous sur la page **Services** du site ; dans le back-office, le menu **Catalogue** liste tous les services, quel que soit leur statut.
- **Brouillon** : Statut d’un service (ou d’un contenu) visible uniquement dans le back-office, absent du site public.
- **Relecture** : Statut intermédiaire d’un service soumis à une seconde lecture avant publication ; il reste invisible du public.
- **Publié** : Statut d’un service visible dans le catalogue public et acceptant des demandes.
- **Archivé** : Statut d’un service retiré du catalogue mais conservé avec ses demandes ; peut repasser en brouillon.
- **Slug (adresse)** : La fin de l’adresse Internet de la fiche publique (par exemple « assistance-juridique »), en minuscules, chiffres et tirets, unique pour chaque service.
- **Formulaire de demande** : Les questions posées au demandeur sur la fiche publique : les champs standards (identité, coordonnées, message) plus les champs spécifiques que vous composez.
- **Champ obligatoire / facultatif** : Un champ obligatoire doit être rempli pour valider un formulaire (marqué d’un astérisque) ; un champ facultatif peut rester vide.
- **Référence SRV** : Identifiant unique d’une demande de service, de la forme SRV-AAAA-XXXXXX, rappelé dans tous les emails et dans l’espace personnel du demandeur.
- **Référence MSG** : Identifiant unique d’un message reçu par un formulaire du site, de la forme MSG-AAAA-XXXXXX.
- **Référence CMD** : Identifiant d’une commande (paiement en ligne) liée à une demande sur un service payant.
- **Attribution** : Désignation de la personne responsable d’une demande ; une demande « Nouvelle » attribuée passe automatiquement « En examen ».
- **Transition (passage de statut)** : Le changement d’un statut à un autre ; seuls certains passages sont autorisés (par exemple « Clôturée » n’en autorise aucun).
- **Commentaire pour le demandeur** : Texte saisi lors d’un changement de statut, envoyé par email au demandeur et conservé dans l’historique (3 000 caractères maximum).
- **Note interne** : Texte visible uniquement par l’équipe des services et du support, jamais transmis au demandeur (5 000 caractères maximum).
- **Échéance** : Date de dépôt plus le délai indicatif du service, en jours calendaires ; affichée en vert, orange (2 jours ou moins) ou rouge (dépassée). Purement indicative.
- **Délai indicatif** : Nombre de jours annoncé au public (« Réponse sous {n} jours ») pour un service ; ce n’est pas un engagement contractuel.
- **Droit à l’effacement** : Le droit de toute personne à demander la suppression de ses données ; il justifie la suppression d’une demande clôturée ou refusée.
- **Médiathèque** : L’espace de stockage des fichiers du site (images, documents, audio, vidéo), avec leur adresse et leur texte alternatif.
- **Texte alternatif** : Courte description d’une image lue par les lecteurs d’écran des personnes malvoyantes et affichée si l’image ne se charge pas.
- **SEO (référencement)** : Réglages qui déterminent comment une page apparaît dans les moteurs de recherche et lors d’un partage : titre, description, image de partage, exclusion (noindex).
- **Export CSV** : Fichier tableur (colonnes séparées par « ; ») contenant la liste filtrée des demandes, lisible dans Excel ou LibreOffice ; 5 000 lignes maximum.
- **Vérification en deux étapes** : Un code temporaire à 6 chiffres, généré par une application d’authentification, demandé en plus du mot de passe à chaque connexion.
- **Codes de secours** : Codes à usage unique remis lors de l’activation de la vérification en deux étapes, pour se connecter si le téléphone n’est plus disponible.
- **Journal d’audit** : Registre des actions importantes (publication, attribution, changement de statut, export, suppression) avec leur auteur, leur date et l’appareil utilisé.
- **Notification interne** : Message affiché dans **Notifications** de votre espace personnel (sans email), par exemple « Nouvelle demande de service ».

## 21. Besoin d’aide ? <a id="besoin-d-aide"></a>

*À qui s’adresser selon le problème, et quoi indiquer dans votre message.*

*Qui contacter*

| Votre problème | À qui s’adresser | Comment |
| --- | --- | --- |
| Connexion impossible, email non reçu, page en erreur, bouton qui ne répond pas | Support | Formulaire de contact du site (type « Assistance »). |
| Rôle manquant, « Accès refusé » sur une page dont vous avez besoin, réinitialisation de la vérification en deux étapes | Super administrateur | Formulaire de contact (objet « Demande de droits d’accès ») ou le Secrétariat général. |
| Paiement d’un service payant (double débit, paiement non confirmé, remboursement) | Service Finance | Transmettez la référence SRV et la référence CMD. |
| Correction d’une page, d’une actualité ou de la FAQ qui parle des services ; suppression d’une catégorie | Éditeur | Indiquez le titre du contenu et la correction souhaitée. |
| Décision de fond : nouveau service, tarif, refus sensible, demande d’effacement | Secrétariat général | Par les coordonnées ci-dessous. |
| Question sur une formation ou sur la plateforme de formation | Coordination des formations | Depuis la plateforme de formation. |

### Coordonnées de la Fédération

- [Formulaire de contact du site](/contact) : Le moyen le plus simple pour joindre le support : chaque message reçoit une référence et un accusé de réception.
- [Écrire au Secrétariat général](mailto:jossngomafm@gmail.com) : jossngomafm@gmail.com
- [Appeler la Fédération](tel:+24166230033) : 066 23 00 33 ou 077 52 27 98
- [Adresse postale](/contact) : BP 1234 Libreville, Gabon

### Ce qu’il faut indiquer dans un message d’aide

- [x] L’adresse email de votre compte (jamais votre mot de passe).
- [x] L’écran concerné (par exemple « Demandes », « fiche du service Assistance juridique ») et l’appareil utilisé (téléphone ou ordinateur, navigateur).
- [x] La référence de la demande (SRV-…), du message (MSG-…) ou le nom du service.
- [x] Le message d’erreur exact, recopié tel qu’il est affiché, et l’heure approximative.
- [x] Ce que vous avez déjà essayé (recharger la page, se reconnecter).

> **Guides utiles** : Le guide du membre décrit l’espace personnel (profil, notifications, sécurité) que vous utilisez aussi. Sur la plateforme de formation, votre rôle n’a pas d’espace particulier : le guide de l’apprenant s’applique.

## Testez votre maîtrise <a id="autoevaluation"></a>

Dix-neuf questions pour vérifier que vous savez publier un service, instruire une demande et à qui vous adresser. Comptez dix minutes ; le corrigé renvoie à la section du guide concernée. Seuil de maîtrise : 70 % de bonnes réponses. 19 questions.

1. Que pouvez-vous faire avec le rôle « Responsable services » ? *(plusieurs réponses possibles)*
   - a) Créer, publier et archiver un service du catalogue.
   - b) Publier une actualité qui annonce un nouveau service.
   - c) Attribuer une demande et changer son statut.
   - d) Voir le détail d’une commande payée.

2. Après la connexion, comment ouvrez-vous le back-office ? *(une seule réponse)*
   - a) Depuis le menu de mon compte (mes initiales, en haut à droite), lien **Administration du site**.
   - b) Depuis le lien **Plateforme de formation** du menu de mon compte.
   - c) Depuis la page **Services** du site public.

3. Sur téléphone, où se trouve le menu de navigation du back-office ? *(une seule réponse)*
   - a) Toujours visible à gauche de l’écran.
   - b) Derrière le bouton **Ouvrir la navigation** (trois traits), en haut à gauche.
   - c) En bas de chaque page, après le tableau.

4. Un service payant peut être créé sans renseigner de tarif : le tarif sera demandé plus tard. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

5. Un service est en statut « Archivé ». Comment le remettre dans le catalogue public ? *(une seule réponse)*
   - a) `Actions` puis **Publier** directement.
   - b) `Actions` puis **Repasser en brouillon**, puis `Actions` et **Publier**.
   - c) `Actions` puis **Planifier la publication**.

6. La suppression d’un service affiche « Ce service a des demandes associées : archivez-le plutôt que de le supprimer ». Que faites-vous ? *(une seule réponse)*
   - a) Je supprime d’abord toutes les demandes puis je recommence.
   - b) J’utilise `Actions` puis **Archiver** : le service quitte le catalogue mais ses demandes restent consultables.
   - c) Je demande au support de forcer la suppression.

7. Un membre voit le message « Ce service n’est plus disponible. » en déposant sa demande. Quelle est la cause la plus probable ? *(une seule réponse)*
   - a) Le service n’est plus en statut « Publié ».
   - b) Le membre a dépassé 5 demandes dans l’heure.
   - c) Le membre n’a pas coché la case de consentement.

8. Dans la liste des demandes, que signifie un badge rouge « Échéance dépassée de 3 j » ? *(une seule réponse)*
   - a) La demande a été clôturée depuis 3 jours.
   - b) Le délai indicatif du service est dépassé de 3 jours calendaires depuis le dépôt ; aucun rappel n’a été envoyé.
   - c) Le demandeur a 3 jours pour payer.

9. Attribuer une demande « Nouvelle » à un responsable la fait passer automatiquement « En examen ». *(vrai ou faux)*
   - a) Vrai
   - b) Faux

10. Vous voulez informer le demandeur par écrit depuis la plateforme. Quel est le seul moyen ? *(une seule réponse)*
   - a) Le **Commentaire pour le demandeur** saisi avec `Appliquer le statut` : il est envoyé par email.
   - b) La **Note interne** : elle est envoyée au demandeur à l’enregistrement.
   - c) Le bouton **Envoyer un message** de la carte « Demandeur ».

11. Quel statut de demande est définitif (aucun passage possible ensuite) ? *(une seule réponse)*
   - a) « Traitée »
   - b) « Refusée »
   - c) « Clôturée »

12. Une demande sur un service payant affiche « En attente » dans la colonne « Paiement ». Que faites-vous ? *(une seule réponse)*
   - a) Je la passe « En traitement » pour ne pas perdre de temps.
   - b) J’attends la confirmation du paiement : la demande passera automatiquement « En examen ».
   - c) Je la supprime, car le demandeur n’a pas payé.

13. Dans quels statuts le bouton « Supprimer la demande » est-il proposé ? *(plusieurs réponses possibles)*
   - a) « Nouvelle »
   - b) « Refusée »
   - c) « Clôturée »
   - d) « Traitée »

14. Un export CSV des demandes peut être partagé dans un groupe WhatsApp de l’équipe pour gagner du temps. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

15. La création d’une catégorie répond « Permission insuffisante ». Quelle est la cause la plus probable ? *(une seule réponse)*
   - a) Le **Domaine** choisi n’est pas « Services ».
   - b) Le **Nom** dépasse 120 caractères.
   - c) La **Couleur** n’est pas au format #RRGGBB.

16. Quelle taille maximale est réellement appliquée à une image envoyée dans la médiathèque ? *(une seule réponse)*
   - a) 8 Mo
   - b) 12 Mo
   - c) 25 Mo

17. Comment répondez-vous à un message reçu de type « Demande de service » ? *(une seule réponse)*
   - a) Depuis ma messagerie, via « Répondre par email », puis je clique sur « Marquer répondu ».
   - b) En saisissant ma réponse dans le panneau « Traitement » qui l’envoie automatiquement.
   - c) En changeant le statut du message en « Clôturé », ce qui envoie un email.

18. Où lisez-vous la notification « Nouvelle demande de service » ? *(une seule réponse)*
   - a) Dans une cloche en haut du back-office.
   - b) Dans **Notifications** de mon espace personnel (menu de mon compte).
   - c) Dans un email envoyé à mon adresse.

19. Un demandeur affirme avoir payé deux fois un service payant. À qui transmettez-vous le dossier ? *(une seule réponse)*
   - a) Au service Finance, avec la référence SRV et la référence CMD.
   - b) À l’éditeur, pour corriger la fiche du service.
   - c) Au super administrateur, pour supprimer la demande.

### Corrigé

1. **a, c** : Les actualités relèvent de l’éditeur et les commandes du service Finance : voir « Votre rôle en bref ».
2. **a** : Le lien **Administration du site** n’apparaît que si votre compte a un rôle d’administration : voir « Se connecter ».
3. **b** : Le menu devient un tiroir qui s’ouvre avec le bouton à trois traits et se ferme au changement de page : voir « Se repérer dans le back-office ».
4. **b** : Un service payant exige un **Tarif (XAF)** entier strictement positif, sinon l’erreur « Tarif requis » s’affiche : voir « Onglet « Modalités et tarif » ».
5. **b** : Le passage « Archivé » vers « Publié » n’existe pas et la planification n’est pas proposée pour un service : voir « Comment publier un service dans le catalogue ».
6. **b** : Les demandes doivent rester consultables ; l’archivage est la bonne réponse : voir « Comment modifier, archiver ou supprimer un service ».
7. **a** : Seuls les services publiés acceptent des demandes ; la limite horaire et le consentement ont leurs propres messages : voir « Ce que voient les membres ».
8. **b** : L’échéance est calculée depuis la date de dépôt et le « Délai indicatif (jours) » ; elle est purement indicative : voir « Comment repérer et trier les demandes ».
9. **a** : Le panneau « Attribution » le rappelle : une demande nouvelle passe en examen dès qu’elle est attribuée : voir « Attribuer la demande ».
10. **a** : La note interne n’est jamais transmise et il n’existe pas de messagerie interne : voir « Faire avancer le statut et informer le demandeur ».
11. **c** : « Traitée » peut revenir « En traitement » et « Refusée » peut revenir « En examen » ; seule « Clôturée » est terminale : voir « Faire avancer le statut et informer le demandeur ».
12. **b** : Une demande payante n’est instruite qu’après paiement confirmé (« Paiement reçu (CMD-…) ») : voir « Comment suivre une demande sur un service payant ».
13. **b, c** : Seules les demandes clôturées ou refusées peuvent être supprimées, et la suppression est irréversible : voir « Comment supprimer une demande (droit à l’effacement) ».
14. **b** : Le fichier contient des données personnelles : messagerie professionnelle uniquement, puis suppression de l’appareil : voir « Comment exporter la liste des demandes ».
15. **a** : Votre rôle ne crée que des catégories du domaine « Services » ; les erreurs de format affichent « Certains champs sont invalides. » : voir « Comment gérer les catégories de services ».
16. **a** : Le dialogue annonce 12 Mo mais la limite appliquée aux images est 8 Mo ; 25 Mo concerne les documents : voir « Comment ajouter une image ou un document ».
17. **a** : Aucune réponse n’est envoyée depuis la plateforme : la réponse part de votre messagerie : voir « Comment traiter un message reçu de type « Demande de service » ».
18. **b** : Le responsable des services ne reçoit aucun email et le back-office n’a pas de cloche : voir « Notifications et emails que vous recevez ».
19. **a** : Vous ne voyez pas le détail des commandes ; les paiements relèvent de Finance : voir « Besoin d’aide ? ».

## Guides liés

- [Guide du membre](/espace/guide) : Votre compte, votre espace personnel, vos notifications et la sécurité de votre compte.
- [Guide de l’apprenant](https://formation.fetrag.ga/guide) : Suivre une formation sur la plateforme de formation avec le même compte.
