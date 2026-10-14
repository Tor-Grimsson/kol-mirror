-- kol-mirror D1 — one table for the library (patch · expression · effect) and the nine memory
-- slots (kind `memory`, id `memory:<n>`). `spec` is the item as the app stores it.
-- SOFT DELETE: a tombstone, never a removed row — a stale client must not resurrect what another
-- machine deleted. Apply: `pnpm api:schema` (remote) · `pnpm api:schema:local` (wrangler dev).
CREATE TABLE IF NOT EXISTS documents (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL,
  name       TEXT,
  spec       TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS documents_kind_deleted ON documents (kind, deleted);
