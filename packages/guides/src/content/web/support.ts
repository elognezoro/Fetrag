import type { Guide } from '@fetrag/contracts'

/**
 * Guide du support (site institutionnel, rôle SUPPORT).
 *
 * Périmètre vérifié dans le code : back-office `/admin` limité aux entrées Tableau de bord, Demandes,
 * Messages reçus, Newsletter, Utilisateurs et rôles (lecture), Organisations (lecture). Aucune action
 * d’écriture sur les comptes (users.manage et roles.manage réservés au super administrateur), aucun
 * accès à la finance, aux rapports, au journal d’audit ni aux contenus.
 */
export const webSupport: Guide = {
  id: 'web-support',
  platform: 'web',
  role: 'SUPPORT',
  title: 'Guide du support',
  subtitle: 'Répondre aux messages et accompagner les utilisateurs',
  audience:
    'Ce guide s’adresse aux personnes de la Fédération chargées de l’assistance de premier niveau : répondre aux messages reçus, faire avancer les demandes de service et aider les utilisateurs qui n’arrivent pas à se connecter.',
  summary:
    'Avec le rôle Support, vous lisez et traitez les messages envoyés depuis le site, vous prenez en charge les demandes de service et vous consultez les fiches des comptes et des organisations pour comprendre un problème. Vous ne modifiez jamais un compte, un paiement ou un certificat : vous orientez vers le bon interlocuteur. Ce guide décrit chaque écran, chaque statut et la marche à suivre pour les problèmes les plus fréquents.',
  tone: 'green',
  icon: 'headphones',
  readingMinutes: 45,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée.',
    'Le rôle **Support** attribué par le super administrateur (il apparaît en bas du menu du back-office).',
    'Une messagerie (email) fonctionnelle sur votre appareil : les réponses aux messages partent depuis votre messagerie, pas depuis le site.',
    'Un téléphone ou un ordinateur connecté à Internet ; une application d’authentification est recommandée pour protéger votre compte.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'page **Connexion**, bouton en bas du formulaire',
      result: 'Votre espace personnel s’ouvre.',
    },
    {
      text: 'Ouvrez le menu de votre compte puis cliquez sur **Administration du site**.',
      where: 'vos initiales, en haut à droite de la page',
      result: 'Le tableau de bord du back-office s’affiche avec le badge **Support** en bas du menu.',
    },
    {
      text: 'Ouvrez **Messages reçus** et lisez les messages marqués **Nouveau**.',
      where: 'menu de gauche, rubrique « Relations » (sur mobile : bouton **Ouvrir la navigation**, trois traits en haut à gauche)',
      result: 'La boîte de réception s’affiche ; les lignes nouvelles sont surlignées en jaune.',
    },
    {
      text: 'Ouvrez **Demandes** et repérez les demandes de service **Nouvelle** ou en retard.',
      where: 'menu de gauche, rubrique « Services »',
      result: 'La liste des demandes s’affiche avec leur échéance.',
    },
    {
      text: 'Activez la vérification en deux étapes sur votre propre compte.',
      where: 'menu du compte > **Sécurité**',
      result: 'Le badge **Vérification en deux étapes active** apparaît.',
      note: 'Recommandé pour le rôle Support, même si l’application ne l’impose pas.',
    },
  ],
  sections: [
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'headphones',
      summary: 'Ce que le rôle Support vous permet de faire, ce qu’il ne permet pas, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous êtes le premier interlocuteur des personnes qui écrivent à la Fédération ou qui rencontrent un problème avec leur compte. Votre travail se fait dans le **back-office** (l’espace d’administration du site institutionnel) et par votre messagerie. Vous consultez, vous orientez, vous répondez ; vous ne modifiez pas les comptes.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Lire tous les messages envoyés depuis le site (contact, adhésion, partenariat, assistance), les attribuer, changer leur statut et les répondre par email.',
            'Lire toutes les demandes de service, les attribuer, changer leur statut avec un commentaire envoyé au demandeur, et y ajouter une note interne.',
            'Retrouver n’importe quel compte (site et plateforme de formation) et lire sa fiche : état du compte, adresse confirmée ou non, vérification en deux étapes, dernières connexions, inscriptions, commandes.',
            'Consulter la liste et la fiche des organisations (syndicats affiliés et partenaires).',
            'Consulter les abonnés à la lettre d’information et exporter des listes au format CSV (tableur).',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire',
          style: 'bullet',
          items: [
            'Créer, désactiver ou réactiver un compte, réinitialiser la vérification en deux étapes, définir un mot de passe temporaire, attribuer ou retirer un rôle : réservé au super administrateur.',
            'Supprimer une demande de service ou modifier le catalogue des services : réservé au Responsable services.',
            'Voir le détail des paiements, confirmer ou rembourser une commande : réservé à Finance / contrôle.',
            'Émettre ou révoquer un certificat, gérer les cohortes, les inscriptions et les demandes de formation : réservé à la Coordination sur la plateforme de formation.',
            'Modifier les pages, actualités, FAQ et médias du site : réservé à l’Éditeur communication.',
            'Consulter les rapports d’audience, le journal d’audit ou les paramètres du site.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Interlocuteur', 'Ce qu’il fait', 'Quand le solliciter'],
          rows: [
            ['Super administrateur', 'Comptes, rôles, sécurité, paramètres', 'Compte désactivé, vérification en deux étapes perdue, rôle manquant'],
            ['Responsable services', 'Catalogue des services, fond des demandes', 'Question sur le traitement d’une demande, suppression d’une demande'],
            ['Finance / contrôle', 'Commandes, paiements, reçus, remboursements', 'Paiement effectué mais non visible, double débit, reçu manquant'],
            ['Coordination', 'Formations, cohortes, certificats', 'Inscription bloquée, certificat introuvable ou contesté'],
            ['Éditeur communication', 'Contenus du site', 'Erreur sur une page, message de type Contact ou Partenariat à traiter sur le fond'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Assistance sans accès au dossier pédagogique',
          text: 'Vous ne voyez ni les réponses aux évaluations, ni les devoirs, ni les forums des apprenants. C’est voulu : le support aide à accéder au service, il ne juge pas le travail des apprenants.',
        },
      ],
    },
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer',
      icon: 'log-in',
      summary: 'Se connecter, protéger son compte et se déconnecter correctement.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une seule identité sert pour le site institutionnel et la plateforme de formation. Le rôle **Support** ne s’applique qu’au site institutionnel : sur la plateforme de formation, vous êtes un apprenant comme les autres.',
        },
        {
          type: 'steps',
          title: 'Se connecter',
          items: [
            {
              text: 'Ouvrez la page de connexion.',
              where: 'lien **Connexion** dans le menu du site (sur mobile : bouton **Menu**, trois traits en haut à droite)',
              result: 'Le formulaire « Bienvenue à la FETRAG » s’affiche.',
            },
            {
              text: 'Saisissez votre **Adresse email** et votre **Mot de passe**.',
              note: 'Les deux champs sont obligatoires. L’icône en forme d’œil affiche le mot de passe pour vérifier la saisie.',
            },
            {
              text: 'Cliquez sur `Se connecter`.',
              where: 'en bas du formulaire',
              result: 'Votre espace personnel s’ouvre. Si votre compte est protégé par la vérification en deux étapes, un champ **Code de vérification** apparaît d’abord.',
            },
            {
              text: 'Si le champ **Code de vérification** s’affiche, saisissez le code à 6 chiffres de votre application d’authentification puis cliquez sur `Vérifier et se connecter`.',
              note: 'Un code de secours (donné lors de l’activation) fonctionne aussi, une seule fois.',
              result: 'Votre espace personnel s’ouvre.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Activer la vérification en deux étapes (recommandé)',
          intro:
            'La vérification en deux étapes (aussi appelée MFA) demande un code temporaire en plus du mot de passe. Elle n’est pas obligatoire pour le rôle Support, mais vous consultez des données personnelles : activez-la.',
          items: [
            {
              text: 'Installez une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator ou FreeOTP).',
              note: 'Ces applications sont gratuites et fonctionnent sans connexion Internet une fois installées.',
            },
            {
              text: 'Ouvrez **Sécurité**.',
              where: 'menu du compte (vos initiales en haut à droite) ou menu de gauche de votre espace personnel',
              result: 'La page « Protéger mon compte » s’affiche avec le badge **Vérification en deux étapes inactive**.',
            },
            {
              text: 'Cliquez sur `Activer la vérification en deux étapes`.',
              result: 'Un QR code (carré à scanner) apparaît.',
            },
            {
              text: 'Scannez le QR code avec l’application d’authentification, puis saisissez le code dans le champ **Code à 6 chiffres affiché par l’application**.',
              result: 'La liste de vos codes de secours s’affiche.',
            },
            {
              text: 'Cliquez sur `Copier les codes` et conservez-les en lieu sûr (hors du téléphone).',
              note: 'Chaque code de secours permet de vous connecter une seule fois si vous perdez votre téléphone.',
              result: 'Le badge **Vérification en deux étapes active** apparaît.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Se déconnecter',
          items: [
            {
              text: 'Ouvrez le menu de votre compte puis cliquez sur **Déconnexion**.',
              where: 'vos initiales, en haut à droite ; dernière entrée du menu',
              result: 'La page de connexion affiche « Vous avez été déconnecté. »',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Appareil partagé',
          text: 'Déconnectez-vous toujours après avoir consulté le back-office sur un ordinateur ou un téléphone qui n’est pas le vôtre. Les fiches que vous ouvrez contiennent des données personnelles.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Adresse email ou mot de passe incorrect. » s’affiche.',
              cause: 'Faute de frappe, majuscules ou mot de passe oublié.',
              solution: 'Vérifiez l’adresse, puis utilisez le lien **Mot de passe oublié ?** sous le formulaire. Le lien reçu par email est valable 30 minutes.',
            },
            {
              problem: 'Le lien **Administration du site** n’apparaît pas dans le menu du compte.',
              cause: 'Le rôle Support n’est pas (ou plus) attribué à votre compte, ou il a expiré.',
              solution: 'Demandez au super administrateur de vérifier vos rôles.',
            },
            {
              problem: 'La page « Accès refusé » s’affiche en ouvrant une page du back-office.',
              cause: 'Cette page exige une permission que le rôle Support n’a pas (Finance, Rapports, Journal d’audit, Paramètres, Contenus, création de compte).',
              solution: 'Revenez au tableau de bord avec `Aller à mon espace` ou le menu. Ce n’est pas une panne.',
            },
          ],
        },
      ],
    },
    {
      id: 'se-reperer',
      title: 'Se repérer dans le back-office',
      icon: 'compass',
      summary: 'Le tableau de bord, le menu et la barre du haut, sur ordinateur et sur mobile.',
      blocks: [
        {
          type: 'path',
          label: 'Chemin d’accès',
          items: ['Vos initiales (en haut à droite)', 'Administration du site', 'Tableau de bord'],
          href: '/admin',
        },
        {
          type: 'screen',
          title: 'Le tableau de bord',
          description: 'La page d’accueil du back-office. Avec le rôle Support, elle ne montre que les blocs qui vous concernent.',
          areas: [
            {
              name: 'Menu de gauche (ordinateur)',
              purpose:
                'Barre bleu marine avec les rubriques : « Pilotage » > **Tableau de bord** ; « Services » > **Demandes** ; « Relations » > **Messages reçus**, **Newsletter** ; « Administration » > **Utilisateurs et rôles**, **Organisations**. Un chiffre à côté de **Demandes** et de **Messages reçus** indique ce qui attend d’être traité.',
              icon: 'menu',
            },
            {
              name: 'Bouton « Ouvrir la navigation » (mobile et petits écrans)',
              purpose:
                'Le menu de gauche disparaît sous une certaine largeur. Le bouton à trois traits, en haut à gauche de la barre du haut, ouvre un tiroir avec le même menu. Le tiroir se ferme seul quand vous changez de page, ou avec le bouton **Fermer la navigation**.',
              icon: 'smartphone',
            },
            {
              name: 'Barre du haut',
              purpose:
                'Le titre de la section en cours (« Tableau de bord », « Demandes », « Messages reçus »...) et le lien **Voir le site**, qui ouvre le site dans un nouvel onglet (masqué sur mobile).',
              icon: 'layout-dashboard',
            },
            {
              name: 'Pied du menu',
              purpose: 'Votre nom, votre adresse email et le badge de rôle **Support**. Le lien **Coordination LMS** qui s’y trouve mène à un espace réservé à la coordination : il vous affichera « Accès refusé ».',
              icon: 'user',
            },
            {
              name: 'Tuile « Demandes de service en cours »',
              purpose: 'Nombre de demandes Nouvelle, En examen et En traitement, avec le nombre de nouvelles en dessous.',
              icon: 'clipboard-list',
            },
            {
              name: 'Carte « Dernières demandes de service »',
              purpose: 'Les six demandes les plus récentes avec leur référence SRV, le nom du demandeur et leur statut. Le lien **Toutes les demandes** ouvre la liste complète.',
              icon: 'list-checks',
            },
            {
              name: 'Carte « Messages reçus »',
              purpose: 'Les six derniers messages avec leur statut. Le lien **Boîte de réception** ouvre la liste complète.',
              icon: 'inbox',
            },
            {
              name: 'Boutons du bas de page',
              purpose: '**Utilisateurs** ouvre l’annuaire des comptes ; **Voir le site** ouvre le site dans un nouvel onglet.',
              icon: 'users',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Une liste (messages, demandes, utilisateurs, organisations)',
          description: 'Toutes les listes du back-office ont la même organisation.',
          areas: [
            {
              name: 'Tuiles de comptage',
              purpose: 'En haut : le nombre d’éléments par état (par exemple « Nouveaux », « Attribués », « Répondus », « Clôturés »). Ces chiffres ne changent pas avec les filtres.',
              icon: 'bar-chart',
            },
            {
              name: 'Barre de filtres',
              purpose:
                'Un champ **Rechercher**, des listes déroulantes (statut, type, responsable...) puis les boutons `Filtrer` et `Réinitialiser`. Sur mobile, les champs sont empilés et les boutons prennent toute la largeur.',
              icon: 'filter',
            },
            {
              name: 'Tableau',
              purpose:
                'Une ligne par élément ; le premier texte de chaque ligne est un lien qui ouvre la fiche. Sur mobile, certaines colonnes sont masquées : le statut est alors rappelé sous le titre, et le tableau se fait glisser vers la gauche avec le doigt.',
              icon: 'table',
            },
            {
              name: 'Pagination',
              purpose: 'En bas : « N résultat(s) · 20 par page » et les liens vers les pages suivantes.',
              icon: 'chevron-right',
            },
            {
              name: 'Bouton « Exporter (CSV) »',
              purpose: 'En haut à droite des listes de messages, de demandes et de la newsletter : télécharge la liste filtrée dans un fichier lisible par un tableur.',
              icon: 'download',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Page « Élément introuvable »',
          text: 'Si un lien mène à « Ce contenu, cette demande ou cet utilisateur n’existe pas ou a été supprimé. », l’élément a été supprimé ou le lien est incomplet. Cliquez sur `Retour au tableau de bord`.',
        },
      ],
    },
    {
      id: 'traiter-un-message-recu',
      title: 'Comment traiter un message reçu',
      icon: 'inbox',
      summary: 'Lire, attribuer, répondre par email et classer les messages envoyés depuis le site.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La boîte **Messages reçus** rassemble les formulaires envoyés depuis le site : contact, demande d’adhésion ou d’information, proposition de partenariat, assistance. Chaque message reçoit une référence de la forme MSG-AAAA-XXXXXX et son expéditeur a reçu un accusé de réception automatique.',
        },
        {
          type: 'path',
          label: 'Chemin d’accès',
          items: ['Menu de gauche', 'Relations', 'Messages reçus'],
          href: '/admin/messages',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'La réponse part de votre messagerie',
          text: 'Le site n’envoie pas votre réponse à l’expéditeur. Le bouton `Répondre par email` ouvre simplement votre application de messagerie avec l’objet pré-rempli. Un changement de statut ne prévient jamais l’expéditeur.',
        },
      ],
      subsections: [
        {
          id: 'messages-trouver',
          title: 'Trouver les messages à traiter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Messages reçus**.',
                  where: 'menu de gauche, rubrique « Relations » (sur mobile : bouton **Ouvrir la navigation**)',
                  result: 'La boîte de réception s’affiche avec les tuiles **Nouveaux**, **Attribués**, **Répondus**, **Clôturés**.',
                },
                {
                  text: 'Dans la liste **Statut**, choisissez **Nouveau**.',
                  where: 'barre de filtres, sous les tuiles',
                },
                {
                  text: 'Si vous cherchez uniquement les demandes d’aide, choisissez **Assistance** dans la liste **Type**.',
                  note: 'Les demandes d’aide envoyées depuis la page Contact du site arrivent avec le type **Contact** : consultez aussi ce type.',
                },
                {
                  text: 'Cliquez sur `Filtrer`.',
                  result: 'Seuls les messages correspondants restent affichés ; les lignes **Nouveau** sont surlignées en jaune et en gras.',
                },
                {
                  text: 'Pour retrouver un message précis, tapez sa référence, le nom, l’email ou un mot de l’objet dans **Rechercher**, puis cliquez sur `Filtrer`.',
                  note: 'La recherche est limitée à 200 caractères et ne tient pas compte des majuscules.',
                },
                {
                  text: 'Pour revenir à la liste complète, cliquez sur `Réinitialiser`.',
                  where: 'à côté de `Filtrer` (visible seulement quand un filtre est actif)',
                },
              ],
            },
          ],
        },
        {
          id: 'messages-lire-attribuer',
          title: 'Lire un message et se l’attribuer',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur l’objet du message.',
                  where: 'première colonne du tableau',
                  result: 'La fiche du message s’ouvre : nom de l’expéditeur, email, téléphone, type de formulaire et texte complet.',
                },
                {
                  text: 'Lisez la carte **Informations complémentaires** si elle est présente (organisation, secteur, fonction, intérêt, origine...).',
                  note: 'Les valeurs vides sont affichées « — ».',
                },
                {
                  text: 'Si un lien **compte {nom}** apparaît sous l’email, cliquez dessus pour ouvrir la fiche du compte de l’expéditeur.',
                  note: 'Ce lien n’existe que si la personne était connectée au moment de l’envoi.',
                  result: 'La fiche utilisateur s’ouvre dans la même fenêtre ; utilisez le bouton Retour du navigateur pour revenir au message.',
                },
                {
                  text: 'Dans le panneau **Attribution**, choisissez votre nom dans la liste **Responsable**.',
                  where: 'colonne de droite sur ordinateur ; sous le message sur mobile',
                },
                {
                  text: 'Cliquez sur `Enregistrer`.',
                  result: 'Le message vert « Message attribué. » apparaît. Un message **Nouveau** passe automatiquement au statut Attribué (le badge coloré affiche « Assigné »).',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              text: 'Attribuez-vous un message avant d’y répondre : vos collègues voient ainsi qu’il est pris en charge et ne répondent pas deux fois.',
            },
          ],
        },
        {
          id: 'messages-repondre',
          title: 'Répondre et classer le message',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur `Répondre par email`.',
                  where: 'panneau **Traitement**, bouton bleu',
                  result: 'Votre messagerie s’ouvre avec l’adresse de l’expéditeur et l’objet « [FETRAG MSG-AAAA-XXXXXX] Votre message ».',
                  note: 'Sur un téléphone, c’est l’application de messagerie du téléphone qui s’ouvre.',
                },
                {
                  text: 'Rédigez votre réponse dans votre messagerie et envoyez-la.',
                  note: 'Gardez la référence MSG dans l’objet : l’expéditeur la retrouve dans son accusé de réception.',
                },
                {
                  text: 'Revenez sur la fiche du message et cliquez sur `Marquer répondu`.',
                  where: 'panneau **Traitement**',
                  result: 'Le message vert « Message MSG-… mis à jour. » apparaît et la date « répondu le » s’affiche dans l’en-tête.',
                },
                {
                  text: 'Quand l’échange est terminé, cliquez sur `Clôturer`.',
                  result: 'Le badge passe à **Clôturé**.',
                },
                {
                  text: 'Pour un message publicitaire ou frauduleux, cliquez sur `Indésirable`.',
                  where: 'panneau **Traitement**, bouton rouge',
                  result: 'Le badge passe à **Indésirable**.',
                },
                {
                  text: 'En cas d’erreur de classement, cliquez sur `Remettre en nouveau`.',
                  note: 'Tous les changements de statut sont possibles, dans n’importe quel ordre.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Les statuts d’un message',
              items: [
                { label: 'Nouveau', tone: 'warning', meaning: 'Message reçu et non traité. Compté dans le chiffre à côté de **Messages reçus**.', next: 'Lisez-le et attribuez-le.' },
                {
                  label: 'Attribué (badge « Assigné »)',
                  tone: 'info',
                  meaning: 'Un responsable est désigné. Le filtre, la tuile et le fichier CSV disent « Attribué » ; le badge coloré affiche « Assigné ». C’est le même statut.',
                  next: 'Répondez par email.',
                },
                { label: 'Répondu', tone: 'success', meaning: 'La réponse a été envoyée et le message marqué répondu ; la date apparaît aussi dans l’espace personnel de l’expéditeur.', next: 'Clôturez quand l’échange est fini.' },
                { label: 'Clôturé', tone: 'neutral', meaning: 'Échange terminé.', next: 'Peut être supprimé si nécessaire.' },
                { label: 'Indésirable', tone: 'danger', meaning: 'Message publicitaire ou piégé. Les messages détectés automatiquement arrivent déjà dans cet état.', next: 'Peut être supprimé.' },
              ],
            },
          ],
        },
        {
          id: 'messages-supprimer',
          title: 'Supprimer un message',
          blocks: [
            {
              type: 'callout',
              tone: 'danger',
              title: 'Suppression définitive',
              text: 'Un message supprimé ne peut pas être récupéré. Ne supprimez que les messages indésirables ou les messages clôturés dont l’expéditeur demande l’effacement de ses données.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Vérifiez que le message est au statut **Indésirable** ou **Clôturé**.',
                  note: 'Le bouton de suppression refuse tout autre statut : « Seuls les messages indésirables ou clôturés peuvent être supprimés ».',
                },
                {
                  text: 'Cliquez sur `Supprimer le message`.',
                  where: 'bouton rouge en bas du panneau de droite (en bas de la page sur mobile)',
                  result: 'La fenêtre « Supprimer le message MSG-… ? » s’ouvre.',
                },
                {
                  text: 'Cliquez sur `Supprimer` pour confirmer, ou sur `Annuler`.',
                  result: 'Vous revenez à la liste avec le message vert « Message supprimé. »',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Attribution invalide. » ou « Responsable invalide » s’affiche.',
                  cause: 'La personne choisie n’est plus active ou la page était ouverte depuis longtemps.',
                  solution: 'Rechargez la page, puis recommencez l’attribution.',
                },
                {
                  problem: 'Le bouton `Répondre par email` ne fait rien.',
                  cause: 'Aucune application de messagerie n’est configurée sur l’appareil.',
                  solution: 'Copiez l’adresse email affichée dans la fiche et écrivez depuis votre messagerie habituelle, en indiquant la référence MSG dans l’objet.',
                },
                {
                  problem: 'Le message « L’opération a échoué. Réessayez dans quelques instants. » apparaît.',
                  cause: 'Problème passager de connexion ou de serveur.',
                  solution: 'Attendez quelques secondes et recommencez. Si le problème persiste, signalez-le au super administrateur.',
                },
                {
                  problem: 'L’expéditeur dit ne pas avoir reçu ma réponse.',
                  cause: 'La réponse est partie de votre messagerie, pas du site : le site ne peut pas la suivre.',
                  solution: 'Vérifiez le dossier « Envoyés » de votre messagerie et l’orthographe de l’adresse ; demandez à la personne de regarder son dossier de courrier indésirable.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'traiter-une-demande-de-service',
      title: 'Comment traiter une demande de service',
      icon: 'clipboard-list',
      summary: 'Prendre en charge une demande déposée depuis le catalogue des services, la faire avancer et informer le demandeur.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les demandes de service (assistance juridique, médiation, accompagnement...) sont déposées depuis le catalogue du site. Chaque demande porte une référence SRV-AAAA-XXXXXX, un statut, un délai indicatif de traitement et, pour un service payant, une commande. Contrairement aux messages, un changement de statut prévient le demandeur par email.',
        },
        {
          type: 'path',
          label: 'Chemin d’accès',
          items: ['Menu de gauche', 'Services', 'Demandes'],
          href: '/admin/demandes',
        },
      ],
      subsections: [
        {
          id: 'demandes-trouver',
          title: 'Trouver les demandes à traiter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Demandes**.',
                  where: 'menu de gauche, rubrique « Services » (le chiffre à côté indique les demandes Nouvelle et En examen)',
                  result: 'La liste s’affiche avec les tuiles **Nouvelles**, **En examen ou en traitement**, **Traitées**, **Demandes ouvertes**.',
                },
                {
                  text: 'Dans la liste **Statut**, choisissez **Nouvelle**, puis cliquez sur `Filtrer`.',
                  result: 'Les demandes non encore attribuées s’affichent, surlignées en jaune.',
                },
                {
                  text: 'Pour voir vos propres dossiers, choisissez **Mes demandes** dans la liste **Responsable**, puis cliquez sur `Filtrer`.',
                },
                {
                  text: 'Regardez la colonne **Échéance** : un badge orange signale une demande à traiter sous deux jours, un badge rouge une échéance dépassée.',
                  note: 'Sur mobile, cette colonne est masquée : ouvrez la demande pour voir son délai. Le tableau se fait glisser vers la gauche.',
                },
                {
                  text: 'Regardez la colonne **Paiement** pour un service payant : **Commande liée** (réglé) ou **En attente** (non réglé).',
                  note: 'Une demande payante non réglée n’est traitée qu’après confirmation du paiement.',
                },
              ],
            },
          ],
        },
        {
          id: 'demandes-lire-attribuer',
          title: 'Lire une demande et l’attribuer',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur le nom du service dans la colonne **Demande**.',
                  result: 'La fiche s’ouvre : « Demande SRV-… déposée le … par {nom} », avec un grand badge de statut.',
                },
                {
                  text: 'Lisez la carte **Demandeur** : nom, lien **Compte : {email}** (ou « Sans compte »), téléphone, organisation, message.',
                },
                {
                  text: 'Lisez la carte **Informations saisies** : les champs propres au service demandé.',
                },
                {
                  text: 'Pour un service payant, lisez la carte **Paiement** : « Commande CMD-… · montant » avec le statut de la commande, ou « aucune commande réglée n’est encore associée ».',
                  note: 'Le détail de la commande n’est pas accessible avec le rôle Support.',
                },
                {
                  text: 'Lisez la carte **Historique** : chaque changement de statut avec sa date et le commentaire envoyé au demandeur.',
                },
                {
                  text: 'Dans le panneau **Attribution**, choisissez le responsable dans la liste **Responsable** (vous-même ou un Responsable services).',
                  where: 'colonne de droite sur ordinateur ; sous les cartes sur mobile',
                },
                {
                  text: 'Cliquez sur `Enregistrer l’attribution`.',
                  result: 'Le message vert « Demande SRV-… attribuée à … » apparaît. Une demande **Nouvelle** passe automatiquement **En examen**. Le responsable désigné reçoit une notification interne.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Choisissez un responsable habilité',
              text: 'Seuls les comptes actifs ayant le rôle Responsable services, Support ou Super administrateur peuvent être responsables d’une demande. La liste peut proposer d’autres membres de l’équipe : les choisir provoque l’erreur « Le responsable désigné doit avoir le rôle Responsable services ou Support ».',
            },
          ],
        },
        {
          id: 'demandes-changer-statut',
          title: 'Changer le statut et informer le demandeur',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans le panneau **Changer le statut**, choisissez le **Nouveau statut**.',
                  note: 'La liste ne propose que les transitions autorisées depuis le statut actuel (rappelé sous la liste : « Statut actuel : … »).',
                },
                {
                  text: 'Rédigez le **Commentaire pour le demandeur** : ce qui a été fait, ce qui est attendu de lui, ou le motif d’un refus.',
                  note: 'Facultatif, 3 000 caractères maximum. Ce texte est envoyé par email au demandeur et conservé dans l’historique : restez factuel et courtois.',
                },
                {
                  text: 'Cliquez sur `Appliquer le statut`.',
                  result: 'Le message vert « Demande SRV-… mise à jour ; le demandeur est informé par email. » apparaît, et l’historique affiche la nouvelle ligne.',
                  note: 'Si la demande n’avait pas de responsable, vous en devenez responsable automatiquement.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'danger',
              title: 'Clôturée = définitif',
              text: 'Une demande **Clôturée** ne peut plus changer de statut : le panneau affiche « Cette demande est clôturée : aucune transition n’est possible. » Ne clôturez qu’une fois l’échange réellement terminé. Une demande **Traitée** peut, elle, revenir En traitement.',
            },
            {
              type: 'table',
              caption: 'Transitions autorisées',
              columns: ['Depuis', 'Vers'],
              rows: [
                ['Nouvelle', 'En examen, En traitement, Refusée, Clôturée'],
                ['En examen', 'En traitement, Traitée, Refusée, Clôturée'],
                ['En traitement', 'Traitée, Refusée, Clôturée'],
                ['Traitée', 'Clôturée, En traitement'],
                ['Refusée', 'Clôturée, En examen'],
                ['Clôturée', 'Aucune (état final)'],
              ],
            },
            {
              type: 'statuses',
              title: 'Les statuts d’une demande de service',
              items: [
                { label: 'Nouvelle', tone: 'warning', meaning: 'Déposée, sans responsable.', next: 'Attribuez-la.' },
                { label: 'En examen', tone: 'info', meaning: 'Attribuée ou en cours d’analyse. Statut automatique après une attribution.', next: 'Vérifiez le dossier, passez En traitement.' },
                { label: 'En traitement', tone: 'info', meaning: 'Le responsable travaille sur la demande.', next: 'Passez à Traitée ou Refusée avec un commentaire.' },
                { label: 'Traitée', tone: 'success', meaning: 'Une réponse a été apportée. L’échéance n’est plus affichée.', next: 'Clôturez, ou revenez En traitement si le demandeur revient.' },
                { label: 'Refusée', tone: 'danger', meaning: 'La demande ne peut pas aboutir (expliquez pourquoi dans le commentaire).', next: 'Clôturez, ou revenez En examen.' },
                { label: 'Clôturée', tone: 'neutral', meaning: 'État final, plus aucune modification.', next: 'Seul le Responsable services peut la supprimer.' },
                { label: 'N j restants / Échéance aujourd’hui / Échéance dépassée', tone: 'warning', meaning: 'Délai indicatif = date de dépôt + délai du service. Orange à deux jours ou moins, rouge si dépassé.', next: 'Traitez en priorité les badges rouges et orange.' },
              ],
            },
          ],
        },
        {
          id: 'demandes-note-interne',
          title: 'Ajouter une note interne',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans le panneau **Note interne**, écrivez vos vérifications, les appels passés ou les pièces manquantes dans le champ **Note**.',
                  note: 'Facultatif, 5 000 caractères maximum. Visible uniquement par l’équipe : jamais transmise au demandeur.',
                },
                {
                  text: 'Cliquez sur `Enregistrer la note`.',
                  result: 'Le message vert « Note interne enregistrée. » apparaît.',
                  note: 'Pour effacer la note, videz le champ puis enregistrez.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Transition « X » vers « Y » non autorisée » s’affiche.',
                  cause: 'Le statut a changé entre l’ouverture de la page et votre clic (un collègue a agi).',
                  solution: 'Rechargez la page et choisissez un statut dans la nouvelle liste.',
                },
                {
                  problem: 'Le message « Vous n’avez pas accès à cette demande » s’affiche.',
                  cause: 'Votre rôle a changé ou a expiré pendant votre session.',
                  solution: 'Déconnectez-vous, reconnectez-vous, puis contactez le super administrateur si le problème persiste.',
                },
                {
                  problem: 'Le bouton `Supprimer la demande` n’apparaît pas.',
                  cause: 'La suppression est réservée au Responsable services (et seulement pour une demande Clôturée ou Refusée).',
                  solution: 'Transmettez la référence SRV au Responsable services.',
                },
                {
                  problem: 'Le demandeur dit ne pas avoir reçu l’email de changement de statut.',
                  cause: 'Email arrivé dans le courrier indésirable, ou adresse mal saisie lors du dépôt.',
                  solution: 'Vérifiez l’adresse dans la carte **Demandeur**. Rappelez-lui qu’il peut suivre sa demande dans **Mes demandes** de son espace personnel (s’il a un compte).',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'retrouver-un-compte',
      title: 'Comment retrouver un compte et lire sa fiche',
      icon: 'users',
      summary: 'L’annuaire des comptes et la fiche utilisateur, en lecture seule.',
      blocks: [
        {
          type: 'path',
          label: 'Chemin d’accès',
          items: ['Menu de gauche', 'Administration', 'Utilisateurs et rôles'],
          href: '/admin/utilisateurs',
        },
        {
          type: 'paragraph',
          text: 'L’annuaire contient tous les comptes, qu’ils aient été créés sur le site ou sur la plateforme de formation. Avec le rôle Support, vous consultez uniquement : le panneau **Compte** de chaque fiche indique « Consultation seule. »',
        },
        {
          type: 'steps',
          title: 'Rechercher un compte',
          items: [
            {
              text: 'Ouvrez **Utilisateurs et rôles**.',
              where: 'menu de gauche, rubrique « Administration » (ou bouton `Utilisateurs` en bas du tableau de bord)',
              result: 'L’annuaire s’affiche avec les tuiles **Comptes enregistrés**, **Apprenants**, **Équipe pédagogique**, **Équipe d’administration**.',
            },
            {
              text: 'Tapez l’adresse email exacte de la personne dans **Rechercher** (ou son nom, ou son employeur).',
              note: 'La recherche ne tient pas compte des majuscules. Préférez l’email : c’est l’identifiant du compte.',
            },
            {
              text: 'Cliquez sur `Filtrer`.',
              result: 'La liste ne montre plus que les comptes correspondants. « Aucun utilisateur » signifie qu’aucun compte n’existe avec ces éléments.',
            },
            {
              text: 'Au besoin, affinez avec les listes **Rôle**, **Statut** (Actifs / Désactivés) et **Organisation**.',
            },
            {
              text: 'Cliquez sur le nom de la personne.',
              where: 'colonne **Utilisateur**',
              result: 'La fiche du compte s’ouvre.',
              note: 'Sur mobile, seules les colonnes **Utilisateur** et **Rôles** sont visibles : l’état du compte se lit dans la fiche.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Lire la fiche d’un compte',
          items: [
            {
              text: 'Lisez l’en-tête : nom, email, date de création, dernière connexion (ou « jamais connecté ») et les badges **Compte actif** / **Compte désactivé** et **MFA active**.',
            },
            {
              text: 'Dans la carte **Profil**, vérifiez la mention **Vérifié le …** ou **Adresse non vérifiée**, puis **Mot de passe local défini** ou **Aucun mot de passe local (fournisseur externe)**.',
              note: 'Le nombre de sessions ouvertes est indiqué à la fin de la carte.',
            },
            {
              text: 'Dans la carte **Rôles et portées**, lisez les rôles et leur portée (**Globale**, **Organisation**, **Cours**, **Cohorte**) et leur expiration (**Sans limite**, **Jusqu’au …**, **Expiré le …**).',
              note: 'Un rôle expiré n’accorde plus aucun droit : c’est une cause fréquente de « Accès refusé ».',
            },
            {
              text: 'Dans la carte **Organisations**, repérez les organisations rattachées et le badge **Responsable** ou **Membre**. Le nom de l’organisation est un lien vers sa fiche.',
            },
            {
              text: 'Dans la carte **Inscriptions à la formation**, lisez le statut de chaque inscription (En attente, Actif, Terminé, Suspendue, Annulé, Expirée) et la progression.',
            },
            {
              text: 'Dans la carte **Commandes**, lisez la référence CMD-…, le montant et le statut (En attente, Payée, Échoué, Annulé, Remboursé, Partiellement remboursée).',
              note: 'La référence est un simple texte : le détail des commandes est réservé à Finance / contrôle.',
            },
            {
              text: 'Dans la carte **Consentements**, lisez le dernier état enregistré pour chaque type (type, version, date) avec le badge **Accordé** ou **Refusé**.',
              note: 'Cette carte est en lecture seule : aucune action n’est possible depuis la fiche.',
            },
            {
              text: 'Dans la carte **Dernières connexions**, lisez les dix derniers événements : **Connexion**, **Échec de connexion**, **Mot de passe modifié**, **MFA activée**, avec la date et le navigateur.',
              note: 'Les adresses IP ne sont pas affichées en clair.',
            },
            {
              text: 'Dans le panneau **Compte**, lisez les compteurs **Inscriptions**, **Certificats**, **Commandes**, **Demandes**.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les états d’un compte',
          items: [
            { label: 'Compte actif', tone: 'success', meaning: 'Le compte peut se connecter.' },
            { label: 'Compte désactivé', tone: 'danger', meaning: 'Le compte ne peut plus se connecter ; toutes ses sessions ont été fermées.', next: 'Réactivation par le super administrateur uniquement.' },
            { label: 'MFA active', tone: 'success', meaning: 'Un code de vérification est demandé à chaque connexion.', next: 'En cas de perte totale : réinitialisation par le super administrateur.' },
            { label: 'Adresse non vérifiée', tone: 'warning', meaning: 'La personne n’a pas ouvert le lien de confirmation : la connexion est impossible.', next: 'Elle doit demander un nouveau lien depuis la page de connexion.' },
            { label: 'Aucun mot de passe local (fournisseur externe)', tone: 'info', meaning: 'Le mot de passe se gère chez le fournisseur d’identité, pas sur le site.' },
            { label: 'Jamais (dernière connexion)', tone: 'neutral', meaning: 'Aucune connexion enregistrée pour ce compte.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Boutons absents : c’est normal',
          text: 'Les boutons « Désactiver le compte », « Réinitialiser la MFA », « Mot de passe temporaire », « Attribuer un rôle » et « Nouveau compte » ne s’affichent pas pour le rôle Support. Le bouton **Fiche sur la plateforme de formation** est visible mais mène à un espace réservé : il affichera « Accès refusé ».',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La recherche par email ne trouve rien alors que la personne dit avoir un compte.',
              cause: 'Elle utilise une autre adresse, ou son compte a été créé avec une faute de frappe.',
              solution: 'Recherchez par nom, puis par employeur. Si rien ne sort, proposez-lui de créer un compte depuis la page **Inscription** du site.',
            },
            {
              problem: 'La page « Élément introuvable » s’affiche en ouvrant une fiche.',
              cause: 'Le compte a été supprimé ou le lien est incomplet.',
              solution: 'Revenez à l’annuaire et recherchez à nouveau.',
            },
          ],
        },
      ],
    },
    {
      id: 'aider-a-la-connexion',
      title: 'Comment aider une personne qui n’arrive pas à se connecter',
      icon: 'key-round',
      summary: 'Diagnostiquer avec la fiche du compte et orienter vers la bonne solution, message par message.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page de connexion affiche un message précis pour chaque situation. Demandez à la personne de vous le lire mot pour mot : il vous dit quoi faire. Vous n’avez aucune action de réinitialisation dans le back-office : la solution passe toujours par la personne elle-même ou par le super administrateur.',
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Ne demandez jamais un mot de passe ni un code',
          text: 'Aucun membre de la Fédération n’a besoin du mot de passe ou du code de vérification d’un utilisateur. Refusez poliment si quelqu’un vous le propose, et n’essayez jamais de vous connecter à la place d’une personne.',
        },
        {
          type: 'steps',
          title: 'Poser le diagnostic',
          items: [
            {
              text: 'Demandez l’adresse email exacte du compte, l’écran concerné (site ou plateforme de formation) et le message affiché.',
            },
            {
              text: 'Recherchez le compte dans **Utilisateurs et rôles** et ouvrez sa fiche.',
              result: 'Si aucun compte n’existe : proposez la création d’un compte depuis la page **Inscription** du site.',
            },
            {
              text: 'Regardez les badges de l’en-tête (**Compte actif** ou **Compte désactivé**, **MFA active**) et la mention **Vérifié le …** ou **Adresse non vérifiée** dans la carte **Profil**.',
            },
            {
              text: 'Regardez la carte **Dernières connexions** : une série d’**Échec de connexion** confirme un problème de mot de passe.',
            },
            {
              text: 'Appliquez la solution correspondant au message (tableau ci-dessous).',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Message affiché à la connexion et solution',
          columns: ['Message affiché', 'Cause', 'Ce que la personne doit faire', 'Ce que vous faites'],
          rows: [
            [
              'Adresse email ou mot de passe incorrect.',
              'Faute de frappe ou mot de passe oublié.',
              'Cliquer sur **Mot de passe oublié ?**, saisir son adresse, ouvrir le lien reçu (valable 30 minutes) et choisir un nouveau mot de passe.',
              'Vérifier l’adresse dans la fiche et la mention **Mot de passe local défini**.',
            ],
            [
              'Confirmez d’abord votre adresse email : ouvrez le lien reçu lors de votre inscription.',
              'Adresse non vérifiée.',
              'Utiliser le formulaire **Renvoyer le lien de confirmation** affiché sous le message (lien valable 24 heures, 3 envois par heure).',
              'Vérifier **Adresse non vérifiée** dans la fiche ; rappeler de regarder le courrier indésirable.',
            ],
            [
              'Ce compte est désactivé. Contactez le support de la FETRAG pour le réactiver.',
              'Compte désactivé par l’administration.',
              'Attendre la réactivation.',
              'Vérifier l’identité (email, téléphone, organisation de la fiche) puis transmettre au super administrateur.',
            ],
            [
              'Ce compte est protégé par une vérification en deux étapes : saisissez le code…',
              'MFA active sur le compte.',
              'Saisir le code de l’application d’authentification (vérifier l’heure du téléphone) ou un code de secours.',
              'En cas de perte totale de l’application et des codes : transmettre au super administrateur après vérification d’identité.',
            ],
            [
              'Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer.',
              '10 essais en 15 minutes depuis la même connexion.',
              'Attendre le délai indiqué, puis réessayer une seule fois avec le bon mot de passe.',
              'Rien : aucune action ne lève le blocage plus tôt.',
            ],
            [
              'La connexion par mot de passe est désactivée : utilisez le compte FETRAG.',
              'Compte géré par un fournisseur d’identité externe.',
              'Cliquer sur **Se connecter avec {fournisseur}**.',
              'Vérifier **Aucun mot de passe local (fournisseur externe)** dans la fiche.',
            ],
          ],
        },
        {
          type: 'steps',
          title: 'Expliquer la réinitialisation du mot de passe',
          intro: 'C’est la seule voie possible : ni vous ni le super administrateur ne connaissez le mot de passe.',
          items: [
            {
              text: 'La personne clique sur **Mot de passe oublié ?**.',
              where: 'sous le formulaire de connexion',
              result: 'La page « Mot de passe oublié » s’affiche.',
            },
            {
              text: 'Elle saisit son **Adresse email du compte** puis clique sur `Recevoir le lien de réinitialisation`.',
              result: 'Un message neutre confirme l’envoi, même si l’adresse est inconnue (le site ne révèle jamais si un compte existe).',
              note: 'Limite : 3 demandes par heure pour une même adresse. Un compte désactivé ne reçoit rien.',
            },
            {
              text: 'Elle ouvre l’email « Réinitialisation de votre mot de passe FETRAG » et clique sur le lien.',
              note: 'Le lien est valable 30 minutes et une seule fois. S’il est périmé : « Lien invalide » avec le bouton `Demander un nouveau lien`.',
            },
            {
              text: 'Elle choisit un nouveau mot de passe : au moins 8 caractères, une majuscule et un chiffre ; puis le confirme.',
              result: 'Retour à la connexion avec « Votre mot de passe a été réinitialisé. » et un email « Votre mot de passe FETRAG a été modifié ».',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Expliquer la vérification en deux étapes à un utilisateur',
          items: [
            {
              text: 'Demandez si l’application d’authentification est toujours installée sur son téléphone.',
            },
            {
              text: 'Si oui : faites vérifier que l’heure du téléphone est réglée automatiquement, puis réessayer avec un nouveau code.',
              note: 'Le code change toutes les 30 secondes ; un code trop ancien donne « Le code de vérification est invalide ou expiré. »',
            },
            {
              text: 'Si l’application est perdue : faites utiliser l’un des codes de secours donnés lors de l’activation.',
              note: 'Chaque code de secours ne fonctionne qu’une fois.',
            },
            {
              text: 'Si les codes de secours sont perdus aussi : vérifiez l’identité de la personne (email, téléphone et organisation notés dans la fiche), puis transmettez la demande de réinitialisation au super administrateur.',
              result: 'Après réinitialisation, la personne reçoit l’email « Vérification en deux étapes réinitialisée » et peut se connecter avec son seul mot de passe.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La personne se connecte au site mais la plateforme de formation lui redemande ses identifiants.',
              cause: 'Session expirée ou navigateur qui bloque les cookies.',
              solution: 'Faites-la se reconnecter depuis la plateforme de formation. Si le problème est général (plusieurs personnes), signalez-le au super administrateur.',
            },
            {
              problem: 'La personne voit « Accès refusé » après la connexion.',
              cause: 'Elle ouvre une page réservée à un rôle qu’elle n’a pas, ou son rôle a expiré (carte **Rôles et portées**).',
              solution: 'Indiquez-lui la page de son espace. Si un rôle manque, transmettez au super administrateur.',
            },
            {
              problem: 'Le compte affiche « jamais connecté » alors que la personne dit s’être déjà connectée.',
              cause: 'Elle utilise un autre compte (autre adresse email).',
              solution: 'Recherchez par nom dans l’annuaire pour trouver les doublons.',
            },
          ],
        },
      ],
    },
    {
      id: 'email-non-recu',
      title: 'Comment aider quand un email n’arrive pas',
      icon: 'mail',
      summary: 'Lien de confirmation, lien de réinitialisation, accusé de réception : quoi vérifier et quoi dire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le back-office ne montre pas les envois d’emails et ne permet pas de « renvoyer » un email. Votre rôle est de faire vérifier l’adresse, de rappeler les délais et de faire redemander le lien par la personne elle-même.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Faites vérifier le dossier « Courrier indésirable » ou « Spam » de la messagerie de la personne.',
            },
            {
              text: 'Comparez l’adresse qu’elle utilise avec celle affichée dans la carte **Profil** de sa fiche.',
              result: 'Une différence d’une lettre suffit à expliquer le problème.',
            },
            {
              text: 'Rappelez le délai de validité du lien attendu : confirmation d’adresse 24 heures, réinitialisation du mot de passe 30 minutes, invitation à un compte créé par l’administration 7 jours.',
            },
            {
              text: 'Faites redemander le lien par la personne : formulaire **Renvoyer le lien de confirmation** (page de connexion ou page « Vérifiez votre boîte mail ») ou bouton `Recevoir le lien de réinitialisation` (page « Mot de passe oublié »).',
              note: 'Limite : 3 demandes par heure pour une même adresse. Le message affiché est toujours neutre.',
            },
            {
              text: 'Conseillez d’ajouter l’expéditeur des emails de la Fédération aux contacts de sa messagerie.',
            },
            {
              text: 'Rappelez que les informations importantes existent aussi sans email : **Notifications** et **Mes demandes** dans l’espace personnel, **Paiements et reçus**, certificats et convocations sur la plateforme de formation.',
            },
            {
              text: 'Si plusieurs personnes différentes ne reçoivent rien le même jour, signalez sans attendre un incident probable du service d’envoi au super administrateur.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Emails automatiques que la personne peut attendre',
          columns: ['Objet de l’email', 'Quand il part', 'Validité du lien'],
          rows: [
            ['Confirmez votre adresse email - FETRAG', 'Après la création du compte, ou après « Renvoyer le lien »', '24 heures, usage unique'],
            ['Bienvenue à la FETRAG', 'Après confirmation de l’adresse', '—'],
            ['Réinitialisation de votre mot de passe FETRAG', 'Après « Recevoir le lien de réinitialisation » (compte existant et actif seulement)', '30 minutes, usage unique'],
            ['Votre mot de passe FETRAG a été modifié', 'Après un changement ou une réinitialisation du mot de passe', '—'],
            ['Votre compte de formation FETRAG est prêt : définissez votre mot de passe', 'Compte créé par l’administration ou la coordination', '7 jours'],
            ['Nous avons bien reçu votre message (MSG-…)', 'Après l’envoi d’un formulaire depuis le site', '—'],
            ['Votre demande SRV-… - {service}', 'Après le dépôt d’une demande de service', '—'],
            ['Demande SRV-… : {statut}', 'À chaque changement de statut d’une demande de service', '—'],
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La personne a déjà demandé trois fois le lien et ne reçoit toujours rien.',
              cause: 'Limite de 3 envois par heure atteinte, ou adresse erronée.',
              solution: 'Faites patienter une heure ; entre-temps, vérifiez l’adresse dans la fiche. Si l’adresse du compte est fausse, seul le super administrateur peut agir sur le compte.',
            },
            {
              problem: 'Le lien de confirmation affiche « Lien invalide ou expiré ».',
              cause: 'Lien déjà utilisé, périmé (24 heures) ou copié de façon incomplète.',
              solution: 'Faire saisir l’adresse dans le formulaire **Recevoir un nouveau lien** de cette même page.',
            },
          ],
        },
      ],
    },
    {
      id: 'paiement-non-visible',
      title: 'Comment aider quand un paiement n’apparaît pas',
      icon: 'credit-card',
      summary: 'Ce que vous pouvez vérifier, et ce qui revient à Finance / contrôle.',
      blocks: [
        {
          type: 'callout',
          tone: 'warning',
          title: 'Ne promettez rien sur un paiement',
          text: 'Vous ne voyez pas le détail des paiements et ne pouvez ni confirmer ni rembourser. Ne dites jamais à une personne que son paiement « sera validé » : transmettez à Finance / contrôle.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Demandez la référence de commande (CMD-AAAA-XXXXXX) ou l’adresse email du compte, ainsi que la preuve de débit (SMS de l’opérateur, capture de la messagerie).',
            },
            {
              text: 'Ouvrez la fiche du compte, puis la carte **Commandes**.',
              result: 'Chaque commande affiche sa référence, sa date, son montant en FCFA et son statut.',
            },
            {
              text: 'Lisez le statut : **En attente** (paiement non confirmé), **Payée**, **Échoué**, **Annulé**, **Remboursé**, **Partiellement remboursée**.',
            },
            {
              text: 'Pour une demande de service payante, ouvrez la demande et lisez la carte **Paiement** : **Commande liée** ou « aucune commande réglée n’est encore associée ».',
            },
            {
              text: 'Invitez la personne à ouvrir **Paiements et reçus** dans son espace personnel pour retrouver son reçu ou reprendre un paiement échoué.',
            },
            {
              text: 'Si le statut reste **En attente** alors que la personne a une preuve de débit, ou en cas de double débit, transmettez la référence CMD, l’email du compte et la preuve à Finance / contrôle.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Aucune commande n’apparaît dans la fiche.',
              cause: 'Le paiement a été fait depuis un autre compte, ou sans compte.',
              solution: 'Recherchez le compte par nom ; transmettez ensuite à Finance / contrôle avec la preuve de débit.',
            },
            {
              problem: 'Une commande est **Payée** mais l’inscription à la formation reste **En attente**.',
              cause: 'La validation de l’inscription relève de la coordination.',
              solution: 'Transmettez à la Coordination sur la plateforme de formation avec la référence CMD et l’email du compte.',
            },
          ],
        },
      ],
    },
    {
      id: 'certificat-introuvable',
      title: 'Comment aider pour un certificat introuvable',
      icon: 'award',
      summary: 'Vérifier ce que vous pouvez voir, orienter vers la plateforme de formation et la coordination.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche du compte et lisez le compteur **Certificats** dans le panneau **Compte**.',
            },
            {
              text: 'Lisez la carte **Inscriptions à la formation** : le certificat suppose une inscription **Terminée**.',
              note: 'Une inscription **En cours** ou **Suspendue** n’a pas encore de certificat.',
            },
            {
              text: 'Expliquez que le certificat est délivré par la coordination, puis téléchargeable dans la rubrique **Certificats** de la plateforme de formation.',
            },
            {
              text: 'Pour une personne extérieure qui vérifie un certificat, indiquez la page publique de vérification du site : le code figure sous le QR code du certificat (ou le numéro FETRAG-…). Sceau vert : valide ; rouge : révoqué ; gris : introuvable.',
            },
            {
              text: 'Si le certificat manque malgré une inscription terminée, ou si un statut « Révoqué » est contesté, transmettez à la Coordination avec l’email du compte et le titre de la formation.',
              note: 'Le support ne commente jamais le motif d’une révocation.',
            },
          ],
        },
        {
          type: 'links',
          items: [
            { label: 'Vérifier un certificat', href: '/certificats/verifier', description: 'Page publique de vérification, à indiquer aux employeurs et aux tiers.', icon: 'badge-check' },
            { label: 'Mes certificats (plateforme de formation)', href: '{{lms}}/certificats', description: 'Où l’apprenant télécharge ses certificats.', external: true, icon: 'award' },
          ],
        },
      ],
    },
    {
      id: 'consulter-les-organisations',
      title: 'Comment consulter une organisation',
      icon: 'building',
      summary: 'Retrouver un syndicat affilié ou un partenaire, ses membres et ses responsables.',
      blocks: [
        {
          type: 'path',
          label: 'Chemin d’accès',
          items: ['Menu de gauche', 'Administration', 'Organisations'],
          href: '/admin/organisations',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Organisations**.',
              where: 'menu de gauche, rubrique « Administration »',
              result: 'La liste s’affiche avec les tuiles **Organisations affiliées**, **Partenaires actifs**, **Organisations inactives**.',
            },
            {
              text: 'Tapez le nom, le sigle, le secteur ou la ville dans **Rechercher**, puis cliquez sur `Filtrer`.',
              note: 'Les listes **Type** (Affiliées / Partenaires), **Secteur** et **Statut** (Actives / Inactives) affinent la recherche.',
            },
            {
              text: 'Cliquez sur le nom de l’organisation.',
              result: 'La fiche s’ouvre avec le badge **Active** ou **Inactive**.',
            },
            {
              text: 'Lisez la carte **Membres** : chaque compte rattaché avec son badge **Responsable** ou **Membre** ; le nom est un lien vers la fiche du compte.',
              note: 'Un badge rouge **Compte désactivé** signale un membre qui ne peut plus se connecter.',
            },
            {
              text: 'Lisez les cartes **Contacts** et **Coordonnées** pour joindre l’organisation.',
            },
            {
              text: 'Pour lister tous les comptes de l’organisation, cliquez sur `Comptes rattachés`.',
              where: 'panneau **Activité**',
              result: 'L’annuaire s’ouvre filtré sur cette organisation.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Aucun responsable désigné',
          text: 'Une alerte orange « Aucun responsable n’est désigné… » signifie que personne ne peut déposer de demande de formation pour cette organisation. La nomination d’un responsable est réservée au super administrateur : transmettez-lui l’information.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Un responsable d’organisation dit ne pas pouvoir déposer de demande de formation.',
              cause: 'Il n’a pas le badge **Responsable** dans la carte **Membres**, ou l’organisation est **Inactive**.',
              solution: 'Vérifiez la fiche ; transmettez au super administrateur pour le rattachement ou la nomination.',
            },
            {
              problem: 'Les liens **Coordination LMS** de la fiche affichent « Accès refusé ».',
              cause: 'Ces liens mènent à l’espace de la coordination sur la plateforme de formation, réservé au rôle Coordinateur.',
              solution: 'C’est normal pour le rôle Support : transmettez la question à la Coordination.',
            },
          ],
        },
      ],
    },
    {
      id: 'lettre-d-information',
      title: 'Comment consulter les abonnés à la lettre d’information',
      icon: 'newspaper',
      summary: 'Retrouver un abonné, comprendre son état et répondre à une demande de désinscription ou d’effacement.',
      blocks: [
        {
          type: 'path',
          label: 'Chemin d’accès',
          items: ['Menu de gauche', 'Relations', 'Newsletter'],
          href: '/admin/newsletter',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Newsletter**.',
              where: 'menu de gauche, rubrique « Relations »',
              result: 'La page « Lettre d’information » s’affiche avec les tuiles **Abonnés confirmés**, **En attente de confirmation**, **Désinscrits**.',
            },
            {
              text: 'Tapez l’adresse email dans **Rechercher**, puis cliquez sur `Filtrer`.',
              result: 'La ligne de l’abonné s’affiche avec son état, sa date d’inscription et sa date de confirmation.',
            },
            {
              text: 'Si l’état est **En attente de confirmation**, expliquez à la personne qu’elle doit ouvrir le lien reçu par email pour confirmer son abonnement (inscription en deux temps).',
            },
            {
              text: 'Pour une simple désinscription, indiquez à la personne le lien **Se désinscrire** présent en bas de chaque lettre reçue.',
              note: 'Le back-office ne propose pas de bouton « Désinscrire » : seule la suppression définitive existe (ci-dessous).',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Le bouton « Supprimer » est définitif',
          text: 'Avec le rôle Support, vous pouvez supprimer un abonné : l’adresse et tout son historique de consentement sont effacés pour toujours. N’utilisez ce bouton que pour une demande explicite d’effacement des données, et seulement après avoir vérifié qu’elle vient bien du titulaire de l’adresse.',
        },
        {
          type: 'steps',
          title: 'Supprimer un abonné (droit à l’effacement)',
          items: [
            {
              text: 'Vérifiez que la demande d’effacement provient de l’adresse concernée (message reçu depuis cette adresse).',
            },
            {
              text: 'Cliquez sur `Supprimer` sur la ligne de l’abonné.',
              where: 'dernière colonne du tableau',
              result: 'La fenêtre « Supprimer {email} ? » s’ouvre.',
            },
            {
              text: 'Cliquez sur `Supprimer` pour confirmer, ou sur `Annuler`.',
              result: 'Le message vert « Abonné supprimé. » apparaît et la ligne disparaît.',
            },
          ],
        },
        {
          type: 'statuses',
          items: [
            { label: 'Confirmé', tone: 'success', meaning: 'L’abonné a cliqué sur le lien de confirmation : il reçoit la lettre.' },
            { label: 'En attente de confirmation', tone: 'warning', meaning: 'Inscription faite, lien non encore ouvert : aucune lettre envoyée.', next: 'Faire ouvrir le lien reçu.' },
            { label: 'Désinscrit', tone: 'neutral', meaning: 'La personne a cliqué sur le lien de désinscription.' },
          ],
        },
      ],
    },
    {
      id: 'exporter-une-liste',
      title: 'Comment exporter une liste (CSV)',
      icon: 'download',
      summary: 'Télécharger les messages, les demandes ou les abonnés dans un fichier pour un tableur.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un fichier CSV s’ouvre avec un tableur (Excel, LibreOffice, Google Sheets). L’export reprend les filtres affichés à l’écran et contient au maximum 5 000 lignes.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Appliquez les filtres souhaités sur la liste (recherche, statut, type, responsable...) puis cliquez sur `Filtrer`.',
              note: 'Il n’existe pas de filtre par période : pour limiter l’export à une date, triez ensuite dans votre tableur grâce à la colonne de date.',
            },
            {
              text: 'Cliquez sur `Exporter (CSV)`.',
              where: 'en haut à droite de la page, à côté du titre',
              result: 'Le navigateur télécharge un fichier nommé fetrag-messages-recus-…, fetrag-demandes-de-service-… ou fetrag-newsletter-… suivi de la date et de l’heure.',
            },
            {
              text: 'Ouvrez le fichier avec votre tableur.',
              note: 'Sur un téléphone, le fichier arrive dans les téléchargements ; une application de tableur est nécessaire pour le lire.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Données personnelles',
          text: 'Chaque export est enregistré dans le journal d’audit avec les filtres utilisés. N’exportez que ce qui est nécessaire, ne transmettez jamais le fichier hors de la Fédération et supprimez-le de votre appareil une fois le travail terminé.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « L’export a échoué. » s’affiche.',
              cause: 'Problème passager du serveur.',
              solution: 'Réessayez dans quelques instants avec moins de résultats (filtrez davantage).',
            },
            {
              problem: 'Les accents sont mal affichés dans le tableur.',
              cause: 'Le tableur n’a pas reconnu l’encodage du fichier.',
              solution: 'Ouvrez le fichier par « Importer » en choisissant l’encodage UTF-8 et le séparateur point-virgule.',
            },
          ],
        },
      ],
    },
    {
      id: 'procedure-d-assistance',
      title: 'La procédure d’assistance type',
      icon: 'life-buoy',
      summary: 'Les questions à poser, les informations à noter et l’ordre des vérifications pour toute demande d’aide.',
      blocks: [
        {
          type: 'steps',
          title: 'Recueillir la demande',
          items: [
            {
              text: 'Notez l’adresse email exacte du compte de la personne.',
              note: 'C’est la clé pour tout retrouver : compte, messages, demandes, commandes.',
            },
            {
              text: 'Demandez quel écran est concerné : site institutionnel ou plateforme de formation, et quelle page (connexion, inscription, paiement, formation...).',
            },
            {
              text: 'Demandez le message d’erreur exact, lu mot pour mot ou recopié.',
            },
            {
              text: 'Demandez la date et l’heure du problème, et l’appareil utilisé (téléphone ou ordinateur, navigateur).',
            },
            {
              text: 'Notez toute référence citée : MSG-… (message), SRV-… (demande de service), CMD-… (commande), DF-… (demande de formation), FETRAG-… (certificat).',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Vérifier puis répondre',
          items: [
            {
              text: 'Ouvrez la fiche du compte et lisez son état (actif, adresse vérifiée, MFA, dernières connexions).',
            },
            {
              text: 'Ouvrez le message ou la demande cité(e) et attribuez-vous le dossier.',
            },
            {
              text: 'Appliquez la fiche de diagnostic correspondante de ce guide (connexion, email, paiement, certificat).',
            },
            {
              text: 'Répondez à la personne avec des phrases simples : ce que vous avez constaté, ce qu’elle doit faire, et à qui vous transmettez si nécessaire.',
            },
            {
              text: 'Consignez ce que vous avez fait : note interne pour une demande de service ; pour un message, résumé dans votre réponse email puis statut **Répondu**.',
            },
            {
              text: 'Si vous transmettez à un autre rôle, indiquez toujours : email du compte, référence, écran concerné, message d’erreur exact, date et heure.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Délais annoncés aux utilisateurs',
          text: 'La page de contact annonce une réponse sous cinq jours ouvrés ; l’accusé de réception par email annonce 48 heures ouvrées. Visez le plus court, et prévenez la personne si le traitement demande une transmission à un autre service.',
        },
      ],
    },
    {
      id: 'escalader',
      title: 'Ce que le support ne peut pas faire : à qui transmettre',
      icon: 'arrow-right',
      summary: 'Le bon interlocuteur pour chaque demande hors de votre périmètre.',
      blocks: [
        {
          type: 'table',
          caption: 'Qui fait quoi',
          columns: ['Demande', 'Interlocuteur', 'Ce qu’il faut lui transmettre'],
          rows: [
            ['Réactiver un compte désactivé', 'Super administrateur', 'Email du compte, motif, vérification d’identité faite'],
            ['Réinitialiser la vérification en deux étapes', 'Super administrateur', 'Email du compte, identité vérifiée (téléphone, organisation)'],
            ['Attribuer ou retirer un rôle, créer un compte à la main', 'Super administrateur', 'Email, rôle demandé, organisation'],
            ['Corriger l’adresse email d’un compte', 'Super administrateur', 'Email actuel, email souhaité, preuve'],
            ['Rattacher un membre à une organisation, nommer un responsable', 'Super administrateur', 'Email du compte, organisation'],
            ['Supprimer une demande de service, question de fond sur un service', 'Responsable services', 'Référence SRV'],
            ['Paiement non confirmé, double débit, remboursement, reçu manquant', 'Finance / contrôle', 'Référence CMD, email, preuve de débit'],
            ['Inscription bloquée, cohorte, demande de formation, certificat', 'Coordination (plateforme de formation)', 'Email, titre de la formation, référence DF ou FETRAG'],
            ['Erreur dans une page, une actualité, la FAQ ; partenariat, adhésion sur le fond', 'Éditeur communication', 'Adresse de la page, référence MSG'],
            ['Site indisponible, emails en échec pour plusieurs personnes', 'Super administrateur (exploitation)', 'Heure, écran, nombre de personnes touchées'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text: 'Après avoir transmis, gardez le dossier ouvert de votre côté (message **Attribué**, demande **En examen** ou **En traitement**) jusqu’à la réponse de l’interlocuteur, puis informez la personne.',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Ce qui vous est envoyé, pourquoi, et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vos notifications internes se lisent dans **Notifications** de votre espace personnel (un chiffre dans le menu indique les non-lues). Le rôle Support reçoit peu de notifications automatiques : consultez régulièrement les chiffres du menu **Demandes** et **Messages reçus**.',
        },
        {
          type: 'table',
          columns: ['Notification ou email', 'Déclencheur', 'Quoi faire'],
          rows: [
            ['Notification « Nouveau message : Assistance »', 'Un formulaire de type Assistance a été reçu (via l’interface de programmation du site, pas depuis la page Contact).', 'Ouvrir le message depuis le lien, l’attribuer et répondre.'],
            ['Notification « Demande de service attribuée »', 'Un collègue vous a désigné responsable d’une demande.', 'Ouvrir la demande, la lire et la faire avancer.'],
            ['Email « Nouveau rôle attribué »', 'Le super administrateur vous a attribué le rôle Support (ou un autre rôle).', 'Vous reconnecter : le lien **Administration du site** apparaît.'],
            ['Email « Votre mot de passe FETRAG a été modifié »', 'Vous avez changé ou réinitialisé votre mot de passe.', 'Rien, sauf si ce n’est pas vous : changez immédiatement votre mot de passe et prévenez le super administrateur.'],
            ['Email « Vérification en deux étapes réinitialisée »', 'Le super administrateur a réinitialisé votre MFA.', 'Réactiver la vérification depuis **Sécurité**.'],
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Les nouvelles demandes et les messages de contact ne vous sont pas notifiés',
          text: 'Une nouvelle demande de service prévient le Responsable services ; un message de type Contact, Adhésion ou Partenariat prévient l’Éditeur communication. Prenez l’habitude d’ouvrir le back-office chaque jour de travail et de trier par statut **Nouveau** / **Nouvelle**.',
        },
        {
          type: 'list',
          title: 'Ce que reçoivent les utilisateurs grâce à vos actions',
          style: 'bullet',
          items: [
            'Changement de statut d’une demande de service : email « Demande SRV-… : {statut} » avec votre commentaire, plus une notification interne si la personne a un compte.',
            'Attribution ou changement de statut d’un message : rien. La réponse part de votre messagerie.',
            'Dépôt d’un formulaire ou d’une demande : accusé de réception automatique envoyé au moment du dépôt, avant toute action de votre part.',
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
            'Activez la vérification en deux étapes sur votre compte et conservez vos codes de secours hors du téléphone.',
            'Déconnectez-vous après chaque utilisation sur un appareil partagé ; ne laissez jamais une fiche utilisateur ouverte sans surveillance.',
            'Ne demandez jamais un mot de passe ni un code de vérification ; ne vous connectez jamais à la place d’un utilisateur.',
            'Vérifiez l’identité de la personne (email du compte, téléphone et organisation notés dans la fiche) avant de transmettre une demande sensible (réactivation, réinitialisation de la MFA).',
            'N’ouvrez que les fiches nécessaires au dossier en cours : chaque consultation concerne des données personnelles et syndicales confidentielles.',
            'Ne communiquez jamais les informations d’un compte (rôles, organisation, commandes) à une autre personne que son titulaire.',
            'Attribuez-vous un message ou une demande avant d’y travailler pour éviter les doubles réponses.',
            'Restez courtois et factuel dans les commentaires envoyés aux demandeurs : ils sont conservés dans l’historique.',
            'Consignez vos vérifications dans la note interne d’une demande ; n’y inscrivez ni mot de passe ni donnée inutile.',
            'N’exportez que le nécessaire et supprimez les fichiers CSV de votre appareil après usage.',
            'Réfléchissez à deux fois avant les actions définitives : suppression d’un message, suppression d’un abonné, clôture d’une demande.',
            'Signalez sans attendre au super administrateur tout comportement anormal : connexions inconnues sur votre compte, message frauduleux se faisant passer pour la Fédération.',
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
              question: 'Puis-je réinitialiser le mot de passe d’un utilisateur ?',
              answer:
                'Non. Personne ne connaît les mots de passe. La personne utilise **Mot de passe oublié ?** sur la page de connexion. Seul le super administrateur peut, en dernier recours, définir un mot de passe temporaire.',
            },
            {
              question: 'Puis-je renvoyer moi-même le lien de confirmation ou de réinitialisation ?',
              answer:
                'Non. Le back-office n’a pas de bouton pour cela. C’est la personne qui redemande le lien depuis la page de connexion, la page « Vérifiez votre boîte mail » ou la page « Mot de passe oublié », dans la limite de 3 demandes par heure.',
            },
            {
              question: 'Pourquoi le badge dit « Assigné » alors que le filtre dit « Attribué » ?',
              answer: 'C’est le même statut d’un message, écrit de deux façons selon l’endroit de l’écran. Un responsable a été désigné.',
            },
            {
              question: 'Le demandeur reçoit-il un email quand je change le statut d’un message ?',
              answer: 'Non. Seuls les changements de statut des demandes de service envoient un email. Pour un message, la réponse part toujours de votre messagerie via `Répondre par email`.',
            },
            {
              question: 'Puis-je supprimer une demande de service ?',
              answer: 'Non. La suppression est réservée au Responsable services, et uniquement pour une demande Clôturée ou Refusée. Vous pouvez la clôturer.',
            },
            {
              question: 'Pourquoi le lien « Coordination LMS » m’affiche « Accès refusé » ?',
              answer:
                'Ce lien mène à l’espace de la coordination sur la plateforme de formation, réservé au rôle Coordinateur. Le rôle Support n’a aucun espace d’administration sur la plateforme de formation : vous y êtes un apprenant comme les autres.',
            },
            {
              question: 'Puis-je voir si le paiement d’une personne a bien été reçu ?',
              answer:
                'Vous voyez le statut de ses commandes dans sa fiche (En attente, Payée, Échouée...) et la carte **Paiement** d’une demande de service. Le détail des paiements, la confirmation et le remboursement relèvent de Finance / contrôle.',
            },
            {
              question: 'Que faire si une demande de service est en retard (badge rouge « Échéance dépassée ») ?',
              answer:
                'Ouvrez-la, vérifiez qu’elle a un responsable, faites-la avancer si elle est dans votre périmètre, ou relancez le Responsable services. Informez le demandeur du délai par un commentaire de statut.',
            },
            {
              question: 'La vérification en deux étapes est-elle obligatoire pour moi ?',
              answer: 'Non, elle est recommandée pour le rôle Support (elle est obligatoire pour l’administration, la coordination, la finance et la communication). Activez-la depuis **Sécurité** : vous consultez des données personnelles.',
            },
            {
              question: 'Une personne me demande d’effacer toutes ses données. Que puis-je faire ?',
              answer:
                'Vous pouvez supprimer ses messages clôturés ou indésirables et son abonnement à la lettre d’information, après avoir vérifié que la demande vient bien de son adresse. Le compte lui-même et les autres données relèvent du super administrateur : transmettez-lui la demande.',
            },
            {
              question: 'Mes actions sont-elles enregistrées ?',
              answer: 'Oui. Chaque attribution, changement de statut, suppression et export est inscrit dans le journal d’audit avec la date, votre compte et l’adresse de connexion. Vous ne pouvez pas consulter ce journal.',
            },
            {
              question: 'Puis-je répondre à une personne depuis mon téléphone ?',
              answer:
                'Oui. Le back-office fonctionne sur téléphone : ouvrez le menu avec le bouton **Ouvrir la navigation** (trois traits, en haut à gauche). Le bouton `Répondre par email` ouvre l’application de messagerie du téléphone.',
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
            { term: 'Back-office', definition: 'L’espace d’administration du site, réservé aux membres de l’équipe ayant un rôle. On y accède par **Administration du site** dans le menu du compte.' },
            { term: 'Rôle', definition: 'Ensemble de droits attribué à un compte par le super administrateur (Support, Responsable services, Éditeur, Finance, Coordinateur...). Un rôle peut être global ou limité à une organisation, un cours ou une cohorte, et peut avoir une date d’expiration.' },
            { term: 'Permission', definition: 'Droit précis accordé par un rôle, par exemple lire les messages ou traiter les demandes de service. Une page qui exige une permission absente affiche « Accès refusé ».' },
            { term: 'Message reçu', definition: 'Formulaire envoyé depuis le site (contact, adhésion, partenariat, assistance), identifié par une référence MSG-AAAA-XXXXXX.' },
            { term: 'Demande de service', definition: 'Sollicitation déposée depuis le catalogue des services (assistance juridique, médiation...), identifiée par une référence SRV-AAAA-XXXXXX et suivie par statut.' },
            { term: 'Attribution', definition: 'Désignation d’un responsable pour un message ou une demande. Une demande Nouvelle attribuée passe automatiquement En examen.' },
            { term: 'Statut', definition: 'État d’avancement affiché par un badge coloré (Nouveau, Répondu, En traitement, Traitée...). Pour les demandes de service, seules certaines transitions sont autorisées.' },
            { term: 'Transition', definition: 'Passage d’un statut à un autre. La liste **Nouveau statut** ne propose que les transitions permises.' },
            { term: 'Échéance (SLA)', definition: 'Délai indicatif de traitement d’une demande de service : date de dépôt plus le délai prévu pour le service. Affichée en jours restants, orange à deux jours, rouge si dépassée.' },
            { term: 'Note interne', definition: 'Texte joint à une demande de service, visible uniquement par l’équipe, jamais transmis au demandeur.' },
            { term: 'Commentaire pour le demandeur', definition: 'Texte saisi lors d’un changement de statut d’une demande de service ; il est envoyé par email au demandeur et conservé dans l’historique.' },
            { term: 'Vérification en deux étapes (MFA)', definition: 'Protection du compte par un code temporaire à 6 chiffres, généré par une application d’authentification, demandé en plus du mot de passe.' },
            { term: 'Application d’authentification', definition: 'Application gratuite (Google Authenticator, Microsoft Authenticator, FreeOTP) qui affiche un code changeant toutes les 30 secondes.' },
            { term: 'Code de secours', definition: 'Code à usage unique remis à l’activation de la vérification en deux étapes, pour se connecter sans l’application.' },
            { term: 'Adresse vérifiée', definition: 'Adresse email dont le lien de confirmation a été ouvert. Sans cela, la connexion est impossible.' },
            { term: 'Compte désactivé', definition: 'Compte bloqué par l’administration : plus aucune connexion possible jusqu’à réactivation par le super administrateur.' },
            { term: 'Fournisseur d’identité externe', definition: 'Service tiers qui gère la connexion de certains comptes ; leur mot de passe se modifie chez ce service et non sur le site.' },
            { term: 'Session', definition: 'Période pendant laquelle une personne reste connectée sur un appareil. La désactivation d’un compte ferme toutes ses sessions.' },
            { term: 'Commande', definition: 'Achat en ligne (formation payante, événement, service), identifié par une référence CMD-AAAA-XXXXXX, avec un statut de paiement.' },
            { term: 'Cohorte', definition: 'Groupe d’apprenants qui suivent ensemble une formation à une date donnée, géré par la coordination.' },
            { term: 'Organisation affiliée / partenaire', definition: 'Syndicat membre de la Fédération (affilié) ou structure partenaire. Son responsable peut déposer des demandes de formation.' },
            { term: 'Lettre d’information (newsletter)', definition: 'Email périodique de la Fédération. L’abonnement se confirme en deux temps (double opt-in) : inscription puis clic sur un lien reçu par email.' },
            { term: 'CSV', definition: 'Fichier texte contenant un tableau, lisible par un tableur (Excel, LibreOffice, Google Sheets).' },
            { term: 'Journal d’audit', definition: 'Registre de toutes les actions sensibles faites sur la plateforme (qui, quoi, quand). Consultable par le super administrateur uniquement.' },
            { term: 'Droit à l’effacement', definition: 'Droit d’une personne à demander la suppression de ses données personnelles. Sur le site, il se traduit par la suppression d’un message clôturé ou d’un abonné à la lettre d’information ; le reste relève du super administrateur.' },
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
            ['Vous ne pouvez plus vous connecter, votre rôle a disparu, une page vous est refusée', 'Super administrateur (ou secrétariat général de la Fédération)'],
            ['Question sur le traitement d’une demande de service', 'Responsable services'],
            ['Question sur un paiement ou un remboursement', 'Finance / contrôle'],
            ['Question sur une formation, une cohorte, un certificat', 'Coordination, sur la plateforme de formation'],
            ['Erreur dans le contenu du site', 'Éditeur communication'],
            ['Panne générale (site inaccessible, aucun email ne part)', 'Super administrateur, sans attendre'],
          ],
        },
        {
          type: 'list',
          title: 'Ce qu’il faut indiquer dans votre message d’aide',
          style: 'check',
          items: [
            'L’adresse email de votre compte (ou du compte concerné).',
            'L’écran concerné (page du back-office, site ou plateforme de formation) et l’appareil utilisé.',
            'Le message d’erreur exact, recopié mot pour mot.',
            'La référence concernée (MSG-…, SRV-…, CMD-…) et la date et l’heure du problème.',
            'Ce que vous avez déjà essayé.',
          ],
        },
        {
          type: 'links',
          title: 'Coordonnées de la Fédération',
          items: [
            { label: 'Formulaire de contact du site', href: '/contact', description: 'Pour écrire à la Fédération ; vous recevez une référence MSG.', icon: 'mail' },
            { label: 'Email du secrétariat', href: 'mailto:jossngomafm@gmail.com', description: 'jossngomafm@gmail.com', icon: 'send' },
            { label: 'Téléphone', href: 'tel:+24166230033', description: '066 23 00 33 ou 077 52 27 98', icon: 'phone' },
            { label: 'Adresse postale', href: '/contact', description: 'BP 1234 Libreville, Gabon', icon: 'map-pin' },
          ],
        },
        {
          type: 'links',
          title: 'Pages utiles',
          items: [
            { label: 'Tableau de bord du back-office', href: '/admin', icon: 'layout-dashboard' },
            { label: 'Messages reçus', href: '/admin/messages', icon: 'inbox' },
            { label: 'Demandes de service', href: '/admin/demandes', icon: 'clipboard-list' },
            { label: 'Utilisateurs et rôles', href: '/admin/utilisateurs', icon: 'users' },
            { label: 'Protéger mon compte', href: '/espace/securite', description: 'Vérification en deux étapes et mot de passe.', icon: 'shield' },
            { label: 'Mot de passe oublié', href: '/mot-de-passe-oublie', description: 'Page à indiquer aux utilisateurs.', icon: 'key-round' },
          ],
        },
      ],
    },
  ],
  related: [
    { label: 'Guide du membre', href: '/espace/guide', description: 'Votre compte et votre espace personnel : ce que voient tous les utilisateurs que vous aidez.' },
    { label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'La plateforme de formation, telle que la voient les apprenants.', external: true },
  ],
  selfAssessment: {
    intro:
      'Quinze questions pour vérifier que vous savez où cliquer, ce que signifie chaque statut, ce qui est définitif et à qui transmettre. Comptez huit minutes ; le corrigé renvoie à la section du guide.',
    passPercent: 70,
    questions: [
      {
        id: 'q-role-1',
        sectionId: 'votre-role',
        type: 'single',
        prompt: 'Une personne vous demande de réactiver son compte désactivé. Que faites-vous ?',
        options: [
          { id: 'a', text: 'J’ouvre sa fiche et je clique sur `Réactiver le compte`.', correct: false },
          { id: 'b', text: 'Je vérifie son identité, puis je transmets la demande au super administrateur.', correct: true },
          { id: 'c', text: 'Je lui demande de créer un nouveau compte avec la même adresse.', correct: false },
        ],
        explanation: 'Le rôle Support ne modifie jamais un compte : la réactivation est réservée au super administrateur. Voir « Votre rôle en bref ».',
      },
      {
        id: 'q-connexion-1',
        sectionId: 'avant-de-commencer',
        type: 'true-false',
        prompt: 'La vérification en deux étapes est obligatoire pour se connecter avec le rôle Support.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Elle est recommandée pour le rôle Support, mais l’application ne l’impose qu’aux rôles administration, coordination, finance et communication. Voir « Avant de commencer ».',
      },
      {
        id: 'q-reperer-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Sur un téléphone, comment ouvrez-vous le menu du back-office ?',
        options: [
          { id: 'a', text: 'Avec le bouton **Ouvrir la navigation** (trois traits) en haut à gauche.', correct: true },
          { id: 'b', text: 'En cliquant sur **Voir le site** en haut à droite.', correct: false },
          { id: 'c', text: 'Le menu n’est pas disponible sur téléphone.', correct: false },
        ],
        explanation: 'Sur petit écran, le menu de gauche devient un tiroir ouvert par le bouton à trois traits. Voir « Se repérer dans le back-office ».',
      },
      {
        id: 'q-message-1',
        sectionId: 'messages-repondre',
        type: 'single',
        prompt: 'Vous cliquez sur `Marquer répondu` sur un message reçu. Que reçoit l’expéditeur ?',
        options: [
          { id: 'a', text: 'Un email automatique contenant votre réponse.', correct: false },
          { id: 'b', text: 'Rien : la réponse doit partir de votre messagerie via `Répondre par email`.', correct: true },
          { id: 'c', text: 'Une notification lui demandant de clôturer le message.', correct: false },
        ],
        explanation: 'Un changement de statut d’un message n’envoie jamais d’email : seule votre messagerie envoie la réponse. Voir « Répondre et classer le message ».',
      },
      {
        id: 'q-message-2',
        sectionId: 'messages-supprimer',
        type: 'multiple',
        prompt: 'Quels statuts permettent de supprimer un message reçu ?',
        options: [
          { id: 'a', text: 'Indésirable', correct: true },
          { id: 'b', text: 'Clôturé', correct: true },
          { id: 'c', text: 'Nouveau', correct: false },
          { id: 'd', text: 'Répondu', correct: false },
        ],
        explanation: 'Seuls les messages indésirables ou clôturés peuvent être supprimés, et la suppression est définitive. Voir « Supprimer un message ».',
      },
      {
        id: 'q-demande-1',
        sectionId: 'demandes-lire-attribuer',
        type: 'single',
        prompt: 'Vous attribuez une demande de service au statut **Nouvelle**. Quel statut prend-elle automatiquement ?',
        options: [
          { id: 'a', text: 'En traitement', correct: false },
          { id: 'b', text: 'En examen', correct: true },
          { id: 'c', text: 'Elle reste Nouvelle jusqu’au premier changement de statut.', correct: false },
        ],
        explanation: 'Une demande Nouvelle passe automatiquement En examen lorsqu’elle est attribuée. Voir « Lire une demande et l’attribuer ».',
      },
      {
        id: 'q-demande-2',
        sectionId: 'demandes-changer-statut',
        type: 'true-false',
        prompt: 'Une demande de service **Clôturée** peut être remise En traitement si le demandeur revient.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Clôturée est un état final : aucune transition n’est possible. C’est la demande Traitée qui peut revenir En traitement. Voir « Changer le statut et informer le demandeur ».',
      },
      {
        id: 'q-demande-3',
        sectionId: 'demandes-note-interne',
        type: 'single',
        prompt: 'Qui peut lire la **Note interne** d’une demande de service ?',
        options: [
          { id: 'a', text: 'Le demandeur, dans son espace personnel.', correct: false },
          { id: 'b', text: 'Uniquement l’équipe des services et le support.', correct: true },
          { id: 'c', text: 'Toute personne disposant de la référence SRV.', correct: false },
        ],
        explanation: 'La note interne n’est jamais transmise au demandeur ; c’est le « Commentaire pour le demandeur » qui lui est envoyé. Voir « Ajouter une note interne ».',
      },
      {
        id: 'q-compte-1',
        sectionId: 'retrouver-un-compte',
        type: 'single',
        prompt: 'Quelle information demandez-vous en priorité pour retrouver le compte d’une personne ?',
        options: [
          { id: 'a', text: 'Son mot de passe, pour vérifier qu’il fonctionne.', correct: false },
          { id: 'b', text: 'L’adresse email exacte de son compte.', correct: true },
          { id: 'c', text: 'Le nom de son syndicat uniquement.', correct: false },
        ],
        explanation: 'L’adresse email est l’identifiant du compte ; un mot de passe ne se demande jamais. Voir « Comment retrouver un compte et lire sa fiche ».',
      },
      {
        id: 'q-aide-connexion-1',
        sectionId: 'aider-a-la-connexion',
        type: 'single',
        prompt: 'Une personne voit « Confirmez d’abord votre adresse email… » à la connexion. Quelle est la solution ?',
        options: [
          { id: 'a', text: 'Elle utilise le formulaire **Renvoyer le lien de confirmation** et ouvre le lien reçu (valable 24 heures).', correct: true },
          { id: 'b', text: 'Vous confirmez l’adresse depuis sa fiche dans le back-office.', correct: false },
          { id: 'c', text: 'Elle attend 15 minutes puis réessaie avec le même mot de passe.', correct: false },
        ],
        explanation: 'L’adresse n’est pas vérifiée : seule la personne peut redemander le lien, le support n’a aucun bouton pour cela. Voir « Comment aider une personne qui n’arrive pas à se connecter ».',
      },
      {
        id: 'q-email-1',
        sectionId: 'email-non-recu',
        type: 'single',
        prompt: 'Combien de temps le lien de réinitialisation du mot de passe reste-t-il valable ?',
        options: [
          { id: 'a', text: '30 minutes, à usage unique.', correct: true },
          { id: 'b', text: '24 heures, à usage unique.', correct: false },
          { id: 'c', text: '7 jours, réutilisable.', correct: false },
        ],
        explanation: 'Réinitialisation : 30 minutes ; confirmation d’adresse : 24 heures ; invitation d’un compte créé par l’administration : 7 jours. Voir « Comment aider quand un email n’arrive pas ».',
      },
      {
        id: 'q-paiement-1',
        sectionId: 'paiement-non-visible',
        type: 'single',
        prompt: 'La commande d’une personne reste **En attente** alors qu’elle vous montre un SMS de débit. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je lui promets que le paiement sera validé dans la journée.', correct: false },
          { id: 'b', text: 'Je transmets la référence CMD, l’email du compte et la preuve de débit à Finance / contrôle.', correct: true },
          { id: 'c', text: 'Je change le statut de la commande en Payée depuis sa fiche.', correct: false },
        ],
        explanation: 'Le support ne voit pas le détail des paiements et ne peut ni confirmer ni rembourser. Voir « Comment aider quand un paiement n’apparaît pas ».',
      },
      {
        id: 'q-newsletter-1',
        sectionId: 'lettre-d-information',
        type: 'true-false',
        prompt: 'La suppression d’un abonné à la lettre d’information peut être annulée par le super administrateur.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'L’adresse et son historique de consentement sont effacés pour toujours : ne supprimez qu’après une demande explicite et vérifiée. Voir « Comment consulter les abonnés à la lettre d’information ».',
      },
      {
        id: 'q-export-1',
        sectionId: 'exporter-une-liste',
        type: 'multiple',
        prompt: 'Que faites-vous d’un fichier CSV exporté depuis le back-office ?',
        options: [
          { id: 'a', text: 'Je ne le transmets jamais hors de la Fédération.', correct: true },
          { id: 'b', text: 'Je le supprime de mon appareil une fois le travail terminé.', correct: true },
          { id: 'c', text: 'Je l’envoie par messagerie instantanée à la personne qui le demande.', correct: false },
        ],
        explanation: 'Un export contient des données personnelles et est enregistré dans le journal d’audit. Voir « Comment exporter une liste (CSV) ».',
      },
      {
        id: 'q-escalade-1',
        sectionId: 'escalader',
        type: 'single',
        prompt: 'Un apprenant conteste le statut « Révoqué » de son certificat. À qui transmettez-vous ?',
        options: [
          { id: 'a', text: 'Au Responsable services.', correct: false },
          { id: 'b', text: 'À Finance / contrôle.', correct: false },
          { id: 'c', text: 'À la Coordination, sur la plateforme de formation.', correct: true },
        ],
        explanation: 'Les certificats, cohortes et inscriptions relèvent de la coordination ; le support n’a aucune action sur les certificats. Voir « Ce que le support ne peut pas faire : à qui transmettre ».',
      },
    ],
  },
}
