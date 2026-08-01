# Task 14 — Настоящий вход и выход

**Depends on:** 12 (Payload/DB/admin), 2 (модель контента)
**Goal:** пользователь реально входит по email + паролю, сессия живёт в httpOnly-куке, фейковый auth удалён из кодовой базы.

## Контекст

Сейчас вход — декорация: `src/components/providers/AuthProvider/AuthProvider.tsx` держит флаг в `sessionStorage`, а `src/app/(marketing)/[locale]/login/page.tsx` вызывает `login(email)` и **игнорирует введённый пароль**. Во всём `src/` ноль вызовов `payload.auth()`, `cookies()`, `headers()` — сервер никогда не знает, кто перед ним. При этом `Users` уже с `auth: true`, то есть вся серверная часть готова, не соединён только фронт.

Проверено по типам Payload 3: `payload.login({ collection, data })` → `LoginResult { token?, user?, exp? }`; `payload.auth({ headers })` → `AuthResult { user, permissions }`; `cookiePrefix` в `src/payload.config.ts` не задан → кука называется `payload-token`.

Регистрации на сайте нет по ТЗ (F4): аккаунт создаётся автоматически после оплаты. Поэтому для проверки входа нужен демо-студент из seed.

## Продуктовые решения

1. **После входа возвращаем туда, откуда пришёл.** Страница, с которой человека отправили на вход, запоминается в адресе (`/login?next=…`) и после успешного входа он попадает обратно. Зашёл на страницу входа сам — в кабинет. Адрес возврата **обязательно валидировать**: принимаем только относительные пути внутри сайта, иначе открытый редирект на чужой домен.
2. **Ошибка при неверных данных — общая, с подсказкой.** «Неверный email или пароль», второй строкой: «Доступ приходит на почту после покупки курса». Раздельные тексты («такого аккаунта нет» / «неверный пароль») не используем — они позволяют перебором узнать, кто у нас зарегистрирован.
3. **Демо-аккаунты — два** (оба только вне прода): `student@motophd.com` / `student1234` с оплаченной покупкой первого курса и `guest@motophd.com` / `guest1234` без покупок. Так проверяются оба сценария: доступ и отказ.

## Scope

- Новый `src/lib/auth/`:
  - `getCurrentUser()` — `payload.auth({ headers: await headers() })` → `user | null`, обёрнут в React `cache()` (один вызов на рендер);
  - `requireUser()` — `getCurrentUser()` или `redirect('/login')`;
  - server action `login` — `payload.login()`, полученный `token` в куку `payload-token` (`httpOnly`, `sameSite: 'lax'`, `secure` в проде, `path: '/'`), при неверных данных возвращает ошибку формы; после успеха — редирект на валидированный `next` или в кабинет;
  - server action `logout` — удаление куки.
- `src/app/(marketing)/[locale]/login/page.tsx` — форма на server action, показ ошибки входа, состояние отправки; параметр `next` прокидывается в форму скрытым полем.
- Удалить `src/components/providers/AuthProvider/` целиком; убрать `AuthProvider` из обоих layout'ов (`(marketing)` и `(app)`).
- Состояние входа приходит пропсами из серверных layout'ов: `src/components/layout/Nav/Nav.tsx` (`isLoggedIn`), `src/components/dashboard/DashboardClient.tsx` (`email` + выход через server action), `src/components/prototype/PricingBox/PricingBox.tsx` (`isLoggedIn`). Заодно уходит мигание «Login → Dashboard» после гидратации.
- `messages/en.json` и `messages/ru.json`: ключи ошибки входа и состояния отправки; убрать `login.note` («Demo mode…») вместе с хрупким разрезанием строки по `:` в компоненте страницы.
- `src/seed/`: два демо-аккаунта (см. продуктовые решения) — **только при `NODE_ENV !== 'production'`** (seed запускается кнопкой деплоя, демо-аккаунты в прод попасть не должны). Для `student@…` создаётся `Purchase{status:'paid', provider:'manual'}` на первый курс.

## Acceptance criteria

- Вход `student@motophd.com` ведёт в кабинет; неверный пароль показывает общую ошибку с подсказкой и оставляет на странице логина.
- Вход со страницы, на которую отправили с приватного адреса, возвращает на неё же; вход со страницы логина напрямую ведёт в кабинет; подставленный внешний адрес в `next` игнорируется (проверить тестом).
- Выход разлогинивает: кабинет снова недоступен.
- В `src/` не осталось `sessionStorage` и `useAuth`.
- Unit на server action логина (успех, неверный пароль, установка куки) и на `getCurrentUser`/`requireUser`.
- Существующий e2e «login page shows the form» обновлён под новую форму.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` зелёные.

## Out of scope

- Замок на приватные страницы и гейт плеера — task 15.
- Закрытие утечки полей уроков — task 16.
- Восстановление пароля и письма — вместе с Resend (ТЗ F4 требует, но без email-сервиса отправлять некуда).
- Регистрация на сайте (по ТЗ её нет), профиль и удаление аккаунта — F6.
- Rate-limit на вход (ТЗ, нефункциональные требования) — отдельной задачей.

## References

- [TZ.md F4](../../TZ.md) · [BUSINESS_RULES.md — Аккаунты](../../BUSINESS_RULES.md) · ADR-1, ADR-4 в [DECISIONS.md](../../DECISIONS.md)
- Схему БД не трогаем → миграции не нужны.
