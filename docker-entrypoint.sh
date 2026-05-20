#!/bin/sh
set -e

# ── Resolve the SQLite file path ────────────────────────────────────────────
# DATABASE_URL format: file:/data/dev.db  or  file:./relative/path
_db_path="${DATABASE_URL#file:}"
case "$_db_path" in
  /*) : ;;
  *)  _db_path="/app/$_db_path" ;;
esac

# Remember whether this is a first-run (no DB file yet)
_is_fresh=false
[ -f "$_db_path" ] || _is_fresh=true

# ── Apply schema ─────────────────────────────────────────────────────────────
# db push is idempotent — safe to run on every startup
echo "[entrypoint] Applying database schema..."
node_modules/.bin/prisma db push --skip-generate

# ── Seed demo data on first start ────────────────────────────────────────────
# Set SEED_ON_INIT=false to start with an empty database
if [ "$_is_fresh" = "true" ] && [ "${SEED_ON_INIT:-true}" = "true" ]; then
  echo "[entrypoint] Fresh database — seeding demo data..."
  node_modules/.bin/prisma db seed || echo "[entrypoint] Seed skipped or failed (non-fatal)"
fi

echo "[entrypoint] Starting PM Copilot on port ${PORT:-3000}..."
exec "$@"
