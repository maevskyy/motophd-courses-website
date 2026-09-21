import type { Locale } from '@/i18n/locales';
import { LoginForm } from '@/components/login/LoginForm';

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams]);

  return <LoginForm locale={locale} nextPath={typeof next === 'string' ? next : undefined} />;
}
