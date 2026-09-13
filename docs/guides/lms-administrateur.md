# Guide de l’administration de la plateforme

*Cours, questions, certificats, comptes et paramètres*

Plateforme : plateforme de formation formation.fetrag.ga · Rôle : SUPER_ADMIN · Version 1.0 du 2026-09-12 · Lecture : 55 min · 21 sections, 93 étapes.

Version en ligne : https://formation.fetrag.ga/admin/guide

**À qui s'adresse ce guide ?** Ce guide s’adresse aux personnes disposant du rôle « Super administrateur » sur la plateforme de formation : celles qui créent et publient les cours, tiennent la banque de questions, gèrent les modèles de certificats, attribuent les rôles, règlent les paramètres et surveillent la file de traitements et le journal d’audit.

En tant que super administrateur, vous avez accès à tout l’espace Administration de la plateforme de formation. Vous créez les cours et leurs versions figées, tenez la banque de questions et les modèles de certificats, gérez les comptes et les rôles, réglez les paramètres et supervisez la file de traitements, la santé de la plateforme et le journal d’audit. Chacune de vos actions sensibles est journalisée et certaines, comme la révocation d’un certificat, sont irréversibles.

## Avant de commencer

- Un compte sur la plateforme de formation avec le rôle « Super administrateur » en portée globale (attribué par un autre super administrateur).
- Une application d’authentification installée sur votre téléphone (Google Authenticator, Microsoft Authenticator ou FreeOTP) pour la vérification en deux étapes, exigée pour ce rôle.
- Un ordinateur pour les tâches longues (builder d’un cours, paramètres, journal d’audit) ; un smartphone suffit pour les vérifications et les actions rapides.
- L’accès aux runbooks du dossier « docs/runbooks » du dépôt si vous intervenez avec l’exploitant sur l’hébergement.

## Prise en main en cinq minutes

1. Connectez-vous avec votre adresse email et votre mot de passe.
   - Élément : `Se connecter` (page de connexion de la plateforme de formation)
   - Résultat attendu : Si la vérification en deux étapes est exigée, le champ **Code de vérification** apparaît.
2. Activez la vérification en deux étapes si ce n’est pas encore fait.
   - Où : sur le site institutionnel, menu du compte puis **Espace** > **Sécurité**
   - Résultat attendu : Un badge **MFA activée** apparaît sur votre compte dans l’annuaire.
   - Remarque : L’activation se fait uniquement sur le site institutionnel ; elle protège votre accès à l’administration.
3. Ouvrez l’espace Administration.
   - Élément : `Administration` (commutateur d’espaces en haut de page (sur mobile : menu du compte, vos initiales))
   - Résultat attendu : La page **Vue d’ensemble** s’ouvre avec la barre latérale marine « Administration ».
4. Lisez la carte **File de jobs** en haut de la vue d’ensemble.
   - Où : grille d’indicateurs de la vue d’ensemble
   - Résultat attendu : Vous voyez le nombre de jobs à traiter, en échec ou abandonnés.
5. Vérifiez la santé de la plateforme.
   - Où : ouvrez l’adresse /api/health dans un onglet
   - Résultat attendu : La réponse indique `ok:true` quand la base et la configuration sont en ordre.

## Sommaire

