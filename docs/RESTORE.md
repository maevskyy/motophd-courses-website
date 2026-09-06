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

Тест гоняем на изолированном PostgreSQL — отдельная база или одноразовый
контейнер, прод не трогаем. Обновляйте таблицу после каждого прогона.

| Поле | Значение |
| --- | --- |
| Дата последнего теста | 06.09.2026 |
| Кто выполнял | агент (ключи R2 из локального `.env`) |
| Архив | motophd-postgres-2026-09-03T02-30-00Z.dump.gz — последний перед остановкой VPS 03.09 |
| Таблицы и последовательности совпали | да: courses=2, lessons=26, users=1, purchases=2, 18 таблиц; `pg_restore` 16 с `--exit-on-error` — 0 ошибок |
| Миграции поверх дампа | да: в дампе 3 миграции из 4 (прод на 03.09 — версия до платёжки), `20260831_193143` накатилась чисто, `media.prefix` сохранён |
| Вход и доступ к уроку проверены | частично: `next build` + `next start` на восстановленной базе — `/api/health` ok, главная и обе страницы курсов 200 из данных дампа, `/learn` закрыт для анонима (307 на login), `/admin` 200, форма чекаута на месте. Логин под прод-админом не проверялся — пароль неизвестен |
| Что исправить до следующего теста | завести `HEALTHCHECKS_BACKUP_URL`: 04.09 ночной дамп не пришёл, и никто не узнал об этом трое суток |

### Грабли

- **Клиент `pg_restore` новее сервера.** `pg_restore` 17+ (например, homebrew на
  маке) добавляет в начало `SET transaction_timeout`, PostgreSQL 16 такого
  параметра не знает, и `--exit-on-error` роняет заливку на первой же строке.
  Восстанавливайте клиентом той же мажорной версии, что сервер: в контейнере
  по инструкции выше это `postgres:16-alpine`, на маке —
  `/opt/homebrew/opt/postgresql@16/bin/pg_restore`.
- **Дамп старее кода.** Если образ приложения новее базы в архиве, после
  заливки и до запуска приложения прогоните миграции (`pnpm payload migrate`
  или ops-контейнер) — недостающие встанут поверх, данные не трогаются.
