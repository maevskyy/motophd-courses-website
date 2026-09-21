import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/locales';
import { AuthStatusProvider } from '@/components/providers/AuthStatusProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Consent } from '@/components/consent';
import { Nav } from '@/components/layout/Nav';
import { fontClassName } from '../../fonts';
import '../../globals.scss';

// Маркетинг раздаётся статикой (ISR), поэтому здесь нельзя читать куки и
// заголовки: статус логина для нава добирает AuthStatusProvider на клиенте.
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html className={fontClassName} lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthStatusProvider>
            <ToastProvider>
              <Nav />
              {children}
              <Consent />
            </ToastProvider>
          </AuthStatusProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
