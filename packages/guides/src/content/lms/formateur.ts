import type { Guide } from '@fetrag/contracts'

/**
 * Guide du formateur (plateforme de formation, rôle TRAINER).
 *
 * Périmètre : espace « Formateur » de la plateforme (/formateur) — tableau de bord, cohortes,
 * présence, corrections (devoirs et compositions), messages, sessions, statistiques, forums,
 * calendrier. Le contenu décrit uniquement ce qui existe dans l'application (libellés, statuts,
 * règles, notifications). Aucune donnée de démonstration, aucun mot de passe, aucun domaine en dur.
 */
export const lmsFormateur: Guide = {
  id: 'lms-formateur',
  platform: 'lms',
  role: 'TRAINER',
  title: 'Guide du formateur',
  subtitle: 'Animer vos cohortes, émarger, corriger et suivre l’assiduité',
  audience:
    'Ce guide s’adresse aux formatrices et formateurs de la FETRAG ainsi qu’aux intervenantes et intervenants invités qui animent une ou plusieurs cohortes sur la plateforme de formation : ils suivent les participants, planifient et émargent les séances, corrigent les devoirs et les compositions, et animent le forum de chaque cohorte.',
  summary:
    'En tant que formateur, vous animez les cohortes qui vous sont confiées par la coordination : vous suivez la progression des participants, vous émargez les séances, vous corrigez les devoirs et les compositions, vous planifiez les sessions et vous animez le forum. Vous ne pouvez ni publier un cours ni délivrer un certificat : ces actions restent à la coordination. Ce guide décrit chaque écran, chaque bouton et chaque statut de votre espace « Formateur ».',
  tone: 'green',
  icon: 'users-round',
  readingMinutes: 45,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée (le même compte ouvre le site institutionnel et la plateforme de formation).',
    'Le rôle « Formateur » attribué par la coordination, au moins sur une cohorte ou un cours (sans ce rôle, la page « Accès refusé » s’affiche).',
    'Au moins une cohorte vous ayant été affectée par la coordination (sinon votre espace reste vide).',
    'Un téléphone ou un ordinateur connecté à Internet.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous à la plateforme avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'page **Connexion** de la plateforme',
      result: 'Votre tableau de bord apprenant s’ouvre.',
    },
    {
      text: 'Ouvrez le menu de votre compte puis cliquez sur **Formateur**.',
      where: 'bouton rond avec vos initiales, en haut à droite',
      result: 'Votre espace « Formateur » s’ouvre sur le tableau de bord, avec le menu vert « Formateur » à gauche.',
      note: 'Sur téléphone, touchez le bouton **Ouvrir le menu** (trois traits) puis `Mon espace`.',
    },
    {
      text: 'Repérez la carte « Sessions à venir » et la section « Corrections en attente ».',
      result: 'Vous voyez ce qui vous attend : séances à émarger, devoirs et compositions à corriger.',
    },
    {
      text: 'Ouvrez une cohorte pour émarger, corriger ou écrire aux participants : cliquez sur le nom de la cohorte.',
      where: 'section « Mes cohortes » du tableau de bord',
      result: 'La fiche de la cohorte s’ouvre sur l’onglet `Participants`.',
    },
    {
      text: 'Consultez régulièrement vos notifications sur votre tableau de bord apprenant.',
      where: 'section « Notifications » de **Mon espace apprenant**',
      result: 'Vous y trouvez les devoirs à corriger, les nouveaux fils de forum et les signalements.',
    },
  ],
  sections: [
    // -------------------------------------------------------------------------
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'users-round',
      summary: 'Ce que vous pouvez faire, ce que vous ne pouvez pas faire, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous êtes formateur d’une ou de plusieurs cohortes. Une **cohorte** est un groupe de participants qui suit une même formation ensemble, sur des dates données. La coordination vous affecte les cohortes ; vous ne voyez que celles qui vous sont confiées et les participants qui y sont inscrits.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Suivre la **progression**, le **score** et l’**assiduité** de vos participants.',
            'Planifier, modifier et supprimer les **sessions** (séances) de vos cohortes, et envoyer les convocations.',
            'Émarger une séance : marquer chaque participant Présent, Absent, En retard ou Excusé.',
            'Corriger les **devoirs** remis et les **compositions** (questions à rédiger) des évaluations.',
            'Renvoyer un devoir pour révision, avec un motif, pour que l’apprenant le reprenne.',
            'Écrire un message à tous les participants d’une cohorte (notification, email et fil de forum).',
            'Animer et modérer le **forum** de chaque cohorte : épingler, verrouiller, masquer ou supprimer un message.',
            'Consulter les statistiques d’une cohorte et exporter le rapport en fichier CSV ou PDF.',
            'Suivre votre calendrier de séances et l’exporter vers votre agenda personnel.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire',
          style: 'bullet',
          items: [
            'Publier un cours ou une nouvelle version de contenu : c’est la coordination.',
            'Créer, ouvrir, démarrer, clôturer ou annuler une cohorte.',
            'Ajouter ou retirer un participant d’une cohorte, ni valider une inscription en attente.',
            'Délivrer ou révoquer un **certificat**.',
            'Modifier le contenu d’un cours (leçons, activités, banque de questions) depuis l’interface : l’espace d’administration vous est fermé.',
            'Consulter le journal d’audit, gérer les organisations ou voir les données financières.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait'],
          rows: [
            ['Coordination FETRAG', 'Crée les cohortes, vous les affecte, inscrit les participants, délivre les certificats, publie les cours.'],
            ['Responsable d’organisation', 'Demande la formation de ses membres et suit leur progression, sans accès à vos corrections ni à vos présences.'],
            ['Participants (apprenants)', 'Les membres de votre cohorte : ils suivent les modules, rendent les devoirs, passent les évaluations et échangent sur le forum.'],
            ['Support', 'Aide les participants et vous-même pour la connexion, l’adresse email et le mot de passe.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un seul compte, deux plateformes',
          text: 'Votre compte FETRAG est le même sur le site institutionnel et sur la plateforme de formation. Votre profil, votre mot de passe et la sécurité du compte se gèrent sur le site institutionnel ; l’animation des cohortes se fait ici.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte et connexion',
      icon: 'log-in',
      summary: 'Vous connecter, vérifier votre adresse email, récupérer un mot de passe oublié, vous déconnecter.',
      blocks: [
        {
          type: 'steps',
          title: 'Se connecter',
          items: [
            {
              text: 'Ouvrez la page **Connexion** de la plateforme de formation.',
              where: 'lien **Se connecter**, en haut à droite',
              result: 'Le formulaire avec « Adresse email » et « Mot de passe » s’affiche.',
            },
            {
              text: 'Saisissez votre **Adresse email** puis votre **Mot de passe**.',
              note: 'Les deux champs sont obligatoires.',
            },
            {
              text: 'Cliquez sur `Se connecter`.',
              result: 'Votre tableau de bord apprenant s’ouvre (page **Tableau de bord**), pas directement l’espace « Formateur ».',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Après la connexion, vous arrivez sur le tableau de bord apprenant',
          text: 'C’est normal : la connexion mène toujours à votre espace personnel. L’espace « Formateur » s’ouvre ensuite depuis le menu de votre compte (voir « Se repérer »).',
        },
        {
          type: 'steps',
          title: 'Mot de passe oublié',
          items: [
            {
              text: 'Sur la page **Connexion**, cliquez sur **Mot de passe oublié ?**.',
              result: 'Une page vous demande votre adresse email.',
            },
            {
              text: 'Saisissez l’adresse email de votre compte puis validez.',
              result: 'Si un compte existe, un email contenant un lien de réinitialisation vous est envoyé.',
            },
            {
              text: 'Ouvrez l’email et suivez le lien pour choisir un nouveau mot de passe.',
              note: 'Le lien a une durée de validité limitée : utilisez-le rapidement.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Se déconnecter',
          items: [
            {
              text: 'Ouvrez le menu de votre compte (vos initiales, en haut à droite).',
              note: 'Sur téléphone, touchez le bouton **Ouvrir le menu** (trois traits).',
            },
            {
              text: 'Cliquez sur **Déconnexion**.',
              result: 'Votre session est fermée. Faites-le toujours sur un ordinateur ou un téléphone partagé.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Vérification en deux étapes',
          text: 'Le rôle « Formateur » seul n’exige pas de vérification en deux étapes à la connexion. Si vous cumulez un rôle de coordination, un code supplémentaire pourra vous être demandé : c’est une sécurité, gardez votre téléphone à portée de main.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La page « Accès refusé » s’affiche quand vous cliquez sur **Formateur**.',
              cause: 'Le rôle « Formateur » ne vous est pas encore attribué, ou plus.',
              solution: 'Demandez l’attribution du rôle à la coordination formation. Le message d’erreur propose un bouton `Contacter la coordination`.',
            },
            {
              problem: 'Vous ne recevez pas l’email de réinitialisation du mot de passe.',
              cause: 'Adresse saisie erronée, email dans les indésirables, ou aucun compte pour cette adresse.',
              solution: 'Vérifiez le dossier « courrier indésirable », réessayez avec l’adresse exacte, puis contactez le support si rien n’arrive.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'se-reperer',
      title: 'Se repérer dans votre espace',
      icon: 'compass',
      summary: 'Ouvrir l’espace « Formateur », comprendre la barre latérale, le tableau de bord et la navigation sur mobile.',
      blocks: [
        {
          type: 'screen',
          title: 'Ouvrir l’espace « Formateur »',
          description: 'Depuis n’importe quelle page de la plateforme, une fois connecté.',
          areas: [
            { name: 'Menu du compte (initiales, en haut à droite)', purpose: 'Cliquez dessus, puis sur **Formateur** pour ouvrir votre espace. On y trouve aussi Tableau de bord, Mes formations, Calendrier, Mes certificats et Déconnexion.', icon: 'user' },
            { name: 'Bouton **Ouvrir le menu** (trois traits, sur mobile)', purpose: 'Ouvre le tiroir de navigation. Le bouton `Mon espace` vous mène directement à votre espace « Formateur ».', icon: 'menu' },
            { name: 'Page « Accès refusé »', purpose: 'S’affiche si votre compte n’a pas le rôle nécessaire. Un bouton permet de contacter la coordination.', icon: 'lock' },
          ],
        },
        {
          type: 'screen',
          title: 'La coquille « Formateur » (menu de gauche et barre du haut)',
          description: 'Toutes les pages de votre espace partagent cette structure.',
          areas: [
            { name: 'Barre latérale verte « Formateur »', purpose: 'Le menu de votre espace : **Tableau de bord**, **Mes cohortes**, **Calendrier**, **Forums**, **Guide d’utilisation**. Votre nom apparaît en sous-titre.', icon: 'layout-dashboard' },
            { name: 'Lien **Mon espace apprenant** (bas de la barre latérale)', purpose: 'Revient à votre tableau de bord apprenant, où s’affichent vos notifications.', icon: 'graduation-cap' },
            { name: 'Barre supérieure de l’espace', purpose: 'Affiche le titre « Formateur » et, sur ordinateur, un commutateur `Changer d’espace` si vous avez plusieurs rôles.', icon: 'compass' },
            { name: 'Bouton **Ouvrir le menu** (mobile)', purpose: 'Sur téléphone, la barre latérale devient un tiroir : touchez ce bouton pour l’ouvrir, la croix pour le fermer.', icon: 'menu' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Vos notifications sont sur le tableau de bord apprenant',
          text: 'Les alertes qui vous concernent (devoir à corriger, nouveau fil de forum, message signalé) apparaissent dans la section « Notifications » de **Mon espace apprenant**, et non dans l’espace « Formateur ».',
        },
        {
          type: 'path',
          label: 'Chemin vers vos cohortes',
          items: ['Menu du compte', 'Formateur', 'Mes cohortes'],
          href: '/formateur/cohortes',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'tableau-de-bord',
      title: 'Comprendre votre tableau de bord',
      icon: 'layout-dashboard',
      summary: 'Lire d’un coup d’œil vos cohortes, vos séances à venir et vos corrections en attente.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le tableau de bord (page **Formateur**, titre « Bonjour …, vos cohortes vous attendent ») rassemble l’essentiel de votre travail. Il se lit de haut en bas.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Lisez la rangée de quatre indicateurs, en haut.',
              result: 'Vous voyez « Cohortes assignées », « Participants suivis », « Corrections en attente » et « Sessions à venir ».',
            },
            {
              text: 'Regardez la carte « Progression de vos participants ».',
              result: 'Deux anneaux affichent la progression moyenne et le score moyen de vos cohortes.',
              note: 'L’anneau « Score moyen » n’apparaît que si des scores existent déjà.',
            },
            {
              text: 'Consultez la carte « Sessions à venir » (les cinq prochaines).',
              result: 'Chaque séance affiche la cohorte, la modalité, le lieu et la date.',
            },
            {
              text: 'Pour émarger une séance, cliquez sur `Émarger`.',
              where: 'sur la séance concernée',
              result: 'La fiche de la cohorte s’ouvre sur l’onglet `Présence`, la bonne session déjà sélectionnée.',
            },
            {
              text: 'Parcourez la section « Mes cohortes » (les six premières).',
              result: 'Chaque carte donne le statut, le nombre de membres et la prochaine séance ; cliquez sur `Toutes les cohortes` pour la liste complète.',
            },
            {
              text: 'Traitez la section « Corrections en attente ».',
              result: 'Les devoirs et les compositions à noter sont listés du plus ancien au plus récent, avec un bouton `Corriger`.',
              note: 'Quand tout est corrigé, la mention « Tout est corrigé » s’affiche.',
            },
            {
              text: 'Repérez la section « Activité des forums », si elle apparaît.',
              result: 'Les cinq derniers fils ouverts dans vos forums de cohorte y figurent.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Si vous n’avez aucune cohorte',
          text: 'La mention « Aucune cohorte assignée » signifie que la coordination ne vous a pas encore affecté de cohorte. Vous serez notifié dès l’affectation.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La section « Corrections en attente » est vide alors que des participants vous ont rendu des travaux.',
              cause: 'La file de corrections « toutes cohortes » n’apparaît que pour un formateur ayant le rôle « Formateur » global. Un formateur affecté seulement à une cohorte peut ne pas voir cette liste transverse.',
              solution: 'Ouvrez directement la cohorte concernée, onglet `Corrections` : les devoirs et compositions à noter y sont toujours listés.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'mes-cohortes',
      title: 'Ouvrir et lire une cohorte',
      icon: 'users',
      summary: 'Trouver vos cohortes, ouvrir une fiche et naviguer entre ses onglets.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Cliquez sur **Mes cohortes**.',
              where: 'menu de gauche « Formateur »',
              result: 'La liste « … cohorte(s) à animer » s’affiche, regroupée par statut : « En cours et ouvertes », « Planifiées », « Clôturées ».',
              note: 'Les cohortes annulées ne sont jamais listées.',
            },
            {
              text: 'Repérez la cohorte voulue à sa carte.',
              result: 'Chaque carte indique le code, le cours, le statut, le nombre de membres et de sessions, la prochaine date.',
            },
            {
              text: 'Cliquez sur `Ouvrir la cohorte`.',
              result: 'La fiche s’ouvre sur l’onglet `Participants`.',
            },
            {
              text: 'Naviguez entre les onglets, sous l’en-tête.',
              result: 'Vous disposez de `Participants`, `Présence`, `Corrections`, `Messages`, `Statistiques` et `Sessions`.',
              note: 'Sur téléphone, la barre d’onglets se fait glisser vers la gauche pour voir « Statistiques » et « Sessions ».',
            },
            {
              text: 'Au besoin, ouvrez le `Forum` de la cohorte ou la `Fiche du module`.',
              where: 'boutons en haut de la fiche',
              result: '`Forum` ouvre l’espace d’échange ; `Fiche du module` ouvre la page publique du cours.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’une cohorte',
          items: [
            { label: 'Planifiée', tone: 'neutral', meaning: 'Cohorte créée par la coordination, formation non démarrée.' },
            { label: 'Inscriptions ouvertes', tone: 'info', meaning: 'Les inscriptions sont possibles ; la cohorte est comptée « en cours » sur votre tableau de bord.' },
            { label: 'En cours', tone: 'success', meaning: 'La formation a démarré.' },
            { label: 'Clôturée', tone: 'neutral', meaning: 'La formation est terminée. Les certificats sont délivrés à cette occasion par la coordination.', next: 'Vous pouvez encore consulter les statistiques et réenregistrer une présence.' },
            { label: 'Annulée', tone: 'danger', meaning: 'Cohorte annulée par la coordination : elle n’apparaît plus dans votre espace.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Un message « Cohorte introuvable » s’affiche à l’ouverture.',
              cause: 'La cohorte n’existe pas ou ne vous est pas attribuée.',
              solution: 'Revenez à « Mes cohortes » avec le bouton `Retour à l’espace formateur` et vérifiez que la coordination vous a bien désigné formateur de cette cohorte.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'participants',
      title: 'Suivre la progression des participants',
      icon: 'graduation-cap',
      summary: 'Lire le tableau des membres : progression, score, assiduité et statut.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la cohorte, onglet `Participants`.',
              result: 'Le tableau des membres apprenants s’affiche.',
            },
            {
              text: 'Lisez chaque colonne pour un participant.',
              result: 'Vous voyez « Participant », « Progression », « Score », « Assiduité », « Dernière activité » et « Statut ».',
            },
            {
              text: 'Sur téléphone, faites glisser le tableau vers la gauche.',
              result: 'La colonne « Statut » et le badge « Certifié » deviennent visibles.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un tableau en lecture seule',
          text: 'Cet onglet sert à consulter. Vous ne pouvez pas y ajouter ni retirer un participant, ni ouvrir une fiche détaillée par personne : ces actions relèvent de la coordination.',
        },
        {
          type: 'statuses',
          title: 'Statuts d’inscription et repères',
          items: [
            { label: 'Actif', tone: 'success', meaning: 'Le participant suit la formation.' },
            { label: 'Terminé', tone: 'success', meaning: 'Le participant a achevé la formation.' },
            { label: 'En attente', tone: 'warning', meaning: 'Inscription à valider par la coordination.' },
            { label: 'Suspendue', tone: 'warning', meaning: 'Inscription temporairement interrompue.' },
            { label: 'Annulé', tone: 'danger', meaning: 'Inscription annulée.' },
            { label: 'Expirée', tone: 'neutral', meaning: 'Inscription arrivée à échéance.' },
            { label: 'Sans inscription', tone: 'neutral', meaning: 'Membre de la cohorte qui n’est pas inscrit au cours.' },
            { label: 'Certifié', tone: 'success', meaning: 'Un certificat a été délivré pour ce participant.' },
          ],
        },
        {
          type: 'definitions',
          items: [
            { term: 'Progression', definition: 'Part des activités du cours que le participant a terminées, en pourcentage.' },
            { term: 'Score', definition: 'Moyenne des résultats du participant aux activités notées, en pourcentage (« - » si aucune note).' },
            { term: 'Assiduité', definition: 'Part des séances passées auxquelles le participant était présent ou en retard (« - » tant qu’aucune séance n’est passée).' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'emarger',
      title: 'Émarger une séance (feuille de présence)',
      icon: 'clipboard-list',
      summary: 'Choisir la séance, marquer le statut de chaque participant et enregistrer la feuille.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la cohorte, onglet `Présence` — ou cliquez sur `Émarger` depuis le tableau de bord.',
              result: 'La feuille d’émargement s’ouvre, une séance déjà sélectionnée.',
              note: 'La séance présélectionnée est celle en cours ou débutant dans les 36 heures ; sinon la dernière séance passée.',
            },
            {
              text: 'Vérifiez la séance dans la liste **Session**, en haut.',
              result: 'Changer de séance recharge la feuille.',
            },
            {
              text: 'Utilisez au besoin les boutons `Tous présents`, `Tous absents` ou `Tous excusés`.',
              where: 'groupe « Actions de masse »',
              result: 'Tous les participants prennent le statut choisi, que vous pouvez ensuite ajuster.',
              note: 'Il n’existe pas de bouton « Tous en retard ».',
            },
            {
              text: 'Pour chaque participant, choisissez `Présent`, `Absent`, `En retard` ou `Excusé`.',
              result: 'Le bouton retenu se colore (vert, rouge, or ou bleu).',
            },
            {
              text: 'Ajoutez si besoin une **Note** dans la colonne prévue.',
              note: 'Facultatif, 300 caractères au maximum (par exemple « retard justifié », « départ anticipé »).',
            },
            {
              text: 'Cliquez sur `Enregistrer la feuille`.',
              where: 'en bas de la feuille (pleine largeur sur mobile)',
              result: 'Le message « Présences enregistrées pour … participant(s) » s’affiche ; les compteurs et la colonne « Enregistré par » se mettent à jour.',
              note: 'Seules les lignes où vous avez choisi un statut sont envoyées.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'success',
          title: 'Une feuille rouvrable à tout moment',
          text: 'Vous pouvez rouvrir et réenregistrer une feuille quand vous voulez, y compris après la clôture de la cohorte : le nouvel enregistrement remplace le précédent. L’émargement ne déclenche aucune notification aux participants.',
        },
        {
          type: 'statuses',
          title: 'Statuts de présence',
          items: [
            { label: 'Présent', tone: 'success', meaning: 'Le participant était là ; compte dans l’assiduité et valide l’activité « séance en direct » liée.' },
            { label: 'En retard', tone: 'warning', meaning: 'Arrivé en retard ; compté comme présent dans le taux d’assiduité.' },
            { label: 'Absent', tone: 'danger', meaning: 'Absent ; ne compte pas dans l’assiduité.' },
            { label: 'Excusé', tone: 'info', meaning: 'Absence justifiée ; ne compte pas dans l’assiduité.' },
            { label: 'Non renseigné', tone: 'neutral', meaning: 'Aucun statut choisi pour ce participant sur cette séance.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Auto-émargement des apprenants',
          text: 'En classe virtuelle ou en formation hybride, les participants peuvent s’émarger eux-mêmes, de 15 minutes avant le début jusqu’à la fin (« En retard » au-delà de 15 minutes après le début). La colonne « Enregistré par » affiche alors leur nom. En présentiel, c’est vous qui émargez.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Renseignez au moins un statut avant d’enregistrer » s’affiche.',
              cause: 'Aucun participant n’a de statut coché.',
              solution: 'Choisissez un statut pour au moins un participant, puis réenregistrez.',
            },
            {
              problem: 'La feuille est en lecture seule (« seul le formateur de la cohorte ou la coordination peut émarger »).',
              cause: 'Vous n’êtes pas le formateur désigné de cette cohorte et n’avez pas le droit d’émargement.',
              solution: 'Demandez à la coordination de vous désigner formateur de la cohorte.',
            },
            {
              problem: 'Aucune séance n’apparaît pour émarger.',
              cause: 'La cohorte n’a pas encore de session.',
              solution: 'Cliquez sur `Ajouter une session` (proposé dans l’onglet Présence) ou ouvrez l’onglet `Sessions`.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'corriger-devoirs',
      title: 'Corriger un devoir remis',
      icon: 'file-check',
      summary: 'Lire la remise, noter, commenter, et au besoin renvoyer le devoir pour révision.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un **devoir** est un travail que l’apprenant dépose (texte et / ou fichier). Vous le notez et vous lui laissez un retour. Les quiz à réponses fermées sont corrigés automatiquement : vous ne notez à la main que les devoirs et les compositions.',
        },
        {
          type: 'steps',
          title: 'Noter un devoir',
          items: [
            {
              text: 'Ouvrez le devoir : cliquez sur `Corriger`.',
              where: 'tableau de bord, ou onglet `Corrections` de la cohorte, carte « Devoirs à noter »',
              result: 'La carte « Correction du devoir » s’ouvre en haut de la page.',
            },
            {
              text: 'Lisez la remise : le texte déposé et, s’il existe, le fichier.',
              result: 'Un bouton portant le nom du fichier l’ouvre dans un nouvel onglet.',
              note: 'Vérifiez la date de remise, l’échéance et l’éventuel badge « En retard ».',
            },
            {
              text: 'Si une **grille de critères** existe, saisissez les points de chaque critère.',
              result: 'La ligne « Total grille » alimente automatiquement la note.',
              note: 'Chaque critère se note de 0 aux points prévus, par pas de 0,5.',
            },
            {
              text: 'Sinon, saisissez directement la **Note sur …** (obligatoire).',
              note: 'La note est un nombre entier, de 0 au barème. Une note supérieure au barème est refusée.',
            },
            {
              text: 'Rédigez un **Commentaire pour l’apprenant** (facultatif).',
              note: 'Points forts, axes d’amélioration, références à consulter. 5000 caractères au maximum.',
            },
            {
              text: 'Cliquez sur `Enregistrer la note` (ou `Mettre à jour la note` si le devoir était déjà noté).',
              result: 'Le message « Note enregistrée : …/… » s’affiche ; le devoir passe au statut « Noté » et rejoint la carte « Devoirs corrigés ».',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Réenregistrer une note écrase la précédente',
          text: 'Si vous corrigez à nouveau un devoir déjà noté, la nouvelle note remplace l’ancienne. L’ancienne valeur n’est conservée que dans le journal d’audit, auquel vous n’avez pas accès. Vérifiez donc votre saisie avant d’enregistrer.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'L’apprenant est prévenu automatiquement',
          text: 'Après l’enregistrement, l’apprenant reçoit une notification « Devoir corrigé » et un email « Résultat disponible » indiquant sa note, le statut Réussi ou Non validé et votre commentaire. La progression et le score de son inscription sont recalculés.',
        },
        {
          type: 'steps',
          title: 'Renvoyer un devoir pour révision',
          items: [
            {
              text: 'Dans la carte « Correction du devoir », cliquez sur `Renvoyer pour révision`.',
              where: 'en bas à gauche du formulaire',
              result: 'Une boîte de dialogue s’ouvre.',
            },
            {
              text: 'Remplissez « Ce qui doit être repris ».',
              note: 'Obligatoire (au moins 5 caractères). Précisez les attentes : structure, sources, analyse.',
            },
            {
              text: 'Cliquez sur `Renvoyer`.',
              result: 'Le message « Devoir renvoyé à l’apprenant » s’affiche ; le devoir passe au statut « Rendu ».',
              note: 'L’apprenant est notifié par « Devoir à reprendre » et peut déposer une nouvelle version.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’une remise de devoir',
          items: [
            { label: 'Soumis', tone: 'info', meaning: 'Remis dans les délais, à corriger.', next: 'Ouvrez la remise et notez-la.' },
            { label: 'En retard', tone: 'warning', meaning: 'Remis après l’échéance, mais toléré par le devoir.', next: 'Notez-le comme un devoir soumis.' },
            { label: 'Noté', tone: 'success', meaning: 'La note est enregistrée ; l’apprenant ne peut plus redéposer.' },
            { label: 'Rendu', tone: 'neutral', meaning: 'Renvoyé pour révision ; l’apprenant peut déposer une nouvelle version.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Ce devoir n’a pas encore été remis » s’affiche.',
              cause: 'Le devoir est encore en brouillon chez l’apprenant : il ne peut pas être noté.',
              solution: 'Attendez que l’apprenant le remette, ou relancez-le par un message de cohorte.',
            },
            {
              problem: 'La note est refusée avec « La note ne peut pas dépasser … ».',
              cause: 'La note saisie est supérieure au barème du devoir.',
              solution: 'Saisissez une note comprise entre 0 et le barème indiqué sous le champ.',
            },
            {
              problem: 'Le renvoi est refusé avec « Précisez ce que l’apprenant doit reprendre ».',
              cause: 'Le motif est vide ou trop court.',
              solution: 'Écrivez un motif d’au moins 5 caractères, puis renvoyez.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'corriger-compositions',
      title: 'Corriger les compositions d’une évaluation',
      icon: 'pen',
      summary: 'Noter, question par question, les réponses à rédiger d’une tentative soumise.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **composition** est une question à rédiger dans une évaluation. Les autres types de questions sont corrigés automatiquement ; seules les compositions se notent à la main. Tant qu’une composition reste à noter, la tentative n’est pas finalisée.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la tentative : cliquez sur `Corriger`.',
              where: 'tableau de bord, ou onglet `Corrections`, carte « Compositions à noter »',
              result: 'La carte « Correction des compositions » s’ouvre.',
            },
            {
              text: 'Pour chaque question marquée « À corriger », lisez la réponse.',
              result: 'Le nombre de mots, le minimum et le maximum attendus et les critères indicatifs s’affichent.',
            },
            {
              text: 'Saisissez la **Note sur …** de la question.',
              note: 'Nombre entier, de 0 aux points de la question.',
            },
            {
              text: 'Ajoutez un **Commentaire** si vous le souhaitez (facultatif, 5000 caractères au maximum).',
            },
            {
              text: 'Cliquez sur `Noter la composition`.',
              result: 'Tant qu’il reste des questions : « Note enregistrée, … composition(s) restent à corriger ». À la dernière : « Composition notée : la tentative est corrigée ».',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Le résultat n’est envoyé qu’à la fin',
          text: 'L’apprenant reçoit la notification et l’email « Résultat disponible » seulement quand toutes les compositions de sa tentative sont notées. Le score, la réussite et l’achèvement sont alors recalculés.',
        },
        {
          type: 'statuses',
          title: 'Repères d’une question de composition',
          items: [
            { label: 'À corriger', tone: 'warning', meaning: 'La question attend votre note.' },
            { label: 'Noté X / Y', tone: 'success', meaning: 'La question est notée ; vous pouvez la renoter en rouvrant la tentative.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La carte affiche « Aucune composition à corriger ».',
              cause: 'Toutes les questions de la tentative ont été corrigées automatiquement.',
              solution: 'Il n’y a rien à faire : la tentative est déjà finalisée.',
            },
            {
              problem: 'Vous ne voyez pas les compositions d’une cohorte que vous enseignez.',
              cause: 'La liste des compositions d’une cohorte exige le droit d’enseignement sur la cohorte ; une affectation portant seulement sur le cours ne suffit pas.',
              solution: 'Demandez à la coordination une affectation au niveau de la cohorte.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'messages',
      title: 'Écrire aux participants d’une cohorte',
      icon: 'send',
      summary: 'Envoyer une annonce à tous les participants : notification, email et fil de forum.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la cohorte, onglet `Messages`.',
              result: 'Le formulaire « Écrire aux participants » s’affiche, avec le nombre de destinataires.',
            },
            {
              text: 'Saisissez l’**Objet** (obligatoire, 3 à 160 caractères).',
              note: 'Par exemple « Rappel : atelier de négociation vendredi ».',
            },
            {
              text: 'Saisissez le **Message** (obligatoire, 10 à 4000 caractères).',
            },
            {
              text: 'Laissez cochée « Envoyer aussi par email » pour un rappel important.',
              note: 'Décochez-la pour une simple notification dans l’espace.',
            },
            {
              text: 'Laissez cochée « Publier dans le forum de la cohorte » pour créer un fil.',
              note: 'La case est désactivée si aucun forum n’est rattaché à la cohorte.',
            },
            {
              text: 'Cliquez sur `Envoyer`.',
              result: 'Le message « Message envoyé à … participant(s) » (et « et publié dans le forum ») s’affiche ; les champs se vident.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un envoi à sens unique',
          text: 'Vous n’avez pas de boîte de réception : les participants ne vous répondent pas par ce formulaire. Les échanges se poursuivent sur le forum de la cohorte.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'L’envoi est refusé avec « Titre trop court » ou « Message trop court ».',
              cause: 'L’objet fait moins de 3 caractères, ou le message moins de 10.',
              solution: 'Complétez les deux champs en respectant les longueurs minimales.',
            },
            {
              problem: 'L’envoi échoue avec « Ce forum est verrouillé ».',
              cause: 'Vous demandez de publier dans un forum verrouillé.',
              solution: 'Décochez « Publier dans le forum de la cohorte », ou déverrouillez d’abord le forum.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'sessions',
      title: 'Planifier, modifier ou supprimer une session',
      icon: 'calendar',
      summary: 'Créer une séance, la relier à une activité en direct, envoyer les convocations, corriger ou retirer une séance.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **session** (ou séance) est un rendez-vous de formation : présentiel, classe virtuelle ou hybride. Vous planifiez vous-même les séances de vos cohortes, sans passer par la coordination.',
        },
        {
          type: 'steps',
          title: 'Ajouter une session',
          items: [
            {
              text: 'Ouvrez la cohorte, onglet `Sessions`, puis cliquez sur `Ajouter une session`.',
              result: 'La boîte de dialogue « Nouvelle session de formation » s’ouvre.',
            },
            {
              text: 'Renseignez l’**Intitulé** (obligatoire, 2 à 200 caractères).',
              note: 'Par exemple « Séance 1 : cadre juridique du dialogue social ».',
            },
            {
              text: 'Renseignez le **Début** et la **Fin** (obligatoires).',
              note: 'Heures de Libreville. La fin doit être postérieure au début.',
            },
            {
              text: 'Choisissez la **Modalité** : Présentiel, Classe virtuelle ou Hybride.',
            },
            {
              text: 'Complétez si besoin **Intervenant**, **Lieu** et **Lien de visioconférence**.',
              note: 'Le lien de visioconférence est attendu pour une classe virtuelle ou une formation hybride. Il doit être une adresse valide.',
            },
            {
              text: 'Choisissez au besoin une **Activité liée (séance en direct)**.',
              note: 'Doit être une activité « séance en direct » de la version suivie par la cohorte. La présence validera alors l’achèvement de cette activité.',
            },
            {
              text: 'Laissez cochée « Envoyer la convocation aux membres », puis cliquez sur `Créer la session`.',
              result: 'Le message « Session « … » ajoutée et convocations envoyées » s’affiche ; la séance apparaît numérotée, badge « À venir ».',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Modifier ou supprimer une session',
          items: [
            {
              text: 'Cliquez sur `Modifier` sur la séance concernée.',
              result: 'Les champs sont préremplis ; la case « Envoyer la convocation » est décochée par défaut.',
            },
            {
              text: 'Changez ce qui doit l’être puis cliquez sur `Enregistrer`.',
              result: 'Le message « Session mise à jour » s’affiche.',
            },
            {
              text: 'Pour retirer une séance, cliquez sur `Supprimer`, puis confirmez.',
              result: 'Le message « Session supprimée » s’affiche.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'La suppression d’une session est définitive',
          text: 'Une session supprimée ne peut pas être récupérée. La suppression est refusée dès qu’un émargement a été enregistré pour la séance (« Des présences ont été enregistrées : la session ne peut pas être supprimée »). Préférez alors la modification.',
        },
        {
          type: 'statuses',
          title: 'Repères d’une session',
          items: [
            { label: 'À venir', tone: 'info', meaning: 'La fin de la séance n’est pas encore passée.' },
            { label: 'Réalisée', tone: 'neutral', meaning: 'La fin de la séance est passée.' },
            { label: 'Activité liée', tone: 'info', meaning: 'La séance est rattachée à une activité « séance en direct » : la présence valide l’achèvement.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un rappel automatique la veille',
          text: 'La plateforme envoie automatiquement un rappel unique à tous les membres de la cohorte pour chaque séance débutant dans les 24 heures, vous compris. Vous n’avez rien à faire.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La création est refusée avec « La fin doit être postérieure au début ».',
              cause: 'L’heure de fin est égale ou antérieure à l’heure de début.',
              solution: 'Corrigez l’heure de fin.',
            },
            {
              problem: 'Le message « L’activité liée doit être une séance en direct de la version suivie par la cohorte » s’affiche.',
              cause: 'L’activité choisie n’est pas une « séance en direct » du bon cours.',
              solution: 'Choisissez « Aucune », ou une activité « séance en direct » proposée dans la liste.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'forums',
      title: 'Animer et modérer le forum de cohorte',
      icon: 'message-square',
      summary: 'Ouvrir un fil, répondre, épingler, verrouiller, masquer ou supprimer un message.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chaque cohorte dispose d’un **forum** : l’espace d’échange des participants. Vous en êtes le modérateur. Le badge doré « Vous modérez ce forum », en haut du forum, confirme vos droits.',
        },
        {
          type: 'steps',
          title: 'Ouvrir un fil et répondre',
          items: [
            {
              text: 'Ouvrez le forum : bouton `Forum` de la fiche cohorte, ou menu **Forums** de la barre latérale.',
              result: 'Le forum s’affiche, groupe « Mes cohortes ».',
            },
            {
              text: 'Pour lancer un sujet, cliquez sur `Ouvrir un nouveau fil`.',
              result: 'Le formulaire « Nouveau fil de discussion » s’ouvre.',
            },
            {
              text: 'Renseignez le **Titre** (3 à 200 caractères) et le **Message** (2 à 20000 caractères), puis `Publier le fil`.',
              result: 'Le fil créé s’ouvre.',
            },
            {
              text: 'Pour répondre, utilisez le champ « Votre réponse » puis `Publier`.',
              result: 'Le message « Réponse publiée » s’affiche ; l’auteur du fil est notifié.',
              note: 'Le bouton `Répondre` sous un message crée une réponse imbriquée.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Modérer un fil ou un message',
          items: [
            {
              text: 'Sur un fil, ouvrez « Actions de modération du fil » (bouton rond, trois points).',
              result: 'Le menu « Modération » s’ouvre.',
            },
            {
              text: 'Choisissez « Épingler le fil », « Verrouiller les réponses » ou « Masquer tous les messages ».',
              result: 'Le message « Modération appliquée » s’affiche ; les mentions « Épinglé » ou « Verrouillé » apparaissent.',
              note: '« Masquer tous les messages » verrouille aussi le fil.',
            },
            {
              text: 'Sur un message précis, utilisez « Masquer ce message » ou « Rétablir ce message ».',
              result: 'Un message masqué affiche « [Message masqué par la modération] » aux autres ; son auteur est notifié.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Supprimer est définitif',
          text: 'La suppression d’un fil (« Supprimer définitivement ») ou d’un message (bouton « Supprimer ce message », sans confirmation) est irréversible. Pour conserver une trace, préférez « Masquer » : le message reste visible pour vous, caché aux autres.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Signalements',
          text: 'Quand un participant signale un message, vous recevez la notification « Message signalé » avec le motif et le lien du fil. Ouvrez le fil, lisez le message, puis masquez-le si nécessaire.',
        },
        {
          type: 'statuses',
          title: 'Statuts du forum',
          items: [
            { label: 'Épinglé', tone: 'info', meaning: 'Le fil est affiché en tête de liste.' },
            { label: 'Verrouillé', tone: 'warning', meaning: 'La lecture reste possible, mais aucune nouvelle réponse ne peut être publiée.' },
            { label: 'Masqué', tone: 'danger', meaning: 'Le message est caché aux participants ; vous en voyez le contenu et le motif.' },
            { label: 'Vous modérez ce forum', tone: 'info', meaning: 'Vous disposez des droits de modération sur ce forum.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Vous ne trouvez pas de bouton pour rétablir tous les messages d’un fil.',
              cause: 'Il n’existe pas d’action « rétablir tout ».',
              solution: 'Après « Masquer tous les messages », rétablissez chaque message un par un, puis « Déverrouiller » le fil.',
            },
            {
              problem: 'Une réponse est refusée avec « Ce fil est verrouillé ».',
              cause: 'Le fil a été verrouillé.',
              solution: 'Déverrouillez-le depuis le menu de modération si vous souhaitez rouvrir les réponses.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'statistiques',
      title: 'Consulter les statistiques et exporter le rapport',
      icon: 'bar-chart',
      summary: 'Lire le rapport de cohorte et télécharger les fichiers CSV et PDF.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la cohorte, onglet `Statistiques`.',
              result: 'Le « Rapport de cohorte au … » s’affiche.',
            },
            {
              text: 'Lisez les anneaux et la liste de détails.',
              result: 'Progression moyenne, taux d’achèvement, score moyen, assiduité moyenne, membres, réussite aux évaluations, sessions réalisées et certificats.',
            },
            {
              text: 'Parcourez le tableau « Assiduité par session ».',
              result: 'Chaque séance affiche présents, retards, absents, excusés et un taux de présence.',
            },
            {
              text: 'Cliquez sur `CSV` ou `PDF` pour télécharger le rapport.',
              result: 'Le fichier « rapport-cohorte-… » se télécharge. Chaque export est journalisé.',
            },
          ],
        },
        {
          type: 'definitions',
          items: [
            { term: 'Taux d’achèvement', definition: 'Part des membres ayant terminé la formation.' },
            { term: 'Réussite aux évaluations', definition: 'Part des membres notés dont le score atteint au moins 60 %.' },
            { term: 'Taux de présence d’une séance', definition: 'Présents et retards rapportés aux statuts renseignés pour la séance.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Statistiques indisponibles » s’affiche.',
              cause: 'Le rapport n’a pas pu être calculé.',
              solution: 'Rechargez la page ; si le problème persiste, signalez-le au support avec le code de la cohorte.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'calendrier',
      title: 'Suivre votre calendrier',
      icon: 'calendar',
      summary: 'Voir vos séances mois par mois et les exporter vers votre agenda.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Cliquez sur **Calendrier**.',
              where: 'menu de gauche « Formateur »',
              result: 'La vue mensuelle « Vos séances et échéances » s’affiche.',
            },
            {
              text: 'Changez de mois avec les boutons « Mois précédent » et « Mois suivant ».',
              result: 'Les séances de vos cohortes s’affichent en pastilles bleues « Séance de formation ».',
            },
            {
              text: 'Cliquez sur `Aujourd’hui` pour revenir au mois courant.',
              where: 'en haut du calendrier (visible hors du mois en cours)',
              result: 'La grille revient au mois d’aujourd’hui.',
            },
            {
              text: 'Cliquez sur `Exporter (.ics)` pour ajouter vos séances à un agenda.',
              result: 'Le fichier « fetrag-formation.ics » se télécharge (30 jours passés à 6 mois à venir).',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Ce que montre le calendrier',
          text: 'Le calendrier affiche les séances des cohortes où vous êtes formateur désigné ou membre, ainsi que les échéances de vos propres devoirs d’apprenant. Les séances des cours que vous enseignez sans être désigné sur la cohorte n’y figurent pas, mais restent visibles dans « Sessions à venir » de votre tableau de bord.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'contenu-des-cours',
      title: 'Le contenu des cours',
      icon: 'book-open',
      summary: 'Ce que vous pouvez consulter, et pourquoi la modification du contenu ne vous est pas ouverte.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous animez une version figée du cours : le contenu suivi par la cohorte ne change pas en cours de route. Vous pouvez consulter la fiche publique du module, mais pas modifier ses leçons ni ses activités depuis l’interface.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la cohorte puis cliquez sur `Fiche du module`.',
              where: 'en haut de la fiche cohorte',
              result: 'La page publique du cours s’ouvre : objectifs, plan et activités.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'La modification du contenu passe par la coordination',
          text: 'L’espace d’administration des cours (arborescence, activités, banque de questions) exige un droit de publication réservé à la coordination. Pour faire évoluer un contenu, une leçon ou une évaluation, adressez votre demande à la coordination : elle prépare une nouvelle version.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'notifications',
      title: 'Notifications et emails',
      icon: 'bell',
      summary: 'Ce que vous recevez, ce que vos actions envoient aux apprenants, et où les retrouver.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vos notifications apparaissent dans la section « Notifications » de **Mon espace apprenant**. Certaines sont aussi envoyées par email. Cliquez sur une notification pour ouvrir la page concernée.',
        },
        {
          type: 'table',
          caption: 'Ce que vous recevez',
          columns: ['Notification', 'Quand', 'Ce qu’il faut faire'],
          rows: [
            ['Nouvelle cohorte / Cohorte attribuée', 'La coordination vous désigne formateur d’une cohorte.', 'Ouvrez la cohorte et vérifiez les participants et les dates.'],
            ['Devoir à corriger', 'Un participant remet un devoir.', 'Ouvrez la correction depuis votre tableau de bord.'],
            ['Correction en attente', 'Un participant soumet une évaluation contenant des compositions.', 'Notez les compositions de la tentative.'],
            ['Nouveau fil de discussion', 'Un participant ouvre un fil dans le forum de cohorte.', 'Lisez le fil et répondez si nécessaire.'],
            ['Nouvelle réponse', 'Quelqu’un répond à un fil dont vous êtes l’auteur.', 'Ouvrez le fil.'],
            ['Message signalé', 'Un participant signale un message.', 'Ouvrez le fil, lisez le motif, masquez le message si besoin.'],
            ['Rappel : … le …', 'Une séance débute dans les 24 heures.', 'Préparez la séance ; le rappel part aussi aux participants.'],
          ],
        },
        {
          type: 'table',
          caption: 'Ce que vos actions envoient aux apprenants',
          columns: ['Votre action', 'Ce que reçoit l’apprenant'],
          rows: [
            ['Créer une session (convocation cochée)', 'Notification « Convocation à une session » et email « Convocation : … ».'],
            ['Noter un devoir', 'Notification « Devoir corrigé » et email « Résultat disponible ».'],
            ['Renvoyer un devoir', 'Notification et email « Devoir à reprendre » avec votre motif.'],
            ['Noter la dernière composition d’une tentative', 'Notification et email « Résultat disponible ».'],
            ['Écrire aux participants', 'Notification (et email si vous l’avez coché), et fil de forum si vous l’avez coché.'],
            ['Masquer un message', 'Notification « Message masqué » à l’auteur.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Aucune notification pour certaines actions',
          text: 'L’émargement, la modification ou la suppression d’une séance sans convocation, et l’export d’un rapport n’envoient aucune notification aux participants.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield-check',
      summary: 'Protéger votre compte, respecter les participants et bien tenir vos cohortes.',
      blocks: [
        {
          type: 'list',
          title: 'Sécurité du compte',
          style: 'check',
          items: [
            'Déconnectez-vous toujours sur un ordinateur ou un téléphone partagé.',
            'Ne communiquez jamais votre mot de passe, même à un collègue ou au support.',
            'Si vous cumulez un rôle de coordination, activez la vérification en deux étapes proposée.',
            'Signalez sans tarder au support toute activité anormale sur votre compte.',
          ],
        },
        {
          type: 'list',
          title: 'Données des participants',
          style: 'check',
          items: [
            'Traitez les noms, adresses et résultats des participants comme des données confidentielles.',
            'N’exportez un rapport que pour un usage légitime, et ne le diffusez pas au-delà des personnes concernées.',
            'Gardez vos commentaires de correction factuels, utiles et respectueux.',
          ],
        },
        {
          type: 'list',
          title: 'Animation des cohortes',
          style: 'check',
          items: [
            'Émargez chaque séance rapidement : l’assiduité alimente les statistiques et les certificats.',
            'Corrigez les travaux dans un délai raisonnable et laissez un retour même en cas de bonne note.',
            'Vérifiez votre note avant d’enregistrer : elle écrase la précédente.',
            'Sur le forum, rappelez la courtoisie ; masquez plutôt que supprimez pour garder une trace.',
            'En cas de doute sur un plagiat ou une fraude, ne notez pas et prévenez la coordination.',
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'questions-frequentes',
      title: 'Questions fréquentes',
      icon: 'help-circle',
      summary: 'Les questions les plus courantes des formateurs.',
      blocks: [
        {
          type: 'faq',
          items: [
            {
              question: 'Un participant n’apparaît pas dans ma cohorte. Puis-je l’ajouter ?',
              answer: 'Non. L’ajout et le retrait de participants relèvent de la coordination. Signalez-lui la personne manquante.',
            },
            {
              question: 'Je ne trouve pas le bouton pour délivrer un certificat.',
              answer: 'C’est normal : les certificats sont délivrés par la coordination, en général à la clôture de la cohorte. Prévenez-la quand la cohorte est prête.',
            },
            {
              question: 'Puis-je corriger une note déjà enregistrée ?',
              answer: 'Oui. Rouvrez le devoir dans « Devoirs corrigés » avec `Revoir`, saisissez la nouvelle note et enregistrez. La nouvelle note remplace l’ancienne.',
            },
            {
              question: 'Comment envoyer un rappel urgent à toute la cohorte ?',
              answer: 'Onglet `Messages` de la cohorte : rédigez l’objet et le message, gardez « Envoyer aussi par email » coché, puis `Envoyer`.',
            },
            {
              question: 'Pourquoi ma feuille de présence est-elle en lecture seule ?',
              answer: 'Vous n’êtes pas le formateur désigné de cette cohorte et n’avez pas le droit d’émargement. Demandez à la coordination de vous désigner formateur.',
            },
            {
              question: 'Un participant n’arrive pas à se connecter.',
              answer: 'Il peut réinitialiser son mot de passe depuis le lien **Mot de passe oublié ?** de la page Connexion. Le support peut aussi l’aider.',
            },
            {
              question: 'Puis-je supprimer une séance après avoir émargé ?',
              answer: 'Non. Dès qu’un émargement existe, la suppression est refusée. Modifiez la séance plutôt que de la supprimer.',
            },
            {
              question: 'Où sont mes notifications ?',
              answer: 'Dans la section « Notifications » de votre tableau de bord apprenant (**Mon espace apprenant**), pas dans l’espace « Formateur ».',
            },
            {
              question: 'Un apprenant s’est émargé lui-même : est-ce normal ?',
              answer: 'Oui, en classe virtuelle ou hybride, de 15 minutes avant le début jusqu’à la fin. La colonne « Enregistré par » affiche alors son nom.',
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
      summary: 'Les mots employés dans votre espace.',
      blocks: [
        {
          type: 'definitions',
          items: [
            { term: 'Cohorte', definition: 'Groupe de participants qui suit une même formation ensemble, sur des dates données.' },
            { term: 'Session (séance)', definition: 'Un rendez-vous de formation : présentiel, classe virtuelle ou hybride.' },
            { term: 'Émargement', definition: 'L’enregistrement de la présence des participants à une séance.' },
            { term: 'Assiduité', definition: 'Part des séances passées auxquelles un participant était présent ou en retard.' },
            { term: 'Devoir', definition: 'Un travail que l’apprenant dépose (texte ou fichier) et que vous notez à la main.' },
            { term: 'Composition', definition: 'Une question à rédiger dans une évaluation ; elle se note à la main, question par question.' },
            { term: 'Grille de critères', definition: 'Découpage de la note d’un devoir en critères notés séparément, dont la somme donne la note.' },
            { term: 'Renvoyer pour révision', definition: 'Rendre un devoir à l’apprenant avec un motif, pour qu’il dépose une nouvelle version.' },
            { term: 'Convocation', definition: 'La notification et l’email envoyés aux membres pour les prévenir d’une séance.' },
            { term: 'Forum de cohorte', definition: 'L’espace d’échange réservé aux participants d’une cohorte et à leur formateur.' },
            { term: 'Modération', definition: 'Les actions sur le forum : épingler, verrouiller, masquer ou supprimer un fil ou un message.' },
            { term: 'Séance en direct', definition: 'Un type d’activité du cours qu’une séance peut valider par la présence.' },
            { term: 'Certificat', definition: 'L’attestation de réussite, délivrée par la coordination, jamais par le formateur.' },
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
            ['Connexion impossible, adresse email non confirmée, mot de passe', 'Le support, via le formulaire de contact du site institutionnel.'],
            ['Le lien **Formateur** n’apparaît pas, ou la page « Accès refusé » s’affiche', 'La coordination formation, pour l’attribution du rôle « Formateur ».'],
            ['Une cohorte, un participant ou un certificat manquant', 'La coordination formation, en citant le code de la cohorte.'],
            ['Émettre un certificat, ajouter un participant, publier un contenu', 'La coordination formation : ces actions ne vous sont pas ouvertes.'],
            ['Message d’erreur inattendu (« Une erreur est survenue »)', 'Le support, avec l’heure, l’écran concerné et le message exact.'],
          ],
        },
        {
          type: 'list',
          title: 'Ce qu’il faut indiquer dans votre message',
          style: 'check',
          items: [
            'L’adresse email de votre compte.',
            'Le code de la cohorte concernée, si votre question porte sur une cohorte.',
            'L’écran concerné (par exemple « onglet Corrections » ou « feuille de présence ») et l’appareil utilisé (téléphone ou ordinateur).',
            'Le message d’erreur exact, recopié tel quel.',
            'Jamais votre mot de passe.',
          ],
        },
        {
          type: 'links',
          title: 'Contacts',
          items: [
            { label: 'Écrire à la FETRAG', href: '{{web}}/contact', description: 'Formulaire de contact du site institutionnel (support, coordination, secrétariat général).', external: true, icon: 'mail' },
            { label: 'Email de la Fédération', href: 'mailto:jossngomafm@gmail.com', description: 'jossngomafm@gmail.com', icon: 'mail' },
            { label: 'Téléphone', href: 'tel:+24166230033', description: '066 23 00 33 ou 077 52 27 98 (heures de bureau, heure de Libreville).', icon: 'phone' },
            { label: 'Adresse postale', href: '{{web}}/contact', description: 'BP 1234 Libreville, Gabon.', external: true, icon: 'map-pin' },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Avant d’écrire',
          text: 'Rechargez la page et relisez la section « Si ça ne marche pas » de la tâche concernée dans ce guide : la réponse s’y trouve souvent.',
        },
      ],
    },
  ],
  related: [
    {
      label: 'Guide de l’apprenant',
      href: '/guide',
      description: 'Suivre une formation sur la plateforme : utile pour accompagner vos participants.',
    },
    {
      label: 'Guide du membre sur le site institutionnel',
      href: '{{web}}/espace/guide',
      description: 'Votre compte, votre profil, votre mot de passe et la sécurité, gérés depuis le site.',
      external: true,
    },
  ],
  selfAssessment: {
    intro:
      'Vingt-quatre questions pour vérifier ce que vous avez retenu : où cliquer, ce que signifie un statut, ce qui est définitif, à qui s’adresser. Comptez une quinzaine de minutes.',
    passPercent: 70,
    questions: [
      {
        id: 'q-acces-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Après la connexion, comment ouvrez-vous votre espace « Formateur » ?',
        options: [
          { id: 'a', text: 'Menu du compte (initiales en haut à droite), puis **Formateur**.', correct: true },
          { id: 'b', text: 'Vous y êtes déjà : la connexion mène directement à l’espace « Formateur ».', correct: false },
          { id: 'c', text: 'Par le lien **Catalogue** de la barre de navigation.', correct: false },
        ],
        explanation: 'La connexion mène au tableau de bord apprenant ; l’espace « Formateur » s’ouvre depuis le menu du compte. Voir « Se repérer ».',
      },
      {
        id: 'q-acces-2',
        sectionId: 'avant-de-commencer',
        type: 'true-false',
        prompt: 'Le rôle « Formateur » seul exige une vérification en deux étapes à chaque connexion.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La vérification en deux étapes n’est pas exigée pour le rôle « Formateur » seul. Voir « Avant de commencer ».',
      },
      {
        id: 'q-notifs-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Où trouvez-vous vos notifications (devoir à corriger, message signalé) ?',
        options: [
          { id: 'a', text: 'Dans la section « Notifications » de **Mon espace apprenant**.', correct: true },
          { id: 'b', text: 'Dans la barre latérale « Formateur ».', correct: false },
          { id: 'c', text: 'Dans l’onglet `Statistiques` de la cohorte.', correct: false },
        ],
        explanation: 'Les notifications s’affichent sur le tableau de bord apprenant, pas dans l’espace « Formateur ». Voir « Se repérer » et « Notifications ».',
      },
      {
        id: 'q-emarger-1',
        sectionId: 'emarger',
        type: 'multiple',
        prompt: 'Quels boutons d’actions de masse sont proposés sur la feuille de présence ?',
        options: [
          { id: 'a', text: '`Tous présents`', correct: true },
          { id: 'b', text: '`Tous absents`', correct: true },
          { id: 'c', text: '`Tous excusés`', correct: true },
          { id: 'd', text: '`Tous en retard`', correct: false },
        ],
        explanation: 'Il n’existe pas de bouton « Tous en retard ». Voir « Émarger une séance ».',
      },
      {
        id: 'q-emarger-2',
        sectionId: 'emarger',
        type: 'true-false',
        prompt: 'L’émargement envoie une notification aux participants.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'L’émargement ne déclenche aucune notification. Voir « Émarger une séance ».',
      },
      {
        id: 'q-emarger-3',
        sectionId: 'emarger',
        type: 'single',
        prompt: 'Que signifie le statut « En retard » sur une feuille de présence ?',
        options: [
          { id: 'a', text: 'Le participant est compté comme présent dans le taux d’assiduité.', correct: true },
          { id: 'b', text: 'Le participant est compté comme absent.', correct: false },
          { id: 'c', text: 'La séance n’est pas prise en compte.', correct: false },
        ],
        explanation: 'Présents et retards comptent dans l’assiduité. Voir « Émarger une séance ».',
      },
      {
        id: 'q-devoir-1',
        sectionId: 'corriger-devoirs',
        type: 'single',
        prompt: 'Que se passe-t-il si vous réenregistrez la note d’un devoir déjà noté ?',
        options: [
          { id: 'a', text: 'La nouvelle note remplace l’ancienne.', correct: true },
          { id: 'b', text: 'Les deux notes s’additionnent.', correct: false },
          { id: 'c', text: 'La modification est refusée.', correct: false },
        ],
        explanation: 'La nouvelle note écrase la précédente. Voir « Corriger un devoir remis ».',
      },
      {
        id: 'q-devoir-2',
        sectionId: 'corriger-devoirs',
        type: 'single',
        prompt: 'À quel statut passe un devoir que vous renvoyez pour révision ?',
        options: [
          { id: 'a', text: 'Rendu', correct: true },
          { id: 'b', text: 'Noté', correct: false },
          { id: 'c', text: 'Soumis', correct: false },
        ],
        explanation: 'Un devoir renvoyé passe à « Rendu » ; l’apprenant peut redéposer. Voir « Corriger un devoir remis ».',
      },
      {
        id: 'q-devoir-3',
        sectionId: 'corriger-devoirs',
        type: 'true-false',
        prompt: 'Un devoir encore en brouillon chez l’apprenant peut être noté.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Un brouillon ne peut pas être noté (« Ce devoir n’a pas encore été remis »). Voir « Corriger un devoir remis ».',
      },
      {
        id: 'q-compo-1',
        sectionId: 'corriger-compositions',
        type: 'single',
        prompt: 'Quand l’apprenant reçoit-il le résultat de son évaluation à compositions ?',
        options: [
          { id: 'a', text: 'Quand toutes les compositions de sa tentative sont notées.', correct: true },
          { id: 'b', text: 'Dès que vous notez la première composition.', correct: false },
          { id: 'c', text: 'Uniquement à la clôture de la cohorte.', correct: false },
        ],
        explanation: 'Le résultat n’est envoyé qu’à la dernière composition notée. Voir « Corriger les compositions ».',
      },
      {
        id: 'q-session-1',
        sectionId: 'sessions',
        type: 'true-false',
        prompt: 'Vous pouvez supprimer une séance même après avoir enregistré un émargement.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La suppression est refusée dès qu’un émargement existe. Voir « Planifier, modifier ou supprimer une session ».',
      },
      {
        id: 'q-session-2',
        sectionId: 'sessions',
        type: 'single',
        prompt: 'Qui planifie les séances de vos cohortes ?',
        options: [
          { id: 'a', text: 'Vous, le formateur, depuis l’onglet `Sessions`.', correct: true },
          { id: 'b', text: 'Uniquement la coordination.', correct: false },
          { id: 'c', text: 'Le responsable d’organisation.', correct: false },
        ],
        explanation: 'Vous planifiez vous-même les séances de vos cohortes. Voir « Planifier, modifier ou supprimer une session ».',
      },
      {
        id: 'q-forum-1',
        sectionId: 'forums',
        type: 'single',
        prompt: 'Pour garder une trace d’un message inapproprié tout en le retirant de la vue des participants, que faites-vous ?',
        options: [
          { id: 'a', text: 'Vous le masquez.', correct: true },
          { id: 'b', text: 'Vous le supprimez.', correct: false },
          { id: 'c', text: 'Vous épinglez le fil.', correct: false },
        ],
        explanation: 'La suppression est définitive ; « Masquer » conserve le contenu pour vous. Voir « Animer et modérer le forum ».',
      },
      {
        id: 'q-contenu-1',
        sectionId: 'contenu-des-cours',
        type: 'true-false',
        prompt: 'Vous pouvez modifier les leçons d’un cours depuis l’interface.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La modification du contenu passe par la coordination ; vous ne voyez que la fiche publique. Voir « Le contenu des cours ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'single',
        prompt: 'À qui demandez-vous l’attribution du rôle « Formateur » ?',
        options: [
          { id: 'a', text: 'À la coordination formation.', correct: true },
          { id: 'b', text: 'Au responsable d’organisation.', correct: false },
          { id: 'c', text: 'À un autre formateur.', correct: false },
        ],
        explanation: 'L’attribution du rôle relève de la coordination. Voir « Besoin d’aide ? ».',
      },
      {
        id: 'q-role-1',
        sectionId: 'votre-role',
        type: 'single',
        prompt: 'Parmi ces actions, laquelle relève bien de vous, le formateur ?',
        options: [
          { id: 'a', text: 'Émarger une séance et corriger les devoirs de vos cohortes.', correct: true },
          { id: 'b', text: 'Délivrer un certificat de réussite à un participant.', correct: false },
          { id: 'c', text: 'Ajouter ou retirer un participant d’une cohorte.', correct: false },
        ],
        explanation: 'Vous émargez et corrigez ; délivrer un certificat ou inscrire un participant relève de la coordination. Voir « Votre rôle en bref ».',
      },
      {
        id: 'q-tableau-1',
        sectionId: 'tableau-de-bord',
        type: 'single',
        prompt: 'Sur le tableau de bord, comment ouvrez-vous directement la feuille d’émargement d’une séance ?',
        options: [
          { id: 'a', text: 'En cliquant sur `Émarger` sur la séance, dans « Sessions à venir ».', correct: true },
          { id: 'b', text: 'En cliquant sur l’anneau « Score moyen ».', correct: false },
          { id: 'c', text: 'En cliquant sur `Toutes les cohortes`.', correct: false },
        ],
        explanation: 'Le bouton `Émarger` d’une session ouvre la cohorte sur l’onglet `Présence`, la bonne séance sélectionnée. Voir « Comprendre votre tableau de bord ».',
      },
      {
        id: 'q-cohortes-1',
        sectionId: 'mes-cohortes',
        type: 'single',
        prompt: 'Dans « Mes cohortes », quelles cohortes ne sont jamais listées ?',
        options: [
          { id: 'a', text: 'Les cohortes annulées.', correct: true },
          { id: 'b', text: 'Les cohortes clôturées.', correct: false },
          { id: 'c', text: 'Les cohortes planifiées.', correct: false },
        ],
        explanation: 'Les cohortes annulées n’apparaissent plus dans votre espace ; les clôturées et les planifiées restent listées. Voir « Ouvrir et lire une cohorte ».',
      },
      {
        id: 'q-participants-1',
        sectionId: 'participants',
        type: 'true-false',
        prompt: 'Depuis l’onglet `Participants`, vous pouvez ajouter ou retirer un membre de la cohorte.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'L’onglet `Participants` est en lecture seule ; ajouter ou retirer un membre relève de la coordination. Voir « Suivre la progression des participants ».',
      },
      {
        id: 'q-messages-1',
        sectionId: 'messages',
        type: 'single',
        prompt: 'Dans l’onglet `Messages`, que reçoivent les participants si vous laissez les deux cases cochées ?',
        options: [
          { id: 'a', text: 'Une notification, un email et un fil publié dans le forum de la cohorte.', correct: true },
          { id: 'b', text: 'Un simple appel téléphonique de la coordination.', correct: false },
          { id: 'c', text: 'Rien tant que la cohorte n’est pas clôturée.', correct: false },
        ],
        explanation: 'Le message part en notification, en email et crée un fil de forum quand les deux cases restent cochées. Voir « Écrire aux participants d’une cohorte ».',
      },
      {
        id: 'q-stats-1',
        sectionId: 'statistiques',
        type: 'single',
        prompt: 'Dans le rapport de cohorte, que mesure la « Réussite aux évaluations » ?',
        options: [
          { id: 'a', text: 'La part des membres notés dont le score atteint au moins 60 %.', correct: true },
          { id: 'b', text: 'La part des membres présents à la dernière séance.', correct: false },
          { id: 'c', text: 'Le nombre de certificats déjà délivrés.', correct: false },
        ],
        explanation: 'La réussite aux évaluations est la part des membres notés atteignant au moins 60 %. Voir « Consulter les statistiques et exporter le rapport ».',
      },
      {
        id: 'q-calendrier-1',
        sectionId: 'calendrier',
        type: 'single',
        prompt: 'Que faites-vous pour ajouter vos séances à votre agenda personnel ?',
        options: [
          { id: 'a', text: 'Vous cliquez sur `Exporter (.ics)` pour télécharger « fetrag-formation.ics ».', correct: true },
          { id: 'b', text: 'Vous téléchargez le rapport de cohorte au format CSV.', correct: false },
          { id: 'c', text: 'Vous demandez le fichier à la coordination.', correct: false },
        ],
        explanation: 'Le bouton `Exporter (.ics)` produit « fetrag-formation.ics » à importer dans votre agenda. Voir « Suivre votre calendrier ».',
      },
      {
        id: 'q-notifications-1',
        sectionId: 'notifications',
        type: 'multiple',
        prompt: 'Parmi ces actions, lesquelles envoient une notification à l’apprenant ?',
        options: [
          { id: 'a', text: 'Noter un devoir.', correct: true },
          { id: 'b', text: 'Renvoyer un devoir pour révision.', correct: true },
          { id: 'c', text: 'Émarger une séance.', correct: false },
          { id: 'd', text: 'Exporter un rapport de cohorte.', correct: false },
        ],
        explanation: 'Noter ou renvoyer un devoir prévient l’apprenant ; l’émargement et l’export n’envoient aucune notification. Voir « Notifications et emails ».',
      },
      {
        id: 'q-lexique-1',
        sectionId: 'lexique',
        type: 'single',
        prompt: 'Dans le lexique, comment est définie une « cohorte » ?',
        options: [
          { id: 'a', text: 'Un groupe de participants qui suit une même formation ensemble, sur des dates données.', correct: true },
          { id: 'b', text: 'Un rendez-vous de formation en présentiel ou à distance.', correct: false },
          { id: 'c', text: 'Une question à rédiger dans une évaluation.', correct: false },
        ],
        explanation: 'La cohorte est un groupe suivant une même formation sur des dates données ; le rendez-vous est la « session ». Voir « Lexique ».',
      },
    ],
  },
}
