import { getTranslations } from 'next-intl/server';

import { requireLocale } from '@/i18n/requireLocale';

export default async function CheckoutFailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: requireLocale(locale), namespace: 'checkout' });

  return (
    <main>
      <h1>{t('failTitle')}</h1>
      <p>{t('failDescription')}</p>
    </main>
  );
}
