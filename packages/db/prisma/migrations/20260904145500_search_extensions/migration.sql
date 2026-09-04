-- Extensions PostgreSQL pour la recherche tolérante (ADR-005)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Index trigram sur les titres des contenus publics
CREATE INDEX IF NOT EXISTS "Article_title_trgm_idx" ON "Article" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Page_title_trgm_idx" ON "Page" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Resource_title_trgm_idx" ON "Resource" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Course_title_trgm_idx" ON "Course" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Service_name_trgm_idx" ON "Service" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Event_title_trgm_idx" ON "Event" USING gin ("title" gin_trgm_ops);
