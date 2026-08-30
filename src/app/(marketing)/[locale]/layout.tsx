import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Unbounded } from 'next/font/google';
import { notFound } from 'next/navigation';
import { AuthStatusProvider } from '@/components/providers/AuthStatusProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Consent } from '@/components/consent';
import { Nav } from '@/components/layout/Nav';
import '../../globals.scss';

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800', '900']
});

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

  if (!hasLocale(['en', 'ru'], locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={unbounded.variable}>
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