1. [Votre rôle en bref](#votre-role)
2. [Avant de commencer : compte, connexion et sécurité](#avant-de-commencer)
3. [Se repérer dans l’espace Administration](#se-reperer)
4. [Lire la vue d’ensemble](#lire-la-vue-d-ensemble)
5. [Gérer les cours du programme](#gerer-les-cours)
6. [Comprendre le cycle de vie d’un cours](#cycle-de-vie-du-cours)
7. [Tenir la banque de questions](#banque-de-questions)
8. [Composer un quiz](#composer-un-quiz)
9. [Gérer les modèles de certificats](#certificats)
10. [Changer le statut d’une inscription](#gerer-les-inscriptions)
11. [Gérer les comptes et les rôles](#utilisateurs-et-roles)
12. [Régler les paramètres et lancer les traitements](#parametres)
13. [Superviser la file de traitements et les emails](#superviser)
14. [Consulter le journal d’audit](#journal-audit)
15. [Accéder aux autres espaces](#autres-espaces)
16. [Opérations sensibles et irréversibles](#operations-sensibles)
17. [Notifications et emails](#notifications)
18. [Bonnes pratiques et sécurité](#bonnes-pratiques)
19. [Questions fréquentes](#questions-frequentes)
20. [Lexique](#lexique)
21. [Besoin d’aide ?](#besoin-d-aide)

## 1. Votre rôle en bref <a id="votre-role"></a>

*Ce que le super administrateur peut faire sur la plateforme de formation, ce qu’il ne peut pas faire, et avec qui il travaille.*

Le super administrateur est le gardien de la plateforme de formation. Il monte les cours, en publie les versions, tient la banque de questions et les modèles de certificats, donne les bons rôles aux bonnes personnes et surveille que tout fonctionne. Chacune de vos actions sensibles est inscrite dans le **Journal d’audit** : une trace qui ne peut être ni modifiée ni effacée depuis l’interface.

Un mot de vocabulaire, une fois pour toutes : la **plateforme** est le site de formation en ligne, le **site institutionnel** est le site public de la Fédération. Un même compte ouvre les deux. Un **cours** est un module du programme ; une **cohorte** est un groupe d’apprenants qui suit un cours sur une période donnée ; la **coordination** anime ces cohortes.

### Ce que le rôle vous permet de faire

- [x] Créer, structurer, publier, retirer et archiver les cours du programme (`Nouveau cours`, `Publier`).
- [x] Créer les versions figées d’un cours et publier la version courante suivie par les nouvelles inscriptions.
- [x] Alimenter la **Banque de questions** (créer, importer par fichier CSV, dupliquer, désactiver) et composer les quiz.
- [x] Créer et gérer les **Modèles de certificats**, définir le modèle par défaut, révoquer un certificat émis.
- [x] Attribuer et retirer tous les rôles, avec leur portée, et désactiver ou réactiver un compte.
- [x] Modifier les **Paramètres** de la formation et lancer un lot de traitements de la file de jobs.
- [x] Consulter le **Journal d’audit** de la plateforme et accéder à tous les autres espaces.

### Ce que l’interface ne permet pas

- Créer un compte depuis l’administration : les comptes naissent à l’inscription, par les demandes de formation ou par la coordination.
- Supprimer définitivement un compte, ni supprimer un cours : seules la désactivation d’un compte et l’archivage d’un cours existent.
- Réinitialiser la vérification en deux étapes d’une personne : elle la désactive elle-même depuis le site institutionnel.
- Modifier la structure d’une version de cours déjà publiée ou déjà suivie : il faut créer une nouvelle version.
- Régler les fournisseurs (email, stockage, paiement) et les fonctionnalités techniques : ils se règlent dans l’environnement d’hébergement, pas dans l’administration.
- Retirer votre propre rôle de super administrateur ou désactiver votre propre compte.

*Avec qui vous travaillez*

| Rôle | Ce qu’il fait | Ce que vous faites pour lui |
| --- | --- | --- |
| Coordination formation | Demandes de formation, cohortes, sessions, registre des certificats, organisations, rapports. | Attribuer le rôle Coordinateur ; publier les cours qu’elle planifie. |
| Formateur | Anime une ou plusieurs cohortes, corrige, alimente la banque de questions. | Attribuer le rôle Formateur puis le rattacher au cours (onglet **Formateurs**). |
| Responsable d’organisation | Dépose les demandes de formation de son organisation. | Attribuer le rôle sur son organisation si besoin. |
| Apprenant | Suit les formations, passe les quiz, reçoit les certificats. | Rien : le compte naît de son inscription ; vous n’intervenez qu’en cas de problème. |
| Exploitant (hébergement) | Variables d’environnement, secrets, planificateur (cron), sauvegardes. | Lui transmettre les constats de santé et de file de jobs ; ne jamais lui envoyer un secret par message. |

## 2. Avant de commencer : compte, connexion et sécurité <a id="avant-de-commencer"></a>

*Se connecter, activer la vérification en deux étapes exigée pour ce rôle, se déconnecter.*

Votre compte est le même sur le site institutionnel et sur la plateforme de formation. Le rôle de super administrateur fait partie des rôles privilégiés qui doivent protéger leur compte par une **vérification en deux étapes** (aussi appelée MFA) : en plus du mot de passe, un code à six chiffres généré par une application sur votre téléphone.

> **Quand la vérification est-elle bloquante ?** : Selon le réglage du déploiement, l’accès à l’administration peut être refusé tant que la vérification n’est pas active : la page **Vérification en deux étapes** s’affiche alors. Activez-la dès votre première connexion, sans attendre ce blocage.

### Activer la vérification en deux étapes <a id="activer-la-verification"></a>

L’activation se fait uniquement sur le **site institutionnel**, dans votre espace personnel. La plateforme de formation, elle, ne fait que vérifier le code au moment de la connexion.

1. Installez une application d’authentification sur votre téléphone.
   - Remarque : Par exemple Google Authenticator, Microsoft Authenticator ou FreeOTP. Une seule suffit.
2. Sur le site institutionnel, ouvrez **Espace** puis **Sécurité**.
   - Où : menu du compte (vos initiales), en haut à droite
   - Résultat attendu : La page de sécurité affiche un code à scanner (QR code).
3. Scannez le code avec votre application, puis saisissez le code à six chiffres qu’elle affiche.
   - Résultat attendu : La vérification est activée.
4. Notez et rangez en lieu sûr les codes de secours affichés une seule fois.
   - Remarque : Ces codes vous dépannent si vous perdez votre téléphone. Ne les enregistrez jamais dans un message.
5. Reconnectez-vous à la plateforme de formation : après le mot de passe, saisissez le **Code de vérification**.
   - Résultat attendu : Votre compte affiche le badge **MFA activée** dans l’annuaire des utilisateurs.

> **En cas de perte de votre téléphone** : Personne dans l’administration ne peut réinitialiser votre vérification : il n’existe pas de bouton pour cela. Utilisez un code de secours pour vous connecter, puis réactivez la vérification. Sans code de secours, seule une intervention en base de données par l’exploitant peut vous dépanner (runbook « incident-securite »).

- **La page **Vérification en deux étapes** s’affiche et propose `Continuer sans activer pour le moment`.** (cause probable : Le déploiement exige la vérification pour les rôles privilégiés et votre compte ne l’a pas encore activée.) : Cliquez sur le bouton bleu d’activation de la vérification (il ouvre votre espace de sécurité sur le site institutionnel), activez-la, puis revenez.

### Se connecter et se déconnecter <a id="connexion-et-deconnexion"></a>

1. Saisissez votre adresse email et votre mot de passe sur la page de connexion, puis le code de vérification si demandé.
   - Élément : `Se connecter`
   - Résultat attendu : Votre tableau de bord d’apprenant s’ouvre.
2. Passez dans l’administration avec le commutateur d’espaces.
   - Élément : `Administration` (en haut de page (sur mobile : menu du compte, vos initiales))
3. Pour quitter, ouvrez le menu du compte et cliquez sur `Déconnexion`.
   - Où : vos initiales, en haut à droite
   - Résultat attendu : Vous revenez à la page de connexion.

> **Mot de passe oublié** : Utilisez le lien « Mot de passe oublié » de la page de connexion. Un email de réinitialisation vous est envoyé ; le lien est valable 30 minutes.

## 3. Se repérer dans l’espace Administration <a id="se-reperer"></a>

*L’accueil de l’administration et sa navigation, sur ordinateur et sur smartphone.*

### Écran : La page « Vue d’ensemble » de l’administration

Ce que vous voyez après avoir ouvert l’espace Administration.

- **Barre latérale « Administration » (à gauche)** : La navigation : Vue d’ensemble, Cours, Banque de questions, Modèles de certificats, Utilisateurs et rôles, Paramètres, Journal d’audit.
- **Barre supérieure de l’espace** : Le titre « Administration » et le commutateur d’espaces (Apprenant, Organisation, Formateur, Coordination, Administration).
- **Grille d’indicateurs** : Cours publiés, versions, questions actives, modèles ; puis les cartes Utilisateurs, Inscriptions et File de jobs.
- **Section « Accès rapides »** : Des cartes pour ouvrir chaque rubrique d’un clic.
- **Sections « Cours récemment modifiés » et « Dernières actions journalisées »** : Les six derniers cours modifiés et les huit dernières actions du journal.

### Écran : La barre globale de la plateforme (au-dessus)

Commune à toutes les pages, elle sert à naviguer et à ouvrir votre compte.

- **Liens du haut** : Catalogue, Tableau de bord, Mes formations, Calendrier, Certificats, et un lien vers le site institutionnel.
- **Avatar avec vos initiales (en haut à droite)** : Ouvre le menu du compte : accès aux espaces selon vos droits, profil, sécurité, et bouton `Déconnexion`.

> **Sur smartphone** : Sous une certaine largeur, la barre latérale devient un tiroir : ouvrez-la avec le bouton **Ouvrir le menu** (icône à trois traits) de la barre supérieure, et refermez-la avec **Fermer le menu**. Le commutateur d’espaces est masqué sur petit écran : pour changer d’espace, passez par le menu du compte (avatar). Les tableaux défilent horizontalement dans leur cadre.

Chemin : Commutateur d’espaces › Administration › Vue d’ensemble (`/admin`)

## 4. Lire la vue d’ensemble <a id="lire-la-vue-d-ensemble"></a>

*Comprendre les indicateurs de l’accueil et savoir où aller.*

La vue d’ensemble résume l’état de la plateforme. Prenez l’habitude de la lire en arrivant : elle vous dit s’il y a des cours en attente de relecture, des jobs en échec ou des certificats à surveiller.

1. Regardez la grille d’indicateurs en haut.
   - Résultat attendu : Vous voyez le nombre de cours publiés, de versions figées, de questions actives et de modèles de certificats.
2. Lisez la carte **File de jobs**.
   - Résultat attendu : Elle indique les jobs à traiter, en échec et, en badge rouge, ceux abandonnés ; ou « Indisponible » si la file ne répond pas.
   - Remarque : Un badge rouge « abandonné(s) » demande une intervention : voir « Superviser la file de traitements ».
3. Utilisez les cartes d’**Accès rapides** pour ouvrir une rubrique.
   - Où : section 01 de la page
   - Résultat attendu : La rubrique choisie s’ouvre (Cours, Banque de questions, Certificats, etc.).
4. Parcourez les **Dernières actions journalisées**.
   - Résultat attendu : Les huit dernières actions apparaissent ; cliquez sur `Journal complet` pour tout voir.

> **Ce que la vue d’ensemble n’affiche pas** : Elle ne montre ni taux de complétion ni revenus. Les rapports et exports détaillés vivent dans l’espace **Coordination**, rubrique Rapports.

## 5. Gérer les cours du programme <a id="gerer-les-cours"></a>

*Créer un cours, le structurer, publier une version, le rendre visible, le faire évoluer.*

Un cours porte des **versions figées**. La version courante est celle que suivent les nouvelles inscriptions. Publier un cours le rend visible dans le catalogue de la plateforme et sur le site institutionnel : les deux lisent la même base, il n’y a aucune synchronisation à lancer à la main.

> **Version figée : pourquoi** : Une fois publiée ou suivie par au moins une inscription, une version ne se modifie plus. Cela protège les apprenants en cours : leur formation ne change pas sous leurs pieds. Pour faire évoluer le contenu, on crée une nouvelle version.

### Créer un cours <a id="creer-un-cours"></a>

1. Ouvrez **Cours** dans la barre latérale, puis cliquez sur `Nouveau cours`.
   - Où : en haut à droite de la liste des cours
   - Résultat attendu : Le formulaire de création s’ouvre en quatre sections numérotées.
2. Renseignez la section **Identité du module** : le titre (obligatoire, 3 à 200 caractères) et le code.
   - Remarque : Le code est obligatoire (2 à 24 caractères, lettres, chiffres et tirets) et unique. Il est mis en majuscules automatiquement, par exemple FETRAG-M03.
3. Complétez la **Pédagogie** : objectifs (un par ligne), prérequis, public, modalité et niveau.
   - Remarque : La durée en heures est obligatoire (entier de 1 à 500, 12 par défaut).
4. Réglez l’**Accès et la tarification** : politique d’inscription et gratuité.
   - Remarque : Si vous décochez « Formation gratuite », saisissez le tarif standard et le tarif membre en FCFA (entiers positifs).
5. Cochez les **Formateurs du cours** si des comptes formateurs existent.
   - Remarque : Le premier coché devient le référent. Si aucun compte formateur n’existe, attribuez d’abord le rôle Formateur depuis Utilisateurs et rôles.
6. Cliquez sur `Créer le cours`.
   - Où : en bas du formulaire
   - Résultat attendu : Un message « Cours créé (version 1 en brouillon) » apparaît et vous êtes redirigé vers le builder du cours.

> **Créé en brouillon** : Un cours créé est en **Brouillon** avec sa version 1 « Version initiale » : il est invisible au catalogue tant que vous ne l’avez pas publié. Rien n’est encore vu par le public.

- **Le message « Le code FETRAG-M03 est déjà utilisé » s’affiche.** (cause probable : Un autre cours porte déjà ce code : il doit être unique.) : Choisissez un code différent, puis recliquez sur `Créer le cours`.
- **Le message « Code invalide (lettres, chiffres, tirets) » apparaît.** (cause probable : Le code contient un caractère interdit (espace, accent, symbole).) : N’utilisez que des lettres, des chiffres et des tirets.

### Structurer la version du cours <a id="structurer-un-cours"></a>

La structure se construit dans l’onglet **Structure** du builder : des **modules** qui contiennent des **leçons**, qui contiennent des **activités** (contenu, vidéo, quiz, devoir, séance en direct…). Vous ne pouvez structurer qu’une version non figée.

1. Dans le builder, restez sur l’onglet `Structure`.
   - Résultat attendu : La version affichée et son résumé (modules, leçons, activités) apparaissent.
2. Cliquez sur `Ajouter un module`, saisissez son titre, puis `Ajouter`.
   - Résultat attendu : Le module apparaît, numéroté (01, 02…).
3. Dans le module, cliquez sur `Leçon` pour ajouter une leçon (titre obligatoire).
   - Résultat attendu : La leçon s’ajoute sous le module.
4. Dans la leçon, cliquez sur `Activité`, choisissez le **Type d’activité**, saisissez le titre et le contenu.
   - Remarque : Le type d’activité ne peut plus être changé après création. Les URL sont obligatoires pour les activités Vidéo, Audio, Lien, Présentation et Module SCORM.
5. Réordonnez si besoin avec les boutons `Monter` et `Descendre`.
   - Résultat attendu : Un message « Ordre mis à jour » confirme.
   - Remarque : Le réordonnancement se fait par flèches, pas par glisser-déposer : c’est plus simple sur smartphone.

> **Suppressions dans la structure** : Supprimer un module supprime ses leçons et activités ; supprimer une activité perd ses tentatives et remises. Ces suppressions sont définitives : une boîte de confirmation vous le rappelle.

### Publier une version et rendre le cours visible <a id="publier-une-version"></a>

1. Ouvrez l’onglet `Versions` du builder.
   - Résultat attendu : La liste des versions s’affiche avec leurs badges (Courante, Publiée, Brouillon).
2. Sur la version 1, cliquez sur `Publier`.
   - Résultat attendu : La boîte « Publier la version 1 » s’ouvre.
3. Confirmez avec `Publier`.
   - Résultat attendu : La version est figée, devient la version courante et, si le cours était en Brouillon ou En relecture, il passe à **Publié**.
   - Remarque : Une version ne peut être publiée que si elle contient au moins un module, une leçon et une activité.
4. Vérifiez la fiche publique avec `Voir au catalogue` (en-tête) ou l’onglet **Prévisualisation**.
   - Résultat attendu : La fiche s’ouvre dans un nouvel onglet à l’adresse publique du cours.

> **Visible partout, sans manœuvre** : Un cours Publié avec une version courante apparaît aussitôt dans le catalogue de la plateforme et sur la page Formations du site institutionnel. Aucune notification n’est envoyée à la publication.

- **Le message « Publiez une version du cours avant de rendre le cours visible » apparaît.** (cause probable : Vous avez cliqué sur `Publier` au niveau du cours alors qu’aucune version n’est courante.) : Publiez d’abord une version depuis l’onglet **Versions**, puis publiez le cours.
- **Le bouton `Publier` de la version est refusé.** (cause probable : La version est vide ou incomplète.) : Ajoutez au moins un module, une leçon et une activité, puis réessayez.

### Faire évoluer un cours déjà suivi <a id="faire-evoluer-un-cours"></a>

Dès qu’une version est publiée ou suivie, elle affiche « en lecture seule » et le badge **Suivie**. Pour la faire évoluer, on la duplique dans une nouvelle version brouillon.

1. Dans l’onglet **Structure** ou **Versions**, cliquez sur `Créer une nouvelle version` ou `Dupliquer`.
   - Résultat attendu : La boîte de duplication s’ouvre.
2. Renseignez le libellé, le journal des modifications et les règles d’achèvement, puis `Dupliquer`.
   - Résultat attendu : Une version brouillon « Copie de la version N » est créée avec toute la structure copiée.
3. Modifiez la nouvelle version (structure, quiz, règles) à votre rythme.
   - Remarque : Les apprenants en cours ne voient rien changer : ils gardent leur version.
4. Cliquez sur `Comparer` pour relire les journaux de modifications des différentes versions.
   - Résultat attendu : Une carte par version montre ce qui a changé.
5. Publiez la nouvelle version quand elle est prête.
   - Résultat attendu : Elle devient courante pour les nouvelles inscriptions ; les cohortes déjà lancées conservent leur version.
6. Supprimez un brouillon devenu inutile avec `Supprimer`.
   - Remarque : Impossible pour la version courante ou une version suivie, et seulement s’il reste plus d’une version.

> **Séances en direct** : Les séances en direct (dates, liens de visioconférence, replay) restent modifiables même sur une version figée. Seule la structure pédagogique est verrouillée.

## 6. Comprendre le cycle de vie d’un cours <a id="cycle-de-vie-du-cours"></a>

*Les statuts d’un cours et les transitions possibles entre eux.*

Un cours passe par plusieurs statuts. Vous les changez depuis la liste des cours ou depuis l’en-tête du builder.

### Statuts d’un cours

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Brouillon | Cours en préparation, invisible au catalogue et sur le site. | Le structurer, puis `Soumettre à relecture` ou `Publier`. |
| En relecture | Cours soumis à relecture, toujours invisible. | Le relire, puis `Publier`. |
| Publié | Cours visible au catalogue et sur le site, s’il a une version courante. | `Retirer du catalogue` pour le repasser en brouillon si nécessaire. |
| Archivé | Cours retiré du catalogue et des demandes de formation ; les inscriptions existantes sont conservées. | `Restaurer en brouillon` pour le reprendre. |

> **Archiver n’est pas supprimer** : L’interface ne permet pas de supprimer un cours. `Archiver` le retire du catalogue et des demandes, mais conserve tout. C’est réversible avec `Restaurer en brouillon`.

> **Retirer du catalogue** : `Retirer du catalogue` repasse un cours publié en Brouillon : il disparaît du catalogue et du site, mais les inscriptions en cours sont conservées.

## 7. Tenir la banque de questions <a id="banque-de-questions"></a>

*Créer, importer, dupliquer et gérer les questions réutilisables dans les quiz.*

La banque rassemble des questions réutilisables dans les quiz des cours. Chaque question est **versionnée** : si vous modifiez une question déjà répondue par un apprenant, une nouvelle version est créée et l’ancienne est désactivée. Les quiz sans aucune tentative suivent automatiquement la nouvelle version.

### Créer une question <a id="creer-une-question"></a>

1. Ouvrez **Banque de questions** dans la barre latérale, puis `Nouvelle question`.
   - Résultat attendu : L’éditeur de question s’ouvre.
2. Choisissez le **Type** (obligatoire) : Choix unique, Choix multiples, Vrai / Faux, Texte à trous, Appariement, Classement, Réponse courte ou Composition.
   - Remarque : Le type détermine les champs à remplir en dessous.
3. Rédigez l’**Énoncé** (obligatoire, 3 à 5000 caractères) et les options ou la configuration attendue.
   - Remarque : Choix unique : exactement une bonne réponse. Choix multiples : au moins une. Jusqu’à 30 options.
4. Réglez les **Points** (1 à 100), la **Difficulté** (1 à 5), la **Catégorie** et les **Étiquettes**.
   - Remarque : Jusqu’à 20 étiquettes de 40 caractères, séparées par des virgules.
5. Cliquez sur `Ajouter à la banque`.
   - Résultat attendu : Un message « Question ajoutée à la banque » apparaît et vous êtes redirigé vers sa fiche.

- **Un message « Exactement une option correcte » ou « Au moins une option correcte » bloque l’enregistrement.** (cause probable : Le nombre de bonnes réponses ne correspond pas au type de question.) : Cochez le bon nombre de réponses correctes selon le type, puis réessayez.

### Importer des questions par fichier CSV <a id="importer-des-questions"></a>

Un fichier CSV (des lignes séparées par des points-virgules) permet d’ajouter beaucoup de questions d’un coup. Le format d’une ligne est : type;énoncé;points;catégorie;options (séparées par des barres verticales);correctes (les numéros).

1. Sur la liste des questions, cliquez sur `Importer (CSV)`.
   - Résultat attendu : La boîte « Importer des questions » s’ouvre avec un exemple pré-rempli.
2. Collez vos lignes dans le champ **Contenu CSV** (obligatoire).
   - Remarque : Jusqu’à 500 questions par lot. Une première ligne commençant par « type » est ignorée comme en-tête.
3. Cliquez sur `Importer`.
   - Résultat attendu : Un message indique le nombre de questions importées et de lignes rejetées.
4. Lisez le résumé **Éléments non traités** pour corriger les lignes en erreur.
   - Résultat attendu : Chaque ligne rejetée est listée avec sa raison.

- **Le message « Import limité à 500 questions par lot » apparaît.** (cause probable : Le fichier contient trop de lignes.) : Coupez le fichier en plusieurs lots de 500 lignes maximum.
- **Le message « Aucune ligne exploitable dans le contenu collé » apparaît.** (cause probable : Le format des colonnes n’est pas respecté.) : Vérifiez l’ordre : type;question;points;catégorie;options;correctes, séparés par des points-virgules.

### Modifier, dupliquer ou désactiver une question <a id="gerer-une-question"></a>

1. Ouvrez une question depuis la liste, puis cliquez sur `Modifier`.
   - Résultat attendu : L’éditeur s’ouvre avec les valeurs actuelles.
2. Enregistrez avec `Enregistrer`.
   - Résultat attendu : Si la question n’a jamais été répondue, elle est modifiée en place. Sinon, une nouvelle version est créée et l’ancienne désactivée.
   - Remarque : Le message « Nouvelle version de la question créée » vous prévient dans ce second cas.
3. Pour réutiliser une question comme base, cliquez sur `Dupliquer`.
   - Résultat attendu : Une copie « (copie) » active est créée.
4. Pour retirer une question, cliquez sur la corbeille.
   - Résultat attendu : Si la question est utilisée dans un quiz ou a des réponses, elle est désactivée ; sinon elle est supprimée définitivement.

#### Statuts d’une question

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Active | Question proposée dans les quiz. | Rien à faire. |
| Inactive | Question retirée des quiz mais conservée. | La réactiver via la case « Question active » en modification, ou la retrouver avec « Inclure les inactives ». |

> **Question déjà répondue** : On ne peut pas modifier les questions d’un quiz qui a déjà des tentatives : il faut passer par une nouvelle version du cours. La banque protège ainsi les résultats déjà enregistrés.

## 8. Composer un quiz <a id="composer-un-quiz"></a>

*Ajouter des questions à une activité d’évaluation depuis la banque ou en création rapide.*

Un quiz est une activité de type Évaluation (ou Questionnaire). Vous le composez depuis le builder du cours, dans l’onglet **Quiz** de l’activité.

1. Créez ou ouvrez une activité de type Évaluation, puis ouvrez l’onglet `Quiz`.
   - Remarque : Réglez d’abord le temps limite, le nombre de tentatives (3 par défaut), le score de réussite (60 % par défaut) et enregistrez.
2. Rouvrez l’activité et cliquez sur `Depuis la banque`.
   - Résultat attendu : La liste des questions actives non déjà présentes s’affiche.
3. Recherchez par mot-clé, type ou catégorie, cochez les questions, puis `Ajouter`.
   - Résultat attendu : Un message « N question(s) ajoutée(s) : barème P point(s) » confirme.
4. Ou cliquez sur `Création rapide` pour créer une question à la volée.
   - Remarque : La question est aussi enregistrée dans la banque, réutilisable ailleurs.
5. Réordonnez avec `Monter la question` et `Descendre la question`, ou retirez avec `Retirer la question du quiz`.
   - Résultat attendu : Le barème affiché est la somme des points des questions.

- **Le message « Ce quiz a déjà des tentatives » empêche de modifier les questions.** (cause probable : Un apprenant a déjà passé ce quiz.) : Créez une nouvelle version du cours pour modifier ses questions.
- **Le bouton pour composer le quiz n’apparaît pas.** (cause probable : L’activité n’est pas encore enregistrée.) : Enregistrez l’activité une première fois, puis rouvrez-la pour composer le quiz.

## 9. Gérer les modèles de certificats <a id="certificats"></a>

*Créer un modèle, définir le modèle par défaut, comprendre l’émission automatique, régénérer un PDF.*

Un **modèle** définit les textes imprimés, le signataire, les critères d’éligibilité (score, assiduité, formation terminée) et la validité d’une attestation ou d’un certificat. Le **modèle par défaut** s’applique aux cours qui n’ont pas de modèle dédié.

### Créer un modèle de certificat <a id="creer-un-modele"></a>

1. Ouvrez **Modèles de certificats**, puis cliquez sur `Nouveau modèle`.
   - Résultat attendu : Le formulaire s’ouvre, avec un aperçu de la mise en page par défaut.
2. Saisissez le nom (obligatoire), choisissez la nature (Attestation ou Certificat) et le cours concerné.
   - Remarque : Cours vide = modèle générique, applicable à tous les cours sans modèle dédié.
3. Renseignez le titre imprimé, la mention, le signataire et sa qualité (tous obligatoires).
4. Réglez les critères d’éligibilité : score minimal (60 % par défaut), assiduité minimale, formation terminée requise.
   - Remarque : La validité en mois est facultative : vide = sans expiration.
5. Cochez « Modèle par défaut » si ce modèle doit servir aux cours sans modèle dédié, puis `Créer le modèle`.
   - Résultat attendu : Un message « Modèle de certificat créé » apparaît.
   - Remarque : Cocher « par défaut » retire automatiquement ce statut des autres modèles : il n’y en a qu’un.

> **Sans modèle par défaut, pas de certificat générique** : S’il n’existe aucun modèle par défaut, seuls les cours disposant d’un modèle dédié peuvent délivrer un certificat. Créez au moins un modèle par défaut pour permettre l’émission à la clôture des cohortes.

### Comprendre l’émission automatique <a id="emission-automatique"></a>

Vous ne « fabriquez » pas un certificat à la main depuis l’administration : il est émis automatiquement quand une inscription est achevée et que les critères du modèle sont remplis. L’émission manuelle et l’émission pour toute une cohorte se font depuis l’espace Coordination.

#### Statuts d’un certificat et de son PDF

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Valide | Certificat émis et non révoqué. | Rien à faire. |
| Révoqué | Certificat annulé définitivement ; la vérification publique est négative. | Pour corriger, réémettre depuis la Coordination (nouveau numéro). |
| Expiré | La validité en mois du certificat est dépassée. | Réémettre si nécessaire. |
| En génération | Le PDF n’est pas encore produit par la file de traitements. | Attendre le prochain cycle, ou `Régénérer le PDF`. |
| Disponible | Le PDF est prêt dans le stockage privé. | Le titulaire peut le télécharger. |

1. Si un PDF manque (« En génération ») ou après avoir modifié un modèle, cliquez sur `Régénérer le PDF`.
   - Où : section « Derniers certificats émis » ou fiche du modèle
   - Résultat attendu : Un message « Régénération du PDF planifiée » apparaît.
2. Attendez le prochain cycle de traitements, ou lancez-le depuis Paramètres.
   - Résultat attendu : Le PDF passe à « Disponible » une fois le job exécuté (5 minutes au plus).

### Révoquer un certificat <a id="revoquer-un-certificat"></a>

> **Action définitive et publique** : Révoquer un certificat est irréversible. La vérification publique sur le site affichera « révoqué », le titulaire est notifié par email et le numéro n’est jamais réattribué. Pour corriger une simple erreur, on ne « dé-révoque » pas : on réémet un nouveau certificat depuis la Coordination.

1. Depuis **Modèles de certificats** ou la fiche d’un compte, cliquez sur `Révoquer` sur un certificat Valide.
   - Résultat attendu : La boîte de révocation s’ouvre en rouge.
2. Saisissez le **Motif de révocation** (obligatoire, 3 à 500 caractères).
   - Remarque : Par exemple : erreur d’identité, fraude constatée, décision de la commission.
3. Cliquez sur `Révoquer`.
   - Résultat attendu : Le certificat passe à Révoqué, le titulaire reçoit un email « Certificat révoqué », et l’action est journalisée.

> **Suivez le runbook** : Une révocation se prépare : constituer le dossier, respecter le contradictoire, envoyer un courrier officiel. La procédure est décrite dans le runbook « revocation-certificat » du dépôt.

## 10. Changer le statut d’une inscription <a id="gerer-les-inscriptions"></a>

*Activer, terminer, suspendre ou annuler une inscription depuis le builder d’un cours.*

Depuis l’onglet **Inscriptions** du builder d’un cours, vous pouvez faire évoluer une inscription. Les transitions proposées dépendent du statut actuel.

1. Ouvrez le builder du cours, puis l’onglet `Inscriptions`.
   - Résultat attendu : La liste des inscrits s’affiche avec leur progression et leur statut.
2. Filtrez par nom, email ou statut pour trouver l’inscription.
   - Résultat attendu : La liste se réduit aux inscriptions correspondantes.
3. Choisissez l’action proposée : `Activer`, `Terminer`, `Suspendre` ou `Annuler`.
   - Remarque : Un motif est obligatoire pour Terminer, Suspendre et Annuler.
4. Confirmez dans la boîte de dialogue.
   - Résultat attendu : Le statut change, l’apprenant reçoit une notification, et l’action est historisée.
   - Remarque : Terminer met la progression à 100 % et émet le certificat si les critères sont remplis.

### Statuts d’une inscription

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| En attente | Inscription à valider. | `Activer` ou `Annuler`. |
| En cours | Inscription active. | `Suspendre`, `Annuler` ou `Terminer`. |
| Terminée | Formation achevée, progression 100 %. | Aucune transition. |
| Suspendue | Accès au contenu temporairement retiré. | `Activer` ou `Annuler`. |
| Annulée | Inscription annulée, progression conservée. | `Activer` pour la réactiver. |
| Expirée | Inscription échue, passée automatiquement par le système. | `Activer` pour la reprendre. |

> **Qui peut le faire** : Ce travail relève surtout de la coordination et du formateur de la cohorte. En tant que super administrateur, vous le pouvez aussi, mais les procédures détaillées d’inscription vivent dans le guide de la coordination.

## 11. Gérer les comptes et les rôles <a id="utilisateurs-et-roles"></a>

*Trouver un compte, attribuer et retirer un rôle avec sa portée, désactiver un compte.*

Chaque compte porte des rôles avec une **portée** : globale (toute la plateforme), une organisation, un cours ou une cohorte. Les rôles privilégiés exigent la double authentification. Toute attribution ou tout retrait est journalisé avec son auteur.

> **On ne crée pas de compte ici** : L’administration ne crée pas de compte : ils naissent à l’inscription, par les demandes de formation ou par la coordination. Vous n’attribuez que des rôles à des comptes existants.

### Attribuer un rôle <a id="attribuer-un-role"></a>

1. Ouvrez **Utilisateurs et rôles**, cherchez le compte par nom ou email, puis `Ouvrir`.
   - Résultat attendu : La fiche du compte s’affiche avec ses rôles actuels.
2. Dans « Attribuer un rôle », choisissez le **Rôle**.
   - Remarque : Neuf rôles existent, de Apprenant à Super administrateur.
3. Choisissez la **Portée** : Globale, Une organisation, Un cours ou Une cohorte.
   - Remarque : Hors « Globale », la cible est obligatoire : choisissez l’organisation, le cours ou la cohorte.
4. Ajoutez une **Expiration** si le rôle est temporaire (facultatif), puis `Attribuer`.
   - Résultat attendu : Un message « Rôle attribué » apparaît ; les droits s’appliquent dès la page suivante.
   - Remarque : Si le même rôle et la même portée existent déjà, seule l’expiration est mise à jour.

> **Rendre quelqu’un formateur d’un cours** : Attribuer le rôle Formateur ne suffit pas : rattachez ensuite le compte au cours dans le builder (onglet **Formateurs**, `Ajouter un formateur`, `Désigner référent`).

- **Le message « Portée requise » ou « La portée indiquée est introuvable » apparaît.** (cause probable : Vous avez choisi une portée non globale sans cible, ou une cible inexistante.) : Sélectionnez une cible valide dans la liste **Cible de la portée**.

### Retirer un rôle <a id="retirer-un-role"></a>

1. Sur la fiche du compte, repérez la ligne du rôle à retirer.
   - Où : section « Rôles et portées »
2. Cliquez sur `Retirer`, puis confirmez.
   - Résultat attendu : Le rôle disparaît, les droits sont retirés immédiatement, et l’action est journalisée.

> **Deux garde-fous** : Vous ne pouvez pas retirer votre propre rôle de super administrateur (le bouton est masqué et le serveur refuse). Personne n’est prévenu par email d’un retrait : prévenez la personne vous-même si nécessaire.

### Désactiver ou réactiver un compte <a id="desactiver-un-compte"></a>

1. Sur la fiche du compte, cliquez sur `Désactiver` en haut, puis confirmez.
   - Résultat attendu : La personne ne peut plus se connecter ; ses données sont conservées.
   - Remarque : Aucun email ni notification ne lui est plus adressé tant que le compte est désactivé.
2. Pour revenir en arrière, cliquez sur `Réactiver`.
   - Résultat attendu : Le compte redevient utilisable.

> **Les sessions ouvertes** : La désactivation empêche toute nouvelle connexion, mais une session déjà ouverte peut rester valable jusqu’à 14 jours. Pour couper immédiatement toutes les sessions, il faut faire tourner la clé de session (runbook « incident-securite », par l’exploitant). Vous ne pouvez pas désactiver votre propre compte.

## 12. Régler les paramètres et lancer les traitements <a id="parametres"></a>

*Modifier un paramètre de la formation et forcer un lot de traitements de la file de jobs.*

La page **Paramètres** regroupe les réglages métier de la formation (limite de participants, correction des quiz, message d’accueil, compteur des certificats) et l’état de la file de jobs. Chaque modification est journalisée.

### Modifier un paramètre <a id="modifier-un-parametre"></a>

1. Ouvrez **Paramètres**, section « Paramètres de la formation ».
   - Résultat attendu : La liste des paramètres gérés s’affiche.
2. Cliquez sur `Modifier` sur la ligne voulue.
   - Résultat attendu : La boîte du paramètre s’ouvre.
3. Saisissez la valeur (nombre, oui/non ou texte) et une description, puis `Enregistrer`.
   - Résultat attendu : Un message « Paramètre enregistré » apparaît ; l’effet est immédiat.
   - Remarque : La limite de participants attend un entier de 1 à 500 ; le crédit partiel attend true ou false ; le message d’accueil, 2000 caractères au plus.

> **Ce qui ne se règle pas ici** : Le compteur des certificats est automatique et non modifiable. Les fournisseurs (email, stockage, paiement) et la double authentification obligatoire se règlent par variables d’environnement chez l’hébergeur, pas dans cette page.

- **Le message « Le compteur des certificats est géré automatiquement » apparaît.** (cause probable : Vous tentez de modifier une valeur en lecture seule.) : Ce paramètre n’est pas modifiable : c’est normal, aucune action n’est requise.

### Lancer un lot de traitements <a id="lancer-les-traitements"></a>

1. Sur **Paramètres**, cliquez sur `Lancer le traitement des jobs` en haut.
   - Résultat attendu : Une confirmation indique le nombre de jobs prêts.
2. Confirmez avec `Traiter maintenant`.
   - Résultat attendu : Un lot de 10 jobs au plus est exécuté (emails, PDF de certificats, notifications).
   - Remarque : Le résultat affiche « N job(s) traité(s), M en échec, R restant(s) ».

> **En production, c’est automatique** : Le planificateur (toutes les 5 minutes) ou le worker traite la file tout seul. Le bouton sert surtout à débloquer un envoi pendant une recette, sans attendre le prochain cycle.

## 13. Superviser la file de traitements et les emails <a id="superviser"></a>

*Lire l’état de la file de jobs, vérifier la santé de la plateforme, diagnostiquer les emails.*

La **file de jobs** exécute en arrière-plan les envois d’emails, la génération des PDF de certificats et de reçus, les notifications, les rappels de séance et l’expiration des inscriptions. Les opérations métier ne sont jamais bloquées par un email : même si un envoi échoue, la note, le certificat ou l’inscription restent enregistrés.

### Lire l’état de la file de jobs <a id="lire-la-file"></a>

1. Ouvrez **Paramètres** et lisez les indicateurs de jobs.
   - Résultat attendu : Vous voyez les jobs à traiter, terminés, en échec (relance automatique) et abandonnés.
2. Parcourez le tableau « Derniers jobs » et sa colonne « Dernière erreur ».
   - Résultat attendu : Vous repérez le type de job en échec et le message d’erreur.

#### Statuts d’un job

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| En attente | Job à exécuter dès l’heure planifiée. | Rien : il partira au prochain cycle. |
| En cours | Job en cours d’exécution. | Attendre ; repris automatiquement après 10 minutes s’il se bloque. |
| Terminé | Job exécuté avec succès. | Rien à faire. |
| En échec | Job échoué, rejoué automatiquement avec un délai croissant. | Surveiller ; jusqu’à 5 tentatives. |
| Abandonné | Tentatives épuisées : intervention requise. | Non relançable depuis l’interface : suivre le runbook « jobs-bloques » avec l’exploitant. |

> **Un job abandonné ne se relance pas ici** : L’interface ne propose ni relance ni annulation individuelle d’un job. Un job **Abandonné** demande l’intervention de l’exploitant, décrite dans le runbook « jobs-bloques ».

### Vérifier la santé et diagnostiquer les emails <a id="verifier-la-sante"></a>

1. Ouvrez l’adresse /api/health de la plateforme dans un onglet.
   - Résultat attendu : La réponse indique `ok:true` quand la base et la configuration minimale sont en ordre ; sinon une erreur avec « Variables manquantes ».
2. Lisez le champ « provider » de la section email.
   - Résultat attendu : « resend » ou « smtp » est attendu en production ; « console » signifie qu’aucun email ne part.
   - Remarque : La sonde n’affiche jamais de secret : seulement des noms de variables et un indicateur de configuration.
3. En cas d’emails non délivrés, repérez les jobs email.send en échec dans « Derniers jobs ».
   - Résultat attendu : La dernière erreur donne le message du fournisseur.
   - Remarque : Suivez le runbook « panne-email » si le problème persiste.

## 14. Consulter le journal d’audit <a id="journal-audit"></a>

*Retrouver qui a fait quoi, lire l’état avant / après, enquêter sur un compte.*

Le **Journal d’audit** garde une trace en lecture seule des actions sensibles de la plateforme : publications, inscriptions, notes, présences, certificats, décisions sur les demandes, rôles et paramètres. On ne peut ni le modifier ni l’effacer, ni l’exporter depuis l’interface.

1. Ouvrez **Journal d’audit** dans la barre latérale.
   - Résultat attendu : La liste des dernières actions s’affiche (30 par page).
2. Filtrez par email de l’acteur, identifiant, action ou entité.
   - Résultat attendu : La liste se réduit aux entrées correspondantes.
3. Cliquez sur `Voir le détail` d’une ligne.
   - Résultat attendu : L’état avant et après s’affiche, avec un identifiant de corrélation à rapprocher des logs de l’hébergeur.

> **Ce que le journal ne montre pas** : Ce journal ne montre que les actions de la formation. Les connexions, les paiements et les exports n’y figurent pas. Il n’y a pas non plus d’export CSV depuis cette page.

> **Compte compromis** : Si vous soupçonnez un compte compromis, désactivez-le et retirez ses rôles, puis suivez le runbook « incident-securite » (faire tourner la clé de session pour invalider les sessions, préserver les preuves).

## 15. Accéder aux autres espaces <a id="autres-espaces"></a>

*Passer dans la Coordination, l’espace Formateur, l’espace Organisation ou l’espace Apprenant.*

Le super administrateur voit tous les espaces dans le commutateur. Les procédures détaillées de chaque espace vivent dans le guide du rôle correspondant, pas dans ce guide.

1. Ouvrez le commutateur d’espaces en haut de page.
   - Où : sur mobile : menu du compte (vos initiales)
   - Résultat attendu : La liste des espaces s’affiche.
2. Choisissez l’espace voulu.
   - Résultat attendu : L’espace s’ouvre avec sa propre barre latérale.

*Les espaces et leur guide*

| Espace | Ce qu’on y fait | Guide |
| --- | --- | --- |
| Coordination | Demandes de formation, cohortes, sessions, registre des certificats, organisations, rapports. | Guide de la coordination. |
| Formateur | Cohortes enseignées, calendrier, forums. | Guide du formateur. |
| Organisation | Tableau de bord d’organisation et demande de formation. | Guide de l’organisation. |
| Apprenant | Espace personnel, catalogue, formations suivies. | Guide de l’apprenant. |

## 16. Opérations sensibles et irréversibles <a id="operations-sensibles"></a>

*Le récapitulatif de ce qui ne se défait pas, et de ce qui se défait.*

*Avant de cliquer*

| Opération | Réversible ? | Conséquence immédiate |
| --- | --- | --- |
| Publier une version | Non (la version reste figée) | La version devient courante et le cours devient visible ; les cohortes en cours gardent leur version. |
| Retirer du catalogue | Oui (`Publier` de nouveau) | Le cours repasse en brouillon ; inscriptions conservées. |
| Archiver un cours | Oui (`Restaurer en brouillon`) | Retiré du catalogue et des demandes de formation. |
| Supprimer un module, une leçon ou une activité | Non | Le contenu et les tentatives ou remises liées sont perdus. |
| Révoquer un certificat | Non | Vérification publique négative ; titulaire notifié ; numéro jamais réattribué. |
| Retirer un rôle | Oui (attribuer de nouveau) | Droits retirés dès la page suivante ; personne n’est prévenu. |
| Désactiver un compte | Oui (`Réactiver`) | Connexion refusée ; données conservées ; sessions valables jusqu’à 14 jours. |
| Enregistrer un paramètre | Oui (ressaisir) | Effet immédiat ; valeurs avant / après dans le journal. |
| Lancer un lot de traitements | Sans objet | Exécution immédiate d’au plus 10 jobs. |

> **Notez le motif** : Le journal d’audit enregistre l’action, pas l’intention. Avant une opération sensible (révocation, retrait de rôle, désactivation), notez le motif — demande écrite, date, personne — dans votre journal d’exploitation, sans y écrire de secret.

## 17. Notifications et emails <a id="notifications"></a>

*Ce que déclenchent vos actions et ce que vous voyez, sachant que l’administration envoie peu d’emails.*

La plupart de vos actions d’administration (publication, modification de structure, questions, modèles, rôles, désactivation, paramètres) ne déclenchent que le journal d’audit : aucun email ni notification. Les emails partent surtout des parcours d’inscription et de coordination.

*Ce que reçoivent les personnes concernées par vos actions*

| Votre action | La personne reçoit |
| --- | --- |
| Activer une inscription en attente | Email « Inscription confirmée » et notification interne « Inscription validée ». |
| Terminer une inscription (critères remplis) | Notification « Votre certificat est disponible » et email « Certificat disponible » ou « Attestation disponible » (lien de téléchargement et de vérification). |
| Annuler une inscription | Email et notification interne « Inscription annulée ». |
| Suspendre une inscription | Notification interne « Inscription suspendue » (sans email). |
| Révoquer un certificat | Notification interne et email « Certificat révoqué » avec le motif. |
| Attribuer ou retirer un rôle, désactiver un compte, modifier un paramètre | Rien : seul le journal d’audit garde une trace. Prévenez la personne vous-même si nécessaire. |

> **Un compte désactivé ne reçoit plus rien** : Tant qu’un compte est désactivé, il ne reçoit ni notification interne ni email.

## 18. Bonnes pratiques et sécurité <a id="bonnes-pratiques"></a>

- [x] Un compte de super administrateur nominatif par personne ; jamais de compte partagé ni de mot de passe transmis par email.
- [x] Toujours au moins deux super administrateurs actifs, chacun avec la vérification en deux étapes et ses codes de secours rangés en lieu sûr.
- [x] Déconnectez-vous (`Déconnexion`) sur tout appareil partagé ou prêté, et ne laissez jamais l’administration ouverte sans surveillance.
- [x] Donnez le rôle le plus bas qui suffit, avec une portée limitée (un cours, une cohorte) quand c’est possible, et une date d’expiration pour les remplacements.
- [x] Avant de publier un cours, relisez-le dans l’onglet **Prévisualisation** : c’est ce que verra le public.
- [x] Pour faire évoluer un cours suivi, créez une nouvelle version : ne cherchez jamais à contourner le verrouillage d’une version figée.
- [x] Notez le motif de chaque révocation, retrait de rôle ou désactivation dans votre journal d’exploitation, sans y écrire de secret.
- [x] Les données des apprenants (adresses, employeurs, inscriptions, notes) sont des données personnelles et syndicales : traitez-les avec confidentialité et ne les diffusez pas hors de la plateforme.
- [x] Consultez la vue d’ensemble chaque jour ouvré et le journal d’audit chaque semaine ; surveillez le badge des jobs abandonnés.
- [x] Ne réglez jamais un fournisseur ou un secret depuis l’interface : cela se fait chez l’hébergeur, avec l’exploitant.
- [x] Restez courtois et factuel dans les messages ; ne promettez jamais une fonction qui n’existe pas dans l’interface.

## 19. Questions fréquentes <a id="questions-frequentes"></a>

**Je veux modifier le contenu d’un cours déjà suivi, mais tout est en lecture seule. Pourquoi ?**

La version est figée pour protéger les apprenants en cours. Créez une nouvelle version avec `Créer une nouvelle version` ou `Dupliquer`, modifiez-la, puis publiez-la. Voir « Faire évoluer un cours déjà suivi ».

**Comment créer un compte pour un nouveau formateur ?**

On ne crée pas de compte depuis l’administration. Le compte naît à l’inscription ou est créé par la coordination. Une fois le compte existant, attribuez-lui le rôle Formateur, puis rattachez-le au cours dans le builder. Voir « Attribuer un rôle ».

**Un certificat a été émis par erreur. Puis-je l’annuler ?**

Vous pouvez le `Révoquer`, mais c’est définitif et public : le titulaire est notifié et le numéro n’est jamais réutilisé. Pour corriger, on réémet un nouveau certificat depuis la Coordination. Voir « Révoquer un certificat ».

**Un apprenant dit ne pas avoir reçu son certificat par email.**

Vérifiez le statut du PDF : s’il est « En génération », cliquez sur `Régénérer le PDF` et attendez le prochain cycle de traitements. Vérifiez aussi que le compte n’est pas désactivé et que l’email part (santé, provider). Voir « Comprendre l’émission automatique ».

**Comment publier un cours sur le site institutionnel ?**

Il n’y a rien de spécial à faire : dès qu’un cours est Publié avec une version courante, il apparaît sur le site institutionnel comme au catalogue de la plateforme. Les deux lisent la même base. Voir « Publier une version ».

**Comment retirer immédiatement l’accès d’une personne ?**

Désactivez son compte : elle ne peut plus se connecter. Attention, une session déjà ouverte peut rester valable jusqu’à 14 jours ; pour la couper tout de suite, l’exploitant doit faire tourner la clé de session (runbook « incident-securite »). Voir « Désactiver ou réactiver un compte ».

**La carte « File de jobs » affiche des jobs abandonnés. Que faire ?**

Un job abandonné ne se relance pas depuis l’interface. Lisez sa dernière erreur dans « Derniers jobs » et suivez le runbook « jobs-bloques » avec l’exploitant. Voir « Lire l’état de la file de jobs ».

**Comment vérifier que les emails partent bien ?**

Ouvrez /api/health : le champ « provider » doit indiquer « resend » ou « smtp », pas « console ». Repérez ensuite les jobs email.send en échec dans « Derniers jobs ». Voir « Vérifier la santé et diagnostiquer les emails ».

**Puis-je exporter le journal d’audit ?**

Non, pas depuis cette page : le journal est en lecture seule, sans export. Il ne montre que les actions de la formation. Voir « Consulter le journal d’audit ».

**Comment régler le service d’envoi d’emails ou activer la double authentification obligatoire ?**

Ces réglages ne sont pas dans l’interface : ils se font par variables d’environnement chez l’hébergeur, avec l’exploitant. La page Paramètres ne gère que les réglages métier de la formation. Voir « Régler les paramètres ».

## 20. Lexique <a id="lexique"></a>

- **Cours** : Un module du programme de formation. Il porte une fiche descriptive et des versions.
- **Version figée** : Une version d’un cours, publiée ou déjà suivie, dont la structure ne se modifie plus. On la duplique pour évoluer.
- **Version courante** : La version d’un cours que suivent les nouvelles inscriptions et cohortes.
- **Cohorte** : Un groupe d’apprenants qui suit un cours sur une période donnée, animé par un formateur.
- **Inscription** : Le lien entre un apprenant et un cours, avec un statut (En cours, Terminée…) et une progression.
- **Banque de questions** : Le réservoir de questions réutilisables dans les quiz des cours.
- **Modèle de certificat** : Le gabarit qui définit les textes, le signataire, les critères et la validité d’une attestation ou d’un certificat.
- **Certificat révoqué** : Un certificat annulé définitivement : la vérification publique le signale et son numéro n’est jamais réattribué.
- **Rôle** : Un ensemble de droits attribué à un compte. Chaque rôle a une portée (globale, une organisation, un cours, une cohorte).
- **Portée** : L’étendue d’un rôle : toute la plateforme, ou seulement une organisation, un cours ou une cohorte.
- **MFA (vérification en deux étapes)** : Un code temporaire à six chiffres demandé en plus du mot de passe, exigé pour les rôles privilégiés.
- **File de jobs (traitements)** : La liste des tâches exécutées en arrière-plan : emails, PDF, notifications, rappels, expirations.
- **Job abandonné** : Une tâche dont toutes les tentatives ont échoué ; elle exige l’intervention de l’exploitant.
- **Journal d’audit** : La trace en lecture seule des actions sensibles de la plateforme, avec l’auteur et l’état avant / après.
- **Runbook** : Une procédure d’exploitation écrite (dossier docs/runbooks du dépôt), suivie avec l’exploitant en cas d’incident.
- **Exploitant** : La personne qui gère l’hébergement : variables d’environnement, secrets, planificateur, sauvegardes.

## 21. Besoin d’aide ? <a id="besoin-d-aide"></a>

*À qui s’adresser selon le problème, et quoi indiquer dans votre message.*

*À qui s’adresser*

| Problème | Interlocuteur | Comment |
| --- | --- | --- |
| Vous êtes bloqué (vérification en deux étapes, plus aucun super administrateur actif) | Un autre super administrateur, puis l’exploitant | Par téléphone ou en personne ; l’exploitant intervient en base en dernier recours (runbook incident-securite). |
| Panne d’email, file de jobs bloquée, santé en erreur, secrets, sauvegardes | L’exploitant de l’hébergement | Par le canal convenu, avec le runbook concerné et le résultat de /api/health (sans secret). |
| Question sur une cohorte, une demande de formation, un certificat à réémettre | La coordination formation | Espace Coordination de la plateforme, ou message interne. |
| Demande d’un apprenant (accès, erreur, inscription) | Le Support, puis la coordination | Ils vous transmettent les cas qui exigent une action d’administration. |
| Décision de gouvernance (nouveau rôle, nouveau cours au programme) | Le secrétariat général de la Fédération | Demande écrite, conservée avec le motif. |
| Anomalie de l’application, fonction absente | L’équipe de développement, via le secrétariat général | Décrire l’écran, l’action et le message exact ; toute évolution structurante passe par un ADR du dépôt. |

### Coordonnées de la Fédération

- [Formulaire de contact](https://fetrag.ga/contact) : Pour joindre la FETRAG (choisir le type « assistance »).
- [Écrire à la Fédération](mailto:jossngomafm@gmail.com) : Adresse email de contact de la Fédération.
- [Appeler : 066 23 00 33 ou 077 52 27 98](tel:+24166230033) : Aux heures de bureau, Libreville.
- [Adresse postale](https://fetrag.ga/contact) : BP 1234 Libreville, Gabon.

### Dans un message d’aide, indiquez

- L’adresse email de votre compte (jamais votre mot de passe ni vos codes de secours).
- L’écran concerné (par exemple « Cours › fiche de … › Versions ») et l’heure approximative.
- Le message exact affiché à l’écran.
- Ce que vous avez déjà essayé (rechargement, autre navigateur, autre appareil).
- Pour un problème d’email ou de traitements : les chiffres des indicateurs de la file de jobs et le « provider » indiqué par /api/health.

> **Runbooks** : Les procédures d’exploitation détaillées sont dans le dossier « docs/runbooks » du dépôt : supervision, jobs-bloques, panne-email, rotation-secrets, incident-securite, restauration-base, revocation-certificat, deploiement. Elles ne contiennent aucun secret et ne doivent jamais en contenir.

## Testez votre maîtrise <a id="autoevaluation"></a>

Vingt-six questions pour vérifier que vous savez où agir dans l’administration, ce qui est irréversible et à qui vous adresser. Comptez une douzaine de minutes ; le corrigé renvoie à la section du guide. Seuil de maîtrise : 70 % de bonnes réponses. 26 questions.

1. Vous pouvez créer un nouveau compte pour un formateur depuis l’administration. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

2. Sur un smartphone, comment ouvrez-vous la navigation de l’administration ? *(une seule réponse)*
   - a) Avec le bouton **Ouvrir le menu** (icône à trois traits) de la barre supérieure.
   - b) En cliquant sur vos initiales en haut à droite.
   - c) La navigation n’est pas disponible sur smartphone.

3. Un cours est déjà suivi et vous devez corriger une leçon. Que faites-vous ? *(une seule réponse)*
   - a) Je modifie directement la version publiée.
   - b) Je crée une nouvelle version (`Dupliquer`), je la modifie, puis je la publie.
   - c) Je supprime le cours et je le recrée.

4. Une fois un cours publié avec une version courante, il faut lancer une synchronisation pour qu’il apparaisse sur le site institutionnel. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

5. Que signifie « Archiver » un cours ? *(une seule réponse)*
   - a) Le supprimer définitivement avec ses inscriptions.
   - b) Le retirer du catalogue et des demandes, mais garder les données ; c’est réversible.
   - c) Le masquer une journée.

6. Vous modifiez une question déjà répondue par des apprenants. Que se passe-t-il ? *(une seule réponse)*
   - a) La question est modifiée en place, sans trace.
   - b) Une nouvelle version est créée et l’ancienne est désactivée.
   - c) La modification est refusée.

7. Que se passe-t-il quand vous révoquez un certificat ? *(plusieurs réponses possibles)*
   - a) La vérification publique affiche « révoqué ».
   - b) Le titulaire est notifié par email.
   - c) Le numéro pourra être réattribué à un autre certificat.
   - d) L’action est réversible d’un clic.

8. Un PDF de certificat affiche « En génération ». Que faites-vous ? *(une seule réponse)*
   - a) Je clique sur `Régénérer le PDF` et j’attends le prochain cycle de traitements.
   - b) Je révoque le certificat.
   - c) Je recrée le compte de l’apprenant.

9. Vous voulez qu’un formateur n’intervienne que sur une cohorte précise. Que choisissez-vous ? *(une seule réponse)*
   - a) Rôle Formateur, portée Globale.
   - b) Rôle Formateur, portée Une cohorte, puis la cohorte comme cible.
   - c) Rôle Coordinateur, portée Globale.

10. Désactiver un compte coupe instantanément toutes ses sessions déjà ouvertes. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

11. Un job est au statut « Abandonné ». Comment le relancer ? *(une seule réponse)*
   - a) Avec `Lancer le traitement des jobs` sur la page Paramètres.
   - b) Il ne se relance pas depuis l’interface : je suis le runbook « jobs-bloques » avec l’exploitant.
   - c) Il se relance tout seul indéfiniment.

