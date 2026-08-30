import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Unbounded } from 'next/font/google';
import { notFound } from 'next/navigation';
import { AuthStatusProvider } from '@/components/providers/AuthStatusProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Consent } from '@/components/consent';
import { Nav } from '@/components/layout/Nav';
import { getCurrentUser } from '@/lib/auth';
import '../../globals.scss';

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800', '900']
});

export const dynamic = 'force-dynamic';

export default async function AppLocaleLayout({
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

  const [messages, user] = await Promise.all([getMessages({ locale }), getCurrentUser()]);

  return (
    <html lang={locale}>
      <body className={unbounded.variable}>
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
