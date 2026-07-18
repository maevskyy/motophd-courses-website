# Task 1 — Инициализация Next.js + перенос прототипа 1:1

**Depends on:** —
**Статус:** готова к работе.

## Goal

Поднять Next.js-приложение и перенести в него **весь** `motophd-demo.html` (1319 строк: 6 экранов, CSS, JS) в идиоматичном для Next виде: страницы — через файловый роутинг, стили — SCSS-модули + BEM, интерактив — React-компоненты, тексты — i18n. **Один в один по виду и поведению.** Бэкенда нет — сервер остаётся неработающей заглушкой, как в оригинале.

## Context

`motophd-demo.html` — это псевдо-SPA: 6 экранов в `<div class="page">`, переключаются JS-функцией `goTo()`; вся логика (переключение языка, табы, аккордеоны, фейковый логин через `sessionStorage`, тосты) — в одном `<script>`. Это дизайн-эталон. Задача — перевести его в нормальную структуру Next, **не меняя ни вид, ни контент** (упрощения из ТЗ v2 — прогресс, модули, 2 курса, €129 и т.д. — это ОТДЕЛЬНЫЕ последующие задачи, см. ADR-9; здесь порт как есть). Payload, БД, реальные auth/оплата/видео — не в этой задаче.

## Scope

