'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayloadClient } from '@/lib/data/payload';
import { sendPasswordReset } from '@/lib/email';
import { getAppUrl } from '@/lib/email/templates';
import { consumeRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';
import { MIN_PASSWORD_LENGTH } from './accountFormState';
import { setAuthCookie } from './authCookie';
import type { ForgotPasswordFormState, ResetPasswordFormState } from './passwordResetFormState';

const getLocale = (value: FormDataEntryValue | null) => (value === 'ru' ? 'ru' : 'en');

export async function forgotPasswordAction(
  _previousState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();
  const locale = getLocale(formData.get('locale'));

  const ip = getClientIp(await headers());
  const ipDecision = consumeRateLimit(`forgot:ip:${ip}`, RATE_LIMITS.forgotIp);
  const emailDecision = consumeRateLimit(`forgot:email:${email}`, RATE_LIMITS.forgotEmail);

  if (!ipDecision.allowed || !emailDecision.allowed) {
    return { status: 'rateLimited' };
  }

  try {
    const payload = await getPayloadClient();
    // disableEmail: Payload не умеет наши шаблоны — токен забираем сами
    // и шлём письмо через src/lib/email.
    const token = await payload.forgotPassword({
      collection: 'users',
      data: { email },
      disableEmail: true
    });

    if (token) {
      await sendPasswordReset({
        locale,
        resetUrl: `${getAppUrl()}/${locale}/login/reset?token=${token}`,
        to: email
      });
    }
  } catch {
    // Ответ обезличен и при ошибке: форма не должна выдавать, существует ли аккаунт.
  }

  return { status: 'sent' };
}

export async function resetPasswordAction(
  _previousState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const locale = getLocale(formData.get('locale'));

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { status: 'tooShort' };
  }

  if (password !== confirmPassword) {
    return { status: 'mismatch' };
  }

  if (!token) {
    return { status: 'invalidToken' };
  }

  let authToken: string | undefined;

  try {
    const payload = await getPayloadClient();
    const result = await payload.resetPassword({
      collection: 'users',
      data: { password, token },
      overrideAccess: true
    });

    authToken = result.token;
  } catch {
    return { status: 'invalidToken' };
  }

  // Свежий токен из resetPassword сразу логинит: человек с письмом уже
  // доказал владение ящиком, второй ввод пароля ничего не добавляет.
  if (authToken) {
    setAuthCookie(await cookies(), authToken);
  }

  redirect(`/${locale}/dashboard`);
}