12. Sur /api/health, le champ « provider » de l’email indique « console ». Qu’est-ce que cela signifie ? *(une seule réponse)*
   - a) Les emails partent normalement.
   - b) Aucun email n’est envoyé : le service d’email n’est pas configuré.
   - c) La base de données est en panne.

13. Où activez-vous la vérification en deux étapes exigée pour votre rôle ? *(une seule réponse)*
   - a) Sur le site institutionnel, dans **Espace** puis **Sécurité**.
   - b) Dans l’administration de la plateforme de formation, page Paramètres.
   - c) Un autre super administrateur l’active à votre place.

14. Combien de temps le lien de réinitialisation du mot de passe reste-t-il valable ? *(une seule réponse)*
   - a) 30 minutes.
   - b) 24 heures.
   - c) Indéfiniment, jusqu’à utilisation.

15. Où trouvez-vous les taux de complétion et les rapports détaillés ? *(une seule réponse)*
   - a) Sur la vue d’ensemble de l’administration.
   - b) Dans l’espace **Coordination**, rubrique Rapports.
   - c) Dans le journal d’audit.

16. Quel est le score de réussite proposé par défaut à la création d’une évaluation ? *(une seule réponse)*
   - a) 50 %.
   - b) 60 %.
   - c) 80 %.

