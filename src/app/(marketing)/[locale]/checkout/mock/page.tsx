import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { getPaymentProvider } from '@/lib/payments';
import { requireLocale } from '@/i18n/requireLocale';

import { mockPaymentAction } from './actions';

export default async function MockCheckoutPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; t?: string }>;
}) {
  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const { order = '', t: postPaymentToken = '' } = await searchParams;
  const provider = getPaymentProvider();

  if (provider?.name !== 'mock' || !order) {
    notFound();
  }

  const t = await getTranslations({ locale: safeLocale, namespace: 'checkout' });

  return (
    <main>
      <h1>{t('mockTitle')}</h1>
      <p>{t('mockDescription')}</p>
      <form action={mockPaymentAction}>
        <input name="decision" type="hidden" value="paid" />
        <input name="locale" type="hidden" value={safeLocale} />
        <input name="order" type="hidden" value={order} />
        <input name="t" type="hidden" value={postPaymentToken} />
        <button type="submit">{t('pay')}</button>
      </form>
      <form action={mockPaymentAction}>
        <input name="decision" type="hidden" value="failed" />
        <input name="locale" type="hidden" value={safeLocale} />
        <input name="order" type="hidden" value={order} />
        <input name="t" type="hidden" value={postPaymentToken} />
        <button type="submit">{t('decline')}</button>
      </form>
    </main>
  );
}
