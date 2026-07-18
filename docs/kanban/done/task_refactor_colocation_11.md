# Task 11 — Рефактор порта под CODE_STYLE (колокация + размеры)

**Depends on:** Task 1 (порт, done)
**Статус:** готова к работе.

## Goal

Привести код порта в соответствие [CODE_STYLE.md](../../CODE_STYLE.md): разнести монстро-CSS по компонентам (колокация), уложить все файлы в лимиты. **Чисто механический рефактор — ни пикселя, ни поведения не меняем.**

## Context

Порт (Task 1) готов, но структура нарушает код-стайл: один общий `Prototype.module.scss` на 1952 строки, два `page.tsx` >200, `content/prototype.ts` на 590. Это рефактор-долг из CODE_STYLE.

## Scope

### A. Колокация стилей (главное)
- Разнести `src/components/prototype/Prototype.module.scss` (1952) — у каждого компонента **свой** `*.module.scss` рядом. Общего монстра удалить.
- Структура «компонент = папка» (CODE_STYLE §2): `components/<Name>/<Name>.tsx` + `<Name>.module.scss` + `index.ts` (+ `.types.ts`/хук при нужде).
- Уже вынесенные компоненты (`CourseCard`, `PricingBox`, `FaqAccordion`, `CurriculumAccordion`, `Footer`, `Nav`, провайдеры) — перевести на папку с колоцированным стилем.
- Глобально остаётся только `styles/tokens.scss` (переменные) + `app/globals.scss` (reset/база).
- Каждый `*.module.scss` ≤ 400 строк.

### B. Разбить толстые страницы (>200)
- `app/(marketing)/[locale]/page.tsx` (236) → тонкая композиция; секции лендинга вынести в компоненты (по фактическим блокам): `Hero`, `AuthorityBar`, `CoursesGrid`, `Method`, `Testimonials`, `HowItWorks`, `Instructor` (about), `FinalCta`.
- `app/(app)/[locale]/dashboard/page.tsx` (237) → тонкая; табы/секции в подкомпоненты: `Overview`, `MyCourses`, `Downloads`, `Profile` + `DashCourseCard`, `StatCard`.
- Все `page.tsx` ≤ 200 (цель — тоньше, только композиция).

### C. Разбить данные
- `lib/content/prototype.ts` (590) → по доменам, ни один файл >200. По фактическим экспортам: типы (`Course`, `CurriculumModule`, `PrototypeContent`) → `content/types.ts`; `curriculum` → `content/curriculum.ts`; `prototypeContent` (локализованный, ~327 стр) → разложить по доменам (`hero`, `method`, `testimonials`, `faq`, `howItWorks`) и собрать; `localizedCourses` → `content/courses.ts`. `content/index.ts` — ре-экспорт.

### D. Проверка размеров
- Ни одного `.tsx`/`.ts` >200, ни одного `.scss` >400. Проверить:
  `find src -name '*.ts*' -o -name '*.scss' | xargs wc -l | sort -rn | head`

## Порядок (чтобы диффы были ревьюабельны)
1. `content/prototype.ts` → домены (изолированно, быстро).
2. **По одному компоненту**: вынести его правила из `Prototype.module.scss` в свой `*.module.scss` + папка-колокация, сверяя вид после каждого.
3. Лендинг → секции-компоненты.
4. Dashboard → подкомпоненты.
5. Удалить опустевший `Prototype.module.scss`; прогнать проверку размеров + `pnpm lint`.

## Acceptance criteria
- Вид и поведение **идентичны** до рефактора (открыть до/после — отличий нет; порт как был).
- `Prototype.module.scss` удалён; стили колоцированы, каждый ≤ 400 строк.
- Каждый компонент — своя папка с колоцированным `*.module.scss`.
- Нет `.tsx`/`.ts` >200 строк и `.scss` >400 (проверка из D чистая).
- `pnpm lint` и `pnpm typecheck` — чисто; `pnpm dev` поднимается, все страницы рендерятся.

## Out of scope
- Любые изменения вида / контента / поведения.
- Перевод на Server Components и прочие практики из CODE_STYLE §5 (границы `'use client'`) — это меняет поведение, отдельной задачей, не смешивать со структурным рефактором.
- Подключение Payload/данных, реальные auth/оплата, упрощения ТЗ v2.

## References
- [CODE_STYLE.md](../../CODE_STYLE.md) §1, §2, §5 · ADR-7 в [DECISIONS.md](../../DECISIONS.md)
- Задача-исходник: `docs/kanban/done/task_next_init_and_port_1.md`
