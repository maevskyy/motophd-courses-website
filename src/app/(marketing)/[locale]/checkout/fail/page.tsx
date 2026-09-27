import { getTranslations } from 'next-intl/server';

import { CheckoutResult } from '@/components/checkout/CheckoutResult';
import { requireLocale } from '@/i18n/requireLocale';

export default async function CheckoutFailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: requireLocale(locale), namespace: 'checkout' });

  return (
    <CheckoutResult
      action={{ href: '/courses', label: t('failCta') }}
      description={t('failDescription')}
      title={t('failTitle')}
    />
  );
}
