import type { Guide } from '@fetrag/contracts'

/**
 * Guide du responsable d’organisation (plateforme de formation, rôle ORG_MANAGER).
 *
 * Périmètre : espace « Organisation » de la plateforme (/organisation, /demande-formation),
 * assistant de demande de formation en six étapes, suivi des demandes, participants et rapports.
 * Le contenu décrit uniquement ce qui existe dans l’application (libellés, statuts, règles).
 */
export const lmsOrganisation: Guide = {
  id: 'lms-organisation',
  platform: 'lms',
  role: 'ORG_MANAGER',
  title: 'Guide du responsable d’organisation',
  subtitle: 'Demander des formations et suivre vos participants',
  audience:
    'Ce guide s’adresse aux responsables désignés des organisations affiliées à la FETRAG (syndicats, sections, fédérations) qui déposent des demandes de formation pour leurs membres et suivent leur progression sur la plateforme de formation.',
  summary:
    'En tant que responsable d’organisation, vous déposez des demandes de formation institutionnelles en six étapes et vous suivez leur instruction par la coordination FETRAG. Une fois la formation planifiée, vous voyez la progression de vos participants, leurs attestations et des rapports par module et par cohorte. Ce guide décrit chaque écran, chaque bouton et chaque statut de votre espace « Organisation ».',
  tone: 'green',
  icon: 'building',
  readingMinutes: 45,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée (le même compte ouvre le site institutionnel et la plateforme de formation).',
    'Avoir été désigné gestionnaire de votre organisation par la coordination FETRAG (sinon la page « Vous devez être responsable d’une organisation » s’affiche).',
    'La liste nominative des personnes à former : nom complet et, autant que possible, une adresse email par personne (sans email, aucun compte ne peut être créé).',
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
      text: 'Ouvrez le menu de votre compte puis cliquez sur **Organisation**.',
      where: 'bouton rond avec vos initiales, en haut à droite',
      result: 'Le tableau de bord de votre organisation s’affiche, avec le menu « Organisation » à gauche (ou dans le tiroir sur mobile).',
    },
    {
      text: 'Cliquez sur `Nouvelle demande`.',
      where: 'en haut à droite du tableau de bord',
      result: 'L’assistant « Former vos leaders syndicaux » s’ouvre à l’étape 01 sur 06.',
    },
    {
      text: 'Renseignez les six étapes : organisation, modules, participants, préférences, engagements, récapitulatif.',
      note: 'À chaque `Continuer`, un brouillon est enregistré : vous pouvez vous arrêter et reprendre plus tard.',
    },
    {
      text: 'Cliquez sur `Transmettre à la coordination`.',
      where: 'en bas du récapitulatif (étape 06)',
      result: 'Le message « Demande DF-… transmise à la coordination FETRAG » apparaît, puis la page de suivi s’ouvre avec le statut « Soumise ».',
    },
    {
      text: 'Surveillez votre boîte email et la page de suivi : la coordination vous répond depuis la plateforme.',
      result: 'Le statut évolue (Complément demandé, Acceptée, Planifiée…) et chaque décision est datée dans l’historique.',
    },
  ],
  sections: [
    // -------------------------------------------------------------------------
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'building',
      summary: 'Ce que vous pouvez faire, ce que vous ne pouvez pas faire, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous êtes le responsable désigné d’une organisation affiliée à la FETRAG. Sur la plateforme de formation, votre espace « Organisation » vous permet de demander des formations pour vos membres et de suivre ce qu’ils en font. Vous ne voyez que les données de votre organisation.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Déposer une **demande de formation** institutionnelle : choix des modules du programme 2026, liste nominative des participants, date et modalité souhaitées, engagements, pièce officielle.',
            'Enregistrer un **brouillon** (demande non envoyée) et le reprendre plus tard.',
            'Suivre l’instruction de chaque demande : statut, frise d’avancement, historique des décisions, note de la coordination.',
            'Répondre à un **complément d’information** demandé par la coordination, accepter une **autre date proposée**, ou annuler une demande.',
            'Consulter les cohortes créées pour votre organisation, les prochaines sessions et les indicateurs de progression.',
            'Voir la liste de vos participants avec leurs inscriptions, leur progression et le nombre d’attestations obtenues.',
            'Consulter et exporter (fichiers CSV et PDF) les rapports par module et par cohorte, avec l’assiduité et les scores.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire',
          style: 'bullet',
          items: [
            'Créer vous-même une cohorte, y ajouter ou en retirer un participant : c’est la coordination qui planifie et inscrit.',
            'Ajouter des participants à une demande déjà transmise (sauf si la coordination vous demande un complément).',
            'Voir les réponses aux évaluations, les devoirs déposés, les forums de cohorte ou les présences séance par séance d’un participant.',
            'Délivrer ou révoquer une attestation, modifier une note.',
            'Payer une formation ou demander une prise en charge depuis cet espace : ces sujets se traitent avec la Fédération, en dehors de la plateforme.',
            'Rattacher un compte à votre organisation ou désigner un autre gestionnaire : demandez-le à la coordination.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait pour vous'],
          rows: [
            ['Coordination FETRAG', 'Instruit vos demandes, demande un complément, accepte ou refuse, propose une autre date, planifie les cohortes, crée les comptes de vos participants, désigne les formateurs.'],
            ['Formateur', 'Anime les sessions de la cohorte, corrige les évaluations, gère les présences. Vous ne le contactez pas depuis la plateforme.'],
            ['Participants (apprenants)', 'Vos membres inscrits : ils suivent les modules, passent les évaluations et obtiennent leurs attestations sur leur propre compte.'],
            ['Support et secrétariat général', 'Vous aident pour le compte, l’accès à l’espace, l’affiliation de votre organisation.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un seul compte, deux plateformes',
          text: 'Votre compte FETRAG est le même sur le site institutionnel et sur la plateforme de formation. Votre profil, votre mot de passe et la sécurité du compte se gèrent sur le site institutionnel ; les demandes de formation et le suivi des participants se font ici, sur la plateforme.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte, connexion, déconnexion',
      icon: 'log-in',
      summary: 'Obtenir votre accès, vous connecter, retrouver un mot de passe oublié et vous déconnecter proprement.',
      blocks: [
        {
          type: 'paragraph',
          text: 'L’espace « Organisation » est réservé aux personnes désignées comme gestionnaire d’une organisation affiliée. Le compte est créé sur le site institutionnel ; la désignation comme gestionnaire est faite par la coordination FETRAG.',
        },
      ],
      subsections: [
        {
          id: 'obtenir-un-acces',
          title: 'Obtenir votre accès',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Si vous n’avez pas encore de compte, créez-le sur le site institutionnel.',
                  where: 'page **Inscription** du site institutionnel (le lien **Pas encore de compte ?** de la page de connexion vous y conduit)',
                  note: 'Le mot de passe doit comporter au moins 8 caractères, dont une majuscule et un chiffre.',
                  result: 'Un email vous demande de confirmer votre adresse.',
                },
                {
                  text: 'Ouvrez l’email de confirmation et cliquez sur le lien.',
                  result: 'Votre adresse est confirmée : vous pouvez vous connecter.',
                },
                {
                  text: 'Demandez à la coordination FETRAG de vous désigner comme gestionnaire de votre organisation.',
                  where: 'formulaire de contact du site institutionnel ({{web}}/contact) ou coordonnées de la Fédération (section « Besoin d’aide »)',
                  note: 'Indiquez l’adresse email de votre compte, le nom et le sigle de votre organisation, et votre fonction. Si votre organisation n’est pas encore affiliée, la Fédération engage d’abord la procédure d’adhésion.',
                  result: 'Une fois la désignation faite, le lien **Organisation** apparaît dans le menu de votre compte.',
                },
              ],
            },
          ],
        },
        {
          id: 'se-connecter',
          title: 'Se connecter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la page **Connexion** de la plateforme.',
                  where: 'lien **Se connecter** en haut à droite, ou adresse /connexion',
                  result: 'Le formulaire de connexion s’affiche.',
                },
                {
                  text: 'Saisissez votre **Adresse email** (obligatoire).',
                  note: 'La même adresse que sur le site institutionnel.',
                },
                {
                  text: 'Saisissez votre **Mot de passe** (obligatoire).',
                  note: 'L’icône en forme d’œil, à droite du champ, affiche ou masque ce que vous tapez.',
                },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  where: 'bouton bleu sous le formulaire',
                  result: 'Votre tableau de bord apprenant s’ouvre (page **Tableau de bord**). Si vous veniez d’une page de l’espace « Organisation », vous y êtes renvoyé directement.',
                },
                {
                  text: 'Si un champ **Code de vérification** apparaît, saisissez le code à 6 chiffres de votre application d’authentification, puis cliquez sur `Vérifier et se connecter`.',
                  note: 'Ce champ n’apparaît que si vous avez activé la vérification en deux étapes sur votre compte (elle n’est pas obligatoire pour un responsable d’organisation, mais elle est recommandée).',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Un message indique que votre adresse email n’est pas confirmée.',
                  cause: 'Vous n’avez pas cliqué sur le lien de l’email de confirmation.',
                  solution: 'Cliquez sur **Renvoyer le lien de confirmation** sous le message, puis ouvrez le nouvel email (vérifiez le dossier des courriers indésirables).',
                },
                {
                  problem: 'Le mot de passe est refusé.',
                  cause: 'Faute de frappe, majuscules verrouillées ou mot de passe modifié récemment.',
                  solution: 'Affichez le mot de passe avec l’icône en forme d’œil pour vérifier la saisie. Sinon, utilisez **Mot de passe oublié ?**.',
                },
                {
                  problem: 'Après la connexion, le lien **Organisation** n’apparaît pas dans le menu du compte.',
                  cause: 'Votre compte n’a pas encore été désigné gestionnaire d’une organisation.',
                  solution: 'Contactez la coordination FETRAG (section « Besoin d’aide ») en indiquant l’adresse email de votre compte et votre organisation.',
                },
              ],
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
                  text: 'Cliquez sur **Mot de passe oublié ?**.',
                  where: 'sous le champ **Mot de passe** de la page de connexion',
                  result: 'Vous êtes conduit sur la page de réinitialisation du site institutionnel.',
                },
                {
                  text: 'Saisissez l’adresse email de votre compte, puis validez.',
                  result: 'Un email contenant un lien de réinitialisation vous est envoyé.',
                },
                {
                  text: 'Ouvrez l’email et cliquez sur le lien.',
                  result: 'Une page vous demande de choisir un nouveau mot de passe (8 caractères au moins, une majuscule, un chiffre).',
                },
                {
                  text: 'Revenez sur la plateforme et connectez-vous avec le nouveau mot de passe.',
                  result: 'Votre tableau de bord s’ouvre.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Sécurité du compte',
              text: 'Le changement de mot de passe et la vérification en deux étapes se gèrent dans **Sécurité du compte** (menu du compte, ou {{web}}/espace/securite sur le site institutionnel).',
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
                  where: 'bouton rond avec vos initiales (ou votre photo), en haut à droite, sur ordinateur comme sur mobile',
                  result: 'Le menu affiche votre nom, votre email et la pastille « Responsable d’organisation ».',
                },
                {
                  text: 'Cliquez sur **Déconnexion** (en rouge, en bas du menu).',
                  result: 'Le texte « Déconnexion en cours » s’affiche brièvement, puis vous revenez sur une page publique.',
                  note: 'Sur mobile, le bouton `Déconnexion` est aussi disponible en bas du tiroir de navigation (bouton **Ouvrir le menu**, trois traits).',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Appareil partagé',
              text: 'Déconnectez-vous systématiquement sur un ordinateur ou un téléphone qui n’est pas le vôtre (cybercafé, poste du syndicat). Vos demandes contiennent les noms, emails et téléphones de vos membres.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'se-reperer',
      title: 'Se repérer dans l’espace « Organisation »',
      icon: 'compass',
      summary: 'La barre de la plateforme, le menu de l’espace, le tableau de bord, sur ordinateur et sur mobile.',
      blocks: [
        {
          type: 'screen',
          title: 'La barre de la plateforme (en haut de toutes les pages)',
          description: 'Cette barre est commune à toute la plateforme. Elle reste visible au-dessus de votre espace « Organisation ».',
          areas: [
            {
              name: 'Logo FETRAG avec la pastille verte « Formation » (à gauche)',
              purpose: 'Revient à l’accueil de la plateforme.',
              icon: 'home',
            },
            {
              name: 'Navigation principale (ordinateur seulement)',
              purpose: 'Liens **Catalogue**, **Tableau de bord**, **Mes formations**, **Calendrier**, **Certificats** : votre espace personnel d’apprenant.',
              icon: 'menu',
            },
            {
              name: 'Menu du compte (bouton rond avec vos initiales, en haut à droite)',
              purpose: 'Votre nom, votre email, la pastille « Responsable d’organisation », puis les liens **Organisation** et **Demande de formation**, les liens vers votre profil et **Sécurité du compte** sur le site institutionnel, et **Déconnexion**.',
              icon: 'user',
            },
            {
              name: 'Bouton **Ouvrir le menu** (trois traits, mobile seulement)',
              purpose: 'Ouvre un tiroir plein écran avec les liens de la navigation, le bouton `Mon espace` (qui mène à votre espace « Organisation ») et `Déconnexion`. Fermeture avec la touche `Échap` ou en touchant le fond.',
              icon: 'smartphone',
            },
            {
              name: 'Pied de page',
              purpose: 'Liens **Catalogue**, **Demande de formation**, **Vérifier un certificat**, **Contact**, **Mentions légales**, **Confidentialité**.',
              icon: 'link',
            },
          ],
        },
        {
          type: 'screen',
          title: 'L’espace « Organisation » (ordinateur)',
          description: 'Sur un écran large, l’espace se compose d’une barre latérale à gauche et d’une barre secondaire au-dessus du contenu.',
          areas: [
            {
              name: 'Barre latérale (à gauche) : ruban bleu « Organisation »',
              purpose: 'Affiche le sigle ou le nom de l’organisation active (ou « N organisations » si vous en pilotez plusieurs).',
              icon: 'building',
            },
            {
              name: 'Menu « Organisation » (dans la barre latérale)',
              purpose: 'Quatre rubriques : **Tableau de bord**, **Demande de formation**, **Participants**, **Rapports**.',
              icon: 'list-checks',
            },
            {
              name: 'Bas de la barre latérale',
              purpose: 'La devise de la Fédération et le lien **Mon espace apprenant** pour revenir à votre tableau de bord personnel.',
              icon: 'graduation-cap',
            },
            {
              name: 'Barre secondaire (au-dessus du contenu) : « Changer d’espace »',
              purpose: 'Bascule entre **Apprenant** et **Organisation** (et d’autres espaces si votre compte a d’autres rôles).',
              icon: 'refresh',
            },
            {
              name: 'Contenu (au centre)',
              purpose: 'La page choisie : tableau de bord, assistant de demande, suivi d’une demande, participants, rapports.',
              icon: 'layout-dashboard',
            },
          ],
        },
        {
          type: 'screen',
          title: 'L’espace « Organisation » (mobile)',
          description: 'Sous 1024 pixels de large (téléphone, petite tablette), la barre latérale est masquée.',
          areas: [
            {
              name: 'Bouton **Ouvrir le menu** (icône, dans la barre secondaire)',
              purpose: 'Ouvre un tiroir avec le même menu : **Tableau de bord**, **Demande de formation**, **Participants**, **Rapports**, et un bouton `Fermer le menu`.',
              icon: 'menu',
            },
            {
              name: 'Menu du compte (initiales, en haut à droite de la barre de la plateforme)',
              purpose: 'Remplace le sélecteur « Changer d’espace », masqué sur téléphone : utilisez **Organisation** ou **Tableau de bord** dans ce menu pour changer d’espace.',
              icon: 'user',
            },
            {
              name: 'Tableaux',
              purpose: 'Les tableaux larges (demandes, participants, rapports) se font défiler de gauche à droite avec le doigt, à l’intérieur de leur cadre.',
              icon: 'table',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Le tableau de bord de l’organisation',
          description: 'La page d’accueil de votre espace (rubrique **Tableau de bord**). L’onglet du navigateur s’intitule « Mon organisation ».',
          areas: [
            {
              name: 'En-tête',
              purpose: 'Ruban « Tableau de bord », sigle et nom de votre organisation, secteur et ville. À droite : le sélecteur **Organisation active** (seulement si vous pilotez plusieurs organisations) et le bouton `Nouvelle demande`.',
              icon: 'building',
            },
            {
              name: 'Quatre tuiles d’indicateurs',
              purpose: '**Participants formés ou en formation**, **Inscriptions** (avec le pourcentage terminé), **Attestations et certificats**, **Demandes de formation** (avec le nombre en cours d’instruction).',
              icon: 'bar-chart',
            },
            {
              name: 'Carte « Progression agrégée »',
              purpose: 'Trois anneaux : **Progression moyenne**, **Taux d’achèvement**, **Score moyen** (affiché seulement s’il existe des résultats).',
              icon: 'pie-chart',
            },
            {
              name: 'Carte « Prochaines sessions »',
              purpose: 'Les séances à venir de vos cohortes : titre, cohorte, lieu, date et heure. Vide tant que la coordination n’a rien planifié.',
              icon: 'calendar',
            },
            {
              name: 'Section 01 « Demandes de formation »',
              purpose: 'Vos huit dernières demandes : **Référence**, **Modules**, **Participants**, **Statut**, **Dernière activité**, bouton `Détail`. Bouton `Assistant de demande` pour en déposer une nouvelle.',
              icon: 'clipboard-list',
            },
            {
              name: 'Section 02 « Cohortes de l’organisation »',
              purpose: 'Une carte par cohorte : nom, code, module, statut, nombre de membres, date de début, formateur, pourcentage de progression, lien vers la demande d’origine.',
              icon: 'users',
            },
            {
              name: 'Section 03 « Dernières décisions »',
              purpose: 'Les cinq dernières décisions de la coordination : statut, référence de la demande, date et commentaire. Cette section n’apparaît que s’il y a eu au moins une décision.',
              icon: 'history',
            },
          ],
        },
        {
          type: 'path',
          label: 'Chemin vers votre espace',
          items: ['Menu du compte (initiales, en haut à droite)', 'Organisation', 'Tableau de bord'],
          href: '/organisation',
        },
        {
          type: 'path',
          label: 'Chemin vers l’assistant de demande',
          items: ['Menu « Organisation »', 'Demande de formation'],
          href: '/demande-formation',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'acceder-a-votre-espace',
      title: 'Comment accéder à votre espace et choisir l’organisation active',
      icon: 'log-in',
      summary: 'Ouvrir l’espace « Organisation » après la connexion et, si vous pilotez plusieurs organisations, choisir celle sur laquelle vous travaillez.',
      blocks: [
        {
          type: 'steps',
          title: 'Ouvrir l’espace « Organisation »',
          items: [
            {
              text: 'Connectez-vous à la plateforme.',
              result: 'Votre tableau de bord apprenant s’ouvre : c’est normal, la connexion mène toujours d’abord à l’espace personnel.',
            },
            {
              text: 'Ouvrez le menu de votre compte.',
              where: 'bouton rond avec vos initiales, en haut à droite',
              result: 'Le menu affiche la pastille « Responsable d’organisation » et un groupe de liens avec **Organisation** et **Demande de formation**.',
            },
            {
              text: 'Cliquez sur **Organisation**.',
              result: 'Le tableau de bord de votre organisation s’affiche, avec le titre « {sigle} · {nom de l’organisation} ».',
              note: 'Sur mobile, vous pouvez aussi toucher le bouton **Ouvrir le menu** (trois traits) puis `Mon espace` : ce bouton mène directement à l’espace « Organisation » pour un responsable d’organisation.',
            },
            {
              text: 'Pour revenir à votre espace personnel, cliquez sur **Mon espace apprenant** en bas de la barre latérale, ou sur **Apprenant** dans « Changer d’espace ».',
              result: 'Le tableau de bord apprenant s’affiche.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Changer d’organisation active (si vous en pilotez plusieurs)',
          intro: 'Si votre compte est gestionnaire de plusieurs organisations, un sélecteur **Organisation active** (icône bâtiment) apparaît dans l’en-tête des quatre pages de l’espace. Toutes les données affichées concernent l’organisation active.',
          items: [
            {
              text: 'Ouvrez la liste déroulante **Organisation active**.',
              where: 'en-tête de la page, à droite du titre (sur mobile, sous le titre)',
              result: 'Les organisations que vous pilotez sont listées sous la forme « SIGLE - Nom ».',
            },
            {
              text: 'Choisissez l’organisation souhaitée.',
              result: 'La page se recharge avec les données de cette organisation. Le sous-titre de la barre latérale change.',
              note: 'Votre choix est mémorisé pendant 30 jours sur cet appareil.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Page « Vous devez être responsable d’une organisation »',
          text: 'Si votre compte n’est gestionnaire d’aucune organisation, cette page remplace l’espace. Elle propose trois pistes : demander à la coordination de vous désigner gestionnaire (organisation déjà affiliée), contacter la Fédération pour l’adhésion (organisation non affiliée), ou vous former à titre individuel via le catalogue. Les boutons `Contacter la FETRAG` et `Voir le catalogue` y figurent.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La page « Vous devez être responsable d’une organisation » s’affiche alors que vous êtes bien responsable.',
              cause: 'La désignation comme gestionnaire n’a pas encore été enregistrée par la coordination, ou vous êtes connecté avec un autre compte.',
              solution: 'Vérifiez l’adresse email affichée dans le menu du compte. Si c’est la bonne, contactez la coordination FETRAG avec cette adresse et le nom de votre organisation.',
            },
            {
              problem: 'Le message « Cette organisation n’est pas accessible » apparaît en changeant d’organisation.',
              cause: 'Votre accès à cette organisation a été retiré.',
              solution: 'Choisissez une autre organisation dans le sélecteur ou contactez la coordination.',
            },
            {
              problem: 'La page « Élément introuvable » s’affiche.',
              cause: 'Vous avez ouvert un lien vers une demande ou une cohorte qui n’appartient pas à l’organisation active.',
              solution: 'Cliquez sur `Retour au tableau de bord`, puis changez d’organisation active si nécessaire.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'lire-le-tableau-de-bord',
      title: 'Comment lire le tableau de bord',
      icon: 'layout-dashboard',
      summary: 'Comprendre les indicateurs, retrouver une demande, une cohorte ou une décision.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Tableau de bord** dans le menu « Organisation ».',
              where: 'barre latérale à gauche ; sur mobile, bouton **Ouvrir le menu** dans la barre secondaire',
              result: 'Les quatre tuiles d’indicateurs s’affichent sous le titre de votre organisation.',
            },
            {
              text: 'Lisez les tuiles : **Participants formés ou en formation**, **Inscriptions**, **Attestations et certificats**, **Demandes de formation**.',
              note: 'Sous **Inscriptions**, le pourcentage indique la part des inscriptions terminées. Sous **Demandes de formation**, « {n} en cours d’instruction » compte les demandes que la coordination examine ; « Aucune en attente » signifie qu’aucune demande n’attend de réponse.',
            },
            {
              text: 'Consultez la carte **Progression agrégée**.',
              note: 'Les anneaux donnent la moyenne de progression de tous vos participants, le taux d’achèvement et, s’il existe des résultats, le score moyen. Ce sont des moyennes : aucun résultat individuel n’est affiché ici.',
            },
            {
              text: 'Consultez la carte **Prochaines sessions**.',
              result: 'Chaque ligne indique le titre de la séance, la cohorte, le lieu (ou « Lieu à préciser ») et la date. Vide : « Aucune session programmée ».',
            },
            {
              text: 'Dans la section 01 **Demandes de formation**, repérez une demande par sa **Référence** (format DF-AAAA-XXXXXX) et son **Statut**.',
              note: 'Seules les huit dernières demandes sont listées. Sur mobile, faites défiler le tableau vers la droite pour voir toutes les colonnes.',
            },
            {
              text: 'Cliquez sur `Détail` au bout de la ligne.',
              result: 'La fiche de suivi de la demande s’ouvre (voir « Comment suivre une demande »).',
            },
            {
              text: 'Dans la section 02 **Cohortes de l’organisation**, lisez chaque carte : nom, code et module, statut, nombre de membres, date de début, formateur, pourcentage de progression.',
              note: 'Le lien **Demande {référence}** en bas de la carte ouvre la demande qui a donné naissance à la cohorte.',
            },
            {
              text: 'Dans la section 03 **Dernières décisions**, lisez le statut, la référence et le commentaire de la coordination.',
              note: 'La référence est un lien vers la fiche de la demande.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts des cohortes affichés sur les cartes',
          items: [
            { label: 'Planifiée', tone: 'info', meaning: 'La cohorte est créée, la date de début est fixée ou à confirmer.', next: 'Attendez les convocations ; vérifiez la liste des participants dans **Participants**.' },
            { label: 'Inscriptions ouvertes', tone: 'info', meaning: 'La coordination peut encore ajuster la liste des membres.', next: 'Signalez à la coordination tout changement de participant.' },
            { label: 'En cours', tone: 'success', meaning: 'Les sessions ont commencé.', next: 'Suivez la progression et l’assiduité dans **Rapports**.' },
            { label: 'Clôturé', tone: 'neutral', meaning: 'La formation est terminée ; les attestations ont été délivrées aux participants qui remplissent les critères.', next: 'Téléchargez le rapport de cohorte.' },
            { label: 'Annulé', tone: 'danger', meaning: 'La cohorte a été annulée (par la coordination, ou à la suite de l’annulation de votre demande).', next: 'Déposez une nouvelle demande si besoin.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Une demande ancienne n’apparaît plus dans la section « Demandes de formation ».',
              cause: 'Le tableau de bord n’affiche que les huit dernières demandes.',
              solution: 'Retrouvez-la depuis l’email d’accusé de réception (« Suivre ma demande ») ou depuis les notifications de votre tableau de bord apprenant. Les demandes en brouillon ou en attente de complément sont aussi listées dans **Demande de formation**, carte « Demandes à reprendre ».',
            },
            {
              problem: 'Le bouton `Nouvelle demande` n’apparaît pas.',
              cause: 'Votre compte peut consulter cette organisation mais n’est pas autorisé à déposer une demande pour elle.',
              solution: 'Vérifiez l’organisation active. Si le problème persiste, demandez à la coordination de vérifier votre désignation comme gestionnaire.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'deposer-une-demande',
      title: 'Comment déposer une demande de formation',
      icon: 'clipboard-list',
      summary: 'L’assistant en six étapes : organisation, modules, participants, préférences, engagements, récapitulatif, puis transmission à la coordination.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La demande de formation institutionnelle se dépose depuis l’assistant « Former vos leaders syndicaux » (rubrique **Demande de formation**). Il comporte six étapes numérotées de 01 à 06. À chaque `Continuer`, les champs de l’étape sont vérifiés et un brouillon est enregistré. Vous pouvez donc vous interrompre et reprendre plus tard.',
        },
        {
          type: 'steps',
          title: 'Ouvrir l’assistant',
          items: [
            {
              text: 'Cliquez sur **Demande de formation** dans le menu « Organisation », ou sur `Nouvelle demande` en haut du tableau de bord.',
              where: 'barre latérale (ordinateur) ou tiroir **Ouvrir le menu** (mobile)',
              result: 'La page « Former vos leaders syndicaux » s’ouvre avec la frise des six étapes et le ruban « Étape 01 sur 06 ».',
              note: 'Depuis le catalogue de la plateforme, le bouton `Demande pour une organisation` (icône bâtiment) mène au même endroit, ainsi que le lien **Demande de formation** du pied de page.',
            },
            {
              text: 'Préparez vos informations : liste des participants (nom complet, email, téléphone, fonction), modules souhaités, date de démarrage envisagée, pièce officielle éventuelle.',
              note: 'Une adresse email par participant est fortement recommandée : sans email, aucun compte ne sera créé et la personne ne pourra pas suivre la formation.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Lire la frise des étapes',
          text: 'La frise (3 colonnes sur mobile, 6 sur ordinateur) montre les six étapes : 01 Organisation, 02 Modules, 03 Participants, 04 Préférences, 05 Engagements, 06 Récapitulatif. Les étapes déjà validées portent une coche « Étape validée » et sont cliquables pour y revenir ; les étapes à venir sont grisées. À chaque changement d’étape, la page remonte automatiquement en haut de l’assistant.',
        },
      ],
      subsections: [
        {
          id: 'etape-01-organisation',
          title: 'Étape 01 : Organisation et personne ressource',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Vérifiez le champ **Organisation** (obligatoire).',
                  note: 'La liste est verrouillée si vous ne pilotez qu’une organisation, ou si vous reprenez une demande existante.',
                },
                {
                  text: 'Vérifiez ou corrigez la **Personne ressource** (obligatoire, 2 à 120 caractères).',
                  note: 'C’est l’interlocuteur de la coordination pour cette demande. Le champ est prérempli avec le nom de votre profil.',
                },
                {
                  text: 'Indiquez la **Fonction** (facultatif), par exemple « Secrétaire général » ou « Responsable formation ».',
                },
                {
                  text: 'Vérifiez l’**Email** (obligatoire, prérempli avec l’adresse de votre compte).',
                  note: 'Tous les emails de suivi de cette demande (accusé de réception, décisions, planification) seront envoyés à cette adresse.',
                },
                {
                  text: 'Indiquez le **Téléphone** (facultatif, 6 à 20 caractères : chiffres, +, espaces, parenthèses, points ou tirets).',
                },
                {
                  text: 'Cliquez sur `Continuer`.',
                  where: 'en bas de l’étape (bouton bleu)',
                  result: 'L’étape 02 « Modules » s’affiche. Un brouillon est créé silencieusement avec une référence DF-AAAA-XXXXXX.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Indiquez le nom de la personne ressource » s’affiche.',
                  cause: 'Le champ est vide ou trop court (moins de 2 caractères).',
                  solution: 'Saisissez le prénom et le nom de la personne qui suivra le dossier.',
                },
                {
                  problem: 'Le message « Adresse email invalide » ou « Numéro de téléphone invalide » s’affiche.',
                  cause: 'Le format n’est pas reconnu (espace dans l’email, lettres dans le téléphone).',
                  solution: 'Corrigez le champ signalé en rouge. Le téléphone accepte uniquement des chiffres, le signe +, des espaces, des parenthèses, des points ou des tirets.',
                },
              ],
            },
          ],
        },
        {
          id: 'etape-02-modules',
          title: 'Étape 02 : Modules',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Lisez les cartes des modules du programme 2026 : numéro, titre, aperçu du contenu, pilier et durée en heures.',
                  note: 'Seuls les cours publiés par la coordination sont proposés. Une cohorte sera constituée par module retenu.',
                },
                {
                  text: 'Cochez chaque module souhaité en cliquant sur sa carte (ou avec la touche `Espace` ou `Entrée` au clavier).',
                  result: 'Une coche bleue apparaît sur la carte et le compteur « {n} module(s) sélectionné(s) » se met à jour.',
                },
                {
                  text: 'Cliquez sur `Continuer`.',
                  result: 'L’étape 03 « Participants » s’affiche.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Sélectionnez au moins un module » s’affiche.',
                  cause: 'Aucune carte n’est cochée.',
                  solution: 'Cliquez sur au moins une carte avant de continuer.',
                },
                {
                  problem: 'Le texte « Aucun module publié pour le moment. » s’affiche.',
                  cause: 'La coordination n’a pas encore publié de cours.',
                  solution: 'Enregistrez le brouillon avec `Enregistrer et quitter` et contactez la coordination.',
                },
              ],
            },
          ],
        },
        {
          id: 'etape-03-participants',
          title: 'Étape 03 : Participants',
          blocks: [
            {
              type: 'paragraph',
              text: 'Vous désignez ici, nominativement, les personnes à former. Le badge « {n} / {limite} » en haut de la liste indique le nombre de participants saisis et la limite par demande (10 par défaut, fixée par la Fédération). Il devient orange quand la limite est atteinte.',
            },
            {
              type: 'steps',
              title: 'Ajouter les participants un par un',
              items: [
                {
                  text: 'Cliquez sur `Ajouter un participant`.',
                  where: 'sous la liste « Participants désignés »',
                  result: 'Une nouvelle ligne (ou une carte « Participant N » sur mobile) apparaît.',
                },
                {
                  text: 'Saisissez le **Nom complet** (obligatoire, au moins 2 caractères), sous la forme « Prénom Nom ».',
                },
                {
                  text: 'Saisissez l’**Email** (facultatif mais fortement recommandé).',
                  note: 'C’est avec cette adresse que la coordination créera le compte du participant. Sans email : « compte non créé automatiquement », la personne ne sera ni créée ni inscrite.',
                },
                {
                  text: 'Saisissez le **Téléphone** et la **Fonction** (facultatifs), par exemple « Délégué du personnel ».',
                },
                {
                  text: 'Pour retirer une ligne, cliquez sur `Retirer` au bout de la ligne.',
                  result: 'La ligne disparaît et le compteur diminue.',
                },
              ],
            },
            {
              type: 'steps',
              title: 'Importer une liste d’un coup (copier-coller)',
              items: [
                {
                  text: 'Dépliez le bloc **Import rapide : coller une liste**.',
                  where: 'sous le bouton `Ajouter un participant`',
                  result: 'Une zone de texte « Une personne par ligne » s’affiche.',
                },
                {
                  text: 'Collez votre liste : une personne par ligne, au format **Nom;email;téléphone;fonction**.',
                  note: 'Les séparateurs acceptés sont le point-virgule, la virgule ou la tabulation (copie depuis un tableur). Seul le nom est indispensable sur chaque ligne.',
                },
                {
                  text: 'Cliquez sur `Importer les lignes`.',
                  result: 'Le message « {n} participant(s) ajouté(s) » s’affiche et les lignes apparaissent dans la liste.',
                  note: 'Les doublons (même nom et même email) sont ignorés. Si la limite est dépassée, le message « Limite de {N} participants atteinte : {n} ligne(s) ignorée(s). » précise combien de lignes n’ont pas été reprises.',
                },
                {
                  text: 'Relisez chaque ligne importée et complétez les emails manquants.',
                },
                {
                  text: 'Cliquez sur `Continuer`.',
                  result: 'L’étape 04 « Préférences » s’affiche.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Désignez au moins un participant » s’affiche.',
                  cause: 'La liste est vide.',
                  solution: 'Ajoutez au moins une ligne avec un nom complet.',
                },
                {
                  problem: 'Un message en anglais apparaît sous le nom d’un participant.',
                  cause: 'Le nom saisi fait moins de 2 caractères.',
                  solution: 'Saisissez le prénom et le nom complets de la personne.',
                },
                {
                  problem: 'Le message « Aucune ligne exploitable » apparaît après l’import.',
                  cause: 'Les lignes collées ne commencent pas par un nom, ou les séparateurs ne sont pas reconnus.',
                  solution: 'Vérifiez que chaque ligne commence par le nom, suivi de l’email, du téléphone et de la fonction séparés par « ; ».',
                },
                {
                  problem: 'Le bouton `Ajouter un participant` est grisé.',
                  cause: 'La limite de participants par demande est atteinte.',
                  solution: 'Retirez un participant ou déposez une seconde demande pour les personnes restantes.',
                },
              ],
            },
          ],
        },
        {
          id: 'etape-04-preferences',
          title: 'Étape 04 : Préférences',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Choisissez une **Date de démarrage souhaitée** (facultatif).',
                  note: 'La date ne peut pas être antérieure à aujourd’hui. Elle est indicative : la coordination proposera un calendrier.',
                },
                {
                  text: 'Choisissez la **Modalité souhaitée** : **Présentiel**, **Classe virtuelle** ou **Hybride**.',
                  note: '« Hybride » (mélange de présentiel et de classe virtuelle) est proposé par défaut.',
                },
                {
                  text: 'Rédigez **Motivation et attentes** (facultatif, 3000 caractères au plus) : contexte de l’organisation, objectifs, contraintes particulières.',
                },
                {
                  text: 'Cliquez sur `Continuer`.',
                  result: 'L’étape 05 « Engagements » s’affiche.',
                },
              ],
            },
          ],
        },
        {
          id: 'etape-05-engagements',
          title: 'Étape 05 : Engagements et pièce officielle',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Lisez les cinq **Engagements réciproques** numérotés de 01 à 05.',
                  note: 'Ils portent sur la disponibilité des participants, leur assiduité, l’exactitude des informations transmises, la propriété des contenus pédagogiques et, en retour, les engagements de la FETRAG (instruction de la demande, calendrier, formateur, attestations).',
                },
                {
                  text: 'Cochez la case **Au nom de mon organisation, j’accepte ces engagements.** (obligatoire pour transmettre).',
                  note: 'Vous pouvez passer à l’étape suivante sans cocher, mais la transmission restera impossible tant que la case n’est pas cochée.',
                },
                {
                  text: 'Si vous avez une pièce officielle (lettre de demande signée, liste des participants visée, mandat), joignez-la dans le bloc **Pièce officielle (facultatif)** : voir « Comment joindre une pièce officielle ».',
                },
                {
                  text: 'Cliquez sur `Continuer`.',
                  result: 'L’étape 06 « Récapitulatif » s’affiche.',
                },
              ],
            },
          ],
        },
        {
          id: 'etape-06-recapitulatif',
          title: 'Étape 06 : Récapitulatif et transmission',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Relisez les cinq blocs : 01 **Organisation et personne ressource**, 02 **Modules demandés**, 03 **Participants**, 04 **Préférences**, 05 **Engagements et pièces**.',
                  note: 'Le bloc 03 signale « Sans email : compte non créé automatiquement » pour chaque participant sans adresse. Le bloc 05 affiche « Engagements acceptés » ou « Engagements non acceptés : revenez à l’étape 05 ».',
                },
                {
                  text: 'Pour corriger un point, cliquez sur l’étape concernée dans la frise ou sur `Précédent`.',
                },
                {
                  text: 'Lisez l’encadré **Après transmission** : la coordination accuse réception par email, instruit la demande et vous répond depuis la plateforme.',
                },
                {
                  text: 'Cliquez sur `Transmettre à la coordination`.',
                  where: 'en bas du récapitulatif (sur mobile, c’est le premier des boutons empilés)',
                  result: 'Le message « Demande DF-… transmise à la coordination FETRAG » s’affiche, puis la page de suivi s’ouvre avec le statut « Soumise ». Un email « Demande de formation DF-… bien reçue » arrive à l’adresse de la personne ressource.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Après la transmission, la demande n’est plus modifiable',
              text: 'Une demande « Soumise » ne peut plus être modifiée par vous : ni modules, ni participants, ni préférences. Seule la coordination peut vous la renvoyer en « Complément demandé ». Vous pouvez encore ajouter une pièce jointe depuis la page de suivi, ou annuler la demande. Relisez bien le récapitulatif avant de transmettre.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le bouton `Transmettre à la coordination` reste grisé.',
                  cause: 'Les engagements ne sont pas cochés, ou il manque un module ou un participant.',
                  solution: 'Lisez le bloc 05 du récapitulatif : s’il indique « Engagements non acceptés », revenez à l’étape 05 et cochez la case. Vérifiez aussi les blocs 02 et 03.',
                },
                {
                  problem: 'Le message « Modules indisponibles : … » s’affiche.',
                  cause: 'Un module choisi a été retiré ou dépublié entre-temps.',
                  solution: 'Revenez à l’étape 02, décochez le module signalé, puis transmettez à nouveau.',
                },
                {
                  problem: 'Le message « Votre session a expiré : reconnectez-vous pour continuer. » s’affiche.',
                  cause: 'Vous êtes resté trop longtemps sans activité.',
                  solution: 'Reconnectez-vous, puis rouvrez la demande depuis la carte « Demandes à reprendre » : le dernier brouillon enregistré est conservé.',
                },
                {
                  problem: 'Vous avez saisi deux fois la même personne.',
                  cause: 'Ligne dupliquée ou import répété.',
                  solution: 'Retirez la ligne en double. À la transmission, les participants ayant le même email (ou le même nom et le même téléphone) sont de toute façon fusionnés.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'brouillon-et-reprise',
      title: 'Comment enregistrer un brouillon et le reprendre',
      icon: 'notebook',
      summary: 'S’interrompre à tout moment sans rien perdre, puis reprendre la demande là où vous l’avez laissée.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un brouillon est une demande enregistrée sur la plateforme mais non transmise : la coordination ne la voit pas. Il est créé automatiquement dès que la personne ressource et l’email de l’étape 01 sont valides, puis mis à jour à chaque `Continuer`.',
        },
        {
          type: 'steps',
          title: 'Enregistrer et quitter',
          items: [
            {
              text: 'À n’importe quelle étape, cliquez sur `Enregistrer et quitter`.',
              where: 'en bas de l’assistant, entre `Précédent` et `Continuer`',
              result: 'Le message « Brouillon enregistré » s’affiche et la page de suivi de la demande s’ouvre, avec le statut « Brouillon » et l’alerte « Brouillon non transmis ».',
              note: 'Si la personne ressource ou l’email de l’étape 01 est manquant, l’enregistrement est impossible : complétez d’abord ces deux champs.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Reprendre un brouillon',
          items: [
            {
              text: 'Ouvrez **Demande de formation** dans le menu « Organisation ».',
              result: 'Au-dessus de l’assistant, la carte **Demandes à reprendre** liste vos dix dernières demandes en « Brouillon » ou en « Complément demandé », avec la référence, le nombre de modules et de participants et la date de modification.',
            },
            {
              text: 'Cliquez sur `Reprendre` sur la ligne de la demande.',
              result: 'L’assistant s’ouvre avec l’alerte « Reprise du brouillon DF-… » et tous vos champs préremplis. Le champ **Organisation** est verrouillé.',
              note: 'Le bouton `Suivi` de la même ligne ouvre la page de suivi sans modifier la demande. Sur la page de suivi, le bouton `Compléter la demande` (icône crayon) fait la même chose que `Reprendre`.',
            },
            {
              text: 'Parcourez les étapes avec `Continuer` jusqu’au récapitulatif, puis transmettez ou enregistrez à nouveau.',
              note: 'À chaque enregistrement, la liste des modules et celle des participants sont remplacées intégralement par ce qui est affiché à l’écran.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un brouillon est réversible',
          text: 'Tant que la demande est en « Brouillon », vous pouvez tout changer, y compris la supprimer de vos listes en l’annulant depuis la page de suivi (motif obligatoire). Un brouillon oublié ne gêne personne : il n’est jamais transmis sans votre action.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La carte « Demandes à reprendre » n’apparaît pas.',
              cause: 'Vous êtes déjà en mode reprise (l’adresse contient « ?reprendre= »), ou vous n’avez aucune demande en brouillon ni en attente de complément.',
              solution: 'Cliquez sur **Demande de formation** dans le menu pour revenir à l’assistant vierge, ou retrouvez la demande depuis le tableau de bord.',
            },
            {
              problem: 'Le message « Seuls les brouillons et les demandes en attente de complément sont modifiables » s’affiche.',
              cause: 'La demande a déjà été transmise ou traitée.',
              solution: 'Consultez la page de suivi. Si un changement est indispensable, contactez la coordination ou annulez la demande et déposez-en une nouvelle.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'joindre-une-piece',
      title: 'Comment joindre une pièce officielle',
      icon: 'upload',
      summary: 'Ajouter une lettre signée, une liste visée ou un mandat à la demande, et la retirer si nécessaire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La pièce officielle est facultative. Elle se joint à l’étape 05 de l’assistant. Formats acceptés : PDF, JPEG, PNG, DOC ou DOCX (document Word), 10 Mo au plus par fichier. Les pièces sont stockées de façon privée : seuls vous et la coordination pouvez les ouvrir.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'À l’étape 05, repérez le bloc **Pièce officielle (facultatif)**.',
              where: 'sous les engagements',
              note: 'Si le bouton `Enregistrer le brouillon pour joindre une pièce` est affiché, cliquez dessus d’abord : une pièce ne peut être jointe qu’à un brouillon enregistré.',
            },
            {
              text: 'Saisissez un **Intitulé** (facultatif, 160 caractères au plus), par exemple « Lettre de demande signée ».',
            },
            {
              text: 'Choisissez le **Fichier** (obligatoire) depuis votre appareil.',
              note: 'Sur téléphone, vous pouvez prendre une photo de la lettre : une image JPEG ou PNG est acceptée.',
            },
            {
              text: 'Cliquez sur `Joindre`.',
              result: 'Le bouton affiche « Envoi... » puis le message « Pièce ajoutée à la demande » apparaît. La pièce figure dans la liste avec son nom et sa taille.',
              note: 'Cas particulier : si le brouillon vient d’être créé dans cette même session, la liste peut ne pas se rafraîchir tout de suite. Le message de confirmation fait foi ; la pièce est visible sur la page de suivi ou en rouvrant la demande avec `Reprendre`.',
            },
            {
              text: 'Pour retirer une pièce, cliquez sur `Retirer` à côté de son nom.',
              result: 'Le message « Pièce retirée » s’affiche.',
              note: 'Le retrait n’est possible que tant que la demande est en « Brouillon », « Soumise » ou « Complément demandé ».',
            },
            {
              text: 'Pour consulter une pièce plus tard, ouvrez la page de suivi, section **Pièces jointes**, et cliquez sur `Ouvrir`.',
              result: 'Le fichier s’ouvre dans un nouvel onglet grâce à un lien valable 15 minutes.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Type de fichier non autorisé. » ou « Formats acceptés : PDF, JPEG, PNG, DOC, DOCX » s’affiche.',
              cause: 'Le fichier est d’un autre type (par exemple une feuille de calcul ou une archive).',
              solution: 'Convertissez le document en PDF, ou photographiez-le en JPEG ou PNG.',
            },
            {
              problem: 'Le message « Le fichier dépasse la taille maximale de 10 Mo » s’affiche.',
              cause: 'Le fichier est trop lourd (souvent une photo en très haute résolution).',
              solution: 'Réduisez la taille de l’image ou compressez le PDF avant de le joindre.',
            },
            {
              problem: 'Le message « La demande est close : pièce refusée » s’affiche.',
              cause: 'La demande est « Terminée », « Annulée » ou « Refusée ».',
              solution: 'Aucune pièce ne peut plus être ajoutée ; transmettez le document à la coordination par un autre moyen si nécessaire.',
            },
            {
              problem: 'Le lien `Ouvrir` ne fonctionne plus.',
              cause: 'Le lien d’ouverture expire après 15 minutes.',
              solution: 'Rechargez la page de suivi et cliquez à nouveau sur `Ouvrir`.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'suivre-une-demande',
      title: 'Comment suivre une demande',
      icon: 'eye',
      summary: 'Lire la fiche de suivi : frise d’avancement, statuts, note de la coordination, participants, cohorte planifiée, historique.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chaque demande possède une page de suivi identifiée par sa référence (DF-AAAA-XXXXXX). Vous l’ouvrez depuis le tableau de bord (`Détail`), depuis la carte « Demandes à reprendre » (`Suivi`), ou depuis le lien d’un email ou d’une notification. La fiche est la même dans les deux cas ; ouverte depuis le tableau de bord, elle n’affiche pas les alertes de couleur en tête de page.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche de la demande.',
              where: 'bouton `Détail` dans la section « Demandes de formation » du tableau de bord',
              result: 'La fiche s’ouvre : fil d’Ariane, ruban, description « {n} module(s) pour {n} participant(s) », badge de statut et boutons d’action sous le titre.',
            },
            {
              text: 'Lisez la frise **Avancement de la demande** : Brouillon, Soumise, Acceptée, Planifiée, Formation en cours, Terminée.',
              note: 'Chaque étape franchie est datée. Les pastilles « Événements particuliers » signalent un « Complément demandé » ou une « Autre date proposée ». Une issue « Refusée » ou « Annulée » apparaît en rouge. Sur mobile, la frise est verticale.',
            },
            {
              text: 'Lisez l’alerte en tête de page, s’il y en a une : « La coordination attend un complément », « Une autre date vous est proposée » ou « Brouillon non transmis ».',
              note: 'Ces alertes n’apparaissent que sur la fiche ouverte depuis **Demande de formation** ou depuis un lien de la carte « Demandes à reprendre ».',
            },
            {
              text: 'Consultez la section 01 **Organisation et personne ressource** : contact, personne qui a déposé la demande, date de transmission, dernière mise à jour.',
            },
            {
              text: 'Consultez la section 02 **Modules demandés** : chaque module avec son code et sa durée.',
              note: 'Les mentions « Non publié » ou « Sans version publiée » signalent un module qui n’est plus disponible : la coordination vous le dira si cela pose problème.',
            },
            {
              text: 'Consultez la section 03 **Participants** : nom, email, téléphone, fonction et colonne **Compte**.',
              note: 'La colonne **Compte** indique « À créer » (email inconnu : un compte sera créé à la planification), « Compte existant » (la personne a déjà un compte FETRAG) ou « Inscrit » (inscription faite après planification). Un participant « Sans email » ne sera ni créé ni inscrit.',
            },
            {
              text: 'Consultez la section 04 **Préférences et réponse de la coordination** : date et modalité souhaitées, engagements, puis **Date proposée par la coordination**, **Modalité proposée**, **Décision du** et l’encadré or **Note de la coordination**.',
            },
            {
              text: 'Consultez la section 05 **Cohorte planifiée** (présente après la planification) : nom, code, statut, début, fin, nombre de membres et de sessions.',
              note: 'Seule la cohorte du premier module est liée à la demande. Les autres cohortes (un module = une cohorte) apparaissent sur le tableau de bord et dans les rapports.',
            },
            {
              text: 'Consultez **Pièces jointes** et **Historique des décisions** en bas de la fiche.',
              note: 'L’historique donne, pour chaque changement de statut, la date, l’auteur (ou « Système ») et le commentaire.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Les statuts d’une demande',
          items: [
            { label: 'Brouillon', tone: 'neutral', meaning: 'Enregistrée mais non transmise. La coordination ne la voit pas.', next: 'Reprenez-la avec `Compléter la demande`, puis transmettez-la. Vous pouvez aussi l’annuler.' },
            { label: 'Soumise', tone: 'info', meaning: 'Transmise à la coordination, en cours d’instruction. Plus modifiable.', next: 'Attendez la réponse (l’accusé de réception annonce un délai indicatif de quelques jours ouvrés). Vous pouvez encore ajouter une pièce ou annuler.' },
            { label: 'Complément demandé', tone: 'warning', meaning: 'La coordination attend des précisions ; sa note est affichée.', next: 'Cliquez sur `Compléter la demande`, corrigez, puis transmettez à nouveau.' },
            { label: 'Autre date proposée', tone: 'warning', meaning: 'La coordination propose une autre date ou modalité.', next: 'Cliquez sur `Accepter la proposition` pour qu’elle planifie, ou annulez la demande.' },
            { label: 'Acceptée', tone: 'success', meaning: 'Demande validée, en attente de planification par la coordination.', next: 'Rien à faire. Vous pouvez encore annuler.' },
            { label: 'Refusée', tone: 'danger', meaning: 'La coordination n’a pas donné suite. Le motif est dans l’historique et dans l’email.', next: 'Définitif. Déposez une nouvelle demande si nécessaire.' },
            { label: 'Planifiée', tone: 'success', meaning: 'Cohorte(s) créée(s), comptes des participants créés, inscriptions réalisées.', next: 'Vérifiez vos participants. Une annulation reste possible mais annule aussi la cohorte.' },
            { label: 'Formation en cours', tone: 'success', meaning: 'La cohorte a démarré.', next: 'Suivez la progression dans **Participants** et **Rapports**. Plus d’annulation possible.' },
            { label: 'Terminée', tone: 'neutral', meaning: 'La cohorte est clôturée ; les attestations ont été délivrées aux participants qui remplissent les critères.', next: 'Définitif. Téléchargez les rapports.' },
            { label: 'Annulée', tone: 'danger', meaning: 'Close par vous ou par la coordination, avec un motif.', next: 'Définitif. Déposez une nouvelle demande si nécessaire.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La page « Demande introuvable » s’affiche.',
              cause: 'La demande appartient à une autre organisation que l’organisation active, ou le lien est erroné.',
              solution: 'Cliquez sur `Retour à mes demandes`, changez d’organisation active si vous en pilotez plusieurs, puis rouvrez la demande.',
            },
            {
              problem: 'Le statut n’a pas changé depuis plusieurs jours.',
              cause: 'La demande est toujours en instruction.',
              solution: 'Vérifiez l’historique et votre boîte email (y compris les courriers indésirables). Au-delà du délai annoncé, contactez la coordination en indiquant la référence DF-….',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'repondre-a-un-complement',
      title: 'Comment répondre à un complément d’information',
      icon: 'refresh',
      summary: 'La coordination a besoin de précisions : corriger la demande et la transmettre à nouveau.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Quand la coordination passe votre demande en « Complément demandé », vous recevez l’email « Demande DF-… : complément d’information attendu » et une notification « Complément demandé ». La demande redevient modifiable, comme un brouillon.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche de la demande.',
              where: 'bouton `Compléter ma demande` de l’email, ou bouton `Suivi` de la carte « Demandes à reprendre »',
              result: 'L’alerte orange « La coordination attend un complément » affiche la note de la coordination.',
            },
            {
              text: 'Lisez attentivement la note : elle indique ce qui manque (participants, pièce, précision sur les attentes…).',
            },
            {
              text: 'Cliquez sur `Compléter la demande` (icône crayon).',
              where: 'sous le titre de la fiche',
              result: 'L’assistant s’ouvre avec l’alerte « Complément demandé sur la demande DF-… » et « Message de la coordination : « … » ».',
            },
            {
              text: 'Parcourez les étapes avec `Continuer` et corrigez ce qui est demandé : modules, participants, préférences, pièces.',
              note: 'Le champ **Organisation** est verrouillé. Cliquez directement sur une étape validée dans la frise pour y aller plus vite.',
            },
            {
              text: 'Au récapitulatif, cliquez sur `Transmettre à la coordination`.',
              result: 'La demande repasse en « Soumise ». Vous recevez un nouvel accusé de réception et la coordination est prévenue.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Si la note demande un document',
          text: 'Joignez la pièce à l’étape 05 (voir « Comment joindre une pièce officielle »), puis allez jusqu’au récapitulatif et transmettez : joindre une pièce ne suffit pas à changer le statut.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le bouton `Compléter la demande` n’apparaît pas.',
              cause: 'La demande n’est pas en « Brouillon » ni en « Complément demandé », ou vous consultez une organisation pour laquelle vous n’êtes pas gestionnaire.',
              solution: 'Vérifiez le badge de statut et l’organisation active.',
            },
            {
              problem: 'Vous ne comprenez pas ce que la coordination attend.',
              cause: 'La note est trop courte ou ambiguë.',
              solution: 'Contactez la coordination (section « Besoin d’aide ») en citant la référence DF-… avant de retransmettre.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'repondre-a-une-proposition-de-date',
      title: 'Comment répondre à une autre date proposée',
      icon: 'calendar',
      summary: 'La coordination propose un autre calendrier ou une autre modalité : accepter, ou annuler.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Quand la coordination ne peut pas retenir la date ou la modalité souhaitées, elle passe la demande en « Autre date proposée ». Vous recevez la notification « Nouvelle date proposée » et un email de même sujet. Il n’existe pas de bouton pour refuser la proposition : vous l’acceptez, ou vous annulez la demande, ou vous contactez la coordination.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche de la demande.',
              where: 'bouton `Voir le détail` de l’email, ou `Détail` sur le tableau de bord',
              result: 'L’alerte bleue « Une autre date vous est proposée » s’affiche (fiche ouverte depuis **Demande de formation**).',
            },
            {
              text: 'Lisez la section 04 : **Date proposée par la coordination**, **Modalité proposée** et **Note de la coordination**.',
            },
            {
              text: 'Vérifiez avec vos participants que la nouvelle date leur convient.',
            },
            {
              text: 'Cliquez sur `Accepter la proposition` (icône calendrier).',
              where: 'sous le titre de la fiche',
              result: 'La boîte « Accepter la date proposée » explique que la demande sera transmise à nouveau avec le calendrier proposé.',
            },
            {
              text: 'Cliquez sur `Transmettre` dans la boîte.',
              result: 'Le message « Demande DF-… transmise à nouveau à la coordination » s’affiche ; le statut redevient « Soumise ». La coordination peut alors accepter puis planifier.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Si la date proposée ne convient pas',
          text: 'Ne cliquez pas sur `Accepter la proposition`. Contactez la coordination pour discuter d’un autre calendrier, ou annulez la demande (action définitive) et déposez-en une nouvelle avec vos contraintes dans **Motivation et attentes**.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le bouton `Accepter la proposition` n’apparaît pas.',
              cause: 'Seule la personne qui a déposé la demande voit ce bouton ; un autre gestionnaire de la même organisation ne le voit pas.',
              solution: 'Demandez à la personne qui a transmis la demande d’accepter, ou contactez la coordination.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'annuler-une-demande',
      title: 'Comment annuler une demande',
      icon: 'x-circle',
      summary: 'Clore définitivement une demande, avec un motif.',
      blocks: [
        {
          type: 'callout',
          tone: 'danger',
          title: 'Action définitive',
          text: 'Une demande annulée ne peut pas être rouverte. Si une cohorte « Planifiée » ou « Inscriptions ouvertes » lui est liée, elle est annulée elle aussi. Pour continuer ensuite, il faudra déposer une nouvelle demande.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la fiche de la demande.',
              result: 'Le bouton `Annuler` (icône croix) apparaît sous le titre si l’annulation est possible.',
              note: 'L’annulation est possible en « Brouillon », « Soumise », « Complément demandé », « Autre date proposée », « Acceptée » et « Planifiée ». Elle est impossible en « Formation en cours », « Terminée », « Refusée » et « Annulée ».',
            },
            {
              text: 'Cliquez sur `Annuler`.',
              result: 'La boîte « Annuler la demande » s’ouvre : « Cette action est définitive : la demande sera close et la coordination informée. »',
            },
            {
              text: 'Saisissez le **Motif** (obligatoire, 3 à 1000 caractères), par exemple « Report du projet » ou « Participants indisponibles ».',
            },
            {
              text: 'Cliquez sur le bouton rouge `Annuler la demande`.',
              result: 'Le message « Demande annulée » s’affiche ; le badge passe en « Annulée » et la décision, avec votre motif, figure dans l’historique.',
              note: 'Pour renoncer, cliquez sur `Annuler` (le bouton gris de la boîte) : rien n’est modifié.',
            },
            {
              text: 'Prévenez la coordination par email ou téléphone si la demande était déjà acceptée ou planifiée.',
              note: 'L’annulation faite depuis votre espace n’envoie pas d’email à la coordination : un mot de votre part évite qu’un formateur ne se déplace pour rien.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Indiquez un motif (3 caractères au moins). » s’affiche.',
              cause: 'Le champ **Motif** est vide ou trop court.',
              solution: 'Écrivez une phrase courte expliquant l’annulation.',
            },
            {
              problem: 'Le bouton `Annuler` n’apparaît pas.',
              cause: 'La demande est dans un statut qui n’autorise plus l’annulation, ou vous n’êtes pas la personne qui l’a déposée.',
              solution: 'Pour une demande « Formation en cours », contactez la coordination. Pour une demande déposée par un autre gestionnaire, demandez-lui d’annuler.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'apres-acceptation',
      title: 'Ce qui se passe après l’acceptation : planification et comptes des participants',
      icon: 'users-round',
      summary: 'Comprendre ce que fait la coordination une fois la demande acceptée, et ce que reçoivent vos participants.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous n’avez rien à faire sur la plateforme entre l’acceptation et la planification : la coordination s’en charge. Cette section décrit ce qu’il se passe pour que vous puissiez informer vos membres.',
        },
        {
          type: 'steps',
          title: 'Le déroulement',
          items: [
            {
              text: 'La coordination accepte la demande.',
              result: 'Statut « Acceptée ». Vous recevez la notification « Demande acceptée » et l’email « Demande DF-… acceptée » avec la date, la modalité et le commentaire éventuel.',
            },
            {
              text: 'La coordination planifie la formation.',
              result: 'Statut « Planifiée ». Une cohorte privée est créée pour chaque module retenu (nom « {sigle} - {module} », code généré, date de début). Chaque participant ayant un email est inscrit.',
            },
            {
              text: 'Les comptes des participants sont créés automatiquement.',
              note: 'Pour chaque participant dont l’email est inconnu, un compte est créé (nom, fonction, organisation). La personne reçoit l’email « Votre compte de formation FETRAG est prêt : définissez votre mot de passe » avec un bouton `Définir mon mot de passe`, valable 7 jours. Aucun mot de passe ne circule par email.',
            },
            {
              text: 'Les participants qui avaient déjà un compte reçoivent la notification et l’email « Inscription à une formation ».',
            },
            {
              text: 'Vous recevez la notification « Formation planifiée » et l’email « Formation planifiée : … » à l’adresse de la personne ressource.',
              result: 'L’email récapitule la ou les cohortes, le début, la modalité et le nombre de participants inscrits ; le bouton `Voir la cohorte` ouvre la page de suivi.',
            },
            {
              text: 'Vérifiez sur le tableau de bord la section **Cohortes de l’organisation** et, dans **Participants**, la présence de tous vos membres.',
              result: 'Chaque participant inscrit apparaît avec le module et le statut d’inscription « Actif ».',
            },
            {
              text: 'Prévenez vos membres : ils doivent ouvrir l’email d’invitation dans les 7 jours et définir leur mot de passe.',
              note: 'Passé ce délai, le lien expire : la personne utilise alors **Mot de passe oublié ?** sur la page de connexion pour recevoir un nouveau lien.',
            },
            {
              text: 'Lorsque la coordination démarre la cohorte, la demande passe en « Formation en cours » ; lorsqu’elle la clôture, en « Terminée ».',
              note: 'Aucun email ne vous est envoyé pour ces deux passages : consultez le tableau de bord. Les convocations aux séances sont adressées aux participants, pas à vous ; vous voyez seulement les **Prochaines sessions**.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Participants sans adresse email',
          text: 'Un participant sans email est ignoré à la planification : ni compte, ni inscription. Il n’existe pas de remise d’identifiants par votre intermédiaire. Si un membre n’a pas d’adresse, aidez-le à en créer une avant la transmission, ou signalez son adresse à la coordination avant la planification.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Un participant n’a pas reçu l’email d’invitation.',
              cause: 'Adresse mal saisie dans la demande, email arrivé dans les courriers indésirables, ou participant sans email.',
              solution: 'Vérifiez l’adresse dans la section **Participants** de la fiche. Si elle est correcte, la personne peut utiliser **Mot de passe oublié ?** avec cette adresse. Sinon, contactez la coordination pour corriger l’adresse : vous ne pouvez pas renvoyer l’invitation vous-même.',
            },
            {
              problem: 'Un participant doit être remplacé après la planification.',
              cause: 'Les listes de cohortes sont gérées par la coordination.',
              solution: 'Contactez la coordination en indiquant la référence DF-…, la personne à retirer et la personne à ajouter (nom, email, fonction).',
            },
            {
              problem: 'La section « Cohorte planifiée » ne montre qu’une cohorte alors que plusieurs modules étaient demandés.',
              cause: 'Seule la cohorte du premier module est liée à la fiche de demande.',
              solution: 'Consultez la section **Cohortes de l’organisation** du tableau de bord ou le **Rapport par cohorte** : toutes les cohortes y figurent.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'suivre-les-participants',
      title: 'Comment suivre vos participants',
      icon: 'users',
      summary: 'La liste des membres de votre organisation en formation, leur progression et l’export CSV.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La rubrique **Participants** liste tous les membres rattachés à votre organisation avec leurs inscriptions. Elle est en lecture seule : vous ne pouvez ni ajouter, ni retirer, ni inviter quelqu’un depuis cet écran.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Cliquez sur **Participants** dans le menu « Organisation ».',
              where: 'barre latérale ; sur mobile, bouton **Ouvrir le menu** de la barre secondaire',
              result: 'La page « {n} membre(s) en formation » s’ouvre avec un tableau. Les gestionnaires apparaissent en tête de liste.',
            },
            {
              text: 'Lisez la colonne **Membre** : initiales, nom, email, et les badges éventuels **Gestionnaire** (or) ou **Inactif** (rouge, compte désactivé).',
            },
            {
              text: 'Lisez la colonne **Inscriptions et progression** : pour chaque inscription, le titre du module, un badge de statut et une barre de progression avec le pourcentage.',
              note: '« Aucune inscription » signifie que le membre est rattaché à l’organisation mais n’est inscrit à aucun module.',
            },
            {
              text: 'Lisez les colonnes **Certificats** (nombre d’attestations obtenues) et **Dernière activité** (date de la dernière action du participant sur la plateforme).',
              note: 'Sur mobile, faites défiler le tableau vers la droite pour voir ces colonnes.',
            },
            {
              text: 'Pour télécharger la liste, cliquez sur `Export CSV`.',
              where: 'en haut à droite de la page (icône téléchargement)',
              result: 'Un fichier « participants-AAAA-MM-JJ.csv » est téléchargé : une ligne par inscription avec nom, email, fonction, cours, cohorte, statut, progression, score, date de fin, certificat et dernière activité.',
              note: 'Le fichier CSV s’ouvre dans un tableur. Chaque export est enregistré dans le journal de la plateforme.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’inscription',
          items: [
            { label: 'Actif', tone: 'success', meaning: 'Le participant est inscrit et peut suivre le module.' },
            { label: 'Terminé', tone: 'neutral', meaning: 'Le participant a achevé le module.' },
            { label: 'En attente', tone: 'info', meaning: 'Inscription enregistrée mais pas encore active.' },
            { label: 'Suspendue', tone: 'warning', meaning: 'Inscription suspendue par la coordination.' },
            { label: 'Expirée', tone: 'neutral', meaning: 'La période d’accès au module est dépassée.' },
            { label: 'Annulé', tone: 'danger', meaning: 'Inscription annulée.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Ce que vous ne voyez pas',
          text: 'Il n’y a pas de fiche individuelle par participant, ni de filtre ou de recherche sur cette page. Vous ne voyez pas les réponses aux évaluations, les devoirs, les forums ni les présences séance par séance. Le score et l’assiduité par participant sont disponibles, sous forme de pourcentages, dans le **Rapport par cohorte**.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La page affiche « Aucun membre rattaché ».',
              cause: 'Aucune demande n’a encore été planifiée pour cette organisation, ou l’organisation active n’est pas la bonne.',
              solution: 'Vérifiez le sélecteur **Organisation active** et le statut de vos demandes.',
            },
            {
              problem: 'Un participant inscrit n’apparaît pas.',
              cause: 'Il n’avait pas d’email dans la demande (donc ni compte ni inscription), ou il a été inscrit sous une autre organisation.',
              solution: 'Contactez la coordination avec la référence DF-… et le nom de la personne.',
            },
            {
              problem: 'L’export échoue avec « Export impossible ».',
              cause: 'Erreur momentanée du serveur.',
              solution: 'Réessayez dans quelques instants. Si le problème persiste, écrivez au support avec l’heure de l’essai.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'consulter-les-rapports',
      title: 'Comment consulter et exporter les rapports',
      icon: 'bar-chart',
      summary: 'Le bilan de formation de votre organisation : indicateurs, rapport par module, rapport par cohorte, exports CSV et PDF.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La rubrique **Rapports** présente le « Bilan de formation » de l’organisation active : inscriptions, progression, scores et attestations, module par module et cohorte par cohorte. Les fichiers exportés contiennent des données personnelles de vos membres : réservez-les à l’usage interne de l’organisation.',
        },
      ],
      subsections: [
        {
          id: 'rapport-d-organisation',
          title: 'Le rapport d’organisation',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur **Rapports** dans le menu « Organisation ».',
                  where: 'barre latérale ; sur mobile, bouton **Ouvrir le menu**',
                  result: 'La page « Bilan de formation de {organisation} » s’ouvre avec le ruban or « Rapports ».',
                },
                {
                  text: 'Lisez les quatre tuiles : **Participants distincts**, **Inscriptions** (dont terminées), **Attestations et certificats**, **Heures de formation cumulées**.',
                },
                {
                  text: 'Lisez la carte **Progression globale** (anneaux **Progression moyenne** et **Score moyen**) et la carte **Demandes de formation par statut**.',
                },
                {
                  text: 'Consultez la section 01 **Rapport par module** : pour chaque module, **Inscrits**, **Terminés**, **Achèvement**, **Progression**, **Score moyen** et **Certificats**.',
                  note: 'Sur mobile, le tableau défile vers la droite. « - » signifie qu’aucune donnée n’est disponible.',
                },
                {
                  text: 'Pour exporter, cliquez sur `CSV` ou `PDF` en haut à droite de la page.',
                  result: 'Le fichier « rapport-organisation-AAAA-MM-JJ.csv » (une ligne par module) ou « rapport-organisation-AAAA-MM-JJ.pdf » (sections 01 Indicateurs, 02 Par module, 03 Cohortes) est téléchargé.',
                },
              ],
            },
          ],
        },
        {
          id: 'rapport-de-cohorte',
          title: 'Le rapport par cohorte (assiduité et résultats)',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Descendez jusqu’à la section 02 **Rapport par cohorte**.',
                  result: 'Les cohortes de l’organisation apparaissent sous forme de pastilles avec leur nom et leur statut. La première est sélectionnée par défaut.',
                },
                {
                  text: 'Cliquez sur la pastille de la cohorte souhaitée.',
                  result: 'Les tuiles **Membres**, **Achèvement**, **Assiduité moyenne** et **Certificats** se mettent à jour, ainsi que la ligne « {module} · du {date} au {date} · formateur : {nom} ».',
                  note: '**Assiduité moyenne** affiche « - » tant qu’aucune séance n’a eu lieu.',
                },
                {
                  text: 'Lisez le tableau des participants : **Statut**, **Progression**, **Score**, **Assiduité** et **Certificat** (numéro de l’attestation, ou « - »).',
                },
                {
                  text: 'Pour exporter cette cohorte, cliquez sur `CSV` ou `PDF` à côté des pastilles.',
                  result: 'Le fichier « rapport-cohorte-AAAA-MM-JJ.csv » ou « rapport-cohorte-{code}-AAAA-MM-JJ.pdf » est téléchargé. Le PDF ajoute le détail des sessions : présents, retards, absents, excusés.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Rapport disponible à tout moment',
              text: 'Le rapport de cohorte est consultable dès la planification, quel que soit le statut de la cohorte. Pendant la formation, il vous permet de repérer les participants en retard ou absents et de les relancer. Il n’existe pas de filtre par période.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'La section affiche « Aucune cohorte ».',
                  cause: 'Aucune demande n’a encore été planifiée pour l’organisation active.',
                  solution: 'Les rapports de cohorte apparaîtront dès la planification d’une demande acceptée.',
                },
                {
                  problem: 'L’export répond « Cohorte introuvable pour cette organisation » ou « Accès au rapport refusé ».',
                  cause: 'La cohorte appartient à une autre organisation, ou votre accès aux rapports a été retiré.',
                  solution: 'Vérifiez l’organisation active. Si le problème persiste, contactez la coordination.',
                },
                {
                  problem: 'Le fichier téléchargé s’affiche mal dans le tableur.',
                  cause: 'Le CSV est encodé en UTF-8 (accents) avec des virgules comme séparateur.',
                  solution: 'Dans votre tableur, utilisez l’import de fichier texte en précisant l’encodage UTF-8, ou ouvrez le PDF.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'limites-et-passerelle',
      title: 'Ce que l’espace ne fait pas : paiement, prise en charge, données individuelles',
      icon: 'ban',
      summary: 'Les limites de votre espace et vers qui se tourner pour le reste.',
      blocks: [
        {
          type: 'list',
          style: 'bullet',
          items: [
            '**Paiement et prise en charge** : l’espace « Organisation » ne permet ni de payer une formation ni de demander une prise en charge. Les formations institutionnelles issues d’une demande sont organisées avec la Fédération en dehors de la plateforme. Une prise en charge éventuelle est enregistrée par la Fédération elle-même ; les reçus des paiements individuels se trouvent dans l’espace personnel de la personne qui a payé, sur le site institutionnel.',
            '**Données pédagogiques individuelles** : vous ne voyez pas les réponses aux évaluations, les devoirs, les forums, ni les présences séance par séance. Ces données restent entre le participant, le formateur et la coordination. Vous disposez de pourcentages (progression, score, assiduité) et du nombre d’attestations.',
            '**Liste des attestations** : il n’y a pas de liste des attestations avec lien de vérification dans votre espace. Le numéro figure dans le rapport de cohorte ; chaque participant télécharge sa propre attestation depuis son compte, et toute personne peut la vérifier sur le site institutionnel avec **Vérifier un certificat**.',
            '**Gestion des membres** : rattacher un compte à l’organisation, désigner un second gestionnaire, remplacer un participant dans une cohorte : ces actions sont réservées à la coordination. Adressez-lui votre demande avec les informations complètes.',
            '**Notifications** : il n’y a pas de cloche dans l’espace « Organisation ». Les notifications se lisent sur le tableau de bord apprenant et sur le site institutionnel (voir la section « Notifications et emails »).',
          ],
        },
        {
          type: 'links',
          title: 'Passerelles utiles',
          items: [
            { label: 'Vérifier un certificat', href: '{{web}}/certificats/verifier', description: 'Vérification publique d’une attestation par son numéro, sur le site institutionnel.', external: true, icon: 'badge-check' },
            { label: 'Mes notifications sur le site', href: '{{web}}/espace/notifications', description: 'Toutes les notifications de votre compte.', external: true, icon: 'bell' },
            { label: 'Catalogue des formations', href: '/catalogue', description: 'Les modules du programme 2026, avec le bouton `Demande pour une organisation`.', icon: 'book-open' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Ce que la plateforme vous envoie, à quel moment, et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les emails du suivi d’une demande sont envoyés à l’adresse de la **Personne ressource** indiquée à l’étape 01. Les notifications internes sont adressées au compte qui a déposé la demande : elles apparaissent dans le bloc **Notifications** de votre tableau de bord apprenant (les six plus récentes) et sur la page Notifications de votre espace sur le site institutionnel.',
        },
        {
          type: 'table',
          caption: 'Emails et notifications liés à vos demandes',
          columns: ['Sujet', 'Quand', 'Ce qu’il faut faire'],
          rows: [
            ['Email « Demande de formation DF-… bien reçue » + notification « Demande transmise »', 'À chaque transmission ou retransmission de la demande.', 'Rien. Conservez l’email : le bouton `Suivre ma demande` ouvre la fiche de suivi.'],
            ['Email « Demande DF-… : complément d’information attendu » + notification « Complément demandé »', 'La coordination attend des précisions.', 'Cliquez sur `Compléter ma demande`, corrigez, puis transmettez à nouveau.'],
            ['Email « Demande DF-… acceptée » + notification « Demande acceptée »', 'La coordination valide la demande.', 'Rien. Informez vos participants que la planification arrive.'],
            ['Email « Demande DF-… : réponse de la coordination » + notification « Demande refusée »', 'La coordination refuse la demande (motif inclus).', 'Lisez le motif avec `Consulter la décision`. Déposez une nouvelle demande si possible.'],
            ['Email « Nouvelle date proposée - demande DF-… » + notification « Nouvelle date proposée »', 'La coordination propose une autre date ou modalité.', 'Ouvrez `Voir le détail`, puis `Accepter la proposition` ou contactez la coordination.'],
            ['Email « Formation planifiée : … » + notification « Formation planifiée »', 'Cohortes créées, comptes et inscriptions réalisés.', 'Vérifiez vos participants ; prévenez-les de l’email d’invitation (lien valable 7 jours).'],
            ['Notification et email « Demande annulée »', 'Seulement si la coordination annule votre demande (motif inclus).', 'Lisez le motif. Contactez la coordination pour une nouvelle demande.'],
          ],
        },
        {
          type: 'table',
          caption: 'Ce que reçoivent vos participants',
          columns: ['Sujet', 'Destinataire', 'À leur expliquer'],
          rows: [
            ['Email « Votre compte de formation FETRAG est prêt : définissez votre mot de passe »', 'Participant sans compte (email inconnu).', 'Cliquer sur `Définir mon mot de passe` dans les 7 jours ; choisir un mot de passe de 8 caractères au moins, avec une majuscule et un chiffre.'],
            ['Notification et email « Inscription à une formation »', 'Participant ayant déjà un compte.', 'Se connecter et ouvrir **Mes formations**.'],
            ['Convocations aux séances', 'Participants inscrits, lors de la création des sessions par la coordination.', 'Consulter **Calendrier** sur leur compte. Vous ne recevez pas ces convocations : vous voyez les **Prochaines sessions** sur le tableau de bord.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Aucun email pour le démarrage et la fin',
          text: 'Le passage en « Formation en cours » et en « Terminée » ne déclenche aucun email vers l’organisation. Consultez régulièrement le tableau de bord et les rapports pendant la formation.',
        },
        {
          type: 'steps',
          title: 'Lire vos notifications',
          items: [
            {
              text: 'Cliquez sur **Mon espace apprenant** en bas de la barre latérale (ou **Tableau de bord** dans le menu du compte).',
              result: 'Votre tableau de bord apprenant s’ouvre ; le bloc **Notifications** affiche les six plus récentes.',
            },
            {
              text: 'Cliquez sur une notification.',
              result: 'La fiche de suivi de la demande concernée s’ouvre.',
            },
            {
              text: 'Pour l’historique complet, ouvrez la page Notifications de votre espace sur le site institutionnel ({{web}}/espace/notifications).',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Vous ne recevez aucun email.',
              cause: 'L’adresse de la personne ressource est erronée, ou les emails arrivent dans les courriers indésirables.',
              solution: 'Vérifiez l’adresse dans la section 01 de la fiche de suivi et le dossier des indésirables. Ajoutez l’expéditeur à vos contacts. Les notifications internes restent consultables sur la plateforme.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield-check',
      summary: 'Protéger votre compte et les données de vos membres, et faciliter le travail de la coordination.',
      blocks: [
        {
          type: 'list',
          style: 'check',
          items: [
            'Déconnectez-vous après chaque utilisation sur un appareil partagé (menu du compte, **Déconnexion**).',
            'Activez la vérification en deux étapes dans **Sécurité du compte** sur le site institutionnel : votre espace contient les coordonnées de vos membres.',
            'Ne partagez jamais votre mot de passe. Si un second responsable doit accéder à l’espace, demandez à la coordination de le désigner gestionnaire à son tour.',
            'Prévenez la coordination en cas de changement de responsable, pour que l’ancien accès soit retiré.',
            'Collectez les données des participants avec leur accord : nom, email, téléphone et fonction servent uniquement à créer leur compte et à les inscrire.',
            'Vérifiez chaque adresse email avant de transmettre : une adresse erronée prive la personne de son compte et de sa formation.',
            'Conservez les exports CSV et PDF dans un espace sécurisé de l’organisation ; ne les diffusez pas en dehors de l’usage interne.',
            'Utilisez le champ **Motivation et attentes** pour expliquer vos contraintes (dates, lieu, connexion Internet des participants) : la coordination planifiera mieux.',
            'Relisez le récapitulatif avant `Transmettre à la coordination` : après transmission, seule la coordination peut rouvrir la demande.',
            'Répondez rapidement aux compléments d’information et aux propositions de date : la demande reste bloquée tant que vous n’avez pas agi.',
            'Informez vos participants dès la planification : le lien pour définir le mot de passe expire au bout de 7 jours.',
            'Restez courtois et précis dans vos messages à la coordination : indiquez toujours la référence DF-… de la demande.',
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
              question: 'Puis-je déposer une demande pour plusieurs modules à la fois ?',
              answer: 'Oui. Cochez plusieurs cartes à l’étape 02. À la planification, la coordination crée une cohorte par module, et tous les participants de la demande y sont inscrits.',
            },
            {
              question: 'Combien de participants puis-je désigner par demande ?',
              answer: 'La limite est affichée à l’étape 03 (badge « {n} / {limite} », 10 par défaut). Au-delà, déposez une seconde demande pour les personnes restantes.',
            },
            {
              question: 'Que se passe-t-il si un participant n’a pas d’adresse email ?',
              answer: 'Il est ignoré à la planification : aucun compte n’est créé et il n’est pas inscrit. Aidez-le à créer une adresse email avant de transmettre, ou communiquez son adresse à la coordination avant la planification.',
            },
            {
              question: 'Puis-je modifier une demande après l’avoir transmise ?',
              answer: 'Non. Seuls les statuts « Brouillon » et « Complément demandé » sont modifiables. Vous pouvez encore ajouter une pièce jointe depuis la fiche de suivi, ou annuler la demande. Pour un changement de participant, contactez la coordination.',
            },
            {
              question: 'Comment ajouter un participant après la planification ?',
              answer: 'Vous ne pouvez pas le faire vous-même. Écrivez à la coordination avec la référence DF-… et les informations de la personne (nom, email, fonction).',
            },
            {
              question: 'Puis-je refuser la date proposée par la coordination ?',
              answer: 'Il n’y a pas de bouton de refus. Contactez la coordination pour convenir d’une autre date, ou annulez la demande (action définitive) et déposez-en une nouvelle.',
            },
            {
              question: 'Quel est le délai de réponse de la coordination ?',
              answer: 'L’accusé de réception indique un délai indicatif de quelques jours ouvrés ; les engagements de l’assistant mentionnent dix jours ouvrés. Au-delà, contactez la coordination avec la référence de la demande.',
            },
            {
              question: 'Puis-je voir les notes d’un participant ?',
              answer: 'Vous voyez son score (pourcentage) et son assiduité dans le rapport de cohorte, ainsi que sa progression dans **Participants**. Vous ne voyez pas ses réponses, ses devoirs ni ses messages de forum.',
            },
            {
              question: 'Où sont les attestations de mes participants ?',
              answer: 'Chaque participant télécharge son attestation depuis son propre compte (rubrique **Certificats**). Votre espace affiche le nombre d’attestations et leur numéro dans le rapport de cohorte. Une attestation se vérifie sur le site institutionnel avec **Vérifier un certificat**.',
            },
            {
              question: 'Comment demander une prise en charge financière ?',
              answer: 'Pas depuis la plateforme. Les prises en charge sont enregistrées par la Fédération : adressez-vous à la coordination ou au secrétariat général.',
            },
            {
              question: 'Je pilote plusieurs organisations : comment passer de l’une à l’autre ?',
              answer: 'Utilisez le sélecteur **Organisation active** dans l’en-tête des pages de l’espace. La page se recharge et votre choix est mémorisé 30 jours.',
            },
            {
              question: 'Un autre responsable de mon organisation peut-il suivre ma demande ?',
              answer: 'Oui, s’il est désigné gestionnaire : il voit la fiche et peut compléter un brouillon ou un complément. En revanche, seule la personne qui a transmis la demande voit les boutons `Accepter la proposition` et `Annuler` une fois la demande soumise.',
            },
            {
              question: 'Puis-je supprimer un brouillon ?',
              answer: 'Il n’y a pas de bouton de suppression. Annulez le brouillon depuis sa fiche de suivi (`Annuler`, motif obligatoire) : il passe en « Annulée » et disparaît de la carte « Demandes à reprendre ».',
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
            { term: 'Espace « Organisation »', definition: 'La partie de la plateforme réservée aux responsables d’organisation : tableau de bord, demande de formation, participants, rapports.' },
            { term: 'Organisation active', definition: 'L’organisation dont les données sont affichées, quand votre compte en pilote plusieurs. Se change avec le sélecteur du même nom.' },
            { term: 'Gestionnaire', definition: 'Personne désignée par la coordination comme responsable d’une organisation sur la plateforme. Seul un gestionnaire peut déposer une demande pour l’organisation.' },
            { term: 'Demande de formation institutionnelle', definition: 'Demande déposée par une organisation affiliée pour former plusieurs de ses membres à un ou plusieurs modules du programme. Identifiée par une référence DF-AAAA-XXXXXX.' },
            { term: 'Assistant', definition: 'Le formulaire en six étapes qui guide le dépôt d’une demande (« Former vos leaders syndicaux »).' },
            { term: 'Brouillon', definition: 'Demande enregistrée mais non transmise. Modifiable à volonté ; invisible pour la coordination.' },
            { term: 'Personne ressource', definition: 'Interlocuteur de la coordination pour une demande. Les emails de suivi sont envoyés à son adresse.' },
            { term: 'Module', definition: 'Un cours du programme de formation (par exemple l’un des dix modules du programme 2026), avec un numéro, un pilier et une durée en heures.' },
            { term: 'Cohorte', definition: 'Groupe de participants qui suivent ensemble un module, avec un calendrier et un formateur. La coordination crée une cohorte par module retenu dans votre demande.' },
            { term: 'Session (ou séance)', definition: 'Un rendez-vous de formation d’une cohorte, daté, en présentiel ou en classe virtuelle. Les convocations sont envoyées aux participants.' },
            { term: 'Modalité', definition: 'Forme de la formation : **Présentiel** (sur place), **Classe virtuelle** (à distance, en ligne) ou **Hybride** (mélange des deux).' },
            { term: 'Complément demandé', definition: 'Statut d’une demande que la coordination vous renvoie pour obtenir des précisions. La demande redevient modifiable.' },
            { term: 'Autre date proposée', definition: 'Statut d’une demande pour laquelle la coordination propose un autre calendrier ou une autre modalité, à accepter depuis la fiche de suivi.' },
            { term: 'Planification', definition: 'Étape où la coordination crée les cohortes, les comptes des participants et leurs inscriptions. La demande passe en « Planifiée ».' },
            { term: 'Inscription', definition: 'Le lien entre un participant et un module. Chaque inscription a un statut (Actif, Terminé, En attente, Suspendue, Expirée, Annulé) et une progression.' },
            { term: 'Progression', definition: 'Pourcentage du module déjà parcouru par un participant. Le tableau de bord en affiche la moyenne.' },
            { term: 'Taux d’achèvement', definition: 'Part des inscriptions terminées parmi toutes les inscriptions.' },
            { term: 'Assiduité', definition: 'Pourcentage de présence d’un participant aux séances passées de sa cohorte.' },
            { term: 'Attestation (certificat)', definition: 'Document numéroté délivré au participant qui remplit les critères d’achèvement d’un module. Vérifiable publiquement par son numéro sur le site institutionnel.' },
            { term: 'Pièce jointe (pièce officielle)', definition: 'Document ajouté à une demande : lettre signée, liste visée, mandat. PDF, JPEG, PNG, DOC ou DOCX, 10 Mo au plus.' },
            { term: 'Lien signé', definition: 'Adresse temporaire (15 minutes) permettant d’ouvrir une pièce jointe stockée de façon privée.' },
            { term: 'CSV', definition: 'Fichier texte de données séparées par des virgules, qui s’ouvre dans un tableur. Format des exports de participants et de rapports.' },
            { term: 'Notification interne', definition: 'Message affiché dans le bloc **Notifications** de votre tableau de bord apprenant et sur le site institutionnel, en plus ou à la place d’un email.' },
            { term: 'Vérification en deux étapes', definition: 'Code temporaire à 6 chiffres demandé en plus du mot de passe à la connexion, généré par une application d’authentification sur votre téléphone.' },
            { term: 'Historique des décisions', definition: 'Liste datée de tous les changements de statut d’une demande, avec l’auteur et le commentaire.' },
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
            ['Connexion impossible, adresse email non confirmée, mot de passe, vérification en deux étapes', 'Le support, via le formulaire de contact du site institutionnel.'],
            ['Le lien **Organisation** n’apparaît pas ; désigner un second gestionnaire ; changement de responsable', 'La coordination FETRAG (formulaire de contact, objet « Accès responsable d’organisation »).'],
            ['Question sur une demande en cours : délai, complément, date proposée, participant à remplacer, adresse email à corriger', 'La coordination FETRAG, en citant la référence DF-… de la demande.'],
            ['Affiliation de votre organisation, prise en charge financière, convention de formation', 'Le secrétariat général de la Fédération.'],
            ['Message d’erreur inattendu (« Une erreur est survenue », « Export impossible »)', 'Le support, avec l’heure, l’écran concerné et le message exact.'],
          ],
        },
        {
          type: 'list',
          title: 'Ce qu’il faut indiquer dans votre message',
          style: 'check',
          items: [
            'L’adresse email de votre compte.',
            'Le nom et le sigle de votre organisation.',
            'La référence de la demande concernée (DF-AAAA-XXXXXX), si votre question porte sur une demande.',
            'L’écran concerné (par exemple « étape 03 de l’assistant » ou « Rapports, export PDF ») et l’appareil utilisé (téléphone ou ordinateur).',
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
          text: 'Rechargez la page, vérifiez l’organisation active et le statut de la demande dans son historique : la réponse s’y trouve souvent. Puis relisez la section « Si ça ne marche pas » de la tâche concernée dans ce guide.',
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
      label: 'Guide du responsable d’organisation sur le site institutionnel',
      href: '{{web}}/espace/guide/web-organisation',
      description: 'Votre compte, vos notifications et l’accès à la plateforme depuis le site.',
      external: true,
    },
  ],
  selfAssessment: {
    intro: 'Dix-huit questions pour vérifier ce que vous avez retenu : où cliquer, ce que signifie un statut, ce qui est définitif, à qui s’adresser. Comptez une dizaine de minutes.',
    passPercent: 70,
    questions: [
      {
        id: 'q-acces-1',
        sectionId: 'acceder-a-votre-espace',
        type: 'single',
        prompt: 'Après la connexion, comment ouvrez-vous l’espace « Organisation » ?',
        options: [
          { id: 'a', text: 'Menu du compte (initiales en haut à droite), puis **Organisation**.', correct: true },
          { id: 'b', text: 'Lien **Catalogue** de la barre de navigation.', correct: false },
          { id: 'c', text: 'Bouton **Vérifier un certificat** du pied de page.', correct: false },
        ],
        explanation: 'Le lien **Organisation** se trouve dans le menu du compte ; sur mobile, le bouton `Mon espace` du tiroir y mène aussi. Voir « Comment accéder à votre espace ».',
      },
      {
        id: 'q-acces-2',
        sectionId: 'acceder-a-votre-espace',
        type: 'true-false',
        prompt: 'Le choix de l’organisation active est mémorisé pendant 30 jours sur l’appareil.',
        options: [
          { id: 'a', text: 'Vrai', correct: true },
          { id: 'b', text: 'Faux', correct: false },
        ],
        explanation: 'Oui : le sélecteur **Organisation active** mémorise votre choix 30 jours. Voir « Comment accéder à votre espace ».',
      },
      {
        id: 'q-reperer-1',
        sectionId: 'se-reperer',
        type: 'multiple',
        prompt: 'Quelles rubriques composent le menu « Organisation » ?',
        options: [
          { id: 'a', text: 'Tableau de bord', correct: true },
          { id: 'b', text: 'Demande de formation', correct: true },
          { id: 'c', text: 'Participants', correct: true },
          { id: 'd', text: 'Rapports', correct: true },
          { id: 'e', text: 'Paiements', correct: false },
        ],
        explanation: 'Le menu compte quatre rubriques ; il n’y a pas de rubrique Paiements dans l’espace « Organisation ». Voir « Se repérer ».',
      },
      {
        id: 'q-reperer-2',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Sur téléphone, comment affichez-vous le menu de l’espace « Organisation » ?',
        options: [
          { id: 'a', text: 'Avec le bouton **Ouvrir le menu** (trois traits) de la barre secondaire.', correct: true },
          { id: 'b', text: 'En tournant le téléphone en mode paysage.', correct: false },
          { id: 'c', text: 'Il n’est pas accessible sur téléphone.', correct: false },
        ],
        explanation: 'Sous 1024 pixels, la barre latérale est remplacée par un tiroir ouvert avec le bouton **Ouvrir le menu**. Voir « Se repérer ».',
      },
      {
        id: 'q-demande-1',
        sectionId: 'deposer-une-demande',
        type: 'single',
        prompt: 'Combien d’étapes compte l’assistant de demande de formation ?',
        options: [
          { id: 'a', text: 'Trois', correct: false },
          { id: 'b', text: 'Six', correct: true },
          { id: 'c', text: 'Dix', correct: false },
        ],
        explanation: 'Six étapes : Organisation, Modules, Participants, Préférences, Engagements, Récapitulatif. Voir « Comment déposer une demande de formation ».',
      },
      {
        id: 'q-demande-2',
        sectionId: 'etape-03-participants',
        type: 'single',
        prompt: 'Quel est le seul champ obligatoire pour chaque participant ?',
        options: [
          { id: 'a', text: 'Le nom complet', correct: true },
          { id: 'b', text: 'Le téléphone', correct: false },
          { id: 'c', text: 'La fonction', correct: false },
        ],
        explanation: 'Seul le nom complet (2 caractères au moins) est obligatoire ; l’email est facultatif mais indispensable pour créer le compte. Voir « Étape 03 : Participants ».',
      },
      {
        id: 'q-demande-3',
        sectionId: 'etape-06-recapitulatif',
        type: 'multiple',
        prompt: 'Pourquoi le bouton `Transmettre à la coordination` peut-il rester grisé ?',
        options: [
          { id: 'a', text: 'Les engagements ne sont pas cochés.', correct: true },
          { id: 'b', text: 'Aucun module n’est sélectionné.', correct: true },
          { id: 'c', text: 'Aucun participant n’est désigné.', correct: true },
          { id: 'd', text: 'Aucune pièce jointe n’est ajoutée.', correct: false },
        ],
        explanation: 'La pièce officielle est facultative. Les engagements, au moins un module et au moins un participant sont requis. Voir « Étape 06 : Récapitulatif et transmission ».',
      },
      {
        id: 'q-demande-4',
        sectionId: 'etape-06-recapitulatif',
        type: 'true-false',
        prompt: 'Après la transmission, vous pouvez encore modifier la liste des participants vous-même.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Une demande « Soumise » n’est plus modifiable ; seule la coordination peut la renvoyer en « Complément demandé ». Voir « Étape 06 : Récapitulatif et transmission ».',
      },
      {
        id: 'q-brouillon-1',
        sectionId: 'brouillon-et-reprise',
        type: 'single',
        prompt: 'Quel bouton enregistre la demande sans la transmettre ?',
        options: [
          { id: 'a', text: '`Enregistrer et quitter`', correct: true },
          { id: 'b', text: '`Transmettre à la coordination`', correct: false },
          { id: 'c', text: '`Importer les lignes`', correct: false },
        ],
        explanation: '`Enregistrer et quitter` crée ou met à jour le brouillon et ouvre la page de suivi. Voir « Comment enregistrer un brouillon ».',
      },
      {
        id: 'q-piece-1',
        sectionId: 'joindre-une-piece',
        type: 'multiple',
        prompt: 'Quels formats de fichier sont acceptés pour la pièce officielle ?',
        options: [
          { id: 'a', text: 'PDF', correct: true },
          { id: 'b', text: 'JPEG ou PNG', correct: true },
          { id: 'c', text: 'DOC ou DOCX', correct: true },
          { id: 'd', text: 'Feuille de calcul', correct: false },
        ],
        explanation: 'PDF, JPEG, PNG, DOC et DOCX, 10 Mo au plus. Voir « Comment joindre une pièce officielle ».',
      },
      {
        id: 'q-suivi-1',
        sectionId: 'suivre-une-demande',
        type: 'single',
        prompt: 'Que signifie le statut « Complément demandé » ?',
        options: [
          { id: 'a', text: 'La coordination attend des précisions : la demande redevient modifiable.', correct: true },
          { id: 'b', text: 'La demande est acceptée et attend la planification.', correct: false },
          { id: 'c', text: 'La demande est refusée définitivement.', correct: false },
        ],
        explanation: 'En « Complément demandé », vous cliquez sur `Compléter la demande`, corrigez, puis transmettez à nouveau. Voir « Comment suivre une demande ».',
      },
      {
        id: 'q-suivi-2',
        sectionId: 'suivre-une-demande',
        type: 'single',
        prompt: 'Dans la section « Participants » de la fiche, que veut dire « À créer » dans la colonne **Compte** ?',
        options: [
          { id: 'a', text: 'L’email est inconnu : un compte sera créé à la planification.', correct: true },
          { id: 'b', text: 'Le participant a refusé la formation.', correct: false },
          { id: 'c', text: 'Vous devez créer le compte vous-même.', correct: false },
        ],
        explanation: 'La coordination crée automatiquement le compte à la planification ; vous n’avez rien à faire. Voir « Comment suivre une demande ».',
      },
      {
        id: 'q-date-1',
        sectionId: 'repondre-a-une-proposition-de-date',
        type: 'single',
        prompt: 'La coordination propose une autre date qui ne vous convient pas. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Vous contactez la coordination, ou vous annulez la demande pour en déposer une nouvelle.', correct: true },
          { id: 'b', text: 'Vous cliquez sur `Refuser la proposition`.', correct: false },
          { id: 'c', text: 'Vous modifiez la date directement dans la fiche de suivi.', correct: false },
        ],
        explanation: 'Il n’existe pas de bouton de refus ni de modification de date sur la fiche. Voir « Comment répondre à une autre date proposée ».',
      },
      {
        id: 'q-annuler-1',
        sectionId: 'annuler-une-demande',
        type: 'true-false',
        prompt: 'Une demande annulée peut être rouverte plus tard par vous-même.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'L’annulation est définitive : il faut déposer une nouvelle demande. Voir « Comment annuler une demande ».',
      },
      {
        id: 'q-annuler-2',
        sectionId: 'annuler-une-demande',
        type: 'single',
        prompt: 'Dans quel statut l’annulation est-elle impossible ?',
        options: [
          { id: 'a', text: 'Soumise', correct: false },
          { id: 'b', text: 'Planifiée', correct: false },
          { id: 'c', text: 'Formation en cours', correct: true },
        ],
        explanation: 'Une fois la cohorte démarrée, la demande ne peut plus être annulée depuis votre espace. Voir « Comment annuler une demande ».',
      },
      {
        id: 'q-planif-1',
        sectionId: 'apres-acceptation',
        type: 'single',
        prompt: 'Combien de temps le lien « Définir mon mot de passe » reçu par un nouveau participant reste-t-il valable ?',
        options: [
          { id: 'a', text: '15 minutes', correct: false },
          { id: 'b', text: '7 jours', correct: true },
          { id: 'c', text: '30 jours', correct: false },
        ],
        explanation: 'Le lien d’invitation est valable 7 jours ; ensuite, la personne utilise **Mot de passe oublié ?**. Voir « Ce qui se passe après l’acceptation ».',
      },
      {
        id: 'q-planif-2',
        sectionId: 'apres-acceptation',
        type: 'true-false',
        prompt: 'Un participant sans adresse email reçoit ses identifiants par votre intermédiaire.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Sans email, aucun compte n’est créé et la personne n’est pas inscrite. Voir « Ce qui se passe après l’acceptation ».',
      },
      {
        id: 'q-rapports-1',
        sectionId: 'rapport-de-cohorte',
        type: 'single',
        prompt: 'Où trouvez-vous l’assiduité et le score de chaque participant ?',
        options: [
          { id: 'a', text: 'Dans **Rapports**, section « Rapport par cohorte ».', correct: true },
          { id: 'b', text: 'Sur le tableau de bord, carte « Prochaines sessions ».', correct: false },
          { id: 'c', text: 'Dans le menu du compte.', correct: false },
        ],
        explanation: 'Le rapport par cohorte donne, par participant, statut, progression, score, assiduité et numéro d’attestation. Voir « Le rapport par cohorte ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'multiple',
        prompt: 'Que faut-il indiquer dans un message d’aide à propos d’une demande ?',
        options: [
          { id: 'a', text: 'L’adresse email de votre compte', correct: true },
          { id: 'b', text: 'La référence DF-… de la demande', correct: true },
          { id: 'c', text: 'Votre mot de passe', correct: false },
          { id: 'd', text: 'Le message d’erreur exact', correct: true },
        ],
        explanation: 'Ne communiquez jamais votre mot de passe. Voir « Besoin d’aide ? ».',
      },
    ],
  },
}
