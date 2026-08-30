import { ForgotPasswordForm } from '@/components/login/ForgotPasswordForm';

export default async function ForgotPasswordPage({
  params
}: {
  params: Promise<{ locale: 'en' | 'ru' }>;
}) {
  const { locale } = await params;

  return <ForgotPasswordForm locale={locale} />;
}
