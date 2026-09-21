import { LoginForm } from '@/components/login/LoginForm';

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: 'en' | 'ru' }>;
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams]);

  return <LoginForm locale={locale} nextPath={typeof next === 'string' ? next : undefined} />;
}
