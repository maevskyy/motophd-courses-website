import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { PageMessage, pageMessageStyles as styles } from '@/components/ui/PageMessage';
import { requireLocale } from '@/i18n/requireLocale';

export default async function CheckoutFailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const t = await getTranslations({ locale: safeLocale, namespace: 'checkout' });
  const actions = await getTranslations({ locale: safeLocale, namespace: 'actions' });

  return (
    <PageMessage text={t('failDescription')} title={t('failTitle')}>
      <Link className={styles.primary} href="/courses">
        {actions('allCourses')}
      </Link>
      <Link className={styles.secondary} href="/">
        {actions('backToWebsite')}
      </Link>
    </PageMessage>
  );
}
