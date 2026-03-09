#!/usr/bin/env sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-false}" = "true" ]; then
  echo "Running Prisma migrations..."
  npm run db:migrate
fi

echo "Starting Next.js on 0.0.0.0:${PORT:-3000}..."
exec npx next start --hostname 0.0.0.0 --port "${PORT:-3000}"
