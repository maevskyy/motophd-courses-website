# Kanban

Файловый канбан: **колонка = папка**, перенос файла = смена статуса.

```
docs/kanban/todo/    — готово к работе, отсортировано
docs/kanban/doing/   — в работе (WIP-лимит: 1)
docs/kanban/done/    — сделано (файл остаётся историей)
docs/tbd/            — бэклог на грумминг (в работу не берут)
```

- Задача самодостаточна: Goal / Scope / Acceptance / Out of scope / References.
- Взял → перенеси файл в `doing/` тем же коммитом, что и ветку. Закрыл → в `done/` тем же PR.
- Имя: `task_<slug>_<N>.md`, сквозная нумерация.

## В работе / готово

**todo:**
- [task_real_auth_14](./todo/task_real_auth_14.md) — настоящий вход/выход через Payload, httpOnly-кука, снос фейкового `AuthProvider`
- [task_protect_private_routes_15](./todo/task_protect_private_routes_15.md) — замок на кабинет и плеер (логин + оплаченная покупка), `user` в запросы данных · зависит от 14
- [task_close_lesson_leak_16](./todo/task_close_lesson_leak_16.md) — field-level доступ к содержимому уроков, `isFreePreview` начинает работать · зависит от 14

**done:**
- [task_next_init_and_port_1](./done/task_next_init_and_port_1.md) — init Next.js + перенос прототипа 1:1 (замещает черновики `task_init_repo_1` и `task_rebuild_prototype_10` в tbd)
- [task_refactor_colocation_11](./done/task_refactor_colocation_11.md) — рефактор порта под CODE_STYLE (колокация стилей, размеры файлов)
- [task_payload_db_admin_12](./done/task_payload_db_admin_12.md) — Payload 3 + Postgres + `/admin` внутри текущего Next-приложения
- [task_content_model_2](./done/task_content_model_2.md) — доменные Payload-коллекции, базовый доступ, seed курсов
- [task_vps_bootstrap_3](./done/task_vps_bootstrap_3.md) — OVH VPS + hardening, Cloudflare DNS/TLS (Full strict + origin-cert), Caddy, прод-compose
- [task_cicd_4](./done/task_cicd_4.md) — ci.yml + deploy.yml: образ→GHCR, деплой/rollback кнопкой, миграции и seed в пайплайне

Остальной бэклог — черновиками в [../tbd/](../tbd/README.md), формулируются в задачи вручную.
