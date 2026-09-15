import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { PageMessage, pageMessageStyles as styles } from '@/components/ui/PageMessage';
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
  const actions = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const login = await getTranslations({ locale: safeLocale, namespace: 'login' });

  return (
    <PageMessage text={signedIn ? t('successSignedIn') : t('successLogin')} title={t('successTitle')}>
      <Link className={styles.primary} href={signedIn ? '/dashboard' : '/login'}>
        {signedIn ? actions('backToDashboard') : login('button')}
      </Link>
      <Link className={styles.secondary} href="/">
        {actions('backToWebsite')}
      </Link>
    </PageMessage>
  );
}
