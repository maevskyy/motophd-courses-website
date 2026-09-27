import type { Metadata } from 'next';
import { Footer } from '@/components/prototype/Footer';
import { AboutPage } from '@/components/about/AboutPage';
import { homeContent } from '@/lib/content';
import { buildPageMetadata, resolveSeoLocale } from '@/lib/seo';
import { requireLocale } from '@/i18n/requireLocale';

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = resolveSeoLocale(locale);

  if (!seoLocale) {
    return {};
  }

  const content = homeContent[seoLocale];

  return buildPageMetadata({
    description: content.instructorCopy[0],
    locale: seoLocale,
    path: '/about',
    title: content.instructorLabel
  });
}

export default async function AboutRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const content = homeContent[safeLocale];

  return (
    <>
      <AboutPage content={content} />
      <Footer socialLinks={content.socialLinks} />
    </>
  );
}
