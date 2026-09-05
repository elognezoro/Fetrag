# Guide de l'éditeur communication (EDITOR)

Ce guide s'adresse aux personnes qui animent le site institutionnel `fetrag.ga` : pages, actualités, ressources documentaires, événements, partenaires, menus et SEO. Compte de démonstration : `editeur@fetrag.ga`. Le rôle EDITOR exige la MFA (voir `administrateur.md`, section 1).

Le back-office est accessible à `https://fetrag.ga/admin` après connexion sur `https://fetrag.ga/connexion`. La barre latérale liste : Tableau de bord, Pages, Actualités, Ressources, Événements, Services (lecture), Partenaires, Médias, Menus, FAQ, Formulaires reçus, Newsletter, SEO.

## 1. Le cycle de vie d'un contenu

Tous les contenus (page, actualité, ressource, événement, service) suivent le même workflow (WEB-18) :

`Brouillon` → `En relecture` → `Publié` → `Archivé`, avec `Planifié` (publication automatique à une date future).

- Un contenu **Brouillon** ou **En relecture** n'est visible que dans le back-office et en prévisualisation.
- **Publié** : visible sur le site, indexé par les moteurs, présent dans la recherche interne et le plan du site.
- **Planifié** : publié automatiquement à la date et l'heure choisies (le passage est effectué par une tâche de fond dans les 10 minutes suivant l'échéance).
- **Archivé** : retiré du site, conservé dans le back-office ; peut revenir en brouillon.

Le retour en brouillon est toujours possible. Chaque changement de statut est journalisé (auteur, date).

## 2. Publier une actualité

