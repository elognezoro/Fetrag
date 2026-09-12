import type { Guide } from '@fetrag/contracts'

/**
 * Guide du super administrateur (site institutionnel, rôle SUPER_ADMIN).
 *
 * Périmètre : tout le back-office du site (« Administration du site ») avec, en détail, les écrans réservés
 * au super administrateur : utilisateurs et rôles, paramètres, clés API, file de traitements, menus, journal
 * d’audit, rapports, sécurité et gouvernance (que déléguer à quel rôle). Les procédures métier des autres
 * rôles (contenus, services, finance, assistance, coordination) vivent dans leurs guides respectifs.
 *
 * Libellés, statuts, règles et messages : vérifiés dans le code d’apps/web (voir l’inventaire du chantier
 * « guides »). Ne documente que ce qui existe ; ne contient ni secret, ni compte de démonstration, ni domaine.
 */
export const webAdministrateur: Guide = {
  id: 'web-administrateur',
  platform: 'web',
  role: 'SUPER_ADMIN',
  title: 'Guide du super administrateur',
  subtitle: 'Piloter le site institutionnel de bout en bout',
  audience:
    'Ce guide s’adresse aux personnes disposant du rôle « Super administrateur » : celles qui créent les comptes, attribuent les rôles, règlent les paramètres, surveillent la sécurité, les traitements en arrière-plan et le journal d’audit des deux plateformes de la Fédération.',
  summary:
    'En tant que super administrateur, vous avez accès à tout le back-office du site institutionnel et vous êtes la seule personne à pouvoir créer des comptes, attribuer ou retirer des rôles, modifier les paramètres et gérer les clés API. Vous surveillez les traitements en arrière-plan, les emails non délivrés et le journal d’audit, et vous intervenez quand un compte doit être sécurisé. Vous déléguez le travail quotidien (contenus, services, finance, assistance, formation) aux rôles prévus pour cela.',
  tone: 'navy',
  icon: 'shield',
  readingMinutes: 55,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte sur le site institutionnel avec le rôle « Super administrateur » en portée globale (attribué par un autre super administrateur).',
    'Une application d’authentification installée sur votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP) pour la vérification en deux étapes, obligatoire pour ce rôle.',
    'Un ordinateur pour les tâches longues (paramètres, menus, journal d’audit) ; un smartphone suffit pour les vérifications et les actions rapides.',
    'L’accès aux runbooks du dossier « docs/runbooks » du dépôt (procédures d’exploitation) si vous intervenez sur l’hébergement.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'page « Se connecter », en haut à droite du site',
      result: 'Si la vérification en deux étapes est active, le champ **Code de vérification** apparaît.',
    },
    {
      text: 'Activez la vérification en deux étapes si ce n’est pas encore fait.',
      ui: 'Activer la vérification en deux étapes',
      where: 'menu du compte (vos initiales, en haut à droite) › **Sécurité**',
      result: 'Le badge **Vérification en deux étapes active** s’affiche et huit codes de secours vous sont donnés une seule fois.',
    },
    {
      text: 'Ouvrez le back-office.',
      ui: 'Administration du site',
      where: 'menu du compte (vos initiales, en haut à droite)',
      result: 'La page **Tableau de bord** s’ouvre avec la barre latérale marine « Administration ».',
    },
    {
      text: 'Lisez l’alerte **Traitements en arrière-plan à surveiller** si elle est affichée.',
      where: 'en haut du tableau de bord',
      result: 'Vous savez s’il y a des tâches en échec ou des emails non délivrés à traiter.',
    },
    {
      text: 'Vérifiez qu’au moins un autre super administrateur actif existe.',
      where: '**Utilisateurs et rôles** › tuile **Équipe d’administration**',
      result: 'Le compteur « N super administrateur(s) » indique au moins 2.',
      note: 'Un seul super administrateur, c’est un risque : en cas de perte d’accès, personne ne peut réinitialiser votre vérification en deux étapes.',
    },
  ],
  sections: [
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'shield',
      summary: 'Ce que le rôle de super administrateur permet, ce qu’il ne permet pas, et avec qui vous travaillez.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le super administrateur est le gardien de la plateforme. Il ne rédige pas les actualités, ne traite pas les demandes de service et ne rembourse pas les commandes : il donne les bons droits aux bonnes personnes, règle les paramètres communs et surveille que tout fonctionne. Chacune de vos actions sensibles est inscrite dans le **Journal d’audit** (une trace qui ne peut être ni modifiée ni effacée).',
        },
        {
          type: 'list',
          title: 'Ce que vous seul pouvez faire',
          style: 'check',
          items: [
            'Créer un compte pour un membre de l’équipe, un formateur ou un responsable d’organisation (`Nouveau compte`).',
            'Attribuer un rôle (avec sa portée et une date d’expiration éventuelle) et le révoquer (`Attribuer un rôle`, `Révoquer`).',
            'Désactiver ou réactiver un compte, réinitialiser la vérification en deux étapes d’une personne, définir un mot de passe temporaire.',
            'Modifier les **Paramètres** : coordonnées de la Fédération, règles métier, bandeau de maintenance, règle de correction des quiz.',
            'Générer et révoquer les **Clés API** utilisées par les intégrations externes.',
            'Relancer ou annuler les tâches de la **File de traitements** (emails, certificats, reçus, publications planifiées).',
            'Consulter tous les guides d’utilisation, y compris ceux des autres rôles.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que vous pouvez aussi faire, comme d’autres rôles',
          style: 'bullet',
          items: [
            'Tout ce que font l’Éditeur communication, le Responsable services, Finance / contrôle, le Support et le Coordinateur formation : le rôle de super administrateur ouvre toutes les entrées du back-office.',
            'Lire le **Journal d’audit** et l’exporter (comme Finance / contrôle).',
            'Consulter les **Rapports** et les exporter (comme la coordination, l’édition et la finance).',
            'Modifier les **Menus** de navigation (comme l’Éditeur communication).',
          ],
        },
        {
          type: 'list',
          title: 'Ce que l’interface ne permet pas',
          style: 'bullet',
          items: [
            'Supprimer définitivement un compte : seule la désactivation existe, et les données (inscriptions, certificats, commandes) sont conservées.',
            'Modifier le nom, l’adresse email ou le téléphone d’un autre utilisateur : chaque personne met à jour son profil depuis son espace personnel.',
            'Modifier les secrets techniques (base de données, service d’email, paiements) ou les fonctionnalités optionnelles : ils se règlent dans l’environnement d’hébergement, jamais dans le back-office.',
            'Fermer une session précise d’un utilisateur : les sessions se ferment toutes ensemble en désactivant le compte ou en définissant un mot de passe temporaire.',
            'Retirer votre propre rôle de super administrateur, désactiver votre propre compte ou retirer le dernier super administrateur actif.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait', 'Ce que vous faites pour lui'],
          rows: [
            ['Éditeur communication', 'Pages, actualités, ressources, événements, médias, menus, FAQ, messages de contact.', 'Créer son compte, attribuer le rôle, vérifier sa vérification en deux étapes.'],
            ['Responsable services', 'Catalogue des services et demandes de service.', 'Créer son compte, attribuer le rôle.'],
            ['Finance / contrôle', 'Commandes, paiements, remboursements, prises en charge, exports, journal d’audit.', 'Créer son compte, attribuer le rôle, vérifier sa vérification en deux étapes.'],
            ['Support', 'Assistance aux utilisateurs, lecture des demandes et des messages.', 'Créer son compte, attribuer le rôle ; il vous signale les comptes à débloquer.'],
            ['Coordinateur formation', 'Formations, cohortes, certificats, demandes de formation, organisations.', 'Créer son compte, attribuer le rôle, vérifier sa vérification en deux étapes.'],
            ['Formateur, Responsable d’organisation', 'Animation d’un cours ou d’une cohorte ; dépôt des demandes d’une organisation.', 'Attribuer un rôle à portée limitée (cours, cohorte, organisation).'],
            ['Exploitant (hébergement)', 'Variables d’environnement, secrets, cron, sauvegardes.', 'Lui transmettre les constats de l’état de santé et des runbooks ; ne jamais lui envoyer un secret par message.'],
          ],
        },
      ],
    },
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte et connexion',
      icon: 'log-in',
      summary: 'Se connecter, activer la vérification en deux étapes, retrouver son mot de passe, se déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre compte est le même sur le site institutionnel et sur la plateforme de formation. Le rôle de super administrateur exige la **vérification en deux étapes** : en plus du mot de passe, un code à six chiffres généré par une application sur votre téléphone est demandé à chaque connexion. Selon la configuration du déploiement, le back-office peut rester bloqué tant qu’elle n’est pas activée ; dans tous les cas, activez-la dès votre première connexion.',
        },
        {
          type: 'steps',
          title: 'Se connecter au back-office',
          items: [
            {
              text: 'Ouvrez la page de connexion.',
              ui: 'Se connecter',
              where: 'en haut à droite du site ; sur mobile, ouvrez d’abord le menu avec le bouton **Menu** (trois traits) en haut à droite',
              result: 'Le formulaire avec **Adresse email** et **Mot de passe** s’affiche.',
            },
            {
              text: 'Saisissez votre **Adresse email** et votre **Mot de passe**, puis cliquez sur `Se connecter`.',
              result: 'Si la vérification en deux étapes est active, un message bleu « Ce compte est protégé par une vérification en deux étapes… » apparaît avec le champ **Code de vérification**.',
              note: 'Sans vérification en deux étapes, vous êtes connecté directement et la page « Vérification en deux étapes » vous propose de l’activer.',
            },
            {
              text: 'Ouvrez votre application d’authentification et lisez le code à six chiffres affiché pour « FETRAG ».',
              note: 'Le code change toutes les 30 secondes. Si vous n’avez plus votre téléphone, saisissez l’un de vos codes de secours (format XXXXX-XXXXX) : chaque code de secours ne sert qu’une fois.',
            },
            {
              text: 'Saisissez le code dans **Code de vérification** puis cliquez sur `Vérifier et se connecter`.',
              result: 'Vous êtes connecté ; vos initiales apparaissent en haut à droite.',
            },
            {
              text: 'Ouvrez le menu du compte et cliquez sur **Administration du site**.',
              where: 'vos initiales, en haut à droite',
              result: 'Le back-office s’ouvre sur le **Tableau de bord**. En bas de la barre latérale, la pastille « Super administrateur » confirme votre rôle.',
            },
            {
              text: 'Sur mobile, ouvrez la navigation du back-office avec le bouton **Ouvrir la navigation** (trois traits).',
              where: 'en haut à gauche de la barre supérieure « Back-office »',
              result: 'Un tiroir plein écran liste toutes les sections ; il se ferme avec le bouton **Fermer la navigation** (croix) ou dès que vous changez de page.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si la connexion ne marche pas',
          items: [
            {
              problem: 'Message « Adresse email ou mot de passe incorrect. »',
              cause: 'Faute de frappe, ou ancien mot de passe.',
              solution: 'Vérifiez les majuscules et l’adresse. Après plusieurs échecs, utilisez « Mot de passe oublié ? ».',
            },
            {
              problem: 'Message « Le code de vérification est invalide ou expiré. Réessayez avec un nouveau code. »',
              cause: 'Le code a changé pendant la saisie, ou l’heure de votre téléphone est décalée.',
              solution: 'Attendez le code suivant et saisissez-le sans espace. Vérifiez que l’heure du téléphone est réglée automatiquement.',
            },
            {
              problem: 'Message « Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer. »',
              cause: 'Protection contre les essais répétés.',
              solution: 'Attendez quelques minutes avant un nouvel essai. Si vous n’êtes pas à l’origine des tentatives, signalez-le : il peut s’agir d’une attaque sur votre compte.',
            },
            {
              problem: 'Message « Ce compte est désactivé. Contactez le support de la FETRAG pour le réactiver. »',
              cause: 'Votre compte a été désactivé par un autre super administrateur.',
              solution: 'Demandez-lui de le réactiver depuis votre fiche (bouton `Réactiver le compte`).',
            },
            {
              problem: 'Le menu du compte ne propose pas **Administration du site**.',
              cause: 'Votre rôle n’est pas attribué en portée globale, ou il a expiré.',
              solution: 'Demandez à un autre super administrateur de vérifier votre fiche : la ligne « Super administrateur » doit avoir la portée « Globale » et l’expiration « Sans limite » ou une date à venir.',
            },
            {
              problem: 'La page « Accès refusé » s’affiche en ouvrant une adresse du back-office.',
              cause: 'La page demande une permission que votre compte n’a pas (rôle expiré ou retiré).',
              solution: 'Cliquez sur `Aller à mon espace` puis faites vérifier vos rôles. Le lien « Changer de compte » permet de vous reconnecter avec un autre compte.',
            },
          ],
        },
      ],
      subsections: [
        {
          id: 'activer-la-verification-en-deux-etapes',
          title: 'Activer votre vérification en deux étapes',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone si vous n’en avez pas.',
                  note: 'Google Authenticator, Microsoft Authenticator, Aegis ou FreeOTP conviennent. Aucune de ces applications n’a besoin de connexion Internet pour générer les codes.',
                },
                {
                  text: 'Ouvrez la page **Sécurité**.',
                  where: 'menu du compte (vos initiales, en haut à droite) › **Sécurité**',
                  result: 'La page « Protéger mon compte » s’ouvre avec le badge **Vérification en deux étapes inactive**.',
                },
                {
                  text: 'Cliquez sur `Activer la vérification en deux étapes`.',
                  where: 'carte **Vérification en deux étapes**',
                  result: 'L’**Étape 1** affiche un QR code et une clé à saisir manuellement.',
                },
                {
                  text: 'Dans l’application, ajoutez un compte en scannant le QR code (ou en saisissant la clé).',
                  result: 'L’application affiche un code à six chiffres pour « FETRAG ».',
                  note: 'Sur smartphone, vous ne pouvez pas scanner l’écran du même téléphone : utilisez la clé manuelle (copiez-la) ou faites l’activation depuis un ordinateur.',
                },
                {
                  text: 'Saisissez ce code dans **Code à 6 chiffres affiché par l’application** puis cliquez sur `Confirmer et activer`.',
                  where: '**Étape 2**',
                  result: 'L’alerte « Codes de secours - affichés une seule fois » liste huit codes, puis « Vérification en deux étapes activée ».',
                },
                {
                  text: 'Cliquez sur `Copier les codes` et rangez-les dans un endroit sûr (gestionnaire de mots de passe, coffre, document chiffré).',
                  result: 'Le message « Codes copiés dans le presse-papiers » apparaît.',
                  note: 'Ces codes ne seront plus jamais affichés. Il vous en reste un compteur (« Il vous reste N code(s) de secours ») ; pour en obtenir de nouveaux, désactivez puis réactivez la vérification.',
                },
                {
                  text: 'Pour désactiver plus tard : saisissez un **Code de vérification ou code de secours** puis cliquez sur `Désactiver la vérification`.',
                  where: 'bas de la carte **Vérification en deux étapes**',
                  result: 'Le badge repasse à « inactive » ; réactivez-la aussitôt si vous vouliez seulement renouveler vos codes de secours.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Téléphone perdu, sans code de secours',
              text: 'Vous ne pourrez plus vous connecter seul. Un autre super administrateur doit ouvrir votre fiche dans **Utilisateurs et rôles** et cliquer sur `Réinitialiser la MFA` (voir « Sécuriser un compte »). C’est pour cela qu’il faut toujours au moins deux super administrateurs actifs.',
            },
          ],
        },
        {
          id: 'mot-de-passe-et-deconnexion',
          title: 'Mot de passe oublié et déconnexion',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Si vous avez oublié votre mot de passe, cliquez sur **Mot de passe oublié ?** sur la page de connexion.',
                  result: 'La page « Mot de passe oublié » demande l’**Adresse email du compte**.',
                },
                {
                  text: 'Saisissez votre adresse et cliquez sur `Recevoir le lien de réinitialisation`.',
                  result: 'Un email « Réinitialisation de votre mot de passe FETRAG » arrive dans votre boîte ; le lien est valable 30 minutes et ne sert qu’une fois.',
                  note: 'Le nouveau mot de passe doit comporter au moins 8 caractères, une majuscule et un chiffre.',
                },
                {
                  text: 'Pour changer votre mot de passe sans l’avoir oublié, utilisez la carte **Mot de passe** de la page **Sécurité**.',
                  result: 'Un email « Votre mot de passe FETRAG a été modifié » confirme le changement.',
                },
                {
                  text: 'Pour vous déconnecter, ouvrez le menu du compte et cliquez sur **Déconnexion**.',
                  where: 'vos initiales, en haut à droite ; sur mobile, dans le menu **Menu** (trois traits)',
                  result: 'Vous revenez sur le site public. Faites-le systématiquement sur un appareil partagé.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'se-reperer',
      title: 'Se repérer dans le back-office',
      icon: 'compass',
      summary: 'La barre latérale, la barre supérieure, le tableau de bord et les écrans sur mobile.',
      blocks: [
        {
          type: 'screen',
          title: 'La coquille « Administration » (toutes les pages du back-office)',
          description: 'Sur ordinateur, une barre latérale marine à gauche et une barre supérieure. Sur mobile (moins de 1024 px de large), la barre latérale devient un tiroir.',
          areas: [
            {
              name: 'Barre latérale « Administration » (ordinateur) ou tiroir de navigation (mobile)',
              purpose: 'Emblème FETRAG et ruban or « Administration » en haut ; puis les sections **Pilotage**, **Contenus**, **Services**, **Relations** et **Administration**. Un badge chiffré signale les éléments à traiter (contenus en relecture, demandes, messages). Vous voyez toutes les entrées ; les autres rôles ne voient que les leurs.',
              icon: 'menu',
            },
            {
              name: 'Pied de la barre latérale',
              purpose: 'Votre nom, votre email, la pastille de votre rôle dominant (« Super administrateur ») et le bouton `Coordination LMS` qui ouvre l’espace de coordination de la plateforme de formation.',
              icon: 'user',
            },
            {
              name: 'Barre supérieure « Back-office »',
              purpose: 'Sur mobile, le bouton **Ouvrir la navigation** (trois traits) à gauche ; le titre de la section courante ; le lien **Voir le site** (nouvel onglet, masqué sur les écrans étroits).',
              icon: 'monitor',
            },
            {
              name: 'Zone principale',
              purpose: 'Le contenu de la section : titre, courte description, boutons d’action en haut à droite (sur mobile, ils passent sous le titre en pleine largeur), tuiles de chiffres, filtres, tableaux ou formulaires.',
              icon: 'layout-dashboard',
            },
            {
              name: 'Page « Élément introuvable »',
              purpose: 'S’affiche quand un lien pointe vers un contenu, une demande ou un utilisateur supprimé ou inexistant. Le bouton `Retour au tableau de bord` vous ramène à l’accueil.',
              icon: 'x-circle',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Les entrées de la barre latérale et qui d’autre les voit',
          columns: ['Section', 'Entrées', 'Autres rôles concernés'],
          rows: [
            ['Pilotage', 'Tableau de bord', 'Tous les rôles du back-office (avec des indicateurs réduits).'],
            ['Contenus', 'Pages, Actualités, Catégories, Ressources, Médias, Menus, FAQ', 'Éditeur communication (médias : aussi coordination et services).'],
            ['Services', 'Catalogue, Demandes', 'Responsable services (demandes : aussi Support).'],
            ['Relations', 'Événements, Partenaires et organisations, Messages reçus, Newsletter', 'Éditeur communication, Responsable services, Support selon l’entrée.'],
            ['Administration', 'Utilisateurs et rôles, Organisations, Finance, Rapports, Journal d’audit, Paramètres', 'Support, coordination et finance en lecture pour les utilisateurs ; Finance pour le journal ; **Paramètres** : vous seul.'],
          ],
        },
        {
          type: 'screen',
          title: 'La page « Tableau de bord »',
          description: 'Vue d’ensemble du site : audience, sollicitations reçues, contenus à valider, activité financière et indicateurs de formation. Sur mobile, les tuiles sont sur deux colonnes et les cartes s’empilent.',
          areas: [
            {
              name: 'Alerte « Traitements en arrière-plan à surveiller »',
              purpose: 'Visible par vous seul, et seulement s’il y a des tâches en échec ou abandonnées, ou des emails non délivrés sur 24 h. Elle indique aussi combien de tâches sont en file et à exécuter maintenant.',
              icon: 'alert-triangle',
            },
            {
              name: 'Tuiles de chiffres',
              purpose: '**Pages vues sur 30 jours**, **Formulaires reçus sur 30 jours**, **Demandes de service en cours**, **Chiffre d’affaires sur 12 mois**.',
              icon: 'bar-chart',
            },
            {
              name: 'Cartes d’activité',
              purpose: '**Audience du site**, **Formulaires par type**, **Contenus en relecture** (bouton `Relire` sur chaque contenu), **Dernières demandes de service**, **Messages reçus**, **Ventes mensuelles**, **Contenus les plus consultés**.',
              icon: 'inbox',
            },
            {
              name: 'Carte marine « Plateforme de formation »',
              purpose: 'Apprenants actifs, nouvelles inscriptions, taux de complétion et certificats émis sur 30 jours ; bouton or `Coordination LMS`.',
              icon: 'graduation-cap',
            },
            {
              name: 'Raccourcis du bas',
              purpose: '`Nouvelle actualité`, `Utilisateurs`, `Voir le site` ; en haut à droite, `Rapports détaillés`.',
              icon: 'zap',
            },
          ],
        },
        { type: 'path', label: 'Chemin vers vos écrans réservés', items: ['Menu du compte', 'Administration du site', 'Administration', 'Utilisateurs et rôles / Journal d’audit / Paramètres'], href: '/admin' },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Sur smartphone',
          text: 'Les tableaux masquent certaines colonnes (organisations, sécurité, dates) et défilent horizontalement dans leur cadre. Pour les tâches longues (paramètres, menus, journal d’audit), préférez un ordinateur ; le smartphone convient aux vérifications et aux actions rapides (relancer une tâche, révoquer un rôle).',
        },
      ],
    },
    {
      id: 'lire-le-tableau-de-bord',
      title: 'Comment lire le tableau de bord chaque jour',
      icon: 'layout-dashboard',
      summary: 'Une routine de cinq minutes pour repérer ce qui demande votre intervention.',
      blocks: [
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Tableau de bord**.',
              where: 'section **Pilotage** de la barre latérale ; sur mobile, bouton **Ouvrir la navigation** (trois traits) en haut à gauche',
              result: 'La page « Bonjour <votre prénom> » s’affiche.',
            },
            {
              text: 'Regardez s’il y a une alerte **Traitements en arrière-plan à surveiller** en haut de page.',
              result: 'Elle indique « N tâche(s) en échec ou abandonnée(s) · N email(s) non délivré(s) sur 24 h · N en file, N à exécuter maintenant. »',
              note: 'Pas d’alerte = rien d’anormal du côté des traitements. Si elle est présente, suivez « Superviser les traitements et les emails ».',
            },
            {
              text: 'Parcourez la carte **Contenus en relecture** et les badges de la barre latérale.',
              result: 'Vous voyez ce qui attend une validation ou une réponse ; ce travail revient normalement à l’Éditeur, au Responsable services ou au Support.',
              note: 'Si un badge reste élevé plusieurs jours, vérifiez que la personne en charge dispose bien de son rôle et qu’elle se connecte (colonne « Dernière connexion » des utilisateurs).',
            },
            {
              text: 'Pour aller plus loin, cliquez sur `Rapports détaillés`.',
              where: 'en haut à droite (sous le titre sur mobile)',
              result: 'La page **Rapports** s’ouvre (voir « Consulter et exporter les rapports »).',
            },
          ],
        },
      ],
    },
    {
      id: 'gerer-les-utilisateurs',
      title: 'Comment gérer les utilisateurs',
      icon: 'users',
      summary: 'Rechercher un compte, lire sa fiche, créer un compte avec invitation par email.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page **Utilisateurs et rôles** regroupe les comptes des deux plateformes (site et formation) : un compte créé ici sert aussi sur la plateforme de formation. Le Support, la coordination et la finance peuvent consulter cette page ; vous seul pouvez créer un compte et agir dessus.',
        },
        { type: 'path', label: 'Chemin', items: ['Barre latérale', 'Administration', 'Utilisateurs et rôles'], href: '/admin/utilisateurs' },
      ],
      subsections: [
        {
          id: 'rechercher-un-utilisateur',
          title: 'Rechercher et filtrer les comptes',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Utilisateurs et rôles**.',
                  where: 'section **Administration** de la barre latérale',
                  result: 'Quatre tuiles résument les comptes : **Comptes enregistrés**, **Apprenants**, **Équipe pédagogique**, **Équipe d’administration** (avec le nombre de super administrateurs).',
                },
                {
                  text: 'Saisissez un nom, une adresse email ou un employeur dans le champ de recherche « Nom, email ou employeur ».',
                  where: 'barre de filtres, au-dessus du tableau',
                  note: 'La recherche ignore les majuscules ; 200 caractères au plus.',
                },
                {
                  text: 'Précisez si besoin le **Rôle**, le **Statut** (« Actifs » / « Désactivés ») ou l’**Organisation**, puis cliquez sur `Filtrer`.',
                  result: 'Le tableau « Utilisateurs » se met à jour et la première tuile devient « Comptes correspondant aux filtres ». Le bouton `Réinitialiser` efface les filtres.',
                  note: 'Sur mobile, les listes de filtres s’empilent en pleine largeur.',
                },
                {
                  text: 'Lisez les colonnes : **Utilisateur** (nom, email, employeur), **Rôles** (badges ; « (limité) » signale une portée non globale ; « Aucun rôle »), **Organisations**, **Sécurité** (badge « Actif » / « Désactivé », badge « MFA »), **Dernière connexion**, **Créé**.',
                  note: 'Sur mobile, seules les colonnes **Utilisateur** et **Rôles** sont visibles. Les comptes désactivés apparaissent grisés. La liste affiche 20 comptes par page.',
                },
                {
                  text: 'Cliquez sur le nom d’une personne pour ouvrir sa fiche.',
                  result: 'La fiche « <Nom de l’utilisateur> » s’ouvre.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Revue des comptes privilégiés',
              text: 'Filtrez par **Rôle** = Super administrateur, Coordinateur formation, Finance / contrôle ou Éditeur communication et vérifiez que chaque ligne porte le badge « MFA » dans la colonne **Sécurité** (sur ordinateur). Une personne sans badge doit activer sa vérification en deux étapes.',
            },
          ],
        },
        {
          id: 'lire-une-fiche-utilisateur',
          title: 'Lire la fiche d’un utilisateur',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Lisez l’en-tête : email, date de création, dernière connexion, badges **Compte actif** / **Compte désactivé** et **MFA active**.',
                  note: 'Sur votre propre fiche, une alerte rappelle que la désactivation et le retrait de votre rôle de super administrateur sont bloqués.',
                },
                {
                  text: 'Parcourez les cartes de la colonne principale : **Profil**, **Rôles et portées**, **Organisations**, **Inscriptions à la formation**, **Commandes**, **Consentements**, **Dernières connexions**, **Journal d’audit**.',
                  result: 'La carte **Dernières connexions** liste les dix dernières connexions, échecs et changements de sécurité, avec l’appareil utilisé.',
                  note: 'Sur mobile, ces cartes sont suivies de la colonne latérale (**Compte**, **Repères**) en dessous.',
                },
                {
                  text: 'Repérez la carte **Compte** dans la colonne latérale : compteurs (inscriptions, certificats, commandes, demandes) et boutons `Désactiver le compte` / `Réactiver le compte`, `Réinitialiser la MFA`, `Mot de passe temporaire`.',
                  note: 'Ces actions sont réservées au super administrateur ; chacune est journalisée.',
                },
                {
                  text: 'Pour la même personne sur la plateforme de formation, cliquez sur `Fiche sur la plateforme de formation`.',
                  where: 'carte **Repères**',
                  result: 'La fiche s’ouvre sur la plateforme de formation, avec le même compte.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Ce que signifient les badges de la fiche',
              items: [
                { label: 'Compte actif', tone: 'success', meaning: 'La personne peut se connecter.', next: 'Aucune action.' },
                { label: 'Compte désactivé', tone: 'danger', meaning: 'Connexion refusée, sessions fermées, données conservées.', next: '`Réactiver le compte` si la situation le justifie.' },
                { label: 'MFA active', tone: 'info', meaning: 'La vérification en deux étapes est activée ; un code est demandé à chaque connexion.', next: 'Attendu pour tout rôle privilégié.' },
                { label: 'Vérifié le <date> / Adresse non vérifiée', tone: 'neutral', meaning: 'L’adresse email a été confirmée (ou déclarée vérifiée par l’administration) ou non.', next: 'Une adresse non vérifiée bloque la connexion locale jusqu’à confirmation.' },
                { label: 'Mot de passe local défini / Aucun mot de passe local (fournisseur externe)', tone: 'neutral', meaning: 'Le compte se connecte par email et mot de passe, ou uniquement par le fournisseur d’identité externe.', next: 'Le mot de passe temporaire n’a de sens que pour un compte à mot de passe local.' },
                { label: 'Responsable / Membre', tone: 'info', meaning: 'Qualité dans une organisation ; un responsable dépose les demandes de formation de son organisation.', next: 'Se règle depuis la fiche de l’organisation.' },
                { label: 'Accordé / Refusé', tone: 'neutral', meaning: 'Dernier état d’un consentement (conditions, confidentialité, lettre d’information, communications, engagements).', next: 'Lecture seule.' },
              ],
            },
          ],
        },
        {
          id: 'creer-un-compte',
          title: 'Créer un compte avec invitation par email',
          blocks: [
            {
              type: 'paragraph',
              text: 'Créez un compte pour un membre de l’équipe, un formateur ou un responsable d’organisation qui ne s’inscrira pas lui-même. L’adresse email est considérée comme vérifiée. La personne reçoit un email d’invitation avec un lien pour définir son mot de passe (valable 7 jours) ; un mot de passe temporaire vous est aussi affiché une seule fois, comme canal de secours.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Cliquez sur `Nouveau compte`.',
                  where: 'en haut à droite de **Utilisateurs et rôles** (sous le titre sur mobile)',
                  result: 'La page « Nouveau compte » s’ouvre avec les sections **Identité** et **Rattachement et rôle**.',
                },
                {
                  text: 'Renseignez **Prénom** et **Nom** (obligatoires, 2 à 60 caractères chacun).',
                  note: 'Le nom complet affiché sera « Prénom Nom ».',
                },
                {
                  text: 'Renseignez l’**Adresse email** (obligatoire) : elle sert d’identifiant de connexion.',
                  note: 'Elle est mise en minuscules. Une adresse déjà utilisée est refusée (« Adresse déjà utilisée »).',
                },
                {
                  text: 'Renseignez si utile **Téléphone** (facultatif, format international accepté, 6 à 20 caractères), **Fonction** (facultatif, 120 caractères) et **Employeur** (facultatif, 160 caractères).',
                },
                {
                  text: 'Choisissez l’**Organisation** (facultatif) et cochez **Responsable de l’organisation** si la personne doit déposer les demandes de formation de son organisation.',
                  note: 'La case n’a d’effet que si une organisation est choisie.',
                },
                {
                  text: 'Choisissez le **Rôle initial** (obligatoire ; « Apprenant » par défaut).',
                  note: 'Ce rôle est toujours attribué en portée globale. Pour un rôle limité à une organisation, un cours ou une cohorte, laissez « Apprenant » ici et attribuez le rôle limité depuis la fiche, après création. Les rôles privilégiés exigent la vérification en deux étapes à la première connexion.',
                },
                {
                  text: 'Cliquez sur `Créer le compte`.',
                  where: 'en bas à droite (pleine largeur sur mobile)',
                  result: 'L’alerte verte « Compte créé pour <email> » s’affiche avec le message « Compte créé. Une invitation à définir son mot de passe (lien valable 7 jours) a été envoyée à <email>… » et un encadré contenant le mot de passe temporaire.',
                },
                {
                  text: 'Si vous devez transmettre le mot de passe temporaire, cliquez sur `Copier` et envoyez-le par un canal sûr (jamais par email, jamais dans un groupe de discussion).',
                  result: 'Le message « Copié dans le presse-papiers » apparaît. Le mot de passe ne sera plus jamais affiché.',
                  note: 'Dans le cas normal, la personne utilise le bouton « Définir mon mot de passe » de son email et vous n’avez pas besoin de transmettre le mot de passe temporaire.',
                },
                {
                  text: 'Cliquez sur `Ouvrir la fiche` pour attribuer des rôles limités, ou sur `Créer un autre compte`.',
                  result: 'La fiche de la personne s’ouvre, avec son rôle initial dans **Rôles et portées**.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Mot de passe temporaire',
              text: 'Il n’est affiché qu’une seule fois et ne transite jamais par email. Si vous fermez la page sans le copier et que l’invitation n’est pas arrivée, utilisez plus tard `Mot de passe temporaire` depuis la fiche (nouvelle génération) ou demandez à la personne d’utiliser « Mot de passe oublié ? ».',
            },
            {
              type: 'troubleshooting',
              title: 'Si la création ne marche pas',
              items: [
                {
                  problem: 'Message « Vérifiez les informations du compte. » avec un texte rouge sous un champ.',
                  cause: 'Un champ obligatoire est vide ou trop court (« Prénom trop court », « Adresse email invalide », « Numéro de téléphone invalide »).',
                  solution: 'Corrigez le champ signalé puis cliquez de nouveau sur `Créer le compte`.',
                },
                {
                  problem: 'Message « Un compte existe déjà avec cette adresse email ».',
                  cause: 'La personne s’est déjà inscrite (peut-être avec un compte désactivé).',
                  solution: 'Recherchez l’adresse dans **Utilisateurs et rôles** avec le statut « Désactivés » inclus, puis réactivez le compte ou attribuez-lui le rôle voulu.',
                },
                {
                  problem: 'Message « Compte créé, mais l’invitation par email n’a pas pu être envoyée… ».',
                  cause: 'Le service d’email est en panne ou mal configuré.',
                  solution: 'Copiez le mot de passe temporaire et transmettez-le par un canal sûr. Vérifiez ensuite la **File de traitements** et l’**État de santé** (voir « Superviser les traitements et les emails »).',
                },
                {
                  problem: 'La personne dit n’avoir rien reçu.',
                  cause: 'Email dans les indésirables, adresse mal saisie ou lien expiré (7 jours).',
                  solution: 'Faites vérifier le dossier « Courrier indésirable ». Passé 7 jours, la personne utilise « Mot de passe oublié ? » (lien de 30 minutes). Si l’adresse est fausse, créez un nouveau compte avec la bonne adresse et désactivez l’autre.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attribuer-et-revoquer-des-roles',
      title: 'Comment attribuer et retirer des rôles',
      icon: 'key-round',
      summary: 'Donner un rôle avec sa portée et son expiration, le retirer, comprendre les garde-fous.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un **rôle** donne des droits ; sa **portée** dit où ils s’appliquent : « Globale » (toute la plateforme), « Une organisation », « Un cours » ou « Une cohorte » (un groupe d’apprenants qui suit une formation ensemble). Une **expiration** facultative retire le rôle automatiquement à une date donnée, pratique pour un remplacement. Tout se fait depuis la carte **Rôles et portées** de la fiche d’un utilisateur.',
        },
        {
          type: 'table',
          caption: 'Les neuf rôles et leur portée habituelle',
          columns: ['Rôle', 'Portée habituelle', 'Vérification en deux étapes'],
          rows: [
            ['Apprenant', 'Globale', 'Facultative'],
            ['Responsable d’organisation', 'Une organisation', 'Facultative'],
            ['Formateur', 'Un cours ou une cohorte', 'Facultative'],
            ['Coordinateur formation', 'Globale', 'Obligatoire'],
            ['Éditeur communication', 'Globale', 'Obligatoire'],
            ['Responsable services', 'Globale', 'Facultative'],
            ['Finance / contrôle', 'Globale', 'Obligatoire'],
            ['Support', 'Globale', 'Facultative'],
            ['Super administrateur', 'Globale uniquement', 'Obligatoire'],
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Piège : super administrateur à portée limitée',
          text: 'Le dialogue accepte « Super administrateur » avec une portée « Une organisation », « Un cours » ou « Une cohorte », mais un tel rôle n’a aucun effet : seul un super administrateur en portée « Globale » a des droits. Choisissez toujours « Globale (toute la plateforme) » pour ce rôle.',
        },
      ],
      subsections: [
        {
          id: 'attribuer-un-role',
          title: 'Attribuer un rôle',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la fiche de la personne puis cliquez sur `Attribuer un rôle`.',
                  where: 'carte **Rôles et portées**, en haut à droite de la carte',
                  result: 'Le dialogue « Attribuer un rôle » s’ouvre (fenêtre centrée, y compris sur mobile).',
                },
                {
                  text: 'Choisissez le **Rôle** (obligatoire).',
                  note: 'Le sous-titre rappelle que les rôles globaux privilégiés (administration, coordination, finance, édition) exigent la vérification en deux étapes.',
                },
                {
                  text: 'Choisissez la **Portée** (obligatoire) : **Globale (toute la plateforme)**, **Une organisation**, **Un cours** ou **Une cohorte**.',
                  result: 'Pour une portée limitée, une liste **Choisir** apparaît avec les organisations actives, les cours ou les cohortes planifiées, ouvertes ou en cours.',
                },
                {
                  text: 'Sélectionnez l’élément de portée dans la liste **Choisir** (obligatoire si la portée n’est pas globale).',
                },
                {
                  text: 'Renseignez éventuellement **Expiration** (date et heure, facultatif).',
                  note: 'Vide = sans limite. La date doit être dans le futur (« La date d’expiration doit être future »). Personne n’est prévenu à l’expiration : notez-la dans votre agenda si un suivi est nécessaire.',
                },
                {
                  text: 'Cliquez sur `Attribuer`.',
                  where: 'en bas du dialogue (pendant l’envoi : « Attribution »)',
                  result: 'Le message « Rôle « X » attribué. » s’affiche, le dialogue se ferme et la nouvelle ligne apparaît dans le tableau avec sa portée et son expiration. La personne reçoit la notification « Nouveau rôle attribué » (interne et par email).',
                  note: 'Si la même combinaison rôle + portée existait déjà, seule l’expiration est mise à jour (« Rôle mis à jour. »). La vérification en deux étapes n’est pas activée automatiquement : la personne doit le faire depuis sa page **Sécurité**.',
                },
              ],
            },
          ],
        },
        {
          id: 'revoquer-un-role',
          title: 'Révoquer un rôle',
          blocks: [
            {
              type: 'callout',
              tone: 'warning',
              title: 'Effet immédiat',
              text: 'La révocation prend effet dès la page suivante ouverte par la personne. Elle n’est pas prévenue (aucun email) : informez-la vous-même. Pour rétablir le rôle, il faudra l’attribuer de nouveau.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la ligne du rôle, cliquez sur `Révoquer`.',
                  where: 'colonne **Action** du tableau **Rôles et portées**',
                  result: 'La confirmation « Révoquer le rôle « X » ? » précise que l’utilisateur perd immédiatement les droits associés.',
                },
                {
                  text: 'Cliquez sur `Révoquer` pour confirmer.',
                  result: 'Le message « Rôle « X » révoqué. » s’affiche et la ligne disparaît. Le journal d’audit enregistre « Rôle révoqué ».',
                },
                {
                  text: 'Si la personne quitte l’équipe, désactivez aussi son compte (voir « Sécuriser un compte ») : la révocation seule ne ferme pas ses sessions.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Lire le tableau « Rôles et portées »',
              items: [
                { label: 'Super administrateur (badge marine)', tone: 'info', meaning: 'Rôle le plus élevé ; « Protégé » remplace le bouton `Révoquer` sur votre propre ligne.', next: 'Ne peut être retiré ni de vous-même, ni du dernier super administrateur actif.' },
                { label: 'Rôle global (badge bleu)', tone: 'info', meaning: 'Le rôle s’applique à toute la plateforme.', next: 'Vérifiez la vérification en deux étapes pour les rôles privilégiés.' },
                { label: 'Rôle limité (badge à contour)', tone: 'neutral', meaning: 'Le rôle ne s’applique qu’à l’organisation, au cours ou à la cohorte indiqués dans la colonne **Portée**.', next: 'Dans la liste des utilisateurs, ces rôles portent le suffixe « (limité) ».' },
                { label: 'Sans limite', tone: 'success', meaning: 'Aucune date d’expiration.', next: 'Aucune action.' },
                { label: 'Jusqu’au <date>', tone: 'warning', meaning: 'Le rôle expirera automatiquement à cette date.', next: 'Prolongez-le en attribuant de nouveau le même rôle avec la même portée et une nouvelle date.' },
                { label: 'Expiré le <date>', tone: 'danger', meaning: 'Le rôle ne donne plus aucun droit ; la ligne reste affichée, grisée.', next: 'Révoquez-la pour nettoyer, ou attribuez de nouveau le rôle si nécessaire.' },
              ],
            },
            {
              type: 'troubleshooting',
              title: 'Si l’attribution ou la révocation ne marche pas',
              items: [
                {
                  problem: 'Message « Une portée limitée exige un identifiant de portée ».',
                  cause: 'La liste **Choisir** est restée vide.',
                  solution: 'Sélectionnez l’organisation, le cours ou la cohorte, ou passez la portée en « Globale ».',
                },
                {
                  problem: 'Message « La portée choisie n’existe pas. ».',
                  cause: 'L’organisation a été désactivée ou la cohorte fermée entre-temps.',
                  solution: 'Rechargez la page et choisissez de nouveau ; vérifiez l’élément dans **Organisations** ou sur la plateforme de formation.',
                },
                {
                  problem: 'Message « Vous ne pouvez pas retirer votre propre rôle de super administrateur ».',
                  cause: 'Garde-fou contre la perte d’accès.',
                  solution: 'Demandez à un autre super administrateur de le faire depuis votre fiche.',
                },
                {
                  problem: 'Message « Au moins un super administrateur actif doit subsister ».',
                  cause: 'La personne est le dernier super administrateur actif.',
                  solution: 'Attribuez d’abord le rôle à une autre personne active, puis révoquez.',
                },
                {
                  problem: 'La personne a bien le rôle mais ne voit pas l’entrée dans le back-office.',
                  cause: 'Sa page n’a pas été rechargée, le rôle est limité ou expiré, ou elle n’a pas activé la vérification en deux étapes alors que le déploiement l’exige.',
                  solution: 'Faites-lui recharger la page ; vérifiez la portée (« Globale ») et l’expiration ; faites-lui activer la vérification depuis **Sécurité**.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'securiser-un-compte',
      title: 'Comment sécuriser ou débloquer un compte',
      icon: 'lock',
      summary: 'Désactiver et réactiver un compte, réinitialiser la vérification en deux étapes, définir un mot de passe temporaire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Ces trois actions se trouvent dans la carte **Compte** de la fiche d’un utilisateur (colonne latérale sur ordinateur, sous les autres cartes sur mobile). Chacune demande une confirmation et est inscrite dans le journal d’audit. Aucune ne supprime de données.',
        },
      ],
      subsections: [
        {
          id: 'desactiver-et-reactiver-un-compte',
          title: 'Désactiver puis réactiver un compte',
          blocks: [
            {
              type: 'callout',
              tone: 'warning',
              title: 'Quand désactiver',
              text: 'Départ d’un membre de l’équipe, compte compromis, usage abusif. La désactivation est réversible : elle bloque la connexion et ferme toutes les sessions ouvertes, mais conserve inscriptions, certificats et commandes. Il n’existe aucune suppression de compte.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la fiche de la personne puis cliquez sur `Désactiver le compte`.',
                  where: 'carte **Compte**',
                  result: 'La confirmation « Désactiver le compte de <nom> ? » rappelle que les sessions seront fermées et les données conservées.',
                },
                {
                  text: 'Cliquez sur `Désactiver`.',
                  result: 'Le message « Compte <email> désactivé ; ses sessions ont été fermées. » s’affiche ; le badge d’en-tête devient **Compte désactivé**.',
                  note: 'La personne verra « Ce compte est désactivé. Contactez le support de la FETRAG pour le réactiver. » à sa prochaine tentative. Elle ne reçoit aucun email : prévenez-la si nécessaire.',
                },
                {
                  text: 'Pour rétablir l’accès, cliquez sur `Réactiver le compte` puis sur `Réactiver`.',
                  where: 'carte **Compte**',
                  result: 'Le message « Compte <email> réactivé. » s’affiche ; la personne peut se reconnecter avec ses identifiants.',
                },
              ],
            },
          ],
        },
        {
          id: 'reinitialiser-la-mfa',
          title: 'Réinitialiser la vérification en deux étapes d’une personne',
          blocks: [
            {
              type: 'paragraph',
              text: 'À utiliser quand une personne a perdu son téléphone et n’a plus de code de secours. Le secret et les codes sont effacés ; elle pourra se reconnecter avec son seul mot de passe puis devra réactiver la vérification depuis **Sécurité** (obligatoire pour un rôle privilégié).',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Vérifiez l’identité de la personne avant tout (appel sur un numéro connu, question dont seule elle a la réponse).',
                  note: 'Une demande de réinitialisation par simple email peut venir d’un attaquant.',
                },
                {
                  text: 'Ouvrez sa fiche puis cliquez sur `Réinitialiser la MFA`.',
                  where: 'carte **Compte** (le bouton est grisé si la vérification n’est pas active)',
                  result: 'La confirmation « Réinitialiser la vérification en deux étapes ? » s’affiche.',
                },
                {
                  text: 'Cliquez sur `Réinitialiser`.',
                  result: 'Le message « Vérification en deux étapes réinitialisée pour <email>. » s’affiche et le badge **MFA active** disparaît. La personne reçoit la notification « Vérification en deux étapes réinitialisée » (interne et par email).',
                },
              ],
            },
          ],
        },
        {
          id: 'definir-un-mot-de-passe-temporaire',
          title: 'Définir un mot de passe temporaire',
          blocks: [
            {
              type: 'callout',
              tone: 'danger',
              title: 'Action irréversible',
              text: 'L’ancien mot de passe est remplacé par un mot de passe aléatoire et toutes les sessions de la personne sont fermées. Elle est informée par email (sans le mot de passe) avec un lien pour en choisir un nouveau. Impossible sur votre propre fiche et sur un compte désactivé.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez la fiche d’un compte actif (autre que le vôtre) puis cliquez sur `Mot de passe temporaire`.',
                  where: 'carte **Compte**',
                  result: 'Le dialogue « Définir un mot de passe temporaire » rappelle que l’actuel sera remplacé et les sessions fermées.',
                },
                {
                  text: 'Cliquez sur `Générer et remplacer` (bouton rouge).',
                  result: 'L’alerte « Mot de passe temporaire défini » affiche le nouveau mot de passe (14 caractères) et le message « Copiez-le maintenant : il ne sera plus jamais affiché. »',
                  note: 'Le message de la page précise si l’invitation par email a été envoyée (lien valable 7 jours) ou non.',
                },
                {
                  text: 'Cliquez sur `Copier` puis transmettez le mot de passe par un canal sûr, seulement si la personne ne peut pas utiliser le lien de l’email.',
                  result: 'Le message « Mot de passe copié » apparaît.',
                },
                {
                  text: 'Cliquez sur `J’ai transmis le mot de passe`.',
                  result: 'Le dialogue se ferme ; le mot de passe disparaît définitivement.',
                },
                {
                  text: 'Demandez à la personne de changer ce mot de passe dès sa première connexion.',
                  where: 'page **Sécurité** › carte **Mot de passe**',
                  note: 'Règle des mots de passe : 8 caractères au moins, une majuscule et un chiffre.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              title: 'Si ça ne marche pas',
              items: [
                {
                  problem: 'Le bouton `Mot de passe temporaire` n’apparaît pas.',
                  cause: 'Le compte est désactivé, ou c’est votre propre fiche.',
                  solution: 'Réactivez d’abord le compte (« Réactivez le compte avant de définir un mot de passe »). Pour vous-même, utilisez la page **Sécurité**.',
                },
                {
                  problem: 'Le bouton `Réinitialiser la MFA` est grisé.',
                  cause: 'La vérification en deux étapes n’est pas active sur ce compte.',
                  solution: 'Rien à réinitialiser : la personne se connecte avec son mot de passe seul, puis active la vérification.',
                },
                {
                  problem: 'Message « Vous ne pouvez pas désactiver votre propre compte ».',
                  cause: 'Garde-fou.',
                  solution: 'Demandez à un autre super administrateur.',
                },
                {
                  problem: 'La personne a un « fournisseur externe » et pas de mot de passe local.',
                  cause: 'Son compte est géré par le fournisseur d’identité de la Fédération.',
                  solution: 'Le mot de passe se réinitialise chez ce fournisseur, pas dans le back-office.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'regler-les-parametres',
      title: 'Comment régler les paramètres de la Fédération',
      icon: 'settings',
      summary: 'Coordonnées, règles métier, bandeau de maintenance, correction des quiz, et ce qui reste en lecture seule.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page **Paramètres** est réservée au super administrateur. Chaque enregistrement est journalisé (« Paramètres modifiés ») avec les valeurs avant et après, et le site public est mis à jour aussitôt. La page est longue : sur mobile, faites-la défiler ; l’ancre « #jobs » ramène à la **File de traitements**.',
        },
        { type: 'path', label: 'Chemin', items: ['Barre latérale', 'Administration', 'Paramètres'], href: '/admin/parametres' },
        {
          type: 'steps',
          title: 'Modifier les coordonnées et les règles métier',
          items: [
            {
              text: 'Ouvrez **Paramètres**.',
              where: 'section **Administration** de la barre latérale',
              result: 'Le formulaire du haut affiche les sections **Coordonnées de la fédération**, **Règles métier** et **Maintenance**.',
            },
            {
              text: 'Dans **Coordonnées de la fédération**, corrigez **Adresse postale** (obligatoire, 5 à 200 caractères), **Email de contact** (obligatoire), **Email du support** (facultatif, utilisé pour l’assistance) et **Téléphones** (obligatoire : un numéro par ligne, quatre au plus, 6 à 20 caractères chacun).',
              note: 'Ces coordonnées apparaissent dans le pied de page, les emails et les documents générés (reçus, certificats).',
            },
            {
              text: 'Dans **Règles métier**, vérifiez **Devise des tarifs** (code à 3 lettres, « XAF »), **Participants par demande de formation** (entier de 1 à 500) et **Devise institutionnelle** (exactement trois mots séparés par des virgules).',
              note: '« Participants par demande de formation » limite le nombre de personnes qu’un responsable d’organisation peut désigner dans une demande. Ne modifiez la devise des tarifs qu’après accord de la finance.',
            },
            {
              text: 'Cliquez sur `Enregistrer les paramètres`.',
              where: 'en bas du formulaire (pendant l’envoi : « Enregistrement »)',
              result: 'L’alerte et le message « Paramètres enregistrés. » s’affichent.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si l’enregistrement ne marche pas',
          items: [
            {
              problem: 'Message « Certains paramètres sont invalides. »',
              cause: 'Un champ ne respecte pas sa règle : « Au moins un numéro », « Code devise ISO à 3 lettres », « La devise comporte trois mots ».',
              solution: 'Lisez le texte rouge sous le champ, corrigez, puis enregistrez de nouveau.',
            },
            {
              problem: 'Le compteur **Dernier numéro séquentiel attribué** ou un drapeau fonctionnel ne peut pas être modifié.',
              cause: 'Ces éléments sont en lecture seule dans l’interface (voir ci-dessous).',
              solution: 'Le compteur des certificats avance seul ; les drapeaux se règlent dans l’environnement d’hébergement par l’exploitant.',
            },
          ],
        },
      ],
      subsections: [
        {
          id: 'bandeau-de-maintenance',
          title: 'Afficher un bandeau de maintenance',
          blocks: [
            {
              type: 'paragraph',
              text: 'Avant une intervention planifiée, prévenez les utilisateurs par un bandeau affiché sur le site et sur la plateforme de formation. L’accès reste ouvert : le bandeau informe, il ne bloque rien.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans la section **Maintenance**, cochez **Afficher le bandeau de maintenance**.',
                  where: 'formulaire du haut de **Paramètres**',
                },
                {
                  text: 'Rédigez le **Message** (facultatif, 300 caractères au plus), par exemple la date, l’heure et les services concernés.',
                  note: 'Sans message, un texte par défaut annonce qu’une maintenance est affichée.',
                },
                {
                  text: 'Cliquez sur `Enregistrer les paramètres`.',
                  result: 'L’alerte « Bandeau de maintenance actif » apparaît en haut de la page **Paramètres** et le bandeau s’affiche sur les deux plateformes.',
                },
                {
                  text: 'Après l’intervention, décochez la case et cliquez de nouveau sur `Enregistrer les paramètres`.',
                  result: 'L’alerte et le bandeau disparaissent.',
                },
              ],
            },
          ],
        },
        {
          id: 'correction-des-quiz',
          title: 'Régler la correction des quiz',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Descendez jusqu’à la carte **Évaluations**.',
                  where: 'page **Paramètres**',
                  result: 'La case **Crédit partiel aux questions à choix multiples** indique la règle en vigueur.',
                },
                {
                  text: 'Cochez la case pour qu’une bonne réponse cochée rapporte une fraction des points (les mauvaises en retirent), ou décochez-la pour que la question vaille tout ou rien.',
                  note: 'Décidez avec la coordination formation : la règle s’applique à toutes les corrections automatiques futures sur la plateforme de formation.',
                },
                {
                  text: 'Cliquez sur `Enregistrer` dans la carte.',
                  result: '« Crédit partiel activé pour les quiz. » ou « Crédit partiel désactivé : une question à choix multiples n’est comptée que si toutes les bonnes réponses sont cochées. »',
                },
              ],
            },
          ],
        },
        {
          id: 'parametres-en-lecture-seule',
          title: 'Ce qui est affiché mais non modifiable',
          blocks: [
            {
              type: 'table',
              caption: 'Cartes en lecture seule de la page Paramètres',
              columns: ['Carte', 'Ce qu’elle montre', 'Qui peut agir'],
              rows: [
                ['Certificats', '**Dernier numéro séquentiel attribué** : le compteur de numérotation des certificats, incrémenté à chaque émission.', 'Personne : il avance automatiquement.'],
                ['Drapeaux fonctionnels', '**Authentification locale**, **Fournisseur d’identité externe (OIDC)**, **Paiements en ligne**, **Forums de formation**, **Lettre d’information**, avec le badge « Activé » / « Désactivé ».', 'L’exploitant, dans les variables d’environnement du déploiement.'],
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Demander une bascule',
              text: 'Pour activer ou désactiver une fonctionnalité optionnelle (paiement en ligne, forums, lettre d’information), adressez une demande écrite à l’exploitant en indiquant le drapeau concerné et la date souhaitée. La modification apparaîtra dans cette carte après redéploiement.',
            },
          ],
        },
      ],
    },
    {
      id: 'gerer-les-cles-api',
      title: 'Comment gérer les clés API',
      icon: 'link',
      summary: 'Donner à une intégration externe un accès à l’API, puis le retirer.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Une **clé API** est un long code secret qu’un logiciel partenaire présente à chaque appel de l’**API** (l’interface technique qui permet à un autre système de lire ou d’écrire des données de la plateforme). Le back-office ne conserve qu’une empreinte de la clé : elle n’est lisible qu’au moment de sa création. Au plus 20 clés actives peuvent exister.',
        },
        { type: 'path', label: 'Chemin', items: ['Barre latérale', 'Administration', 'Paramètres', 'Carte « Clés API »'], href: '/admin/parametres' },
        {
          type: 'steps',
          title: 'Générer une clé',
          items: [
            {
              text: 'Dans la carte **Clés API**, cliquez sur `Générer une clé`.',
              where: 'page **Paramètres**, en haut à droite de la carte',
              result: 'Le dialogue « Nouvelle clé API » s’ouvre.',
            },
            {
              text: 'Saisissez un **Libellé** (obligatoire, 3 à 80 caractères) qui décrit l’usage et le partenaire, par exemple « Tableau de bord externe ».',
            },
            {
              text: 'Choisissez la **Portée** : **Lecture seule** (par défaut) ou **Lecture et écriture**.',
              note: 'Donnez le minimum nécessaire : la lecture seule suffit à la plupart des tableaux de bord externes.',
            },
            {
              text: 'Cliquez sur `Générer`.',
              result: 'L’alerte « Clé générée » affiche la clé une seule fois avec le message « Copiez-la maintenant : elle ne sera plus jamais affichée. »',
            },
            {
              text: 'Cliquez sur `Copier` puis transmettez la clé au partenaire par un canal sûr (jamais dans un email en clair, un ticket ou un groupe de discussion).',
              result: 'Le message « Clé copiée » apparaît.',
            },
            {
              text: 'Cliquez sur `J’ai copié la clé`.',
              result: 'La clé apparaît dans le tableau avec son **Libellé**, son **Préfixe**, sa **Portée** et l’état « Active ».',
              note: 'Le partenaire envoie la clé dans l’en-tête « X-API-Key » de ses appels. Les détails techniques sont dans la documentation de l’API, pas dans ce guide.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Révocation irréversible',
          text: 'Révoquer une clé la refuse immédiatement et pour toujours ; elle reste listée avec « Révoquée le <date> ». Prévenez le partenaire et donnez-lui la nouvelle clé avant de révoquer l’ancienne.',
        },
        {
          type: 'steps',
          title: 'Révoquer ou renouveler une clé',
          items: [
            {
              text: 'Pour renouveler, générez d’abord la nouvelle clé (étapes ci-dessus) et transmettez-la au partenaire.',
              note: 'Les clés n’ont pas de date d’expiration : renouvelez-les à intervalle régulier (au moins une fois par an) et dès qu’une personne ayant eu accès à la clé quitte le partenaire.',
            },
            {
              text: 'Sur la ligne de l’ancienne clé, cliquez sur `Révoquer`.',
              where: 'colonne **Action** du tableau',
              result: 'La confirmation « Révoquer « <libellé> » ? » prévient que les intégrations utilisant cette clé seront immédiatement refusées.',
            },
            {
              text: 'Cliquez sur `Révoquer` pour confirmer.',
              result: 'Le message « Clé « X » révoquée. » s’affiche ; l’état passe à « Révoquée le <date> » et le compteur « N clé(s) active(s) · N révoquée(s) » se met à jour.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'États et portées des clés',
          items: [
            { label: 'Active', tone: 'success', meaning: 'La clé est acceptée par l’API.', next: 'Vérifiez régulièrement que son usage est toujours justifié.' },
            { label: 'Révoquée le <date>', tone: 'danger', meaning: 'La clé est définitivement refusée ; la ligne reste pour l’historique.', next: 'Aucune action possible.' },
            { label: 'Lecture', tone: 'neutral', meaning: 'La clé ne peut que consulter des données.', next: 'Portée à privilégier.' },
            { label: 'Lecture / écriture', tone: 'warning', meaning: 'La clé peut aussi créer ou modifier des données.', next: 'À réserver aux intégrations qui en ont vraiment besoin.' },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si ça ne marche pas',
          items: [
            {
              problem: 'Message « Limite de 20 clés actives atteinte : révoquez une clé avant d’en créer une nouvelle. »',
              cause: 'Trop de clés en circulation.',
              solution: 'Révoquez les clés dont le libellé ne correspond plus à une intégration en service.',
            },
            {
              problem: 'Le partenaire dit que ses appels sont refusés.',
              cause: 'Clé révoquée, mal copiée (espace en trop) ou portée insuffisante (écriture demandée avec une clé en lecture).',
              solution: 'Vérifiez l’état et la portée dans le tableau ; si besoin, générez une nouvelle clé avec la bonne portée.',
            },
            {
              problem: 'Vous avez fermé le dialogue sans copier la clé.',
              cause: 'La clé n’est affichée qu’une fois.',
              solution: 'Révoquez cette clé et générez-en une nouvelle.',
            },
          ],
        },
      ],
    },
    {
      id: 'superviser-les-traitements',
      title: 'Comment superviser les traitements et les emails',
      icon: 'refresh',
      summary: 'Lire la file de traitements, relancer ou annuler une tâche, diagnostiquer les emails non délivrés, consulter l’état de santé.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Les envois d’emails, les rendus de certificats et de reçus (fichiers PDF), les webhooks de paiement (messages envoyés par le service de paiement), les publications planifiées et les rappels de session ne sont pas exécutés pendant que vous cliquez : ils sont placés dans une **file de traitements** (aussi appelée file de jobs, un « job » étant une tâche de fond) et exécutés en arrière-plan toutes les cinq minutes par un déclencheur automatique (le **cron**). Une tâche qui échoue est réessayée automatiquement avec un délai croissant (2, 4, 8, 16, 32 minutes, jusqu’à 24 h), cinq fois au plus ; ensuite elle est « abandonnée ».',
        },
        { type: 'path', label: 'Chemin', items: ['Barre latérale', 'Administration', 'Paramètres', 'Section « File de traitements »'], href: '/admin/parametres#jobs' },
      ],
      subsections: [
        {
          id: 'lire-la-file-de-traitements',
          title: 'Lire la file de traitements',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Paramètres** et descendez jusqu’à la section **File de traitements**.',
                  where: 'ancre « #jobs » en bas de la page',
                  result: 'Quatre tuiles : **En file d’attente** (avec « N à exécuter maintenant · N en cours »), **Réussies**, **En échec (réessai planifié)** (avec « N abandonnée(s) »), **Emails non délivrés sur 24 h**.',
                },
                {
                  text: 'Si une alerte « N tâche(s) en échec ou abandonnée(s) · N email(s) non délivré(s) sur 24 h » est affichée, filtrez la liste : **Statut** = « En échec » ou « Abandonnées », **Type** au choix, puis `Filtrer`.',
                  result: 'Le tableau « Tâches de fond » (10 par page) ne montre plus que ces tâches ; les lignes en échec ou abandonnées sont surlignées en or.',
                },
                {
                  text: 'Lisez la colonne **Dernière erreur** (ordinateur) pour comprendre la cause.',
                  note: 'Sur mobile, seules les colonnes **Tâche**, **Statut** et les actions sont visibles ; passez sur un ordinateur pour lire l’erreur complète.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts des tâches de fond',
              items: [
                { label: 'En file d’attente', tone: 'info', meaning: 'La tâche sera exécutée dès sa date prévue, au prochain passage du cron.', next: 'Annulable avec `Annuler`.' },
                { label: 'En cours', tone: 'warning', meaning: 'Un exécutant a verrouillé la tâche.', next: 'Si elle reste « En cours » plus de 10 minutes, elle est reprise automatiquement.' },
                { label: 'Réussi', tone: 'success', meaning: 'Terminée sans erreur.', next: 'Aucune action.' },
                { label: 'En échec', tone: 'danger', meaning: 'La tâche a échoué et sera réessayée avec un délai croissant.', next: '`Relancer` pour ne pas attendre, `Annuler` si elle n’a plus de sens.' },
                { label: 'Abandonné', tone: 'danger', meaning: 'Tentatives épuisées ou annulation manuelle (motif dans **Dernière erreur**).', next: '`Relancer` après avoir corrigé la cause.' },
              ],
            },
            {
              type: 'table',
              caption: 'Types de tâches et ce qu’un échec signifie',
              columns: ['Type', 'Ce que fait la tâche', 'Si elle échoue'],
              rows: [
                ['Envoi d’email', 'Envoie un email (invitation, confirmation, notification).', 'Le destinataire ne reçoit rien ; vérifiez le service d’email (état de santé).'],
                ['Rendu de certificat', 'Produit le PDF d’un certificat.', 'L’apprenant ne peut pas télécharger son certificat ; relancez.'],
                ['Rendu de reçu', 'Produit le PDF d’un reçu de paiement.', 'Le reçu manque dans l’espace de l’acheteur ; relancez.'],
                ['Notification', 'Crée une notification interne et son email éventuel.', 'La personne n’est pas prévenue ; relancez.'],
                ['Webhook de paiement', 'Traite un message du service de paiement.', 'Une commande peut rester « en attente » ; prévenez la finance.'],
                ['Publication planifiée', 'Publie un contenu à la date prévue.', 'Le contenu reste en attente ; prévenez l’éditeur.'],
                ['Rappel de session', 'Envoie les rappels avant une session de formation.', 'Les apprenants ne sont pas rappelés ; prévenez la coordination.'],
                ['Export', 'Produit un fichier d’export.', 'Relancez ou refaites l’export.'],
                ['Expiration d’inscription', 'Clôture les inscriptions arrivées à échéance.', 'Relancez ; sans conséquence immédiate pour les apprenants.'],
              ],
            },
          ],
        },
        {
          id: 'relancer-ou-annuler-une-tache',
          title: 'Relancer ou annuler une tâche',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Pour relancer une tâche « En échec » ou « Abandonnée », cliquez sur `Relancer` sur sa ligne.',
                  where: 'colonne des actions (à droite sur ordinateur, empilée sous la tâche sur mobile)',
                  result: 'La confirmation « Relancer « <type> » ? » rappelle que le compteur de tentatives repart de zéro.',
                },
                {
                  text: 'Cliquez sur `Relancer` pour confirmer.',
                  result: 'Le message « Tâche « <type> » remise en file. » s’affiche ; la tâche passe « En file d’attente » et sera exécutée au prochain passage (cinq minutes au plus).',
                  note: 'Relancer sans avoir corrigé la cause (service d’email en panne, par exemple) produira un nouvel échec.',
                },
                {
                  text: 'Pour annuler une tâche « En file d’attente » ou « En échec » devenue inutile, cliquez sur `Annuler` puis sur `Annuler la tâche`.',
                  result: 'Le message « Tâche « <type> » annulée. » s’affiche ; la tâche passe « Abandonnée » avec le motif « Annulée par <votre email> ».',
                },
                {
                  text: 'Pour revenir à la liste après un filtrage ou un changement de page, utilisez l’ancre « #jobs » de l’adresse ou faites défiler jusqu’à la section.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Avant d’annuler',
              text: 'L’annulation empêche définitivement l’exécution (une tâche annulée peut toutefois être relancée). N’annulez jamais un « Webhook de paiement » sans l’accord de Finance / contrôle : il peut confirmer un paiement réel.',
            },
          ],
        },
        {
          id: 'diagnostiquer-les-emails',
          title: 'Diagnostiquer les emails non délivrés',
          blocks: [
            {
              type: 'paragraph',
              text: 'Il n’existe pas d’écran listant chaque email envoyé. Vous disposez du compteur **Emails non délivrés sur 24 h** (emails en échec ou rejetés par le destinataire), des tâches « Envoi d’email » en échec, et de l’**État de santé** qui indique quel service d’email est effectivement utilisé.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Lisez la tuile **Emails non délivrés sur 24 h** dans la section **File de traitements**.',
                  note: 'Quelques échecs isolés sont normaux (adresse erronée, boîte pleine). Une hausse brutale signale une panne du service d’email.',
                },
                {
                  text: 'Filtrez les tâches par **Type** = « Envoi d’email » et **Statut** = « En échec », puis lisez **Dernière erreur**.',
                  result: 'Une même erreur répétée (clé refusée, service injoignable) confirme un problème de fournisseur.',
                },
                {
                  text: 'Cliquez sur `État de santé`.',
                  where: 'en haut à droite de la page **Paramètres**',
                  result: 'Un nouvel onglet affiche un texte technique (JSON) : « ok », le fournisseur d’email effectif (« console », « resend » ou « smtp »), si un expéditeur est configuré et les contrôles « database » et « config ».',
                  note: '« console » signifie qu’aucun email n’est réellement envoyé : c’est un réglage de test à corriger par l’exploitant. Le rapport ne montre jamais de valeur secrète, seulement des noms de variables.',
                },
                {
                  text: 'Transmettez le constat à l’exploitant avec le runbook « panne-email » du dépôt (dossier docs/runbooks) ; une fois le service rétabli, les emails en échec sont remis en file automatiquement (pendant 7 jours, cinq tentatives), ou relancez-les vous-même.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              title: 'Si la file n’avance pas',
              items: [
                {
                  problem: 'Le compteur « N à exécuter maintenant » grossit sans que rien ne passe en « Réussies ».',
                  cause: 'Le déclencheur automatique (cron) ne s’exécute plus, ou son secret a changé.',
                  solution: 'Prévenez l’exploitant avec le runbook « jobs-bloques » : le cron doit être actif chez l’hébergeur et la variable de son secret valide.',
                },
                {
                  problem: 'Une tâche reste « En cours » depuis longtemps.',
                  cause: 'Un exécutant s’est arrêté en cours de route.',
                  solution: 'Attendez 10 minutes : la tâche est reprise automatiquement. Si cela se répète, signalez-le.',
                },
                {
                  problem: 'L’**État de santé** affiche « ok : false » ou une page d’erreur.',
                  cause: 'Base de données injoignable ou variable de configuration manquante (« Variables manquantes : … »).',
                  solution: 'Incident prioritaire : prévenez immédiatement l’exploitant (runbook « supervision »).',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'modifier-les-menus',
      title: 'Comment modifier les menus de navigation',
      icon: 'list-tree',
      summary: 'Ajouter, réordonner et supprimer les liens des menus du site et de la plateforme de formation.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Quatre emplacements sont modifiables : **Navigation principale** (barre du site), **Pied de page**, **Pied de page secondaire** (liens légaux) et **Navigation de la plateforme de formation**. L’Éditeur communication dispose du même écran. Un menu vide laisse la navigation par défaut. Rien n’est enregistré avant `Enregistrer le menu` : recharger la page annule vos modifications.',
        },
        { type: 'path', label: 'Chemin', items: ['Barre latérale', 'Contenus', 'Menus', 'Modifier l’arborescence'], href: '/admin/menus' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Menus** puis cliquez sur `Modifier l’arborescence` sur la carte de l’emplacement voulu.',
              where: 'section **Contenus** de la barre latérale',
              result: 'L’éditeur s’ouvre avec le champ **Nom du menu**, le badge « N entrée(s) » et la liste des entrées.',
            },
            {
              text: 'Pour chaque entrée, renseignez **Libellé** (obligatoire, 1 à 80 caractères) et **Adresse** (obligatoire : un chemin commençant par « / » ou une adresse complète en https).',
              note: '**Icône** (facultatif) attend un nom d’icône du jeu « lucide » ; laissez vide en cas de doute. Cochez **Lien externe** pour un site tiers (c’est automatique pour une adresse en https).',
            },
            {
              text: 'Réordonnez avec les boutons **Monter** et **Descendre**.',
              note: 'Sur ordinateur, vous pouvez aussi glisser-déposer une entrée avec sa poignée « Glisser pour réordonner » (entre entrées de même niveau). Sur mobile, la poignée est masquée : utilisez les boutons.',
            },
            {
              text: 'Pour créer un sous-menu, cliquez sur **Transformer en sous-menu** : l’entrée se rattache à celle du dessus. **Remonter d’un niveau** fait l’inverse ; **Ajouter une sous-entrée** crée un enfant.',
              note: 'Deux niveaux au plus dans l’éditeur ; les sous-entrées sont indentées avec un filet vert.',
            },
            {
              text: 'Cliquez sur `Ajouter une entrée` pour un nouvel élément de premier niveau.',
              where: 'en bas à gauche',
              result: 'Une entrée vide apparaît avec l’adresse « / ».',
            },
            {
              text: 'Pour retirer un lien, cliquez sur **Supprimer <libellé>** (bouton rouge) sur son entrée.',
              note: 'Supprimer une entrée de premier niveau supprime aussi ses sous-entrées.',
            },
            {
              text: 'Cliquez sur `Enregistrer le menu`.',
              where: 'en bas à droite (pendant l’envoi : « Enregistrement »)',
              result: 'Le message « Menu « <nom> » enregistré (N entrée(s) de premier niveau). » s’affiche et le site public est mis à jour.',
            },
            {
              text: 'Vérifiez le résultat avec **Voir le site** (nouvel onglet).',
              where: 'barre supérieure (sur mobile, depuis le tableau de bord)',
            },
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si l’enregistrement ne marche pas',
          items: [
            {
              problem: 'Message « URL invalide (http(s) ou chemin relatif) » sous une adresse.',
              cause: 'L’adresse ne commence ni par « / » ni par « http ».',
              solution: 'Saisissez par exemple « /formations » pour une page du site, ou l’adresse complète « https://… » pour un site externe.',
            },
            {
              problem: 'Message « Un menu ne peut pas contenir plus de 120 entrées » ou « Un menu ne peut pas dépasser 3 niveaux ».',
              cause: 'Limites du menu (40 entrées de premier niveau, 30 sous-entrées par entrée).',
              solution: 'Regroupez ou supprimez des entrées.',
            },
            {
              problem: 'Le menu du site ne change pas après enregistrement.',
              cause: 'Page du site encore en cache dans votre navigateur.',
              solution: 'Rechargez la page du site ; si le menu est vide, la navigation par défaut est affichée.',
            },
          ],
        },
      ],
    },
    {
      id: 'consulter-le-journal-d-audit',
      title: 'Comment consulter le journal d’audit',
      icon: 'scroll-text',
      summary: 'Retrouver qui a fait quoi et quand, lire le détail avant / après, exporter en CSV.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le **Journal d’audit** est la trace immuable des actions sensibles : connexions, rôles, paiements, certificats, publications, exports et paramètres. Il ne peut être ni modifié ni effacé depuis l’interface. Les adresses IP y sont conservées sous forme d’empreinte (un code qui ne permet pas de retrouver l’adresse). Finance / contrôle y a aussi accès.',
        },
        { type: 'path', label: 'Chemin', items: ['Barre latérale', 'Administration', 'Journal d’audit'], href: '/admin/audit' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Journal d’audit**.',
              where: 'section **Administration** de la barre latérale',
              result: 'Trois tuiles (**Entrées journalisées**, **Types d’action distincts**, **Types d’entité concernés**) puis le tableau, 20 entrées par page, les plus récentes en premier.',
            },
            {
              text: 'Filtrez : champ de recherche (identifiant d’entité, email de l’acteur ou corrélation), liste **Action**, liste **Entité**, **Période** (**Du** / **Au**), champ **Acteur (email)** ; puis cliquez sur `Filtrer`.',
              note: 'Le filtre **Action** fonctionne par famille : « Connexion » couvre aussi les déconnexions et échecs de connexion. La date **Au** est incluse jusqu’à la fin de la journée. Sur mobile, les deux dates sont côte à côte.',
            },
            {
              text: 'Sur une ligne, cliquez sur `Détail` pour ouvrir les colonnes **Avant** et **Après**.',
              result: 'Le contenu technique (JSON) montre les valeurs modifiées ; sur mobile, il défile dans un cadre.',
              note: 'Sur mobile, seules les colonnes **Horodatage**, **Action** (avec le badge d’entité) et **Détail** sont visibles ; **Acteur** et **Entité** apparaissent sur ordinateur. L’acteur « Système » désigne une tâche automatique.',
            },
            {
              text: 'Depuis la fiche d’un utilisateur, cliquez sur **Tout le journal** dans la carte **Journal d’audit**.',
              result: 'Le journal s’ouvre déjà filtré sur l’email de cette personne.',
            },
            {
              text: 'Pour conserver ou analyser les entrées, cliquez sur `Exporter (CSV)`.',
              where: 'en haut à droite (sous le titre sur mobile)',
              result: 'Un fichier « fetrag-journal-audit-<horodatage>.csv » est téléchargé avec les filtres courants (5 000 lignes au plus, séparateur point-virgule, dates en UTC). L’export est lui-même journalisé (« Export généré »).',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Actions à surveiller et ce qu’elles signifient',
          columns: ['Action affichée', 'Ce qui s’est passé', 'Quand s’inquiéter'],
          rows: [
            ['Échec de connexion', 'Mot de passe ou code refusé.', 'Rafale sur un même compte ou depuis une même empreinte IP : tentative d’intrusion.'],
            ['Rôle attribué / Rôle révoqué', 'Un droit a été donné ou retiré.', 'Action que vous n’avez pas faite : compte de super administrateur compromis.'],
            ['Compte créé / Compte modifié', 'Création, désactivation, réinitialisation MFA, mot de passe temporaire.', 'Création inattendue d’un compte privilégié.'],
            ['Paramètres modifiés', 'Paramètres, clé API, relance ou annulation de tâche.', 'Modification hors d’une intervention connue.'],
            ['Export généré', 'Un fichier CSV a été téléchargé (audit, rapports, finance).', 'Exports répétés de données personnelles.'],
            ['Paiement réussi / Remboursement', 'Mouvement financier.', 'À rapprocher avec Finance / contrôle.'],
            ['Certificat émis / Certificat révoqué', 'Cycle de vie d’un certificat.', 'Révocation non justifiée par la coordination.'],
            ['Contenu publié', 'Une page, actualité ou ressource est en ligne.', 'Publication hors du circuit de relecture.'],
          ],
        },
        {
          type: 'troubleshooting',
          title: 'Si vous ne trouvez pas une entrée',
          items: [
            {
              problem: 'Aucune entrée pour une action que vous savez récente.',
              cause: 'Filtre trop restrictif (période, acteur) ou action portée par « Système ».',
              solution: 'Cliquez sur `Réinitialiser` puis filtrez seulement par **Action** ; laissez **Acteur (email)** vide pour inclure les tâches automatiques.',
            },
            {
              problem: 'L’action apparaît sous un code technique (par exemple « auth.login ») sans libellé.',
              cause: 'Action non traduite dans la liste des libellés.',
              solution: 'Le code reste lisible : la première partie indique la famille (auth, role, payment, content…).',
            },
            {
              problem: 'L’export s’arrête à 5 000 lignes.',
              cause: 'Limite volontaire de l’export.',
              solution: 'Réduisez la **Période** et exportez en plusieurs fois.',
            },
          ],
        },
      ],
    },
    {
      id: 'consulter-les-rapports',
      title: 'Comment consulter et exporter les rapports',
      icon: 'bar-chart',
      summary: 'Indicateurs du site et de la plateforme de formation, contenus populaires, exports CSV.',
      blocks: [
        { type: 'path', label: 'Chemin', items: ['Barre latérale', 'Administration', 'Rapports'], href: '/admin/rapports' },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Rapports**.',
              where: 'section **Administration** de la barre latérale, ou bouton `Rapports détaillés` du tableau de bord',
              result: 'La section **Site institutionnel · 30 derniers jours** (pages vues, formulaires, inscriptions aux événements, conversion des commandes) puis la section **Plateforme de formation** (apprenants actifs, inscriptions, complétion, certificats, qualité) et la carte **Contenus populaires**.',
              note: 'Les statistiques sont calculées sans cookie de suivi. Si un calcul échoue, une alerte « Indicateurs indisponibles » invite à réessayer plus tard.',
            },
            {
              text: 'Pour exporter, cliquez sur `Indicateurs du site`, `Indicateurs de formation` ou `Contenus populaires` dans la carte **Exports CSV**.',
              result: 'Un fichier « fetrag-rapport-<type>-<horodatage>.csv » est téléchargé (UTF-8, séparateur point-virgule) ; l’export est journalisé.',
            },
            {
              text: 'Pour les rapports détaillés de la formation, cliquez sur `Rapports détaillés du LMS`.',
              where: 'en haut à droite',
              result: 'L’espace de coordination de la plateforme de formation s’ouvre sur ses rapports.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Qui utilise ces rapports',
          text: 'La coordination, l’édition et la finance ont le même accès. Votre rôle est surtout de vérifier que les chiffres sont cohérents avec l’activité (par exemple, aucune inscription pendant une semaine peut signaler un problème technique) et de transmettre les exports demandés par le secrétariat général.',
        },
      ],
    },
    {
      id: 'securite-de-la-plateforme',
      title: 'Comment veiller à la sécurité de la plateforme',
      icon: 'shield-check',
      summary: 'Revue mensuelle des comptes privilégiés, rotation des secrets, réaction à un incident, sessions.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La sécurité repose sur trois habitudes : des comptes privilégiés nominatifs et protégés, des secrets techniques renouvelés hors du back-office, et une lecture régulière du journal d’audit. Les procédures détaillées sont dans les **runbooks** (fiches d’exploitation pas à pas) du dossier « docs/runbooks » du dépôt : « rotation-secrets », « incident-securite », « supervision », « jobs-bloques », « panne-email », « restauration-base », « deploiement ».',
        },
      ],
      subsections: [
        {
          id: 'revue-mensuelle-des-comptes',
          title: 'Faire la revue mensuelle des comptes privilégiés',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Utilisateurs et rôles** et filtrez par **Rôle** = « Super administrateur ».',
                  result: 'Vérifiez que chaque compte correspond à une personne en fonction, que le badge « MFA » est présent et que la **Dernière connexion** est récente.',
                },
                {
                  text: 'Répétez avec « Coordinateur formation », « Finance / contrôle » et « Éditeur communication ».',
                  note: 'Ces trois rôles doivent aussi avoir la vérification en deux étapes ; rappelez-la aux personnes sans badge.',
                },
                {
                  text: 'Filtrez par **Statut** = « Actifs » et repérez les comptes de l’équipe jamais connectés ou inactifs depuis des mois.',
                  result: 'Révoquez les rôles inutiles et désactivez les comptes des personnes parties.',
                },
                {
                  text: 'Ouvrez **Journal d’audit**, filtrez **Action** = « Échec de connexion » sur le mois écoulé.',
                  result: 'Une rafale d’échecs sur un compte privilégié doit être signalée à la personne et traitée comme un incident potentiel.',
                },
                {
                  text: 'Ouvrez **Paramètres** › **Clés API** et confirmez que chaque clé active correspond à une intégration toujours en service.',
                },
              ],
            },
          ],
        },
        {
          id: 'rotation-des-secrets',
          title: 'Renouveler les secrets techniques (hors interface)',
          blocks: [
            {
              type: 'paragraph',
              text: 'Les secrets techniques (clé de session, accès à la base de données, secret du cron, secret des webhooks de paiement, clé du service d’email, stockage, fournisseur d’identité) ne sont pas visibles ni modifiables dans le back-office : ils vivent dans les variables d’environnement de l’hébergeur. Seules les clés API des partenaires se gèrent dans l’interface.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Planifiez la rotation avec l’exploitant en suivant le runbook « rotation-secrets » : générer la nouvelle valeur, la déployer sur les deux applications, redéployer, vérifier, révoquer l’ancienne.',
                  note: 'Périodicité indicative : au moins une fois par an, et immédiatement après le départ d’une personne ayant eu accès ou en cas de fuite soupçonnée.',
                },
                {
                  text: 'Prévenez les utilisateurs si la clé de session est renouvelée : tout le monde est déconnecté des deux plateformes.',
                  note: 'Planifiez-la en heure creuse et affichez le bandeau de maintenance avant.',
                },
                {
                  text: 'Après la rotation, cliquez sur `État de santé` dans **Paramètres** et vérifiez « ok : true ».',
                  result: 'Les contrôles « database » et « config » sont au vert.',
                },
                {
                  text: 'Notez la rotation (date, secret concerné, personne) dans le journal d’exploitation, sans jamais écrire la valeur.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'danger',
              title: 'Jamais de secret en clair',
              text: 'Ne collez jamais un secret, une clé API ou un mot de passe dans un email, un ticket, un groupe de discussion ou ce guide. Si une valeur a circulé, considérez-la comme compromise et renouvelez-la.',
            },
          ],
        },
        {
          id: 'reagir-a-un-incident',
          title: 'Réagir à un incident de sécurité',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Qualifiez l’incident avec le runbook « incident-securite » (gravité P1 à P3) : compte compromis, fuite de données, intrusion, indisponibilité.',
                },
                {
                  text: 'Contenez : désactivez le compte suspect (`Désactiver le compte`) ou définissez-lui un mot de passe temporaire (`Mot de passe temporaire`) pour fermer ses sessions ; révoquez les rôles ou clés API concernés.',
                  result: 'Chaque action est journalisée et servira au rapport d’incident.',
                },
                {
                  text: 'Collectez les preuves : exportez le **Journal d’audit** sur la période concernée (`Exporter (CSV)`).',
                },
                {
                  text: 'Informez le secrétariat général et l’exploitant ; ne communiquez pas les détails techniques en dehors de ce cercle avant la fin de l’analyse.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Sessions ouvertes',
              text: 'La fiche d’un utilisateur affiche « N session(s) ouverte(s) » mais ne permet pas de fermer une session précise. Pour déconnecter quelqu’un de partout : désactivez le compte (puis réactivez-le) ou définissez un mot de passe temporaire.',
            },
          ],
        },
      ],
    },
    {
      id: 'deleguer-et-gouverner',
      title: 'Comment déléguer : quel rôle pour quelle tâche',
      icon: 'handshake',
      summary: 'Confier chaque activité au bon rôle, garder pour vous les opérations sensibles, retrouver les guides des autres rôles.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Vous pouvez tout faire, mais vous ne devez pas tout faire : un super administrateur qui rédige des actualités ou traite des remboursements avec son compte rend le journal d’audit illisible et concentre les risques. Attribuez le rôle adapté et renvoyez chaque personne vers son guide.',
        },
        {
          type: 'table',
          caption: 'Qui fait quoi',
          columns: ['Activité', 'Rôle à attribuer', 'Guide à transmettre'],
          rows: [
            ['Pages, actualités, catégories, ressources, médias, menus, FAQ, événements, partenaires, messages de contact, d’adhésion et de partenariat, newsletter', 'Éditeur communication', '[Guide de l’éditeur](/admin/guide/web-editeur)'],
            ['Catalogue des services, demandes de service, messages de type service', 'Responsable services', '[Guide du responsable services](/admin/guide/web-services)'],
            ['Commandes, paiements, remboursements, prises en charge, exports financiers, journal d’audit', 'Finance / contrôle', '[Guide de la finance](/admin/guide/web-finance)'],
            ['Assistance aux utilisateurs, lecture des demandes et des messages d’assistance, consultation des comptes', 'Support', '[Guide du support](/admin/guide/web-support)'],
            ['Formations, cohortes, certificats, demandes de formation, organisations, rapports', 'Coordinateur formation', '[Guide de la coordination](/admin/guide/web-coordination) et espace de coordination de la plateforme de formation'],
            ['Animation d’un cours, correction, présence', 'Formateur (portée cours ou cohorte)', 'Guide du formateur, sur la plateforme de formation'],
            ['Dépôt des demandes de formation d’une organisation', 'Responsable d’organisation (portée organisation)', 'Guide du responsable d’organisation, dans l’espace personnel'],
          ],
        },
        {
          type: 'list',
          title: 'À garder pour le super administrateur',
          style: 'check',
          items: [
            'Création de comptes, attribution et révocation de rôles.',
            'Désactivation et réactivation de comptes, réinitialisation de la vérification en deux étapes, mots de passe temporaires.',
            'Paramètres de la Fédération, bandeau de maintenance, règle de correction des quiz.',
            'Clés API et file de traitements.',
            'Relation avec l’exploitant : état de santé, secrets, incidents.',
          ],
        },
        {
          type: 'links',
          title: 'Tous les guides',
          items: [
            { label: 'Guides du site institutionnel', href: '/admin/guide', description: 'Liste de tous les guides du back-office ; vous seul les voyez tous.', icon: 'book-open' },
            { label: 'Guide du membre', href: '/espace/guide', description: 'Compte, espace personnel, sécurité : le guide commun à tous les comptes.', icon: 'user' },
            { label: 'Guide du super administrateur de la plateforme de formation', href: '{{lms}}/admin/guide', description: 'Cours, banque de questions, modèles de certificats, réglages de la plateforme de formation.', external: true, icon: 'graduation-cap' },
            { label: 'Espace de coordination de la plateforme de formation', href: '{{lms}}/coordination', description: 'Cohortes, demandes de formation, certificats, rapports détaillés.', external: true, icon: 'external-link' },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Guides et accès',
          text: 'Chaque rôle ne voit que son guide et le guide commun. Quand vous attribuez un rôle, indiquez à la personne où trouver son guide : dans le back-office pour les rôles institutionnels, dans l’espace personnel pour le responsable d’organisation, sur la plateforme de formation pour les formateurs et les apprenants.',
        },
      ],
    },
    {
      id: 'operations-sensibles',
      title: 'Opérations sensibles et irréversibles',
      icon: 'alert-triangle',
      summary: 'Le récapitulatif de ce qui ne se défait pas, et de ce qui se défait.',
      blocks: [
        {
          type: 'table',
          caption: 'Avant de cliquer',
          columns: ['Opération', 'Réversible ?', 'Conséquence immédiate'],
          rows: [
            ['Désactiver un compte', 'Oui (`Réactiver le compte`)', 'Connexion refusée, sessions fermées, données conservées.'],
            ['Révoquer un rôle', 'Oui (attribuer de nouveau)', 'Droits retirés dès la page suivante ; personne n’est prévenu.'],
            ['Réinitialiser la MFA', 'Non (la personne doit la réactiver)', 'Secret et codes de secours effacés ; email envoyé.'],
            ['Mot de passe temporaire', 'Non (ancien mot de passe perdu)', 'Sessions fermées ; email d’invitation envoyé sans le mot de passe.'],
            ['Révoquer une clé API', 'Non', 'Intégration refusée immédiatement.'],
            ['Annuler une tâche', 'Partiellement (`Relancer` possible)', 'La tâche n’est plus exécutée ; motif conservé.'],
            ['Relancer une tâche', 'Oui (`Annuler`)', 'Exécution au prochain passage du cron.'],
            ['Enregistrer un menu', 'Non (l’ancien arbre est remplacé)', 'Navigation du site mise à jour ; l’ancienne version n’est pas conservée.'],
            ['Enregistrer les paramètres', 'Oui (ressaisir les valeurs)', 'Site public mis à jour ; valeurs avant / après dans le journal.'],
            ['Exporter (CSV)', 'Sans objet', 'Fichier de données personnelles sur votre appareil ; export journalisé.'],
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Notez le motif',
          text: 'Le journal d’audit enregistre l’action, pas l’intention. Avant une opération sensible, notez le motif (demande écrite, date, personne) dans votre journal d’exploitation pour pouvoir le justifier plus tard.',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications et emails que vous recevez',
      icon: 'bell',
      summary: 'Ce qui arrive dans votre boîte email et dans vos notifications, et ce qu’il faut en faire.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le rôle de super administrateur ne déclenche aucune notification qui lui soit propre : les alertes de traitements sont affichées dans le back-office, pas envoyées par email. Vous recevez les emails de compte de tout utilisateur, et vous voyez vos notifications dans **Notifications** (menu du compte).',
        },
        {
          type: 'table',
          caption: 'Emails et notifications',
          columns: ['Sujet ou titre', 'Déclencheur', 'Ce qu’il faut faire'],
          rows: [
            ['« Réinitialisation de votre mot de passe FETRAG »', 'Vous avez cliqué sur « Mot de passe oublié ? ».', 'Cliquer sur le lien dans les 30 minutes. Si vous n’êtes pas à l’origine de la demande, ignorez-le et signalez-le.'],
            ['« Votre mot de passe FETRAG a été modifié »', 'Changement de mot de passe (par vous ou par un mot de passe temporaire).', 'Si vous n’êtes pas à l’origine du changement : incident de sécurité, prévenez un autre super administrateur.'],
            ['« Nouveau rôle attribué »', 'Un autre super administrateur vous a attribué un rôle.', 'Vérifier la portée dans votre fiche ; activer la vérification en deux étapes si ce n’est pas fait.'],
            ['« Vérification en deux étapes réinitialisée »', 'Un autre super administrateur a réinitialisé votre vérification.', 'Réactiver la vérification depuis **Sécurité** sans attendre.'],
            ['Alerte « Traitements en arrière-plan à surveiller » (à l’écran)', 'Tâches en échec ou abandonnées, emails non délivrés sur 24 h.', 'Suivre « Superviser les traitements et les emails ».'],
          ],
        },
        {
          type: 'table',
          caption: 'Ce que reçoivent les personnes concernées par vos actions',
          columns: ['Votre action', 'La personne reçoit'],
          rows: [
            ['Créer un compte', 'Email « Votre compte de formation FETRAG est prêt : définissez votre mot de passe » (lien 7 jours) et notification interne « Bienvenue sur la plateforme FETRAG ».'],
            ['Attribuer un rôle', 'Notification « Nouveau rôle attribué » (interne et email).'],
            ['Réinitialiser la MFA', 'Notification « Vérification en deux étapes réinitialisée » (interne et email).'],
            ['Mot de passe temporaire', 'Email d’invitation (lien 7 jours, sans le mot de passe) et notification interne « Mot de passe réinitialisé par un administrateur ».'],
            ['Révoquer un rôle, désactiver ou réactiver un compte, modifier des paramètres, gérer une clé API ou une tâche', 'Rien : seul le journal d’audit garde une trace. Prévenez la personne vous-même si nécessaire.'],
          ],
        },
      ],
    },
    {
      id: 'bonnes-pratiques',
      title: 'Bonnes pratiques et sécurité',
      icon: 'check-circle',
      blocks: [
        {
          type: 'list',
          style: 'check',
          items: [
            'Un compte de super administrateur nominatif par personne ; jamais de compte partagé ni de mot de passe transmis par email.',
            'Toujours au moins deux super administrateurs actifs, chacun avec la vérification en deux étapes et ses codes de secours rangés en lieu sûr.',
            'Déconnectez-vous (**Déconnexion**) sur tout appareil partagé ou prêté, et ne laissez jamais le back-office ouvert sans surveillance.',
            'Donnez le rôle le plus bas qui suffit, avec une portée limitée quand c’est possible, et une date d’expiration pour les remplacements.',
            'Vérifiez l’identité d’une personne (appel, question de contrôle) avant de réinitialiser sa vérification en deux étapes ou de lui définir un mot de passe temporaire.',
            'Transmettez mots de passe temporaires et clés API par un canal sûr, une seule fois, puis demandez leur changement.',
            'Consultez le tableau de bord chaque jour ouvré et le journal d’audit chaque semaine ; faites la revue des comptes privilégiés chaque mois.',
            'Notez le motif de chaque opération sensible dans votre journal d’exploitation, sans y écrire de secret.',
            'Les données des utilisateurs (adresses, téléphones, employeurs, inscriptions, consentements) sont des données personnelles et syndicales : ne les exportez que sur demande justifiée, protégez le fichier et supprimez-le après usage.',
            'Restez courtois et factuel dans les messages aux utilisateurs et aux partenaires ; ne promettez jamais une fonction qui n’existe pas dans l’interface.',
            'Prévenez avant toute intervention visible (bandeau de maintenance) et confirmez après (retrait du bandeau, état de santé au vert).',
            'Ne modifiez pas les règles métier (devise, participants par demande) sans l’accord de la finance ou de la coordination.',
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
              question: 'Puis-je supprimer définitivement un compte ?',
              answer: 'Non. L’interface ne propose que la désactivation (`Désactiver le compte`), qui bloque la connexion et conserve inscriptions, certificats et commandes. C’est volontaire : les certificats et les paiements doivent rester vérifiables.',
            },
            {
              question: 'Comment corriger le nom ou l’adresse email d’un utilisateur ?',
              answer: 'Le back-office ne le permet pas : la personne modifie elle-même son profil depuis son espace personnel. Si l’adresse est fausse et qu’elle ne peut pas se connecter, créez un nouveau compte avec la bonne adresse et désactivez l’ancien.',
            },
            {
              question: 'Une personne a perdu son téléphone et ses codes de secours. Que faire ?',
              answer: 'Vérifiez son identité, puis cliquez sur `Réinitialiser la MFA` dans la carte **Compte** de sa fiche. Elle se reconnectera avec son mot de passe et devra réactiver la vérification depuis **Sécurité**. Si c’est vous qui êtes bloqué, un autre super administrateur doit le faire.',
            },
            {
              question: 'Pourquoi ne puis-je pas retirer mon propre rôle de super administrateur ?',
              answer: 'C’est un garde-fou : la ligne affiche « Protégé ». De même, le dernier super administrateur actif ne peut pas être retiré. Demandez à un autre super administrateur si c’est vraiment nécessaire.',
            },
            {
              question: 'J’ai attribué un rôle mais la personne ne voit rien de nouveau.',
              answer: 'Faites-lui recharger la page. Vérifiez ensuite la portée (un rôle institutionnel doit être « Globale ») et l’expiration. Si le déploiement exige la vérification en deux étapes, elle doit d’abord l’activer depuis **Sécurité**.',
            },
            {
              question: 'Le mot de passe temporaire est-il envoyé par email ?',
              answer: 'Jamais. L’email contient seulement un lien « Définir mon mot de passe » valable 7 jours. Le mot de passe temporaire n’est affiché qu’à vous, une seule fois, comme solution de secours à transmettre par un canal sûr.',
            },
            {
              question: 'Un rôle expiré est-il retiré automatiquement ?',
              answer: 'Il ne donne plus aucun droit dès la date passée, mais la ligne reste affichée avec « Expiré le <date> ». Personne n’est prévenu : révoquez la ligne pour nettoyer, ou attribuez de nouveau le rôle avec une nouvelle date.',
            },
            {
              question: 'Comment savoir si les emails partent vraiment ?',
              answer: 'Regardez la tuile **Emails non délivrés sur 24 h** dans la **File de traitements** et ouvrez `État de santé` : le fournisseur d’email doit être « resend » ou « smtp ». « console » signifie qu’aucun email n’est envoyé ; prévenez l’exploitant.',
            },
            {
              question: 'Puis-je activer les paiements en ligne ou les forums depuis le back-office ?',
              answer: 'Non. La carte **Drapeaux fonctionnels** de la page **Paramètres** est en lecture seule : ces fonctionnalités se règlent dans l’environnement d’hébergement. Faites une demande écrite à l’exploitant.',
            },
            {
              question: 'Je dois donner un accès à un partenaire pour lire des données. Faut-il lui créer un compte ?',
              answer: 'Non : si son logiciel appelle l’API, générez une **Clé API** en portée « Lecture seule » et transmettez-la par un canal sûr. Un compte utilisateur sert à une personne, une clé API à un logiciel.',
            },
            {
              question: 'Le journal d’audit peut-il être modifié ou purgé ?',
              answer: 'Non, ni depuis l’interface ni par un rôle quelconque. Vous pouvez seulement le filtrer et l’exporter ; chaque export est lui-même inscrit dans le journal.',
            },
            {
              question: 'Que se passe-t-il si je coche « Afficher le bandeau de maintenance » ?',
              answer: 'Un bandeau d’information apparaît sur le site et sur la plateforme de formation, mais l’accès reste ouvert : rien n’est bloqué. Pensez à le décocher après l’intervention.',
            },
            {
              question: 'Combien de temps un contenu planifié met-il à se publier ?',
              answer: 'La publication planifiée est vérifiée toutes les dix minutes par une tâche de fond, elle-même déclenchée toutes les cinq minutes. Comptez jusqu’à un quart d’heure après l’heure prévue ; au-delà, regardez la **File de traitements**.',
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
            { term: 'Back-office', definition: 'La partie du site réservée à l’équipe (« Administration du site »), par opposition au site public vu par tout le monde.' },
            { term: 'Rôle', definition: 'Ensemble de droits attribué à un compte : Apprenant, Responsable d’organisation, Formateur, Coordinateur formation, Éditeur communication, Responsable services, Finance / contrôle, Support, Super administrateur.' },
            { term: 'Portée', definition: 'Étendue d’un rôle : « Globale » (toute la plateforme), « Une organisation », « Un cours » ou « Une cohorte ». Un rôle à portée limitée est marqué « (limité) ».' },
            { term: 'Cohorte', definition: 'Groupe d’apprenants qui suit une formation ensemble, avec ses dates et son formateur.' },
            { term: 'Expiration (d’un rôle)', definition: 'Date après laquelle un rôle ne donne plus de droits. La ligne reste affichée avec « Expiré le <date> ».' },
            { term: 'Vérification en deux étapes (MFA)', definition: 'Code à six chiffres généré par une application sur votre téléphone, demandé en plus du mot de passe. Obligatoire pour les super administrateurs, la coordination, la finance et l’édition.' },
            { term: 'Codes de secours', definition: 'Huit codes à usage unique (format XXXXX-XXXXX) donnés une seule fois à l’activation de la vérification en deux étapes ; ils remplacent le code de l’application si le téléphone est perdu.' },
            { term: 'Mot de passe temporaire', definition: 'Mot de passe aléatoire de 14 caractères généré par le super administrateur, affiché une seule fois, jamais envoyé par email ; la personne le remplace à sa première connexion.' },
            { term: 'Invitation', definition: 'Email « définissez votre mot de passe » contenant un lien à usage unique valable 7 jours, envoyé à la création d’un compte ou après un mot de passe temporaire.' },
            { term: 'Jeton', definition: 'Code secret contenu dans un lien (invitation, réinitialisation) qui prouve que la personne a bien reçu l’email ; il expire et ne sert qu’une fois.' },
            { term: 'Session', definition: 'Connexion ouverte sur un appareil. Désactiver un compte ou définir un mot de passe temporaire ferme toutes les sessions de la personne.' },
            { term: 'Journal d’audit', definition: 'Trace immuable des actions sensibles (qui, quoi, quand, avant / après). Ni modifiable ni effaçable.' },
            { term: 'Empreinte IP', definition: 'Version codée de l’adresse Internet d’un appareil, conservée dans le journal sans permettre de retrouver l’adresse réelle.' },
            { term: 'Corrélation', definition: 'Identifiant commun à plusieurs entrées du journal issues d’une même opération, utile pour les retrouver ensemble.' },
            { term: 'File de traitements (file de jobs)', definition: 'Liste des tâches exécutées en arrière-plan (emails, PDF, webhooks, publications planifiées, rappels). Un « job » est l’une de ces tâches.' },
            { term: 'Cron', definition: 'Déclencheur automatique qui lance le traitement de la file toutes les cinq minutes chez l’hébergeur.' },
            { term: 'Webhook', definition: 'Message envoyé automatiquement par un service externe (par exemple le service de paiement) pour signaler un événement ; il est traité comme une tâche de fond.' },
            { term: 'API et clé API', definition: 'L’API est l’interface technique par laquelle un autre logiciel lit ou écrit des données de la plateforme ; la clé API est le code secret qui l’identifie, affiché une seule fois.' },
            { term: 'Empreinte SHA-256', definition: 'Résumé codé d’une clé API conservé à la place de la clé : il permet de la reconnaître sans pouvoir la reconstituer.' },
            { term: 'État de santé', definition: 'Page technique (`État de santé` dans **Paramètres**) qui indique si la base de données et la configuration répondent, et quel service d’email est utilisé.' },
            { term: 'Drapeau fonctionnel', definition: 'Fonctionnalité optionnelle (paiement en ligne, forums, lettre d’information, connexion locale, fournisseur d’identité externe) activée ou non dans l’environnement d’hébergement.' },
            { term: 'Fournisseur d’identité externe (OIDC)', definition: 'Service de connexion tiers auquel un compte peut être rattaché ; un tel compte n’a pas de mot de passe local.' },
            { term: 'Bandeau de maintenance', definition: 'Message d’information affiché en haut du site et de la plateforme de formation avant une intervention ; l’accès reste ouvert.' },
            { term: 'CSV', definition: 'Fichier texte de données tabulaires (séparateur point-virgule) lisible par un tableur ; les exports contiennent des données personnelles.' },
            { term: 'Runbook', definition: 'Fiche d’exploitation pas à pas (dossier « docs/runbooks » du dépôt) : rotation des secrets, incident de sécurité, supervision, file bloquée, panne email, restauration, déploiement.' },
            { term: 'Exploitant', definition: 'Personne ou prestataire qui administre l’hébergement (variables d’environnement, secrets, cron, sauvegardes), en dehors du back-office.' },
            { term: 'Devise institutionnelle', definition: 'Les trois mots de la devise de la Fédération, affichés sur le site (paramètre « Devise institutionnelle », à ne pas confondre avec la devise des tarifs, le code monétaire).' },
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
          columns: ['Problème', 'Interlocuteur', 'Comment'],
          rows: [
            ['Vous êtes bloqué (vérification en deux étapes, compte désactivé, rôle manquant)', 'Un autre super administrateur', 'Par téléphone ou en personne, après vérification d’identité.'],
            ['Panne d’email, file de traitements bloquée, état de santé en erreur, secrets, fonctionnalités optionnelles, sauvegardes', 'L’exploitant de l’hébergement', 'Par le canal convenu avec lui, avec le runbook concerné et le résultat de `État de santé` (sans secret).'],
            ['Question sur une formation, une cohorte, un certificat, une organisation', 'La coordination formation', 'Espace de coordination de la plateforme de formation, ou message interne.'],
            ['Question sur une commande, un paiement, un remboursement', 'Finance / contrôle', 'Section **Finance** du back-office.'],
            ['Demande d’un utilisateur (accès, mot de passe, message d’erreur)', 'Le Support', 'Il vous transmet les cas qui exigent une action de super administrateur.'],
            ['Décision de gouvernance (nouveau rôle, nouvelle intégration, export de données)', 'Le secrétariat général de la Fédération', 'Demande écrite, conservée avec le motif.'],
            ['Anomalie de l’application, besoin d’une fonction absente', 'L’équipe de développement, via le secrétariat général', 'Décrire l’écran, l’action et le message exact ; toute évolution structurante passe par un ADR (décision d’architecture) du dépôt.'],
          ],
        },
        {
          type: 'links',
          title: 'Coordonnées de la Fédération',
          items: [
            { label: 'Formulaire de contact du site', href: '/contact', description: 'Pour joindre le support de la FETRAG (choisir le type « assistance »).', icon: 'mail' },
            { label: 'Écrire à la Fédération', href: 'mailto:jossngomafm@gmail.com', description: 'Adresse email de contact affichée dans les paramètres.', icon: 'send' },
            { label: 'Appeler : 066 23 00 33 ou 077 52 27 98', href: 'tel:+24166230033', description: 'Aux heures de bureau, Libreville.', icon: 'phone' },
            { label: 'Adresse postale', href: '/contact', description: 'BP 1234 Libreville, Gabon.', icon: 'map-pin' },
          ],
        },
        {
          type: 'list',
          title: 'Dans un message d’aide, indiquez',
          style: 'bullet',
          items: [
            'L’adresse email de votre compte (jamais votre mot de passe ni vos codes de secours).',
            'L’écran concerné (par exemple « Utilisateurs et rôles › fiche de … › Attribuer un rôle ») et l’heure approximative.',
            'Le message exact affiché (« Au moins un super administrateur actif doit subsister », « ok : false »…).',
            'Ce que vous avez déjà essayé (rechargement, autre navigateur, autre appareil).',
            'Pour un problème d’email ou de tâches : les chiffres des tuiles de la **File de traitements** et le fournisseur indiqué par `État de santé`.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Runbooks',
          text: 'Les procédures d’exploitation détaillées sont dans le dossier « docs/runbooks » du dépôt du projet : supervision, jobs-bloques, panne-email, rotation-secrets, incident-securite, restauration-base, deploiement. Elles s’adressent à vous et à l’exploitant ; elles ne contiennent aucun secret et ne doivent jamais en contenir.',
        },
      ],
    },
  ],
  related: [
    { label: 'Guide du membre', href: '/espace/guide', description: 'Le guide commun à tous les comptes du site : espace personnel, profil, sécurité.' },
    { label: 'Guide du super administrateur de la plateforme de formation', href: '{{lms}}/admin/guide', description: 'Le même rôle sur la plateforme de formation : cours, questions, certificats, réglages.', external: true },
    { label: 'Guide de la coordination', href: '/admin/guide/web-coordination', description: 'Formations, cohortes, demandes de formation et organisations.' },
  ],
}
