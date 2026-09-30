/*
  Нагрузочный тест витрины: так ходит человек, пришедший по посту в
  Instagram. Главная → список курсов → страница курса, с паузами на чтение.
  На каждой странице браузер спрашивает /api/users/me (шапка: «Войти» или
  «Кабинет») — его тоже шлём. Статику (JS, CSS, картинки) не качаем: её
  отдаёт кэш Cloudflare, до сервера она не доходит.

  Запуск (подробно — loadtest/README.md):
    k6 run -e BASE_URL=https://motophd.com -e PEAK=300 loadtest/storefront.js

  Тест сам останавливается, если сайту плохо: больше 5% ошибок или p95
  дольше 3 секунд — дальше давить нет смысла, предел найден.
*/
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3200';
const PEAK = Number(__ENV.PEAK || 300);
const COURSE = __ENV.COURSE || 'lean';
const LOCALES = ['en', 'ru', 'uk'];
// SMOKE=1 — каждая ступень по 10 секунд: проверить сам сценарий, не сайт.
const hold = (duration) => (__ENV.SMOKE ? '10s' : duration);

// Ступени: разогрев, треть пика, пик. Каждая держится по 2 минуты, чтобы
// увидеть устойчивое время ответа, а не всплеск.
export const options = {
  scenarios: {
    visitors: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: hold('1m'), target: Math.ceil(PEAK / 10) },
        { duration: hold('2m'), target: Math.ceil(PEAK / 10) },
        { duration: hold('1m'), target: Math.ceil(PEAK / 3) },
        { duration: hold('2m'), target: Math.ceil(PEAK / 3) },
        { duration: hold('1m'), target: PEAK },
        { duration: hold('2m'), target: PEAK },
        { duration: hold('30s'), target: 0 }
      ],
      gracefulRampDown: '10s'
    }
  },
  thresholds: {
    // Стоп-кран: сработал — k6 останавливает тест.
    http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '30s' }],
    'http_req_duration{kind:page}': [
      { threshold: 'p(95)<3000', abortOnFail: true, delayAbortEval: '30s' },
      // Цель, а не стоп-кран: хорошо, если страница отдаётся быстрее 800 мс.
      'p(95)<800'
    ]
  },
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max']
};

const params = (name, kind) => ({
  headers: {
    'Accept-Language': 'en-US,en;q=0.9',
    // Честно называем себя: в логах и в Cloudflare видно, что это тест.
    'User-Agent': 'MotoPhD-loadtest/1.0 (k6)'
  },
  tags: { kind, name }
});

const page = (path, name) => {
  const response = http.get(`${BASE_URL}${path}`, params(name, 'page'));

  check(response, {
    [`${name}: 200`]: (r) => r.status === 200,
    [`${name}: html`]: (r) => (r.body || '').includes('</html>')
  });
  http.get(`${BASE_URL}/api/users/me`, params('users/me', 'api'));

  return response;
};

export default function visitor() {
  const locale = LOCALES[Math.floor(Math.random() * LOCALES.length)];

  group('landing', () => page(`/${locale}`, 'home'));
  sleep(3 + Math.random() * 5);

  group('catalog', () => page(`/${locale}/courses`, 'courses'));
  sleep(3 + Math.random() * 5);

  group('course', () => page(`/${locale}/courses/${COURSE}`, 'course'));
  sleep(5 + Math.random() * 10);
}
