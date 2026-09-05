# Guide du formateur (TRAINER)

Ce guide s'adresse aux formateurs FETRAG et aux experts invités qui animent une ou plusieurs cohortes sur `formation.fetrag.ga`. Compte de démonstration : `formateur@fetrag.ga` (formateur du cours pilote M01 « Fondamentaux du Syndicalisme Gabonais »).

Un formateur agit **sans droits globaux** (LMS-10) : il ne voit que les cours et cohortes qui lui sont affectés par la coordination, et ne peut ni publier un cours ni émettre un certificat.

## 1. Accéder à son espace

1. `https://formation.fetrag.ga/connexion` : « Adresse email », « Mot de passe », « Se connecter ». Si vous possédez aussi un compte sur `fetrag.ga`, c'est le même (une seule identité).
2. Après connexion, la barre supérieure propose « Tableau de bord » ; le menu utilisateur donne accès à « Espace formateur » : `https://formation.fetrag.ga/formateur`.
3. Le tableau de bord formateur affiche : cohortes en cours (avec progression moyenne), prochaines séances, corrections en attente (devoirs et compositions), messages récents des forums, statistiques (participants, taux d'achèvement, résultats moyens).

## 2. Suivre une cohorte

`https://formation.fetrag.ga/formateur/cohortes/<id>` (depuis la liste « Mes cohortes »). Onglets :

- **Participants** : nom, organisation, progression (%), dernier accès, score courant, présence cumulée. Filtrer les participants en difficulté (progression faible, absences) ; cliquer sur un participant pour le détail activité par activité.
- **Sessions et présence** : séances planifiées par la coordination (date, mode, lieu / lien). Pour une séance passée ou en cours : « Feuille de présence » → statut par participant (`Présent`, `Absent`, `En retard`, `Excusé`) + note facultative → « Enregistrer ». La feuille peut être corrigée jusqu'à la clôture de la cohorte ; chaque enregistrement est journalisé. La présence alimente le taux d'assiduité utilisé par les certificats.
- **Corrections** : dépôts de devoirs et compositions à noter (section 3).
- **Messages** : forum de la cohorte (section 4).
- **Contenus** : la version du cours suivie par la cohorte, en lecture (le contenu est figé pour la cohorte ; les modifications se font dans une nouvelle version avec la coordination).

## 3. Corriger les devoirs et les compositions

Les quiz (choix unique, multiples, vrai / faux, texte à trous, appariement, classement, réponse courte) sont corrigés automatiquement. Le formateur note :

- les **compositions** (question de type « Composition » dans un quiz) ;
- les **devoirs** (dépôt de fichier et / ou texte).

Procédure (`/formateur/cohortes/<id>` → Corrections, ou `https://formation.fetrag.ga/devoirs` qui liste tout ce qui vous est affecté) :

1. Ouvrir la soumission : texte de l'apprenant, fichier joint (ouverture par lien sécurisé à durée limitée), date de dépôt, retard éventuel (indicateur « En retard » si après la date limite).
2. Saisir la **note** (sur le barème de l'activité), le **retour** (commentaire visible par l'apprenant : conseils, points forts, points à revoir) et, si une grille est définie, les points par critère.
3. « Enregistrer la note ». L'apprenant est notifié ; la progression et le score de son inscription sont recalculés selon la règle d'achèvement de l'activité (par exemple « score minimal 60 % »).
4. Pour une composition dans un quiz : ouvrir la tentative → question de composition → note et commentaire → « Valider » ; le total de la tentative est mis à jour.

Bonnes pratiques : corriger sous 7 jours ; formuler un retour même en cas de bonne note ; en cas de suspicion de plagiat, ne pas noter et prévenir la coordination (la décision de révocation ou de sanction lui revient).

## 4. Animer le forum et communiquer

- `https://formation.fetrag.ga/forums` liste les forums des cours et cohortes auxquels vous êtes affecté. Dans un forum : créer un fil (annonce, consigne, question de réflexion), répondre, épingler un fil important.
- **Modération** : masquer ou supprimer un message inapproprié, verrouiller un fil ; chaque action est tracée. Les apprenants ne voient que les forums de leurs inscriptions.
- Les annonces importantes (changement d'horaire, document à préparer) sont à faire remonter à la coordination qui peut envoyer une notification à toute la cohorte.

## 5. Calendrier et séances en direct

- `https://formation.fetrag.ga/calendrier` : vos séances, échéances de devoirs des cohortes que vous animez, export au format iCalendar (« Exporter ») pour votre agenda personnel.
- Pour une classe virtuelle, le lien de visioconférence est renseigné par la coordination sur la session ; la plateforme ne fournit pas d'outil de visio intégré (lien externe, chapitre 32 du CDC). Le replay éventuel est ajouté comme activité « Vidéo » par la coordination.
- Un rappel automatique est envoyé aux participants la veille de chaque séance.

## 6. Contribuer aux contenus

Si la coordination vous a affecté au cours (rôle TRAINER avec portée cours), vous pouvez, dans `https://formation.fetrag.ga/admin` → Cours → votre cours :

- proposer des questions dans la **banque de questions** (elles sont catégorisées et réutilisables) ;
- préparer une **nouvelle version** de contenu (modules, leçons, activités) - la publication reste réservée à la coordination ;
- ajouter une **alternative bas débit** (audio, transcription, document) à chaque vidéo : de nombreux apprenants suivent sur mobile avec un débit limité.

Vous ne pouvez pas modifier une version publiée ni les règles d'achèvement d'une cohorte en cours.

## 7. Statistiques

Onglet **Statistiques** de la cohorte : taux d'achèvement, distribution des scores au quiz, taux de présence par séance, temps moyen passé, activités les plus abandonnées. Ces indicateurs servent au bilan de session remis à la coordination et au rapport d'organisation.

## 8. Questions fréquentes

- *Un participant n'apparaît pas dans ma cohorte* : la coordination doit l'ajouter (`/coordination` → Cohortes → Membres).
- *Je ne vois pas le bouton « Émettre le certificat »* : l'émission est réservée à la coordination ; signalez-lui que la cohorte est prête.
- *Un apprenant a perdu son mot de passe* : lien « Mot de passe oublié ? » sur `https://formation.fetrag.ga/connexion` ; le support peut aussi l'aider.
- *Une note enregistrée est fausse* : ouvrir de nouveau la soumission et enregistrer la nouvelle note ; l'historique conserve les deux valeurs.
