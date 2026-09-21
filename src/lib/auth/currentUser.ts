import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/payload-types';
import { getPayloadClient } from '@/lib/data/payload';
import { AUTH_COOKIE } from './authCookie';

// Токен берём из cookies(), а не из сырого заголовка Cookie: серверный экшен
// смены пароля переподписывает куку, и тот же запрос дорисовывает страницу
// уже с новым токеном. Старый к этому моменту мёртв — хук одной сессии
// (singleSession.ts) убил его при перелогине, и по заголовку Payload вернул
// бы «аноним» с редиректом на логин. Authorization у Payload в приоритете
// над кукой.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const payload = await getPayloadClient();
  const requestHeaders = new Headers(await headers());
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (token) {
    requestHeaders.set('Authorization', `JWT ${token}`);
  }

  const { user } = await payload.auth({ headers: requestHeaders });

  return user as User | null;
});

export const requireUser = async (loginPath = '/login'): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(loginPath);
  }

  return user;
};
