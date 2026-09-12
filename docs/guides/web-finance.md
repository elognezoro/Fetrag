# Guide finance et contrôle

*Suivre les paiements, les remboursements et les prises en charge*

Plateforme : site institutionnel fetrag.ga · Rôle : FINANCE · Version 1.0 du 2026-09-12 · Lecture : 60 min · 23 sections, 112 étapes.

Version en ligne : https://fetrag.ga/admin/guide/web-finance

**À qui s'adresse ce guide ?** Ce guide s’adresse aux personnes de la Fédération chargées de la finance et du contrôle : suivi des encaissements, des commandes, des remboursements, des prises en charge et des exports comptables des deux plateformes.

Avec le rôle Finance / contrôle, vous suivez toutes les commandes passées sur le site institutionnel et sur la plateforme de formation, vous vérifiez les paiements auprès des opérateurs, vous remboursez quand c’est justifié et vous accordez des prises en charge. Vous exportez les données pour la comptabilité et vous contrôlez chaque opération sensible dans le journal d’audit. Ce guide décrit chaque écran, chaque statut, les règles imposées par l’application et ce qu’il faut faire quand quelque chose ne se passe pas comme prévu.

## Avant de commencer

- Un compte FETRAG dont l’adresse email est confirmée.
- Le rôle **Finance / contrôle** attribué par le super administrateur (il apparaît en bas du menu du back-office, sous la forme **FINANCE / CONTRÔLE**).
- Une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator ou FreeOTP) : la vérification en deux étapes est exigée pour ce rôle.
- Un tableur (sur ordinateur de préférence) pour ouvrir les fichiers CSV exportés pour la comptabilité.

## Prise en main en cinq minutes

1. Connectez-vous avec votre adresse email et votre mot de passe.
   - Élément : `Se connecter` (page **Connexion**, bouton en bas du formulaire)
   - Résultat attendu : Votre espace personnel s’ouvre.
2. Activez la vérification en deux étapes si ce n’est pas encore fait.
   - Où : menu du compte (vos initiales, en haut à droite) > **Sécurité**
   - Résultat attendu : Le badge **Vérification en deux étapes active** apparaît en haut de la page.
   - Remarque : Conservez les codes de secours : ils ne sont affichés qu’une seule fois.
3. Ouvrez le menu de votre compte puis cliquez sur **Administration du site**.
   - Où : vos initiales, en haut à droite de la page
   - Résultat attendu : Le tableau de bord du back-office s’affiche avec la pastille **FINANCE / CONTRÔLE** en bas du menu.
4. Ouvrez **Finance** et lisez les quatre tuiles du haut.
   - Où : menu de gauche, rubrique « Administration » (sur mobile : bouton **Ouvrir la navigation**, trois traits en haut à gauche)
   - Résultat attendu : Le chiffre d’affaires du mois, les commandes en attente, les remboursements et le panier moyen s’affichent.
5. Vérifiez la carte **Webhooks de paiement** en bas de la page.
   - Où : tableau de bord Finance, sous les graphiques
   - Résultat attendu : Aucun badge rouge **Erreur** ni orange **Non vérifié** : les notifications des opérateurs sont bien traitées.
6. S’il y a des commandes en attente, cliquez sur `Lancer le rapprochement`.
   - Où : en haut à droite du tableau de bord Finance
   - Résultat attendu : Un message en bas de l’écran indique le nombre de paiements vérifiés et mis à jour.

## Sommaire

