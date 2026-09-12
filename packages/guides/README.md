# @fetrag/guides - guides d'utilisation par rôle

Contenu structuré des guides d'utilisation du site institutionnel (`fetrag.ga`) et de la plateforme de formation (`formation.fetrag.ga`), politique d'accès (chaque rôle ne voit que le guide de son rôle) et export Markdown vers `docs/guides`.

- Types et schéma Zod : `@fetrag/contracts` (`packages/contracts/src/guides.ts`).
- Rendu : `GuideReader`, `GuideCard` dans `@fetrag/ui` (`packages/ui/src/components/guide`).
- Pages : `apps/web` (`/espace/guide`, `/espace/guide/[guideId]`, `/admin/guide`, `/admin/guide/[guideId]`) et `apps/lms` (`/guide`, `/organisation/guide`, `/formateur/guide`, `/coordination/guide`, `/admin/guide`).

## Catalogue

| Identifiant | Plateforme | Rôle | Fichier |
| --- | --- | --- | --- |
| `web-membre` | fetrag.ga | tout compte connecté (`MEMBER`) | `src/content/web/membre.ts` |
| `web-organisation` | fetrag.ga | `ORG_MANAGER` | `src/content/web/organisation.ts` |
| `web-support` | fetrag.ga | `SUPPORT` | `src/content/web/support.ts` |
| `web-services` | fetrag.ga | `SERVICES_MANAGER` | `src/content/web/services.ts` |
| `web-editeur` | fetrag.ga | `EDITOR` | `src/content/web/editeur.ts` |
| `web-finance` | fetrag.ga | `FINANCE` | `src/content/web/finance.ts` |
| `web-coordination` | fetrag.ga | `COORDINATOR` | `src/content/web/coordination.ts` |
| `web-administrateur` | fetrag.ga | `SUPER_ADMIN` | `src/content/web/administrateur.ts` |
| `lms-apprenant` | formation.fetrag.ga | tout compte connecté (`LEARNER`) | `src/content/lms/apprenant.ts` |
| `lms-organisation` | formation.fetrag.ga | `ORG_MANAGER` | `src/content/lms/organisation.ts` |
| `lms-formateur` | formation.fetrag.ga | `TRAINER` | `src/content/lms/formateur.ts` |
| `lms-coordination` | formation.fetrag.ga | `COORDINATOR` | `src/content/lms/coordination.ts` |
| `lms-administrateur` | formation.fetrag.ga | `SUPER_ADMIN` | `src/content/lms/administrateur.ts` |

Les rôles sans espace propre sur une plateforme (par exemple `FINANCE` sur la plateforme de formation) utilisent le guide commun de cette plateforme. Le super administrateur peut consulter tous les guides (il attribue les rôles et accompagne tous les utilisateurs).

## Règles de rédaction

Public visé : des travailleuses et travailleurs, responsables syndicaux et personnels de la Fédération ayant une **culture numérique moyenne** : ils utilisent WhatsApp, un navigateur et parfois une messagerie, souvent depuis un smartphone, mais ne connaissent pas le vocabulaire technique.

1. **Vouvoiement, phrases courtes, un verbe d'action par étape.** « Cliquez sur **Se connecter**. » Jamais de phrase à plusieurs actions.
2. **Nommer exactement ce qui est affiché à l'écran** : menus, boutons, onglets, champs, statuts, messages, tels qu'ils apparaissent dans l'application (même orthographe, mêmes majuscules). Les libellés se mettent en gras `**Mes inscriptions**` ; les boutons, touches et onglets dans une pastille `` `Enregistrer` ``.
3. **Dire où se trouve chaque élément** (`where`) : « en haut à droite », « dans le menu de gauche », « en bas de la fiche ». Sur mobile, préciser « ouvrez le menu avec le bouton **Menu** (trois traits) en haut à droite ». Le guide doit fonctionner sur smartphone comme sur ordinateur : indiquer les différences quand elles existent.
4. **Donner le résultat attendu** (`result`) après chaque action importante : ce que la personne doit voir pour savoir qu'elle a réussi.
5. **Prévoir l'échec** : chaque tâche importante comporte un bloc `troubleshooting` (« Si ça ne marche pas ») avec problème, cause probable et solution.
6. **Expliquer les mots techniques** dès leur première apparition et dans la section « Lexique » (`definitions`) : cohorte, session, MFA, brouillon, relecture, remboursement, prise en charge, jeton, etc. Pas d'anglicisme sans explication (« dashboard » = tableau de bord).
7. **Dire ce qui est obligatoire et ce qui est facultatif** dans les formulaires ; donner les règles (longueur du mot de passe, formats de fichiers, tailles maximales, délais) quand elles existent dans l'application.
8. **Rassurer** : préciser ce qui est réversible (brouillon, annulation) et ce qui ne l'est pas (publication, remboursement, révocation d'un certificat), et signaler avec un `callout` de tonalité `warning` ou `danger` toute action irréversible.
9. **Pas d'emoji, pas de capture d'écran** : les icônes sont des clés (`icon`) rendues par le design system ; les écrans sont décrits par zones avec le bloc `screen` (« Se repérer »).
10. **Aucune donnée de démonstration ni mot de passe** dans un guide (comptes `@demo.fetrag.ga`, mot de passe de recette) : les guides sont lus par le public.
11. **Liens** : chemin relatif pour la même plateforme (`/espace/profil`), marqueur `{{web}}` ou `{{lms}}` pour l'autre plateforme (`{{lms}}/catalogue`), jamais un nom de domaine en dur.
12. **Sécurité et données personnelles** : rappeler la déconnexion sur appareil partagé, la vérification en deux étapes, la confidentialité des données syndicales, la courtoisie dans les forums et les messages.

