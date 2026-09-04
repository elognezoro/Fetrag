# ADR-005 - Recherche PostgreSQL, internationalisation et CMS intégré

- Statut : accepté (septembre 2026)
- Contexte : SHR-09, WEB-02, WEB-07, WEB-14, chapitre 18 et 25.

## Décision

- **Recherche** : `packages/search` interroge PostgreSQL directement (`to_tsvector('french', ...)` + `pg_trgm` pour la tolérance aux fautes) sur pages, actualités, ressources, services, formations et événements **publiés uniquement**. Aucun moteur externe. Extension `pg_trgm` créée par migration.
- **Internationalisation** : français au lancement. Les contenus portent un champ `locale` (`fr`, `en`), les chaînes d'interface sont centralisées dans `packages/ui/src/i18n` (dictionnaire `fr` ; ajout d'une langue = nouveau dictionnaire + routage `/[locale]` optionnel). Dates et nombres formatés avec `Intl` en `fr-GA`.
- **CMS** : back-office intégré à `apps/web/admin`. Éditeur riche TipTap, contenu stocké en HTML assaini (`sanitize-html`, liste blanche stricte) et rendu côté serveur. Statuts `DRAFT → REVIEW → PUBLISHED → ARCHIVED` + `SCHEDULED` (publication automatique par job `content.publish-scheduled`). Historique de versions sur les pages (`PageRevision`). Prévisualisation via `?preview=1` réservée aux rôles éditoriaux.
- **SEO** : `SeoRecord` par contenu, `sitemap.ts` et `robots.ts` générés, Open Graph, canonical, données structurées (`Organization`, `NewsArticle`, `Event`, `Course`). Les contenus non publiés et privés portent `noindex` et n'apparaissent jamais dans le sitemap.