1. [Votre rôle en bref](#votre-role)
2. [Avant de commencer](#avant-de-commencer)
3. [Se repérer dans le back-office](#se-reperer)
4. [Comment suivre les encaissements et repérer une anomalie](#suivre-les-encaissements)
5. [Comment rapprocher les paiements avec les opérateurs](#rapprochement)
6. [Comment rechercher une commande](#rechercher-une-commande)
7. [Comment lire la fiche d’une commande](#lire-une-fiche-de-commande)
8. [Comment rembourser tout ou partie d’un paiement](#rembourser-un-paiement)
9. [Comment émettre ou régénérer le reçu d’une commande](#emettre-un-recu)
10. [Comment accorder une prise en charge](#accorder-une-prise-en-charge)
11. [Comment clôturer ou supprimer une prise en charge](#cloturer-ou-supprimer-une-prise-en-charge)
12. [Comment exporter les commandes ou les paiements pour la comptabilité](#exporter-pour-la-comptabilite)
13. [Comment consulter une organisation](#consulter-les-organisations)
14. [Comment identifier un client dans l’annuaire](#consulter-les-utilisateurs)
15. [Comment contrôler une opération dans le journal d’audit](#controler-dans-le-journal-d-audit)
16. [Comment consulter les rapports](#consulter-les-rapports)
17. [Ce qui se passe côté client : le parcours de paiement](#parcours-de-paiement-du-client)
18. [Règles, montants, références et délais](#regles-montants-et-delais)
19. [Notifications et emails](#notifications)
20. [Bonnes pratiques et sécurité](#bonnes-pratiques)
21. [Questions fréquentes](#questions-frequentes)
22. [Lexique](#lexique)
23. [Besoin d’aide ?](#besoin-d-aide)

## 1. Votre rôle en bref <a id="votre-role"></a>

*Ce que le rôle Finance / contrôle vous permet de faire, ce qu’il ne permet pas, et avec qui vous travaillez.*

Vous êtes responsable de l’argent qui circule sur les deux plateformes de la Fédération : formations, événements, services et ressources réglés en ligne. Votre travail se fait dans le **back-office** (l’espace d’administration du site institutionnel), rubrique **Finance**. Vous constatez, vous vérifiez, vous remboursez quand c’est justifié et vous conservez une trace de tout. Les montants sont toujours exprimés en francs CFA (XAF), sans centimes.

### Ce que vous pouvez faire

- [x] Lire le tableau de bord financier : chiffre d’affaires, commandes en attente, remboursements, panier moyen, ventes mensuelles, moyens de paiement, dernières commandes, notifications des opérateurs (webhooks).
- [x] Rechercher n’importe quelle commande, ouvrir sa fiche, lire ses paiements et son historique.
- [x] Lancer le rapprochement : demander aux opérateurs (mobile money, carte) de confirmer les paiements restés en attente.
- [x] Rembourser tout ou partie d’un paiement réussi ; c’est la seule personne (avec le super administrateur) qui peut le faire.
- [x] Émettre ou régénérer le reçu PDF d’une commande réglée.
- [x] Accorder, clôturer ou supprimer une prise en charge (bourse ou financement par une organisation).
- [x] Exporter les commandes, les paiements, le journal d’audit et les rapports au format CSV (tableur) pour la comptabilité.
- [x] Consulter les organisations, les comptes des utilisateurs, les rapports et le journal d’audit.

### Ce que vous ne pouvez pas faire

- Confirmer manuellement un paiement, forcer une commande en « payée », annuler une commande ou modifier sa note : seuls l’opérateur de paiement et le client font évoluer une commande.
- Fixer les tarifs ou créer des codes de réduction (coupons) : les tarifs sont saisis par l’Éditeur communication (événements, ressources, services) et par la Coordination (formations).
- Créer, désactiver ou modifier un compte, attribuer ou retirer un rôle, réinitialiser la vérification en deux étapes d’une personne : réservé au super administrateur.
- Créer ou modifier une organisation et ses membres : réservé au super administrateur.
- Modifier les pages, actualités, ressources, événements, services et partenaires du site.
- Lire les messages reçus, traiter les demandes de service ou exporter la liste des abonnés à la lettre d’information.
- Gérer les cohortes, les certificats et les demandes de formation sur la plateforme de formation : les liens **Coordination LMS** mènent à la page **Accès refusé**.
- Modifier les paramètres du site.

*Avec qui vous travaillez*

| Interlocuteur | Ce qu’il fait | Quand le solliciter |
| --- | --- | --- |
| Super administrateur | Comptes, rôles, sécurité, paramètres, raccordement des opérateurs | Rôle manquant, vérification en deux étapes perdue, opérateur non raccordé, anomalie technique répétée |
| Support | Assistance de premier niveau aux utilisateurs | Il vous transmet les cas « paiement effectué mais non visible », « double débit », « reçu manquant » |
| Coordination | Formations, cohortes, certificats, tarifs des formations | Inscription à confirmer après paiement, tarif d’une formation, prise en charge à accorder à une cohorte |
| Éditeur communication | Contenus du site, tarifs des événements, ressources et services | Tarif erroné sur une offre, offre à retirer |
| Responsable services | Catalogue de services et demandes | Demande de service payée mais non traitée |
| Secrétariat général | Décisions de la Fédération | Autorisation d’un remboursement litigieux, décision de bourse ou de prise en charge |

> **Un rôle de contrôle, pas de caisse** : L’application n’encaisse rien à votre place et ne vous laisse rien encaisser à la main : les paiements sont confirmés par les opérateurs. Votre rôle est de vérifier, de rembourser à bon escient et de garder une trace. Chaque remboursement, chaque prise en charge et chaque export sont journalisés avec votre nom.

## 2. Avant de commencer <a id="avant-de-commencer"></a>

*Se connecter, activer la vérification en deux étapes exigée pour votre rôle, se déconnecter correctement.*

Une seule identité sert pour le site institutionnel et la plateforme de formation (session unique). Le rôle **Finance / contrôle** ne s’applique qu’au site institutionnel : sur la plateforme de formation, vous n’avez pas d’espace particulier et vous pouvez suivre une formation comme n’importe quel compte.

### Se connecter

1. Ouvrez la page de connexion.
   - Où : bouton **Se connecter** dans l’en-tête du site (sur mobile : bouton **Menu**, trois traits en haut à droite)
   - Résultat attendu : Le formulaire « Bienvenue à la FETRAG » s’affiche.
2. Saisissez votre **Adresse email** et votre **Mot de passe**.
   - Remarque : Les deux champs sont obligatoires. Le bouton en forme d’œil affiche le mot de passe pour vérifier la saisie.
3. Si le champ **Code de vérification** est affiché, saisissez le code à 6 chiffres de votre application d’authentification.
   - Remarque : Ce champ n’apparaît que si la vérification en deux étapes est active sur votre compte. Un code de secours (12 caractères au plus) fonctionne aussi, une seule fois.
4. Cliquez sur le bouton de connexion.
   - Où : bouton bleu sur toute la largeur, sous les champs
   - Résultat attendu : Votre espace personnel s’ouvre.
5. Ouvrez le menu de votre compte puis cliquez sur **Administration du site**.
   - Où : vos initiales, en haut à droite
   - Résultat attendu : Le back-office s’ouvre sur la page « Bonjour » suivie de votre prénom ; la pastille **FINANCE / CONTRÔLE** est visible en bas du menu.

> **La vérification en deux étapes est exigée pour votre rôle** : Les rôles privilégiés (administration, coordination, finance, communication) doivent protéger leur compte par un second facteur. Si la page « Vérification en deux étapes » s’affiche après la connexion, activez-la sans attendre. Le lien « Continuer sans activer pour le moment » ne doit être utilisé qu’en cas de dépannage urgent, puis l’activation doit être faite le jour même.

### Activer la vérification en deux étapes

Une seule fois. Installez d’abord une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator ou FreeOTP).

1. Ouvrez **Sécurité**.
   - Où : menu du compte (vos initiales, en haut à droite) > **Sécurité** ; ou bouton `Activer la vérification` sur la page « Vérification en deux étapes »
   - Résultat attendu : La page « Protéger mon compte » s’affiche avec le badge orange **Vérification en deux étapes inactive**.
2. Cliquez sur `Activer la vérification en deux étapes`.
   - Où : carte **Vérification en deux étapes**
   - Résultat attendu : Le bouton affiche « Préparation », puis un QR code apparaît (étape 1).
3. Scannez le QR code avec votre application d’authentification.
   - Résultat attendu : L’application affiche un code à 6 chiffres qui change toutes les 30 secondes environ.
   - Remarque : Si votre téléphone ne peut pas scanner, saisissez la clé indiquée sous le code (« Scannez ce code ou saisissez la clé manuellement »).
4. Saisissez ce code dans le champ **Code à 6 chiffres affiché par l’application** puis cliquez sur `Confirmer et activer`.
   - Où : étape 2, sous le QR code
   - Résultat attendu : Le bandeau vert « Vérification en deux étapes activée » s’affiche.
5. Cliquez sur `Copier les codes` et rangez les codes de secours en lieu sûr.
   - Où : bandeau « Codes de secours - affichés une seule fois »
   - Résultat attendu : Les codes sont copiés ; collez-les dans un gestionnaire de mots de passe ou imprimez-les.
   - Remarque : Chaque code permet de vous connecter une seule fois si vous perdez votre téléphone. Ils ne seront plus jamais affichés.
6. Vérifiez le badge en haut de la page.
   - Résultat attendu : Badge vert **Vérification en deux étapes active**. Une ligne « Vérification en deux étapes activée » apparaît dans la carte **Activité récente** et dans le journal d’audit.

### Se déconnecter

Indispensable sur un appareil partagé ou prêté.

1. Ouvrez le menu de votre compte puis cliquez sur **Déconnexion**.
   - Où : vos initiales, en haut à droite
   - Résultat attendu : La page « Se déconnecter ? » s’affiche avec votre adresse email.
2. Cliquez sur `Confirmer la déconnexion`.
   - Résultat attendu : La page « Vous êtes déconnecté » s’affiche ; la session est fermée sur le site et sur la plateforme de formation.
3. Fermez le navigateur si l’appareil n’est pas le vôtre.
   - Remarque : Le lien « Annuler et rester connecté » vous ramène à votre espace sans vous déconnecter.

- **Message « Adresse email ou mot de passe incorrect. »** (cause probable : Faute de frappe, ou mot de passe oublié.) : Vérifiez la saisie avec le bouton en forme d’œil. Sinon, cliquez sur **Mot de passe oublié ?** et suivez le lien reçu par email.
- **Message « Un code de vérification est requis. »** (cause probable : La vérification en deux étapes est active et le champ **Code de vérification** est vide.) : Ouvrez votre application d’authentification, saisissez le code à 6 chiffres affiché, puis validez avant qu’il ne change.
- **Vous avez perdu votre téléphone et vos codes de secours.** (cause probable : Aucun second facteur disponible.) : Seul le super administrateur peut réinitialiser la vérification en deux étapes de votre compte depuis votre fiche utilisateur. Contactez-le en indiquant l’adresse email de votre compte.
- **Message « Trop de tentatives. Patientez quelques instants. »** (cause probable : Plusieurs échecs de connexion successifs.) : Attendez quelques minutes avant de réessayer. Ne demandez pas un nouveau mot de passe à chaque tentative.
- **Message « Ce compte est désactivé. Contactez le support. »** (cause probable : Le compte a été désactivé par le super administrateur.) : Écrivez au support depuis la page **Contact** en indiquant votre adresse email.
- **Le menu du compte ne propose pas **Administration du site**, ou la page **Accès refusé** s’affiche.** (cause probable : Le rôle **Finance / contrôle** n’est pas attribué à votre compte.) : Sur la page **Accès refusé**, cliquez sur `Contacter la FETRAG` : le message « Demande de droits d’accès » est pré-rempli. Le super administrateur attribue le rôle.

## 3. Se repérer dans le back-office <a id="se-reperer"></a>

*La coquille commune du back-office, le tableau de bord Finance et ses sous-sections, sur ordinateur et sur mobile.*

### Écran : Le back-office (toutes les pages « Administration »)

Ce que vous voyez après avoir cliqué sur **Administration du site**.

- **Barre latérale « Administration » (à gauche, sur ordinateur)** : Les rubriques autorisées pour votre rôle : **Pilotage** (Tableau de bord), **Relations** (Newsletter), **Administration** (Utilisateurs et rôles, Organisations, Finance, Rapports, Journal d’audit). Les rubriques Contenus, Services, Événements, Messages reçus, Demandes et Paramètres ne vous sont pas proposées.
- **Bouton **Ouvrir la navigation** (trois traits, en haut à gauche, sur mobile et tablette)** : Ouvre le même menu dans un tiroir. Le bouton **Fermer la navigation** (croix) le referme ; il se referme aussi de lui-même quand vous changez de page.
- **Barre supérieure « Back-office »** : Le titre de la section courante (« Finance », « Journal d’audit »…) et le lien « Voir le site » (masqué sur les petits écrans).
- **Pied de la barre latérale** : Votre nom, votre adresse email et la pastille or **FINANCE / CONTRÔLE**. Le lien « Coordination LMS » y figure mais mène à **Accès refusé** pour votre rôle.
- **Page « Bonjour » (Tableau de bord)** : Vue d’ensemble : pages vues, formulaires reçus, chiffre d’affaires sur 12 mois, carte **Ventes mensuelles** (avec un lien « Finance »), contenus consultés, indicateurs de la plateforme de formation. Le bouton `Rapports détaillés` ouvre les rapports.

### Écran : La page « Finance » (tableau de bord financier)

Votre écran de travail principal.

- **En-tête « Finance »** : Rappel « Commandes, paiements mobile money et remboursements des deux plateformes. Les montants sont exprimés en francs CFA, sans sous-unité. » et bouton `Lancer le rapprochement` à droite.
- **Sous-navigation « Sections de la finance »** : Trois pastilles : `Tableau de bord` (bleue quand active), `Commandes`, `Prises en charge`. Sur mobile, elles passent à la ligne.
- **Quatre tuiles d’indicateurs** : **Chiffre d’affaires du mois**, **Commandes en attente**, **Remboursés sur 12 mois**, **Panier moyen**. Sur mobile, elles s’empilent sur une colonne.
- **Cartes **Chiffre d’affaires mensuel** et **Moyens de paiement**** : Graphique à barres des 12 derniers mois ; anneau des montants encaissés par moyen (Mobile Money, Carte bancaire, Virement, Espèces, Prise en charge, Gratuit) et liste par type d’offre (Formations, Événements, Services, Ressources).
- **Cartes **Dernières commandes** et **Webhooks de paiement**** : Les 6 dernières commandes avec un lien sur la référence et le lien « Toutes les commandes » ; les 8 dernières notifications des opérateurs avec leur badge (Traité, En file, Non vérifié, Erreur).
- **Carte **Exports comptables** et carte marine **Prises en charge**** : Le formulaire d’export CSV (Données, Du, Au, bouton `Exporter`) ; le nombre de prises en charge en cours de validité et le bouton `Gérer les prises en charge`.

Tableau de bord Finance : Menu de gauche › Administration › Finance (`/admin/finance`)

Liste des commandes : Finance › Sections de la finance › Commandes (`/admin/finance/commandes`)

Prises en charge : Finance › Sections de la finance › Prises en charge (`/admin/finance/prises-en-charge`)

Journal d’audit : Menu de gauche › Administration › Journal d’audit (`/admin/audit`)

### Naviguer sur mobile

1. Touchez le bouton **Ouvrir la navigation** (trois traits).
   - Où : en haut à gauche de la barre « Back-office »
   - Résultat attendu : Le tiroir marine s’ouvre avec les mêmes rubriques que sur ordinateur.
2. Touchez **Finance**.
   - Où : rubrique « Administration » du tiroir
   - Résultat attendu : Le tiroir se referme et la page « Finance » s’affiche.
3. Pour un tableau trop large, faites-le glisser vers la gauche.
   - Remarque : Les tableaux défilent horizontalement ; certaines colonnes (Client, Statut, Paiement, Date) sont masquées sur petit écran et rappelées sous la première colonne.

> **Écran de chargement** : Pendant le calcul des indicateurs, la page affiche « Chargement de la finance » avec quatre tuiles grises. Attendez quelques secondes sans recharger.

## 4. Comment suivre les encaissements et repérer une anomalie <a id="suivre-les-encaissements"></a>

*Lire le tableau de bord Finance chaque jour : indicateurs, graphiques, dernières commandes et notifications des opérateurs.*

Le tableau de bord ne se met pas à jour tout seul devant vous : rechargez la page pour voir les dernières opérations. Les indicateurs sont calculés sur les commandes réellement réglées ; une commande en attente n’y compte pas encore.

1. Ouvrez **Finance**.
   - Où : menu de gauche, rubrique « Administration » (sur mobile : bouton **Ouvrir la navigation**)
   - Résultat attendu : La page « Finance » s’affiche, pastille `Tableau de bord` active.
2. Lisez les quatre tuiles.
   - Remarque : **Chiffre d’affaires du mois** = commandes payées ce mois-ci (mois civil). **Commandes en attente** = commandes dont le paiement n’est pas confirmé, avec le montant et le nombre de paiements à confirmer. **Remboursés sur 12 mois** = remboursements traités, avec le nombre de commandes échouées. **Panier moyen** = chiffre d’affaires divisé par le nombre de commandes payées sur 12 mois.
3. Lisez la carte **Chiffre d’affaires mensuel**.
   - Résultat attendu : Un graphique à barres, un mois par barre, et « Total sur la période » en bas.
   - Remarque : Une commande est comptée dans le mois de son règlement, pas dans celui de sa création. Les commandes partiellement remboursées y restent comptées pour leur montant total.
4. Lisez la carte **Moyens de paiement**.
   - Résultat attendu : Un anneau par moyen (Mobile Money, Carte bancaire, Virement, Espèces, Prise en charge, Gratuit) puis la répartition par type d’offre : Formations, Événements, Services, Ressources.
   - Remarque : « Prise en charge » désigne les commandes soldées à 100 % par une prise en charge ; « Gratuit » les offres sans montant. Il n’existe pas de répartition entre le site et la plateforme de formation.
5. Parcourez la carte **Dernières commandes**.
   - Résultat attendu : Six lignes : référence (en lien), client, date, premier article, montant et badge de statut. Le lien « Toutes les commandes » ouvre la liste complète.
6. Contrôlez la carte **Webhooks de paiement**.
   - Où : en bas de la page
   - Résultat attendu : Chaque ligne indique le fournisseur, le type d’événement, la date, l’identifiant externe et un badge. Un badge « N anomalie(s) » en tête de carte signale des lignes en **Erreur** ou **Non vérifié**.
   - Remarque : Un webhook est la notification automatique qu’un opérateur envoie à la plateforme pour dire « ce paiement est réussi » ou « ce paiement a échoué ». Sa signature est vérifiée avant tout traitement.
7. En cas de commandes en attente ou d’anomalie, lancez le rapprochement (section suivante).
   - Où : bouton `Lancer le rapprochement`, en haut à droite

### Badges de la carte Webhooks de paiement

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Traité | Signature vérifiée, notification traitée : le paiement a été mis à jour. | Rien à faire. |
| En file | Signature vérifiée, traitement en attente dans la file des tâches de fond. | Rechargez la page quelques minutes plus tard. |
| Non vérifié | Signature absente ou invalide : la notification n’est jamais traitée, par sécurité. | Lancez le rapprochement pour interroger l’opérateur directement. Si cela se répète, prévenez le super administrateur. |
| Erreur | Notification traitée mais rejetée : « Paiement introuvable », « Montant incohérent : X reçu, Y attendu », « Charge utile invalide » ou « Signature non vérifiée ». | Ouvrez la commande concernée (par l’identifiant externe ou la référence) et vérifiez son paiement. Un montant incohérent n’est jamais appliqué. |

- **Bandeau « Indicateurs indisponibles » en haut de la page.** (cause probable : Le calcul des statistiques a échoué momentanément.) : Les listes de commandes restent accessibles. Réessayez dans quelques instants en rechargeant la page. Si le bandeau persiste plusieurs heures, prévenez le super administrateur.
- **Les tuiles affichent zéro alors que des clients ont payé.** (cause probable : Les paiements sont encore en attente de confirmation par l’opérateur, ou le mois civil vient de commencer.) : Regardez la tuile **Commandes en attente** puis lancez le rapprochement. Vérifiez aussi la carte **Chiffre d’affaires mensuel** pour le mois précédent.
- **La carte Webhooks affiche « Aucun webhook ».** (cause probable : Aucune notification d’opérateur n’a encore été reçue.) : Normal tant qu’aucun paiement en ligne n’a eu lieu. Si des paiements existent, le rapprochement reste le moyen de les confirmer.

## 5. Comment rapprocher les paiements avec les opérateurs <a id="rapprochement"></a>

*Demander aux opérateurs de confirmer les paiements restés en attente, depuis le tableau de bord ou depuis une commande.*

Le **rapprochement** interroge les opérateurs (mobile money, carte) pour connaître le sort réel des paiements restés **En attente**. Il ne concerne que les paiements qui ont une référence chez l’opérateur et dont la dernière mise à jour date de plus de 15 minutes. Il tourne aussi automatiquement en arrière-plan ; le bouton sert à ne pas attendre le prochain passage.

> **Le rapprochement est toujours global** : Que vous le lanciez depuis le tableau de bord ou depuis la fiche d’une commande, il vérifie jusqu’à 100 paiements en attente de toutes les commandes, pas seulement celle affichée. Il ne modifie jamais un paiement déjà réussi.

### Ce que le rapprochement peut produire

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| RÉUSSI | L’opérateur confirme l’encaissement : la commande passe en **PAYÉE**, l’inscription ou la demande est déclenchée, le reçu est émis, le client reçoit « Paiement confirmé ». | Rien à faire. |
| ÉCHOUÉ | L’opérateur ne confirme pas : motif « Paiement non confirmé par le fournisseur (rapprochement) », commande **ÉCHOUÉ**, email « Paiement non abouti » au client. | Le client peut réessayer depuis son espace **Paiements et reçus**. |
| EN ATTENTE | L’opérateur n’a pas encore tranché : le paiement sera revu au cycle suivant. | Patientez ; ne forcez jamais un statut. |

### Depuis le tableau de bord Finance <a id="rapprochement-tableau-de-bord"></a>

1. Ouvrez **Finance**.
   - Où : menu de gauche, rubrique « Administration »
   - Résultat attendu : La tuile **Commandes en attente** indique le nombre de paiements à confirmer.
2. Cliquez sur `Lancer le rapprochement`.
   - Où : en haut à droite de l’en-tête « Finance » (pleine largeur sur mobile)
   - Résultat attendu : Le bouton affiche « Rapprochement en cours ».
3. Lisez le message qui apparaît en bas de l’écran.
   - Résultat attendu : « N paiement(s) vérifié(s), M mis à jour. » ou « Aucun paiement en attente à rapprocher. »
   - Remarque : « Vérifié » signifie interrogé ; « mis à jour » signifie que l’opérateur a donné une réponse définitive (réussi ou échoué).
4. Rechargez la page pour voir les tuiles et les dernières commandes à jour.
   - Résultat attendu : Les commandes confirmées ont quitté la tuile **Commandes en attente**.

### Depuis la fiche d’une commande en attente <a id="rapprochement-commande"></a>

1. Ouvrez la fiche de la commande **EN ATTENTE**.
   - Où : Finance > `Commandes` > lien sur la référence
   - Résultat attendu : Un bandeau bleu indique « Un paiement est en attente de confirmation par le fournisseur. Le rapprochement re-vérifie les paiements en attente depuis plus de 15 minutes. »
2. Cliquez sur `Relancer le rapprochement`.
   - Où : carte **Rapprochement**, colonne de droite (sous le contenu sur mobile) ; le bouton est bleu quand un paiement est en attente
   - Résultat attendu : Message en bas de l’écran : « N paiement(s) vérifié(s), M mis à jour. »
3. Rechargez la fiche.
   - Résultat attendu : Si l’opérateur a confirmé : badge **PAYÉE**, ligne « Paiement SUCCEEDED » dans **Historique**, reçu émis dans la carte **Reçu**. Si le paiement a échoué : badge **ÉCHOUÉ** et motif en rouge dans la carte **Paiements**.
4. Si rien ne change, notez la date et revenez plus tard.
   - Remarque : La carte affiche « Aucun paiement de cette commande n’est en attente. » quand il n’y a plus rien à vérifier.

- **Message « Aucun paiement en attente à rapprocher. » alors que la commande est en attente.** (cause probable : Le paiement a moins de 15 minutes, ou il n’a pas de référence chez l’opérateur (tentative jamais transmise).) : Attendez 15 minutes puis relancez. Sans référence fournisseur, le client doit refaire une tentative de paiement depuis son espace.
- **Le paiement reste en attente après plusieurs rapprochements sur plusieurs jours.** (cause probable : L’opérateur n’a pas conclu la transaction.) : Ne forcez jamais un statut « payée » sans preuve de l’opérateur. Demandez au client de réessayer ; si un débit est visible sur son compte mobile money, contactez l’opérateur avec la référence fournisseur affichée sur la fiche.
- **Message d’erreur rouge « L’opération a échoué. Réessayez dans quelques instants. »** (cause probable : L’opérateur ou la plateforme n’a pas répondu.) : Réessayez plus tard. Si l’erreur persiste une journée entière, prévenez le super administrateur en copiant le message.

## 6. Comment rechercher une commande <a id="rechercher-une-commande"></a>

*Retrouver une commande par sa référence, l’email du client ou le libellé, avec les filtres de statut, d’organisation et de période.*

Une **commande** porte une référence de la forme CMD-AAAA-XXXXXX. Elle regroupe ce que le client a acheté (formation, événement, service ou ressource) et ses tentatives de paiement. La liste des commandes rassemble le site institutionnel et la plateforme de formation.

1. Ouvrez la liste des commandes.
   - Où : Finance > pastille `Commandes` ; ou lien « Toutes les commandes » de la carte **Dernières commandes**
   - Résultat attendu : La page « Commandes » s’affiche avec la barre de filtres et le tableau (20 lignes par page).
2. Saisissez ce que vous cherchez dans **Rechercher**.
   - Remarque : Référence de commande, adresse email du client ou mot du libellé (200 caractères au plus). Ce champ est facultatif.
3. Choisissez éventuellement un **Statut**, une **Organisation** et une **Période de création** (**Du** et **Au**).
   - Remarque : Tous ces filtres sont facultatifs. La date **Au** inclut toute la journée. Sur mobile, les deux dates sont côte à côte.
4. Cliquez sur `Filtrer`.
   - Où : à droite de la barre de filtres (pleine largeur sur mobile)
   - Résultat attendu : Le tableau se limite aux résultats ; « N résultat(s) · 20 par page » s’affiche sous le tableau. Les commandes en attente sont surlignées en jaune pâle.
5. Lisez les colonnes : **Commande** (référence, premier article, « +N » articles), **Client**, **Montant** (avec « remise » en vert), **Statut**, **Paiement** (moyen, fournisseur, référence fournisseur), **Date**.
   - Remarque : Sur mobile, seules les colonnes Commande et Montant restent visibles ; le client et le statut sont rappelés sous la référence. Faites glisser le tableau pour voir le reste.
6. Cliquez sur la référence pour ouvrir la fiche, ou sur le nom du client pour ouvrir sa fiche utilisateur.
   - Résultat attendu : La page « Commande CMD-… » s’affiche.
7. Pour revenir à la liste complète, cliquez sur `Réinitialiser`.
   - Remarque : Ce bouton n’apparaît que si un filtre est actif.

### Statuts d’une commande

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| EN ATTENTE | Commande créée, paiement pas encore confirmé par l’opérateur. Ligne surlignée en jaune. | Lancez le rapprochement après 15 minutes. |
| PAYÉE | Paiement confirmé, commande exécutée (inscription, événement, service), reçu émis. | Rien à faire ; remboursement possible si justifié. |
| ÉCHOUÉ | L’opérateur a refusé ou n’a pas confirmé le paiement. Dans le filtre et les exports : « Échouée ». | Le client peut réessayer depuis son espace. |
| ANNULÉ | Paiement annulé chez l’opérateur ou par le client. Dans le filtre et les exports : « Annulée ». Aucune annulation manuelle n’existe dans le back-office. | Rien à faire. |
| REMBOURSÉ | La totalité de la commande a été remboursée. Dans le filtre et les exports : « Remboursée ». | Rien à faire. |
| PARTIELLEMENT REMBOURSÉE | Au moins un remboursement traité ; le reste a été conservé. | Un nouveau remboursement reste possible dans la limite du reste remboursable. |

- **« Aucune commande ne correspond aux filtres. »** (cause probable : Référence mal saisie, ou période trop étroite.) : Cliquez sur `Réinitialiser` puis cherchez seulement par email du client. Vérifiez que la référence commence bien par CMD-.
- **Le client dit avoir payé mais aucune commande n’apparaît à son nom.** (cause probable : Il a peut-être payé avec un autre compte (autre adresse email), ou la commande n’a jamais été créée.) : Ouvrez **Utilisateurs et rôles**, cherchez son nom, puis regardez la carte **Commandes** de sa fiche. Demandez-lui la référence CMD-… reçue par email.
- **La colonne Paiement affiche « Aucun paiement ».** (cause probable : Le client a créé la commande sans aller au bout du paiement.) : Rien à faire : il peut reprendre le paiement depuis son espace **Paiements et reçus**.

## 7. Comment lire la fiche d’une commande <a id="lire-une-fiche-de-commande"></a>

*Récapitulatif, paiements, livrables, historique, client, reçu et rapprochement : tout ce qu’il faut vérifier avant d’agir.*

1. Lisez l’en-tête « Commande CMD-… ».
   - Résultat attendu : La description indique « Passée le … · réglée le … · pour [nom de l’organisation] » et un grand badge de statut à droite.
2. Vérifiez la carte **Récapitulatif**.
   - Remarque : Chaque ligne indique le libellé, « quantité × prix unitaire » et le type (Formation, Événement, Service, Ressource). Suivent **Sous-total**, **Remise** (en vert, avec « code … » pour un coupon ou « libellé (N %) » pour une prise en charge), **Total** et **Remboursé** (somme des remboursements traités).
3. Lisez la carte **Paiements**.
   - Résultat attendu : Une ligne par tentative : moyen de paiement, fournisseur, référence fournisseur, numéro de téléphone, motif d’échec en rouge, remboursements déjà faits avec leur badge, statut, montant, date et « Confirmé le … ».
   - Remarque : La colonne **Action** (bouton `Rembourser`) n’est visible que pour votre rôle. Sur mobile, la colonne Date est masquée ; faites glisser le tableau.
4. Lisez la carte **Livrables**.
   - Remarque : « Ce que la commande a déclenché une fois réglée » : inscription à la formation, inscription à un événement ou demande de service SRV-…, chacune avec son badge. Le bouton « Plateforme de formation » mène à **Accès refusé** pour votre rôle : c’est normal.
5. Parcourez la carte **Historique**.
   - Résultat attendu : Une frise des changements de statut : ancien badge, nouveau badge, date et commentaire (« Paiement SUCCEEDED (réf) », « Remboursement 5000 XAF : motif »…).
6. Consultez la colonne de droite : cartes **Client**, **Reçu** et **Rapprochement**.
   - Remarque : Sur mobile, cette colonne passe sous le contenu principal. Le nom du client ouvre sa fiche utilisateur ; l’email ouvre votre messagerie ; l’organisation ouvre sa fiche, ou « Commande individuelle » s’affiche.
7. Avant tout remboursement, notez la référence fournisseur et le reste remboursable.
   - Remarque : Le reste remboursable est le montant du paiement moins les remboursements déjà demandés, approuvés ou traités.

### Statuts d’un paiement (carte Paiements)

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| INITIÉ | Tentative créée, pas encore transmise à l’opérateur. | Rien à faire ; le client poursuit ou abandonne. |
| EN ATTENTE | Transmis à l’opérateur, en attente de sa notification ou du rapprochement. Dans les exports : « En attente de confirmation ». | Lancez le rapprochement après 15 minutes. |
| RÉUSSI | Encaissé et confirmé (« Confirmé le … »). Seul statut remboursable. | Bouton `Rembourser` disponible tant que le reste remboursable est supérieur à zéro. |
| ÉCHOUÉ | Refusé par l’opérateur ; le motif s’affiche en rouge. | Le client peut refaire une tentative. |
| ANNULÉ | Interrompu avant confirmation. | Le client peut refaire une tentative. |
| REMBOURSÉ | Paiement intégralement remboursé ; la colonne Action indique « Intégralement remboursé ». | Rien à faire. |

- **Page « Élément introuvable » à l’ouverture d’une commande.** (cause probable : Lien incomplet ou commande inexistante.) : Cliquez sur `Retour au tableau de bord` puis recherchez la commande par sa référence dans la liste.
- **La commande est PAYÉE mais la carte Livrables indique une inscription « En attente ».** (cause probable : L’inscription à la formation attend une validation de la Coordination.) : Ce n’est pas un problème de paiement. Signalez le cas à la Coordination avec la référence de la commande.
- **Deux paiements RÉUSSIS sur la même commande.** (cause probable : Double confirmation par l’opérateur (rare).) : Vérifiez les références fournisseur : si elles diffèrent, le client a été débité deux fois. Remboursez le second paiement avec le motif « Double paiement ».

## 8. Comment rembourser tout ou partie d’un paiement <a id="rembourser-un-paiement"></a>

*L’action la plus sensible de votre rôle : conditions, saisie, résultat, ce que reçoit le client et ce qui est journalisé.*

Un **remboursement** renvoie au client tout ou partie d’un paiement réussi, par l’intermédiaire de l’opérateur qui l’a encaissé. L’application ne vous demande pas d’autorisation préalable : c’est à vous de vous assurer que le remboursement est justifié (décision de la Fédération, annulation d’une formation, double paiement, erreur de montant).

> **Action irréversible** : Un remboursement confirmé ne peut pas être annulé : aucun bouton ne permet de « reprendre » l’argent. Vérifiez la commande, le montant et le motif avant de cliquer sur `Confirmer le remboursement`. Le motif est envoyé au client tel quel et conservé dans le journal d’audit avec votre nom.

### Conditions vérifiées par l’application

- Le paiement doit être au statut **RÉUSSI** et posséder une référence chez l’opérateur.
- Le montant est un nombre entier de francs CFA, au minimum 1 et au maximum le reste remboursable (paiement moins remboursements déjà demandés, approuvés ou traités).
- Le motif comporte entre 3 et 500 caractères.
- Seuls le rôle Finance / contrôle et le super administrateur voient le bouton `Rembourser`.

1. Ouvrez la fiche de la commande.
   - Où : Finance > `Commandes` > lien sur la référence
   - Résultat attendu : La page « Commande CMD-… » s’affiche.
2. Dans la carte **Paiements**, repérez la ligne du paiement **RÉUSSI** et cliquez sur `Rembourser`.
   - Où : colonne **Action**, à droite du tableau (faites glisser le tableau sur mobile)
   - Résultat attendu : Le dialogue **Rembourser le paiement** s’ouvre avec « Commande CMD-… · reste remboursable : N XAF ».
   - Remarque : Si la ligne affiche « Intégralement remboursé » ou un tiret, aucun remboursement n’est possible sur ce paiement.
3. Vérifiez ou modifiez le **Montant (XAF)**.
   - Remarque : Obligatoire. Pré-rempli avec le reste remboursable. Saisissez un nombre entier, sans virgule ; les espaces sont ignorés. Pour un remboursement partiel, saisissez seulement la part à rendre.
4. Saisissez le **Motif**.
   - Remarque : Obligatoire, 3 à 500 caractères. Il est « Transmis au client et conservé dans le journal d’audit ». Écrivez une phrase claire et courtoise : « Formation annulée par la Fédération », « Double paiement constaté le … ».
5. Cliquez sur `Confirmer le remboursement`.
   - Où : bouton rouge en bas du dialogue (pleine largeur sur mobile)
   - Résultat attendu : Le bouton affiche « Remboursement en cours », puis le dialogue se ferme et la page se rafraîchit.
6. Lisez le message vert et vérifiez la fiche.
   - Résultat attendu : « Remboursement de X FCFA traité. » ou « Remboursement de X FCFA transmis au fournisseur. » La ligne du paiement affiche le remboursement avec son badge ; le badge de la commande devient **REMBOURSÉ** ou **PARTIELLEMENT REMBOURSÉE** ; **Historique** ajoute « Remboursement N XAF : motif » ; **Récapitulatif** affiche la ligne **Remboursé**.
7. Contrôlez l’entrée dans le journal d’audit.
   - Où : menu de gauche > **Journal d’audit**, filtre **Action** = Remboursement
   - Résultat attendu : Une ligne avec votre adresse email comme acteur, l’entité **Paiement** et, dans `Détail`, le montant, le motif et la référence fournisseur.

### Statuts d’un remboursement (sous la ligne du paiement)

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Demandé | Remboursement créé, en cours d’envoi à l’opérateur. Il compte déjà dans le reste remboursable. | Rechargez la page. |
| Approuvé | L’opérateur a accepté la demande mais ne l’a pas encore exécutée (message « transmis au fournisseur »). L’application ne fait pas de suivi automatique ensuite. | Notez la référence et vérifiez auprès de l’opérateur si le client ne voit rien après quelques jours. |
| Traité | Remboursement exécuté. Seuls les remboursements traités entrent dans la ligne **Remboursé**, les indicateurs et les exports. | Rien à faire. |
| Refusé | Refusé par l’opérateur ou échec technique. Ne compte pas dans le reste remboursable ; la commande n’est pas modifiée. | Voir « Si ça ne marche pas » ci-dessous. |

> **Ce que reçoit le client** : L’email « Remboursement effectué - commande CMD-… » avec le montant, votre motif et la phrase « Selon votre opérateur, le montant peut apparaître sous quelques jours ouvrés sur votre compte. », ainsi qu’une notification dans son espace. Aucun délai précis n’est garanti par la plateforme : il dépend de l’opérateur.

- **Message « Vérifiez le montant et le motif. » dans le dialogue.** (cause probable : Montant vide, nul, avec des décimales, ou motif de moins de 3 caractères.) : Lisez le texte rouge sous le champ concerné (« Montant strictement positif requis », « Précisez le motif (3 caractères minimum) ») et corrigez.
- **Message « Le montant dépasse le reste remboursable ».** (cause probable : Un remboursement précédent (demandé, approuvé ou traité) a déjà consommé une partie du paiement.) : Saisissez au plus le montant indiqué dans « reste remboursable ».
- **Message « Seul un paiement réussi peut être remboursé » ou « Paiement sans référence fournisseur ».** (cause probable : Le paiement n’a pas été confirmé par l’opérateur, ou la commande a été soldée sans opérateur (prise en charge à 100 %, offre gratuite).) : Rien à rembourser en ligne : aucun argent n’a transité par la plateforme.
- **Message « Le fournisseur a refusé le remboursement ».** (cause probable : L’opérateur a rejeté la demande (délai dépassé, compte du client fermé, solde insuffisant du compte marchand).) : Le remboursement est marqué **Refusé** et la commande reste inchangée. Contactez l’opérateur avec la référence fournisseur ; si le remboursement doit se faire hors ligne, notez-le dans un message au secrétariat général.
- **Message commençant par « Fournisseur … non configuré ».** (cause probable : L’opérateur concerné n’est pas encore raccordé à la plateforme pour les remboursements en ligne.) : Le remboursement est marqué **Refusé**. Prévenez le super administrateur en copiant le message ; le remboursement devra être réalisé hors ligne selon la procédure de la Fédération.
- **Message « Permission insuffisante ».** (cause probable : Votre rôle a été retiré entre-temps, ou votre session a expiré.) : Reconnectez-vous. Si le message persiste, demandez au super administrateur de vérifier vos rôles.

## 9. Comment émettre ou régénérer le reçu d’une commande <a id="emettre-un-recu"></a>

*Le reçu PDF numéroté REC-AAAA-XXXXXX, généré automatiquement après règlement, et comment le retrouver ou le refaire.*

Un **reçu** est émis automatiquement dès qu’un paiement est confirmé : il porte un numéro REC-AAAA-XXXXXX, unique pour la commande, et son PDF est produit en arrière-plan. Il n’existe pas de facture ni de TVA sur la plateforme : le reçu est le seul justificatif remis au client. Le client le télécharge lui-même depuis son espace **Paiements et reçus**.

1. Ouvrez la fiche d’une commande réglée (**PAYÉE**, **PARTIELLEMENT REMBOURSÉE** ou **REMBOURSÉ**).
   - Où : Finance > `Commandes` > référence
   - Résultat attendu : La carte **Reçu** se trouve dans la colonne de droite (sous le contenu sur mobile).
2. Si un numéro REC-… et « Émis le … » sont affichés, cliquez sur `Télécharger le PDF`.
   - Résultat attendu : Le PDF s’ouvre dans un nouvel onglet.
   - Remarque : Le lien de téléchargement est valable 15 minutes ; passé ce délai, rechargez la fiche pour en obtenir un nouveau.
3. Si le bandeau « Le PDF n’est pas encore disponible : son rendu est en file d’attente. » s’affiche, patientez puis rechargez la page.
   - Remarque : Le rendu est effectué par une tâche de fond : le délai dépend de la file d’attente, en général quelques minutes au plus.
4. Si le PDF ne vient toujours pas, cliquez sur `Régénérer le PDF`.
   - Où : carte **Reçu**
   - Résultat attendu : Le bouton affiche « Mise en file », puis le message « Nouveau rendu du reçu REC-… mis en file. » apparaît.
5. Si la carte indique « Aucun reçu émis pour cette commande réglée. », cliquez sur `Émettre le reçu`.
   - Résultat attendu : Message « Reçu REC-… émis ; le PDF est généré en arrière-plan. » Le numéro apparaît sur la fiche.
   - Remarque : Une commande n’a jamais qu’un seul reçu : cliquer deux fois ne crée pas de doublon.

- **Texte « Le reçu ne peut être émis qu’après règlement de la commande. » et aucun bouton.** (cause probable : La commande n’est pas payée.) : Lancez le rapprochement si un paiement est en attente ; sinon, il n’y a rien à émettre.
- **Message « Un reçu ne peut être émis que pour une commande payée » ou « Le reçu ne peut être régénéré que pour une commande réglée ».** (cause probable : Le statut de la commande a changé entre l’affichage et le clic.) : Rechargez la fiche et vérifiez le badge de statut.
- **Le client dit ne pas trouver son reçu.** (cause probable : Il cherche dans ses emails plutôt que dans son espace.) : Indiquez-lui le chemin : menu du compte > **Paiements et reçus** > bouton `Télécharger le PDF`. Le numéro de reçu figure aussi dans l’email « Paiement confirmé ».

## 10. Comment accorder une prise en charge <a id="accorder-une-prise-en-charge"></a>

*Faire financer tout ou partie d’une formation ou d’un événement par la Fédération ou une organisation, pour un bénéficiaire identifié.*

Une **prise en charge** est un pourcentage du montant à payer que la Fédération ou une organisation prend à sa charge pour une personne précise. Elle est déduite automatiquement au moment où le bénéficiaire paie, sur une formation, un événement ou toute l’offre. Elle est active dès son enregistrement : il n’y a pas d’étape de validation dans l’application, la décision doit donc être prise avant la saisie.

> **Décidez avant de saisir** : La prise en charge s’applique dès que vous cliquez sur `Accorder` et le bénéficiaire en est informé aussitôt par email. Assurez-vous d’avoir la décision écrite de la Fédération ou de l’organisation financeuse. L’organisation financeuse est mentionnée à titre d’information sur les commandes : la plateforme ne lui envoie ni facture ni notification.

1. Ouvrez **Prises en charge**.
   - Où : Finance > pastille `Prises en charge` ; ou bouton `Gérer les prises en charge` de la carte marine du tableau de bord
   - Résultat attendu : La page « Prises en charge » s’affiche avec deux tuiles (en cours de validité, accordées) et le tableau.
2. Cliquez sur `Nouvelle prise en charge`.
   - Où : en haut à droite de l’en-tête
   - Résultat attendu : Le dialogue **Accorder une prise en charge** s’ouvre.
3. Saisissez l’**Email du bénéficiaire**.
   - Remarque : Obligatoire. « Le compte doit déjà exister. » et être actif : demandez à la personne de créer son compte avant, si nécessaire.
4. Saisissez le **Libellé**.
   - Remarque : Obligatoire, 3 à 120 caractères. Il apparaît sur la commande du bénéficiaire et dans son email : « Bourse FETRAG 2026 », « Prise en charge » suivi du sigle de l’organisation.
5. Saisissez le **Pourcentage**.
   - Remarque : Obligatoire, nombre entier de 1 à 100 ; 100 par défaut (gratuité totale). Il n’existe pas de plafond en montant : seul le pourcentage est appliqué.
6. Choisissez l’**Organisation financeuse**.
   - Remarque : Facultatif. « Fédération (aucune organisation) » par défaut, sinon l’organisation qui finance.
7. Choisissez la **Portée**.
   - Remarque : Facultatif. « Toutes les formations et tous les événements » par défaut ; sinon une formation publiée (« CODE · Titre ») ou un événement (« Événement · Titre », à venir ou passé depuis moins de 7 jours).
8. Renseignez éventuellement **Valable jusqu’au**.
   - Remarque : Facultatif ; la date doit être dans le futur. « Vide = sans limite de durée. » La prise en charge cesse de s’appliquer dès le début du jour saisi : pour couvrir un jour entier, indiquez le lendemain.
9. Cliquez sur `Accorder`.
   - Où : en bas du dialogue (pleine largeur sur mobile)
   - Résultat attendu : Le bouton affiche « Enregistrement », le dialogue se ferme et le message « Prise en charge de N % accordée à [email]. » s’affiche. Une ligne apparaît dans le tableau avec le badge de taux (or à 100 %, vert sinon) et la validité.
10. Vérifiez l’entrée dans le journal d’audit.
   - Où : **Journal d’audit**, filtre **Entité** = Prise en charge
   - Résultat attendu : Une ligne d’action **Compte modifié** avec l’entité **Prise en charge** et votre email comme acteur.
   - Remarque : Les prises en charge n’ont pas de libellé d’action dédié : elles apparaissent sous « Compte modifié ».

> **Ce qui se passe au paiement du bénéficiaire** : Parmi ses prises en charge valides et applicables à l’offre, la plus favorable (pourcentage le plus élevé) est appliquée automatiquement, après un éventuel code de réduction. La commande affiche « Remise · libellé (N %) ». Si le montant tombe à zéro, la commande est validée immédiatement sans passer par un opérateur, avec le moyen « Prise en charge ».

- **Message « Aucun compte ne correspond à cette adresse. » (et « Compte introuvable » sous le champ).** (cause probable : Le bénéficiaire n’a pas encore de compte, ou utilise une autre adresse email.) : Vérifiez l’adresse dans **Utilisateurs et rôles**. Sinon, demandez-lui de créer son compte puis recommencez.
- **Message « Le compte du bénéficiaire est désactivé ».** (cause probable : Le compte a été désactivé par le super administrateur.) : Demandez au super administrateur de le réactiver avant d’accorder la prise en charge.
- **Message « La date de validité doit être future ».** (cause probable : La date saisie est aujourd’hui ou passée.) : Choisissez une date ultérieure ou laissez le champ vide (sans limite).
- **La formation ou l’événement voulu n’apparaît pas dans **Portée**.** (cause probable : La formation n’est pas publiée, ou l’événement est terminé depuis plus de 7 jours.) : Demandez à la Coordination (formation) ou à l’Éditeur communication (événement) de publier l’offre, ou accordez la prise en charge sur « Toutes les formations et tous les événements ».
- **Le bénéficiaire a payé plein tarif malgré la prise en charge.** (cause probable : Il a payé avant l’enregistrement, avec un autre compte, ou sur une offre hors portée ; ou la prise en charge était expirée.) : Ouvrez sa commande : la ligne **Remise** dit ce qui a été appliqué. Si la décision de prise en charge est avérée, remboursez la part correspondante avec un motif explicite.

### Suivre l’usage des prises en charge <a id="suivre-les-prises-en-charge"></a>

1. Filtrez la liste avec **Rechercher** (bénéficiaire, libellé ou organisation), **Validité** (Toutes, En cours, Expirées) et **Organisation**, puis `Filtrer`.
   - Résultat attendu : La tuile bleue passe à « Prises en charge correspondant aux filtres ».
2. Lisez la colonne **Utilisations**.
   - Remarque : C’est le nombre de commandes où la prise en charge a été appliquée. Sur mobile, cette colonne est masquée : faites glisser le tableau.
3. Cliquez sur le nom du bénéficiaire pour ouvrir sa fiche, puis sa carte **Commandes**.
   - Résultat attendu : Chaque commande concernée affiche la remise « libellé (N %) » dans son récapitulatif.

#### Badges de validité

| Statut | Signification | Ce que vous pouvez faire |
| --- | --- | --- |
| Sans limite | Aucune date de fin : la prise en charge s’applique tant qu’elle n’est pas clôturée. |  |
| Jusqu’au … | Date de fin future : elle cesse de s’appliquer dès le début de ce jour (heure universelle). Pour couvrir un jour entier, saisissez le lendemain. |  |
| Expirée le … | Date de fin passée : elle ne s’applique plus ; la ligne est grisée. |  |
| N % | Taux de prise en charge : badge or à 100 % (gratuité totale), vert sinon. |  |

## 11. Comment clôturer ou supprimer une prise en charge <a id="cloturer-ou-supprimer-une-prise-en-charge"></a>

*Mettre fin à une prise en charge : suppression si elle n’a jamais servi, clôture sinon.*

> **Actions irréversibles** : Une prise en charge supprimée ou clôturée ne peut pas être réactivée : il faudrait en accorder une nouvelle. Les deux actions sont journalisées avec votre nom. Le bénéficiaire n’est pas prévenu par email : informez-le vous-même si nécessaire.

1. Ouvrez **Prises en charge** et retrouvez la ligne.
   - Où : Finance > `Prises en charge` ; champ **Rechercher** puis `Filtrer`
   - Résultat attendu : La ligne affiche, dans la colonne d’actions, `Supprimer` (rouge), `Clôturer` ou le texte « Clôturée ».
2. Si **Utilisations** vaut 0, cliquez sur `Supprimer`.
   - Résultat attendu : Le dialogue « Supprimer la prise en charge « libellé » ? » s’ouvre : « Elle n’a été appliquée à aucune commande ; le bénéficiaire n’en profitera plus. L’opération est journalisée. »
3. Si elle a déjà servi et reste valide, cliquez sur `Clôturer`.
   - Résultat attendu : Le dialogue « Clôturer la prise en charge « libellé » ? » s’ouvre : « Déjà utilisée sur au moins une commande, elle ne peut pas être supprimée : sa validité est ramenée à maintenant. »
4. Relisez le libellé dans le titre du dialogue, puis cliquez sur le bouton rouge `Supprimer` ou `Clôturer`.
   - Résultat attendu : Message « Prise en charge « libellé » supprimée. » ou « Prise en charge « libellé » clôturée. » La ligne clôturée devient grisée avec « Expirée le … » et le texte « Clôturée ».
   - Remarque : `Annuler` ferme le dialogue sans rien changer.
5. Vérifiez l’entrée « Compte modifié » avec l’entité **Prise en charge** dans le journal d’audit.
   - Où : **Journal d’audit**, bouton `Détail` de la ligne
   - Résultat attendu : Les blocs **Avant** et **Après** montrent la validité modifiée ou la suppression.

- **Message « Cette prise en charge a déjà été appliquée à une commande ; limitez plutôt sa validité ».** (cause probable : Vous avez tenté de supprimer une prise en charge utilisée.) : Utilisez `Clôturer` à la place.
- **Message « Cette prise en charge est déjà expirée. »** (cause probable : Sa date de fin est passée : il n’y a rien à clôturer.) : Rien à faire ; elle ne s’applique plus.
- **Ni `Supprimer` ni `Clôturer` n’apparaissent.** (cause probable : La prise en charge est déjà expirée (texte « Clôturée ») ou votre rôle a changé.) : Vérifiez la colonne **Validité**. Si vous n’avez plus la pastille **FINANCE / CONTRÔLE**, contactez le super administrateur.

## 12. Comment exporter les commandes ou les paiements pour la comptabilité <a id="exporter-pour-la-comptabilite"></a>

*Produire un fichier CSV des commandes ou des paiements sur une période, l’ouvrir dans un tableur et le conserver correctement.*

Un **export CSV** est un fichier texte que tout tableur ouvre sous forme de colonnes. Les exports comptables sont réservés à votre rôle. Chaque export est journalisé ; il contient des données personnelles (noms, adresses email) et doit être conservé le temps strictement nécessaire.

1. Ouvrez **Finance** et descendez jusqu’à la carte **Exports comptables**.
   - Où : en bas du tableau de bord Finance
   - Résultat attendu : Le formulaire affiche **Données**, **Du**, **Au** et le bouton `Exporter`, avec la mention « CSV UTF-8 (séparateur point-virgule), 5 000 lignes au plus ; chaque export est journalisé. »
2. Choisissez **Données** : Commandes ou Paiements.
   - Remarque : Commandes = une ligne par commande avec son total, sa remise, son moyen de paiement et son reçu. Paiements = une ligne par tentative de paiement avec son statut, son montant et le remboursé.
3. Renseignez **Du** et **Au**.
   - Remarque : Facultatifs, mais recommandés (par exemple le mois comptable). La date **Au** inclut toute la journée.
4. Cliquez sur `Exporter`.
   - Où : sous le formulaire (pleine largeur sur mobile)
   - Résultat attendu : Le navigateur télécharge « fetrag-commandes-… .csv » ou « fetrag-paiements-… .csv » (nom horodaté).
5. Ouvrez le fichier avec votre tableur.
   - Résultat attendu : Les colonnes décrites dans le tableau ci-dessous apparaissent.
   - Remarque : Fichier UTF-8 avec marque d’ordre, séparateur point-virgule : les accents et les colonnes s’affichent correctement dans les tableurs courants. Les dates sont en heure universelle (UTC) au format ISO ; les montants sont des entiers en francs CFA.
6. Contrôlez l’entrée **Export généré** dans le journal d’audit.
   - Où : **Journal d’audit**, filtre **Action** = Export généré
   - Résultat attendu : Le `Détail` indique le nombre de lignes, la période et si le fichier a été tronqué à 5 000 lignes.
7. Supprimez le fichier de votre appareil une fois transmis à la comptabilité.
   - Remarque : Sur smartphone, le fichier reste dans le dossier « Téléchargements » tant que vous ne l’effacez pas.

*Colonnes des fichiers exportés*

| Export | Colonnes |
| --- | --- |
| Commandes | Référence ; Statut ; Client ; Email ; Organisation ; Lignes (« quantité × libellé \| … ») ; Sous-total ; Remise ; Total ; Devise ; Moyen de paiement ; Fournisseur ; Référence fournisseur ; Reçu ; Créée le ; Payée le |
| Paiements | Identifiant ; Commande ; Client (email) ; Fournisseur ; Référence fournisseur ; Moyen ; Statut ; Montant ; Devise ; Remboursé ; Motif d’échec ; Créé le ; Confirmé le |

> **Limite de 5 000 lignes** : Au-delà de 5 000 lignes, seules les plus récentes sont exportées et aucun avertissement ne s’affiche à l’écran : seul le journal d’audit le signale. Exportez par périodes courtes (un mois) pour être sûr d’avoir tout.

- **Le navigateur affiche un texte du type « error … Permission insuffisante » au lieu d’un fichier.** (cause probable : Votre session a expiré ou le rôle Finance / contrôle vous a été retiré.) : Reconnectez-vous et recommencez. Si le message persiste, contactez le super administrateur.
- **Texte « L’export a échoué. » à la place du fichier.** (cause probable : Erreur momentanée du serveur.) : Réessayez dans quelques instants avec une période plus courte.
- **Les accents sont illisibles ou tout est dans une seule colonne.** (cause probable : Le tableur n’a pas reconnu l’encodage ou le séparateur.) : Importez le fichier en précisant « UTF-8 » et le séparateur « point-virgule ».
- **Le fichier ne contient pas les commandes filtrées par statut ou par organisation depuis la page Commandes.** (cause probable : Le bouton `Exporter (CSV)` de la page **Commandes** n’applique que la période **Du** / **Au** ; les autres filtres sont ignorés.) : Filtrez le fichier dans votre tableur, ou utilisez l’export **Paiements** si vous cherchez un statut de paiement.

### Variante : exporter depuis la page Commandes <a id="exporter-depuis-la-liste-des-commandes"></a>

1. Ouvrez Finance > `Commandes` et renseignez **Période de création** (**Du**, **Au**), puis `Filtrer`.
   - Résultat attendu : La liste affiche les commandes de la période.
2. Cliquez sur `Exporter (CSV)`.
   - Où : en haut à droite de l’en-tête « Commandes »
   - Résultat attendu : Le fichier « fetrag-commandes-… .csv » se télécharge avec les commandes de la période, tous statuts confondus.
3. Pour le journal d’audit ou les rapports, utilisez leurs propres boutons `Exporter (CSV)`, `Indicateurs du site`, `Indicateurs de formation` et `Contenus populaires`.
   - Remarque : Tous ces exports suivent les mêmes règles : point-virgule, UTF-8, 5 000 lignes, journalisation.

## 13. Comment consulter une organisation <a id="consulter-les-organisations"></a>

*Retrouver un syndicat affilié ou un partenaire, ses membres, ses prises en charge et ses commandes réglées, en lecture seule.*

1. Ouvrez **Organisations**.
   - Où : menu de gauche, rubrique « Administration »
   - Résultat attendu : Trois tuiles (« Organisations affiliées », « Partenaires actifs », « Organisations inactives ») et le tableau. Aucun bouton de création : votre accès est en lecture seule.
2. Filtrez par recherche (« Nom, sigle, secteur ou ville »), **Type** (Affiliées, Partenaires), **Secteur** ou **Statut** (Actives, Inactives), puis `Filtrer`.
   - Résultat attendu : Le tableau se limite aux résultats.
3. Cliquez sur le nom de l’organisation.
   - Résultat attendu : La fiche s’ouvre : membres, contacts, coordonnées, demandes de formation, cohortes.
4. Lisez la carte **Activité** dans la colonne de droite.
   - Remarque : La ligne « N commandes réglées · montant » n’est visible que pour votre rôle et la Coordination. Les prises en charge accordées au nom de cette organisation y sont comptées.
5. Cliquez sur `Comptes rattachés` pour voir les membres dans l’annuaire des utilisateurs.
   - Résultat attendu : La liste **Utilisateurs et rôles** s’ouvre filtrée sur l’organisation.

> **Lecture seule** : Désactiver une organisation, nommer un responsable, ajouter ou retirer un membre sont réservés au super administrateur. Le lien « Coordination LMS » d’une demande de formation mène à **Accès refusé** pour votre rôle.

## 14. Comment identifier un client dans l’annuaire <a id="consulter-les-utilisateurs"></a>

*Retrouver un compte, vérifier ses commandes, ses organisations et ses connexions, sans rien modifier.*

1. Ouvrez **Utilisateurs et rôles**.
   - Où : menu de gauche, rubrique « Administration » ; ou bouton `Utilisateurs` en bas du tableau de bord
   - Résultat attendu : Quatre tuiles et le tableau des comptes des deux plateformes. Aucun bouton `Nouveau compte` : lecture seule.
2. Saisissez le nom, l’email ou l’employeur dans la recherche ; filtrez éventuellement par **Rôle**, **Statut** ou **Organisation** ; cliquez sur `Filtrer`.
   - Résultat attendu : Le tableau affiche l’utilisateur, ses rôles, ses organisations, sa sécurité (Actif / Désactivé, badge MFA), sa dernière connexion.
3. Cliquez sur le nom pour ouvrir la fiche.
   - Résultat attendu : L’en-tête indique l’email, la date de création et la dernière connexion ; la carte **Compte** à droite précise « Consultation seule. »
4. Lisez la carte **Commandes**.
   - Résultat attendu : Chaque référence est un lien vers la fiche de commande ; la date, « payée il y a … », le montant et le badge de statut sont rappelés.
5. Si besoin, lisez la carte **Journal d’audit** en bas de la fiche puis cliquez sur « Tout le journal ».
   - Résultat attendu : Le journal d’audit s’ouvre filtré sur cette personne comme acteur.

- **La carte **Profil** indique « Adresse non vérifiée ».** (cause probable : La personne n’a pas cliqué sur le lien de confirmation reçu par email.) : Elle peut demander un nouveau lien depuis la page de connexion (« Renvoyer le lien de confirmation »). Orientez-la vers le Support.
- **Le bouton « Fiche sur la plateforme de formation » mène à **Accès refusé**.** (cause probable : Cette fiche est réservée à la Coordination.) : Normal pour votre rôle : les informations utiles à la finance (commandes, inscriptions) figurent déjà sur la fiche du site.

## 15. Comment contrôler une opération dans le journal d’audit <a id="controler-dans-le-journal-d-audit"></a>

*Retrouver qui a fait quoi, quand, avec quel montant : la trace de référence pour tout contrôle financier.*

Le **journal d’audit** est la trace immuable des actions sensibles : connexions, rôles, paiements, remboursements, prises en charge, exports, publications, paramètres. Personne ne peut le modifier ni le supprimer. Les adresses IP y sont conservées sous forme d’empreinte (une suite de caractères qui ne permet pas de retrouver l’adresse).

1. Ouvrez **Journal d’audit**.
   - Où : menu de gauche, rubrique « Administration »
   - Résultat attendu : Trois tuiles (entrées, types d’action, types d’entité) et le tableau dense des entrées, 20 par page.
2. Choisissez une **Action** (Remboursement, Paiement réussi, Paiement échoué, Commande créée, Export généré, Compte modifié…) ou une **Entité** (Commande, Paiement, Remboursement, Prise en charge…).
   - Remarque : Les listes ne proposent que les valeurs déjà présentes dans le journal.
3. Renseignez éventuellement la **Période** (**Du**, **Au**), le champ **Acteur (email)** ou la recherche (« Identifiant d’entité, email de l’acteur ou corrélation »), puis `Filtrer`.
   - Résultat attendu : La tuile passe à « Entrées correspondant aux filtres ».
   - Remarque : Sur mobile, le champ **Acteur (email)** occupe toute la largeur sous la barre de filtres.
4. Lisez les colonnes **Horodatage**, **Action** (libellé et code technique), **Entité**, **Acteur** (email ou « Système »).
   - Remarque : « Système » désigne les opérations automatiques (confirmation par webhook, rapprochement automatique). Sur mobile, les colonnes Entité, Acteur et Corrélation sont masquées.
5. Cliquez sur `Détail` sur une ligne.
   - Résultat attendu : Les blocs **Avant** et **Après** se déplient : montant, motif, référence fournisseur, statut…
6. Pour conserver la sélection, cliquez sur `Exporter (CSV)`.
   - Où : en haut à droite de l’en-tête
   - Résultat attendu : Le fichier « fetrag-journal-audit-… .csv » se télécharge avec les filtres courants ; cet export est lui-même journalisé.

*Actions du journal utiles au contrôle financier*

| Libellé | Signification | Acteur habituel |
| --- | --- | --- |
| Commande créée | Un client a créé une commande. | Le client |
| Paiement réussi | Un opérateur a confirmé un paiement (webhook ou rapprochement). | Système |
| Paiement échoué | Un opérateur a refusé ou n’a pas confirmé un paiement. | Système |
| Remboursement | Un remboursement a été confirmé : montant, motif, référence fournisseur. | Finance / contrôle |
| Export généré | Un fichier CSV a été produit (commandes, paiements, journal, rapports) : nombre de lignes, période, troncature. | Finance / contrôle, Coordination, Éditeur |
| Compte modifié + entité Prise en charge | Création, clôture ou suppression d’une prise en charge. | Finance / contrôle |
| MFA activée, Connexion, Échec de connexion | Sécurité des comptes. | Chaque utilisateur |

- **Vous ne trouvez pas une prise en charge dans le journal.** (cause probable : Vous avez filtré par une action « Prise en charge » qui n’existe pas.) : Filtrez par **Entité** = Prise en charge ; l’action affichée est « Compte modifié ».
- **« Aucune entrée ne correspond aux filtres. »** (cause probable : Période trop étroite ou email de l’acteur incomplet.) : Cliquez sur `Réinitialiser` puis filtrez d’abord par **Action** seule.
- **Vous cherchez une entrée pour un statut « Annulé » d’une commande.** (cause probable : Les annulations proviennent de l’opérateur ou du client et n’ont pas d’action dédiée.) : Ouvrez la fiche de la commande : la carte **Historique** montre le passage au statut ANNULÉ avec sa date.

## 16. Comment consulter les rapports <a id="consulter-les-rapports"></a>

*Indicateurs d’audience, de conversion des commandes et d’activité de la formation, avec trois exports CSV.*

1. Ouvrez **Rapports**.
   - Où : menu de gauche, rubrique « Administration » ; ou bouton `Rapports détaillés` du tableau de bord
   - Résultat attendu : La page « Rapports » s’affiche : section **Site institutionnel · 30 derniers jours**, section **Plateforme de formation**, carte **Contenus populaires**, carte **Exports CSV**.
2. Lisez la tuile **Conversion des commandes** (« N payées sur M »).
   - Remarque : C’est le rapport entre commandes payées et commandes créées sur 30 jours : un taux faible signale des paiements abandonnés ou échoués.
3. Lisez les indicateurs de la plateforme de formation (apprenants actifs, inscriptions, taux de complétion, certificats) et la carte **Qualité de la formation**.
   - Remarque : Utile pour rapprocher les inscriptions payées et l’activité réelle. Le bouton « Rapports détaillés du LMS » mène à **Accès refusé** pour votre rôle.
4. Pour un export, cliquez sur `Indicateurs du site`, `Indicateurs de formation` ou `Contenus populaires`.
   - Où : carte **Exports CSV** (boutons pleine largeur sur mobile)
   - Résultat attendu : Un fichier « fetrag-rapport-… .csv » se télécharge ; l’export **Indicateurs du site** comprend une synthèse avec Commandes (30 j), Commandes payées (30 j), Chiffre d’affaires (30 j) et Taux de conversion.

- **Bandeau « Indicateurs indisponibles » ou « Indicateurs du site indisponibles. »** (cause probable : Le calcul des statistiques a échoué momentanément.) : Réessayez dans quelques instants. Les exports restent en général possibles.

## 17. Ce qui se passe côté client : le parcours de paiement <a id="parcours-de-paiement-du-client"></a>

*Comprendre les étapes automatiques entre le clic du client et la commande payée, pour interpréter correctement ce que vous voyez.*

*Les étapes d’un paiement en ligne*

| Étape | Ce qui se passe | Ce que vous voyez |
| --- | --- | --- |
| 1. Choix de l’offre | Le client choisit une formation, un événement, un service ou une ressource payante et clique pour payer. Un code de réduction éventuel et sa prise en charge sont appliqués. | Commande CMD-… **EN ATTENTE**, paiement **INITIÉ** puis **EN ATTENTE**. |
| 2. Chez l’opérateur | Le client valide sur son téléphone (mobile money) ou sa carte. L’opérateur garde la main. | Rien de nouveau tant que l’opérateur ne répond pas. |
| 3. Notification (webhook) | L’opérateur envoie une notification signée. Elle est vérifiée, journalisée et mise en file ; les doublons sont ignorés. | Une ligne dans la carte **Webhooks de paiement**. |
| 4. Confirmation | Le statut définitif est appliqué : réussi ou échoué. Si réussi, l’inscription ou la demande est déclenchée, le reçu est émis, l’email « Paiement confirmé » part. | Commande **PAYÉE** (ou **ÉCHOUÉ** / **ANNULÉ**), carte **Livrables** remplie, reçu REC-…. |
| 5. Rattrapage | Si l’opérateur n’a rien envoyé, le rapprochement (automatique ou par votre bouton) l’interroge après 15 minutes. | Message « N paiement(s) vérifié(s), M mis à jour. » |
| 6. Espace du client | Le client retrouve tout dans **Paiements et reçus** : bouton `Payer` pour réessayer, `Télécharger le PDF` pour le reçu. | Une nouvelle tentative crée un nouveau paiement sur la même commande. |

### Règles à retenir

- Un paiement réussi ne peut évoluer que vers remboursé ; un paiement échoué ou annulé peut être retenté par le client.
- Une notification dont le montant ne correspond pas à la commande est ignorée (« Montant incohérent ») : le paiement reste en attente et le rapprochement tranche.
- Une commande n’est jamais créée en double pour un même clic : la plateforme reconnaît les répétitions.
- Les moyens Virement et Espèces apparaissent dans les libellés mais ne peuvent pas être enregistrés à la main depuis le back-office.

## 18. Règles, montants, références et délais <a id="regles-montants-et-delais"></a>

*Les règles imposées par l’application, à connaître avant d’agir ou de répondre à une question.*

*Règles de l’application*

| Sujet | Règle |
| --- | --- |
| Montants | Entiers en francs CFA (XAF), sans centimes ; affichés « 12 500 FCFA ». La devise de chaque commande est reportée dans les exports. |
| TVA et factures | Aucune TVA calculée, aucune facture : seuls des reçus numérotés REC-AAAA-XXXXXX existent, un par commande réglée. |
| Références | Commande CMD-AAAA-XXXXXX ; reçu REC-AAAA-XXXXXX ; demande de service SRV-… ; demande de formation DF-… ; la référence fournisseur est celle de l’opérateur. |
| Remboursement | Paiement RÉUSSI avec référence fournisseur ; montant entier de 1 au reste remboursable ; motif de 3 à 500 caractères ; irréversible ; email au client ; journalisé. |
| Rapprochement | Paiements EN ATTENTE avec référence fournisseur, mis à jour depuis plus de 15 minutes ; 100 par clic ; aussi automatique. |
| Reçu PDF | Rendu en arrière-plan ; lien de téléchargement valable 15 minutes ; émission possible pour PAYÉE, PARTIELLEMENT REMBOURSÉE, REMBOURSÉ. |
| Prise en charge | Bénéficiaire existant et actif ; libellé 3 à 120 caractères ; pourcentage entier 1 à 100 ; date de fin facultative, future ; active immédiatement ; suppression seulement si jamais utilisée, sinon clôture. |
| Codes de réduction | Vérifiés au paiement (actif, période, quota) ; appliqués avant la prise en charge ; visibles sur la commande « Remise · code … » ; aucune gestion depuis le back-office. |
| Exports CSV | UTF-8, point-virgule, 5 000 lignes au plus (les plus récentes), nom horodaté, journalisés ; contiennent des données personnelles. |
| Listes | 20 lignes par page ; recherche de 200 caractères au plus ; `Réinitialiser` visible seulement avec un filtre actif ; la date « Au » inclut toute la journée. |
| Dates | Stockées en heure universelle (UTC), affichées en heure de Libreville ; les CSV exportent l’heure universelle. |
| Délais de crédit | Le remboursement apparaît chez le client « sous quelques jours ouvrés » selon l’opérateur ; la plateforme ne garantit aucun délai. |

> **Ne jamais forcer un statut** : Aucun écran ne permet de marquer une commande « payée » à la main, et c’est voulu : seule la confirmation de l’opérateur fait foi. Si un client présente une preuve de débit sans commande payée, lancez le rapprochement, puis contactez l’opérateur avec la référence fournisseur. Ne promettez jamais une inscription ou un service avant confirmation.

## 19. Notifications et emails <a id="notifications"></a>

*Ce que vous recevez (peu de choses) et ce que reçoivent les clients à la suite de vos actions.*

> **Aucune alerte automatique pour votre rôle** : L’application n’envoie aucun email ni notification spécifique à Finance / contrôle : pas d’alerte pour un paiement en attente, un webhook en erreur ou un remboursement resté « Approuvé ». Le contrôle repose sur votre consultation régulière du tableau de bord Finance, idéalement chaque jour ouvré.

*Emails et notifications déclenchés par vos actions ou par le système*

| Sujet | Destinataire | Déclencheur | Ce que vous devez faire |
| --- | --- | --- | --- |
| « Paiement confirmé - commande CMD-… » | Le client | Le paiement passe RÉUSSI (webhook ou rapprochement). Contient le montant, le moyen, le numéro de reçu et le bouton « Voir ma commande et mon reçu ». | Rien. Cet email est essentiel : le client ne peut pas le désactiver. |
| « Paiement non abouti - commande CMD-… » | Le client | Le paiement passe ÉCHOUÉ. « Aucun montant n’a été prélevé… », motif et bouton « Réessayer le paiement ». | Rien, sauf si le client conteste : vérifiez alors la fiche de la commande. |
| « Remboursement effectué - commande CMD-… » | Le client | Vous confirmez un remboursement. Contient le montant et votre motif. | Relisez votre motif avant de confirmer : il part tel quel. |
| « Prise en charge accordée » | Le bénéficiaire (email et notification dans son espace) | Vous cliquez sur `Accorder`. Indique le pourcentage, le libellé et la validité. | Prévenez vous-même le bénéficiaire en cas de clôture ou de suppression : aucun email n’est envoyé dans ces cas. |
| Messages en bas de l’écran (« toasts ») | Vous | Rapprochement, reçu, clôture ou suppression d’une prise en charge. | Lisez-les avant qu’ils ne disparaissent ; en cas de doute, rechargez la page. |
| Messages dans les dialogues | Vous | Dialogues **Rembourser le paiement** et **Accorder une prise en charge** : bandeau vert (succès) ou rouge (erreur) dans le dialogue. | Corrigez la saisie signalée sous le champ. |
| Entrées du journal d’audit | Vous et le super administrateur | Remboursement, Export généré, Compte modifié (prises en charge), Paiement réussi / échoué, Commande créée. | Consultez-les pour tout contrôle ; elles sont votre preuve. |

## 20. Bonnes pratiques et sécurité <a id="bonnes-pratiques"></a>

*Les réflexes qui protègent l’argent de la Fédération, les données des membres et votre propre responsabilité.*

- [x] Activez la vérification en deux étapes dès votre première connexion et rangez vos codes de secours hors de votre téléphone.
- [x] Déconnectez-vous (menu du compte > **Déconnexion** > `Confirmer la déconnexion`) sur tout appareil partagé ou prêté, et fermez le navigateur.
- [x] Ne partagez jamais votre mot de passe ni vos codes : votre nom est inscrit dans le journal d’audit pour chaque remboursement, prise en charge et export.
- [x] Consultez le tableau de bord Finance chaque jour ouvré : commandes en attente, webhooks en anomalie, remboursements approuvés non traités.
- [x] Lancez le rapprochement avant de conclure qu’un paiement a échoué ; attendez 15 minutes après la tentative du client.
- [x] Ne forcez jamais un statut et ne promettez jamais un service avant la confirmation de l’opérateur.
- [x] Avant un remboursement, relisez la référence de la commande, la référence fournisseur, le montant et le motif ; gardez la décision écrite (email, procès-verbal) qui le justifie.
- [x] Rédigez des motifs de remboursement courtois et factuels : ils sont envoyés au client.
- [x] Accordez une prise en charge seulement sur décision écrite de la Fédération ou de l’organisation financeuse ; fixez une date de fin quand la décision en prévoit une.
- [x] Exportez par périodes courtes, conservez les fichiers CSV le temps strictement nécessaire, ne les envoyez qu’aux personnes habilitées et supprimez-les ensuite : ils contiennent des noms et des adresses email.
- [x] Les données financières et l’appartenance syndicale sont confidentielles : n’en discutez ni par messagerie instantanée ni sur un appareil non protégé.
- [x] En cas de doute sur une opération (double paiement, contestation), consultez d’abord la fiche de la commande et le journal d’audit, puis écrivez au secrétariat général avec les références.
- [x] Signalez au super administrateur toute anomalie répétée : webhooks « Non vérifié », erreurs de montant, message « Fournisseur … non configuré ».

## 21. Questions fréquentes <a id="questions-frequentes"></a>

**Un client dit avoir payé mais sa commande est toujours « EN ATTENTE ». Que faire ?**

Attendez 15 minutes après sa tentative, puis cliquez sur `Lancer le rapprochement` (tableau de bord Finance) ou `Relancer le rapprochement` (fiche de la commande). Si l’opérateur confirme, la commande passe PAYÉE et le client reçoit « Paiement confirmé ». Si rien ne change après plusieurs jours, contactez l’opérateur avec la référence fournisseur affichée dans la carte **Paiements**. Ne forcez jamais le statut.

**Puis-je annuler un remboursement fait par erreur ?**

Non. Un remboursement confirmé est définitif. Si le client doit finalement payer, il devra passer une nouvelle commande. Vérifiez toujours le montant et le motif dans le dialogue avant de cliquer sur `Confirmer le remboursement`.

**Puis-je rembourser une partie seulement d’un paiement ?**

Oui. Dans le dialogue **Rembourser le paiement**, remplacez le montant pré-rempli par la part à rendre (nombre entier, au plus le reste remboursable). La commande passe en **PARTIELLEMENT REMBOURSÉE** ; un autre remboursement reste possible plus tard, dans la limite du reste.

**Le remboursement est « Approuvé » depuis plusieurs jours et le client ne voit rien. Est-ce normal ?**

Le statut **Approuvé** signifie que l’opérateur a accepté la demande sans l’avoir encore exécutée, et l’application ne fait pas de suivi automatique ensuite. Vérifiez auprès de l’opérateur avec la référence fournisseur. Le délai de crédit dépend uniquement de l’opérateur.

**Puis-je marquer une commande comme payée après un virement ou un paiement en espèces ?**

Non. Le back-office ne permet pas d’enregistrer un paiement hors ligne : seuls les opérateurs confirment un paiement, et les moyens « Virement » et « Espèces » ne peuvent pas être saisis à la main. Si la Fédération accepte un règlement hors ligne, la commande en ligne reste en attente ou échoue : adressez le cas au secrétariat général, qui décide de la suite à donner, en indiquant la référence de la commande.

**Comment retrouver toutes les commandes d’une organisation ?**

Finance > `Commandes`, liste **Organisation**, puis `Filtrer`. La fiche de l’organisation (menu **Organisations**) affiche aussi « N commandes réglées · montant » dans sa carte **Activité**.

**Pourquoi le bouton « Coordination LMS » ou « Rapports détaillés du LMS » affiche-t-il « Accès refusé » ?**

Ces écrans appartiennent à la Coordination sur la plateforme de formation. Votre rôle ne s’applique qu’au site institutionnel ; ce n’est pas une erreur. Les informations financières de la plateforme de formation sont déjà dans Finance et Rapports.

**Pourquoi le bouton « Exporter (CSV) » de la page Newsletter me renvoie-t-il une erreur ?**

La consultation des abonnés vous est ouverte, mais l’export et la suppression exigent un droit que votre rôle n’a pas (message « Permission insuffisante »). C’est le Support ou le super administrateur qui s’en charge.

**Où puis-je créer un code de réduction ou changer un tarif ?**

Nulle part dans votre rôle. Les tarifs des événements, ressources et services sont saisis par l’Éditeur communication, ceux des formations par la Coordination. Les codes de réduction n’ont pas d’écran de gestion : la remise d’un code apparaît seulement sur la commande.

**Existe-t-il une facture avec TVA ?**

Non. La plateforme émet uniquement un reçu numéroté REC-AAAA-XXXXXX par commande réglée, en PDF, sans TVA. Si un client a besoin d’un autre document, adressez-le au secrétariat général.

**Comment savoir qui a accordé une prise en charge ?**

Dans le tableau **Prises en charge**, la colonne **Accordée** indique la date et le nom de l’auteur (masquée sur mobile : faites glisser le tableau). Le journal d’audit le confirme sous l’action « Compte modifié », entité **Prise en charge**.

**Mon export est incomplet. Pourquoi ?**

Les exports sont limités à 5 000 lignes, les plus récentes, sans avertissement à l’écran. Réduisez la période (un mois à la fois). Le journal d’audit indique si un export a été tronqué.

**Les dates du fichier CSV ne correspondent pas à l’heure affichée à l’écran.**

Les fichiers exportent l’heure universelle (UTC), l’écran affiche l’heure de Libreville (une heure de plus). Ajoutez une heure aux dates du fichier pour retrouver l’heure locale.

## 22. Lexique <a id="lexique"></a>

- **Back-office** : L’espace d’administration du site institutionnel, ouvert par **Administration du site** dans le menu du compte. Chaque rôle n’y voit que ses rubriques.
- **Commande** : L’achat d’un client (formation, événement, service ou ressource), référencé CMD-AAAA-XXXXXX, avec ses lignes, son total, ses remises et ses tentatives de paiement.
- **Paiement** : Une tentative de règlement d’une commande auprès d’un opérateur. Une commande peut avoir plusieurs paiements (échecs puis réussite).
- **Opérateur (ou fournisseur de paiement)** : Le service qui encaisse réellement l’argent : mobile money, carte bancaire. C’est lui qui confirme ou refuse un paiement et qui exécute un remboursement.
- **Référence fournisseur** : L’identifiant de la transaction chez l’opérateur, affiché à côté du moyen de paiement. Indispensable pour toute réclamation auprès de l’opérateur.
- **Webhook** : La notification automatique envoyée par un opérateur à la plateforme pour annoncer le résultat d’un paiement. Sa signature est vérifiée avant tout traitement ; sinon elle est marquée « Non vérifié » et ignorée.
- **Rapprochement** : L’interrogation des opérateurs pour connaître le sort des paiements restés en attente depuis plus de 15 minutes. Automatique en arrière-plan, et déclenchable par le bouton `Lancer le rapprochement`.
- **Remboursement** : Le renvoi au client de tout ou partie d’un paiement réussi, exécuté par l’opérateur à votre demande. Irréversible, journalisé, annoncé au client par email.
- **Reste remboursable** : Le montant du paiement moins les remboursements déjà demandés, approuvés ou traités. C’est le maximum que vous pouvez saisir dans le dialogue de remboursement.
- **Prise en charge** : Un pourcentage du montant à payer financé par la Fédération ou une organisation pour un bénéficiaire précis, sur une formation, un événement ou toute l’offre. Appliquée automatiquement au paiement.
- **Code de réduction (coupon)** : Un code saisi par le client au moment de payer, qui applique une remise en pourcentage ou en montant fixe. Il est appliqué avant la prise en charge et n’a pas d’écran de gestion.
- **Reçu** : Le justificatif numéroté REC-AAAA-XXXXXX, en PDF, émis automatiquement pour chaque commande réglée. Il n’existe pas de facture.
- **Livrables** : Ce qu’une commande déclenche une fois payée : inscription à une formation, inscription à un événement, demande de service.
- **Panier moyen** : Le chiffre d’affaires divisé par le nombre de commandes payées sur la période (12 mois).
- **Export CSV** : Un fichier texte de données séparées par des points-virgules, lisible par un tableur. Les exports de la plateforme sont en UTF-8, limités à 5 000 lignes et journalisés.
- **Journal d’audit** : La trace immuable des actions sensibles : qui, quoi, quand, avec les états avant et après. Personne ne peut le modifier.
- **Empreinte IP** : La forme abrégée et non réversible sous laquelle l’adresse Internet d’un utilisateur est conservée dans le journal d’audit.
- **Corrélation** : Un identifiant technique qui relie plusieurs entrées du journal d’audit issues de la même opération.
- **Vérification en deux étapes (MFA)** : Un code temporaire à 6 chiffres, produit par une application d’authentification sur votre téléphone, demandé en plus du mot de passe à chaque connexion. Exigée pour votre rôle.
- **Codes de secours** : Des codes à usage unique remis lors de l’activation de la vérification en deux étapes, pour se connecter sans l’application. Affichés une seule fois.
- **Session unique (SSO)** : Une seule connexion vaut pour le site institutionnel et la plateforme de formation ; la déconnexion ferme les deux.
- **XAF / FCFA** : Le franc CFA, monnaie de toutes les commandes. Il n’a pas de centimes : tous les montants sont des nombres entiers.
- **UTC / heure de Libreville** : Les dates sont stockées en heure universelle (UTC) et affichées en heure de Libreville (UTC plus une heure). Les fichiers CSV exportent l’heure universelle.
- **Toast** : Le petit message qui apparaît quelques secondes en bas de l’écran après une action (rapprochement, reçu, clôture).

## 23. Besoin d’aide ? <a id="besoin-d-aide"></a>

*À qui s’adresser selon le problème, et ce qu’il faut indiquer dans votre message.*

*Qui contacter*

| Problème | Interlocuteur |
| --- | --- |
| Rôle manquant, vérification en deux étapes perdue, compte désactivé, erreur technique répétée, message « Fournisseur … non configuré », webhooks « Non vérifié » à répétition | Super administrateur (via le formulaire de contact du site ou l’email de la Fédération) |
| Un client n’arrive pas à se connecter, ne reçoit pas ses emails, ne trouve pas son reçu | Support (assistance de premier niveau) ; vous ne traitez que la partie paiement |
| Inscription à confirmer après paiement, tarif d’une formation, prise en charge pour une cohorte | Coordination |
| Tarif erroné sur un événement, une ressource ou un service | Éditeur communication |
| Demande de service payée mais non traitée | Responsable services |
| Autorisation d’un remboursement litigieux, décision de bourse, règlement hors ligne, document autre qu’un reçu | Secrétariat général de la Fédération |
| Paiement débité chez le client sans confirmation, remboursement « Approuvé » non crédité | L’opérateur de paiement, avec la référence fournisseur |

### Coordonnées de la Fédération

- [Formulaire de contact du site](/contact) : Pour joindre le support et la coordination ; choisissez l’objet qui correspond à votre demande.
- [Écrire à la Fédération](mailto:jossngomafm@gmail.com) : Adresse email de la Fédération (secrétariat général).
- [Appeler : 066 23 00 33](tel:+24166230033) : Premier numéro de la Fédération.
- [Appeler : 077 52 27 98](tel:+24177522798) : Second numéro de la Fédération.

Adresse postale : BP 1234 Libreville, Gabon.

### Ce qu’il faut indiquer dans un message d’aide

- [x] L’adresse email de votre compte (jamais votre mot de passe ni vos codes).
- [x] L’écran concerné (par exemple « Finance > Commandes > fiche de la commande ») et l’appareil utilisé (téléphone ou ordinateur).
- [x] La référence de la commande (CMD-…), du reçu (REC-…) ou la référence fournisseur, si le problème concerne un paiement.
- [x] Le message d’erreur exact, recopié mot pour mot, et l’heure approximative de l’action.
- [x] Ce que vous avez déjà tenté (rapprochement lancé, page rechargée, reconnexion).

> **Avant d’écrire** : Rechargez la page, vérifiez la fiche de la commande et le journal d’audit : la réponse s’y trouve souvent (paiement encore en attente, remboursement refusé par l’opérateur, prise en charge expirée).

## Testez votre maîtrise <a id="autoevaluation"></a>

Vingt questions pour vérifier que vous savez où agir, ce que signifient les statuts, ce qui est irréversible et à qui vous adresser. Comptez dix minutes ; le corrigé renvoie à la section du guide. Seuil de maîtrise : 70 % de bonnes réponses. 20 questions.

1. Qui peut cliquer sur `Rembourser` sur la fiche d’une commande ? *(une seule réponse)*
   - a) Le rôle Finance / contrôle (et le super administrateur).
   - b) La Coordination et le Support.
   - c) Le client lui-même, depuis son espace.

2. Vous pouvez marquer à la main une commande comme « payée » après un virement reçu par la Fédération. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

3. Après l’activation de la vérification en deux étapes, que devez-vous conserver en lieu sûr ? *(une seule réponse)*
   - a) Les codes de secours, affichés une seule fois.
   - b) Le QR code, à scanner à chaque connexion.
   - c) Rien : tout est enregistré dans votre profil.

4. Vous avez perdu votre téléphone et vos codes de secours. Qui peut réinitialiser votre vérification en deux étapes ? *(une seule réponse)*
   - a) Le Support, par le formulaire de contact.
   - b) Le super administrateur, depuis votre fiche utilisateur.
   - c) Vous-même, en cliquant sur Mot de passe oublié ?.

5. Sur un smartphone, comment ouvrez-vous le menu du back-office ? *(une seule réponse)*
   - a) Avec le bouton Ouvrir la navigation (trois traits), en haut à gauche.
   - b) En touchant vos initiales, en haut à droite.
   - c) Avec le lien Voir le site.

6. Dans la carte Webhooks de paiement, que signifie le badge « Non vérifié » ? *(une seule réponse)*
   - a) Le client n’a pas encore validé sur son téléphone.
   - b) La signature de la notification est absente ou invalide : elle n’est jamais traitée.
   - c) Le montant reçu ne correspond pas à la commande.

7. Quels paiements le rapprochement re-vérifie-t-il ? (plusieurs réponses) *(plusieurs réponses possibles)*
   - a) Les paiements EN ATTENTE qui ont une référence fournisseur.
   - b) Les paiements mis à jour depuis plus de 15 minutes.
   - c) Les paiements déjà RÉUSSIS, pour vérifier le montant.
   - d) Les paiements ÉCHOUÉS, pour les relancer.

8. Dans la liste des commandes, que signifie une ligne surlignée en jaune pâle ? *(une seule réponse)*
   - a) La commande est en attente de confirmation du paiement.
   - b) La commande a été remboursée.
   - c) La commande contient une remise.

