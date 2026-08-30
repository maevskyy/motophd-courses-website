# Task 5 — Медиа: R2 + Cloudflare Stream

**Depends on:** 12 (Payload/DB/admin), 2 (модель контента), 14–16 (auth + серверная проверка покупки — уже в коде)
**Goal:** файлы из админки лежат в приватном R2 и без прямых публичных ссылок; видео урока играет только по подписанному токену, выданному сервером после проверки покупки; PDF отдаёт приложение, а не бакет.

## Контекст

**Хранение сейчас локальное и в проде теряется.** `src/collections/Media.ts` — `upload.staticDir: 'media'`, то есть файлы пишутся на диск контейнера. В `deploy/docker-compose.prod.yml` тома под `media/` нет → всё, что Аня загрузит в админке, исчезает при следующем деплое. Мигрировать при этом нечего: ни в репозитории, ни на диске файлов нет (`Courses.cover` и `Lessons.pdf` заведены, но пустые, обложки в UI пока не рендерятся вообще — карточки курсов используют эмодзи-иконки).

**Кому отдавать — решено, осталось «как».** `src/collections/Lessons.ts`: поля `streamVideoId`, `pdf`, `body` закрыты field-level доступом `canReadLessonContent` (admin | `isFreePreview` | `hasPaidAccess`), покрыты юнитом `src/collections/Lessons.test.ts` и e2e «lesson API exposes protected content only to previews or paid students». Страница плеера `src/app/(app)/[locale]/learn/[slug]/page.tsx` уже `force-dynamic`, делает `requireUser()` + `hasPaidAccess()`. Задача добавляет ровно два недостающих куска: генерацию playback-токена и выдачу PDF.

**Плеер — заглушка.** `src/components/player/CoursePlayerClient.tsx` вместо видео рисует `videoPlaceholder` с тостом, вкладка Downloads — кнопка с тостом. Тип `PlayerContent` (`src/lib/data/types.ts`) не содержит ни `streamVideoId`, ни ссылки на PDF → контракт «сервер → плеер» надо завести с нуля.

**Локализация ассетов реальная.** `streamVideoId` и `pdf` в Lessons — `localized: true`, `Courses.teaserVideoId` тоже; EN и RU — разные файлы (ADR-6, BUSINESS_RULES «Языки»). Значит и токен, и PDF-роут обязаны знать локаль запроса, а не брать «первый попавшийся» ассет.

**Чтение данных идёт с включённым access control.** `src/lib/data/courses.ts` везде вызывает `payload.find({ overrideAccess: false, user })` → любое ужесточение `read` в Media сразу влияет на SSR, ломать обложки нельзя.

