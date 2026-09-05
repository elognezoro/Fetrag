# Guide du coordinateur formation (COORDINATOR)

Le coordinateur pilote la plateforme `formation.fetrag.ga` : catalogue et cours, demandes de formation des organisations, cohortes et sessions, affectation des formateurs, certificats et rapports. Compte de démonstration : `coordination@fetrag.ga`. Le rôle exige la MFA.

Écrans principaux (après connexion sur `https://formation.fetrag.ga/connexion`) :

| Écran | Adresse | Usage |
| --- | --- | --- |
| Pilotage | `https://formation.fetrag.ga/coordination` | Demandes, cohortes, sessions, certificats, rapports, organisations |
| Administration LMS | `https://formation.fetrag.ga/admin` | Cours et builder, banque de questions, modèles de certificats, paramètres |
| Espace formateur | `https://formation.fetrag.ga/formateur` | Le coordinateur y voit toutes les cohortes |

## 1. Traiter une demande de formation institutionnelle

Le workflow (chapitre 14 du CDC) : `Soumise` → (`Complément demandé` | `Acceptée` | `Refusée` | `Autre date proposée`) → `Planifiée` → `Formation en cours` → `Terminée`. Chaque décision est enregistrée dans l'historique de la demande et notifiée à l'organisation.

1. `https://formation.fetrag.ga/coordination` → onglet **Demandes**. Les demandes en attente d'action (`Soumise`, `Autre date proposée`, `Acceptée`) sont en tête ; filtres par statut, organisation, période.
2. Ouvrir la demande (`/coordination/demandes/<id>` ou la fiche depuis la liste) : organisation, personne ressource, modules choisis (01 à 10), participants nominatifs, période et modalité souhaitées (présentiel, classe virtuelle, hybride), motivation, engagements acceptés, pièces jointes, historique.
3. Choisir une décision :
   - **Demander un complément** : saisir le commentaire (ce qui manque) ; la demande repasse chez l'organisation, qui la resoumet.
   - **Accepter** : commentaire facultatif ; la demande devient `Acceptée` et attend la planification.
   - **Proposer une autre date / modalité** : renseigner la date et la modalité proposées ; l'organisation accepte (la demande revient `Soumise` avec la nouvelle date) ou refuse.
   - **Refuser** : motif obligatoire, transmis à l'organisation.
4. **Planifier** (depuis une demande `Acceptée`) : nom de la cohorte (proposé automatiquement, par exemple « SYNATEP - Module 03 - novembre 2026 »), formateur, date de début. En validant :
   - la cohorte est créée, rattachée à l'organisation et à la version courante de chaque module ;
   - les participants reçoivent un compte s'ils n'en ont pas (email de bienvenue avec initialisation de mot de passe) et sont inscrits ;
   - la convocation est envoyée ; la demande passe en `Planifiée`.
5. Suivre ensuite la cohorte (section 3). À la clôture de la cohorte, la demande passe en `Terminée`.

Le nombre maximal de participants par demande est un paramètre (`training.participantLimit`, 10 par défaut) modifiable par l'administrateur.

## 2. Créer et publier un cours

`https://formation.fetrag.ga/admin` → **Cours**. Les dix modules du Programme de formation des Leaders Syndicaux 2026 sont préchargés (codes M01 à M10) ; le cours pilote M01 est complet.

1. « Nouveau cours » : code, titre, sous-titre, résumé, pilier du triptyque (Protection, Prévention, Défense), modalité (à distance, en direct, hybride), niveau, durée, objectifs, prérequis, public, image, politique d'inscription :
   - `Libre` : l'apprenant s'inscrit seul ;
   - `Sur validation` : l'inscription reste en attente jusqu'à votre accord ;
   - `Organisation` : réservé aux cohortes issues du workflow institutionnel ;
   - `Payant` : exige une commande payée (offre à créer côté vitrine par Finance ou le coordinateur).
