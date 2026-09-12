import type { Guide } from '@fetrag/contracts'

/**
 * Guide de l’éditeur communication (site institutionnel, rôle EDITOR).
 *
 * Périmètre : back-office /admin - pages (éditeur de blocs), actualités (éditeur de texte riche),
 * catégories, ressources documentaires, médiathèque, menus, FAQ, événements et participants,
 * partenaires, messages reçus, lettre d’information, rapports ; cycle de publication (brouillon,
 * relecture, planifié, publié, archivé), versions des pages, SEO ; vérification en deux étapes exigée.
 * Les libellés, statuts, limites et messages sont ceux du code (formulaires, transitions, validations).
 */
export const webEditeur: Guide = {
  id: 'web-editeur',
  platform: 'web',
  role: 'EDITOR',
  title: 'Guide de l’éditeur communication',
  subtitle: 'Publier et animer le site institutionnel : pages, actualités, ressources, agenda, partenaires et messages reçus',
  audience:
    'Les personnes de la Fédération chargées de la communication et disposant du rôle « Éditeur communication » sur le site institutionnel : rédaction des actualités et des communiqués, mise à jour des pages, dépôt des documents, agenda des événements, partenaires, questions fréquentes et suivi des messages reçus.',
  summary:
    'Avec le rôle « Éditeur communication », vous rédigez, relisez et publiez vous-même les contenus du site institutionnel : pages, actualités, ressources documentaires, événements, questions fréquentes et partenaires. Vous alimentez la médiathèque, classez les contenus par catégories et suivez les messages envoyés depuis les formulaires du site ainsi que les abonnés à la lettre d’information. Ce guide décrit chaque écran du back-office, le cycle de publication (brouillon, relecture, planifié, publié, archivé) et les bonnes pratiques éditoriales et de sécurité.',
  tone: 'blue',
  icon: 'newspaper',
  readingMinutes: 55,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée (le lien de confirmation est envoyé par email à la création du compte).',
    'Le rôle « Éditeur communication », attribué par le super administrateur (sans ce rôle, la page « Accès refusé » s’affiche).',
    'Une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP) : la vérification en deux étapes est exigée pour votre rôle.',
    'Un ordinateur ou un téléphone connecté à Internet. Sur ordinateur, les tableaux affichent plus de colonnes et l’éditeur de texte est plus confortable ; sur téléphone, tout reste faisable.',
    'Les textes, images et documents validés par le Secrétariat général avant leur mise en ligne.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'page **Connexion**, bouton en bas du formulaire',
      result: 'Votre espace personnel s’ouvre.',
    },
    {
      text: 'Activez la vérification en deux étapes depuis **Sécurité** si ce n’est pas déjà fait.',
      where: 'menu de votre compte (vos initiales, en haut à droite) > **Sécurité**',
      result: 'Le badge « Vérification en deux étapes active » s’affiche et vos codes de secours apparaissent une seule fois.',
    },
    {
      text: 'Ouvrez le menu de votre compte puis choisissez **Administration du site**.',
      where: 'vos initiales, en haut à droite du site',
      result: 'Le tableau de bord du back-office s’affiche avec le message « Bonjour {votre prénom} ».',
    },
    {
      text: 'Ouvrez **Actualités** dans la section « Contenus » du menu, puis cliquez sur `Nouvelle actualité`.',
      where: 'menu de gauche sur ordinateur ; sur mobile, bouton **Ouvrir la navigation** (trois traits) en haut à gauche',
      result: 'Le formulaire « Nouvelle actualité » s’affiche avec les onglets `Contenu`, `Classement et image` et `SEO`.',
    },
    {
      text: 'Rédigez le titre et le texte, puis cliquez sur `Créer l’actualité`.',
      where: 'bouton en bas à droite du formulaire (pleine largeur sur mobile)',
      result: 'Le bandeau vert « L’actualité a été créée en brouillon… » s’affiche sur la fiche de l’actualité.',
    },
    {
      text: 'Publiez depuis le panneau « Publication » avec `Actions` puis `Publier`.',
      where: 'panneau à droite du formulaire sur ordinateur, sous le formulaire sur mobile',
      result: 'Le message « « {titre} » a été publié. » apparaît et l’actualité est visible sur le site.',
    },
  ],
  sections: [
    // -------------------------------------------------------------------------
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'newspaper',
      summary: 'Ce que le rôle « Éditeur communication » vous permet de faire, ce qu’il ne permet pas, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le rôle « Éditeur communication » vous donne accès au back-office du site (la partie « Administration du site », réservée aux personnels de la Fédération). Vous y rédigez et publiez tout ce que les visiteurs lisent : pages institutionnelles, actualités et communiqués, documents à télécharger, agenda des événements, questions fréquentes, logos des partenaires. Vous êtes à la fois rédacteur, relecteur et responsable de la publication : aucune autre validation technique n’est demandée par le site, mais la validation de fond revient au Secrétariat général.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Créer, modifier, envoyer en relecture, planifier, publier, archiver et supprimer des pages et des actualités (menus **Pages** et **Actualités**).',
            'Restaurer une version précédente d’une page (carte « Versions »).',
            'Déposer des ressources documentaires (guides, textes juridiques, rapports, formulaires, vidéos) et fixer leur niveau d’accès (menu **Ressources**).',
            'Envoyer, décrire et supprimer des fichiers dans la médiathèque (menu **Médias**).',
            'Créer et modifier les catégories de tous les domaines, et supprimer celles qui ne sont plus utilisées (menu **Catégories**).',
            'Modifier les arborescences des quatre menus du site et de la plateforme de formation (menu **Menus**).',
            'Rédiger, masquer et supprimer les questions fréquentes (menu **FAQ**).',
            'Programmer des événements, suivre les inscrits, marquer les présences et exporter la liste des participants (menu **Événements**).',
            'Ajouter, masquer et supprimer des partenaires et organisations affiliées (menu **Partenaires et organisations**).',
            'Lire et traiter les messages envoyés depuis les formulaires du site, les attribuer et les exporter (menu **Messages reçus**).',
            'Consulter et exporter la liste des abonnés à la lettre d’information, supprimer un abonné à sa demande (menu **Newsletter**).',
            'Consulter les indicateurs d’audience du site et exporter des rapports (menu **Rapports**).',
            'Consulter le catalogue des services en lecture, et publier ou archiver un service déjà rédigé par le responsable des services (menu **Catalogue**).',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire',
          style: 'bullet',
          items: [
            'Créer, modifier ou supprimer un service du catalogue : la fiche s’ouvre en lecture seule avec le bandeau « Vous consultez ce service en lecture seule : seule l’équipe des services peut le modifier. »',
            'Traiter les demandes de service (menu **Demandes**, réservé au responsable des services et au support).',
            'Voir les utilisateurs, les organisations, la finance, le journal d’audit ou les paramètres : ces pages affichent « Accès refusé ».',
            'Ouvrir les espaces de coordination de la plateforme de formation : les boutons `Coordination LMS` et `Rapports détaillés du LMS` mènent à une page « Accès refusé » pour votre rôle.',
            'Envoyer une lettre d’information ou un email groupé depuis le back-office : seule la liste des abonnés est gérée (voir la section « Newsletter »).',
            'Répondre à un message reçu depuis le site : la réponse part de votre messagerie habituelle (bouton `Répondre par email`).',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait pour vous', 'Quand le solliciter'],
          rows: [
            ['Secrétariat général', 'Valide le fond des textes officiels, des communiqués et des prises de position.', 'Avant de publier un communiqué, une page institutionnelle ou un texte juridique (mentions légales, confidentialité).'],
            ['Responsable services', 'Rédige les fiches du catalogue des services ; traite les demandes de service.', 'Pour annoncer un nouveau service sur le site, ou quand un message reçu est en réalité une demande de service.'],
            ['Support', 'Aide les membres qui ont un problème de compte ; traite les messages de type « Assistance ».', 'Quand un message reçu concerne un problème de connexion ou de compte.'],
            ['Coordination formation', 'Gère la plateforme de formation, ses cours et ses sessions ; partage avec vous les catégories du domaine « Formations ».', 'Pour publier une actualité sur une formation ou un événement de type « Formation ».'],
            ['Finance', 'Suit les paiements des ressources « Premium » et des événements payants.', 'Quand un participant signale un problème de paiement.'],
            ['Super administrateur', 'Attribue les rôles, gère les comptes et les paramètres du site.', 'Pour obtenir un droit manquant, réinitialiser votre vérification en deux étapes ou créer le compte d’un collègue.'],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte, connexion et vérification en deux étapes',
      icon: 'log-in',
      summary: 'Se connecter, retrouver un mot de passe oublié, activer la vérification en deux étapes exigée pour votre rôle, se déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous utilisez le même compte que tous les membres de la Fédération. C’est le rôle attribué à ce compte qui ouvre le back-office. Si le menu de votre compte n’affiche pas **Administration du site**, le rôle n’a pas encore été attribué : demandez-le au super administrateur.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Vérification en deux étapes exigée',
          text: 'Votre rôle fait partie des rôles privilégiés (administration, coordination, finance, communication) qui doivent protéger leur compte par un second facteur : un code temporaire demandé en plus du mot de passe, à chaque connexion. Activez-la dès votre première connexion (voir ci-dessous). Selon le réglage du site, l’accès au back-office peut être bloqué tant qu’elle n’est pas activée : la page « Vérification en deux étapes » s’affiche alors avec le bouton `Activer la vérification`.',
        },
      ],
      subsections: [
        {
          id: 'se-connecter',
          title: 'Se connecter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la page **Connexion** du site.',
                  where: 'lien **Connexion** en haut à droite du site ; sur mobile, dans le menu du site',
                  result: 'Le formulaire de connexion s’affiche.',
                },
                {
                  text: 'Saisissez votre **Adresse email** (obligatoire).',
                  note: 'Utilisez l’adresse avec laquelle votre compte a été créé, sans faute de frappe. Cette adresse doit avoir été confirmée par le lien reçu par email.',
                },
                { text: 'Saisissez votre **Mot de passe** (obligatoire).' },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  where: 'en bas du formulaire',
                  result: 'Si la vérification en deux étapes est active, le champ **Code de vérification** apparaît. Sinon, votre espace personnel s’ouvre.',
                },
                {
                  text: 'Saisissez le code à 6 chiffres affiché par votre application d’authentification, ou l’un de vos codes de secours.',
                  where: 'champ **Code de vérification**',
                  result: 'Votre espace personnel s’ouvre (rubriques Tableau de bord, Profil, Mes inscriptions, Notifications, Sécurité).',
                },
                {
                  text: 'Ouvrez le menu de votre compte puis cliquez sur **Administration du site**.',
                  where: 'vos initiales, en haut à droite',
                  result: 'Le back-office s’ouvre sur le tableau de bord « Bonjour {votre prénom} ». Sous le menu de gauche, la pastille or « Éditeur communication » confirme votre rôle.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Un message indique que l’adresse n’est pas vérifiée.',
                  cause: 'Vous n’avez pas encore cliqué sur le lien de confirmation reçu par email (valable 24 heures).',
                  solution: 'Demandez un nouveau lien depuis la page de connexion, ouvrez l’email « Confirmez votre adresse email - FETRAG » et cliquez sur son lien. Vérifiez aussi le dossier des indésirables.',
                },
                {
                  problem: 'La page « Accès refusé » s’affiche quand j’ouvre l’administration.',
                  cause: 'Votre compte n’a pas (encore) le rôle « Éditeur communication », ou vous êtes connecté avec un autre compte.',
                  solution: 'Vérifiez l’adresse indiquée sur la page. Utilisez « Changer de compte » si besoin, sinon cliquez sur `Contacter la FETRAG` pour demander l’attribution du rôle.',
                },
                {
                  problem: 'Le champ **Code de vérification** apparaît alors que je n’ai plus mon téléphone.',
                  cause: 'La vérification en deux étapes est active et l’application n’est plus disponible.',
                  solution: 'Utilisez l’un des codes de secours notés lors de l’activation. Sans code de secours, demandez au super administrateur de réinitialiser la vérification en deux étapes de votre compte.',
                },
                {
                  problem: 'Le message « Le code ne correspond pas. Vérifiez l’heure de votre appareil et réessayez. » s’affiche.',
                  cause: 'L’heure de votre téléphone est décalée : les codes dépendent de l’heure exacte.',
                  solution: 'Activez l’heure automatique dans les réglages du téléphone, attendez un nouveau code et recommencez. Après plusieurs échecs, le message « Trop de tentatives » impose une pause de quelques minutes.',
                },
              ],
            },
          ],
        },
        {
          id: 'mot-de-passe-oublie',
          title: 'Retrouver un mot de passe oublié',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur **Mot de passe oublié ?**.',
                  where: 'sous le champ **Mot de passe** de la page **Connexion**',
                  result: 'La page « Mot de passe oublié » s’affiche.',
                },
                { text: 'Saisissez l’adresse email de votre compte (obligatoire) puis validez.', result: 'Un message vous invite à consulter votre boîte email.' },
                {
                  text: 'Ouvrez l’email « Réinitialisation de votre mot de passe FETRAG » et cliquez sur son lien.',
                  note: 'Le lien est valable 30 minutes. Passé ce délai, recommencez la demande.',
                  result: 'La page de choix d’un nouveau mot de passe s’affiche.',
                },
                {
                  text: 'Choisissez un nouveau mot de passe puis validez.',
                  note: 'Règles imposées : au moins 8 caractères, au moins une majuscule et au moins un chiffre. Choisissez un mot de passe que vous n’utilisez sur aucun autre service.',
                  result: 'Vous pouvez vous connecter avec le nouveau mot de passe. Un email « Votre mot de passe FETRAG a été modifié » vous est envoyé.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Je ne reçois pas l’email de réinitialisation.',
                  cause: 'Faute de frappe dans l’adresse, email arrivé dans les indésirables, ou adresse différente de celle du compte.',
                  solution: 'Vérifiez le dossier des indésirables, puis recommencez avec l’adresse exacte du compte. Si rien n’arrive après quelques minutes, écrivez au support par le formulaire de contact.',
                },
              ],
            },
          ],
        },
        {
          id: 'activer-la-verification-en-deux-etapes',
          title: 'Activer la vérification en deux étapes (obligatoire pour votre rôle)',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP).',
                  note: 'Ces applications génèrent un code à 6 chiffres qui change toutes les 30 secondes, même sans connexion Internet.',
                },
                {
                  text: 'Ouvrez **Sécurité**.',
                  where: 'menu de votre compte (vos initiales, en haut à droite) > **Sécurité** ; ou rubrique **Sécurité** de votre espace personnel',
                  result: 'La page « Protéger mon compte » s’affiche avec le badge « Vérification en deux étapes inactive ».',
                },
                {
                  text: 'Cliquez sur `Activer la vérification en deux étapes`.',
                  where: 'carte « Vérification en deux étapes »',
                  result: 'Un QR code et une clé à saisir manuellement apparaissent (« Étape 1 »).',
                },
                {
                  text: 'Scannez le QR code avec votre application (ou saisissez la clé manuellement).',
                  note: 'Sur téléphone, vous ne pouvez pas scanner l’écran que vous regardez : copiez la clé affichée sous « Scannez ce code ou saisissez la clé manuellement : » et collez-la dans l’application.',
                  result: 'L’application affiche un code à 6 chiffres pour « FETRAG ».',
                },
                {
                  text: 'Saisissez le **Code à 6 chiffres affiché par l’application** puis cliquez sur `Confirmer et activer`.',
                  where: '« Étape 2 »',
                  result: 'Le message « La vérification en deux étapes est activée. Conservez vos codes de secours en lieu sûr. » s’affiche.',
                },
                {
                  text: 'Cliquez sur `Copier les codes` ou notez les codes de secours, puis rangez-les en lieu sûr (hors du téléphone).',
                  where: 'alerte or « Codes de secours - affichés une seule fois »',
                  note: 'Chaque code de secours remplace une fois le code de l’application, si vous perdez votre téléphone. Pour en obtenir de nouveaux, il faut désactiver puis réactiver la vérification.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Désactivation',
              text: 'Désactiver la vérification en deux étapes demande un code de vérification ou un code de secours (champ « Code de vérification ou code de secours », bouton `Désactiver la vérification`). Ne la désactivez que pour la réactiver aussitôt (changement de téléphone) : elle est exigée pour votre rôle. Sans aucun code, seul le super administrateur peut réinitialiser la vérification de votre compte.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Le code saisi est invalide. » s’affiche à l’activation.',
                  cause: 'Le code a expiré (il change toutes les 30 secondes) ou vous avez scanné un ancien QR code.',
                  solution: 'Attendez le code suivant dans l’application et saisissez-le sans attendre. Si l’erreur persiste, cliquez sur `Annuler` puis recommencez l’activation avec un nouveau QR code.',
                },
              ],
            },
          ],
        },
        {
          id: 'se-deconnecter',
          title: 'Se déconnecter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez le menu de votre compte.',
                  where: 'vos initiales, en haut à droite du site (le back-office affiche aussi votre nom et votre rôle en bas du menu de gauche)',
                },
                {
                  text: 'Cliquez sur **Déconnexion**.',
                  result: 'Vous revenez au site public ; le menu affiche de nouveau **Connexion**.',
                },
                {
                  text: 'Sur un appareil partagé (ordinateur d’une section, téléphone prêté), fermez aussi le navigateur.',
                  note: 'Les messages reçus contiennent des données personnelles et les brouillons peuvent contenir des informations non encore publiques : ne laissez jamais une session ouverte.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'se-reperer',
      title: 'Se repérer dans le back-office',
      icon: 'compass',
      summary: 'Le tableau de bord, le menu de navigation, l’écran d’édition d’un contenu et leurs équivalents sur téléphone.',
      blocks: [
        {
          type: 'screen',
          title: 'Le tableau de bord (« Bonjour {votre prénom} »)',
          description: 'La première page du back-office. Elle résume l’activité du site filtrée selon vos droits : vous n’y voyez ni chiffres financiers ni demandes de service.',
          areas: [
            {
              name: 'Menu de gauche (ordinateur) ou tiroir de navigation (mobile)',
              purpose: 'Les rubriques du back-office groupées par sections : « Pilotage » (Tableau de bord), « Contenus » (Pages, Actualités, Catégories, Ressources, Médias, Menus, FAQ), « Services » (Catalogue, en lecture), « Relations » (Événements, Partenaires et organisations, Messages reçus, Newsletter), « Administration » (Rapports). En bas : votre nom, votre email et la pastille or « Éditeur communication ».',
              icon: 'menu',
            },
            {
              name: 'Barre du haut',
              purpose: 'Le mot « Back-office », le titre de la page courante (« Tableau de bord », « Pages », « Actualités »…) et le lien « Voir le site » qui ouvre le site public dans un nouvel onglet (masqué sur les petits écrans ; utilisez alors le raccourci `Voir le site` du tableau de bord).',
              icon: 'monitor',
            },
            {
              name: 'Pastilles sur le menu',
              purpose: 'Un nombre à côté de « Messages reçus » indique les messages « Nouveau » à lire ; un nombre à côté de « Tableau de bord » indique les contenus « En relecture » qui attendent une décision.',
              icon: 'bell',
            },
            {
              name: 'Tuiles de chiffres',
              purpose: '« Pages vues sur 30 jours » (avec le nombre de visiteurs uniques) et « Formulaires reçus sur 30 jours » (avec le nombre « à traiter »). Deux tuiles par ligne sur mobile. Le bouton `Rapports détaillés` ouvre la page « Rapports ».',
              icon: 'bar-chart',
            },
            {
              name: 'Cartes « Audience du site » et « Formulaires par type »',
              purpose: 'Un graphique des pages vues et des visiteurs uniques sur 30 jours (mesure sans cookie) et la répartition des formulaires reçus (Contact, Adhésion / intérêt, Partenariat, Assistance, Demande de service).',
              icon: 'pie-chart',
            },
            {
              name: 'Carte « Contenus en relecture »',
              purpose: 'Les contenus en statut « En relecture », avec leur type (Page, Actualité, Ressource, Événement, Service), la date de dernière modification et un bouton `Relire` qui ouvre la fiche. Vide : « Rien à relire ». En dessous, « Publications planifiées » liste les cinq prochaines pages et actualités programmées.',
              icon: 'eye',
            },
            {
              name: 'Carte « Messages reçus »',
              purpose: 'Les six derniers messages envoyés depuis les formulaires du site (objet ou type, expéditeur, date, badge de statut) et le lien `Boîte de réception`.',
              icon: 'inbox',
            },
            {
              name: 'Cartes « Contenus les plus consultés » et « Plateforme de formation »',
              purpose: 'Les cinq actualités les plus vues, ressources les plus téléchargées et formations les plus suivies ; les indicateurs de la plateforme de formation (apprenants actifs, inscriptions, taux de complétion, certificats). Le bouton `Coordination LMS` mène à un espace réservé au coordinateur : il affichera « Accès refusé » pour vous.',
              icon: 'graduation-cap',
            },
            {
              name: 'Raccourcis',
              purpose: 'En bas de page : `Nouvelle actualité` (ouvre directement le formulaire de création) et `Voir le site`.',
              icon: 'zap',
            },
          ],
        },
        {
          type: 'screen',
          title: 'La navigation sur téléphone',
          description: 'Sous 1024 pixels de large (tous les téléphones et la plupart des tablettes), le menu de gauche disparaît.',
          areas: [
            {
              name: 'Bouton **Ouvrir la navigation** (trois traits)',
              purpose: 'En haut à gauche de la barre du haut. Il ouvre un tiroir marine avec les mêmes sections que le menu de gauche. Le tiroir se ferme avec le bouton « Fermer la navigation » ou automatiquement quand vous ouvrez une page.',
              icon: 'menu',
            },
            {
              name: 'Tableaux',
              purpose: 'Les colonnes secondaires (Gabarit, Statut, Version, Modifiée, Vues, Auteur…) sont masquées ; le badge de statut est répété sous le titre. Le tableau peut défiler de gauche à droite avec le doigt.',
              icon: 'table',
            },
            {
              name: 'Filtres et boutons',
              purpose: 'Les champs de filtre s’empilent ; les boutons `Filtrer`, `Réinitialiser` et les boutons de création prennent toute la largeur.',
              icon: 'filter',
            },
            {
              name: 'Menu d’actions d’une ligne',
              purpose: 'Le bouton icône « Actions pour {titre} » (trois points), à droite de chaque ligne, ouvre la liste : `Modifier`, `Prévisualiser`, les changements de statut et `Supprimer`.',
              icon: 'sliders',
            },
          ],
        },
        {
          type: 'screen',
          title: 'L’écran d’édition d’un contenu (page, actualité, ressource, événement)',
          description: 'Le même agencement pour tous les contenus qui suivent le cycle de publication.',
          areas: [
            {
              name: 'Fil d’Ariane et titre',
              purpose: 'En haut : « Administration > Pages > {titre} ». Le titre du contenu et, en dessous, son extrait ou son résumé.',
              icon: 'chevron-right',
            },
            {
              name: 'Formulaire (à gauche sur ordinateur, en premier sur mobile)',
              purpose: 'Les onglets soulignés (`Contenu`, `Blocs`, `Réglages`, `SEO` pour une page ; `Contenu`, `Classement et image`, `SEO` pour une actualité ; `Général`, `Dates et lieu`, `Intervenant`, `Inscriptions`, `SEO` pour un événement). Sur mobile, les onglets défilent horizontalement. En bas : le bouton `Enregistrer…`.',
              icon: 'pen',
            },
            {
              name: 'Panneau « Publication » (à droite sur ordinateur, sous le formulaire sur mobile)',
              purpose: 'Le badge de statut, le bouton `Actions` (changements de statut, suppression), le bouton `Prévisualiser` ou `Voir en ligne`, puis les informations : Adresse, Publié le, Planifié le, Modifié le, Créé le, Auteur, Version. En bas : `Retour à la liste`.',
              icon: 'send',
            },
            {
              name: 'Carte « Versions » (pages seulement)',
              purpose: 'Les douze dernières versions de la page avec un bouton `Restaurer` sur chaque version ancienne.',
              icon: 'history',
            },
            {
              name: 'Carte « Participants » (événements seulement)',
              purpose: 'Sous le formulaire : la liste des inscrits, les boutons `Présent` / `Retirer` et le bouton `Exporter (CSV)`.',
              icon: 'users',
            },
            {
              name: 'Messages',
              purpose: 'Un bandeau vert (succès) ou rouge (erreur) apparaît en haut du formulaire et une notification passagère (« toast ») en bas de l’écran. Les erreurs de champ sont écrites en rouge sous le champ concerné.',
              icon: 'info',
            },
          ],
        },
        { type: 'path', label: 'Chemin vers les actualités', items: ['Menu de gauche', 'Contenus', 'Actualités'], href: '/admin/actualites' },
        { type: 'path', label: 'Chemin vers les pages', items: ['Menu de gauche', 'Contenus', 'Pages'], href: '/admin/pages' },
        { type: 'path', label: 'Chemin vers les messages reçus', items: ['Menu de gauche', 'Relations', 'Messages reçus'], href: '/admin/messages' },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'cycle-de-publication',
      title: 'Comprendre le cycle de publication',
      icon: 'refresh',
      summary: 'Les cinq statuts d’un contenu, qui fait quoi, et comment changer de statut.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les pages, actualités, ressources, événements et services suivent le même cycle. Un contenu est créé en **Brouillon** : il n’est visible que dans le back-office. Vous décidez ensuite de le publier directement, de le programmer à une date ou de le mettre d’abord « En relecture » pour qu’un collègue éditeur (ou vous-même, plus tard) le relise depuis le tableau de bord. Un contenu publié peut être archivé (retiré du site, conservé) ou repassé en brouillon.',
        },
        {
          type: 'statuses',
          title: 'Les statuts affichés',
          items: [
            { label: 'Brouillon', tone: 'neutral', meaning: 'Contenu en cours de rédaction, visible seulement dans le back-office. C’est le statut à la création.', next: 'Modifiez-le librement, puis envoyez-le en relecture, planifiez-le ou publiez-le.' },
            { label: 'En relecture', tone: 'info', meaning: 'Contenu soumis à validation. Il apparaît dans la carte « Contenus en relecture » du tableau de bord et compte dans la pastille du menu. Non visible sur le site.', next: 'Relisez-le avec le bouton `Relire`, puis publiez-le, planifiez-le ou repassez-le en brouillon pour le corriger.' },
            { label: 'Planifié', tone: 'warning', meaning: 'Page ou actualité qui sera publiée automatiquement à la date et à l’heure choisies (heure de Libreville), dans les dix minutes qui suivent l’échéance. La date apparaît sous « Planifié le ».', next: 'Rien à faire. Pour annuler, repassez le contenu en brouillon ou publiez-le immédiatement.' },
            { label: 'Publié', tone: 'success', meaning: 'Visible sur le site, dans la recherche et dans le plan du site. La date « Publié le » est conservée même si vous republiez plus tard.', next: 'Toute modification enregistrée est visible immédiatement. Archivez le contenu quand il n’a plus lieu d’être.' },
            { label: 'Archivé', tone: 'neutral', meaning: 'Retiré du site mais conservé dans le back-office avec son historique.', next: 'Repassez-le en brouillon pour le retravailler et le republier.' },
          ],
        },
        {
          type: 'table',
          caption: 'Les passages possibles d’un statut à l’autre',
          columns: ['Depuis', 'Vers', 'Action dans le menu'],
          rows: [
            ['Brouillon', 'En relecture, Planifié ou Publié', '`Envoyer en relecture`, `Planifier la publication`, `Publier`'],
            ['En relecture', 'Brouillon, Planifié ou Publié', '`Repasser en brouillon`, `Planifier la publication`, `Publier`'],
            ['Planifié', 'Brouillon, En relecture ou Publié', '`Repasser en brouillon`, `Envoyer en relecture`, `Publier`'],
            ['Publié', 'Archivé ou Brouillon', '`Archiver`, `Repasser en brouillon` (retire aussi du site)'],
            ['Archivé', 'Brouillon', '`Repasser en brouillon`'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Qui valide quoi',
          text: 'Le site ne demande aucune validation par un autre rôle : l’éditeur communication rédige, relit et publie. La relecture est une étape facultative, utile quand plusieurs éditeurs travaillent ensemble ou pour laisser reposer un texte. La validation de fond (communiqués, textes officiels, mentions légales) se fait en dehors du site, avec le Secrétariat général, avant de cliquer sur `Publier`.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Publier et archiver sont immédiats',
          text: 'Aucune fenêtre de confirmation n’apparaît avant `Publier`, `Archiver`, `Envoyer en relecture` ou `Repasser en brouillon` : l’action s’applique au clic. Seule la planification ouvre un dialogue et seule la suppression demande une confirmation. Relisez avant de cliquer ; en cas d’erreur, `Repasser en brouillon` retire aussitôt le contenu du site.',
        },
      ],
      subsections: [
        {
          id: 'changer-le-statut',
          title: 'Changer le statut d’un contenu',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la liste du contenu (**Pages**, **Actualités**, **Ressources** ou **Événements**) ou la fiche du contenu.',
                  where: 'menu de gauche, section « Contenus » ou « Relations » ; sur mobile, bouton **Ouvrir la navigation**',
                },
                {
                  text: 'Ouvrez le menu d’actions.',
                  where: 'dans la liste : bouton icône « Actions pour {titre} » à droite de la ligne ; sur la fiche : bouton `Actions` du panneau « Publication »',
                  result: 'La liste s’ouvre avec le statut courant en tête, puis `Modifier` (liste seulement), `Prévisualiser`, les changements de statut disponibles et `Supprimer`.',
                },
                {
                  text: 'Cliquez sur le changement souhaité : `Envoyer en relecture`, `Publier`, `Repasser en brouillon` ou `Archiver`.',
                  result: 'Le message « « {titre} » a été publié. » (ou « envoyé en relecture », « archivé », « repassé en brouillon ») apparaît et le badge de statut change.',
                  note: 'Si le contenu est déjà dans ce statut, le message « Le contenu était déjà dans ce statut. » s’affiche sans rien changer.',
                },
                {
                  text: 'Pour un contenu publié, vérifiez le résultat sur le site avec `Voir en ligne`.',
                  where: 'panneau « Publication »',
                  result: 'La page publique s’ouvre dans un nouvel onglet.',
                },
              ],
            },
          ],
        },
        {
          id: 'planifier-une-publication',
          title: 'Planifier une publication (pages et actualités)',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez le menu d’actions de la page ou de l’actualité, puis cliquez sur `Planifier la publication`.',
                  result: 'Le dialogue « Planifier la publication » s’ouvre : « Le contenu sera publié automatiquement à la date choisie (heure de Libreville). »',
                },
                {
                  text: 'Renseignez **Date et heure de publication** (obligatoire, dans le futur).',
                  note: 'Le bouton `Planifier` reste grisé tant que la date est vide. Une date passée est refusée : « La date de publication planifiée doit être dans le futur ».',
                },
                {
                  text: 'Cliquez sur `Planifier`.',
                  result: 'Le message « « {titre} » a été planifié. » apparaît ; le statut passe à « Planifié » et la date s’affiche sous « Planifié le ». Le tableau de bord la liste dans « Publications planifiées ».',
                },
                {
                  text: 'Le jour venu, vérifiez sur le site que le contenu est bien en ligne.',
                  note: 'La publication automatique se fait dans les dix minutes qui suivent l’heure choisie. Le journal enregistre alors « système » comme auteur de la publication.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Ressources, événements et services',
              text: 'La planification n’existe que pour les pages et les actualités. Pour les autres contenus, publiez au moment voulu. Le champ « Publication planifiée » présent dans les formulaires de page et d’actualité ne remplace pas l’action `Planifier la publication` : c’est cette action, avec sa date, qui programme réellement la mise en ligne.',
            },
          ],
        },
        {
          id: 'previsualiser',
          title: 'Prévisualiser avant de publier',
          blocks: [
            {
              type: 'paragraph',
              text: 'Le bouton `Prévisualiser` (liste et panneau « Publication ») ouvre l’adresse publique du contenu avec un paramètre d’aperçu. Dans la version actuelle du site, cet aperçu n’affiche pas encore les brouillons : la page publique ne montre que les contenus publiés et répond « introuvable » pour un brouillon. La vérification visuelle se fait donc après publication, au moment le plus calme possible.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Relisez le contenu dans le formulaire du back-office (titre, extrait, texte, image et texte alternatif, catégorie, SEO).',
                  note: 'Relisez à voix basse et sur téléphone si possible : c’est ainsi que la plupart des visiteurs liront.',
                },
                {
                  text: 'Publiez avec `Actions` puis `Publier`, puis cliquez sur `Voir en ligne`.',
                  result: 'Le contenu s’affiche tel que le voient les visiteurs.',
                },
                {
                  text: 'En cas de défaut important, cliquez sur `Actions` puis `Repasser en brouillon`, corrigez, puis publiez de nouveau.',
                  note: 'Pour une simple coquille, corrigez et cliquez sur `Enregistrer…` : la modification est en ligne immédiatement, sans repasser en brouillon.',
                },
              ],
            },
          ],
        },
        {
          id: 'depannage-publication',
          title: 'Si ça ne marche pas',
          blocks: [
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Transition « X » vers « Y » non autorisée » s’affiche.',
                  cause: 'Le passage demandé n’existe pas (par exemple Archivé vers Publié directement), ou un collègue a changé le statut entre-temps.',
                  solution: 'Rechargez la page pour voir le statut réel, puis suivez le tableau des passages possibles (passez par « Brouillon » si besoin).',
                },
                {
                  problem: 'Le contenu publié n’apparaît pas sur le site.',
                  cause: 'Vous regardez une page mise en cache par votre navigateur, ou le contenu est « Planifié » et l’heure n’est pas encore passée.',
                  solution: 'Rechargez la page publique. Vérifiez le badge de statut et la date « Planifié le » dans le panneau « Publication ». Pour une page institutionnelle, vérifiez que son slug correspond à une adresse réellement servie par le site (voir la section sur les pages).',
                },
                {
                  problem: 'Le message « Permission insuffisante » s’affiche.',
                  cause: 'Votre rôle a été retiré ou a expiré, ou vous tentez de modifier un service (réservé au responsable des services).',
                  solution: 'Déconnectez-vous puis reconnectez-vous. Si le problème persiste, contactez le super administrateur.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'rediger-une-actualite',
      title: 'Comment rédiger et publier une actualité ou un communiqué',
      icon: 'megaphone',
      summary: 'Créer l’actualité, la mettre en forme, insérer une image ou un lien, la classer, la référencer et la publier.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les actualités regroupent les informations de la Fédération, les prises de position officielles (« Communiqué officiel ») et les retours sur les événements. Une actualité « À la une » est mise en avant sur la page d’accueil. Chaque actualité a une adresse publique de la forme /actualites/{slug}, où le slug est le nom court de l’adresse, généré à partir du titre.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Actualités', 'Nouvelle actualité'], href: '/admin/actualites/nouveau' },
      ],
      subsections: [
        {
          id: 'creer-une-actualite',
          title: 'Créer l’actualité',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Actualités** puis cliquez sur `Nouvelle actualité`.',
                  where: 'menu de gauche, section « Contenus » ; bouton en haut à droite de la liste (pleine largeur sur mobile). Le raccourci `Nouvelle actualité` du tableau de bord mène au même endroit.',
                  result: 'Le formulaire « Nouvelle actualité » s’affiche, onglet `Contenu` ouvert.',
                },
                {
                  text: 'Saisissez le **Titre** (obligatoire, 2 à 200 caractères).',
                  note: 'Un titre court et précis, sans majuscules partout : « La FETRAG signe l’accord sur le dialogue social » plutôt que « ACCORD SIGNÉ ».',
                },
                {
                  text: 'Saisissez le **Chapô** (facultatif, 500 caractères maximum) : deux ou trois phrases qui résument l’information.',
                  note: 'Si vous le laissez vide, le site reprend automatiquement les 160 premiers caractères du texte. Le chapô sert dans les listes et les partages sur les réseaux sociaux.',
                },
                {
                  text: 'Rédigez le **Texte de l’actualité** (obligatoire) dans l’éditeur de texte riche.',
                  note: 'Voir la sous-section « Mettre en forme le texte ». Le texte est nettoyé à l’enregistrement : les mises en forme copiées depuis un traitement de texte (couleurs, polices) sont retirées.',
                },
                {
                  text: 'Cliquez sur `Créer l’actualité`.',
                  where: 'bouton en bas à droite du formulaire (pleine largeur sur mobile) ; il affiche « Enregistrement » pendant l’envoi',
                  result: 'La fiche de l’actualité s’ouvre avec le bandeau vert « L’actualité a été créée en brouillon. Envoyez-la en relecture ou publiez-la depuis le panneau « Publication ». »',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Certains champs sont invalides. » s’affiche.',
                  cause: 'Un champ obligatoire est vide ou dépasse la longueur autorisée.',
                  solution: 'Parcourez les onglets : le message rouge sous le champ concerné indique la correction à faire.',
                },
                {
                  problem: 'Le message « Ce slug est déjà utilisé » s’affiche.',
                  cause: 'Vous avez saisi un slug (onglet `Classement et image`) déjà pris par une autre actualité.',
                  solution: 'Videz le champ **Slug (adresse)** pour laisser le site le générer, ou choisissez un autre nom court.',
                },
              ],
            },
          ],
        },
        {
          id: 'mettre-en-forme-le-texte',
          title: 'Mettre en forme le texte',
          blocks: [
            {
              type: 'paragraph',
              text: 'La barre « Mise en forme » se trouve au-dessus de la zone de texte. Sur téléphone, elle s’étale sur plusieurs lignes. Chaque bouton est une icône ; son nom apparaît au survol sur ordinateur.',
            },
            {
              type: 'table',
              caption: 'Les boutons de la barre « Mise en forme »',
              columns: ['Bouton', 'Effet', 'Conseil'],
              rows: [
                ['Gras, Italique, Souligné', 'Met en valeur le texte sélectionné.', 'Le gras pour un mot clé, jamais pour un paragraphe entier.'],
                ['Titre de niveau 2, Titre de niveau 3', 'Transforme la ligne en sous-titre.', 'Le titre de l’actualité est déjà le titre principal : commencez vos sous-titres au niveau 2 et utilisez le niveau 3 pour les sous-parties.'],
                ['Liste à puces, Liste numérotée', 'Crée une liste.', 'Numérotez seulement quand l’ordre compte (étapes, classement).'],
                ['Citation', 'Met le paragraphe en retrait comme une citation.', 'Pour les propos rapportés, avec le nom de la personne citée.'],
                ['Séparateur', 'Insère une ligne horizontale.', 'À utiliser avec parcimonie.'],
                ['Insérer ou modifier un lien, Retirer le lien', 'Ajoute un lien sur le texte sélectionné.', 'Écrivez un texte de lien parlant (« consulter le communiqué ») plutôt que « cliquez ici ».'],
                ['Insérer une image', 'Ouvre le dialogue « Insérer une image ».', 'Le texte alternatif est obligatoire (voir ci-dessous).'],
                ['Insérer un tableau, Supprimer le tableau', 'Insère un tableau de 3 lignes et 3 colonnes avec une ligne d’en-tête.', 'Sur téléphone, les tableaux larges sont difficiles à lire : préférez une liste.'],
                ['Annuler, Rétablir', 'Revient en arrière ou rétablit la dernière modification.', 'Tant que vous n’avez pas enregistré, tout est réversible.'],
              ],
            },
            {
              type: 'steps',
              title: 'Insérer un lien',
              items: [
                { text: 'Sélectionnez le texte qui portera le lien.' },
                {
                  text: 'Cliquez sur le bouton **Insérer ou modifier un lien**.',
                  where: 'barre « Mise en forme »',
                  result: 'Une petite fenêtre du navigateur demande « Adresse du lien (https://… ou /chemin) ».',
                },
                {
                  text: 'Collez l’adresse complète (commençant par https://) ou un chemin du site (commençant par /), puis validez.',
                  note: 'Laisser l’adresse vide retire le lien. Le bouton **Retirer le lien** fait la même chose.',
                  result: 'Le texte sélectionné devient un lien.',
                },
              ],
            },
            {
              type: 'steps',
              title: 'Insérer une image dans le texte',
              items: [
                {
                  text: 'Placez le curseur à l’endroit voulu, puis cliquez sur le bouton **Insérer une image**.',
                  result: 'Le dialogue « Insérer une image » s’ouvre : « Envoyez une image dans la médiathèque ou indiquez son URL. Le texte alternatif est requis pour l’accessibilité. »',
                },
                {
                  text: 'Saisissez d’abord le **Texte alternatif** (obligatoire, 200 caractères maximum) : une phrase qui décrit l’image pour les personnes qui ne la voient pas.',
                  note: 'Tant que ce champ est vide, le choix du fichier est désactivé (« Renseignez d’abord le texte alternatif. »). Exemple : « Le Secrétaire général signe l’accord devant les délégués ».',
                },
                {
                  text: 'Choisissez un **Fichier image** (png, jpeg, webp, gif ou avif ; 8 Mo maximum) ou collez une adresse dans **Ou URL de l’image** puis cliquez sur `Insérer par URL`.',
                  result: 'Le fichier est envoyé immédiatement dans la médiathèque (visibilité publique, dossier « actualites ») et le message « Image insérée » apparaît. L’image s’affiche dans le texte.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Documents à télécharger',
              text: 'L’éditeur de texte n’insère que des images. Pour proposer un document (PDF, formulaire), déposez-le d’abord dans **Médias** ou, mieux, créez une ressource documentaire (menu **Ressources**), puis insérez un lien vers son adresse dans le texte.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'La zone de texte affiche « Chargement de l’éditeur… » et ne réagit pas.',
                  cause: 'La connexion est lente ou le navigateur est ancien.',
                  solution: 'Attendez quelques secondes ; si rien ne change, rechargez la page. Sur téléphone, fermez les autres onglets.',
                },
                {
                  problem: 'Le message « Le fichier dépasse la taille maximale de 8 Mo » ou « Type de fichier non autorisé » s’affiche.',
                  cause: 'L’image est trop lourde ou dans un format refusé (SVG, HEIC, BMP…).',
                  solution: 'Réduisez l’image (moins de 500 Ko suffit pour le web) et enregistrez-la en JPEG, PNG ou WebP avant de recommencer.',
                },
                {
                  problem: 'Après enregistrement, ma mise en forme a disparu (couleurs, polices, tailles).',
                  cause: 'Le texte est nettoyé à l’enregistrement : seuls les titres, listes, gras, italique, liens, images, citations et tableaux sont conservés.',
                  solution: 'C’est normal : la charte du site applique la mise en forme. Utilisez les boutons de la barre plutôt qu’un copier-coller mis en forme.',
                },
              ],
            },
          ],
        },
        {
          id: 'classer-et-illustrer-une-actualite',
          title: 'Classer, illustrer et référencer l’actualité',
          blocks: [
            {
              type: 'steps',
              title: 'Onglet « Classement et image »',
              items: [
                {
                  text: 'Ouvrez l’onglet `Classement et image`.',
                  where: 'onglets soulignés en haut du formulaire (défilent horizontalement sur mobile)',
                  result: 'La carte « Classement, image et publication » s’affiche.',
                },
                {
                  text: 'Choisissez la **Catégorie** (facultatif) parmi les catégories du domaine « Actualités ».',
                  note: 'La catégorie alimente le filtre de la page publique des actualités. Créez-en de nouvelles depuis le menu **Catégories** si besoin.',
                },
                {
                  text: 'Saisissez des **Mots-clés** séparés par des virgules (facultatif, 20 maximum, 40 caractères chacun).',
                  note: 'Exemple : « dialogue social, formation, droit du travail ». Ils aident la recherche du site.',
                },
                {
                  text: 'Laissez le **Slug (adresse)** vide pour qu’il soit généré depuis le titre.',
                  note: 'L’aperçu « /actualites/{slug} » s’affiche sous le champ. Ne changez plus le slug une fois l’actualité publiée et partagée : les anciens liens ne fonctionneraient plus, sans redirection automatique.',
                },
                {
                  text: 'Ajoutez l’**Image de couverture** avec `Choisir un fichier` (envoi immédiat dans la médiathèque) ou `Saisir une URL`.',
                  note: 'Format paysage recommandé : 1600 × 900 pixels, 8 Mo maximum. L’image officielle doit conserver sa pastille blanche. L’aperçu affiche la vignette, le nom, le type et la taille ; `Retirer` enlève l’image.',
                  result: 'Le message « « {fichier} » envoyé. » apparaît.',
                },
                {
                  text: 'Renseignez le **Texte alternatif de l’image** (200 caractères maximum) dès qu’une image est fournie.',
                  note: 'Le formulaire l’indique comme obligatoire pour l’accessibilité ; ne le laissez pas vide même si l’enregistrement l’accepte.',
                },
                {
                  text: 'Cochez **Communiqué officiel** pour une prise de position officielle (mise en avant dans la rubrique « Communiqués ») et **À la une** pour l’afficher sur la page d’accueil (étoile or).',
                  note: 'Limitez le nombre d’actualités « À la une » : l’accueil doit rester lisible.',
                },
              ],
            },
            {
              type: 'steps',
              title: 'Onglet « SEO » (référencement)',
              intro: 'Le référencement, c’est la façon dont les moteurs de recherche et les réseaux sociaux présentent votre contenu. Tous les champs sont facultatifs.',
              items: [
                {
                  text: 'Ouvrez l’onglet `SEO`.',
                  result: 'La carte « Référencement » s’affiche : « Titre et description affichés par les moteurs de recherche et les réseaux sociaux. »',
                },
                {
                  text: 'Saisissez un **Titre SEO** (70 caractères maximum) si le titre de l’actualité est trop long pour un résultat de recherche.',
                },
                {
                  text: 'Saisissez une **Méta-description** (200 caractères maximum) : la phrase affichée sous le titre dans les moteurs de recherche.',
                  note: 'Si elle est vide, le chapô est utilisé.',
                },
                {
                  text: 'Indiquez une **Image de partage** (1200 × 630 pixels recommandés) si vous voulez une image différente de la couverture sur les réseaux sociaux.',
                },
                {
                  text: 'Cochez **Exclure des moteurs** seulement pour un contenu que les moteurs de recherche ne doivent pas indexer (information temporaire ou interne).',
                  note: 'Le champ **URL canonique** ne sert que si le même texte est publié ailleurs en premier : indiquez alors l’adresse d’origine. Dans le doute, laissez-le vide.',
                },
                {
                  text: 'Cliquez sur `Enregistrer l’actualité`.',
                  where: 'en bas du formulaire',
                  result: 'Le message « Actualité « {titre} » enregistrée. » apparaît.',
                },
              ],
            },
          ],
        },
        {
          id: 'publier-une-actualite',
          title: 'Publier, corriger ou retirer l’actualité',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Relisez la fiche complète (onglets `Contenu`, `Classement et image`, `SEO`).',
                  note: 'Pour une relecture par un collègue, cliquez sur `Actions` puis `Envoyer en relecture` : l’actualité apparaît dans « Contenus en relecture » sur son tableau de bord.',
                },
                {
                  text: 'Cliquez sur `Actions` puis `Publier` (ou `Planifier la publication` pour une date ultérieure).',
                  where: 'panneau « Publication », à droite sur ordinateur, sous le formulaire sur mobile',
                  result: 'Le message « « {titre} » a été publié. » apparaît. Le badge passe à « Publié » et la date « Publié le » s’affiche.',
                },
                {
                  text: 'Cliquez sur `Voir en ligne` et vérifiez l’actualité sur le site, ainsi que la liste des actualités et, si elle est « À la une », la page d’accueil.',
                  result: 'Le panneau affiche ensuite « N consultation(s) · N min de lecture » (temps calculé sur 200 mots par minute).',
                },
                {
                  text: 'Pour corriger une actualité publiée : modifiez le texte puis cliquez sur `Enregistrer l’actualité`.',
                  note: 'La correction est en ligne immédiatement, sans repasser par la relecture. Pour une réécriture importante, repassez d’abord en brouillon.',
                },
                {
                  text: 'Pour retirer une actualité dépassée : `Actions` puis `Archiver`.',
                  result: 'L’actualité disparaît du site mais reste dans la liste avec le badge « Archivé ».',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'L’actualité n’apparaît pas sur la page d’accueil.',
                  cause: 'La case **À la une** n’est pas cochée, ou l’actualité n’est pas encore « Publié ».',
                  solution: 'Ouvrez l’onglet `Classement et image`, cochez **À la une**, enregistrez, puis vérifiez le badge de statut.',
                },
                {
                  problem: 'Le compteur « N consultation(s) » reste à zéro.',
                  cause: 'L’actualité vient d’être publiée ou n’a pas encore été ouverte par des visiteurs.',
                  solution: 'Le compteur s’incrémente à chaque ouverture de la page publique. Partagez l’adresse et revenez plus tard.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'modifier-une-page',
      title: 'Comment créer ou modifier une page institutionnelle',
      icon: 'file-text',
      summary: 'Le formulaire de page, l’éditeur de blocs structurés, les réglages, et la restauration d’une version précédente.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les pages sont les textes durables du site : présentation de la Fédération, mentions légales, politique de confidentialité, pages d’atterrissage. Elles se modifient comme une actualité, avec deux particularités : un onglet `Blocs` pour composer des sections riches (bandeau, chiffres clés, équipe, chronologie…) et un historique de versions restaurables.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Quelles pages sont réellement affichées',
          text: 'Dans la version actuelle du site, seules trois pages du back-office sont servies au public : « la-fetrag » (blocs et contenu), « mentions-legales » et « confidentialite » (contenu seul). Si l’une d’elles n’est pas publiée ou est vide, le site affiche un texte de repli. Une page créée avec un autre slug est enregistrée mais n’a pas encore d’adresse publique, même si le panneau affiche « Adresse /{slug} ». Demandez au super administrateur avant de créer une nouvelle page destinée au public.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Pages'], href: '/admin/pages' },
      ],
      subsections: [
        {
          id: 'ouvrir-et-modifier-une-page',
          title: 'Ouvrir et modifier une page',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Pages**.',
                  where: 'menu de gauche, section « Contenus »',
                  result: 'La liste « Pages » s’affiche avec les colonnes Page, Gabarit, Statut, Version et Modifiée (les colonnes secondaires sont masquées sur mobile).',
                },
                {
                  text: 'Retrouvez la page avec le champ **Titre ou slug** et la liste **Statut**, puis cliquez sur `Filtrer`.',
                  note: '`Réinitialiser` efface les filtres. La liste affiche 20 pages par page ; la pagination est sous le tableau.',
                },
                {
                  text: 'Cliquez sur le titre de la page (ou ouvrez le menu d’actions puis `Modifier`).',
                  result: 'La fiche de la page s’ouvre avec les onglets `Contenu`, `Blocs`, `Réglages`, `SEO`, le panneau « Publication » et la carte « Versions ».',
                },
                {
                  text: 'Onglet `Contenu` : modifiez le **Titre** (obligatoire), l’**Extrait** (facultatif, 500 caractères) et le **Contenu** dans l’éditeur de texte riche.',
                  note: 'L’éditeur est le même que pour les actualités (voir « Mettre en forme le texte »). Les images sont envoyées dans le dossier « pages » de la médiathèque.',
                },
                {
                  text: 'Onglet `Réglages` : vérifiez le **Slug (adresse)**, le **Gabarit** (Standard, Institutionnel (La FETRAG), Page d’atterrissage, Page légale), la **Langue**, l’**Image de couverture** (1600 × 900 pixels recommandés) et la case **Inclure dans le plan du site**.',
                  note: 'Décochez « Inclure dans le plan du site » pour une page technique ou temporaire. Le gabarit « Institutionnel (La FETRAG) » est celui de la page de présentation avec ses blocs.',
                },
                {
                  text: 'Onglet `SEO` : renseignez si besoin le titre SEO, la méta-description, l’image de partage et la case d’exclusion des moteurs.',
                },
                {
                  text: 'Cliquez sur `Enregistrer la page`.',
                  where: 'en bas du formulaire',
                  result: 'Le message « Page « {titre} » enregistrée (version N). » apparaît. Une nouvelle version est créée seulement si le titre, le contenu ou les blocs ont changé.',
                },
                {
                  text: 'Publiez ou republiez depuis le panneau « Publication » si la page n’est pas déjà « Publié ».',
                  note: 'Une page publiée modifiée est mise à jour en ligne dès l’enregistrement.',
                },
              ],
            },
            {
              type: 'steps',
              title: 'Créer une nouvelle page',
              items: [
                {
                  text: 'Cliquez sur `Nouvelle page`.',
                  where: 'en haut à droite de la liste « Pages » (pleine largeur sur mobile)',
                  result: 'Le formulaire « Nouvelle page » s’affiche : « La page est créée en brouillon ; publiez-la depuis son panneau de publication une fois relue. »',
                },
                {
                  text: 'Renseignez au minimum le **Titre**, puis les onglets utiles, et cliquez sur `Créer la page`.',
                  result: 'La fiche de la page s’ouvre avec le bandeau « La page a été créée en brouillon. Complétez-la puis publiez-la depuis le panneau « Publication ». »',
                },
              ],
            },
          ],
        },
        {
          id: 'composer-les-blocs',
          title: 'Composer les blocs structurés',
          blocks: [
            {
              type: 'paragraph',
              text: 'L’onglet `Blocs` permet de composer des sections riches rendues avant ou à la place du contenu selon le gabarit : bandeau d’en-tête, texte riche, triptyque fondateur, valeurs, chronologie, équipe et dirigeants, chiffres clés, questions fréquentes, appel à l’action. Les blocs sont décrits dans un format texte appelé JSON (une écriture avec des accolades, des crochets et des guillemets, lue par le site). Vous n’avez pas à l’écrire vous-même : des modèles s’insèrent d’un clic et vous remplacez seulement les textes.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez l’onglet `Blocs`.',
                  result: 'La carte « Blocs structurés » s’affiche avec la ligne « Ajouter un bloc : », la zone « Blocs structurés (JSON) » et la liste « Blocs détectés ».',
                },
                {
                  text: 'Cliquez sur un modèle : `Bandeau d’en-tête`, `Texte riche`, `Triptyque fondateur`, `Valeurs`, `Chronologie`, `Équipe / dirigeants`, `Chiffres clés`, `Questions fréquentes` ou `Appel à l’action`.',
                  where: 'ligne « Ajouter un bloc : »',
                  result: 'Le modèle est ajouté à la fin de la zone de texte et la liste « Blocs détectés » affiche une nouvelle pastille (« 1. hero · Titre »).',
                },
                {
                  text: 'Dans la zone de texte, remplacez uniquement les textes entre guillemets (titres, phrases, dates, noms) par vos contenus.',
                  note: 'Ne supprimez ni les guillemets, ni les virgules, ni les accolades. Limites : 60 blocs, titres de 200 caractères, 40 étapes de chronologie, 12 valeurs, 40 personnes, 30 questions, 8 chiffres clés, 3 volets de triptyque. Les liens ont un libellé (1 à 80 caractères) et une adresse https:// ou un chemin commençant par /.',
                },
                {
                  text: 'Cliquez sur `Reformater` pour remettre le texte en ordre et vérifier qu’il est lisible par le site.',
                  result: 'Le texte est réindenté. En cas d’erreur, un message rouge l’indique en direct : « JSON invalide : … », « Le bloc n° N doit contenir une propriété « type ». » ou « Le document doit être un tableau de blocs ([...]). »',
                },
                {
                  text: 'Cliquez sur `Enregistrer la page`.',
                  result: 'Le message « Page « {titre} » enregistrée (version N). » apparaît.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Travailler sur ordinateur',
              text: 'L’édition des blocs est possible sur téléphone mais bien plus confortable sur ordinateur, avec un clavier. Laissez la zone vide pour n’utiliser que le contenu riche de l’onglet `Contenu`.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « JSON invalide : … » ne disparaît pas.',
                  cause: 'Un guillemet, une virgule ou une accolade a été supprimé ou ajouté par erreur.',
                  solution: 'Utilisez `Annuler` du navigateur (Ctrl + Z) pour revenir en arrière, ou supprimez le bloc fautif et réinsérez le modèle. En dernier recours, restaurez une version précédente de la page.',
                },
                {
                  problem: 'Le message « Le document JSON est invalide. » s’affiche à l’enregistrement.',
                  cause: 'Le texte est lisible mais un bloc ne respecte pas les limites (type inconnu, trop d’éléments, lien mal formé).',
                  solution: 'Vérifiez le type de chaque bloc dans « Blocs détectés » (hero, richtext, timeline, values, people, cta, faq, stats, triptych) et les adresses des liens.',
                },
              ],
            },
          ],
        },
        {
          id: 'restaurer-une-version',
          title: 'Restaurer une version précédente',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche de la page, repérez la carte **Versions**.',
                  where: 'sous le panneau « Publication » sur ordinateur ; sous le formulaire sur mobile',
                  result: 'Les douze dernières versions s’affichent (« vN {titre} », date, éditeur), la version en cours porte le badge « Actuelle ».',
                },
                {
                  text: 'Cliquez sur `Restaurer` à côté de la version à retrouver.',
                  result: 'Le dialogue « Restaurer la version N ? » s’ouvre : « Le titre, le contenu et les blocs de cette version remplaceront la version actuelle (conservée dans l’historique). »',
                },
                {
                  text: 'Cliquez sur `Restaurer`.',
                  result: 'Le message « Version N restaurée… » apparaît et une nouvelle version est créée avec l’ancien contenu. Le statut de la page ne change pas.',
                  note: 'Le message peut annoncer que la page est repassée en brouillon : ce n’est pas le cas dans la version actuelle. Si la page était publiée, l’ancien contenu est donc en ligne immédiatement ; vérifiez-le avec `Voir en ligne`.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Rien n’est perdu',
              text: 'La restauration ne supprime aucune version : elle en crée une nouvelle. Vous pouvez toujours revenir à la version que vous venez de remplacer. Les réglages (slug, gabarit, image de couverture) et le SEO ne font pas partie des versions.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'deposer-une-ressource',
      title: 'Comment déposer une ressource documentaire',
      icon: 'folder',
      summary: 'Mettre un document, une vidéo ou un lien à disposition des travailleurs et des organisations, avec le bon niveau d’accès.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La bibliothèque documentaire regroupe les guides pratiques, textes juridiques, rapports, formulaires et médias. Le niveau d’accès détermine qui peut télécharger : tout le monde, les comptes connectés, les membres d’une organisation, ou les personnes ayant acheté le document.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Ressources', 'Nouvelle ressource'], href: '/admin/ressources/nouveau' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Ressources** puis cliquez sur `Nouvelle ressource`.',
              where: 'menu de gauche, section « Contenus » ; bouton en haut à droite de la liste',
              result: 'Le formulaire « Nouvelle ressource » s’affiche avec trois cartes : « Description », « Fichier ou lien », « Accès et métadonnées ».',
            },
            {
              text: 'Carte « Description » : saisissez le **Titre** (obligatoire, 2 à 200 caractères), le **Résumé** (facultatif, 1 000 caractères), le **Type de ressource** (Document, Guide pratique, Rapport, Texte juridique, Formulaire, Vidéo, Audio, Présentation), la **Catégorie** (domaine « Ressources ») et la **Langue**.',
              note: 'Laissez le **Slug (adresse)** vide : il est généré depuis le titre (aperçu « /ressources/{slug} »).',
            },
            {
              text: 'Carte « Accès et métadonnées » : choisissez d’abord le **Niveau d’accès** (obligatoire) : Public, Membres, Organisation ou Premium.',
              note: 'Choisissez-le avant d’envoyer le fichier : il détermine si le fichier est stocké en privé. « Membres : compte connecté ; Organisation : membres de l’organisation rattachée ; Premium : achat. »',
            },
            {
              text: 'Pour le niveau Organisation, choisissez l’**Organisation rattachée**. Pour le niveau Premium, saisissez le **Tarif (XAF)** (obligatoire, montant entier en francs CFA) ; la **Devise** reste XAF.',
              note: 'Le tarif crée automatiquement l’offre d’achat. Sans organisation rattachée, une ressource « Organisation » est ouverte aux membres de toutes les organisations : ne l’oubliez pas.',
            },
            {
              text: 'Carte « Fichier ou lien » : cliquez sur `Choisir un fichier` et sélectionnez le document, ou saisissez une **URL externe** si le document est hébergé ailleurs (site officiel, vidéo en ligne).',
              note: 'Au moins l’un des deux est obligatoire. Formats acceptés : PDF, Word, Excel, PowerPoint, texte, CSV (25 Mo), audio (60 Mo), vidéo (200 Mo). L’aide indique « Stocké en privé : servi uniquement par lien signé aux ayants droit. » pour les niveaux réservés, « Stocké en public. » sinon.',
              result: 'Le message « « {fichier} » envoyé. » apparaît et l’aperçu affiche le nom, le type et la taille.',
            },
            {
              text: 'Ajoutez si besoin une **Image d’aperçu** (vignette de la bibliothèque), puis renseignez la **Source** (institution d’origine, par exemple « Ministère du Travail »), l’**Auteur**, la **Date du document** et les **Mots-clés**.',
              note: 'Ces champs sont facultatifs mais très utiles pour la recherche et la crédibilité du document : remplissez-les systématiquement.',
            },
            {
              text: 'Cliquez sur `Créer la ressource`.',
              result: 'La fiche s’ouvre avec le bandeau « La ressource a été créée en brouillon. Vérifiez le fichier et le niveau d’accès avant publication. »',
            },
            {
              text: 'Vérifiez le niveau d’accès dans le panneau « Publication » (lignes « Accès », « Offre », « Organisation »), puis cliquez sur `Actions` et `Publier`.',
              result: 'Le message « « {titre} » a été publié. » apparaît. La ressource est visible dans la bibliothèque du site ; la ligne « Téléchargements » comptera chaque téléchargement autorisé.',
              note: 'Pas de planification ni d’onglet SEO pour les ressources. Seules les ressources « Public » entrent dans le plan du site.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les niveaux d’accès',
          items: [
            { label: 'Public', tone: 'success', meaning: 'Téléchargeable par tous les visiteurs. Fichier stocké en public.' },
            { label: 'Membres', tone: 'info', meaning: 'Réservé aux personnes connectées. Fichier stocké en privé, servi par un lien signé valable 15 minutes.' },
            { label: 'Organisation', tone: 'info', meaning: 'Réservé aux membres de l’organisation rattachée (ou de toute organisation si aucune n’est rattachée). Fichier privé.' },
            { label: 'Premium', tone: 'warning', meaning: 'Réservé aux personnes ayant payé l’offre créée à partir du tarif. Fichier privé.', next: 'Les paiements sont suivis par la Finance.' },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Données personnelles et documents internes',
          text: 'Ne déposez jamais en « Public » un document contenant des noms, des adresses ou des informations syndicales internes (listes de membres, procès-verbaux nominatifs). Choisissez le niveau « Membres » ou « Organisation », ou ne le déposez pas sur le site.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Indiquez un fichier ou une URL externe. » s’affiche.',
              cause: 'Aucun fichier n’a été envoyé et le champ **URL externe** est vide.',
              solution: 'Cliquez sur `Choisir un fichier` et attendez le message « envoyé », ou collez l’adresse complète (https://…) du document.',
            },
            {
              problem: 'Un membre me dit que le lien du document « ne marche plus ».',
              cause: 'Il a copié un lien signé, valable 15 minutes seulement.',
              solution: 'Demandez-lui d’ouvrir la page de la ressource sur le site et de cliquer de nouveau sur le bouton de téléchargement, connecté avec son compte.',
            },
            {
              problem: 'Le fichier est refusé (« Type de fichier non autorisé »).',
              cause: 'Format non pris en charge (image, archive ZIP, SVG…).',
              solution: 'Convertissez le document en PDF, ou déposez une image via la médiathèque plutôt qu’en ressource.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'mediatheque',
      title: 'Comment gérer la médiathèque',
      icon: 'image',
      summary: 'Envoyer des fichiers réutilisables, compléter les textes alternatifs, copier une adresse, supprimer un fichier.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La médiathèque rassemble tous les fichiers envoyés (images, documents, audio, vidéo), y compris ceux ajoutés depuis les formulaires de page, d’actualité, de ressource, d’événement ou de partenaire. Chaque fichier est rangé dans un dossier (« pages », « actualites », « ressources », « evenements », « intervenants », « partenaires », « uploads »…) et porte une visibilité : Public ou Privé (lien signé).',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Médias'], href: '/admin/medias' },
        {
          type: 'table',
          caption: 'Formats et tailles acceptés',
          columns: ['Type', 'Formats', 'Taille maximale'],
          rows: [
            ['Images', 'JPEG, PNG, WebP, GIF, AVIF (SVG refusé)', '8 Mo'],
            ['Documents', 'PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ODT, TXT, CSV', '25 Mo'],
            ['Audio', 'MP3, MP4 audio, OGG, WAV, WebM', '60 Mo'],
            ['Vidéo', 'MP4, WebM', '200 Mo'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'À propos de « Images (12 Mo) »',
          text: 'Le dialogue d’envoi annonce « Images (12 Mo) », mais la limite réellement appliquée aux images est de 8 Mo. Pour le web, une image de moins de 500 Ko suffit largement : réduisez vos photos avant de les envoyer.',
        },
        {
          type: 'steps',
          title: 'Envoyer un fichier',
          items: [
            {
              text: 'Ouvrez **Médias** puis cliquez sur `Envoyer un fichier`.',
              where: 'menu de gauche, section « Contenus » ; bouton à droite au-dessus de la grille',
              result: 'Le dialogue « Envoyer un fichier » s’ouvre.',
            },
            {
              text: 'Choisissez le **Fichier** (obligatoire).',
              note: 'Renommez-le clairement avant l’envoi (« communique-smig-2026.pdf ») : le nom d’origine est conservé et affiché.',
            },
            {
              text: 'Indiquez le **Dossier** (minuscules, chiffres, tirets ; « uploads » par défaut) en choisissant une suggestion ou en saisissant un nom.',
            },
            {
              text: 'Choisissez la **Visibilité** : Public, ou Privé (lien signé) pour un fichier réservé.',
              note: 'Un fichier privé n’a pas d’adresse publique : on copie sa « clé », pas son URL, et il est servi par un lien temporaire.',
            },
            {
              text: 'Pour une image, saisissez le **Texte alternatif** (300 caractères maximum) et, si utile, une **Légende** (500 caractères).',
              note: 'Le texte alternatif décrit l’image pour les lecteurs d’écran. Il est indispensable pour une image qui porte une information (affiche, graphique, photo d’événement).',
            },
            {
              text: 'Cliquez sur `Envoyer`.',
              result: 'Le bouton affiche « Envoi en cours », puis le message « « {fichier} » envoyé. » apparaît et la page se recharge avec le nouveau fichier en tête de grille.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Retrouver, réutiliser et corriger un fichier',
          items: [
            {
              text: 'Filtrez la grille avec le champ **Nom de fichier, texte alternatif** et les listes **Dossier**, **Type** (Images, Documents, Vidéos, Audio) et **Visibilité** (Publics, Privés), puis cliquez sur `Filtrer`.',
              result: 'La grille affiche les fichiers correspondants (24 par page) avec le compteur « N fichier(s) ».',
            },
            {
              text: 'Cliquez sur `Copier l’URL` (ou `Copier la clé` pour un fichier privé) sur la carte du fichier.',
              result: 'Le message « URL copiée » (ou « Clé copiée ») apparaît. Collez l’adresse dans un champ « Saisir une URL » d’un formulaire ou dans un lien de l’éditeur de texte.',
            },
            {
              text: 'Cliquez sur `Modifier` pour compléter le **Texte alternatif**, la **Légende** ou changer le **Dossier**, puis sur `Enregistrer`.',
              note: 'Les images sans texte alternatif portent l’avertissement or « Texte alternatif manquant » : traitez-les en priorité.',
              result: 'Le message « Média mis à jour. » apparaît.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Supprimer un fichier est définitif',
          text: 'Le dialogue rappelle : « Le fichier est retiré du stockage. Les contenus qui l’utilisent afficheront un lien cassé. » Avant de cliquer sur `Supprimer`, vérifiez qu’aucune page, actualité, ressource ou fiche partenaire n’utilise ce fichier. Dans le doute, laissez-le.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Copie impossible dans ce navigateur » s’affiche.',
              cause: 'Le navigateur bloque l’accès au presse-papiers (navigation privée, ancien navigateur).',
              solution: 'Ouvrez le fichier dans un nouvel onglet et copiez son adresse depuis la barre d’adresse, ou utilisez un autre navigateur.',
            },
            {
              problem: 'Le message « Dossier invalide » s’affiche.',
              cause: 'Le nom du dossier contient des majuscules, des espaces ou des accents.',
              solution: 'Utilisez seulement des minuscules, des chiffres et des tirets (« evenements-2026 »).',
            },
            {
              problem: 'Le message « Le fichier est vide » s’affiche.',
              cause: 'Le fichier sélectionné fait 0 octet (export raté, téléchargement interrompu).',
              solution: 'Ouvrez le fichier sur votre appareil pour vérifier qu’il fonctionne, puis renvoyez-le.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'gerer-les-categories',
      title: 'Comment gérer les catégories',
      icon: 'tag',
      summary: 'Créer, modifier et supprimer les catégories qui classent actualités, ressources, formations, services et événements.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une catégorie appartient à un domaine : Actualités, Ressources, Formations, Services ou Événements. Les catégories « Actualités » alimentent le filtre de la page des actualités, celles de « Ressources » le filtre de la bibliothèque. Les catégories « Formations » sont partagées avec la coordination de la plateforme et celles de « Services » avec le responsable des services : prévenez-les avant de modifier les leurs.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Catégories'], href: '/admin/categories' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Catégories**, filtrez par **Domaine** si besoin, puis cliquez sur `Nouvelle catégorie`.',
              where: 'menu de gauche, section « Contenus » ; bouton en haut à droite',
              result: 'Le dialogue « Nouvelle catégorie » s’ouvre, le domaine pré-rempli avec le filtre courant.',
            },
            {
              text: 'Saisissez le **Nom** (obligatoire, 2 à 120 caractères) et vérifiez le **Domaine**.',
            },
            {
              text: 'Complétez si besoin la **Description** (500 caractères), le **Slug** (généré si vide), la **Couleur** (sélecteur, format #RRGGBB, bleu FETRAG par défaut) et l’**Ordre** (nombre à partir de 0 ; les petites valeurs s’affichent en premier).',
            },
            {
              text: 'Cliquez sur `Créer la catégorie`.',
              result: 'Le message « Catégorie « {nom} » enregistrée. » apparaît et le dialogue se ferme.',
            },
            {
              text: 'Pour modifier une catégorie, cliquez sur `Modifier` sur sa ligne, changez les champs, puis cliquez sur `Enregistrer`.',
              where: 'à droite de la ligne (les colonnes Domaine, Utilisations et Ordre sont masquées sur mobile)',
            },
            {
              text: 'Pour supprimer une catégorie inutilisée, cliquez sur `Supprimer` puis confirmez avec `Supprimer` dans le dialogue « Supprimer « {nom} » ? ».',
              note: 'La suppression est refusée tant que des contenus utilisent la catégorie (« Cette catégorie est encore utilisée par des contenus ») : la colonne « Utilisations » vous indique combien.',
              result: 'Le message « Élément supprimé. » apparaît.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Couleur hexadécimale attendue (#RRGGBB) » s’affiche.',
              cause: 'La couleur a été saisie à la main dans un autre format.',
              solution: 'Utilisez le sélecteur de couleur, ou saisissez un code de six caractères précédé de # (par exemple #0259C7).',
            },
            {
              problem: 'Je ne peux pas supprimer une catégorie pourtant vide de mes contenus.',
              cause: 'Des formations, services ou événements gérés par d’autres rôles l’utilisent encore.',
              solution: 'Regardez la colonne « Utilisations » et demandez à la coordination ou au responsable des services de reclasser leurs contenus.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'gerer-la-faq',
      title: 'Comment gérer les questions fréquentes',
      icon: 'help-circle',
      summary: 'Ajouter, modifier, masquer et supprimer les questions affichées sur la page FAQ du site et dans les blocs de page.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les questions fréquentes sont regroupées par thème et affichées dans l’ordre choisi sur la page FAQ du site. Les thèmes connus du site portent un titre lisible : general (« Questions générales »), adhesion (« Adhésion et affiliation »), formation (« Formation et certificats »), services (« Services aux adhérents »), evenements (« Événements »), paiement (« Paiements et reçus »), compte (« Compte et sécurité »). Un autre thème s’affiche avec son nom technique.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'FAQ'], href: '/admin/faq' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **FAQ** puis cliquez sur `Nouvelle question`.',
              where: 'menu de gauche, section « Contenus » ; bouton en haut à droite',
              result: 'Le dialogue « Nouvelle question fréquente » s’ouvre.',
            },
            {
              text: 'Saisissez la **Question** (obligatoire, 5 à 300 caractères), formulée comme la poserait un membre.',
            },
            {
              text: 'Saisissez la **Réponse** (obligatoire, 2 à 20 000 caractères) en texte simple ou en HTML léger (paragraphes, listes, liens).',
              note: 'La réponse est nettoyée à l’enregistrement. Restez court : trois à cinq phrases, puis un lien vers la page utile.',
            },
            {
              text: 'Choisissez le **Thème** (minuscules, chiffres et tirets ; « general » par défaut) parmi les suggestions, et l’**Ordre** (nombre à partir de 0).',
            },
            {
              text: 'Laissez la case **Visible** cochée, puis cliquez sur `Ajouter la question`.',
              result: 'Le message « Question enregistrée. » apparaît ; la question est en ligne immédiatement, sans étape de publication.',
            },
            {
              text: 'Pour masquer une question sans la supprimer : `Modifier`, décochez **Visible**, puis `Enregistrer`.',
              result: 'Le badge passe de « Visible » (vert) à « Masquée » (gris) ; la question disparaît de la page FAQ.',
            },
            {
              text: 'Pour supprimer définitivement : `Supprimer`, puis `Supprimer` dans le dialogue « Supprimer cette question ? ».',
              result: 'Le message « Élément supprimé. » apparaît.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Questions dans une page',
          text: 'Un bloc « Questions fréquentes » d’une page institutionnelle peut afficher les questions d’un thème donné : indiquez le nom du thème dans le bloc (onglet `Blocs` de la page). Les questions se gèrent toujours depuis le menu **FAQ**.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Groupe invalide (minuscules, chiffres, tirets) » s’affiche.',
              cause: 'Le thème contient une majuscule, un espace ou un accent.',
              solution: 'Écrivez le thème en minuscules sans accent : « adhesion » et non « Adhésion ».',
            },
            {
              problem: 'Ma question apparaît sous un titre bizarre sur le site.',
              cause: 'Le thème saisi n’est pas l’un des sept thèmes connus : il s’affiche avec son nom technique.',
              solution: 'Reclassez la question dans l’un des thèmes connus, ou demandez au super administrateur d’ajouter le nouveau thème au site.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'programmer-un-evenement',
      title: 'Comment programmer un événement et suivre les inscrits',
      icon: 'calendar',
      summary: 'Créer l’événement, ouvrir les inscriptions en le publiant, marquer les présences le jour J et exporter la liste des participants.',
      blocks: [
        {
          type: 'paragraph',
          text: 'L’agenda regroupe les événements de la Fédération : master class, webinaires, assemblées, formations ponctuelles. Une fois l’événement publié, les visiteurs connectés s’inscrivent depuis le site ; au-delà de la capacité, ils rejoignent automatiquement une liste d’attente. Les inscriptions se ferment d’elles-mêmes quand la date est passée.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Relations', 'Événements', 'Nouvel événement'], href: '/admin/evenements/nouveau' },
      ],
      subsections: [
        {
          id: 'creer-un-evenement',
          title: 'Créer l’événement',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Événements** puis cliquez sur `Nouvel événement`.',
                  where: 'menu de gauche, section « Relations » ; bouton en haut à droite',
                  result: 'Le formulaire « Nouvel événement » s’affiche avec les onglets `Général`, `Dates et lieu`, `Intervenant`, `Inscriptions`, `SEO` (ils défilent horizontalement sur mobile).',
                },
                {
                  text: 'Onglet `Général` : saisissez le **Titre** (obligatoire), le **Type** (Événement, Master Class, Webinaire, Assemblée, Formation), le **Résumé** (600 caractères, affiché dans l’agenda), le **Programme et description** (éditeur de texte riche), la **Catégorie** et le **Visuel** (image).',
                  note: 'Cochez **Mettre en avant** pour afficher l’événement sur la page d’accueil et en tête de l’agenda.',
                },
                {
                  text: 'Onglet `Dates et lieu` : renseignez le **Début** (obligatoire, date et heure de Libreville), la **Fin** (facultative, après le début) et la **Modalité** : Présentiel, Classe virtuelle ou Hybride.',
                  note: 'En Présentiel, renseignez la **Ville** et le **Lieu** (salle, adresse) ; en Classe virtuelle, le **Lien de la classe virtuelle** (transmis aux inscrits dans la convocation) ; en Hybride, les deux. Le champ inutile est masqué automatiquement.',
                },
                {
                  text: 'Onglet `Intervenant` : indiquez le **Nom**, la **Fonction**, la **Biographie** et le **Portrait** de l’intervenant principal (tous facultatifs).',
                  note: 'Portrait vertical recommandé : 600 × 900 pixels. Demandez l’accord de la personne avant de publier sa photo.',
                },
                {
                  text: 'Onglet `Inscriptions` : fixez la **Capacité** (vide = illimitée ; au-delà, liste d’attente automatique) et laissez **Événement gratuit** coché, ou décochez-le et saisissez le **Tarif (XAF)** (entier strictement positif).',
                  note: 'Cochez **Délivre une attestation de participation** si les personnes marquées présentes doivent recevoir une attestation FETRAG.',
                },
                {
                  text: 'Onglet `SEO` : complétez si besoin, puis cliquez sur `Créer l’événement`.',
                  result: 'La fiche s’ouvre avec le bandeau « L’événement a été créé en brouillon. Publiez-le pour ouvrir les inscriptions. »',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « La date de fin doit être postérieure à la date de début » s’affiche.',
                  cause: 'La fin est avant le début (souvent une erreur de jour ou d’heure).',
                  solution: 'Corrigez la **Fin** ou laissez-la vide pour un événement sans heure de fin.',
                },
                {
                  problem: 'Le message « Un événement payant doit avoir un tarif strictement positif » s’affiche.',
                  cause: 'La case **Événement gratuit** est décochée mais le tarif est vide ou à 0.',
                  solution: 'Saisissez le tarif en francs CFA, ou recochez **Événement gratuit**.',
                },
              ],
            },
          ],
        },
        {
          id: 'publier-un-evenement',
          title: 'Publier et ouvrir les inscriptions',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Relisez la fiche, puis cliquez sur `Actions` et `Publier`.',
                  where: 'panneau « Publication »',
                  result: 'Le message « « {titre} » a été publié. » apparaît. Le panneau affiche « Tarif », « Places » (« N restante(s) » ou « Illimitées ») et « Attestation ».',
                },
                {
                  text: 'Cliquez sur `Voir en ligne` pour vérifier l’événement dans l’agenda du site.',
                  result: 'La page publique affiche le bouton d’inscription. Un événement payant renvoie vers le paiement en ligne.',
                },
                {
                  text: 'Communiquez : rédigez une actualité qui renvoie vers l’adresse de l’événement (voir « Rédiger une actualité »).',
                  note: 'Les inscrits reçoivent automatiquement l’email « Inscription confirmée : {titre} » ou « Liste d’attente : {titre} ». Aucun rappel automatique n’est envoyé la veille : si nécessaire, prévenez-les depuis votre messagerie avec l’export CSV.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Modifier un événement publié',
              text: 'Changer la date, le lieu ou le lien de classe virtuelle après publication n’envoie aucun email aux inscrits. Prévenez-les vous-même (export CSV puis message depuis votre messagerie).',
            },
          ],
        },
        {
          id: 'suivre-les-participants',
          title: 'Suivre les inscrits, marquer les présences et exporter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la fiche de l’événement et faites défiler jusqu’à la carte **Participants**.',
                  where: 'sous le formulaire',
                  result: 'La ligne « N inscrits · N présents · N en liste d’attente » et le tableau des participants (nom, email, téléphone, employeur, date d’inscription, statut) s’affichent. Vide : « Aucun inscrit ».',
                },
                {
                  text: 'Le jour de l’événement, cliquez sur `Présent` sur la ligne de chaque personne présente.',
                  where: 'colonne « Présence », à droite',
                  result: 'Le message « Participant marqué présent. » apparaît et le badge passe à « Présent ». `Retirer` annule la présence (« Présence retirée. »).',
                  note: 'Seuls les participants « Inscrit » peuvent être marqués présents : une personne en liste d’attente ou annulée ne l’est pas.',
                },
                {
                  text: 'Cliquez sur `Exporter (CSV)` pour obtenir la feuille d’émargement.',
                  where: 'en haut de la carte « Participants » (visible dès qu’il y a au moins un participant)',
                  result: 'Le fichier « participants-{slug}.csv » se télécharge (colonnes Nom, Email, Téléphone, Employeur, Statut, Inscrit le, Présent le, Commande). L’export est enregistré dans le journal d’audit.',
                },
                {
                  text: 'Après l’événement, renseignez le **Lien du replay** (onglet `Dates et lieu`) puis cliquez sur `Enregistrer l’événement`.',
                  result: 'Le message « Événement « {titre} » enregistré. » apparaît.',
                },
                {
                  text: 'Quand l’événement n’a plus lieu d’être affiché, cliquez sur `Actions` puis `Archiver`.',
                  note: 'Un événement passé reste visible dans la partie « passés » de l’agenda tant qu’il est publié, avec le badge « Passé » dans la liste du back-office.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts d’un participant',
              items: [
                { label: 'Inscrit', tone: 'success', meaning: 'Inscription confirmée ; compte dans les places occupées.', next: 'Marquez-le `Présent` le jour J.' },
                { label: 'Liste d’attente', tone: 'warning', meaning: 'La capacité était atteinte. Pour un événement gratuit, la première personne en attente est promue automatiquement quand un inscrit annule (email « Une place s’est libérée »).', next: 'Augmentez la **Capacité** si vous pouvez accueillir plus de monde.' },
                { label: 'Annulé', tone: 'neutral', meaning: 'La personne a annulé son inscription.' },
                { label: 'Présent', tone: 'info', meaning: 'Présence marquée par vous ; la personne reçoit l’attestation si l’option est cochée.', next: '`Retirer` en cas d’erreur.' },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Données personnelles des participants',
              text: 'L’export contient noms, emails, téléphones et employeurs. Conservez-le sur un appareil protégé, ne le transmettez qu’aux personnes qui en ont besoin pour l’événement et supprimez-le ensuite.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Seuls les inscrits confirmés peuvent être marqués présents » s’affiche.',
                  cause: 'La personne est en liste d’attente ou a annulé.',
                  solution: 'Si elle est bien présente, augmentez la capacité puis demandez-lui de se réinscrire, ou notez sa présence sur la feuille papier.',
                },
                {
                  problem: 'Le bouton `Exporter (CSV)` n’apparaît pas.',
                  cause: 'Aucun participant n’est encore inscrit.',
                  solution: 'Le bouton apparaît dès la première inscription.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'gerer-les-partenaires',
      title: 'Comment ajouter ou masquer un partenaire',
      icon: 'handshake',
      summary: 'Les organisations affiliées, partenaires et institutions dont le logo défile sur l’accueil et qui figurent sur la page des organisations.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les partenaires n’ont pas de cycle de publication : une fiche « Visible sur le site » apparaît immédiatement dans le bandeau des logos de l’accueil et sur la page des organisations. Quatre types existent : Organisation affiliée, Partenaire, Institution, Partenaire international.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Relations', 'Partenaires et organisations', 'Nouveau partenaire'], href: '/admin/partenaires/nouveau' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Partenaires et organisations** puis cliquez sur `Nouveau partenaire`.',
              where: 'menu de gauche, section « Relations » ; bouton en haut à droite',
              result: 'Le formulaire « Nouveau partenaire » s’affiche avec les cartes « Identité » et « Logo et coordonnées ».',
            },
            {
              text: 'Carte « Identité » : saisissez le **Nom** (obligatoire, 2 à 160 caractères), le **Sigle** (30 caractères ; il sert de base au slug), le **Type**, le **Secteur** (par exemple « énergie et pétrole »), l’**Ordre d’affichage** (les petites valeurs en premier) et la **Présentation** (2 000 caractères).',
            },
            {
              text: 'Carte « Logo et coordonnées » : envoyez le **Logo** avec `Choisir un fichier` (PNG ou WebP sur fond transparent ou blanc ; SVG refusé), puis renseignez le **Site web**, la **Ville** et le **Pays (code ISO)** (GA par défaut).',
              note: 'Le logo doit être lisible sur fond blanc. Demandez au partenaire son logo officiel plutôt que de le récupérer sur Internet.',
            },
            {
              text: 'Laissez **Visible sur le site** coché, puis cliquez sur `Créer le partenaire`.',
              result: 'La fiche s’ouvre avec le bandeau « Le partenaire a été enregistré et apparaît immédiatement sur le site s’il est visible. »',
            },
            {
              text: 'Pour retirer temporairement un partenaire : ouvrez sa fiche, décochez **Visible sur le site**, puis cliquez sur `Enregistrer`.',
              result: 'Le badge de la carte « Fiche » passe à « Masqué » et le logo disparaît du site. La fiche est conservée.',
            },
            {
              text: 'Pour retirer définitivement : `Supprimer le partenaire` (carte « Fiche »), puis confirmez.',
              note: 'Le dialogue rappelle : « Cette action est définitive. Préférez masquer le partenaire si la relation est suspendue. »',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Suppression définitive',
          text: 'Un partenaire supprimé ne peut pas être récupéré. Masquez plutôt que supprimer, sauf en cas d’erreur de saisie (doublon).',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le logo est flou ou déformé dans le bandeau.',
              cause: 'Image trop petite ou fond non transparent.',
              solution: 'Demandez un logo d’au moins 600 pixels de large en PNG ou WebP, puis remplacez le fichier avec `Remplacer le fichier`.',
            },
            {
              problem: 'Le message « Ce slug est déjà utilisé » s’affiche.',
              cause: 'Un partenaire avec le même sigle ou nom court existe déjà (doublon probable).',
              solution: 'Recherchez le partenaire existant dans la liste avant de créer un doublon ; sinon, saisissez un slug différent.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'modifier-un-menu',
      title: 'Comment modifier un menu de navigation',
      icon: 'list-tree',
      summary: 'Les quatre emplacements de menus, l’ajout et le classement des entrées, les sous-menus.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Quatre emplacements sont éditables : « Navigation principale » (barre de navigation du site), « Pied de page » (colonnes de liens), « Pied de page secondaire » (liens légaux et utilitaires) et « Navigation de la plateforme de formation ». Un menu vide laisse la navigation par défaut. Deux niveaux au plus : des entrées et leurs sous-entrées.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Effet sur le site',
          text: 'Dans la version actuelle, le site et la plateforme de formation affichent encore leur navigation par défaut : les menus enregistrés ici sont conservés mais pas encore appliqués à l’écran. Préparez-les sans attendre un changement visible ; le super administrateur vous informera de leur mise en service.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Menus'], href: '/admin/menus' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Menus** puis cliquez sur `Modifier l’arborescence` sur la carte de l’emplacement voulu.',
              where: 'menu de gauche, section « Contenus » ; quatre cartes avec le badge « N entrée(s) »',
              result: 'L’éditeur du menu s’ouvre avec le champ **Nom du menu**, la liste des entrées et, en bas, les boutons `Ajouter une entrée` et `Enregistrer le menu`. Vide : « Ce menu est vide. Ajoutez une première entrée. »',
            },
            {
              text: 'Cliquez sur `Ajouter une entrée`.',
              result: 'Une carte d’entrée apparaît avec les champs **Libellé**, **Adresse** et **Icône**.',
            },
            {
              text: 'Saisissez le **Libellé** (obligatoire, 1 à 80 caractères) et l’**Adresse** (obligatoire : un chemin du site comme /formations, ou une adresse https://).',
              note: 'L’**Icône** (nom d’icône lucide, par exemple « calendar ») est facultative. Cochez **Lien externe** pour une adresse hors du site ; c’est automatique pour une adresse https://.',
            },
            {
              text: 'Classez les entrées avec les boutons icône « Monter » et « Descendre ».',
              note: 'Sur ordinateur, vous pouvez aussi glisser une entrée avec la poignée « Glisser pour réordonner » ; cette poignée est masquée sur téléphone.',
            },
            {
              text: 'Pour créer un sous-menu : cliquez sur « Ajouter une sous-entrée » sur une entrée de premier niveau, ou sur « Transformer en sous-menu » pour placer une entrée sous l’entrée précédente.',
              note: '« Remonter d’un niveau » fait l’inverse. Le bouton « Supprimer {libellé} » retire l’entrée sans confirmation : attention.',
              result: 'Les sous-entrées apparaissent indentées avec un filet vert.',
            },
            {
              text: 'Cliquez sur `Enregistrer le menu`.',
              where: 'en bas de la page',
              result: 'Le message « Menu « {nom} » enregistré (N entrée(s) de premier niveau). » apparaît. L’arbre entier remplace l’ancien.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'L’enregistrement remplace tout le menu',
          text: 'Les entrées supprimées dans l’éditeur disparaissent définitivement à l’enregistrement. Limites : 40 entrées de premier niveau, 30 sous-entrées par entrée, 120 entrées au total.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « URL invalide (http(s) ou chemin relatif) » s’affiche.',
              cause: 'L’adresse ne commence ni par / ni par https://.',
              solution: 'Pour une page du site, commencez par une barre oblique (« /actualites ») ; pour un site externe, collez l’adresse complète.',
            },
            {
              problem: 'Le message « Nom d’icône lucide invalide » s’affiche.',
              cause: 'Le nom contient des majuscules, des espaces ou des accents.',
              solution: 'Laissez le champ vide, ou utilisez un nom en minuscules avec des tirets (« file-text »).',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'traiter-les-messages-recus',
      title: 'Comment traiter un message reçu depuis le site',
      icon: 'inbox',
      summary: 'Lire, répondre par email, changer le statut, attribuer un responsable, exporter et supprimer les messages des formulaires du site.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chaque formulaire du site (contact, demande d’adhésion ou d’information, proposition de partenariat, assistance, demande de service) crée un message avec une référence MSG-… L’expéditeur reçoit automatiquement un accusé de réception qui promet une réponse sous 48 heures ouvrées : c’est votre délai. Vous êtes notifié des messages Contact, Adhésion / intérêt et Partenariat ; les messages « Demande de service » sont destinés au responsable des services et « Assistance » au support, mais vous les voyez aussi.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Relations', 'Messages reçus'], href: '/admin/messages' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Messages reçus**.',
              where: 'menu de gauche, section « Relations » ; la pastille indique le nombre de messages « Nouveau »',
              result: 'Les tuiles « Nouveaux », « Attribués », « Répondus », « Clôturés » et la liste s’affichent ; les lignes « Nouveau » sont surlignées en or clair.',
            },
            {
              text: 'Filtrez si besoin avec le champ de recherche (référence, nom, email, objet ou texte), les listes **Statut**, **Type** et **Responsable**, puis cliquez sur `Filtrer`.',
            },
            {
              text: 'Cliquez sur l’objet du message pour l’ouvrir.',
              result: 'La fiche affiche l’expéditeur (nom, email, téléphone), le badge de type, le texte du message, la carte « Informations complémentaires » (organisation, secteur, employeur, fonction, intérêt…) et les cartes « Traitement » et « Attribution ».',
            },
            {
              text: 'Cliquez sur `Répondre par email`.',
              where: 'carte « Traitement »',
              result: 'Votre messagerie s’ouvre avec l’objet « [FETRAG {référence}] Votre message ». Rédigez et envoyez la réponse depuis votre messagerie.',
              note: 'Restez courtois et factuel ; ne promettez rien qui dépasse votre mandat. Pour une demande d’adhésion, joignez les informations pratiques ou orientez vers la page du site.',
            },
            {
              text: 'Revenez sur la fiche et cliquez sur `Marquer répondu`.',
              result: 'Le message « Message {référence} mis à jour. » apparaît ; la date de réponse est enregistrée.',
            },
            {
              text: 'Pour confier le message à un collègue : carte **Attribution**, choisissez le **Responsable**, puis cliquez sur `Enregistrer`.',
              result: 'Le message « Message attribué. » apparaît ; un message « Nouveau » passe en « Attribué ».',
            },
            {
              text: 'Une fois le dossier terminé, cliquez sur `Clôturer`. Pour un spam, cliquez sur `Indésirable`. En cas d’erreur, `Remettre en nouveau`.',
              note: 'Les boutons affichés dépendent du statut courant.',
            },
            {
              text: 'Pour exporter la liste (selon les filtres en cours, 5 000 lignes maximum), cliquez sur `Exporter (CSV)` en haut de la liste.',
              result: 'Un fichier CSV se télécharge ; l’export est enregistré dans le journal d’audit.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’un message',
          items: [
            { label: 'Nouveau', tone: 'warning', meaning: 'Message à lire, personne ne s’en occupe encore.', next: 'Ouvrez-le, répondez ou attribuez-le.' },
            { label: 'Attribué', tone: 'info', meaning: 'Un responsable est désigné.', next: 'Le responsable répond puis marque le message répondu.' },
            { label: 'Répondu', tone: 'success', meaning: 'Une réponse a été envoyée ; la date est enregistrée.', next: 'Clôturez quand l’échange est terminé.' },
            { label: 'Clôturé', tone: 'neutral', meaning: 'Dossier terminé.', next: 'Peut être supprimé (droit à l’effacement).' },
            { label: 'Indésirable', tone: 'danger', meaning: 'Spam ou message sans objet.', next: 'Peut être supprimé.' },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Supprimer un message',
          text: 'Le bouton `Supprimer le message` n’est utilisable que pour un message « Indésirable » ou « Clôturé ». La suppression est définitive (« droit à l’effacement ou message indésirable »). Ne supprimez un message clôturé qu’à la demande de son expéditeur ou selon la règle de conservation fixée par la Fédération.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '`Répondre par email` n’ouvre rien.',
              cause: 'Aucune application de messagerie n’est associée au navigateur (fréquent sur ordinateur partagé).',
              solution: 'Copiez l’adresse email de l’expéditeur (lien sous son nom) et la référence MSG-…, puis écrivez depuis votre messagerie habituelle en indiquant « [FETRAG {référence}] » dans l’objet.',
            },
            {
              problem: 'Le lien « compte {nom} » affiche « Accès refusé ».',
              cause: 'Il mène à la fiche utilisateur, réservée au super administrateur.',
              solution: 'C’est normal pour votre rôle. Les informations nécessaires sont déjà sur la fiche du message.',
            },
            {
              problem: 'Le message « Seuls les messages indésirables ou clôturés peuvent être supprimés » s’affiche.',
              cause: 'Le message est encore Nouveau, Attribué ou Répondu.',
              solution: 'Clôturez-le d’abord (ou classez-le Indésirable), puis supprimez-le.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'gerer-la-newsletter',
      title: 'Comment gérer les abonnés à la lettre d’information',
      icon: 'mail',
      summary: 'Consulter, exporter et supprimer les abonnés ; ce que le site fait et ne fait pas.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les visiteurs s’abonnent depuis le pied de page ou le formulaire de contact. L’inscription se fait en deux temps (double opt-in) : la personne reçoit l’email « Confirmez votre inscription à la lettre d’information FETRAG » et doit cliquer sur son lien. Le back-office gère la liste des abonnés, l’export des consentements et la suppression. Il n’envoie aucune lettre : l’envoi se fait avec un outil externe choisi par la Fédération.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Relations', 'Newsletter'], href: '/admin/newsletter' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Newsletter**.',
              where: 'menu de gauche, section « Relations »',
              result: 'Les tuiles « Abonnés confirmés », « En attente de confirmation », « Désinscrits » et la liste des adresses s’affichent.',
            },
            {
              text: 'Filtrez sur **État** = Confirmé, puis cliquez sur `Exporter (CSV)`.',
              where: 'bouton en haut de la page',
              result: 'Un fichier CSV se télécharge (Email, État, Inscrit le, Confirmé le, Désinscrit le, Source ; 20 000 lignes maximum). L’export est enregistré dans le journal d’audit.',
            },
            {
              text: 'Importez uniquement les adresses « Confirmé » dans l’outil d’envoi, et retirez-en les « Désinscrit » à chaque nouvel envoi.',
              note: 'Les dates de confirmation servent de preuve du consentement. N’ajoutez jamais une adresse qui ne s’est pas abonnée elle-même.',
            },
            {
              text: 'Pour supprimer un abonné à sa demande : cliquez sur `Supprimer` sur sa ligne, puis confirmez.',
              note: 'Le dialogue rappelle : « L’adresse et son historique de consentement sont effacés définitivement. »',
              result: 'Le message « Abonné supprimé. » apparaît.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Fichier d’abonnés',
          text: 'L’export contient des adresses personnelles. Conservez-le sur un appareil protégé, ne le partagez pas en dehors de l’équipe communication et supprimez les anciennes versions.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Une personne dit s’être abonnée mais reste « En attente de confirmation ».',
              cause: 'Elle n’a pas cliqué sur le lien de l’email de confirmation (souvent dans les indésirables).',
              solution: 'Demandez-lui de chercher l’email « Confirmez votre inscription… » et de cliquer sur son lien, ou de se réinscrire depuis le site (un nouvel envoi est possible après 10 minutes).',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'consulter-les-rapports',
      title: 'Comment consulter l’audience et exporter les rapports',
      icon: 'bar-chart',
      summary: 'Les indicateurs du site sur 30 jours, les contenus populaires et les exports CSV.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Administration', 'Rapports'], href: '/admin/rapports' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Rapports** (ou cliquez sur `Rapports détaillés` sur le tableau de bord).',
              where: 'menu de gauche, section « Administration »',
              result: 'La section « Site institutionnel · 30 derniers jours » affiche les tuiles « Pages vues », « Formulaires reçus », « Inscriptions aux événements », « Conversion des commandes », puis les cartes « Visites » et « Formulaires et recherches » (avec les « Recherches fréquentes »).',
            },
            {
              text: 'Consultez la carte **Contenus populaires** : actualités les plus vues, ressources les plus téléchargées, formations et événements avec le plus d’inscriptions.',
              note: 'Les « Recherches fréquentes » vous indiquent ce que les visiteurs cherchent sans trouver : une bonne source d’idées d’actualités, de ressources ou de questions fréquentes.',
            },
            {
              text: 'Dans la carte **Exports CSV**, cliquez sur `Indicateurs du site`, `Indicateurs de formation` ou `Contenus populaires`.',
              result: 'Un fichier « fetrag-rapport-{type}-{date}.csv » se télécharge (UTF-8, séparateur point-virgule). Chaque export est enregistré dans le journal d’audit. Ces fichiers ne contiennent aucune donnée personnelle.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Indicateurs indisponibles » s’affiche.',
              cause: 'Le calcul des statistiques a échoué momentanément.',
              solution: 'Réessayez dans quelques instants. Si le problème persiste plusieurs heures, signalez-le au super administrateur.',
            },
            {
              problem: 'Le bouton `Rapports détaillés du LMS` affiche « Accès refusé ».',
              cause: 'Il mène à l’espace de coordination de la plateforme de formation, réservé au coordinateur.',
              solution: 'C’est normal pour votre rôle. Les indicateurs de formation utiles vous sont déjà présentés sur la page « Rapports ».',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'supprimer-un-contenu',
      title: 'Comment supprimer un contenu (et quand ne pas le faire)',
      icon: 'trash',
      summary: 'La suppression est définitive : préférez archiver ou masquer.',
      blocks: [
        {
          type: 'callout',
          tone: 'danger',
          title: 'Aucune corbeille',
          text: 'La suppression est physique et immédiate : une page part avec toutes ses versions, un événement avec ses inscriptions, une actualité avec ses statistiques. Préférez `Archiver` (pages, actualités, ressources, événements) ou masquer (partenaires, questions fréquentes) pour conserver l’historique. Ne supprimez que les doublons et les erreurs de saisie.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez le menu d’actions du contenu (liste) ou le bouton `Actions` du panneau « Publication » (fiche), puis cliquez sur `Supprimer`.',
              result: 'Le dialogue « Supprimer « {titre} » ? » s’ouvre : « Cette action est définitive. Les contenus publiés ne peuvent être supprimés que par un rôle disposant du droit de publication. »',
            },
            {
              text: 'Relisez le titre affiché dans le dialogue pour être certain du contenu visé.',
            },
            {
              text: 'Cliquez sur `Supprimer définitivement` (ou `Annuler`).',
              result: 'Le message « Élément supprimé. » apparaît et vous revenez à la liste.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Supprimer ou plutôt retirer ?',
          columns: ['Contenu', 'Pour retirer du site', 'Suppression'],
          rows: [
            ['Page, actualité, ressource, événement', '`Archiver` (ou `Repasser en brouillon`)', 'Définitive ; les versions, inscriptions et statistiques sont perdues.'],
            ['Partenaire', 'Décocher **Visible sur le site**', 'Définitive.'],
            ['Question fréquente', 'Décocher **Visible**', 'Définitive.'],
            ['Catégorie', 'Rien : elle n’est visible que si des contenus l’utilisent', 'Refusée tant qu’elle est utilisée.'],
            ['Fichier de la médiathèque', 'Retirer le fichier des contenus qui l’utilisent', 'Définitive ; les contenus qui l’utilisent affichent un lien cassé.'],
            ['Message reçu', 'Clôturer ou classer Indésirable', 'Définitive ; réservée aux messages clôturés ou indésirables.'],
            ['Abonné à la lettre', 'Il se désinscrit lui-même par le lien de l’email', 'Définitive, à la demande de la personne.'],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Ce qui vous est envoyé, quand, et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vos notifications internes se consultent dans le menu de votre compte (vos initiales, en haut à droite) > **Notifications**. Les emails arrivent à l’adresse de votre compte. Le site ne vous envoie aucun email lors d’une mise en relecture, d’une publication ou d’une publication planifiée : seul le journal d’audit les enregistre.',
        },
        {
          type: 'table',
          caption: 'Notifications et emails de votre rôle',
          columns: ['Sujet', 'Déclencheur', 'Ce qu’il faut faire'],
          rows: [
            ['Notification « Nouveau message : {type} »', 'Un formulaire Contact, Adhésion / intérêt ou Partenariat a été envoyé depuis le site.', 'Ouvrez le lien vers le message, répondez sous 48 heures ouvrées, puis marquez-le répondu.'],
            ['Pastille sur « Messages reçus » (menu)', 'Des messages sont encore au statut « Nouveau ».', 'Traitez-les ou attribuez-les.'],
            ['Pastille sur « Tableau de bord » (menu)', 'Des contenus sont « En relecture ».', 'Relisez-les depuis la carte « Contenus en relecture » puis publiez ou repassez en brouillon.'],
            ['Email « Bienvenue à la FETRAG »', 'Création de votre compte.', 'Conservez-le ; il rappelle l’adresse du compte.'],
            ['Email « Confirmez votre adresse email - FETRAG »', 'Création du compte ou changement d’adresse (lien valable 24 heures).', 'Cliquez sur le lien avant de vous connecter.'],
            ['Email « Votre compte de formation FETRAG est prêt : définissez votre mot de passe »', 'Votre compte a été créé par l’administration (lien valable 7 jours).', 'Cliquez sur le lien et choisissez votre mot de passe.'],
            ['Email « Réinitialisation de votre mot de passe FETRAG »', 'Vous avez demandé un nouveau mot de passe (lien valable 30 minutes).', 'Cliquez sur le lien. Si vous n’avez rien demandé, ignorez l’email et prévenez le support.'],
            ['Email « Votre mot de passe FETRAG a été modifié »', 'Votre mot de passe vient d’être changé.', 'Si ce n’est pas vous, changez-le immédiatement et prévenez le super administrateur.'],
          ],
        },
        {
          type: 'table',
          caption: 'Emails automatiques envoyés à des tiers par les contenus que vous gérez (vous n’en recevez pas de copie)',
          columns: ['Sujet', 'Destinataire', 'Déclencheur'],
          rows: [
            ['« Nous avons bien reçu votre message ({référence}) »', 'L’expéditeur d’un formulaire', 'Envoi d’un formulaire du site ; promet une réponse sous 48 heures ouvrées.'],
            ['« Inscription confirmée : {événement} »', 'Une personne inscrite', 'Inscription à un événement publié.'],
            ['« Liste d’attente : {événement} »', 'Une personne en attente', 'Inscription alors que la capacité est atteinte.'],
            ['« Une place s’est libérée : {événement} »', 'La première personne en attente', 'Un inscrit annule (événement gratuit).'],
            ['« Confirmez votre inscription à la lettre d’information FETRAG »', 'Un nouvel abonné', 'Abonnement depuis le site (double opt-in).'],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques éditoriales et sécurité',
      icon: 'shield-check',
      summary: 'Écrire pour être lu et compris, rendre les contenus accessibles, protéger les données et votre compte.',
      blocks: [
        {
          type: 'list',
          title: 'Rédaction et ton institutionnel',
          style: 'check',
          items: [
            'Écrivez des titres courts et précis (moins de 70 caractères), sans majuscules partout ni points d’exclamation.',
            'Placez l’information essentielle dans le chapô : qui, quoi, quand, où. Le lecteur sur téléphone lit souvent seulement les premières lignes.',
            'Une idée par paragraphe ; des sous-titres de niveau 2 tous les trois ou quatre paragraphes ; des listes pour les énumérations.',
            'Employez le ton de la Fédération : factuel, respectueux, sans attaque personnelle. Un communiqué engage la FETRAG : faites-le valider par le Secrétariat général.',
            'Reprenez mot pour mot les textes officiels (mission, devise, mot du Secrétaire général) sans les paraphraser.',
            'Citez vos sources (texte de loi, rapport, institution) et datez les documents déposés en ressource.',
            'Relisez avant de publier : orthographe, noms propres, dates, liens qui fonctionnent. Publier est immédiat et sans confirmation.',
            'Ne changez pas le slug d’un contenu déjà publié et partagé : les anciens liens casseraient.',
          ],
        },
        {
          type: 'list',
          title: 'Images et accessibilité',
          style: 'check',
          items: [
            'Renseignez le texte alternatif de chaque image informative : une phrase qui dit ce que montre l’image. Laissez-le vide seulement pour une image purement décorative.',
            'Réduisez les images avant l’envoi (moins de 500 Ko, 1600 × 900 pixels pour une couverture) : le site est consulté sur des connexions mobiles.',
            'Ne mettez pas de texte important dans une image (affiche) sans le reprendre dans le texte.',
            'Écrivez des liens parlants (« télécharger le guide de l’adhérent ») plutôt que « cliquez ici ».',
            'Pas d’emoji ni de symboles décoratifs dans les contenus : la charte du site s’en charge.',
            'Utilisez les listes et les titres de l’éditeur plutôt que des tirets ou des majuscules pour structurer.',
            'Évitez les tableaux larges : sur téléphone, ils deviennent illisibles.',
          ],
        },
        {
          type: 'list',
          title: 'Données personnelles et confidentialité',
          style: 'check',
          items: [
            'Ne publiez jamais de noms, adresses, numéros de téléphone ou situations individuelles sans l’accord écrit des personnes.',
            'Demandez l’accord des personnes photographiées avant de publier une photo d’événement où elles sont reconnaissables.',
            'Les documents internes (listes de membres, procès-verbaux nominatifs) ne vont pas sur le site, ou seulement en niveau « Membres » ou « Organisation ».',
            'Les exports (messages, participants, abonnés) contiennent des données personnelles : stockez-les sur un appareil protégé, ne les envoyez pas par WhatsApp, supprimez-les après usage.',
            'Répondez aux messages reçus avec courtoisie, sans divulguer d’informations sur d’autres personnes.',
            'Supprimez un message ou un abonné quand la personne le demande (droit à l’effacement), après clôture.',
          ],
        },
        {
          type: 'list',
          title: 'Sécurité de votre compte',
          style: 'check',
          items: [
            'Activez la vérification en deux étapes dès votre première connexion : elle est exigée pour votre rôle.',
            'Conservez vos codes de secours hors du téléphone (papier dans un lieu sûr, gestionnaire de mots de passe).',
            'Choisissez un mot de passe unique (au moins 8 caractères, une majuscule, un chiffre) que vous n’utilisez nulle part ailleurs.',
            'Déconnectez-vous et fermez le navigateur sur tout appareil partagé ou prêté.',
            'Ne communiquez jamais votre mot de passe ni un code de vérification, même à une personne se présentant comme le support ou l’administrateur.',
            'Si vous recevez « Votre mot de passe FETRAG a été modifié » sans l’avoir demandé, changez-le immédiatement et prévenez le super administrateur.',
            'Toutes vos actions (création, modification, publication, suppression, export) sont enregistrées dans le journal d’audit avec la date et l’appareil utilisé.',
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'questions-frequentes',
      title: 'Questions fréquentes',
      icon: 'help-circle',
      blocks: [
        {
          type: 'faq',
          items: [
            {
              question: 'Dois-je faire valider mes contenus par quelqu’un avant de publier ?',
              answer: 'Le site ne l’impose pas : votre rôle rédige, relit et publie. Le statut « En relecture » est un outil pour vous et vos collègues éditeurs. La validation de fond (communiqués, textes officiels, pages légales) se fait avec le Secrétariat général, hors du site, avant de cliquer sur `Publier`.',
            },
            {
              question: 'Comment voir mon brouillon tel qu’il apparaîtra sur le site ?',
              answer: 'Dans la version actuelle, le bouton `Prévisualiser` ne montre pas encore les brouillons (la page répond « introuvable »). Relisez soigneusement dans le formulaire, publiez, vérifiez avec `Voir en ligne`, et repassez en brouillon en cas de problème.',
            },
            {
              question: 'J’ai publié par erreur. Que faire ?',
              answer: 'Ouvrez le menu `Actions` du panneau « Publication » et cliquez sur `Repasser en brouillon` : le contenu disparaît immédiatement du site. Corrigez, puis publiez de nouveau.',
            },
            {
              question: 'Puis-je programmer la publication d’une ressource ou d’un événement ?',
              answer: 'Non : la planification n’existe que pour les pages et les actualités. Publiez la ressource ou l’événement au moment voulu.',
            },
            {
              question: 'J’ai modifié une page mais le site affiche l’ancien texte.',
              answer: 'Rechargez la page publique. Vérifiez que la page est bien « Publié » et que son slug est l’un de ceux servis par le site (« la-fetrag », « mentions-legales », « confidentialite »). Une page avec un autre slug n’a pas encore d’adresse publique.',
            },
            {
              question: 'Puis-je récupérer une actualité supprimée ?',
              answer: 'Non : la suppression est définitive, sans corbeille. Pour retirer un contenu du site sans le perdre, utilisez `Archiver`.',
            },
            {
              question: 'Comment retrouver une ancienne version d’une page ?',
              answer: 'Sur la fiche de la page, la carte « Versions » liste les douze dernières versions avec un bouton `Restaurer`. La restauration crée une nouvelle version ; rien n’est perdu. Seules les pages ont cet historique.',
            },
            {
              question: 'Le lien de téléchargement d’une ressource « Membres » que j’ai copié ne fonctionne plus.',
              answer: 'Les fichiers des niveaux Membres, Organisation et Premium sont servis par un lien signé valable 15 minutes. Partagez l’adresse de la page de la ressource, pas le lien du fichier.',
            },
            {
              question: 'Puis-je envoyer la lettre d’information depuis le back-office ?',
              answer: 'Non. Le back-office gère seulement les abonnés (liste, export CSV des consentements, suppression). L’envoi se fait avec l’outil externe retenu par la Fédération, à partir des adresses « Confirmé », en retirant les « Désinscrit ».',
            },
            {
              question: 'Un inscrit à un événement ne peut plus s’inscrire ou annuler.',
              answer: 'Les inscriptions sont closes une fois la date de l’événement passée, et un participant marqué « Présent » ne peut plus annuler. Pour un cas particulier, notez la présence sur place.',
            },
            {
              question: 'Que se passe-t-il si je change le slug d’une actualité déjà partagée ?',
              answer: 'Les anciens liens (réseaux sociaux, WhatsApp, emails) mènent à une page introuvable, sans redirection automatique. Ne changez le slug qu’avant la première publication.',
            },
            {
              question: 'Pourquoi le bouton `Coordination LMS` affiche-t-il « Accès refusé » ?',
              answer: 'Il mène à l’espace de coordination de la plateforme de formation, réservé au coordinateur. Votre rôle n’y a pas accès ; c’est normal.',
            },
            {
              question: 'Je n’ai plus mon téléphone et je ne peux plus saisir le code de vérification.',
              answer: 'Utilisez un code de secours noté lors de l’activation. Sans code de secours, demandez au super administrateur de réinitialiser la vérification en deux étapes de votre compte, puis réactivez-la avec votre nouveau téléphone.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'lexique',
      title: 'Lexique',
      icon: 'book-open',
      blocks: [
        {
          type: 'definitions',
          items: [
            { term: 'Back-office', definition: 'La partie « Administration du site », réservée aux personnels de la Fédération, où l’on rédige et publie les contenus.' },
            { term: 'Brouillon', definition: 'Contenu en cours de rédaction, visible seulement dans le back-office. Statut à la création.' },
            { term: 'En relecture', definition: 'Contenu soumis à validation, listé sur le tableau de bord dans « Contenus en relecture ». Non visible sur le site.' },
            { term: 'Planifié', definition: 'Page ou actualité qui sera publiée automatiquement à la date et à l’heure choisies (heure de Libreville).' },
            { term: 'Publié', definition: 'Contenu visible sur le site, dans la recherche et dans le plan du site.' },
            { term: 'Archivé', definition: 'Contenu retiré du site mais conservé dans le back-office ; peut repasser en brouillon.' },
            { term: 'Slug', definition: 'Nom court qui forme l’adresse d’un contenu (par exemple « accord-dialogue-social » dans /actualites/accord-dialogue-social). Minuscules, chiffres et tirets ; généré depuis le titre.' },
            { term: 'Chapô (ou extrait)', definition: 'Les deux ou trois phrases qui résument un contenu, affichées dans les listes et les partages. Généré depuis le texte s’il est vide.' },
            { term: 'Éditeur de texte riche', definition: 'La zone de rédaction avec la barre « Mise en forme » (titres, listes, liens, images, tableaux). Le texte est nettoyé à l’enregistrement.' },
            { term: 'Blocs structurés (JSON)', definition: 'Les sections riches d’une page (bandeau, chiffres clés, équipe…) décrites dans un format texte à accolades et guillemets. Des modèles s’insèrent d’un clic.' },
            { term: 'Gabarit', definition: 'La mise en page d’une page : Standard, Institutionnel (La FETRAG), Page d’atterrissage, Page légale.' },
            { term: 'Version (révision)', definition: 'Copie d’une page enregistrée à chaque modification du titre, du contenu ou des blocs ; restaurable depuis la carte « Versions ».' },
            { term: 'SEO (référencement)', definition: 'Titre, description et image que les moteurs de recherche et les réseaux sociaux affichent pour un contenu. « Exclure des moteurs » demande de ne pas indexer la page.' },
            { term: 'Texte alternatif', definition: 'Phrase qui décrit une image pour les personnes qui ne la voient pas (lecteurs d’écran, image non chargée). Indispensable pour l’accessibilité.' },
            { term: 'Médiathèque', definition: 'Le menu **Médias** : tous les fichiers envoyés (images, documents, audio, vidéo), rangés par dossier, publics ou privés.' },
            { term: 'Lien signé', definition: 'Adresse temporaire (15 minutes) qui donne accès à un fichier privé. Un lien signé copié cesse de fonctionner rapidement.' },
            { term: 'Niveau d’accès', definition: 'Qui peut télécharger une ressource : Public (tous), Membres (compte connecté), Organisation (membres de l’organisation rattachée), Premium (achat).' },
            { term: 'Catégorie', definition: 'Étiquette de classement d’un contenu, propre à un domaine (Actualités, Ressources, Formations, Services, Événements).' },
            { term: 'Liste d’attente', definition: 'File des personnes inscrites à un événement complet ; la première est promue automatiquement quand une place se libère (événement gratuit).' },
            { term: 'Double opt-in', definition: 'Abonnement à la lettre d’information en deux temps : la personne s’inscrit puis confirme en cliquant sur le lien reçu par email.' },
            { term: 'Vérification en deux étapes', definition: 'Un code temporaire à 6 chiffres, généré par une application sur votre téléphone, demandé en plus du mot de passe à chaque connexion. Exigée pour votre rôle.' },
            { term: 'Codes de secours', definition: 'Codes à usage unique remis à l’activation de la vérification en deux étapes, pour se connecter sans le téléphone.' },
            { term: 'Journal d’audit', definition: 'Registre de qui a fait quoi et quand (création, modification, publication, suppression, export). Consultable par le super administrateur seulement.' },
            { term: 'CSV', definition: 'Fichier texte de tableau (colonnes séparées par des points-virgules) lisible dans un tableur.' },
            { term: 'Accusé de réception', definition: 'Email automatique envoyé à toute personne qui utilise un formulaire du site, avec sa référence MSG-… et la promesse d’une réponse sous 48 heures ouvrées.' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'besoin-d-aide',
      title: 'Besoin d’aide ?',
      icon: 'life-buoy',
      summary: 'À qui s’adresser selon le problème, et quoi indiquer dans votre message.',
      blocks: [
        {
          type: 'table',
          caption: 'Qui contacter',
          columns: ['Votre problème', 'À qui s’adresser'],
          rows: [
            ['Connexion impossible, mot de passe, adresse non vérifiée, vérification en deux étapes perdue', 'Le support, par le formulaire de contact du site ; la réinitialisation de la vérification en deux étapes relève du super administrateur.'],
            ['Rôle manquant (« Accès refusé »), nouveau collègue à équiper, nouveau thème de FAQ, nouvelle page à rendre publique', 'Le super administrateur.'],
            ['Validation d’un communiqué, d’un texte officiel, d’une page légale', 'Le Secrétariat général.'],
            ['Un message reçu concerne une demande de service ou un problème de compte', 'Attribuez-le au responsable des services ou au support depuis la carte « Attribution ».'],
            ['Paiement d’une ressource Premium ou d’un événement payant', 'Le service Finance.'],
            ['Une catégorie « Formations » ou « Services » à modifier', 'La coordination formation ou le responsable des services.'],
            ['Un écran qui ne fonctionne pas (message d’erreur inattendu, page blanche)', 'Le support, avec les informations ci-dessous.'],
          ],
        },
        {
          type: 'list',
          title: 'Ce qu’il faut indiquer dans votre message',
          style: 'check',
          items: [
            'L’adresse email de votre compte (jamais votre mot de passe).',
            'L’écran concerné (par exemple « Actualités > fiche de l’actualité », « Médias ») et l’heure approximative.',
            'Le message d’erreur exact, recopié, ou la référence du contenu (titre, slug, référence MSG-…).',
            'L’appareil et le navigateur utilisés (téléphone ou ordinateur, Chrome, Safari…).',
            'Ce que vous avez déjà essayé (rechargement, autre navigateur, déconnexion).',
          ],
        },
        {
          type: 'links',
          title: 'Coordonnées',
          items: [
            { label: 'Formulaire de contact du site', href: '/contact', description: 'Pour joindre le support ou le secrétariat ; vous recevrez un accusé de réception avec une référence.', icon: 'mail' },
            { label: 'Écrire au secrétariat', href: 'mailto:jossngomafm@gmail.com', description: 'Adresse email de la Fédération.', icon: 'send' },
            { label: 'Appeler la Fédération', href: 'tel:+24166230033', description: '066 23 00 33 ou 077 52 27 98, aux heures de bureau.', icon: 'phone' },
            { label: 'Adresse postale', href: '/contact', description: 'FETRAG, BP 1234 Libreville, Gabon.', icon: 'map-pin' },
            { label: 'Protéger mon compte', href: '/espace/securite', description: 'Activer la vérification en deux étapes, changer de mot de passe, voir l’activité récente.', icon: 'shield' },
          ],
        },
      ],
    },
  ],
  related: [
    { label: 'Guide du membre', href: '/espace/guide', description: 'Votre compte, votre espace personnel, vos notifications et la sécurité de votre compte.' },
    { label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'Suivre une formation sur la plateforme de formation avec le même compte.', external: true },
  ],
}
