import type { Locale } from '@/i18n/locales';
import { ForgotPasswordForm } from '@/components/login/ForgotPasswordForm';

export default async function ForgotPasswordPage({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <ForgotPasswordForm locale={locale} />;
}
