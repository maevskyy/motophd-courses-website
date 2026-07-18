# Git-процесс

Формат коммитов и ветвление. Коротко и по факту.

## Сейчас
- Пушим **напрямую в `main`** (пока нет CI и второго разработчика). Мелкие коммиты, привязанные к задаче из `docs/kanban/`.
- Сообщение — **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- Любой набор изменений → агент **предлагает имя коммита**; решает и коммитит человек.

## Позже (с CI и Аней)
- `main` защищён. Фича = ветка `feature/<slug>` → PR → зелёный CI → squash-merge.
- Деплой — кнопкой (см. [ARCHITECTURE.md](./ARCHITECTURE.md#окружения-и-деплой)).

## Примеры
```
chore(init): next.js + app router + scss + eslint
feat(i18n): локали en/ru через next-intl
feat(landing): перенос лендинга из прототипа
docs(gitflow): процесс коммитов
```
