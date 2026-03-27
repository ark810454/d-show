#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ] && [ -n "${MYSQL_HOST:-}" ] && [ -n "${MYSQL_DATABASE:-}" ] && [ -n "${MYSQL_USER:-}" ]; then
  MYSQL_PORT_VALUE="${MYSQL_PORT:-3306}"
  MYSQL_PASSWORD_VALUE="${MYSQL_PASSWORD:-}"

  if [ -n "$MYSQL_PASSWORD_VALUE" ]; then
    export DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD_VALUE}@${MYSQL_HOST}:${MYSQL_PORT_VALUE}/${MYSQL_DATABASE}"
  else
    export DATABASE_URL="mysql://${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT_VALUE}/${MYSQL_DATABASE}"
  fi
fi

cd /app/apps/backend
npx prisma migrate deploy
node dist/main.js
