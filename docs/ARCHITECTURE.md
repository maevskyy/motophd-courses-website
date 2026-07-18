# Архитектура

Как устроена система. «Почему так» — в [DECISIONS.md](./DECISIONS.md).

## Стек

| Слой | Выбор |
|---|---|
| Приложение | **Next.js (App Router) + TypeScript** — фронт, бэкенд (Route Handlers) и админка в одном приложении и репозитории |
| CMS / админка / auth | **Payload CMS 3** (внутри Next, `/admin`) |
| БД | **PostgreSQL** self-hosted (контейнер), `@payloadcms/db-postgres`. Redis не используем |
| Стили | **Sass (SCSS-модули) + BEM** |
| Медиа | обложки/PDF — **Cloudflare R2** (S3-плагин Payload); видео — **Cloudflare Stream** (signed URLs) |
| Email | **Resend** |
| Платежи | **WayForPay + PayPal(?)** через абстракцию `PaymentProvider` (+ mock) |
| Хостинг | **1 VPS (Hetzner)** + Docker Compose; **Caddy** (TLS/прокси); **Cloudflare free** (DNS/CDN/DDoS/Access) |
| CI/CD | **GitHub Actions** → образ в **GHCR** → деплой кнопкой Run workflow |
| Мониторинг | **Grafana + Prometheus + Loki** (тех); **GA4 + Search Console** (бизнес/SEO) |
| Тесты | **Vitest + RTL + Playwright** |

## Инварианты

Не обсуждаются в рамках задачи; нарушение = баг:

- Доступ к платному контенту (видео-токены, PDF) — только после **серверной** проверки `Purchase{status:'paid'}`. Никаких решений о доступе на клиенте.
- Платёжные колбэки **идемпотентны** (дедуп по `orderReference`); **цена считается только на сервере**.
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
Локализация: текстовые поля и **ассеты** (Stream-ID, PDF) — per-locale (EN/RU-табы в админке).

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
