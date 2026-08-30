import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100';
const analyticsTestEnvironment = {
  ...process.env,
  NEXT_PUBLIC_GA4_ID: 'G-TEST123',
  NEXT_PUBLIC_META_PIXEL_ID: '123456789',
  // Все тесты ходят с одного IP и юзают одни аккаунты: общие лимиты подняты,
  // иначе повторные прогоны в течение окна начинают ловить 429. Лимит
  // pdf-per-user не поднят: его превышение проверяет rateLimit.spec
  // на выделенном аккаунте ratelimit@motophd.com.
  RATE_LIMIT_FORGOT_EMAIL: '10000',
  RATE_LIMIT_FORGOT_IP: '10000',
  RATE_LIMIT_LOGIN_EMAIL: '10000',
  RATE_LIMIT_LOGIN_IP: '10000',
  RATE_LIMIT_PDF_ANON_IP: '10000'
};

export default defineConfig({
  // Логин и смена пароля — это bcrypt: при параллельном прогоне проверки
  // выстраиваются в очередь на одном сервере, и дефолтных 5s не хватает.
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  retries: process.env.CI ? 1 : 0,
  testDir: './e2e',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm start -p 3100',
        env: analyticsTestEnvironment,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: `${baseURL}/api/health`
      }
});
