import { getTranslations } from 'next-intl/server';

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
    <main>
      <h1>{t('successTitle')}</h1>
      <p>{signedIn ? t('successSignedIn') : t('successLogin')}</p>
    </main>
  );
}