17. Que se passe-t-il quand vous choisissez `Terminer` sur une inscription ? *(une seule réponse)*
   - a) La progression passe à 100 % et le certificat est émis si les critères sont remplis.
   - b) L’inscription est supprimée définitivement.
   - c) L’apprenant est déconnecté de la plateforme.

18. Combien de jobs au plus sont exécutés quand vous lancez un lot de traitements ? *(une seule réponse)*
   - a) 10 jobs au plus.
   - b) Tous les jobs de la file, sans limite.
   - c) Un seul job.

19. Le compteur des certificats se modifie depuis la page Paramètres. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

20. Que pouvez-vous faire avec le journal d’audit depuis l’interface ? *(une seule réponse)*
   - a) Le consulter et le filtrer, mais ni le modifier, ni l’effacer, ni l’exporter.
   - b) Le modifier pour corriger une entrée erronée.
   - c) L’exporter en CSV depuis cette page.

21. Où se trouvent les procédures détaillées de gestion des cohortes et des demandes de formation ? *(une seule réponse)*
   - a) Dans ce guide de l’administration.
   - b) Dans le guide de la coordination.
   - c) Dans le lexique de ce guide.

22. Parmi ces opérations, lesquelles sont irréversibles ? *(plusieurs réponses possibles)*
   - a) Révoquer un certificat.
   - b) Supprimer un module, une leçon ou une activité.
   - c) Désactiver un compte.
   - d) Retirer un rôle.

