# Task 7 — Мониторинг: Grafana + Prometheus + Loki

**Depends on:** 3
**Goal:** `grafana.motophd.com` отвечает на вопрос «всё ли живо» за 10 секунд.

## Scope

- В прод-compose: prometheus, grafana, loki, promtail, node-exporter, cadvisor, blackbox-exporter (или Uptime Kuma).
- Caddy metrics-эндпоинт → Prometheus.
- Retention: Prometheus ~15d, Loki ~30d (диск не жрём).
- Дашборды: (1) хост — CPU/RAM/диск; (2) контейнеры — RSS/CPU/рестарты (memory leak виден здесь); (3) HTTP через Caddy — RPS/коды/латентность; (4) логи Loki; (5) uptime + TLS-срок.
- Алерт «сайт не отвечает» → Telegram/почта Димы.
- Grafana — только за Cloudflare Access, анонимный доступ выключен.

## Acceptance criteria

- Все контейнеры видны в метриках и логах; kill контейнера виден на дашборде и триггерит алерт.
- Дашборды переживают пересоздание Grafana (provisioning в git, не руками).
- Диск-прогноз: retention настроен, объём ограничен.

## Out of scope

- Бизнес-метрики (ADR-8), APM/трейсинг, Sentry.

## References

- [ARCHITECTURE.md — Мониторинг](../../ARCHITECTURE.md#мониторинг) · ADR-8 в [DECISIONS.md](../../DECISIONS.md)
