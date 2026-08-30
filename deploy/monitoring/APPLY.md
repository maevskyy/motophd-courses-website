# Применение мониторинга и бэкапов

Эта инструкция применяется на VPS из каталога `~/motophd/deploy`. Она не меняет
данные PostgreSQL и не пересобирает приложение.

## 1. Передать файлы на VPS

На локальной машине, из корня репозитория, передайте только файлы этого потока:

```sh
scp deploy/docker-compose.prod.yml user@vps:~/motophd/deploy/
scp -r deploy/monitoring deploy/backup user@vps:~/motophd/deploy/
```

Замените `user@vps` на фактический SSH-адрес. Не передавайте файл с секретами
`.env` через `scp`: он остаётся только на VPS.

## 2. Добавить секреты

На VPS откройте `~/motophd/deploy/.env` и добавьте значения из блока
`observability` в `.env.prod.example`:

```dotenv
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
`HEALTHCHECKS_BACKUP_URL`. Он отправляет уведомление о неуспешном или
пропущенном ночном бэкапе.

Для Telegram создайте бота, добавьте его в нужный чат и укажите его token и ID
чата. До запуска проверьте, что бот может отправлять туда сообщения.

## 3. Метрики Caddy

Текущий Caddyfile не отключает Admin API, поэтому Caddy уже отдаёт `/metrics` на
своём внутреннем admin-адресе `:2019`; Prometheus забирает их по `caddy:2019`.
Файл Caddyfile не изменён. Не публикуйте порт 2019 наружу.

Для интеграции: если в будущем Admin API будет отключён или перенесён, S7 должен
явно настроить Caddy `metrics` endpoint и одновременно поменять target `caddy`
в `monitoring/prometheus.yml`.

## 4. Проверить конфигурацию и запустить

На VPS:

```sh
cd ~/motophd/deploy
docker compose --env-file .env config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 prometheus loki promtail backup
```

Откройте `https://grafana.motophd.com`. В папке **MotoPhD** должны появиться
пять дашбордов, а в Connections → Data sources — Prometheus и Loki. В
Alerting → Contact points должен появиться Telegram.

В Prometheus (`http://prometheus:9090` внутри сети Compose) страница Targets
должна показывать `prometheus`, `node-exporter`, `cadvisor`, `blackbox` и
`caddy` как `UP`.

## 5. Проверить бэкап до первой ночи

Запустите один бэкап вручную и убедитесь, что в R2 появился файл:

```sh
cd ~/motophd/deploy
docker compose run --rm backup /usr/local/bin/backup
docker compose logs --tail=100 backup
```

В Healthchecks.io check должен стать успешным. Контейнер затем запускает задачу
каждую ночь в 02:30 по `TZ`; в R2 сохраняются 14 последних дней, в локальном
томе — три последних архива.

## Проверка алертов

1. В Grafana → Alerting убедитесь, что три правила имеют состояние `Normal`.
2. На короткое время остановите **любой неважный** тестовый контейнер или
   перезапустите `backup`; после следующего опроса cAdvisor придёт Telegram.
3. Не останавливайте `postgres` или `app` на живом сайте ради проверки.

## Откат

Если новый набор контейнеров не стартует, остановите только их, не трогая
`app`, `postgres`, `caddy` и `grafana`:

```sh
docker compose stop prometheus loki promtail node-exporter cadvisor blackbox-exporter backup
```

Именованные тома не удаляйте: в них лежат метрики, логи и локальные бэкапы.
