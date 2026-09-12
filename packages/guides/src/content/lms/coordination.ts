import type { Guide } from '@fetrag/contracts'

/**
 * Guide de la coordination formation sur la plateforme (rôle COORDINATOR, portée globale).
 *
 * Périmètre documenté (inventaire du code, apps/lms) : espace Coordination (tableau de bord,
 * demandes de formation et instruction, cohortes, sessions, certificats, organisations, rapports)
 * et espace Administration accessible grâce à course.publish (cours et builder, banque de questions,
 * modèles de certificats, consultation des comptes et du journal). Le cycle complet est décrit :
 * demande → décision → cohorte → sessions → suivi → certificats, ainsi que la synchronisation du
 * catalogue vers le site institutionnel. Seul ce qui existe dans le code est documenté.
 */
export const lmsCoordination: Guide = {
  id: 'lms-coordination',
  platform: 'lms',
  role: 'COORDINATOR',
  title: 'Guide de la coordination formation',
  subtitle: 'Instruire les demandes, planifier les cohortes, animer et certifier',
  audience:
    'Les coordinatrices et coordinateurs formation de la Fédération (rôle « Coordinateur formation ») qui pilotent le programme de formation sur la plateforme : instruction des demandes des organisations, cours, cohortes, sessions, présences, certificats, organisations et rapports.',
  summary:
    'Vous instruisez les demandes de formation des organisations affiliées, puis vous les transformez en cohortes avec des sessions, un formateur et un suivi de l’assiduité. Vous construisez les cours, publiez leurs versions, émettez les certificats et suivez les indicateurs du programme. Votre travail relie une demande institutionnelle à la remise d’une attestation, en gardant la trace de chaque décision.',
  tone: 'gold',
  icon: 'clipboard-list',
  readingMinutes: 55,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée, avec le rôle **Coordinateur formation** attribué par le super administrateur.',
    'Le même compte ouvre le site institutionnel et la plateforme de formation (une seule connexion pour les deux).',
    'Une application d’authentification installée sur votre téléphone (par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP) pour la vérification en deux étapes, à activer sur le site.',
    'Un téléphone ou un ordinateur connecté à Internet, avec un navigateur récent.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous à la plateforme avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'bouton en haut à droite ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits)',
      result: 'Votre avatar (vos initiales) apparaît en haut à droite.',
    },
    {
      text: 'Ouvrez votre espace de coordination.',
      ui: 'Coordination',
      where: 'menu de votre compte (cliquez sur votre avatar en haut à droite), ligne **Coordination**',
      result: 'Le tableau de bord « Coordination formation » s’affiche avec le menu de gauche : Tableau de bord, Demandes, Cohortes, Sessions, Certificats, Organisations, Rapports.',
    },
    {
      text: 'Regardez la case **Demandes à traiter** et les points de vigilance.',
      where: 'en haut du tableau de bord',
      result: 'Vous voyez le nombre de demandes en attente et, le cas échéant, une alerte orange « points de vigilance ».',
    },
    {
      text: 'Ouvrez la première demande à instruire.',
      ui: 'Instruire',
      where: 'section « Demandes à traiter » du tableau de bord, ou menu de gauche › **Demandes**',
      result: 'La fiche de la demande s’ouvre avec le panneau « Décision de la coordination ».',
    },
    {
      text: 'Pour bâtir un cours, passez dans l’espace Administration.',
      ui: 'Administration',
      where: 'menu de votre compte (avatar en haut à droite), ligne **Administration**',
      result: 'La page « Administration LMS » s’affiche avec les rubriques Cours, Banque de questions, Modèles de certificats.',
    },
  ],
  sections: [
    // -------------------------------------------------------------------------
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'clipboard-list',
      summary: 'Ce que la plateforme vous permet de faire, ce qu’elle vous interdit, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le rôle **Coordinateur formation** pilote le programme de formation de la Fédération. Vous recevez les demandes des organisations affiliées, vous décidez de leur suite, vous les transformez en **cohortes** (groupes de participants qui suivent la même formation ensemble), vous planifiez les **sessions**, vous suivez l’assiduité et vous délivrez les **certificats** et **attestations**. Vous construisez aussi les cours et publiez leurs versions dans l’espace Administration.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Instruire une demande de formation : demander un complément, accepter, proposer une autre date, refuser, ou la planifier en cohortes.',
            'Créer des cohortes, y inscrire des participants, désigner un formateur, planifier des sessions et convoquer.',
            'Émarger une session (saisir les présences) pour n’importe quelle cohorte.',
            'Clôturer une cohorte et émettre les certificats des participants éligibles ; révoquer un certificat avec un motif.',
            'Créer et modifier des organisations affiliées, y rattacher des gestionnaires.',
            'Construire les cours (modules, leçons, activités), publier leurs versions et les rendre visibles au catalogue.',
            'Gérer la banque de questions, les modèles de certificats et consulter les rapports et exports.',
            'Attribuer le rôle **Formateur** à un compte, sur un cours ou une cohorte.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire',
          style: 'bullet',
          items: [
            'Créer un compte, activer ou désactiver un compte, attribuer les autres rôles (hors Formateur), réinitialiser la vérification en deux étapes d’une personne : réservé au super administrateur.',
            'Modifier les paramètres du système ni rembourser une commande : réservé à la super administration et au rôle Finance.',
            'Déposer une demande de formation à la place d’une organisation : c’est le gestionnaire de l’organisation qui la dépose.',
            'Publier ou modifier les pages et actualités du site institutionnel : réservé à l’éditeur communication.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Deux espaces, un seul compte',
          text: 'Votre travail se répartit entre l’espace **Coordination** (demandes, cohortes, sessions, certificats, organisations, rapports) et l’espace **Administration** (cours, questions, modèles). Vous passez de l’un à l’autre par le menu de votre compte, sans vous reconnecter.',
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait', 'Quand le solliciter'],
          rows: [
            [
              'Gestionnaire d’organisation',
              'Dépose les demandes de formation de son organisation, suit ses participants et ses rapports.',
              'Une demande incomplète (« Demander un complément »), un participant à ajouter, un rapport d’organisation à commenter.',
            ],
            [
              'Formateur',
              'Anime les cohortes, corrige les devoirs et compositions, saisit les présences.',
              'Une cohorte à animer, une correction en attente, un émargement à faire par la personne sur place.',
            ],
            [
              'Super administrateur',
              'Crée les comptes, attribue les rôles (hors Formateur), règle les paramètres, traite les jobs.',
              'Un compte à créer, un rôle autre que Formateur à attribuer, un paramètre à modifier.',
            ],
            [
              'Rôle Finance / contrôle',
              'Gère les commandes, les paiements et les remboursements des cours payants.',
              'Une commande ou un remboursement lié à une inscription payante.',
            ],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte, connexion et sécurité',
      icon: 'log-in',
      summary: 'Se connecter, activer la vérification en deux étapes, régler l’accès refusé, se déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous utilisez votre compte FETRAG habituel : celui du site institutionnel ouvre aussi la plateforme de formation. Le rôle de coordination fait partie des rôles sensibles : selon le réglage de sécurité en vigueur, une **vérification en deux étapes** peut vous être demandée à la connexion.',
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
                  text: 'Ouvrez la plateforme et cliquez sur `Se connecter`.',
                  where: 'bouton en haut à droite ; sur mobile, ouvrez d’abord le menu avec le bouton **Ouvrir le menu** (trois traits) en haut à droite',
                  result: 'Le formulaire de connexion s’affiche.',
                },
                {
                  text: 'Saisissez votre **Adresse email** puis votre **Mot de passe**. Les deux champs sont obligatoires.',
                  note: 'Le bouton « Afficher le mot de passe » permet de vérifier ce que vous tapez.',
                },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  result: 'Votre avatar (vos initiales) remplace le bouton `Se connecter` en haut à droite.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Mot de passe oublié',
              text: 'Cliquez sur `Mot de passe oublié ?` sous le formulaire. Un lien de réinitialisation est envoyé à votre adresse email. Un mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.',
            },
          ],
        },
        {
          id: 'activer-la-verification-en-deux-etapes',
          title: 'Activer la vérification en deux étapes',
          blocks: [
            {
              type: 'paragraph',
              text: 'La **vérification en deux étapes** (aussi appelée MFA) ajoute un **code temporaire** à six chiffres, en plus du mot de passe. Elle s’active depuis le site institutionnel, dans votre espace de sécurité, et protège votre compte même si votre mot de passe est connu.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone.',
                  note: 'Par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP. Elle affiche un code qui change toutes les 30 secondes.',
                },
                {
                  text: 'Ouvrez la page de sécurité de votre compte sur le site institutionnel.',
                  ui: 'Activer la vérification sur fetrag.ga',
                  where: 'bouton de la page « Vérification en deux étapes » ; ou menu du compte › **Sécurité** sur le site',
                  result: 'La page « Sécurité » s’ouvre sur le site.',
                },
                {
                  text: 'Scannez le QR code avec l’application, puis conservez précieusement les **codes de secours** affichés.',
                  result: 'Le badge « MFA active » apparaît sur votre compte.',
                  note: 'Les codes de secours servent à vous connecter si vous perdez votre téléphone. Notez-les hors de l’appareil.',
                },
                {
                  text: 'À la prochaine connexion, saisissez le **Code de vérification** (six chiffres) affiché par l’application.',
                  result: 'La connexion aboutit.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Téléphone perdu',
              text: 'Si vous perdez votre téléphone et vos codes de secours, vous ne pourrez plus vous connecter. Seul le super administrateur peut réinitialiser votre vérification en deux étapes. Contactez-le sans tarder.',
            },
          ],
        },
        {
          id: 'acces-refuse-et-deconnexion',
          title: 'Accès refusé et déconnexion',
          blocks: [
            {
              type: 'paragraph',
              text: 'Si une page vous répond « Accès refusé », c’est que votre compte n’a pas le droit nécessaire. La page indique en tant que qui vous êtes connecté et propose de contacter la coordination. Vérifiez d’abord que vous êtes connecté avec le bon compte.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Pour changer de compte, cliquez sur `Changer de compte` sur la page « Accès refusé ».',
                  result: 'Vous êtes déconnecté et pouvez vous reconnecter avec un autre compte.',
                },
                {
                  text: 'Pour vous déconnecter normalement, ouvrez le menu de votre compte et cliquez sur `Déconnexion`.',
                  where: 'avatar en haut à droite (« Menu de {votre nom} ») ; sur mobile, en bas du tiroir « Menu de navigation »',
                  result: 'Vous revenez à la page d’accueil, déconnecté.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'danger',
              title: 'Appareil partagé',
              text: 'Déconnectez-vous toujours après votre travail sur un ordinateur ou un téléphone partagé. Votre compte donne accès à des données personnelles de participants et d’organisations.',
            },
            {
              type: 'troubleshooting',
              title: 'Si ça ne marche pas',
              items: [
                {
                  problem: 'Le message « Votre session a expiré : reconnectez-vous pour continuer. » s’affiche.',
                  cause: 'Vous êtes resté inactif trop longtemps ou la connexion a été coupée.',
                  solution: 'Reconnectez-vous, puis reprenez votre action. Ce qui n’était pas enregistré est à ressaisir.',
                },
                {
                  problem: 'Le message « Accès refusé » s’affiche alors que vous êtes coordination.',
                  cause: 'Vous êtes peut-être connecté avec un autre compte, ou le rôle n’a pas encore été attribué.',
                  solution: 'Vérifiez votre adresse dans le menu du compte. Si elle est correcte, demandez l’attribution du rôle au super administrateur.',
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
      title: 'Se repérer dans vos espaces',
      icon: 'compass',
      summary: 'Le tableau de bord de coordination, l’espace Administration et la navigation sur ordinateur comme sur mobile.',
      blocks: [
        {
          type: 'screen',
          title: 'Le tableau de bord « Coordination formation »',
          description: 'Ce que vous voyez en ouvrant l’espace Coordination.',
          areas: [
            { name: 'Menu de gauche « Coordination »', purpose: 'Vos rubriques : Tableau de bord, Demandes, Cohortes, Sessions, Certificats, Organisations, Rapports. Un badge sur **Demandes** indique le nombre de demandes en attente.', icon: 'layout-dashboard' },
            { name: 'Barre du haut', purpose: 'Le titre « Coordination » et, sur grand écran, le commutateur `Changer d’espace` (Apprenant, Organisation, Formateur, Coordination, Administration).', icon: 'compass' },
            { name: 'Boutons d’en-tête', purpose: 'Raccourcis `Traiter les demandes` et `Nouvelle cohorte`.', icon: 'zap' },
            { name: 'Tuiles d’indicateurs', purpose: 'Demandes à traiter, cohortes en cours, apprenants actifs, certificats émis ce mois.', icon: 'bar-chart' },
            { name: 'Alerte « Points de vigilance »', purpose: 'Encadré orange listant les demandes en retard, les cohortes sans formateur, les sessions sans émargement, les participants sans certificat. Chaque ligne est un lien.', icon: 'alert-triangle' },
            { name: 'Cartes « Sessions du jour », « Demandes par statut », « Derniers certificats »', purpose: 'Aperçus cliquables du travail en cours.', icon: 'calendar' },
          ],
        },
        {
          type: 'screen',
          title: 'L’espace « Administration LMS »',
          description: 'Où vous construisez les cours, la banque de questions et les modèles de certificats.',
          areas: [
            { name: 'Menu de gauche « Administration »', purpose: 'Vue d’ensemble, Cours, Banque de questions, Modèles de certificats, Utilisateurs et rôles, Paramètres, Journal d’audit.', icon: 'settings' },
            { name: 'Boutons d’en-tête', purpose: 'Raccourcis `Nouveau cours` et `Nouvelle question`.', icon: 'plus' },
            { name: 'Section « Accès rapides »', purpose: 'Cartes vers chaque rubrique avec un lien « Ouvrir ».', icon: 'list-checks' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Sur mobile',
          text: 'Le menu de gauche est masqué : ouvrez-le avec le bouton **Ouvrir le menu** (trois traits) en haut à gauche de la barre de l’espace, et refermez-le avec « Fermer le menu ». Le commutateur `Changer d’espace` n’apparaît pas : passez d’un espace à l’autre par le menu de votre compte (avatar en haut à droite) ou par le pied du menu de gauche.',
        },
        {
          type: 'path',
          label: 'Passer à l’espace Administration',
          items: ['Avatar en haut à droite', 'Administration'],
          href: '/admin',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'comprendre-le-cycle',
      title: 'Comprendre le cycle d’une formation',
      icon: 'list-tree',
      summary: 'De la demande d’une organisation à la remise des certificats : les grandes étapes et où elles se font.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une formation institutionnelle suit toujours le même chemin. Comprendre ce chemin vous aide à savoir où agir à chaque instant. Chaque décision est horodatée et notifiée à l’organisation.',
        },
        {
          type: 'table',
          caption: 'Les six étapes du cycle',
          columns: ['Étape', 'Ce qui se passe', 'Où agir'],
          rows: [
            ['1. Demande', 'Un gestionnaire d’organisation dépose une demande ; elle arrive dans votre file.', 'Menu **Demandes**'],
            ['2. Décision', 'Vous demandez un complément, acceptez, proposez une autre date ou refusez.', 'Fiche de la demande, panneau « Décision de la coordination »'],
            ['3. Planification', 'Vous transformez la demande acceptée en cohortes ; les comptes et inscriptions sont créés.', 'Décision `Planifier`'],
            ['4. Sessions', 'Vous planifiez les séances et envoyez les convocations.', 'Fiche de cohorte, onglet **Sessions**'],
            ['5. Suivi', 'Le formateur (ou vous) émarge ; la progression et l’assiduité se calculent.', 'Espace Formateur, onglet **Présence**'],
            ['6. Certificats', 'Vous clôturez la cohorte et émettez les certificats des éligibles.', 'Fiche de cohorte, `Clôturer` puis onglet **Certificats**'],
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Le fil rouge',
          text: 'La demande passe automatiquement à « Formation en cours » quand vous démarrez la cohorte, et à « Terminée » quand vous la clôturez. Vous n’avez pas à mettre à jour la demande à la main après la planification.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'traiter-une-demande',
      title: 'Comment instruire une demande de formation',
      icon: 'inbox',
      summary: 'Ouvrir une demande, vérifier le dossier, puis choisir une décision et la planifier.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **demande de formation** est déposée par le gestionnaire d’une organisation : elle liste les modules souhaités, les participants et une période. Votre file les présente des plus anciennes aux plus récentes. Le badge de la rubrique **Demandes** compte celles qui attendent une action.',
        },
      ],
      subsections: [
        {
          id: 'ouvrir-et-lire-une-demande',
          title: 'Ouvrir et lire une demande',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la rubrique **Demandes**.',
                  where: 'menu de gauche de l’espace Coordination',
                  result: 'La file des demandes s’affiche avec une barre de filtres.',
                },
                {
                  text: 'Au besoin, filtrez par **Statut** ou **Organisation**, ou tapez une référence dans **Recherche**.',
                  note: 'La recherche porte sur la référence, le nom du contact et le nom de l’organisation. Il n’y a pas de filtre par période.',
                },
                {
                  text: 'Cliquez sur `Instruire` sur la ligne voulue, ou sur la référence.',
                  result: 'La fiche de la demande s’ouvre.',
                },
                {
                  text: 'Vérifiez le dossier : organisation, personne ressource, modules demandés, participants, préférences de date et de modalité, pièces jointes, historique.',
                  note: 'Une pièce jointe s’ouvre par le bouton `Ouvrir` : le lien reste valable 15 minutes.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Modules non planifiables',
              text: 'Si un encadré signale que des modules ne sont pas publiés ou n’ont pas de version publiée, vous ne pourrez pas planifier la demande. Publiez d’abord une version de ces cours depuis l’espace Administration.',
            },
          ],
        },
        {
          id: 'choisir-une-decision',
          title: 'Choisir une décision',
          blocks: [
            {
              type: 'paragraph',
              text: 'Le panneau **Décision de la coordination**, en haut de la fiche, ne propose que les décisions autorisées à ce stade. Choisissez un **Type de décision**, remplissez les champs qui apparaissent, puis validez avec le bouton qui porte le nom de la décision.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Pour réclamer des précisions, choisissez `Demander un complément` et écrivez ce qui manque dans **Informations attendues** (obligatoire, 3000 caractères au plus).',
                  result: 'La demande passe à « Complément demandé » ; l’organisation reprend l’assistant et retransmet.',
                },
                {
                  text: 'Pour retenir la demande, choisissez `Accepter` (commentaire facultatif).',
                  result: 'La demande passe à « Acceptée » : il reste à la planifier.',
                },
                {
                  text: 'Pour proposer un autre calendrier, choisissez `Proposer une autre date`, renseignez la **Date proposée** (obligatoire) et la **Modalité**.',
                  result: 'La demande passe à « Autre date proposée » ; l’organisation accepte la proposition ou annule.',
                },
                {
                  text: 'Pour écarter la demande, choisissez `Refuser` et saisissez le **Motif du refus** (obligatoire).',
                  result: 'La demande passe à « Refusée » et l’organisation est informée. Ce statut est définitif.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Préférez le complément au refus',
              text: 'Quand un dossier est seulement incomplet, utilisez `Demander un complément` plutôt que `Refuser` : l’organisation peut corriger et retransmettre, alors qu’un refus est définitif.',
            },
          ],
        },
        {
          id: 'planifier-une-demande',
          title: 'Planifier une demande acceptée',
          blocks: [
            {
              type: 'paragraph',
              text: 'La **planification** transforme une demande acceptée en cohortes. Le système crée une cohorte privée par module, crée les comptes des participants qui n’en ont pas, les inscrit, et rattache le formateur si vous en désignez un.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur une demande « Acceptée », choisissez `Planifier` dans le panneau de décision.',
                  result: 'Les champs de planification apparaissent, avec l’encadré « Ce que déclenche la planification ».',
                },
                {
                  text: 'Renseignez la **Date de démarrage** (obligatoire) et la **Modalité**.',
                  note: 'Le souhait de l’organisation est rappelé sous chaque champ.',
                },
                {
                  text: 'Choisissez un **Formateur** ou laissez « À désigner plus tard ». Ajustez au besoin le **Nom de la cohorte**.',
                  note: 'Le nom par défaut reprend l’organisation, le module et l’année. Le formateur reste modifiable ensuite.',
                },
                {
                  text: 'Cliquez sur `Planifier`.',
                  result: 'Un message indique le nombre de cohortes créées, de participants inscrits et de comptes créés. La demande passe à « Planifiée ».',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Participants sans adresse email',
              text: 'Un participant sans adresse email ne peut pas recevoir de compte : il est ignoré à la planification et listé dans « Éléments non traités ». Complétez son adresse dans la demande avant de planifier, ou ajoutez-le ensuite depuis la fiche de la cohorte.',
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Aucun mot de passe n’est envoyé',
              text: 'Les participants sans compte reçoivent un email « définissez votre mot de passe » avec un lien valable 7 jours. La convocation aux séances, elle, ne part pas à la planification : elle part à la création de chaque session.',
            },
          ],
        },
        {
          id: 'statuts-des-demandes',
          title: 'Lire les statuts d’une demande',
          blocks: [
            {
              type: 'statuses',
              title: 'Les statuts d’une demande',
              items: [
                { label: 'Soumise', tone: 'info', meaning: 'Transmise à la coordination, en attente d’instruction.', next: 'Ouvrez-la et choisissez une décision.' },
                { label: 'Complément demandé', tone: 'warning', meaning: 'Vous attendez des précisions de l’organisation.', next: 'Patientez : l’organisation complète puis retransmet (retour à « Soumise »).' },
                { label: 'Acceptée', tone: 'success', meaning: 'Demande retenue ; la planification reste à faire.', next: 'Utilisez `Planifier`.' },
                { label: 'Autre date proposée', tone: 'warning', meaning: 'Vous avez proposé une autre date ou modalité.', next: 'L’organisation accepte la proposition ou annule.' },
                { label: 'Refusée', tone: 'danger', meaning: 'Demande non retenue, motif transmis. Statut définitif.' },
                { label: 'Planifiée', tone: 'info', meaning: 'Cohortes, comptes et inscriptions créés ; en attente du démarrage.', next: 'Complétez la cohorte puis démarrez-la.' },
                { label: 'Formation en cours', tone: 'info', meaning: 'La cohorte liée a été démarrée.' },
                { label: 'Terminée', tone: 'success', meaning: 'La cohorte liée a été clôturée. Statut final.' },
                { label: 'Annulée', tone: 'neutral', meaning: 'Demande close sans suite.' },
              ],
            },
            {
              type: 'troubleshooting',
              title: 'Si ça ne marche pas',
              items: [
                {
                  problem: 'Le message « Un commentaire est requis pour cette décision » s’affiche.',
                  cause: 'Un complément ou un refus a été choisi sans texte.',
                  solution: 'Remplissez le champ « Informations attendues » ou « Motif du refus » avant de valider.',
                },
                {
                  problem: 'Le message « Le module « … » n’a pas de version publiée » s’affiche à la planification.',
                  cause: 'Un des modules demandés n’a pas de version courante publiée.',
                  solution: 'Ouvrez ce cours dans l’espace Administration, publiez une version, puis revenez planifier.',
                },
                {
                  problem: 'Aucune décision n’est proposée (encadré « Aucune décision possible »).',
                  cause: 'La demande est dans un état final ou attend une action de l’organisation.',
                  solution: 'Vérifiez le statut : rien n’est attendu de vous tant que l’organisation n’a pas répondu.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'creer-une-cohorte',
      title: 'Comment créer une cohorte manuellement',
      icon: 'users-round',
      summary: 'Constituer une cohorte hors demande, choisir le module, sa version et le calendrier.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **cohorte** réunit des participants sur une **version figée** d’un module, avec un formateur, des sessions et un forum. Elle naît d’une demande planifiée, ou d’une création manuelle quand il n’y a pas de demande institutionnelle.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Cohortes** puis cliquez sur `Créer une cohorte`.',
              where: 'menu de gauche › **Cohortes** ; ou bouton `Nouvelle cohorte` du tableau de bord',
              result: 'Le formulaire de création s’ouvre.',
            },
            {
              text: 'Choisissez le **Module (cours)** (obligatoire), puis la **Version suivie**.',
              note: 'Par défaut, la version courante publiée. La version est figée pour toute la cohorte. Sans version publiée, la création est impossible.',
            },
            {
              text: 'Renseignez au besoin le **Nom**, l’**Organisation bénéficiaire**, le **Formateur**, la **Modalité**, le **Statut**, les dates de **Début** et **Fin**, la **Capacité**, le **Lieu** et une **Description**.',
              note: 'Le nom se génère automatiquement si vous le laissez vide. La capacité vide signifie « illimité ».',
            },
            {
              text: 'Laissez cochée la case **Cohorte privée** si la cohorte ne doit pas apparaître au catalogue.',
              note: 'Choisir une organisation rend automatiquement la cohorte privée.',
            },
            {
              text: 'Cliquez sur `Créer la cohorte`.',
              result: 'Le message « Cohorte … créée » s’affiche et la fiche de la cohorte s’ouvre.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Les membres s’ajoutent ensuite',
          text: 'La création ne contient encore aucun participant. Ajoutez-les depuis l’onglet **Membres** de la fiche (voir « Piloter une cohorte »).',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Le message « Ce cours n’a pas de version publiée » s’affiche.',
              cause: 'Le module choisi n’a aucune version publiée.',
              solution: 'Publiez d’abord une version du cours dans l’espace Administration, puis recommencez.',
            },
            {
              problem: 'Le message « La fin doit être postérieure au début » s’affiche.',
              cause: 'La date de fin est avant la date de début.',
              solution: 'Corrigez les dates : la fin doit venir après le début.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'piloter-une-cohorte',
      title: 'Comment piloter une cohorte',
      icon: 'users',
      summary: 'Ajouter et retirer des membres, faire évoluer le statut, suivre la progression.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La fiche d’une cohorte réunit ses indicateurs (progression moyenne, assiduité, membres, sessions, certificats) et quatre onglets : **Membres**, **Sessions**, **Certificats** et **Paramètres**. Les boutons d’en-tête changent selon le statut.',
        },
      ],
      subsections: [
        {
          id: 'ajouter-et-retirer-des-membres',
          title: 'Ajouter et retirer des membres',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez l’onglet **Membres** de la cohorte puis cliquez sur `Ajouter des membres`.',
                  result: 'Une fenêtre de recherche des comptes s’ouvre.',
                },
                {
                  text: 'Cherchez par nom ou email, cochez les personnes voulues, puis cliquez sur `Ajouter`.',
                  note: 'Cochez « Membres de … uniquement » pour limiter la liste à l’organisation de la cohorte. Les comptes se créent sur le site, ou à la planification d’une demande.',
                  result: 'Chaque membre ajouté est inscrit sur la version suivie et reçoit une notification.',
                },
                {
                  text: 'Pour retirer une personne, cliquez sur `Retirer` sur sa ligne et confirmez.',
                  result: 'Son inscription à cette cohorte est annulée ; sa progression est conservée.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Cohorte fermée aux ajouts',
              text: 'Une cohorte « Clôturée » ou « Annulée » n’accepte plus de nouveaux membres. Un participant est aussi ignoré si son compte est inactif ou si la capacité est atteinte.',
            },
          ],
        },
        {
          id: 'faire-evoluer-le-statut',
          title: 'Faire évoluer le statut',
          blocks: [
            {
              type: 'paragraph',
              text: 'Les boutons d’en-tête de la fiche font passer la cohorte d’un statut au suivant. Démarrer la cohorte fait passer la demande liée à « Formation en cours ».',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur `Ouvrir les inscriptions` pour permettre l’ajout de membres (cohorte « Planifiée »).',
                  result: 'Le statut passe à « Inscriptions ouvertes ».',
                },
                {
                  text: 'Cliquez sur `Démarrer` quand la formation commence, puis confirmez dans le dialogue.',
                  result: 'Le statut passe à « En cours » ; la demande liée passe à « Formation en cours » et les participants sont informés.',
                },
                {
                  text: 'Cliquez sur `Rouvrir` sur une cohorte clôturée pour corriger ou ajouter des sessions.',
                  result: 'La cohorte repasse « En cours ».',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Les statuts d’une cohorte',
              items: [
                { label: 'Planifiée', tone: 'info', meaning: 'Créée, pas encore ouverte ni démarrée.', next: 'Complétez les membres et les sessions, puis ouvrez ou démarrez.' },
                { label: 'Inscriptions ouvertes', tone: 'info', meaning: 'Accepte de nouveaux membres.', next: 'Ajoutez les participants, puis démarrez.' },
                { label: 'En cours', tone: 'success', meaning: 'Formation démarrée ; sessions et émargements en cours.', next: 'Suivez l’assiduité, puis clôturez.' },
                { label: 'Clôturée', tone: 'neutral', meaning: 'Formation terminée ; certificats émis ; plus de nouveaux membres.', next: 'Vous pouvez la rouvrir pour des corrections.' },
                { label: 'Annulée', tone: 'danger', meaning: 'Cohorte abandonnée ; inscriptions visibles mais non animée.' },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Annuler une cohorte',
              text: 'Le bouton `Annuler` arrête l’animation de la cohorte. Les inscriptions restent visibles mais la cohorte n’est plus suivie. Réservez cette action aux formations qui n’auront pas lieu.',
            },
          ],
        },
        {
          id: 'modifier-les-parametres',
          title: 'Modifier les paramètres',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez l’onglet **Paramètres** de la cohorte.',
                  result: 'Le formulaire de la cohorte s’affiche (sans le module ni la version, qui sont figés).',
                },
                {
                  text: 'Modifiez le nom, l’organisation, le formateur, la modalité, les dates, la capacité, le lieu ou la description, puis cliquez sur `Enregistrer la cohorte`.',
                  result: 'Le message « Cohorte mise à jour » s’affiche.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              title: 'Si ça ne marche pas',
              items: [
                {
                  problem: 'Le message « Cette cohorte n’accepte plus de membres » s’affiche.',
                  cause: 'La cohorte est clôturée ou annulée.',
                  solution: 'Cliquez d’abord sur `Rouvrir` si vous devez ajouter des participants.',
                },
                {
                  problem: 'Le message « Capacité de la cohorte atteinte » s’affiche à l’ajout.',
                  cause: 'Le nombre maximal de participants est déjà inscrit.',
                  solution: 'Augmentez la capacité dans l’onglet Paramètres, ou retirez un membre.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'planifier-les-sessions',
      title: 'Comment planifier une session et convoquer',
      icon: 'calendar',
      summary: 'Ajouter une séance à une cohorte, lier une activité, envoyer et renvoyer la convocation.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **session** est une séance datée d’une cohorte (présentiel, classe virtuelle ou hybride). Les sessions se créent depuis la fiche de chaque cohorte, puis apparaissent dans le planning global, le calendrier des membres et le tableau de bord. Les heures sont en heure de Libreville.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche de la cohorte, onglet **Sessions**, puis cliquez sur `Ajouter une session`.',
              result: 'La fenêtre « Nouvelle session de formation » s’ouvre.',
            },
            {
              text: 'Renseignez l’**Intitulé** (obligatoire), le **Début** et la **Fin** (obligatoires, la fin après le début).',
              note: 'Les heures sont en heure de Libreville.',
            },
            {
              text: 'Choisissez la **Modalité**, l’**Intervenant**, le **Lieu** et, pour une classe virtuelle, le **Lien de visioconférence**.',
              note: 'L’intervenant est pré-rempli avec le formateur de la cohorte.',
            },
            {
              text: 'Reliez au besoin une **Activité liée (séance en direct)** de la version.',
              note: 'La présence à cette session validera alors l’achèvement de l’activité pour les participants présents.',
            },
            {
              text: 'Laissez cochée la case **Envoyer la convocation aux membres**, puis validez.',
              result: 'Le message « Session « … » ajoutée et convocations envoyées » s’affiche ; chaque membre reçoit une convocation.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Modifier ou supprimer une session',
          text: 'Le bouton `Modifier` rouvre la session (la convocation n’est renvoyée que si vous recochez la case). Un **rappel** automatique part 24 h avant chaque session.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Suppression bloquée si des présences existent',
          text: 'Le bouton `Supprimer` est refusé dès qu’un émargement a été saisi pour la session (« Des présences ont été enregistrées : la session ne peut pas être supprimée »). Corrigez plutôt la session ou laissez-la dans l’historique.',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Le message « La fin doit être postérieure au début » s’affiche.',
              cause: 'L’heure de fin est avant ou égale à l’heure de début.',
              solution: 'Corrigez l’une des deux heures.',
            },
            {
              problem: 'Le message « L’activité liée doit être une séance en direct de la version suivie par la cohorte » s’affiche.',
              cause: 'L’activité choisie n’est pas une séance en direct de la bonne version.',
              solution: 'Choisissez une activité de type « Séance en direct » de la version suivie, ou laissez « Aucune ».',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'emarger-une-session',
      title: 'Comment émarger une session',
      icon: 'list-checks',
      summary: 'Saisir les présences d’une session depuis l’espace Formateur.',
      blocks: [
        {
          type: 'paragraph',
          text: 'L’**émargement** (la saisie des présences) se fait dans l’espace **Formateur**, seul endroit qui contient la feuille de présence. La coordination peut émarger toutes les cohortes. Les présents et les retards comptent dans l’**assiduité** ; l’assiduité est le rapport (présents + retards) sur le nombre de sessions déjà passées.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Depuis la fiche de la cohorte, onglet **Sessions**, cliquez sur `Émargement`.',
              note: 'Vous pouvez aussi passer par la carte « Espace formateur » puis « Présences et corrections ».',
              result: 'L’espace Formateur s’ouvre sur l’onglet **Présence**.',
            },
            {
              text: 'Choisissez la bonne **Session** dans le sélecteur.',
              result: 'La liste des participants et les compteurs de présence s’affichent.',
            },
            {
              text: 'Pour chaque participant, cliquez sur `Présent`, `Absent`, `En retard` ou `Excusé`.',
              note: 'Les boutons `Tous présents`, `Tous absents`, `Tous excusés` remplissent la feuille d’un coup, à ajuster ensuite.',
            },
            {
              text: 'Ajoutez une **Note** si nécessaire (300 caractères au plus), puis cliquez sur `Enregistrer la feuille`.',
              result: 'Le message « Présences enregistrées pour N participant(s) » s’affiche.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’émargement',
          items: [
            { label: 'Présent', tone: 'success', meaning: 'La personne a assisté à la session ; compte dans l’assiduité.' },
            { label: 'En retard', tone: 'warning', meaning: 'Arrivée tardive ; compte tout de même dans l’assiduité.' },
            { label: 'Absent', tone: 'danger', meaning: 'La personne n’était pas là ; ne compte pas dans l’assiduité.' },
            { label: 'Excusé', tone: 'neutral', meaning: 'Absence justifiée ; ne compte pas comme présence.' },
            { label: 'Non renseigné', tone: 'neutral', meaning: 'Aucun statut choisi pour ce participant.' },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Le message « Renseignez au moins un statut avant d’enregistrer. » s’affiche.',
              cause: 'Aucun participant n’a de statut.',
              solution: 'Cliquez sur au moins un statut, ou utilisez une action de masse, avant d’enregistrer.',
            },
            {
              problem: 'La feuille est en lecture seule.',
              cause: 'Seuls le formateur de la cohorte ou la coordination peuvent émarger.',
              solution: 'Vérifiez que vous êtes bien connecté avec votre compte de coordination.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'valider-les-inscriptions',
      title: 'Comment valider les inscriptions et gérer leurs statuts',
      icon: 'badge-check',
      summary: 'Valider une inscription en attente, activer, terminer, suspendre ou annuler une inscription.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Certains cours ont la politique « Sur validation de la coordination » : l’apprenant s’inscrit mais reste **En attente** tant que vous n’avez pas validé. Ces demandes apparaissent sur le tableau de bord et dans la rubrique **Cohortes**.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Cohortes** et repérez la section « Inscriptions à valider ».',
              where: 'bas de la page Cohortes',
              result: 'La liste des inscriptions en attente s’affiche.',
            },
            {
              text: 'Cliquez sur `Valider` sur la ligne voulue.',
              result: 'L’inscription passe « En cours » ; la personne reçoit « Inscription validée » et un email de confirmation.',
            },
            {
              text: 'Pour les autres changements de statut, ouvrez le cours dans l’espace Administration, onglet **Inscriptions**.',
              where: 'espace Administration › **Cours** › fiche du cours › onglet **Inscriptions**',
            },
            {
              text: 'Choisissez l’action : `Activer`, `Terminer`, `Suspendre` ou `Annuler`.',
              note: 'Un **Motif** est obligatoire pour Terminer, Suspendre et Annuler. « Terminer » force la progression à 100 % et tente l’émission automatique du certificat.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’une inscription',
          items: [
            { label: 'En attente', tone: 'warning', meaning: 'À valider par la coordination.', next: 'Cliquez sur `Valider`.' },
            { label: 'En cours', tone: 'success', meaning: 'Inscription active : la personne a accès au contenu.' },
            { label: 'Terminée', tone: 'info', meaning: 'Formation achevée (progression 100 %) ; certificat possible.' },
            { label: 'Suspendue', tone: 'warning', meaning: 'Accès retiré temporairement.', next: 'Réactivable par `Activer`.' },
            { label: 'Annulée', tone: 'danger', meaning: 'Inscription annulée ; historique conservé.' },
            { label: 'Expirée', tone: 'neutral', meaning: 'Inscription arrivée à échéance.' },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'L’apprenant est prévenu',
          text: 'Activer et annuler une inscription envoient un email à l’apprenant. Écrivez un motif clair : il aide la personne et sert de trace pour la Fédération.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'cloturer-et-certifier',
      title: 'Comment clôturer une cohorte et émettre les certificats',
      icon: 'award',
      summary: 'Clôturer la formation, émettre les certificats des éligibles, traiter les non éligibles.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Clôturer une cohorte termine la formation et permet d’émettre les certificats. L’**éligibilité** est calculée d’après le modèle de certificat : formation terminée si le modèle l’exige, inscription non annulée, score suffisant, assiduité suffisante. Un score nul (cours sans évaluation notée) ne bloque pas.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Sur une cohorte « En cours » ou « Inscriptions ouvertes », cliquez sur `Clôturer`.',
              result: 'Le dialogue « Clôturer la cohorte » s’ouvre.',
            },
            {
              text: 'Laissez cochée la case **Émettre les certificats des participants éligibles**.',
              note: 'Décochez-la seulement si vous voulez clôturer sans certifier tout de suite.',
            },
            {
              text: 'Choisissez le **Modèle de certificat** ou laissez « Modèle par défaut ».',
              note: 'Sans choix, c’est le modèle du cours, sinon le modèle par défaut global.',
            },
            {
              text: 'Cliquez sur `Clôturer et émettre`.',
              result: 'Le message « Cohorte clôturée : N certificat(s) émis, N participant(s) non éligible(s) » s’affiche, avec la liste des non éligibles et leurs motifs.',
            },
            {
              text: 'Pour un participant non éligible, ouvrez l’onglet **Certificats**, corrigez la cause (note, présence, statut d’inscription) puis cliquez sur `Émettre`.',
              note: 'Le bouton `Émettre quand même` force l’émission malgré l’inéligibilité : cette action est journalisée sous votre responsabilité.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Le PDF arrive un peu après',
          text: 'Chaque certificat porte un numéro FETRAG-AAAA-NNNNNN. Le document PDF est généré par la file de traitement (au plus quelques minutes). Le titulaire reçoit une notification et un email avec un lien de vérification publique.',
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Un seul certificat valide par inscription',
          text: 'L’émission ne se fait qu’une fois par inscription (« Un certificat existe déjà »). Si les données sont fausses, révoquez le certificat existant avant d’en émettre un nouveau (voir « Le registre des certificats »).',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Le message « Aucun modèle de certificat n’est configuré pour ce cours. » s’affiche.',
              cause: 'Ni le cours ni la plateforme n’ont de modèle applicable.',
              solution: 'Créez un modèle par défaut ou un modèle dédié au cours (voir « Les modèles de certificats »), puis réessayez.',
            },
            {
              problem: 'Un participant reste non éligible malgré tout.',
              cause: 'Un critère du modèle n’est pas satisfait : formation non terminée, score ou assiduité insuffisants.',
              solution: 'Lisez le motif affiché dans l’onglet Certificats, corrigez la donnée, puis émettez ; ou utilisez `Émettre quand même` en connaissance de cause.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'gerer-les-certificats',
      title: 'Comment gérer le registre des certificats',
      icon: 'scroll-text',
      summary: 'Retrouver, révoquer et régénérer les certificats et attestations émis.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La rubrique **Certificats** est le registre de tous les documents émis. Chaque document porte un numéro séquentiel et un code de vérification publique. Vous y révoquez un certificat avec un motif, vous relancez la génération d’un PDF, et vous accédez à l’émission par cohorte.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Certificats** dans le menu de gauche.',
              result: 'Le registre paginé s’affiche.',
            },
            {
              text: 'Filtrez par **Statut**, **Module** ou **Organisation**, ou tapez un numéro ou un titulaire dans **Recherche**.',
            },
            {
              text: 'Pour révoquer un certificat valide, cliquez sur `Révoquer`, saisissez le **Motif de révocation** (3 à 500 caractères), puis confirmez.',
              result: 'Le message « Certificat … révoqué » s’affiche ; le titulaire est notifié ; la vérification publique indiquera « Révoqué ».',
            },
            {
              text: 'Pour relancer un PDF manquant, cliquez sur `Régénérer le PDF`.',
              result: 'Le message « Régénération du PDF … planifiée » s’affiche ; le document réapparaît « Disponible » après le traitement.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’un certificat',
          items: [
            { label: 'Valide', tone: 'success', meaning: 'Certificat émis et vérifiable publiquement.' },
            { label: 'Révoqué', tone: 'danger', meaning: 'Certificat annulé avec motif ; la vérification publique affiche « révoqué ». Irréversible.' },
            { label: 'Expiré', tone: 'neutral', meaning: 'Date de validité dépassée (pour les modèles avec durée de validité).' },
            { label: 'Disponible', tone: 'success', meaning: 'Le PDF est prêt et téléchargeable.' },
            { label: 'En génération', tone: 'info', meaning: 'Le PDF est en attente du traitement.', next: 'Patientez quelques minutes, puis rafraîchissez.' },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'La révocation est définitive',
          text: 'On ne peut pas annuler une révocation. Le numéro d’un certificat révoqué n’est jamais réattribué. En cas d’erreur de nom ou de note, corrigez la donnée source puis réémettez depuis l’onglet Certificats de la cohorte : un nouveau numéro et un nouveau code sont créés.',
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Le bouton `Révoquer` n’apparaît pas.',
              cause: 'Le certificat n’est pas au statut « Valide » (déjà révoqué ou expiré).',
              solution: 'On ne révoque qu’un certificat valide. Vérifiez son statut dans la colonne « Statut ».',
            },
            {
              problem: 'Le dialogue refuse la révocation avec « Indiquez un motif (3 caractères au moins). ».',
              cause: 'Le motif est vide ou trop court.',
              solution: 'Saisissez un motif d’au moins 3 caractères, précis et compréhensible par le titulaire.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'gerer-les-organisations',
      title: 'Comment gérer les organisations et leurs gestionnaires',
      icon: 'building',
      summary: 'Créer la fiche d’une organisation et y rattacher des gestionnaires qui déposeront les demandes.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **organisation** est un syndicat, une section ou une fédération affiliés. Ses **gestionnaires** déposent les demandes de formation et consultent ses rapports. Le compte d’un gestionnaire doit exister avant le rattachement : la personne le crée elle-même sur le site institutionnel.',
        },
      ],
      subsections: [
        {
          id: 'creer-une-organisation',
          title: 'Créer une organisation',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Organisations** puis cliquez sur `Nouvelle organisation`.',
                  where: 'menu de gauche de l’espace Coordination',
                  result: 'Le formulaire de création s’ouvre.',
                },
                {
                  text: 'Renseignez le **Nom de l’organisation** (obligatoire) et, au besoin, le **Sigle**, le **Secteur**, la **Ville**, les coordonnées et une **Présentation**.',
                  note: 'Le téléphone accepte 6 à 20 caractères ; le site web doit être une adresse valide.',
                },
                {
                  text: 'Laissez cochée la case **Organisation affiliée à la FETRAG** si c’est le cas, puis cliquez sur `Créer l’organisation`.',
                  result: 'Le message « Organisation « … » créée » s’affiche et la fiche s’ouvre.',
                },
              ],
            },
          ],
        },
        {
          id: 'rattacher-un-gestionnaire',
          title: 'Rattacher un gestionnaire',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche, allez à la section **Gestionnaires et membres**, formulaire « Rattacher un compte ».',
                },
                {
                  text: 'Saisissez l’**Email du compte** (obligatoire), la **Fonction**, laissez cochée « Désigner comme gestionnaire », puis cliquez sur `Rattacher`.',
                  result: 'Le message « Gestionnaire rattaché à l’organisation » s’affiche ; le compte peut désormais déposer des demandes.',
                },
                {
                  text: 'Pour retirer un compte, cliquez sur `Retirer` sur sa ligne et confirmez.',
                  result: 'Le compte perd son rattachement et, le cas échéant, son rôle de gestionnaire.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Désactiver une organisation',
              text: 'Dans la fiche, décochez la case **Organisation active** pour la retirer des sélecteurs. Utilisez le filtre « Inclure les inactives » pour la retrouver ensuite.',
            },
            {
              type: 'troubleshooting',
              title: 'Si ça ne marche pas',
              items: [
                {
                  problem: 'Le message « Aucun compte actif ne correspond à cette adresse » s’affiche.',
                  cause: 'La personne n’a pas encore de compte, ou l’adresse est différente.',
                  solution: 'Demandez-lui l’adresse exacte de son compte, ou invitez-la à s’inscrire sur le site. Vous ne créez pas le compte vous-même.',
                },
                {
                  problem: 'Le message « Ce membre a des inscriptions en cours au titre de l’organisation » bloque le retrait.',
                  cause: 'Le compte a des inscriptions actives ou en attente liées à l’organisation.',
                  solution: 'Annulez ou terminez ces inscriptions avant de retirer le compte.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'creer-un-cours',
      title: 'Comment créer, structurer et publier un cours',
      icon: 'book-open',
      summary: 'Bâtir un cours dans l’espace Administration, publier sa version et le rendre visible au catalogue.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les cours se construisent dans l’espace **Administration**. Un cours porte des **versions figées** : la version courante est celle que suivent les nouvelles inscriptions. Publier un cours le rend visible dans le catalogue de la plateforme et, automatiquement, sur le site institutionnel.',
        },
      ],
      subsections: [
        {
          id: 'creer-la-fiche',
          title: 'Créer la fiche du cours',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans l’espace Administration, ouvrez **Cours** puis cliquez sur `Nouveau cours`.',
                  result: 'Le formulaire de création en quatre blocs s’ouvre.',
                },
                {
                  text: 'Remplissez l’**Identité du module** : **Titre** et **Code** (obligatoires), et au besoin le résumé, le numéro et le pilier.',
                  note: 'Le code est court et unique (par exemple FETRAG-M03). L’adresse (slug) se génère depuis le titre si vous la laissez vide.',
                },
                {
                  text: 'Complétez la **Pédagogie** (description, objectifs, prérequis, public, modalité, niveau, **Durée** obligatoire) et l’**Accès et tarification**.',
                  note: 'La politique d’inscription peut être libre, sur validation, réservée aux organisations, ou payante.',
                },
                {
                  text: 'Cochez les **Formateurs du cours** puis cliquez sur `Créer le cours`.',
                  result: 'Le message « Cours « … » créé (version 1 en brouillon) » s’affiche ; le builder du cours s’ouvre.',
                },
              ],
            },
          ],
        },
        {
          id: 'structurer-le-cours',
          title: 'Structurer le cours',
          blocks: [
            {
              type: 'paragraph',
              text: 'Un cours s’organise en **modules** (grandes parties), qui contiennent des **leçons**, qui contiennent des **activités** (contenu, vidéo, quiz, devoir, séance en direct…). Chaque activité a une **règle d’achèvement** : ce qu’il faut faire pour qu’elle compte comme terminée.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez l’onglet **Structure** du cours.',
                  result: 'L’arborescence de la version affichée apparaît.',
                },
                {
                  text: 'Cliquez sur `Ajouter un module`, puis dans le module sur `Leçon`, puis dans la leçon sur `Activité`.',
                  note: 'Réordonnez avec les boutons « Monter » et « Descendre » (il n’y a pas de glisser-déposer).',
                },
                {
                  text: 'Pour un quiz, enregistrez l’activité, rouvrez-la avec `Modifier`, onglet **Quiz**, puis ajoutez des questions avec `Depuis la banque` ou `Création rapide`.',
                },
                {
                  text: 'Pour une séance en direct, ouvrez l’onglet **Séances** de l’activité et cliquez sur `Ajouter une séance`.',
                },
              ],
            },
          ],
        },
        {
          id: 'publier-une-version-et-le-cours',
          title: 'Publier une version et le cours',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez l’onglet **Versions** et cliquez sur `Modifier` la version pour régler le **Score minimal**, l’**Assiduité minimale** et le **Journal des modifications**.',
                },
                {
                  text: 'Cliquez sur `Publier`, puis confirmez dans le dialogue.',
                  result: 'Le message « Version N publiée : elle devient la version courante » s’affiche. Un cours en brouillon passe alors automatiquement à « Publié ».',
                },
                {
                  text: 'Si le cours n’est pas encore publié, cliquez sur `Publier` dans l’en-tête du cours.',
                  result: 'Le message « Cours visible dans le catalogue » s’affiche.',
                },
                {
                  text: 'Pour faire évoluer un cours déjà suivi, revenez à l’onglet Structure et cliquez sur `Créer une nouvelle version`, modifiez, puis publiez.',
                  note: 'Les cohortes en cours gardent leur version : elles ne sont pas affectées.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Une version publiée est figée',
              text: 'Publier une version la verrouille : pour la modifier, il faut la dupliquer et publier une nouvelle version. Une version ne peut être publiée que si elle contient au moins un module, une leçon et une activité.',
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Synchronisation avec le site',
              text: 'Un cours publié avec une version courante apparaît dans le catalogue de la plateforme et, par lecture de la même base, sur les pages Formations du site institutionnel. Vous n’avez rien à recopier.',
            },
            {
              type: 'troubleshooting',
              title: 'Si ça ne marche pas',
              items: [
                {
                  problem: 'Le message « Publiez une version du cours avant de rendre le cours visible » s’affiche.',
                  cause: 'Le cours n’a pas de version courante publiée.',
                  solution: 'Publiez d’abord une version dans l’onglet Versions, puis publiez le cours.',
                },
                {
                  problem: 'Le message « La version doit contenir au moins un module, une leçon et une activité avant publication » s’affiche.',
                  cause: 'La structure de la version est incomplète.',
                  solution: 'Ajoutez au moins un module, une leçon et une activité, puis réessayez.',
                },
                {
                  problem: 'Le message « Ce quiz a déjà des tentatives : créez une nouvelle version du cours pour modifier ses questions » s’affiche.',
                  cause: 'Des apprenants ont déjà répondu au quiz.',
                  solution: 'Dupliquez la version pour préparer une évolution ; l’ancienne reste intacte.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'banque-de-questions',
      title: 'Comment gérer la banque de questions',
      icon: 'notebook',
      summary: 'Créer, importer et réutiliser des questions dans les quiz.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La **banque de questions** rassemble des questions réutilisables dans plusieurs quiz. Chaque question est **versionnée** : modifier une question déjà répondue crée une nouvelle version et désactive l’ancienne, sans casser les tentatives passées.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Dans l’espace Administration, ouvrez **Banque de questions**.',
              result: 'La liste des questions s’affiche avec ses filtres.',
            },
            {
              text: 'Cliquez sur `Nouvelle question`, choisissez le type, saisissez l’énoncé, les options ou réponses, les points, la catégorie et l’explication, puis cliquez sur `Ajouter à la banque`.',
              note: 'Chaque type a ses règles : par exemple un choix unique demande au moins deux options et exactement une correcte.',
            },
            {
              text: 'Pour importer en masse, cliquez sur `Importer (CSV)`, collez les lignes au format indiqué, puis cliquez sur `Importer`.',
              note: 'Une question par ligne, colonnes séparées par des points-virgules ; import limité à 500 questions par lot.',
              result: 'Le message « N question(s) importée(s), N ligne(s) rejetée(s) » s’affiche, avec le détail des lignes rejetées.',
            },
            {
              text: 'Pour réutiliser une question dans un cours, passez par le builder : activité Quiz, `Depuis la banque`.',
              note: 'La fiche d’une question ne comporte pas d’action d’ajout à un quiz ; l’ajout se fait depuis le builder.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’une question',
          items: [
            { label: 'Active', tone: 'success', meaning: 'Proposée dans les quiz.' },
            { label: 'Inactive', tone: 'neutral', meaning: 'Désactivée (remplacée par une nouvelle version, ou retirée).' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Supprimer ou désactiver',
          text: 'Une question inutilisée est supprimée définitivement. Une question déjà utilisée dans un quiz ou déjà répondue est désactivée plutôt que supprimée, pour préserver l’historique.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'modeles-de-certificats',
      title: 'Comment configurer les modèles de certificats',
      icon: 'file-check',
      summary: 'Définir les textes, le signataire, les critères d’éligibilité et le modèle par défaut.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un **modèle de certificat** définit les textes imprimés, le signataire, les critères d’éligibilité (score, assiduité, formation terminée) et la validité. Le **modèle par défaut** s’applique aux cours qui n’ont pas de modèle dédié. Sans modèle applicable, aucun certificat ne peut être émis.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Dans l’espace Administration, ouvrez **Modèles de certificats** puis cliquez sur `Nouveau modèle`.',
              result: 'Le dialogue de création s’ouvre avec un aperçu de la mise en page.',
            },
            {
              text: 'Renseignez le **Nom**, la **Nature** (Attestation de formation ou Certificat), le **Cours concerné** ou « Tous les cours », et les textes imprimés.',
              note: 'Les libellés réels sont « Attestation de formation » et « Certificat ».',
            },
            {
              text: 'Réglez les **Critères d’éligibilité** : **Score minimal** (60 % par défaut), **Assiduité minimale** (0 % par défaut), case **Formation terminée requise**.',
            },
            {
              text: 'Cochez **Modèle par défaut** si ce modèle doit s’appliquer aux cours sans modèle dédié, puis cliquez sur `Créer le modèle`.',
              result: 'Le message « Modèle de certificat créé » s’affiche.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Un modèle qui a servi ne se supprime pas',
          text: 'Si des certificats ont été émis avec un modèle, sa suppression est refusée. De même, modifier un modèle ne régénère pas automatiquement les PDF déjà émis : utilisez `Régénérer le PDF` sur chaque certificat concerné.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un seul modèle par défaut',
          text: 'Cocher « Modèle par défaut » sur un modèle décoche automatiquement les autres. À l’émission, l’ordre est : modèle choisi, sinon modèle dédié au cours, sinon modèle par défaut.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'designer-des-formateurs',
      title: 'Comment désigner un formateur',
      icon: 'user-plus',
      summary: 'Attribuer le rôle Formateur à un compte, sur un cours ou une cohorte.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La coordination peut attribuer ou retirer **le seul rôle Formateur**, et seulement sur un cours ou une cohorte. Les autres rôles relèvent du super administrateur. Vous désignez aussi les formateurs d’un cours directement depuis son builder.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Pour désigner les formateurs d’un cours, ouvrez le cours dans l’espace Administration, onglet **Formateurs**.',
              result: 'La liste des formateurs du cours s’affiche.',
            },
            {
              text: 'Dans « Ajouter un formateur », choisissez un **Compte formateur**, cochez « Référent du cours » si besoin, puis cliquez sur `Ajouter`.',
              note: 'Le référent est le formateur principal ; les autres enseignent toutes les cohortes du cours.',
            },
            {
              text: 'Pour une portée cohorte, ouvrez **Utilisateurs et rôles**, la fiche du compte, section « Rôles et portées ».',
              where: 'espace Administration › **Utilisateurs et rôles**',
            },
            {
              text: 'Attribuez le rôle **Formateur** avec la portée **Cours** ou **Cohorte** et une expiration facultative.',
              result: 'Le message « Rôle TRAINER attribué à … » s’affiche.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Le message « La coordination ne peut attribuer que le rôle Formateur sur un cours ou une cohorte » s’affiche.',
              cause: 'Vous tentez d’attribuer un autre rôle, ou une portée globale.',
              solution: 'Limitez-vous au rôle Formateur, portée Cours ou Cohorte. Pour tout autre rôle, sollicitez le super administrateur.',
            },
            {
              problem: 'Le compte n’a pas le rôle Formateur alors que vous voulez l’ajouter à un cours.',
              cause: 'Aucun compte formateur n’est disponible.',
              solution: 'Attribuez d’abord le rôle Formateur au compte depuis « Utilisateurs et rôles », puis ajoutez-le au cours.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'produire-des-rapports',
      title: 'Comment produire un rapport et l’exporter',
      icon: 'bar-chart',
      summary: 'Consulter les indicateurs par cours, organisation, cohorte et finances, et télécharger les exports.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La rubrique **Rapports** offre une vue d’ensemble et quatre rapports détaillés : par cours, par organisation, par cohorte, et une synthèse financière. Chaque export CSV ou PDF est journalisé.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Rapports** dans le menu de gauche.',
              result: 'Les tuiles d’indicateurs et les sections de rapport s’affichent.',
            },
            {
              text: 'Dans la section voulue, choisissez le **Module**, l’**Organisation** ou la **Cohorte** (ou la période pour la finance), puis cliquez sur `Afficher`.',
              result: 'Le tableau du rapport apparaît.',
            },
            {
              text: 'Cliquez sur `CSV` ou `PDF` pour télécharger l’export.',
              note: 'La synthèse financière n’a qu’un export CSV. Le rapport de cohorte est aussi exportable depuis l’onglet Certificats de la cohorte.',
              result: 'Le fichier se télécharge dans votre navigateur.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Données personnelles',
          text: 'Les exports contiennent des données personnelles de participants. Ne les transmettez qu’aux organisations concernées. Chaque gestionnaire dispose déjà de ses propres rapports d’organisation.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Ce qui vous est notifié, ce que reçoivent les organisations et les participants, et où le lire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La plateforme prévient les personnes concernées à chaque étape. Vous recevez surtout les nouvelles demandes ; les organisations et les participants reçoivent le suivi de leurs demandes, inscriptions et certificats.',
        },
        {
          type: 'table',
          caption: 'Ce que vous recevez',
          columns: ['Notification ou email', 'Quand', 'Ce qu’il faut faire'],
          rows: [
            ['« Nouvelle demande de formation »', 'Une organisation dépose ou retransmet une demande.', 'Ouvrez la rubrique Demandes et instruisez la demande.'],
            ['« Demande annulée »', 'Une organisation annule sa demande.', 'Aucune action ; la file se met à jour.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Où lire vos notifications',
          text: 'Il n’existe pas de centre de notifications dans les espaces Coordination et Administration. Vos notifications internes (nouvelle demande, demande annulée) se lisent dans le bloc Notifications de votre tableau de bord apprenant. Les emails arrivent dans votre boîte habituelle.',
        },
        {
          type: 'table',
          caption: 'Ce que déclenchent vos décisions (pour information)',
          columns: ['Décision ou action', 'Ce que reçoit le destinataire'],
          rows: [
            ['Décision sur une demande', 'L’organisation reçoit une notification et un email correspondant à la décision (complément, acceptée, refusée, nouvelle date, planifiée).'],
            ['Planification', 'Les participants sans compte reçoivent un lien « définissez votre mot de passe » (valable 7 jours) ; les autres, une confirmation d’inscription ; le formateur, l’attribution de la cohorte.'],
            ['Création d’une session', 'Chaque membre reçoit une convocation ; un rappel automatique part 24 h avant.'],
            ['Émission d’un certificat', 'Le titulaire reçoit « votre certificat / attestation est disponible » avec un lien de vérification.'],
            ['Révocation d’un certificat', 'Le titulaire est notifié avec le motif.'],
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield-check',
      summary: 'Les réflexes qui protègent les comptes, les données syndicales et la qualité du programme.',
      blocks: [
        {
          type: 'list',
          title: 'Sécurité du compte',
          style: 'check',
          items: [
            'Activez la vérification en deux étapes et conservez vos codes de secours hors de votre téléphone.',
            'Déconnectez-vous toujours après votre travail sur un appareil partagé.',
            'Ne communiquez jamais votre mot de passe ni un code de vérification, même à un collègue ou au support.',
          ],
        },
        {
          type: 'list',
          title: 'Confidentialité des données syndicales',
          style: 'check',
          items: [
            'Ne transmettez les exports (participants, présences, notes) qu’aux organisations concernées.',
            'Ouvrez les pièces jointes des demandes seulement pour instruire le dossier ; le lien expire en 15 minutes.',
            'Écrivez des motifs de décision courtois et factuels : ils sont lus par les organisations et conservés dans l’historique.',
          ],
        },
        {
          type: 'list',
          title: 'Qualité du programme',
          style: 'check',
          items: [
            'Traitez les demandes dans l’ordre d’ancienneté et sans laisser traîner : une alerte signale les demandes en retard.',
            'Préférez « Demander un complément » à un refus quand le dossier est incomplet.',
            'Vérifiez les critères du modèle de certificat avant de clôturer une cohorte.',
            'Publiez toujours une nouvelle version pour faire évoluer un cours suivi : ne modifiez jamais une version figée.',
            'Planifiez les sessions en heure de Libreville : la plateforme convertit à l’affichage.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Délai d’instruction',
          text: 'L’accusé de réception envoyé à l’organisation annonce une réponse sous cinq jours ouvrés. L’alerte de votre tableau de bord, elle, se déclenche après dix jours. Visez le délai le plus court annoncé à l’organisation : cinq jours ouvrés.',
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
              question: 'Où décide-t-on du sort d’une demande de formation ?',
              answer: 'Sur la plateforme, dans le panneau **Décision de la coordination** de la fiche de la demande (rubrique **Demandes**). C’est là que vous demandez un complément, acceptez, proposez une date, refusez ou planifiez.',
            },
            {
              question: 'La décision « Convertir en cohorte » n’existe pas, comment créer les cohortes depuis une demande ?',
              answer: 'La décision s’appelle `Planifier`. Sur une demande « Acceptée », elle crée une cohorte par module, les comptes des participants et leurs inscriptions.',
            },
            {
              question: 'Un participant n’a pas d’adresse email. Que se passe-t-il à la planification ?',
              answer: 'Il est ignoré et listé dans « Éléments non traités ». Ajoutez son adresse dans la demande avant de planifier, ou ajoutez-le ensuite depuis la fiche de la cohorte.',
            },
            {
              question: 'La convocation part-elle dès la planification ?',
              answer: 'Non. La planification envoie l’invitation de compte, la confirmation d’inscription et l’email « Formation planifiée ». Les convocations aux séances partent à la création de chaque session.',
            },
            {
              question: 'Comment saisir les présences ? Il n’y a pas d’onglet Présence sur la cohorte.',
              answer: 'L’émargement se fait dans l’espace **Formateur**. Depuis l’onglet Sessions de la cohorte, cliquez sur `Émargement` : vous arrivez sur l’onglet **Présence** de l’espace Formateur, où vous pouvez émarger toutes les cohortes.',
            },
            {
              question: 'Je me suis trompé sur un certificat déjà émis. Que faire ?',
              answer: 'Corrigez la donnée source, révoquez le certificat erroné avec un motif dans la rubrique **Certificats**, puis réémettez depuis l’onglet Certificats de la cohorte : un nouveau numéro et un nouveau code sont créés. La révocation est définitive.',
            },
            {
              question: 'Pourquoi ne puis-je pas modifier une version de cours déjà publiée ?',
              answer: 'Une version publiée est figée pour garantir que les cohortes suivent un contenu stable. Pour la faire évoluer, dupliquez-la (`Créer une nouvelle version`), modifiez la copie, puis publiez-la : les cohortes en cours gardent leur version.',
            },
            {
              question: 'Puis-je attribuer un rôle à un compte ?',
              answer: 'Vous pouvez attribuer ou retirer uniquement le rôle **Formateur**, sur un cours ou une cohorte. Tous les autres rôles, ainsi que la création et la désactivation des comptes, relèvent du super administrateur.',
            },
            {
              question: 'Un cours publié sur la plateforme apparaît-il tout seul sur le site institutionnel ?',
              answer: 'Oui. Un cours « Publié » avec une version courante apparaît dans le catalogue de la plateforme et, par lecture de la même base, sur les pages Formations du site. Vous n’avez rien à recopier.',
            },
            {
              question: 'Où est passée ma notification de nouvelle demande ?',
              answer: 'Les espaces Coordination et Administration n’ont pas de centre de notifications. Vos notifications internes se lisent dans le bloc Notifications de votre tableau de bord apprenant ; l’email arrive dans votre boîte habituelle.',
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
            { term: 'Demande de formation', definition: 'Dossier déposé par un gestionnaire d’organisation : modules souhaités, participants et période. Vous l’instruisez avant toute cohorte.' },
            { term: 'Cohorte', definition: 'Groupe de participants qui suivent ensemble une version figée d’un module, avec un formateur, des sessions et un forum.' },
            { term: 'Session', definition: 'Séance datée d’une cohorte (présentiel, classe virtuelle ou hybride). Les heures sont en heure de Libreville.' },
            { term: 'Version (d’un cours)', definition: 'État figé du contenu d’un cours. La version courante est celle que suivent les nouvelles inscriptions ; les cohortes gardent la leur.' },
            { term: 'Module, leçon, activité', definition: 'Les trois niveaux de la structure d’un cours : le module contient des leçons, la leçon contient des activités (contenu, vidéo, quiz, devoir, séance en direct…).' },
            { term: 'Règle d’achèvement', definition: 'Ce qu’il faut faire pour qu’une activité compte comme terminée : consultation, temps passé, score minimal, remise, présence ou validation manuelle.' },
            { term: 'Assiduité', definition: 'Part des sessions passées auxquelles un participant a assisté : (présents + retards) divisé par le nombre de sessions passées.' },
            { term: 'Éligibilité', definition: 'Le fait qu’un participant remplit les critères du modèle de certificat (formation terminée, score, assiduité) pour recevoir son document.' },
            { term: 'Certificat et attestation', definition: 'Documents remis en fin de formation, avec un numéro FETRAG séquentiel et un code de vérification publique. « Certificat » et « Attestation de formation » sont deux natures de modèle.' },
            { term: 'Révocation', definition: 'Annulation définitive d’un certificat, avec un motif. La vérification publique affiche « révoqué » ; le numéro n’est jamais réattribué.' },
            { term: 'Gestionnaire d’organisation', definition: 'Compte habilité à déposer les demandes de formation de son organisation et à consulter ses rapports.' },
            { term: 'Vérification en deux étapes (MFA)', definition: 'Un code temporaire à six chiffres demandé en plus du mot de passe, généré par une application sur votre téléphone. Elle s’active sur le site institutionnel.' },
            { term: 'Brouillon', definition: 'Contenu (cours, version, demande) non transmis ou non visible. Modifiable et sans effet public tant qu’il n’est pas publié ou soumis.' },
            { term: 'Banque de questions', definition: 'Réserve de questions réutilisables dans les quiz, versionnées : modifier une question déjà répondue crée une nouvelle version.' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
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
            ['Connexion impossible, code de vérification refusé, téléphone perdu, rôle manquant, compte à créer ou à désactiver', 'Le super administrateur (par le formulaire de contact du site, ou le secrétariat général).'],
            ['Commande, paiement ou remboursement d’un cours payant', 'Le rôle Finance / contrôle de la Fédération.'],
            ['Dossier d’une demande à compléter, participant à ajouter, rapport d’organisation à commenter', 'Le gestionnaire de l’organisation concernée.'],
            ['Correction en attente, émargement à faire sur place', 'Le formateur de la cohorte.'],
            ['Panne, message d’erreur répété, page qui ne se charge pas', 'Le support, par le formulaire de contact du site.'],
          ],
        },
        {
          type: 'list',
          title: 'Dans un message d’aide, indiquez',
          style: 'bullet',
          items: [
            'L’adresse email de votre compte (jamais votre mot de passe ni un code de vérification).',
            'L’écran concerné (par exemple « Coordination › Demandes › fiche … ») et l’appareil utilisé (téléphone ou ordinateur, navigateur).',
            'Le message d’erreur exact, recopié tel qu’affiché, et l’heure de l’essai.',
            'La référence concernée : référence de la demande, code de la cohorte, numéro du certificat ou nom de l’organisation.',
          ],
        },
        {
          type: 'links',
          title: 'Contacter la Fédération',
          items: [
            { label: 'Formulaire de contact du site', href: '{{web}}/contact', description: 'Support et demandes d’accès (objet conseillé : « Demande de droits d’accès »).', icon: 'mail', external: true },
            { label: 'Écrire au secrétariat général', href: 'mailto:jossngomafm@gmail.com', description: 'Adresse email de la Fédération.', icon: 'send', external: true },
            { label: 'Téléphone : 066 23 00 33', href: 'tel:+24166230033', description: 'Secrétariat de la Fédération, aux heures de bureau.', icon: 'phone', external: true },
            { label: 'Téléphone : 077 52 27 98', href: 'tel:+24177522798', description: 'Second numéro de la Fédération.', icon: 'phone', external: true },
          ],
        },
        {
          type: 'paragraph',
          text: 'Adresse postale : Fédération des Travailleurs du Gabon (FETRAG), BP 1234 Libreville, Gabon.',
        },
      ],
    },
  ],
  selfAssessment: {
    intro:
      'Vingt-sept questions pour vérifier que vous savez où agir, ce que signifient les statuts, ce qui est irréversible et à qui vous adresser. Comptez quinze minutes ; le corrigé renvoie à la section du guide.',
    passPercent: 70,
    questions: [
      {
        id: 'q-role-1',
        sectionId: 'votre-role',
        type: 'single',
        prompt: 'Quel rôle pouvez-vous attribuer vous-même à un compte ?',
        options: [
          { id: 'a', text: 'N’importe quel rôle.', correct: false },
          { id: 'b', text: 'Uniquement le rôle Formateur, sur un cours ou une cohorte.', correct: true },
          { id: 'c', text: 'Aucun rôle : tout relève du super administrateur.', correct: false },
        ],
        explanation: 'La coordination attribue uniquement le rôle Formateur, sur un cours ou une cohorte. Voir « Votre rôle en bref » et « Comment désigner un formateur ».',
      },
      {
        id: 'q-role-2',
        sectionId: 'votre-role',
        type: 'multiple',
        prompt: 'Parmi ces actions, lesquelles vous sont interdites ?',
        options: [
          { id: 'a', text: 'Créer un compte.', correct: true },
          { id: 'b', text: 'Rembourser une commande.', correct: true },
          { id: 'c', text: 'Émettre un certificat.', correct: false },
          { id: 'd', text: 'Créer une cohorte.', correct: false },
        ],
        explanation: 'La création de compte relève du super administrateur, le remboursement du rôle Finance. Émettre un certificat et créer une cohorte font partie de votre travail. Voir « Votre rôle en bref ».',
      },
      {
        id: 'q-securite-1',
        sectionId: 'activer-la-verification-en-deux-etapes',
        type: 'single',
        prompt: 'Où activez-vous la vérification en deux étapes ?',
        options: [
          { id: 'a', text: 'Sur le site institutionnel, dans votre espace de sécurité.', correct: true },
          { id: 'b', text: 'Dans l’espace Coordination de la plateforme.', correct: false },
          { id: 'c', text: 'Elle s’active toute seule à la première connexion.', correct: false },
        ],
        explanation: 'La vérification en deux étapes s’active sur le site (menu du compte › Sécurité). Voir « Activer la vérification en deux étapes ».',
      },
      {
        id: 'q-demande-1',
        sectionId: 'choisir-une-decision',
        type: 'single',
        prompt: 'Un dossier de demande est incomplet. Quelle décision est la plus adaptée ?',
        options: [
          { id: 'a', text: '`Refuser`, puisqu’il manque des informations.', correct: false },
          { id: 'b', text: '`Demander un complément`, pour que l’organisation corrige et retransmette.', correct: true },
          { id: 'c', text: '`Annuler` la demande.', correct: false },
        ],
        explanation: 'Un refus est définitif ; « Demander un complément » laisse l’organisation corriger. Voir « Choisir une décision ».',
      },
      {
        id: 'q-demande-2',
        sectionId: 'planifier-une-demande',
        type: 'single',
        prompt: 'Que fait la décision `Planifier` sur une demande acceptée ?',
        options: [
          { id: 'a', text: 'Elle envoie seulement un email à l’organisation.', correct: false },
          { id: 'b', text: 'Elle crée une cohorte par module, les comptes manquants et les inscriptions.', correct: true },
          { id: 'c', text: 'Elle publie le cours au catalogue.', correct: false },
        ],
        explanation: 'La planification crée les cohortes, les comptes et les inscriptions. Voir « Planifier une demande acceptée ».',
      },
      {
        id: 'q-demande-3',
        sectionId: 'statuts-des-demandes',
        type: 'true-false',
        prompt: 'Le statut « Refusée » d’une demande est définitif.',
        options: [
          { id: 'a', text: 'Vrai', correct: true },
          { id: 'b', text: 'Faux', correct: false },
        ],
        explanation: '« Refusée » est un statut final. Voir « Lire les statuts d’une demande ».',
      },
      {
        id: 'q-cohorte-1',
        sectionId: 'faire-evoluer-le-statut',
        type: 'single',
        prompt: 'Que se passe-t-il quand vous cliquez sur `Démarrer` sur une cohorte ?',
        options: [
          { id: 'a', text: 'Rien du côté de la demande liée.', correct: false },
          { id: 'b', text: 'La demande liée passe automatiquement à « Formation en cours ».', correct: true },
          { id: 'c', text: 'Les certificats sont émis immédiatement.', correct: false },
        ],
        explanation: 'Démarrer la cohorte fait passer la demande à « Formation en cours ». Les certificats s’émettent à la clôture. Voir « Faire évoluer le statut ».',
      },
      {
        id: 'q-session-1',
        sectionId: 'planifier-les-sessions',
        type: 'single',
        prompt: 'Vous devez supprimer une session, mais le bouton est refusé. Pourquoi ?',
        options: [
          { id: 'a', text: 'Des présences ont déjà été enregistrées pour cette session.', correct: true },
          { id: 'b', text: 'La session est trop ancienne.', correct: false },
          { id: 'c', text: 'Vous n’êtes pas le formateur.', correct: false },
        ],
        explanation: 'Une session avec des émargements ne peut pas être supprimée. Voir « Comment planifier une session et convoquer ».',
      },
      {
        id: 'q-emargement-1',
        sectionId: 'emarger-une-session',
        type: 'single',
        prompt: 'Où saisissez-vous les présences d’une session ?',
        options: [
          { id: 'a', text: 'Dans l’onglet Présence de l’espace Formateur.', correct: true },
          { id: 'b', text: 'Dans l’onglet Sessions de la cohorte.', correct: false },
          { id: 'c', text: 'Dans la rubrique Rapports.', correct: false },
        ],
        explanation: 'La feuille d’émargement vit dans l’espace Formateur ; le bouton `Émargement` de la cohorte y mène. Voir « Comment émarger une session ».',
      },
      {
        id: 'q-emargement-2',
        sectionId: 'emarger-une-session',
        type: 'multiple',
        prompt: 'Quels statuts d’émargement comptent dans l’assiduité ?',
        options: [
          { id: 'a', text: 'Présent', correct: true },
          { id: 'b', text: 'En retard', correct: true },
          { id: 'c', text: 'Absent', correct: false },
          { id: 'd', text: 'Excusé', correct: false },
        ],
        explanation: 'L’assiduité compte les présents et les retards. Voir « Comment émarger une session ».',
      },
      {
        id: 'q-certif-1',
        sectionId: 'cloturer-et-certifier',
        type: 'single',
        prompt: 'À quel moment les certificats d’une cohorte s’émettent-ils en groupe ?',
        options: [
          { id: 'a', text: 'À la création de la cohorte.', correct: false },
          { id: 'b', text: 'Dans le dialogue de clôture, avec `Clôturer et émettre`.', correct: true },
          { id: 'c', text: 'Automatiquement chaque semaine.', correct: false },
        ],
        explanation: 'L’émission groupée se fait à la clôture ; après, on émet participant par participant. Voir « Comment clôturer une cohorte et émettre les certificats ».',
      },
      {
        id: 'q-certif-2',
        sectionId: 'gerer-les-certificats',
        type: 'true-false',
        prompt: 'On peut annuler la révocation d’un certificat.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La révocation est définitive. En cas d’erreur, on corrige la donnée et on réémet un nouveau certificat. Voir « Comment gérer le registre des certificats ».',
      },
      {
        id: 'q-cours-1',
        sectionId: 'publier-une-version-et-le-cours',
        type: 'single',
        prompt: 'Vous voulez modifier un cours déjà suivi par des cohortes. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je modifie directement la version courante.', correct: false },
          { id: 'b', text: 'Je crée une nouvelle version, je la modifie, puis je la publie.', correct: true },
          { id: 'c', text: 'Je supprime le cours et je le recrée.', correct: false },
        ],
        explanation: 'Une version publiée est figée : on duplique pour la faire évoluer ; les cohortes en cours gardent leur version. Voir « Publier une version et le cours ».',
      },
      {
        id: 'q-org-1',
        sectionId: 'rattacher-un-gestionnaire',
        type: 'single',
        prompt: 'Le message « Aucun compte actif ne correspond à cette adresse » s’affiche au rattachement d’un gestionnaire. Pourquoi ?',
        options: [
          { id: 'a', text: 'La personne n’a pas encore de compte, ou l’adresse est différente.', correct: true },
          { id: 'b', text: 'L’organisation est inactive.', correct: false },
          { id: 'c', text: 'Vous n’avez pas le droit de rattacher des membres.', correct: false },
        ],
        explanation: 'Le compte doit exister et être actif avant le rattachement. Voir « Rattacher un gestionnaire ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'multiple',
        prompt: 'Que devez-vous indiquer dans un message d’aide au support ?',
        options: [
          { id: 'a', text: 'L’adresse email de votre compte.', correct: true },
          { id: 'b', text: 'Le message d’erreur exact et l’heure de l’essai.', correct: true },
          { id: 'c', text: 'Votre mot de passe.', correct: false },
          { id: 'd', text: 'Votre code de vérification en cours.', correct: false },
        ],
        explanation: 'Jamais de mot de passe ni de code de vérification dans un message. Voir « Besoin d’aide ? ».',
      },
      {
        id: 'q-repere-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Sur mobile, comment ouvrez-vous le menu de gauche de votre espace ?',
        options: [
          { id: 'a', text: 'Avec le bouton « Ouvrir le menu » (trois traits) en haut à gauche de la barre de l’espace.', correct: true },
          { id: 'b', text: 'Le menu de gauche reste toujours affiché sur mobile.', correct: false },
          { id: 'c', text: 'En faisant pivoter le téléphone à l’horizontale.', correct: false },
        ],
        explanation: 'Sur mobile, le menu de gauche est masqué : ouvrez-le avec « Ouvrir le menu » (trois traits). Voir « Se repérer dans vos espaces ».',
      },
      {
        id: 'q-cycle-1',
        sectionId: 'comprendre-le-cycle',
        type: 'true-false',
        prompt: 'Après la planification, vous devez mettre la demande à jour à la main pour la passer à « Terminée ».',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La demande passe seule à « Formation en cours » au démarrage de la cohorte et à « Terminée » à sa clôture. Voir « Comprendre le cycle d’une formation ».',
      },
      {
        id: 'q-creer-cohorte-1',
        sectionId: 'creer-une-cohorte',
        type: 'single',
        prompt: 'À la création manuelle d’une cohorte, que signifie une capacité laissée vide ?',
        options: [
          { id: 'a', text: 'Une capacité illimitée.', correct: true },
          { id: 'b', text: 'Aucun participant autorisé.', correct: false },
          { id: 'c', text: 'Une capacité de dix participants par défaut.', correct: false },
        ],
        explanation: 'Une capacité laissée vide signifie « illimité ». Voir « Comment créer une cohorte manuellement ».',
      },
      {
        id: 'q-inscription-1',
        sectionId: 'valider-les-inscriptions',
        type: 'single',
        prompt: 'Que provoque l’action `Terminer` sur une inscription ?',
        options: [
          { id: 'a', text: 'Elle force la progression à 100 % et tente l’émission automatique du certificat.', correct: true },
          { id: 'b', text: 'Elle supprime définitivement l’inscription et son historique.', correct: false },
          { id: 'c', text: 'Elle suspend temporairement l’accès de l’apprenant.', correct: false },
        ],
        explanation: '« Terminer » force la progression à 100 % et tente l’émission du certificat. Voir « Comment valider les inscriptions et gérer leurs statuts ».',
      },
      {
        id: 'q-inscription-2',
        sectionId: 'valider-les-inscriptions',
        type: 'multiple',
        prompt: 'Pour quelles actions sur une inscription un motif est-il obligatoire ?',
        options: [
          { id: 'a', text: 'Terminer', correct: true },
          { id: 'b', text: 'Suspendre', correct: true },
          { id: 'c', text: 'Annuler', correct: true },
          { id: 'd', text: 'Valider', correct: false },
        ],
        explanation: 'Un motif est obligatoire pour Terminer, Suspendre et Annuler, mais pas pour Valider. Voir « Comment valider les inscriptions et gérer leurs statuts ».',
      },
      {
        id: 'q-banque-1',
        sectionId: 'banque-de-questions',
        type: 'single',
        prompt: 'Que se passe-t-il quand vous modifiez une question de la banque déjà répondue ?',
        options: [
          { id: 'a', text: 'Une nouvelle version est créée et l’ancienne est désactivée, sans casser les tentatives passées.', correct: true },
          { id: 'b', text: 'Les tentatives passées sont effacées.', correct: false },
          { id: 'c', text: 'La modification est refusée tant que le quiz existe.', correct: false },
        ],
        explanation: 'Modifier une question déjà répondue crée une nouvelle version et désactive l’ancienne. Voir « Comment gérer la banque de questions ».',
      },
      {
        id: 'q-modele-1',
        sectionId: 'modeles-de-certificats',
        type: 'single',
        prompt: 'Que se passe-t-il quand vous cochez « Modèle par défaut » sur un modèle de certificat ?',
        options: [
          { id: 'a', text: 'Les autres modèles sont automatiquement décochés : il n’y a qu’un seul modèle par défaut.', correct: true },
          { id: 'b', text: 'Tous les cours utilisent aussitôt ce modèle, même ceux qui ont un modèle dédié.', correct: false },
          { id: 'c', text: 'Plusieurs modèles par défaut peuvent coexister.', correct: false },
        ],
        explanation: 'Cocher « Modèle par défaut » décoche les autres : un seul modèle par défaut existe. Voir « Comment configurer les modèles de certificats ».',
      },
      {
        id: 'q-formateur-1',
        sectionId: 'designer-des-formateurs',
        type: 'single',
        prompt: 'Dans un cours, qu’est-ce qu’un formateur « référent du cours » ?',
        options: [
          { id: 'a', text: 'Le formateur principal du cours.', correct: true },
          { id: 'b', text: 'Un formateur limité à une seule cohorte.', correct: false },
          { id: 'c', text: 'Un formateur en attente de validation par le super administrateur.', correct: false },
        ],
        explanation: 'Le référent est le formateur principal du cours ; les autres enseignent toutes ses cohortes. Voir « Comment désigner un formateur ».',
      },
      {
        id: 'q-rapport-1',
        sectionId: 'produire-des-rapports',
        type: 'single',
        prompt: 'Quel rapport ne propose qu’un export CSV, sans PDF ?',
        options: [
          { id: 'a', text: 'La synthèse financière.', correct: true },
          { id: 'b', text: 'Le rapport par cours.', correct: false },
          { id: 'c', text: 'Le rapport par organisation.', correct: false },
        ],
        explanation: 'La synthèse financière n’a qu’un export CSV ; les autres rapports proposent CSV et PDF. Voir « Comment produire un rapport et l’exporter ».',
      },
      {
        id: 'q-notif-1',
        sectionId: 'notifications',
        type: 'single',
        prompt: 'Où lisez-vous vos notifications internes (nouvelle demande, demande annulée) ?',
        options: [
          { id: 'a', text: 'Dans le bloc Notifications de votre tableau de bord apprenant.', correct: true },
          { id: 'b', text: 'Dans un centre de notifications de l’espace Coordination.', correct: false },
          { id: 'c', text: 'Uniquement par message texte sur votre téléphone.', correct: false },
        ],
        explanation: 'Les espaces Coordination et Administration n’ont pas de centre de notifications : elles se lisent sur le tableau de bord apprenant. Voir « Notifications et emails que vous recevez ».',
      },
      {
        id: 'q-pratique-1',
        sectionId: 'bonnes-pratiques',
        type: 'single',
        prompt: 'Sous quel délai l’accusé de réception annonce-t-il une réponse à l’organisation ?',
        options: [
          { id: 'a', text: 'Cinq jours ouvrés.', correct: true },
          { id: 'b', text: 'Dix jours ouvrés.', correct: false },
          { id: 'c', text: 'Vingt-quatre heures.', correct: false },
        ],
        explanation: 'L’accusé annonce une réponse sous cinq jours ouvrés ; l’alerte du tableau de bord se déclenche, elle, après dix jours. Voir « Bonnes pratiques et sécurité ».',
      },
      {
        id: 'q-lexique-1',
        sectionId: 'lexique',
        type: 'single',
        prompt: 'D’après le lexique, comment se calcule l’assiduité d’un participant ?',
        options: [
          { id: 'a', text: '(présents + retards) divisé par le nombre de sessions passées.', correct: true },
          { id: 'b', text: 'Le nombre de sessions auxquelles il est inscrit.', correct: false },
          { id: 'c', text: 'Les présents seuls, divisés par le total des sessions prévues.', correct: false },
        ],
        explanation: 'L’assiduité rapporte (présents + retards) au nombre de sessions déjà passées. Voir « Lexique ».',
      },
    ],
  },
  related: [
    {
      label: 'Guide de l’apprenant',
      href: '/guide',
      description: 'Suivre une formation, faire les activités et récupérer ses certificats sur la plateforme.',
    },
    {
      label: 'Guide du formateur',
      href: '/formateur/guide',
      description: 'Animer une cohorte, corriger et saisir les présences dans l’espace Formateur.',
    },
    {
      label: 'Guide du coordinateur formation sur le site',
      href: '{{web}}/admin/guide',
      description: 'Organisations, finance en lecture, rapports et médiathèque depuis le site institutionnel.',
      external: true,
    },
  ],
}
