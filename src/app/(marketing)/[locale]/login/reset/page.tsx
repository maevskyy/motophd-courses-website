import { ResetPasswordForm } from '@/components/login/ResetPasswordForm';

export default async function ResetPasswordPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: 'en' | 'ru' }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const [{ locale }, { token }] = await Promise.all([params, searchParams]);

  return <ResetPasswordForm locale={locale} token={typeof token === 'string' ? token : ''} />;
}
