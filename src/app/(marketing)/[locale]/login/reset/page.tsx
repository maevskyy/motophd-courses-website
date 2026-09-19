import type { Locale } from '@/i18n/locales';
import { ResetPasswordForm } from '@/components/login/ResetPasswordForm';

export default async function ResetPasswordPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const [{ locale }, { token }] = await Promise.all([params, searchParams]);

  return <ResetPasswordForm locale={locale} token={typeof token === 'string' ? token : ''} />;
}
