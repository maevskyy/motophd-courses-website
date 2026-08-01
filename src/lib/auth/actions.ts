'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayloadClient } from '@/lib/data/payload';
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
