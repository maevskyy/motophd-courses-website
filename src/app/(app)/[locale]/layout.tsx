import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/locales';
import { AuthStatusProvider } from '@/components/providers/AuthStatusProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Consent } from '@/components/consent';
import { Nav } from '@/components/layout/Nav';
import { fontClassName } from '../../fonts';
import { getCurrentUser } from '@/lib/auth';
import { noIndexMetadata } from '@/lib/seo';
import '../../globals.scss';

export const dynamic = 'force-dynamic';

// Кабинет и плеер — персональные страницы: в индекс не попадают.
export const metadata: Metadata = noIndexMetadata;

export default async function AppLocaleLayout({
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

  const [messages, user] = await Promise.all([getMessages({ locale }), getCurrentUser()]);

  return (
    <html className={fontClassName} lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthStatusProvider initialLoggedIn={Boolean(user)}>
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
