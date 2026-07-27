# Task 13 — Инфра-хвосты после task 3+4 (черновик)

**Depends on:** 3, 4 (обе done 26.07.2026)
**Goal:** добить отложенные куски инфры: изоляция админ-поверхностей, защита main, худой образ,
проверенный rollback, деплой-инструкция для Ани.

## Scope (сырой список, груминг за Димой)

- **Изоляция админки (бывш. «M3»):** на `motophd.com` блок `/admin*` → 404 (Caddy);
  `admin.motophd.com` → тот же app; **Cloudflare Access** (email-allowlist: Дима, Аня, Влад)
  на `admin.` и `grafana.`. Опц. следующий уровень — второй контейнер app-admin (ADR-1).
- **Branch protection `main`:** PR + зелёный CI обязательны; прямой push запрещён.
- **Похудеть образ** (~1.6 GB → 300–400 MB): runner-стадия без полного `node_modules`
  (standalone уже несёт свои traced-deps), отдельный target/образ для `migrate`+`seed`.
- **Rollback-прогон руками:** задеплоить предыдущий тег, убедиться, зафиксировать процедуру.
- **Инструкция для Ани:** «push → PR → галки CI → кнопка Deploy» со скриншотами (куда жать в Actions).
- **Автосинк deploy-конфигов:** сейчас `deploy/*` попадает на бокс scp-руками, а после правки
  Caddyfile нужен ручной `restart caddy` — добавить scp+reload шагом в `deploy.yml`.
- **Grafana:** сменить стартовый env-пароль, завести юзеров (доступ — через Access выше).
- **`docs/RUNBOOK_VPS.md`:** зафиксировать фактическую настройку бокса (ssh-алиас, hardening,
  certs, `~/motophd/*`) — чтобы восстановить с нуля не по памяти.

## Acceptance criteria (набросок)

- `motophd.com/admin` → 404; `admin.motophd.com` без прохождения Access не открывается,
  с Access → логин Payload. Grafana — аналогично.
- Прямой push в `main` отклоняется; PR без зелёного CI не мержится.
- App-образ в GHCR ≤ 500 MB; migrate/seed по-прежнему работают.
- Rollback проверен руками и описан в runbook.

## Out of scope

- Мониторинг-начинка (task 7), бэкапы (task 8), медиа (task 5), платежи (task 6).

## References

- [task_vps_bootstrap_3](../kanban/done/task_vps_bootstrap_3.md) · [task_cicd_4](../kanban/done/task_cicd_4.md)
- ADR-1, ADR-5 в [DECISIONS.md](../DECISIONS.md) · [ARCHITECTURE.md — Топология](../ARCHITECTURE.md)
