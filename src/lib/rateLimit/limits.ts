import type { RateLimitRule } from './rateLimit';

const fromEnv = (name: string, fallback: number) => {
  const parsed = Number(process.env[name]);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Все лимиты приложения — в одном месте. Env-переопределения нужны e2e и
// нагрузочному тесту (MOT-31): поднять лимит на время прогона, не трогая код.
export const RATE_LIMITS = {
  loginIp: {
    limit: fromEnv('RATE_LIMIT_LOGIN_IP', 30),
    windowMs: 15 * 60_000
  },
  loginEmail: {
    limit: fromEnv('RATE_LIMIT_LOGIN_EMAIL', 10),
    windowMs: 15 * 60_000
  },
  pdfAnonIp: {
    limit: fromEnv('RATE_LIMIT_PDF_ANON_IP', 30),
    windowMs: 10 * 60_000
  },
  pdfUser: {
    limit: fromEnv('RATE_LIMIT_PDF_USER', 30),
    windowMs: 10 * 60_000
  },
  // Подключаются в MOT-3 вместе с роутами платёжки. Колбэк провайдера не
  // глушим совсем — лимит щедрый, только против потопа.
  checkoutIp: {
    limit: fromEnv('RATE_LIMIT_CHECKOUT_IP', 10),
    windowMs: 10 * 60_000
  },
  paymentWebhookIp: {
    limit: fromEnv('RATE_LIMIT_PAYMENT_WEBHOOK_IP', 120),
    windowMs: 60_000
  }
} satisfies Record<string, RateLimitRule>;
