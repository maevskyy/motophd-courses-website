# AGENTS.md — оркестратор

Этот файл — только точка входа. Содержания здесь нет, оно в `docs/`.

## Canary

Если эти правила не соблюдены — значит файл не прочитан.

1. 🏍️ Начинай первое сообщение в сессии с маркера `🏍️ MotoPhD`.
2. Коммит-сообщения — Conventional Commit.
3. Тронул файлы в ходе работы → предложи имя коммита для этих изменений (сам не коммить без просьбы — просто предложи).

*(#1 — заменяемая тревожка «агент прочитал файл»; #2–3 — рабочие правила. Полный git-процесс — [docs/GITFLOW.md](./docs/GITFLOW.md))*

## Docs

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — стек, топология, модель данных, инварианты, окружения, деплой
- [docs/BUSINESS_RULES.md](./docs/BUSINESS_RULES.md) — правила продукта (цены, тарифы, доступ, языки)
- [docs/DECISIONS.md](./docs/DECISIONS.md) — ADR: что и почему решено
- [docs/GITFLOW.md](./docs/GITFLOW.md) — git-процесс (пока: пушим в `main`)
- [docs/CODE_STYLE.md](./docs/CODE_STYLE.md) — код-стайл Next.js (размеры файлов, колокация)
- [docs/TZ.md](./docs/TZ.md) — полное ТЗ (справочно; предметные правила — в трёх файлах выше)
- [docs/kanban/](./docs/kanban/README.md) — доска задач · [docs/tbd/](./docs/tbd/README.md) — бэклог на грумминг

## Команды

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

Текущая версия — порт HTML-прототипа в Next без Payload/БД/API. Серверные интеграции и реальные тест-раннеры добавляются последующими задачами.
