import type { Guide } from '@fetrag/contracts'

/**
 * Guide de l’administration de la plateforme de formation (rôle SUPER_ADMIN).
 *
 * Périmètre : l’espace Administration complet de formation.fetrag.ga (/admin) — vue d’ensemble, cours et
 * versions figées, banque de questions, modèles de certificats, comptes et rôles, paramètres et file de
 * jobs, journal d’audit — plus l’accès aux autres espaces, la supervision (santé, jobs, emails) et la
 * sécurité (rôles exigeant la double authentification, révocation, opérations irréversibles).
 *
 * Libellés, statuts, règles et messages : vérifiés dans le code d’apps/lms (voir l’inventaire du chantier
 * « guides »). Ne documente que ce qui existe ; ne contient ni secret, ni compte de démonstration, ni domaine.
 */
export const lmsAdministrateur: Guide = {
  id: 'lms-administrateur',
  platform: 'lms',
  role: 'SUPER_ADMIN',
  title: 'Guide de l’administration de la plateforme',
  subtitle: 'Cours, questions, certificats, comptes et paramètres',
  audience:
    'Ce guide s’adresse aux personnes disposant du rôle « Super administrateur » sur la plateforme de formation : celles qui créent et publient les cours, tiennent la banque de questions, gèrent les modèles de certificats, attribuent les rôles, règlent les paramètres et surveillent la file de traitements et le journal d’audit.',
  summary:
    'En tant que super administrateur, vous avez accès à tout l’espace Administration de la plateforme de formation. Vous créez les cours et leurs versions figées, tenez la banque de questions et les modèles de certificats, gérez les comptes et les rôles, réglez les paramètres et supervisez la file de traitements, la santé de la plateforme et le journal d’audit. Chacune de vos actions sensibles est journalisée et certaines, comme la révocation d’un certificat, sont irréversibles.',
  tone: 'navy',
  icon: 'shield',
  readingMinutes: 55,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: [
    'Un compte sur la plateforme de formation avec le rôle « Super administrateur » en portée globale (attribué par un autre super administrateur).',
    'Une application d’authentification installée sur votre téléphone (Google Authenticator, Microsoft Authenticator ou FreeOTP) pour la vérification en deux étapes, exigée pour ce rôle.',
    'Un ordinateur pour les tâches longues (builder d’un cours, paramètres, journal d’audit) ; un smartphone suffit pour les vérifications et les actions rapides.',
    'L’accès aux runbooks du dossier « docs/runbooks » du dépôt si vous intervenez avec l’exploitant sur l’hébergement.',
  ],
  quickStart: [
    {
      text: 'Connectez-vous avec votre adresse email et votre mot de passe.',
      ui: 'Se connecter',
      where: 'page de connexion de la plateforme de formation',
      result: 'Si la vérification en deux étapes est exigée, le champ **Code de vérification** apparaît.',
    },
    {
      text: 'Activez la vérification en deux étapes si ce n’est pas encore fait.',
      where: 'sur le site institutionnel, menu du compte puis **Espace** > **Sécurité**',
      result: 'Un badge **MFA activée** apparaît sur votre compte dans l’annuaire.',
      note: 'L’activation se fait uniquement sur le site institutionnel ; elle protège votre accès à l’administration.',
    },
    {
      text: 'Ouvrez l’espace Administration.',
      ui: 'Administration',
      where: 'commutateur d’espaces en haut de page (sur mobile : menu du compte, vos initiales)',
      result: 'La page **Vue d’ensemble** s’ouvre avec la barre latérale marine « Administration ».',
    },
    {
      text: 'Lisez la carte **File de jobs** en haut de la vue d’ensemble.',
      where: 'grille d’indicateurs de la vue d’ensemble',
      result: 'Vous voyez le nombre de jobs à traiter, en échec ou abandonnés.',
    },
    {
      text: 'Vérifiez la santé de la plateforme.',
      where: 'ouvrez l’adresse /api/health dans un onglet',
      result: 'La réponse indique `ok:true` quand la base et la configuration sont en ordre.',
    },
  ],
  sections: [
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'shield',
      summary: 'Ce que le super administrateur peut faire sur la plateforme de formation, ce qu’il ne peut pas faire, et avec qui il travaille.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le super administrateur est le gardien de la plateforme de formation. Il monte les cours, en publie les versions, tient la banque de questions et les modèles de certificats, donne les bons rôles aux bonnes personnes et surveille que tout fonctionne. Chacune de vos actions sensibles est inscrite dans le **Journal d’audit** : une trace qui ne peut être ni modifiée ni effacée depuis l’interface.',
        },
        {
          type: 'paragraph',
          text: 'Un mot de vocabulaire, une fois pour toutes : la **plateforme** est le site de formation en ligne, le **site institutionnel** est le site public de la Fédération. Un même compte ouvre les deux. Un **cours** est un module du programme ; une **cohorte** est un groupe d’apprenants qui suit un cours sur une période donnée ; la **coordination** anime ces cohortes.',
        },
        {
          type: 'list',
          title: 'Ce que le rôle vous permet de faire',
          style: 'check',
          items: [
            'Créer, structurer, publier, retirer et archiver les cours du programme (`Nouveau cours`, `Publier`).',
            'Créer les versions figées d’un cours et publier la version courante suivie par les nouvelles inscriptions.',
            'Alimenter la **Banque de questions** (créer, importer par fichier CSV, dupliquer, désactiver) et composer les quiz.',
            'Créer et gérer les **Modèles de certificats**, définir le modèle par défaut, révoquer un certificat émis.',
            'Attribuer et retirer tous les rôles, avec leur portée, et désactiver ou réactiver un compte.',
            'Modifier les **Paramètres** de la formation et lancer un lot de traitements de la file de jobs.',
            'Consulter le **Journal d’audit** de la plateforme et accéder à tous les autres espaces.',
          ],
        },
        {
          type: 'list',
          title: 'Ce que l’interface ne permet pas',
          style: 'bullet',
          items: [
            'Créer un compte depuis l’administration : les comptes naissent à l’inscription, par les demandes de formation ou par la coordination.',
            'Supprimer définitivement un compte, ni supprimer un cours : seules la désactivation d’un compte et l’archivage d’un cours existent.',
            'Réinitialiser la vérification en deux étapes d’une personne : elle la désactive elle-même depuis le site institutionnel.',
            'Modifier la structure d’une version de cours déjà publiée ou déjà suivie : il faut créer une nouvelle version.',
            'Régler les fournisseurs (email, stockage, paiement) et les fonctionnalités techniques : ils se règlent dans l’environnement d’hébergement, pas dans l’administration.',
            'Retirer votre propre rôle de super administrateur ou désactiver votre propre compte.',
          ],
        },
        {
          type: 'table',
          caption: 'Avec qui vous travaillez',
          columns: ['Rôle', 'Ce qu’il fait', 'Ce que vous faites pour lui'],
          rows: [
            ['Coordination formation', 'Demandes de formation, cohortes, sessions, registre des certificats, organisations, rapports.', 'Attribuer le rôle Coordinateur ; publier les cours qu’elle planifie.'],
            ['Formateur', 'Anime une ou plusieurs cohortes, corrige, alimente la banque de questions.', 'Attribuer le rôle Formateur puis le rattacher au cours (onglet **Formateurs**).'],
            ['Responsable d’organisation', 'Dépose les demandes de formation de son organisation.', 'Attribuer le rôle sur son organisation si besoin.'],
            ['Apprenant', 'Suit les formations, passe les quiz, reçoit les certificats.', 'Rien : le compte naît de son inscription ; vous n’intervenez qu’en cas de problème.'],
            ['Exploitant (hébergement)', 'Variables d’environnement, secrets, planificateur (cron), sauvegardes.', 'Lui transmettre les constats de santé et de file de jobs ; ne jamais lui envoyer un secret par message.'],
          ],
        },
      ],
    },
    {
      id: 'avant-de-commencer',
      title: 'Avant de commencer : compte, connexion et sécurité',
      icon: 'log-in',
      summary: 'Se connecter, activer la vérification en deux étapes exigée pour ce rôle, se déconnecter.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Votre compte est le même sur le site institutionnel et sur la plateforme de formation. Le rôle de super administrateur fait partie des rôles privilégiés qui doivent protéger leur compte par une **vérification en deux étapes** (aussi appelée MFA) : en plus du mot de passe, un code à six chiffres généré par une application sur votre téléphone.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Quand la vérification est-elle bloquante ?',
          text: 'Selon le réglage du déploiement, l’accès à l’administration peut être refusé tant que la vérification n’est pas active : la page **Vérification en deux étapes** s’affiche alors. Activez-la dès votre première connexion, sans attendre ce blocage.',
        },
      ],
      subsections: [
        {
          id: 'activer-la-verification',
          title: 'Activer la vérification en deux étapes',
          blocks: [
            {
              type: 'paragraph',
              text: 'L’activation se fait uniquement sur le **site institutionnel**, dans votre espace personnel. La plateforme de formation, elle, ne fait que vérifier le code au moment de la connexion.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Installez une application d’authentification sur votre téléphone.',
                  note: 'Par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP. Une seule suffit.',
                },
                {
                  text: 'Sur le site institutionnel, ouvrez **Espace** puis **Sécurité**.',
                  where: 'menu du compte (vos initiales), en haut à droite',
                  result: 'La page de sécurité affiche un code à scanner (QR code).',
                },
                {
                  text: 'Scannez le code avec votre application, puis saisissez le code à six chiffres qu’elle affiche.',
                  result: 'La vérification est activée.',
                },
                {
                  text: 'Notez et rangez en lieu sûr les codes de secours affichés une seule fois.',
                  note: 'Ces codes vous dépannent si vous perdez votre téléphone. Ne les enregistrez jamais dans un message.',
                },
                {
                  text: 'Reconnectez-vous à la plateforme de formation : après le mot de passe, saisissez le **Code de vérification**.',
                  result: 'Votre compte affiche le badge **MFA activée** dans l’annuaire des utilisateurs.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'En cas de perte de votre téléphone',
              text: 'Personne dans l’administration ne peut réinitialiser votre vérification : il n’existe pas de bouton pour cela. Utilisez un code de secours pour vous connecter, puis réactivez la vérification. Sans code de secours, seule une intervention en base de données par l’exploitant peut vous dépanner (runbook « incident-securite »).',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'La page **Vérification en deux étapes** s’affiche et propose `Continuer sans activer pour le moment`.',
                  cause: 'Le déploiement exige la vérification pour les rôles privilégiés et votre compte ne l’a pas encore activée.',
                  solution: 'Cliquez sur le bouton bleu d’activation de la vérification (il ouvre votre espace de sécurité sur le site institutionnel), activez-la, puis revenez.',
                },
              ],
            },
          ],
        },
        {
          id: 'connexion-et-deconnexion',
          title: 'Se connecter et se déconnecter',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Saisissez votre adresse email et votre mot de passe sur la page de connexion, puis le code de vérification si demandé.',
                  ui: 'Se connecter',
                  result: 'Votre tableau de bord d’apprenant s’ouvre.',
                },
                {
                  text: 'Passez dans l’administration avec le commutateur d’espaces.',
                  ui: 'Administration',
                  where: 'en haut de page (sur mobile : menu du compte, vos initiales)',
                },
                {
                  text: 'Pour quitter, ouvrez le menu du compte et cliquez sur `Déconnexion`.',
                  where: 'vos initiales, en haut à droite',
                  result: 'Vous revenez à la page de connexion.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'tip',
              title: 'Mot de passe oublié',
              text: 'Utilisez le lien « Mot de passe oublié » de la page de connexion. Un email de réinitialisation vous est envoyé ; le lien est valable 30 minutes.',
            },
          ],
        },
      ],
    },
    {
      id: 'se-reperer',
      title: 'Se repérer dans l’espace Administration',
      icon: 'compass',
      summary: 'L’accueil de l’administration et sa navigation, sur ordinateur et sur smartphone.',
      blocks: [
        {
          type: 'screen',
          title: 'La page « Vue d’ensemble » de l’administration',
          description: 'Ce que vous voyez après avoir ouvert l’espace Administration.',
          areas: [
            { name: 'Barre latérale « Administration » (à gauche)', purpose: 'La navigation : Vue d’ensemble, Cours, Banque de questions, Modèles de certificats, Utilisateurs et rôles, Paramètres, Journal d’audit.', icon: 'menu' },
            { name: 'Barre supérieure de l’espace', purpose: 'Le titre « Administration » et le commutateur d’espaces (Apprenant, Organisation, Formateur, Coordination, Administration).', icon: 'layout-dashboard' },
            { name: 'Grille d’indicateurs', purpose: 'Cours publiés, versions, questions actives, modèles ; puis les cartes Utilisateurs, Inscriptions et File de jobs.', icon: 'bar-chart' },
            { name: 'Section « Accès rapides »', purpose: 'Des cartes pour ouvrir chaque rubrique d’un clic.', icon: 'arrow-right' },
            { name: 'Sections « Cours récemment modifiés » et « Dernières actions journalisées »', purpose: 'Les six derniers cours modifiés et les huit dernières actions du journal.', icon: 'history' },
          ],
        },
        {
          type: 'screen',
          title: 'La barre globale de la plateforme (au-dessus)',
          description: 'Commune à toutes les pages, elle sert à naviguer et à ouvrir votre compte.',
          areas: [
            { name: 'Liens du haut', purpose: 'Catalogue, Tableau de bord, Mes formations, Calendrier, Certificats, et un lien vers le site institutionnel.', icon: 'globe' },
            { name: 'Avatar avec vos initiales (en haut à droite)', purpose: 'Ouvre le menu du compte : accès aux espaces selon vos droits, profil, sécurité, et bouton `Déconnexion`.', icon: 'user' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Sur smartphone',
          text: 'Sous une certaine largeur, la barre latérale devient un tiroir : ouvrez-la avec le bouton **Ouvrir le menu** (icône à trois traits) de la barre supérieure, et refermez-la avec **Fermer le menu**. Le commutateur d’espaces est masqué sur petit écran : pour changer d’espace, passez par le menu du compte (avatar). Les tableaux défilent horizontalement dans leur cadre.',
        },
        {
          type: 'path',
          label: 'Chemin',
          items: ['Commutateur d’espaces', 'Administration', 'Vue d’ensemble'],
          href: '/admin',
        },
      ],
    },
    {
      id: 'lire-la-vue-d-ensemble',
      title: 'Lire la vue d’ensemble',
      icon: 'layout-dashboard',
      summary: 'Comprendre les indicateurs de l’accueil et savoir où aller.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La vue d’ensemble résume l’état de la plateforme. Prenez l’habitude de la lire en arrivant : elle vous dit s’il y a des cours en attente de relecture, des jobs en échec ou des certificats à surveiller.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Regardez la grille d’indicateurs en haut.',
              result: 'Vous voyez le nombre de cours publiés, de versions figées, de questions actives et de modèles de certificats.',
            },
            {
              text: 'Lisez la carte **File de jobs**.',
              result: 'Elle indique les jobs à traiter, en échec et, en badge rouge, ceux abandonnés ; ou « Indisponible » si la file ne répond pas.',
              note: 'Un badge rouge « abandonné(s) » demande une intervention : voir « Superviser la file de traitements ».',
            },
            {
              text: 'Utilisez les cartes d’**Accès rapides** pour ouvrir une rubrique.',
              where: 'section 01 de la page',
              result: 'La rubrique choisie s’ouvre (Cours, Banque de questions, Certificats, etc.).',
            },
            {
              text: 'Parcourez les **Dernières actions journalisées**.',
              result: 'Les huit dernières actions apparaissent ; cliquez sur `Journal complet` pour tout voir.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Ce que la vue d’ensemble n’affiche pas',
          text: 'Elle ne montre ni taux de complétion ni revenus. Les rapports et exports détaillés vivent dans l’espace **Coordination**, rubrique Rapports.',
        },
      ],
    },
    {
      id: 'gerer-les-cours',
      title: 'Gérer les cours du programme',
      icon: 'graduation-cap',
      summary: 'Créer un cours, le structurer, publier une version, le rendre visible, le faire évoluer.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un cours porte des **versions figées**. La version courante est celle que suivent les nouvelles inscriptions. Publier un cours le rend visible dans le catalogue de la plateforme et sur le site institutionnel : les deux lisent la même base, il n’y a aucune synchronisation à lancer à la main.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Version figée : pourquoi',
          text: 'Une fois publiée ou suivie par au moins une inscription, une version ne se modifie plus. Cela protège les apprenants en cours : leur formation ne change pas sous leurs pieds. Pour faire évoluer le contenu, on crée une nouvelle version.',
        },
      ],
      subsections: [
        {
          id: 'creer-un-cours',
          title: 'Créer un cours',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Cours** dans la barre latérale, puis cliquez sur `Nouveau cours`.',
                  where: 'en haut à droite de la liste des cours',
                  result: 'Le formulaire de création s’ouvre en quatre sections numérotées.',
                },
                {
                  text: 'Renseignez la section **Identité du module** : le titre (obligatoire, 3 à 200 caractères) et le code.',
                  note: 'Le code est obligatoire (2 à 24 caractères, lettres, chiffres et tirets) et unique. Il est mis en majuscules automatiquement, par exemple FETRAG-M03.',
                },
                {
                  text: 'Complétez la **Pédagogie** : objectifs (un par ligne), prérequis, public, modalité et niveau.',
                  note: 'La durée en heures est obligatoire (entier de 1 à 500, 12 par défaut).',
                },
                {
                  text: 'Réglez l’**Accès et la tarification** : politique d’inscription et gratuité.',
                  note: 'Si vous décochez « Formation gratuite », saisissez le tarif standard et le tarif membre en FCFA (entiers positifs).',
                },
                {
                  text: 'Cochez les **Formateurs du cours** si des comptes formateurs existent.',
                  note: 'Le premier coché devient le référent. Si aucun compte formateur n’existe, attribuez d’abord le rôle Formateur depuis Utilisateurs et rôles.',
                },
                {
                  text: 'Cliquez sur `Créer le cours`.',
                  where: 'en bas du formulaire',
                  result: 'Un message « Cours créé (version 1 en brouillon) » apparaît et vous êtes redirigé vers le builder du cours.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'success',
              title: 'Créé en brouillon',
              text: 'Un cours créé est en **Brouillon** avec sa version 1 « Version initiale » : il est invisible au catalogue tant que vous ne l’avez pas publié. Rien n’est encore vu par le public.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Le code FETRAG-M03 est déjà utilisé » s’affiche.',
                  cause: 'Un autre cours porte déjà ce code : il doit être unique.',
                  solution: 'Choisissez un code différent, puis recliquez sur `Créer le cours`.',
                },
                {
                  problem: 'Le message « Code invalide (lettres, chiffres, tirets) » apparaît.',
                  cause: 'Le code contient un caractère interdit (espace, accent, symbole).',
                  solution: 'N’utilisez que des lettres, des chiffres et des tirets.',
                },
              ],
            },
          ],
        },
        {
          id: 'structurer-un-cours',
          title: 'Structurer la version du cours',
          blocks: [
            {
              type: 'paragraph',
              text: 'La structure se construit dans l’onglet **Structure** du builder : des **modules** qui contiennent des **leçons**, qui contiennent des **activités** (contenu, vidéo, quiz, devoir, séance en direct…). Vous ne pouvez structurer qu’une version non figée.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans le builder, restez sur l’onglet `Structure`.',
                  result: 'La version affichée et son résumé (modules, leçons, activités) apparaissent.',
                },
                {
                  text: 'Cliquez sur `Ajouter un module`, saisissez son titre, puis `Ajouter`.',
                  result: 'Le module apparaît, numéroté (01, 02…).',
                },
                {
                  text: 'Dans le module, cliquez sur `Leçon` pour ajouter une leçon (titre obligatoire).',
                  result: 'La leçon s’ajoute sous le module.',
                },
                {
                  text: 'Dans la leçon, cliquez sur `Activité`, choisissez le **Type d’activité**, saisissez le titre et le contenu.',
                  note: 'Le type d’activité ne peut plus être changé après création. Les URL sont obligatoires pour les activités Vidéo, Audio, Lien, Présentation et Module SCORM.',
                },
                {
                  text: 'Réordonnez si besoin avec les boutons `Monter` et `Descendre`.',
                  note: 'Le réordonnancement se fait par flèches, pas par glisser-déposer : c’est plus simple sur smartphone.',
                  result: 'Un message « Ordre mis à jour » confirme.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Suppressions dans la structure',
              text: 'Supprimer un module supprime ses leçons et activités ; supprimer une activité perd ses tentatives et remises. Ces suppressions sont définitives : une boîte de confirmation vous le rappelle.',
            },
          ],
        },
        {
          id: 'publier-une-version',
          title: 'Publier une version et rendre le cours visible',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez l’onglet `Versions` du builder.',
                  result: 'La liste des versions s’affiche avec leurs badges (Courante, Publiée, Brouillon).',
                },
                {
                  text: 'Sur la version 1, cliquez sur `Publier`.',
                  result: 'La boîte « Publier la version 1 » s’ouvre.',
                },
                {
                  text: 'Confirmez avec `Publier`.',
                  result: 'La version est figée, devient la version courante et, si le cours était en Brouillon ou En relecture, il passe à **Publié**.',
                  note: 'Une version ne peut être publiée que si elle contient au moins un module, une leçon et une activité.',
                },
                {
                  text: 'Vérifiez la fiche publique avec `Voir au catalogue` (en-tête) ou l’onglet **Prévisualisation**.',
                  result: 'La fiche s’ouvre dans un nouvel onglet à l’adresse publique du cours.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'success',
              title: 'Visible partout, sans manœuvre',
              text: 'Un cours Publié avec une version courante apparaît aussitôt dans le catalogue de la plateforme et sur la page Formations du site institutionnel. Aucune notification n’est envoyée à la publication.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Publiez une version du cours avant de rendre le cours visible » apparaît.',
                  cause: 'Vous avez cliqué sur `Publier` au niveau du cours alors qu’aucune version n’est courante.',
                  solution: 'Publiez d’abord une version depuis l’onglet **Versions**, puis publiez le cours.',
                },
                {
                  problem: 'Le bouton `Publier` de la version est refusé.',
                  cause: 'La version est vide ou incomplète.',
                  solution: 'Ajoutez au moins un module, une leçon et une activité, puis réessayez.',
                },
              ],
            },
          ],
        },
        {
          id: 'faire-evoluer-un-cours',
          title: 'Faire évoluer un cours déjà suivi',
          blocks: [
            {
              type: 'paragraph',
              text: 'Dès qu’une version est publiée ou suivie, elle affiche « en lecture seule » et le badge **Suivie**. Pour la faire évoluer, on la duplique dans une nouvelle version brouillon.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Dans l’onglet **Structure** ou **Versions**, cliquez sur `Créer une nouvelle version` ou `Dupliquer`.',
                  result: 'La boîte de duplication s’ouvre.',
                },
                {
                  text: 'Renseignez le libellé, le journal des modifications et les règles d’achèvement, puis `Dupliquer`.',
                  result: 'Une version brouillon « Copie de la version N » est créée avec toute la structure copiée.',
                },
                {
                  text: 'Modifiez la nouvelle version (structure, quiz, règles) à votre rythme.',
                  note: 'Les apprenants en cours ne voient rien changer : ils gardent leur version.',
                },
                {
                  text: 'Cliquez sur `Comparer` pour relire les journaux de modifications des différentes versions.',
                  result: 'Une carte par version montre ce qui a changé.',
                },
                {
                  text: 'Publiez la nouvelle version quand elle est prête.',
                  result: 'Elle devient courante pour les nouvelles inscriptions ; les cohortes déjà lancées conservent leur version.',
                },
                {
                  text: 'Supprimez un brouillon devenu inutile avec `Supprimer`.',
                  note: 'Impossible pour la version courante ou une version suivie, et seulement s’il reste plus d’une version.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Séances en direct',
              text: 'Les séances en direct (dates, liens de visioconférence, replay) restent modifiables même sur une version figée. Seule la structure pédagogique est verrouillée.',
            },
          ],
        },
      ],
    },
    {
      id: 'cycle-de-vie-du-cours',
      title: 'Comprendre le cycle de vie d’un cours',
      icon: 'refresh',
      summary: 'Les statuts d’un cours et les transitions possibles entre eux.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un cours passe par plusieurs statuts. Vous les changez depuis la liste des cours ou depuis l’en-tête du builder.',
        },
        {
          type: 'statuses',
          title: 'Statuts d’un cours',
          items: [
            { label: 'Brouillon', tone: 'neutral', meaning: 'Cours en préparation, invisible au catalogue et sur le site.', next: 'Le structurer, puis `Soumettre à relecture` ou `Publier`.' },
            { label: 'En relecture', tone: 'info', meaning: 'Cours soumis à relecture, toujours invisible.', next: 'Le relire, puis `Publier`.' },
            { label: 'Publié', tone: 'success', meaning: 'Cours visible au catalogue et sur le site, s’il a une version courante.', next: '`Retirer du catalogue` pour le repasser en brouillon si nécessaire.' },
            { label: 'Archivé', tone: 'danger', meaning: 'Cours retiré du catalogue et des demandes de formation ; les inscriptions existantes sont conservées.', next: '`Restaurer en brouillon` pour le reprendre.' },
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Archiver n’est pas supprimer',
          text: 'L’interface ne permet pas de supprimer un cours. `Archiver` le retire du catalogue et des demandes, mais conserve tout. C’est réversible avec `Restaurer en brouillon`.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Retirer du catalogue',
          text: '`Retirer du catalogue` repasse un cours publié en Brouillon : il disparaît du catalogue et du site, mais les inscriptions en cours sont conservées.',
        },
      ],
    },
    {
      id: 'banque-de-questions',
      title: 'Tenir la banque de questions',
      icon: 'clipboard-list',
      summary: 'Créer, importer, dupliquer et gérer les questions réutilisables dans les quiz.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La banque rassemble des questions réutilisables dans les quiz des cours. Chaque question est **versionnée** : si vous modifiez une question déjà répondue par un apprenant, une nouvelle version est créée et l’ancienne est désactivée. Les quiz sans aucune tentative suivent automatiquement la nouvelle version.',
        },
      ],
      subsections: [
        {
          id: 'creer-une-question',
          title: 'Créer une question',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Banque de questions** dans la barre latérale, puis `Nouvelle question`.',
                  result: 'L’éditeur de question s’ouvre.',
                },
                {
                  text: 'Choisissez le **Type** (obligatoire) : Choix unique, Choix multiples, Vrai / Faux, Texte à trous, Appariement, Classement, Réponse courte ou Composition.',
                  note: 'Le type détermine les champs à remplir en dessous.',
                },
                {
                  text: 'Rédigez l’**Énoncé** (obligatoire, 3 à 5000 caractères) et les options ou la configuration attendue.',
                  note: 'Choix unique : exactement une bonne réponse. Choix multiples : au moins une. Jusqu’à 30 options.',
                },
                {
                  text: 'Réglez les **Points** (1 à 100), la **Difficulté** (1 à 5), la **Catégorie** et les **Étiquettes**.',
                  note: 'Jusqu’à 20 étiquettes de 40 caractères, séparées par des virgules.',
                },
                {
                  text: 'Cliquez sur `Ajouter à la banque`.',
                  result: 'Un message « Question ajoutée à la banque » apparaît et vous êtes redirigé vers sa fiche.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Un message « Exactement une option correcte » ou « Au moins une option correcte » bloque l’enregistrement.',
                  cause: 'Le nombre de bonnes réponses ne correspond pas au type de question.',
                  solution: 'Cochez le bon nombre de réponses correctes selon le type, puis réessayez.',
                },
              ],
            },
          ],
        },
        {
          id: 'importer-des-questions',
          title: 'Importer des questions par fichier CSV',
          blocks: [
            {
              type: 'paragraph',
              text: 'Un fichier CSV (des lignes séparées par des points-virgules) permet d’ajouter beaucoup de questions d’un coup. Le format d’une ligne est : type;énoncé;points;catégorie;options (séparées par des barres verticales);correctes (les numéros).',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la liste des questions, cliquez sur `Importer (CSV)`.',
                  result: 'La boîte « Importer des questions » s’ouvre avec un exemple pré-rempli.',
                },
                {
                  text: 'Collez vos lignes dans le champ **Contenu CSV** (obligatoire).',
                  note: 'Jusqu’à 500 questions par lot. Une première ligne commençant par « type » est ignorée comme en-tête.',
                },
                {
                  text: 'Cliquez sur `Importer`.',
                  result: 'Un message indique le nombre de questions importées et de lignes rejetées.',
                },
                {
                  text: 'Lisez le résumé **Éléments non traités** pour corriger les lignes en erreur.',
                  result: 'Chaque ligne rejetée est listée avec sa raison.',
                },
              ],
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Import limité à 500 questions par lot » apparaît.',
                  cause: 'Le fichier contient trop de lignes.',
                  solution: 'Coupez le fichier en plusieurs lots de 500 lignes maximum.',
                },
                {
                  problem: 'Le message « Aucune ligne exploitable dans le contenu collé » apparaît.',
                  cause: 'Le format des colonnes n’est pas respecté.',
                  solution: 'Vérifiez l’ordre : type;question;points;catégorie;options;correctes, séparés par des points-virgules.',
                },
              ],
            },
          ],
        },
        {
          id: 'gerer-une-question',
          title: 'Modifier, dupliquer ou désactiver une question',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez une question depuis la liste, puis cliquez sur `Modifier`.',
                  result: 'L’éditeur s’ouvre avec les valeurs actuelles.',
                },
                {
                  text: 'Enregistrez avec `Enregistrer`.',
                  result: 'Si la question n’a jamais été répondue, elle est modifiée en place. Sinon, une nouvelle version est créée et l’ancienne désactivée.',
                  note: 'Le message « Nouvelle version de la question créée » vous prévient dans ce second cas.',
                },
                {
                  text: 'Pour réutiliser une question comme base, cliquez sur `Dupliquer`.',
                  result: 'Une copie « (copie) » active est créée.',
                },
                {
                  text: 'Pour retirer une question, cliquez sur la corbeille.',
                  result: 'Si la question est utilisée dans un quiz ou a des réponses, elle est désactivée ; sinon elle est supprimée définitivement.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts d’une question',
              items: [
                { label: 'Active', tone: 'success', meaning: 'Question proposée dans les quiz.', next: 'Rien à faire.' },
                { label: 'Inactive', tone: 'neutral', meaning: 'Question retirée des quiz mais conservée.', next: 'La réactiver via la case « Question active » en modification, ou la retrouver avec « Inclure les inactives ».' },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Question déjà répondue',
              text: 'On ne peut pas modifier les questions d’un quiz qui a déjà des tentatives : il faut passer par une nouvelle version du cours. La banque protège ainsi les résultats déjà enregistrés.',
            },
          ],
        },
      ],
    },
    {
      id: 'composer-un-quiz',
      title: 'Composer un quiz',
      icon: 'list-checks',
      summary: 'Ajouter des questions à une activité d’évaluation depuis la banque ou en création rapide.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un quiz est une activité de type Évaluation (ou Questionnaire). Vous le composez depuis le builder du cours, dans l’onglet **Quiz** de l’activité.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Créez ou ouvrez une activité de type Évaluation, puis ouvrez l’onglet `Quiz`.',
              note: 'Réglez d’abord le temps limite, le nombre de tentatives (3 par défaut), le score de réussite (60 % par défaut) et enregistrez.',
            },
            {
              text: 'Rouvrez l’activité et cliquez sur `Depuis la banque`.',
              result: 'La liste des questions actives non déjà présentes s’affiche.',
            },
            {
              text: 'Recherchez par mot-clé, type ou catégorie, cochez les questions, puis `Ajouter`.',
              result: 'Un message « N question(s) ajoutée(s) : barème P point(s) » confirme.',
            },
            {
              text: 'Ou cliquez sur `Création rapide` pour créer une question à la volée.',
              note: 'La question est aussi enregistrée dans la banque, réutilisable ailleurs.',
            },
            {
              text: 'Réordonnez avec `Monter la question` et `Descendre la question`, ou retirez avec `Retirer la question du quiz`.',
              result: 'Le barème affiché est la somme des points des questions.',
            },
          ],
        },
        {
          type: 'troubleshooting',
          items: [
            {
              problem: 'Le message « Ce quiz a déjà des tentatives » empêche de modifier les questions.',
              cause: 'Un apprenant a déjà passé ce quiz.',
              solution: 'Créez une nouvelle version du cours pour modifier ses questions.',
            },
            {
              problem: 'Le bouton pour composer le quiz n’apparaît pas.',
              cause: 'L’activité n’est pas encore enregistrée.',
              solution: 'Enregistrez l’activité une première fois, puis rouvrez-la pour composer le quiz.',
            },
          ],
        },
      ],
    },
    {
      id: 'certificats',
      title: 'Gérer les modèles de certificats',
      icon: 'award',
      summary: 'Créer un modèle, définir le modèle par défaut, comprendre l’émission automatique, régénérer un PDF.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Un **modèle** définit les textes imprimés, le signataire, les critères d’éligibilité (score, assiduité, formation terminée) et la validité d’une attestation ou d’un certificat. Le **modèle par défaut** s’applique aux cours qui n’ont pas de modèle dédié.',
        },
      ],
      subsections: [
        {
          id: 'creer-un-modele',
          title: 'Créer un modèle de certificat',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Modèles de certificats**, puis cliquez sur `Nouveau modèle`.',
                  result: 'Le formulaire s’ouvre, avec un aperçu de la mise en page par défaut.',
                },
                {
                  text: 'Saisissez le nom (obligatoire), choisissez la nature (Attestation ou Certificat) et le cours concerné.',
                  note: 'Cours vide = modèle générique, applicable à tous les cours sans modèle dédié.',
                },
                {
                  text: 'Renseignez le titre imprimé, la mention, le signataire et sa qualité (tous obligatoires).',
                },
                {
                  text: 'Réglez les critères d’éligibilité : score minimal (60 % par défaut), assiduité minimale, formation terminée requise.',
                  note: 'La validité en mois est facultative : vide = sans expiration.',
                },
                {
                  text: 'Cochez « Modèle par défaut » si ce modèle doit servir aux cours sans modèle dédié, puis `Créer le modèle`.',
                  result: 'Un message « Modèle de certificat créé » apparaît.',
                  note: 'Cocher « par défaut » retire automatiquement ce statut des autres modèles : il n’y en a qu’un.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Sans modèle par défaut, pas de certificat générique',
              text: 'S’il n’existe aucun modèle par défaut, seuls les cours disposant d’un modèle dédié peuvent délivrer un certificat. Créez au moins un modèle par défaut pour permettre l’émission à la clôture des cohortes.',
            },
          ],
        },
        {
          id: 'emission-automatique',
          title: 'Comprendre l’émission automatique',
          blocks: [
            {
              type: 'paragraph',
              text: 'Vous ne « fabriquez » pas un certificat à la main depuis l’administration : il est émis automatiquement quand une inscription est achevée et que les critères du modèle sont remplis. L’émission manuelle et l’émission pour toute une cohorte se font depuis l’espace Coordination.',
            },
            {
              type: 'statuses',
              title: 'Statuts d’un certificat et de son PDF',
              items: [
                { label: 'Valide', tone: 'success', meaning: 'Certificat émis et non révoqué.', next: 'Rien à faire.' },
                { label: 'Révoqué', tone: 'danger', meaning: 'Certificat annulé définitivement ; la vérification publique est négative.', next: 'Pour corriger, réémettre depuis la Coordination (nouveau numéro).' },
                { label: 'Expiré', tone: 'warning', meaning: 'La validité en mois du certificat est dépassée.', next: 'Réémettre si nécessaire.' },
                { label: 'En génération', tone: 'info', meaning: 'Le PDF n’est pas encore produit par la file de traitements.', next: 'Attendre le prochain cycle, ou `Régénérer le PDF`.' },
                { label: 'Disponible', tone: 'success', meaning: 'Le PDF est prêt dans le stockage privé.', next: 'Le titulaire peut le télécharger.' },
              ],
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Si un PDF manque (« En génération ») ou après avoir modifié un modèle, cliquez sur `Régénérer le PDF`.',
                  where: 'section « Derniers certificats émis » ou fiche du modèle',
                  result: 'Un message « Régénération du PDF planifiée » apparaît.',
                },
                {
                  text: 'Attendez le prochain cycle de traitements, ou lancez-le depuis Paramètres.',
                  result: 'Le PDF passe à « Disponible » une fois le job exécuté (5 minutes au plus).',
                },
              ],
            },
          ],
        },
        {
          id: 'revoquer-un-certificat',
          title: 'Révoquer un certificat',
          blocks: [
            {
              type: 'callout',
              tone: 'danger',
              title: 'Action définitive et publique',
              text: 'Révoquer un certificat est irréversible. La vérification publique sur le site affichera « révoqué », le titulaire est notifié par email et le numéro n’est jamais réattribué. Pour corriger une simple erreur, on ne « dé-révoque » pas : on réémet un nouveau certificat depuis la Coordination.',
            },
            {
              type: 'steps',
              items: [
                {
                  text: 'Depuis **Modèles de certificats** ou la fiche d’un compte, cliquez sur `Révoquer` sur un certificat Valide.',
                  result: 'La boîte de révocation s’ouvre en rouge.',
                },
                {
                  text: 'Saisissez le **Motif de révocation** (obligatoire, 3 à 500 caractères).',
                  note: 'Par exemple : erreur d’identité, fraude constatée, décision de la commission.',
                },
                {
                  text: 'Cliquez sur `Révoquer`.',
                  result: 'Le certificat passe à Révoqué, le titulaire reçoit un email « Certificat révoqué », et l’action est journalisée.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Suivez le runbook',
              text: 'Une révocation se prépare : constituer le dossier, respecter le contradictoire, envoyer un courrier officiel. La procédure est décrite dans le runbook « revocation-certificat » du dépôt.',
            },
          ],
        },
      ],
    },
    {
      id: 'gerer-les-inscriptions',
      title: 'Changer le statut d’une inscription',
      icon: 'users',
      summary: 'Activer, terminer, suspendre ou annuler une inscription depuis le builder d’un cours.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depuis l’onglet **Inscriptions** du builder d’un cours, vous pouvez faire évoluer une inscription. Les transitions proposées dépendent du statut actuel.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez le builder du cours, puis l’onglet `Inscriptions`.',
              result: 'La liste des inscrits s’affiche avec leur progression et leur statut.',
            },
            {
              text: 'Filtrez par nom, email ou statut pour trouver l’inscription.',
              result: 'La liste se réduit aux inscriptions correspondantes.',
            },
            {
              text: 'Choisissez l’action proposée : `Activer`, `Terminer`, `Suspendre` ou `Annuler`.',
              note: 'Un motif est obligatoire pour Terminer, Suspendre et Annuler.',
            },
            {
              text: 'Confirmez dans la boîte de dialogue.',
              result: 'Le statut change, l’apprenant reçoit une notification, et l’action est historisée.',
              note: 'Terminer met la progression à 100 % et émet le certificat si les critères sont remplis.',
            },
          ],
        },
        {
          type: 'statuses',
          title: 'Statuts d’une inscription',
          items: [
            { label: 'En attente', tone: 'warning', meaning: 'Inscription à valider.', next: '`Activer` ou `Annuler`.' },
            { label: 'En cours', tone: 'info', meaning: 'Inscription active.', next: '`Suspendre`, `Annuler` ou `Terminer`.' },
            { label: 'Terminée', tone: 'success', meaning: 'Formation achevée, progression 100 %.', next: 'Aucune transition.' },
            { label: 'Suspendue', tone: 'neutral', meaning: 'Accès au contenu temporairement retiré.', next: '`Activer` ou `Annuler`.' },
            { label: 'Annulée', tone: 'danger', meaning: 'Inscription annulée, progression conservée.', next: '`Activer` pour la réactiver.' },
            { label: 'Expirée', tone: 'neutral', meaning: 'Inscription échue, passée automatiquement par le système.', next: '`Activer` pour la reprendre.' },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Qui peut le faire',
          text: 'Ce travail relève surtout de la coordination et du formateur de la cohorte. En tant que super administrateur, vous le pouvez aussi, mais les procédures détaillées d’inscription vivent dans le guide de la coordination.',
        },
      ],
    },
    {
      id: 'utilisateurs-et-roles',
      title: 'Gérer les comptes et les rôles',
      icon: 'users-round',
      summary: 'Trouver un compte, attribuer et retirer un rôle avec sa portée, désactiver un compte.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chaque compte porte des rôles avec une **portée** : globale (toute la plateforme), une organisation, un cours ou une cohorte. Les rôles privilégiés exigent la double authentification. Toute attribution ou tout retrait est journalisé avec son auteur.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'On ne crée pas de compte ici',
          text: 'L’administration ne crée pas de compte : ils naissent à l’inscription, par les demandes de formation ou par la coordination. Vous n’attribuez que des rôles à des comptes existants.',
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
                  text: 'Ouvrez **Utilisateurs et rôles**, cherchez le compte par nom ou email, puis `Ouvrir`.',
                  result: 'La fiche du compte s’affiche avec ses rôles actuels.',
                },
                {
                  text: 'Dans « Attribuer un rôle », choisissez le **Rôle**.',
                  note: 'Neuf rôles existent, de Apprenant à Super administrateur.',
                },
                {
                  text: 'Choisissez la **Portée** : Globale, Une organisation, Un cours ou Une cohorte.',
                  note: 'Hors « Globale », la cible est obligatoire : choisissez l’organisation, le cours ou la cohorte.',
                },
                {
                  text: 'Ajoutez une **Expiration** si le rôle est temporaire (facultatif), puis `Attribuer`.',
                  result: 'Un message « Rôle attribué » apparaît ; les droits s’appliquent dès la page suivante.',
                  note: 'Si le même rôle et la même portée existent déjà, seule l’expiration est mise à jour.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Rendre quelqu’un formateur d’un cours',
              text: 'Attribuer le rôle Formateur ne suffit pas : rattachez ensuite le compte au cours dans le builder (onglet **Formateurs**, `Ajouter un formateur`, `Désigner référent`).',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Portée requise » ou « La portée indiquée est introuvable » apparaît.',
                  cause: 'Vous avez choisi une portée non globale sans cible, ou une cible inexistante.',
                  solution: 'Sélectionnez une cible valide dans la liste **Cible de la portée**.',
                },
              ],
            },
          ],
        },
        {
          id: 'retirer-un-role',
          title: 'Retirer un rôle',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche du compte, repérez la ligne du rôle à retirer.',
                  where: 'section « Rôles et portées »',
                },
                {
                  text: 'Cliquez sur `Retirer`, puis confirmez.',
                  result: 'Le rôle disparaît, les droits sont retirés immédiatement, et l’action est journalisée.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'danger',
              title: 'Deux garde-fous',
              text: 'Vous ne pouvez pas retirer votre propre rôle de super administrateur (le bouton est masqué et le serveur refuse). Personne n’est prévenu par email d’un retrait : prévenez la personne vous-même si nécessaire.',
            },
          ],
        },
        {
          id: 'desactiver-un-compte',
          title: 'Désactiver ou réactiver un compte',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur la fiche du compte, cliquez sur `Désactiver` en haut, puis confirmez.',
                  result: 'La personne ne peut plus se connecter ; ses données sont conservées.',
                  note: 'Aucun email ni notification ne lui est plus adressé tant que le compte est désactivé.',
                },
                {
                  text: 'Pour revenir en arrière, cliquez sur `Réactiver`.',
                  result: 'Le compte redevient utilisable.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Les sessions ouvertes',
              text: 'La désactivation empêche toute nouvelle connexion, mais une session déjà ouverte peut rester valable jusqu’à 14 jours. Pour couper immédiatement toutes les sessions, il faut faire tourner la clé de session (runbook « incident-securite », par l’exploitant). Vous ne pouvez pas désactiver votre propre compte.',
            },
          ],
        },
      ],
    },
    {
      id: 'parametres',
      title: 'Régler les paramètres et lancer les traitements',
      icon: 'settings',
      summary: 'Modifier un paramètre de la formation et forcer un lot de traitements de la file de jobs.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La page **Paramètres** regroupe les réglages métier de la formation (limite de participants, correction des quiz, message d’accueil, compteur des certificats) et l’état de la file de jobs. Chaque modification est journalisée.',
        },
      ],
      subsections: [
        {
          id: 'modifier-un-parametre',
          title: 'Modifier un paramètre',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Paramètres**, section « Paramètres de la formation ».',
                  result: 'La liste des paramètres gérés s’affiche.',
                },
                {
                  text: 'Cliquez sur `Modifier` sur la ligne voulue.',
                  result: 'La boîte du paramètre s’ouvre.',
                },
                {
                  text: 'Saisissez la valeur (nombre, oui/non ou texte) et une description, puis `Enregistrer`.',
                  result: 'Un message « Paramètre enregistré » apparaît ; l’effet est immédiat.',
                  note: 'La limite de participants attend un entier de 1 à 500 ; le crédit partiel attend true ou false ; le message d’accueil, 2000 caractères au plus.',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'Ce qui ne se règle pas ici',
              text: 'Le compteur des certificats est automatique et non modifiable. Les fournisseurs (email, stockage, paiement) et la double authentification obligatoire se règlent par variables d’environnement chez l’hébergeur, pas dans cette page.',
            },
            {
              type: 'troubleshooting',
              items: [
                {
                  problem: 'Le message « Le compteur des certificats est géré automatiquement » apparaît.',
                  cause: 'Vous tentez de modifier une valeur en lecture seule.',
                  solution: 'Ce paramètre n’est pas modifiable : c’est normal, aucune action n’est requise.',
                },
              ],
            },
          ],
        },
        {
          id: 'lancer-les-traitements',
          title: 'Lancer un lot de traitements',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Sur **Paramètres**, cliquez sur `Lancer le traitement des jobs` en haut.',
                  result: 'Une confirmation indique le nombre de jobs prêts.',
                },
                {
                  text: 'Confirmez avec `Traiter maintenant`.',
                  result: 'Un lot de 10 jobs au plus est exécuté (emails, PDF de certificats, notifications).',
                  note: 'Le résultat affiche « N job(s) traité(s), M en échec, R restant(s) ».',
                },
              ],
            },
            {
              type: 'callout',
              tone: 'info',
              title: 'En production, c’est automatique',
              text: 'Le planificateur (toutes les 5 minutes) ou le worker traite la file tout seul. Le bouton sert surtout à débloquer un envoi pendant une recette, sans attendre le prochain cycle.',
            },
          ],
        },
      ],
    },
    {
      id: 'superviser',
      title: 'Superviser la file de traitements et les emails',
      icon: 'wrench',
      summary: 'Lire l’état de la file de jobs, vérifier la santé de la plateforme, diagnostiquer les emails.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La **file de jobs** exécute en arrière-plan les envois d’emails, la génération des PDF de certificats et de reçus, les notifications, les rappels de séance et l’expiration des inscriptions. Les opérations métier ne sont jamais bloquées par un email : même si un envoi échoue, la note, le certificat ou l’inscription restent enregistrés.',
        },
      ],
      subsections: [
        {
          id: 'lire-la-file',
          title: 'Lire l’état de la file de jobs',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez **Paramètres** et lisez les indicateurs de jobs.',
                  result: 'Vous voyez les jobs à traiter, terminés, en échec (relance automatique) et abandonnés.',
                },
                {
                  text: 'Parcourez le tableau « Derniers jobs » et sa colonne « Dernière erreur ».',
                  result: 'Vous repérez le type de job en échec et le message d’erreur.',
                },
              ],
            },
            {
              type: 'statuses',
              title: 'Statuts d’un job',
              items: [
                { label: 'En attente', tone: 'info', meaning: 'Job à exécuter dès l’heure planifiée.', next: 'Rien : il partira au prochain cycle.' },
                { label: 'En cours', tone: 'info', meaning: 'Job en cours d’exécution.', next: 'Attendre ; repris automatiquement après 10 minutes s’il se bloque.' },
                { label: 'Terminé', tone: 'success', meaning: 'Job exécuté avec succès.', next: 'Rien à faire.' },
                { label: 'En échec', tone: 'warning', meaning: 'Job échoué, rejoué automatiquement avec un délai croissant.', next: 'Surveiller ; jusqu’à 5 tentatives.' },
                { label: 'Abandonné', tone: 'danger', meaning: 'Tentatives épuisées : intervention requise.', next: 'Non relançable depuis l’interface : suivre le runbook « jobs-bloques » avec l’exploitant.' },
              ],
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Un job abandonné ne se relance pas ici',
              text: 'L’interface ne propose ni relance ni annulation individuelle d’un job. Un job **Abandonné** demande l’intervention de l’exploitant, décrite dans le runbook « jobs-bloques ».',
            },
          ],
        },
        {
          id: 'verifier-la-sante',
          title: 'Vérifier la santé et diagnostiquer les emails',
          blocks: [
            {
              type: 'steps',
              items: [
                {
                  text: 'Ouvrez l’adresse /api/health de la plateforme dans un onglet.',
                  result: 'La réponse indique `ok:true` quand la base et la configuration minimale sont en ordre ; sinon une erreur avec « Variables manquantes ».',
                },
                {
                  text: 'Lisez le champ « provider » de la section email.',
                  result: '« resend » ou « smtp » est attendu en production ; « console » signifie qu’aucun email ne part.',
                  note: 'La sonde n’affiche jamais de secret : seulement des noms de variables et un indicateur de configuration.',
                },
                {
                  text: 'En cas d’emails non délivrés, repérez les jobs email.send en échec dans « Derniers jobs ».',
                  result: 'La dernière erreur donne le message du fournisseur.',
                  note: 'Suivez le runbook « panne-email » si le problème persiste.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'journal-audit',
      title: 'Consulter le journal d’audit',
      icon: 'history',
      summary: 'Retrouver qui a fait quoi, lire l’état avant / après, enquêter sur un compte.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le **Journal d’audit** garde une trace en lecture seule des actions sensibles de la plateforme : publications, inscriptions, notes, présences, certificats, décisions sur les demandes, rôles et paramètres. On ne peut ni le modifier ni l’effacer, ni l’exporter depuis l’interface.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez **Journal d’audit** dans la barre latérale.',
              result: 'La liste des dernières actions s’affiche (30 par page).',
            },
            {
              text: 'Filtrez par email de l’acteur, identifiant, action ou entité.',
              result: 'La liste se réduit aux entrées correspondantes.',
            },
            {
              text: 'Cliquez sur `Voir le détail` d’une ligne.',
              result: 'L’état avant et après s’affiche, avec un identifiant de corrélation à rapprocher des logs de l’hébergeur.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Ce que le journal ne montre pas',
          text: 'Ce journal ne montre que les actions de la formation. Les connexions, les paiements et les exports n’y figurent pas. Il n’y a pas non plus d’export CSV depuis cette page.',
        },
        {
          type: 'callout',
          tone: 'danger',
          title: 'Compte compromis',
          text: 'Si vous soupçonnez un compte compromis, désactivez-le et retirez ses rôles, puis suivez le runbook « incident-securite » (faire tourner la clé de session pour invalider les sessions, préserver les preuves).',
        },
      ],
    },
    {
      id: 'autres-espaces',
      title: 'Accéder aux autres espaces',
      icon: 'compass',
      summary: 'Passer dans la Coordination, l’espace Formateur, l’espace Organisation ou l’espace Apprenant.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Le super administrateur voit tous les espaces dans le commutateur. Les procédures détaillées de chaque espace vivent dans le guide du rôle correspondant, pas dans ce guide.',
        },
        {
          type: 'steps',
          items: [
            {
              text: 'Ouvrez le commutateur d’espaces en haut de page.',
              where: 'sur mobile : menu du compte (vos initiales)',
              result: 'La liste des espaces s’affiche.',
            },
            {
              text: 'Choisissez l’espace voulu.',
              result: 'L’espace s’ouvre avec sa propre barre latérale.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Les espaces et leur guide',
          columns: ['Espace', 'Ce qu’on y fait', 'Guide'],
          rows: [
            ['Coordination', 'Demandes de formation, cohortes, sessions, registre des certificats, organisations, rapports.', 'Guide de la coordination.'],
            ['Formateur', 'Cohortes enseignées, calendrier, forums.', 'Guide du formateur.'],
            ['Organisation', 'Tableau de bord d’organisation et demande de formation.', 'Guide de l’organisation.'],
            ['Apprenant', 'Espace personnel, catalogue, formations suivies.', 'Guide de l’apprenant.'],
          ],
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
            ['Publier une version', 'Non (la version reste figée)', 'La version devient courante et le cours devient visible ; les cohortes en cours gardent leur version.'],
            ['Retirer du catalogue', 'Oui (`Publier` de nouveau)', 'Le cours repasse en brouillon ; inscriptions conservées.'],
            ['Archiver un cours', 'Oui (`Restaurer en brouillon`)', 'Retiré du catalogue et des demandes de formation.'],
            ['Supprimer un module, une leçon ou une activité', 'Non', 'Le contenu et les tentatives ou remises liées sont perdus.'],
            ['Révoquer un certificat', 'Non', 'Vérification publique négative ; titulaire notifié ; numéro jamais réattribué.'],
            ['Retirer un rôle', 'Oui (attribuer de nouveau)', 'Droits retirés dès la page suivante ; personne n’est prévenu.'],
            ['Désactiver un compte', 'Oui (`Réactiver`)', 'Connexion refusée ; données conservées ; sessions valables jusqu’à 14 jours.'],
            ['Enregistrer un paramètre', 'Oui (ressaisir)', 'Effet immédiat ; valeurs avant / après dans le journal.'],
            ['Lancer un lot de traitements', 'Sans objet', 'Exécution immédiate d’au plus 10 jobs.'],
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Notez le motif',
          text: 'Le journal d’audit enregistre l’action, pas l’intention. Avant une opération sensible (révocation, retrait de rôle, désactivation), notez le motif — demande écrite, date, personne — dans votre journal d’exploitation, sans y écrire de secret.',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications et emails',
      icon: 'bell',
      summary: 'Ce que déclenchent vos actions et ce que vous voyez, sachant que l’administration envoie peu d’emails.',
      blocks: [
        {
          type: 'paragraph',
          text: 'La plupart de vos actions d’administration (publication, modification de structure, questions, modèles, rôles, désactivation, paramètres) ne déclenchent que le journal d’audit : aucun email ni notification. Les emails partent surtout des parcours d’inscription et de coordination.',
        },
        {
          type: 'table',
          caption: 'Ce que reçoivent les personnes concernées par vos actions',
          columns: ['Votre action', 'La personne reçoit'],
          rows: [
            ['Activer une inscription en attente', 'Email « Inscription confirmée » et notification interne « Inscription validée ».'],
            ['Terminer une inscription (critères remplis)', 'Notification « Votre certificat est disponible » et email « Certificat disponible » ou « Attestation disponible » (lien de téléchargement et de vérification).'],
            ['Annuler une inscription', 'Email et notification interne « Inscription annulée ».'],
            ['Suspendre une inscription', 'Notification interne « Inscription suspendue » (sans email).'],
            ['Révoquer un certificat', 'Notification interne et email « Certificat révoqué » avec le motif.'],
            ['Attribuer ou retirer un rôle, désactiver un compte, modifier un paramètre', 'Rien : seul le journal d’audit garde une trace. Prévenez la personne vous-même si nécessaire.'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Un compte désactivé ne reçoit plus rien',
          text: 'Tant qu’un compte est désactivé, il ne reçoit ni notification interne ni email.',
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
            'Déconnectez-vous (`Déconnexion`) sur tout appareil partagé ou prêté, et ne laissez jamais l’administration ouverte sans surveillance.',
            'Donnez le rôle le plus bas qui suffit, avec une portée limitée (un cours, une cohorte) quand c’est possible, et une date d’expiration pour les remplacements.',
            'Avant de publier un cours, relisez-le dans l’onglet **Prévisualisation** : c’est ce que verra le public.',
            'Pour faire évoluer un cours suivi, créez une nouvelle version : ne cherchez jamais à contourner le verrouillage d’une version figée.',
            'Notez le motif de chaque révocation, retrait de rôle ou désactivation dans votre journal d’exploitation, sans y écrire de secret.',
            'Les données des apprenants (adresses, employeurs, inscriptions, notes) sont des données personnelles et syndicales : traitez-les avec confidentialité et ne les diffusez pas hors de la plateforme.',
            'Consultez la vue d’ensemble chaque jour ouvré et le journal d’audit chaque semaine ; surveillez le badge des jobs abandonnés.',
            'Ne réglez jamais un fournisseur ou un secret depuis l’interface : cela se fait chez l’hébergeur, avec l’exploitant.',
            'Restez courtois et factuel dans les messages ; ne promettez jamais une fonction qui n’existe pas dans l’interface.',
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
              question: 'Je veux modifier le contenu d’un cours déjà suivi, mais tout est en lecture seule. Pourquoi ?',
              answer: 'La version est figée pour protéger les apprenants en cours. Créez une nouvelle version avec `Créer une nouvelle version` ou `Dupliquer`, modifiez-la, puis publiez-la. Voir « Faire évoluer un cours déjà suivi ».',
            },
            {
              question: 'Comment créer un compte pour un nouveau formateur ?',
              answer: 'On ne crée pas de compte depuis l’administration. Le compte naît à l’inscription ou est créé par la coordination. Une fois le compte existant, attribuez-lui le rôle Formateur, puis rattachez-le au cours dans le builder. Voir « Attribuer un rôle ».',
            },
            {
              question: 'Un certificat a été émis par erreur. Puis-je l’annuler ?',
              answer: 'Vous pouvez le `Révoquer`, mais c’est définitif et public : le titulaire est notifié et le numéro n’est jamais réutilisé. Pour corriger, on réémet un nouveau certificat depuis la Coordination. Voir « Révoquer un certificat ».',
            },
            {
              question: 'Un apprenant dit ne pas avoir reçu son certificat par email.',
              answer: 'Vérifiez le statut du PDF : s’il est « En génération », cliquez sur `Régénérer le PDF` et attendez le prochain cycle de traitements. Vérifiez aussi que le compte n’est pas désactivé et que l’email part (santé, provider). Voir « Comprendre l’émission automatique ».',
            },
            {
              question: 'Comment publier un cours sur le site institutionnel ?',
              answer: 'Il n’y a rien de spécial à faire : dès qu’un cours est Publié avec une version courante, il apparaît sur le site institutionnel comme au catalogue de la plateforme. Les deux lisent la même base. Voir « Publier une version ».',
            },
            {
              question: 'Comment retirer immédiatement l’accès d’une personne ?',
              answer: 'Désactivez son compte : elle ne peut plus se connecter. Attention, une session déjà ouverte peut rester valable jusqu’à 14 jours ; pour la couper tout de suite, l’exploitant doit faire tourner la clé de session (runbook « incident-securite »). Voir « Désactiver ou réactiver un compte ».',
            },
            {
              question: 'La carte « File de jobs » affiche des jobs abandonnés. Que faire ?',
              answer: 'Un job abandonné ne se relance pas depuis l’interface. Lisez sa dernière erreur dans « Derniers jobs » et suivez le runbook « jobs-bloques » avec l’exploitant. Voir « Lire l’état de la file de jobs ».',
            },
            {
              question: 'Comment vérifier que les emails partent bien ?',
              answer: 'Ouvrez /api/health : le champ « provider » doit indiquer « resend » ou « smtp », pas « console ». Repérez ensuite les jobs email.send en échec dans « Derniers jobs ». Voir « Vérifier la santé et diagnostiquer les emails ».',
            },
            {
              question: 'Puis-je exporter le journal d’audit ?',
              answer: 'Non, pas depuis cette page : le journal est en lecture seule, sans export. Il ne montre que les actions de la formation. Voir « Consulter le journal d’audit ».',
            },
            {
              question: 'Comment régler le service d’envoi d’emails ou activer la double authentification obligatoire ?',
              answer: 'Ces réglages ne sont pas dans l’interface : ils se font par variables d’environnement chez l’hébergeur, avec l’exploitant. La page Paramètres ne gère que les réglages métier de la formation. Voir « Régler les paramètres ».',
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
            { term: 'Cours', definition: 'Un module du programme de formation. Il porte une fiche descriptive et des versions.' },
            { term: 'Version figée', definition: 'Une version d’un cours, publiée ou déjà suivie, dont la structure ne se modifie plus. On la duplique pour évoluer.' },
            { term: 'Version courante', definition: 'La version d’un cours que suivent les nouvelles inscriptions et cohortes.' },
            { term: 'Cohorte', definition: 'Un groupe d’apprenants qui suit un cours sur une période donnée, animé par un formateur.' },
            { term: 'Inscription', definition: 'Le lien entre un apprenant et un cours, avec un statut (En cours, Terminée…) et une progression.' },
            { term: 'Banque de questions', definition: 'Le réservoir de questions réutilisables dans les quiz des cours.' },
            { term: 'Modèle de certificat', definition: 'Le gabarit qui définit les textes, le signataire, les critères et la validité d’une attestation ou d’un certificat.' },
            { term: 'Certificat révoqué', definition: 'Un certificat annulé définitivement : la vérification publique le signale et son numéro n’est jamais réattribué.' },
            { term: 'Rôle', definition: 'Un ensemble de droits attribué à un compte. Chaque rôle a une portée (globale, une organisation, un cours, une cohorte).' },
            { term: 'Portée', definition: 'L’étendue d’un rôle : toute la plateforme, ou seulement une organisation, un cours ou une cohorte.' },
            { term: 'MFA (vérification en deux étapes)', definition: 'Un code temporaire à six chiffres demandé en plus du mot de passe, exigé pour les rôles privilégiés.' },
            { term: 'File de jobs (traitements)', definition: 'La liste des tâches exécutées en arrière-plan : emails, PDF, notifications, rappels, expirations.' },
            { term: 'Job abandonné', definition: 'Une tâche dont toutes les tentatives ont échoué ; elle exige l’intervention de l’exploitant.' },
            { term: 'Journal d’audit', definition: 'La trace en lecture seule des actions sensibles de la plateforme, avec l’auteur et l’état avant / après.' },
            { term: 'Runbook', definition: 'Une procédure d’exploitation écrite (dossier docs/runbooks du dépôt), suivie avec l’exploitant en cas d’incident.' },
            { term: 'Exploitant', definition: 'La personne qui gère l’hébergement : variables d’environnement, secrets, planificateur, sauvegardes.' },
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
            ['Vous êtes bloqué (vérification en deux étapes, plus aucun super administrateur actif)', 'Un autre super administrateur, puis l’exploitant', 'Par téléphone ou en personne ; l’exploitant intervient en base en dernier recours (runbook incident-securite).'],
            ['Panne d’email, file de jobs bloquée, santé en erreur, secrets, sauvegardes', 'L’exploitant de l’hébergement', 'Par le canal convenu, avec le runbook concerné et le résultat de /api/health (sans secret).'],
            ['Question sur une cohorte, une demande de formation, un certificat à réémettre', 'La coordination formation', 'Espace Coordination de la plateforme, ou message interne.'],
            ['Demande d’un apprenant (accès, erreur, inscription)', 'Le Support, puis la coordination', 'Ils vous transmettent les cas qui exigent une action d’administration.'],
            ['Décision de gouvernance (nouveau rôle, nouveau cours au programme)', 'Le secrétariat général de la Fédération', 'Demande écrite, conservée avec le motif.'],
            ['Anomalie de l’application, fonction absente', 'L’équipe de développement, via le secrétariat général', 'Décrire l’écran, l’action et le message exact ; toute évolution structurante passe par un ADR du dépôt.'],
          ],
        },
        {
          type: 'links',
          title: 'Coordonnées de la Fédération',
          items: [
            { label: 'Formulaire de contact', href: '{{web}}/contact', description: 'Pour joindre la FETRAG (choisir le type « assistance »).', icon: 'mail', external: true },
            { label: 'Écrire à la Fédération', href: 'mailto:jossngomafm@gmail.com', description: 'Adresse email de contact de la Fédération.', icon: 'send' },
            { label: 'Appeler : 066 23 00 33 ou 077 52 27 98', href: 'tel:+24166230033', description: 'Aux heures de bureau, Libreville.', icon: 'phone' },
            { label: 'Adresse postale', href: '{{web}}/contact', description: 'BP 1234 Libreville, Gabon.', icon: 'map-pin', external: true },
          ],
        },
        {
          type: 'list',
          title: 'Dans un message d’aide, indiquez',
          style: 'bullet',
          items: [
            'L’adresse email de votre compte (jamais votre mot de passe ni vos codes de secours).',
            'L’écran concerné (par exemple « Cours › fiche de … › Versions ») et l’heure approximative.',
            'Le message exact affiché à l’écran.',
            'Ce que vous avez déjà essayé (rechargement, autre navigateur, autre appareil).',
            'Pour un problème d’email ou de traitements : les chiffres des indicateurs de la file de jobs et le « provider » indiqué par /api/health.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Runbooks',
          text: 'Les procédures d’exploitation détaillées sont dans le dossier « docs/runbooks » du dépôt : supervision, jobs-bloques, panne-email, rotation-secrets, incident-securite, restauration-base, revocation-certificat, deploiement. Elles ne contiennent aucun secret et ne doivent jamais en contenir.',
        },
      ],
    },
  ],
  related: [
    { label: 'Guide de l’apprenant', href: '/guide', description: 'Le guide commun à tous les comptes de la plateforme de formation : catalogue, inscriptions, suivi.' },
    { label: 'Guide de la coordination', href: '/coordination/guide', description: 'Demandes de formation, cohortes, sessions, registre des certificats et organisations.' },
    { label: 'Guide du super administrateur du site institutionnel', href: '{{web}}/admin/guide', description: 'Le même rôle sur le site institutionnel : comptes, rôles, paramètres, clés API, menus.', external: true },
  ],
  selfAssessment: {
    intro:
      'Vingt-six questions pour vérifier que vous savez où agir dans l’administration, ce qui est irréversible et à qui vous adresser. Comptez une douzaine de minutes ; le corrigé renvoie à la section du guide.',
    passPercent: 70,
    questions: [
      {
        id: 'q-role-1',
        sectionId: 'votre-role',
        type: 'true-false',
        prompt: 'Vous pouvez créer un nouveau compte pour un formateur depuis l’administration.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'L’administration ne crée pas de compte : ils naissent à l’inscription ou par la coordination. Vous n’attribuez que des rôles. Voir « Votre rôle en bref ».',
      },
      {
        id: 'q-reperer-1',
        sectionId: 'se-reperer',
        type: 'single',
        prompt: 'Sur un smartphone, comment ouvrez-vous la navigation de l’administration ?',
        options: [
          { id: 'a', text: 'Avec le bouton **Ouvrir le menu** (icône à trois traits) de la barre supérieure.', correct: true },
          { id: 'b', text: 'En cliquant sur vos initiales en haut à droite.', correct: false },
          { id: 'c', text: 'La navigation n’est pas disponible sur smartphone.', correct: false },
        ],
        explanation: 'Sur petit écran, la barre latérale devient un tiroir ouvert par le bouton **Ouvrir le menu**. Voir « Se repérer dans l’espace Administration ».',
      },
      {
        id: 'q-cours-1',
        sectionId: 'faire-evoluer-un-cours',
        type: 'single',
        prompt: 'Un cours est déjà suivi et vous devez corriger une leçon. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je modifie directement la version publiée.', correct: false },
          { id: 'b', text: 'Je crée une nouvelle version (`Dupliquer`), je la modifie, puis je la publie.', correct: true },
          { id: 'c', text: 'Je supprime le cours et je le recrée.', correct: false },
        ],
        explanation: 'Une version suivie est figée pour protéger les apprenants : on la duplique pour évoluer. Voir « Faire évoluer un cours déjà suivi ».',
      },
      {
        id: 'q-cours-2',
        sectionId: 'publier-une-version',
        type: 'true-false',
        prompt: 'Une fois un cours publié avec une version courante, il faut lancer une synchronisation pour qu’il apparaisse sur le site institutionnel.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Le catalogue et le site lisent la même base : le cours apparaît aussitôt, sans synchronisation. Voir « Publier une version ».',
      },
      {
        id: 'q-cycle-1',
        sectionId: 'cycle-de-vie-du-cours',
        type: 'single',
        prompt: 'Que signifie « Archiver » un cours ?',
        options: [
          { id: 'a', text: 'Le supprimer définitivement avec ses inscriptions.', correct: false },
          { id: 'b', text: 'Le retirer du catalogue et des demandes, mais garder les données ; c’est réversible.', correct: true },
          { id: 'c', text: 'Le masquer une journée.', correct: false },
        ],
        explanation: 'Archiver retire le cours du catalogue et des demandes mais conserve tout ; on le restaure avec `Restaurer en brouillon`. Voir « Comprendre le cycle de vie d’un cours ».',
      },
      {
        id: 'q-questions-1',
        sectionId: 'gerer-une-question',
        type: 'single',
        prompt: 'Vous modifiez une question déjà répondue par des apprenants. Que se passe-t-il ?',
        options: [
          { id: 'a', text: 'La question est modifiée en place, sans trace.', correct: false },
          { id: 'b', text: 'Une nouvelle version est créée et l’ancienne est désactivée.', correct: true },
          { id: 'c', text: 'La modification est refusée.', correct: false },
        ],
        explanation: 'Pour préserver les réponses déjà données, une nouvelle version est créée et l’ancienne désactivée. Voir « Modifier, dupliquer ou désactiver une question ».',
      },
      {
        id: 'q-certificat-1',
        sectionId: 'revoquer-un-certificat',
        type: 'multiple',
        prompt: 'Que se passe-t-il quand vous révoquez un certificat ?',
        options: [
          { id: 'a', text: 'La vérification publique affiche « révoqué ».', correct: true },
          { id: 'b', text: 'Le titulaire est notifié par email.', correct: true },
          { id: 'c', text: 'Le numéro pourra être réattribué à un autre certificat.', correct: false },
          { id: 'd', text: 'L’action est réversible d’un clic.', correct: false },
        ],
        explanation: 'La révocation est définitive : vérification négative, titulaire notifié, numéro jamais réattribué. Voir « Révoquer un certificat ».',
      },
      {
        id: 'q-certificat-2',
        sectionId: 'emission-automatique',
        type: 'single',
        prompt: 'Un PDF de certificat affiche « En génération ». Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je clique sur `Régénérer le PDF` et j’attends le prochain cycle de traitements.', correct: true },
          { id: 'b', text: 'Je révoque le certificat.', correct: false },
          { id: 'c', text: 'Je recrée le compte de l’apprenant.', correct: false },
        ],
        explanation: 'Le PDF est produit par la file de traitements ; `Régénérer le PDF` relance le job. Voir « Comprendre l’émission automatique ».',
      },
      {
        id: 'q-roles-1',
        sectionId: 'attribuer-un-role',
        type: 'single',
        prompt: 'Vous voulez qu’un formateur n’intervienne que sur une cohorte précise. Que choisissez-vous ?',
        options: [
          { id: 'a', text: 'Rôle Formateur, portée Globale.', correct: false },
          { id: 'b', text: 'Rôle Formateur, portée Une cohorte, puis la cohorte comme cible.', correct: true },
          { id: 'c', text: 'Rôle Coordinateur, portée Globale.', correct: false },
        ],
        explanation: 'Un rôle limité s’attribue avec sa portée et sa cible. Voir « Attribuer un rôle ».',
      },
      {
        id: 'q-comptes-1',
        sectionId: 'desactiver-un-compte',
        type: 'true-false',
        prompt: 'Désactiver un compte coupe instantanément toutes ses sessions déjà ouvertes.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'La désactivation empêche toute nouvelle connexion, mais une session ouverte peut durer jusqu’à 14 jours : il faut faire tourner la clé de session pour la couper. Voir « Désactiver ou réactiver un compte ».',
      },
      {
        id: 'q-jobs-1',
        sectionId: 'lire-la-file',
        type: 'single',
        prompt: 'Un job est au statut « Abandonné ». Comment le relancer ?',
        options: [
          { id: 'a', text: 'Avec `Lancer le traitement des jobs` sur la page Paramètres.', correct: false },
          { id: 'b', text: 'Il ne se relance pas depuis l’interface : je suis le runbook « jobs-bloques » avec l’exploitant.', correct: true },
          { id: 'c', text: 'Il se relance tout seul indéfiniment.', correct: false },
        ],
        explanation: 'Un job abandonné a épuisé ses tentatives ; sa reprise passe par l’exploitant. Voir « Lire l’état de la file de jobs ».',
      },
      {
        id: 'q-sante-1',
        sectionId: 'verifier-la-sante',
        type: 'single',
        prompt: 'Sur /api/health, le champ « provider » de l’email indique « console ». Qu’est-ce que cela signifie ?',
        options: [
          { id: 'a', text: 'Les emails partent normalement.', correct: false },
          { id: 'b', text: 'Aucun email n’est envoyé : le service d’email n’est pas configuré.', correct: true },
          { id: 'c', text: 'La base de données est en panne.', correct: false },
        ],
        explanation: '« console » signifie qu’aucun email ne part ; on attend « resend » ou « smtp » en production. Voir « Vérifier la santé et diagnostiquer les emails ».',
      },
      {
        id: 'q-securite-1',
        sectionId: 'activer-la-verification',
        type: 'single',
        prompt: 'Où activez-vous la vérification en deux étapes exigée pour votre rôle ?',
        options: [
          { id: 'a', text: 'Sur le site institutionnel, dans **Espace** puis **Sécurité**.', correct: true },
          { id: 'b', text: 'Dans l’administration de la plateforme de formation, page Paramètres.', correct: false },
          { id: 'c', text: 'Un autre super administrateur l’active à votre place.', correct: false },
        ],
        explanation: 'L’activation se fait uniquement sur le site institutionnel, dans **Espace** > **Sécurité** ; la plateforme ne fait que vérifier le code. Voir « Activer la vérification en deux étapes ».',
      },
      {
        id: 'q-connexion-1',
        sectionId: 'connexion-et-deconnexion',
        type: 'single',
        prompt: 'Combien de temps le lien de réinitialisation du mot de passe reste-t-il valable ?',
        options: [
          { id: 'a', text: '30 minutes.', correct: true },
          { id: 'b', text: '24 heures.', correct: false },
          { id: 'c', text: 'Indéfiniment, jusqu’à utilisation.', correct: false },
        ],
        explanation: 'Le lien « Mot de passe oublié » envoyé par email est valable 30 minutes. Voir « Se connecter et se déconnecter ».',
      },
      {
        id: 'q-vue-ensemble-1',
        sectionId: 'lire-la-vue-d-ensemble',
        type: 'single',
        prompt: 'Où trouvez-vous les taux de complétion et les rapports détaillés ?',
        options: [
          { id: 'a', text: 'Sur la vue d’ensemble de l’administration.', correct: false },
          { id: 'b', text: 'Dans l’espace **Coordination**, rubrique Rapports.', correct: true },
          { id: 'c', text: 'Dans le journal d’audit.', correct: false },
        ],
        explanation: 'La vue d’ensemble ne montre ni taux de complétion ni revenus : les rapports vivent dans l’espace Coordination. Voir « Lire la vue d’ensemble ».',
      },
      {
        id: 'q-quiz-1',
        sectionId: 'composer-un-quiz',
        type: 'single',
        prompt: 'Quel est le score de réussite proposé par défaut à la création d’une évaluation ?',
        options: [
          { id: 'a', text: '50 %.', correct: false },
          { id: 'b', text: '60 %.', correct: true },
          { id: 'c', text: '80 %.', correct: false },
        ],
        explanation: 'À la création d’une évaluation, le score de réussite est de 60 % par défaut et le nombre de tentatives de 3. Voir « Composer un quiz ».',
      },
      {
        id: 'q-inscriptions-1',
        sectionId: 'gerer-les-inscriptions',
        type: 'single',
        prompt: 'Que se passe-t-il quand vous choisissez `Terminer` sur une inscription ?',
        options: [
          { id: 'a', text: 'La progression passe à 100 % et le certificat est émis si les critères sont remplis.', correct: true },
          { id: 'b', text: 'L’inscription est supprimée définitivement.', correct: false },
          { id: 'c', text: 'L’apprenant est déconnecté de la plateforme.', correct: false },
        ],
        explanation: '`Terminer` met la progression à 100 % et émet le certificat si les critères du modèle sont remplis. Voir « Changer le statut d’une inscription ».',
      },
      {
        id: 'q-parametres-1',
        sectionId: 'lancer-les-traitements',
        type: 'single',
        prompt: 'Combien de jobs au plus sont exécutés quand vous lancez un lot de traitements ?',
        options: [
          { id: 'a', text: '10 jobs au plus.', correct: true },
          { id: 'b', text: 'Tous les jobs de la file, sans limite.', correct: false },
          { id: 'c', text: 'Un seul job.', correct: false },
        ],
        explanation: '`Traiter maintenant` exécute un lot de 10 jobs au plus (emails, PDF, notifications). Voir « Lancer un lot de traitements ».',
      },
      {
        id: 'q-parametres-2',
        sectionId: 'modifier-un-parametre',
        type: 'true-false',
        prompt: 'Le compteur des certificats se modifie depuis la page Paramètres.',
        options: [
          { id: 'a', text: 'Vrai', correct: false },
          { id: 'b', text: 'Faux', correct: true },
        ],
        explanation: 'Le compteur des certificats est géré automatiquement et n’est pas modifiable : la page refuse la modification. Voir « Modifier un paramètre ».',
      },
      {
        id: 'q-audit-1',
        sectionId: 'journal-audit',
        type: 'single',
        prompt: 'Que pouvez-vous faire avec le journal d’audit depuis l’interface ?',
        options: [
          { id: 'a', text: 'Le consulter et le filtrer, mais ni le modifier, ni l’effacer, ni l’exporter.', correct: true },
          { id: 'b', text: 'Le modifier pour corriger une entrée erronée.', correct: false },
          { id: 'c', text: 'L’exporter en CSV depuis cette page.', correct: false },
        ],
        explanation: 'Le journal est en lecture seule : on le consulte et on le filtre, sans le modifier, l’effacer ni l’exporter. Voir « Consulter le journal d’audit ».',
      },
      {
        id: 'q-espaces-1',
        sectionId: 'autres-espaces',
        type: 'single',
        prompt: 'Où se trouvent les procédures détaillées de gestion des cohortes et des demandes de formation ?',
        options: [
          { id: 'a', text: 'Dans ce guide de l’administration.', correct: false },
          { id: 'b', text: 'Dans le guide de la coordination.', correct: true },
          { id: 'c', text: 'Dans le lexique de ce guide.', correct: false },
        ],
        explanation: 'Les procédures de chaque espace vivent dans le guide du rôle correspondant ; les cohortes relèvent du guide de la coordination. Voir « Accéder aux autres espaces ».',
      },
      {
        id: 'q-sensibles-1',
        sectionId: 'operations-sensibles',
        type: 'multiple',
        prompt: 'Parmi ces opérations, lesquelles sont irréversibles ?',
        options: [
          { id: 'a', text: 'Révoquer un certificat.', correct: true },
          { id: 'b', text: 'Supprimer un module, une leçon ou une activité.', correct: true },
          { id: 'c', text: 'Désactiver un compte.', correct: false },
          { id: 'd', text: 'Retirer un rôle.', correct: false },
        ],
        explanation: 'Révoquer un certificat et supprimer un module sont définitifs ; désactiver un compte et retirer un rôle se défont. Voir « Opérations sensibles et irréversibles ».',
      },
      {
        id: 'q-notifications-1',
        sectionId: 'notifications',
        type: 'single',
        prompt: 'Que reçoit une personne quand vous lui attribuez ou retirez un rôle ?',
        options: [
          { id: 'a', text: 'Rien : seul le journal d’audit garde une trace.', correct: true },
          { id: 'b', text: 'Un email détaillant le changement de rôle.', correct: false },
          { id: 'c', text: 'Une notification interne « Rôle modifié ».', correct: false },
        ],
        explanation: 'L’attribution ou le retrait d’un rôle ne déclenche aucun email ni notification : prévenez la personne vous-même si besoin. Voir « Notifications et emails ».',
      },
      {
        id: 'q-bonnes-pratiques-1',
        sectionId: 'bonnes-pratiques',
        type: 'single',
        prompt: 'Combien de super administrateurs actifs le guide recommande-t-il au minimum ?',
        options: [
          { id: 'a', text: 'Un seul suffit.', correct: false },
          { id: 'b', text: 'Toujours au moins deux, chacun avec la vérification en deux étapes.', correct: true },
          { id: 'c', text: 'Au moins cinq.', correct: false },
        ],
        explanation: 'Le guide recommande toujours au moins deux super administrateurs actifs, chacun avec la MFA et ses codes de secours. Voir « Bonnes pratiques et sécurité ».',
      },
      {
        id: 'q-lexique-1',
        sectionId: 'lexique',
        type: 'single',
        prompt: 'D’après le lexique, qu’est-ce qu’une « version figée » ?',
        options: [
          { id: 'a', text: 'Une version d’un cours, publiée ou déjà suivie, dont la structure ne se modifie plus.', correct: true },
          { id: 'b', text: 'La version que suivent toutes les nouvelles inscriptions.', correct: false },
          { id: 'c', text: 'Une version supprimée du cours.', correct: false },
        ],
        explanation: 'Une version figée est publiée ou déjà suivie et ne se modifie plus ; on la duplique pour la faire évoluer. Voir « Lexique ».',
      },
      {
        id: 'q-aide-1',
        sectionId: 'besoin-d-aide',
        type: 'single',
        prompt: 'Dans un message d’aide, que ne devez-vous jamais indiquer ?',
        options: [
          { id: 'a', text: 'L’écran concerné et l’heure approximative.', correct: false },
          { id: 'b', text: 'Votre mot de passe ou vos codes de secours.', correct: true },
          { id: 'c', text: 'Le message exact affiché à l’écran.', correct: false },
        ],
        explanation: 'Indiquez votre email, l’écran et le message exact, mais jamais votre mot de passe ni vos codes de secours. Voir « Besoin d’aide ? ».',
      },
    ],
  },
}
