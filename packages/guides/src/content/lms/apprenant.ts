import type { Guide } from '@fetrag/contracts'

/**
 * Guide de l’apprenant (plateforme de formation, rôle LEARNER).
 *
 * Guide commun de la plateforme : tout compte connecté y a accès. Il décrit uniquement les écrans
 * et les règles présents dans `apps/lms` (connexion, catalogue, fiche de cours, tableau de bord,
 * lecteur, évaluations, devoirs, forums, calendrier, certificats, notifications).
 * Les liens vers le site institutionnel utilisent le marqueur `{{web}}`.
 */
export const lmsApprenant: Guide = {
  id: 'lms-apprenant',
  platform: 'lms',
  role: 'LEARNER',
  title: 'Guide de l’apprenant',
  subtitle: 'Suivre une formation sur la plateforme',
  audience:
    'Toute personne qui suit une formation de la FETRAG avec son compte : travailleuses et travailleurs, responsables syndicaux, participants inscrits par leur organisation, ainsi que les personnels de la Fédération qui suivent un module.',
  summary:
    'Avec votre compte FETRAG, vous choisissez un module du programme 2026, vous vous y inscrivez et vous suivez les activités à votre rythme, depuis un téléphone ou un ordinateur. Vous passez des évaluations, remettez des devoirs, échangez dans les forums et assistez aux séances en direct de votre cohorte. À la fin d’un module, vous obtenez une attestation ou un certificat numéroté que tout employeur peut vérifier.',
  tone: 'blue',
  icon: 'graduation-cap',
  readingMinutes: 45,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée (le compte se crée sur le site institutionnel, le même compte ouvre la plateforme de formation).',
    'Un téléphone ou un ordinateur connecté à Internet ; un navigateur récent (Chrome, Firefox, Safari ou Edge).',
    'Votre adresse email et votre mot de passe. Si votre compte est protégé par la vérification en deux étapes : votre application d’authentification.',
    'Pour les formations payantes : un compte Mobile Money ou une carte bancaire, le paiement se fait sur le site institutionnel.',
  ],
  quickStart: [
    {
      text: 'Ouvrez la page **Connexion** et saisissez votre **Adresse email** et votre **Mot de passe**.',
      ui: 'Se connecter',
      where: 'bouton bleu `Connexion` en haut à droite ; sur mobile, ouvrez le menu avec le bouton **Ouvrir le menu** (trois traits) puis `Connexion`',
      result: 'Votre **Tableau de bord** s’ouvre avec le message « Bonjour » ou « Bonsoir » suivi de votre prénom.',
    },
    {
      text: 'Ouvrez le **Catalogue** et choisissez un module.',
      ui: 'Voir la fiche',
      where: 'lien **Catalogue** dans la barre du haut (ou dans le menu mobile) ; bouton `Voir la fiche` sur la carte du module',
      result: 'La fiche du module s’affiche : objectifs, programme, formateurs, sessions et tarif.',
    },
    {
      text: 'Inscrivez-vous : pour un module gratuit en inscription libre, cliquez sur `Commencer`.',
      where: 'carte **Tarif** à droite de la fiche (sous le contenu sur mobile)',
      result: 'Le message « Inscription confirmée. Bonne formation. » apparaît et la première activité s’ouvre.',
      note: 'Selon le module, le bouton peut être `Demander l’inscription`, `S’inscrire - <prix>` ou `Réservé aux organisations` : voir la section « S’inscrire à une formation ».',
    },
    {
      text: 'Suivez la première activité, puis cliquez sur `Suivant`.',
      where: 'en bas de la page de l’activité',
      result: 'L’activité suivante s’ouvre ; dans le **Sommaire du cours**, l’activité terminée porte une coche verte.',
    },
    {
      text: 'La prochaine fois, reprenez depuis votre **Tableau de bord**.',
      ui: 'Reprendre',
      where: 'grand bouton **Reprendre : <titre de l’activité>** en haut du tableau de bord',
      result: 'Vous revenez exactement à la prochaine activité à faire.',
    },
  ],
  sections: [
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'user',
      summary: 'Ce que votre compte vous permet de faire sur la plateforme de formation, et ce qui relève d’autres personnes.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La plateforme de formation est l’espace où la Fédération des Travailleurs du Gabon dispense son programme de formation des leaders syndicaux : dix modules numérotés de 01 à 10, classés selon trois piliers (**Protection de l’outil de production**, **Prévention des conflits sociaux**, **Défense des intérêts matériels et moraux**). En tant qu’apprenant, vous suivez ces modules à votre rythme, seul ou au sein d’une cohorte (un groupe de participants qui suit une session ensemble avec un formateur).',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Consulter le catalogue et les fiches des modules, même sans être connecté.',
            'Vous inscrire à un module gratuit en inscription libre, demander une inscription soumise à validation, ou acheter une formation payante.',
            'Suivre les activités d’une formation : lectures, documents, vidéos, capsules audio, présentations, liens, contenus interactifs.',
            'Passer des évaluations (quiz), répondre aux questionnaires de satisfaction, remettre des devoirs et consulter vos résultats.',
            'Participer aux forums de votre cohorte, de votre formation et de la communauté FETRAG.',
            'Voir vos séances en direct et vos échéances dans le calendrier, et les exporter vers l’agenda de votre téléphone.',
            'Télécharger vos attestations et certificats, et partager leur lien de vérification publique.',
            'Lire vos notifications sur le tableau de bord.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire',
          style: 'bullet',
          items: [
            'Créer un compte, changer votre mot de passe, votre email ou vos préférences d’emails : cela se fait sur le site institutionnel (voir la section « Mon compte sur le site institutionnel »).',
            'Valider vous-même une demande d’inscription « En attente » : c’est la coordination formation qui l’accepte.',
            'Déposer une demande de formation pour une organisation : c’est réservé au responsable de votre organisation.',
            'Noter un devoir, corriger une composition, enregistrer une présence, émettre ou révoquer un certificat : ce sont les formateurs et la coordination.',
            'Modifier ou supprimer un message publié dans un forum, ni annuler une demande d’inscription en attente : ces actions n’existent pas à l’écran ; écrivez à la coordination si nécessaire.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Qui', 'Son rôle pour vous'],
          rows: [
            ['Le formateur', 'Anime votre cohorte, répond dans les forums, corrige vos compositions et vos devoirs, enregistre votre présence aux séances.'],
            ['La coordination formation', 'Valide les demandes d’inscription, programme les séances, crée les cohortes, émet ou révoque les certificats, gère les statuts d’inscription.'],
            ['Le responsable de votre organisation', 'Dépose une demande de formation pour son organisation et désigne les participants ; il suit la progression de son groupe.'],
            ['Le support de la Fédération', 'Vous aide en cas de problème de compte ou d’accès (voir « Besoin d’aide »).'],
          ],
        },
      ],
    },
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte et connexion',
      icon: 'log-in',
      summary: 'Un seul compte FETRAG pour le site institutionnel et la plateforme de formation.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous utilisez le même compte sur le site institutionnel et sur la plateforme de formation : une seule adresse email, un seul mot de passe. Quand vous êtes connecté sur l’un, vous l’êtes aussi sur l’autre. La création du compte, la confirmation de l’adresse email, le mot de passe oublié et la sécurité du compte se gèrent sur le site institutionnel : la plateforme vous y renvoie automatiquement.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Pas encore de compte ?',
          text: 'Cliquez sur **Créer un compte** : vous êtes redirigé vers le formulaire d’inscription du site institutionnel. Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre. Confirmez ensuite votre adresse email en ouvrant le lien reçu : sans cette confirmation, la connexion est refusée. Si votre organisation vous a inscrit à une formation, votre compte existe déjà : l’email d’invitation contient un lien pour définir votre mot de passe.',
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
                  text: 'Ouvrez la page **Connexion**.',
                  ui: 'Connexion',
                  where: 'bouton bleu `Connexion` en haut à droite de l’écran ; sur mobile, ouvrez le menu avec le bouton **Ouvrir le menu** (trois traits) en haut à droite, puis touchez `Connexion`',
                  result: 'La page « Reprenez votre parcours » s’affiche avec le formulaire de connexion.',
                  note: 'Si vous ouvrez directement une page réservée (par exemple votre tableau de bord) sans être connecté, cette page de connexion s’affiche automatiquement et vous serez renvoyé vers la page demandée après la connexion.',
                },
                {
                  text: 'Saisissez votre **Adresse email** (obligatoire).',
                  where: 'premier champ du formulaire',
                  note: 'Les majuscules n’ont pas d’importance : l’adresse est convertie en minuscules.',
                },
                {
                  text: 'Saisissez votre **Mot de passe** (obligatoire).',
                  where: 'deuxième champ ; le bouton en forme d’œil **Afficher le mot de passe** permet de vérifier ce que vous tapez',
                },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  where: 'sous les champs',
                  result: 'Le bouton affiche « Connexion en cours », puis votre **Tableau de bord** s’ouvre (ou la page que vous aviez demandée).',
                },
                {
                  text: 'Si le message bleu « Ce compte est protégé par une vérification en deux étapes » apparaît, saisissez le code à 6 chiffres de votre application d’authentification dans le champ **Code de vérification**, puis cliquez sur `Vérifier et se connecter`.',
                  where: 'le champ **Code de vérification** apparaît sous le mot de passe',
                  result: 'Votre tableau de bord s’ouvre.',
                  note: 'Vous pouvez aussi utiliser l’un de vos codes de secours (conservés lors de l’activation). La vérification en deux étapes est facultative pour un apprenant : elle s’active sur le site institutionnel, page **Sécurité du compte**.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              title: 'Si la connexion échoue',
              items: [
                {
                  problem: 'Message « Adresse email ou mot de passe incorrect. »',
                  cause: 'Une faute de frappe, ou un mot de passe oublié.',
                  solution: 'Affichez le mot de passe avec le bouton en forme d’œil et réessayez. Sinon, cliquez sur **Mot de passe oublié ?** : vous êtes conduit sur le site institutionnel pour recevoir un lien de réinitialisation par email.',
                },
                {
                  problem: 'Message « Confirmez d’abord votre adresse email : ouvrez le lien reçu lors de votre inscription. »',
                  cause: 'Votre adresse email n’a jamais été confirmée.',
                  solution: 'Cherchez l’email de confirmation (regardez aussi dans les courriers indésirables). Si vous ne le trouvez pas, cliquez sur **Renvoyer le lien de confirmation**.',
                },
                {
                  problem: 'Message « Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer. »',
                  cause: 'Plus de 10 essais en 15 minutes depuis votre adresse ou votre connexion.',
                  solution: 'Attendez le nombre de minutes indiqué, puis réessayez calmement avec le bon mot de passe.',
                },
                {
                  problem: 'Message « Le code de vérification est invalide ou expiré. »',
                  cause: 'Le code de l’application change toutes les 30 secondes ; celui saisi était trop ancien.',
                  solution: 'Attendez un nouveau code dans l’application d’authentification et saisissez-le sans espace. Vérifiez que l’heure de votre téléphone est réglée automatiquement.',
                },
                {
                  problem: 'Message « Ce compte est désactivé. »',
                  cause: 'Votre compte a été désactivé par la Fédération.',
                  solution: 'Contactez le support de la FETRAG (voir « Besoin d’aide ») pour demander la réactivation.',
                },
                {
                  problem: 'Message « La connexion par mot de passe est désactivée sur cette plateforme. »',
                  cause: 'La Fédération a activé la connexion par un fournisseur d’identité externe.',
                  solution: 'Utilisez le bouton **Se connecter avec** (compte FETRAG) affiché au-dessus du formulaire.',
                },
                {
                  problem: 'Message « La connexion est momentanément indisponible. »',
                  cause: 'Un incident technique passager.',
                  solution: 'Réessayez dans quelques instants. Si le problème persiste plus d’une heure, écrivez au support.',
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
              type: 'callout',
              tone: 'warning',
              title: 'Appareil partagé',
              text: 'Sur un téléphone ou un ordinateur qui n’est pas le vôtre (cybercafé, poste de travail commun, téléphone prêté), déconnectez-vous toujours à la fin. Votre progression est enregistrée : vous ne perdez rien.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur ordinateur : ouvrez le menu du compte, puis cliquez sur `Déconnexion`.',
                  where: 'bouton avec vos initiales et votre nom, en haut à droite ; `Déconnexion` est le dernier élément du menu, en rouge',
                  result: 'Le bouton affiche « Déconnexion en cours », puis la page d’accueil de la plateforme s’ouvre.',
                },
                {
                  text: 'Sur mobile : ouvrez le menu avec le bouton **Ouvrir le menu** (trois traits), touchez `Déconnexion`, puis `Confirmer la déconnexion`.',
                  where: 'en bas du tiroir de navigation ; la page « Se déconnecter ? » demande confirmation',
                  result: 'La page d’accueil s’ouvre. Si vous rouvrez la page de connexion, le message vert « Vous avez été déconnecté. » s’affiche.',
                  note: 'Sur la page « Se déconnecter ? », le lien **Annuler et rester connecté** vous ramène au tableau de bord.',
                },
              ],
            },
          ],
        },
        {
          id: 'verification-en-deux-etapes',
          title: 'La vérification en deux étapes',
          blocks: [
            {
              type: 'paragraph',
              text: 'La vérification en deux étapes (aussi appelée MFA) ajoute un code temporaire, généré par une application sur votre téléphone, en plus de votre mot de passe. Elle est obligatoire pour certains personnels de la Fédération et facultative pour les apprenants. Nous la recommandons si votre compte donne accès à des informations sensibles.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone (par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP).',
                  where: 'boutique d’applications de votre téléphone',
                },
                {
                  text: 'Ouvrez le menu du compte et cliquez sur **Sécurité du compte**.',
                  where: 'bouton avec vos initiales en haut à droite ; sur mobile, l’avatar avec vos initiales à côté du bouton du menu',
                  result: 'La page de sécurité de votre compte s’ouvre sur le site institutionnel.',
                },
                {
                  text: 'Suivez les instructions : scannez le code QR, saisissez le code affiché, puis conservez vos codes de secours en lieu sûr.',
                  result: 'À chaque connexion, le champ **Code de vérification** vous sera demandé après le mot de passe.',
                  note: 'La procédure détaillée figure dans le guide du membre, sur le site institutionnel.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'se-reperer',
      title: 'Se repérer dans la plateforme',
      icon: 'compass',
      summary: 'La barre de navigation, le menu du compte, le tableau de bord et les écrans que vous utiliserez le plus.',
      blocks: [
        {
          type: 'screen',
          title: 'La barre de navigation (en haut de chaque page)',
          description: 'Elle reste visible en haut de l’écran quand vous faites défiler la page. Un fin bandeau bleu, vert et or la surmonte.',
          areas: [
            {
              name: 'Logo FETRAG et pastille « Formation » (à gauche)',
              purpose: 'Un clic ramène à la page d’accueil de la plateforme.',
              icon: 'home',
            },
            {
              name: 'Liens principaux (ordinateur) : Catalogue · Tableau de bord · Mes formations · Calendrier · Certificats',
              purpose: 'Le lien de la page en cours est souligné en vert. **Catalogue** est visible même sans connexion ; les autres liens apparaissent une fois connecté.',
              icon: 'menu',
            },
            {
              name: 'Bouton du compte (ordinateur, à droite)',
              purpose: 'Vos initiales, votre nom et une petite flèche. Il ouvre le menu du compte. Avant la connexion, il est remplacé par le bouton `Connexion`.',
              icon: 'user',
            },
            {
              name: 'Bouton « Ouvrir le menu » (mobile, trois traits en haut à droite)',
              purpose: 'Ouvre le tiroir de navigation qui glisse depuis la droite. À côté, votre avatar (initiales) ouvre le menu du compte.',
              icon: 'smartphone',
            },
            {
              name: 'Lien « Aller au contenu principal »',
              purpose: 'Lien invisible qui apparaît quand vous naviguez au clavier avec la touche `Tab` : il saute directement au contenu.',
              icon: 'arrow-right',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Le tiroir de navigation (mobile)',
          description: 'Il s’ouvre avec le bouton **Ouvrir le menu** et se ferme avec la croix **Fermer le menu**, la touche `Échap`, un toucher sur le fond sombre, ou dès que vous choisissez une page.',
          areas: [
            {
              name: 'Liste des pages',
              purpose: '**Catalogue** (les formations ouvertes aux inscriptions), **Tableau de bord** (votre progression et vos prochaines échéances), **Mes formations** (inscriptions et parcours en cours), **Calendrier** (sessions, séances en direct et échéances), **Certificats** (attestations et certificats obtenus).',
              icon: 'list-tree',
            },
            {
              name: 'Bloc de retour vers le site institutionnel',
              purpose: 'Ramène au site institutionnel (actualités, services, votre profil). Son libellé cite l’adresse du site.',
              icon: 'globe',
            },
            {
              name: 'Boutons du bas',
              purpose: 'Connecté : `Mon espace` (votre tableau de bord) et `Déconnexion`. Visiteur : `Connexion` et `Créer un compte`.',
              icon: 'log-out',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Le menu du compte',
          description: 'Il s’ouvre depuis vos initiales (en haut à droite, sur ordinateur comme sur mobile).',
          areas: [
            {
              name: 'En-tête',
              purpose: 'Votre nom, votre adresse email et une pastille verte avec votre rôle (« Apprenant »).',
              icon: 'user',
            },
            {
              name: 'Raccourcis personnels',
              purpose: '**Tableau de bord**, **Mes formations**, **Calendrier**, **Mes certificats**.',
              icon: 'layout-dashboard',
            },
            {
              name: 'Liens vers le site institutionnel',
              purpose: '**Mon profil** (vos informations ; le libellé complet du lien cite l’adresse du site institutionnel), **Sécurité du compte** (mot de passe, vérification en deux étapes), **Site institutionnel**. Ils s’ouvrent sur le site, avec la même session.',
              icon: 'external-link',
            },
            {
              name: 'Déconnexion (en rouge, tout en bas)',
              purpose: 'Ferme votre session immédiatement.',
              icon: 'log-out',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Le tableau de bord',
          description: 'C’est votre page d’accueil une fois connecté. Elle est faite pour reprendre vite là où vous vous étiez arrêté.',
          areas: [
            {
              name: 'Bandeau du haut',
              purpose: '« Bonjour » ou « Bonsoir » suivi de votre prénom, une phrase sur votre situation, le grand bouton **Reprendre : <activité>** (ou `Choisir une formation` si vous n’avez aucun parcours) et le bouton `Mes formations`.',
              icon: 'play',
            },
            {
              name: 'Indicateurs d’apprentissage',
              purpose: 'Quatre tuiles : **En cours**, **Terminées**, **Certificats**, **Temps d’étude**. À côté, l’anneau **Progression moyenne** de vos parcours actifs.',
              icon: 'pie-chart',
            },
            {
              name: '01 Reprendre',
              purpose: 'Jusqu’à trois parcours en cours avec leur prochaine activité et un bouton `Reprendre` ou `Commencer`. En dessous, vos éventuelles **Demandes d’inscription en attente de validation**.',
              icon: 'graduation-cap',
            },
            {
              name: '02 Échéances',
              purpose: 'Les devoirs à rendre et les séances des 30 prochains jours, avec la mention « En retard » si besoin. Lien **Calendrier**.',
              icon: 'calendar',
            },
            {
              name: '03 Résultats récents',
              purpose: 'Vos derniers scores d’évaluation et notes de devoirs. Le lien **Mes devoirs** ouvre la liste de tous vos devoirs.',
              icon: 'bar-chart',
            },
            {
              name: '04 Certificats',
              purpose: 'Vos derniers documents avec leur statut (« Valide », « Révoqué », « Expiré »). Lien **Tous mes certificats**.',
              icon: 'award',
            },
            {
              name: '05 Notifications',
              purpose: 'Vos six dernières notifications (un point vert signale une notification non lue) et le bouton `Tout marquer comme lu`. Il n’y a pas de cloche dans la barre du haut : c’est ici que vous lisez vos notifications.',
              icon: 'bell',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Deux pages sans lien dans la barre',
          text: 'La liste de vos devoirs s’ouvre depuis le lien **Mes devoirs** de la section « 03 Résultats récents » du tableau de bord (ou depuis une activité « Devoir » du lecteur). Les forums s’ouvrent depuis une activité « Forum » du lecteur, avec le bouton `Participer au forum`. Vous pouvez aussi enregistrer ces pages dans les favoris de votre navigateur.',
        },
        {
          type: 'path',
          label: 'Chemins utiles',
          items: ['Barre du haut', 'Tableau de bord', '03 Résultats récents', 'Mes devoirs'],
          href: '/devoirs',
        },
        {
          type: 'path',
          items: ['Barre du haut', 'Mes formations', 'Reprendre', 'Sommaire du cours', 'activité « Forum »', 'Participer au forum'],
          href: '/forums',
        },
        {
          type: 'screen',
          title: 'Le pied de page',
          description: 'En bas de chaque page.',
          areas: [
            {
              name: 'Liens',
              purpose: '**Catalogue**, **Demande de formation** (réservé aux responsables d’organisation), **Vérifier un certificat** (page publique du site institutionnel), **Contact**, **Mentions légales**, **Confidentialité** et **Aide** (ouvre votre application email avec l’adresse de contact de la Fédération).',
              icon: 'link',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si une page inattendue s’affiche',
          items: [
            {
              problem: 'Page « Accès refusé » avec le texte « Cet espace est réservé à un rôle... ».',
              cause: 'Vous avez ouvert un espace réservé (formateur, organisation, coordination, administration) que votre compte n’a pas le droit de voir.',
              solution: 'Cliquez sur `Retour au tableau de bord`. Si vous pensez avoir droit à cet espace, cliquez sur `Contacter la coordination` : un email pré-rempli s’ouvre. Pour changer de compte, cliquez sur `Changer de compte`.',
            },
            {
              problem: 'Page de connexion avec le message « Connectez-vous pour accéder à cette page. »',
              cause: 'Votre session est fermée ou a expiré.',
              solution: 'Connectez-vous : vous serez renvoyé automatiquement vers la page demandée.',
            },
            {
              problem: 'Page « Cette page est introuvable » (Erreur 404).',
              cause: 'L’adresse est erronée ou le contenu n’est plus accessible.',
              solution: 'Utilisez le champ **Rechercher une formation, un module...** puis `Rechercher`, ou les boutons `Accueil`, `Catalogue` et `Tableau de bord`.',
            },
          ],
        },
      ],
    },
    {
      id: 'choisir-une-formation',
      title: 'Comment choisir une formation dans le catalogue',
      icon: 'search',
      summary: 'Rechercher, filtrer et lire la fiche d’un module avant de s’inscrire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le catalogue est public : vous pouvez le consulter sans être connecté. Il présente les modules publiés du programme 2026 sous forme de cartes : numéro (01 à 10), titre, trois premiers objectifs, durée, et un badge vert « Gratuit » ou le prix en francs CFA (XAF). Le trait de couleur de la carte indique le pilier du module.',
        },
        {
          type: 'steps',
          title: 'Rechercher et filtrer',
          items: [
            {
              text: 'Ouvrez le **Catalogue**.',
              where: 'lien **Catalogue** dans la barre du haut ; sur mobile, bouton **Ouvrir le menu** (trois traits) puis **Catalogue**',
              result: 'La page « Les formations du programme 2026 » s’affiche avec la barre **Filtrer le catalogue** et la grille des modules. Le compteur indique « N formations ».',
            },
            {
              text: 'Pour chercher un mot, tapez-le dans le champ **Rechercher**, puis cliquez sur `Rechercher`.',
              where: 'en haut de la barre de filtres',
              result: 'La grille ne montre que les modules dont le titre ou le contenu contient ce mot.',
            },
            {
              text: 'Pour limiter à un pilier, choisissez-le dans la liste **Pilier**.',
              where: 'liste déroulante de la barre de filtres',
              result: 'La liste se met à jour immédiatement.',
              note: 'Choix possibles : **Tous les piliers**, **Protection de l’outil de production**, **Prévention des conflits sociaux**, **Défense des intérêts matériels et moraux**.',
            },
            {
              text: 'Pour choisir la façon de suivre la formation, utilisez la liste **Modalité**.',
              note: '**À distance (asynchrone)** : vous suivez seul, quand vous voulez. **En direct (synchrone)** : séances à dates fixes avec un formateur. **Hybride** : les deux.',
            },
            {
              text: 'Pour ne voir que les modules sans frais, cochez **Formations gratuites uniquement**.',
            },
            {
              text: 'Pour changer l’ordre, utilisez **Trier par**.',
              note: 'Par défaut : **Ordre du programme (01 à 10)**. Autres choix : **Titre (A à Z)**, **Durée croissante**, **Publication la plus récente**.',
            },
            {
              text: 'Pour effacer tous les filtres, cliquez sur `Réinitialiser`.',
              where: 'ce bouton n’apparaît que si un filtre est actif',
              result: 'Tous les modules publiés sont à nouveau affichés.',
              note: 'Les filtres sont dans l’adresse de la page : vous pouvez copier cette adresse pour la partager.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Lire la fiche d’un module',
          items: [
            {
              text: 'Cliquez sur `Voir la fiche` sur la carte du module.',
              result: 'La fiche s’ouvre avec un en-tête sombre « Module NN · <pilier> » et les caractéristiques : durée, modalité, niveau (« Initiation », « Intermédiaire » ou « Avancé ») et prix.',
            },
            {
              text: 'Lisez **Objectifs pédagogiques** (« À l’issue de ce module, vous saurez ») et **Présentation** (description, **Public visé**, **Prérequis**).',
              note: 'Un prérequis est un module à terminer avant celui-ci. Les prérequis marqués « (recommandé) » sont conseillés ; les autres sont obligatoires pour une inscription libre.',
            },
            {
              text: 'Ouvrez **Programme** pour voir les modules, leçons et activités.',
              where: 'accordéon : touchez le titre d’un module pour le déplier',
              result: 'Chaque leçon porte le badge vert « Aperçu libre » (consultable sans compte) ou « Réservé aux inscrits ».',
              note: 'Pour une leçon en aperçu libre, cliquez sur **Consulter l’aperçu de cette leçon** pour la lire avant de vous inscrire.',
            },
            {
              text: 'Consultez **Équipe pédagogique** (vos formateurs, le badge or « Référent » désigne le responsable du module) et **Prochaines sessions** (cohortes ouvertes, dates, mode « Présentiel », « Classe virtuelle » ou « Hybride », places restantes).',
              note: '« Complet » signifie qu’il n’y a plus de place dans cette cohorte.',
            },
            {
              text: 'Regardez la carte **Tarif**, à droite (ou sous le contenu sur mobile) : elle indique le prix, la durée, la modalité, le niveau, le nombre de leçons et le bouton d’inscription adapté à votre situation.',
              result: 'Vous savez si le module est gratuit, payant, sur validation ou réservé aux organisations (voir la section suivante).',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Aucune formation ne correspond à votre recherche » s’affiche.',
              cause: 'Les filtres sont trop restrictifs ou le mot cherché est mal orthographié.',
              solution: 'Cliquez sur `Voir tout le catalogue` ou sur `Réinitialiser`, puis affinez un filtre à la fois.',
            },
            {
              problem: 'La fiche affiche « Cette formation n’est pas disponible ».',
              cause: 'Le module n’est pas encore publié, ou il a été retiré.',
              solution: 'Cliquez sur `Voir le catalogue` pour choisir un module publié. Si votre organisation vous a annoncé cette formation, attendez la convocation ou contactez la coordination.',
            },
            {
              problem: 'Le catalogue affiche « Le catalogue est en cours de publication ».',
              cause: 'Aucun module n’est encore publié.',
              solution: 'Revenez plus tard : la Fédération publie les modules au fil du programme.',
            },
          ],
        },
      ],
    },
    {
      id: 's-inscrire-a-une-formation',
      title: 'Comment s’inscrire à une formation',
      icon: 'user-plus',
      summary: 'Quatre situations selon le module : inscription libre, sur validation, payante ou réservée aux organisations.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le bouton de la carte **Tarif** change selon le module et votre situation. Si vous n’êtes pas connecté, la fiche affiche `Se connecter pour s’inscrire` et `Créer un compte` : connectez-vous d’abord.',
        },
        {
          type: 'table',
          caption: 'Le bouton affiché et ce qu’il fait',
          columns: ['Bouton', 'Situation', 'Ce qui se passe'],
          rows: [
            ['`Commencer`', 'Inscription libre (le plus souvent un module gratuit).', 'Inscription immédiate ; la première activité s’ouvre.'],
            ['`Demander l’inscription`', 'Inscription sur validation.', 'Votre demande est transmise à la coordination ; vous attendez son accord.'],
            ['`S’inscrire - <prix>`', 'Formation payante.', 'Une commande est créée et vous payez sur le site institutionnel (Mobile Money ou carte). L’accès s’ouvre au paiement.'],
            ['`Réservé aux organisations`', 'Module dispensé en cohorte à la demande d’une organisation affiliée.', 'Le responsable de votre organisation dépose une demande ; la coordination vous inscrit ensuite.'],
            ['`Reprendre` / `Revoir la formation`', 'Vous êtes déjà inscrit (parcours en cours ou terminé).', 'Le lecteur s’ouvre sur la prochaine activité (ou la dernière consultée).'],
          ],
        },
      ],
      subsections: [
        {
          id: 'inscription-libre',
          title: 'Inscription libre : commencer tout de suite',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Connectez-vous, puis ouvrez la fiche du module.',
                  result: 'La carte **Tarif** affiche « Gratuit » (ou le prix) et le bouton `Commencer`.',
                },
                {
                  text: 'Cliquez sur `Commencer`.',
                  where: 'carte **Tarif**, à droite sur ordinateur, sous le contenu sur mobile',
                  result: 'Le message « Inscription confirmée. Bonne formation. » apparaît et le lecteur s’ouvre sur la première activité. Votre inscription est « En cours ».',
                  note: 'Vous recevez la notification « Inscription confirmée » et un email du même nom avec un bouton **Commencer la formation**.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Message « Prérequis non validés : <titres> ».',
                  cause: 'Un ou plusieurs modules obligatoires ne sont pas encore terminés.',
                  solution: 'Terminez d’abord les modules cités (ils sont listés sous **Prérequis** sur la fiche), puis revenez.',
                },
                {
                  problem: 'Message « Ce cours est complet » ou « Cette cohorte est complète ».',
                  cause: 'Le nombre maximal d’inscrits est atteint.',
                  solution: 'Attendez l’ouverture d’une nouvelle session (consultez **Prochaines sessions**) ou contactez la coordination.',
                },
                {
                  problem: 'Message « Ce cours n’est pas ouvert aux inscriptions ».',
                  cause: 'Le module est en préparation ou fermé.',
                  solution: 'Revenez plus tard ou choisissez un autre module du catalogue.',
                },
              ],
            },
          ],
        },
        {
          id: 'inscription-sur-validation',
          title: 'Inscription sur validation : demander puis attendre l’accord',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche, cliquez sur `Demander l’inscription`.',
                  where: 'carte **Tarif**',
                  result: 'Le message vert « Votre demande d’inscription a été transmise à la coordination. » s’affiche. La fiche indique ensuite « Votre demande d’inscription est en attente de validation par la coordination. »',
                },
                {
                  text: 'Suivez votre demande dans **Tableau de bord** (bloc **Demandes d’inscription en attente de validation**) ou dans **Mes formations**, onglet `En attente`.',
                  result: 'La carte porte le badge « En attente » et le bouton `Voir la fiche`.',
                },
                {
                  text: 'Attendez la décision de la coordination : vous recevez la notification « Inscription validée » puis « Inscription confirmée » (et les emails correspondants).',
                  result: 'Sur la fiche et dans **Mes formations**, le bouton devient `Reprendre` (ou `Commencer`).',
                  note: 'En cas de refus, vous recevez « Inscription annulée » et l’inscription passe dans l’onglet `Clôturées`. Il n’existe pas de bouton pour annuler vous-même une demande : écrivez à la coordination si vous changez d’avis.',
                },
              ],
            },
          ],
        },
        {
          id: 'formation-payante',
          title: 'Formation payante : payer sur le site institutionnel',
          blocks: [
            {
              type: 'callout',
              tone: 'warning',
              title: 'Avant de payer',
              text: 'Vérifiez le titre du module et le montant affiché sur le bouton. Le paiement se fait sur le site institutionnel, jamais sur la plateforme de formation. Ne communiquez jamais votre code Mobile Money ni les données de votre carte à une personne, même au support.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche, lisez le **Tarif** puis cliquez sur le bouton or `S’inscrire - <prix>`.',
                  where: 'carte **Tarif** ; sous le bouton, une mention précise que le paiement est sécurisé (Mobile Money ou carte) sur le site institutionnel et que l’accès s’ouvre dès la confirmation du règlement',
                  result: 'Une commande est créée et vous êtes conduit sur la page de paiement du site institutionnel.',
                  note: 'Si un **Tarif membre** est affiché, il est indiqué à titre d’information ; le bouton utilise le tarif standard. Pour toute question de tarif, contactez la coordination avant de payer.',
                },
                {
                  text: 'Réglez la commande sur le site institutionnel (Mobile Money ou carte) en suivant les indications de la page de paiement.',
                  result: 'Vous recevez l’email « Paiement confirmé - commande ... » puis l’email « Inscription confirmée ».',
                  note: 'La procédure de paiement, les reçus et les remboursements sont décrits dans le guide du membre du site institutionnel.',
                },
                {
                  text: 'Revenez sur la plateforme et ouvrez **Mes formations**.',
                  result: 'La formation apparaît avec le badge « En cours » et le bouton `Commencer`.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Message « Aucune offre tarifaire active pour ce module. Contactez la coordination. »',
                  cause: 'Le tarif du module n’est pas encore configuré.',
                  solution: 'Écrivez à la coordination formation (voir « Besoin d’aide ») en indiquant le titre du module.',
                },
                {
                  problem: 'Vous avez payé mais la formation n’apparaît pas dans **Mes formations**.',
                  cause: 'La confirmation du paiement par l’opérateur peut prendre quelques minutes.',
                  solution: 'Attendez l’email « Paiement confirmé », puis rechargez **Mes formations**. Sans confirmation après une heure, contactez le support avec la référence de votre commande (visible dans votre espace personnel sur le site institutionnel).',
                },
                {
                  problem: 'Message « Cette formation est payante : un paiement est requis » ou « La commande n’est pas réglée ».',
                  cause: 'La commande existe mais n’a pas été payée.',
                  solution: 'Terminez le paiement depuis votre espace personnel sur le site institutionnel (page des paiements).',
                },
              ],
            },
          ],
        },
        {
          id: 'formation-reservee-aux-organisations',
          title: 'Formation réservée aux organisations',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche, le bouton or `Réservé aux organisations` s’affiche avec le texte « Ce module est dispensé en cohorte à la demande d’une organisation affiliée. »',
                  note: 'Vous ne pouvez pas vous inscrire seul. Parlez-en au responsable de votre organisation (syndicat, section, entreprise) : lui seul peut déposer une demande de formation.',
                },
                {
                  text: 'Attendez l’inscription par la coordination : vous recevez la notification « Inscription à une session de formation » et l’email « Inscription confirmée » avec le nom de la cohorte, la date de début et le lieu.',
                  result: 'La formation apparaît dans **Mes formations** avec le nom et la date de la cohorte.',
                  note: 'Si vous n’aviez pas de compte, vous recevez d’abord un email d’invitation avec un lien pour définir votre mot de passe.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Page « Espace organisation »',
              text: 'Si vous cliquez sur **Demande pour une organisation** (catalogue) ou **Demande de formation** (pied de page) sans être responsable d’une organisation, vous voyez un écran d’orientation, pas un formulaire. Il vous invite à demander au responsable de votre organisation ou à la coordination de vous désigner comme gestionnaire, ou à vous former à titre individuel via le catalogue.',
            },
          ],
        },
      ],
    },
    {
      id: 'suivre-mes-inscriptions',
      title: 'Comment suivre mes inscriptions dans « Mes formations »',
      icon: 'clipboard-list',
      summary: 'La liste de tous vos parcours, filtrée par état, avec la progression et les boutons de reprise.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Mes formations**.',
              where: 'barre du haut ; sur mobile, bouton **Ouvrir le menu** (trois traits) puis **Mes formations** ; aussi depuis le menu du compte',
              result: 'La page « Votre parcours de formation » liste vos inscriptions, une carte par formation.',
            },
            {
              text: 'Choisissez un onglet : `Toutes`, `En cours`, `Terminées`, `En attente` ou `Clôturées`.',
              where: 'rangée d’onglets sous le titre ; sur mobile, faites glisser la rangée vers la gauche pour voir les onglets suivants',
              result: 'Le compteur de chaque onglet indique le nombre de formations concernées.',
            },
            {
              text: 'Sur une carte, lisez le badge de statut, l’anneau de progression, la durée, la modalité et, s’il y a lieu, la cohorte et sa date de début.',
            },
            {
              text: 'Cliquez sur `Commencer` (parcours à 0 %), `Reprendre` (parcours entamé) ou `Revoir` (parcours terminé).',
              result: 'Le lecteur s’ouvre sur la prochaine activité à faire.',
              note: 'Pour une inscription en attente ou clôturée, seul `Voir la fiche` est proposé.',
            },
            {
              text: 'Si un document a été émis, cliquez sur le bouton or `Certificat` ou `Attestation`.',
              result: 'La page du document s’ouvre.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’une inscription',
          items: [
            { label: 'En attente', tone: 'warning', meaning: 'Votre demande a été transmise à la coordination.', next: 'Attendez la notification de validation. Onglet `En attente`.' },
            { label: 'En cours', tone: 'info', meaning: 'Le parcours est ouvert : toutes les activités disponibles sont accessibles.', next: 'Cliquez sur `Commencer` ou `Reprendre`.' },
            { label: 'Terminée', tone: 'success', meaning: 'Vous avez rempli les règles d’achèvement du module.', next: 'Consultez votre certificat ; le lecteur reste consultable avec `Revoir`.' },
            { label: 'Suspendue', tone: 'warning', meaning: 'L’inscription a été suspendue par la coordination ou le formateur.', next: 'Contactez la coordination pour connaître le motif. Onglet `Clôturées`.' },
            { label: 'Annulée', tone: 'danger', meaning: 'L’inscription a été annulée (refus d’une demande, désistement).', next: 'Vous pouvez faire une nouvelle demande si le module reste ouvert.' },
            { label: 'Expirée', tone: 'neutral', meaning: 'La date limite d’accès au module est dépassée.', next: 'Contactez la coordination formation si vous souhaitez une prolongation.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La liste affiche « Aucune inscription pour le moment ».',
              cause: 'Vous ne vous êtes encore inscrit à aucun module.',
              solution: 'Cliquez sur `Choisir une formation` pour ouvrir le catalogue.',
            },
            {
              problem: 'Une formation a disparu de l’onglet `En cours`.',
              cause: 'Elle est terminée, suspendue, annulée ou expirée.',
              solution: 'Regardez les onglets `Terminées` puis `Clôturées` ; le badge vous dit ce qui s’est passé.',
            },
          ],
        },
      ],
    },
    {
      id: 'suivre-une-formation',
      title: 'Comment suivre une formation dans le lecteur',
      icon: 'book-open',
      summary: 'Le lecteur affiche le sommaire du cours, l’activité en cours, votre progression et les boutons Précédent / Suivant.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le lecteur est l’écran où vous suivez réellement la formation. Vous y entrez avec les boutons `Commencer`, `Reprendre` ou `Revoir`. La plateforme vous conduit toujours à la prochaine activité obligatoire non terminée ; si tout est terminé, à la dernière activité consultée.',
        },
        {
          type: 'screen',
          title: 'L’écran du lecteur',
          areas: [
            {
              name: 'Sommaire du cours (colonne de gauche sur ordinateur ; bouton **Sommaire · N %** sur mobile)',
              purpose: 'La liste des modules, leçons et activités. En haut : le lien **Fiche de la formation**, la barre **Progression du cours** et le compteur « N/N activités obligatoires terminées ». Chaque activité porte une icône d’état : coche verte « Terminé », lecture bleue « En cours », cadenas « Verrouillé », cercle « À faire ». La mention « opt. » signale une activité facultative.',
              icon: 'list-tree',
            },
            {
              name: 'En-tête de l’activité',
              purpose: '« Leçon N.M · <module> », le titre, le badge du type (« Contenu », « Vidéo », « Évaluation »...), la durée indicative « N min », l’échéance « Avant le <date> » et l’étoile « Activité obligatoire » ou « Activité facultative ».',
              icon: 'info',
            },
            {
              name: 'Encadré « Consignes »',
              purpose: 'Les instructions du formateur pour cette activité, quand il en a rédigé.',
              icon: 'clipboard-list',
            },
            {
              name: 'Zone de contenu',
              purpose: 'Le texte, la vidéo, le document, la carte d’évaluation ou de devoir... selon le type d’activité.',
              icon: 'play',
            },
            {
              name: 'Panneau « Version bas débit »',
              purpose: 'Sous une vidéo ou une capsule audio : transcription intégrale, capsule audio légère et document de remplacement, pour une connexion lente.',
              icon: 'wifi-off',
            },
            {
              name: 'Bloc de progression (en bas)',
              purpose: '« Activité en cours » ou « Activité terminée », la règle de validation, le temps de consultation et l’état d’enregistrement. Le bouton `Marquer comme terminé` s’y trouve quand il est nécessaire.',
              icon: 'check-circle',
            },
            {
              name: 'Navigation entre les activités',
              purpose: 'Boutons `Précédent` et `Suivant` avec le titre de l’activité. En fin de parcours : `Mes certificats` (formation terminée) ou `Retour au tableau de bord`.',
              icon: 'arrow-right',
            },
          ],
        },
      ],
      subsections: [
        {
          id: 'avancer-dans-le-parcours',
          title: 'Avancer dans le parcours',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez votre **Tableau de bord** et cliquez sur `Reprendre : <activité>` (ou, dans **Mes formations**, sur `Commencer` / `Reprendre`).',
                  result: 'Le lecteur s’ouvre directement sur l’activité à faire.',
                },
                {
                  text: 'Lisez les **Consignes** si l’encadré est présent, puis suivez l’activité (lire, regarder, écouter, télécharger...).',
                  note: 'Le temps que vous passez sur l’activité est compté tant que l’onglet est visible à l’écran.',
                },
                {
                  text: 'Regardez le bloc de progression en bas de page : il indique comment l’activité se valide.',
                  note: 'Règles possibles : « validée dès sa consultation », « validée après N min de consultation », « validée en la marquant comme terminée », « validée en réussissant l’évaluation associée », « validée à la remise de votre travail », « validée par l’émargement de votre présence à la séance », « validée par le formateur ».',
                },
                {
                  text: 'Si le bouton `Marquer comme terminé` est affiché, cliquez dessus une fois l’activité faite.',
                  where: 'bloc de progression, en bas de l’activité',
                  result: 'Le message « Activité terminée. » apparaît et l’activité passe en coche verte dans le sommaire.',
                  note: 'Ce bouton n’existe que pour les activités validées par consultation ou par temps passé. Une évaluation, un devoir ou une séance se valident autrement.',
                },
                {
                  text: 'Cliquez sur `Suivant`.',
                  where: 'en bas de page ; sur mobile, les boutons `Précédent` et `Suivant` sont empilés',
                  result: 'L’activité suivante s’ouvre.',
                },
                {
                  text: 'Pour aller directement à une autre activité, utilisez le **Sommaire du cours**.',
                  where: 'colonne de gauche sur ordinateur ; sur mobile, bouton **Sommaire · N %** en haut, le sommaire s’ouvre en plein écran et se ferme avec **Fermer le sommaire** ou dès que vous choisissez une activité',
                },
                {
                  text: 'Quand toutes les activités obligatoires sont terminées (et le score ou l’assiduité minimale atteints, si le module en exige), la formation passe en « Terminée ».',
                  result: 'Le message « Félicitations : vous avez terminé cette formation. » s’affiche. Vous recevez la notification « Formation terminée » et, si les conditions sont remplies, votre certificat est émis automatiquement.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Obligatoire ou facultatif',
              text: 'Seules les activités marquées « Activité obligatoire » comptent pour terminer le module (« N/N activités obligatoires terminées »). Les activités facultatives (« opt. » dans le sommaire) enrichissent la formation sans bloquer l’achèvement.',
            },
          ],
        },
        {
          id: 'types-d-activites',
          title: 'Les types d’activités et ce qu’il faut faire',
          blocks: [
            {
              type: 'table',
              caption: 'Badge affiché dans l’en-tête de l’activité',
              columns: ['Type', 'Ce que vous faites', 'Comment l’activité se valide'],
              rows: [
                ['Contenu', 'Lire le texte affiché.', 'À la consultation ou après le temps indiqué ; parfois `Marquer comme terminé`.'],
                ['Document', 'Cliquer sur `Ouvrir` (nouvel onglet) ou `Télécharger` ; un aperçu PDF est souvent affiché.', 'À la consultation ou après le temps indiqué.'],
                ['Lien', 'Cliquer sur **Consulter la ressource** (s’ouvre dans un nouvel onglet).', 'À la consultation.'],
                ['Audio', 'Écouter la **Capsule audio** ; la transcription est dans **Version bas débit**.', 'Après le temps indiqué ou `Marquer comme terminé`.'],
                ['Vidéo', 'Regarder la vidéo (YouTube, Vimeo ou fichier) ; transcription dans **Version bas débit**.', 'Après le temps indiqué ou `Marquer comme terminé`.'],
                ['Présentation', 'Parcourir le diaporama intégré, ou `Ouvrir dans un nouvel onglet`.', 'À la consultation ou après le temps indiqué.'],
                ['Évaluation', 'Cliquer sur `Commencer l’évaluation` et répondre aux questions.', 'En atteignant le seuil de réussite (voir « Passer une évaluation »).'],
                ['Questionnaire', 'Cliquer sur `Répondre au questionnaire` et donner votre avis.', 'À l’envoi des réponses ; sans note.'],
                ['Devoir', 'Cliquer sur `Ouvrir le devoir`, rédiger et/ou joindre un fichier.', 'À la remise du travail (voir « Déposer un devoir »).'],
                ['Forum', 'Cliquer sur `Participer au forum`.', 'À la consultation ou par le formateur.'],
                ['Séance en direct', 'Assister à la séance (présentiel ou `Rejoindre la classe virtuelle`).', 'Par l’émargement de votre présence par le formateur.'],
                ['Contenu interactif / Module SCORM', 'Utiliser le contenu affiché dans le cadre.', 'À la consultation, après le temps indiqué, ou par le formateur.'],
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Activité pas encore disponible',
              text: 'Certaines activités s’ouvrent à une date fixée ou quand le formateur le décide. L’encadré « Activité pas encore disponible » indique « Elle s’ouvrira le <date>. » ou « Elle sera ouverte par votre formateur. ». Dans le sommaire, l’activité porte un cadenas « Verrouillé ». Poursuivez avec les autres activités.',
            },
          ],
        },
        {
          id: 'connexion-lente-ou-coupee',
          title: 'Connexion lente ou coupée : version bas débit et progression hors ligne',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sous une vidéo ou une capsule audio, cliquez sur `Afficher` dans le panneau **Version bas débit**.',
                  where: 'sous le lecteur vidéo ou audio ; sous-titre « transcription · audio · document »',
                  result: 'Le panneau montre la **Capsule audio (version légère)**, le lien **Télécharger le document de remplacement** et la **Transcription intégrale**.',
                  note: 'Quand la vidéo n’est pas disponible en ligne, ce panneau s’ouvre tout seul et la transcription couvre l’ensemble du contenu.',
                },
                {
                  text: 'Si vous perdez la connexion, continuez : le bloc de progression affiche « Hors ligne : progression conservée localement » ou « Envoi différé ».',
                  result: 'Au retour de la connexion, votre temps de consultation et vos activités marquées terminées sont envoyés automatiquement ; le bloc indique « progression enregistrée ».',
                  note: 'Seule la progression est conservée hors ligne. Les contenus (vidéos, documents) ne sont pas consultables sans connexion : téléchargez les documents quand vous avez du réseau.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Économiser vos données mobiles',
              text: 'Privilégiez la transcription et la capsule audio légère, téléchargez les documents en Wi-Fi, et gardez l’onglet du lecteur visible pendant que vous lisez : le temps n’est compté que lorsque l’onglet est affiché.',
            },
          ],
        },
        {
          id: 'lecteur-si-ca-ne-marche-pas',
          title: 'Si ça ne marche pas dans le lecteur',
          blocks: [
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le bouton `Marquer comme terminé` n’apparaît pas.',
                  cause: 'L’activité se valide autrement (évaluation, devoir, séance, validation par le formateur), elle est déjà terminée, ou elle n’est pas encore disponible.',
                  solution: 'Lisez la règle dans le bloc de progression et faites ce qu’elle indique. Pour « Validée par le formateur », attendez sa validation.',
                },
                {
                  problem: 'L’activité reste « Activité en cours » alors que vous l’avez lue.',
                  cause: 'La règle « Validée après N min de consultation » n’est pas encore atteinte (80 % de la durée indicative).',
                  solution: 'Gardez l’activité affichée le temps nécessaire (le compteur « Temps de consultation » avance), puis cliquez sur `Marquer comme terminé` s’il est affiché.',
                },
                {
                  problem: 'Le bloc indique « enregistrement impossible ».',
                  cause: 'Le serveur a refusé l’enregistrement (par exemple inscription plus active).',
                  solution: 'Rechargez la page. Si le message persiste, vérifiez le statut de l’inscription dans **Mes formations**, puis contactez le support.',
                },
                {
                  problem: 'Page « Cette leçon n’est pas accessible ».',
                  cause: 'La leçon n’existe pas dans la version du cours que vous suivez, ou votre inscription n’est plus « En cours ».',
                  solution: 'Cliquez sur `Mes formations` et reprenez le parcours depuis la carte de la formation.',
                },
                {
                  problem: '« Vidéo non disponible en ligne pour le moment » ou « Document indisponible ».',
                  cause: 'Le média n’a pas encore été déposé par l’équipe pédagogique.',
                  solution: 'Utilisez la transcription intégrale (vidéo, audio) ou revenez plus tard ; signalez-le à votre formateur dans le forum.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'passer-une-evaluation',
      title: 'Comment passer une évaluation ou répondre à un questionnaire',
      icon: 'list-checks',
      summary: 'Écran d’accueil, tentative chronométrée, soumission, résultat et correction.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une évaluation (aussi appelée quiz) est une série de questions corrigées automatiquement, sauf les compositions que le formateur note lui-même. Un questionnaire de satisfaction utilise le même écran, mais il est sans note et sert à améliorer la formation.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Une tentative soumise ne peut plus être modifiée',
          text: 'Le chronomètre démarre dès l’ouverture de la tentative et ne se met pas en pause. Une fois vos réponses soumises (ou le temps écoulé), la tentative est définitive. Le nombre de tentatives est limité : lisez « Tentatives restantes » avant de commencer.',
        },
      ],
      subsections: [
        {
          id: 'commencer-une-tentative',
          title: 'Commencer et répondre',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans le lecteur, sur la carte **Évaluation**, lisez les tuiles **Questions**, **Durée**, **Seuil de réussite** et **Tentatives restantes**, puis cliquez sur `Commencer l’évaluation`.',
                  where: 'zone de contenu de l’activité ; pour un questionnaire, le bouton s’appelle `Répondre au questionnaire`',
                  result: 'La page de l’évaluation s’ouvre avec l’écran d’accueil et l’encadré **Avant de commencer**.',
                },
                {
                  text: 'Lisez **Avant de commencer**, puis cliquez sur `Commencer l’évaluation` (ou `Reprendre la tentative en cours` si vous aviez été interrompu).',
                  result: 'La tentative s’ouvre. Une barre collante en haut affiche « N/N réponses », l’état du brouillon et, s’il y a une durée, le chronomètre MM:SS.',
                  note: 'Le chronomètre devient rouge sous 60 secondes. À 00:00, vos réponses sont envoyées automatiquement.',
                },
                {
                  text: 'Choisissez le **Mode d’affichage** : `Une par une` ou `Toutes`.',
                  where: 'commutateur dans la barre du haut',
                  note: 'Jusqu’à 4 questions, le mode `Toutes` est proposé par défaut ; au-delà, `Une par une`. En mode `Une par une`, des pastilles numérotées permettent de sauter à une question (vert = répondue) et les boutons `Précédente` / `Suivante` font défiler.',
                },
                {
                  text: 'Répondez à chaque question selon son type (voir le tableau ci-dessous).',
                  result: 'Une coche verte apparaît sur la carte de la question. La barre indique « brouillon enregistré ».',
                  note: 'Vos réponses sont conservées dans le navigateur de cet appareil : en cas de coupure, rouvrez la page et cliquez sur `Reprendre la tentative en cours`.',
                },
                {
                  text: 'Cliquez sur `Soumettre mes réponses`.',
                  where: 'après la dernière question',
                  result: 'L’écran de résultat s’affiche.',
                  note: 'Si des questions sont sans réponse, la boîte « Soumettre malgré des questions sans réponse ? » s’ouvre : cliquez sur `Revenir aux questions` pour compléter, ou `Soumettre quand même`.',
                },
              ],
            },
            {
              type: 'table',
              caption: 'Les types de questions',
              columns: ['Type', 'Comment répondre'],
              rows: [
                ['Choix unique', 'Cochez une seule réponse (« Choisissez une réponse »).'],
                ['Choix multiples', 'Cochez toutes les réponses exactes (« Plusieurs réponses possibles. »).'],
                ['Vrai / Faux', 'Touchez `Vrai` ou `Faux`.'],
                ['Texte à trous', 'Remplissez chaque champ **Trou N** inséré dans le texte (200 caractères maximum par trou).'],
                ['Appariement', 'Pour chaque élément A, B, C..., choisissez la bonne correspondance dans la liste **Associer à...**.'],
                ['Classement', 'Mettez les éléments dans le bon ordre avec les boutons `Monter` et `Descendre`.'],
                ['Réponse courte', 'Écrivez votre réponse en quelques mots dans le champ.'],
                ['Composition', 'Rédigez une réponse argumentée. Le compteur indique le nombre de mots, le minimum et le maximum conseillés. Elle est corrigée par le formateur.'],
              ],
            },
          ],
        },
        {
          id: 'lire-son-resultat',
          title: 'Lire son résultat et la correction',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur l’écran de résultat, lisez l’anneau de score et le badge.',
                  result: '« Bravo, évaluation réussie » avec le badge « Réussie », ou « Évaluation non réussie » avec « Non réussie », et la ligne « Score : N/N points (N %) · seuil de réussite N %. »',
                  note: 'Si l’évaluation contient des compositions, vous voyez « Réponses soumises » et le badge « Correction en cours » : le formateur doit noter ; vous recevrez la notification « Résultat disponible ».',
                },
                {
                  text: 'Consultez la section **Correction détaillée** si elle est affichée.',
                  note: 'Pour chaque question : votre réponse, la réponse attendue (si le formateur l’a autorisée) et une explication. Si la correction n’est pas autorisée, le message « La correction détaillée n’est pas affichée pour cette évaluation » apparaît : seul le score est communiqué.',
                },
                {
                  text: 'En cas d’échec, cliquez sur `Nouvelle tentative (N restante(s))` si le bouton est proposé, sinon sur `Retour à la leçon`.',
                  result: 'Une nouvelle tentative s’ouvre. Le meilleur score de toutes vos tentatives est retenu pour la progression.',
                },
                {
                  text: 'Plus tard, retrouvez vos tentatives dans la section **Mes tentatives** de la page de l’évaluation, ou vos derniers scores dans **Tableau de bord** › **03 Résultats récents**.',
                  note: 'Quand les tentatives sont épuisées, la carte du lecteur propose `Consulter mes résultats`.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Les statuts d’une tentative',
              items: [
                { label: 'En cours', tone: 'info', meaning: 'Tentative commencée et non soumise.', next: 'Cliquez sur `Reprendre la tentative en cours` pour la terminer.' },
                { label: 'À corriger', tone: 'warning', meaning: 'Tentative soumise avec des compositions en attente de notation.', next: 'Attendez la notification « Résultat disponible ».' },
                { label: 'Envoyé', tone: 'neutral', meaning: 'Questionnaire de satisfaction envoyé.', next: 'Rien à faire : l’activité est validée.' },
                { label: 'Réussie', tone: 'success', meaning: 'Score supérieur ou égal au seuil de réussite.', next: 'Passez à l’activité suivante.' },
                { label: 'Non réussie', tone: 'danger', meaning: 'Score inférieur au seuil.', next: 'Relisez la correction, puis `Nouvelle tentative` s’il vous en reste.' },
                { label: 'Validée', tone: 'success', meaning: 'Badge de la carte du lecteur : l’activité d’évaluation est achevée.', next: 'Continuez le parcours.' },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Message « Temps écoulé : vos réponses ont été soumises automatiquement. »',
                  cause: 'Le chronomètre est arrivé à zéro.',
                  solution: 'Consultez le résultat. Pour la prochaine fois, commencez la tentative seulement quand vous disposez du temps indiqué.',
                },
                {
                  problem: 'Message « Temps écoulé : la soumission a échoué. Réessayez. »',
                  cause: 'La connexion a été perdue au moment de l’envoi automatique.',
                  solution: 'Rétablissez la connexion et cliquez sur `Soumettre mes réponses`. Une tolérance de 60 secondes après la fin du temps est prévue ; au-delà, le message « Le temps imparti est dépassé » s’affiche : contactez votre formateur.',
                },
                {
                  problem: 'Message « Nombre maximal de tentatives atteint ».',
                  cause: 'Vous avez utilisé toutes vos tentatives.',
                  solution: 'Vos résultats restent consultables. Si vous estimez avoir droit à une tentative supplémentaire, demandez-le à votre formateur dans le forum de la cohorte.',
                },
                {
                  problem: 'Page « Inscription requise » ou « Pas encore disponible ».',
                  cause: 'Vous n’êtes pas inscrit au module, votre inscription n’est plus « En cours », ou l’activité s’ouvre plus tard.',
                  solution: 'Cliquez sur `Voir la fiche de la formation` pour vous inscrire, ou `Retour à la leçon` et attendez la date indiquée.',
                },
                {
                  problem: 'Vous avez changé d’appareil et vos réponses en brouillon ont disparu.',
                  cause: 'Le brouillon est conservé dans le navigateur de l’appareil utilisé, pas sur le serveur.',
                  solution: 'Reprenez la tentative sur le même appareil et le même navigateur, ou répondez à nouveau.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'deposer-un-devoir',
      title: 'Comment déposer un devoir',
      icon: 'upload',
      summary: 'Études de cas, plans d’action et notes de synthèse : brouillon, remise, correction.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un devoir est un travail écrit (texte et/ou fichier) relu et noté par votre formateur. Vous pouvez enregistrer un brouillon autant de fois que nécessaire, puis remettre votre travail. La remise reste modifiable jusqu’à la correction ; seule la notation la verrouille.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez le devoir : dans le lecteur, carte **Devoir**, bouton `Ouvrir le devoir` ; ou depuis **Tableau de bord** › **03 Résultats récents** › **Mes devoirs**, puis la ligne du devoir.',
              result: 'La fiche du devoir s’ouvre : « À rendre avant le <date et heure> », « Noté sur N points », les sections **Consignes**, **Étude de cas** et **Grille d’évaluation**.',
              note: 'Sur la liste **Vos travaux pratiques**, les onglets `Tous`, `À rendre`, `Remis` et `Notés` filtrent vos devoirs. Un triangle rouge signale un devoir en retard.',
            },
            {
              text: 'Lisez attentivement les **Consignes**, la **Grille d’évaluation** (les critères et leurs points) et la date limite, exprimée à l’heure de Libreville.',
              note: 'La mention « Aucune remise tardive » signifie que le devoir sera bloqué après la date limite.',
            },
            {
              text: 'Rédigez dans **Votre réponse** (50 000 caractères maximum) et/ou choisissez un **Fichier joint**.',
              where: 'section **Déposer votre travail**',
              note: 'Au moins l’un des deux est obligatoire. Les formats acceptés et la taille maximale (« N Mo maximum ») sont affichés sous le champ et dans la carte **État** ; ils dépendent du devoir. Certains devoirs n’acceptent que du texte, d’autres qu’un fichier.',
            },
            {
              text: 'Cliquez sur `Enregistrer le brouillon` pour sauvegarder sans remettre.',
              where: 'sous le formulaire',
              result: 'Le message « Brouillon enregistré. Vous pourrez le compléter avant de le soumettre. » s’affiche et la carte **État** passe à « Brouillon ».',
            },
            {
              text: 'Quand votre travail est prêt, cliquez sur `Soumettre le devoir`.',
              result: 'Le message « Votre devoir a été remis. Le formateur sera notifié. » s’affiche et l’état devient « Remis » (ou « Remis en retard » après la date limite).',
              note: 'Tant que le devoir n’est pas noté, le bouton `Mettre à jour ma remise` vous permet de corriger votre travail.',
            },
            {
              text: 'Si le formateur vous renvoie le devoir, vous recevez « Devoir à reprendre » : rouvrez la fiche, lisez l’alerte **Travail à reprendre** et le commentaire, complétez, puis soumettez à nouveau.',
            },
            {
              text: 'Après notation, vous recevez « Devoir corrigé » : la section **Devoir corrigé** affiche la note, le pourcentage, le **Commentaire du formateur** et les points obtenus pour chaque critère de la grille.',
              result: 'L’état est « Noté » ; le devoir n’est plus modifiable.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’un devoir',
          items: [
            { label: 'À rendre', tone: 'neutral', meaning: 'Aucun travail déposé.', next: 'Rédigez ou joignez votre fichier avant la date limite.' },
            { label: 'Brouillon', tone: 'info', meaning: 'Travail enregistré mais non remis ; le formateur ne le voit pas.', next: 'Complétez puis `Soumettre le devoir`.' },
            { label: 'Remis', tone: 'success', meaning: 'Travail remis avant la date limite.', next: 'Attendez la correction ; `Mettre à jour ma remise` reste possible.' },
            { label: 'Remis en retard', tone: 'warning', meaning: 'Travail remis après la date limite (le devoir acceptait le retard).', next: 'Le formateur en est informé et peut en tenir compte.' },
            { label: 'À reprendre', tone: 'warning', meaning: 'Le formateur vous a renvoyé le devoir.', next: 'Tenez compte de ses remarques et remettez à nouveau.' },
            { label: 'Noté', tone: 'success', meaning: 'Devoir corrigé : note et commentaire disponibles.', next: 'Plus aucune modification possible.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Message « Ajoutez un texte ou un fichier avant de soumettre. »',
              cause: 'Le formulaire est vide.',
              solution: 'Rédigez une réponse ou joignez un fichier, puis recommencez.',
            },
            {
              problem: 'Message « Le fichier dépasse la taille maximale de N Mo », « Type de fichier non autorisé » ou « Extension de fichier refusée ».',
              cause: 'Le fichier ne respecte pas les règles du devoir.',
              solution: 'Convertissez votre document dans un format accepté (le plus souvent PDF), réduisez sa taille (compressez les images), puis rechoisissez-le.',
            },
            {
              problem: 'Section « Remise indisponible » avec « La date limite est dépassée et ce devoir n’accepte pas de remise tardive. »',
              cause: 'Le devoir refuse les retards.',
              solution: 'Contactez votre formateur dans le forum de la cohorte si vous avez un empêchement justifié : lui seul peut décider.',
            },
            {
              problem: 'Message « Ce devoir a déjà été noté ».',
              cause: 'La notation verrouille le devoir.',
              solution: 'Lisez la section **Devoir corrigé**. Pour contester une note, écrivez à votre formateur.',
            },
            {
              problem: 'Le lien du fichier déposé ne s’ouvre plus.',
              cause: 'Le lien de téléchargement est temporaire.',
              solution: 'Rechargez la fiche du devoir pour obtenir un nouveau lien dans la carte **État** (« Fichier déposé »).',
            },
          ],
        },
      ],
    },
    {
      id: 'participer-aux-forums',
      title: 'Comment participer aux forums',
      icon: 'message-square',
      summary: 'Poser une question, partager une expérience, répondre et signaler un message.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les forums sont les espaces d’échange de la plateforme, modérés par l’équipe pédagogique. Il en existe trois sortes : **Mes cohortes** (réservés aux participants d’une session et à leur formateur), **Mes formations** (ouverts à tous les inscrits d’un module) et **Communauté FETRAG** (ouverts à tous les apprenants). Il n’y a pas de messagerie privée : le forum est le canal pour joindre votre formateur.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Courtoisie et confidentialité',
          text: 'Vos messages sont lus par les autres participants et engagent l’image de la Fédération. Restez courtois, concrets et bienveillants. Ne publiez pas de données personnelles (téléphone, adresse) ni d’informations confidentielles sur une entreprise ou une négociation en cours. Un message publié ne peut pas être modifié ni supprimé par vous-même : relisez-vous avant de publier.',
        },
        {
          type: 'steps',
          title: 'Ouvrir un fil de discussion',
          items: [
            {
              text: 'Dans le lecteur, ouvrez l’activité **Forum**, puis cliquez sur `Participer au forum`.',
              result: 'Le forum de votre cohorte ou de votre formation s’ouvre directement, avec sa liste **Fils de discussion**.',
              note: 'Pour voir tous vos forums (cohortes, formations, communauté FETRAG), cliquez sur **Forums** dans le fil d’Ariane en haut de la page : la page « Échanger avec la communauté » les liste en trois groupes, avec un bouton `Ouvrir` sur chaque carte. Un badge « Verrouillé » signifie que le forum est en lecture seule.',
            },
            {
              text: 'Ouvrez un forum, puis cliquez sur `Ouvrir un nouveau fil`.',
              where: 'en haut de la liste **Fils de discussion**',
              result: 'Le formulaire **Nouveau fil de discussion** s’affiche.',
            },
            {
              text: 'Saisissez un **Titre** (obligatoire, 3 à 200 caractères) précis, par exemple une question claire.',
            },
            {
              text: 'Rédigez votre **Message** (obligatoire, 2 à 20 000 caractères).',
              note: 'La mise en forme n’est pas conservée : écrivez en texte simple, avec des retours à la ligne.',
            },
            {
              text: 'Cliquez sur `Publier le fil`.',
              result: 'Votre fil s’ouvre. Le formateur de la cohorte reçoit « Nouveau fil de discussion ».',
            },
            {
              text: 'Pour retrouver un fil, utilisez le champ **Rechercher un fil par titre** puis `Rechercher`.',
              where: 'en haut du forum',
              note: 'Les fils épinglés (« Épinglé ») apparaissent en premier ; la liste affiche 20 fils par page.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Répondre et signaler',
          items: [
            {
              text: 'Dans un fil, écrivez dans **Votre réponse**, puis cliquez sur `Publier`.',
              where: 'section **Participer à la discussion**, en bas du fil',
              result: 'Le message « Réponse publiée. » s’affiche ; votre réponse apparaît avec la mention « (vous) ». L’auteur du fil reçoit « Nouvelle réponse ».',
            },
            {
              text: 'Pour répondre à un message précis, cliquez sur `Répondre` sous ce message, écrivez, puis `Publier`.',
              result: 'Votre réponse s’affiche décalée sous le message, avec « en réponse à <nom> ».',
            },
            {
              text: 'Pour signaler un message déplacé, cliquez sur `Signaler ce message`, indiquez le **Motif** (obligatoire, 3 à 500 caractères), puis `Envoyer le signalement`.',
              result: 'Le message « Signalement transmis à la modération. » s’affiche ; le formateur ou la coordination pourra masquer le message.',
              note: 'Vous ne pouvez pas signaler vos propres messages.',
            },
          ],
        },
        {
          type: 'statuses',
          items: [
            { label: 'Épinglé', tone: 'info', meaning: 'Fil mis en avant par la modération, affiché en tête de liste.', next: 'Lisez-le en priorité : il contient souvent des consignes.' },
            { label: 'Verrouillé', tone: 'warning', meaning: 'Fil ou forum en lecture seule.', next: 'Vous pouvez lire mais plus répondre ni ouvrir de fil.' },
            { label: 'Masqué', tone: 'danger', meaning: 'Message retiré par la modération ; il est remplacé par « [Message masqué par la modération] ».', next: 'Si c’est le vôtre, vous recevez « Message masqué » avec le motif.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Message « Vérifiez le titre et le message. »',
              cause: 'Le titre ou le message est trop court ou trop long.',
              solution: 'Respectez les longueurs indiquées sous chaque champ.',
            },
            {
              problem: 'Message « Ce forum est verrouillé » ou « Ce fil est verrouillé ».',
              cause: 'La modération a fermé les échanges.',
              solution: 'Ouvrez un autre fil dans un forum non verrouillé, ou écrivez à votre formateur.',
            },
            {
              problem: 'Page « Cet espace d’échange n’est pas accessible » ou message « Vous n’avez pas accès à ce forum ».',
              cause: 'Le forum est réservé à une cohorte ou à une formation à laquelle vous n’êtes pas inscrit (inscription « En cours » ou « Terminée »).',
              solution: 'Cliquez sur `Tous les forums` pour voir ceux qui vous sont ouverts.',
            },
            {
              problem: 'Message « Les forums sont désactivés ».',
              cause: 'La Fédération a fermé temporairement les forums.',
              solution: 'Utilisez l’adresse **Aide** du pied de page pour joindre l’équipe.',
            },
          ],
        },
      ],
    },
    {
      id: 'seances-en-direct-et-calendrier',
      title: 'Comment assister à une séance en direct et utiliser le calendrier',
      icon: 'calendar',
      summary: 'Convocations, classe virtuelle, présence, export vers votre agenda.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une séance en direct est un rendez-vous à date fixe pour votre cohorte : en présentiel (dans un lieu), en classe virtuelle (par visioconférence) ou en hybride. Votre présence est enregistrée par le formateur (on parle d’émargement) et valide l’activité correspondante. Le calendrier rassemble ces séances et les dates limites de vos devoirs, à l’heure de Libreville.',
        },
      ],
      subsections: [
        {
          id: 'assister-a-une-seance',
          title: 'Assister à une séance',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'À la programmation d’une séance, vous recevez la notification « Convocation à une session » et l’email « Convocation : <séance> - <date> » avec la formation, les horaires, la modalité, le lieu, le formateur et le lien de connexion.',
                  note: 'La veille, un rappel « Rappel : <séance> le <date> » est envoyé. En cas d’empêchement, prévenez votre formateur ou la coordination au plus tôt.',
                },
                {
                  text: 'Dans le lecteur, ouvrez l’activité **Séance en direct**.',
                  result: 'La carte affiche le format, l’ordre du jour et la liste des séances avec le badge « À venir », « En direct » ou « Passée », la date, les heures, l’intervenant et le lieu.',
                },
                {
                  text: 'Pour une classe virtuelle, cliquez sur `Rejoindre la classe virtuelle`.',
                  where: 'le bouton devient actif 15 minutes avant le début et jusqu’à la fin de la séance ; avant, il affiche « Lien actif 15 min avant »',
                  result: 'L’outil de visioconférence s’ouvre dans un nouvel onglet.',
                  note: 'Pour une séance en présentiel, rendez-vous au lieu indiqué à l’heure prévue.',
                },
                {
                  text: 'Après la séance, l’activité est validée par l’émargement du formateur ; les boutons `Replay` et `Transcription` apparaissent si le formateur les a fournis.',
                  note: 'L’assiduité (le taux de présence aux séances) peut conditionner l’achèvement du module et le certificat.',
                },
              ],
            },
          ],
        },
        {
          id: 'utiliser-le-calendrier',
          title: 'Utiliser le calendrier',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Calendrier**.',
                  where: 'barre du haut ; sur mobile, bouton **Ouvrir le menu** (trois traits) puis **Calendrier**',
                  result: 'La page « Vos séances et échéances » affiche la grille du mois, la liste **Ce mois-ci** et la colonne **À venir** (90 jours).',
                },
                {
                  text: 'Changez de mois avec les flèches **Mois précédent** / **Mois suivant** ; revenez avec `Aujourd’hui`.',
                  note: 'Pastilles : bleu = séance, or = échéance de devoir, rouge = en retard. Sur mobile, la grille défile horizontalement et les pastilles n’affichent qu’une icône ; la liste **Ce mois-ci** reste la plus lisible.',
                },
                {
                  text: 'Cliquez sur une séance pour ouvrir la fiche de la formation, ou sur une échéance pour ouvrir le devoir.',
                },
                {
                  text: 'Pour ajouter tout cela à l’agenda de votre téléphone, cliquez sur `Exporter (.ics)`.',
                  where: 'en haut à droite de la page',
                  result: 'Le fichier fetrag-formation.ics est téléchargé ; ouvrez-le pour l’importer dans Google Agenda, Outlook ou l’agenda de votre téléphone.',
                  note: 'L’export contient les séances des 30 derniers jours aux 6 prochains mois et vos dates limites de devoirs. Il n’est pas mis à jour tout seul : refaites l’export après une nouvelle convocation.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le bouton `Rejoindre la classe virtuelle` reste grisé.',
                  cause: 'La séance n’a pas encore commencé (le lien s’active 15 minutes avant) ou elle est terminée.',
                  solution: 'Revenez à l’heure indiquée. Si la séance est en cours et que le bouton reste inactif, rechargez la page.',
                },
                {
                  problem: '« Aucune date programmée pour le moment » dans l’activité Séance en direct.',
                  cause: 'La coordination n’a pas encore fixé la date avec votre cohorte.',
                  solution: 'Attendez la convocation par notification et par email.',
                },
                {
                  problem: 'Une séance n’apparaît pas dans votre calendrier.',
                  cause: 'Vous n’êtes pas membre de la cohorte concernée.',
                  solution: 'Vérifiez dans **Mes formations** le nom de votre cohorte ; sinon, contactez la coordination.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'obtenir-mon-certificat',
      title: 'Comment obtenir, télécharger et faire vérifier mon certificat',
      icon: 'award',
      summary: 'Émission automatique à la fin du module, génération du PDF, lien de vérification publique.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chaque module validé donne lieu à un document numéroté (attestation ou certificat, selon le module), signé par le Secrétaire Général et vérifiable publiquement grâce à son code QR. Il est émis automatiquement quand vous terminez le module et remplissez les critères (score minimal, assiduité minimale s’il y a des séances). La coordination peut aussi l’émettre elle-même.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Terminez le module. Vous recevez la notification « Votre certificat est disponible » (ou « Votre attestation est disponible ») et l’email correspondant avec le bouton **Télécharger mon document**.',
            },
            {
              text: 'Ouvrez **Certificats**.',
              where: 'barre du haut ; sur mobile, bouton **Ouvrir le menu** (trois traits) puis **Certificats** ; ou menu du compte › **Mes certificats**',
              result: 'La page « Vos attestations et certificats » affiche une carte par document : numéro (FETRAG-AAAA-NNNNNN), date, statut, et « PDF disponible » ou « PDF à générer ».',
            },
            {
              text: 'Cliquez sur `Consulter` sur la carte du document.',
              result: 'La page du document s’ouvre avec un aperçu (votre nom, la formation, la date, le numéro, le code QR) et les cartes **Document officiel** et **Informations**.',
            },
            {
              text: 'Si la carte indique « PDF à générer », cliquez sur `Générer le PDF`.',
              where: 'carte **Document officiel**',
              result: 'Le message « Le PDF de votre certificat est prêt. » s’affiche après quelques secondes.',
              note: 'Si vous voyez « Génération en cours : le document sera disponible dans quelques instants. », attendez puis rechargez la page.',
            },
            {
              text: 'Cliquez sur le bouton or `Télécharger le PDF`.',
              result: 'Le PDF signé s’enregistre sur votre appareil.',
              note: 'Le lien de téléchargement est valable 10 minutes ; au-delà, cliquez sur `Régénérer le document`.',
            },
            {
              text: 'Pour faire vérifier votre document par un employeur ou un partenaire, transmettez-lui le lien **Vérification publique** (ou faites-lui scanner le code QR du PDF).',
              where: 'carte **Document officiel** ; le **Code de vérification** (format XXXX-XXXX-XXXX) figure dans la carte **Informations**',
              result: 'La page publique du site institutionnel confirme l’authenticité, le titulaire, la formation et la validité. Chaque contrôle est compté dans **Vérifications publiques**.',
            },
          ],
        },
        {
          type: 'statuses',
          items: [
            { label: 'Valide', tone: 'success', meaning: 'Document en cours de validité.', next: 'Téléchargez-le et partagez son lien de vérification.' },
            { label: 'Expiré', tone: 'neutral', meaning: 'La période de validité fixée par le modèle est dépassée.', next: 'Une nouvelle session du module permet de le renouveler.' },
            { label: 'Révoqué', tone: 'danger', meaning: 'Document annulé par la coordination (motif affiché) ; le PDF ne peut plus être téléchargé ni présenté comme valide.', next: 'Contactez la coordination pour toute question.' },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Révocation',
          text: 'Une révocation est définitive et décidée par la coordination (par exemple en cas de fraude ou d’erreur). Le document porte alors le filigrane « Révoqué » et la page de vérification publique l’indique. Ne présentez jamais un document révoqué ou expiré comme valide.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La formation est « Terminée » mais aucun certificat n’apparaît.',
              cause: 'Les critères du modèle ne sont pas tous remplis (score minimal, assiduité), ou le module n’a pas de modèle de certificat : l’émission est alors faite par la coordination.',
              solution: 'Vérifiez vos résultats et votre présence aux séances. Si tout est en ordre, écrivez à la coordination en indiquant le titre du module.',
            },
            {
              problem: 'Le nom sur le document est mal orthographié.',
              cause: 'Le nom provient de votre profil.',
              solution: 'Corrigez votre profil sur le site institutionnel (menu du compte › lien **Mon profil**), puis demandez à la coordination de réémettre le document.',
            },
            {
              problem: 'Message « Ce certificat a été révoqué : aucun PDF ne peut être généré. »',
              cause: 'Le document a été révoqué.',
              solution: 'Lisez le motif dans l’alerte **Document révoqué** et contactez la coordination.',
            },
          ],
        },
      ],
    },
    {
      id: 'mon-compte-sur-le-site',
      title: 'Mon compte sur le site institutionnel',
      icon: 'settings',
      summary: 'Profil, email, mot de passe, vérification en deux étapes, paiements et préférences d’emails se gèrent sur le site.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre compte est commun aux deux plateformes, mais ses réglages vivent sur le site institutionnel. Depuis la plateforme de formation, le menu du compte vous y conduit directement, sans nouvelle connexion.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez le menu du compte.',
              where: 'vos initiales en haut à droite (ordinateur et mobile)',
            },
            {
              text: 'Cliquez sur le lien **Mon profil** (son libellé complet cite l’adresse du site institutionnel) pour modifier votre nom, votre téléphone, votre fonction, votre employeur ou votre langue.',
              result: 'La page de profil du site s’ouvre dans votre navigateur.',
            },
            {
              text: 'Cliquez sur **Sécurité du compte** pour changer votre mot de passe ou activer la vérification en deux étapes.',
            },
            {
              text: 'Pour vos paiements et reçus, vos préférences d’emails (catégories non essentielles) et la liste complète de vos notifications, utilisez votre espace personnel sur le site.',
              note: 'Le lien **préférences** en bas de chaque email vous y conduit aussi.',
            },
          ],
        },
        {
          type: 'links',
          items: [
            { label: 'Guide du membre', href: '{{web}}/espace/guide', description: 'Créer et gérer son compte, profil, sécurité, paiements, reçus et préférences de notification.', external: true, icon: 'book-open' },
            { label: 'Mon profil', href: '{{web}}/espace/profil', description: 'Vos informations personnelles.', external: true, icon: 'user' },
            { label: 'Sécurité du compte', href: '{{web}}/espace/securite', description: 'Mot de passe et vérification en deux étapes.', external: true, icon: 'shield-check' },
          ],
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Où lire vos notifications, quels emails vous recevrez et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'steps',
          title: 'Lire ses notifications',
          items: [
            {
              text: 'Ouvrez votre **Tableau de bord** et descendez jusqu’à la section **05 Notifications**.',
              result: 'Les six dernières notifications s’affichent ; un point vert signale celles qui ne sont pas lues et le sous-titre indique « N non lue(s) ».',
            },
            {
              text: 'Cliquez sur une notification.',
              result: 'Elle est marquée comme lue et la page concernée s’ouvre (fiche, devoir, évaluation, certificat, calendrier ou forum).',
            },
            {
              text: 'Pour tout marquer d’un coup, cliquez sur `Tout marquer comme lu`.',
              result: 'Le message « Notifications marquées comme lues. » s’affiche.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Les principales notifications (interne et/ou email)',
          columns: ['Sujet', 'Quand', 'Ce qu’il faut faire'],
          rows: [
            ['Inscription confirmée', 'Dès que votre inscription est active (inscription libre, validation, paiement, ajout à une cohorte).', 'Cliquez sur **Commencer la formation** dans l’email ou reprenez depuis le tableau de bord.'],
            ['Inscription en attente', 'Après une demande d’inscription soumise à validation.', 'Rien : attendez la décision de la coordination.'],
            ['Inscription validée / annulée / suspendue / expirée', 'Quand la coordination ou le formateur change le statut de votre inscription.', 'Lisez le commentaire ; en cas de doute, contactez la coordination.'],
            ['Formation terminée', 'Quand vous avez rempli les règles d’achèvement du module.', 'Consultez **Certificats**.'],
            ['Votre certificat (ou attestation) est disponible', 'À l’émission du document.', 'Ouvrez **Certificats** et générez le PDF.'],
            ['Certificat révoqué', 'Si la coordination révoque un document.', 'Lisez le motif ; ne présentez plus ce document.'],
            ['Résultat disponible', 'Quand le formateur a noté vos compositions.', 'Ouvrez l’évaluation pour voir le score et la correction.'],
            ['Devoir corrigé / Devoir à reprendre', 'Après notation ou renvoi d’un devoir.', 'Ouvrez le devoir : lisez la note et le commentaire, ou remettez une nouvelle version.'],
            ['Convocation à une session', 'À la programmation d’une séance pour votre cohorte.', 'Notez la date, le lieu ou le lien ; ajoutez la séance à votre agenda.'],
            ['Rappel : <séance> le <date>', '24 heures avant une séance.', 'Préparez-vous ; prévenez le formateur en cas d’empêchement.'],
            ['Nouvelle réponse', 'Quand quelqu’un répond à un fil que vous avez ouvert.', 'Ouvrez le fil et poursuivez l’échange.'],
            ['Message masqué', 'Quand la modération masque un de vos messages.', 'Lisez le motif et adaptez vos prochains messages.'],
            ['Paiement confirmé / non abouti / Remboursement effectué (emails du site)', 'Pour une formation payante.', 'Conservez l’email ; en cas d’échec, refaites le paiement depuis votre espace personnel.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Emails essentiels et préférences',
          text: 'Les emails essentiels (inscription confirmée, convocation, certificat, paiements, compte) sont toujours envoyés. Les autres catégories (formation, résultats, séances, forums, certificats, devoirs) se règlent sur le site institutionnel, page des notifications de votre espace personnel. Ajoutez l’adresse d’expédition de la Fédération à vos contacts pour éviter les courriers indésirables.',
        },
      ],
    },
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield-check',
      summary: 'Pour apprendre efficacement et protéger votre compte et vos données.',
      blocks: [
        {
          type: 'list',
          style: 'check',
          items: [
            'Déconnectez-vous toujours sur un appareil partagé ou prêté (menu du compte › `Déconnexion`).',
            'Ne communiquez jamais votre mot de passe, votre code de vérification ni votre code Mobile Money, même à une personne qui se présente comme le support.',
            'Activez la vérification en deux étapes sur le site institutionnel (**Sécurité du compte**) et conservez vos codes de secours hors de votre téléphone.',
            'Utilisez une adresse email que vous consultez régulièrement : convocations, résultats et certificats y sont envoyés.',
            'Vérifiez la date limite et le barème d’un devoir dès son ouverture ; enregistrez un brouillon tôt, puis remettez avant l’échéance.',
            'Avant une évaluation, prévoyez le temps imparti et une connexion stable : le chronomètre ne se met pas en pause.',
            'Sur une connexion lente, utilisez la **Version bas débit** et téléchargez les documents en Wi-Fi.',
            'Dans les forums, restez courtois et concret ; ne publiez pas d’informations confidentielles sur votre entreprise, votre organisation syndicale ou une négociation en cours.',
            'Relisez-vous avant de publier : un message de forum ne peut pas être modifié ni supprimé par vous-même.',
            'Ajoutez vos séances à l’agenda de votre téléphone avec `Exporter (.ics)` et prévenez votre formateur en cas d’empêchement.',
            'Téléchargez votre certificat dès qu’il est disponible et conservez le PDF ; partagez le lien de vérification plutôt qu’une capture d’écran.',
            'Consultez régulièrement la section **05 Notifications** du tableau de bord : il n’y a pas d’icône de notification dans la barre du haut.',
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
              question: 'Dois-je créer un compte différent pour la plateforme de formation ?',
              answer: 'Non. Le compte créé sur le site institutionnel fonctionne aussi sur la plateforme de formation, avec la même adresse email et le même mot de passe. Le bouton **Créer un compte** de la plateforme vous renvoie simplement vers le site.',
            },
            {
              question: 'J’ai oublié mon mot de passe. Que faire ?',
              answer: 'Sur la page de connexion, cliquez sur **Mot de passe oublié ?** : vous êtes conduit sur le site institutionnel, où vous saisissez votre adresse email pour recevoir un lien de réinitialisation. Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.',
            },
            {
              question: 'Puis-je suivre une formation uniquement depuis mon téléphone ?',
              answer: 'Oui. La plateforme est conçue d’abord pour les téléphones : la navigation se fait avec le bouton **Ouvrir le menu** (trois traits), le sommaire du cours s’ouvre avec le bouton **Sommaire · N %**, et la **Version bas débit** propose une transcription et une capsule audio légère pour les connexions lentes.',
            },
            {
              question: 'Que se passe-t-il si je perds la connexion pendant une activité ?',
              answer: 'Votre temps de consultation et vos activités marquées terminées sont conservés sur l’appareil (« Hors ligne : progression conservée localement ») et envoyés automatiquement au retour de la connexion. Pendant une évaluation, vos réponses en brouillon restent dans le navigateur : rouvrez la page et cliquez sur `Reprendre la tentative en cours`. Attention : le chronomètre, lui, continue.',
            },
            {
              question: 'Pourquoi le bouton `Marquer comme terminé` n’apparaît-il pas ?',
              answer: 'Il n’existe que pour les activités validées à la consultation ou au temps passé. Une évaluation se valide en atteignant le seuil de réussite, un devoir à la remise, une séance par l’émargement du formateur, et certaines activités par le formateur lui-même. La règle est écrite dans le bloc de progression en bas de l’activité.',
            },
            {
              question: 'Combien de fois puis-je passer une évaluation ?',
              answer: 'Le nombre de tentatives est fixé par le formateur et affiché dans **Tentatives restantes** sur l’écran d’accueil de l’évaluation. Le meilleur score de toutes vos tentatives est retenu. Une fois toutes les tentatives utilisées, seuls vos résultats restent consultables.',
            },
            {
              question: 'Puis-je modifier un devoir déjà remis ?',
              answer: 'Oui, tant qu’il n’est pas noté : le bouton `Mettre à jour ma remise` remplace votre travail. Après la notation (statut « Noté »), plus aucune modification n’est possible. Si le formateur vous renvoie le devoir (« À reprendre »), vous pouvez le remettre à nouveau.',
            },
            {
              question: 'Que se passe-t-il si je rends un devoir en retard ?',
              answer: 'Cela dépend du devoir. S’il accepte les retards, votre remise est enregistrée avec le statut « Remis en retard » et le formateur en est informé. S’il affiche « Aucune remise tardive », la remise est bloquée après la date limite (« Remise indisponible ») : contactez votre formateur si vous avez un empêchement justifié.',
            },
            {
              question: 'Comment joindre mon formateur ?',
              answer: 'Il n’y a pas de messagerie privée. Utilisez le forum de votre cohorte (**Mes cohortes** dans les forums) : ouvrez un fil ou répondez à un message ; le formateur reçoit une notification. Pour une question administrative (inscription, certificat), écrivez à la coordination formation.',
            },
            {
              question: 'Quand mon certificat est-il émis et comment le partager ?',
              answer: 'Il est émis automatiquement quand le module passe en « Terminée » et que les critères (score minimal, assiduité) sont remplis. Sur la page du document, cliquez sur `Générer le PDF` puis `Télécharger le PDF`. Pour le faire vérifier, transmettez le lien **Vérification publique** ou le code QR du PDF : la page publique du site institutionnel confirme son authenticité.',
            },
            {
              question: 'Ma formation est « Expirée » ou « Suspendue ». Puis-je continuer ?',
              answer: 'Non, pas tant que le statut n’a pas changé : seule la fiche reste consultable. Contactez la coordination formation pour demander une prolongation ou connaître le motif de la suspension.',
            },
            {
              question: 'Où sont mes notifications et comment régler les emails ?',
              answer: 'Les six dernières notifications sont dans la section **05 Notifications** de votre tableau de bord ; il n’y a pas de cloche dans la barre du haut. La liste complète et vos préférences d’emails se trouvent dans votre espace personnel sur le site institutionnel (lien **préférences** en bas de chaque email). Les emails essentiels ne peuvent pas être désactivés.',
            },
            {
              question: 'Puis-je annuler une demande d’inscription en attente ?',
              answer: 'Aucun bouton ne le permet sur la plateforme. Écrivez à la coordination formation en indiquant le module concerné : elle annulera la demande.',
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
            { term: 'Activité', definition: 'La plus petite unité d’une formation : une lecture, une vidéo, une évaluation, un devoir, une séance... Les activités sont regroupées en leçons, elles-mêmes regroupées en modules.' },
            { term: 'Activité obligatoire / facultative', definition: 'Seules les activités obligatoires (étoile « Activité obligatoire ») comptent pour terminer le module. Les facultatives sont signalées par « opt. » dans le sommaire.' },
            { term: 'Assiduité', definition: 'Votre taux de présence aux séances en direct, enregistré par le formateur. Un minimum peut être exigé pour terminer le module et obtenir le certificat.' },
            { term: 'Attestation / Certificat', definition: 'Le document numéroté délivré à la fin d’un module. Sa nature (attestation ou certificat) dépend du module. Les deux sont vérifiables publiquement.' },
            { term: 'Brouillon', definition: 'Une version enregistrée mais non remise (devoir) ou non soumise (évaluation). Un brouillon de devoir est conservé sur la plateforme ; le brouillon d’une évaluation est conservé dans le navigateur de votre appareil.' },
            { term: 'Classe virtuelle', definition: 'Une séance en direct par visioconférence. Le bouton `Rejoindre la classe virtuelle` s’active 15 minutes avant le début.' },
            { term: 'Code de vérification', definition: 'Deux sens : le code à 6 chiffres de la vérification en deux étapes à la connexion ; ou le code à 12 caractères (XXXX-XXXX-XXXX) d’un certificat, qui permet de le vérifier publiquement.' },
            { term: 'Cohorte', definition: 'Un groupe de participants qui suit une session d’un module ensemble, avec un formateur, des séances à dates fixes et un forum réservé.' },
            { term: 'Composition', definition: 'Une question d’évaluation à réponse rédigée, notée par le formateur (pas de correction automatique).' },
            { term: 'Coordination formation', definition: 'L’équipe de la Fédération qui valide les inscriptions, crée les cohortes, programme les séances et émet les certificats.' },
            { term: 'Émargement', definition: 'L’enregistrement de votre présence à une séance par le formateur. Il valide l’activité « Séance en direct ».' },
            { term: 'Évaluation (quiz)', definition: 'Une série de questions corrigées automatiquement (sauf les compositions), avec un seuil de réussite et un nombre de tentatives limité.' },
            { term: 'Fil de discussion', definition: 'Un sujet ouvert dans un forum, composé d’un message initial et de réponses.' },
            { term: 'Inscription libre / sur validation / payante / réservée aux organisations', definition: 'Les quatre conditions d’accès à un module : immédiate, après accord de la coordination, après paiement, ou uniquement via une demande de votre organisation.' },
            { term: 'Lecteur', definition: 'L’écran où vous suivez la formation : sommaire à gauche (ou bouton **Sommaire** sur mobile), activité au centre, progression et navigation en bas.' },
            { term: 'Modalité', definition: 'La façon de suivre un module : **À distance (asynchrone)** (seul, quand vous voulez), **En direct (synchrone)** (séances à dates fixes), **Hybride** (les deux).' },
            { term: 'Pilier', definition: 'L’un des trois axes du programme : Protection de l’outil de production, Prévention des conflits sociaux, Défense des intérêts matériels et moraux.' },
            { term: 'Prérequis', definition: 'Un module à terminer avant de s’inscrire à un autre. Les prérequis « (recommandé) » ne bloquent pas l’inscription.' },
            { term: 'Révocation', definition: 'L’annulation définitive d’un certificat par la coordination. Le document ne peut plus être téléchargé ni présenté.' },
            { term: 'Seuil de réussite', definition: 'Le pourcentage minimal à atteindre pour réussir une évaluation (affiché sur son écran d’accueil).' },
            { term: 'Session (de formation)', definition: 'Une édition d’un module à des dates données, suivie par une cohorte.' },
            { term: 'Transcription', definition: 'Le texte intégral d’une vidéo ou d’une capsule audio, proposé dans la **Version bas débit**.' },
            { term: 'Vérification en deux étapes (MFA)', definition: 'Un code temporaire, généré par une application sur votre téléphone, demandé en plus du mot de passe à la connexion.' },
            { term: 'Version bas débit', definition: 'Le panneau qui propose, sous une vidéo ou un audio, une transcription, une capsule audio légère et un document de remplacement pour les connexions lentes.' },
            { term: 'XAF', definition: 'Le code du franc CFA, monnaie des tarifs affichés sur la plateforme.' },
          ],
        },
      ],
    },
    {
      id: 'besoin-d-aide',
      title: 'Besoin d’aide ?',
      icon: 'life-buoy',
      summary: 'À qui s’adresser selon le problème, et quoi indiquer dans votre message.',
      blocks: [
        {
          type: 'table',
          caption: 'À qui s’adresser',
          columns: ['Votre problème', 'À qui écrire'],
          rows: [
            ['Contenu d’un cours, consigne d’un devoir, note, tentative supplémentaire, séance manquée', 'Votre formateur, dans le forum de votre cohorte.'],
            ['Demande d’inscription en attente, statut d’inscription, cohorte, certificat manquant ou à réémettre, tarif', 'La coordination formation (formulaire de contact du site, ou adresse **Aide** du pied de page).'],
            ['Connexion impossible, compte désactivé, email non confirmé, mot de passe, paiement non pris en compte', 'Le support de la Fédération (formulaire de contact du site).'],
            ['Message déplacé dans un forum', 'Utilisez `Signaler ce message` : la modération est prévenue.'],
            ['Question sur votre organisation ou une demande de formation pour un groupe', 'Le responsable de votre organisation, puis le secrétariat général de la Fédération.'],
          ],
        },
        {
          type: 'list',
          title: 'Dans votre message, indiquez',
          style: 'check',
          items: [
            'L’adresse email de votre compte (jamais votre mot de passe).',
            'L’écran concerné (par exemple « fiche du module 03 », « évaluation de la leçon 2.1 », « page Certificats »).',
            'Le message d’erreur exact, et la « Référence » affichée sur la page « Une erreur est survenue » s’il y en a une.',
            'Ce que vous avez déjà essayé, et votre appareil (téléphone ou ordinateur, navigateur).',
          ],
        },
        {
          type: 'links',
          items: [
            { label: 'Formulaire de contact', href: '{{web}}/contact', description: 'Support et coordination formation de la Fédération.', external: true, icon: 'mail' },
            { label: 'Vérifier un certificat', href: '{{web}}/certificats/verifier', description: 'Page publique de vérification d’un document.', external: true, icon: 'qr-code' },
            { label: 'Mon tableau de bord', href: '/dashboard', description: 'Retour à votre espace.', icon: 'layout-dashboard' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Coordonnées de la Fédération des Travailleurs du Gabon',
          text: 'BP 1234 Libreville, Gabon · Email : jossngomafm@gmail.com · Téléphone : 066 23 00 33 / 077 52 27 98. Aucun délai de réponse n’est garanti ; en cas d’urgence avant une séance ou une échéance, prévenez aussi votre formateur dans le forum.',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Page d’erreur',
          text: 'Si la page « Une erreur est survenue » s’affiche, votre progression enregistrée n’est pas perdue : cliquez sur `Réessayer`. Si le problème persiste, notez la « Référence » affichée et transmettez-la au support. La page « Cette page est introuvable » propose une recherche dans le catalogue et un retour au tableau de bord.',
        },
      ],
    },
  ],
  related: [
    {
      label: 'Guide du membre',
      href: '{{web}}/espace/guide',
      description: 'Créer et gérer son compte sur le site institutionnel : profil, sécurité, paiements, reçus, préférences de notification.',
      external: true,
    },
  ],
  selfAssessment: {
    intro:
      'Vérifiez en une dizaine de minutes que vous savez vous connecter, vous inscrire, suivre une formation, passer une évaluation, remettre un devoir et obtenir votre certificat. Chaque réponse renvoie à la section du guide à relire.',
    passPercent: 70,
    questions: [
      {
        id: 'q-connexion-1',
        sectionId: 'se-connecter',
        type: 'single',
        prompt: 'Vous n’avez pas encore de compte. Où le créez-vous ?',
        options: [
          { id: 'a', text: 'Sur le site institutionnel : le même compte ouvre ensuite la plateforme de formation.', correct: true },
          { id: 'b', text: 'Sur la plateforme de formation, avec un formulaire d’inscription dédié.', correct: false },
          { id: 'c', text: 'Auprès de votre formateur, qui crée le compte pour vous.', correct: false },
        ],
        explanation: 'Le bouton **Créer un compte** de la plateforme redirige vers le site institutionnel. Un seul compte sert aux deux. Voir « Avant de commencer : compte et connexion ».',
      },
      {
        id: 'q-deconnexion-1',
        sectionId: 'se-deconnecter',
        type: 'true-false',
        prompt: 'Sur un téléphone prêté ou un ordinateur partagé, il faut se déconnecter à la fin : votre progression reste enregistrée.',
        options: [
          { id: 'a', text: 'Vrai', correct: true },
          { id: 'b', text: 'Faux', correct: false },
        ],
        explanation: 'La déconnexion protège votre compte et ne fait rien perdre : la progression est conservée sur la plateforme. Voir « Se déconnecter ».',
      },
      {
        id: 'q-reperer-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Où lisez-vous vos notifications sur la plateforme de formation ?',
        options: [
          { id: 'a', text: 'Dans la section « 05 Notifications » du tableau de bord.', correct: true },
          { id: 'b', text: 'En cliquant sur une cloche dans la barre du haut.', correct: false },
          { id: 'c', text: 'Sur la page « Mes formations ».', correct: false },
        ],
        explanation: 'Il n’y a pas de cloche dans la barre du haut : les six dernières notifications sont sur le tableau de bord. Voir « Se repérer dans la plateforme ».',
      },
      {
        id: 'q-catalogue-1',
        sectionId: 'choisir-une-formation',
        type: 'true-false',
        prompt: 'Le catalogue et les fiches des modules peuvent être consultés sans être connecté.',
        options: [
          { id: 'a', text: 'Vrai', correct: true },
          { id: 'b', text: 'Faux', correct: false },
        ],
        explanation: 'Le catalogue est public ; seules l’inscription et le suivi demandent une connexion. Voir « Comment choisir une formation dans le catalogue ».',
      },
      {
        id: 'q-inscription-1',
        sectionId: 'inscription-sur-validation',
        type: 'single',
        prompt: 'Vous cliquez sur `Demander l’inscription`. Que devient votre inscription ?',
        options: [
          { id: 'a', text: 'Elle passe « En attente » jusqu’à la validation par la coordination.', correct: true },
          { id: 'b', text: 'Elle passe immédiatement « En cours » et la première activité s’ouvre.', correct: false },
          { id: 'c', text: 'Elle est annulée si vous ne payez pas dans l’heure.', correct: false },
        ],
        explanation: 'La demande est transmise à la coordination ; vous recevez « Inscription validée » puis « Inscription confirmée » quand elle est acceptée. Voir « Inscription sur validation ».',
      },
      {
        id: 'q-paiement-1',
        sectionId: 'formation-payante',
        type: 'single',
        prompt: 'Où réglez-vous une formation payante ?',
        options: [
          { id: 'a', text: 'Sur le site institutionnel, après avoir cliqué sur `S’inscrire - <prix>` sur la fiche.', correct: true },
          { id: 'b', text: 'Directement dans la carte « Tarif » de la plateforme, en saisissant votre code Mobile Money.', correct: false },
          { id: 'c', text: 'En espèces auprès de votre formateur lors de la première séance.', correct: false },
        ],
        explanation: 'Le bouton crée une commande et vous conduit sur la page de paiement du site institutionnel ; l’accès s’ouvre à la confirmation du règlement. Voir « Formation payante ».',
      },
      {
        id: 'q-inscriptions-1',
        sectionId: 'suivre-mes-inscriptions',
        type: 'multiple',
        prompt: 'Quels statuts d’inscription se trouvent dans l’onglet `Clôturées` de « Mes formations » ?',
        options: [
          { id: 'a', text: 'Suspendue', correct: true },
          { id: 'b', text: 'Annulée', correct: true },
          { id: 'c', text: 'Expirée', correct: true },
          { id: 'd', text: 'En attente', correct: false },
        ],
        explanation: 'L’onglet `Clôturées` regroupe Suspendue, Annulée et Expirée ; « En attente » a son propre onglet. Voir « Comment suivre mes inscriptions ».',
      },
      {
        id: 'q-lecteur-1',
        sectionId: 'avancer-dans-le-parcours',
        type: 'single',
        prompt: 'Pour quelles activités le bouton `Marquer comme terminé` est-il affiché ?',
        options: [
          { id: 'a', text: 'Les activités validées à la consultation ou au temps passé (lecture, vidéo, document...).', correct: true },
          { id: 'b', text: 'Les évaluations, une fois le seuil de réussite atteint.', correct: false },
          { id: 'c', text: 'Les séances en direct, pour confirmer votre présence.', correct: false },
        ],
        explanation: 'Une évaluation se valide par son score, une séance par l’émargement du formateur. La règle est écrite dans le bloc de progression. Voir « Avancer dans le parcours ».',
      },
      {
        id: 'q-lecteur-2',
        sectionId: 'connexion-lente-ou-coupee',
        type: 'true-false',
        prompt: 'Sans connexion Internet, les vidéos et les documents d’une formation restent consultables sur la plateforme.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Seule votre progression (temps, activités terminées) est conservée hors ligne puis envoyée au retour du réseau ; les contenus demandent une connexion. Voir « Connexion lente ou coupée ».',
      },
      {
        id: 'q-evaluation-1',
        sectionId: 'commencer-une-tentative',
        type: 'single',
        prompt: 'Pendant une évaluation chronométrée, le chronomètre arrive à 00:00. Que se passe-t-il ?',
        options: [
          { id: 'a', text: 'Vos réponses sont soumises automatiquement.', correct: true },
          { id: 'b', text: 'Le chronomètre se met en pause jusqu’à votre retour.', correct: false },
          { id: 'c', text: 'La tentative est effacée et ne compte pas.', correct: false },
        ],
        explanation: 'Le message « Temps écoulé : vos réponses ont été soumises automatiquement. » s’affiche et la tentative est définitive. Voir « Commencer et répondre ».',
      },
      {
        id: 'q-evaluation-2',
        sectionId: 'lire-son-resultat',
        type: 'single',
        prompt: 'Vous avez fait plusieurs tentatives à une évaluation. Quel score est retenu pour votre progression ?',
        options: [
          { id: 'a', text: 'Le meilleur score de toutes vos tentatives.', correct: true },
          { id: 'b', text: 'Le score de la dernière tentative.', correct: false },
          { id: 'c', text: 'La moyenne de toutes les tentatives.', correct: false },
        ],
        explanation: 'Le meilleur score est conservé. Voir « Lire son résultat et la correction ».',
      },
      {
        id: 'q-devoir-1',
        sectionId: 'deposer-un-devoir',
        type: 'single',
        prompt: 'Vous avez cliqué sur `Soumettre le devoir`. Jusqu’à quand pouvez-vous encore modifier votre remise ?',
        options: [
          { id: 'a', text: 'Jusqu’à la notation par le formateur, avec `Mettre à jour ma remise`.', correct: true },
          { id: 'b', text: 'Plus jamais : la remise est définitive dès la soumission.', correct: false },
          { id: 'c', text: 'Pendant 24 heures seulement.', correct: false },
        ],
        explanation: 'Seule la notation verrouille le devoir (statut « Noté »). Voir « Comment déposer un devoir ».',
      },
      {
        id: 'q-devoir-2',
        sectionId: 'deposer-un-devoir',
        type: 'true-false',
        prompt: 'Un devoir remis après la date limite est toujours accepté, simplement marqué « Remis en retard ».',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Cela dépend du devoir : s’il affiche « Aucune remise tardive », la remise est bloquée après la date limite. Voir « Comment déposer un devoir ».',
      },
      {
        id: 'q-forum-1',
        sectionId: 'participer-aux-forums',
        type: 'multiple',
        prompt: 'Dans un forum, que devez-vous éviter ?',
        options: [
          { id: 'a', text: 'Publier votre numéro de téléphone ou votre adresse.', correct: true },
          { id: 'b', text: 'Révéler des informations confidentielles sur une négociation en cours.', correct: true },
          { id: 'c', text: 'Poser une question à votre formateur.', correct: false },
          { id: 'd', text: 'Signaler un message déplacé avec `Signaler ce message`.', correct: false },
        ],
        explanation: 'Le forum est le canal pour joindre le formateur et le signalement est encouragé ; en revanche, les données personnelles et les informations confidentielles n’y ont pas leur place. Voir « Comment participer aux forums ».',
      },
      {
        id: 'q-seance-1',
        sectionId: 'assister-a-une-seance',
        type: 'single',
        prompt: 'Quand le bouton `Rejoindre la classe virtuelle` devient-il actif ?',
        options: [
          { id: 'a', text: '15 minutes avant le début de la séance, jusqu’à sa fin.', correct: true },
          { id: 'b', text: 'Dès la réception de la convocation.', correct: false },
          { id: 'c', text: '24 heures avant, au moment du rappel.', correct: false },
        ],
        explanation: 'Avant, le bouton affiche « Lien actif 15 min avant ». Voir « Assister à une séance ».',
      },
      {
        id: 'q-calendrier-1',
        sectionId: 'utiliser-le-calendrier',
        type: 'true-false',
        prompt: 'Le fichier obtenu avec `Exporter (.ics)` se met à jour tout seul dans votre agenda après une nouvelle convocation.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'L’export est une photographie à un instant donné : refaites-le après une nouvelle convocation. Voir « Utiliser le calendrier ».',
      },
      {
        id: 'q-certificat-1',
        sectionId: 'obtenir-mon-certificat',
        type: 'single',
        prompt: 'Un employeur veut vérifier l’authenticité de votre certificat. Que lui transmettez-vous ?',
        options: [
          { id: 'a', text: 'Le lien **Vérification publique** (ou le code QR du PDF).', correct: true },
          { id: 'b', text: 'Une capture d’écran de votre tableau de bord.', correct: false },
          { id: 'c', text: 'Votre adresse email et votre mot de passe pour qu’il vérifie lui-même.', correct: false },
        ],
        explanation: 'La page publique du site institutionnel confirme l’authenticité, le titulaire, la formation et la validité. Ne communiquez jamais votre mot de passe. Voir « Comment obtenir, télécharger et faire vérifier mon certificat ».',
      },
      {
        id: 'q-certificat-2',
        sectionId: 'obtenir-mon-certificat',
        type: 'true-false',
        prompt: 'Un certificat « Révoqué » peut encore être téléchargé et présenté à un employeur.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La révocation est définitive : le PDF est bloqué et la page de vérification publique l’indique. Voir « Comment obtenir, télécharger et faire vérifier mon certificat ».',
      },
      {
        id: 'q-notifications-1',
        sectionId: 'notifications',
        type: 'single',
        prompt: 'Vous ne voulez plus recevoir certains emails de la plateforme. Où réglez-vous cela ?',
        options: [
          { id: 'a', text: 'Dans votre espace personnel sur le site institutionnel (lien **préférences** en bas de chaque email).', correct: true },
          { id: 'b', text: 'Dans la section « 05 Notifications » du tableau de bord.', correct: false },
          { id: 'c', text: 'En écrivant à votre formateur dans le forum.', correct: false },
        ],
        explanation: 'Les préférences d’emails se règlent sur le site ; les emails essentiels (inscription confirmée, convocation, certificat, paiements, compte) restent toujours envoyés. Voir « Notifications et emails que vous recevez ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'single',
        prompt: 'Vous ne comprenez pas la consigne d’un devoir. À qui vous adressez-vous en premier ?',
        options: [
          { id: 'a', text: 'À votre formateur, dans le forum de votre cohorte.', correct: true },
          { id: 'b', text: 'Au secrétariat général de la Fédération.', correct: false },
          { id: 'c', text: 'Au support technique, par le formulaire de contact.', correct: false },
        ],
        explanation: 'Les questions pédagogiques vont au formateur ; la coordination traite les inscriptions et certificats, le support les problèmes de compte. Voir « Besoin d’aide ? ».',
      },
    ],
  },
}
