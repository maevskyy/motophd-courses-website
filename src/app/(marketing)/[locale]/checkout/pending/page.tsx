import { getTranslations } from 'next-intl/server';

import { PaymentStatusWatcher } from '@/components/checkout/PaymentStatusWatcher';
import { Link } from '@/i18n/routing';
import { PageMessage, pageMessageStyles as styles } from '@/components/ui/PageMessage';
import { requireLocale } from '@/i18n/requireLocale';

// Банк ещё не решил (антифрод проверяет платёж). Страница ждёт решения сама;
// закрыть её можно — доступ и письмо с паролем придут, как только банк одобрит.
export default async function CheckoutPendingPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; t?: string }>;
}) {
  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const { order, t: token } = await searchParams;
  const t = await getTranslations({ locale: safeLocale, namespace: 'checkout' });
  const actions = await getTranslations({ locale: safeLocale, namespace: 'actions' });

  return (
    <PageMessage text={t('pendingDescription')} title={t('pendingTitle')}>
      {order ? <PaymentStatusWatcher order={order} token={token} /> : null}
      <Link className={styles.secondary} href="/">
        {actions('backToWebsite')}
      </Link>
    </PageMessage>
  );
}
