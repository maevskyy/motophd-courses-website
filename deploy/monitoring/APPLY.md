# Применение мониторинга и бэкапов

Инструкция применяется на VPS в каталоге `~/motophd` — это фактический корень
боевого стека (`~/motophd/docker-compose.prod.yml` + `~/motophd/.env`, см.
[docs/RUNBOOK_VPS.md](../../docs/RUNBOOK_VPS.md) и `.github/workflows/deploy.yml`).
Никакого подкаталога `deploy/` на сервере нет: относительные маунты
(`./Caddyfile`, `./certs`, `./monitoring`, `./backup`) резолвятся именно от
`~/motophd`. Раскладка на VPS:

```text
~/motophd/
  docker-compose.prod.yml
  .env                 ← секреты, остаётся только на сервере
  Caddyfile
  certs/               ← origin.pem, origin.key
  monitoring/
  backup/
```

Инструкция не меняет данные PostgreSQL и не пересобирает приложение.

## 1. Сначала секреты, потом compose

⚠️ **Порядок важен.** Новый `docker-compose.prod.yml` требует переменные с
`:?` (`TG_BOT_TOKEN`, `TG_CHAT_ID`, `BACKUP_R2_*`, `HEALTHCHECKS_BACKUP_URL`).
Если положить compose раньше, чем заполнен `.env`, то `docker compose config
--quiet` начнёт падать — а именно эту команду выполняет шаг **Preflight VPS** в
`Deploy`. Кнопка Deploy перестанет работать до тех пор, пока переменные не
появятся. Поэтому сначала правим `.env`.

На VPS откройте `~/motophd/.env` и добавьте блоки `app` и `observability` из
[`deploy/.env.prod.example`](../.env.prod.example):

```dotenv
APP_URL=https://motophd.com
RESEND_API_KEY=...
EMAIL_FROM=MotoPhD <noreply@motophd.com>
FEEDBACK_CONTACT_URL=...
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=

TG_BOT_TOKEN=...
TG_CHAT_ID=...
BACKUP_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
BACKUP_R2_ACCESS_KEY_ID=...
BACKUP_R2_SECRET_ACCESS_KEY=...
BACKUP_R2_BUCKET=motophd-backups
HEALTHCHECKS_BACKUP_URL=https://hc-ping.com/<backup-check-uuid>
TZ=UTC
```

Создайте отдельный S3 API token R2 с правом только на чтение и запись в бакет
`motophd-backups`. В Healthchecks.io создайте check с периодом `1 day` и
grace-периодом не менее 2 часов; его ping URL положите в
`HEALTHCHECKS_BACKUP_URL`. Он уведомляет о неуспешном или пропущенном ночном
бэкапе.

Для Telegram создайте бота, добавьте его в нужный чат и укажите его token и ID
чата. До запуска проверьте, что бот может отправлять туда сообщения.

## 2. Передать файлы на VPS

Только после шага 1. На локальной машине, из корня репозитория:

```sh
scp deploy/docker-compose.prod.yml user@vps:~/motophd/docker-compose.prod.yml
scp deploy/Caddyfile user@vps:~/motophd/Caddyfile
scp -r deploy/monitoring deploy/backup user@vps:~/motophd/
```

Замените `user@vps` на фактический SSH-адрес. `.env` через `scp` не передаём:
он существует только на VPS.

## 3. Cloudflare: админка на отдельном хосте

Публичный `motophd.com` больше не отдаёт `/admin*` (404) — так требует
[ARCHITECTURE](../../docs/ARCHITECTURE.md). Админка переехала на
`admin.motophd.com`. `/api` остаётся открытым на публичном хосте: там платёжные
вебхуки и выдача защищённых PDF.

Перед выкладкой нового Caddyfile в Cloudflare нужно:

1. Завести DNS-запись `admin` → тот же origin IP, что и `motophd.com`,
   proxied (оранжевое облако).
