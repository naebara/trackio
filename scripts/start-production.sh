#!/usr/bin/env sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-false}" = "true" ]; then
  echo "Running Prisma migrations..."
  ./node_modules/.bin/prisma migrate deploy
fi

echo "Starting Next.js App on 0.0.0.0:${PORT:-3000}..."
exec node server.js