9. Qu’est-ce que le « reste remboursable » d’un paiement ? *(une seule réponse)*
   - a) Le total de la commande moins la remise.
   - b) Le montant du paiement moins les remboursements déjà demandés, approuvés ou traités.
   - c) Le montant du paiement moins les remboursements refusés.

10. Un remboursement confirmé par erreur peut être annulé depuis la fiche de la commande. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

11. Quel statut de paiement permet un remboursement ? *(une seule réponse)*
   - a) EN ATTENTE
   - b) RÉUSSI
   - c) ÉCHOUÉ

12. Que devient le motif saisi dans le dialogue Rembourser le paiement ? *(une seule réponse)*
   - a) Il est transmis au client par email et conservé dans le journal d’audit.
   - b) Il reste visible uniquement par vous.
   - c) Il est facultatif et n’est enregistré nulle part.

13. Combien de temps le lien `Télécharger le PDF` d’un reçu reste-t-il valable ? *(une seule réponse)*
   - a) 15 minutes ; il suffit de recharger la fiche pour en obtenir un nouveau.
   - b) 24 heures.
   - c) Sans limite de durée.

14. À partir de quand une prise en charge s’applique-t-elle aux paiements du bénéficiaire ? *(une seule réponse)*
   - a) Après validation par la Coordination.
   - b) Dès que vous cliquez sur Accorder.
   - c) Après la première commande du bénéficiaire.