23. Que reçoit une personne quand vous lui attribuez ou retirez un rôle ? *(une seule réponse)*
   - a) Rien : seul le journal d’audit garde une trace.
   - b) Un email détaillant le changement de rôle.
   - c) Une notification interne « Rôle modifié ».

24. Combien de super administrateurs actifs le guide recommande-t-il au minimum ? *(une seule réponse)*
   - a) Un seul suffit.
   - b) Toujours au moins deux, chacun avec la vérification en deux étapes.
   - c) Au moins cinq.

25. D’après le lexique, qu’est-ce qu’une « version figée » ? *(une seule réponse)*
   - a) Une version d’un cours, publiée ou déjà suivie, dont la structure ne se modifie plus.
   - b) La version que suivent toutes les nouvelles inscriptions.
   - c) Une version supprimée du cours.

26. Dans un message d’aide, que ne devez-vous jamais indiquer ? *(une seule réponse)*
   - a) L’écran concerné et l’heure approximative.
   - b) Votre mot de passe ou vos codes de secours.
   - c) Le message exact affiché à l’écran.

### Corrigé

1. **b** : L’administration ne crée pas de compte : ils naissent à l’inscription ou par la coordination. Vous n’attribuez que des rôles. Voir « Votre rôle en bref ».
2. **a** : Sur petit écran, la barre latérale devient un tiroir ouvert par le bouton **Ouvrir le menu**. Voir « Se repérer dans l’espace Administration ».
3. **b** : Une version suivie est figée pour protéger les apprenants : on la duplique pour évoluer. Voir « Faire évoluer un cours déjà suivi ».
4. **b** : Le catalogue et le site lisent la même base : le cours apparaît aussitôt, sans synchronisation. Voir « Publier une version ».
5. **b** : Archiver retire le cours du catalogue et des demandes mais conserve tout ; on le restaure avec `Restaurer en brouillon`. Voir « Comprendre le cycle de vie d’un cours ».
6. **b** : Pour préserver les réponses déjà données, une nouvelle version est créée et l’ancienne désactivée. Voir « Modifier, dupliquer ou désactiver une question ».
7. **a, b** : La révocation est définitive : vérification négative, titulaire notifié, numéro jamais réattribué. Voir « Révoquer un certificat ».
8. **a** : Le PDF est produit par la file de traitements ; `Régénérer le PDF` relance le job. Voir « Comprendre l’émission automatique ».
9. **b** : Un rôle limité s’attribue avec sa portée et sa cible. Voir « Attribuer un rôle ».
10. **b** : La désactivation empêche toute nouvelle connexion, mais une session ouverte peut durer jusqu’à 14 jours : il faut faire tourner la clé de session pour la couper. Voir « Désactiver ou réactiver un compte ».
11. **b** : Un job abandonné a épuisé ses tentatives ; sa reprise passe par l’exploitant. Voir « Lire l’état de la file de jobs ».
12. **b** : « console » signifie qu’aucun email ne part ; on attend « resend » ou « smtp » en production. Voir « Vérifier la santé et diagnostiquer les emails ».
13. **a** : L’activation se fait uniquement sur le site institutionnel, dans **Espace** > **Sécurité** ; la plateforme ne fait que vérifier le code. Voir « Activer la vérification en deux étapes ».
14. **a** : Le lien « Mot de passe oublié » envoyé par email est valable 30 minutes. Voir « Se connecter et se déconnecter ».
15. **b** : La vue d’ensemble ne montre ni taux de complétion ni revenus : les rapports vivent dans l’espace Coordination. Voir « Lire la vue d’ensemble ».
16. **b** : À la création d’une évaluation, le score de réussite est de 60 % par défaut et le nombre de tentatives de 3. Voir « Composer un quiz ».
17. **a** : `Terminer` met la progression à 100 % et émet le certificat si les critères du modèle sont remplis. Voir « Changer le statut d’une inscription ».
18. **a** : `Traiter maintenant` exécute un lot de 10 jobs au plus (emails, PDF, notifications). Voir « Lancer un lot de traitements ».
19. **b** : Le compteur des certificats est géré automatiquement et n’est pas modifiable : la page refuse la modification. Voir « Modifier un paramètre ».
20. **a** : Le journal est en lecture seule : on le consulte et on le filtre, sans le modifier, l’effacer ni l’exporter. Voir « Consulter le journal d’audit ».
21. **b** : Les procédures de chaque espace vivent dans le guide du rôle correspondant ; les cohortes relèvent du guide de la coordination. Voir « Accéder aux autres espaces ».
22. **a, b** : Révoquer un certificat et supprimer un module sont définitifs ; désactiver un compte et retirer un rôle se défont. Voir « Opérations sensibles et irréversibles ».
23. **a** : L’attribution ou le retrait d’un rôle ne déclenche aucun email ni notification : prévenez la personne vous-même si besoin. Voir « Notifications et emails ».
24. **b** : Le guide recommande toujours au moins deux super administrateurs actifs, chacun avec la MFA et ses codes de secours. Voir « Bonnes pratiques et sécurité ».
25. **a** : Une version figée est publiée ou déjà suivie et ne se modifie plus ; on la duplique pour la faire évoluer. Voir « Lexique ».
26. **b** : Indiquez votre email, l’écran et le message exact, mais jamais votre mot de passe ni vos codes de secours. Voir « Besoin d’aide ? ».

## Guides liés

- [Guide de l’apprenant](/guide) : Le guide commun à tous les comptes de la plateforme de formation : catalogue, inscriptions, suivi.
- [Guide de la coordination](/coordination/guide) : Demandes de formation, cohortes, sessions, registre des certificats et organisations.
- [Guide du super administrateur du site institutionnel](https://fetrag.ga/admin/guide) : Le même rôle sur le site institutionnel : comptes, rôles, paramètres, clés API, menus.
