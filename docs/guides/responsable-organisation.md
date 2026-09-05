# Guide du responsable d'organisation (ORG_MANAGER)

Ce guide s'adresse aux responsables des organisations affiliées ou partenaires (syndicats de base, fédérations sectorielles, entreprises partenaires) qui sollicitent une formation FETRAG pour leurs cadres et suivent leurs participants. Compte de démonstration : `responsable@synatep-demo.ga` (organisation fictive SYNATEP).

Vous n'accédez qu'aux données de **votre** organisation (LMS-09) : demandes, participants, progression, résultats et documents.

## 1. Obtenir un accès

1. Si la FETRAG a créé votre compte, vous avez reçu un email de bienvenue avec un lien d'initialisation du mot de passe. Sinon, créez un compte sur `https://fetrag.ga/inscription` (prénom, nom, email, téléphone, mot de passe de 8 caractères minimum avec une majuscule et un chiffre, nom de votre organisation) puis demandez à la coordination (`https://fetrag.ga/contact`, objet « Accès responsable d'organisation ») de vous rattacher comme responsable.
2. Connexion : `https://formation.fetrag.ga/connexion` (ou `https://fetrag.ga/connexion` : la même identité ouvre les deux sites).
3. Votre tableau de bord : `https://formation.fetrag.ga/organisation`. Il présente : demandes en cours et leur statut, participants inscrits et progression moyenne, prochaines sessions, certificats obtenus, documents (rapports).

## 2. Soumettre une demande de formation

Le formulaire suit le processus institutionnel de la FETRAG (chapitre 14 du CDC) : `https://formation.fetrag.ga/demande-formation`.

1. **Organisation et personne ressource** : votre organisation est présélectionnée ; vérifiez les coordonnées (nom, fonction, email, téléphone) de la personne qui suivra le dossier.
2. **Modules** : cochez un ou plusieurs modules parmi les dix du Programme de formation des Leaders Syndicaux 2026 (01 Fondamentaux du Syndicalisme Gabonais ... 10 Santé, Sécurité et Conditions de Travail). Chaque carte indique la durée et le pilier (Protection, Prévention, Défense).
3. **Participants** : désignez nominativement les cadres à former (nom complet, email, téléphone, fonction). La limite par demande est affichée (10 par défaut). Un participant sans email recevra ses identifiants par votre intermédiaire.
4. **Période et modalité souhaitées** : date de début indicative, présentiel / classe virtuelle / hybride, motivation (contexte, attentes).
5. **Engagements** : lisez et acceptez les engagements de l'organisation (assiduité des participants, conditions matérielles, communication des résultats). La case est obligatoire.
6. **Pièce officielle** (facultatif selon le cas) : lettre de demande signée, liste des participants tamponnée (PDF, JPEG, PNG, Word ; 10 Mo maximum).
7. « Enregistrer le brouillon » pour compléter plus tard, ou « Soumettre ». Un accusé de réception est envoyé par email et la demande obtient une référence (`DEM-AAAA-XXXXXX`).

## 3. Suivre une demande

`https://formation.fetrag.ga/organisation/demandes/<id>` (ou `/demande-formation/<id>`). L'historique affiche chaque décision de la coordination avec sa date et son commentaire.

| Statut | Signification | Action attendue de votre part |
| --- | --- | --- |
| Brouillon | Non envoyée | Compléter et soumettre |
| Soumise | En cours d'examen par la coordination (délai indicatif : 5 jours ouvrés) | Aucune |
| Complément demandé | La coordination attend une précision ou une pièce | Modifier la demande (participants, pièce, motivation) puis « Resoumettre » |
| Autre date proposée | La coordination propose une autre période ou modalité | « Accepter la proposition » ou « Refuser » (avec commentaire) |
| Acceptée | Demande validée, planification en cours | Aucune |
| Refusée | Motif indiqué dans l'historique | Possibilité de soumettre une nouvelle demande |
| Planifiée | Cohorte créée, participants inscrits, convocations envoyées | Transmettre les convocations aux participants sans email |
| Formation en cours | Sessions démarrées | Suivre la progression |
| Terminée | Cohorte clôturée, certificats émis selon éligibilité | Télécharger le rapport |
| Annulée | Annulée par vous ou par la coordination | - |

Vous pouvez annuler une demande tant qu'elle n'est pas planifiée (« Annuler la demande », motif demandé).

## 4. Participants

`https://formation.fetrag.ga/organisation/participants` : liste de tous les membres de votre organisation inscrits à une formation, avec le module, la cohorte, la progression, le score, la présence et le statut du certificat.

- Filtrer par cohorte ou par module ; rechercher un nom.
- Cliquer sur un participant : détail de sa progression (activités achevées, résultats aux évaluations, présences par séance). Vous ne voyez pas le contenu de ses réponses ni ses dépôts (données pédagogiques individuelles réservées au formateur et à l'apprenant).
- Un participant qui n'a jamais reçu ses identifiants : « Renvoyer l'invitation » (email) ou notez son adresse et contactez le support.
- Pour remplacer un participant avant le début de la formation : contactez la coordination via la demande (commentaire) ; après le début, aucun remplacement automatique.

## 5. Rapports et documents

`https://formation.fetrag.ga/organisation/rapports` :

- **Rapport d'organisation** : bénéficiaires, modules suivis, progression agrégée, taux de réussite, assiduité, certificats délivrés, sur une période au choix. Export CSV.
- **Rapport de cohorte** : disponible pour chaque cohorte terminée.
- **Certificats** : liste des certificats des participants avec numéro et lien de vérification publique (`https://fetrag.ga/certificats/verifier/<code>`), à transmettre aux employeurs.
- **Reçus et factures** : si une formation payante a été prise en charge par l'organisation, les reçus sont dans `https://fetrag.ga/espace/paiements` (compte du payeur).

Ces documents contiennent des données personnelles de vos membres : diffusion limitée à l'usage interne de l'organisation.

## 6. Paiement et prise en charge

- Les formations institutionnelles issues du workflow sont, par défaut, gratuites pour les organisations affiliées ou font l'objet d'une convention établie avec la FETRAG en dehors de la plateforme.
- Pour une formation payante (module en accès individuel, Master Class), l'organisation peut régler en ligne (`https://fetrag.ga/formations/<slug>` → « S'inscrire » → paiement mobile money ou carte) ou demander une **prise en charge** à la coordination (`/contact`) : la FETRAG enregistre alors une prise en charge qui exonère les participants du paiement.
- Les reçus numérotés sont disponibles dans l'espace personnel du payeur (`/espace/paiements/<commande>`).

## 7. Sécurité et bonnes pratiques

- Un seul responsable par organisation reçoit le rôle ; demandez un second accès nominatif plutôt que de partager vos identifiants.
- Prévenez la coordination en cas de changement de responsable : l'ancien accès est retiré.
- Vérifiez régulièrement `https://fetrag.ga/espace/notifications` : les décisions et convocations y sont aussi consultables si un email s'est perdu.
- Pour toute question : `https://fetrag.ga/contact` (objet « Formation - organisation ») ou le support (`support@fetrag.ga` en recette ; adresse officielle communiquée par la FETRAG en production).
