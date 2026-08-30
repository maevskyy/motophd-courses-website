# Поток S6 — Мониторинг-начинка + бэкапы (задачи 7 и 8)

Ветка `feature/observability`. Сначала прочитай `docs/tbd/sprint/COORDINATION.md`.
Основа скоупа — два черновика: `docs/tbd/task_monitoring_7.md` и
`docs/tbd/task_backups_8.md` (читай целиком), плюс `docs/ARCHITECTURE.md`
(Мониторинг, Бэкапы 3-2-1) и текущий `deploy/docker-compose.prod.yml` + `deploy/Caddyfile`.

**Важно:** это конфиги, применяемые на VPS руками. Твой результат — готовые файлы
в `deploy/` + пошаговая инструкция применения. Сам ты на VPS НЕ ходишь, ничего не
деплоишь; всё, что нельзя проверить без бокса, — списком в отчёт.

## Scope

1. **Мониторинг** (`deploy/monitoring/**` + правки `docker-compose.prod.yml`):
   prometheus, loki, promtail, node-exporter, cadvisor, blackbox-exporter; retention
   Prometheus ~15d / Loki ~30d; Grafana уже есть — добавь **provisioning в git**
   (datasources + дашборды: хост CPU/RAM/диск; контейнеры RSS/CPU/рестарты; HTTP через
   Caddy RPS/коды/латентность; логи; uptime+TLS-срок). Caddy metrics-эндпоинт → Prometheus
   (если нужна правка Caddyfile — НЕ правь, зона S7: опиши нужную строку в отчёте
   «для интеграции»).
2. **Алерты**: Grafana alerting (provisioning) — «сайт не отвечает» (blackbox на
   https://motophd.com/api/health), «диск > 85%», «контейнер рестартует» →
   **Telegram contact point** (env `TG_BOT_TOKEN`, `TG_CHAT_ID` на боксе; имена добавь
   в `deploy/.env.prod.example`).
3. **Бэкапы** (`deploy/backup/**` + сервис в compose): ночной cron-контейнер
   `pg_dump -Fc | gzip` → offsite в R2-бакет `motophd-backups` через rclone (S3-совместимый,
   env `BACKUP_R2_*`); retention offsite 14 дней, локально — последние 3; при ошибке
   бэкапа — алерт (проще всего healthchecks.io-пинг или запись, которую видит Grafana;
   выбери одно, зафиксируй).
4. **`docs/RESTORE.md`**: пошаговое восстановление с нуля (новый VPS → compose → restore
   дампа → DNS), написанное «для паники». Restore-тест руками — НЕ сегодня, но в доке
   оставь чек-лист прогона с местом под дату.
5. **Инструкция применения** — `deploy/monitoring/APPLY.md`: что scp-нуть на бокс,
   какие env добавить в `~/motophd/.env`, какие команды выполнить, как проверить.

Compose-файл — общая зона с прод-стеком: меняй аддитивно (новые сервисы, volumes),
существующие сервисы (app, postgres, caddy, grafana) не переписывай без необходимости.
Новые npm-зависимости: никаких (это не app-код).

## Проверка
`docker compose -f deploy/docker-compose.prod.yml config --quiet` проходит;
конфиги prometheus/loki валидны (можно `docker run --rm -v ... promtool check config`);
`pnpm lint` не сломан (файлы вне src — но проверь).