### A. Инициализация проекта
- Next.js (App Router) + TypeScript (strict), pnpm, `output: 'standalone'`.
- Sass, ESLint + Prettier, `.editorconfig`, `.gitignore`, `.env.example` (пока пустой/минимальный).
- Структура папок по [ARCHITECTURE.md → Репозиторий](../../ARCHITECTURE.md#репозиторий): route-группы `(marketing)/[locale]`, `(app)/[locale]`; `components/`, `lib/`, `messages/`, `styles/`.
- npm-скрипты `dev` / `lint` / `typecheck` / `build` — совпадают с командами в [AGENTS.md](../../../AGENTS.md).
- Локально запускается одной командой `pnpm dev` (БД не нужна — сервер-заглушка).

### B. Роутинг (папки вместо `goTo()`)
Каждый экран-`page` → отдельный маршрут. Навигация — через `<Link>`, никаких `goTo()`/`onclick` в разметке.

| Экран прототипа | `goTo` id | Маршрут |
|---|---|---|
| Лендинг | `home` | `/[locale]` |
| Каталог курсов | `courses-catalog` | `/[locale]/courses` |
| Продающая курса | `course-lean` | `/[locale]/courses/[slug]` (seed slug `lean`) |
| Логин | `login` | `/[locale]/login` |
| Личный кабинет | `dashboard` | `/[locale]/dashboard` |
| Плеер курса | `course-player` | `/[locale]/learn/[slug]` |

- **Продающая страница по факту одна:** в прототипе реальная продающая только у `lean`; все три карточки курсов ведут на неё. Порт 1:1 — `/[locale]/courses/[slug]` рендерит контент `lean` (для slug'ов без своей страницы — тоже он).
- Внутренние табы (табы дашборда `overview/courses/downloads/profile`, табы плеера `notes/downloads/overview`) переносятся как **клиентское состояние** внутри страницы (1:1 с прототипом), не как отдельные маршруты.

### C. Стили (разбить CSS)
- Токены из `:root` (`--red #E31E24`, `--black`, `--dark*`, серые, `--white`) → в глобальный `styles/tokens.scss` как CSS-переменные (доступны везде через `var(--red)`).
- Глобальный `app/globals.scss`: reset (`* box-sizing`, `body`), кастомный скроллбар, база.
- Остальной CSS разложить по **`*.module.scss` рядом с компонентами**, классы — по **BEM** (`.card`, `.card__title`, `.card--featured`).
- Ни одного `<style>`-блока и ни одного инлайн-`style=""` в итоге.
- Единственный существующий брейкпоинт `@media(max-width:900px)` — воспроизвести (полный адаптив — позже, отдельная задача).

### D. Компоненты (разбить разметку)
Выделить дизайн-систему. Ориентир (можно уточнять по ходу):

| Группа | Компоненты |
|---|---|
| Layout | `Nav` (лого, ссылки, `LangSwitcher`, auth-кнопка), `Footer`, `ToastProvider`/`Toast` |
| Примитивы | `Button` (primary/ghost/enroll/…), `Badge`, `Section`/`SectionHeader`, `ProgressBar` |
| Карточки | `CourseCard` (+featured, +catalog-вариант), `MethodCard`, `TestimonialCard`, `StatCard`, `DashCourseCard` (locked/unlocked), `PdfDownloadCard` |
| Композиты | `Hero`, `AuthorityBar`, `HowItWorksSteps`, `FaqAccordion`, `CurriculumAccordion` (module+lesson), `PricingBox` (`PriceOption` + `DisclaimerCheckbox`), `Tabs`, `PlayerSidebar`, `VideoPlaceholder` |
| Формы | `FormField`/`Input`, `LoginForm`, `ProfileForm` |

### E. i18n (разбить переводы)
- Подключить next-intl: сегмент `[locale]`, локали `en`/`ru` (default `en`), middleware (авто-детект по браузеру при первом заходе + смена через URL).
- Словарь `T{}` и `HTML_OVERRIDES` из `<script>` → `messages/en.json` и `messages/ru.json`. Строки с разметкой (`<br>`, `<span class="red">`) переносить через `t.rich`/структурированные ключи, **не** инъекцией сырого HTML.
- `LangSwitcher` меняет локаль через роутинг (`/en` ↔ `/ru`), заменяет `toggleLang()`. Ни одной строки текста, захардкоженной в компонентах.

### F. Интерактив (разбить JS-логику)
Каждый кусок — client-компонент (`'use client'`) с React-состоянием, поведение 1:1 с прототипом:

| Прототип (функция) | Куда |
|---|---|
| `toggleFaq` | `FaqAccordion` |
| `toggleModule` | `CurriculumAccordion` |
| `selectOption` + чекбокс-дисклеймер + `handleEnroll` | `PricingBox` (enroll — заглушка: не «залогинен» → на `/login`, иначе тост) |
| `switchDashTab` | табы дашборда |
| `switchPlayerTab`, `goToLesson` | плеер |
| `showToast` | `ToastProvider` (контекст) |
| `doLogin`/`doLogout`, `updateNav` | **фейковый** auth-стор (React-контекст поверх `sessionStorage`) — явно заглушка, не настоящая авторизация |

### G. Данные
- Контент (3 курса, curriculum, отзывы, FAQ, how-it-works, статы дашборда) — **захардкоженные типизированные фикстуры** в `lib/content/` (или `content/`). Значения 1:1 с прототипом (€29/€50, «lifetime», 4 модуля и т.д.). **НЕ** Payload.

### H. Сервер-заглушка
- Никаких API-роутов с логикой, никакого Payload/БД. Enroll/checkout, воспроизведение видео, скачивание PDF — повторяют поведение прототипа (тост / редирект на логин / плейсхолдер). Явно: «сервер не работает, как в оригинале».

## Рекомендуемый порядок (чтобы не потерять контекст)
1. Init проекта + тулинг + скелет папок + `tokens.scss`/`globals.scss`.
2. next-intl + миграция `messages` + `[locale]`-роутинг + `LangSwitcher`.
3. Каркас лейаута (`Nav`, `Footer`, `ToastProvider`) + примитивы.
4. **Полностью перенести Лендинг** (самый большой экран) — проверка подхода к компонентам/стилям.
5. Перенести остальные 5 экранов.
6. Фейковый auth-стор + весь интерактив.
7. Проход на визуальное совпадение с прототипом.

## Acceptance criteria
- `pnpm dev` поднимает приложение; `/en` и `/ru` рендерят лендинг, визуально идентичный прототипу на десктопе (открыть рядом — отличий нет).
- Все 6 экранов доступны по URL через файловый роутинг; переходы — `<Link>`; в разметке нет `goTo()`/`onclick`.
- Смена языка меняет локаль в URL и переключает **все** тексты (включая бывшие `HTML_OVERRIDES`); тексты берутся из `messages/*.json`, в компонентах не захардкожены.
- Нет `<style>`-блоков и инлайн-стилей; глобальные токены + `*.module.scss` с BEM; брейкпоинт 900px воспроизведён.
- Весь интерактив работает как в оригинале: FAQ, curriculum, выбор тарифа + дисклеймер блокирует enroll, табы дашборда/плеера, тосты, фейковый логин/логаут и смена auth-кнопки в навбаре.
- `pnpm lint` и typecheck — чисто.

## Out of scope
- Payload, Postgres, админка (отдельная задача).
- Реальные auth / оплата / видео / PDF / email.
- Упрощения ТЗ v2 (2 курса, €129, удаление прогресса/модулей/отзывов, промокод, второй чекбокс) — отдельные задачи после порта (ADR-9).
- Полный адаптив (только существующий брейкпоинт 900px).
- Тесты — **не в этой задаче** (стратегию тестирования Дима ещё не решил; если решим — отдельный шаг/задача).
- Деплой, CI/CD, VPS, мониторинг.

## References
- [motophd-demo.html](../../../motophd-demo.html) — эталон
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — структура репо, стек, инварианты
- [DECISIONS.md](../../DECISIONS.md) — ADR-6 (дома для текстов), ADR-7 (SCSS+BEM), ADR-9 (порт с последующим упрощением)
- Замещает черновики в `docs/tbd/`: `task_init_repo_1`, `task_rebuild_prototype_10`.
