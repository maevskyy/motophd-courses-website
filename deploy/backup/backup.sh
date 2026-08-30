#!/bin/sh

# Ночной дамп PostgreSQL → gzip → Cloudflare R2 + пинг Healthchecks.io.
#
# pipefail обязателен: без него `pg_dump | gzip` возвращает код gzip, поэтому
# упавший (обрезанный) дамп уезжает в R2 как «успешный», а retention через
# 14 дней удаляет последние валидные копии. Alpine busybox ash поддерживает
# `set -o pipefail`.
set -eu
set -o pipefail

# Compose передаёт эти переменные с пустым дефолтом, чтобы не ронять деплой
# приложения до включения бэкапов (MOT-5). Здесь — граница: без ключей
# бэкап падает громко и понятно, а не загадочной ошибкой rclone.
for required in BACKUP_R2_ENDPOINT BACKUP_R2_ACCESS_KEY_ID BACKUP_R2_SECRET_ACCESS_KEY; do
  eval "required_value=\${${required}:-}"
  if [ -z "${required_value}" ]; then
    echo "backup: ${required} is empty — fill it in ~/motophd/.env (see .env.prod.example, MOT-5)" >&2
    exit 1
  fi
done

backup_dir=/backups
timestamp=$(date -u +%Y-%m-%dT%H-%M-%SZ)
backup_name="motophd-postgres-${timestamp}.dump.gz"
backup_path="${backup_dir}/${backup_name}"
remote=":s3:${BACKUP_R2_BUCKET}"

# Секреты rclone передаём окружением, а не флагами: флаги видны любому в `ps`.
# RCLONE_S3_* работают и для on-the-fly бэкенда `:s3:`.
RCLONE_S3_PROVIDER=Cloudflare
RCLONE_S3_ENDPOINT="${BACKUP_R2_ENDPOINT}"
RCLONE_S3_ACCESS_KEY_ID="${BACKUP_R2_ACCESS_KEY_ID}"
RCLONE_S3_SECRET_ACCESS_KEY="${BACKUP_R2_SECRET_ACCESS_KEY}"
export RCLONE_S3_PROVIDER RCLONE_S3_ENDPOINT RCLONE_S3_ACCESS_KEY_ID RCLONE_S3_SECRET_ACCESS_KEY

log() {
  echo "backup: $*"
}

ping() {
  # Healthchecks не заведён (MOT-5 шаг 4) — молча пропускаем, это опционально.
  [ -n "${HEALTHCHECKS_BACKUP_URL}" ] || return 0
  curl --fail --max-time 10 --retry 2 --silent --show-error "$1" >/dev/null
}

fail() {
  log "FAILED: $1"
  rm -f "${backup_path}"
  ping "${HEALTHCHECKS_BACKUP_URL}/fail" || true
  exit 1
}

mkdir -p "${backup_dir}"
umask 077

ping "${HEALTHCHECKS_BACKUP_URL}/start" || true

pg_dump --format=custom | gzip >"${backup_path}" || fail "pg_dump failed"

# Дамп считается бэкапом только если он непустой и читается целиком.
test -s "${backup_path}" || fail "dump is empty"
gzip -t "${backup_path}" || fail "gzip archive is corrupt"

# pg_restore --list дочитывает только TOC и закрывает вход, после чего gzip
# получает SIGPIPE. Поэтому на этом конвейере pipefail временно выключен —
# важен код возврата именно pg_restore.
set +o pipefail
if gzip -dc "${backup_path}" | pg_restore --list >/dev/null 2>&1; then
  archive_readable=yes
else
  archive_readable=no
fi
set -o pipefail
test "${archive_readable}" = yes || fail "dump is not a readable pg_dump archive"

log "dump ok: $(wc -c <"${backup_path}") bytes"

# --s3-no-check-bucket: скоуп-токен видит только содержимое бакета, а без
# флага rclone пытается HeadBucket/CreateBucket и ловит 403 AccessDenied.
rclone copyto --s3-no-check-bucket "${backup_path}" "${remote}/${backup_name}" || fail "upload to R2 failed"
log "uploaded ${backup_name}"

# Дальше — уборка. Бэкап уже лежит в R2, поэтому падение любого шага ниже
# логируется как warning, но не помечает бэкап проваленным.
if rclone delete "${remote}" \
  --min-age 14d \
  --include 'motophd-postgres-*.dump.gz'; then
  rclone rmdirs "${remote}" --leave-root || log "WARNING: rclone rmdirs failed"
else
  log "WARNING: retention (rclone delete) failed; old dumps stay in R2"
fi

# Имена файлов генерируем сами и они shell-safe; храним три последних локально.
ls -1t "${backup_dir}"/motophd-postgres-*.dump.gz 2>/dev/null \
  | awk 'NR > 3' \
  | xargs -r rm -f \
  || log "WARNING: local cleanup failed"

# Успех уже состоялся — сетевая ошибка на финальном пинге не должна ронять job.
ping "${HEALTHCHECKS_BACKUP_URL}" || log "WARNING: success ping failed"
