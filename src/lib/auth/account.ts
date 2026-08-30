'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getPayloadClient } from '@/lib/data/payload';
import { MIN_PASSWORD_LENGTH } from './accountFormState';
import type { ChangePasswordFormState, UpdateProfileFormState } from './accountFormState';
import { setAuthCookie } from './authCookie';
import { getCurrentUser } from './currentUser';

export async function updateProfileAction(
  _previousState: UpdateProfileFormState,
  formData: FormData
): Promise<UpdateProfileFormState> {
  const name = String(formData.get('name') || '').trim();

  if (name.length > 120) {
    return { status: 'error' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { status: 'error' };
  }

  try {
    const payload = await getPayloadClient();

    await payload.update({
      collection: 'users',
      data: { name },
      id: user.id,
      overrideAccess: false,
      user
    });
  } catch {
    return { status: 'error' };
  }

  revalidatePath('/[locale]/dashboard', 'page');

  return { status: 'success' };
}

export async function changePasswordAction(
  _previousState: ChangePasswordFormState,
  formData: FormData
): Promise<ChangePasswordFormState> {
  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { status: 'tooShort' };
  }

  if (newPassword !== confirmPassword) {
    return { status: 'mismatch' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { status: 'error' };
  }

  const payload = await getPayloadClient();

  // Текущий пароль проверяется настоящим логином: неверные попытки считает
  // штатный локаут Payload, из угнанной сессии пароль не подобрать.
  try {
    await payload.login({
      collection: 'users',
      data: { email: user.email, password: currentPassword }
    });
  } catch {
    return { status: 'wrongCurrent' };
  }

  let token: string | undefined;

  try {
    await payload.update({
      collection: 'users',
      data: { password: newPassword },
      id: user.id,
      overrideAccess: false,
      user
    });

    const relogin = await payload.login({
      collection: 'users',
      data: { email: user.email, password: newPassword }
    });

    token = relogin.token;
  } catch {
    return { status: 'error' };
  }

  // Кука переподписывается сразу — смена пароля не должна разлогинивать.
  if (token) {
    setAuthCookie(await cookies(), token);
  }

  return { status: 'success' };
}
