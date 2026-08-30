import { beforeEach, describe, expect, it } from 'vitest';
import { consumeRateLimit, getClientIp, resetRateLimits } from './rateLimit';

const rule = { limit: 3, windowMs: 60_000 };

describe('consumeRateLimit', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('пускает до лимита и режет сверх него', () => {
    const now = 1_000_000;

    expect(consumeRateLimit('k', rule, now).allowed).toBe(true);
    expect(consumeRateLimit('k', rule, now + 1).allowed).toBe(true);
    expect(consumeRateLimit('k', rule, now + 2).allowed).toBe(true);

    const denied = consumeRateLimit('k', rule, now + 3);

    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSec).toBeGreaterThan(0);
  });

  it('считает ключи независимо', () => {
    const now = 1_000_000;

    for (let i = 0; i < 3; i += 1) {
      consumeRateLimit('a', rule, now + i);
    }

    expect(consumeRateLimit('a', rule, now + 10).allowed).toBe(false);
    expect(consumeRateLimit('b', rule, now + 10).allowed).toBe(true);
  });

  it('отпускает после окончания окна и говорит, сколько ждать', () => {
    const now = 1_000_000;

    for (let i = 0; i < 3; i += 1) {
      consumeRateLimit('k', rule, now + i * 1000);
    }

    const denied = consumeRateLimit('k', rule, now + 30_000);

    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSec).toBe(30);

    expect(consumeRateLimit('k', rule, now + rule.windowMs + 2001).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('берёт первый адрес из X-Forwarded-For', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' });

    expect(getClientIp(headers)).toBe('203.0.113.7');
  });

  it('падает на x-real-ip и на unknown без прокси', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