**Проверено по докам (август 2026):**
- `@payloadcms/storage-s3` при подключённом адаптере **добавляет коллекции поле `prefix`** (в `getFields()`, независимо от того, задан ли `prefix` в опциях) → в таблице `media` нужна колонка `prefix`, иначе Postgres упадёт на `column "prefix" does not exist` ([payload#12475](https://github.com/payloadcms/payload/issues/12475)). **Миграция в этой задаче есть.**
- `disablePayloadAccessControl` по умолчанию `false` → `url` остаётся `/api/media/file/<filename>`, и на этот путь применяется `read`-доступ коллекции. Прямые ссылки на бакет не появляются — ровно то, что нужно.
- Cloudflare Stream: `requireSignedURLs: true` на видео; signing key (`POST /accounts/{id}/stream/keys` → `id` + `pem`/`jwk` в base64); токен — обычный JWT RS256, header `{alg:'RS256', kid}`, payload `{sub: <video uid>, kid, exp, nbf}`, **`exp` не больше 24 ч** от подписи, `accessRules` ≤ 5. Проигрывание: `https://customer-<CODE>.cloudflarestream.com/<TOKEN>/iframe` (или `/manifest/video.m3u8`). `allowedOrigins` задаётся на видео; `domain.com` **не** покрывает `www.domain.com`.
- Подписать JWT RS256 умеет встроенный `node:crypto` (`createSign('RSA-SHA256')`) — jwt-библиотека не нужна.
- Цена Stream: $5 за 1000 минут хранения (предоплата шагом $5 ⇒ минимум ~$5/мес), $1 за 1000 минут доставки; заливка и транскодинг бесплатны.

## Продуктовые решения

1. **Видео проигрываем iframe-эмбедом Stream** — `customer-<CODE>.cloudflarestream.com/<token>/iframe`. Ноль новых зависимостей, работает HLS/DASH/качества/полный экран из коробки. Свой плеер (hls.js) — альтернатива на потом, когда понадобится кастомный UI; в MVP не берём.
2. **TTL токена: 4 часа для оплаченного урока, 30 минут для тизера.** Урок 5–15 минут, но вкладку оставляют открытой — 4 ч закрывают сессию с запасом и укладываются в лимит 24 ч. Страница плеера `force-dynamic`, поэтому каждый заход выдаёт свежий токен. Истёк посреди просмотра → Stream перестаёт отдавать сегменты, плеер показывает ошибку; MVP лечит это перезагрузкой страницы (подсказка в UI), авто-обновления токена не делаем.
3. **Тизер без аккаунта защищаем происхождением, а не личностью.** Токен на `isFreePreview`-урок и на `Courses.teaserVideoId` выдаётся любому посетителю, но: короткий TTL (30 мин), `allowedOrigins` на видео (эмбед на чужом сайте не заработает), скачивание в Stream выключено. К IP токен **не** привязываем (`accessRules: ip.src`) — мобильные сети меняют IP посреди просмотра, лечение хуже болезни.
4. **PDF отдаёт роут приложения, не бакет.** `GET /api/lessons/<id>/pdf?locale=en|ru`: проверка `isFreePreview | hasPaidAccess` → чтение объекта из R2 → стрим байтов клиенту. Presigned-ссылка редиректом отвергнута: в F7 нужен вотермарк (email + номер заказа), а его можно наложить только на байты, проходящие через приложение.
5. **Отдаём PDF на просмотр, не на скачивание** — `Content-Disposition: inline`, `Cache-Control: private, no-store`. Соответствует «в проде вотермарк на каждой странице» и не плодит файлы по чужим папкам. Кнопка «скачать» в UI остаётся ссылкой на тот же роут.
6. **Разделение публичного и приватного в одной коллекции Media — по mime-типу.** Обложки (`image/*`) читаются всеми, PDF — только админом; студент получает PDF исключительно через роут из п.4. Отдельная коллекция «приватных медиа» была бы чище, но меняет `relationTo` у `Lessons.pdf` → лишняя миграция и переезд данных ради нулевой пользы в MVP.
7. **Dev без ключей Cloudflare работает.** Нет `R2_*` → `s3Storage({ enabled: false })`, файлы снова на локальный диск (плагин при этом **всё равно** объявляет поле `prefix`, схема БД одинаковая в dev и в проде — это важно, иначе миграции разъезжаются). Нет `CF_STREAM_*` → генератор токена возвращает `null`, плеер рисует «видео недоступно в этом окружении». Аня и CI работают без секретов, e2e зелёные.
8. **Тестовое видео живёт в админке, не в seed.** Seed продолжает писать синтетические `streamVideoId` (`lean-en-lesson-1`); реальный UID Дима вставляет руками в первый урок курса `lean` — иначе UID утечёт в репозиторий и сломается у любого, у кого нет доступа к аккаунту.

## Scope

- **`src/payload.config.ts`** — плагин `s3Storage`: `collections: { media: true }`, `bucket: R2_BUCKET`, `config: { endpoint, region: 'auto', forcePathStyle: true, credentials }`, `enabled: Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET)`. `disablePayloadAccessControl` **не** ставим (нужен `/api/media/file/*` под access control). `prefix` не задаём — папки в бакете не нужны, а опция тянет за собой известный баг со схемой.
- **`src/collections/Media.ts`** — `read`: админ → `true`; остальным — where, прячущий PDF: `{ or: [{ mimeType: { not_equals: 'application/pdf' } }, { mimeType: { exists: false } }] }` (без второй ветки отвалятся документы с пустым `mimeType`). `staticDir` можно оставить — при включённом плагине он не используется.
- **`src/migrations/`** — новая миграция: колонка `prefix` в таблице `media` (генерировать `pnpm payload migrate:create`, не писать руками).
- **`src/lib/media/`** — `readMediaObject(filename)`: R2 через `GetObjectCommand` (`@aws-sdk/client-s3`) либо, когда плагин выключен, чтение из локального `media/`. Одна точка, чтобы роут не знал, где лежит файл.
- **`src/app/api/lessons/[id]/pdf/route.ts`** — `getCurrentUser()` → `payload.findByID({ collection: 'lessons', locale, depth: 1, overrideAccess: true })` → нет урока/файла = 404 → не тизер и (нет юзера ИЛИ `!hasPaidAccess`) = 403 → иначе стрим байтов с заголовками из решения 5. `locale` валидируем в `'en' | 'ru'` (уже есть `toAppLocale`). Мидлварь next-intl `/api` не трогает (matcher исключает) — префикса локали в пути не будет.
- **`src/lib/video/`** — `signPlaybackToken({ videoId, ttlSec })` на `node:crypto` (RS256, `kid` в header и в payload, `nbf`/`exp`), `getPlaybackUrl(videoId, { free })` → `https://customer-<CODE>.cloudflarestream.com/<token>/iframe` или `null` без ключей. TTL — константы модуля (4 ч / 30 мин), не env.
- **Контракт «сервер → плеер»** — `PlayerContent` (`src/lib/data/types.ts` + `toPlayerContent` в `adapters.ts`) получает `videoEmbedUrl: string | null` и `pdfUrl: string | null`; страница `learn/[slug]` собирает их после уже существующей проверки покупки. Наличие PDF определяем по `lesson.type === 'pdf'` (поле публичное), а не по populated-медиа — после п.6 populate у студента вернёт пусто.
- **`src/components/player/`** — вместо `videoPlaceholder` iframe Stream (`allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"`, `allowfullscreen`) при `videoEmbedUrl`, иначе текстовая заглушка; вкладка Downloads — ссылка на `pdfUrl` вместо тоста. Файл уже 152 строки при лимите 200 — вынести `<LessonVideo>` и `<LessonDownloads>` отдельными компонентами рядом (CODE_STYLE §1–2).
- **`messages/en.json` / `messages/ru.json`** — строки «видео недоступно», «токен истёк, обновите страницу», подпись PDF-ссылки. Хардкода текста в компонентах нет (инвариант).
- **`src/seed/`** — при `NODE_ENV !== 'production'` заливать крошечный фикстурный PDF в первый урок типа `pdf` (нужен для честного e2e «с покупкой отдаёт файл»).
- **`.env.example`** — имена новых переменных с пустыми значениями и комментарием, откуда брать. `deploy/.env.prod.example` — зона Димы, правит он (список имён ниже).
- **`docs/DECISIONS.md`** — ADR-10: новые зависимости медиа-стека и почему токены подписываем сами, без jwt-библиотеки (инвариант «новая зависимость — только через запись в DECISIONS»).

**Новые зависимости — требуют явного «да» Димы:**
- `@payloadcms/storage-s3` — сам адаптер;
- `@aws-sdk/client-s3` — объявить **явно**: он приезжает транзитивно с адаптером, но при pnpm импорт необъявленного пакета не пройдёт;
- jwt-библиотека **не нужна** (`node:crypto`), zod для валидации env **не добавляем** (см. открытый вопрос 6).

**Координация с task 6 (платежи):** обе задачи трогают схему. Зона этой задачи — `media` (+ ничего в Lessons); зона задачи 6 — `purchases`/промокоды. Пересечений полей нет. Миграции создаём **последовательно**: кто первым уходит в реализацию, тот первым генерирует; второй ребейзится на актуальный `main` и перегенерирует свою.

## Ручные шаги (Дима, консоль Cloudflare)

Без них задача не проверяется — сделать до старта реализации.

1. **R2 → Create bucket** `motophd-media`, location EU. Public access (`r2.dev`) **не включать**, Custom Domain **не подключать**.
2. **R2 → Manage API tokens → Create Account API token**: permission **Object Read & Write**, scope — только бакет `motophd-media`. Сохранить `Access Key ID`, `Secret Access Key` и endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (показывается один раз).
3. **Stream → включить подписку** (минимум ~$5/мес = 1000 минут хранения).
4. **Stream → Upload video**: тестовый ролик 30–60 сек. В настройках видео: `Require signed URLs` = **ON**, скачивание (MP4 downloads) = **OFF**, `Allowed Origins` = `motophd.com`, `www.motophd.com`, `localhost:3000` (последний убрать перед боем или оставить осознанно).
5. Скопировать **UID видео** и код `customer-<CODE>` из embed-сниппета.
6. **Создать signing key:** `POST https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/keys` с API-токеном, у которого есть `Stream:Edit`. Сохранить `result.id` и `result.pem` (base64). Сам `Stream:Edit`-токен приложению не нужен — после создания ключа его можно удалить.
7. Разложить переменные: локальный `.env` и прод `~/motophd/.env` (+ добавить имена в `deploy/.env.prod.example`, файл под Димой):
   `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
   `CF_STREAM_CUSTOMER_CODE`, `CF_STREAM_KEY_ID`, `CF_STREAM_KEY_PEM` (base64, как отдал API).
8. В админке вставить UID тестового видео в `Stream video ID` первого урока курса `lean`, вкладка EN.

## Acceptance criteria

- Загрузка файла в админке кладёт объект в R2; в бакете нет публичного доступа, `doc.url` указывает на `/api/media/file/<filename>`, прямая ссылка на `r2.cloudflarestorage.com` нигде не отдаётся.
- Обложки (`image/*`) по-прежнему читаются анонимом; страницы каталога и курса рендерятся как раньше (существующие e2e зелёные).
- Тестовое видео с валидным токеном играет; открытие `customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe` без токена — не играет.
- Урок с покупкой отдаёт плееру `videoEmbedUrl`; тот же урок без покупки — `null` и заглушку вместо iframe (токен на сервере не генерируется вообще).
- `GET /api/lessons/<id>/pdf` — 403 анониму и залогиненному без покупки, 200 + `application/pdf` студенту с покупкой, 200 всем на уроке с `isFreePreview`, 404 на несуществующий урок/локаль без файла.
- Прямой `GET /api/media/file/<имя приватного pdf>` анониму файл не отдаёт.
- Юнит на генерацию токена (ключ генерируется в самом тесте, `generateKeyPairSync`): подпись проверяется публичным ключом, `sub` = uid видео, `kid` в header и payload, `exp − now` = ожидаемый TTL и ≤ 24 ч; без `CF_STREAM_*` функция возвращает `null`.
- Юнит на отказ: PDF-роут для анонима и для чужого без покупки; `read`-доступ Media прячет PDF от не-админа.
- E2E: анонимный `GET` PDF-роута → 403, после логина `student@motophd.com` → 200; страница плеера с покупкой содержит iframe Stream, без покупки — нет (существующий редирект `?access=denied` не сломан).
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` зелёные.

## Out of scope

- Вотермарк PDF (email + номер заказа, `pdf-lib`) — F7, здесь только TODO в роуте.
- Финальный UI плеера (качество, скорость, субтитры, постеры, прогресс) и адаптив плеера — отдельным проходом.
- Загрузка видео в Stream из админки и привязка UID к урокам сверх существующего текстового поля `streamVideoId`.
- Тизер на главной и на странице курса (`Courses.teaserVideoId` в вёрстке) — генератор токена задача даёт, вставка в лендинг — отдельная задача Ани.
- CDN-тюнинг, кастомный домен для R2, миграция уже загруженных файлов (их нет), бэкап медиа (ADR-3: managed durability).
- Rate-limit на PDF-роут и токен-эндпоинты — вместе с общим rate-limit из ТЗ §12.

## Открытые вопросы (Диме, с рекомендацией)

1. **Подписка Stream ~$5/мес** — включаем сейчас? *Рекомендация: да, без неё половина задачи не проверяется, бюджет ТЗ это предусматривает («единицы $ за Stream»).*
2. **Две новые зависимости** (`@payloadcms/storage-s3`, `@aws-sdk/client-s3`) — «да»? *Рекомендация: да; jwt-библиотеку не берём, подписываем `node:crypto`.*
3. **TTL 4 ч / 30 мин** устраивает? *Рекомендация: да; меньше 1 ч даст обрывы на длинных паузах, больше 24 ч Cloudflare не разрешает.*
4. **`localhost:3000` в Allowed Origins** тестового видео — оставляем в проде? *Рекомендация: оставить (удобно проверять локально), риск нулевой: origin без токена всё равно бесполезен.*
5. **PDF — inline или attachment?** ТЗ §16 не решён. *Рекомендация: inline сейчас, решение окончательно фиксируем вместе с вотермарком в F7.*
6. **Валидация env**: CODE_STYLE требует zod, зависимости нет. *Рекомендация: обойтись ручными проверками в `src/lib/env.ts` (нам нужно проверить 7 строк), zod не тянуть; если не согласен — это третья новая зависимость.*
7. **Кто первым делает миграцию — 5 или 6?** *Рекомендация: 5 (одна колонка, конфликтов меньше), задача 6 ребейзится.*

## Оценка и разрез на PR

~4 человеко-дня, поэтому режем на два PR (внутри одной задачи, вторую половину при желании легко вынести в `task_media_player_17`):

| PR | Содержимое | Оценка |
|---|---|---|
| **PR 1 — R2 + PDF** | плагин `s3Storage`, миграция `media.prefix`, `read`-доступ Media, `src/lib/media/`, PDF-роут, фикстурный PDF в seed, юниты + e2e на отказ/выдачу, `.env.example` | ~2 дня |
| **PR 2 — Stream + плеер** | `src/lib/video/`, контракт `PlayerContent`, iframe в плеере + разбиение компонента, строки в `messages/*`, юнит на токен, e2e на наличие/отсутствие iframe | ~2 дня |

Ручные шаги в консоли CF (~1 ч) нужны целиком до PR 2, пункты 1–2 и 7 — до PR 1.

## References

- [ARCHITECTURE.md](../../ARCHITECTURE.md) (Медиа, Инварианты) · [TZ.md §9](../../TZ.md) · [BUSINESS_RULES.md](../../BUSINESS_RULES.md) (Языки) · ADR-3, ADR-6 в [DECISIONS.md](../../DECISIONS.md)
- Cloudflare: [Secure your Stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/) · [Stream pricing](https://developers.cloudflare.com/stream/pricing/) · [R2 API tokens](https://developers.cloudflare.com/r2/api/tokens/)
- Payload: [Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters) · баг про `prefix`: [payload#12475](https://github.com/payloadcms/payload/issues/12475)
- Известная грабля R2 + AWS SDK v3: `NotImplemented: Header 'x-amz-checksum-crc32' ... not implemented` на загрузке. Лечится `requestChecksumCalculation: 'WHEN_REQUIRED'` в `config` (Cloudflare починила на своей стороне, но если всплывёт — искать здесь, а не в Payload).
- Схему БД трогаем → миграция обязательна (см. координацию с task 6).
