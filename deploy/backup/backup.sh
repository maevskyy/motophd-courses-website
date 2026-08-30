#!/bin/sh

set -eu

backup_dir=/backups
timestamp=$(date -u +%Y-%m-%dT%H-%M-%SZ)
backup_name="motophd-postgres-${timestamp}.dump.gz"
backup_path="${backup_dir}/${backup_name}"
remote=":s3:${BACKUP_R2_BUCKET}"

ping() {
  curl --fail --max-time 10 --retry 2 --silent --show-error "$1" >/dev/null
}

fail() {
  rm -f "${backup_path}"
  ping "${HEALTHCHECKS_BACKUP_URL}/fail" || true
  exit 1
}

mkdir -p "${backup_dir}"
umask 077

ping "${HEALTHCHECKS_BACKUP_URL}/start" || true

if ! pg_dump --format=custom | gzip >"${backup_path}"; then
  fail
fi

if ! rclone copyto "${backup_path}" "${remote}/${backup_name}" \
  --s3-provider Cloudflare \
  --s3-endpoint "${BACKUP_R2_ENDPOINT}" \
  --s3-access-key-id "${BACKUP_R2_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${BACKUP_R2_SECRET_ACCESS_KEY}"; then
  fail
fi

if ! rclone delete "${remote}" \
  --min-age 14d \
  --include 'motophd-postgres-*.dump.gz' \
  --s3-provider Cloudflare \
  --s3-endpoint "${BACKUP_R2_ENDPOINT}" \
  --s3-access-key-id "${BACKUP_R2_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${BACKUP_R2_SECRET_ACCESS_KEY}"; then
  fail
fi

rclone rmdirs "${remote}" \
  --leave-root \
  --s3-provider Cloudflare \
  --s3-endpoint "${BACKUP_R2_ENDPOINT}" \
  --s3-access-key-id "${BACKUP_R2_ACCESS_KEY_ID}" \
  --s3-secret-access-key "${BACKUP_R2_SECRET_ACCESS_KEY}" || true

# The generated names are shell-safe; keep the three newest local archives.
ls -1t "${backup_dir}"/motophd-postgres-*.dump.gz 2>/dev/null \
  | awk 'NR > 3' \
  | xargs -r rm -f

ping "${HEALTHCHECKS_BACKUP_URL}"
