#!/usr/bin/env bash
# Готовит локальную базу для разработки: роль motophd, база motophd, владелец — motophd.
# Запуск: pnpm db:setup   (пересоздать с нуля: pnpm db:setup -- --reset)
# Требует запущенный локальный Postgres: pnpm db:up
set -euo pipefail

DB_NAME="${POSTGRES_DB:-motophd}"
DB_USER="${POSTGRES_USER:-motophd}"
DB_PASSWORD="${POSTGRES_PASSWORD:-motophd}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

psql_admin() { psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -v ON_ERROR_STOP=1 "$@"; }

if ! psql_admin -tc 'SELECT 1' >/dev/null 2>&1; then
  echo "Postgres не отвечает на $DB_HOST:$DB_PORT. Запусти: pnpm db:up" >&2
  exit 1
fi

if [[ "${1:-}" == "--reset" ]]; then
  echo "Удаляю базу ${DB_NAME}"
  psql_admin -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE);"
fi

psql_admin -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE \"$DB_USER\" LOGIN PASSWORD '$DB_PASSWORD' CREATEDB;
  END IF;
END \$\$;"

if ! psql_admin -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  createdb -h "$DB_HOST" -p "$DB_PORT" -O "$DB_USER" "$DB_NAME"
fi

# Владелец базы обязателен: иначе миграции падают на "permission denied for schema public".
psql_admin -c "ALTER DATABASE \"$DB_NAME\" OWNER TO \"$DB_USER\";"

echo "Готово. DATABASE_URI=postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
