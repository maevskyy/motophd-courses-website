# Восстановление после потери VPS

Эта инструкция рассчитана на аварию: старый VPS недоступен, а PostgreSQL нужно
вернуть из ночного архива в R2. Делайте шаги по порядку; DNS переключайте только
после успешной проверки сайта на новом VPS.

> Важно: архив — это PostgreSQL в формате `pg_dump -Fc`, дополнительно сжатый
> gzip. Медиа R2 и видео Stream не восстанавливаются этим процессом: они уже
> хранятся в управляемых сервисах.

## Что понадобится

- Новый VPS с Docker Engine и Docker Compose plugin.
- Доступ к репозиторию и к образу приложения в GHCR.
- Сохранённый `.env` или возможность заново собрать все секреты: PostgreSQL,
  Payload, R2, Grafana, Telegram и Healthchecks.
- R2 S3 credentials для бакета `motophd-backups`.
- Доступ к DNS Cloudflare.

## 1. Сначала не переключайте DNS

Создайте VPS и закройте его от публичного трафика, пока не закончится проверка.
Установите Docker и Docker Compose по официальной инструкции для ОС VPS. На
локальной машине передайте каталог `deploy/` из проверенной версии репозитория
в `~/motophd/deploy` нового VPS. Не копируйте пустой шаблон `.env` вместо
настоящих секретов.

На новом VPS создайте `~/motophd/deploy/.env` по `deploy/.env.prod.example`.
Укажите тот же `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`PAYLOAD_SECRET` и нужный тег образа (`GHCR_IMAGE`/`IMAGE_TAG`). Добавьте
сертификаты origin в `~/motophd/deploy/certs/`, если Caddy использует их как в
текущей конфигурации.

## 2. Скачать выбранный архив из R2

Перейдите в каталог с compose и выведите содержимое offsite-бакета:

```sh
cd ~/motophd/deploy
docker compose run --rm --no-deps backup sh -c '
  rclone lsf ":s3:${BACKUP_R2_BUCKET}" \
    --s3-provider Cloudflare \
    --s3-endpoint "${BACKUP_R2_ENDPOINT}" \
    --s3-access-key-id "${BACKUP_R2_ACCESS_KEY_ID}" \
    --s3-secret-access-key "${BACKUP_R2_SECRET_ACCESS_KEY}"
'
```

Выберите самый свежий архив `motophd-postgres-*.dump.gz` и сохраните его имя:

```sh
export RESTORE_FILE=motophd-postgres-YYYY-MM-DDTHH-MM-SSZ.dump.gz
```

Скопируйте только этот файл в локальный именованный том `backup_data`:

```sh
docker compose run --rm --no-deps -e RESTORE_FILE backup sh -c '
  rclone copy ":s3:${BACKUP_R2_BUCKET}" /backups \
    --include "${RESTORE_FILE}" \
    --s3-provider Cloudflare \
    --s3-endpoint "${BACKUP_R2_ENDPOINT}" \
    --s3-access-key-id "${BACKUP_R2_ACCESS_KEY_ID}" \
    --s3-secret-access-key "${BACKUP_R2_SECRET_ACCESS_KEY}"
'
```

Если файл не скачался, остановитесь: не создавайте пустую базу и не
переключайте DNS. Сначала проверьте R2 credentials и точное имя архива.

## 3. Поднять пустой PostgreSQL и залить дамп

Запустите только PostgreSQL и дождитесь статуса healthy:

```sh
docker compose up -d postgres
docker compose ps postgres
```

Удалите автоматически созданную пустую БД и создайте её заново:

```sh
docker compose exec -T postgres sh -c '
  psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();"
  psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";"
  psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "CREATE DATABASE \"$POSTGRES_DB\" OWNER \"$POSTGRES_USER\";"
'
```

Залейте архив. Команда передаёт распакованный custom dump напрямую в
`pg_restore`, не создавая копию на диске PostgreSQL:

```sh
docker compose run --rm --no-deps -e RESTORE_FILE backup sh -c \
  'gzip -dc "/backups/${RESTORE_FILE}"' \
  | docker compose exec -T postgres sh -c \
      'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges --exit-on-error'
```

Проверьте, что в базе появились таблицы и последовательности:

```sh
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\\dt"'
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\\ds"'
```

## 4. Поднять сайт и проверить до DNS

Запустите весь набор и убедитесь, что контейнер приложения healthy:

```sh
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 app postgres caddy
```

Проверьте `/api/health` с самого VPS. Затем временно направьте локальный hosts
на IP нового VPS либо используйте безопасный тестовый hostname и проверьте:

- главную страницу;
- вход в админку через Cloudflare Access;
- несколько существующих курсов и уроков;
- Grafana и свежий статус backup check.

Если проверка не прошла, DNS не меняйте. Сохраните вывод логов и разбирайте
проблему на новом VPS: исходные данные R2 от этого не пострадают.

## 5. Переключить DNS и наблюдать

Только после проверки поменяйте A/AAAA записи в Cloudflare на IP нового VPS.
Убедитесь, что режим SSL Cloudflare и origin-сертификаты соответствуют старому
серверу. После переключения проверьте публичный `https://motophd.com/api/health`,
получение Telegram-алертов и первую ночную резервную копию.

## Чек-лист тренировочного восстановления

Restore-тест в этой задаче намеренно не запускался: он требует отдельного
чистого VPS или изолированного PostgreSQL и согласованного окна.

| Поле | Значение |
| --- | --- |
| Дата последнего теста | 30.08.2026 |
| Кто выполнял | агент + Дима (ключи) |
| Архив | motophd-postgres-2026-08-30T19-20-13Z.dump.gz, скачан из R2 |
| Таблицы и последовательности совпали | да: courses=2, lessons=26, users=1, purchases=2 — как на проде |
| Вход и доступ к уроку проверены | нет — restore шёл в одноразовый контейнер, приложение к нему не подключалось |
| Что исправить до следующего теста | завести HEALTHCHECKS_BACKUP_URL (MOT-5 шаг 4), проверить первый ночной дамп 31.08 |