15. Une prise en charge a déjà été appliquée à une commande. Quelle action vous est proposée pour y mettre fin ? *(une seule réponse)*
   - a) Supprimer
   - b) Clôturer : sa validité est ramenée à maintenant.
   - c) Modifier le pourcentage à 0.

16. Qu’est-ce qui est vrai des exports CSV comptables ? (plusieurs réponses) *(plusieurs réponses possibles)*
   - a) Ils sont limités à 5 000 lignes, les plus récentes.
   - b) Le séparateur est le point-virgule.
   - c) Chaque export est journalisé dans le journal d’audit.
   - d) Ils ne contiennent aucune donnée personnelle.

17. Sous quelle action retrouvez-vous une prise en charge dans le journal d’audit ? *(une seule réponse)*
   - a) « Compte modifié », avec l’entité Prise en charge.
   - b) « Remboursement ».
   - c) « Prise en charge accordée ».

18. Le rôle Finance / contrôle reçoit un email d’alerte pour chaque webhook en erreur ou paiement en attente. *(vrai ou faux)*
   - a) Vrai
   - b) Faux

19. Comment les montants sont-ils exprimés sur la plateforme ? *(une seule réponse)*
   - a) En nombres entiers de francs CFA (XAF), sans centimes.
   - b) En francs CFA avec deux décimales et TVA.
   - c) En euros convertis au jour du paiement.

