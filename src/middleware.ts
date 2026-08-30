import { NextResponse, type NextRequest } from 'next/server';
import { RATE_LIMITS } from '@/lib/rateLimit/limits';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit/rateLimit';

// Логин-роут отдаёт Payload из catch-all, туда свой код не вставить —
// поэтому лимит по IP живёт в middleware. Лимит по email добавляют
// loginAction и штатный локаут Payload.
export function middleware(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  const ip = getClientIp(request.headers);
  const decision = consumeRateLimit(`login:ip:${ip}`, RATE_LIMITS.loginIp);

  if (!decision.allowed) {
    return NextResponse.json(
      { errors: [{ message: 'Too many login attempts. Try again later.' }] },
      {
        headers: { 'Retry-After': String(decision.retryAfterSec) },
        status: 429
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/users/login'
};
