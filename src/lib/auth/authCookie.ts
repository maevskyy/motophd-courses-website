import type { cookies } from 'next/headers';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export const AUTH_COOKIE = 'payload-token';

// Атрибуты куки едины для логина и смены пароля: разъехавшиеся флаги дают
// две куки с разным scope и непредсказуемую сессию.
export const setAuthCookie = (store: CookieStore, token: string) => {
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
};
