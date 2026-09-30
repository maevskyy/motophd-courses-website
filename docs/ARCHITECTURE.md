# Архитектура

Как устроена система. «Почему так» — в [DECISIONS.md](./DECISIONS.md).

## Стек

| Слой | Выбор |
|---|---|
| Приложение | **Next.js (App Router) + TypeScript** — фронт, бэкенд (Route Handlers) и админка в одном приложении и репозитории |
| CMS / админка / auth | **Payload CMS 3** (внутри Next, `/admin`) |
| БД | **PostgreSQL** self-hosted (контейнер), `@payloadcms/db-postgres`. Redis не используем |
| Стили | **Sass (SCSS-модули) + BEM** |
| Медиа | обложки/PDF — **Cloudflare R2** (S3-плагин Payload); видео — **Cloudflare Stream** (signed URLs); хиро-ролик и постер лендинга — статика в `public/` (бюджет — [ниже](#статические-медиа-лендинга)) |
| Email | **Resend** |
| Платежи | **WayForPay + PayPal(?)** через абстракцию `PaymentProvider` (+ mock) |
| Хостинг | **1 VPS (Hetzner)** + Docker Compose; **Caddy** (TLS/прокси); **Cloudflare free** (DNS/CDN/DDoS/Access) |
| CI/CD | **GitHub Actions** → образ в **GHCR** → деплой кнопкой Run workflow |
| Мониторинг | **Grafana + Prometheus + Loki** (тех); **GA4 + Search Console** (бизнес/SEO) |
| Тесты | **Vitest + RTL + Playwright** |

## Инварианты

Не обсуждаются в рамках задачи; нарушение = баг:

- Доступ к платному контенту (видео-токены, PDF) — только после **серверной** проверки `Purchase{status:'paid'}`. Никаких решений о доступе на клиенте.
- Платёжные колбэки **идемпотентны** (дедуп по `orderReference`); **списываемая цена считается только на сервере** (региональную цену на странице выбирает браузер — только для показа, см. «Кэш и нагрузка»).
- Тексты: UI-строки — `messages/*.json`; контент и файлы — Payload (ассеты per-locale). Хардкод текста в компонентах запрещён.
- Новая зависимость или внешний сервис — только через запись в [DECISIONS.md](./DECISIONS.md).

## Топология

```
                    ┌──────────────── Cloudflare (free) ────────────────┐
интернет ──────────►│ DNS · CDN-кэш · DDoS · скрытие origin · Access    │
                    └──────┬───────────────┬───────────────┬────────────┘
                    motophd.com     admin.motophd.com  grafana.motophd.com
                           │               │  (CF Access)  │  (CF Access)
                    ┌──────▼───────────────▼───────────────▼────────────┐
                    │  VPS (Hetzner, ~8GB) · Docker Compose             │
                    │  ┌────────┐  Caddy (TLS, роутинг, метрики)        │
                    │  │ caddy  │──► app-site   (образ X; /admin* → 404)│
                    │  └────────┘──► app-admin  (образ X; админка вкл)  │
                    │               postgres · grafana · prometheus ·   │
                    │               loki · promtail · exporters         │
                    └───────┬───────────────┬───────────────────────────┘
                            │               │
              Cloudflare R2 (обложки, PDF)  Cloudflare Stream (видео, signed URL)
              Resend (email)                WayForPay / PayPal (вебхуки → app)
```

- **Один образ → два контейнера**: `app-site` (публичный сайт, админ-роуты зарезаны на прокси) и `app-admin` (админка, только через `admin.*` за Cloudflare Access).
- Приложение — **один Node-процесс** (Next standalone): SSR/SSG-страницы, Route Handlers (вебхуки, выдача защищённых файлов), Payload внутри процесса (Local API, без HTTP).

## Модель данных

Коллекции Payload → таблицы Postgres. Полные поля — [TZ.md §5](./TZ.md).

```
Users ─┬─< Purchases >─┬─ Courses ──< Lessons
       │   (tier, status, provider,│    (type: video|pdf|text,
       │    orderReference)        │     ассеты per-locale)
       │                           └─ PromoCodes (MVP)
       └─ роль: student | admin        LegalPages
```

Правило доступа: контент курса открыт ⇔ существует `Purchase{user, course, status:'paid'}`.
Feedback-тариф активен ⇔ `tier ∈ {feedback, feedback_upgrade}`.
Локализация: текстовые поля и **ассеты** (Stream-ID, PDF) — per-locale (EN/RU/UK-табы в админке);
пустые UK-поля читаются из RU (фолбэк локали в `payload.config.ts` ← `src/i18n/locales.ts`).

## Репозиторий

```
app/(marketing)/[locale]/   лендинг, курсы, юр (SSG/ISR)
app/(app)/[locale]/         кабинет, просмотр курса (auth)
app/(payload)/admin/        админка
app/api/                    вебхуки, защищённые файлы
payload/collections/        коллекции
components/                 дизайн-система (SCSS-модули + BEM)
lib/                        payments/ access/ i18n/ pdf/ video/
messages/                   en.json, ru.json (UI-строки)
tests/                      unit / component / e2e
```

## Статические медиа лендинга

Хиро-ролик `public/hero-loop.mp4` и постер `public/hero-poster.jpg` — фон без звука, защищать
нечего, поэтому они лежат в репозитории и раздаются приложением как статика (не Stream).
Ролик стоит в `LandingTop.tsx` как `<video autoplay loop muted playsinline poster preload="none">`:
LCP-элемент хиро — постер, страница рисуется без видео. `preload="none"` — «не качай ролик
заранее», но по спецификации `autoplay` эту подсказку перекрывает: в Chrome muted-autoplay-видео
начинает грузиться сразу при парсинге (с низким приоритетом), так что атрибут экономит трафик
только там, где автозапуск заблокирован (iOS Low Power Mode, режим экономии данных). Видео
показываем на всех устройствах, включая мобильные (решение владельца 06.09.2026): лёгких версий,
отключения по медиазапросу и JS-отложенной загрузки нет, поэтому реальный рычаг скорости — вес
файла, и бюджет ниже обязателен.

**Бюджет хиро-ролика** — правило для любого присланного файла, а не для текущего:

| Параметр | Предел |
|---|---|
| Размер файла | **≤ 1.5 МБ** |
| Ширина | ≤ 1280 px (высота по пропорции, чётная) |
| Аудиодорожка | нет (`-an`), служебных треков тоже нет |
| Кодек | H.264 `libx264`, profile High, `yuv420p`, ≤ 30 fps |
| Контейнер | mp4 с `-movflags +faststart` (индекс в начале — играет до докачки) |
| Длительность | ориентир ≤ 25 с: при потолке 450 kbps это ≈ 1.4 МБ; длиннее — режь или снижай `-maxrate` пропорционально (450k × 25 / секунды) |

Постер `public/hero-poster.jpg` (~44 КБ) — отдельный файл; при замене ролика обновить кадром из
него того же размера, чтобы постер и первый кадр совпадали.

**Команда пережатия** (проверено на ffmpeg 8; `-fpsmax` есть с ffmpeg 5.x, на старом замени на
`-r 30`). `input.mp4` — то, что прислал владелец, результат сразу на место в `public/`:

```bash
ffmpeg -i input.mp4 -map 0:v:0 -an -vf "scale='min(1280,iw)':-2" -fpsmax 30 \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 26 \
  -maxrate 450k -bufsize 900k -movflags +faststart -map_metadata -1 \
  public/hero-loop.mp4
```

Что делает: берёт только первую видеодорожку (`-map 0:v:0 -an`), ужимает до 1280 по ширине,
если шире, режет частоту кадров до 30, качество по CRF 26 с потолком 450 kbps (`-maxrate/-bufsize`:
без потолка размер непредсказуем), выкидывает метаданные. Проверка после:
`ls -la public/hero-loop.mp4` (≤ 1.5 МБ) и
`ffprobe -v error -show_entries format=size,duration,bit_rate:stream=codec_type,width,height public/hero-loop.mp4`
— в выводе один стрим `codec_type=video`. Исходник в `public/` не класть и рядом не дублировать:
он остаётся у владельца, предыдущая версия ролика — в git-истории.

Что ещё держит LCP лендинга (вне бюджета ролика, замер Lighthouse mobile 06.09.2026): React 19
при SSR добавляет `<link rel="preload" as="image">` для каждого `<img>` без `loading="lazy"`, и
картинки ниже фолда (`vlad*.jpg`, `course-*.jpg`, `logo.png` — ~500 КБ) конкурируют с постером за
канал; с ними заблокированными performance 86 → 94, LCP 4.2 → 3.1 с. Лечится `loading="lazy"` на
картинках ниже фолда и пережатием `logo.png` (73 КБ).

## Кэш и нагрузка

Витрина (главная, список курсов, страница курса, about, юр-страницы) одинакова для всех
анонимов и отдаётся из кэша. Три слоя, сверху вниз:

1. **Cloudflare, Cache Rule «Storefront page»** (Caching → Cache Rules):
   `(http.host eq "motophd.com" and not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/admin"))`
   → Eligible for cache; Edge TTL — «Use cache-control header if present, bypass cache if not»;
   Browser TTL — «Respect origin TTL». Кабинет, плеер, логин, оплата отвечают
   `private, no-store` — Cloudflare их не кэширует. **Cache key не трогать**: «Ignore query
   string» смешает HTML страницы с её RSC-версией (`?_rsc=…`) и сломает навигацию.
2. **Next ISR:** у страниц витрины `revalidate = 60` и пустой `generateStaticParams` (без него
   Next рендерит на каждый запрос; при сборке базы нет — заранее ничего не собираем).
   Заголовок `s-maxage=60` — отсюда задержка правок на Cloudflare **до минуты**.
3. **`src/lib/data/publicCache.ts`:** курсы и программа уроков для анонимов в памяти процесса.

**Сброс:** afterChange/afterDelete курсов, уроков, видео и файлов → `clearPublicCacheHook`:
чистит память и `revalidatePath('/', 'layout')`, ещё раз через 2 с (хуки Payload идут до
коммита транзакции). Cloudflare досыпает до 60 с.

**Региональная цена.** Страница одна на всех и несёт все строки `regionalPrices`; браузер узнаёт
страну у Cloudflare (`/cdn-cgi/trace`, отвечает край Cloudflare, до сервера не доходит) и
показывает цену страны (`useRegionalPrice`, `CoursePrice`). Пока страна не пришла, цена скрыта,
а не показана по умолчанию. Оплата считает цену по заголовку `CF-IPCountry` — та же страна.

**Нельзя** на страницах витрины: `force-dynamic`, `headers()`, `cookies()`, `searchParams` —
страница снова станет динамической и каждый просмотр пойдёт на сервер. Персональное добирают
клиентские компоненты (статус логина — `AuthStatusProvider` через `/api/users/me`).
Проверка: `curl -sI https://motophd.com/en | grep -iE 'cf-cache-status|x-nextjs-cache'` →
`HIT`. `htmlLimitedBots: /.*/` в `next.config.ts` держит метаданные в `<head>` (иначе
страница из кэша отдаётся быстрее `generateMetadata`, и canonical уезжает в `<body>`).

**Нагрузочный тест** — `loadtest/storefront.js` (k6): главная → курсы → курс с паузами,
ступенями до `PEAK` посетителей, стоп при 5% ошибок или p95 > 3 с. Гонять из дата-центра,
а не из дома (домашний канал сдаётся раньше сайта), например с VPS через Cloudflare:
`docker run --rm -v ~/loadtest:/scripts grafana/k6 run -e PEAK=2000 -e BASE_URL=https://motophd.com /scripts/storefront.js`.

Замеры 30.09–01.10.2026 (снимок):

| Схема | Предел | Страница p95 | Ошибки |
|---|---|---|---|
| Страница на каждый запрос (цена по стране на сервере) | ~300 одновременно, одно ядро 100% | ≥ 3 с | 0,03% |
| + кэш данных в памяти | ~300, одно ядро 100% | 3 с | 0% |
| **Кэш Cloudflare + ISR + цена в браузере** | **2000 одновременно, предел не достигнут** | **23 мс** | **0%** из 144 тыс. |

При 2000 одновременно сервер загружен на 85–90% одного ядра только запросами
`/api/users/me` (статус логина в шапке, на каждую страницу) — это следующий потолок
(~2500–3000). Снять его можно меткой «залогинен» в браузере, решено пока не делать.

## Окружения и деплой

- **local** — `pnpm dev` + Postgres в docker compose. Здесь вся разработка.
- **production** — VPS. Постоянного dev-стенда нет; при нужде — staging-контейнер на том же VPS.
- **CI/CD:** GitHub Actions: PR → lint+тесты; merge → сборка образа → GHCR; деплой — вручную (`Run workflow`); rollback = деплой предыдущего тега. Образ собирается в CI, **не** на VPS.
- **Секреты** — env на VPS и в GitHub Secrets. **Миграции** — Payload/Drizzle, версионируются.

## Бэкапы (3-2-1)

Ночной `pg_dump` → offsite (Hetzner Storage Box / B2), retention ~14 дней, восстановление периодически тестируется. R2/Stream — managed-durability, вне бэкап-скоупа.

## Мониторинг

- **Тех:** Grafana + Prometheus (node-exporter, cAdvisor, метрики Caddy) + Loki (логи) + аптайм-чек. Только «живо ли». Retention ограничен.
- **Бизнес:** GA4 (consent-gated) + Search Console. Продажи — в админке Payload.
- Зоны не смешиваются (ADR-8 в [DECISIONS.md](./DECISIONS.md)).