1. `https://fetrag.ga/admin` → **Actualités** → « Nouvelle actualité ».
2. Renseigner : **Titre** (le slug de l'URL est généré automatiquement, modifiable tant que l'article n'est pas publié), **Catégorie** (Communiqués, Dialogue social, Vie de la fédération, Formation, Juridique), **Chapô** (résumé de 2 à 3 phrases, affiché dans les listes et les partages), **Image de couverture** (depuis la médiathèque, format paysage recommandé 1600 × 900, texte alternatif obligatoire), **Contenu**.
3. L'éditeur de contenu propose : titres (H2, H3), gras, italique, souligné, listes, citations, liens, tableaux, images, fichiers. Le HTML est assaini à l'enregistrement : les scripts et styles inline sont retirés.
4. Onglet **SEO** : titre de la page (60 caractères), description (160 caractères), image de partage (par défaut la couverture), case « Ne pas indexer » pour un contenu sensible.
5. « Enregistrer le brouillon », puis « Prévisualiser » (ouvre `https://fetrag.ga/actualites/<slug>?preview=1`, réservé aux rôles éditoriaux).
6. Pour publier : « Publier » (immédiat) ou « Planifier » (choisir date et heure de Libreville). Une fenêtre de confirmation rappelle le statut cible.
7. Vérifier sur le site : `https://fetrag.ga/actualites` (liste) et `https://fetrag.ga/actualites/<slug>`. Un article publié apparaît aussi dans « À la une » sur l'accueil si la case « Mettre en avant » est cochée.

Pour corriger un article publié : modifier puis « Enregistrer » (les modifications sont immédiates) ; pour une refonte importante, passer en brouillon le temps de la réécriture.

## 3. Pages institutionnelles

`/admin` → **Pages**. Les pages structurantes existent déjà (`la-fetrag`, `mentions-legales`, `confidentialite`, `adhesion`, `faq`) ; elles se modifient comme une actualité, avec en plus :

- **Historique des versions** : chaque enregistrement crée une révision ; l'onglet « Révisions » permet de comparer et de restaurer une version antérieure.
- **Gabarit** : page standard, page avec sommaire, page avec formulaire (adhésion, contact, partenariat).
- Les textes officiels (mission, mot du Secrétaire Général, devise, triptyque) sont repris mot pour mot depuis les documents de la FETRAG (`docs/architecture/BUILD_BRIEF.md`, section 6) : ne pas les paraphraser sans validation du Secrétariat général.

## 4. Ressources documentaires

`/admin` → **Ressources** → « Nouvelle ressource ».

1. Téléverser le fichier (PDF, Word, PowerPoint, audio, vidéo ; taille maximale indiquée sur l'écran) ou indiquer un lien externe.
2. Renseigner : titre, type (Document, Guide pratique, Rapport, Texte juridique, Formulaire, Vidéo, Audio, Présentation), catégorie, date du document, auteur / source, langue, mots-clés, résumé.
3. Choisir le **niveau d'accès** (WEB-12) :
   - `Public` : téléchargeable par tous.
   - `Membres` : connexion requise.
   - `Organisation` : réservé aux membres d'organisations affiliées.
   - `Premium` : nécessite une offre payée ou une prise en charge.
   Les fichiers non publics sont servis par une URL signée à durée limitée : un lien copié ne fonctionne pas au-delà de quelques minutes.
4. Publier. La ressource apparaît dans `https://fetrag.ga/ressources` avec filtres par catégorie et type, et dans la recherche.

## 5. Événements et agenda

`/admin` → **Événements** → « Nouvel événement » : type (Événement, Master Class, Webinaire, Assemblée, Formation), dates de début et de fin, lieu ou lien de visioconférence, description, **jauge** (capacité) et **liste d'attente**, tarif éventuel (via une offre), intervenants.

- Une fois publié, l'événement est visible dans `https://fetrag.ga/evenements` (à venir / passés) et les visiteurs connectés peuvent s'inscrire ; en cas de jauge atteinte, ils rejoignent la liste d'attente.
- Onglet **Participants** : liste, statut (confirmé, en attente, annulé), export CSV pour l'émargement.
- Un rappel automatique est envoyé la veille aux inscrits.

## 6. Partenaires, menus, FAQ, newsletter

- **Partenaires** : logo (fond blanc, PNG ou SVG), nom, type (institution, syndicat affilié, partenaire technique, média), lien, ordre d'affichage, actif / inactif. Ils alimentent `https://fetrag.ga/organisations` et le défilement de logos de l'accueil.
- **Menus** : deux emplacements (en-tête, pied de page). Glisser-déposer pour ordonner, indiquer libellé + lien interne ou externe. Enregistrer puis vérifier sur le site.
- **FAQ** : questions / réponses par groupe (Adhésion, Formation, Services, Compte) affichées sur `https://fetrag.ga/faq` et dans les pages associées.
- **Newsletter** : liste des abonnés confirmés (double opt-in), exports avec date de consentement, désinscriptions. L'envoi de campagnes n'est pas intégré dans cette version : exporter les adresses confirmées vers l'outil d'emailing retenu, en respectant les désinscriptions.

## 7. Formulaires reçus

`/admin` → **Formulaires** : contact, adhésion / intérêt, partenariat (les demandes de service sont traitées par le Responsable services, l'assistance par le Support). Chaque soumission a un statut (Nouvelle, En cours, Traitée, Sans suite), un responsable et des notes internes. Un accusé de réception a été envoyé automatiquement à l'expéditeur. Export CSV disponible pour le suivi.

## 8. Médiathèque et bonnes pratiques éditoriales

- Nommer les fichiers clairement avant téléversement (`communique-smig-2026.pdf`), renseigner le texte alternatif de chaque image (accessibilité).
- Images : privilégier WebP ou JPEG optimisé (< 500 Ko) ; le site génère les formats responsives.
- Ne jamais coller de texte depuis Word avec sa mise en forme : utiliser « Coller sans mise en forme » (Ctrl + Maj + V).
- Pas d'emoji dans les contenus (charte FETRAG) ; les icônes sont gérées par le site.
- Titres : un seul H1 par page (le titre du contenu) ; les sous-titres commencent à H2.
- Vérifier la version mobile de chaque nouveau contenu (le back-office propose un aperçu mobile dans la prévisualisation).
- Les textes juridiques (mentions légales, confidentialité) sont validés par le conseil de la FETRAG avant publication.

## 9. Recherche et SEO

- La recherche interne (`https://fetrag.ga/recherche`) indexe uniquement les contenus publiés ; elle tolère les fautes de frappe. Un contenu introuvable est généralement encore en brouillon.
- Le plan du site (`/sitemap.xml`) et `robots.txt` sont générés automatiquement.
- Onglet SEO de chaque contenu : soigner le titre et la description ; éviter de changer le slug d'un contenu déjà partagé (les anciens liens casseraient - demander une redirection à l'exploitant si nécessaire).