## Structure attendue d'un guide

Chaque guide contient, dans cet ordre, au minimum les sections suivantes (identifiants imposés pour les quatre sections marquées d'un astérisque) :

1. `votre-role` - Votre rôle en bref : ce que vous pouvez faire, ce que vous ne pouvez pas faire, avec qui vous travaillez (autres rôles).
2. `avant-de-commencer` - Compte, connexion, vérification de l'adresse email, mot de passe oublié, vérification en deux étapes quand elle est exigée, déconnexion.
3. `se-reperer` \* - Se repérer dans l'écran : bloc `screen` pour l'accueil de votre espace et pour la barre de navigation, sur ordinateur et sur mobile.
4. Une section « Comment faire pour... » par tâche métier, dans l'ordre chronologique du travail réel, chacune avec `steps` (résultat attendu), `statuses` quand des statuts existent, `troubleshooting`.
5. `notifications` - Notifications et emails que vous recevez, et ce qu'il faut en faire.
6. `bonnes-pratiques` - Bonnes pratiques et sécurité (liste `check`).
7. `questions-frequentes` \* - Au moins quatre questions (`faq`).
8. `lexique` \* - Définitions (`definitions`).
9. `besoin-d-aide` \* - Besoin d'aide : à qui s'adresser selon le problème (support, coordination, secrétariat général), coordonnées de la Fédération, ce qu'il faut indiquer dans un message (adresse email du compte, écran concerné, message d'erreur).

10. `selfAssessment` - Module « Testez votre maîtrise » : `intro`, `passPercent` (70 en général) et au moins 10 questions (`single` : une seule bonne réponse, `multiple` : plusieurs, `true-false` : deux options « Vrai » / « Faux »). Chaque question porte sur un point utile du guide (où cliquer, ce qu'un statut signifie, ce qui est irréversible, à qui s'adresser), cite la section concernée (`sectionId` = ancre existante de section ou de sous-section), évite les pièges de formulation et donne une `explanation` qui renvoie au guide (« Voir la section Paiements »). Les options fausses doivent être plausibles mais clairement fausses à la relecture du guide ; pas de double négation. Les questions couvrent au moins la moitié des sections.