20. Un remboursement est « Approuvé » depuis plusieurs jours et le client n’a rien reçu. À qui vous adressez-vous ? *(une seule réponse)*
   - a) Au Support, pour qu’il relance le client.
   - b) À l’opérateur de paiement, avec la référence fournisseur.
   - c) À l’Éditeur communication.

### Corrigé

1. **a** : Le remboursement est réservé au rôle Finance / contrôle : voir « Votre rôle en bref ».
2. **b** : Aucun écran ne permet de forcer un statut : seule la confirmation de l’opérateur fait foi. Voir « Votre rôle en bref » et « Règles, montants, références et délais ».
3. **a** : Chaque code de secours permet de se connecter une fois si vous perdez votre téléphone : voir « Avant de commencer ».
4. **b** : Seul le super administrateur peut réinitialiser la MFA d’un compte : voir « Si ça ne marche pas » dans « Avant de commencer ».
5. **a** : Sous 1024 px, la barre latérale devient un tiroir ouvert par le bouton Ouvrir la navigation : voir « Se repérer dans le back-office ».
6. **b** : Une notification non vérifiée est ignorée par sécurité ; seul le rapprochement peut rattraper le paiement. Voir « Comment suivre les encaissements et repérer une anomalie ».
7. **a, b** : Le rapprochement ne concerne que les paiements en attente, avec référence fournisseur, de plus de 15 minutes ; il ne modifie jamais un paiement réussi. Voir « Comment rapprocher les paiements avec les opérateurs ».
8. **a** : Les commandes EN ATTENTE sont surlignées : voir « Comment rechercher une commande ».
9. **b** : Un remboursement Refusé ne compte pas ; les autres réduisent le reste remboursable. Voir « Comment lire la fiche d’une commande ».
10. **b** : Le remboursement est irréversible : aucun bouton ne permet de reprendre l’argent. Voir « Comment rembourser tout ou partie d’un paiement ».
11. **b** : Seul un paiement RÉUSSI avec une référence fournisseur peut être remboursé : voir « Comment rembourser tout ou partie d’un paiement ».
12. **a** : Le motif est obligatoire (3 à 500 caractères), envoyé au client et journalisé : voir « Comment rembourser tout ou partie d’un paiement ».
13. **a** : Le lien de téléchargement est signé et valable 15 minutes : voir « Comment émettre ou régénérer le reçu d’une commande ».
14. **b** : Il n’y a pas d’étape de validation : la prise en charge est active immédiatement et le bénéficiaire est informé par email. Voir « Comment accorder une prise en charge ».
15. **b** : La suppression n’est possible que si la prise en charge n’a jamais servi : voir « Comment clôturer ou supprimer une prise en charge ».
16. **a, b, c** : Les exports contiennent des noms et des adresses email et doivent être supprimés après usage : voir « Comment exporter les commandes ou les paiements pour la comptabilité ».
17. **a** : Les prises en charge n’ont pas de libellé d’action dédié : filtrez par Entité = Prise en charge. Voir « Comment contrôler une opération dans le journal d’audit ».
18. **b** : Aucune alerte automatique n’est envoyée à votre rôle : le contrôle repose sur la consultation régulière du tableau de bord Finance. Voir « Notifications et emails ».
19. **a** : Le franc CFA n’a pas de sous-unité et aucune TVA n’est calculée : voir « Règles, montants, références et délais ».
20. **b** : L’application ne fait pas de suivi automatique après « Approuvé » ; l’opérateur seul peut répondre. Voir « Besoin d’aide ? ».

## Guides liés

- [Guide du membre](/espace/guide) : Votre compte et votre espace personnel, dont la page Paiements et reçus telle que la voient les clients.
- [Guide de l’apprenant](https://formation.fetrag.ga/guide) : La plateforme de formation, où votre rôle n’a pas d’espace particulier.
