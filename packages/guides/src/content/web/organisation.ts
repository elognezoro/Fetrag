import type { Guide } from '@fetrag/contracts'

/**
 * Guide du responsable d’organisation (site institutionnel, rôle ORG_MANAGER).
 *
 * Périmètre vérifié dans le code : le rôle est attribué par la Fédération (rôle ORG_MANAGER à portée
 * organisation, ou case « Responsable de l’organisation » sur l’appartenance). Sur le site, il n’ouvre
 * aucun écran d’administration : le responsable utilise les formulaires publics (adhésion, partenariat,
 * contact), le catalogue des services (demandes au nom de l’organisation), son espace personnel
 * (demandes, paiements, reçus, notifications) et la passerelle vers la plateforme de formation, où se
 * trouvent les demandes de formation, les participants et les rapports (guide LMS de l’organisation).
 * Les prises en charge sont créées par la Fédération (rôle Finance) pour un bénéficiaire identifié par
 * son adresse email ; elles s’appliquent automatiquement au paiement du bénéficiaire.
 */
export const webOrganisation: Guide = {
  id: 'web-organisation',
  platform: 'web',
  role: 'ORG_MANAGER',
  title: 'Guide du responsable d’organisation',
  subtitle: 'Représenter votre organisation sur le site de la Fédération',
  audience:
    'Ce guide s’adresse aux responsables d’une organisation affiliée ou partenaire de la FETRAG (syndicat, section syndicale, entreprise) qui représentent leur structure auprès de la Fédération : demande d’affiliation, demandes de service, partenariat, prises en charge de formations pour leurs membres et suivi des formations demandées pour leurs cadres.',
  summary:
    'Avec votre compte de responsable d’organisation, vous utilisez le site institutionnel pour demander l’affiliation ou un partenariat, déposer des demandes de service au nom de votre organisation, régler et suivre vos paiements et vos reçus, et écrire à la Fédération. Les demandes de formation, la désignation des participants et le suivi de leur progression se font sur la plateforme de formation, avec le même compte. Ce guide décrit chaque écran du site, ce que vous y faites, ce que vous faites sur la plateforme, et comment les deux se répondent.',
  tone: 'green',
  icon: 'building',
  readingMinutes: 40,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte FETRAG dont l’adresse email est confirmée (le lien de confirmation est envoyé à cette adresse).',
    'Le rattachement de votre compte comme responsable de votre organisation, effectué par la Fédération à votre demande (aucune auto-désignation n’est possible sur le site).',
    'Le nom exact de votre organisation, tel qu’il figure dans ses statuts, pour le citer dans vos demandes.',
    'Un téléphone ou un ordinateur connecté à Internet, avec accès à votre messagerie (email) : les accusés de réception, les décisions et les reçus y sont envoyés.',
    'Pour les services payants : un compte Mobile Money (Airtel Money ou Moov Money) ou une carte bancaire.',
  ],
  quickStart: [
    {
      text: 'Créez votre compte depuis la page **Inscription**, puis confirmez votre adresse email en cliquant sur le lien reçu.',
      ui: 'Créer mon compte',
      where: 'bouton `Espace personnel` en haut à droite du site (sur mobile : bouton **Ouvrir le menu**, trois traits en haut à droite, puis `Connexion`), lien vers l’inscription sous le formulaire',
      result: 'La page de confirmation s’affiche, puis l’email « Confirmez votre adresse email - FETRAG » arrive dans votre boîte.',
    },
    {
      text: 'Demandez à la Fédération de rattacher votre compte comme responsable de votre organisation, depuis la page **Contact**.',
      ui: 'Envoyer le message',
      where: 'menu du site > **Contact**, formulaire en bas de page',
      result: 'L’encart vert **Message envoyé** affiche une référence de suivi MSG-… et un accusé de réception vous est envoyé par email.',
      note: 'Indiquez l’adresse email de votre compte, le nom exact de votre organisation et votre fonction dans celle-ci.',
    },
    {
      text: 'Attendez la notification « Vous êtes désormais responsable de « votre organisation » sur la plateforme FETRAG ».',
      where: 'menu de gauche de votre espace > **Notifications** (sur mobile : bouton **Ouvrir la navigation**, trois traits)',
      result: 'La notification apparaît dans votre espace ; vous pouvez désormais déposer des demandes de formation sur la plateforme.',
    },
    {
      text: 'Vérifiez que votre organisation figure dans l’annuaire **Organisations affiliées** et, sinon, déposez une demande d’affiliation.',
      ui: 'Affilier mon organisation',
      where: 'pied de page du site > colonne **Institution** > **Organisations affiliées** ; bouton en haut de la page',
      result: 'La carte de votre organisation apparaît dans l’annuaire, ou le formulaire **Adhésion et affiliation** s’ouvre.',
    },
    {
      text: 'Ouvrez la plateforme de formation pour déposer une demande de formation pour vos cadres.',
      ui: 'Plateforme de formation',
      where: 'bouton vert de l’en-tête du site ou de votre espace personnel',
      result: 'La plateforme s’ouvre sans nouvelle connexion, avec votre espace **Organisation**.',
    },
    {
      text: 'Activez la vérification en deux étapes pour protéger les données de votre organisation.',
      ui: 'Activer la vérification en deux étapes',
      where: 'menu de gauche de votre espace > **Sécurité**',
      result: 'Le badge **Vérification en deux étapes active** apparaît en haut de la page.',
    },
  ],
  sections: [
    // -------------------------------------------------------------------------
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'building',
      summary: 'Ce que le rôle de responsable d’organisation vous permet de faire, ce qu’il ne permet pas, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous représentez votre organisation (syndicat, section syndicale ou entreprise) auprès de la Fédération. Le site institutionnel vous sert à faire connaître votre organisation, à demander des services en son nom, à régler vos commandes et à dialoguer avec la Fédération. La **plateforme de formation** (le second site de la FETRAG, réservé aux formations) vous sert à demander des formations pour vos cadres et à suivre vos participants. Un seul compte ouvre les deux.',
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez faire sur le site',
          style: 'check',
          items: [
            'Demander l’affiliation de votre organisation ou l’accompagnement à la création d’une section (page **Adhésion et affiliation**).',
            'Vérifier comment votre organisation apparaît dans l’annuaire public **Organisations affiliées** et demander la mise à jour de sa fiche.',
            'Proposer un partenariat au nom de votre organisation ou de votre entreprise (page **Partenariat**).',
            'Déposer des demandes de service au nom de votre organisation (conseil juridique, médiation, négociation, formation sur mesure…) et suivre leur avancement dans **Mes demandes**.',
            'Régler les services payants en ligne (Mobile Money ou carte bancaire), appliquer un code promotionnel et télécharger vos reçus numérotés dans **Paiements et reçus**.',
            'Demander à la Fédération une prise en charge (financement total ou partiel) d’une formation ou d’un événement pour un membre de votre organisation.',
            'Recevoir les notifications du site : rattachement à votre organisation, avancement de vos demandes, paiements, prises en charge.',
            'Passer sur la plateforme de formation, avec le même compte, pour tout ce qui concerne les formations de vos cadres.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous ne pouvez pas faire sur le site',
          style: 'bullet',
          items: [
            'Vous désigner vous-même responsable : le rattachement est fait par la Fédération, à votre demande.',
            'Modifier la fiche de votre organisation dans l’annuaire (nom, acronyme, secteur, ville, description, site web, nombre d’adhérents, logo) : seule la coordination le fait ; vous demandez la mise à jour par le formulaire **Contact**.',
            'Accéder à l’espace d’administration du site : le lien **Administration du site** n’apparaît pas dans votre menu, c’est normal.',
            'Voir les demandes de service, les messages, les commandes, les reçus ou les prises en charge des autres membres de votre organisation : chaque personne ne voit que ce qu’elle a déposé ou payé elle-même.',
            'Payer à la place d’un membre ou créer une prise en charge : la prise en charge est enregistrée par la Fédération pour un bénéficiaire précis et s’applique automatiquement à son paiement.',
            'Inscrire quelqu’un d’autre à une formation depuis le site : vous vous inscrivez pour vous-même ; les participants d’une formation demandée pour votre organisation sont désignés sur la plateforme de formation.',
            'Modifier ou annuler en ligne une demande de service ou un message déjà envoyé : vous écrivez à la Fédération en citant la référence.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Interlocuteur', 'Ce qu’il fait', 'Quand le solliciter'],
          rows: [
            ['Secrétariat général de la Fédération', 'Affiliation, partenariat, courrier officiel, orientation', 'Demande d’affiliation, proposition de partenariat, question institutionnelle'],
            ['Coordination formation', 'Rattachement des responsables, fiche de l’organisation, demandes de formation, cohortes, certificats', 'Devenir responsable, changer de responsable, mettre à jour la fiche de l’organisation, question sur une formation demandée'],
            ['Responsable des services', 'Instruction des demandes de service (référence SRV-…)', 'Question sur l’avancement d’une demande de service, pièce à transmettre'],
            ['Finance / contrôle', 'Commandes, paiements, reçus, remboursements, prises en charge', 'Prise en charge d’une formation pour un membre, paiement effectué mais non visible, reçu manquant'],
            ['Support', 'Assistance de premier niveau', 'Problème de connexion, mot de passe, adresse email, page en erreur'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Deux façons d’être responsable',
          text: 'Selon la manière dont la Fédération vous a rattaché, le menu de votre compte affiche la pastille **RESPONSABLE D’ORGANISATION** ou simplement **APPRENANT**. Dans les deux cas, vos droits sont les mêmes : ce guide vous est accessible et l’espace **Organisation** de la plateforme de formation vous est ouvert.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer',
      icon: 'log-in',
      summary: 'Créer votre compte, confirmer votre adresse email, vous connecter, protéger votre compte et vous déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre compte FETRAG est unique : la même adresse email et le même mot de passe ouvrent le site institutionnel et la plateforme de formation. Quand vous passez de l’un à l’autre, vous restez connecté : aucune nouvelle saisie n’est demandée.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Le champ « Organisation ou employeur » ne rattache pas votre compte',
          text: 'À l’inscription, le champ **Organisation ou employeur** est un simple texte d’information. Il ne fait pas de vous le responsable de votre organisation. Le rattachement se demande à la Fédération après la création du compte (voir « Comment devenir responsable de mon organisation »).',
        },
      ],
      subsections: [
        {
          id: 'creer-mon-compte',
          title: 'Créer mon compte',
          blocks: [
            {
              type: 'steps',
              intro: 'Si vous avez déjà un compte FETRAG (par exemple pour suivre une formation), passez directement à la connexion.',
              items: [
                {
                  text: 'Cliquez sur `Espace personnel`.',
                  where: 'en haut à droite du site (sur mobile : bouton **Ouvrir le menu**, trois traits en haut à droite, puis `Connexion`)',
                  result: 'La page de connexion « Bienvenue à la FETRAG » s’affiche.',
                },
                {
                  text: 'Cliquez sur le lien d’inscription proposé sous le formulaire de connexion.',
                  result: 'Le formulaire d’inscription s’affiche.',
                },
                {
                  text: 'Renseignez **Prénom** et **Nom** (obligatoires, 2 à 60 caractères chacun).',
                  note: 'Sur ordinateur, les deux champs sont côte à côte ; sur mobile, l’un sous l’autre.',
                },
                {
                  text: 'Renseignez votre **Adresse email** (obligatoire).',
                  note: 'Elle servira d’identifiant de connexion : utilisez une adresse que vous consultez régulièrement, car les accusés de réception et les reçus y sont envoyés.',
                },
                {
                  text: 'Renseignez, si vous le souhaitez, **Téléphone** et **Organisation ou employeur** (facultatifs).',
                  note: 'Le téléphone accepte de 6 à 20 caractères parmi les chiffres, le signe +, l’espace, les parenthèses, le point et le tiret. Le nom d’organisation est limité à 160 caractères.',
                },
                {
                  text: 'Choisissez un **Mot de passe** puis répétez-le dans **Confirmer le mot de passe**.',
                  note: 'Règle imposée : 8 caractères minimum (128 maximum), au moins une majuscule et au moins un chiffre. Les deux saisies doivent être identiques, sinon le message « Les mots de passe ne correspondent pas » s’affiche.',
                },
                {
                  text: 'Cochez la case d’acceptation des conditions (obligatoire) et, si vous le souhaitez, la case de la lettre d’information (facultative).',
                  note: 'Sans la première case, le message « Vous devez accepter les conditions » apparaît.',
                },
                {
                  text: 'Cliquez sur `Créer mon compte`.',
                  where: 'en bas du formulaire',
                  result: 'La page de confirmation d’inscription s’affiche et l’email « Confirmez votre adresse email - FETRAG » vous est envoyé.',
                },
                {
                  text: 'Ouvrez cet email et cliquez sur le lien de validation.',
                  where: 'dans votre messagerie (vérifiez le dossier des courriers indésirables)',
                  result: 'La page de vérification confirme votre adresse ; vous recevez ensuite l’email « Bienvenue à la FETRAG ».',
                },
              ],
            },
          ],
        },
        {
          id: 'me-connecter',
          title: 'Me connecter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur `Espace personnel`.',
                  where: 'en haut à droite du site (sur mobile : bouton **Ouvrir le menu**, trois traits, puis `Connexion`)',
                  result: 'Le formulaire « Bienvenue à la FETRAG » s’affiche.',
                },
                {
                  text: 'Saisissez votre **Adresse email** et votre **Mot de passe** (obligatoires).',
                  note: 'L’icône en forme d’œil affiche le mot de passe pour vérifier la saisie.',
                },
                {
                  text: 'Cliquez sur `Se connecter`.',
                  where: 'en bas du formulaire',
                  result: 'Votre espace personnel s’ouvre (ou la page que vous vouliez consulter, si vous y avez été redirigé).',
                },
                {
                  text: 'Ouvrez le menu de votre compte pour vérifier votre rôle.',
                  where: 'vos initiales (ou votre photo), en haut à droite',
                  result: 'Le menu affiche votre nom, votre adresse email et une pastille de rôle : **RESPONSABLE D’ORGANISATION** ou **APPRENANT** selon votre mode de rattachement.',
                  note: 'La vérification en deux étapes n’est jamais imposée à un responsable d’organisation ; elle reste fortement recommandée.',
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
                  text: 'Cliquez sur le lien de mot de passe oublié.',
                  where: 'sous le formulaire de connexion',
                  result: 'La page de réinitialisation demande votre adresse email.',
                },
                {
                  text: 'Saisissez l’adresse email de votre compte puis validez.',
                  result: 'Un message vous invite à consulter votre boîte email.',
                },
                {
                  text: 'Ouvrez l’email « Réinitialisation de votre mot de passe FETRAG » et cliquez sur le lien.',
                  where: 'dans votre messagerie',
                  result: 'La page de nouveau mot de passe s’affiche.',
                },
                {
                  text: 'Choisissez un nouveau mot de passe (8 caractères minimum, une majuscule, un chiffre) puis validez.',
                  result: 'Vous pouvez vous connecter avec ce mot de passe ; l’email « Votre mot de passe FETRAG a été modifié » confirme le changement.',
                },
              ],
            },
          ],
        },
        {
          id: 'verification-deux-etapes',
          title: 'Activer la vérification en deux étapes',
          blocks: [
            {
              type: 'paragraph',
              text: 'La **vérification en deux étapes** ajoute, en plus du mot de passe, un code temporaire à 6 chiffres généré par une application d’authentification installée sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis, FreeOTP). Elle protège les informations de votre organisation si votre mot de passe est deviné.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone.',
                  note: 'Depuis la boutique d’applications de votre téléphone ; ces applications sont gratuites.',
                },
                {
                  text: 'Ouvrez **Sécurité** dans votre espace.',
                  where: 'menu de gauche > **Mon compte** > **Sécurité** (sur mobile : bouton **Ouvrir la navigation**, trois traits, puis **Sécurité**)',
                  result: 'La page « Protéger mon compte » s’affiche avec le badge **Vérification en deux étapes inactive**.',
                },
                {
                  text: 'Cliquez sur `Activer la vérification en deux étapes`.',
                  where: 'carte **Vérification en deux étapes**',
                  result: 'Un code QR et une clé à saisir manuellement apparaissent (Étape 1).',
                },
                {
                  text: 'Scannez le code QR avec l’application d’authentification, ou saisissez-y la clé affichée.',
                  result: 'L’application affiche un code à 6 chiffres qui change toutes les 30 secondes.',
                },
                {
                  text: 'Saisissez ce code dans **Code à 6 chiffres affiché par l’application** (Étape 2) puis validez.',
                  result: 'Le message **Vérification en deux étapes activée** s’affiche ; le badge devient **Vérification en deux étapes active**.',
                  note: 'À chaque connexion, le code de l’application vous sera demandé après le mot de passe.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Gardez votre téléphone d’authentification',
              text: 'Si vous changez de téléphone sans désactiver la vérification au préalable, vous ne pourrez plus vous connecter seul. Contactez alors le support depuis la page **Contact** : seul le super administrateur peut réinitialiser la vérification.',
            },
          ],
        },
        {
          id: 'me-deconnecter',
          title: 'Me déconnecter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez le menu de votre compte.',
                  where: 'vos initiales, en haut à droite (sur mobile : bouton **Ouvrir le menu**, trois traits, puis bouton `Déconnexion` en bas du tiroir)',
                },
                {
                  text: 'Cliquez sur `Déconnexion`.',
                  where: 'dernier élément du menu, en rouge',
                  result: 'Le site revient à la page d’accueil ; le bouton `Espace personnel` réapparaît en haut à droite.',
                  note: 'Pendant l’action, le bouton affiche « Déconnexion en cours ». La déconnexion vaut aussi pour la plateforme de formation.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'danger',
              title: 'Appareil partagé ou prêté',
              text: 'Déconnectez-vous toujours après avoir utilisé un ordinateur ou un téléphone qui n’est pas le vôtre (cybercafé, téléphone d’un collègue). Sinon, la personne suivante accède à vos demandes, à vos paiements et à l’espace de votre organisation.',
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
      summary: 'Les zones de l’en-tête du site, de votre espace personnel et de la navigation sur mobile.',
      blocks: [
        {
          type: 'screen',
          title: 'L’en-tête du site (toutes les pages)',
          description: 'La barre du haut est identique sur toutes les pages publiques du site.',
          areas: [
            {
              name: 'Navigation principale (ordinateur)',
              purpose: 'Les rubriques **La FETRAG**, **Actualités**, **Formations**, **Services**, **Ressources**, **Événements** et **Contact**. Les pages **Adhésion**, **Organisations affiliées** et **Partenariat** sont accessibles depuis le pied de page, colonne **Institution**.',
              icon: 'menu',
            },
            {
              name: 'Bouton **Ouvrir le menu** (mobile et petits écrans)',
              purpose: 'Un bouton rond à trois traits, en haut à droite, ouvre un tiroir avec toutes les rubriques et leur description. En bas du tiroir : le bloc vert **Plateforme de formation**, puis les boutons `Mon espace` et `Déconnexion`.',
              icon: 'smartphone',
            },
            {
              name: 'Lien vert **Plateforme de formation**',
              purpose: 'Ouvre la plateforme de formation dans le même navigateur, sans nouvelle connexion. Sur les écrans moyens, seule l’icône (diplôme) est visible.',
              icon: 'graduation-cap',
            },
            {
              name: 'Menu de votre compte (vos initiales, en haut à droite)',
              purpose: 'Votre nom, votre email, la pastille de rôle, puis **Mon espace**, **Mon profil**, **Mes inscriptions**, **Notifications**, **Sécurité**, **Plateforme de formation** et, en rouge, **Déconnexion**.',
              icon: 'user',
            },
            {
              name: 'Pied de page',
              purpose: 'Colonne **Institution** : **Organisations affiliées**, **Adhésion**, **Partenariat**. Colonne **Formation** : **Demande de formation** (ouvre l’assistant de la plateforme), **Vérifier un certificat**. Colonne **Services** : **Espace personnel**, **Questions fréquentes**.',
              icon: 'map-pin',
            },
          ],
        },
        {
          type: 'screen',
          title: 'Votre espace personnel (page « Bonjour »)',
          description: 'La page qui s’ouvre après la connexion ou depuis **Mon espace**. Elle est commune à tous les membres : aucune tuile n’est propre au rôle de responsable, car les données de votre organisation sont sur la plateforme de formation.',
          areas: [
            {
              name: 'Menu de gauche (ordinateur)',
              purpose: 'Rubrique **Mon compte** : **Tableau de bord**, **Profil**, **Mes demandes**, **Mes inscriptions**, **Paiements et reçus** (badge = commandes en attente), **Notifications** (badge = non lues), **Sécurité**. Bloc **Formation** : **Plateforme de formation**. En bas : bouton vert `Reprendre ma formation`.',
              icon: 'layout-dashboard',
            },
            {
              name: 'Bouton **Ouvrir la navigation** (mobile)',
              purpose: 'Sous 1024 px de large, le menu de gauche disparaît. Un bandeau blanc « Espace personnel / votre nom » porte un bouton rond à trois traits qui ouvre le même menu dans un tiroir ; il se referme automatiquement après un clic.',
              icon: 'smartphone',
            },
            {
              name: 'En-tête « Tableau de bord »',
              purpose: 'Le message « Bonjour prénom » et le bouton vert `Plateforme de formation`. Une alerte orange **Renforcez la sécurité de votre compte** reste affichée tant que la vérification en deux étapes n’est pas activée.',
              icon: 'home',
            },
            {
              name: 'Quatre tuiles',
              purpose: '**Formations en cours**, **Certificats obtenus**, **Demandes en cours** (hors demandes clôturées ou refusées) et **Notifications non lues**. Sur mobile, deux tuiles par ligne.',
              icon: 'bar-chart',
            },
            {
              name: 'Cartes du bas',
              purpose: '**Mes formations en cours**, **Prochains événements**, **Dernières demandes** (nom du service, référence SRV-…, date, statut) et **Certificats et reçus** avec la sous-liste **Dernières commandes**.',
              icon: 'clipboard-list',
            },
          ],
        },
        {
          type: 'path',
          label: 'Chemin vers vos demandes',
          items: ['Menu de gauche', 'Mon compte', 'Mes demandes'],
          href: '/espace/demandes',
        },
        {
          type: 'path',
          label: 'Chemin vers vos paiements',
          items: ['Menu de gauche', 'Mon compte', 'Paiements et reçus'],
          href: '/espace/paiements',
        },
        {
          type: 'path',
          label: 'Chemin vers l’espace de votre organisation',
          items: ['Bouton vert Plateforme de formation', 'Menu du compte', 'Organisation'],
          href: '{{lms}}/organisation',
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Sur smartphone',
          text: 'Deux boutons à trois traits existent : **Ouvrir le menu** (en haut à droite, navigation du site) et **Ouvrir la navigation** (dans le bandeau de votre espace, rubriques de votre compte). Les tableaux de vos demandes et de vos paiements masquent certaines colonnes sur petit écran : la référence, la date et le statut sont alors rappelés sous le nom du service ou de la commande.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'devenir-responsable',
      title: 'Comment devenir responsable de mon organisation',
      icon: 'user-plus',
      summary: 'Obtenir le rattachement de votre compte à votre organisation, avec le rôle de responsable.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le rôle de responsable est attribué par la coordination de la Fédération, jamais par vous-même. Vous en faites la demande une fois votre compte créé et votre adresse email confirmée. Plusieurs responsables sont possibles pour une même organisation : demandez un accès nominatif pour chaque personne plutôt que de partager un mot de passe.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Créez votre compte et confirmez votre adresse email (voir « Avant de commencer »).',
              result: 'Vous pouvez vous connecter à votre espace personnel.',
            },
            {
              text: 'Ouvrez la page **Contact**.',
              where: 'menu du site > **Contact** (sur mobile : bouton **Ouvrir le menu**, trois traits, puis **Contact**)',
              result: 'La page « Nous écrire ou nous rencontrer » s’affiche avec les coordonnées de la Fédération et le formulaire.',
            },
            {
              text: 'Renseignez l’**Objet** du message, par exemple « Accès responsable d’organisation ».',
              note: 'L’objet est facultatif mais recommandé : entre 3 et 160 caractères s’il est renseigné.',
            },
            {
              text: 'Rédigez **Votre message** : l’adresse email de votre compte, le nom exact de votre organisation, votre fonction dans celle-ci et, si possible, le nom de la personne qui peut confirmer votre mandat.',
              note: 'Le message doit contenir au moins 10 caractères (4 000 maximum). Ne transmettez pas de mot de passe.',
            },
            {
              text: 'Cochez la case de consentement puis cliquez sur `Envoyer le message`.',
              where: 'en bas du formulaire',
              result: 'L’encart vert **Message envoyé** affiche la référence MSG-AAAA-XXXXXX ; l’email « Nous avons bien reçu votre message » vous est envoyé.',
            },
            {
              text: 'Attendez le traitement par la coordination, puis consultez vos **Notifications**.',
              where: 'menu de gauche de votre espace > **Notifications**',
              result: 'La notification « Vous êtes désormais responsable de « votre organisation » sur la plateforme FETRAG : vous pouvez déposer des demandes de formation et suivre vos participants. » apparaît.',
              note: 'Aucun email dédié n’est envoyé pour le rattachement : c’est la notification du site qui fait foi. Si vous êtes ajouté comme simple membre, la notification indique « Votre compte a été rattaché à « votre organisation » ».',
            },
            {
              text: 'Ouvrez le menu de votre compte pour constater le changement.',
              where: 'vos initiales, en haut à droite',
              result: 'La pastille affiche **RESPONSABLE D’ORGANISATION** (si la coordination vous a attribué le rôle) ou **APPRENANT** (si elle a coché la case « Responsable de l’organisation » sur votre appartenance). Dans les deux cas, l’espace **Organisation** est disponible sur la plateforme de formation.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Changement de responsable',
          text: 'Quand une autre personne prend la responsabilité de l’organisation, demandez à la coordination, par le formulaire **Contact**, de rattacher son compte et de retirer le vôtre. Le retrait est fait par la Fédération : la personne retirée ne peut plus déposer de demandes de formation ni consulter les rapports de l’organisation. Le dernier responsable d’une organisation ne peut pas être retiré sans remplaçant.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Aucune notification de rattachement après plusieurs jours.',
              cause: 'La coordination n’a pas encore traité votre message, ou l’adresse email indiquée ne correspond pas à celle de votre compte.',
              solution: 'Vérifiez dans **Mes demandes** > **Messages envoyés** le statut de votre message (Nouveau, Assigné, Répondu). Écrivez à nouveau en citant la référence MSG-… et en confirmant l’adresse email exacte de votre compte.',
            },
            {
              problem: 'Le menu de mon compte affiche **APPRENANT** alors que je suis responsable.',
              cause: 'Vous avez été désigné par la case « Responsable de l’organisation » de votre appartenance, sans attribution du rôle explicite.',
              solution: 'Ce n’est pas une erreur : vos droits sont identiques. Vérifiez que l’espace **Organisation** apparaît dans le menu de votre compte sur la plateforme de formation.',
            },
            {
              problem: 'Le lien **Administration du site** n’apparaît pas dans mon menu.',
              cause: 'Le rôle de responsable d’organisation n’ouvre aucun écran d’administration du site.',
              solution: 'C’est normal. Vos écrans sont votre espace personnel sur le site et l’espace **Organisation** de la plateforme de formation.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'demander-affiliation',
      title: 'Comment demander l’affiliation de mon organisation',
      icon: 'handshake',
      summary: 'Déposer une demande d’affiliation, de création de section ou d’orientation auprès du Secrétariat général.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page **Adhésion et affiliation** présente les raisons d’adhérer, les situations possibles et les quatre étapes de l’affiliation : **Déposer une demande**, **Entretien avec le Secrétariat général** (un responsable vous contacte sous cinq jours ouvrés), **Examen par les instances** (Bureau exécutif) et **Bienvenue à la FETRAG** (courrier officiel d’affiliation, accès à la plateforme, aux services et aux ressources). Sur le site, vous déposez la demande ; la suite se déroule avec la Fédération, hors ligne.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la page **Adhésion**.',
              where: 'pied de page > colonne **Institution** > **Adhésion** ; ou page **Organisations affiliées** > bouton `Affilier mon organisation`',
              result: 'La page « Ensemble, plus forts » s’affiche avec un en-tête doré et le fil d’Ariane « Adhésion ».',
            },
            {
              text: 'Lisez la section « Qui peut adhérer » pour identifier votre situation : **Une organisation syndicale**, **Des travailleurs sans section** ou **Un travailleur à titre individuel**.',
            },
            {
              text: 'Cliquez sur `Déposer ma demande`.',
              where: 'en haut de la page',
              result: 'La page descend jusqu’au formulaire « Demande d’adhésion ou d’information ».',
            },
            {
              text: 'Vérifiez **Nom complet** et **Adresse email** (obligatoires ; pré-remplis si vous êtes connecté).',
              note: 'Connectez-vous avant d’envoyer : le message sera alors visible dans **Mes demandes** > **Messages envoyés**. Un message envoyé sans connexion ne peut pas être rattaché à votre compte ensuite.',
            },
            {
              text: 'Renseignez **Téléphone** (facultatif) et **Organisation ou employeur** (facultatif, 160 caractères maximum) avec le nom exact de votre organisation.',
            },
            {
              text: 'Choisissez **Votre démarche** : « Adhérer à une organisation affiliée » pour affilier un syndicat existant, ou « Créer une section syndicale dans mon entreprise » pour être accompagné dans la création d’une section.',
              note: 'Les autres choix, « Obtenir des informations sur la Fédération » (valeur par défaut) et « Être orienté vers un service de la FETRAG », servent aux demandes d’information.',
            },
            {
              text: 'Renseignez, si possible, **Secteur d’activité**, **Employeur** et **Fonction occupée** (facultatifs).',
              note: 'Exemples de secteur : énergie, transport, santé, éducation. Ces informations accélèrent l’entretien avec le Secrétariat général.',
            },
            {
              text: 'Rédigez **Votre message** (obligatoire, 10 caractères minimum) : présentation de l’organisation, effectifs, entreprise ou secteur, coordonnées de la personne à contacter.',
              note: 'Ne transmettez pas de données sensibles (mot de passe, numéro de carte). Les statuts et documents officiels seront demandés lors de l’entretien.',
            },
            {
              text: 'Cochez la case de consentement puis cliquez sur `Envoyer ma demande d’adhésion`.',
              where: 'en bas du formulaire (bouton pleine largeur sur mobile)',
              result: 'L’encart vert **Demande enregistrée** affiche « Votre demande d’adhésion a bien été enregistrée. Un responsable de la Fédération vous contactera sous cinq jours ouvrés. » et la « Référence de suivi : MSG-AAAA-XXXXXX ».',
            },
            {
              text: 'Notez la référence et conservez l’email « Nous avons bien reçu votre message (MSG-…) ».',
              result: 'L’encart bleu **Et maintenant ?** rappelle que la référence sert à toute correspondance avec la Fédération.',
              note: 'L’email d’accusé de réception annonce une réponse sous 48 heures ouvrées ; la page annonce cinq jours ouvrés. Retenez le délai de cinq jours ouvrés pour l’entretien.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statut de votre message dans « Messages envoyés »',
          items: [
            { label: 'Nouveau', tone: 'info', meaning: 'Votre demande est reçue, pas encore prise en charge.', next: 'Attendez le contact du Secrétariat général.' },
            { label: 'Assigné', tone: 'warning', meaning: 'Une personne de la Fédération suit votre demande.', next: 'Préparez les documents de votre organisation pour l’entretien.' },
            { label: 'Répondu', tone: 'success', meaning: 'La Fédération vous a répondu (par email ou téléphone) ; la date apparaît sous la ligne.', next: 'Consultez votre messagerie et suivez les indications reçues.' },
            { label: 'Clôturé', tone: 'neutral', meaning: 'La demande est terminée.', next: 'Pour une nouvelle démarche, envoyez un nouveau message.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Ce que le site n’affiche pas',
          text: 'Le formulaire d’adhésion est un message adressé à la Fédération, pas un dossier d’affiliation avec des étapes visibles en ligne. Vous ne verrez pas de statut « Affiliée » dans votre espace : c’est le courrier officiel d’affiliation qui fait foi, puis l’apparition de votre organisation dans l’annuaire **Organisations affiliées**.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Message « Certains champs sont incomplets ou invalides. »',
              cause: 'Un champ obligatoire est vide ou mal rempli (message trop court, email invalide, téléphone au mauvais format, consentement non coché).',
              solution: 'Repérez le texte rouge sous chaque champ signalé, corrigez, puis renvoyez.',
            },
            {
              problem: 'Message « Trop de messages envoyés depuis cette connexion. Réessayez dans N minute(s). »',
              cause: 'Limite de sécurité : 5 envois de formulaire par heure depuis la même connexion, et 5 par heure pour une même adresse email.',
              solution: 'Attendez le délai indiqué. Regroupez vos informations dans un seul message plutôt que d’en envoyer plusieurs.',
            },
            {
              problem: 'Message « Votre message n’a pas pu être envoyé. Réessayez dans quelques instants. »',
              cause: 'Incident technique passager.',
              solution: 'Patientez quelques minutes puis renvoyez. Si le problème persiste, appelez la permanence aux numéros indiqués en bas de page.',
            },
            {
              problem: 'Aucun email d’accusé de réception.',
              cause: 'L’email est arrivé dans les courriers indésirables, ou l’adresse saisie comporte une faute.',
              solution: 'Vérifiez le dossier des indésirables. Si vous étiez connecté, la référence figure dans **Mes demandes** > **Messages envoyés**.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'annuaire-organisations',
      title: 'Comment vérifier la fiche de mon organisation dans l’annuaire',
      icon: 'globe',
      summary: 'Retrouver votre organisation dans l’annuaire public et demander la mise à jour de sa fiche.',
      blocks: [
        {
          type: 'paragraph',
          text: 'L’annuaire **Organisations affiliées et partenaires** est public : tout visiteur peut y voir votre organisation. N’y figurent que les organisations affiliées actives, dans la limite de 200, triées par nombre d’adhérents décroissant puis par nom. Chaque carte affiche le logo ou l’acronyme, le nom, le secteur, la ville, une description courte, le nombre d’adhérents et, s’il existe, un lien vers le site web de l’organisation.',
        },
        {
          type: 'steps',
          title: 'Retrouver ma fiche',
          items: [
            {
              text: 'Ouvrez la page **Organisations affiliées**.',
              where: 'pied de page > colonne **Institution** > **Organisations affiliées**',
              result: 'La page « Organisations affiliées et partenaires » s’affiche avec le nombre d’organisations référencées.',
            },
            {
              text: 'Filtrez par secteur en cliquant sur la puce de votre secteur.',
              where: 'ligne de filtres **Secteur**, sous l’en-tête (`Tous les secteurs` rétablit la liste complète)',
              result: 'Le compteur indique « N organisation(s) référencée(s) dans le secteur « votre secteur » ».',
            },
            {
              text: 'Repérez la carte de votre organisation et vérifiez chaque information : nom, acronyme, secteur, ville, description, nombre d’adhérents, site web.',
              note: 'Sur mobile, les cartes s’affichent en une colonne ; la description est tronquée à trois lignes.',
            },
            {
              text: 'Cliquez, le cas échéant, sur le lien du site web pour vérifier qu’il ouvre le bon site.',
              result: 'Le site de l’organisation s’ouvre dans une nouvelle fenêtre (mention « site externe, nouvelle fenêtre »).',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Demander une mise à jour de la fiche',
          intro: 'Vous ne pouvez pas modifier la fiche vous-même : la coordination de la Fédération s’en charge à votre demande.',
          items: [
            {
              text: 'Ouvrez la page **Contact** et renseignez l’**Objet** « Mise à jour de la fiche de notre organisation ».',
              where: 'menu du site > **Contact**',
            },
            {
              text: 'Indiquez dans **Votre message** le nom exact de l’organisation et, pour chaque information à corriger, la valeur actuelle et la valeur souhaitée (nom, acronyme, secteur, adresse, ville, téléphone, email, site web, nombre d’adhérents, description).',
              note: 'Pour un logo, précisez que vous en disposez : la coordination vous indiquera comment le transmettre. Aucun fichier ne peut être joint au formulaire.',
            },
            {
              text: 'Cochez le consentement puis cliquez sur `Envoyer le message`.',
              result: 'La référence MSG-… s’affiche ; suivez le message dans **Mes demandes** > **Messages envoyés** (statut Nouveau, Assigné, Répondu, Clôturé).',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Mon organisation n’apparaît pas dans l’annuaire.',
              cause: 'Elle n’est pas encore enregistrée comme affiliée active par la Fédération, ou son affiliation est en cours d’examen.',
              solution: 'Si l’affiliation est acquise (courrier officiel reçu), écrivez à la coordination via **Contact** pour demander le référencement. Sinon, déposez une demande d’affiliation depuis le bouton `Affilier mon organisation`.',
            },
            {
              problem: 'La page affiche « Aucune organisation dans le secteur « X » ».',
              cause: 'Le filtre de secteur est actif et votre organisation est enregistrée sous un autre secteur.',
              solution: 'Cliquez sur `Voir tout l’annuaire` ou sur `Tous les secteurs`, puis cherchez la carte. Demandez ensuite la correction du secteur via **Contact**.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'proposer-partenariat',
      title: 'Comment proposer un partenariat',
      icon: 'handshake',
      summary: 'Transmettre une proposition de coopération au nom de votre organisation ou de votre entreprise.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page **Partenariat** décrit cinq façons de coopérer (**Partenariat institutionnel**, **Formation et expertise**, **Soutien financier ou mécénat**, **Média et communication**, **Coopération internationale**), les engagements de la Fédération et les quatre étapes : **Proposer un partenariat**, **Échange avec le Secrétariat général** (rendez-vous proposé sous dix jours ouvrés), **Validation par les instances**, **Convention et mise en œuvre** avec bilan annuel. Les informations transmises restent confidentielles jusqu’à la signature d’une éventuelle convention.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la page **Partenariat**.',
              where: 'pied de page > colonne **Institution** > **Partenariat** ; ou page **Organisations affiliées** > bouton `Devenir partenaire`',
              result: 'La page « Construire des coopérations utiles aux travailleurs » s’affiche avec un en-tête vert.',
            },
            {
              text: 'Cliquez sur `Proposer un partenariat`.',
              where: 'en haut de la page',
              result: 'La page descend jusqu’au formulaire.',
            },
            {
              text: 'Vérifiez **Nom complet** et **Adresse email** (obligatoires) et renseignez **Téléphone** (facultatif).',
            },
            {
              text: 'Renseignez **Organisation ou entreprise** (obligatoire ici, 2 à 160 caractères).',
            },
            {
              text: 'Choisissez **Type de partenariat** : Partenariat institutionnel, Formation et expertise, Soutien financier ou mécénat, Média et communication, ou Autre proposition (valeur par défaut).',
            },
            {
              text: 'Rédigez **Votre proposition** (obligatoire, 10 caractères minimum, 4 000 maximum) : objectif, contenu, durée envisagée, moyens, personne à contacter.',
            },
            {
              text: 'Cochez le consentement puis cliquez sur `Proposer un partenariat`.',
              where: 'en bas du formulaire',
              result: 'L’encart **Proposition transmise** affiche la référence MSG-… ; l’email « Nous avons bien reçu votre message (MSG-…) » vous est envoyé. La réponse est annoncée sous dix jours ouvrés.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Un message envoyé ne se retire pas en ligne',
          text: 'Après l’envoi, vous ne pouvez ni modifier ni annuler la proposition depuis le site. Pour la compléter ou la retirer, écrivez à la Fédération via **Contact** en citant la référence MSG-….',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le formulaire refuse l’envoi sans message d’erreur visible.',
              cause: 'Un champ obligatoire est signalé plus haut dans la page (sur mobile, il faut remonter).',
              solution: 'Faites défiler le formulaire vers le haut pour trouver le texte rouge sous le champ concerné, notamment **Organisation ou entreprise**, obligatoire pour un partenariat.',
            },
            {
              problem: 'Je veux joindre une présentation de mon organisation.',
              cause: 'Le formulaire n’accepte aucune pièce jointe.',
              solution: 'Décrivez la proposition dans le message et indiquez que vous disposez de documents ; le Secrétariat général vous dira comment les transmettre lors de l’échange.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'demande-de-service',
      title: 'Comment déposer une demande de service au nom de mon organisation',
      icon: 'clipboard-list',
      summary: 'Choisir un service de la Fédération, déposer la demande en nommant votre organisation et suivre son traitement.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le catalogue **Services** regroupe l’appui de la Fédération aux travailleurs et aux organisations : conseil juridique, création de section, médiation, négociation, formation sur mesure, selon les services publiés. Chaque demande reçoit une référence SRV-AAAA-XXXXXX et un accusé de réception par email ; vous suivez ensuite son statut dans **Mes demandes**. C’est le champ **Organisation** du formulaire qui indique que la demande est faite au nom de votre organisation.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Une demande déposée ne se modifie pas en ligne',
          text: 'Après le dépôt, vous ne pouvez ni modifier, ni compléter, ni annuler la demande depuis le site. Relisez le formulaire avant de cliquer sur `Déposer ma demande`. Pour toute correction, écrivez à la Fédération via **Contact** en citant la référence SRV-….',
        },
      ],
      subsections: [
        {
          id: 'choisir-un-service',
          title: 'Choisir le service',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la page **Services**.',
                  where: 'menu du site > **Services** (sur mobile : bouton **Ouvrir le menu**, trois traits, puis **Services**)',
                  result: 'La page « Un appui concret aux travailleurs et aux organisations » affiche les cartes des services avec leur résumé, leur tarif (ou « Gratuit ») et leur délai.',
                },
                {
                  text: 'Cliquez sur la carte du service qui correspond à votre besoin.',
                  result: 'La fiche du service s’ouvre : badge de catégorie, badge de tarif (montant en XAF, ou badge vert « Gratuit »), « Réponse sous N jour(s) ouvré(s) », et, selon le cas, « Compte FETRAG requis » et « Paiement en ligne sécurisé ».',
                },
                {
                  text: 'Lisez la section « Présentation » et la colonne **En bref** (**Tarif**, **Délai indicatif**, **Accès**, **Demandes traitées**) ainsi que l’encart doré **Conditions**.',
                  note: 'Sur mobile, la colonne **En bref** se trouve sous le formulaire.',
                },
                {
                  text: 'En cas de doute sur le service adapté, cliquez sur `Une question avant de demander ?` pour écrire à la Fédération avant de déposer.',
                  where: 'en haut de la page **Services**',
                },
              ],
            },
          ],
        },
        {
          id: 'deposer-une-demande-gratuite',
          title: 'Déposer une demande (service gratuit)',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur `Déposer une demande`.',
                  where: 'en haut de la fiche du service',
                  result: 'La page descend jusqu’à la section « Déposer une demande ».',
                },
                {
                  text: 'Si l’encart **Compte FETRAG requis** s’affiche, cliquez sur `Se connecter` (ou `Créer un compte`).',
                  result: 'Après la connexion, vous revenez automatiquement sur la fiche du service.',
                  note: 'Connectez-vous même pour un service ouvert à tous : la demande sera rattachée à votre compte et suivie dans **Mes demandes**.',
                },
                {
                  text: 'Vérifiez le groupe **Vos coordonnées** : **Nom complet** et **Adresse email** (obligatoires, pré-remplis), **Téléphone** (facultatif).',
                },
                {
                  text: 'Renseignez le champ **Organisation** avec le nom exact de votre organisation.',
                  note: 'C’est un texte libre (160 caractères maximum) : écrivez le nom complet et, entre parenthèses, l’acronyme. C’est ce champ qui signale à la Fédération que vous agissez au nom de l’organisation.',
                },
                {
                  text: 'Remplissez le groupe **Informations sur votre demande** : les champs propres au service (texte, liste déroulante « Sélectionner… », date, nombre, case à cocher…). Les champs obligatoires sont signalés.',
                  note: 'Un champ de type « fichier » n’accepte qu’un nom de document : « Indiquez ici le nom du document : il vous sera demandé après le dépôt de la demande. » Aucun téléversement n’est possible sur le site.',
                },
                {
                  text: 'Rédigez le **Message complémentaire** : situation de l’organisation, attentes, urgence (4 000 caractères maximum).',
                },
                {
                  text: 'Cochez la case de consentement puis cliquez sur `Déposer ma demande`.',
                  where: 'en bas du formulaire',
                  result: 'L’encart **Demande enregistrée** affiche « Votre demande « nom du service » a été enregistrée sous la référence SRV-AAAA-XXXXXX. Un accusé de réception vous a été envoyé par email. »',
                  note: 'Pendant l’envoi, le bouton affiche « Dépôt de la demande ».',
                },
                {
                  text: 'Cliquez sur `Suivre ma demande`.',
                  result: 'La page **Mes demandes** s’ouvre ; votre demande apparaît avec le statut **Nouveau**.',
                },
              ],
            },
          ],
        },
        {
          id: 'suivre-une-demande',
          title: 'Suivre l’avancement',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Mes demandes**.',
                  where: 'menu de gauche > **Mon compte** > **Mes demandes** (sur mobile : bouton **Ouvrir la navigation**, trois traits)',
                  result: 'La carte **Demandes de service** liste vos demandes : **Référence**, **Service**, **Déposée le**, **Statut**, **Suivi par**.',
                },
                {
                  text: 'Repérez la colonne **Suivi par** : le nom de l’agent qui instruit la demande, ou « En attente d’attribution ».',
                  note: 'Sous le nom du service, « Délai indicatif : N jours » rappelle le délai annoncé. Sur mobile, la référence et la date sont rappelées sous le nom du service ; le tableau défile horizontalement si besoin.',
                },
                {
                  text: 'Changez de page avec la pagination si vous avez plus de 10 demandes.',
                  where: 'sous le tableau',
                },
                {
                  text: 'À chaque changement de statut, lisez l’email « Demande SRV-… : statut » et la notification correspondante : ils contiennent le message de l’équipe (pièce à fournir, rendez-vous, motif de refus).',
                  where: 'votre messagerie et **Notifications**',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts d’une demande de service',
              items: [
                { label: 'Nouveau', tone: 'info', meaning: 'Demande reçue, pas encore attribuée à un agent (« Nouvelle » dans les emails).', next: 'Rien à faire ; le délai indicatif court.' },
                { label: 'En examen', tone: 'warning', meaning: 'Un agent des services étudie votre demande.', next: 'Répondez rapidement s’il vous écrit pour une précision.' },
                { label: 'En cours', tone: 'warning', meaning: 'La demande est en traitement (« En traitement » dans les emails).', next: 'Tenez-vous disponible pour les rendez-vous ou documents demandés.' },
                { label: 'Traitée', tone: 'success', meaning: 'L’équipe a résolu la demande ; elle peut encore repasser En cours ou être clôturée.', next: 'Vérifiez que la réponse couvre votre besoin ; sinon, écrivez via **Contact** en citant la référence.' },
                { label: 'Refusé', tone: 'danger', meaning: 'La demande n’a pas été retenue ; le motif figure dans le message de l’équipe (« Refusée » dans les emails).', next: 'Lisez le motif ; déposez une nouvelle demande mieux ciblée si nécessaire.' },
                { label: 'Clôturé', tone: 'neutral', meaning: 'Demande terminée, plus aucune évolution possible.', next: 'Conservez la référence pour vos archives.' },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Chacun ne voit que ses demandes',
              text: 'Une demande est rattachée au compte qui l’a déposée. Les autres membres de votre organisation ne la voient pas, et vous ne voyez pas les leurs. Si plusieurs personnes déposent des demandes pour l’organisation, tenez une liste commune des références SRV-….',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Message « Connectez-vous pour déposer cette demande. »',
                  cause: 'Le service exige un compte FETRAG (ou il est payant) et vous n’êtes pas connecté.',
                  solution: 'Cliquez sur `Se connecter` dans l’encart **Compte FETRAG requis** ; vous reviendrez sur la fiche après la connexion.',
                },
                {
                  problem: 'Message « Le formulaire est incomplet : vérifiez les champs signalés. »',
                  cause: 'Un champ propre au service est vide, hors liste, ou d’un format inattendu (« Champ obligatoire », « Valeur non autorisée », « Nombre attendu », « Date invalide », « Texte trop long »).',
                  solution: 'Corrigez chaque champ marqué en rouge ; un champ ne peut pas dépasser 5 000 caractères.',
                },
                {
                  problem: 'Message « Trop de demandes envoyées. Réessayez dans N minute(s). »',
                  cause: 'Limite de 5 demandes de service par heure et par compte.',
                  solution: 'Attendez le délai indiqué. Regroupez les besoins similaires dans une seule demande.',
                },
                {
                  problem: 'Message « Ce service n’est plus disponible. »',
                  cause: 'Le service a été retiré du catalogue pendant votre saisie.',
                  solution: 'Revenez au catalogue **Services** et choisissez un service équivalent, ou écrivez via **Contact**.',
                },
                {
                  problem: 'Le statut n’a pas changé depuis longtemps.',
                  cause: 'La demande attend une attribution ou un document que vous devez fournir.',
                  solution: 'Vérifiez vos emails et vos **Notifications**. Passé le délai indicatif, écrivez via **Contact** en citant la référence SRV-….',
                },
              ],
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'service-payant',
      title: 'Comment déposer et payer une demande de service payante',
      icon: 'credit-card',
      summary: 'Déposer une demande de service facturé, régler en ligne par Mobile Money ou carte, et obtenir le reçu.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un service payant affiche son tarif en XAF sur la fiche et la mention « Paiement en ligne sécurisé ». La connexion est obligatoire. La demande est créée d’abord, puis une **commande** (référence CMD-AAAA-XXXXXX) est ouverte pour le paiement ; la demande est instruite dès confirmation du règlement. Les paiements se font par Mobile Money (Airtel Money ou Moov Money) ou par carte bancaire, via un prestataire sécurisé : la FETRAG ne conserve aucune donnée bancaire.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Sur la fiche du service payant, connectez-vous puis cliquez sur `Déposer une demande`.',
              where: 'en haut de la fiche',
              result: 'Le formulaire s’affiche avec l’alerte orange **Service payant : tarif** : « Après validation du formulaire, vous serez dirigé vers le paiement sécurisé (Mobile Money ou carte). »',
            },
            {
              text: 'Remplissez le formulaire comme pour un service gratuit, en renseignant **Organisation** avec le nom de votre organisation.',
            },
            {
              text: 'Cochez le consentement puis cliquez sur `Déposer et payer`.',
              where: 'en bas du formulaire',
              result: 'La demande SRV-… est créée (email « Demande de service SRV-… enregistrée » précisant « Elle sera traitée dès confirmation du paiement. »), puis la page « Régler la commande CMD-… » s’ouvre.',
              note: 'Si une prise en charge à 100 % couvre déjà ce service, aucune page de paiement ne s’ouvre : vous revenez directement sur **Mes demandes**.',
            },
            {
              text: 'Si la Fédération ou votre organisation vous a transmis un code, saisissez-le dans **Code promotionnel** puis cliquez sur `Appliquer`.',
              where: 'bloc doré en haut de la carte **Moyen de paiement**',
              result: 'L’encart **Code appliqué** confirme « Le nouveau total apparaît dans le récapitulatif. »',
              note: 'Le bloc n’apparaît pas si un code ou une prise en charge est déjà appliqué : un code promotionnel n’est pas cumulable avec une prise en charge.',
            },
            {
              text: 'Choisissez **Mobile Money** ou **Carte bancaire**.',
              where: 'carte **Moyen de paiement**',
            },
            {
              text: 'Pour Mobile Money, vérifiez le **Numéro Mobile Money** (obligatoire) : le numéro qui recevra la demande de confirmation.',
              note: 'Il est pré-rempli avec votre dernier numéro utilisé ou celui de votre profil.',
            },
            {
              text: 'Cliquez sur `Payer montant`.',
              where: 'en bas de la carte (pleine largeur sur mobile)',
              result: 'Mobile Money : l’alerte **Validez le paiement sur votre téléphone** s’affiche. Carte bancaire : vous êtes dirigé vers le site du prestataire.',
              note: 'Pendant la connexion au prestataire, le bouton affiche « Connexion au fournisseur de paiement ».',
            },
            {
              text: 'Validez la demande de paiement sur votre téléphone (Mobile Money) ou terminez le paiement chez le prestataire (carte).',
              result: 'La page de retour affiche **Paiement confirmé**, **Paiement en attente de confirmation** ou **Le paiement n’a pas abouti**.',
            },
            {
              text: 'En attente, cliquez sur `Actualiser le statut` après avoir validé sur votre téléphone.',
              where: 'encart **Que faire pendant l’attente**',
              result: 'Une fois confirmé, la carte **Votre reçu** affiche le numéro REC-AAAA-XXXXXX et la carte **Ce que vous avez obtenu** le lien « Demande SRV-… prise en charge ».',
            },
            {
              text: 'Conservez l’email « Paiement confirmé - commande CMD-… ».',
              note: 'Il rappelle le contenu, le montant, le moyen de paiement et le numéro de reçu. Le PDF du reçu est généré en quelques minutes : téléchargez-le depuis **Paiements et reçus**.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Un paiement confirmé est définitif',
          text: 'Vérifiez le service, le montant et le récapitulatif avant de cliquer sur `Payer`. Une fois le paiement confirmé, seule la Fédération (Finance) peut effectuer un remboursement, à sa discrétion. Une commande annulée par la Fédération ne peut plus être réglée : il faut repasser commande.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'La page de paiement ne s’est pas ouverte après le dépôt.',
              cause: 'Le paiement n’a pas pu être initié (« Le paiement n’a pas pu être initié : vous pourrez le régler depuis votre espace personnel. ») ou aucune offre active n’existe pour ce service.',
              solution: 'Ouvrez **Paiements et reçus** : la commande apparaît avec le statut **En attente** et le bouton `Payer`. Si aucune commande n’apparaît, attendez le message de la Fédération ou écrivez via **Contact** en citant la référence SRV-….',
            },
            {
              problem: 'Alerte **Le dernier paiement a échoué**.',
              cause: 'L’opérateur a refusé ou interrompu la transaction (solde insuffisant, délai de validation dépassé).',
              solution: 'Relancez le paiement sur la même page avec le même moyen ou un autre. L’email « Paiement non abouti - commande CMD-… » confirme qu’aucun montant n’a été prélevé.',
            },
            {
              problem: 'Message « Code promotionnel invalide. » ou « Une prise en charge est déjà appliquée : le code promotionnel n’est pas cumulable ».',
              cause: 'Le code est mal saisi, expiré, ou une prise en charge couvre déjà la commande.',
              solution: 'Vérifiez le code auprès de la personne qui vous l’a transmis. Si une prise en charge est appliquée, elle remplace le code.',
            },
            {
              problem: 'Message « Les paiements en ligne sont momentanément indisponibles. »',
              cause: 'Les paiements en ligne sont désactivés ou le prestataire est indisponible.',
              solution: 'Réessayez plus tard ; la commande reste **En attente** dans **Paiements et reçus**. Pour régler par virement ou en espèces, contactez la Fédération en citant la référence CMD-….',
            },
            {
              problem: 'Message « Cette commande ne vous appartient pas » ou page introuvable.',
              cause: 'Vous ouvrez le lien d’une commande passée avec un autre compte (par exemple celui d’un membre).',
              solution: 'Chaque commande n’est visible que par le compte qui l’a passée. Demandez au membre de régler depuis son propre espace.',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'prise-en-charge',
      title: 'Comment obtenir une prise en charge pour un membre de mon organisation',
      icon: 'hand-coins',
      summary: 'Demander à la Fédération le financement total ou partiel d’une formation ou d’un événement pour un membre, et comprendre comment elle s’applique.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **prise en charge** est une remise en pourcentage (de 0 à 100 %) enregistrée par la Fédération pour un bénéficiaire précis, identifié par l’adresse email de son compte. Elle vise une formation, un événement, ou toute offre (prise en charge générale, qui s’applique alors aussi aux services et aux ressources). Elle peut avoir une date de fin de validité. Elle s’applique automatiquement quand le bénéficiaire passe commande : vous n’avez rien à saisir et vous ne pouvez pas payer à sa place.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Aucun écran dédié sur le site',
          text: 'Il n’existe pas de page « Prises en charge » dans votre espace ni dans celui du bénéficiaire. Le bénéficiaire reçoit une notification, puis voit la remise sur sa commande. Vous, responsable, n’avez pas de vue consolidée des prises en charge ou des reçus de vos membres : tenez votre propre suivi (bénéficiaire, formation, pourcentage, date d’accord).',
        },
        {
          type: 'steps',
          title: 'Demander la prise en charge',
          items: [
            {
              text: 'Assurez-vous que le membre bénéficiaire possède un compte FETRAG dont l’adresse email est confirmée.',
              note: 'La prise en charge est rattachée à cette adresse : sans compte, elle ne peut pas être enregistrée.',
            },
            {
              text: 'Repérez sur la fiche de la formation (**Formations**) ou de l’événement le tarif affiché.',
              where: 'menu du site > **Formations** > fiche du module, bloc **Tarif**',
              note: 'Le bloc « Inscription » indique aussi la politique d’inscription : « Inscription libre en ligne », « Inscription sur validation de la coordination », « Réservée aux organisations affiliées » ou « Inscription après paiement ».',
            },
            {
              text: 'Ouvrez la page **Contact** et renseignez l’**Objet** « Prise en charge de formation ».',
              where: 'menu du site > **Contact**',
            },
            {
              text: 'Indiquez dans **Votre message** : le nom de votre organisation, le nom et l’adresse email du bénéficiaire, la formation ou l’événement visé, le pourcentage souhaité (par exemple 100 %), qui finance (votre organisation ou une demande d’aide à la Fédération) et la date limite éventuelle.',
              note: 'Une demande claire évite les allers-retours. Une seule demande peut lister plusieurs bénéficiaires.',
            },
            {
              text: 'Cochez le consentement puis cliquez sur `Envoyer le message`.',
              result: 'La référence MSG-… s’affiche ; suivez le message dans **Mes demandes** > **Messages envoyés**.',
            },
            {
              text: 'Attendez la réponse de la Fédération : le service Finance enregistre la prise en charge après accord.',
              result: 'Le bénéficiaire reçoit la notification « Prise en charge accordée » : « Une prise en charge de N % (« libellé ») a été accordée sur votre compte… Elle s’applique automatiquement lors du paiement. »',
              note: 'La notification mentionne une date de validité « indiquée dans votre espace » : en pratique, aucune page ne l’affiche ; notez la date convenue avec la Fédération.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Ce que fait ensuite le bénéficiaire',
          intro: 'Transmettez ces étapes au membre : c’est lui qui s’inscrit et qui règle l’éventuel reste à payer.',
          items: [
            {
              text: 'Il ouvre la fiche de la formation sur le site et clique sur `S’inscrire à ce module`.',
              where: 'menu du site > **Formations** > fiche du module',
              result: 'La plateforme de formation s’ouvre sur la page du cours ; son compte FETRAG le connecte automatiquement.',
            },
            {
              text: 'Il confirme son inscription sur la plateforme.',
              result: 'La plateforme crée la commande et applique automatiquement la prise en charge la plus favorable valide (après un éventuel code promotionnel).',
            },
            {
              text: 'Si le total tombe à 0 XAF, l’accès est activé immédiatement ; sinon, il est dirigé vers la page « Régler la commande » du site pour payer le reste.',
              result: 'Dans son espace **Paiements et reçus**, la commande affiche la ligne « Remise · libellé de la prise en charge », le moyen **Prise en charge** (si 100 %) et le reçu REC-….',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Une prise en charge utilisée ne se supprime plus',
          text: 'Dès qu’une prise en charge a été appliquée à une commande, la Fédération ne peut plus la supprimer, seulement la clôturer pour les commandes futures. Les commandes déjà passées restent acquises. Vérifiez donc les bénéficiaires et le pourcentage avant de confirmer votre demande.',
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le membre a payé plein tarif alors qu’une prise en charge lui était accordée.',
              cause: 'La prise en charge a été enregistrée après sa commande, visait une autre formation, était expirée, ou le compte utilisé n’est pas celui de l’adresse email déclarée.',
              solution: 'Demandez au membre la référence CMD-… de sa commande et écrivez à la Fédération via **Contact** ; seule la Finance peut décider d’un remboursement.',
            },
            {
              problem: 'Le membre voit « Une prise en charge est déjà appliquée : le code promotionnel n’est pas cumulable ».',
              cause: 'Code promotionnel et prise en charge ne se cumulent pas.',
              solution: 'C’est normal : la prise en charge s’applique ; le code est inutile.',
            },
            {
              problem: 'Je ne retrouve pas les reçus des formations financées par mon organisation.',
              cause: 'Les reçus sont dans l’espace du compte qui a passé la commande (le bénéficiaire), pas dans le vôtre.',
              solution: 'Demandez au bénéficiaire de télécharger le PDF depuis **Paiements et reçus** > `Détail` > carte **Reçu**, ou écrivez à la Finance via **Contact** en citant la référence CMD-….',
            },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'paiements-et-recus',
      title: 'Comment régler une commande en attente et récupérer un reçu',
      icon: 'receipt',
      summary: 'Retrouver vos commandes, régler celles en attente, lire le détail et télécharger le reçu PDF.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page **Paiements et reçus** liste toutes les commandes passées avec votre compte : services payants, événements, ressources et formations payées depuis la plateforme. Le badge du menu indique le nombre de commandes en attente de paiement. Chaque commande a une référence CMD-AAAA-XXXXXX et, une fois payée, un reçu numéroté REC-AAAA-XXXXXX.',
        },
        {
          type: 'steps',
          title: 'Régler une commande en attente',
          items: [
            {
              text: 'Ouvrez **Paiements et reçus**.',
              where: 'menu de gauche > **Mon compte** > **Paiements et reçus** (sur mobile : bouton **Ouvrir la navigation**, trois traits)',
              result: 'Le tableau affiche **Commande**, **Contenu**, **Montant**, **Paiement**, **Statut** et **Actions**.',
            },
            {
              text: 'Cliquez sur la puce `En attente` pour ne voir que les commandes à régler.',
              where: 'ligne « Filtrer par statut », au-dessus du tableau',
            },
            {
              text: 'Cliquez sur `Payer` sur la ligne concernée.',
              where: 'colonne **Actions** (à droite ; sur mobile, les actions sont empilées)',
              result: 'La page « Régler la commande CMD-… » s’ouvre.',
            },
            {
              text: 'Choisissez le moyen de paiement, vérifiez le **Numéro Mobile Money** puis cliquez sur `Payer montant`.',
              result: 'Validez sur votre téléphone ; la page de retour affiche l’issue du paiement.',
            },
            {
              text: 'Si le statut reste **En attente**, cliquez sur `Actualiser le statut`.',
              where: 'page de retour, encart **Que faire pendant l’attente**',
              result: 'Le titre passe à **Paiement confirmé** dès que l’opérateur a confirmé.',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Télécharger un reçu',
          items: [
            {
              text: 'Dans **Paiements et reçus**, cliquez sur `Détail` sur la ligne de la commande payée.',
              where: 'colonne **Actions** ; le badge or « Reçu REC-… » indique qu’un reçu existe',
              result: 'La page « Commande CMD-… » s’ouvre avec les cartes **Récapitulatif**, **Reçu**, **Ce que vous avez obtenu**, **Paiements** et **Historique**.',
            },
            {
              text: 'Dans la carte **Reçu**, cliquez sur `Télécharger le PDF`.',
              result: 'Le reçu s’ouvre dans un nouvel onglet ; enregistrez-le ou imprimez-le.',
              note: 'Juste après le paiement, l’encart « Le PDF est en cours de génération ; il sera disponible dans quelques minutes. » peut s’afficher : revenez un peu plus tard.',
            },
            {
              text: 'Vérifiez la carte **Récapitulatif** : lignes, **Sous-total**, **Remise (code X) · libellé de prise en charge** le cas échéant, **Total**.',
              note: 'Les montants sont en XAF, sans centimes.',
            },
            {
              text: 'Consultez la carte **Historique** pour retrouver la date et le commentaire de chaque changement de statut.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’une commande',
          items: [
            { label: 'En attente', tone: 'warning', meaning: 'Commande créée, paiement non confirmé.', next: 'Cliquez sur `Payer`.' },
            { label: 'Payée', tone: 'success', meaning: 'Paiement confirmé ; le reçu REC-… est émis et l’accès activé.', next: 'Téléchargez le PDF du reçu.' },
            { label: 'Échoué', tone: 'danger', meaning: 'Le dernier paiement a été refusé ou interrompu (« Échouée » dans le filtre).', next: 'Relancez avec `Payer`, avec le même moyen ou un autre.' },
            { label: 'Annulé', tone: 'neutral', meaning: 'Commande annulée par la Fédération ; elle ne peut plus être réglée.', next: 'Repassez commande depuis la page concernée.' },
            { label: 'Remboursé', tone: 'info', meaning: 'Montant intégralement remboursé par la Fédération.', next: 'Le montant réapparaît chez votre opérateur sous quelques jours ouvrés.' },
            { label: 'Partiellement remboursée', tone: 'info', meaning: 'Une partie du montant a été remboursée.', next: 'Vérifiez le détail dans la carte **Paiements**.' },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'J’ai payé mais la commande reste **En attente**.',
              cause: 'La confirmation de l’opérateur n’est pas encore arrivée, ou la demande de paiement a expiré sur votre téléphone.',
              solution: 'Cliquez sur `Actualiser le statut` sur la page de retour. Sans changement après quelques minutes, écrivez à la Fédération via **Contact** en indiquant la référence CMD-… et la référence de l’opérateur.',
            },
            {
              problem: 'Le bouton `Télécharger le PDF` n’apparaît pas.',
              cause: 'Le reçu est en cours de génération, ou la commande n’est pas encore payée.',
              solution: 'Attendez quelques minutes puis rechargez la page. Une commande non réglée n’a pas de reçu (« Aucun reçu tant que la commande n’est pas réglée. »).',
            },
            {
              problem: 'Une commande réglée par un membre n’apparaît pas dans ma liste.',
              cause: 'Les commandes ne sont visibles que par le compte qui les a passées.',
              solution: 'Demandez au membre le reçu depuis son propre espace.',
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
      summary: 'Utiliser le formulaire de contact pour toute demande qui n’a pas d’écran dédié, et suivre vos messages.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le formulaire **Contact** est votre canal pour tout ce qui ne se fait pas en ligne : rattachement d’un responsable, changement de responsable, mise à jour de la fiche de l’organisation, demande de prise en charge, question sur une demande de service ou une commande, complément à une demande déjà déposée. Chaque message reçoit une référence MSG-… et un accusé de réception ; la réponse est annoncée sous cinq jours ouvrés.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez la page **Contact**.',
              where: 'menu du site > **Contact** (sur mobile : bouton **Ouvrir le menu**, trois traits, puis **Contact**)',
              result: 'La page « Nous écrire ou nous rencontrer » affiche le bloc **Coordonnées** (adresse, email, téléphones) puis le formulaire.',
            },
            {
              text: 'Vérifiez **Nom complet** et **Adresse email** (obligatoires) ; renseignez **Téléphone** et **Organisation ou employeur** (facultatifs).',
              note: 'Indiquez toujours votre organisation : la Fédération sait ainsi que vous écrivez en tant que responsable.',
            },
            {
              text: 'Renseignez l’**Objet** en quelques mots (facultatif, 3 à 160 caractères s’il est renseigné).',
              note: 'Exemples : « Accès responsable d’organisation », « Prise en charge de formation », « Complément demande SRV-… ».',
            },
            {
              text: 'Rédigez **Votre message** (10 à 4 000 caractères) en citant les références utiles (MSG-…, SRV-…, CMD-…, DF-…) et l’adresse email de votre compte.',
            },
            {
              text: 'Cochez le consentement puis cliquez sur `Envoyer le message`.',
              where: 'en bas du formulaire',
              result: 'L’encart **Message envoyé** affiche la référence MSG-… ; l’email « Nous avons bien reçu votre message (MSG-…) » vous est envoyé.',
            },
            {
              text: 'Suivez le message dans **Mes demandes**, carte **Messages envoyés**.',
              where: 'menu de gauche > **Mes demandes**, en bas de la page',
              result: 'Chaque message affiche son type (« Contact », « Adhésion / intérêt », « Partenariat »), sa référence, sa date, son statut et, le cas échéant, « répondu le date ».',
              note: 'Seuls les 20 derniers messages envoyés en étant connecté sont listés.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Situation urgente',
          text: 'Pour une urgence (conflit en cours, convocation imminente), appelez la permanence de la Fédération aux numéros indiqués en bas de chaque page, du lundi au vendredi, plutôt que d’attendre la réponse au formulaire.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'catalogue-formations',
      title: 'Comment consulter le programme de formation et m’y inscrire',
      icon: 'graduation-cap',
      summary: 'Lire les fiches des dix modules, comprendre la politique d’inscription et le tarif, et vous inscrire vous-même.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le site présente le catalogue public des formations (les dix modules du programme) ; l’inscription elle-même se fait sur la plateforme de formation. Depuis le site, vous ne pouvez vous inscrire que pour vous-même : pour former plusieurs cadres de votre organisation, déposez une demande de formation sur la plateforme (voir « Ce que vous faites sur la plateforme de formation »).',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Formations**.',
              where: 'menu du site > **Formations** (sur mobile : bouton **Ouvrir le menu**, trois traits, puis **Formations**)',
              result: 'Le catalogue des dix modules s’affiche.',
            },
            {
              text: 'Ouvrez la fiche d’un module et lisez le bloc « Inscription ».',
              result: 'La politique s’affiche : « Inscription libre en ligne », « Inscription sur validation de la coordination », « Réservée aux organisations affiliées » ou « Inscription après paiement ».',
            },
            {
              text: 'Lisez le bloc **Tarif** : « Gratuit », un montant en XAF, « Tarif sur demande », ou « prix · prix membre pour les membres ».',
              note: 'Le prix membre affiché est indicatif : le tarif effectivement appliqué au paiement est celui de la commande, après code promotionnel ou prise en charge. En cas de doute, demandez confirmation à la Fédération avant de vous inscrire.',
            },
            {
              text: 'Pour vous inscrire vous-même, cliquez sur `S’inscrire à ce module`.',
              where: 'en bas de la fiche (bouton vert)',
              result: 'La page du cours s’ouvre sur la plateforme de formation, sans nouvelle connexion : « Votre compte FETRAG vous connecte automatiquement à la plateforme. »',
              note: 'Pour un module payant, la plateforme crée la commande puis vous ramène sur la page « Régler la commande » du site.',
            },
          ],
        },
        {
          type: 'links',
          items: [
            { label: 'Catalogue des formations', href: '/formations', description: 'Les dix modules du programme, avec tarif et politique d’inscription.', icon: 'book-open' },
            { label: 'Vérifier un certificat', href: '/certificats/verifier', description: 'Saisir le code d’un certificat pour en vérifier l’authenticité (utile pour les certificats de vos cadres).', icon: 'badge-check' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'passerelle-plateforme',
      title: 'Ce que vous faites sur la plateforme de formation',
      icon: 'arrow-right',
      summary: 'Comment passer sur la plateforme, ce qui s’y fait (demandes de formation, participants, rapports) et ce qui revient sur le site.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Tout ce qui est propre à votre rôle de responsable se fait sur la plateforme de formation, dans l’espace **Organisation** : déposer une **demande de formation** (référence DF-AAAA-XXXXXX), désigner les **participants** (10 par demande par défaut), suivre leur progression et exporter les **rapports**. Le site n’affiche aucune de ces données. Le guide « Responsable d’organisation » de la plateforme détaille chaque écran ; cette section explique le passage de l’un à l’autre.',
        },
        {
          type: 'table',
          caption: 'Qui fait quoi, où',
          columns: ['Besoin', 'Sur le site', 'Sur la plateforme de formation'],
          rows: [
            ['Compte, mot de passe, vérification en deux étapes', '**Profil**, **Sécurité**', 'Même compte, mêmes réglages'],
            ['Affiliation, partenariat, fiche de l’organisation', '**Adhésion**, **Partenariat**, **Contact**', '—'],
            ['Demande de service au nom de l’organisation', '**Services** puis **Mes demandes**', '—'],
            ['Demande de formation pour vos cadres', 'Pied de page > **Demande de formation** (ouvre l’assistant de la plateforme)', 'Espace **Organisation** > **Demande de formation**, suivi des demandes DF-…'],
            ['Participants, progression, certificats des cadres', '—', 'Espace **Organisation** > **Participants** (`Export CSV`), **Rapports** (CSV / PDF)'],
            ['Paiement d’une formation (pour vous-même ou reste à payer d’un membre)', 'Page « Régler la commande », **Paiements et reçus**', 'La plateforme crée la commande puis renvoie vers le site'],
            ['Reçus, historique des commandes, prises en charge appliquées', '**Paiements et reçus**', '—'],
            ['Notifications du site (rattachement, demandes, paiements)', '**Notifications**', 'Notifications propres à la plateforme (demandes DF-…, convocations)'],
          ],
        },
        {
          type: 'steps',
          title: 'Passer sur la plateforme',
          items: [
            {
              text: 'Cliquez sur `Plateforme de formation`.',
              where: 'bouton vert de l’en-tête du site, du menu de votre compte, du menu de gauche de votre espace ou de l’en-tête « Tableau de bord » (sur mobile : bloc vert en bas du tiroir **Ouvrir le menu**)',
              result: 'La plateforme s’ouvre dans le même navigateur, déjà connectée à votre compte.',
            },
            {
              text: 'Ouvrez le menu de votre compte sur la plateforme et cliquez sur **Organisation**.',
              where: 'vos initiales, en haut à droite de la plateforme',
              result: 'Le tableau de bord de votre organisation s’affiche avec la navigation **Tableau de bord**, **Demande de formation**, **Participants**, **Rapports**.',
            },
            {
              text: 'Pour déposer directement une demande, cliquez sur **Demande de formation** dans le pied de page du site.',
              where: 'pied de page > colonne **Formation** > **Demande de formation**',
              result: 'L’assistant de demande de formation de la plateforme s’ouvre.',
            },
            {
              text: 'Préparez, avant de remplir l’assistant : le nom exact de l’organisation, la personne ressource (nom, fonction, email, téléphone), les modules souhaités (au moins un), la liste des participants (nom, email, téléphone, fonction ; 10 au maximum par défaut), la période et la modalité souhaitées (présentiel, classe virtuelle ou hybride) et la motivation.',
              note: 'Les engagements de l’organisation (assiduité, conditions matérielles, communication des résultats) doivent être acceptés pour soumettre.',
            },
            {
              text: 'Après la soumission, suivez la demande sur la plateforme et dans votre messagerie.',
              result: 'Notification « Demande transmise » et email « Demande de formation DF-… bien reçue » (réponse de la coordination sous cinq jours ouvrés), puis, selon la décision : « Demande DF-… : complément d’information attendu », « Demande DF-… acceptée », « Demande DF-… : réponse de la coordination », « Formation planifiée : cohorte ».',
              note: 'Les emails partent à l’adresse de la personne ressource indiquée dans la demande ; les notifications vont au compte qui a déposé la demande.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’une demande de formation (rappel)',
          items: [
            { label: 'Brouillon', tone: 'neutral', meaning: 'Demande rédigée, non envoyée.', next: '`Compléter la demande` puis soumettre.' },
            { label: 'Soumise', tone: 'info', meaning: 'En examen par la coordination (cinq jours ouvrés indicatifs).', next: 'Attendre.' },
            { label: 'Complément demandé', tone: 'warning', meaning: 'La coordination attend une précision.', next: '`Compléter la demande` puis soumettre à nouveau.' },
            { label: 'Autre date proposée', tone: 'warning', meaning: 'La coordination propose une autre période ou modalité.', next: '`Accepter la proposition` ou écrire à la coordination.' },
            { label: 'Acceptée', tone: 'success', meaning: 'Demande validée, planification en cours.', next: 'Prévenir les participants.' },
            { label: 'Planifiée', tone: 'success', meaning: 'Cohorte créée, convocations envoyées.', next: 'Relayer les convocations aux participants sans email.' },
            { label: 'Formation en cours', tone: 'info', meaning: 'Sessions démarrées.', next: 'Suivre la progression dans **Participants**.' },
            { label: 'Terminée', tone: 'neutral', meaning: 'Cohorte clôturée, certificats émis selon éligibilité.', next: 'Exporter les rapports.' },
            { label: 'Refusée', tone: 'danger', meaning: 'Non retenue, motif indiqué.', next: 'Déposer une nouvelle demande si nécessaire.' },
            { label: 'Annulée', tone: 'neutral', meaning: 'Annulée par vous (possible tant que la formation n’est pas en cours) ou par la coordination.', next: '—' },
          ],
        },
        {
          type: 'steps',
          title: 'Revenir sur le site',
          items: [
            {
              text: 'Quand une inscription payante est confirmée sur la plateforme, laissez-vous rediriger vers la page « Régler la commande » du site.',
              result: 'Le paiement se fait sur le site ; le reçu apparaît ensuite dans **Paiements et reçus**.',
            },
            {
              text: 'Pour retrouver un reçu, une commande ou une notification du site, revenez sur le site par le lien vers le site institutionnel de la plateforme, puis ouvrez **Mon espace**.',
              where: 'menu de votre compte, en haut à droite',
              result: 'Votre espace personnel s’affiche avec les rubriques **Paiements et reçus** et **Notifications**.',
            },
          ],
        },
        {
          type: 'links',
          items: [
            { label: 'Guide du responsable d’organisation sur la plateforme', href: '{{lms}}/organisation/guide', description: 'Demande de formation pas à pas, participants, rapports, certificats.', external: true, icon: 'book-open' },
            { label: 'Espace Organisation de la plateforme', href: '{{lms}}/organisation', description: 'Tableau de bord, demandes DF-…, participants, rapports.', external: true, icon: 'building' },
            { label: 'Déposer une demande de formation', href: '{{lms}}/demande-formation', description: 'L’assistant de demande de formation.', external: true, icon: 'graduation-cap' },
          ],
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Les messages envoyés par le site à un responsable d’organisation, leur déclencheur et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le site vous informe de deux manières : par email (à l’adresse de votre compte) et par **notification** dans votre espace (**Notifications**, badge de non lues dans le menu de gauche). Les notifications restent consultables même si un email s’est perdu ; certaines informations n’existent que sous forme de notification.',
        },
        {
          type: 'steps',
          title: 'Lire mes notifications',
          items: [
            {
              text: 'Ouvrez **Notifications**.',
              where: 'menu de gauche > **Mon compte** > **Notifications** (sur mobile : bouton **Ouvrir la navigation**, trois traits) ; ou menu du compte > **Notifications**',
              result: 'La liste s’affiche avec les filtres `Toutes` et `Non lues (N)`.',
            },
            {
              text: 'Cliquez sur une notification pour ouvrir la page concernée (demande, commande, espace).',
              result: 'La notification est marquée comme lue.',
            },
            {
              text: 'Cliquez sur `Tout marquer comme lu` une fois vos notifications traitées.',
              where: 'en haut de la liste',
              result: 'Le message « N notification(s) marquée(s) comme lue(s). » s’affiche et le badge du menu disparaît.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Emails et notifications du site',
          columns: ['Message', 'Quand', 'Ce qu’il faut faire'],
          rows: [
            ['Email « Confirmez votre adresse email - FETRAG »', 'À la création du compte', 'Cliquer sur le lien pour activer le compte'],
            ['Email « Bienvenue à la FETRAG »', 'Après confirmation de l’adresse', 'Compléter le profil, activer la vérification en deux étapes'],
            ['Emails « Réinitialisation de votre mot de passe FETRAG » et « Votre mot de passe FETRAG a été modifié »', 'Mot de passe oublié ou modifié', 'Si vous n’êtes pas à l’origine du changement, contactez le support immédiatement'],
            ['Notification « Vous êtes désormais responsable de « organisation » sur la plateforme FETRAG… »', 'Quand la coordination vous rattache comme responsable (pas d’email dédié)', 'Ouvrir l’espace **Organisation** de la plateforme'],
            ['Notification « Votre compte a été rattaché à « organisation » sur la plateforme FETRAG. »', 'Quand la coordination vous ajoute comme membre', 'Si vous deviez être responsable, écrire à la coordination'],
            ['Email « Nous avons bien reçu votre message (MSG-…) »', 'Après un formulaire d’adhésion, de partenariat ou de contact', 'Conserver la référence ; réponse annoncée sous 48 heures ouvrées dans l’email, cinq jours ouvrés sur la page'],
            ['Email « Demande de service SRV-… enregistrée »', 'Au dépôt d’une demande de service', 'Conserver la référence ; cliquer sur « Suivre ma demande »'],
            ['Email et notification « Demande SRV-… : statut »', 'À chaque changement de statut par les services', 'Lire le message de l’équipe ; fournir ce qui est demandé'],
            ['Email et notification « Paiement confirmé - commande CMD-… »', 'À la confirmation d’un paiement', 'Télécharger le reçu depuis **Paiements et reçus**'],
            ['Email et notification « Paiement non abouti - commande CMD-… »', 'Paiement refusé ou interrompu', 'Relancer le paiement ; aucun montant n’a été prélevé'],
            ['Email et notification « Remboursement effectué - commande CMD-… »', 'Remboursement total ou partiel par la Finance', 'Vérifier le crédit chez votre opérateur sous quelques jours ouvrés'],
            ['Notification « Prise en charge accordée »', 'Quand la Finance enregistre une prise en charge sur votre compte (pas d’email dédié)', 'S’inscrire à l’offre visée : la remise s’applique automatiquement'],
            ['Email « Inscription confirmée : événement »', 'Après une inscription gratuite à un événement', 'Noter la date dans votre agenda'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Et sur la plateforme de formation',
          text: 'Les demandes de formation (DF-…) génèrent leurs propres notifications et emails : « Demande transmise », « Demande de formation DF-… bien reçue », « complément d’information attendu », « acceptée », « réponse de la coordination », « Nouvelle date proposée », « Formation planifiée ». Ils sont décrits dans le guide de la plateforme.',
        },
      ],
    },
    // -------------------------------------------------------------------------
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'shield-check',
      summary: 'Protéger votre compte, les données de votre organisation et de vos membres, et faciliter le travail de la Fédération.',
      blocks: [
        {
          type: 'list',
          style: 'check',
          items: [
            'Activez la vérification en deux étapes dès votre première connexion : votre compte donne accès aux données de votre organisation et de ses participants.',
            'Utilisez un mot de passe unique, jamais partagé, même avec un autre responsable : demandez un accès nominatif pour chaque personne.',
            'Déconnectez-vous après chaque utilisation sur un appareil partagé ou prêté (menu du compte > `Déconnexion`).',
            'Ne transmettez jamais de mot de passe, de numéro de carte ou de code Mobile Money dans un formulaire ou un message.',
            'Vérifiez l’adresse de la page avant de saisir votre mot de passe : le site et la plateforme de formation sont les seuls sites de la Fédération.',
            'Tenez à jour votre **Profil** (téléphone, fonction, employeur) : ces informations figurent dans vos demandes et servent à vous joindre.',
            'Citez toujours la référence (MSG-…, SRV-…, CMD-…, DF-…) dans vos échanges avec la Fédération.',
            'Tenez, au sein de votre organisation, une liste des demandes déposées et des prises en charge accordées : le site ne consolide pas ces informations par organisation.',
            'Traitez les données de vos membres (noms, emails, résultats de formation, reçus) comme confidentielles : diffusion limitée à l’usage interne de l’organisation.',
            'Prévenez la coordination en cas de changement de responsable, pour que l’ancien accès soit retiré.',
            'Relisez chaque formulaire avant l’envoi : messages, demandes de service et paiements confirmés ne se retirent pas en ligne.',
            'Restez courtois et précis dans vos messages : un message clair, avec les références et les dates, est traité plus vite.',
            'Consultez régulièrement **Notifications** : certaines informations (rattachement, prise en charge) n’arrivent pas par email.',
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
              question: 'J’ai indiqué mon organisation à l’inscription : suis-je déjà responsable ?',
              answer: 'Non. Le champ **Organisation ou employeur** est un simple texte. Le rattachement comme responsable est fait par la coordination de la Fédération, à votre demande via la page **Contact**. Vous recevez alors la notification « Vous êtes désormais responsable de… ».',
            },
            {
              question: 'Pourquoi le menu de mon compte affiche-t-il « Apprenant » alors que je suis responsable ?',
              answer: 'La coordination vous a désigné par la case « Responsable de l’organisation » de votre appartenance, sans attribuer le rôle explicite. Vos droits sont les mêmes : ce guide et l’espace **Organisation** de la plateforme vous sont ouverts.',
            },
            {
              question: 'Où se trouvent les demandes de formation de mon organisation ?',
              answer: 'Sur la plateforme de formation, espace **Organisation** (bouton vert `Plateforme de formation`). Le site ne les affiche pas ; le pied de page propose seulement le raccourci **Demande de formation** vers l’assistant de la plateforme.',
            },
            {
              question: 'Puis-je payer une formation pour un membre de mon organisation ?',
              answer: 'Pas directement : chaque commande est payée par le compte qui s’inscrit. Demandez à la Fédération une prise en charge pour ce membre (page **Contact**) : la remise s’applique automatiquement à sa commande, et il règle l’éventuel reste.',
            },
            {
              question: 'Où voir les prises en charge accordées à mes membres ?',
              answer: 'Nulle part sur le site : il n’existe pas de liste des prises en charge, ni pour vous, ni pour le bénéficiaire. Le bénéficiaire reçoit la notification « Prise en charge accordée » et voit la remise sur sa commande. Tenez votre propre suivi et, en cas de doute, écrivez à la Fédération.',
            },
            {
              question: 'Plusieurs personnes peuvent-elles être responsables de la même organisation ?',
              answer: 'Oui. Demandez un accès nominatif pour chacune via **Contact**. Le dernier responsable d’une organisation ne peut pas être retiré sans remplaçant.',
            },
            {
              question: 'Comment corriger la fiche de mon organisation dans l’annuaire ?',
              answer: 'Écrivez à la coordination via **Contact** (objet « Mise à jour de la fiche de notre organisation ») en précisant chaque information à corriger. Vous ne pouvez pas la modifier vous-même.',
            },
            {
              question: 'Je me suis trompé dans une demande de service : comment la modifier ?',
              answer: 'Une demande déposée ne se modifie pas en ligne. Écrivez via **Contact** en citant la référence SRV-… et en décrivant la correction ; l’équipe des services l’intègre au traitement.',
            },
            {
              question: 'Les autres membres de mon organisation voient-ils mes demandes ?',
              answer: 'Non. Chaque demande de service, message et commande n’est visible que par le compte qui l’a déposé ou payé. Vous ne voyez pas non plus les leurs.',
            },
            {
              question: 'Mon organisation est affiliée : les formations sont-elles gratuites pour nos membres ?',
              answer: 'Le site ne prévoit pas de gratuité automatique par organisation. Le tarif appliqué est celui affiché sur la fiche, réduit par un code promotionnel ou une prise en charge accordée par la Fédération. Les conditions d’une formation demandée pour votre organisation sont fixées avec la coordination lors du traitement de la demande DF-….',
            },
            {
              question: 'Quel délai pour une réponse à ma demande d’affiliation ?',
              answer: 'La page annonce un contact du Secrétariat général sous cinq jours ouvrés (l’email d’accusé de réception mentionne 48 heures ouvrées). Le partenariat est annoncé sous dix jours ouvrés, les services selon le délai affiché sur chaque fiche.',
            },
            {
              question: 'Puis-je joindre un document (statuts, liste de participants) à un formulaire ?',
              answer: 'Non, aucun formulaire du site n’accepte de pièce jointe. Pour une demande de service, un champ « fichier » n’enregistre que le nom du document ; il vous est demandé ensuite par l’équipe. Pour les autres démarches, la Fédération vous indique comment transmettre les documents.',
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
            { term: 'Organisation affiliée', definition: 'Syndicat ou section syndicale membre de la Fédération, référencé dans l’annuaire public **Organisations affiliées** une fois son affiliation prononcée par les instances.' },
            { term: 'Responsable d’organisation', definition: 'Personne rattachée par la Fédération à une organisation avec le droit de déposer des demandes de formation, de désigner des participants et de consulter les rapports de cette organisation sur la plateforme de formation.' },
            { term: 'Rattachement', definition: 'Opération par laquelle la coordination relie votre compte à votre organisation, comme membre ou comme responsable. Elle déclenche une notification dans votre espace.' },
            { term: 'Affiliation', definition: 'Adhésion d’une organisation syndicale à la Fédération, prononcée par le Bureau exécutif après entretien avec le Secrétariat général et confirmée par un courrier officiel.' },
            { term: 'Partenariat', definition: 'Coopération formalisée par une convention entre la Fédération et une organisation, une entreprise ou une institution (institutionnel, formation, financier, média, international).' },
            { term: 'Demande de service', definition: 'Demande d’appui déposée depuis le catalogue **Services** (conseil juridique, médiation, négociation…). Elle reçoit une référence SRV-AAAA-XXXXXX et un statut suivi dans **Mes demandes**.' },
            { term: 'Demande de formation', definition: 'Demande déposée sur la plateforme de formation pour former plusieurs cadres de l’organisation. Référence DF-AAAA-XXXXXX ; statuts de Brouillon à Terminée.' },
            { term: 'Référence', definition: 'Code unique attribué à chaque message (MSG-…), demande de service (SRV-…), commande (CMD-…), reçu (REC-…) ou demande de formation (DF-…) : l’année suivie de six caractères. À citer dans tout échange.' },
            { term: 'Commande', definition: 'Ensemble à régler (service payant, formation, événement, ressource) créé avant un paiement. Référence CMD-… ; statuts En attente, Payée, Échoué, Annulé, Remboursé, Partiellement remboursée.' },
            { term: 'Reçu', definition: 'Justificatif numéroté (REC-AAAA-XXXXXX) émis automatiquement à la confirmation d’un paiement et disponible en PDF quelques minutes plus tard dans **Paiements et reçus**.' },
            { term: 'Prise en charge', definition: 'Remise en pourcentage (0 à 100 %) enregistrée par la Fédération pour un bénéficiaire identifié par son adresse email, sur une formation, un événement ou toute offre. Elle s’applique automatiquement à la commande du bénéficiaire.' },
            { term: 'Code promotionnel', definition: 'Code transmis par la Fédération ou une organisation, à saisir sur la page de paiement pour obtenir une remise. Non cumulable avec une prise en charge ; utilisable une seule fois par commande.' },
            { term: 'Mobile Money', definition: 'Paiement par téléphone (Airtel Money ou Moov Money) : une demande de confirmation est envoyée sur votre téléphone, vous la validez, la commande est confirmée automatiquement.' },
            { term: 'Vérification en deux étapes', definition: 'Code temporaire à 6 chiffres, généré par une application d’authentification, demandé en plus du mot de passe à la connexion. Recommandée pour tout responsable.' },
            { term: 'Notification', definition: 'Message affiché dans la rubrique **Notifications** de votre espace, parfois doublé d’un email. Certaines informations (rattachement, prise en charge) n’existent que sous cette forme.' },
            { term: 'Plateforme de formation', definition: 'Second site de la Fédération, réservé aux formations : cours, cohortes, certificats, espace **Organisation**. Ouvert avec le même compte que le site institutionnel.' },
            { term: 'Cohorte', definition: 'Groupe de participants suivant ensemble une formation planifiée, avec ses séances et ses convocations.' },
            { term: 'Personne ressource', definition: 'Personne de l’organisation désignée dans une demande de formation pour suivre le dossier ; elle reçoit les emails relatifs à la demande.' },
            { term: 'Secrétariat général', definition: 'Organe de la Fédération qui reçoit les demandes d’affiliation et les propositions de partenariat, conduit les entretiens et prépare les décisions des instances.' },
            { term: 'Coordination', definition: 'Équipe de la Fédération chargée des formations : rattachement des responsables, fiches des organisations, demandes de formation, cohortes et certificats.' },
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
          caption: 'Le bon interlocuteur selon le problème',
          columns: ['Problème', 'À qui s’adresser', 'Comment'],
          rows: [
            ['Connexion impossible, mot de passe, adresse email, vérification en deux étapes perdue, page en erreur', 'Support', 'Formulaire **Contact**, objet « Assistance compte »'],
            ['Devenir responsable, changer de responsable, corriger la fiche de l’organisation, question sur une demande de formation DF-…', 'Coordination', 'Formulaire **Contact**, objet « Organisation : … »'],
            ['Affiliation, partenariat, question institutionnelle', 'Secrétariat général', 'Pages **Adhésion** et **Partenariat**, ou formulaire **Contact**'],
            ['Avancement d’une demande de service, document à fournir, correction d’une demande', 'Responsable des services', 'Formulaire **Contact** en citant la référence SRV-…'],
            ['Prise en charge, paiement non visible, reçu manquant, remboursement', 'Finance / contrôle', 'Formulaire **Contact** en citant la référence CMD-… et la référence de l’opérateur'],
            ['Situation urgente (conflit, convocation imminente)', 'Permanence de la Fédération', 'Téléphone, du lundi au vendredi'],
          ],
        },
        {
          type: 'list',
          title: 'Ce qu’il faut indiquer dans un message d’aide',
          style: 'check',
          items: [
            'L’adresse email de votre compte FETRAG et le nom exact de votre organisation.',
            'L’écran concerné (par exemple « page Régler la commande », « fiche du service X ») et l’appareil utilisé (téléphone ou ordinateur).',
            'Le message d’erreur exact, recopié.',
            'Les références utiles : MSG-…, SRV-…, CMD-…, REC-…, DF-….',
            'La date et l’heure du problème, et ce que vous avez déjà essayé.',
            'Jamais votre mot de passe ni un code de paiement.',
          ],
        },
        {
          type: 'links',
          title: 'Coordonnées de la Fédération',
          items: [
            { label: 'Écrire à la Fédération', href: '/contact', description: 'Formulaire de contact avec accusé de réception et référence de suivi.', icon: 'mail' },
            { label: 'Appeler la permanence', href: 'tel:+24166230033', description: '066 23 00 33 ou 077 52 27 98, du lundi au vendredi.', icon: 'phone' },
            { label: 'Adresse email de la Fédération', href: 'mailto:jossngomafm@gmail.com', description: 'jossngomafm@gmail.com', icon: 'send' },
            { label: 'Siège', href: '/contact', description: 'BP 1234 Libreville, Gabon.', icon: 'map-pin' },
            { label: 'Questions fréquentes du site', href: '/faq', description: 'Réponses aux questions les plus courantes sur le site et la plateforme.', icon: 'help-circle' },
          ],
        },
      ],
    },
  ],
  related: [
    { label: 'Guide du membre', href: '/espace/guide', description: 'Votre compte, votre profil, vos inscriptions : les pages communes à tous les utilisateurs du site.' },
    { label: 'Guide du responsable d’organisation sur la plateforme', href: '{{lms}}/organisation/guide', description: 'Demandes de formation, participants, rapports et certificats de votre organisation.', external: true },
    { label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'Suivre une formation sur la plateforme, comme vos participants.', external: true },
  ],
  selfAssessment: {
    intro: 'Dix questions pour vérifier que vous savez où agir, sur le site ou sur la plateforme, et à qui vous adresser. Comptez cinq minutes ; le corrigé renvoie à la section du guide.',
    passPercent: 70,
    questions: [
      {
        id: 'q-role-1',
        sectionId: 'devenir-responsable',
        type: 'single',
        prompt: 'Comment devient-on responsable de son organisation sur le site ?',
        options: [
          { id: 'a', text: 'En remplissant le champ « Organisation ou employeur » à l’inscription.', correct: false },
          { id: 'b', text: 'En demandant le rattachement à la Fédération via la page Contact ; la coordination l’effectue.', correct: true },
          { id: 'c', text: 'En cochant une case « Responsable » dans son profil.', correct: false },
        ],
        explanation: 'Aucune auto-désignation n’est possible : voir « Comment devenir responsable de mon organisation ».',
      },
      {
        id: 'q-role-2',
        sectionId: 'votre-role',
        type: 'true-false',
        prompt: 'Un responsable d’organisation voit les demandes de service déposées par les autres membres de son organisation.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Chaque demande n’est visible que par le compte qui l’a déposée : voir « Votre rôle en bref ».',
      },
      {
        id: 'q-affiliation-1',
        sectionId: 'demander-affiliation',
        type: 'single',
        prompt: 'Quelle référence reçoit une demande d’affiliation envoyée depuis la page Adhésion ?',
        options: [
          { id: 'a', text: 'SRV-AAAA-XXXXXX', correct: false },
          { id: 'b', text: 'MSG-AAAA-XXXXXX', correct: true },
          { id: 'c', text: 'DF-AAAA-XXXXXX', correct: false },
        ],
        explanation: 'Les formulaires d’adhésion, de partenariat et de contact sont des messages MSG-… : voir « Comment demander l’affiliation de mon organisation ».',
      },
      {
        id: 'q-annuaire-1',
        sectionId: 'annuaire-organisations',
        type: 'single',
        prompt: 'La ville de votre organisation est erronée dans l’annuaire. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je modifie la fiche depuis mon espace personnel.', correct: false },
          { id: 'b', text: 'J’écris à la coordination via le formulaire Contact en indiquant la correction.', correct: true },
          { id: 'c', text: 'Je dépose une nouvelle demande d’affiliation.', correct: false },
        ],
        explanation: 'Seule la coordination modifie la fiche : voir « Comment vérifier la fiche de mon organisation dans l’annuaire ».',
      },
      {
        id: 'q-service-1',
        sectionId: 'deposer-une-demande-gratuite',
        type: 'single',
        prompt: 'Quel champ du formulaire de demande de service indique que vous agissez au nom de votre organisation ?',
        options: [
          { id: 'a', text: 'Le champ Organisation du groupe Vos coordonnées.', correct: true },
          { id: 'b', text: 'Le champ Téléphone.', correct: false },
          { id: 'c', text: 'La case de consentement.', correct: false },
        ],
        explanation: 'Le champ **Organisation** (texte libre) nomme l’organisation concernée : voir « Déposer une demande (service gratuit) ».',
      },
      {
        id: 'q-service-2',
        sectionId: 'suivre-une-demande',
        type: 'multiple',
        prompt: 'Que pouvez-vous faire depuis la page Mes demandes pour une demande de service ?',
        options: [
          { id: 'a', text: 'Voir son statut courant et l’agent qui la suit.', correct: true },
          { id: 'b', text: 'Annuler la demande.', correct: false },
          { id: 'c', text: 'Modifier le message complémentaire.', correct: false },
          { id: 'd', text: 'Retrouver sa référence SRV-… et sa date de dépôt.', correct: true },
        ],
        explanation: 'La page affiche le suivi, sans action possible ; toute correction passe par Contact : voir « Suivre l’avancement ».',
      },
      {
        id: 'q-paiement-1',
        sectionId: 'service-payant',
        type: 'true-false',
        prompt: 'Un code promotionnel peut se cumuler avec une prise en charge sur la même commande.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Le message « Une prise en charge est déjà appliquée : le code promotionnel n’est pas cumulable » le rappelle : voir « Comment déposer et payer une demande de service payante ».',
      },
      {
        id: 'q-prise-en-charge-1',
        sectionId: 'prise-en-charge',
        type: 'single',
        prompt: 'Une prise en charge est accordée à un membre de votre organisation. Qui s’inscrit et paie l’éventuel reste ?',
        options: [
          { id: 'a', text: 'Vous, depuis votre espace, au nom du membre.', correct: false },
          { id: 'b', text: 'Le membre, avec son propre compte ; la remise s’applique automatiquement.', correct: true },
          { id: 'c', text: 'La coordination, qui inscrit le membre d’office.', correct: false },
        ],
        explanation: 'La prise en charge est rattachée au compte du bénéficiaire : voir « Comment obtenir une prise en charge pour un membre de mon organisation ».',
      },
      {
        id: 'q-recu-1',
        sectionId: 'paiements-et-recus',
        type: 'single',
        prompt: 'Où télécharger le reçu PDF d’une commande payée ?',
        options: [
          { id: 'a', text: 'Paiements et reçus > Détail > carte Reçu > Télécharger le PDF.', correct: true },
          { id: 'b', text: 'Mes demandes > Messages envoyés.', correct: false },
          { id: 'c', text: 'Notifications > Tout marquer comme lu.', correct: false },
        ],
        explanation: 'Le reçu est dans le détail de la commande : voir « Comment régler une commande en attente et récupérer un reçu ».',
      },
      {
        id: 'q-passerelle-1',
        sectionId: 'passerelle-plateforme',
        type: 'single',
        prompt: 'Où déposez-vous une demande de formation pour dix cadres de votre organisation ?',
        options: [
          { id: 'a', text: 'Sur le site, dans Mes demandes.', correct: false },
          { id: 'b', text: 'Sur la plateforme de formation, espace Organisation > Demande de formation.', correct: true },
          { id: 'c', text: 'Sur le site, depuis la fiche d’un module, bouton S’inscrire à ce module.', correct: false },
        ],
        explanation: 'Le site ne gère pas les demandes de formation : voir « Ce que vous faites sur la plateforme de formation ».',
      },
      {
        id: 'q-securite-1',
        sectionId: 'me-deconnecter',
        type: 'single',
        prompt: 'Vous avez consulté votre espace depuis le téléphone d’un collègue. Que faites-vous avant de le rendre ?',
        options: [
          { id: 'a', text: 'Je ferme simplement le navigateur.', correct: false },
          { id: 'b', text: 'J’ouvre le menu de mon compte et je clique sur Déconnexion.', correct: true },
          { id: 'c', text: 'Rien : la session se ferme toute seule.', correct: false },
        ],
        explanation: 'La déconnexion protège vos demandes, vos paiements et l’espace de votre organisation : voir « Me déconnecter ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'single',
        prompt: 'Un membre a payé plein tarif malgré une prise en charge accordée. À qui vous adressez-vous ?',
        options: [
          { id: 'a', text: 'Au Secrétariat général, via la page Adhésion.', correct: false },
          { id: 'b', text: 'À la Finance, via le formulaire Contact, en citant la référence CMD-… de la commande.', correct: true },
          { id: 'c', text: 'Au formateur du module.', correct: false },
        ],
        explanation: 'Les questions de paiement et de remboursement relèvent de la Finance : voir « Besoin d’aide ? ».',
      },
    ],
  },
}
