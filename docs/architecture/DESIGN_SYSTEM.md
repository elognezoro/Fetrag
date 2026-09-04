# Design system FETRAG - « Le Cercle et l'Étoile »

Le langage visuel des deux plateformes est dérivé exclusivement du logo officiel de la Fédération des Travailleurs du Gabon. Ce document est la référence pour toute page, composant ou animation. Aucun écran ne doit ressembler à un template générique : chaque surface reprend au moins un motif du logo.

## 1. Les motifs du logo et leur traduction

| Élément du logo | Signification | Traduction UI |
| --- | --- | --- |
| Anneau bleu extérieur | Institution, cadre, protection | Bordures épaisses bleues, conteneurs « sceau », badges circulaires, fond de hero en anneaux concentriques |
| Arc vert ouvert vers le haut (croissant) | Efficacité, progression, élan | Composant `ArcRing` : anneau de progression dessiné par animation `stroke-dashoffset`; séparateurs de sections en arc ; halo décoratif derrière les visuels |
| Étoile or au sommet | Solidarité, réussite, objectif | Marqueurs d'achèvement, certificats, mise en avant (« à la une »), puce des listes « avantages ». Or réservé aux accents, jamais en aplat massif |
| Deux silhouettes bras levés | Les travailleurs, la fédération, le « V » de la victoire | Illustration `Emblem` vectorielle originale ; motif « duo » pour les sections partenaires / organisations ; icônes d'utilisateurs en paire |
| Ruban bleu incliné avec la devise | Travail · Efficacité · Solidarité | Composant `Ribbon` : étiquette de section (eyebrow) à extrémités biseautées, en bleu, vert ou or selon le pilier |
| Numérotation « 01 / 10 » du programme | Parcours structuré | Cartes de module numérotées avec grand chiffre en serif, filet vertical coloré par pilier |

## 2. Couleurs

Échantillonnées sur le logo (`packages/design-tokens`).

- **Bleu FETRAG** `#0259C7` (primary) - navigation, liens, boutons principaux, anneau.
- **Vert FETRAG** `#9CC102` (accent) - progression, succès, actions secondaires « efficacité », arc.
- **Or FETRAG** `#F9C804` (highlight) - étoile, certificats, éléments « à la une », focus décoratif.
- **Marine** `#042768` / `#02163F` - fonds sombres (footer, hero LMS), texte de titre.
- **Encre** `#0B1B3F` - texte courant. **Neutres** froids `#F7F8FC` → `#141A2E` pour les surfaces.

Règle des trois piliers (triptyque fondateur) : Protection = bleu, Prévention = vert, Défense = or. Les listes de trois éléments alternent ces couleurs dans cet ordre.

Contraste : texte sur bleu 500 = blanc ; texte sur vert 500 = marine (`#042768`) ; texte sur or 500 = marine. Ne jamais mettre de texte blanc sur vert ou or.

## 3. Typographie

- **Fraunces** (serif à axe optique, Google Fonts) pour les titres `h1`-`h3`, les grands chiffres et les citations : écho du lettrage serif « Fédération des Travailleurs du Gabon ». Graisse 600-700, interlettrage -0.02em, `font-optical-sizing: auto`. Un mot clé du titre peut être en italique vert ou or.
- **Manrope** (sans) pour l'interface, le corps, les formulaires, les tableaux. Graisse 400-700.
- Échelle : `display` 56-72px, `h1` 40-48px, `h2` 32-36px, `h3` 22-24px, corps 16-17px, petit 14px, eyebrow 12-13px majuscules espacées (`tracking-[0.18em]`).

## 4. Formes et surfaces

- Rayons généreux : cartes `rounded-2xl` (1.5rem), boutons `rounded-full` (écho de l'anneau), champs `rounded-xl`.
- Cartes : fond blanc, bordure 1px `neutral-200`, ombre `soft`; au survol `lift` + halo de la couleur du pilier. Un filet supérieur de 3px coloré (`triptych`) est le marqueur signature.
- Fond de page : `neutral-50` chaud, avec une trame discrète d'anneaux (`RingBackdrop`) en opacité 4-6 %.
- Sections sombres : dégradé `navy-deep → blue-800`, arc vert lumineux en décoration, texte blanc, accents or.

## 5. Mouvement

Bibliothèque `motion` (framer-motion v12). Helpers de `@fetrag/ui` :

- `Reveal` : apparition au scroll (`opacity 0→1`, `y 18→0`, 0.7s, ease-out-expo).
- `Stagger` : enfants révélés avec 70ms de décalage.
- `ArcRing` : arc dessiné progressivement ; utilisé pour progression LMS, chiffres clés, hero.
- `Counter` : compteur animé pour les indicateurs.
- `Marquee` : défilement infini des logos partenaires.
- Survol : translation -2px + ombre `lift`, 180ms. Boutons : léger scale 0.98 au clic.
- `prefers-reduced-motion` : toutes les animations non essentielles sont désactivées (hook `useReducedMotion`). Pas de vidéo automatique.

## 6. Iconographie

`lucide-react` uniquement, trait 1.75, taille 18-20px inline, 24-28px dans les cartes. Aucun emoji nulle part (interface, contenus seed, emails).

## 7. Composants signatures

`Ribbon`, `ArcRing`, `Emblem`, `RingBackdrop`, `PillarCard` (carte à filet coloré numérotée), `StatTile`, `SectionHeading` (eyebrow ruban + titre serif + accroche), `TriptychStrip` (les trois piliers), `ModuleCard` (01-10), `CertificateSeal` (sceau circulaire bleu/or), `ProgressArc`.

## 8. Accessibilité

WCAG 2.2 AA : focus visible 3px `blue-500/40`, cibles tactiles ≥ 44px, labels explicites, messages d'erreur liés par `aria-describedby`, contrastes ≥ 4.5:1, navigation clavier complète (Radix). Mobile-first 360-430px.
