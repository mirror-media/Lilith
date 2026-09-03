-- Vector storage for auto-tagging (semantic tag matching).
-- Lives in the dedicated `ai` schema so Prisma migrate diff never sees it.
--
-- One-time prep per environment, run by a superuser BEFORE this migration
-- (the app user cannot create schemas):
--   CREATE EXTENSION IF NOT EXISTS vector;
--   CREATE SCHEMA IF NOT EXISTS ai;
--   GRANT USAGE, CREATE ON SCHEMA ai TO <app_user>;
--
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