Champs d'en-tête : `audience` (« Ce guide s'adresse à... »), `summary` (trois phrases), `prerequisites` (liste), `quickStart` (3 à 6 étapes : les premières choses à faire), `readingMinutes`, `updatedAt`, `version` (`1.0` pour la première rédaction complète), `related` (autres guides utiles : guide commun de la même plateforme, guide du même rôle sur l'autre plateforme).

Seuils vérifiés par les tests (`src/__tests__/content.test.ts`) : au moins 8 sections, 25 étapes, 4 questions fréquentes, les quatre sections imposées, une prise en main et des prérequis. Les guides des rôles institutionnels dépassent largement ces seuils (15 à 25 sections, 80 à 150 étapes).

## Exemple de contenu

```ts
import type { Guide } from '@fetrag/contracts'

export const exemple: Guide = {
  id: 'web-exemple',
  platform: 'web',
  role: 'MEMBER',
  title: 'Guide du membre',
  subtitle: 'Votre compte et votre espace personnel sur fetrag.ga',
  audience: 'Toute personne disposant d’un compte FETRAG : travailleuses et travailleurs, responsables syndicaux, personnels de la Fédération.',
  summary: 'Avec votre compte, vous gérez vos informations, suivez vos demandes de service, vos inscriptions aux formations et vos paiements. Le même compte ouvre la plateforme de formation.',
  tone: 'blue',
  icon: 'user',
  readingMinutes: 25,
  updatedAt: '2026-09-12',
  version: '1.0',
  prerequisites: ['Une adresse email à laquelle vous avez accès (le lien de confirmation y est envoyé).', 'Un téléphone ou un ordinateur connecté à Internet.'],
  quickStart: [
    { text: 'Créez votre compte depuis la page **Inscription**.', ui: 'Créer mon compte', where: 'en bas du formulaire', result: 'Un message vous demande de consulter votre boîte email.' },
    { text: 'Ouvrez l’email « Confirmez votre adresse » et cliquez sur le lien.', result: 'La page « Adresse confirmée » s’affiche.' },
    { text: 'Connectez-vous avec votre email et votre mot de passe.', ui: 'Se connecter', result: 'Votre espace personnel s’ouvre.' },
  ],
  sections: [
    {
      id: 'votre-role',
      title: 'Votre rôle en bref',
      icon: 'user',
      summary: 'Ce que votre compte vous permet de faire.',
      blocks: [
        { type: 'paragraph', text: 'Votre compte est votre identité auprès de la Fédération...' },
        { type: 'list', style: 'check', items: ['Mettre à jour vos informations', 'Suivre vos demandes de service'] },
      ],
    },
    {
      id: 'se-reperer',
      title: 'Se repérer dans votre espace',
      icon: 'compass',
      blocks: [
        {
          type: 'screen',
          title: 'La page « Espace personnel »',
          description: 'Ce que vous voyez après la connexion.',
          areas: [
            { name: 'Menu de gauche (ou bouton « Ouvrir la navigation » sur mobile)', purpose: 'Accès aux rubriques : Tableau de bord, Profil, Mes demandes...', icon: 'menu' },
            { name: 'Bandeau du haut', purpose: 'Votre nom et votre rôle ; le menu de votre compte s’ouvre en cliquant sur vos initiales, en haut à droite.', icon: 'user' },
          ],
        },
        { type: 'path', label: 'Chemin', items: ['Menu de gauche', 'Mon compte', 'Profil'], href: '/espace/profil' },
      ],
    },
    {
      id: 'modifier-mon-profil',
      title: 'Comment mettre à jour mon profil',
      icon: 'pen',
      blocks: [
        {
          type: 'steps',
          items: [
            { text: 'Ouvrez **Profil** dans le menu de gauche.', where: 'rubrique « Mon compte »', result: 'Le formulaire de profil s’affiche avec vos informations actuelles.' },
            { text: 'Modifiez les champs souhaités. Les champs marqués d’un astérisque sont obligatoires.', note: 'Le numéro de téléphone est facultatif mais utile pour les convocations.' },
            { text: 'Cliquez sur `Enregistrer`.', where: 'en bas du formulaire', result: 'Un message vert « Profil mis à jour » apparaît.' },
          ],
        },
        { type: 'callout', tone: 'tip', title: 'Conseil', text: 'Vérifiez votre adresse email : c’est là que sont envoyés les convocations et les reçus.' },
        {
          type: 'troubleshooting',
          items: [{ problem: 'Le bouton `Enregistrer` reste grisé.', cause: 'Un champ obligatoire est vide ou mal rempli.', solution: 'Repérez le message rouge sous le champ concerné et corrigez-le.' }],
        },
      ],
    },
    {
      id: 'questions-frequentes',
      title: 'Questions fréquentes',
      icon: 'help-circle',
      blocks: [{ type: 'faq', items: [{ question: 'Puis-je changer d’adresse email ?', answer: 'Oui, depuis **Profil**. Un email de confirmation est envoyé à la nouvelle adresse.' }] }],
    },
    {
      id: 'lexique',
      title: 'Lexique',
      icon: 'book-open',
      blocks: [{ type: 'definitions', items: [{ term: 'Vérification en deux étapes', definition: 'Un code temporaire demandé en plus du mot de passe pour protéger votre compte.' }] }],
    },
    {
      id: 'besoin-d-aide',
      title: 'Besoin d’aide ?',
      icon: 'life-buoy',
      blocks: [{ type: 'links', items: [{ label: 'Écrire au support', href: '/contact', description: 'Formulaire de contact du site.', icon: 'mail' }] }],
    },
  ],
  related: [{ label: 'Guide de l’apprenant', href: '{{lms}}/guide', description: 'Suivre une formation sur la plateforme.', external: true }],
}
```

## Commandes

```bash
pnpm --filter @fetrag/guides typecheck
pnpm --filter @fetrag/guides test          # schéma, accès, seuils de détail, absence d’emoji
pnpm --filter @fetrag/guides export:docs   # régénère docs/guides/*.md
```
