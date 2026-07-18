# Task 8 — Бэкапы: pg_dump → offsite + restore-тест

**Depends on:** 3
**Goal:** Смерть VPS не теряет данные: правило 3-2-1, восстановление проверено руками.

## Scope

- Offsite-хранилище: Hetzner Storage Box (или Backblaze B2).
- Крон-контейнер (или systemd-timer): ночной `pg_dump -Fc` → gzip → rclone/scp в offsite; retention 14 дней; локальная копия последних 3.
- Уведомление об ошибке бэкапа (алерт из task 7 или простой healthcheck-пинг типа healthchecks.io).
- `docs/RESTORE.md`: пошаговое восстановление с нуля (новый VPS → compose → restore дампа → переключение DNS) — написан так, чтобы сработал в панике.
- Прогнать restore на чистом Postgres-контейнере — руками, один раз, зафиксировать в RESTORE.md дату прогона.

## Acceptance criteria

- Ночной дамп появляется в offsite; retention чистит старые.
- Restore-прогон выполнен, данные совпадают (таблицы/счётчики).
- Упавший бэкап поднимает алерт.

## Out of scope

- Бэкап R2/Stream (managed-durability, ADR-3), PITR/WAL-архивы (оверкилл для нашего объёма).

## References

- [ARCHITECTURE.md — Бэкапы](../../ARCHITECTURE.md#бэкапы-3-2-1) · ADR-2 в [DECISIONS.md](../../DECISIONS.md)
