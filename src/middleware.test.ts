import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { middleware } from './middleware';
import { RATE_LIMITS } from '@/lib/rateLimit/limits';
import { resetRateLimits } from '@/lib/rateLimit/rateLimit';

const loginRequest = (ip: string) =>
  new NextRequest('http://localhost/api/users/login', {
    headers: { 'x-forwarded-for': ip },
    method: 'POST'
  });

describe('login rate limit middleware', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('отвечает 429 с Retry-After после исчерпания лимита по IP', () => {
    for (let i = 0; i < RATE_LIMITS.loginIp.limit; i += 1) {
      expect(middleware(loginRequest('203.0.113.7')).status).toBe(200);
    }

    const denied = middleware(loginRequest('203.0.113.7'));

    expect(denied.status).toBe(429);
    expect(Number(denied.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('не смешивает разные IP и не трогает GET', () => {
    for (let i = 0; i < RATE_LIMITS.loginIp.limit + 1; i += 1) {
      middleware(loginRequest('203.0.113.7'));
    }

    expect(middleware(loginRequest('198.51.100.2')).status).toBe(200);

    const getRequest = new NextRequest('http://localhost/api/users/login', {
      headers: { 'x-forwarded-for': '203.0.113.7' },
      method: 'GET'
    });

    expect(middleware(getRequest).status).toBe(200);
  });
});
