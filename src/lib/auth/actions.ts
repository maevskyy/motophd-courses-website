'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayloadClient } from '@/lib/data/payload';
import { consumeRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';
import { getSafeNextPath } from './redirect';
import type { LoginFormState } from './formState';

const getLocale = (value: FormDataEntryValue | null) => (value === 'ru' ? 'ru' : 'en');

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const locale = getLocale(formData.get('locale'));
  const fallbackPath = `/${locale}/dashboard`;

  // По IP и по email одновременно: IP режет потоп с одной машины, email —
  // распределённый перебор одного аккаунта. Плюс штатный локаут Payload
  // после серии неверных паролей.
  const ip = getClientIp(await headers());
  const ipDecision = consumeRateLimit(`login:action:ip:${ip}`, RATE_LIMITS.loginIp);
  const emailDecision = consumeRateLimit(
    `login:action:email:${email.toLowerCase()}`,
    RATE_LIMITS.loginEmail
  );

  if (!ipDecision.allowed || !emailDecision.allowed) {
    return { error: true, rateLimited: true };
  }

  let token: string | undefined;

  try {
    const payload = await getPayloadClient();
    const result = await payload.login({
      collection: 'users',
      data: { email, password }
    });

    token = result.token;
  } catch {
    return { error: true };
  }

  if (!token) {
    return { error: true };
  }

  const cookieStore = await cookies();

  cookieStore.set('payload-token', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  redirect(getSafeNextPath(formData.get('next'), fallbackPath));
}

export async function logoutAction(formData: FormData) {
  const locale = getLocale(formData.get('locale'));
  const cookieStore = await cookies();

  cookieStore.delete('payload-token');
  redirect(`/${locale}/`);
}