2. **Versions** : un cours a une ou plusieurs versions ; seule la version courante est visible des nouveaux inscrits. Créer une version, puis dans le **builder** : modules → leçons → activités. Réordonner par glisser-déposer.
3. **Activités** disponibles : Contenu (texte riche), Document, Lien, Audio, Vidéo, Présentation, Évaluation (quiz), Devoir, Questionnaire, Forum, Séance en direct, Contenu interactif (H5P), Module SCORM. Pour chaque activité : instructions, durée indicative, obligatoire ou non, **règle d'achèvement** (consultation, temps passé, score minimal, dépôt, présence, validation manuelle), alternative bas débit (audio ou transcription pour une vidéo).
4. **Règles d'achèvement de la version** : toutes les activités obligatoires, ou liste précise ; score minimal ; taux d'assiduité minimal.
5. **Formateurs** : onglet « Formateurs » du cours pour affecter un ou plusieurs formateurs (ils obtiennent le droit d'enseigner et de corriger sur ce cours).
6. **Publier la version** (« Publier ») : la version est figée (toute modification ultérieure passe par une nouvelle version ou une duplication) et devient la version courante. Publier ensuite le **cours** (statut `Publié`) pour qu'il apparaisse dans `https://formation.fetrag.ga/catalogue` et, automatiquement, dans `https://fetrag.ga/formations` (WEB-04).

Les cohortes en cours ou terminées conservent la version qu'elles ont suivie (LMS-17).

## 3. Cohortes et sessions

`https://formation.fetrag.ga/coordination` → **Cohortes**.

1. « Nouvelle cohorte » (hors workflow institutionnel) : cours, version (courante par défaut), nom, organisation éventuelle (cohorte privée), formateur, capacité, dates, lieu.
2. **Membres** : ajouter des apprenants existants (recherche par nom / email) ; un apprenant ajouté est inscrit au cours avec la source « cohorte ».
3. **Sessions** : « Ajouter une session » : titre, mode (présentiel, classe virtuelle, hybride), début et fin (heure de Libreville), lieu ou lien de visioconférence, intervenant. Les sessions apparaissent dans le calendrier des membres (`/calendrier`) et un rappel est envoyé la veille.
4. **Présences** : peuvent être saisies par le formateur ou par vous (`/formateur/cohortes/<id>` → Présence).
5. **Clôturer** la cohorte quand la formation est terminée : les inscriptions actives non achevées sont laissées en l'état (ou marquées selon les règles), les certificats peuvent être émis (section 4), le rapport de cohorte est disponible.

## 4. Certificats et attestations

`https://formation.fetrag.ga/coordination` → **Certificats**.

- **Modèles** (`/admin` → Modèles de certificats) : nom, type (Attestation de participation, Certificat de réussite), critères (score minimal, assiduité minimale, achèvement requis), durée de validité éventuelle, mentions, signature. Un modèle par défaut et des modèles par cours.
- **Émettre pour une inscription** : ouvrir l'inscription (depuis la cohorte ou l'apprenant) → « Vérifier l'éligibilité » (affiche les critères satisfaits ou non) → « Émettre ». Le certificat reçoit un numéro `FETRAG-AAAA-NNNNNN`, un code de vérification et un QR ; le PDF est généré en quelques minutes.
- **Émettre pour une cohorte** : depuis la cohorte clôturée → « Émettre les certificats » : seules les inscriptions éligibles sont traitées ; le rapport indique les refus et leurs motifs.
- **Révoquer** : voir `docs/runbooks/revocation-certificat.md` (motif obligatoire, action irréversible, réémission possible après correction).
- Les apprenants retrouvent leurs certificats sur `https://formation.fetrag.ga/certificats` ; toute personne peut vérifier un certificat sur `https://fetrag.ga/certificats/verifier`.

## 5. Corrections, banque de questions, questionnaires

- **Banque de questions** (`/admin` → Banque de questions) : questions catégorisées, taguées, versionnées, réutilisables dans plusieurs quiz ; types : choix unique, choix multiples, vrai / faux, texte à trous, appariement, classement, réponse courte, composition. Import possible depuis un fichier CSV (modèle fourni sur l'écran). « Ajouter au quiz » depuis une question ou depuis l'activité quiz.
- **Compositions et devoirs** : notés par le formateur (`formateur.md`) ; le coordinateur peut corriger à sa place.
- **Questionnaires de satisfaction** : activité « Questionnaire » en fin de cours ; résultats agrégés dans `/coordination` → Rapports → Satisfaction.

## 6. Rapports

`https://formation.fetrag.ga/coordination` → **Rapports** :

| Rapport | Contenu | Export |
| --- | --- | --- |
| Cohorte | Participants, progression, scores, présences, certificats | CSV |
| Organisation | Bénéficiaires, cours suivis, progression agrégée, résultats, certificats | CSV |
| Cours | Inscrits, complétion, réussite, temps moyen, par version | CSV |
| Finance (lecture) | Chiffre d'affaires, impayés, remboursements par période | CSV (Finance) |
| Satisfaction | Résultats des questionnaires par module / session | CSV |

Les exports sont journalisés. Ils contiennent des données personnelles : à ne transmettre qu'aux organisations concernées (chaque responsable d'organisation dispose déjà de son rapport dans `/organisation/rapports`).

## 7. Organisations

`https://formation.fetrag.ga/coordination` → **Organisations** : fiche (nom, sigle, secteur, ville, contacts, statut d'affiliation), membres et responsables (case « Responsable » qui confère le droit de soumettre des demandes et de consulter les rapports de l'organisation), demandes et cohortes liées. Une organisation est créée ici ou automatiquement lors d'une inscription mentionnant une organisation inconnue (à valider).

## 8. Bonnes pratiques

- Traiter les demandes `Soumise` sous 5 jours ouvrés ; utiliser « Complément demandé » plutôt qu'un refus lorsque le dossier est incomplet.
- Toujours publier une nouvelle **version** pour une refonte de contenu ; réserver la modification directe aux corrections mineures avant publication.
- Vérifier la règle d'achèvement et les critères du modèle de certificat avant d'ouvrir une cohorte : ils ne se modifient pas pour une cohorte en cours.
- Planifier les sessions en heure de Libreville ; la plateforme stocke en UTC et convertit à l'affichage.
- Ne pas contourner le workflow (inscription manuelle massive) pour une demande institutionnelle : la traçabilité de la demande à la certification est une exigence de la FETRAG (chapitre 14, point 10).