2. В Zero Trust → Access → Applications создать self-hosted приложение на
   `admin.motophd.com` с политикой allow только для нужных email.
3. Убедиться, что origin-сертификат в `~/motophd/certs/origin.pem` покрывает
   `*.motophd.com` (тот же сертификат уже обслуживает `grafana.motophd.com`).

⚠️ Смок-проверка в `.github/workflows/deploy.yml` последней строкой делает
`curl -fsS -o /dev/null https://motophd.com/admin`. После закрытия `/admin`
она получит 404 и деплой упадёт на зелёном сайте. Строку нужно убрать или
заменить на проверку `https://admin.motophd.com/admin` — правку в `.github/`
делает владелец репозитория, эта инструкция её не покрывает.

## 4. Метрики Caddy

Admin API Caddy (`:2019`) слушает только localhost внутри контейнера, поэтому
таргет `caddy:2019` всегда был бы DOWN. В `deploy/Caddyfile` добавлены
глобальная опция `metrics` и отдельный внутренний слушатель:

```caddyfile
:2020 {
	metrics /metrics
}
```

Prometheus ходит на `caddy:2020`. Порт наружу не публикуется, admin API в сеть
compose не выносится.

## 5. Проверить конфигурацию и запустить

На VPS:

```sh
cd ~/motophd
docker compose -f docker-compose.prod.yml config --quiet
docker run --rm -v ~/motophd/Caddyfile:/etc/caddy/Caddyfile:ro caddy:2-alpine \
  caddy validate --config /etc/caddy/Caddyfile
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 prometheus loki promtail backup
```

Caddy перечитает конфиг при `up -d` (контейнер пересоздастся). Если сайт после
этого не отвечает — сразу вернуть прежний `Caddyfile` и повторить `up -d caddy`.

Откройте `https://grafana.motophd.com`. В папке **MotoPhD** должны появиться
пять дашбордов, а в Connections → Data sources — Prometheus и Loki. В
Alerting → Contact points должен появиться Telegram.

В Prometheus (`http://prometheus:9090` внутри сети Compose) страница Targets
должна показывать `prometheus`, `node-exporter`, `cadvisor`, `blackbox` и
`caddy` как `UP`.

Promtail читает логи через Docker API (`/var/run/docker.sock`, read-only), а не
из `/var/lib/docker/containers`, — только так в Loki попадает имя контейнера. В
Explore → Loki запрос `{job="docker", container="motophd-app-1"}` должен
возвращать логи приложения.

## 6. Проверить бэкап до первой ночи

Запустите один бэкап вручную и убедитесь, что в R2 появился файл:

```sh
cd ~/motophd
docker compose -f docker-compose.prod.yml run --rm backup /usr/local/bin/backup
docker compose -f docker-compose.prod.yml logs --tail=100 backup
```

В логах должны быть строки `backup: dump ok: ... bytes` и
`backup: uploaded ...`. Скрипт проверяет дамп до отправки: пустой или
нечитаемый архив помечает job как проваленный и не пингует успех. В
Healthchecks.io check должен стать успешным. Контейнер затем запускает задачу
каждую ночь в 02:30 по `TZ`; в R2 хранятся 14 последних дней, в локальном
томе — три последних архива.

## 7. Проверка алертов

1. В Grafana → Alerting убедитесь, что три правила имеют состояние `Normal`.
2. На короткое время остановите **любой неважный** тестовый контейнер или
   перезапустите `backup`; после следующего опроса cAdvisor придёт Telegram.
3. Не останавливайте `postgres` или `app` на живом сайте ради проверки.

## Откат

Если новый набор контейнеров не стартует, остановите только их, не трогая
`app`, `postgres`, `caddy` и `grafana`:

```sh
cd ~/motophd
docker compose -f docker-compose.prod.yml stop \
  prometheus loki promtail node-exporter cadvisor blackbox-exporter backup
```

Именованные тома не удаляйте: в них лежат метрики, логи и локальные бэкапы.
