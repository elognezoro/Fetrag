import type { Guide } from '@fetrag/contracts'

/**
 * Guide du coordinateur formation sur le site institutionnel (rôle COORDINATOR, portée globale).
 *
 * Périmètre documenté (inventaire du code, apps/web) : entrée dans le back-office (finance.read,
 * users.read, reports.read, organization.read / manage, cms.manage_media), organisations et membres,
 * finance et prises en charge en lecture, annuaire des comptes en lecture, rapports et exports CSV,
 * médiathèque, catalogue public synchronisé depuis la plateforme de formation. Les décisions sur les
 * demandes de formation, les cours, les cohortes et les certificats se prennent sur la plateforme
 * (guide `lms-coordination`).
 */
export const webCoordination: Guide = {
  id: 'web-coordination',
  platform: 'web',
  role: 'COORDINATOR',
  title: 'Guide du coordinateur formation sur le site',
  subtitle:
    'Organisations, finance en lecture, rapports et médiathèque depuis le site institutionnel',
  audience:
    'Les coordinatrices et coordinateurs formation de la Fédération (rôle « Coordinateur formation ») qui utilisent le back-office du site institutionnel en complément de la plateforme de formation.',
  summary:
    'Sur le site institutionnel, vous créez les organisations affiliées et partenaires, vous rattachez leurs membres et vous désignez leurs responsables. Vous consultez la finance, les prises en charge, l’annuaire des comptes et les rapports, sans pouvoir modifier ces données. L’essentiel de votre travail (demandes de formation, cours, cohortes, certificats) se fait sur la plateforme de formation, décrite dans un guide séparé.',
  tone: 'gold',
  icon: 'clipboard-list',
  readingMinutes: 45,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée, avec le rôle **Coordinateur formation** attribué par le super administrateur.',
    'Une application d’authentification installée sur votre téléphone (Google Authenticator, Microsoft Authenticator ou FreeOTP) pour la vérification en deux étapes.',
    'Un téléphone ou un ordinateur connecté à Internet, avec un navigateur récent.',
    'Le guide de la coordination sur la plateforme de formation, pour tout ce qui concerne les demandes, les cours, les cohortes et les certificats.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous au site avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where:
        'bouton `Espace personnel` en haut à droite du site ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits)',
      result: 'Votre avatar (vos initiales) remplace le bouton `Espace personnel`.',
    },
    {
      text: 'Activez la vérification en deux étapes si ce n’est pas déjà fait.',
      where: 'menu du compte › **Sécurité**',
      result:
        'Le badge « MFA active » apparaît sur votre fiche et un code vous est demandé à chaque connexion.',
    },
    {
      text: 'Ouvrez le back-office.',
      ui: 'Administration du site',
      where: 'menu du compte (cliquez sur votre avatar en haut à droite)',
      result:
        'La page « Bonjour {votre prénom} » s’affiche avec le menu de gauche : Tableau de bord, Médias, Newsletter, Utilisateurs et rôles, Organisations, Finance, Rapports.',
    },
    {
      text: 'Vérifiez que chaque organisation qui doit déposer des demandes possède un responsable.',
      where: 'menu de gauche › **Organisations** › fiche de l’organisation',
      result: 'Aucune alerte orange « Aucun responsable n’est désigné » n’apparaît sur la fiche.',
      note: 'Sans responsable, personne ne peut déposer de demande de formation au nom de l’organisation.',
    },
    {
      text: 'Rejoignez la plateforme de formation pour traiter les demandes et les cohortes.',
      ui: 'Coordination LMS',
      where:
        'bouton or de la carte « Plateforme de formation » du tableau de bord, ou en bas du menu de gauche',
      result:
        'L’espace de coordination de la plateforme s’ouvre dans le navigateur, sans nouvelle connexion.',
    },
  ],
  sections: [
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'clipboard-list',
      summary:
        'Ce que le site vous permet de faire, ce qu’il vous interdit, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le rôle **Coordinateur formation** pilote la formation de la Fédération. Votre espace principal est la plateforme de formation : c’est là que vous traitez les demandes des organisations, construisez les cours, planifiez les cohortes et émettez les certificats. Le site institutionnel vous donne un accès complémentaire à son back-office (l’espace d’administration réservé au personnel), pour tenir à jour les organisations et consulter les données financières, les comptes et les rapports.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire sur le site',
          style: 'check',
          items: [
            'Créer une organisation affiliée ou partenaire, rattacher des comptes existants, désigner ou retirer un responsable, désactiver ou réactiver une organisation.',
            'Suivre, depuis la fiche d’une organisation, ses demandes de formation et ses cohortes, avec un lien direct vers la plateforme.',
            'Consulter la finance : chiffre d’affaires, commandes, paiements, prises en charge ; faire émettre un reçu et relancer le rapprochement des paiements.',
            'Retrouver un compte dans l’annuaire **Utilisateurs et rôles** et lire ses rôles, ses organisations, ses inscriptions et ses commandes.',
            'Lire les rapports du site et de la plateforme, télécharger trois exports CSV.',
            'Envoyer, décrire et supprimer des fichiers dans la **Médiathèque**.',
            'Vérifier que les cours publiés sur la plateforme apparaissent bien dans le catalogue public **Formations**.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire sur le site',
          style: 'bullet',
          items: [
            'Créer un compte, attribuer ou retirer un rôle, désactiver un compte, réinitialiser la vérification en deux étapes d’une autre personne : réservé au super administrateur.',
            'Accorder, clôturer ou supprimer une prise en charge ; rembourser une commande ; télécharger les exports comptables : réservé au rôle **Finance / contrôle**.',
            'Rédiger ou publier des pages, actualités, ressources et événements : réservé à l’**Éditeur communication**.',
            'Lire les messages reçus par les formulaires du site et traiter les demandes de service : réservé au **Responsable services** et au **Support**.',
            'Modifier le nom ou les coordonnées d’une organisation déjà créée : cette modification se fait sur la plateforme de formation.',
            'Décider d’une demande de formation, créer une cohorte ou un cours, émettre un certificat : ces actions se font sur la plateforme de formation.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait', 'Quand le solliciter'],
          rows: [
            [
              'Super administrateur',
              'Crée les comptes, attribue les rôles, désactive les comptes, règle les paramètres.',
              'Un compte à créer avant de le rattacher à une organisation ; un rôle à attribuer ; un compte à désactiver ; une vérification en deux étapes à réinitialiser.',
            ],
            [
              'Finance / contrôle',
              'Rembourse, accorde et clôture les prises en charge, exporte la comptabilité.',
              'Une prise en charge à accorder à un bénéficiaire ; un remboursement à traiter ; un export comptable.',
            ],
            [
              'Responsable d’organisation',
              'Dépose les demandes de formation de son organisation et suit ses participants.',
              'Vous le désignez depuis la fiche de l’organisation ; il vous adresse ses demandes sur la plateforme.',
            ],
            [
              'Formateur',
              'Anime les cohortes, corrige, saisit les présences.',
              'Vous l’affectez aux cohortes sur la plateforme de formation.',
            ],
            [
              'Éditeur communication',
              'Rédige et publie les contenus du site.',
              'Un visuel ou un document de la médiathèque à publier sur le site.',
            ],
            [
              'Support',
              'Aide les utilisateurs sur leur compte et leurs accès.',
              'Un utilisateur qui n’arrive pas à se connecter.',
            ],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Deux espaces, un seul compte',
          text: 'Votre compte FETRAG ouvre le site institutionnel et la plateforme de formation sans nouvelle connexion. Tout ce que vous faites sur les organisations depuis le site est visible immédiatement sur la plateforme, et inversement.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Guide de la coordination sur la plateforme de formation',
              href: '{{lms}}/coordination/guide',
              description:
                'Demandes de formation, cours, cohortes, sessions, certificats et rapports détaillés.',
              external: true,
              icon: 'graduation-cap',
            },
          ],
        },
      ],
    },
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte, connexion et sécurité',
      icon: 'log-in',
      summary:
        'Se connecter, protéger son compte par la vérification en deux étapes, récupérer un mot de passe, se déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre rôle donne accès à des données personnelles et financières. La politique de la Fédération exige donc que les rôles privilégiés (administration, coordination, finance, communication) protègent leur compte par la vérification en deux étapes, appelée aussi MFA : en plus du mot de passe, un code à 6 chiffres affiché par une application sur votre téléphone est demandé à chaque connexion.',
        },
        {
          type: 'table',
          caption: 'Règles imposées par l’application',
          columns: ['Élément', 'Règle'],
          rows: [
            ['Mot de passe', '8 caractères minimum, dont une majuscule et un chiffre.'],
            [
              'Code de vérification',
              '6 chiffres, renouvelé toutes les 30 secondes par l’application d’authentification.',
            ],
            ['Lien de réinitialisation du mot de passe', 'Valable 30 minutes après la demande.'],
            [
              'Codes de secours',
              'Codes à usage unique remis lors de l’activation, à conserver hors du téléphone.',
            ],
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'Le message « Accès refusé » s’affiche quand vous ouvrez **Administration du site**.',
              cause:
                'Votre compte n’a pas (ou plus) le rôle **Coordinateur formation**, ou le rôle a expiré.',
              solution:
                'Cliquez sur `Contacter la FETRAG` sur cette page (un email avec l’objet « Demande de droits d’accès » est préparé) ou écrivez au super administrateur.',
            },
            {
              problem:
                'La page « Vérification en deux étapes » s’affiche à chaque tentative d’entrer dans le back-office.',
              cause:
                'La vérification en deux étapes n’est pas activée sur votre compte et le site l’exige pour votre rôle.',
              solution: 'Cliquez sur `Activer la vérification` et suivez la procédure ci-dessous.',
            },
            {
              problem: 'Le code à 6 chiffres est refusé.',
              cause:
                'L’heure du téléphone est décalée, ou vous lisez le code d’un autre compte dans l’application.',
              solution:
                'Attendez le code suivant et vérifiez que l’heure du téléphone est réglée automatiquement. En dernier recours, utilisez un code de secours.',
            },
            {
              problem: 'Vous avez perdu votre téléphone et vos codes de secours.',
              cause: 'Sans second facteur, la connexion n’est plus possible.',
              solution:
                'Demandez au super administrateur de réinitialiser la MFA de votre compte, puis réactivez-la sur un nouveau téléphone.',
            },
          ],
        },
      ],
      subsections: [
        {
          id: 'se-connecter',
          title: 'Se connecter au site',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez le site institutionnel dans votre navigateur.',
                  note: 'Sur téléphone, le navigateur suffit : aucune application à installer.',
                },
                {
                  text: 'Cliquez sur `Espace personnel`.',
                  where:
                    'en haut à droite du site ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits) en haut à droite',
                  result:
                    'La page « Bienvenue à la FETRAG » s’affiche avec le formulaire de connexion.',
                },
                {
                  text: 'Saisissez votre **Adresse email**.',
                  note: 'C’est l’adresse avec laquelle votre compte a été créé et confirmé.',
                },
                {
                  text: 'Saisissez votre **Mot de passe**.',
                },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  where: 'sous les champs',
                  result:
                    'Si la vérification en deux étapes est active, le champ **Code de vérification** apparaît.',
                },
                {
                  text: 'Ouvrez votre application d’authentification et saisissez le code à 6 chiffres affiché pour votre compte FETRAG.',
                  ui: 'Vérifier et se connecter',
                  result:
                    'Le site se recharge : votre avatar (vos initiales) apparaît en haut à droite.',
                  note: 'Le code change toutes les 30 secondes ; si le temps restant est très court, attendez le suivant.',
                },
                {
                  text: 'Cliquez sur votre avatar pour ouvrir le menu du compte.',
                  where:
                    'en haut à droite (libellé accessible « Menu de {votre nom} ») ; sur mobile, l’avatar reste visible sans ouvrir le menu du site',
                  result:
                    'Le menu affiche votre nom, votre email et le badge « Coordinateur formation ».',
                },
                {
                  text: 'Cliquez sur **Administration du site**.',
                  result: 'Le tableau de bord « Bonjour {votre prénom} » s’ouvre.',
                  note: 'Si la page « Vérification en deux étapes » s’affiche à la place, activez la vérification comme indiqué ci-dessous.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              text: 'Si le site propose un bouton `Se connecter avec Compte FETRAG`, votre organisation utilise un fournisseur d’identité central : cliquez dessus et suivez les écrans, puis revenez sur le site.',
            },
          ],
        },
        {
          id: 'activer-la-verification-en-deux-etapes',
          title: 'Activer la vérification en deux étapes',
          blocks: [
            {
              type: 'steps',
              intro: 'À faire une seule fois, avec votre téléphone à portée de main.',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone : Google Authenticator, Microsoft Authenticator ou FreeOTP.',
                  note: 'Ces applications sont gratuites, disponibles sur Android et iPhone, et fonctionnent sans connexion Internet une fois installées.',
                },
                {
                  text: 'Ouvrez le menu du compte puis **Sécurité**.',
                  where: 'avatar en haut à droite',
                  result: 'La page « Protéger mon compte » s’affiche.',
                },
                {
                  text: 'Cliquez sur `Activer la vérification en deux étapes`.',
                  result:
                    'Un QR code (carré noir et blanc à scanner) s’affiche à l’**Étape 1**, avec une clé à saisir manuellement.',
                },
                {
                  text: 'Dans l’application d’authentification, ajoutez un compte en scannant le QR code.',
                  note: 'Si vous consultez le site depuis le téléphone lui-même, vous ne pouvez pas scanner l’écran : copiez la clé affichée et saisissez-la manuellement dans l’application.',
                  result: 'L’application affiche une ligne « FETRAG » avec un code à 6 chiffres.',
                },
                {
                  text: 'Saisissez ce code dans le champ **Code à 6 chiffres affiché par l’application** (Étape 2), puis validez.',
                  result: 'La vérification est activée ; des codes de secours vous sont présentés.',
                },
                {
                  text: 'Notez les codes de secours et rangez-les hors du téléphone (carnet, coffre, gestionnaire de mots de passe).',
                  note: 'Chaque code de secours ne sert qu’une fois. Ils permettent d’entrer si le téléphone est perdu.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Ne désactivez pas la vérification',
              text: 'La page **Sécurité** permet aussi de désactiver la vérification (bouton `Désactiver la vérification`, avec un code). Pour votre rôle, elle est exigée par la politique de sécurité de la Fédération : ne la désactivez que pour changer de téléphone, et réactivez-la aussitôt.',
            },
          ],
        },
        {
          id: 'mot-de-passe-oublie',
          title: 'Mot de passe oublié',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la page de connexion, cliquez sur **Mot de passe oublié ?**.',
                  where: 'sous le champ **Mot de passe**',
                  result: 'La page « Mot de passe oublié » s’affiche.',
                },
                {
                  text: 'Saisissez l’**Adresse email du compte** puis cliquez sur `Recevoir le lien de réinitialisation`.',
                  result:
                    'Un message confirme l’envoi. Pour des raisons de sécurité, le message est le même que l’adresse existe ou non.',
                },
                {
                  text: 'Ouvrez l’email « Réinitialisation de votre mot de passe FETRAG » et cliquez sur le lien.',
                  note: 'Le lien est valable 30 minutes. Vérifiez le dossier des courriers indésirables si l’email n’arrive pas.',
                },
                {
                  text: 'Choisissez un nouveau mot de passe : 8 caractères minimum, dont une majuscule et un chiffre.',
                  result:
                    'La page de connexion affiche « Votre mot de passe a été réinitialisé » ; l’email « Votre mot de passe FETRAG a été modifié » vous est envoyé.',
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
                  text: 'Ouvrez le menu du compte et cliquez sur `Déconnexion`.',
                  where: 'avatar en haut à droite ; tout en bas du menu',
                  result:
                    'La page « Vous êtes déconnecté » s’affiche. Si une page « Se déconnecter ? » s’affiche d’abord, cliquez sur `Confirmer la déconnexion`.',
                },
                {
                  text: 'Fermez ensuite le navigateur si l’appareil est partagé.',
                  note: 'La déconnexion sur le site vous déconnecte aussi de la plateforme de formation : c’est le même compte.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              text: 'Sur un ordinateur partagé (secrétariat, cybercafé), déconnectez-vous toujours avant de partir : votre session donne accès à des données financières et personnelles.',
            },
          ],
        },
      ],
    },
    {
      id: 'se-reperer',
      title: 'Se repérer dans le back-office',
      icon: 'compass',
      summary:
        'Le tableau de bord, le menu de gauche (ou le tiroir sur mobile) et le menu du compte.',
      blocks: [
        {
          type: 'screen',
          title: 'La page d’accueil « Bonjour {votre prénom} »',
          description:
            'Ce que vous voyez en arrivant dans le back-office par **Administration du site**.',
          areas: [
            {
              name: 'Barre latérale marine (ordinateur) ou tiroir de navigation (mobile)',
              purpose:
                'La marque « Administration », puis vos rubriques : **Tableau de bord** (Pilotage), **Médias** (Contenus), **Newsletter** (Relations), **Utilisateurs et rôles**, **Organisations**, **Finance**, **Rapports** (Administration). En bas : votre nom, votre email, le badge « Coordinateur formation » et le lien `Coordination LMS`.',
              icon: 'menu',
            },
            {
              name: 'Barre supérieure collante',
              purpose:
                'Sur mobile : le bouton **Ouvrir la navigation** (trois traits), le mot « Back-office » et le titre de la section courante. Sur ordinateur : le lien « Voir le site ».',
              icon: 'smartphone',
            },
            {
              name: 'En-tête de page',
              purpose:
                'Le ruban « Pilotage », le titre « Bonjour {prénom} » et, à droite, le bouton `Rapports détaillés`.',
              icon: 'layout-dashboard',
            },
            {
              name: 'Tuiles d’indicateurs',
              purpose:
                '« Pages vues sur 30 jours », « Formulaires reçus sur 30 jours », « Chiffre d’affaires sur 12 mois ». Sur mobile, deux tuiles par ligne.',
              icon: 'bar-chart',
            },
            {
              name: 'Cartes « Audience du site », « Formulaires par type », « Ventes mensuelles »',
              purpose:
                'Graphiques des 30 derniers jours (audience, sans cookie de suivi) et des 12 derniers mois (ventes). La carte « Ventes mensuelles » contient le lien `Finance`.',
              icon: 'pie-chart',
            },
            {
              name: 'Carte « Contenus les plus consultés »',
              purpose:
                'Trois colonnes : « Actualités » (vues), « Ressources » (téléchargements), « Formations » (inscriptions, avec lien vers la fiche publique).',
              icon: 'star',
            },
            {
              name: 'Carte marine « Plateforme de formation »',
              purpose:
                '« Apprenants actifs », « Nouvelles inscriptions », « Taux de complétion », « Certificats émis » sur 30 jours, et le bouton or `Coordination LMS` qui ouvre votre espace sur la plateforme.',
              icon: 'graduation-cap',
            },
            {
              name: 'Rangée de raccourcis',
              purpose:
                'Boutons `Utilisateurs` (annuaire des comptes) et `Voir le site` (ouvre le site public dans un nouvel onglet).',
              icon: 'external-link',
            },
          ],
        },
        {
          type: 'screen',
          title: 'La navigation sur mobile',
          description: 'Sur un écran de téléphone, la barre latérale est remplacée par un tiroir.',
          areas: [
            {
              name: 'Bouton **Ouvrir la navigation** (trois traits)',
              purpose:
                'En haut à gauche de la barre supérieure : ouvre le tiroir avec les mêmes rubriques que sur ordinateur.',
              icon: 'menu',
            },
            {
              name: 'Bouton **Fermer la navigation** (croix)',
              purpose:
                'Referme le tiroir. Il se referme aussi automatiquement quand vous changez de page.',
              icon: 'x-circle',
            },
            {
              name: 'Tableaux',
              purpose:
                'Les tableaux défilent horizontalement avec le doigt ; certaines colonnes sont masquées sur petit écran (le type ou le statut d’une organisation, par exemple). Ouvrez la fiche pour tout voir.',
              icon: 'table',
            },
            {
              name: 'Formulaires',
              purpose:
                'Les blocs s’empilent les uns sous les autres : le bouton de validation est tout en bas de la page, faites défiler.',
              icon: 'pen',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Le menu du compte (site public)',
          description:
            'Il s’ouvre en cliquant sur votre avatar, en haut à droite de toutes les pages du site.',
          areas: [
            {
              name: 'En-tête du menu',
              purpose: 'Votre nom, votre email et le badge « Coordinateur formation ».',
              icon: 'user',
            },
            {
              name: 'Liens personnels',
              purpose:
                '**Mon espace**, **Mon profil**, **Mes inscriptions**, **Notifications** (badge du nombre de non lues), **Sécurité**.',
              icon: 'bell',
            },
            {
              name: '**Administration du site**',
              purpose: 'Entrée dans le back-office décrit par ce guide.',
              icon: 'shield',
            },
            {
              name: '**Plateforme de formation**',
              purpose: 'Ouvre votre tableau de bord sur la plateforme, sans nouvelle connexion.',
              icon: 'graduation-cap',
            },
            { name: '`Déconnexion`', purpose: 'Tout en bas du menu.', icon: 'log-out' },
          ],
        },
        {
          type: 'path',
          label: 'Chemin vers les organisations',
          items: ['Menu de gauche', 'Organisations'],
          href: '/admin/organisations',
        },
        {
          type: 'path',
          label: 'Chemin vers la finance',
          items: ['Menu de gauche', 'Finance'],
          href: '/admin/finance',
        },
        {
          type: 'path',
          label: 'Chemin vers l’annuaire',
          items: ['Menu de gauche', 'Utilisateurs et rôles'],
          href: '/admin/utilisateurs',
        },
        {
          type: 'path',
          label: 'Chemin vers les rapports',
          items: ['Menu de gauche', 'Rapports'],
          href: '/admin/rapports',
        },
        {
          type: 'path',
          label: 'Chemin vers la médiathèque',
          items: ['Menu de gauche', 'Médias'],
          href: '/admin/medias',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Fil d’Ariane',
          text: 'Au-dessus du titre de chaque page, un fil d’Ariane (Administration › Organisations › nom de l’organisation) rappelle où vous êtes ; cliquez sur un de ses éléments pour remonter.',
        },
      ],
    },
    {
      id: 'lire-le-tableau-de-bord',
      title: 'Comment lire le tableau de bord',
      icon: 'layout-dashboard',
      summary: 'Un coup d’œil quotidien sur l’audience, les ventes et l’activité de la plateforme.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Tableau de bord**.',
              where:
                'première entrée du menu de gauche (sur mobile : bouton **Ouvrir la navigation**)',
              result: 'La page « Bonjour {votre prénom} » s’affiche.',
            },
            {
              text: 'Lisez les tuiles du haut : « Pages vues sur 30 jours » (avec le nombre de visiteurs uniques), « Formulaires reçus sur 30 jours », « Chiffre d’affaires sur 12 mois » (avec le nombre de commandes payées).',
              note: 'La tuile « Demandes de service en cours » n’apparaît pas pour votre rôle.',
            },
            {
              text: 'Consultez la carte « Ventes mensuelles » : le graphique des 12 derniers mois et la ligne « Panier moyen … · … commande(s) en attente ».',
              ui: 'Finance',
              where: 'lien en haut à droite de la carte',
              result: 'Le lien ouvre le tableau de bord financier.',
            },
            {
              text: 'Consultez la carte marine « Plateforme de formation » : apprenants actifs, nouvelles inscriptions, taux de complétion et certificats émis sur les 30 derniers jours.',
              note: 'Le taux de complétion est la part des inscriptions terminées parmi les inscriptions créées.',
            },
            {
              text: 'Cliquez sur `Coordination LMS` pour passer à la plateforme de formation.',
              where: 'bouton or de la carte « Plateforme de formation »',
              result: 'Votre espace de coordination s’ouvre sur la plateforme.',
            },
            {
              text: 'Repérez dans « Contenus les plus consultés » les formations qui attirent le plus d’inscriptions.',
              note: 'Le titre d’une formation ouvre sa fiche publique dans le catalogue.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Les cartes « Contenus en relecture », « Dernières demandes de service » et « Messages reçus » sont réservées à d’autres rôles : leur absence est normale.',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'La page reste sur « Chargement de l’administration ».',
              cause: 'Connexion Internet lente ou coupée.',
              solution:
                'Attendez quelques secondes, puis rechargez la page. Sur mobile, vérifiez que les données ou le Wi-Fi sont actifs.',
            },
            {
              problem: 'Les chiffres semblent faux ou à zéro.',
              cause:
                'Les indicateurs sont calculés sur les 30 derniers jours (audience) ou 12 derniers mois (ventes) ; en début d’activité ils sont faibles.',
              solution:
                'Comparez avec la page **Rapports**, qui donne le détail par jour et par mois.',
            },
          ],
        },
      ],
    },
    {
      id: 'creer-une-organisation',
      title: 'Comment créer une organisation affiliée ou partenaire',
      icon: 'building',
      summary:
        'Enregistrer un syndicat affilié ou un partenaire pour qu’il puisse déposer des demandes de formation.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une organisation est un syndicat affilié à la Fédération ou un partenaire non affilié. Elle doit exister sur la plateforme avant que son responsable ne puisse déposer une demande de formation. Aucune organisation n’est créée automatiquement : c’est vous (ou le super administrateur) qui la créez, ici ou depuis la plateforme de formation.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Organisations**.',
              where: 'menu de gauche, section « Administration »',
              result:
                'La liste « Organisations » s’affiche avec les tuiles « Organisations affiliées », « Partenaires actifs », « Organisations inactives ».',
            },
            {
              text: 'Vérifiez d’abord que l’organisation n’existe pas déjà : saisissez son nom ou son sigle dans le champ **Nom, sigle, secteur ou ville**, puis cliquez sur `Filtrer`.',
              result:
                'La liste ne montre que les organisations correspondantes. Si elle est vide (« Aucune organisation »), vous pouvez créer la fiche.',
              note: 'Pensez à cocher **Statut** = Inactives : une organisation désactivée peut simplement être réactivée.',
            },
            {
              text: 'Cliquez sur `Nouvelle organisation`.',
              where: 'en haut à droite de l’en-tête (pleine largeur sur mobile)',
              result:
                'La page « Nouvelle organisation » s’affiche avec les blocs « Identité », « Coordonnées » et « Statut ».',
            },
            {
              text: 'Dans « Identité », saisissez le **Nom** (obligatoire, 3 à 160 caractères).',
              note: 'Exemple de forme : « Syndicat national des … ». Le nom est affiché sur la page publique des organisations.',
            },
            {
              text: 'Saisissez le **Sigle** (facultatif, 30 caractères maximum).',
              note: 'Il est mis en majuscules automatiquement et sert à générer l’adresse de la fiche.',
            },
            {
              text: 'Saisissez le **Secteur** (facultatif, 120 caractères maximum).',
              note: 'Exemples proposés par le champ : énergie et pétrole, enseignement, transports. Le secteur sert de filtre dans la liste.',
            },
            {
              text: 'Laissez le **Slug** vide, sauf besoin particulier.',
              note: 'Le slug est la partie de l’adresse web qui identifie la fiche (minuscules, chiffres et tirets). L’aperçu « Aperçu : … » montre la valeur générée depuis le sigle ou le nom. Il doit être unique.',
            },
            {
              text: 'Rédigez une **Présentation** courte (facultatif, 2 000 caractères maximum).',
            },
            {
              text: 'Dans « Coordonnées », complétez **Adresse**, **Ville** (« Libreville » par défaut), **Pays (ISO)** (« GA » par défaut, code à 2 lettres), **Téléphone**, **Email** et **Site web** (adresse complète commençant par https://).',
              note: 'Tous ces champs sont facultatifs. L’email et le téléphone servent de contact institutionnel.',
            },
            {
              text: 'Dans « Statut », saisissez l’**Effectif déclaré** (facultatif, nombre entier de travailleurs représentés).',
            },
            {
              text: 'Laissez la case **Organisation affiliée** cochée pour un syndicat membre de la Fédération ; décochez-la pour un partenaire non affilié.',
            },
            {
              text: 'Laissez la case **Active** cochée.',
              note: 'Une organisation inactive n’apparaît plus dans les listes de choix et ne peut pas recevoir de demande de formation.',
            },
            {
              text: 'Cliquez sur `Créer l’organisation`.',
              where: 'en bas de la colonne « Statut » (tout en bas de la page sur mobile)',
              result:
                'La fiche de l’organisation s’ouvre avec l’alerte verte « Organisation créée. Rattachez maintenant un responsable pour lui permettre de déposer des demandes de formation. »',
            },
            {
              text: 'Enchaînez avec le rattachement d’un responsable (section suivante).',
              note: 'Tant qu’aucun responsable n’est désigné, la fiche affiche l’alerte orange « Aucun responsable n’est désigné : personne ne peut déposer de demande de formation au nom de cette organisation. »',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Pas de modification depuis le site',
          text: 'Le site ne propose pas de formulaire pour corriger le nom, le sigle ou les coordonnées d’une organisation existante. Pour modifier ces informations, ouvrez la fiche de l’organisation sur la plateforme de formation (espace Coordination › Organisations). Vérifiez donc bien la saisie avant de créer.',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'Le message « Vérifiez les informations de l’organisation. » s’affiche en haut du formulaire.',
              cause:
                'Un champ ne respecte pas sa règle : nom trop court, code pays qui n’a pas 2 lettres, adresse web invalide, effectif hors limites.',
              solution:
                'Lisez le message rouge sous chaque champ concerné (« Nom trop court », « Code pays ISO à 2 lettres », « Adresse web invalide »…) et corrigez.',
            },
            {
              problem: 'Le message « Slug déjà utilisé » ou « Ce slug est déjà utilisé » apparaît.',
              cause:
                'Une organisation possède déjà cette adresse, souvent parce qu’elle existe déjà (peut-être inactive).',
              solution:
                'Recherchez-la dans la liste avec le filtre **Statut** = Inactives. Si c’est bien une autre organisation, saisissez un slug différent.',
            },
            {
              problem:
                'Le message « L’opération a échoué. Réessayez dans quelques instants. » s’affiche.',
              cause: 'Problème temporaire de connexion ou de serveur.',
              solution:
                'Réessayez. Si le problème persiste, contactez le support en indiquant l’heure et le nom de l’organisation.',
            },
            {
              problem: 'Le bouton `Nouvelle organisation` n’apparaît pas.',
              cause: 'Votre compte n’a pas le rôle **Coordinateur formation** global.',
              solution:
                'Vérifiez votre rôle dans le pied du menu de gauche, puis contactez le super administrateur.',
            },
          ],
        },
      ],
    },
    {
      id: 'gerer-les-membres',
      title: 'Comment rattacher des membres et désigner un responsable',
      icon: 'user-plus',
      summary:
        'Rattacher un compte existant à une organisation, lui donner ou lui retirer la responsabilité, le retirer.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un **membre** est un compte rattaché à une organisation. Un **responsable** est un membre habilité à déposer les demandes de formation de son organisation, suivre ses participants et consulter ses rapports sur la plateforme. Le compte doit exister avant le rattachement : la personne le crée elle-même par l’inscription sur le site, ou le super administrateur le crée pour elle.',
        },
        {
          type: 'statuses',
          title: 'Les badges de la carte « Membres »',
          items: [
            {
              label: 'Responsable',
              tone: 'warning',
              meaning:
                'Le membre dépose les demandes de formation et consulte les rapports de l’organisation.',
              next: 'Vous pouvez lui retirer la responsabilité, sauf s’il est le dernier responsable.',
            },
            {
              label: 'Membre',
              tone: 'neutral',
              meaning: 'Simple rattachement, sans droit particulier.',
              next: 'Vous pouvez le nommer responsable.',
            },
            {
              label: 'Compte désactivé',
              tone: 'danger',
              meaning:
                'Le compte du membre ne peut plus se connecter (désactivé par le super administrateur).',
              next: 'Si c’est le seul responsable, désignez-en un autre.',
            },
            {
              label: 'Principal',
              tone: 'info',
              meaning:
                'Dans la carte « Contacts » : l’interlocuteur principal déclaré lors d’une demande ou de l’adhésion. Lecture seule.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'Le message « Aucun compte ne correspond à cette adresse ; créez d’abord l’utilisateur. » s’affiche (« Compte introuvable » sous le champ).',
              cause:
                'La personne n’a pas encore de compte, ou s’est inscrite avec une autre adresse.',
              solution:
                'Demandez-lui l’adresse exacte de son compte, ou invitez-la à s’inscrire sur le site. Vous ne pouvez pas créer le compte vous-même : le super administrateur le peut.',
            },
            {
              problem:
                'Le message « Ce compte est déjà membre de l’organisation » s’affiche (« Déjà membre »).',
              cause: 'Le rattachement existe déjà.',
              solution:
                'Retrouvez la ligne dans « Membres » ; utilisez `Nommer responsable` si c’est la responsabilité qui manque.',
            },
            {
              problem:
                'Le message « Désignez un autre responsable avant de retirer celui-ci » s’affiche.',
              cause: 'Vous tentez de retirer le dernier responsable de l’organisation.',
              solution: 'Nommez d’abord un autre membre responsable, puis recommencez.',
            },
            {
              problem: 'Le membre dit ne pas avoir reçu l’email « Rattachement à … ».',
              cause: 'Email arrivé dans les courriers indésirables, ou adresse non consultée.',
              solution:
                'La notification est aussi visible dans son espace (menu du compte › **Notifications**). Le rattachement est effectif même sans lecture de l’email.',
            },
          ],
        },
      ],
      subsections: [
        {
          id: 'rattacher-un-compte',
          title: 'Rattacher un compte existant',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Organisations** puis cliquez sur le nom de l’organisation.',
                  where: 'colonne « Organisation » du tableau',
                  result:
                    'La fiche s’ouvre : en-tête avec le badge « Active », cartes « Membres », « Contacts », « Coordonnées », « Demandes de formation », et colonne latérale « Ajouter un membre » et « Activité ».',
                },
                {
                  text: 'Repérez la carte « Ajouter un membre ».',
                  where:
                    'colonne de droite sur ordinateur ; tout en bas de la page sur mobile (faites défiler)',
                },
                {
                  text: 'Saisissez l’**Adresse email du compte** (obligatoire).',
                  note: 'L’adresse doit être exactement celle du compte existant. L’aide du champ le rappelle : « Le compte doit déjà exister ; sinon créez-le depuis « Utilisateurs ». » (création réservée au super administrateur).',
                },
                {
                  text: 'Saisissez la **Fonction dans l’organisation** (facultatif, 120 caractères maximum).',
                  note: 'Exemples proposés : secrétaire général, trésorier, délégué.',
                },
                {
                  text: 'Cochez **Responsable** si cette personne doit déposer les demandes de formation.',
                  note: 'Vous pourrez changer ce choix plus tard depuis la ligne du membre.',
                },
                {
                  text: 'Cliquez sur `Ajouter le membre`.',
                  result:
                    'Le message vert « {email} rattaché à {organisation}. » apparaît, le formulaire se vide et la ligne s’ajoute dans « Membres » avec le badge « Responsable » ou « Membre ».',
                },
                {
                  text: 'Vérifiez que l’alerte orange « Aucun responsable n’est désigné… » a disparu si vous avez coché **Responsable**.',
                  note: 'La personne reçoit la notification « Rattachement à {organisation} » par email et dans son espace.',
                },
              ],
            },
          ],
        },
        {
          id: 'nommer-ou-retirer-un-responsable',
          title: 'Nommer un responsable ou lui retirer la responsabilité',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche de l’organisation, repérez la ligne du membre dans la carte « Membres ».',
                  where:
                    'les boutons d’action sont à l’extrémité droite de la ligne ; sur mobile, faites défiler le tableau vers la droite',
                },
                {
                  text: 'Cliquez sur `Nommer responsable`.',
                  result:
                    'Le dialogue « Nommer {membre} responsable ? » rappelle : « Le responsable dépose les demandes de formation, suit les participants et consulte les rapports de l’organisation. »',
                },
                {
                  text: 'Cliquez sur `Confirmer`.',
                  result:
                    'Le message « {email} est désormais responsable de {organisation}. » s’affiche et le badge or « Responsable » apparaît sur la ligne.',
                  note: 'Aucun email n’est envoyé pour ce changement (seul le rattachement initial notifie) : prévenez la personne vous-même.',
                },
                {
                  text: 'Pour retirer la responsabilité, cliquez sur `Retirer la responsabilité` puis sur `Confirmer` dans le dialogue.',
                  result:
                    'Le message « {email} n’est plus responsable de {organisation}. » s’affiche ; le badge redevient « Membre ».',
                  note: 'Le dialogue prévient : « Le membre ne pourra plus déposer de demandes ni consulter les rapports de l’organisation. » Le retrait est refusé s’il s’agit du dernier responsable.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'Un responsable désigné ici obtient automatiquement ses droits sur la plateforme de formation, sans qu’un rôle « Responsable d’organisation » ait besoin d’être attribué par le super administrateur.',
            },
          ],
        },
        {
          id: 'retirer-un-membre',
          title: 'Retirer un membre de l’organisation',
          blocks: [
            {
              type: 'callout',
              tone: 'warning',
              title: 'Réversible, mais vérifiez',
              text: 'Le retrait supprime seulement l’appartenance (et la responsabilité éventuelle). Le compte, ses inscriptions et ses demandes sont conservés, et vous pouvez rattacher la personne à nouveau. Vérifiez tout de même que vous êtes sur la bonne ligne.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la ligne du membre, cliquez sur le bouton rouge `Retirer`.',
                  where: 'extrémité droite de la ligne dans « Membres »',
                  result:
                    'Le dialogue « Retirer {membre} de l’organisation ? » s’affiche : « Le compte est conservé ; seules l’appartenance et la responsabilité éventuelle sont retirées. »',
                },
                {
                  text: 'Cliquez sur `Retirer` (rouge) pour confirmer, ou sur `Annuler`.',
                  result:
                    'Le message « {email} retiré de {organisation}. » s’affiche et la ligne disparaît.',
                  note: 'Si la personne était le dernier responsable, le message « Désignez un autre responsable avant de retirer celui-ci » bloque l’opération.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'desactiver-ou-reactiver-une-organisation',
      title: 'Comment désactiver ou réactiver une organisation',
      icon: 'ban',
      summary:
        'Masquer une organisation qui n’est plus active, sans rien effacer, et la remettre en service plus tard.',
      blocks: [
        {
          type: 'callout',
          tone: 'warning',
          title: 'Conséquences de la désactivation',
          text: 'Une organisation désactivée disparaît des listes de choix (filtres, prises en charge, rôles à portée) et ne peut plus recevoir de demande de formation. Ses membres, ses demandes et ses cohortes sont conservés. L’opération est réversible avec `Réactiver`.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche de l’organisation.',
              where: '**Organisations** › nom de l’organisation',
            },
            {
              text: 'Cliquez sur `Désactiver`.',
              where: 'en haut à droite de l’en-tête, à côté du badge « Active »',
              result:
                'Le dialogue « Désactiver {nom} ? » s’affiche : « L’organisation disparaît des listes de choix ; ses membres, demandes et cohortes sont conservés. »',
            },
            {
              text: 'Cliquez sur le bouton rouge `Désactiver` pour confirmer.',
              result:
                'Le message « {nom} désactivée. » s’affiche ; le badge devient « Inactive » (gris) et la ligne apparaît estompée dans la liste.',
            },
            {
              text: 'Pour la remettre en service, ouvrez la fiche et cliquez sur `Réactiver`, puis confirmez.',
              result: 'Le message « {nom} réactivée. » s’affiche ; le badge redevient « Active ».',
              note: 'Pour retrouver une organisation inactive dans la liste, utilisez le filtre **Statut** = Inactives.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les badges de la liste des organisations',
          items: [
            {
              label: 'Affiliée',
              tone: 'info',
              meaning: 'Syndicat membre de la Fédération (case « Organisation affiliée » cochée).',
            },
            {
              label: 'Partenaire',
              tone: 'neutral',
              meaning: 'Organisation partenaire non affiliée.',
            },
            {
              label: 'Active',
              tone: 'success',
              meaning:
                'Sélectionnable dans les formulaires ; peut recevoir des demandes de formation.',
            },
            {
              label: 'Inactive',
              tone: 'neutral',
              meaning: 'Masquée des listes de choix ; données conservées.',
              next: '`Réactiver` depuis la fiche.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'Le message « L’organisation est déjà inactive. » (ou « déjà active ») s’affiche.',
              cause: 'Quelqu’un d’autre a changé le statut entre-temps.',
              solution: 'Rechargez la page pour voir l’état actuel.',
            },
            {
              problem: 'Un responsable signale qu’il ne peut plus déposer de demande.',
              cause: 'L’organisation a été désactivée, ou la responsabilité lui a été retirée.',
              solution: 'Vérifiez le badge de l’en-tête et le badge de sa ligne dans « Membres ».',
            },
          ],
        },
      ],
    },
    {
      id: 'suivre-les-demandes-depuis-le-site',
      title: 'Comment suivre les demandes de formation et les cohortes depuis le site',
      icon: 'handshake',
      summary:
        'Lire l’état des demandes et des cohortes d’une organisation sur sa fiche, puis agir sur la plateforme.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **demande de formation** est le dossier déposé par le responsable d’une organisation pour former un groupe sur un ou plusieurs modules. Une **cohorte** est le groupe d’apprenants créé quand la demande est planifiée. Les décisions (complément, acceptation, refus, autre date, planification) se prennent uniquement sur la plateforme de formation ; le site vous permet de voir où en est chaque organisation.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la notification « Nouvelle demande de formation » reçue par email ou dans **Notifications**.',
              result:
                'Le lien de la notification ouvre directement la demande sur la plateforme de formation.',
              note: 'L’email d’accusé de réception envoyé à l’organisation annonce une réponse « sous 5 jours ouvrés » : c’est votre délai de traitement.',
            },
            {
              text: 'Pour un suivi par organisation, ouvrez **Organisations** puis la fiche concernée.',
              where: 'menu de gauche',
              result:
                'La carte « Demandes de formation » liste les 10 dernières demandes : référence, contact, nombre de modules, date souhaitée, statut, participants, date de dépôt.',
            },
            {
              text: 'Cliquez sur la référence d’une demande.',
              result:
                'La demande s’ouvre sur la plateforme de formation, où vous prenez la décision.',
            },
            {
              text: 'Cliquez sur `Coordination LMS` dans l’en-tête de la carte pour voir la file complète des demandes de toutes les organisations.',
            },
            {
              text: 'Après planification, revenez sur la fiche : la carte « Cohortes » (affichée seulement s’il en existe) montre les 6 dernières cohortes avec leur code, leur cours, le nombre de participants et leur statut.',
              note: 'Le nom d’une cohorte ouvre sa page sur la plateforme.',
            },
            {
              text: 'Lisez la carte « Activité » : « Inscriptions », « Progression moyenne », « Cohortes », « Prises en charge » et le total des commandes réglées de l’organisation.',
              where: 'colonne de droite (en bas sur mobile)',
            },
            {
              text: 'Cliquez sur `Comptes rattachés` pour ouvrir l’annuaire déjà filtré sur cette organisation, ou sur `Page publique des organisations` pour voir comment l’organisation est présentée aux visiteurs.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’une demande de formation',
          items: [
            {
              label: 'Brouillon',
              tone: 'neutral',
              meaning: 'Le responsable prépare encore sa demande ; vous ne la voyez pas.',
            },
            {
              label: 'Soumise',
              tone: 'info',
              meaning: 'La demande vous est transmise.',
              next: 'Sur la plateforme : demander un complément, accepter, refuser ou proposer une autre date, sous 5 jours ouvrés.',
            },
            {
              label: 'Complément demandé',
              tone: 'warning',
              meaning:
                'Vous avez demandé des précisions ; la demande est de retour chez l’organisation.',
              next: 'Attendre la nouvelle soumission.',
            },
            {
              label: 'Autre date proposée',
              tone: 'warning',
              meaning: 'Vous avez proposé une autre date ; l’organisation doit répondre.',
            },
            {
              label: 'Acceptée',
              tone: 'success',
              meaning: 'La demande est validée et attend la planification.',
              next: 'Planifier sur la plateforme (une cohorte par module).',
            },
            {
              label: 'Refusée',
              tone: 'danger',
              meaning: 'Demande refusée avec un motif transmis à l’organisation. Dossier clos.',
            },
            {
              label: 'Planifiée',
              tone: 'info',
              meaning: 'Les cohortes sont créées, les participants inscrits et convoqués.',
            },
            { label: 'Formation en cours', tone: 'info', meaning: 'Les cohortes ont démarré.' },
            { label: 'Terminée', tone: 'success', meaning: 'Formation achevée. Dossier clos.' },
            { label: 'Annulée', tone: 'neutral', meaning: 'Demande annulée. Dossier clos.' },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’une cohorte',
          items: [
            { label: 'Planifiée', tone: 'info', meaning: 'Cohorte créée, dates fixées.' },
            {
              label: 'Inscriptions ouvertes',
              tone: 'success',
              meaning: 'Des places sont proposées au catalogue public.',
            },
            { label: 'En cours', tone: 'info', meaning: 'La formation a commencé.' },
            {
              label: 'Clôturée',
              tone: 'neutral',
              meaning: 'Formation terminée ; certificats émis ou à émettre sur la plateforme.',
            },
            { label: 'Annulée', tone: 'danger', meaning: 'Cohorte annulée.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Rien ne se décide sur le site',
          text: 'Les boutons de décision, les commentaires obligatoires (complément, refus), la limite de participants et les pièces jointes sont décrits dans le guide de la coordination sur la plateforme de formation.',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'La carte « Demandes de formation » affiche « Aucune demande ».',
              cause: 'Le responsable n’a rien soumis, ou sa demande est encore en brouillon.',
              solution:
                'Vérifiez qu’un responsable est bien désigné (badge « Responsable ») et que l’organisation est active.',
            },
            {
              problem: 'Le lien vers la demande affiche une page introuvable sur la plateforme.',
              cause: 'La demande a été supprimée ou votre session sur la plateforme a expiré.',
              solution: 'Reconnectez-vous puis réessayez depuis la fiche de l’organisation.',
            },
          ],
        },
      ],
    },
    {
      id: 'retrouver-un-compte',
      title: 'Comment retrouver un compte et vérifier ses rôles',
      icon: 'users',
      summary:
        'Utiliser l’annuaire des comptes en lecture seule : rôles, organisations, sécurité, inscriptions.',
      blocks: [
        {
          type: 'paragraph',
          text: 'L’annuaire **Utilisateurs et rôles** regroupe les comptes des deux plateformes. Pour votre rôle, il est en consultation seule : vous pouvez tout lire, mais la création de comptes, l’attribution des rôles et la désactivation sont réservées au super administrateur.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Utilisateurs et rôles**.',
              where:
                'menu de gauche, section « Administration » ; ou bouton `Utilisateurs` du tableau de bord',
              result:
                'La page affiche les tuiles « Comptes enregistrés », « Apprenants », « Équipe pédagogique », « Équipe d’administration » puis le tableau.',
            },
            {
              text: 'Saisissez un nom, une adresse email ou un employeur dans le champ **Nom, email ou employeur**.',
            },
            {
              text: 'Affinez si besoin avec les listes **Rôle** (Apprenant, Responsable d’organisation, Formateur, Coordinateur formation…), **Statut** (Actifs / Désactivés) et **Organisation**.',
            },
            {
              text: 'Cliquez sur `Filtrer`.',
              result:
                'Le tableau ne montre que les comptes correspondants ; `Réinitialiser` efface les filtres.',
              note: 'Sur mobile, seules les colonnes « Utilisateur » et « Rôles » sont visibles : ouvrez la fiche pour le reste.',
            },
            {
              text: 'Cliquez sur le nom de la personne.',
              result:
                'Sa fiche s’ouvre : en-tête avec « Compte actif » ou « Compte désactivé » et « MFA active » si la vérification en deux étapes est activée.',
            },
            {
              text: 'Lisez la carte « Rôles et portées » : chaque ligne indique le rôle, sa portée (Globale, Organisation, Cours ou Cohorte) et son expiration (« Sans limite », « Jusqu’au … », « Expiré le … »).',
              note: 'Un rôle « (limité) » ne s’applique qu’à une organisation, un cours ou une cohorte précise.',
            },
            {
              text: 'Lisez la carte « Organisations » : les appartenances avec le badge « Responsable » (or) ou « Membre ».',
              note: 'Pour ajouter une appartenance, passez par la fiche de l’organisation (carte « Ajouter un membre ») : le lien du nom de l’organisation vous y mène.',
            },
            {
              text: 'Consultez si besoin « Inscriptions à la formation » (statut, progression, score), « Commandes » (référence cliquable vers la finance) et « Dernières connexions ».',
            },
            {
              text: 'Cliquez sur `Fiche sur la plateforme de formation` pour ouvrir le même compte côté plateforme.',
              where: 'carte « Repères », colonne de droite (en bas sur mobile)',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les badges de l’annuaire et de la fiche',
          items: [
            {
              label: 'Actif / Compte actif',
              tone: 'success',
              meaning: 'Le compte peut se connecter.',
            },
            {
              label: 'Désactivé / Compte désactivé',
              tone: 'danger',
              meaning: 'Le compte ne peut plus se connecter.',
              next: 'Seul le super administrateur peut le réactiver.',
            },
            {
              label: 'MFA / MFA active',
              tone: 'success',
              meaning: 'Vérification en deux étapes activée.',
            },
            {
              label: 'Aucun rôle',
              tone: 'neutral',
              meaning:
                'Le compte ne peut que consulter les contenus publics et son espace personnel.',
            },
            {
              label: '(limité)',
              tone: 'info',
              meaning: 'Rôle à portée restreinte (organisation, cours ou cohorte).',
            },
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire depuis l’annuaire',
          style: 'bullet',
          items: [
            '`Nouveau compte` : masqué ; si vous saisissez l’adresse de la page, vous êtes redirigé vers « Accès refusé ».',
            '`Attribuer un rôle` et `Révoquer` : masqués (la carte « Rôles et portées » est en lecture).',
            '`Désactiver le compte`, `Réinitialiser la MFA`, mot de passe temporaire : masqués (la carte « Compte » indique « Consultation seule. »).',
            'Le journal d’audit du compte n’est pas affiché.',
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'La recherche ne trouve pas la personne.',
              cause: 'Elle s’est inscrite avec une autre adresse, ou n’a pas de compte.',
              solution:
                'Essayez avec le nom de famille seul, puis avec l’employeur. Si rien n’apparaît, demandez-lui de s’inscrire sur le site.',
            },
            {
              problem: 'Un formateur ou un responsable a un rôle qui n’apparaît plus.',
              cause: 'Le rôle avait une date d’expiration dépassée (« Expiré le … »).',
              solution: 'Demandez au super administrateur de l’attribuer à nouveau.',
            },
          ],
        },
      ],
    },
    {
      id: 'consulter-la-finance',
      title: 'Comment consulter la finance et faire émettre un reçu',
      icon: 'wallet',
      summary:
        'Lire le tableau de bord financier et les commandes ; émettre un reçu ; relancer le rapprochement des paiements.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La rubrique **Finance** regroupe les commandes et les paiements des deux plateformes (formations, événements, services, ressources), en francs CFA sans centimes. Votre rôle y accède en lecture. Deux actions vous sont ouvertes : faire émettre ou régénérer le reçu d’une commande réglée, et relancer le rapprochement des paiements en attente. Le remboursement et les exports comptables sont réservés au rôle **Finance / contrôle**.',
        },
        {
          type: 'statuses',
          title: 'Les statuts d’une commande',
          items: [
            {
              label: 'En attente',
              tone: 'warning',
              meaning: 'Le paiement n’est pas encore confirmé (ligne sur fond or clair).',
              next: 'Relancer le rapprochement si l’attente dépasse 15 minutes.',
            },
            {
              label: 'Payée',
              tone: 'success',
              meaning:
                'Paiement confirmé ; le reçu peut être émis et les livrables (inscription, événement) sont déclenchés.',
            },
            {
              label: 'Échouée',
              tone: 'danger',
              meaning:
                'Le fournisseur de paiement a refusé la transaction ; le motif s’affiche sur la commande.',
            },
            { label: 'Annulée', tone: 'neutral', meaning: 'Commande annulée avant paiement.' },
            {
              label: 'Remboursée',
              tone: 'info',
              meaning: 'Montant intégralement remboursé par le rôle Finance.',
            },
            {
              label: 'Partiellement remboursée',
              tone: 'info',
              meaning: 'Une partie du montant a été remboursée.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'L’alerte « Indicateurs indisponibles » s’affiche sur le tableau de bord Finance.',
              cause: 'Le calcul des statistiques a échoué temporairement.',
              solution:
                'Les listes de commandes restent accessibles ; réessayez dans quelques instants.',
            },
            {
              problem: 'Le bouton `Émettre le reçu` n’apparaît pas.',
              cause:
                'La commande n’est pas réglée : le reçu ne peut être émis que pour une commande Payée, Partiellement remboursée ou Remboursée.',
              solution:
                'Attendez la confirmation du paiement (relancez le rapprochement si nécessaire).',
            },
            {
              problem:
                'Le message « Le PDF n’est pas encore disponible : son rendu est en file d’attente. » reste affiché.',
              cause: 'Le PDF est généré en arrière-plan par un traitement périodique.',
              solution:
                'Revenez quelques minutes plus tard. Si rien ne change après une heure, signalez la référence de la commande au support.',
            },
            {
              problem: 'Vous ne trouvez ni bouton `Rembourser` ni `Exporter (CSV)`.',
              cause: 'Ces actions exigent le rôle Finance / contrôle.',
              solution: 'Transmettez la demande (référence de la commande, motif) au rôle Finance.',
            },
          ],
        },
      ],
      subsections: [
        {
          id: 'lire-le-tableau-de-bord-financier',
          title: 'Lire le tableau de bord financier',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Finance**.',
                  where: 'menu de gauche, section « Administration »',
                  result:
                    'La page « Finance » s’affiche avec la sous-navigation en pastilles `Tableau de bord`, `Commandes`, `Prises en charge`.',
                },
                {
                  text: 'Lisez les tuiles : « Chiffre d’affaires du mois », « Commandes en attente » (montant et nombre de paiements à confirmer), « Remboursés sur 12 mois », « Panier moyen ».',
                },
                {
                  text: 'Parcourez « Chiffre d’affaires mensuel » (12 mois) et « Moyens de paiement » (répartition Formations / Événements / Services / Ressources).',
                },
                {
                  text: 'Vérifiez la carte « Webhooks de paiement » : un badge « {n} anomalie(s) » signale des notifications de fournisseur en « Erreur » ou « Non vérifié ».',
                  note: 'Un webhook est un message automatique envoyé par le fournisseur de paiement (Mobile Money, carte) pour confirmer une transaction. En cas d’anomalies répétées, prévenez le rôle Finance et le support.',
                },
                {
                  text: 'Consultez « Dernières commandes » ; cliquez sur `Toutes les commandes` pour la liste complète.',
                },
                {
                  text: 'Repérez la carte marine « Prises en charge » et son bouton `Gérer les prises en charge` (pour vous : consultation).',
                  where: 'en bas de la page',
                },
              ],
            },
          ],
        },
        {
          id: 'rechercher-une-commande',
          title: 'Rechercher une commande',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur la pastille `Commandes`.',
                  where: 'sous l’en-tête « Finance »',
                  result: 'La page « Commandes » s’affiche.',
                },
                {
                  text: 'Saisissez la référence, l’email du client ou le libellé dans le champ **Référence, email du client ou libellé**.',
                },
                {
                  text: 'Affinez avec **Statut**, **Organisation** et la **Période de création** (champs Du / Au), puis cliquez sur `Filtrer`.',
                  note: 'La date « Au » couvre toute la journée.',
                },
                {
                  text: 'Cliquez sur la référence de la commande.',
                  result:
                    'La page « Commande {référence} » s’ouvre : « Récapitulatif », « Paiements », « Livrables », « Historique », et à droite « Client », « Reçu », « Rapprochement ».',
                },
                {
                  text: 'Dans « Récapitulatif », vérifiez la ligne « Remise » : elle indique le code promotionnel ou la prise en charge appliquée et son pourcentage.',
                },
                {
                  text: 'Dans « Livrables », cliquez sur `Plateforme de formation` pour suivre l’inscription déclenchée par la commande.',
                },
              ],
            },
          ],
        },
        {
          id: 'emettre-un-recu',
          title: 'Faire émettre ou régénérer un reçu',
          blocks: [
            {
              type: 'steps',
              intro:
                'Un reçu est le justificatif de paiement numéroté REC-AAAA-XXXXXX, généré en PDF après confirmation du paiement.',
              items: [
                {
                  text: 'Sur la page de la commande, repérez la carte « Reçu ».',
                  where: 'colonne de droite (en bas sur mobile)',
                  result:
                    'Elle affiche le numéro et la date d’émission, ou « Aucun reçu émis pour cette commande réglée. »',
                },
                {
                  text: 'Cliquez sur `Émettre le reçu` (ou `Régénérer le PDF` si un reçu existe déjà).',
                  result:
                    'Le message « Reçu {numéro} émis ; le PDF est généré en arrière-plan. » s’affiche.',
                  note: 'Pendant l’envoi, le bouton indique « Mise en file ».',
                },
                {
                  text: 'Revenez quelques minutes plus tard et cliquez sur `Télécharger le PDF`.',
                  result: 'Le reçu s’ouvre ou se télécharge selon votre navigateur.',
                },
              ],
            },
          ],
        },
        {
          id: 'relancer-le-rapprochement',
          title: 'Relancer le rapprochement des paiements',
          blocks: [
            {
              type: 'paragraph',
              text: 'Le rapprochement re-vérifie auprès des fournisseurs les paiements « En attente de confirmation » depuis plus de 15 minutes (100 au maximum par exécution). Il est utile quand un apprenant affirme avoir payé par Mobile Money et que sa commande reste « En attente ».',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur le tableau de bord Finance, cliquez sur `Lancer le rapprochement`.',
                  where: 'en haut à droite de l’en-tête (pleine largeur sur mobile)',
                  result:
                    'Le message « {n} paiement(s) vérifié(s), {n} mis à jour. » ou « Aucun paiement en attente à rapprocher. » s’affiche.',
                  note: 'Pendant l’exécution, le bouton indique « Rapprochement en cours ».',
                },
                {
                  text: 'Pour une seule commande, ouvrez-la et cliquez sur `Relancer le rapprochement` dans la carte « Rapprochement ».',
                  result:
                    'Si la commande passe « Payée », les livrables se déclenchent et le client reçoit l’email « Paiement confirmé - commande {référence} ».',
                  note: 'Si la carte indique « Aucun paiement de cette commande n’est en attente. », il n’y a rien à rapprocher.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'consulter-les-prises-en-charge',
      title: 'Comment consulter les prises en charge',
      icon: 'hand-coins',
      summary: 'Vérifier les bourses et financements accordés, sans pouvoir les modifier.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **prise en charge** est un pourcentage du montant d’une formation ou d’un événement financé par la Fédération ou par une organisation pour un bénéficiaire. Elle s’applique automatiquement au moment du paiement : si elle couvre 100 %, la commande est validée sans paiement. Sur le site, vous consultez les prises en charge ; leur création, leur clôture et leur suppression sont réservées au rôle **Finance / contrôle**.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Aucune décision sur les prises en charge',
          text: 'Le bouton `Nouvelle prise en charge` et les actions `Clôturer` / `Supprimer` ne vous sont pas proposés. Pour faire accorder une prise en charge à un participant, transmettez au rôle Finance : l’adresse email du bénéficiaire, la formation ou l’événement visé (ou « toute l’offre »), le pourcentage, le financeur (Fédération ou organisation) et la date de fin de validité éventuelle.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Finance** puis la pastille `Prises en charge`.',
              where:
                'sous l’en-tête « Finance » ; ou bouton `Gérer les prises en charge` en bas du tableau de bord Finance',
              result:
                'La page « Prises en charge » s’affiche avec les tuiles « Prises en charge en cours de validité » et « Prises en charge accordées ».',
            },
            {
              text: 'Recherchez par **Bénéficiaire, libellé ou organisation**, filtrez par **Validité** (En cours / Expirées) ou **Organisation**, puis cliquez sur `Filtrer`.',
            },
            {
              text: 'Lisez chaque ligne : bénéficiaire (nom cliquable vers sa fiche), libellé et cible (« Formation · … », « Événement · … » ou « Toute l’offre »), taux (badge or si 100 %), financeur (organisation ou « Fédération »), validité, nombre d’utilisations, auteur.',
              note: 'Sur mobile, le libellé et la cible sont rappelés sous le bénéficiaire ; les autres colonnes sont masquées.',
            },
            {
              text: 'Pour vérifier qu’une prise en charge a bien été appliquée, ouvrez la commande du bénéficiaire (**Finance** › `Commandes`) et lisez la ligne « Remise » du récapitulatif.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'La validité d’une prise en charge',
          items: [
            {
              label: 'Sans limite',
              tone: 'success',
              meaning: 'Valable jusqu’à sa clôture par le rôle Finance.',
            },
            {
              label: 'Jusqu’au {date}',
              tone: 'warning',
              meaning: 'Valable jusqu’à la date indiquée.',
            },
            {
              label: 'Expirée le {date}',
              tone: 'danger',
              meaning: 'N’est plus appliquée au paiement (ligne estompée).',
            },
            {
              label: 'Fédération',
              tone: 'info',
              meaning: 'Financeur : la Fédération elle-même (aucune organisation).',
            },
            {
              label: 'Toute l’offre',
              tone: 'neutral',
              meaning: 'Cible : toutes les formations et tous les événements.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'Un participant devait être pris en charge mais sa commande affiche le montant plein.',
              cause:
                'La prise en charge est expirée, cible une autre formation, ou a été créée avec une autre adresse email.',
              solution:
                'Retrouvez-la avec le filtre **Validité** = Expirées et vérifiez la cible et le bénéficiaire ; signalez l’écart au rôle Finance.',
            },
            {
              problem: 'Deux prises en charge concernent la même personne.',
              cause:
                'C’est possible : au paiement, la plus favorable en cours de validité (spécifique ou générale) est appliquée.',
              solution:
                'Aucune action ; vérifiez seulement que la plus favorable est bien celle attendue.',
            },
          ],
        },
      ],
    },
    {
      id: 'consulter-les-rapports',
      title: 'Comment consulter les rapports et exporter un CSV',
      icon: 'bar-chart',
      summary:
        'Lire les indicateurs du site et de la plateforme, télécharger un export, rejoindre les rapports détaillés.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Rapports**.',
              where:
                'menu de gauche, section « Administration » ; ou bouton `Rapports détaillés` en haut du tableau de bord',
              result:
                'La page « Rapports » s’affiche, sans cookie de suivi, avec deux sections : « Site institutionnel · 30 derniers jours » et « Plateforme de formation ».',
            },
            {
              text: 'Lisez la section « Site institutionnel » : « Pages vues », « Formulaires reçus », « Inscriptions aux événements », « Conversion des commandes », la carte « Visites » et « Formulaires et recherches » (avec les recherches fréquentes).',
            },
            {
              text: 'Lisez la section « Plateforme de formation » : « Apprenants actifs sur 30 jours », « Nouvelles inscriptions sur 30 jours », « Taux de complétion », « Certificats émis sur 30 jours », puis la carte « Inscriptions et complétions » (12 mois).',
            },
            {
              text: 'Examinez la carte « Qualité de la formation » : réussite aux évaluations, score moyen, assiduité, enquêtes de satisfaction, temps moyen par inscription, inscriptions en attente, et le bloc « Demandes de formation » par statut.',
              note: 'C’est ici que vous repérez un module dont la réussite ou l’assiduité décroche.',
            },
            {
              text: 'Consultez « Contenus populaires » : actualités, ressources, formations et événements les plus consultés (8 par type).',
            },
            {
              text: 'Pour télécharger un export, repérez la carte « Exports CSV » et cliquez sur `Indicateurs du site`, `Indicateurs de formation` ou `Contenus populaires`.',
              where: 'colonne de droite ; en bas de la page sur mobile',
              result:
                'Un fichier « fetrag-rapport-{type}-{date}.csv » est téléchargé (UTF-8, séparateur point-virgule). Sur téléphone, il est proposé à l’enregistrement.',
              note: 'Le CSV s’ouvre avec un tableur. Chaque export est inscrit dans le journal d’audit.',
            },
            {
              text: 'Pour les rapports par cohorte, organisation, cours et satisfaction, cliquez sur `Rapports détaillés du LMS`.',
              where: 'en haut à droite de l’en-tête',
              result: 'Les rapports de la plateforme de formation s’ouvrent.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Contenu des trois exports CSV',
          columns: ['Export', 'Contenu'],
          rows: [
            [
              'Indicateurs du site',
              'Visites par jour et synthèse : formulaires, demandes de service, commandes, lettre d’information, recherches.',
            ],
            [
              'Indicateurs de formation',
              'Synthèse (apprenants actifs, inscriptions, complétion, réussite, assiduité, satisfaction, certificats, cohortes, temps total), inscriptions par statut, séries mensuelles, cours les plus suivis.',
            ],
            [
              'Contenus populaires',
              'Les 25 premiers contenus par type avec vues, téléchargements ou inscriptions.',
            ],
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Les exports contiennent des données à protéger',
          text: 'Un export est journalisé et peut contenir des données personnelles ou syndicales. Ne le transmettez qu’aux personnes habilitées, ne l’envoyez pas par une messagerie non professionnelle et supprimez-le de l’appareil quand il n’est plus utile.',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'L’alerte « Indicateurs indisponibles » ou un texte « Indicateurs … indisponibles. » s’affiche.',
              cause: 'Le calcul des statistiques a échoué temporairement.',
              solution: 'Rechargez la page dans quelques instants.',
            },
            {
              problem:
                'Le téléchargement affiche un texte « L’export a échoué. » ou « Permission insuffisante ».',
              cause: 'Erreur temporaire du serveur, ou rôle expiré.',
              solution:
                'Revenez en arrière et réessayez ; si le message persiste, contactez le support avec l’heure de l’essai.',
            },
            {
              problem: 'Le fichier CSV s’ouvre avec des caractères accentués illisibles.',
              cause: 'Le tableur n’a pas reconnu l’encodage UTF-8.',
              solution:
                'Ouvrez le fichier par la fonction d’import de votre tableur en choisissant UTF-8 et le séparateur point-virgule.',
            },
          ],
        },
      ],
    },
    {
      id: 'utiliser-la-mediatheque',
      title: 'Comment envoyer un fichier dans la médiathèque',
      icon: 'image',
      summary:
        'Déposer des images et des documents réutilisables, les décrire, copier leur adresse, les supprimer.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La **Médiathèque** stocke les images, documents, audios et vidéos réutilisables dans les contenus du site. Vous ne rédigez pas de pages ni d’actualités : elle vous sert surtout à déposer un visuel ou un document (programme, affiche, support) que l’éditeur communication publiera ensuite, ou dont vous voulez partager l’adresse.',
        },
        {
          type: 'table',
          caption: 'Fichiers acceptés et tailles maximales',
          columns: ['Type', 'Formats acceptés', 'Taille maximale'],
          rows: [
            ['Image', 'JPEG, PNG, WebP, GIF, AVIF (le SVG est refusé)', '8 Mo'],
            ['Document', 'PDF, Word, Excel, PowerPoint, OpenDocument texte, texte, CSV', '25 Mo'],
            ['Audio', 'MP3, MP4 audio, OGG, WAV, WebM', '60 Mo'],
            ['Vidéo', 'MP4, WebM', '200 Mo'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Le dialogue d’envoi annonce « Images (12 Mo) », mais la limite réellement appliquée aux images est de 8 Mo : au-delà, le message « Le fichier dépasse la taille maximale de 8 Mo » s’affiche. Réduisez la photo avant l’envoi.',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem:
                'Le message « Type de fichier non autorisé » ou « Extension de fichier refusée » s’affiche.',
              cause: 'Le format n’est pas dans la liste (par exemple SVG, ou une archive ZIP).',
              solution:
                'Convertissez le fichier dans un format accepté (PNG ou JPEG pour une image, PDF pour un document).',
            },
            {
              problem: 'Le message « L’extension ne correspond pas au type de fichier » s’affiche.',
              cause:
                'Le fichier a été renommé avec une extension qui ne correspond pas à son contenu.',
              solution:
                'Réenregistrez le fichier depuis l’application d’origine avec la bonne extension.',
            },
            {
              problem: 'Le message « Copie impossible dans ce navigateur » s’affiche.',
              cause: 'Le navigateur bloque l’accès au presse-papiers.',
              solution:
                'Ouvrez l’aperçu du fichier dans un nouvel onglet et copiez son adresse depuis la barre du navigateur, ou réessayez depuis un ordinateur.',
            },
            {
              problem: 'L’envoi échoue sans message précis (« L’envoi du fichier a échoué. »).',
              cause: 'Connexion coupée pendant l’envoi, fréquent sur mobile avec un gros fichier.',
              solution: 'Réessayez en Wi-Fi ou avec un fichier plus léger.',
            },
          ],
        },
      ],
      subsections: [
        {
          id: 'envoyer-un-fichier',
          title: 'Envoyer un fichier',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Médias**.',
                  where: 'menu de gauche, section « Contenus »',
                  result:
                    'La page « Médiathèque » affiche les filtres, le bouton `Envoyer un fichier` et la grille des fichiers.',
                },
                {
                  text: 'Cliquez sur `Envoyer un fichier`.',
                  where: 'au-dessus de la grille, à droite',
                  result: 'Le dialogue « Envoyer un fichier » s’ouvre.',
                },
                {
                  text: 'Choisissez le **Fichier** (obligatoire).',
                  note: 'Sur téléphone, le sélecteur propose vos photos et vos documents.',
                },
                {
                  text: 'Indiquez le **Dossier** (facultatif, « uploads » par défaut ; minuscules, chiffres, tirets).',
                  note: 'Exemple : « formation-2026 ». Le dossier sert à retrouver les fichiers avec le filtre **Dossier**.',
                },
                {
                  text: 'Choisissez la **Visibilité** : Public (accessible par son adresse) ou Privé (lien signé, réservé aux usages internes).',
                  note: 'Choisissez Privé pour un document qui ne doit pas circuler librement.',
                },
                {
                  text: 'Pour une image, saisissez le **Texte alternatif** (300 caractères maximum) : une phrase qui décrit l’image pour les personnes qui utilisent un lecteur d’écran.',
                  note: 'Sans texte alternatif, la carte du fichier affiche l’avertissement « Texte alternatif manquant ».',
                },
                {
                  text: 'Ajoutez une **Légende** si utile (500 caractères maximum), puis cliquez sur `Envoyer`.',
                  result:
                    'Le message « « {fichier} » envoyé. » s’affiche et la page se recharge avec le nouveau fichier dans la grille.',
                  note: 'Pendant l’envoi, le bouton indique « Envoi en cours » : ne fermez pas la page.',
                },
              ],
            },
          ],
        },
        {
          id: 'partager-ou-corriger-un-fichier',
          title: 'Copier l’adresse d’un fichier ou corriger ses informations',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Retrouvez le fichier avec le champ **Nom de fichier, texte alternatif** ou les filtres **Dossier**, **Type**, **Visibilité**.',
                  result:
                    'La grille (une colonne sur mobile) affiche la carte du fichier : aperçu, nom, type, taille, auteur.',
                },
                {
                  text: 'Cliquez sur `Copier l’URL` (fichier public) ou `Copier la clé` (fichier privé).',
                  result:
                    'Le message « URL copiée » ou « Clé copiée » s’affiche ; collez l’adresse dans votre message à l’éditeur.',
                },
                {
                  text: 'Pour corriger la description, cliquez sur `Modifier`.',
                  result:
                    'Le dialogue « Métadonnées du média » s’ouvre avec **Texte alternatif**, **Légende** et **Dossier**.',
                },
                {
                  text: 'Corrigez puis cliquez sur `Enregistrer`.',
                  result: 'Le message « Média mis à jour. » s’affiche.',
                },
              ],
            },
          ],
        },
        {
          id: 'supprimer-un-fichier',
          title: 'Supprimer un fichier',
          blocks: [
            {
              type: 'callout',
              tone: 'danger',
              title: 'Suppression définitive',
              text: 'Le fichier est retiré du stockage et ne peut pas être récupéré. Les pages, actualités ou ressources qui l’utilisent afficheront un lien cassé. Avant de supprimer, demandez à l’éditeur communication si le fichier est utilisé.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la carte du fichier, cliquez sur `Supprimer`.',
                  result:
                    'Le dialogue « Supprimer « {fichier} » ? » rappelle : « Le fichier est retiré du stockage. Les contenus qui l’utilisent afficheront un lien cassé. »',
                },
                {
                  text: 'Cliquez sur le bouton rouge `Supprimer` pour confirmer, ou sur `Annuler`.',
                  result:
                    'La carte disparaît de la grille. La suppression est inscrite dans le journal d’audit.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'verifier-le-catalogue-public',
      title: 'Comment vérifier une formation dans le catalogue public',
      icon: 'graduation-cap',
      summary:
        'Comprendre comment un cours publié sur la plateforme apparaît sur le site, et contrôler sa fiche.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page **Formations** du site est alimentée automatiquement par la plateforme de formation : seuls les cours publiés y apparaissent. Vous ne saisissez rien sur le site ; vous publiez sur la plateforme, puis vous contrôlez le résultat côté public.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Sur la plateforme de formation, publiez la version du cours puis le cours lui-même.',
              note: 'Procédure détaillée dans le guide de la coordination sur la plateforme (espace Administration › Cours).',
            },
            {
              text: 'Sur le site, ouvrez **Formations** dans la navigation principale.',
              where: 'menu du haut ; sur mobile, bouton **Ouvrir le menu** (trois traits)',
              result:
                'Le catalogue « Former les leaders syndicaux de demain » affiche les cours publiés, numérotés, avec les filtres « Pilier » et « Modalité ».',
              note: 'Tant qu’aucun cours n’est publié, la page affiche l’alerte « Programme officiel 2026 » et les dix modules de repli du programme.',
            },
            {
              text: 'Recherchez le module avec le champ **Rechercher un module, un thème, un objectif…** ou les puces de filtre.',
            },
            {
              text: 'Ouvrez la fiche du module.',
              result:
                'La fiche affiche le code (par exemple M01), le niveau, la durée, la modalité, les objectifs, le « Programme détaillé » (chapitres, leçons, activités et numéro de version), les prérequis, le tarif, la politique d’inscription, les formateurs et les « Prochaines cohortes ».',
              note: 'La fiche est mise en cache : une modification publiée sur la plateforme peut mettre jusqu’à 5 minutes à apparaître.',
            },
            {
              text: 'Vérifiez la ligne « Inscription » de la colonne « Fiche du module » : « Inscription libre en ligne », « Inscription sur validation de la coordination », « Réservée aux organisations affiliées » ou « Inscription après paiement ».',
              note: 'Elle traduit la politique d’inscription choisie sur la plateforme. Si elle ne correspond pas, corrigez le cours sur la plateforme.',
            },
            {
              text: 'Vérifiez « Prochaines cohortes » : seules les cohortes à venir avec des places restantes sont affichées ; sinon la fiche indique que le module reste accessible à distance.',
            },
            {
              text: 'Testez les boutons d’inscription de la fiche : ils mènent à la page du cours sur la plateforme, où l’apprenant est reconnu avec son compte FETRAG.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les badges d’une fiche formation publique',
          items: [
            {
              label: 'Cours pilote',
              tone: 'warning',
              meaning: 'Cours mis en avant depuis la plateforme.',
            },
            { label: 'Référent', tone: 'info', meaning: 'Formateur référent du module.' },
            {
              label: 'Conseillé',
              tone: 'neutral',
              meaning: 'Prérequis recommandé mais non obligatoire.',
            },
            {
              label: 'Programme 2026',
              tone: 'neutral',
              meaning:
                'Fiche de repli : le module du programme officiel n’est pas encore publié sur la plateforme.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Le cours publié n’apparaît pas dans le catalogue.',
              cause:
                'Le cours n’est pas au statut Publié sur la plateforme, ou seule la version a été publiée ; ou le cache de 5 minutes n’est pas expiré.',
              solution:
                'Vérifiez le statut du cours sur la plateforme, attendez 5 minutes et rechargez la page.',
            },
            {
              problem:
                'La fiche affiche « Le programme détaillé de ce module sera publié prochainement. »',
              cause: 'Le cours est publié mais sa version courante n’a pas de contenu publié.',
              solution: 'Publiez la version du cours sur la plateforme.',
            },
            {
              problem: 'La page « Cette formation est introuvable » s’affiche.',
              cause: 'Le cours a été dépublié ou son adresse (slug) a changé.',
              solution:
                'Vérifiez l’adresse du cours sur la plateforme et republiez-le si nécessaire.',
            },
          ],
        },
      ],
    },
    {
      id: 'lettre-d-information',
      title: 'Comment consulter la lettre d’information',
      icon: 'mail',
      summary: 'Lire la liste des abonnés, en consultation seule.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Newsletter**.',
              where: 'menu de gauche, section « Relations »',
              result:
                'La page « Lettre d’information » affiche les tuiles « Abonnés confirmés », « En attente de confirmation », « Désinscrits ».',
            },
            {
              text: 'Recherchez une adresse dans **Adresse email** ou filtrez par **État**, puis cliquez sur `Filtrer`.',
              result:
                'Le tableau affiche l’email, l’état, les dates d’inscription et de confirmation, et l’origine de l’abonnement.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Consultation seule',
          text: 'La suppression d’un abonné n’est pas proposée à votre rôle. Le bouton `Exporter (CSV)` est affiché mais l’export vous est refusé (message « Permission insuffisante ») : demandez-le au responsable services ou à l’éditeur communication.',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Ce qui vous parvient, ce qui le déclenche et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les notifications internes du site se lisent dans **Notifications** (menu du compte ; badge du nombre de non lues). Celles qui renvoient vers un écran de coordination s’ouvrent sur la plateforme de formation. Les emails arrivent à l’adresse de votre compte.',
        },
        {
          type: 'table',
          caption: 'Notifications reçues par le coordinateur',
          columns: ['Sujet', 'Déclencheur', 'Que faire'],
          rows: [
            [
              '« Nouvelle demande de formation » – « {organisation} : {modules} ({n} participant(s)). »',
              'Un responsable soumet ou resoumet une demande de formation. Notification interne et email.',
              'Ouvrir le lien vers la demande sur la plateforme et la traiter sous 5 jours ouvrés.',
            ],
            [
              '« Confirmez votre adresse email - FETRAG »',
              'Création de votre compte ou changement d’adresse.',
              'Cliquer sur le lien pour confirmer.',
            ],
            [
              '« Réinitialisation de votre mot de passe FETRAG »',
              'Vous avez demandé un lien depuis « Mot de passe oublié ».',
              'Cliquer sur le lien dans les 30 minutes. Si vous n’avez rien demandé, ignorez l’email et prévenez le support.',
            ],
            [
              '« Votre mot de passe FETRAG a été modifié »',
              'Votre mot de passe vient d’être changé.',
              'Si ce n’est pas vous, contactez immédiatement le support.',
            ],
          ],
        },
        {
          type: 'table',
          caption: 'Notifications que vos actions déclenchent chez les autres',
          columns: ['Action', 'Destinataire et message'],
          rows: [
            [
              'Rattacher un membre à une organisation (site)',
              'Le membre reçoit « Rattachement à {organisation} » (email et notification) : version « responsable » ou version « membre » selon la case cochée.',
            ],
            [
              'Nommer ou retirer un responsable, retirer un membre, désactiver une organisation',
              'Aucune notification : prévenez les personnes concernées vous-même.',
            ],
            [
              'Envoyer un média, exporter un CSV, relancer le rapprochement, émettre un reçu',
              'Aucune notification ; le client reçoit « Paiement confirmé - commande {référence} » uniquement quand un paiement est confirmé.',
            ],
            [
              'Décisions sur une demande (plateforme)',
              'Le contact de l’organisation reçoit les emails « Demande … bien reçue », « complément d’information attendu », « acceptée », « réponse de la coordination », « Formation planifiée ».',
            ],
          ],
        },
        {
          type: 'steps',
          title: 'Lire vos notifications sur le site',
          items: [
            {
              text: 'Ouvrez le menu du compte puis **Notifications**.',
              where: 'avatar en haut à droite',
              result:
                'La page « Vos notifications » s’affiche avec les filtres `Toutes` et `Non lues (n)`.',
            },
            {
              text: 'Cliquez sur une notification pour ouvrir l’écran concerné.',
            },
            {
              text: 'Cliquez sur `Tout marquer comme lu` une fois vos notifications traitées.',
              result: 'Le badge du menu disparaît.',
            },
          ],
        },
      ],
    },
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield-check',
      blocks: [
        {
          type: 'list',
          style: 'check',
          items: [
            'Activez la vérification en deux étapes dès votre première connexion et gardez vos codes de secours hors du téléphone.',
            'Déconnectez-vous (menu du compte › `Déconnexion`) sur tout appareil partagé, et ne mémorisez pas votre mot de passe dans le navigateur d’un ordinateur public.',
            'Ne communiquez jamais votre mot de passe ni un code de vérification, même à un collègue ou à un « support » qui vous le demanderait par téléphone.',
            'Vérifiez avant de créer une organisation qu’elle n’existe pas déjà (y compris parmi les inactives) : une fiche en double complique le suivi des demandes.',
            'Désignez toujours au moins un responsable par organisation active et prévenez-le : l’application n’envoie pas d’email lors d’un changement de responsabilité.',
            'Traitez les demandes « Soumise » sous 5 jours ouvrés, délai annoncé à l’organisation dans l’accusé de réception.',
            'Préférez « Désactiver » à toute autre solution pour une organisation qui cesse son activité : ses données et son historique restent disponibles.',
            'Les données de la finance, de l’annuaire et des exports sont confidentielles : ne les partagez qu’avec les rôles habilités, jamais dans un groupe de messagerie.',
            'Un export CSV contient des données personnelles : supprimez-le de votre appareil quand vous n’en avez plus besoin.',
            'Avant de supprimer un média, demandez à l’éditeur communication s’il est utilisé : la suppression est définitive.',
            'Renseignez le texte alternatif de chaque image envoyée : les personnes qui utilisent un lecteur d’écran en dépendent.',
            'Restez courtois et factuel dans les commentaires transmis aux organisations (compléments, refus) : ils sont conservés dans l’historique de la demande.',
            'Signalez au super administrateur tout rôle attribué par erreur ou tout compte inconnu dans l’annuaire.',
          ],
        },
      ],
    },
    {
      id: 'questions-frequentes',
      title: 'Questions fréquentes',
      icon: 'help-circle',
      blocks: [
        {
          type: 'faq',
          items: [
            {
              question: 'Pourquoi le site me demande-t-il un code en plus du mot de passe ?',
              answer:
                'Parce que votre rôle donne accès à des données financières et personnelles. La vérification en deux étapes protège votre compte même si votre mot de passe est deviné. Le code est lu dans l’application d’authentification de votre téléphone.',
            },
            {
              question: 'Puis-je créer le compte d’un responsable d’organisation moi-même ?',
              answer:
                'Non. La personne crée son compte par l’inscription sur le site, ou le super administrateur le crée pour elle. Vous rattachez ensuite ce compte depuis la fiche de l’organisation avec son adresse email.',
            },
            {
              question: 'J’ai fait une faute dans le nom d’une organisation : comment corriger ?',
              answer:
                'Le site ne propose pas de formulaire de modification. Ouvrez la fiche de l’organisation sur la plateforme de formation (Coordination › Organisations) et corrigez-la là.',
            },
            {
              question: 'Puis-je accorder une prise en charge à un participant ?',
              answer:
                'Non. Vous consultez seulement les prises en charge. Transmettez au rôle Finance l’email du bénéficiaire, la formation visée, le pourcentage, le financeur et la date de fin de validité.',
            },
            {
              question:
                'Un apprenant dit avoir payé par Mobile Money mais sa commande reste « En attente ». Que faire ?',
              answer:
                'Ouvrez la commande dans **Finance** › `Commandes` et cliquez sur `Relancer le rapprochement` (paiement en attente depuis plus de 15 minutes). Si le paiement reste non confirmé, transmettez la référence de la commande et le numéro de transaction au rôle Finance.',
            },
            {
              question: 'Puis-je rembourser une commande ?',
              answer:
                'Non, le remboursement est réservé au rôle Finance / contrôle. Vous pouvez en revanche faire émettre ou régénérer le reçu d’une commande réglée.',
            },
            {
              question: 'Que se passe-t-il quand je retire un membre d’une organisation ?',
              answer:
                'Seule l’appartenance (et la responsabilité éventuelle) est retirée. Le compte, ses inscriptions et ses demandes sont conservés. Vous pouvez le rattacher à nouveau plus tard.',
            },
            {
              question: 'Pourquoi une organisation n’apparaît-elle plus dans les listes de choix ?',
              answer:
                'Elle a été désactivée. Retrouvez-la dans **Organisations** avec le filtre **Statut** = Inactives, ouvrez sa fiche et cliquez sur `Réactiver`.',
            },
            {
              question:
                'Le cours que je viens de publier n’est pas sur la page Formations du site.',
              answer:
                'Vérifiez que le cours (et pas seulement sa version) est au statut Publié sur la plateforme, puis attendez jusqu’à 5 minutes : la fiche publique est mise en cache.',
            },
            {
              question:
                'Puis-je supprimer un abonné de la lettre d’information ou exporter la liste ?',
              answer:
                'Non. La page **Newsletter** est en consultation seule pour votre rôle ; le bouton d’export affiché renvoie « Permission insuffisante ». Adressez-vous au responsable services ou à l’éditeur communication.',
            },
            {
              question: 'Je change de téléphone : que faire pour la vérification en deux étapes ?',
              answer:
                'Avant de rendre l’ancien téléphone, ouvrez **Sécurité**, désactivez la vérification avec un code, puis réactivez-la en scannant le QR code avec le nouveau téléphone. Si l’ancien téléphone est déjà perdu, utilisez un code de secours ou demandez la réinitialisation au super administrateur.',
            },
            {
              question: 'Où sont les rapports par cohorte et par organisation ?',
              answer:
                'Sur la plateforme de formation : cliquez sur `Rapports détaillés du LMS` en haut de la page **Rapports** du site. Le site ne propose que les indicateurs globaux et trois exports CSV.',
            },
          ],
        },
      ],
    },
    {
      id: 'lexique',
      title: 'Lexique',
      icon: 'book-open',
      blocks: [
        {
          type: 'definitions',
          items: [
            {
              term: 'Back-office',
              definition:
                'L’espace d’administration du site, réservé au personnel habilité, accessible par **Administration du site** dans le menu du compte.',
            },
            {
              term: 'Vérification en deux étapes (MFA)',
              definition:
                'Protection du compte par un code à 6 chiffres, affiché par une application d’authentification sur le téléphone, demandé en plus du mot de passe.',
            },
            {
              term: 'Application d’authentification',
              definition:
                'Application gratuite (Google Authenticator, Microsoft Authenticator, FreeOTP) qui génère les codes de vérification, même sans connexion Internet.',
            },
            {
              term: 'Codes de secours',
              definition:
                'Codes à usage unique remis à l’activation de la vérification en deux étapes, pour entrer si le téléphone est indisponible.',
            },
            {
              term: 'Organisation affiliée',
              definition:
                'Syndicat membre de la Fédération (case « Organisation affiliée » cochée). Un partenaire est une organisation non affiliée.',
            },
            {
              term: 'Membre',
              definition: 'Compte rattaché à une organisation, sans droit particulier.',
            },
            {
              term: 'Responsable (d’organisation)',
              definition:
                'Membre habilité à déposer les demandes de formation, suivre les participants et consulter les rapports de son organisation sur la plateforme.',
            },
            {
              term: 'Slug',
              definition:
                'Partie de l’adresse web qui identifie une fiche (minuscules, chiffres, tirets), par exemple le sigle de l’organisation en minuscules.',
            },
            {
              term: 'Demande de formation',
              definition:
                'Dossier déposé par le responsable d’une organisation pour former un groupe sur un ou plusieurs modules ; instruit sur la plateforme de formation.',
            },
            {
              term: 'Cohorte',
              definition:
                'Groupe d’apprenants suivant ensemble un module, avec un formateur et des dates ; créée à la planification d’une demande ou directement sur la plateforme.',
            },
            {
              term: 'Prise en charge',
              definition:
                'Pourcentage du montant d’une formation ou d’un événement financé par la Fédération ou une organisation pour un bénéficiaire ; appliqué automatiquement au paiement.',
            },
            {
              term: 'Commande',
              definition:
                'Achat passé sur le site ou la plateforme (formation, événement, service, ressource), avec ses paiements et son statut.',
            },
            {
              term: 'Rapprochement',
              definition:
                'Vérification automatique auprès des fournisseurs des paiements en attente depuis plus de 15 minutes, pour mettre à jour le statut des commandes.',
            },
            {
              term: 'Reçu',
              definition:
                'Justificatif de paiement numéroté REC-AAAA-XXXXXX, généré en PDF après confirmation du paiement.',
            },
            {
              term: 'Webhook',
              definition:
                'Message automatique envoyé par un fournisseur de paiement pour confirmer une transaction ; vérifié par signature avant traitement.',
            },
            {
              term: 'Mobile Money',
              definition:
                'Paiement par porte-monnaie mobile (opérateur téléphonique), confirmé par le fournisseur puis rapproché par la plateforme.',
            },
            {
              term: 'Rôle et portée',
              definition:
                'Un rôle définit ce qu’un compte peut faire ; sa portée est « Globale » (toute la plateforme) ou limitée à une organisation, un cours ou une cohorte.',
            },
            {
              term: 'Export CSV',
              definition:
                'Fichier texte tabulaire (séparateur point-virgule, encodage UTF-8) qui s’ouvre dans un tableur ; chaque export est journalisé.',
            },
            {
              term: 'Journal d’audit',
              definition:
                'Registre des actions sensibles (organisations, membres, médias, exports, reçus) avec leur auteur et leur date ; consultable par le super administrateur.',
            },
            {
              term: 'Médiathèque',
              definition:
                'Bibliothèque des fichiers (images, documents, audio, vidéo) réutilisables dans les contenus du site.',
            },
            {
              term: 'Texte alternatif',
              definition:
                'Phrase qui décrit une image pour les personnes qui utilisent un lecteur d’écran ; obligatoire pour les images informatives.',
            },
            {
              term: 'Lien signé',
              definition:
                'Adresse temporaire qui permet d’ouvrir un fichier privé de la médiathèque sans le rendre public.',
            },
            {
              term: 'Catalogue public',
              definition:
                'Page **Formations** du site, alimentée automatiquement par les cours publiés sur la plateforme de formation.',
            },
            {
              term: 'Politique d’inscription',
              definition:
                'Règle d’accès à un cours : libre en ligne, sur validation de la coordination, réservée aux organisations affiliées, ou après paiement.',
            },
            {
              term: 'Fil d’Ariane',
              definition:
                'Ligne au-dessus du titre (Administration › Organisations › nom) qui indique où vous êtes et permet de remonter.',
            },
          ],
        },
      ],
    },
    {
      id: 'besoin-d-aide',
      title: 'Besoin d’aide ?',
      icon: 'life-buoy',
      blocks: [
        {
          type: 'table',
          caption: 'À qui s’adresser',
          columns: ['Votre problème', 'Interlocuteur'],
          rows: [
            [
              'Connexion impossible, code de vérification refusé, téléphone perdu, rôle manquant, compte à créer ou à désactiver, rôle à attribuer',
              'Le super administrateur (par le formulaire de contact du site, ou le secrétariat général).',
            ],
            [
              'Prise en charge à accorder ou à clôturer, remboursement, export comptable, paiement introuvable',
              'Le rôle Finance / contrôle de la Fédération.',
            ],
            [
              'Contenu à publier sur le site à partir d’un fichier de la médiathèque, liste d’abonnés à la lettre d’information',
              'L’éditeur communication ou le responsable services.',
            ],
            [
              'Demande de formation, cours, cohorte, certificat',
              'Votre propre espace sur la plateforme de formation (guide de la coordination sur la plateforme).',
            ],
            [
              'Panne, message d’erreur répété, page qui ne se charge pas',
              'Le support, par le formulaire de contact du site.',
            ],
          ],
        },
        {
          type: 'list',
          title: 'Dans un message d’aide, indiquez',
          style: 'bullet',
          items: [
            'L’adresse email de votre compte (jamais votre mot de passe ni un code de vérification).',
            'L’écran concerné (par exemple « Organisations › fiche de … › Ajouter un membre ») et l’appareil utilisé (téléphone ou ordinateur, navigateur).',
            'Le message d’erreur exact, recopié tel qu’affiché, et l’heure de l’essai.',
            'La référence concernée : nom de l’organisation, référence de la commande ou de la demande.',
          ],
        },
        {
          type: 'links',
          title: 'Contacter la Fédération',
          items: [
            {
              label: 'Formulaire de contact du site',
              href: '/contact',
              description:
                'Support et demandes d’accès (objet conseillé : « Demande de droits d’accès »).',
              icon: 'mail',
            },
            {
              label: 'Écrire au secrétariat général',
              href: 'mailto:jossngomafm@gmail.com',
              description: 'Adresse email de la Fédération.',
              icon: 'send',
              external: true,
            },
            {
              label: 'Téléphone : 066 23 00 33',
              href: 'tel:+24166230033',
              description: 'Secrétariat de la Fédération, aux heures de bureau.',
              icon: 'phone',
              external: true,
            },
            {
              label: 'Téléphone : 077 52 27 98',
              href: 'tel:+24177522798',
              description: 'Second numéro de la Fédération.',
              icon: 'phone',
              external: true,
            },
            {
              label: 'Espace de coordination sur la plateforme',
              href: '{{lms}}/coordination',
              description: 'Demandes, cohortes, certificats et rapports détaillés.',
              icon: 'graduation-cap',
              external: true,
            },
          ],
        },
        {
          type: 'paragraph',
          text: 'Adresse postale : Fédération des Travailleurs du Gabon (FETRAG), BP 1234 Libreville, Gabon.',
        },
      ],
    },
  ],
  related: [
    {
      label: 'Guide du membre',
      href: '/espace/guide',
      description: 'Votre compte, votre profil, vos notifications et votre sécurité sur le site.',
    },
    {
      label: 'Guide de la coordination sur la plateforme de formation',
      href: '{{lms}}/coordination/guide',
      description:
        'Demandes de formation, cours, cohortes, sessions, certificats et rapports détaillés.',
      external: true,
    },
  ],
}
