import type { Guide } from '@fetrag/contracts'

/**
 * Guide du membre (site institutionnel, tout compte connecté : clé de guide MEMBER).
 *
 * Périmètre vérifié dans le code : création de compte et confirmation d’adresse, connexion (avec ou sans
 * vérification en deux étapes), mot de passe oublié, déconnexion, espace personnel (/espace : tableau de
 * bord, profil, demandes, inscriptions, paiements et reçus, notifications, sécurité), parcours de paiement
 * (/paiement), pages publiques utiles au compte (formations, services, adhésion, contact, événements,
 * ressources, vérification de certificat, recherche, FAQ, lettre d’information).
 *
 * Limites connues (ne pas documenter comme fonctionnelles) : fournisseurs Mobile Money réels non
 * configurés (seul le bac à sable de démonstration fonctionne), pas de rappel automatique avant un
 * événement, lien de désinscription des emails de la lettre d’information non fonctionnel, pas de page
 * de détail d’une demande de service, pas de changement d’adresse email en libre-service.
 */
export const webMembre: Guide = {
  id: 'web-membre',
  platform: 'web',
  role: 'MEMBER',
  title: 'Guide du membre',
  subtitle: 'Votre compte et votre espace personnel sur le site de la Fédération',
  audience:
    'Ce guide s’adresse à toute personne disposant d’un compte FETRAG sur le site institutionnel : travailleuses et travailleurs, responsables syndicaux, adhérents des organisations affiliées et personnels de la Fédération.',
  summary:
    'Avec votre compte, vous gérez vos informations et vos consentements, vous déposez et suivez des demandes de service, vous vous inscrivez aux événements et aux formations, vous réglez vos commandes en ligne et vous retrouvez vos reçus. Le même compte ouvre la plateforme de formation, sans nouvelle connexion. Ce guide décrit chaque écran, chaque statut et la marche à suivre quand quelque chose ne fonctionne pas, sur téléphone comme sur ordinateur.',
  tone: 'blue',
  icon: 'user',
  readingMinutes: 40,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Une adresse email que vous pouvez consulter : le lien d’activation du compte, les reçus et les convocations y sont envoyés.',
    'Un téléphone ou un ordinateur connecté à Internet, avec un navigateur récent.',
    'Un mot de passe personnel de 8 caractères au moins, avec une majuscule et un chiffre, que vous n’utilisez sur aucun autre service.',
    'Pour la vérification en deux étapes (facultative mais recommandée) : une application d’authentification sur votre téléphone, par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP.',
  ],
  quickStart: [
    {
      text: 'Créez votre compte depuis la page **Inscription**.',
      ui: 'Créer mon compte',
      where: 'bouton bleu en bas du formulaire (sur mobile : bouton **Ouvrir le menu** en haut à droite, puis `Créer un compte`)',
      result: 'La page **Vérifiez votre boîte mail** s’affiche avec votre adresse.',
    },
    {
      text: 'Ouvrez l’email « Confirmez votre adresse email - FETRAG » et cliquez sur son lien.',
      result: 'La page **Adresse confirmée** s’affiche ; un email de bienvenue vous est envoyé.',
      note: 'Le lien reste valable 24 heures. Regardez aussi le dossier « Courrier indésirable ».',
    },
    {
      text: 'Connectez-vous avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'page **Connexion**, bouton en bas du formulaire',
      result: 'Votre tableau de bord s’ouvre : « Bonjour {votre prénom} ».',
    },
    {
      text: 'Complétez votre profil : téléphone, fonction, employeur.',
      ui: 'Enregistrer mon profil',
      where: 'menu de gauche > **Profil** (sur mobile : bouton **Ouvrir la navigation** en haut du bandeau)',
      result: 'Le message « Votre profil a été mis à jour. » apparaît.',
    },
    {
      text: 'Activez la vérification en deux étapes pour protéger votre compte.',
      ui: 'Activer la vérification en deux étapes',
      where: 'menu de gauche > **Sécurité**',
      result: 'Le badge **Vérification en deux étapes active** s’affiche en haut de la page.',
      note: 'Facultatif, mais l’alerte jaune du tableau de bord reste affichée tant que ce n’est pas fait.',
    },
  ],
  sections: [
    // -------------------------------------------------------------------------
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'user',
      summary: 'Ce que votre compte vous permet de faire, ce qu’il ne permet pas, et avec qui vous êtes en relation.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre compte est votre identité auprès de la Fédération. Il est unique : il ouvre à la fois le site institutionnel (votre **Espace personnel**) et la **plateforme de formation**. Quand vous créez votre compte en ligne, il reçoit le rôle **Apprenant** (c’est le mot affiché dans le menu de votre compte). Ce rôle ne limite rien de ce qui est décrit dans ce guide : « membre » désigne ici tout compte connecté.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire',
          style: 'check',
          items: [
            'Mettre à jour vos informations (nom, téléphone, fonction, employeur), vos consentements et vos préférences d’emails.',
            'Protéger votre compte : changer votre mot de passe, activer la vérification en deux étapes, consulter vos dernières connexions.',
            'Déposer une demande de service depuis le catalogue des services et suivre son statut.',
            'Vous inscrire à un événement (assemblée, master class, webinaire), rejoindre une liste d’attente, annuler votre inscription.',
            'Consulter le programme de formation et vous inscrire à un module sur la plateforme de formation.',
            'Régler en ligne une commande (service payant, événement payant, document premium) et télécharger vos reçus.',
            'Télécharger les documents réservés aux membres dans la bibliothèque de ressources.',
            'Lire vos notifications, écrire à la Fédération, vous abonner à la lettre d’information et vérifier l’authenticité d’un certificat.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que votre compte ne permet pas',
          style: 'bullet',
          items: [
            'Changer vous-même votre adresse email : elle sert d’identifiant de connexion. Contactez le support pour la modifier.',
            'Modifier ou annuler une demande de service après son dépôt : écrivez à la Fédération en indiquant sa référence.',
            'Déposer une **Demande de formation** pour un groupe : cette fonction est réservée aux responsables d’organisation. Ce lien ouvre la plateforme de formation, qui affiche alors la page **Vous devez être responsable d’une organisation** (espace **Organisation**) vous invitant à demander votre désignation comme gestionnaire ou à contacter la Fédération.',
            'Accéder à **Administration du site** : cette entrée n’apparaît que pour les personnels de la Fédération.',
            'Obtenir un remboursement en un clic : un remboursement est décidé et effectué par le service financier de la Fédération.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous êtes en relation',
          columns: ['Interlocuteur', 'Ce qu’il fait pour vous'],
          rows: [
            ['Support de la Fédération', 'Répond aux messages envoyés depuis le site, aide à la connexion, fait modifier votre adresse email ou réactiver votre compte.'],
            ['Responsable des services', 'Traite vos demandes de service ; son nom apparaît dans la colonne **Suivi par** de **Mes demandes**.'],
            ['Coordination de la formation', 'Valide les inscriptions sur validation, planifie les cohortes, émet les attestations et certificats.'],
            ['Service financier', 'Confirme les paiements, émet les reçus, effectue les remboursements.'],
            ['Responsable de votre organisation', 'Peut vous rattacher à une organisation affiliée et vous désigner pour une formation de groupe.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un seul compte pour deux sites',
          text: 'Une fois connecté sur le site institutionnel, le lien **Plateforme de formation** vous ouvre la plateforme sans redemander votre mot de passe. La session dure 14 jours, sauf si vous vous déconnectez.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte, connexion, mot de passe',
      icon: 'log-in',
      summary: 'Créer votre compte, confirmer votre adresse, vous connecter, retrouver un mot de passe oublié et vous déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toutes ces pages sont accessibles sans être connecté. Sur ordinateur, le bouton bleu **Espace personnel** en haut à droite mène à la connexion. Sur mobile, ouvrez le menu avec le bouton **Ouvrir le menu** (icône à trois traits) en haut à droite : les boutons `Connexion` et `Créer un compte` sont en bas du menu.',
        },
      ],
      subsections: [
        {
          id: 'creer-un-compte',
          title: 'Créer un compte',
          blocks: [
            {
              type: 'steps',
              intro: 'Le compte se crée avec une adresse email et un mot de passe. Les champs marqués d’un astérisque sont obligatoires.',
              items: [
                {
                  text: 'Ouvrez la page **Inscription**.',
                  where: 'depuis la page **Connexion**, lien « Pas encore de compte ? Créer un compte » ; sur mobile, bouton `Créer un compte` en bas du menu',
                  result: 'La page « Rejoignez l’espace FETRAG » s’affiche.',
                },
                {
                  text: 'Renseignez **Prénom** et **Nom** (2 à 60 caractères chacun).',
                  note: 'Ces noms figureront sur vos attestations de formation et vos reçus : écrivez-les comme sur votre pièce d’identité.',
                },
                {
                  text: 'Saisissez votre **Adresse email**.',
                  note: 'Elle servira d’identifiant de connexion. Choisissez une adresse que vous consultez vraiment : le lien d’activation y sera envoyé.',
                },
                {
                  text: 'Renseignez si vous le souhaitez **Téléphone** (facultatif, 6 à 20 caractères) et **Organisation ou employeur** (facultatif).',
                },
                {
                  text: 'Choisissez un **Mot de passe** puis répétez-le dans **Confirmer le mot de passe**.',
                  note: 'Règle : 8 caractères au minimum, au moins une lettre majuscule et au moins un chiffre. Le bouton en forme d’œil `Afficher le mot de passe` vous permet de vérifier ce que vous tapez.',
                },
                {
                  text: 'Cochez la case **J’accepte les conditions d’utilisation et la politique de confidentialité.** (obligatoire). La case de la lettre d’information est facultative.',
                },
                {
                  text: 'Cliquez sur `Créer mon compte`.',
                  where: 'en bas du formulaire',
                  result: 'La page **Vérifiez votre boîte mail** s’affiche : « Un lien de confirmation vient d’être envoyé à {votre adresse} ».',
                  note: 'Aucune session n’est ouverte à ce stade : il faut d’abord confirmer votre adresse.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Vous représentez une organisation affiliée ?',
              text: 'Créez votre compte normalement, puis contactez la coordination de la Fédération pour être rattaché à votre organisation. Le rattachement donne accès aux documents réservés à votre organisation.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Message « Un compte existe déjà avec cette adresse email. »',
                  cause: 'Vous avez déjà créé un compte avec cette adresse.',
                  solution: 'Retournez sur **Connexion**. Si vous avez oublié le mot de passe, utilisez « Mot de passe oublié ? ».',
                },
                {
                  problem: 'Message rouge sous le mot de passe.',
                  cause: 'Le mot de passe ne respecte pas la règle (8 caractères, une majuscule, un chiffre) ou les deux saisies sont différentes.',
                  solution: 'Affichez le mot de passe avec le bouton en forme d’œil et corrigez les deux champs.',
                },
                {
                  problem: 'Message « Trop de créations de compte depuis cette connexion. »',
                  cause: 'Plus de 5 comptes ont été créés en une heure depuis la même connexion Internet (par exemple un Wi-Fi partagé).',
                  solution: 'Attendez le délai indiqué, ou utilisez une autre connexion (données mobiles).',
                },
                {
                  problem: 'Le formulaire est remplacé par « La création de compte par mot de passe est désactivée ».',
                  cause: 'La Fédération a activé la connexion par un compte FETRAG externe.',
                  solution: 'Cliquez sur `Aller à la connexion` et utilisez le bouton « Se connecter avec… ».',
                },
              ],
            },
          ],
        },
        {
          id: 'confirmer-mon-adresse',
          title: 'Confirmer votre adresse email',
          blocks: [
            {
              type: 'steps',
              intro: 'Sans confirmation, la connexion est impossible. Le lien est valable 24 heures et ne sert qu’une fois.',
              items: [
                {
                  text: 'Ouvrez votre messagerie et cherchez l’email « Confirmez votre adresse email - FETRAG ».',
                  note: 'La réception peut prendre quelques minutes. Vérifiez le dossier « Courrier indésirable » ou « Spam ».',
                },
                {
                  text: 'Cliquez sur le lien de confirmation contenu dans l’email.',
                  result: 'La page **Adresse confirmée** s’affiche : « Merci, votre adresse email est confirmée. » Un email « Bienvenue à la FETRAG » vous est envoyé.',
                },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  where: 'sous le message de confirmation',
                  result: 'La page **Connexion** s’ouvre avec le bandeau vert « Votre adresse email est confirmée. Connectez-vous pour accéder à votre espace. »',
                },
                {
                  text: 'Si vous n’avez rien reçu, retournez sur la page **Vérifiez votre boîte mail** et cliquez sur `Renvoyer le lien` (ou saisissez votre adresse puis `Recevoir un nouveau lien`).',
                  result: 'Le message « Si un compte en attente de confirmation est associé à cette adresse, un nouveau lien vient de lui être envoyé. » s’affiche.',
                  note: 'Au plus 3 envois par heure pour une même adresse. Chaque nouveau lien annule le précédent.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'La page affiche « Lien invalide ou expiré ».',
                  cause: 'Le lien a plus de 24 heures, a déjà été utilisé, ou a été coupé par votre messagerie.',
                  solution: 'Saisissez votre adresse dans le champ **Adresse email du compte** de cette même page et cliquez sur `Recevoir un nouveau lien`.',
                },
                {
                  problem: 'À la connexion : « Confirmez d’abord votre adresse email ».',
                  cause: 'Votre adresse n’est pas encore confirmée.',
                  solution: 'Cliquez sur le bouton `Renvoyer le lien de confirmation` affiché sous le message, puis ouvrez le nouvel email.',
                },
                {
                  problem: 'Aucun email n’arrive, même après un renvoi.',
                  cause: 'Adresse mal saisie à l’inscription, ou messagerie qui bloque l’expéditeur.',
                  solution: 'Ajoutez l’expéditeur à vos contacts et réessayez. Si l’adresse était fausse, créez un nouveau compte avec la bonne adresse.',
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
                  text: 'Ouvrez la page **Connexion**.',
                  where: 'bouton bleu **Espace personnel** en haut à droite (ordinateur) ; sur mobile, bouton **Ouvrir le menu** puis `Connexion`',
                  result: 'La page « Bienvenue à la FETRAG » s’affiche.',
                },
                {
                  text: 'Saisissez votre **Adresse email** et votre **Mot de passe**.',
                },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  where: 'en bas du formulaire',
                  result: 'Votre tableau de bord s’ouvre (« Bonjour {votre prénom} »), ou la page que vous vouliez consulter avant de vous connecter.',
                },
                {
                  text: 'Si votre compte est protégé par la vérification en deux étapes, un champ **Code de vérification** apparaît : ouvrez votre application d’authentification et saisissez le code à 6 chiffres.',
                  note: 'Vous pouvez aussi saisir l’un de vos codes de secours ; il ne pourra plus servir ensuite.',
                },
                {
                  text: 'Cliquez sur `Vérifier et se connecter`.',
                  result: 'Votre espace personnel s’ouvre.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Bandeaux verts',
              text: 'Selon d’où vous venez, un bandeau vert vous informe : « Votre adresse email est confirmée… », « Votre mot de passe a été réinitialisé… » ou « Vous avez été déconnecté. » C’est normal.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Adresse email ou mot de passe incorrect. »',
                  cause: 'Faute de frappe, majuscules, ou mot de passe oublié.',
                  solution: 'Affichez le mot de passe avec le bouton en forme d’œil et réessayez. Sinon, utilisez « Mot de passe oublié ? ».',
                },
                {
                  problem: '« Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer. »',
                  cause: '10 échecs en 15 minutes pour cette adresse depuis votre connexion.',
                  solution: 'Attendez le délai affiché puis réessayez. Si vous ne retrouvez pas votre mot de passe, demandez un lien de réinitialisation.',
                },
                {
                  problem: '« Le code de vérification est invalide ou expiré. »',
                  cause: 'Le code de l’application change toutes les 30 secondes, ou l’heure de votre téléphone est décalée.',
                  solution: 'Attendez le code suivant et saisissez-le immédiatement. Vérifiez que l’heure de votre téléphone est réglée automatiquement.',
                },
                {
                  problem: '« Ce compte est désactivé. »',
                  cause: 'Le compte a été désactivé par la Fédération.',
                  solution: 'Contactez le support depuis la page **Contact** en indiquant l’adresse email du compte.',
                },
                {
                  problem: '« Connectez-vous pour accéder à cette page. »',
                  cause: 'Vous avez ouvert une page de l’espace personnel sans être connecté (ou après 14 jours).',
                  solution: 'Connectez-vous : vous serez ramené automatiquement sur la page demandée.',
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
              intro: 'Le lien de réinitialisation est valable 30 minutes et ne sert qu’une fois.',
              items: [
                {
                  text: 'Sur la page **Connexion**, cliquez sur « Mot de passe oublié ? ».',
                  where: 'sous le champ du mot de passe',
                  result: 'La page **Mot de passe oublié** s’affiche.',
                },
                {
                  text: 'Saisissez votre **Adresse email du compte**.',
                  note: 'Utilisez exactement l’adresse avec laquelle vous vous connectez.',
                },
                {
                  text: 'Cliquez sur `Recevoir le lien de réinitialisation`.',
                  where: 'sous le champ',
                  result: 'Le message « Si un compte est associé à cette adresse, un lien de réinitialisation vient de lui être envoyé. » remplace le formulaire.',
                  note: 'Le message est le même que l’adresse existe ou non : c’est une protection. Au plus 3 demandes par heure.',
                },
                {
                  text: 'Ouvrez l’email « Réinitialisation de votre mot de passe FETRAG » et cliquez sur son lien.',
                  result: 'La page **Nouveau mot de passe** s’affiche.',
                },
                {
                  text: 'Saisissez le **Nouveau mot de passe** puis **Confirmer le nouveau mot de passe**.',
                  result: 'Les quatre règles sous le champ passent en vert : 8 caractères, une majuscule, un chiffre, saisies identiques.',
                },
                {
                  text: 'Cliquez sur `Définir le nouveau mot de passe`.',
                  result: 'Retour sur **Connexion** avec le bandeau « Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe. » Un email « Votre mot de passe FETRAG a été modifié » vous est envoyé.',
                },
                {
                  text: 'Connectez-vous avec le nouveau mot de passe.',
                  note: 'Si la vérification en deux étapes était active, elle le reste.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Ce lien de réinitialisation est invalide ou a expiré. »',
                  cause: 'Plus de 30 minutes se sont écoulées, ou le lien a déjà servi.',
                  solution: 'Cliquez sur `Demander un nouveau lien` et recommencez plus rapidement.',
                },
                {
                  problem: 'Aucun email de réinitialisation.',
                  cause: 'Adresse différente de celle du compte, compte désactivé, ou email dans le courrier indésirable.',
                  solution: 'Vérifiez le dossier « Courrier indésirable », puis réessayez avec l’adresse exacte du compte. En dernier recours, écrivez au support.',
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
              title: 'Sur ordinateur',
              items: [
                {
                  text: 'Cliquez sur votre avatar (vos initiales ou votre photo) en haut à droite.',
                  result: 'Le menu de votre compte s’ouvre : nom, adresse email, rôle, puis les rubriques.',
                },
                {
                  text: 'Cliquez sur la dernière ligne, en rouge : **Déconnexion**.',
                  result: 'Vous revenez sur la page d’accueil du site, déconnecté.',
                },
              ],
            },
            {
              type: 'steps',
              title: 'Sur mobile',
              items: [
                {
                  text: 'Touchez le bouton **Ouvrir le menu** (icône à trois traits) en haut à droite.',
                  result: 'Le menu s’ouvre sur la droite de l’écran.',
                },
                {
                  text: 'Touchez `Déconnexion` en bas du menu.',
                  result: 'La page **Se déconnecter ?** s’affiche avec votre adresse email.',
                },
                {
                  text: 'Touchez `Confirmer la déconnexion`.',
                  result: 'La page indique « Vous êtes déconnecté » et vous revenez à l’accueil.',
                  note: '`Annuler et rester connecté` vous ramène à votre espace.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Appareil partagé',
              text: 'Sur un téléphone ou un ordinateur qui n’est pas le vôtre (cybercafé, poste de travail commun, téléphone prêté), déconnectez-vous toujours avant de rendre l’appareil. Sinon, la session reste ouverte pendant 14 jours et la personne suivante accède à vos demandes, vos reçus et vos notifications.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'se-reperer',
      title: 'Se repérer dans le site et dans votre espace',
      icon: 'compass',
      summary: 'Les zones de l’en-tête, du menu de votre compte et du tableau de bord, sur ordinateur et sur mobile.',
      blocks: [
        {
          type: 'screen',
          title: 'L’en-tête du site (toutes les pages)',
          description: 'La bande tricolore et le logo en haut de chaque page. Les éléments changent selon la largeur de l’écran.',
          areas: [
            { name: 'Logo FETRAG', purpose: 'Un clic ramène toujours à la page d’accueil.', icon: 'home' },
            {
              name: 'Navigation principale (ordinateur, écran large)',
              purpose: 'Sept rubriques : **La FETRAG**, **Actualités**, **Formations**, **Services**, **Ressources**, **Événements**, **Contact**.',
              icon: 'menu',
            },
            {
              name: 'Lien vert « Plateforme de formation »',
              purpose: 'Ouvre la plateforme de formation avec votre compte déjà connecté. Sur les écrans moyens, seule l’icône en forme de chapeau de diplômé est visible.',
              icon: 'graduation-cap',
            },
            {
              name: 'Bouton bleu « Espace personnel » (non connecté)',
              purpose: 'Mène à la page **Connexion**.',
              icon: 'log-in',
            },
            {
              name: 'Avatar avec votre nom (connecté)',
              purpose: 'Vos initiales ou votre photo, en haut à droite : un clic ouvre le menu de votre compte.',
              icon: 'user',
            },
            {
              name: 'Bouton « Ouvrir le menu » (mobile et tablette)',
              purpose: 'Icône à trois traits en haut à droite : ouvre le menu complet dans un panneau à droite. Le bouton devient **Fermer le menu** (croix) quand le panneau est ouvert.',
              icon: 'smartphone',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Le menu de votre compte',
          description: 'S’ouvre en cliquant sur votre avatar en haut à droite (ordinateur et mobile).',
          areas: [
            { name: 'En-tête du menu', purpose: 'Votre nom, votre adresse email et votre rôle en majuscules (par exemple **APPRENANT**).', icon: 'user' },
            {
              name: 'Rubriques personnelles',
              purpose: '**Mon espace**, **Mon profil**, **Mes inscriptions**, **Notifications**, **Sécurité**, **Guide d’utilisation** : raccourcis vers les pages de votre espace.',
              icon: 'layout-dashboard',
            },
            { name: 'Plateforme de formation', purpose: 'Ouvre le tableau de bord de la plateforme de formation.', icon: 'external-link' },
            { name: 'Déconnexion (en rouge)', purpose: 'Ferme votre session immédiatement et vous ramène à l’accueil.', icon: 'log-out' },
          ],
        },
        {
          type: 'screen',
          title: 'Le menu mobile (bouton « Ouvrir le menu »)',
          description: 'Panneau qui s’ouvre sur la droite. Il se ferme avec la croix, la touche `Échap` ou dès que vous changez de page.',
          areas: [
            { name: 'Les 7 rubriques du site', purpose: 'Chaque rubrique est accompagnée d’une courte description (par exemple « Histoire, missions, valeurs et gouvernance »).', icon: 'menu' },
            { name: 'Bloc vert « Plateforme de formation »', purpose: 'Accès à la plateforme de formation.', icon: 'graduation-cap' },
            {
              name: 'Boutons du bas',
              purpose: 'Connecté : `Mon espace` et `Déconnexion`. Non connecté : `Connexion` et `Créer un compte`.',
              icon: 'log-in',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Votre tableau de bord (page « Bonjour {prénom} »)',
          description: 'Première page de votre espace personnel, après la connexion ou via **Mon espace** dans le menu du compte.',
          areas: [
            {
              name: 'Menu de gauche (ordinateur) ou bouton « Ouvrir la navigation » (mobile)',
              purpose: 'Groupe **Mon compte** : **Tableau de bord**, **Profil**, **Mes demandes**, **Mes inscriptions**, **Paiements et reçus**, **Notifications**, **Sécurité**, **Guide d’utilisation**. Groupe **Formation** : **Plateforme de formation**. En bas : bouton vert `Reprendre ma formation`. Un chiffre (badge) à côté de **Paiements et reçus** compte vos commandes en attente ; à côté de **Notifications**, vos notifications non lues.',
              icon: 'menu',
            },
            {
              name: 'Bandeau du haut (mobile)',
              purpose: 'Affiche « Espace personnel » et votre nom, avec le bouton **Ouvrir la navigation** (trois traits) qui ouvre le menu à gauche ; le menu se referme à chaque navigation.',
              icon: 'smartphone',
            },
            {
              name: 'Alerte jaune « Renforcez la sécurité de votre compte »',
              purpose: 'Affichée tant que la vérification en deux étapes n’est pas activée ; le lien **Activer maintenant** mène à **Sécurité**.',
              icon: 'shield',
            },
            {
              name: 'Quatre tuiles de chiffres',
              purpose: '**Formations en cours**, **Certificats obtenus**, **Demandes en cours**, **Notifications non lues**. Sur mobile, elles s’affichent sur deux colonnes.',
              icon: 'bar-chart',
            },
            {
              name: 'Carte « Mes formations en cours »',
              purpose: 'Jusqu’à 4 formations actives avec un anneau de progression et un bouton `Reprendre` qui ouvre le cours sur la plateforme. Le lien **Tout voir** mène à **Mes inscriptions**.',
              icon: 'graduation-cap',
            },
            {
              name: 'Carte « Prochains événements »',
              purpose: 'Vos inscriptions à venir : date, titre, ville et statut (INSCRIT, LISTE D’ATTENTE). Le lien **Agenda** mène à la page des événements.',
              icon: 'calendar',
            },
            {
              name: 'Carte « Dernières demandes »',
              purpose: 'Vos 5 dernières demandes de service avec leur référence et leur statut. Le lien **Tout voir** mène à **Mes demandes**.',
              icon: 'clipboard-list',
            },
            {
              name: 'Carte « Certificats et reçus »',
              purpose: 'Vos certificats valides (bouton `Voir`, ouvert sur la plateforme) et vos 3 dernières commandes avec leur statut. Le lien **Paiements** mène à **Paiements et reçus**.',
              icon: 'award',
            },
            {
              name: 'Bouton « Plateforme de formation » (en haut à droite de la page)',
              purpose: 'Raccourci vers le tableau de bord de la plateforme de formation.',
              icon: 'external-link',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Les pages de votre espace personnel',
          columns: ['Rubrique', 'Ce que vous y faites', 'Chemin'],
          rows: [
            ['Tableau de bord', 'Vue d’ensemble : formations, événements, demandes, notifications, certificats, commandes.', '/espace'],
            ['Profil', 'Identité et coordonnées, consentements, préférences d’emails.', '/espace/profil'],
            ['Mes demandes', 'Suivi des demandes de service et des messages envoyés à la Fédération.', '/espace/demandes'],
            ['Mes inscriptions', 'Formations, événements et certificats.', '/espace/inscriptions'],
            ['Paiements et reçus', 'Historique des commandes, paiement, reçus PDF.', '/espace/paiements'],
            ['Notifications', 'Centre des notifications internes.', '/espace/notifications'],
            ['Sécurité', 'Vérification en deux étapes, mot de passe, activité récente.', '/espace/securite'],
            ['Guide d’utilisation', 'Ce guide et son autoévaluation.', '/espace/guide'],
          ],
        },
        { type: 'path', label: 'Chemin vers votre espace', items: ['Avatar en haut à droite', 'Mon espace'], href: '/espace' },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Le pied de page',
          text: 'Tout en bas de chaque page, le pied de page (fond bleu marine) regroupe des liens utiles : **Adhésion**, **Catalogue des formations**, **Vérifier un certificat**, **Catalogue des services**, **Ressources documentaires**, **Espace personnel**, **Questions fréquentes**, **Recherche**, ainsi que l’adresse, l’email et les téléphones de la Fédération. Le lien **Demande de formation** est réservé aux responsables d’organisation.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'mettre-a-jour-mon-profil',
      title: 'Comment mettre à jour mon profil, mes consentements et mes emails',
      icon: 'pen',
      summary: 'La page **Profil** regroupe trois cartes : identité et coordonnées, consentements, notifications par email.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Mon compte', 'Profil'], href: '/espace/profil' },
        {
          type: 'paragraph',
          text: 'En haut de la page, une carte d’identité rappelle votre nom, votre adresse email, la date depuis laquelle vous êtes membre et l’état de votre abonnement à la lettre d’information. Chaque carte a son propre bouton d’enregistrement : enregistrez chaque carte séparément.',
        },
      ],
      subsections: [
        {
          id: 'profil-informations',
          title: 'Modifier vos informations',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Profil**.',
                  where: 'menu de gauche, groupe « Mon compte » ; sur mobile, bouton **Ouvrir la navigation** puis **Profil** ; ou avatar en haut à droite puis **Mon profil**',
                  result: 'La page **Mes informations** s’affiche.',
                },
                {
                  text: 'Dans la carte **Identité et coordonnées**, corrigez **Prénom** et **Nom** (obligatoires, 2 à 60 caractères).',
                  note: 'Ces informations figurent sur vos attestations de formation et vos reçus.',
                },
                {
                  text: 'Renseignez **Téléphone** (facultatif ; format national ou international, par exemple 066 23 00 33), **Fonction** (facultatif, par exemple délégué du personnel) et **Employeur ou organisation** (facultatif).',
                },
                {
                  text: 'Laissez **Langue de l’interface** sur **Français**.',
                  note: 'L’option « English (bientôt disponible) » n’est pas encore ouverte. Le champ **Adresse email** est en lecture seule : contactez le support pour la modifier.',
                },
                {
                  text: 'Cliquez sur `Enregistrer mon profil`.',
                  where: 'en bas de la carte',
                  result: 'Le message vert « Votre profil a été mis à jour. » apparaît.',
                },
              ],
            },
          ],
        },
        {
          id: 'profil-consentements',
          title: 'Régler vos consentements',
          blocks: [
            {
              type: 'steps',
              intro: 'Un consentement est votre accord, daté et enregistré, pour recevoir certaines communications. Vous pouvez le retirer à tout moment.',
              items: [
                {
                  text: 'Dans la carte **Consentements**, activez ou désactivez l’interrupteur **Lettre d’information**.',
                  note: 'Activer abonne immédiatement l’adresse de votre compte à la lettre mensuelle ; désactiver vous en désinscrit.',
                },
                {
                  text: 'Activez ou désactivez **Informations sur les formations et événements** (nouvelles sessions du programme de formation, master class).',
                },
                {
                  text: 'Cliquez sur `Enregistrer mes consentements`.',
                  result: 'Le message « Vos préférences de consentement ont été enregistrées. » apparaît. Si rien n’a changé : « Aucun changement à enregistrer. »',
                },
                {
                  text: 'Vérifiez le badge de la carte d’identité en haut de la page.',
                  result: 'Il indique **Abonné à la lettre d’information** (vert) ou **Désinscrit de la lettre d’information**.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Les emails essentiels restent envoyés',
              text: 'Les emails de sécurité (mot de passe, vérification en deux étapes), de paiement (confirmation, reçu, remboursement) et de compte sont toujours envoyés, quels que soient vos réglages. Chaque modification de consentement est horodatée conformément à la politique de confidentialité.',
            },
          ],
        },
        {
          id: 'profil-preferences-email',
          title: 'Choisir les emails que vous recevez',
          blocks: [
            {
              type: 'steps',
              intro: 'Les notifications restent toujours visibles dans **Notifications** ; ici vous réglez seulement leur envoi par email.',
              items: [
                {
                  text: 'Dans la carte **Notifications par email**, désactivez les catégories dont vous ne voulez plus recevoir d’email : **Formations**, **Séances et convocations**, **Devoirs**, **Résultats**, **Certificats**, **Demandes de service**, **Forums**, **Informations générales**.',
                  note: 'Toutes les catégories sont activées par défaut. Nous vous conseillons de garder **Séances et convocations** et **Demandes de service**.',
                },
                {
                  text: 'Cliquez sur `Enregistrer mes préférences`.',
                  where: 'en bas de la carte',
                  result: 'Le message « Vos préférences de notification ont été enregistrées. » apparaît.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Certains champs sont invalides. »',
                  cause: 'Prénom ou nom trop court, ou téléphone avec des caractères non autorisés.',
                  solution: 'Lisez le message rouge sous le champ concerné. Le téléphone accepte chiffres, espaces, +, parenthèses, points et tirets (6 à 20 caractères).',
                },
                {
                  problem: '« L’opération a échoué. Réessayez dans quelques instants. »',
                  cause: 'Problème de connexion passager.',
                  solution: 'Rechargez la page et recommencez. Si le problème persiste, écrivez au support.',
                },
                {
                  problem: 'Le badge indique « Abonnement en attente de confirmation ».',
                  cause: 'Vous vous êtes abonné depuis le formulaire public sans cliquer sur le lien de l’email de confirmation.',
                  solution: 'Ouvrez l’email « Confirmez votre abonnement à la lettre de la FETRAG », ou activez simplement l’interrupteur **Lettre d’information** ici puis enregistrez.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'proteger-mon-compte',
      title: 'Comment protéger mon compte',
      icon: 'shield-check',
      summary: 'Activer la vérification en deux étapes, changer votre mot de passe et surveiller l’activité récente depuis la page **Sécurité**.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Mon compte', 'Sécurité'], href: '/espace/securite' },
        {
          type: 'paragraph',
          text: 'La **vérification en deux étapes** ajoute une protection : en plus du mot de passe, un code temporaire à 6 chiffres, généré par une application sur votre téléphone, est demandé à chaque connexion. Elle est facultative pour un membre, mais fortement recommandée. Le badge en haut de la page indique **Vérification en deux étapes active** (vert) ou **inactive** (jaune).',
        },
      ],
      subsections: [
        {
          id: 'securite-activer-la-verification',
          title: 'Activer la vérification en deux étapes',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone : Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP.',
                  note: 'Ces applications sont gratuites, disponibles sur Android et iPhone, et fonctionnent sans connexion Internet.',
                },
                {
                  text: 'Ouvrez **Sécurité**.',
                  where: 'menu de gauche, groupe « Mon compte » ; sur mobile, bouton **Ouvrir la navigation** puis **Sécurité** ; ou avatar en haut à droite puis **Sécurité**',
                  result: 'La page **Protéger mon compte** s’affiche avec le badge **Vérification en deux étapes inactive**.',
                },
                {
                  text: 'Cliquez sur `Activer la vérification en deux étapes`.',
                  where: 'carte **Vérification en deux étapes**',
                  result: 'L’étape 1 affiche un QR code et une clé en lettres et chiffres.',
                },
                {
                  text: 'Dans l’application d’authentification, ajoutez un compte et scannez le QR code.',
                  note: 'Si vous faites la manipulation sur le téléphone qui porte l’application, vous ne pouvez pas scanner l’écran : choisissez « saisir une clé » dans l’application et recopiez la clé affichée à côté du QR code.',
                  result: 'Une ligne FETRAG apparaît dans l’application avec un code à 6 chiffres qui change toutes les 30 secondes.',
                },
                {
                  text: 'À l’étape 2, saisissez le code dans **Code à 6 chiffres affiché par l’application**.',
                },
                {
                  text: 'Cliquez sur `Confirmer et activer`.',
                  result: 'L’alerte « Vérification en deux étapes activée » s’affiche, avec un encadré jaune **Codes de secours - affichés une seule fois** contenant 8 codes.',
                },
                {
                  text: 'Cliquez sur `Copier les codes` puis collez-les dans un endroit sûr (gestionnaire de mots de passe, note protégée), ou recopiez-les sur papier.',
                  result: 'Le message « Codes copiés dans le presse-papiers » apparaît.',
                  note: 'Chaque code de secours remplace une fois le code de l’application, par exemple si vous perdez votre téléphone.',
                },
                {
                  text: 'Vérifiez votre messagerie.',
                  result: 'Vous recevez l’email « Vérification en deux étapes activée » et une notification dans votre espace.',
                },
                {
                  text: 'À la prochaine connexion, saisissez le code de l’application dans le champ **Code de vérification** après votre mot de passe.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'danger',
              title: 'Conservez vos codes de secours',
              text: 'Les 8 codes ne sont affichés qu’une seule fois. Si vous perdez votre téléphone sans avoir gardé les codes, vous ne pourrez plus vous connecter seul : il faudra contacter le support. Pour obtenir de nouveaux codes, désactivez puis réactivez la vérification.',
            },
          ],
        },
        {
          id: 'securite-desactiver-la-verification',
          title: 'Désactiver la vérification en deux étapes',
          blocks: [
            {
              type: 'callout',
              tone: 'warning',
              title: 'Action à réfléchir',
              text: 'La désactivation supprime vos codes de secours. Votre compte n’est plus protégé que par le mot de passe. Vous pourrez réactiver la vérification à tout moment, avec de nouveaux codes.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Sécurité**.',
                  result: 'L’alerte « Vérification en deux étapes active - Il vous reste {n} code(s) de secours. » s’affiche.',
                },
                {
                  text: 'Saisissez le code de votre application, ou un code de secours, dans **Code de vérification ou code de secours**.',
                },
                {
                  text: 'Cliquez sur le bouton rouge `Désactiver la vérification`.',
                  result: 'Le message « La vérification en deux étapes a été désactivée. » apparaît ; le badge passe en jaune. Vous recevez l’email « Vérification en deux étapes désactivée ».',
                },
              ],
            },
          ],
        },
        {
          id: 'securite-changer-mot-de-passe',
          title: 'Changer votre mot de passe (connecté)',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Sécurité** et repérez la carte **Mot de passe**.',
                  where: 'sous la carte de vérification en deux étapes',
                },
                {
                  text: 'Saisissez votre **Mot de passe actuel**.',
                },
                {
                  text: 'Saisissez le **Nouveau mot de passe** (8 caractères minimum, dont une majuscule et un chiffre) puis **Confirmer le nouveau mot de passe**.',
                  note: 'Le nouveau mot de passe doit être différent de l’actuel. Choisissez-en un que vous n’utilisez sur aucun autre service.',
                },
                {
                  text: 'Cliquez sur `Modifier le mot de passe`.',
                  result: 'Le message « Votre mot de passe a été modifié. » apparaît. Vous recevez l’email « Votre mot de passe FETRAG a été modifié » et une notification « Mot de passe modifié ».',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Compte géré par un fournisseur d’identité',
              text: 'Si votre compte a été créé par un compte FETRAG externe, la carte affiche « Votre compte est géré par un fournisseur d’identité externe : le mot de passe se modifie depuis celui-ci. » et aucun formulaire.',
            },
          ],
        },
        {
          id: 'securite-activite-recente',
          title: 'Vérifier l’activité récente',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Sécurité** et faites défiler jusqu’à la carte **Activité récente**.',
                  result: 'Les 8 dernières entrées s’affichent : **Connexion**, **Mot de passe modifié**, **Vérification en deux étapes activée**, avec la date, l’heure et le navigateur utilisé.',
                },
                {
                  text: 'Si vous voyez une connexion que vous ne reconnaissez pas, changez immédiatement votre mot de passe et activez la vérification en deux étapes.',
                  note: 'Prévenez ensuite le support depuis la page **Contact**.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Le code ne correspond pas. Vérifiez l’heure de votre appareil et réessayez. »',
                  cause: 'L’heure du téléphone est décalée, ou le code a expiré pendant la saisie.',
                  solution: 'Réglez l’heure du téléphone en automatique, attendez un nouveau code et saisissez-le sans attendre.',
                },
                {
                  problem: '« Trop de tentatives. Réessayez dans {délai}. »',
                  cause: 'Plusieurs codes faux d’affilée (8 essais en 10 minutes pour l’activation, 6 pour la désactivation, 5 changements de mot de passe en 15 minutes).',
                  solution: 'Attendez le délai affiché, puis recommencez calmement.',
                },
                {
                  problem: '« Le mot de passe actuel est incorrect. »',
                  cause: 'Faute de frappe dans le mot de passe actuel.',
                  solution: 'Réessayez. Si vous l’avez oublié, déconnectez-vous et utilisez « Mot de passe oublié ? » sur la page **Connexion**.',
                },
                {
                  problem: 'Téléphone perdu et pas de code de secours.',
                  cause: 'Sans application ni code de secours, la connexion est bloquée.',
                  solution: 'Écrivez au support depuis la page **Contact** avec l’adresse email du compte : la Fédération vérifiera votre identité avant de lever la protection.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'demander-un-service',
      title: 'Comment demander un service',
      icon: 'clipboard-list',
      summary: 'Déposer une demande depuis le catalogue des services, obtenir une référence SRV et suivre son traitement dans **Mes demandes**.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Navigation principale', 'Services', 'Fiche du service', 'Déposer une demande'], href: '/services' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Services**.',
              where: 'navigation principale (ordinateur) ; sur mobile, bouton **Ouvrir le menu** puis **Services** ; ou, depuis votre espace, bouton `Nouvelle demande` en haut de **Mes demandes**',
              result: 'Le catalogue « Un appui concret aux travailleurs et aux organisations » s’affiche avec le nombre de services disponibles.',
            },
            {
              text: 'Ouvrez la fiche du service qui vous concerne.',
              result: 'La fiche présente le service et, sur la droite (ou sous le texte sur mobile), l’encadré **En bref** : tarif, délai indicatif, accès (**Ouvert à tous** ou **Compte FETRAG requis**).',
            },
            {
              text: 'Cliquez sur `Déposer une demande`.',
              where: 'en haut de la fiche',
              result: 'La page descend jusqu’à la section **Votre demande**.',
              note: 'Pour un service payant ou marqué **Compte FETRAG requis**, connectez-vous d’abord avec `Se connecter` : vous reviendrez automatiquement sur la fiche.',
            },
            {
              text: 'Vérifiez le groupe **Vos coordonnées** : **Nom complet** et **Adresse email** sont préremplis avec votre compte ; **Téléphone** et **Organisation** sont facultatifs.',
            },
            {
              text: 'Remplissez le groupe **Informations sur votre demande** : les champs dépendent du service (texte, date, liste **Sélectionner…**, case à cocher). Les champs marqués d’un astérisque sont obligatoires.',
              note: 'Un champ de type « fichier » demande seulement le nom du document ; le document lui-même vous sera demandé après le dépôt par le responsable du service. Aucune pièce jointe ne peut être envoyée depuis le formulaire.',
            },
            {
              text: 'Décrivez votre situation dans **Message complémentaire** (facultatif, 4 000 caractères maximum).',
              note: 'Ne transmettez jamais de mot de passe ni de numéro de carte bancaire dans un message.',
            },
            {
              text: 'Cochez la case **J’accepte que mes informations soient traitées par la FETRAG pour répondre à ma demande…** (obligatoire).',
            },
            {
              text: 'Cliquez sur `Déposer ma demande` (service gratuit) ou `Déposer et payer` (service payant).',
              where: 'en bas du formulaire',
              result: 'L’alerte **Demande enregistrée** affiche votre **Référence de suivi : SRV-AAAA-XXXXXX**. Vous recevez l’email « Votre demande {SRV-…} - {service} ».',
              note: 'Pour un service payant, vous êtes dirigé vers la page de paiement (voir « Comment payer une commande »). La demande n’est instruite qu’après confirmation du paiement.',
            },
            {
              text: 'Suivez l’avancement dans **Mes demandes**.',
              where: 'menu de gauche de votre espace ; ou bouton `Suivre ma demande` sous l’alerte de succès',
              result: 'Le tableau **Demandes de service** liste chaque demande : référence, service, date de dépôt, statut, **Suivi par** (nom du responsable ou « En attente d’attribution »), délai indicatif en jours.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’une demande de service (colonne Statut)',
          items: [
            { label: 'NOUVEAU', tone: 'info', meaning: 'Demande déposée, pas encore attribuée à un responsable.', next: 'Rien à faire : attendez l’attribution. Pour un service payant, réglez la commande si ce n’est pas fait.' },
            { label: 'EN EXAMEN', tone: 'info', meaning: 'Un responsable a pris votre demande, ou le paiement a été reçu ; la demande est analysée.', next: 'Répondez à l’email si le responsable vous demande un document.' },
            { label: 'EN COURS', tone: 'warning', meaning: 'Le traitement est engagé.', next: 'Attendez ; le délai indicatif est affiché sous le nom du service.' },
            { label: 'TRAITÉE', tone: 'success', meaning: 'Une réponse ou une action a été apportée.', next: 'Lisez l’email « Demande {SRV-…} : Traitée » qui contient le commentaire du responsable.' },
            { label: 'REFUSÉ', tone: 'danger', meaning: 'La demande n’a pas été retenue.', next: 'Le motif figure dans l’email de changement de statut. Vous pouvez écrire à la Fédération avec la référence.' },
            { label: 'CLÔTURÉ', tone: 'neutral', meaning: 'Dossier fermé, état final.', next: 'Déposez une nouvelle demande si votre situation évolue.' },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Une demande déposée ne se modifie pas',
          text: 'Vous ne pouvez ni modifier ni annuler une demande depuis votre espace, et il n’y a pas de page de détail par demande. Relisez le formulaire avant de le déposer. En cas d’erreur, écrivez à la Fédération depuis la page **Contact** en indiquant la référence SRV.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Connectez-vous pour déposer cette demande. » ou alerte **Compte FETRAG requis**.',
              cause: 'Le service est payant ou réservé aux comptes connectés.',
              solution: 'Cliquez sur `Se connecter` (ou `Créer un compte`) : après la connexion, vous revenez sur la fiche du service.',
            },
            {
              problem: '« Le formulaire est incomplet : vérifiez les champs signalés. »',
              cause: 'Un champ obligatoire est vide ou d’un format incorrect (date, nombre, email).',
              solution: 'Repérez chaque message rouge (« Champ obligatoire », « Date invalide », « Nombre attendu »…) et corrigez.',
            },
            {
              problem: '« Trop de demandes envoyées. Réessayez dans {délai}. »',
              cause: 'Plus de 5 demandes déposées en une heure.',
              solution: 'Attendez le délai indiqué. Une seule demande suffit par situation.',
            },
            {
              problem: 'Ma demande reste « NOUVEAU » avec « En attente d’attribution ».',
              cause: 'Aucun responsable ne l’a encore prise ; pour un service payant, le paiement n’est peut-être pas confirmé.',
              solution: 'Vérifiez dans **Paiements et reçus** que la commande est **PAYÉE**. Si le délai indicatif est dépassé, écrivez à la Fédération avec la référence SRV.',
            },
            {
              problem: '« Le paiement n’a pas pu être initié : vous pourrez le régler depuis votre espace personnel. »',
              cause: 'La demande est enregistrée mais la commande n’a pas pu être ouverte immédiatement.',
              solution: 'Ouvrez **Paiements et reçus** et cliquez sur `Payer` sur la ligne de la commande en attente.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'payer-une-commande',
      title: 'Comment payer une commande',
      icon: 'credit-card',
      summary: 'Le parcours de paiement sécurisé : moyen de paiement, code promotionnel, page de retour, reçu.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **commande** est créée automatiquement quand vous demandez un service payant, vous inscrivez à un événement payant ou achetez un document premium. Elle porte une référence **CMD-AAAA-XXXXXX** et reste **EN ATTENTE** jusqu’à la confirmation du paiement. Vos informations de paiement sont transmises directement au prestataire : la Fédération ne conserve aucune donnée bancaire.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Paiement de démonstration',
          text: 'Tant que la Fédération n’a pas raccordé un opérateur de paiement réel, la page de paiement fonctionne en **environnement de démonstration** : aucun débit réel n’est effectué et vous choisissez vous-même l’issue du paiement sur une page de simulation. La mention « Environnement de démonstration : aucun débit réel. » est alors affichée sous le choix du moyen de paiement.',
        },
      ],
      subsections: [
        {
          id: 'paiement-regler',
          title: 'Régler une commande',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la page de paiement.',
                  where: 'redirection automatique après `Déposer et payer`, `S’inscrire et payer` ou `Acheter pour…` ; sinon **Paiements et reçus** puis bouton `Payer` sur la ligne de la commande, ou `Régler la commande` dans son détail',
                  result: 'La page « Régler la commande CMD-… » s’affiche avec le ruban **Paiement sécurisé** et le badge de statut de la commande.',
                },
                {
                  text: 'Vérifiez le **Récapitulatif** : lignes de la commande, sous-total, remise éventuelle, **Total à régler**.',
                  where: 'à droite sur ordinateur, sous le formulaire sur mobile',
                },
                {
                  text: 'Si la Fédération ou votre organisation vous a transmis un code, saisissez-le dans **Code promotionnel** puis cliquez sur `Appliquer` (voir la sous-section suivante).',
                },
                {
                  text: 'Choisissez le **Moyen de paiement** : **Mobile Money** (Airtel Money ou Moov Money) ou **Carte bancaire** (Visa ou Mastercard).',
                  note: 'Le dernier moyen utilisé est présélectionné.',
                },
                {
                  text: 'Pour Mobile Money, vérifiez le **Numéro Mobile Money** : c’est le numéro qui recevra la demande de confirmation (par exemple 077 52 27 98).',
                  note: 'Il est prérempli avec le téléphone de votre profil ou votre dernière tentative.',
                },
                {
                  text: 'Cliquez sur `Payer {montant}`.',
                  where: 'en bas de la carte **Moyen de paiement**',
                  result: 'Le bouton affiche « Connexion au fournisseur de paiement », puis la page **Simuler le fournisseur de paiement** s’ouvre (environnement de démonstration).',
                  note: 'Quand un opérateur réel sera raccordé, la page affichera à la place les instructions de confirmation de l’opérateur ; suivez alors ce qui est écrit à l’écran.',
                },
                {
                  text: 'En démonstration, cliquez sur `Simuler un paiement réussi` (ou `Simuler un échec` pour tester).',
                  result: 'Vous arrivez sur la page de retour « Paiement confirmé » (ou « Le paiement n’a pas abouti »).',
                },
                {
                  text: 'Sur la page **Paiement confirmé**, cliquez sur les boutons de la carte **Ce que vous avez obtenu** pour ouvrir immédiatement ce que vous venez d’acquérir (module de formation, événement, document, demande prise en charge).',
                  result: 'Vous recevez l’email « Paiement confirmé - commande CMD-… » et une notification.',
                },
              ],
            },
          ],
        },
        {
          id: 'paiement-code-promotionnel',
          title: 'Appliquer un code promotionnel',
          blocks: [
            {
              type: 'callout',
              tone: 'warning',
              title: 'Un code appliqué ne se retire pas',
              text: 'Un seul code par commande, et il ne peut plus être retiré ni remplacé depuis le site. Un code n’est pas cumulable avec une prise en charge (montant payé pour vous par la Fédération ou votre organisation). Vérifiez le code avant de cliquer sur `Appliquer`.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Saisissez le code (2 à 40 caractères) dans **Code promotionnel**.',
                  where: 'en haut de la carte **Moyen de paiement** ; le bloc n’apparaît pas si un code ou une prise en charge est déjà appliqué',
                },
                {
                  text: 'Cliquez sur `Appliquer`.',
                  result: 'Le message « Code {CODE} appliqué : la remise a été déduite du total. » s’affiche ; le **Récapitulatif** montre la ligne **Remise** et le nouveau **Total à régler**.',
                  note: 'Si le total tombe à zéro, la commande est réglée immédiatement sans paiement.',
                },
                {
                  text: 'Poursuivez avec le choix du moyen de paiement et `Payer {montant}`.',
                },
              ],
            },
          ],
        },
        {
          id: 'paiement-page-de-retour',
          title: 'Lire la page de retour',
          blocks: [
            {
              type: 'steps',
              intro: 'Après chaque tentative, la page « Commande CMD-… » affiche un anneau de progression et l’un des trois états ci-dessous.',
              items: [
                {
                  text: '**Paiement confirmé** (anneau vert) : la carte **Votre reçu** affiche le numéro REC-… ; cliquez sur `Télécharger le PDF`.',
                  note: 'Si l’alerte « Le PDF du reçu est en cours de génération » est affichée, revenez dans quelques minutes depuis **Paiements et reçus**.',
                },
                {
                  text: '**Paiement en attente de confirmation** (anneau or) : validez la demande sur votre téléphone si vous avez choisi Mobile Money, puis cliquez sur `Actualiser le statut`.',
                  note: 'Vous pouvez fermer la page : le suivi reste disponible dans **Paiements et reçus**. En démonstration, `Terminer la simulation` vous ramène à la page de simulation.',
                },
                {
                  text: '**Le paiement n’a pas abouti** (anneau marine) : lisez le motif dans la carte **Relancer le paiement** puis cliquez sur `Réessayer le paiement`.',
                  result: 'Aucun montant n’a été débité. Vous revenez sur la page de paiement pour choisir le même moyen ou un autre.',
                },
                {
                  text: 'Utilisez les liens **Détail de la commande** et **Mon espace** en bas de page pour continuer.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts d’une commande (badge)',
              items: [
                { label: 'EN ATTENTE', tone: 'warning', meaning: 'Commande créée, paiement non confirmé.', next: 'Cliquez sur `Payer`. La commande est comptée dans le badge de **Paiements et reçus**.' },
                { label: 'PAYÉE', tone: 'success', meaning: 'Paiement confirmé ; reçu REC-… émis ; accès activés.', next: 'Téléchargez le reçu, ouvrez ce que vous avez obtenu.' },
                { label: 'ÉCHOUÉ', tone: 'danger', meaning: 'Dernière tentative refusée ou interrompue ; rien n’a été débité.', next: 'Cliquez sur `Réessayer le paiement`.' },
                { label: 'ANNULÉ', tone: 'neutral', meaning: 'Commande annulée ; elle ne peut plus être réglée.', next: 'Repassez commande depuis la page concernée (service, événement, document).' },
                { label: 'REMBOURSÉ', tone: 'info', meaning: 'Remboursement total effectué par le service financier.', next: 'Vous avez reçu l’email « Remboursement effectué - commande CMD-… ».' },
                { label: 'PARTIELLEMENT REMBOURSÉE', tone: 'info', meaning: 'Une partie du montant vous a été remboursée.', next: 'Le détail figure dans la carte **Paiements** du détail de la commande.' },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts d’une tentative de paiement (détail de la commande)',
              items: [
                { label: 'INITIÉ', tone: 'neutral', meaning: 'Tentative créée, prestataire pas encore sollicité ou sans réponse.' },
                { label: 'EN ATTENTE', tone: 'warning', meaning: 'Demande transmise à l’opérateur ; validation attendue sur le téléphone ou la page de simulation.' },
                { label: 'RÉUSSI', tone: 'success', meaning: 'Confirmé par le prestataire ; la commande passe PAYÉE.' },
                { label: 'ÉCHOUÉ', tone: 'danger', meaning: 'Refusé ou interrompu ; le motif est affiché.' },
                { label: 'ANNULÉ', tone: 'neutral', meaning: 'Tentative abandonnée, par exemple parce que vous avez changé de moyen de paiement.' },
                { label: 'REMBOURSÉ', tone: 'info', meaning: 'Montant de cette tentative rendu.' },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Commande introuvable - Le lien de paiement est invalide, expiré ou rattaché à un autre compte. »',
                  cause: 'Vous êtes connecté avec un autre compte que celui qui a passé la commande, ou le lien est incomplet.',
                  solution: 'Connectez-vous avec le bon compte, puis ouvrez **Paiements et reçus** et cliquez sur `Payer`.',
                },
                {
                  problem: '« Le numéro Mobile Money est requis »',
                  cause: 'Le champ est vide ou trop court (6 à 20 caractères).',
                  solution: 'Saisissez le numéro qui recevra la demande de confirmation.',
                },
                {
                  problem: '« Les paiements en ligne sont momentanément indisponibles. »',
                  cause: 'La Fédération a désactivé le paiement en ligne.',
                  solution: 'Contactez la Fédération pour régler par virement ou en espèces ; la commande restera **EN ATTENTE** en attendant.',
                },
                {
                  problem: '« Code promotionnel invalide. » ou « Une prise en charge est déjà appliquée : le code promotionnel n’est pas cumulable »',
                  cause: 'Code inexistant, expiré, déjà utilisé, ou commande déjà prise en charge.',
                  solution: 'Vérifiez le code auprès de la personne qui vous l’a transmis. Une prise en charge ne peut pas être combinée avec un code.',
                },
                {
                  problem: 'Le paiement reste « En attente de confirmation ».',
                  cause: 'L’opérateur n’a pas encore confirmé.',
                  solution: 'Cliquez sur `Actualiser le statut`. Si rien ne change, revenez plus tard dans **Paiements et reçus** ; si la tentative passe ÉCHOUÉ, cliquez sur `Réessayer le paiement`.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'suivre-mes-paiements',
      title: 'Comment retrouver mes commandes et mes reçus',
      icon: 'receipt',
      summary: 'La page **Paiements et reçus** liste vos commandes ; le détail d’une commande donne le reçu PDF, les tentatives de paiement et l’historique.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Mon compte', 'Paiements et reçus'], href: '/espace/paiements' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Paiements et reçus**.',
              where: 'menu de gauche ; le badge indique le nombre de commandes en attente',
              result: 'Le tableau liste vos commandes, 10 par page : référence CMD et date, contenu, montant, moyen de paiement, statut, actions.',
              note: 'Sur mobile, certaines colonnes sont masquées : le contenu et le statut sont rappelés sous la référence.',
            },
            {
              text: 'Pour ne voir qu’un type de commande, cliquez sur une pastille de **Filtrer par statut** : `Toutes`, `En attente`, `Payée`, `Échouée`, `Annulée`, `Remboursée`, `Partiellement remboursée`.',
              result: 'Le tableau se met à jour. Le message « Aucune commande pour ce statut » s’affiche si la liste est vide.',
            },
            {
              text: 'Cliquez sur `Détail` sur la ligne d’une commande.',
              result: 'La page « Commande CMD-… » s’ouvre : **Récapitulatif**, **Reçu**, **Ce que vous avez obtenu**, **Paiements**, **Historique**.',
            },
            {
              text: 'Dans la carte **Reçu**, cliquez sur `Télécharger le PDF`.',
              result: 'Le reçu numéroté REC-AAAA-XXXXXX s’ouvre dans un nouvel onglet.',
              note: 'Le lien de téléchargement est valable 15 minutes ; rouvrez la page pour en obtenir un nouveau. Sur mobile, le PDF s’ouvre dans le lecteur du téléphone : utilisez son bouton de partage pour l’enregistrer.',
            },
            {
              text: 'Consultez la carte **Paiements** pour comprendre chaque tentative : moyen, numéro Mobile Money, date, référence du prestataire, motif d’échec éventuel, remboursements.',
            },
            {
              text: 'Consultez la carte **Historique** pour suivre la vie de la commande : « Commande créée », « Nouvelle tentative de paiement », « Code {CODE} appliqué »…',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Le reçu est votre justificatif',
          text: 'Le reçu porte votre nom tel qu’il est dans votre profil. Vérifiez votre **Profil** avant de payer si vous avez besoin d’un justificatif pour votre employeur ou votre organisation.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Le PDF est en cours de génération ; il sera disponible dans quelques minutes. »',
              cause: 'Le reçu est créé en arrière-plan juste après la confirmation.',
              solution: 'Patientez quelques minutes puis rechargez la page.',
            },
            {
              problem: '« Aucun reçu tant que la commande n’est pas réglée. »',
              cause: 'La commande est EN ATTENTE ou ÉCHOUÉ.',
              solution: 'Cliquez sur `Régler la commande` en haut de la page.',
            },
            {
              problem: '« Commande introuvable - Cette commande n’existe pas ou n’est pas rattachée à votre compte. »',
              cause: 'Le lien vient d’une commande passée avec un autre compte.',
              solution: 'Connectez-vous avec le compte qui a passé la commande, puis cliquez sur `Mes paiements`.',
            },
            {
              problem: 'Je veux être remboursé.',
              cause: 'Le remboursement n’est pas automatique : il est décidé par le service financier.',
              solution: 'Écrivez à la Fédération depuis la page **Contact** en indiquant la référence CMD et le motif. Une fois effectué, la commande passe **REMBOURSÉ** et vous recevez un email.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'm-inscrire-a-une-formation',
      title: 'Comment m’inscrire à une formation',
      icon: 'graduation-cap',
      summary: 'Le site présente le programme de formation ; l’inscription se fait sur la plateforme de formation avec le même compte, et le suivi est visible dans **Mes inscriptions**.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Navigation principale', 'Formations', 'Fiche du module', 'S’inscrire à ce module'], href: '/formations' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Formations**.',
              where: 'navigation principale ; sur mobile, bouton **Ouvrir le menu** puis **Formations**',
              result: 'La page « Former les leaders syndicaux de demain » présente les 10 modules du programme, numérotés 01 à 10.',
            },
            {
              text: 'Filtrez si besoin avec les pastilles **Pilier** (Protection de l’outil de production, Prévention des conflits sociaux, Défense des intérêts matériels et moraux) et **Modalité** (À distance, En direct, Hybride), ou avec la barre **Recherche** puis `Rechercher`.',
              note: 'Sur mobile, les pastilles défilent horizontalement : faites-les glisser du doigt.',
            },
            {
              text: 'Ouvrez la fiche d’un module.',
              result: 'La fiche affiche les objectifs, le programme détaillé, les prérequis, les formateurs, les prochaines cohortes et l’encadré **Fiche du module** : durée, modalité, niveau, tarif, mode d’inscription, capacité.',
            },
            {
              text: 'Lisez la ligne **Inscription** de la fiche : **Inscription libre en ligne**, **Inscription sur validation de la coordination**, **Réservée aux organisations affiliées** ou **Inscription après paiement**.',
              note: 'Une **cohorte** est un groupe d’apprenants qui suivent le module ensemble, avec des dates de séances.',
            },
            {
              text: 'Cliquez sur `S’inscrire à ce module`.',
              where: 'en haut de la fiche, ou bouton vert en bas de l’encadré **Fiche du module**',
              result: 'Le cours s’ouvre sur la plateforme de formation, avec votre compte déjà connecté. Vous y confirmez l’inscription selon la politique du module.',
            },
            {
              text: 'De retour sur le site, ouvrez **Mes inscriptions** pour suivre vos formations.',
              where: 'menu de gauche de votre espace, ou avatar puis **Mes inscriptions**',
              result: 'La section **Formations** affiche une carte par module : anneau de progression, statut, cohorte, date de début, bouton `Continuer` ou `Revoir le cours`, et le numéro du certificat s’il est obtenu.',
            },
            {
              text: 'Pour reprendre rapidement, utilisez le bouton `Reprendre` de la carte **Mes formations en cours** du tableau de bord, ou le bouton vert `Reprendre ma formation` en bas du menu de gauche.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’une inscription à une formation (Mes inscriptions)',
          items: [
            { label: 'EN ATTENTE', tone: 'warning', meaning: 'Inscription soumise à la validation de la coordination, pas encore accordée.', next: 'Attendez la notification de validation.' },
            { label: 'ACTIF', tone: 'success', meaning: 'Inscription active : vous pouvez suivre le cours.', next: 'Cliquez sur `Continuer`.' },
            { label: 'TERMINÉ', tone: 'info', meaning: 'Parcours achevé.', next: 'Cliquez sur `Revoir le cours` ; vérifiez la carte **Certificats**.' },
            { label: 'SUSPENDUE', tone: 'warning', meaning: 'Inscription interrompue par la coordination.', next: 'Contactez la coordination pour connaître le motif.' },
            { label: 'ANNULÉ', tone: 'neutral', meaning: 'Inscription annulée.', next: 'Vous pouvez vous réinscrire si le module est ouvert.' },
            { label: 'EXPIRÉE', tone: 'neutral', meaning: 'Inscription arrivée à échéance sans être terminée.', next: 'Contactez la coordination.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Demande de formation pour un groupe',
          text: 'Le bouton **Déposer une demande de formation** (page **Formations** et pied de page) sert aux responsables d’organisation qui inscrivent plusieurs personnes. Ce lien ouvre la plateforme de formation ; avec un compte de membre, elle affiche la page **Vous devez être responsable d’une organisation** (espace **Organisation**), qui vous invite à demander votre désignation comme gestionnaire ou à contacter la Fédération. Si votre organisation souhaite une formation de groupe, adressez-vous à son responsable ou cliquez sur **Affilier mon organisation**.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La fiche affiche « Aucune session collective planifiée pour le moment ».',
              cause: 'Aucune cohorte n’est programmée.',
              solution: 'Inscrivez-vous quand même si l’inscription est libre (parcours individuel), ou cliquez sur `Être informé de l’ouverture` sur les fiches de repli.',
            },
            {
              problem: 'Le bouton d’inscription ouvre une page de connexion sur la plateforme.',
              cause: 'Votre session a expiré (14 jours) ou vous n’étiez pas connecté sur le site.',
              solution: 'Connectez-vous avec le même email et le même mot de passe : le compte est unique pour les deux sites.',
            },
            {
              problem: 'Une formation n’apparaît pas dans **Mes inscriptions**.',
              cause: 'L’inscription n’a pas été confirmée sur la plateforme, ou elle est en attente de validation.',
              solution: 'Ouvrez `Mes formations sur la plateforme` en haut de la page **Mes inscriptions** pour vérifier l’état sur la plateforme.',
            },
          ],
        },
        {
          type: 'links',
          title: 'Sur la plateforme de formation',
          items: [
            { label: 'Catalogue des formations', href: '{{lms}}/catalogue', description: 'Les 10 modules et leur inscription.', external: true, icon: 'graduation-cap' },
            { label: 'Mes formations', href: '{{lms}}/mes-formations', description: 'Votre progression, activité par activité.', external: true, icon: 'play' },
            { label: 'Mes certificats', href: '{{lms}}/certificats', description: 'Téléchargement de vos attestations et certificats (PDF et QR code).', external: true, icon: 'award' },
            { label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'Suivre un cours, passer une évaluation, déposer un devoir.', external: true, icon: 'book-open' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'm-inscrire-a-un-evenement',
      title: 'Comment m’inscrire à un événement',
      icon: 'calendar',
      summary: 'S’inscrire à une assemblée, une master class ou un webinaire, rejoindre une liste d’attente, annuler son inscription.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Navigation principale', 'Événements', 'Fiche de l’événement', 'Inscription'], href: '/evenements' },
      ],
      subsections: [
        {
          id: 'evenement-s-inscrire',
          title: 'S’inscrire',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Événements**.',
                  where: 'navigation principale ; sur mobile, bouton **Ouvrir le menu** puis **Événements**',
                  result: 'L’agenda « Les rendez-vous de la Fédération » affiche les événements à venir puis les événements passés.',
                },
                {
                  text: 'Filtrez si besoin avec les pastilles **Type** (Événement, Master Class, Webinaire, Assemblée, Formation).',
                  note: 'Les cartes indiquent la date, le lieu, l’heure, le prix ou **Gratuit**, et les mentions **Complet** ou **Terminé**.',
                },
                {
                  text: 'Cliquez sur **Détails et inscription** sur la carte de l’événement.',
                  result: 'La fiche affiche la date, les horaires (heure de Libreville), le lieu ou la mention **En ligne**, le programme et l’encadré **Inscription** : participation (**Gratuite** ou prix), places restantes.',
                },
                {
                  text: 'Si vous n’êtes pas connecté, cliquez sur `Se connecter pour s’inscrire`.',
                  result: 'Après la connexion, vous revenez automatiquement sur la fiche.',
                },
                {
                  text: 'Cliquez sur `S’inscrire gratuitement` (événement gratuit) ou `S’inscrire et payer {prix}` (événement payant).',
                  where: 'encadré **Inscription**',
                  result: 'Gratuit : l’alerte « Vous êtes inscrit - Votre place est confirmée. » s’affiche et vous recevez l’email « Inscription confirmée : {titre} ». Payant : vous êtes dirigé vers la page de paiement ; l’inscription est créée à la confirmation du paiement.',
                },
                {
                  text: 'Le jour de l’événement en ligne, revenez sur la fiche et cliquez sur `Rejoindre la séance en ligne`.',
                  note: 'Le bouton n’apparaît que pour les inscrits, avant l’événement, et si l’organisateur a renseigné un lien de visioconférence.',
                },
                {
                  text: 'Retrouvez vos inscriptions dans **Mes inscriptions**, carte **Événements**, et dans la carte **Prochains événements** du tableau de bord.',
                },
              ],
            },
          ],
        },
        {
          id: 'evenement-liste-d-attente',
          title: 'Rejoindre la liste d’attente',
          blocks: [
            {
              type: 'steps',
              intro: 'Quand un événement affiche **Complet**, vous pouvez vous inscrire en liste d’attente.',
              items: [
                {
                  text: 'Connecté : cliquez sur `Rejoindre la liste d’attente` dans l’encadré **Inscription**.',
                  result: 'L’alerte « Vous êtes sur la liste d’attente - Nous vous préviendrons par email dès qu’une place se libère. » s’affiche ; vous recevez l’email « Liste d’attente : {titre} ».',
                },
                {
                  text: 'Non connecté : remplissez **Nom complet** et **Adresse email** puis cliquez sur `Rejoindre la liste d’attente`.',
                  result: 'Le message « Vous êtes inscrit en position {n} sur la liste d’attente. » s’affiche.',
                },
                {
                  text: 'Surveillez votre messagerie : si une place se libère sur un événement gratuit, le premier de la liste est inscrit automatiquement et reçoit l’email « Une place s’est libérée : {titre} ».',
                  note: 'Pour un événement payant complet, la promotion n’est pas automatique : la Fédération vous contactera.',
                },
              ],
            },
          ],
        },
        {
          id: 'evenement-annuler',
          title: 'Annuler votre inscription',
          blocks: [
            {
              type: 'callout',
              tone: 'warning',
              title: 'Avant d’annuler',
              text: 'L’annulation est immédiate et libère votre place. Pour un événement payant, la commande reste enregistrée et aucun remboursement n’est automatique : écrivez à la Fédération avec la référence CMD si vous souhaitez un remboursement. Une participation déjà enregistrée par la Fédération ne peut plus être annulée.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la fiche de l’événement.',
                  where: 'depuis **Mes inscriptions** (carte **Événements**) ou **Événements**',
                },
                {
                  text: 'Cliquez sur `Annuler mon inscription`.',
                  where: 'sous l’alerte « Vous êtes inscrit »',
                  result: 'Le message « Votre inscription a été annulée. » s’affiche ; l’événement disparaît de votre espace.',
                },
                {
                  text: 'Pour vous réinscrire, cliquez de nouveau sur `S’inscrire gratuitement` (si des places restent).',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts d’une inscription à un événement',
              items: [
                { label: 'INSCRIT', tone: 'success', meaning: 'Place confirmée.', next: 'Le lien de séance en ligne apparaît sur la fiche s’il existe. Annulation possible.' },
                { label: 'LISTE D’ATTENTE', tone: 'warning', meaning: 'Événement complet ; vous attendez une place.', next: 'Surveillez vos emails ; promotion automatique pour les événements gratuits.' },
                { label: 'A PARTICIPÉ', tone: 'info', meaning: 'Présence enregistrée par la Fédération.', next: 'Une attestation de participation peut être délivrée ; annulation impossible.' },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: '« Les inscriptions à cet événement sont closes »',
                  cause: 'L’événement est terminé.',
                  solution: 'Consultez la fiche : un **Replay** ou un compte rendu peut être proposé.',
                },
                {
                  problem: '« Vous êtes déjà inscrit à cet événement. »',
                  cause: 'Une inscription existe déjà pour votre compte.',
                  solution: 'Rechargez la fiche : l’alerte « Vous êtes inscrit » doit apparaître.',
                },
                {
                  problem: '« L’inscription payante n’est pas encore ouverte pour cet événement. »',
                  cause: 'L’organisateur n’a pas encore rattaché de tarif en ligne.',
                  solution: 'Réessayez plus tard ou écrivez à la Fédération.',
                },
                {
                  problem: '« Une participation enregistrée ne peut pas être annulée »',
                  cause: 'Votre présence a déjà été pointée.',
                  solution: 'Aucune action possible ; contactez la Fédération en cas d’erreur.',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'consulter-les-ressources',
      title: 'Comment télécharger ou acheter un document',
      icon: 'folder',
      summary: 'La bibliothèque **Ressources** propose des documents en accès libre, réservés aux membres, à une organisation ou payants (premium).',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Navigation principale', 'Ressources', 'Fiche du document', 'Télécharger'], href: '/ressources' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Ressources**.',
              where: 'navigation principale ; sur mobile, bouton **Ouvrir le menu** puis **Ressources**',
              result: 'La page « Ressources documentaires » affiche les documents avec leur type, leur niveau d’accès, leur taille et leur date.',
              note: 'Connectez-vous d’abord avec `Se connecter pour les documents réservés` pour voir les documents réservés aux membres.',
            },
            {
              text: 'Filtrez avec la recherche ou les pastilles **Type**, **Catégorie** et **Accès** (Public, Membres, Organisation, Premium).',
            },
            {
              text: 'Sur la carte du document, cliquez sur `Télécharger` (fichier) ou `Consulter` (document hébergé sur un site externe). Pour en savoir plus, cliquez sur **Détails**.',
              result: 'Le fichier se télécharge ou s’ouvre dans un nouvel onglet ; la fiche affiche le type, l’auteur, la source, la date, la taille et les mots clés.',
            },
            {
              text: 'Pour un document **Premium**, cliquez sur `Acheter pour {prix}` dans l’encadré **Téléchargement** de la fiche.',
              result: 'Une commande est créée et la page de paiement s’ouvre. Après la confirmation, le bouton `Télécharger` apparaît sur la fiche et sur la page de retour du paiement.',
            },
            {
              text: 'Pour un document **Organisation** auquel vous n’avez pas accès, cliquez sur `Demander l’accès`.',
              result: 'La page **Contact** s’ouvre : indiquez le titre du document et votre organisation.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Niveaux d’accès (badge sur la carte du document)',
          items: [
            { label: 'Accès libre', tone: 'success', meaning: 'Téléchargeable par tous, sans compte.' },
            { label: 'Membres', tone: 'info', meaning: 'Réservé aux comptes connectés.', next: 'Connectez-vous.' },
            { label: 'Organisation', tone: 'warning', meaning: 'Réservé aux personnes rattachées à l’organisation concernée.', next: 'Demandez votre rattachement à la coordination ou cliquez sur `Demander l’accès`.' },
            { label: 'Premium', tone: 'neutral', meaning: 'Accessible après achat en ligne.', next: 'Cliquez sur `Acheter pour {prix}`.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Alerte « Accès réservé » sur la fiche.',
              cause: 'Le document est réservé aux membres d’une organisation à laquelle votre compte n’est pas rattaché.',
              solution: 'Cliquez sur `Demander l’accès` ou demandez votre rattachement à la coordination.',
            },
            {
              problem: 'Alerte « Trop de téléchargements ».',
              cause: 'Plus de 60 téléchargements en 10 minutes depuis votre connexion.',
              solution: 'Attendez quelques minutes.',
            },
            {
              problem: '« Fichier indisponible » ou « Le fichier de ce document sera mis en ligne prochainement. »',
              cause: 'Le fichier n’a pas encore été déposé par la Fédération.',
              solution: 'Revenez plus tard ou signalez-le depuis la page **Contact**.',
            },
            {
              problem: 'J’ai payé mais le bouton `Télécharger` n’apparaît pas.',
              cause: 'Le paiement n’est pas encore confirmé, ou vous êtes connecté avec un autre compte.',
              solution: 'Vérifiez dans **Paiements et reçus** que la commande est **PAYÉE**, puis rechargez la fiche avec le même compte.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'ecrire-a-la-federation',
      title: 'Comment écrire à la Fédération',
      icon: 'mail',
      summary: 'Les formulaires **Contact** et **Adhésion** enregistrent votre message avec une référence MSG et un accusé de réception ; connecté, vous le retrouvez dans **Mes demandes**.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Navigation principale', 'Contact', 'Envoyer un message'], href: '/contact' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Contact** (question, assistance, réclamation) ou **Adhésion** (rejoindre la Fédération, créer une section syndicale).',
              where: '**Contact** dans la navigation principale ; **Adhésion** dans le pied de page ou via `Affilier mon organisation` sur la page **Formations**',
              result: 'La page affiche les coordonnées du siège et le formulaire.',
            },
            {
              text: 'Connectez-vous avant d’écrire si vous voulez retrouver le message dans votre espace.',
              note: '**Nom complet** et **Adresse email** sont alors préremplis et le message est rattaché à votre compte.',
            },
            {
              text: 'Remplissez le formulaire : **Nom complet** et **Adresse email** (obligatoires), **Téléphone** et **Organisation ou employeur** (facultatifs), **Objet** (facultatif sur Contact), **Votre message** (obligatoire, 10 à 4 000 caractères).',
              note: 'Sur **Adhésion**, choisissez aussi **Votre démarche** dans la liste (informations, adhérer, créer une section, être orienté). Ne transmettez pas de données sensibles (mot de passe, numéro de carte).',
            },
            {
              text: 'Cochez la case de consentement (obligatoire).',
            },
            {
              text: 'Cliquez sur `Envoyer le message` (Contact) ou `Envoyer ma demande d’adhésion` (Adhésion).',
              where: 'en bas du formulaire',
              result: 'L’alerte **Message envoyé** ou **Demande enregistrée** affiche votre référence MSG-AAAA-XXXXXX. Vous recevez l’email « Nous avons bien reçu votre message ({MSG-…}) ».',
            },
            {
              text: 'Connecté, suivez le message dans **Mes demandes**, carte **Messages envoyés**.',
              result: 'Chaque message affiche son objet, sa référence, sa date, son type (Contact, Assistance, Adhésion / intérêt, Partenariat) et son statut ; « répondu le {date} » apparaît quand la Fédération a répondu.',
              note: 'La réponse elle-même arrive par email, à l’adresse indiquée dans le formulaire ; elle n’est pas affichée dans l’espace.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’un message envoyé',
          items: [
            { label: 'NOUVEAU', tone: 'info', meaning: 'Message reçu, pas encore pris en charge.' },
            { label: 'ASSIGNÉ', tone: 'warning', meaning: 'Une personne de la Fédération traite votre message.' },
            { label: 'RÉPONDU', tone: 'success', meaning: 'Une réponse vous a été envoyée par email.', next: 'Vérifiez votre messagerie, y compris le courrier indésirable.' },
            { label: 'CLÔTURÉ', tone: 'neutral', meaning: 'Échange terminé.', next: 'Envoyez un nouveau message si nécessaire.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Délais de réponse',
          text: 'Les pages du site annoncent une réponse sous cinq jours ouvrés ; l’email d’accusé de réception mentionne 48 heures ouvrées. Comptez cinq jours ouvrés avant de relancer.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Message trop court (10 caractères minimum) »',
              cause: 'Le message est vide ou trop court.',
              solution: 'Décrivez votre demande en une ou deux phrases au moins.',
            },
            {
              problem: '« Trop de messages envoyés depuis cette connexion. » ou « Trop de messages envoyés récemment, réessayez dans une heure »',
              cause: 'Plus de 5 messages en une heure depuis la même connexion ou la même adresse.',
              solution: 'Attendez une heure. Regroupez vos questions dans un seul message.',
            },
            {
              problem: 'Le message n’apparaît pas dans **Mes demandes**.',
              cause: 'Vous n’étiez pas connecté au moment de l’envoi.',
              solution: 'Conservez l’email d’accusé de réception : il contient la référence MSG. Écrivez connecté la prochaine fois.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'lettre-d-information',
      title: 'Comment m’abonner à la lettre d’information',
      icon: 'newspaper',
      summary: 'La lettre mensuelle de la Fédération, avec confirmation par email (double opt-in) et désinscription depuis votre profil.',
      blocks: [
        {
          type: 'steps',
          title: 'S’abonner',
          items: [
            {
              text: 'Faites défiler jusqu’à la section **Restez informé de l’action de la Fédération**.',
              where: 'en bas de la page d’accueil, de **Actualités**, de **Événements** ou de **Ressources**',
            },
            {
              text: 'Saisissez votre **Adresse email** et cochez la case **J’accepte de recevoir la lettre d’information de la FETRAG…**.',
            },
            {
              text: 'Cliquez sur `S’abonner`.',
              result: 'Le message « Un email de confirmation vient d’être envoyé à {adresse}. » remplace le formulaire.',
            },
            {
              text: 'Ouvrez l’email « Confirmez votre abonnement à la lettre de la FETRAG » et cliquez sur `Confirmer mon abonnement`.',
              result: 'Vous revenez sur la page d’accueil. Si l’adresse est celle de votre compte, le badge **Abonné à la lettre d’information** apparaît sur votre **Profil**.',
              note: 'La page d’accueil n’affiche pas de message de confirmation : le badge du profil est le seul retour visible. Cette double confirmation s’appelle le « double opt-in ».',
            },
            {
              text: 'Plus simple si vous avez un compte : sur **Profil**, activez **Lettre d’information** puis cliquez sur `Enregistrer mes consentements`.',
              result: 'L’abonnement est confirmé immédiatement, sans email de confirmation. Il en va de même si vous cochez la case de la lettre à la création du compte.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Se désabonner',
          items: [
            {
              text: 'Ouvrez **Profil** et désactivez l’interrupteur **Lettre d’information** dans la carte **Consentements**.',
              where: 'menu de gauche de votre espace',
            },
            {
              text: 'Cliquez sur `Enregistrer mes consentements`.',
              result: 'Le badge devient **Désinscrit de la lettre d’information**.',
              note: 'Nous recommandons cette méthode plutôt que le lien de désinscription figurant dans les emails.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Un email de confirmation vous a déjà été envoyé récemment. »',
              cause: 'Une demande est en attente depuis moins de 10 minutes.',
              solution: 'Cherchez l’email dans votre messagerie (y compris le courrier indésirable) ; réessayez après 10 minutes.',
            },
            {
              problem: '« Vous êtes déjà abonné à la lettre d’information de la FETRAG. »',
              cause: 'L’adresse est déjà confirmée.',
              solution: 'Rien à faire.',
            },
            {
              problem: 'Le lien de désinscription d’un email ne fonctionne pas.',
              cause: 'Page introuvable.',
              solution: 'Désabonnez-vous depuis **Profil** (consentement **Lettre d’information**) ou écrivez au support.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'verifier-un-certificat',
      title: 'Comment vérifier l’authenticité d’un certificat',
      icon: 'badge-check',
      summary: 'Toute personne peut vérifier un certificat ou une attestation FETRAG avec le code imprimé sous le QR code.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Pied de page', 'Vérifier un certificat'], href: '/certificats/verifier' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Vérifier un certificat**.',
              where: 'pied de page, ou bouton en haut de la page **Formations**, ou carte d’orientation sur **Contact**',
              result: 'La page « Vérifier l’authenticité d’un certificat » s’affiche.',
            },
            {
              text: 'Repérez sur le document le code à 12 caractères sous le QR code (forme ABCD-EFGH-IJKL) ou le numéro qui commence par FETRAG-.',
              note: 'Vous pouvez aussi scanner le QR code avec l’appareil photo du téléphone : il ouvre directement la page de résultat.',
            },
            {
              text: 'Saisissez-le dans **Code de vérification ou numéro du certificat**.',
              note: 'Les espaces et les minuscules sont acceptés (4 à 40 caractères, lettres, chiffres et tirets).',
            },
            {
              text: 'Cliquez sur `Vérifier l’authenticité`.',
              where: 'sous le champ',
              result: 'La page de résultat affiche un sceau et un badge : **Certificat valide**, **Certificat révoqué**, **Certificat expiré** ou **Certificat introuvable**, avec le titulaire, la formation et la date d’émission.',
            },
            {
              text: 'En cas de doute sur un document, cliquez sur `Signaler un document`.',
              result: 'La page **Contact** s’ouvre.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Résultat de la vérification',
          items: [
            { label: 'Certificat valide', tone: 'success', meaning: 'Le document est authentique et en cours de validité.' },
            { label: 'Certificat révoqué', tone: 'danger', meaning: 'Le document a été annulé par la coordination (erreur ou fraude).', next: 'Le titulaire peut contester auprès de la coordination.' },
            { label: 'Certificat expiré', tone: 'warning', meaning: 'La durée de validité est dépassée.' },
            { label: 'Certificat introuvable', tone: 'neutral', meaning: 'Aucun document ne correspond au code saisi.', next: 'Vérifiez la saisie ; si elle est exacte, le document n’a pas été émis par la FETRAG.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Vos propres certificats',
          text: 'Vos attestations et certificats se consultent et se téléchargent sur la plateforme de formation : bouton `Ouvrir` dans la carte **Certificats** de **Mes inscriptions**, ou `Voir` sur le tableau de bord. Le site institutionnel ne propose que la vérification publique.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'trouver-une-information',
      title: 'Comment trouver une information sur le site',
      icon: 'search',
      summary: 'La recherche, les questions fréquentes et les actualités.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Recherche**.',
              where: 'pied de page, colonne **Services** ; la page **Recherche** s’ouvre aussi depuis une page introuvable',
              result: 'La page « Que cherchez-vous ? » s’affiche.',
            },
            {
              text: 'Saisissez au moins deux caractères dans **Recherche**.',
              note: 'Vous pouvez restreindre la recherche avec la liste **Type de contenu** (actualités, pages, ressources, formations, services, événements) ; par défaut, tous les contenus sont recherchés.',
            },
            {
              text: 'Cliquez sur `Rechercher`.',
              where: 'à droite du champ (en dessous sur mobile)',
              result: 'Les résultats sont groupés par type ; le lien **Voir les {n} résultats** ouvre chaque groupe.',
            },
            {
              text: 'Pour les questions courantes, ouvrez **Questions fréquentes**.',
              where: 'pied de page (**Questions fréquentes** ou **FAQ**)',
              result: 'Un accordéon par thème : Questions générales, Adhésion et affiliation, Formation et certificats, Services aux adhérents, Compte et sécurité. Le bouton `Poser ma question` mène à **Contact**.',
            },
            {
              text: 'Pour suivre la vie de la Fédération, ouvrez **Actualités** : recherche, pastilles **Communiqués** et catégories, partage de chaque article.',
              where: 'navigation principale',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: '« Recherche trop courte »',
              cause: 'Moins de deux caractères saisis.',
              solution: 'Tapez un mot entier.',
            },
            {
              problem: '« Aucun résultat pour « {mot} » »',
              cause: 'Le mot n’apparaît dans aucun contenu du type choisi.',
              solution: 'Cliquez sur `Chercher dans tous les contenus` ou essayez un synonyme.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Les emails envoyés par le site, ce qui les déclenche, ce qu’il faut en faire, et la gestion du centre de notifications.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **notification** est un message court affiché dans votre espace (page **Notifications**, badge dans le menu de gauche et tuile **Notifications non lues** du tableau de bord). La plupart sont doublées d’un email. Les emails de sécurité, de paiement et de compte sont toujours envoyés ; les autres suivent vos préférences de **Profil**.',
        },
        {
          type: 'table',
          caption: 'Emails et notifications du compte',
          columns: ['Sujet de l’email', 'Quand', 'Ce qu’il faut faire'],
          rows: [
            ['Confirmez votre adresse email - FETRAG', 'À l’inscription et à chaque « Renvoyer le lien ».', 'Cliquer sur le lien dans les 24 heures.'],
            ['Bienvenue à la FETRAG', 'Après la confirmation de l’adresse.', 'Cliquer sur `Accéder à mon espace` pour vous connecter.'],
            ['Réinitialisation de votre mot de passe FETRAG', 'Après une demande sur « Mot de passe oublié ».', 'Cliquer sur le lien dans les 30 minutes.'],
            ['Votre mot de passe FETRAG a été modifié', 'Après une réinitialisation ou un changement depuis **Sécurité**.', 'Rien si c’est vous. Sinon, réinitialisez le mot de passe et prévenez le support.'],
            ['Vérification en deux étapes activée / désactivée', 'Après l’activation ou la désactivation.', 'Rien si c’est vous. Sinon, contactez le support immédiatement.'],
            ['Votre demande {SRV-…} - {service}', 'Au dépôt d’une demande de service.', 'Conserver la référence ; `Suivre ma demande` ouvre **Mes demandes**.'],
            ['Demande {SRV-…} : {statut}', 'À chaque changement de statut par la Fédération (notification dans la catégorie Demandes).', 'Lire le commentaire du responsable ; répondre si un document est demandé.'],
            ['Nous avons bien reçu votre message ({MSG-…})', 'Après un formulaire Contact, Adhésion, Partenariat ou Assistance.', 'Attendre la réponse par email (jusqu’à cinq jours ouvrés).'],
            ['Inscription confirmée : {événement}', 'Inscription gratuite, promotion depuis la liste d’attente ou paiement d’un événement.', 'Noter la date ; revenir sur la fiche le jour J pour le lien de séance en ligne.'],
            ['Liste d’attente : {événement} / Une place s’est libérée : {événement}', 'Entrée en liste d’attente / place attribuée automatiquement (événement gratuit).', 'Rien à faire dans le premier cas ; la place est confirmée dans le second.'],
            ['Inscription confirmée : {formation}', 'Inscription à une formation créée par un paiement.', 'Ouvrir le cours sur la plateforme.'],
            ['Paiement confirmé - commande {CMD}', 'Après confirmation d’un paiement.', 'Cliquer sur `Voir ma commande et mon reçu` pour télécharger le reçu.'],
            ['Paiement non abouti - commande {CMD}', 'Après un échec de paiement.', 'Cliquer sur `Réessayer le paiement`.'],
            ['Remboursement effectué - commande {CMD}', 'Après un remboursement par le service financier.', 'Vérifier le montant dans le détail de la commande.'],
            ['Confirmez votre abonnement à la lettre de la FETRAG', 'Après `S’abonner` sur le formulaire public.', 'Cliquer sur `Confirmer mon abonnement`.'],
            ['Convocation : {séance} - {date} / Rappel : {séance} demain / Résultat disponible / Certificat disponible', 'Si vous suivez une formation sur la plateforme.', 'Voir le guide de l’apprenant ; réglable dans **Profil**.'],
          ],
        },
        {
          type: 'steps',
          title: 'Gérer vos notifications',
          items: [
            {
              text: 'Ouvrez **Notifications**.',
              where: 'menu de gauche (le badge indique le nombre de non lues) ; ou avatar puis **Notifications**',
              result: 'La page « Vos notifications » liste les notifications, 20 par page, les plus récentes en premier. Une notification non lue a une bordure bleue et un point vert.',
            },
            {
              text: 'Cliquez sur `Non lues ({n})` pour n’afficher que celles que vous n’avez pas encore lues.',
              where: 'filtres en haut de la liste',
            },
            {
              text: 'Cliquez sur `Ouvrir` pour aller à la page concernée (commande, demande, événement).',
              result: 'La notification est marquée lue si la page est sur le site. Si elle mène à la plateforme de formation, elle reste non lue : cliquez aussi sur `Lu`.',
            },
            {
              text: 'Cliquez sur `Lu` pour marquer une notification sans l’ouvrir, ou sur `Tout marquer comme lu` en haut de la page.',
              result: 'Le message « {n} notification(s) marquée(s) comme lue(s). » s’affiche et le badge du menu diminue.',
            },
            {
              text: 'Cliquez sur `Notifications plus anciennes` en bas de la liste pour remonter dans le temps.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Je ne reçois pas les emails.',
              cause: 'Catégorie désactivée dans **Profil**, adresse non confirmée, ou emails classés en courrier indésirable.',
              solution: 'Vérifiez la carte **Notifications par email** du profil, puis le dossier « Courrier indésirable ». Ajoutez l’expéditeur à vos contacts.',
            },
            {
              problem: 'Le badge affiche encore un chiffre après lecture.',
              cause: 'Une notification ouverte vers la plateforme de formation n’est pas marquée lue automatiquement.',
              solution: 'Cliquez sur `Tout marquer comme lu`.',
            },
            {
              problem: 'Je veux supprimer une notification.',
              cause: 'La suppression n’existe pas.',
              solution: 'Marquez-la comme lue : elle perd sa mise en évidence et disparaît du filtre `Non lues`.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield',
      summary: 'Quelques habitudes pour protéger votre compte et vos données.',
      blocks: [
        {
          type: 'list',
          style: 'check',
          items: [
            'Déconnectez-vous toujours sur un appareil partagé ou prêté (menu du compte puis **Déconnexion**) : la session dure 14 jours.',
            'Activez la vérification en deux étapes et gardez vos 8 codes de secours en lieu sûr, hors du téléphone.',
            'Utilisez un mot de passe unique pour la FETRAG, jamais réutilisé ailleurs ; changez-le dès qu’une connexion inconnue apparaît dans **Activité récente**.',
            'Ne communiquez jamais votre mot de passe, même à une personne se présentant comme le support : la Fédération ne le demande jamais.',
            'Vérifiez l’expéditeur des emails avant de cliquer sur un lien ; en cas de doute, ouvrez le site vous-même et connectez-vous depuis la page **Connexion**.',
            'Ne saisissez jamais de mot de passe ou de numéro de carte dans un formulaire de contact ou un message complémentaire.',
            'Vos demandes de service et vos messages peuvent contenir des informations sensibles (conflit avec un employeur, santé, situation personnelle) : n’écrivez que ce qui est nécessaire, et depuis un appareil de confiance.',
            'Gardez votre **Profil** à jour (nom exact, téléphone) : ces informations figurent sur vos reçus et vos attestations, et servent aux convocations.',
            'Restez courtois dans les messages adressés à la Fédération et dans les forums de formation : ils engagent l’image de votre organisation.',
            'Conservez les références (SRV, CMD, REC, MSG) reçues par email : elles accélèrent tout échange avec la Fédération.',
            'Sur un réseau lent, privilégiez le Wi-Fi pour télécharger les documents et les reçus ; le site reste utilisable sur un petit écran.',
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
              question: 'Puis-je changer d’adresse email ?',
              answer: 'Pas depuis votre espace : l’adresse est votre identifiant de connexion et le champ est en lecture seule sur **Profil**. Écrivez au support depuis la page **Contact** en indiquant l’adresse actuelle et la nouvelle ; la Fédération vérifiera votre identité.',
            },
            {
              question: 'Dois-je créer un deuxième compte pour la plateforme de formation ?',
              answer: 'Non. Un seul compte sert aux deux sites. Une fois connecté sur le site institutionnel, cliquez sur **Plateforme de formation** : vous y êtes déjà connecté.',
            },
            {
              question: 'Je n’ai pas reçu l’email de confirmation après l’inscription.',
              answer: 'Attendez quelques minutes et regardez le dossier « Courrier indésirable ». Puis cliquez sur `Renvoyer le lien` sur la page **Vérifiez votre boîte mail** (au plus 3 envois par heure). Si l’adresse saisie était fausse, créez un nouveau compte avec la bonne adresse.',
            },
            {
              question: 'Combien de temps le lien de réinitialisation du mot de passe est-il valable ?',
              answer: '30 minutes, et il ne sert qu’une fois. Passé ce délai, cliquez sur `Demander un nouveau lien`.',
            },
            {
              question: 'La vérification en deux étapes est-elle obligatoire ?',
              answer: 'Non pour un membre : elle est facultative mais recommandée. L’alerte jaune du tableau de bord reste affichée tant qu’elle n’est pas activée. Elle est obligatoire seulement pour les personnels de la Fédération ayant un rôle administratif.',
            },
            {
              question: 'J’ai perdu mon téléphone avec l’application d’authentification.',
              answer: 'Connectez-vous avec l’un de vos codes de secours, puis désactivez et réactivez la vérification sur **Sécurité** avec votre nouveau téléphone. Sans code de secours, écrivez au support depuis la page **Contact**.',
            },
            {
              question: 'Puis-je modifier ou annuler une demande de service ?',
              answer: 'Non, pas depuis votre espace. Écrivez à la Fédération depuis la page **Contact** en indiquant la référence SRV et ce que vous souhaitez changer.',
            },
            {
              question: 'Le paiement Mobile Money ne m’envoie rien sur mon téléphone.',
              answer: 'Tant que la Fédération n’a pas raccordé un opérateur réel, le paiement fonctionne en environnement de démonstration : vous choisissez l’issue sur la page **Simuler le fournisseur de paiement**, sans débit réel. La mention « Environnement de démonstration » est affichée sur la page de paiement.',
            },
            {
              question: 'Où trouver mon reçu ?',
              answer: 'Dans **Paiements et reçus**, cliquez sur `Détail` sur la ligne de la commande puis sur `Télécharger le PDF` dans la carte **Reçu**. Le reçu est disponible quelques minutes après la confirmation du paiement.',
            },
            {
              question: 'Comment obtenir un remboursement ?',
              answer: 'Le remboursement n’est pas automatique. Écrivez à la Fédération avec la référence CMD et le motif ; le service financier décide et effectue le remboursement. Vous recevez alors l’email « Remboursement effectué ».',
            },
            {
              question: 'Puis-je m’inscrire à une formation directement sur le site ?',
              answer: 'Non : le site présente le programme et vous renvoie sur la plateforme de formation avec `S’inscrire à ce module`. Le suivi (progression, certificats) est ensuite visible dans **Mes inscriptions**.',
            },
            {
              question: 'Pourquoi ne puis-je pas déposer une **Demande de formation** ?',
              answer: 'Cette fonction est réservée aux responsables d’organisation qui inscrivent un groupe. Le lien ouvre la plateforme de formation, qui affiche alors la page **Vous devez être responsable d’une organisation** (espace **Organisation**) : elle vous invite à demander votre désignation comme gestionnaire ou à contacter la Fédération. Si votre organisation souhaite une formation, adressez-vous à son responsable ou à la coordination.',
            },
            {
              question: 'Où télécharger mon certificat ?',
              answer: 'Sur la plateforme de formation : bouton `Ouvrir` dans la carte **Certificats** de **Mes inscriptions**. Le site institutionnel ne propose que la vérification publique par code.',
            },
            {
              question: 'Puis-je supprimer mon compte ou obtenir mes données ?',
              answer: 'Il n’y a pas de bouton pour cela dans l’espace. Écrivez à la Fédération depuis la page **Contact** pour exercer vos droits, conformément à la politique de confidentialité.',
            },
            {
              question: 'Le site existe-t-il en anglais ?',
              answer: 'Pas encore : l’option « English (bientôt disponible) » du profil est désactivée. L’interface est en français.',
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
            { term: 'Espace personnel', definition: 'Les pages réservées à votre compte sur le site institutionnel : tableau de bord, profil, demandes, inscriptions, paiements, notifications, sécurité.' },
            { term: 'Tableau de bord', definition: 'Première page de votre espace (« Bonjour {prénom} ») : résumé de vos formations, événements, demandes, notifications, certificats et commandes.' },
            { term: 'Plateforme de formation', definition: 'Le second site de la Fédération, dédié aux cours en ligne. Votre compte y fonctionne sans nouvelle connexion.' },
            { term: 'Session', definition: 'La période pendant laquelle vous restez connecté sans ressaisir votre mot de passe : 14 jours, ou jusqu’à votre déconnexion.' },
            { term: 'Vérification en deux étapes', definition: 'Protection qui demande, en plus du mot de passe, un code temporaire à 6 chiffres généré par une application d’authentification sur votre téléphone. Aussi appelée MFA ou double authentification.' },
            { term: 'Application d’authentification', definition: 'Application gratuite (Google Authenticator, Microsoft Authenticator, Aegis, FreeOTP) qui affiche un code qui change toutes les 30 secondes.' },
            { term: 'Codes de secours', definition: 'Huit codes à usage unique remis à l’activation de la vérification en deux étapes, pour vous connecter si vous n’avez plus votre téléphone.' },
            { term: 'Jeton', definition: 'Clé unique cachée dans un lien envoyé par email (confirmation d’adresse, réinitialisation). Il a une durée de vie limitée et ne sert qu’une fois.' },
            { term: 'Consentement', definition: 'Votre accord, daté et enregistré, pour recevoir certaines communications (lettre d’information, informations sur les formations). Vous pouvez le retirer à tout moment.' },
            { term: 'Double opt-in', definition: 'Abonnement à la lettre d’information en deux temps : formulaire puis clic sur le lien de l’email de confirmation.' },
            { term: 'Notification', definition: 'Message court affiché dans votre espace (page **Notifications**), souvent doublé d’un email.' },
            { term: 'Demande de service', definition: 'Demande déposée depuis la fiche d’un service du catalogue. Elle reçoit une référence SRV-AAAA-XXXXXX et un statut qui évolue jusqu’à la clôture.' },
            { term: 'Référence', definition: 'Code unique d’un dossier : SRV (demande de service), CMD (commande), REC (reçu), MSG (message envoyé), FETRAG-AAAA-NNNNNN (certificat).' },
            { term: 'Commande', definition: 'Ensemble à régler (service payant, événement payant, document premium), identifié par une référence CMD, avec un statut (EN ATTENTE, PAYÉE, ÉCHOUÉ…).' },
            { term: 'Tentative de paiement', definition: 'Chaque essai de règlement d’une commande, avec son moyen, sa date et son résultat (INITIÉ, EN ATTENTE, RÉUSSI, ÉCHOUÉ…).' },
            { term: 'Mobile Money', definition: 'Paiement par porte-monnaie mobile (Airtel Money, Moov Money), choisi sur la page de paiement avec le numéro qui servira au règlement. Tant que la Fédération n’a pas raccordé d’opérateur réel, le paiement se termine sur la page de simulation.' },
            { term: 'Environnement de démonstration (bac à sable)', definition: 'Mode de paiement d’essai, sans débit réel, où vous choisissez vous-même l’issue du paiement.' },
            { term: 'Code promotionnel', definition: 'Code transmis par la Fédération ou votre organisation qui réduit le montant d’une commande. Un seul par commande, non retirable.' },
            { term: 'Prise en charge', definition: 'Montant réglé pour vous par la Fédération ou votre organisation, appliqué automatiquement à la commande. Non cumulable avec un code promotionnel.' },
            { term: 'Remboursement', definition: 'Restitution, totale ou partielle, d’un montant payé. Décidé et effectué par le service financier ; jamais automatique.' },
            { term: 'Reçu', definition: 'Justificatif de paiement numéroté REC-AAAA-XXXXXX, généré en PDF après confirmation du paiement.' },
            { term: 'Cohorte', definition: 'Groupe d’apprenants qui suivent un module ensemble, avec des dates de séances. « Parcours individuel » signifie que vous suivez le module seul, à votre rythme.' },
            { term: 'Liste d’attente', definition: 'File des personnes qui attendent une place sur un événement complet. Sur un événement gratuit, le premier de la liste est inscrit automatiquement quand une place se libère.' },
            { term: 'Ressource premium', definition: 'Document de la bibliothèque accessible après achat en ligne.' },
            { term: 'Certificat révoqué', definition: 'Certificat annulé par la coordination (erreur ou fraude) ; la vérification publique l’indique.' },
            { term: 'Pastille', definition: 'Petit bouton arrondi servant à filtrer une liste (par exemple `En attente`, `Payée`).' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'besoin-d-aide',
      title: 'Besoin d’aide ?',
      icon: 'life-buoy',
      summary: 'À qui s’adresser selon le problème, et ce qu’il faut indiquer dans votre message.',
      blocks: [
        {
          type: 'table',
          caption: 'Qui contacter',
          columns: ['Votre problème', 'À qui s’adresser', 'Comment'],
          rows: [
            ['Connexion impossible, email de confirmation jamais reçu, changement d’adresse email, compte désactivé, téléphone perdu sans code de secours', 'Support de la Fédération', 'Page **Contact**, objet « Assistance », en indiquant l’adresse email du compte.'],
            ['Demande de service : erreur dans le formulaire, délai dépassé, question sur le traitement', 'Responsable des services', 'Page **Contact** avec la référence SRV ; le nom du responsable figure dans **Suivi par**.'],
            ['Paiement bloqué, reçu manquant, demande de remboursement', 'Service financier', 'Page **Contact** avec la référence CMD (et REC si le reçu existe).'],
            ['Inscription à une formation, cohorte, certificat, rattachement à une organisation', 'Coordination de la formation', 'Page **Contact**, ou depuis la plateforme de formation.'],
            ['Adhésion, affiliation d’une organisation, partenariat, question institutionnelle', 'Secrétariat général', 'Page **Adhésion** ou **Contact** ; réponse sous cinq jours ouvrés.'],
            ['Situation urgente (conflit du travail en cours)', 'Permanence de la Fédération', 'Bouton `Joindre la permanence` sur la page **Services**, ou téléphone.'],
          ],
        },
        {
          type: 'list',
          title: 'Ce qu’il faut indiquer dans un message d’aide',
          style: 'check',
          items: [
            'L’adresse email de votre compte (jamais le mot de passe).',
            'La page concernée (par exemple « Paiements et reçus » ou « Sécurité ») et ce que vous essayiez de faire.',
            'Le message d’erreur exact, recopié tel qu’affiché à l’écran.',
            'La référence du dossier : SRV, CMD, REC ou MSG.',
            'L’appareil utilisé (téléphone ou ordinateur) et, si possible, le navigateur.',
            'La date et l’heure approximatives du problème.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Coordonnées de la Fédération des Travailleurs du Gabon : BP 1234 Libreville, Gabon. Téléphones : 066 23 00 33 et 077 52 27 98. Les coordonnées complètes et le plan d’accès figurent sur la page **Contact** et dans le pied de page de chaque page du site.',
        },
        {
          type: 'links',
          items: [
            { label: 'Écrire à la Fédération', href: '/contact', description: 'Formulaire de contact : une référence MSG et un accusé de réception par email.', icon: 'mail' },
            { label: 'Envoyer un email', href: 'mailto:jossngomafm@gmail.com', description: 'Adresse email de la Fédération.', icon: 'send' },
            { label: 'Appeler la Fédération', href: 'tel:+24166230033', description: '066 23 00 33 (ou 077 52 27 98).', icon: 'phone' },
            { label: 'Questions fréquentes', href: '/faq', description: 'Réponses aux questions courantes, par thème.', icon: 'help-circle' },
            { label: 'Mon espace', href: '/espace', description: 'Retour au tableau de bord.', icon: 'layout-dashboard' },
            { label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'Pour tout ce qui concerne le suivi d’un cours sur la plateforme de formation.', external: true, icon: 'graduation-cap' },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'La Fédération ne vous demandera jamais votre mot de passe',
          text: 'Aucun message d’aide, aucun appel ne doit contenir votre mot de passe ni vos codes de secours. Si quelqu’un vous les demande, refusez et signalez-le au support.',
        },
      ],
    },
  ],
  related: [
    {
      label: 'Guide de l’apprenant',
      href: '{{lms}}/guide',
      description: 'Suivre une formation sur la plateforme : cours, évaluations, devoirs, forums, certificats.',
      external: true,
    },
  ],
  selfAssessment: {
    intro:
      'Quatorze questions pour vérifier que vous savez où cliquer, ce que signifient les statuts et à qui vous adresser. Comptez cinq minutes ; après chaque réponse, le corrigé renvoie à la section du guide.',
    passPercent: 70,
    questions: [
      {
        id: 'q-compte-1',
        sectionId: 'confirmer-mon-adresse',
        type: 'single',
        prompt: 'Vous venez de cliquer sur `Créer mon compte`. Que devez-vous faire avant de pouvoir vous connecter ?',
        options: [
          { id: 'a', text: 'Attendre un appel de la Fédération qui activera le compte.', correct: false },
          { id: 'b', text: 'Ouvrir l’email « Confirmez votre adresse email - FETRAG » et cliquer sur son lien dans les 24 heures.', correct: true },
          { id: 'c', text: 'Rien : le compte est actif dès la création.', correct: false },
        ],
        explanation: 'Sans confirmation de l’adresse, la connexion est impossible : voir « Confirmer votre adresse email ».',
      },
      {
        id: 'q-compte-2',
        sectionId: 'creer-un-compte',
        type: 'multiple',
        prompt: 'Quelles règles le mot de passe doit-il respecter ?',
        options: [
          { id: 'a', text: 'Au moins 8 caractères.', correct: true },
          { id: 'b', text: 'Au moins une lettre majuscule.', correct: true },
          { id: 'c', text: 'Au moins un chiffre.', correct: true },
          { id: 'd', text: 'Au moins un caractère spécial comme # ou !.', correct: false },
        ],
        explanation: 'La règle affichée sous le champ est « 8 caractères minimum, une majuscule et un chiffre » : voir « Créer un compte ».',
      },
      {
        id: 'q-mdp-1',
        sectionId: 'mot-de-passe-oublie',
        type: 'single',
        prompt: 'Combien de temps le lien de réinitialisation du mot de passe reste-t-il valable ?',
        options: [
          { id: 'a', text: '30 minutes, et il ne sert qu’une fois.', correct: true },
          { id: 'b', text: '24 heures.', correct: false },
          { id: 'c', text: 'Sans limite, tant que le mot de passe n’a pas été changé.', correct: false },
        ],
        explanation: 'Le lien de réinitialisation expire après 30 minutes ; passé ce délai, cliquez sur `Demander un nouveau lien` : voir « Mot de passe oublié ».',
      },
      {
        id: 'q-deconnexion-1',
        sectionId: 'se-deconnecter',
        type: 'true-false',
        prompt: 'Sur un téléphone prêté, il suffit de fermer le navigateur pour être déconnecté du site.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La session reste ouverte 14 jours : utilisez **Déconnexion** dans le menu du compte ou en bas du menu mobile : voir « Se déconnecter ».',
      },
      {
        id: 'q-reperer-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Sur mobile, comment ouvrir la liste des rubriques de votre espace (Profil, Mes demandes, Paiements et reçus…) ?',
        options: [
          { id: 'a', text: 'Avec le bouton **Ouvrir la navigation** (trois traits) dans le bandeau « Espace personnel ».', correct: true },
          { id: 'b', text: 'En secouant le téléphone.', correct: false },
          { id: 'c', text: 'Ces rubriques ne sont pas disponibles sur mobile.', correct: false },
        ],
        explanation: 'Le menu de gauche de l’ordinateur devient un tiroir ouvert par **Ouvrir la navigation** : voir « Se repérer dans le site et dans votre espace ».',
      },
      {
        id: 'q-profil-1',
        sectionId: 'profil-informations',
        type: 'single',
        prompt: 'Vous voulez changer l’adresse email de votre compte. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je modifie le champ **Adresse email** sur la page **Profil** et j’enregistre.', correct: false },
          { id: 'b', text: 'J’écris au support depuis la page **Contact** : le champ est en lecture seule.', correct: true },
          { id: 'c', text: 'Je crée un nouveau compte et je perds mes inscriptions.', correct: false },
        ],
        explanation: 'L’adresse sert d’identifiant de connexion et n’est pas modifiable en libre-service : voir « Modifier vos informations ».',
      },
      {
        id: 'q-securite-1',
        sectionId: 'securite-activer-la-verification',
        type: 'single',
        prompt: 'Après l’activation de la vérification en deux étapes, un encadré jaune affiche 8 codes de secours. Que faut-il en faire ?',
        options: [
          { id: 'a', text: 'Les ignorer : ils seront affichés à chaque connexion.', correct: false },
          { id: 'b', text: 'Les copier ou les noter tout de suite et les conserver en lieu sûr : ils ne sont affichés qu’une seule fois.', correct: true },
          { id: 'c', text: 'Les envoyer par email au support pour qu’il les garde.', correct: false },
        ],
        explanation: 'Les codes de secours permettent de se connecter sans téléphone et ne sont plus jamais réaffichés : voir « Activer la vérification en deux étapes ».',
      },
      {
        id: 'q-service-1',
        sectionId: 'demander-un-service',
        type: 'true-false',
        prompt: 'Une demande de service déposée peut être modifiée ou annulée depuis **Mes demandes**.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La page **Mes demandes** permet seulement de suivre le statut ; pour corriger, écrivez à la Fédération avec la référence SRV : voir « Comment demander un service ».',
      },
      {
        id: 'q-paiement-1',
        sectionId: 'paiement-page-de-retour',
        type: 'single',
        prompt: 'Votre commande affiche le badge **ÉCHOUÉ**. Que signifie-t-il ?',
        options: [
          { id: 'a', text: 'Le montant a été débité mais la commande est perdue.', correct: false },
          { id: 'b', text: 'La dernière tentative n’a pas abouti, rien n’a été débité, et vous pouvez cliquer sur `Réessayer le paiement`.', correct: true },
          { id: 'c', text: 'La commande est annulée définitivement.', correct: false },
        ],
        explanation: 'ÉCHOUÉ n’est pas définitif : une nouvelle tentative remet la commande **EN ATTENTE** : voir « Lire la page de retour ».',
      },
      {
        id: 'q-paiement-2',
        sectionId: 'paiement-code-promotionnel',
        type: 'true-false',
        prompt: 'Un code promotionnel appliqué à une commande peut être retiré ensuite depuis le site.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Un seul code par commande, non retirable et non cumulable avec une prise en charge : voir « Appliquer un code promotionnel ».',
      },
      {
        id: 'q-recu-1',
        sectionId: 'suivre-mes-paiements',
        type: 'single',
        prompt: 'Où télécharger le reçu d’une commande payée ?',
        options: [
          { id: 'a', text: 'Dans **Paiements et reçus**, bouton `Détail` de la commande, puis `Télécharger le PDF` dans la carte **Reçu**.', correct: true },
          { id: 'b', text: 'Dans **Mes inscriptions**, carte **Certificats**.', correct: false },
          { id: 'c', text: 'Sur la page **Contact**, en demandant au support.', correct: false },
        ],
        explanation: 'Le reçu REC-… est disponible quelques minutes après la confirmation, depuis le détail de la commande : voir « Comment retrouver mes commandes et mes reçus ».',
      },
      {
        id: 'q-evenement-1',
        sectionId: 'evenement-annuler',
        type: 'single',
        prompt: 'Votre inscription à un événement affiche **A PARTICIPÉ**. Pouvez-vous l’annuler ?',
        options: [
          { id: 'a', text: 'Oui, avec le bouton `Annuler mon inscription`.', correct: false },
          { id: 'b', text: 'Non : une participation enregistrée par la Fédération ne peut plus être annulée.', correct: true },
          { id: 'c', text: 'Oui, mais seulement depuis la plateforme de formation.', correct: false },
        ],
        explanation: 'L’annulation n’est possible que tant que la présence n’a pas été pointée : voir « Annuler votre inscription ».',
      },
      {
        id: 'q-formation-1',
        sectionId: 'm-inscrire-a-une-formation',
        type: 'single',
        prompt: 'Sur la fiche d’un module, vous cliquez sur `S’inscrire à ce module`. Que se passe-t-il ?',
        options: [
          { id: 'a', text: 'Le cours s’ouvre sur la plateforme de formation, avec votre compte déjà connecté.', correct: true },
          { id: 'b', text: 'Une commande est créée immédiatement et il faut payer sur le site.', correct: false },
          { id: 'c', text: 'Un formulaire d’inscription s’affiche sur le site institutionnel.', correct: false },
        ],
        explanation: 'Le site ne crée aucune inscription : il renvoie sur la plateforme, où l’inscription se confirme selon la politique du module : voir « Comment m’inscrire à une formation ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'multiple',
        prompt: 'Que faut-il indiquer dans un message d’aide à la Fédération ?',
        options: [
          { id: 'a', text: 'L’adresse email de votre compte.', correct: true },
          { id: 'b', text: 'Le message d’erreur exact et la page concernée.', correct: true },
          { id: 'c', text: 'Votre mot de passe, pour que le support puisse vérifier.', correct: false },
          { id: 'd', text: 'La référence du dossier (SRV, CMD, REC ou MSG).', correct: true },
        ],
        explanation: 'La Fédération ne demande jamais votre mot de passe ni vos codes de secours : voir « Besoin d’aide ? ».',
      },
    ],
  },
}
