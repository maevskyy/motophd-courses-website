export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSec: number;
}

// Счётчики живут в памяти процесса: Redis нет по ADR-4, приложение — один
// контейнер, поэтому общего стора не требуется. После рестарта лимиты
// обнуляются — это осознанная цена простоты.
const hitLog = new Map<string, number[]>();

const MAX_TRACKED_KEYS = 10_000;

const pruneExpired = (rule: RateLimitRule, now: number) => {
  if (hitLog.size < MAX_TRACKED_KEYS) {
    return;
  }

  for (const [key, timestamps] of hitLog) {
    if (timestamps.every((timestamp) => timestamp <= now - rule.windowMs)) {
      hitLog.delete(key);
    }
  }
};

export const consumeRateLimit = (
  key: string,
  rule: RateLimitRule,
  now = Date.now()
): RateLimitDecision => {
  pruneExpired(rule, now);

  const windowStart = now - rule.windowMs;
  const recent = (hitLog.get(key) || []).filter((timestamp) => timestamp > windowStart);

  if (recent.length >= rule.limit) {
    hitLog.set(key, recent);

    const retryAfterMs = recent[0] + rule.windowMs - now;

    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  recent.push(now);
  hitLog.set(key, recent);

  return { allowed: true, retryAfterSec: 0 };
};

export const resetRateLimits = () => {
  hitLog.clear();
};

// За Cloudflare и Caddy первый адрес в X-Forwarded-For — реальный клиент.
// Без прокси (локальная разработка) заголовка нет — все считаются одним
// клиентом 'unknown', для дева это не мешает.
export const getClientIp = (headers: Headers) =>
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
