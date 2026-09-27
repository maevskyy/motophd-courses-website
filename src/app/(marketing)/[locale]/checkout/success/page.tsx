import { getTranslations } from 'next-intl/server';

import { CheckoutResult } from '@/components/checkout/CheckoutResult';
import { requireLocale } from '@/i18n/requireLocale';

export default async function CheckoutSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; signedIn?: string }>;
}) {
  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const { signedIn: signedInFlag } = await searchParams;
  // Токен погашен и кука поставлена до редиректа сюда (server action / return-роут).
  const signedIn = signedInFlag === '1';
  const t = await getTranslations({ locale: safeLocale, namespace: 'checkout' });

  return (
    <CheckoutResult
      action={
        signedIn
          ? { href: '/dashboard', label: t('successCta') }
          : { href: '/login', label: t('successLoginCta') }
      }
      description={signedIn ? t('successSignedIn') : t('successLogin')}
      title={t('successTitle')}
    />
  );
}
