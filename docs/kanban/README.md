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
- нет задач.

**done:**
- [task_next_init_and_port_1](./done/task_next_init_and_port_1.md) — init Next.js + перенос прототипа 1:1 (замещает черновики `task_init_repo_1` и `task_rebuild_prototype_10` в tbd)
- [task_refactor_colocation_11](./done/task_refactor_colocation_11.md) — рефактор порта под CODE_STYLE (колокация стилей, размеры файлов)
- [task_payload_db_admin_12](./done/task_payload_db_admin_12.md) — Payload 3 + Postgres + `/admin` внутри текущего Next-приложения

Остальной бэклог — черновиками в [../tbd/](../tbd/README.md), формулируются в задачи вручную.
