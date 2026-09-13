import type { Guide } from '@fetrag/contracts'

/**
 * Guide du responsable des services (site institutionnel, rôle SERVICES_MANAGER).
 *
 * Périmètre : catalogue des services (/admin/services), instruction des demandes (/admin/demandes),
 * catégories du domaine « Services », médiathèque, messages reçus, consultation des contenus en lecture.
 * Les libellés, statuts et règles sont ceux du code (formulaires, transitions, limites).
 */
export const webServices: Guide = {
  id: 'web-services',
  platform: 'web',
  role: 'SERVICES_MANAGER',
  title: 'Guide du responsable des services',
  subtitle: 'Gérer le catalogue des services et instruire les demandes des travailleurs et des organisations',
  audience:
    'Les personnes de la Fédération chargées des services aux travailleurs et aux organisations (assistance juridique, médiation sociale, accompagnement, formation à la demande) et disposant du rôle « Responsable services » sur le site institutionnel.',
  summary:
    'Avec le rôle « Responsable services », vous décrivez les services proposés par la Fédération et vous les publiez dans le catalogue public. Vous recevez les demandes déposées par les membres, vous les attribuez, vous les faites avancer d’un statut à l’autre et vous informez le demandeur à chaque étape. Vous gérez aussi les catégories de services, la médiathèque et les messages reçus qui concernent les services.',
  tone: 'green',
  icon: 'life-buoy',
  readingMinutes: 45,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée.',
    'Le rôle « Responsable services », attribué par le super administrateur (sans ce rôle, la page « Accès refusé » s’affiche).',
    'Un téléphone ou un ordinateur connecté à Internet. Sur ordinateur, les tableaux affichent plus de colonnes ; sur téléphone, tout reste faisable.',
    'Conseillé : une application d’authentification (Google Authenticator, Microsoft Authenticator, Aegis, FreeOTP) pour activer la vérification en deux étapes.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'page **Connexion**, bouton en bas du formulaire',
      result: 'Votre espace personnel s’ouvre.',
    },
    {
      text: 'Ouvrez le menu de votre compte puis choisissez **Administration du site**.',
      where: 'vos initiales, en haut à droite du site',
      result: 'Le tableau de bord du back-office s’affiche avec le message « Bonjour {votre prénom} ».',
    },
    {
      text: 'Ouvrez **Demandes** dans la section « Services » du menu.',
      where: 'menu de gauche sur ordinateur ; sur mobile, bouton **Ouvrir la navigation** (trois traits) en haut à gauche',
      result: 'La liste « Demandes de service » s’affiche avec les tuiles « Nouvelles », « En examen ou en traitement », « Traitées » et « Demandes ouvertes ».',
    },
    {
      text: 'Ouvrez une demande « Nouvelle » et attribuez-la vous avec `Enregistrer l’attribution`.',
      where: 'panneau « Attribution », sous l’historique',
      result: 'Le message « Demande {référence} attribuée à {votre nom}. » apparaît et la demande passe « En examen ».',
    },
    {
      text: 'Ouvrez **Catalogue** dans la section « Services » pour vérifier les services publiés.',
      result: 'La liste « Catalogue des services » s’affiche avec le statut de chaque service.',
    },
  ],
  sections: [
    // -------------------------------------------------------------------------
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'life-buoy',
      summary: 'Ce que le rôle « Responsable services » vous permet de faire, ce qu’il ne permet pas, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le rôle « Responsable services » vous donne accès au back-office du site (la partie « Administration du site », réservée aux personnels de la Fédération). Vous y gérez le catalogue des services et vous instruisez les demandes déposées par les travailleurs et les organisations. Chaque action importante est enregistrée dans le journal d’audit (une trace de qui a fait quoi, et quand).',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Créer, modifier, publier, archiver et supprimer des services (menu **Catalogue**).',
            'Composer le formulaire de demande de chaque service (les questions posées au demandeur).',
            'Lire toutes les demandes de service, les attribuer, changer leur statut avec un commentaire envoyé au demandeur, ajouter une note interne et exporter la liste (menu **Demandes**).',
            'Supprimer une demande clôturée ou refusée (droit à l’effacement).',
            'Créer des catégories du domaine « Services » et modifier les catégories existantes (menu **Catégories**).',
            'Envoyer, décrire et supprimer des fichiers dans la médiathèque (menu **Médias**).',
            'Lire et traiter les messages reçus depuis les formulaires du site, en particulier ceux de type « Demande de service » (menu **Messages reçus**).',
            'Consulter les abonnés à la lettre d’information (menu **Newsletter**).',
            'Consulter en lecture les pages, actualités, ressources, événements, questions de la FAQ et partenaires, y compris les brouillons.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire',
          style: 'bullet',
          items: [
            'Créer, enregistrer ou publier une page, une actualité, une ressource, un événement, une question de FAQ ou un partenaire : c’est le travail de l’éditeur. Vous pouvez seulement les lire.',
            'Modifier les menus du site (**Menus** n’apparaît pas dans votre navigation).',
            'Supprimer ou réordonner des catégories (réservé à l’éditeur).',
            'Voir les utilisateurs, les organisations, la finance, les rapports, le journal d’audit ou les paramètres : ces pages affichent « Accès refusé ».',
            'Voir le détail d’une commande ou d’un paiement : pour un problème de paiement, orientez vers le service Finance.',
            'Envoyer un email libre depuis la plateforme : seul le commentaire lié à un changement de statut est envoyé au demandeur. Pour un échange plus long, utilisez votre messagerie en rappelant la référence de la demande.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait pour vous', 'Quand le solliciter'],
          rows: [
            ['Support', 'Voit les mêmes demandes que vous, peut les attribuer et changer leur statut (mais pas les supprimer).', 'Pour partager la charge de traitement ou diagnostiquer un problème de compte du demandeur.'],
            ['Éditeur', 'Publie les pages, actualités et la FAQ ; supprime ou réordonne les catégories.', 'Pour annoncer un nouveau service sur le site ou corriger une page qui parle des services.'],
            ['Finance', 'Suit les commandes et les paiements des services payants, rembourse.', 'Quand une demande payante reste « En attente » de paiement ou qu’un demandeur signale un double débit.'],
            ['Super administrateur', 'Attribue les rôles, gère les comptes et les paramètres.', 'Pour obtenir un droit manquant, réinitialiser la vérification en deux étapes d’un collègue ou désactiver un compte.'],
            ['Secrétariat général', 'Décide des services proposés, de leurs tarifs et des réponses de fond.', 'Pour toute décision qui dépasse votre mandat (nouveau service payant, refus sensible).'],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte et connexion',
      icon: 'log-in',
      summary: 'Se connecter, retrouver un mot de passe oublié, protéger le compte et se déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous utilisez le même compte que tous les membres de la Fédération. C’est le rôle attribué à ce compte qui ouvre le back-office. Si le menu de votre compte n’affiche pas **Administration du site**, le rôle n’a pas encore été attribué : demandez-le au super administrateur.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Vérification en deux étapes',
          text: 'Pour votre rôle, la vérification en deux étapes (un code temporaire demandé en plus du mot de passe) n’est pas obligatoire, mais elle est fortement conseillée : vous manipulez des données personnelles et syndicales.',
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
                  note: 'Utilisez l’adresse avec laquelle vous avez créé votre compte, sans faute de frappe.',
                },
                { text: 'Saisissez votre **Mot de passe** (obligatoire).' },
                {
                  text: 'Si la vérification en deux étapes est active sur votre compte, saisissez le **Code de vérification** affiché par votre application d’authentification.',
                  note: 'Ce champ n’apparaît que si vous avez activé la vérification en deux étapes.',
                },
                {
                  text: 'Cliquez sur `Se connecter` (ou `Vérifier et se connecter` avec le code).',
                  where: 'en bas du formulaire',
                  result: 'Votre espace personnel s’ouvre (rubriques Tableau de bord, Profil, Mes demandes, Mes inscriptions, Paiements et reçus, Notifications, Sécurité).',
                },
                {
                  text: 'Ouvrez le menu de votre compte puis cliquez sur **Administration du site**.',
                  where: 'vos initiales, en haut à droite',
                  result: 'Le back-office s’ouvre sur le tableau de bord « Bonjour {votre prénom} ».',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Un message indique que l’adresse n’est pas vérifiée.',
                  cause: 'Vous n’avez pas encore cliqué sur le lien de confirmation reçu par email.',
                  solution: 'Cliquez sur `Renvoyer le lien de confirmation` sous le formulaire, ouvrez l’email reçu et cliquez sur son lien. Vérifiez aussi le dossier des indésirables.',
                },
                {
                  problem: 'La page « Accès refusé » s’affiche quand j’ouvre l’administration.',
                  cause: 'Votre compte n’a pas (encore) le rôle « Responsable services », ou vous êtes connecté avec un autre compte.',
                  solution: 'Vérifiez l’adresse indiquée dans « Vous êtes connecté en tant que… ». Utilisez « Changer de compte » si besoin, sinon cliquez sur « Contacter la FETRAG » pour demander l’attribution du rôle.',
                },
                {
                  problem: 'Le champ **Code de vérification** apparaît alors que je n’ai plus mon téléphone.',
                  cause: 'La vérification en deux étapes est active et l’application n’est plus disponible.',
                  solution: 'Utilisez l’un des codes de secours notés lors de l’activation. Sans code de secours, demandez au super administrateur de réinitialiser la vérification en deux étapes.',
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
                { text: 'Saisissez l’**Adresse email du compte** (obligatoire).' },
                {
                  text: 'Cliquez sur `Recevoir le lien de réinitialisation`.',
                  result: 'Un message vous invite à consulter votre boîte email.',
                },
                {
                  text: 'Ouvrez l’email reçu et cliquez sur son lien.',
                  result: 'La page de choix d’un nouveau mot de passe s’affiche.',
                },
                {
                  text: 'Saisissez le **Nouveau mot de passe** puis répétez-le dans **Confirmer le nouveau mot de passe** (les deux sont obligatoires).',
                  note: 'Règles imposées : au moins 8 caractères, au moins une majuscule et au moins un chiffre (la liste « Règles du mot de passe » se coche au fur et à mesure). Choisissez un mot de passe que vous n’utilisez sur aucun autre service.',
                },
                {
                  text: 'Cliquez sur `Définir le nouveau mot de passe`.',
                  where: 'en bas du formulaire (le bouton affiche « Enregistrement en cours »)',
                  result: 'Vous pouvez vous connecter avec le nouveau mot de passe.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Je ne reçois pas l’email de réinitialisation.',
                  cause: 'Faute de frappe dans l’adresse, email arrivé dans les indésirables, ou adresse différente de celle du compte.',
                  solution: 'Vérifiez le dossier des indésirables, puis recommencez avec l’adresse exacte du compte. Si rien n’arrive après quelques minutes, contactez le support par le formulaire de contact.',
                },
              ],
            },
          ],
        },
        {
          id: 'activer-la-verification-en-deux-etapes',
          title: 'Activer la vérification en deux étapes (conseillé)',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP).',
                  note: 'Ces applications génèrent un code à 6 chiffres qui change toutes les 30 secondes.',
                },
                {
                  text: 'Ouvrez **Sécurité** dans votre espace personnel.',
                  where: 'menu de gauche de l’espace personnel, ou menu de votre compte (initiales en haut à droite) > **Sécurité**',
                  result: 'La page « Protéger mon compte » s’affiche avec le badge « Vérification en deux étapes inactive ».',
                },
                {
                  text: 'Cliquez sur `Activer la vérification en deux étapes`.',
                  where: 'carte « Vérification en deux étapes »',
                  result: 'Un QR code et une clé à saisir manuellement apparaissent (« Étape 1 »).',
                },
                {
                  text: 'Scannez le QR code avec votre application (ou saisissez la clé manuellement).',
                  result: 'L’application affiche un code à 6 chiffres pour « FETRAG ».',
                },
                {
                  text: 'Saisissez le **Code à 6 chiffres affiché par l’application** puis cliquez sur `Confirmer et activer`.',
                  where: '« Étape 2 »',
                  result: 'Le badge passe à « Vérification en deux étapes active » et vos codes de secours s’affichent.',
                },
                {
                  text: 'Copiez ou notez les codes de secours et rangez-les en lieu sûr.',
                  note: 'Ils sont affichés une seule fois. Chaque code de secours remplace le code de l’application une fois, si vous perdez votre téléphone.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Désactivation',
              text: 'Désactiver la vérification en deux étapes demande un code de vérification ou un code de secours. Sans aucun des deux, seul le super administrateur peut réinitialiser la vérification de votre compte.',
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
                  where: 'dernière ligne du menu de votre compte (le bouton affiche « Déconnexion en cours » pendant l’envoi)',
                  result: 'Vous revenez au site public ; le menu affiche de nouveau **Connexion**.',
                },
                {
                  text: 'Sur un appareil partagé (ordinateur d’une section, téléphone prêté), fermez aussi le navigateur.',
                  note: 'Les demandes contiennent des données personnelles : ne laissez jamais une session ouverte.',
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
      summary: 'Le tableau de bord, le menu de navigation et leurs équivalents sur téléphone.',
      blocks: [
        {
          type: 'screen',
          title: 'Le tableau de bord (« Bonjour {votre prénom} »)',
          description: 'La première page du back-office. Elle résume l’activité du site filtrée selon vos droits : vous n’y voyez ni chiffres financiers ni rapports.',
          areas: [
            {
              name: 'Menu de gauche (ordinateur) ou tiroir de navigation (mobile)',
              purpose: 'Les rubriques du back-office groupées par sections : « Pilotage », « Contenus », « Services », « Relations ». En bas : votre nom, votre email et la pastille de rôle « Responsable services ».',
              icon: 'menu',
            },
            {
              name: 'Barre du haut',
              purpose: 'Le mot « Back-office », le titre de la page courante (« Catalogue », « Demandes », « Médias »…) et le lien « Voir le site » qui ouvre le site public dans un nouvel onglet (ce lien est masqué sur les petits écrans).',
              icon: 'monitor',
            },
            {
              name: 'Tuiles de chiffres',
              purpose: '« Pages vues sur 30 jours », « Formulaires reçus sur 30 jours » (avec le nombre « à traiter ») et « Demandes de service en cours » (demandes Nouvelle, En examen et En traitement, avec le nombre de nouvelles). Deux tuiles par ligne sur mobile.',
              icon: 'bar-chart',
            },
            {
              name: 'Carte « Contenus en relecture »',
              purpose: 'Les contenus envoyés en relecture, y compris vos services en statut « En relecture » (type « Service »), avec un bouton « Relire ». Vide : « Rien à relire ».',
              icon: 'eye',
            },
            {
              name: 'Carte « Dernières demandes de service »',
              purpose: 'Les six dernières demandes (service, référence, nom du demandeur, badge de statut) et le lien « Toutes les demandes ».',
              icon: 'inbox',
            },
            {
              name: 'Carte « Messages reçus »',
              purpose: 'Les six derniers messages des formulaires du site et le lien « Boîte de réception ».',
              icon: 'mail',
            },
            {
              name: 'Cartes « Audience du site », « Formulaires par type », « Contenus les plus consultés »',
              purpose: 'Statistiques de consultation (sans cookie de suivi) et répartition des formulaires reçus. Utiles pour mesurer l’intérêt pour les services.',
              icon: 'pie-chart',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Le menu de navigation',
          description: 'Sur ordinateur, le menu est toujours visible à gauche (fond marine). Sur téléphone, il est caché : ouvrez-le avec le bouton **Ouvrir la navigation** (icône à trois traits) en haut à gauche de la barre collante ; fermez-le avec le bouton **Fermer la navigation** (croix). Le tiroir se ferme tout seul quand vous changez de page.',
          areas: [
            { name: 'Pilotage', purpose: '**Tableau de bord**.', icon: 'layout-dashboard' },
            {
              name: 'Contenus',
              purpose: '**Pages**, **Actualités**, **Catégories**, **Ressources**, **Médias**, **FAQ**. Vous lisez les pages, actualités, ressources et FAQ ; vous agissez sur **Catégories** (domaine « Services ») et **Médias**.',
              icon: 'file-text',
            },
            {
              name: 'Services',
              purpose: '**Catalogue** (vos services) et **Demandes** (les demandes à instruire). Le badge à côté de **Demandes** indique le nombre de demandes « Nouvelle » et « En examen ».',
              icon: 'life-buoy',
            },
            {
              name: 'Relations',
              purpose: '**Événements** et **Partenaires et organisations** (lecture), **Messages reçus** (badge = messages « Nouveau ») et **Newsletter**.',
              icon: 'handshake',
            },
            {
              name: 'Aide',
              purpose: '**Guide de mon rôle** : ce guide, accessible à tout moment (/admin/guide).',
              icon: 'help-circle',
            },
            {
              name: 'Pied du menu',
              purpose: 'Votre nom, votre email, la pastille « Responsable services » et un lien « Coordination LMS » (affiché à tous les administrateurs mais inaccessible à votre rôle).',
              icon: 'user',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Sur téléphone',
          text: 'Les tableaux cachent certaines colonnes pour tenir dans la largeur de l’écran ; le statut est alors rappelé sous le nom de la ligne. Vous pouvez faire glisser un tableau horizontalement avec le doigt. Les boutons de validation occupent toute la largeur.',
        },
        { type: 'path', label: 'Chemin vers le catalogue', items: ['Menu de gauche', 'Services', 'Catalogue'], href: '/admin/services' },
        { type: 'path', label: 'Chemin vers les demandes', items: ['Menu de gauche', 'Services', 'Demandes'], href: '/admin/demandes' },
        {
          type: 'table',
          caption: 'Messages généraux du back-office',
          columns: ['Message', 'Signification', 'Que faire'],
          rows: [
            ['« Chargement de l’administration »', 'La page est en train de se charger.', 'Patientez quelques secondes.'],
            ['« Élément introuvable »', 'Le service, la demande ou le contenu n’existe pas ou a été supprimé.', 'Cliquez sur « Retour au tableau de bord » et rouvrez l’élément depuis sa liste.'],
            ['« Accès refusé »', 'La page est réservée à un autre rôle.', 'Revenez en arrière ; si la page vous est nécessaire, demandez le droit au super administrateur.'],
            ['« Permission insuffisante »', 'Vous avez tenté une action que votre rôle n’autorise pas (par exemple enregistrer une actualité).', 'Aucune donnée n’a été modifiée. Confiez l’action à la personne compétente.'],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'creer-un-service',
      title: 'Comment créer un service',
      icon: 'plus',
      summary: 'Décrire un service, fixer ses modalités et son tarif, composer son formulaire de demande.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un service est une fiche du catalogue public : un nom, un résumé, une description, des conditions d’accès, un tarif éventuel et le formulaire que remplira le demandeur. À la création, le service est un brouillon : il n’est visible que dans le back-office tant que vous ne le publiez pas.',
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Services', 'Catalogue', 'Nouveau service'], href: '/admin/services/nouveau' },
        {
          type: 'steps',
          title: 'Ouvrir le formulaire de création',
          items: [
            {
              text: 'Ouvrez **Catalogue** dans la section « Services ».',
              where: 'menu de gauche ; sur mobile, bouton **Ouvrir la navigation**',
              result: 'La page « Catalogue des services » s’affiche.',
            },
            {
              text: 'Cliquez sur `Nouveau service`.',
              where: 'en haut à droite de la page (sous le titre sur mobile)',
              result: 'La page « Nouveau service » s’ouvre avec quatre onglets : `Présentation`, `Modalités et tarif`, `Formulaire de demande`, `SEO`.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Préparez le contenu avant de saisir',
          text: 'Faites valider par le Secrétariat général le nom du service, ses conditions d’accès, son tarif et le délai annoncé. Les informations saisies sont visibles par tous une fois le service publié.',
        },
      ],
      subsections: [
        {
          id: 'onglet-presentation',
          title: 'Onglet « Présentation »',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Saisissez le **Nom du service** (obligatoire, 2 à 160 caractères).',
                  note: 'Choisissez un nom compréhensible par tous : « Assistance juridique individuelle » plutôt qu’un sigle.',
                },
                {
                  text: 'Renseignez l’**Icône lucide** (facultatif, 40 caractères maximum, lettres, chiffres et tirets).',
                  note: 'Exemples proposés par l’écran : scale, handshake, shield-check. L’icône apparaît dans la pastille colorée de la carte du service. Un nom inconnu provoque l’erreur « Nom d’icône lucide invalide ».',
                },
                {
                  text: 'Rédigez le **Résumé** (facultatif, 500 caractères maximum).',
                  note: 'Il est affiché dans le catalogue, sur trois lignes au maximum. S’il est vide, un extrait est généré automatiquement depuis la description.',
                },
                {
                  text: 'Rédigez la **Description détaillée** dans l’éditeur de texte (facultatif).',
                  note: 'La barre d’outils propose Gras, Italique, Souligné, Titre de niveau 2 et 3, listes, Citation, Séparateur, liens, images et tableaux. Les scripts et styles copiés depuis d’autres logiciels sont retirés à l’enregistrement.',
                  result: 'Sur la fiche publique, ce texte forme la section « En quoi consiste ce service ».',
                },
                {
                  text: 'Rédigez les **Conditions d’accès** (facultatif) : qui peut solliciter le service, pièces à fournir, délais.',
                  result: 'Sur la fiche publique, ce texte forme l’encadré « Conditions ».',
                },
                {
                  text: 'Choisissez une **Catégorie** (facultatif) parmi les catégories du domaine « Services », ou laissez « Sans catégorie ».',
                  note: 'Pour créer une nouvelle catégorie, voir « Comment gérer les catégories de services ».',
                },
                {
                  text: 'Laissez le **Slug (adresse)** vide pour qu’il soit généré depuis le nom, ou saisissez-le (2 à 120 caractères, minuscules, chiffres et tirets).',
                  note: 'Le slug est la fin de l’adresse de la fiche publique : l’aide affiche « Aperçu : /services/{slug} ». Il doit être unique.',
                },
                {
                  text: 'Renseignez l’**Ordre d’affichage** (facultatif, entier de 0 à 10 000, 0 par défaut).',
                  note: 'Les services sont classés du plus petit ordre au plus grand dans le catalogue public. C’est le seul moyen de les ordonner.',
                },
              ],
            },
          ],
        },
        {
          id: 'onglet-modalites-et-tarif',
          title: 'Onglet « Modalités et tarif »',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur l’onglet `Modalités et tarif`.',
                  where: 'ligne d’onglets sous le titre ; sur mobile, faites défiler les onglets vers la droite',
                  result: 'La carte « Modalités et tarif » s’affiche.',
                },
                {
                  text: 'Laissez la case **Compte requis** cochée (par défaut) si le demandeur doit être connecté.',
                  note: 'Avec un compte, le demandeur suit sa demande dans son espace personnel. Sans compte, n’importe quel visiteur peut déposer une demande, mais il ne recevra que les emails et la fiche affichera « Sans compte ».',
                },
                {
                  text: 'Cochez **Service payant** seulement si le service est facturé.',
                  result: 'Les champs **Tarif (XAF)** et **Devise** apparaissent.',
                },
                {
                  text: 'Si le service est payant, saisissez le **Tarif (XAF)** (obligatoire dans ce cas : nombre entier strictement positif, en francs CFA, sans centimes).',
                  note: 'Un tarif vide ou nul provoque l’erreur « Tarif requis » ou « Un service payant doit avoir un tarif strictement positif ». La **Devise** est XAF par défaut (3 lettres).',
                },
                {
                  text: 'Renseignez le **Délai indicatif (jours)** (facultatif, entier de 0 à 365).',
                  note: 'Il est annoncé au public (« Réponse sous {n} jours ») et sert à calculer l’« Échéance » dans votre liste de demandes. Laissez vide si vous ne voulez pas annoncer de délai.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Service payant : conséquences',
              text: 'Un service payant impose la connexion du demandeur et déclenche un paiement en ligne (Mobile Money ou carte) avant tout traitement. Une offre de paiement est créée automatiquement. Ne cochez cette case qu’avec l’accord du Secrétariat général et du service Finance.',
            },
          ],
        },
        {
          id: 'onglet-formulaire-de-demande',
          title: 'Onglet « Formulaire de demande »',
          blocks: [
            {
              type: 'paragraph',
              text: 'Les champs d’identité (nom complet, adresse email), de coordonnées (téléphone, organisation) et le message complémentaire sont toujours présents dans le formulaire public. Vous ajoutez ici uniquement les informations propres au service : matricule, employeur, nature du litige, nom d’une pièce à fournir…',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur l’onglet `Formulaire de demande`.',
                  result: 'La carte « Champs du formulaire de demande » s’affiche. Si elle est vide, un texte explique que le demandeur ne renseigne que son identité, ses coordonnées et un message.',
                },
                {
                  text: 'Cliquez sur `Ajouter un champ`.',
                  result: 'Une carte numérotée (01, 02…) apparaît avec les réglages du champ.',
                },
                {
                  text: 'Saisissez le **Libellé** (obligatoire, 1 à 120 caractères) : la question telle que le demandeur la lira.',
                },
                {
                  text: 'Vérifiez l’**Identifiant** (obligatoire, 40 caractères maximum : une lettre, puis lettres, chiffres et soulignés).',
                  note: 'C’est le nom technique du champ ; il sert à retrouver la réponse dans la demande et dans l’export. Un identifiant incorrect provoque l’erreur « Nom de champ invalide ».',
                },
                {
                  text: 'Choisissez le **Type** : Texte court, Texte long, Adresse email, Téléphone, Nombre, Date, Liste de choix, Case à cocher ou Pièce jointe.',
                  note: 'Le type « Pièce jointe » ne permet pas d’envoyer un fichier : le demandeur indique seulement le nom du document, qui lui sera demandé plus tard.',
                },
                {
                  text: 'Cochez **Obligatoire** si le demandeur ne peut pas déposer sa demande sans répondre.',
                },
                {
                  text: 'Renseignez le **Texte indicatif** (facultatif, 160 caractères maximum) et l’**Aide** (facultatif, 300 caractères maximum).',
                  note: 'Le texte indicatif est l’exemple grisé dans le champ ; l’aide est la phrase affichée sous le champ.',
                },
                {
                  text: 'Pour une **Liste de choix**, saisissez les **Options** séparées par des virgules (50 options maximum, 120 caractères chacune).',
                },
                {
                  text: 'Ordonnez les champs avec les boutons **Monter** et **Descendre** ; retirez un champ avec **Supprimer le champ {libellé}**.',
                  where: 'boutons à icône en haut à droite de chaque carte de champ',
                  note: 'Un formulaire accepte 30 champs au maximum. Un formulaire court est plus souvent rempli jusqu’au bout, surtout sur téléphone.',
                },
              ],
            },
          ],
        },
        {
          id: 'onglet-seo',
          title: 'Onglet « SEO » (facultatif)',
          blocks: [
            {
              type: 'paragraph',
              text: 'Le SEO (référencement) règle la façon dont la fiche apparaît dans les moteurs de recherche et lors d’un partage sur les réseaux. Tout est facultatif : par défaut, le titre et le résumé du service sont utilisés.',
            },
            {
              type: 'steps',
              items: [
                { text: 'Cliquez sur l’onglet `SEO`.', result: 'La carte « Référencement » s’affiche.' },
                { text: 'Renseignez si besoin le **Titre SEO** (70 caractères maximum) et la **Méta-description** (200 caractères maximum).' },
                {
                  text: 'Renseignez l’**Image de partage (Open Graph)** avec l’adresse d’une image de la médiathèque (1200 × 630 pixels recommandés).',
                  note: 'L’adresse doit commencer par http(s) ou par « / », sinon l’erreur « URL invalide (http(s) ou chemin relatif) » s’affiche.',
                },
                {
                  text: 'Ne cochez **Exclure des moteurs de recherche (noindex)** que pour un service qui ne doit pas être trouvé par un moteur de recherche (il reste accessible par son adresse).',
                },
              ],
            },
          ],
        },
        {
          id: 'enregistrer-le-nouveau-service',
          title: 'Enregistrer le service',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur `Créer le service`.',
                  where: 'en bas du formulaire (pleine largeur sur mobile) ; le bouton affiche « Enregistrement » pendant l’envoi',
                  result: 'La fiche du service s’ouvre avec l’alerte verte « Le service a été créé en brouillon. Publiez-le pour l’afficher dans le catalogue public. »',
                },
                {
                  text: 'Vérifiez le panneau « Publication » à droite (sous le formulaire sur mobile) : le badge indique « Brouillon ».',
                  result: 'Le panneau affiche aussi l’« Adresse » de la fiche, le « Tarif », le nombre de « Demandes » et le nombre de champs du « Formulaire ».',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Certains champs sont invalides. » s’affiche.',
                  cause: 'Un champ ne respecte pas ses règles (longueur, format, tarif manquant).',
                  solution: 'Parcourez les quatre onglets : le champ fautif porte un message rouge. Corrigez puis cliquez de nouveau sur `Créer le service`.',
                },
                {
                  problem: '« Ce slug est déjà utilisé ».',
                  cause: 'Un autre service (même archivé) porte la même adresse.',
                  solution: 'Modifiez le **Slug (adresse)** ou videz-le pour qu’il soit généré à partir du nom.',
                },
                {
                  problem: '« L’opération a échoué. Réessayez dans quelques instants. »',
                  cause: 'Problème de réseau ou incident passager.',
                  solution: 'Attendez quelques instants puis réessayez. Si le problème persiste, signalez-le au support avec l’heure et le nom du service.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'publier-un-service',
      title: 'Comment publier un service dans le catalogue',
      icon: 'megaphone',
      summary: 'Faire passer un service de « Brouillon » à « Publié », le vérifier en ligne, et comprendre chaque statut.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Seuls les services au statut « Publié » apparaissent sur la page publique des services et acceptent des demandes. Le passage d’un statut à l’autre se fait depuis le menu `Actions` de la fiche ou de la liste. Contrairement aux pages et actualités, un service ne peut pas être planifié à une date future.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche du service depuis **Catalogue** (cliquez sur son nom).',
              result: 'La fiche s’ouvre avec le panneau « Publication ».',
            },
            {
              text: 'Relisez la fiche : nom, résumé, tarif, délai, formulaire.',
              note: 'Le bouton « Prévisualiser » ne permet pas de voir la fiche publique d’un brouillon : la page publique ne charge que les services publiés et affiche « Ce service est introuvable ». Relisez donc directement dans le formulaire.',
            },
            {
              text: 'Si une seconde personne doit relire, cliquez sur `Actions` puis **Envoyer en relecture**.',
              where: 'panneau « Publication », bouton `Actions` (menu déroulant)',
              result: 'Le message « « {nom} » a été envoyé en relecture. » apparaît ; le service est listé dans « Contenus en relecture » du tableau de bord (type « Service »).',
            },
            {
              text: 'Cliquez sur `Actions` puis **Publier**.',
              where: 'panneau « Publication » de la fiche, ou bouton « Actions pour {nom} » à droite de la ligne dans le catalogue',
              result: 'Le message « « {nom} » a été publié. » apparaît et le badge passe à « Publié ».',
            },
            {
              text: 'Cliquez sur « Voir en ligne » pour vérifier la fiche telle que la voient les membres.',
              where: 'panneau « Publication »',
              result: 'La fiche publique s’ouvre : nom, badge de tarif, « Réponse sous {n} jour(s) ouvré(s) », bouton « Déposer une demande ».',
            },
            {
              text: 'Sur téléphone, vérifiez aussi la carte du service dans la liste publique des services.',
              note: 'Le catalogue public se met à jour immédiatement après la publication, et au plus tard toutes les 5 minutes.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’un service',
          items: [
            { label: 'Brouillon', tone: 'neutral', meaning: 'Visible uniquement dans le back-office ; absent du catalogue public.', next: 'Complétez la fiche puis « Publier » ou « Envoyer en relecture ».' },
            { label: 'En relecture', tone: 'info', meaning: 'Soumis à une seconde lecture ; toujours invisible du public ; listé dans « Contenus en relecture ».', next: '« Publier » ou « Repasser en brouillon » pour corriger.' },
            { label: 'Publié', tone: 'success', meaning: 'Visible dans le catalogue public et dans la recherche du site ; accepte des demandes.', next: 'Modifiez librement (changements immédiats), « Archiver » pour le retirer, « Repasser en brouillon » pour une refonte.' },
            { label: 'Archivé', tone: 'warning', meaning: 'Retiré du catalogue mais conservé avec ses demandes.', next: '« Repasser en brouillon » puis « Publier » pour le remettre en ligne.' },
            { label: 'Planifié', tone: 'neutral', meaning: 'Statut réservé aux pages et actualités : jamais proposé pour un service.', next: 'Aucune action.' },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Retirer un service retire aussi le dépôt de demandes',
          text: '« Repasser en brouillon » ou « Archiver » un service publié le fait disparaître immédiatement du catalogue : plus personne ne peut déposer de demande tant qu’il n’est pas republié. Les demandes déjà déposées restent visibles dans **Demandes**.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Transition « {statut} » vers « {statut} » non autorisée ».',
              cause: 'Le passage demandé n’existe pas (par exemple « Archivé » vers « Publié » directement).',
              solution: 'Passez par « Repasser en brouillon » puis « Publier ».',
            },
            {
              problem: 'Le service est « Publié » mais n’apparaît pas dans la liste publique.',
              cause: 'La page publique n’a pas encore été rafraîchie, ou vous consultez une page gardée en mémoire par le navigateur.',
              solution: 'Rechargez la page. Après 5 minutes, si le service manque toujours, signalez-le au support avec le nom du service.',
            },
            {
              problem: '« Le contenu était déjà dans ce statut. »',
              cause: 'Un collègue a effectué la même action juste avant vous.',
              solution: 'Rien à faire : rechargez la page pour voir le statut à jour.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'modifier-archiver-supprimer-un-service',
      title: 'Comment modifier, archiver ou supprimer un service',
      icon: 'pen',
      summary: 'Corriger une fiche publiée, la retirer temporairement ou la supprimer définitivement.',
      blocks: [
        {
          type: 'steps',
          title: 'Modifier un service',
          items: [
            {
              text: 'Ouvrez **Catalogue** puis cliquez sur le nom du service (ou sur « Actions pour {nom} » puis **Modifier**).',
              result: 'La fiche s’ouvre avec les quatre onglets remplis.',
            },
            {
              text: 'Utilisez la barre de filtres pour retrouver un service : recherche « Nom ou résumé », listes **Statut**, **Catégorie**, **Tarif**, puis `Filtrer`.',
              note: 'Le bouton `Réinitialiser` n’apparaît que si un filtre est actif. La liste affiche 20 services par page, classés par « Ordre d’affichage ».',
            },
            {
              text: 'Modifiez les champs voulus puis cliquez sur `Enregistrer le service`.',
              where: 'en bas du formulaire',
              result: 'Le message « Service « {nom} » enregistré. » apparaît.',
            },
            {
              text: 'Si le service est publié, vérifiez la fiche publique avec « Voir en ligne ».',
              note: 'Les modifications d’un service publié sont visibles immédiatement. Pour une refonte importante, passez d’abord le service en brouillon.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Passer de payant à gratuit, et inversement',
          text: 'Décocher **Service payant** efface le tarif et désactive l’offre de paiement. Cocher **Service payant** sur un service gratuit exige un tarif strictement positif. Les demandes déjà déposées ne sont pas modifiées.',
        },
        {
          type: 'steps',
          title: 'Archiver un service (réversible)',
          items: [
            {
              text: 'Ouvrez la fiche puis cliquez sur `Actions` et **Archiver**.',
              where: 'panneau « Publication »',
              result: '« « {nom} » a été archivé. » : le service disparaît du catalogue public mais reste dans la liste avec le badge « Archivé ».',
            },
            {
              text: 'Pour le remettre en ligne, cliquez sur `Actions`, **Repasser en brouillon**, puis de nouveau `Actions` et **Publier**.',
              result: 'Le badge revient à « Publié ».',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'La suppression est définitive',
          text: 'Un service supprimé disparaît pour toujours, avec son formulaire et ses réglages SEO. Préférez toujours « Archiver ». La suppression est de toute façon refusée si au moins une demande a été déposée sur le service.',
        },
        {
          type: 'steps',
          title: 'Supprimer un service (irréversible)',
          items: [
            {
              text: 'Ouvrez la fiche puis cliquez sur `Actions` et **Supprimer**.',
              result: 'Le dialogue « Supprimer « {nom} » ? » s’affiche avec l’avertissement « Cette action est définitive. »',
            },
            {
              text: 'Cliquez sur `Supprimer définitivement` pour confirmer, ou `Annuler` pour renoncer.',
              result: 'Le message « Élément supprimé. » apparaît et vous revenez au catalogue.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Ce service a des demandes associées : archivez-le plutôt que de le supprimer ».',
              cause: 'Au moins une demande a été déposée sur ce service ; les demandes doivent rester consultables.',
              solution: 'Utilisez `Actions` puis **Archiver**.',
            },
            {
              problem: 'Le bouton `Enregistrer le service` répond « Permission insuffisante ».',
              cause: 'Votre rôle « Responsable services » a été retiré ou votre session a expiré.',
              solution: 'Déconnectez-vous puis reconnectez-vous. Si le problème persiste, contactez le super administrateur.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'ce-que-voient-les-membres',
      title: 'Ce que voient les membres : la fiche publique et le dépôt d’une demande',
      icon: 'globe',
      summary: 'Comprendre le parcours du demandeur pour mieux rédiger vos fiches et répondre aux questions.',
      blocks: [
        {
          type: 'screen',
          title: 'La page publique « Services »',
          description: 'Accessible depuis le menu **Services** du site. Elle liste uniquement les services publiés, classés par « Ordre d’affichage » puis par nom.',
          areas: [
            { name: 'Cartes de service', purpose: 'Icône dans une pastille colorée, badge « Gratuit » (vert) ou montant en XAF (or), nom, résumé, « Réponse sous {n} jours », « Compte requis » et le lien « Faire une demande ».', icon: 'clipboard-list' },
            { name: 'Section « Comment ça marche »', purpose: 'Trois étapes : « Choisir un service », « Déposer la demande », « Suivre le traitement ». Le texte annonce que le responsable des services instruit la demande et que les services payants se règlent en ligne.', icon: 'list-checks' },
            { name: 'Bloc « Situation urgente ? »', purpose: 'Bouton « Joindre la permanence » qui mène au formulaire de contact.', icon: 'phone' },
            { name: 'État vide', purpose: 'Si aucun service n’est publié : « Le catalogue des services est en préparation » avec un lien « Nous contacter ».', icon: 'info' },
          ],
        },
        {
          type: 'screen',
          title: 'La fiche publique d’un service',
          description: 'Ouverte depuis une carte du catalogue. Sur téléphone, la colonne « En bref » et l’encadré « Conditions » passent sous le formulaire.',
          areas: [
            { name: 'En-tête', purpose: 'Badge de catégorie, badge de tarif, nom, résumé, mentions « Réponse sous {n} jour(s) ouvré(s) », « Compte FETRAG requis », « Paiement en ligne sécurisé », bouton « Déposer une demande ».', icon: 'file-text' },
            { name: '« En quoi consiste ce service »', purpose: 'Votre **Description détaillée**.', icon: 'book-open' },
            { name: 'Section « Déposer une demande »', purpose: 'Le formulaire : « Vos coordonnées » (Nom complet, Adresse email, Téléphone, Organisation), « Informations sur votre demande » (vos champs), « Message complémentaire » (4 000 caractères maximum), case de consentement, bouton `Déposer ma demande` ou `Déposer et payer`.', icon: 'send' },
            { name: 'Colonne « En bref »', purpose: 'Tarif, Délai indicatif, Accès (« Compte FETRAG requis » ou « Ouvert à tous »), « Demandes traitées » (nombre total de demandes déposées), encadré « Conditions » (vos **Conditions d’accès**), boutons de partage, « Autres services ».', icon: 'info' },
          ],
        },
        {
          type: 'steps',
          title: 'Le parcours du demandeur (service gratuit)',
          intro: 'Utile pour guider un membre par téléphone.',
          items: [
            { text: 'Le membre ouvre **Services** dans le menu du site puis clique sur le service voulu.' },
            {
              text: 'Si le service exige un compte et qu’il n’est pas connecté, il voit l’alerte « Compte FETRAG requis » et clique sur « Se connecter » (ou « Créer un compte »).',
              result: 'Après connexion, il revient automatiquement sur la fiche du service.',
            },
            { text: 'Il remplit « Vos coordonnées » (nom et email sont préremplis s’il est connecté), vos champs spécifiques et le « Message complémentaire ».' },
            { text: 'Il coche la case de consentement (obligatoire) puis clique sur `Déposer ma demande`.' },
            {
              text: 'Il voit le bloc « Demande enregistrée » avec le message « Votre demande « {service} » a été enregistrée sous la référence SRV-… Un accusé de réception vous a été envoyé par email. »',
              result: 'De votre côté, la demande apparaît en statut « Nouvelle » dans **Demandes** et vous recevez une notification interne.',
            },
            {
              text: 'Il suit l’avancement dans **Mes demandes** de son espace personnel : référence, service, date, statut, « Suivi par » (votre nom ou « En attente d’attribution »).',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Règles appliquées au formulaire public',
          columns: ['Champ', 'Règle', 'Message d’erreur affiché au demandeur'],
          rows: [
            ['Nom complet', 'Obligatoire, 2 à 120 caractères.', '« Champ obligatoire »'],
            ['Adresse email', 'Obligatoire, adresse valide (mise en minuscules).', '« Adresse email invalide »'],
            ['Téléphone', 'Facultatif, 6 à 20 caractères (chiffres, espaces, +, parenthèses, tirets, points).', '« Numéro de téléphone invalide »'],
            ['Organisation', 'Facultatif, 160 caractères maximum.', '—'],
            ['Vos champs spécifiques', 'Obligatoires si cochés ; liste de choix limitée aux options ; nombre, date et email vérifiés ; 5 000 caractères maximum par champ.', '« Champ obligatoire », « Valeur non autorisée », « Nombre attendu », « Date invalide », « Texte trop long »'],
            ['Message complémentaire', 'Facultatif, 4 000 caractères maximum.', '« Texte trop long »'],
            ['Consentement', 'Obligatoire.', '« Vous devez accepter le traitement de vos données. »'],
            ['Nombre de dépôts', '5 demandes par heure et par compte (ou adresse Internet).', '« Trop de demandes envoyées. Réessayez dans {délai}. »'],
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Quand un membre dit « je n’arrive pas à déposer ma demande »',
          text: 'Demandez-lui le message affiché. « Ce service n’est plus disponible. » signifie que le service n’est plus publié ; « Connectez-vous pour déposer cette demande. » que le service exige un compte ; « Le formulaire est incomplet : vérifiez les champs signalés. » qu’un champ obligatoire est vide ou mal rempli.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'reperer-les-demandes',
      title: 'Comment repérer et trier les demandes',
      icon: 'inbox',
      summary: 'Trouver les nouvelles demandes, filtrer la liste et lire les échéances.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Services', 'Demandes'], href: '/admin/demandes' },
        {
          type: 'paragraph',
          text: 'Quatre signaux vous indiquent qu’une demande attend : le badge à côté de **Demandes** dans le menu (demandes « Nouvelle » et « En examen »), la tuile « Nouvelles » (« À attribuer ») en haut de la liste, les lignes surlignées en jaune pâle dans le tableau, et la notification interne « Nouvelle demande de service » dans votre espace personnel.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Demandes** dans la section « Services ».',
              where: 'menu de gauche ; sur mobile, bouton **Ouvrir la navigation**',
              result: 'La page « Demandes de service » s’affiche : quatre tuiles, une barre de filtres, le tableau et le bouton `Exporter (CSV)`.',
            },
            {
              text: 'Lisez les tuiles : « Nouvelles » (à attribuer), « En examen ou en traitement », « Traitées » (avec le nombre de clôturées) et « Demandes ouvertes » (avec le nombre de refusées).',
            },
            {
              text: 'Pour retrouver une demande, saisissez sa référence, le nom, l’email ou l’organisation du demandeur dans le champ de recherche, puis cliquez sur `Filtrer`.',
              where: 'barre de filtres au-dessus du tableau (champs empilés sur mobile)',
            },
            {
              text: 'Affinez avec les listes **Statut**, **Service** et **Responsable**.',
              note: 'La liste **Responsable** propose « Mes demandes » pour ne voir que les demandes qui vous sont attribuées.',
            },
            {
              text: 'Cliquez sur le nom du service dans la colonne « Demande » pour ouvrir une demande.',
              result: 'La fiche de la demande s’ouvre.',
            },
            {
              text: 'Cliquez sur `Réinitialiser` pour revenir à la liste complète.',
              note: 'La liste affiche 20 demandes par page, de la plus récente à la plus ancienne. Utilisez la pagination en bas.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Les colonnes du tableau (certaines sont masquées sur téléphone)',
          columns: ['Colonne', 'Contenu', 'Visible sur téléphone ?'],
          rows: [
            ['Demande', 'Nom du service (cliquable) et référence SRV-AAAA-XXXXXX ; le badge de statut y est rappelé sur mobile.', 'Oui'],
            ['Demandeur', 'Nom, puis email et organisation.', 'Oui'],
            ['Statut', 'Badge « Nouvelle », « En examen », « En traitement », « Traitée », « Refusée » ou « Clôturée ».', 'Non (rappelé sous le nom)'],
            ['Échéance', 'Badge « {n} j restants » (vert), « Échéance aujourd’hui » ou « {n} j restant(s) » (orange à 2 jours ou moins), « Échéance dépassée de {n} j » (rouge). « — » si le service n’a pas de délai ou si la demande est terminée.', 'Non'],
            ['Responsable', 'Nom de la personne attribuée ou « Non attribuée ».', 'Non'],
            ['Déposée', 'Date relative (« il y a 2 jours ») ; la date exacte apparaît au survol.', 'Non'],
            ['Paiement', '« Commande liée » (payée), « En attente » (service payant non réglé) ou « Gratuit ».', 'Non'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'L’échéance est indicative',
          text: 'L’échéance est calculée en jours calendaires depuis la date de dépôt, à partir du « Délai indicatif (jours) » du service. Aucun rappel automatique n’est envoyé : consultez la liste régulièrement et triez mentalement par couleur (rouge d’abord).',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le tableau affiche « Aucune demande ».',
              cause: 'Aucune demande ne correspond aux filtres, ou aucune demande n’a encore été déposée.',
              solution: 'Cliquez sur `Réinitialiser`. Si la liste reste vide, vérifiez que vos services sont bien « Publié ».',
            },
            {
              problem: 'Je ne vois pas la colonne « Échéance » ou « Responsable ».',
              cause: 'L’écran est trop étroit : ces colonnes sont masquées sur téléphone.',
              solution: 'Ouvrez la demande pour voir tous les détails, ou tournez le téléphone en mode paysage.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'instruire-une-demande',
      title: 'Comment instruire une demande',
      icon: 'clipboard-list',
      summary: 'Lire la demande, l’attribuer, changer son statut en informant le demandeur, garder une note interne.',
      blocks: [
        {
          type: 'screen',
          title: 'La fiche d’une demande',
          description: 'Titre = nom du service ; sous-titre « Demande {référence} déposée le {date} par {nom} » ; grand badge de statut à droite (sous le titre sur mobile). Sur téléphone, les cartes sont empilées et les trois panneaux d’action apparaissent après l’historique.',
          areas: [
            { name: 'Carte « Demandeur »', purpose: 'Nom, « Compte : {email} » ou « Sans compte », email (cliquable pour écrire depuis votre messagerie), téléphone, organisation et le bloc « Message » rédigé par le demandeur.', icon: 'user' },
            { name: 'Carte « Informations saisies »', purpose: 'Les réponses aux champs spécifiques de votre formulaire (« — » si vide, « Oui » / « Non » pour une case à cocher). Absente si le service n’a pas de champ spécifique.', icon: 'list-checks' },
            { name: 'Carte « Paiement » (services payants)', purpose: '« Commande CMD-… · {montant} · payée le {date} » avec le statut de la commande, ou « Service payant ({montant}) : aucune commande réglée n’est encore associée. »', icon: 'credit-card' },
            { name: 'Carte « Historique »', purpose: 'La frise des changements : « {ancien statut} → {nouveau statut} {date} » avec le commentaire transmis. Le dépôt crée toujours une première ligne vers « Nouvelle ».', icon: 'history' },
            { name: 'Panneau « Attribution »', purpose: 'Liste **Responsable** et bouton `Enregistrer l’attribution`.', icon: 'users' },
            { name: 'Panneau « Changer le statut »', purpose: 'Liste **Nouveau statut**, zone **Commentaire pour le demandeur** et bouton `Appliquer le statut`.', icon: 'refresh' },
            { name: 'Panneau « Note interne »', purpose: 'Zone **Note** et bouton `Enregistrer la note`. Visible uniquement par l’équipe des services.', icon: 'notebook' },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Lien vers le compte du demandeur',
          text: 'Le lien « Compte : {email} » mène à la fiche utilisateur, réservée à d’autres rôles : votre rôle obtient « Accès refusé ». Ce n’est pas une panne. Pour une question sur le compte du demandeur, adressez-vous au support ou au super administrateur.',
        },
      ],
      subsections: [
        {
          id: 'attribuer-une-demande',
          title: 'Attribuer la demande',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la demande depuis **Demandes** (ou depuis la notification « Nouvelle demande de service », ou depuis la carte « Dernières demandes de service » du tableau de bord).',
                  result: 'La fiche s’affiche avec le badge « Nouvelle ».',
                },
                {
                  text: 'Lisez la carte « Demandeur », le « Message » et les « Informations saisies ».',
                  note: 'Pour un service payant, vérifiez la carte « Paiement » : n’instruisez pas une demande dont le paiement est « En attente ».',
                },
                {
                  text: 'Dans le panneau « Attribution », choisissez un **Responsable** (vous-même ou un collègue).',
                  where: 'colonne de droite sur ordinateur ; après l’historique sur mobile',
                  note: 'Seules les personnes ayant le rôle « Responsable services », « Support » ou « Super administrateur » peuvent être désignées. La liste affiche aussi des éditeurs, mais leur désignation est refusée.',
                },
                {
                  text: 'Cliquez sur `Enregistrer l’attribution` (le bouton affiche « Attribution » pendant l’envoi).',
                  result: '« Demande {référence} attribuée à {nom}. » ; une demande « Nouvelle » passe automatiquement « En examen » et une ligne s’ajoute à l’« Historique ».',
                },
                {
                  text: 'Si vous attribuez la demande à un collègue, prévenez-le : il reçoit seulement une notification interne « Demande de service attribuée », sans email.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Le responsable désigné doit avoir le rôle Responsable services ou Support ».',
                  cause: 'La personne choisie est un éditeur ou n’a plus le rôle requis.',
                  solution: 'Choisissez une autre personne de l’équipe des services ou du support.',
                },
                {
                  problem: '« Vous n’avez pas accès à cette demande ».',
                  cause: 'Votre session a expiré ou votre rôle a changé.',
                  solution: 'Reconnectez-vous ; si le message persiste, contactez le super administrateur.',
                },
              ],
            },
          ],
        },
        {
          id: 'changer-le-statut',
          title: 'Faire avancer le statut et informer le demandeur',
          blocks: [
            {
              type: 'paragraph',
              text: 'Chaque changement de statut envoie un email au demandeur (sujet « Demande {référence} : {statut} ») avec votre commentaire. Le commentaire est aussi conservé dans l’« Historique ». C’est votre seul moyen de répondre par écrit depuis la plateforme : rédigez-le avec soin.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans le panneau « Changer le statut », choisissez le **Nouveau statut** (obligatoire).',
                  note: 'L’aide rappelle « Statut actuel : {statut} ». La liste ne propose que les passages autorisés.',
                },
                {
                  text: 'Rédigez le **Commentaire pour le demandeur** (facultatif, 3 000 caractères maximum) : ce que vous avez compris, ce qu’il doit fournir, le prochain contact.',
                  note: 'Vouvoyez, saluez, signez au nom de la Fédération. N’y mettez aucune information sur une autre personne.',
                },
                {
                  text: 'Cliquez sur `Appliquer le statut` (le bouton affiche « Mise à jour » pendant l’envoi).',
                  result: '« Demande {référence} mise à jour ; le demandeur est informé par email. » Le badge et l’« Historique » sont mis à jour.',
                },
                {
                  text: 'Passez la demande « En traitement » dès que vous commencez à y travailler.',
                  result: 'Le demandeur voit « En traitement » dans **Mes demandes** et reçoit l’email « Demande {référence} : En traitement ».',
                },
                {
                  text: 'Quand la réponse est apportée, passez la demande « Traitée » avec un commentaire qui résume la réponse.',
                  note: 'Si un complément est nécessaire ensuite, « Traitée » peut revenir « En traitement ».',
                },
                {
                  text: 'Si la demande est hors périmètre ou irrecevable, passez-la « Refusée » avec un commentaire courtois expliquant le motif et, si possible, une orientation (autre service, formulaire de contact).',
                  note: 'Une demande « Refusée » peut revenir « En examen » si de nouveaux éléments arrivent.',
                },
                {
                  text: 'Quand plus aucun échange n’est attendu, passez la demande « Clôturée ».',
                  result: 'Le panneau affiche « Cette demande est clôturée : aucune transition n’est possible. »',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Les statuts d’une demande et les passages autorisés',
              items: [
                { label: 'Nouvelle', tone: 'warning', meaning: 'Vient d’être déposée, personne ne s’en occupe encore. Comptée dans « À attribuer » et dans le badge du menu.', next: 'Attribuer (passe automatiquement « En examen »), ou passer « En traitement », « Refusée », « Clôturée ».' },
                { label: 'En examen', tone: 'info', meaning: 'Attribuée à un responsable, ou paiement confirmé pour un service payant. L’équipe vérifie la recevabilité.', next: 'Passer « En traitement », « Traitée », « Refusée » ou « Clôturée ».' },
                { label: 'En traitement', tone: 'info', meaning: 'Instruction en cours ; le demandeur en a été informé par email.', next: 'Passer « Traitée », « Refusée » ou « Clôturée ».' },
                { label: 'Traitée', tone: 'success', meaning: 'La réponse a été apportée. N’entre plus dans le calcul d’échéance.', next: 'Passer « Clôturée », ou revenir « En traitement » pour un complément.' },
                { label: 'Refusée', tone: 'danger', meaning: 'Demande non recevable ou hors périmètre. Peut être supprimée.', next: 'Passer « Clôturée », ou revenir « En examen ».' },
                { label: 'Clôturée', tone: 'neutral', meaning: 'Dossier fermé définitivement : plus aucun passage possible. Peut être supprimée (droit à l’effacement).', next: 'Aucune action, sauf suppression.' },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: '« Clôturée » est définitif',
              text: 'Une demande clôturée ne peut plus changer de statut. Si un échange est encore possible, préférez « Traitée » (réversible vers « En traitement ») ou « Refusée » (réversible vers « En examen »).',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Choisissez un statut » ou « Statut invalide. »',
                  cause: 'Aucun statut n’a été sélectionné dans la liste.',
                  solution: 'Sélectionnez un **Nouveau statut** puis cliquez de nouveau sur `Appliquer le statut`.',
                },
                {
                  problem: '« Transition « {statut} » vers « {statut} » non autorisée ».',
                  cause: 'Un collègue a changé le statut entre-temps, ou le passage n’existe pas.',
                  solution: 'Rechargez la page et choisissez un statut proposé dans la liste.',
                },
                {
                  problem: 'Le demandeur dit ne pas avoir reçu l’email.',
                  cause: 'Email dans les indésirables, adresse mal saisie au dépôt, ou incident d’envoi.',
                  solution: 'Demandez-lui de vérifier les indésirables. S’il a un compte, il retrouve le message dans **Notifications** de son espace. Sinon, écrivez-lui depuis votre messagerie en rappelant la référence.',
                },
              ],
            },
          ],
        },
        {
          id: 'note-interne',
          title: 'Garder une note interne',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans le panneau « Note interne », rédigez la **Note** (facultatif, 5 000 caractères maximum) : vérifications faites, personnes contactées, décision prise.',
                  note: 'La note n’est jamais transmise au demandeur, mais elle est lue par toute l’équipe des services et du support : restez factuel et respectueux.',
                },
                {
                  text: 'Cliquez sur `Enregistrer la note` (le bouton affiche « Enregistrement » pendant l’envoi).',
                  result: '« Note interne enregistrée. » La note remplace la précédente : reprenez son contenu si vous voulez le conserver.',
                },
                {
                  text: 'Si le demandeur vous écrit par email, répondez depuis votre messagerie en citant la référence SRV, puis résumez l’échange dans la note.',
                  note: 'Les échanges par email ne sont pas enregistrés dans la plateforme : la note interne est le seul endroit où en garder la trace.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'demandes-payantes',
      title: 'Comment suivre une demande sur un service payant',
      icon: 'credit-card',
      summary: 'Comprendre le lien entre la demande, la commande et le paiement, et savoir vers qui orienter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pour un service payant, le membre doit être connecté. Après avoir cliqué sur `Déposer et payer`, sa demande est créée en statut « Nouvelle », puis une commande (référence CMD-…) est créée et il est dirigé vers la page de paiement (Mobile Money ou carte). La demande n’est instruite qu’après confirmation du paiement.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Dans **Demandes**, regardez la colonne « Paiement » (ordinateur) ou ouvrez la demande et lisez la carte « Paiement » (téléphone).',
              result: '« En attente » : aucun paiement confirmé ; « Commande liée » : le paiement est confirmé.',
            },
            {
              text: 'Tant que la carte affiche « Service payant ({montant}) : aucune commande réglée n’est encore associée. », attendez : ne passez pas la demande « En traitement ».',
              note: 'Le demandeur peut régler plus tard depuis **Paiements et reçus** de son espace personnel.',
            },
            {
              text: 'Dès que le paiement est confirmé, la demande passe automatiquement de « Nouvelle » à « En examen » avec la ligne d’historique « Paiement reçu (CMD-…) ».',
              result: 'La carte « Paiement » affiche « Commande CMD-… · {montant} · payée le {date} » et le statut de la commande (« Payée »).',
            },
            {
              text: 'Attribuez-vous la demande et instruisez-la comme une demande gratuite.',
            },
            {
              text: 'En cas de question sur le paiement (double débit, paiement débité mais « En attente », remboursement), transmettez la référence de la demande et la référence CMD au service Finance.',
              note: 'Le bouton « Voir la commande » n’apparaît pas pour votre rôle : vous ne voyez pas le détail des paiements.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts de commande affichés dans la carte « Paiement »',
          items: [
            { label: 'Payée', tone: 'success', meaning: 'Le paiement est confirmé ; la demande est instruite normalement.' },
            { label: 'En attente', tone: 'warning', meaning: 'Le paiement n’a pas encore été confirmé par l’opérateur.', next: 'Patienter ; au-delà d’une heure avec preuve de débit, orienter vers Finance.' },
            { label: 'Échouée / Annulée', tone: 'danger', meaning: 'Le paiement n’a pas abouti.', next: 'Le demandeur peut reprendre le paiement depuis son espace personnel.' },
            { label: 'Remboursée / Partiellement remboursée', tone: 'neutral', meaning: 'Finance a remboursé tout ou partie du montant.', next: 'Clôturer la demande avec un commentaire si le service n’est pas rendu.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le membre a vu « Le paiement n’a pas pu être initié : vous pourrez le régler depuis votre espace personnel. »',
              cause: 'Le passage vers la page de paiement a échoué au moment du dépôt ; la demande existe quand même.',
              solution: 'Indiquez-lui de régler depuis **Paiements et reçus** dans son espace personnel. La demande passera « En examen » à la confirmation.',
            },
            {
              problem: 'Le membre a vu « Le paiement de ce service sera proposé depuis votre espace personnel. »',
              cause: 'L’offre de paiement du service n’était pas disponible au moment du dépôt.',
              solution: 'Enregistrez de nouveau la fiche du service (cela resynchronise l’offre) puis prévenez le service Finance si le problème persiste.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'supprimer-une-demande',
      title: 'Comment supprimer une demande (droit à l’effacement)',
      icon: 'trash',
      summary: 'Effacer définitivement une demande clôturée ou refusée, à la demande de la personne concernée.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toute personne peut demander l’effacement de ses données. Vous pouvez supprimer une demande seulement si elle est « Clôturée » ou « Refusée ». Le support ne peut pas le faire : cette action est réservée à votre rôle.',
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Irréversible',
          text: 'La suppression efface la demande, les informations saisies et tout son historique de statut. Seule une trace dans le journal d’audit (référence et statut) est conservée. Vérifiez la référence deux fois avant de confirmer.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la demande et vérifiez son statut dans le grand badge.',
              note: 'Si elle n’est ni « Clôturée » ni « Refusée », le bouton de suppression n’apparaît pas : passez-la d’abord « Clôturée » avec `Appliquer le statut`.',
            },
            {
              text: 'Cliquez sur le bouton rouge « Supprimer la demande ».',
              where: 'en bas de la colonne des panneaux d’action',
              result: 'Le dialogue « Supprimer la demande {référence} ? » s’affiche avec la mention « Suppression définitive (droit à l’effacement). »',
            },
            {
              text: 'Cliquez sur `Supprimer` pour confirmer, ou `Annuler`.',
              result: '« Demande supprimée. » et retour à la liste des demandes.',
            },
            {
              text: 'Confirmez l’effacement à la personne depuis votre messagerie.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Seules les demandes clôturées ou refusées peuvent être supprimées ».',
              cause: 'Le statut a changé entre l’ouverture de la page et la confirmation.',
              solution: 'Rechargez la page, passez la demande « Clôturée », puis recommencez.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'exporter-les-demandes',
      title: 'Comment exporter la liste des demandes',
      icon: 'download',
      summary: 'Produire un fichier tableur pour un bilan ou une réunion.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre rôle n’a pas accès aux rapports du back-office. Les seuls indicateurs disponibles sont les tuiles de la page **Demandes**, celles du tableau de bord et l’export CSV (un fichier tableur lisible dans Excel ou LibreOffice).',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Demandes** et appliquez les filtres souhaités (statut, service, responsable, recherche).',
              note: 'L’export respecte les filtres en cours. La recherche de l’export porte sur la référence, le nom et l’email (pas sur l’organisation).',
            },
            {
              text: 'Cliquez sur `Exporter (CSV)`.',
              where: 'en haut à droite de la page (icône de téléchargement)',
              result: 'Un fichier nommé fetrag-demandes-de-service-{date}.csv se télécharge.',
            },
            {
              text: 'Ouvrez le fichier dans votre tableur.',
              note: 'Colonnes : Référence, Service, Statut, Nom, Email, Téléphone, Organisation, Responsable, Créée le, Mise à jour le. Séparateur « ; ». 5 000 lignes au maximum : affinez les filtres pour les longues périodes.',
            },
            {
              text: 'Supprimez le fichier de l’appareil une fois le bilan terminé.',
              note: 'Le fichier contient des données personnelles. Ne l’envoyez jamais par WhatsApp ni sur une messagerie non professionnelle. Chaque export est enregistré dans le journal d’audit.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « L’export a échoué. » s’affiche.',
              cause: 'Incident passager ou session expirée.',
              solution: 'Rechargez la page, reconnectez-vous si nécessaire et recommencez.',
            },
            {
              problem: 'Les accents sont mal affichés dans le tableur.',
              cause: 'Le tableur n’a pas reconnu l’encodage.',
              solution: 'Ouvrez le fichier via « Données » > « À partir d’un fichier texte » en choisissant l’encodage UTF-8 et le séparateur « ; ».',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'gerer-les-categories',
      title: 'Comment gérer les catégories de services',
      icon: 'tag',
      summary: 'Créer et corriger les catégories qui classent vos services.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Catégories'], href: '/admin/categories' },
        {
          type: 'paragraph',
          text: 'Les catégories classent tous les contenus du site (actualités, ressources, formations, services, événements). Vous voyez toutes les catégories, mais vous ne pouvez créer que des catégories du domaine « Services ». Vous pouvez modifier n’importe quelle catégorie ; vous ne pouvez ni en supprimer ni les réordonner (réservé à l’éditeur).',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Catégories** dans la section « Contenus ».',
              result: 'La page « Catégories » s’affiche avec un tableau (nom, domaine, utilisations, ordre).',
            },
            {
              text: 'Choisissez « Services » dans la liste **Domaine** puis cliquez sur `Filtrer`.',
              result: 'Seules les catégories de services sont affichées ; le domaine « Services » sera présélectionné à la création.',
            },
            {
              text: 'Cliquez sur `Nouvelle catégorie`.',
              where: 'en haut à droite',
              result: 'Le dialogue « Nouvelle catégorie » s’ouvre.',
            },
            { text: 'Saisissez le **Nom** (obligatoire, 2 à 120 caractères).' },
            {
              text: 'Vérifiez que **Domaine** indique « Services ».',
              note: 'Le dialogue propose tous les domaines, mais le serveur refuse toute création hors « Services » avec « Permission insuffisante ».',
            },
            {
              text: 'Renseignez si besoin la **Description** (500 caractères maximum), le **Slug** (généré si vide), la **Couleur** (format #RRGGBB, bleu de la charte par défaut) et l’**Ordre** (0 à 10 000).',
            },
            {
              text: 'Cliquez sur `Créer la catégorie`.',
              result: '« Catégorie « {nom} » enregistrée. » ; le dialogue se ferme et la liste se rafraîchit.',
            },
            {
              text: 'Pour corriger une catégorie, cliquez sur **Modifier** sur sa ligne, changez les champs puis cliquez sur `Enregistrer`.',
              where: 'bouton à droite de la ligne',
            },
            {
              text: 'Rattachez la catégorie à un service depuis l’onglet `Présentation` de sa fiche (liste **Catégorie**), puis `Enregistrer le service`.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Permission insuffisante » à la création.',
              cause: 'Le **Domaine** choisi n’est pas « Services ».',
              solution: 'Rouvrez le dialogue et choisissez « Services ».',
            },
            {
              problem: 'Je veux supprimer une catégorie inutile.',
              cause: 'La suppression est réservée à l’éditeur et refusée si la catégorie est utilisée.',
              solution: 'Retirez d’abord la catégorie des services concernés, puis demandez la suppression à l’éditeur.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'mediatheque',
      title: 'Comment ajouter une image ou un document',
      icon: 'image',
      summary: 'Envoyer un fichier dans la médiathèque et l’utiliser dans la description d’un service.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Contenus', 'Médias'], href: '/admin/medias' },
        {
          type: 'paragraph',
          text: 'La médiathèque rassemble les fichiers réutilisables du site : images, documents, audio, vidéo. Chaque fichier a une adresse que vous pouvez coller dans un lien de la description ou des conditions d’un service. Les images insérées directement depuis l’éditeur de description sont rangées automatiquement dans le dossier « services ».',
        },
        {
          type: 'table',
          caption: 'Formats et tailles acceptés',
          columns: ['Type', 'Formats', 'Taille maximale'],
          rows: [
            ['Images', 'JPEG, PNG, WebP, GIF, AVIF (le SVG est refusé)', '8 Mo'],
            ['Documents', 'PDF, Word, Excel, PowerPoint, ODT, TXT, CSV', '25 Mo'],
            ['Audio', 'MP3, MP4 audio, OGG, WAV, WebM', '60 Mo'],
            ['Vidéo', 'MP4, WebM', '200 Mo'],
          ],
        },
        {
          type: 'steps',
          title: 'Envoyer un fichier',
          items: [
            {
              text: 'Ouvrez **Médias** dans la section « Contenus ».',
              result: 'La page « Médiathèque » affiche une grille de fichiers (une colonne sur téléphone).',
            },
            {
              text: 'Cliquez sur `Envoyer un fichier`.',
              result: 'Le dialogue « Envoyer un fichier » s’ouvre.',
            },
            {
              text: 'Choisissez le **Fichier** (obligatoire) sur votre appareil.',
              note: 'Le dialogue indique « Images (12 Mo) » mais la limite réellement appliquée aux images est 8 Mo.',
            },
            {
              text: 'Indiquez le **Dossier** (facultatif, par exemple « services » : minuscules, chiffres, tirets).',
            },
            {
              text: 'Choisissez la **Visibilité** : « Public » (par défaut) ou « Privé (lien signé) ».',
              note: 'Un fichier privé n’est accessible que par un lien temporaire (15 minutes par défaut) : réservez-le aux documents internes.',
            },
            {
              text: 'Pour une image, renseignez le **Texte alternatif** (300 caractères maximum) : une phrase qui décrit l’image pour les personnes malvoyantes.',
            },
            {
              text: 'Cliquez sur `Envoyer` (le bouton affiche « Envoi en cours »).',
              result: '« « {nom} » envoyé. » et la page se recharge avec le nouveau fichier.',
            },
            {
              text: 'Cliquez sur **Copier l’URL** sur la carte du fichier (ou **Copier la clé** pour un fichier privé).',
              result: '« URL copiée » : collez l’adresse dans un lien de la description ou des conditions du service.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Insérer une image dans la description d’un service',
          items: [
            {
              text: 'Dans l’onglet `Présentation` de la fiche du service, placez le curseur dans la **Description détaillée** puis cliquez sur le bouton **Insérer une image** de la barre d’outils.',
              result: 'Le dialogue « Insérer une image » s’ouvre.',
            },
            {
              text: 'Saisissez d’abord le **Texte alternatif** (obligatoire).',
              note: 'Le choix du fichier reste désactivé tant que ce champ est vide (« Renseignez d’abord le texte alternatif. »).',
            },
            {
              text: 'Choisissez le **Fichier image** (PNG, JPEG, WebP, GIF ou AVIF), ou collez une adresse dans **Ou URL de l’image** puis cliquez sur `Insérer par URL`.',
              result: 'L’image apparaît dans la description ; elle est stockée dans le dossier « services » de la médiathèque.',
            },
            {
              text: 'Cliquez sur `Enregistrer le service` pour conserver la modification.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Supprimer un fichier casse les liens',
          text: 'Le dialogue « Supprimer « {fichier} » ? » prévient : « Les contenus qui l’utilisent afficheront un lien cassé. » Avant de supprimer, vérifiez qu’aucun service ni aucune page ne l’utilise.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Le fichier dépasse la taille maximale de {n} Mo ».',
              cause: 'Le fichier est trop lourd.',
              solution: 'Réduisez l’image (par exemple en la ré-enregistrant en JPEG ou WebP) ou compressez le document, puis réessayez.',
            },
            {
              problem: '« Type de fichier non autorisé ».',
              cause: 'Le format n’est pas dans la liste (par exemple SVG, ZIP).',
              solution: 'Convertissez le fichier dans un format accepté.',
            },
            {
              problem: '« Copie impossible dans ce navigateur ».',
              cause: 'Le navigateur bloque l’accès au presse-papiers.',
              solution: 'Ouvrez le fichier dans un nouvel onglet et copiez son adresse depuis la barre d’adresse.',
            },
            {
              problem: 'La carte affiche « Texte alternatif manquant ».',
              cause: 'L’image a été envoyée sans description.',
              solution: 'Cliquez sur **Modifier**, renseignez le **Texte alternatif**, puis `Enregistrer`.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'messages-recus',
      title: 'Comment traiter un message reçu de type « Demande de service »',
      icon: 'mail',
      summary: 'Répondre aux personnes qui ont écrit par le formulaire de contact plutôt que par le catalogue.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Relations', 'Messages reçus'], href: '/admin/messages' },
        {
          type: 'paragraph',
          text: 'Les formulaires du site (contact, assistance, adhésion, partenariat, demande de service) arrivent dans **Messages reçus** avec une référence MSG-AAAA-XXXXXX. Chaque expéditeur reçoit un accusé de réception annonçant une réponse sous 48 heures ouvrées. Les messages de type « Demande de service » vous sont notifiés en interne ; les autres types sont suivis par l’éditeur ou le support.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Messages reçus** dans la section « Relations ».',
              result: 'La page affiche les tuiles « Nouveaux », « Attribués », « Répondus », « Clôturés », les filtres et le tableau (lignes « Nouveau » surlignées).',
            },
            {
              text: 'Choisissez « Demande de service » dans la liste **Type** puis cliquez sur `Filtrer`.',
            },
            {
              text: 'Cliquez sur un message pour l’ouvrir.',
              result: 'La fiche affiche l’expéditeur, le message, les « Informations complémentaires » et les panneaux « Traitement » et « Attribution ».',
            },
            {
              text: 'Dans « Attribution », choisissez-vous comme **Responsable** puis cliquez sur `Enregistrer`.',
              result: '« Message attribué. » ; le statut passe « Attribué ».',
            },
            {
              text: 'Cliquez sur « Répondre par email » dans le panneau « Traitement ».',
              result: 'Votre messagerie s’ouvre avec l’objet « [FETRAG {référence}] Votre message ». Rédigez et envoyez la réponse depuis votre messagerie.',
            },
            {
              text: 'Si la demande relève d’un service du catalogue, invitez la personne à déposer une demande depuis la page **Services** du site : elle obtiendra une référence SRV et un suivi.',
            },
            {
              text: 'De retour sur la fiche, cliquez sur « Marquer répondu ».',
              result: '« Message {référence} mis à jour. » ; la date de réponse est enregistrée.',
            },
            {
              text: 'Quand l’échange est terminé, cliquez sur « Clôturer ». Pour un courrier indésirable, cliquez sur « Indésirable ».',
              note: '« Remettre en nouveau » annule une prise en charge. Seuls les messages « Indésirable » ou « Clôturé » peuvent être supprimés (bouton « Supprimer le message », définitif).',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’un message reçu',
          items: [
            { label: 'Nouveau', tone: 'warning', meaning: 'Personne ne l’a encore pris en charge.', next: 'Attribuer.' },
            { label: 'Attribué', tone: 'info', meaning: 'Une personne en est responsable.', next: 'Répondre par email puis « Marquer répondu ».' },
            { label: 'Répondu', tone: 'success', meaning: 'Une réponse a été envoyée ; la date est enregistrée.', next: '« Clôturer » quand l’échange est terminé.' },
            { label: 'Clôturé', tone: 'neutral', meaning: 'Échange terminé.', next: 'Supprimable si nécessaire.' },
            { label: 'Indésirable', tone: 'danger', meaning: 'Courrier non sollicité.', next: 'Supprimable.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Lettre d’information',
          text: 'Le menu **Newsletter** vous montre les abonnés (« Confirmé », « En attente de confirmation », « Désinscrit ») et permet un export CSV des consentements. Ne supprimez un abonné qu’à sa demande explicite : l’adresse et son historique de consentement sont effacés définitivement.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Seuls les messages indésirables ou clôturés peuvent être supprimés ».',
              cause: 'Le message est encore « Nouveau », « Attribué » ou « Répondu ».',
              solution: 'Cliquez d’abord sur « Clôturer » ou « Indésirable ».',
            },
            {
              problem: 'Le lien « compte {nom} » affiche « Accès refusé ».',
              cause: 'La fiche utilisateur est réservée à d’autres rôles.',
              solution: 'Ce n’est pas une panne. Utilisez l’email affiché pour contacter la personne.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'consulter-les-contenus',
      title: 'Consulter les autres contenus du site (lecture seule)',
      icon: 'eye',
      summary: 'Ce que vous pouvez lire dans Pages, Actualités, Ressources, Événements, FAQ et Partenaires, et ce que vous ne pouvez pas y faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre rôle vous permet de lire tous les contenus du site, y compris les brouillons, pour vérifier par exemple qu’une actualité annonce correctement un service. Vous ne pouvez rien y modifier : les boutons de création sont masqués et l’enregistrement répond « Permission insuffisante ».',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Pages**, **Actualités**, **Ressources** ou **FAQ** (section « Contenus »), ou **Événements** et **Partenaires et organisations** (section « Relations »).',
              result: 'La liste s’affiche avec ses filtres et ses statuts, sans bouton « Nouvelle… ».',
            },
            {
              text: 'Cliquez sur « Actions » à droite d’une ligne puis **Modifier** pour ouvrir la fiche en lecture, ou **Prévisualiser** pour voir la version publique.',
              note: 'Le menu ne propose ni changement de statut ni suppression.',
            },
            {
              text: 'Ne cliquez pas sur le bouton d’enregistrement d’une fiche : il est affiché mais le serveur refuse (« Permission insuffisante »). Aucune donnée n’est modifiée.',
            },
            {
              text: 'Pour demander une correction, envoyez à l’éditeur le titre du contenu, la phrase à corriger et la phrase de remplacement.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Pages du back-office refusées à votre rôle',
          columns: ['Page', 'Pourquoi', 'À qui s’adresser'],
          rows: [
            ['Menus, création de pages / actualités / ressources / événements / partenaires', 'Réservé à l’éditeur.', 'Éditeur'],
            ['Utilisateurs et rôles, Organisations, Paramètres, Journal d’audit', 'Réservé au super administrateur (et à certains rôles pour la lecture).', 'Super administrateur'],
            ['Finance', 'Réservé au service Finance.', 'Finance'],
            ['Rapports', 'Réservé aux rôles de pilotage.', 'Coordination ou super administrateur'],
            ['« Coordination LMS » (lien en bas du menu)', 'Réservé à la coordination des formations.', 'Coordination'],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Ce que la plateforme vous envoie, où le lire, et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La plateforme ne vous envoie aucun email en tant que responsable des services : vous recevez uniquement des notifications internes, visibles dans **Notifications** de votre espace personnel (menu de votre compte, initiales en haut à droite). Le back-office n’affiche pas de cloche : prenez l’habitude d’ouvrir **Notifications** ou la page **Demandes** chaque jour.',
        },
        {
          type: 'table',
          caption: 'Notifications internes reçues par votre rôle',
          columns: ['Titre', 'Déclencheur', 'Que faire'],
          rows: [
            ['« Nouvelle demande de service »', 'Un membre a déposé une demande sur un service publié. Corps : « {nom} - {service} ({référence}) ».', 'Ouvrir la notification (elle mène à la demande), attribuer et instruire.'],
            ['« Demande de service attribuée »', 'Un collègue vous a attribué une demande. Corps : « La demande {référence} vous a été attribuée. »', 'Ouvrir la demande et la faire avancer.'],
            ['« Nouveau message : Demande de service »', 'Un visiteur a utilisé le formulaire de contact avec le type « Demande de service ».', 'Ouvrir le message, l’attribuer, répondre par email et le marquer « Répondu ».'],
          ],
        },
        {
          type: 'table',
          caption: 'Emails envoyés au demandeur par vos actions',
          columns: ['Sujet', 'Déclencheur', 'Contenu'],
          rows: [
            ['« Votre demande {référence} - {service} »', 'Dépôt de la demande (automatique).', 'Accusé de réception, délai indicatif s’il existe, bouton « Suivre ma demande ». Pour un service payant : « Elle sera traitée dès confirmation du paiement. »'],
            ['« Demande {référence} : {statut} »', 'Chaque `Appliquer le statut`.', 'Référence, service, nouveau statut et votre « Commentaire pour le demandeur », bouton « Voir ma demande ». Une notification interne est aussi créée si le demandeur a un compte.'],
            ['Aucun email', 'Attribution, note interne, paiement confirmé (le passage automatique « En examen » n’envoie pas d’email de statut).', 'Prévenez le demandeur vous-même si nécessaire lors du prochain changement de statut.'],
          ],
        },
        {
          type: 'steps',
          title: 'Lire et classer vos notifications',
          items: [
            {
              text: 'Ouvrez le menu de votre compte puis **Notifications** (ou **Mon espace** puis **Notifications** dans le menu de gauche).',
              where: 'vos initiales, en haut à droite',
              result: 'La page « Vos notifications » s’affiche ; le badge du menu indique le nombre de non lues.',
            },
            {
              text: 'Cliquez sur une notification pour ouvrir la demande ou le message concerné.',
            },
            {
              text: 'Cliquez sur `Tout marquer comme lu` quand vous avez traité la liste.',
              result: 'Le filtre des non lues affiche « Aucune notification non lue ».',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Pas de rappel automatique',
          text: 'Aucune relance n’est envoyée quand une échéance approche ou est dépassée, et aucune notification n’est créée quand un service est envoyé en relecture ou publié. Organisez une revue quotidienne de la page **Demandes**.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield-check',
      summary: 'Délais, courtoisie, confidentialité et protection de votre compte.',
      blocks: [
        {
          type: 'list',
          title: 'Traitement des demandes',
          style: 'check',
          items: [
            'Attribuez chaque demande « Nouvelle » le jour même : le demandeur voit alors « Suivi par {votre nom} » au lieu de « En attente d’attribution ».',
            'Passez « En traitement » dès que vous commencez et écrivez un commentaire même court : l’email rassure le demandeur.',
            'Respectez le délai annoncé par le service ; si vous ne pouvez pas, dites-le au demandeur dans un commentaire avant l’échéance.',
            'Ne promettez jamais un résultat (issue d’une médiation, d’un litige) : décrivez ce que la Fédération va faire.',
            'Un refus s’explique toujours, avec courtoisie et une orientation (autre service, formulaire de contact, permanence).',
            'Clôturez seulement quand plus aucun échange n’est attendu ; « Traitée » reste réversible, « Clôturée » ne l’est pas.',
            'Notez dans « Note interne » toute vérification ou tout échange par email ou téléphone : c’est la mémoire du dossier pour vos collègues.',
          ],
        },
        {
          type: 'list',
          title: 'Catalogue',
          style: 'check',
          items: [
            'Relisez chaque fiche sur téléphone avant de publier : c’est ainsi que la majorité des membres la liront.',
            'Faites valider tarif, délai et conditions par le Secrétariat général avant publication ; un service payant engage aussi le service Finance.',
            'Limitez le formulaire de demande aux informations indispensables et expliquez chaque champ avec l’**Aide**.',
            'Préférez « Archiver » à « Supprimer » ; renseignez le texte alternatif de chaque image.',
          ],
        },
        {
          type: 'list',
          title: 'Confidentialité et sécurité',
          style: 'check',
          items: [
            'Les demandes contiennent des données personnelles et syndicales (litiges, employeur, situation) : n’ouvrez que les dossiers dont vous avez la charge et n’en parlez qu’aux personnes concernées.',
            'Ne recopiez jamais le contenu d’une demande dans WhatsApp, un SMS ou une messagerie personnelle ; utilisez la note interne et la messagerie professionnelle.',
            'Dans un commentaire au demandeur, ne mentionnez aucune information sur une autre personne.',
            'Activez la vérification en deux étapes et choisissez un mot de passe unique (au moins 8 caractères, une majuscule, un chiffre).',
            'Déconnectez-vous sur tout appareil partagé et fermez le navigateur ; ne laissez pas votre téléphone déverrouillé avec le back-office ouvert.',
            'Ne communiquez jamais votre mot de passe ni un code de vérification, même à un collègue ou à une personne se présentant comme le support.',
            'Supprimez les exports CSV de votre appareil après usage.',
            'Toutes vos actions (publication, attribution, statut, export, suppression) sont enregistrées dans le journal d’audit avec la date et l’appareil utilisé.',
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
              question: 'Le bouton « Prévisualiser » affiche « Ce service est introuvable ». Est-ce normal ?',
              answer: 'Oui : la page publique n’affiche que les services publiés, et le mode de prévisualisation n’est pas pris en charge pour les services. Relisez la fiche dans le formulaire du back-office, ou publiez le service et utilisez « Voir en ligne ».',
            },
            {
              question: 'Comment changer l’ordre des services dans le catalogue public ?',
              answer: 'Modifiez le champ **Ordre d’affichage** (onglet `Présentation`) de chaque service : les plus petits numéros apparaissent en premier, puis l’ordre alphabétique. Il n’existe pas de glisser-déposer.',
            },
            {
              question: 'Puis-je répondre au demandeur sans changer le statut ?',
              answer: 'Non. Seul le « Commentaire pour le demandeur » lié à `Appliquer le statut` est envoyé par email. Pour un simple message, utilisez le lien email de la carte « Demandeur » depuis votre messagerie, puis résumez l’échange dans la « Note interne ».',
            },
            {
              question: 'Le demandeur peut-il joindre un document (contrat, bulletin de paie) ?',
              answer: 'Pas depuis le formulaire : le type de champ « Pièce jointe » demande seulement le nom du document. Convenez ensuite avec le demandeur d’un mode d’envoi sûr (remise en main propre, messagerie professionnelle) et notez-le dans la note interne.',
            },
            {
              question: 'Je ne trouve pas le bouton « Supprimer la demande ».',
              answer: 'Il n’apparaît que sur une demande « Clôturée » ou « Refusée ». Passez d’abord la demande dans l’un de ces statuts. Le support ne dispose pas de ce bouton.',
            },
            {
              question: 'Pourquoi ne puis-je pas supprimer un service ?',
              answer: 'Parce qu’au moins une demande a été déposée sur ce service : les demandes doivent rester consultables. Utilisez « Archiver » : le service disparaît du catalogue mais ses demandes restent accessibles.',
            },
            {
              question: 'Une demande payante reste « Nouvelle » depuis plusieurs jours.',
              answer: 'Le paiement n’a pas été confirmé (colonne « Paiement » = « En attente »). Le demandeur peut régler depuis « Paiements et reçus » de son espace personnel. S’il affirme avoir payé, transmettez la référence de la demande au service Finance : vous n’avez pas accès au détail des commandes.',
            },
            {
              question: 'Je veux attribuer une demande à un éditeur et le serveur refuse.',
              answer: 'Seules les personnes ayant le rôle « Responsable services », « Support » ou « Super administrateur » peuvent instruire une demande. La liste affiche aussi les éditeurs, mais leur désignation est refusée. Demandez au super administrateur d’attribuer le bon rôle à la personne.',
            },
            {
              question: 'Puis-je créer une catégorie « Actualités » pour un article qui parle des services ?',
              answer: 'Non : vous ne pouvez créer que des catégories du domaine « Services ». Demandez la catégorie à l’éditeur.',
            },
            {
              question: 'Le tableau de bord parle d’« activité financière » mais je ne vois aucun chiffre.',
              answer: 'C’est normal : la tuile « Chiffre d’affaires » et les cartes financières sont réservées au service Finance. Votre tableau de bord affiche l’audience, les formulaires, les demandes et les contenus en relecture.',
            },
            {
              question: 'Comment savoir qui a changé un statut et quand ?',
              answer: 'Ouvrez la demande : la carte « Historique » liste chaque passage avec la date et le commentaire. L’attribution figure aussi dans l’historique. Le journal d’audit complet est réservé au super administrateur.',
            },
            {
              question: 'Que se passe-t-il si je repasse un service publié en brouillon ?',
              answer: 'Il disparaît immédiatement du catalogue public et plus personne ne peut déposer de demande. Les demandes déjà déposées restent visibles dans **Demandes**. Republiez-le avec `Actions` puis **Publier**.',
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
            { term: 'Back-office', definition: 'La partie « Administration du site », réservée aux personnels de la Fédération, où l’on gère les contenus, les services et les demandes.' },
            { term: 'Catalogue des services', definition: 'La liste des services publiés, visible par tous sur la page **Services** du site ; dans le back-office, le menu **Catalogue** liste tous les services, quel que soit leur statut.' },
            { term: 'Brouillon', definition: 'Statut d’un service (ou d’un contenu) visible uniquement dans le back-office, absent du site public.' },
            { term: 'Relecture', definition: 'Statut intermédiaire d’un service soumis à une seconde lecture avant publication ; il reste invisible du public.' },
            { term: 'Publié', definition: 'Statut d’un service visible dans le catalogue public et acceptant des demandes.' },
            { term: 'Archivé', definition: 'Statut d’un service retiré du catalogue mais conservé avec ses demandes ; peut repasser en brouillon.' },
            { term: 'Slug (adresse)', definition: 'La fin de l’adresse Internet de la fiche publique (par exemple « assistance-juridique »), en minuscules, chiffres et tirets, unique pour chaque service.' },
            { term: 'Formulaire de demande', definition: 'Les questions posées au demandeur sur la fiche publique : les champs standards (identité, coordonnées, message) plus les champs spécifiques que vous composez.' },
            { term: 'Champ obligatoire / facultatif', definition: 'Un champ obligatoire doit être rempli pour valider un formulaire (marqué d’un astérisque) ; un champ facultatif peut rester vide.' },
            { term: 'Référence SRV', definition: 'Identifiant unique d’une demande de service, de la forme SRV-AAAA-XXXXXX, rappelé dans tous les emails et dans l’espace personnel du demandeur.' },
            { term: 'Référence MSG', definition: 'Identifiant unique d’un message reçu par un formulaire du site, de la forme MSG-AAAA-XXXXXX.' },
            { term: 'Référence CMD', definition: 'Identifiant d’une commande (paiement en ligne) liée à une demande sur un service payant.' },
            { term: 'Attribution', definition: 'Désignation de la personne responsable d’une demande ; une demande « Nouvelle » attribuée passe automatiquement « En examen ».' },
            { term: 'Transition (passage de statut)', definition: 'Le changement d’un statut à un autre ; seuls certains passages sont autorisés (par exemple « Clôturée » n’en autorise aucun).' },
            { term: 'Commentaire pour le demandeur', definition: 'Texte saisi lors d’un changement de statut, envoyé par email au demandeur et conservé dans l’historique (3 000 caractères maximum).' },
            { term: 'Note interne', definition: 'Texte visible uniquement par l’équipe des services et du support, jamais transmis au demandeur (5 000 caractères maximum).' },
            { term: 'Échéance', definition: 'Date de dépôt plus le délai indicatif du service, en jours calendaires ; affichée en vert, orange (2 jours ou moins) ou rouge (dépassée). Purement indicative.' },
            { term: 'Délai indicatif', definition: 'Nombre de jours annoncé au public (« Réponse sous {n} jours ») pour un service ; ce n’est pas un engagement contractuel.' },
            { term: 'Droit à l’effacement', definition: 'Le droit de toute personne à demander la suppression de ses données ; il justifie la suppression d’une demande clôturée ou refusée.' },
            { term: 'Médiathèque', definition: 'L’espace de stockage des fichiers du site (images, documents, audio, vidéo), avec leur adresse et leur texte alternatif.' },
            { term: 'Texte alternatif', definition: 'Courte description d’une image lue par les lecteurs d’écran des personnes malvoyantes et affichée si l’image ne se charge pas.' },
            { term: 'SEO (référencement)', definition: 'Réglages qui déterminent comment une page apparaît dans les moteurs de recherche et lors d’un partage : titre, description, image de partage, exclusion (noindex).' },
            { term: 'Export CSV', definition: 'Fichier tableur (colonnes séparées par « ; ») contenant la liste filtrée des demandes, lisible dans Excel ou LibreOffice ; 5 000 lignes maximum.' },
            { term: 'Vérification en deux étapes', definition: 'Un code temporaire à 6 chiffres, généré par une application d’authentification, demandé en plus du mot de passe à chaque connexion.' },
            { term: 'Codes de secours', definition: 'Codes à usage unique remis lors de l’activation de la vérification en deux étapes, pour se connecter si le téléphone n’est plus disponible.' },
            { term: 'Journal d’audit', definition: 'Registre des actions importantes (publication, attribution, changement de statut, export, suppression) avec leur auteur, leur date et l’appareil utilisé.' },
            { term: 'Notification interne', definition: 'Message affiché dans **Notifications** de votre espace personnel (sans email), par exemple « Nouvelle demande de service ».' },
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
          columns: ['Votre problème', 'À qui s’adresser', 'Comment'],
          rows: [
            ['Connexion impossible, email non reçu, page en erreur, bouton qui ne répond pas', 'Support', 'Formulaire de contact du site (type « Assistance »).'],
            ['Rôle manquant, « Accès refusé » sur une page dont vous avez besoin, réinitialisation de la vérification en deux étapes', 'Super administrateur', 'Formulaire de contact (objet « Demande de droits d’accès ») ou le Secrétariat général.'],
            ['Paiement d’un service payant (double débit, paiement non confirmé, remboursement)', 'Service Finance', 'Transmettez la référence SRV et la référence CMD.'],
            ['Correction d’une page, d’une actualité ou de la FAQ qui parle des services ; suppression d’une catégorie', 'Éditeur', 'Indiquez le titre du contenu et la correction souhaitée.'],
            ['Décision de fond : nouveau service, tarif, refus sensible, demande d’effacement', 'Secrétariat général', 'Par les coordonnées ci-dessous.'],
            ['Question sur une formation ou sur la plateforme de formation', 'Coordination des formations', 'Depuis la plateforme de formation.'],
          ],
        },
        {
          type: 'links',
          title: 'Coordonnées de la Fédération',
          items: [
            { label: 'Formulaire de contact du site', href: '/contact', description: 'Le moyen le plus simple pour joindre le support : chaque message reçoit une référence et un accusé de réception.', icon: 'mail' },
            { label: 'Écrire au Secrétariat général', href: 'mailto:jossngomafm@gmail.com', description: 'jossngomafm@gmail.com', icon: 'send' },
            { label: 'Appeler la Fédération', href: 'tel:+24166230033', description: '066 23 00 33 ou 077 52 27 98', icon: 'phone' },
            { label: 'Adresse postale', href: '/contact', description: 'BP 1234 Libreville, Gabon', icon: 'map-pin' },
          ],
        },
        {
          type: 'list',
          title: 'Ce qu’il faut indiquer dans un message d’aide',
          style: 'check',
          items: [
            'L’adresse email de votre compte (jamais votre mot de passe).',
            'L’écran concerné (par exemple « Demandes », « fiche du service Assistance juridique ») et l’appareil utilisé (téléphone ou ordinateur, navigateur).',
            'La référence de la demande (SRV-…), du message (MSG-…) ou le nom du service.',
            'Le message d’erreur exact, recopié tel qu’il est affiché, et l’heure approximative.',
            'Ce que vous avez déjà essayé (recharger la page, se reconnecter).',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Guides utiles',
          text: 'Le guide du membre décrit l’espace personnel (profil, notifications, sécurité) que vous utilisez aussi. Sur la plateforme de formation, votre rôle n’a pas d’espace particulier : le guide de l’apprenant s’applique.',
        },
      ],
    },
  ],
  related: [
    { label: 'Guide du membre', href: '/espace/guide', description: 'Votre compte, votre espace personnel, vos notifications et la sécurité de votre compte.' },
    { label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'Suivre une formation sur la plateforme de formation avec le même compte.', external: true },
  ],
  selfAssessment: {
    intro:
      'Dix-neuf questions pour vérifier que vous savez publier un service, instruire une demande et à qui vous adresser. Comptez dix minutes ; le corrigé renvoie à la section du guide concernée.',
    passPercent: 70,
    questions: [
      {
        id: 'q-role-1',
        sectionId: 'votre-role',
        type: 'multiple',
        prompt: 'Que pouvez-vous faire avec le rôle « Responsable services » ?',
        options: [
          { id: 'a', text: 'Créer, publier et archiver un service du catalogue.', correct: true },
          { id: 'b', text: 'Publier une actualité qui annonce un nouveau service.', correct: false },
          { id: 'c', text: 'Attribuer une demande et changer son statut.', correct: true },
          { id: 'd', text: 'Voir le détail d’une commande payée.', correct: false },
        ],
        explanation: 'Les actualités relèvent de l’éditeur et les commandes du service Finance : voir « Votre rôle en bref ».',
      },
      {
        id: 'q-connexion-1',
        sectionId: 'se-connecter',
        type: 'single',
        prompt: 'Après la connexion, comment ouvrez-vous le back-office ?',
        options: [
          { id: 'a', text: 'Depuis le menu de mon compte (mes initiales, en haut à droite), lien **Administration du site**.', correct: true },
          { id: 'b', text: 'Depuis le lien **Plateforme de formation** du menu de mon compte.', correct: false },
          { id: 'c', text: 'Depuis la page **Services** du site public.', correct: false },
        ],
        explanation: 'Le lien **Administration du site** n’apparaît que si votre compte a un rôle d’administration : voir « Se connecter ».',
      },
      {
        id: 'q-reperer-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Sur téléphone, où se trouve le menu de navigation du back-office ?',
        options: [
          { id: 'a', text: 'Toujours visible à gauche de l’écran.', correct: false },
          { id: 'b', text: 'Derrière le bouton **Ouvrir la navigation** (trois traits), en haut à gauche.', correct: true },
          { id: 'c', text: 'En bas de chaque page, après le tableau.', correct: false },
        ],
        explanation: 'Le menu devient un tiroir qui s’ouvre avec le bouton à trois traits et se ferme au changement de page : voir « Se repérer dans le back-office ».',
      },
      {
        id: 'q-tarif-1',
        sectionId: 'onglet-modalites-et-tarif',
        type: 'true-false',
        prompt: 'Un service payant peut être créé sans renseigner de tarif : le tarif sera demandé plus tard.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Un service payant exige un **Tarif (XAF)** entier strictement positif, sinon l’erreur « Tarif requis » s’affiche : voir « Onglet « Modalités et tarif » ».',
      },
      {
        id: 'q-publier-1',
        sectionId: 'publier-un-service',
        type: 'single',
        prompt: 'Un service est en statut « Archivé ». Comment le remettre dans le catalogue public ?',
        options: [
          { id: 'a', text: '`Actions` puis **Publier** directement.', correct: false },
          { id: 'b', text: '`Actions` puis **Repasser en brouillon**, puis `Actions` et **Publier**.', correct: true },
          { id: 'c', text: '`Actions` puis **Planifier la publication**.', correct: false },
        ],
        explanation: 'Le passage « Archivé » vers « Publié » n’existe pas et la planification n’est pas proposée pour un service : voir « Comment publier un service dans le catalogue ».',
      },
      {
        id: 'q-supprimer-service-1',
        sectionId: 'modifier-archiver-supprimer-un-service',
        type: 'single',
        prompt: 'La suppression d’un service affiche « Ce service a des demandes associées : archivez-le plutôt que de le supprimer ». Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je supprime d’abord toutes les demandes puis je recommence.', correct: false },
          { id: 'b', text: 'J’utilise `Actions` puis **Archiver** : le service quitte le catalogue mais ses demandes restent consultables.', correct: true },
          { id: 'c', text: 'Je demande au support de forcer la suppression.', correct: false },
        ],
        explanation: 'Les demandes doivent rester consultables ; l’archivage est la bonne réponse : voir « Comment modifier, archiver ou supprimer un service ».',
      },
      {
        id: 'q-public-1',
        sectionId: 'ce-que-voient-les-membres',
        type: 'single',
        prompt: 'Un membre voit le message « Ce service n’est plus disponible. » en déposant sa demande. Quelle est la cause la plus probable ?',
        options: [
          { id: 'a', text: 'Le service n’est plus en statut « Publié ».', correct: true },
          { id: 'b', text: 'Le membre a dépassé 5 demandes dans l’heure.', correct: false },
          { id: 'c', text: 'Le membre n’a pas coché la case de consentement.', correct: false },
        ],
        explanation: 'Seuls les services publiés acceptent des demandes ; la limite horaire et le consentement ont leurs propres messages : voir « Ce que voient les membres ».',
      },
      {
        id: 'q-echeance-1',
        sectionId: 'reperer-les-demandes',
        type: 'single',
        prompt: 'Dans la liste des demandes, que signifie un badge rouge « Échéance dépassée de 3 j » ?',
        options: [
          { id: 'a', text: 'La demande a été clôturée depuis 3 jours.', correct: false },
          { id: 'b', text: 'Le délai indicatif du service est dépassé de 3 jours calendaires depuis le dépôt ; aucun rappel n’a été envoyé.', correct: true },
          { id: 'c', text: 'Le demandeur a 3 jours pour payer.', correct: false },
        ],
        explanation: 'L’échéance est calculée depuis la date de dépôt et le « Délai indicatif (jours) » ; elle est purement indicative : voir « Comment repérer et trier les demandes ».',
      },
      {
        id: 'q-attribuer-1',
        sectionId: 'attribuer-une-demande',
        type: 'true-false',
        prompt: 'Attribuer une demande « Nouvelle » à un responsable la fait passer automatiquement « En examen ».',
        options: [
          { id: 'a', text: 'Vrai', correct: true },
          { id: 'b', text: 'Faux', correct: false },
        ],
        explanation: 'Le panneau « Attribution » le rappelle : une demande nouvelle passe en examen dès qu’elle est attribuée : voir « Attribuer la demande ».',
      },
      {
        id: 'q-statut-1',
        sectionId: 'changer-le-statut',
        type: 'single',
        prompt: 'Vous voulez informer le demandeur par écrit depuis la plateforme. Quel est le seul moyen ?',
        options: [
          { id: 'a', text: 'Le **Commentaire pour le demandeur** saisi avec `Appliquer le statut` : il est envoyé par email.', correct: true },
          { id: 'b', text: 'La **Note interne** : elle est envoyée au demandeur à l’enregistrement.', correct: false },
          { id: 'c', text: 'Le bouton **Envoyer un message** de la carte « Demandeur ».', correct: false },
        ],
        explanation: 'La note interne n’est jamais transmise et il n’existe pas de messagerie interne : voir « Faire avancer le statut et informer le demandeur ».',
      },
      {
        id: 'q-statut-2',
        sectionId: 'changer-le-statut',
        type: 'single',
        prompt: 'Quel statut de demande est définitif (aucun passage possible ensuite) ?',
        options: [
          { id: 'a', text: '« Traitée »', correct: false },
          { id: 'b', text: '« Refusée »', correct: false },
          { id: 'c', text: '« Clôturée »', correct: true },
        ],
        explanation: '« Traitée » peut revenir « En traitement » et « Refusée » peut revenir « En examen » ; seule « Clôturée » est terminale : voir « Faire avancer le statut et informer le demandeur ».',
      },
      {
        id: 'q-payant-1',
        sectionId: 'demandes-payantes',
        type: 'single',
        prompt: 'Une demande sur un service payant affiche « En attente » dans la colonne « Paiement ». Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je la passe « En traitement » pour ne pas perdre de temps.', correct: false },
          { id: 'b', text: 'J’attends la confirmation du paiement : la demande passera automatiquement « En examen ».', correct: true },
          { id: 'c', text: 'Je la supprime, car le demandeur n’a pas payé.', correct: false },
        ],
        explanation: 'Une demande payante n’est instruite qu’après paiement confirmé (« Paiement reçu (CMD-…) ») : voir « Comment suivre une demande sur un service payant ».',
      },
      {
        id: 'q-effacement-1',
        sectionId: 'supprimer-une-demande',
        type: 'multiple',
        prompt: 'Dans quels statuts le bouton « Supprimer la demande » est-il proposé ?',
        options: [
          { id: 'a', text: '« Nouvelle »', correct: false },
          { id: 'b', text: '« Refusée »', correct: true },
          { id: 'c', text: '« Clôturée »', correct: true },
          { id: 'd', text: '« Traitée »', correct: false },
        ],
        explanation: 'Seules les demandes clôturées ou refusées peuvent être supprimées, et la suppression est irréversible : voir « Comment supprimer une demande (droit à l’effacement) ».',
      },
      {
        id: 'q-export-1',
        sectionId: 'exporter-les-demandes',
        type: 'true-false',
        prompt: 'Un export CSV des demandes peut être partagé dans un groupe WhatsApp de l’équipe pour gagner du temps.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Le fichier contient des données personnelles : messagerie professionnelle uniquement, puis suppression de l’appareil : voir « Comment exporter la liste des demandes ».',
      },
      {
        id: 'q-categories-1',
        sectionId: 'gerer-les-categories',
        type: 'single',
        prompt: 'La création d’une catégorie répond « Permission insuffisante ». Quelle est la cause la plus probable ?',
        options: [
          { id: 'a', text: 'Le **Domaine** choisi n’est pas « Services ».', correct: true },
          { id: 'b', text: 'Le **Nom** dépasse 120 caractères.', correct: false },
          { id: 'c', text: 'La **Couleur** n’est pas au format #RRGGBB.', correct: false },
        ],
        explanation: 'Votre rôle ne crée que des catégories du domaine « Services » ; les erreurs de format affichent « Certains champs sont invalides. » : voir « Comment gérer les catégories de services ».',
      },
      {
        id: 'q-medias-1',
        sectionId: 'mediatheque',
        type: 'single',
        prompt: 'Quelle taille maximale est réellement appliquée à une image envoyée dans la médiathèque ?',
        options: [
          { id: 'a', text: '8 Mo', correct: true },
          { id: 'b', text: '12 Mo', correct: false },
          { id: 'c', text: '25 Mo', correct: false },
        ],
        explanation: 'Le dialogue annonce 12 Mo mais la limite appliquée aux images est 8 Mo ; 25 Mo concerne les documents : voir « Comment ajouter une image ou un document ».',
      },
      {
        id: 'q-messages-1',
        sectionId: 'messages-recus',
        type: 'single',
        prompt: 'Comment répondez-vous à un message reçu de type « Demande de service » ?',
        options: [
          { id: 'a', text: 'Depuis ma messagerie, via « Répondre par email », puis je clique sur « Marquer répondu ».', correct: true },
          { id: 'b', text: 'En saisissant ma réponse dans le panneau « Traitement » qui l’envoie automatiquement.', correct: false },
          { id: 'c', text: 'En changeant le statut du message en « Clôturé », ce qui envoie un email.', correct: false },
        ],
        explanation: 'Aucune réponse n’est envoyée depuis la plateforme : la réponse part de votre messagerie : voir « Comment traiter un message reçu de type « Demande de service » ».',
      },
      {
        id: 'q-notifications-1',
        sectionId: 'notifications',
        type: 'single',
        prompt: 'Où lisez-vous la notification « Nouvelle demande de service » ?',
        options: [
          { id: 'a', text: 'Dans une cloche en haut du back-office.', correct: false },
          { id: 'b', text: 'Dans **Notifications** de mon espace personnel (menu de mon compte).', correct: true },
          { id: 'c', text: 'Dans un email envoyé à mon adresse.', correct: false },
        ],
        explanation: 'Le responsable des services ne reçoit aucun email et le back-office n’a pas de cloche : voir « Notifications et emails que vous recevez ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'single',
        prompt: 'Un demandeur affirme avoir payé deux fois un service payant. À qui transmettez-vous le dossier ?',
        options: [
          { id: 'a', text: 'Au service Finance, avec la référence SRV et la référence CMD.', correct: true },
          { id: 'b', text: 'À l’éditeur, pour corriger la fiche du service.', correct: false },
          { id: 'c', text: 'Au super administrateur, pour supprimer la demande.', correct: false },
        ],
        explanation: 'Vous ne voyez pas le détail des commandes ; les paiements relèvent de Finance : voir « Besoin d’aide ? ».',
      },
    ],
  },
}
