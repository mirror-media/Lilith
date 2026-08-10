-- Vector storage for auto-tagging (semantic tag matching).
-- Lives in a dedicated `ai` schema so Prisma migrate diff never sees it:
-- everything here is hand-managed, Keystone lists must not reference it.

-- Requires the pgvector extension. The Cloud SQL app user holds
-- `cloudsqlsuperuser`, and local dev uses the pgvector/pgvector image,
-- so IF NOT EXISTS keeps this idempotent everywhere.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS ai;

CREATE TABLE IF NOT EXISTS ai.tag_embedding (
    tag_id      INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    -- hash of the source text used to build the embedding; lets the backfill
    -- job skip tags whose source text has not changed
    source_hash TEXT,
    embedding   vector(768) NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ~21k tags today: HNSW keeps nearest-neighbour lookups sub-millisecond and
-- scales if the tag library keeps growing. Default build parameters.
CREATE INDEX IF NOT EXISTS tag_embedding_embedding_hnsw
    ON ai.tag_embedding USING hnsw (embedding vector_cosine_ops);
