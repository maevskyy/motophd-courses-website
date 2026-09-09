import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Footer } from '@/components/prototype/Footer';
import { Section, SectionHeader } from '@/components/ui/Section';
import { getLegalPage, richTextToParagraphs, type AppLocale } from '@/lib/data';
import { buildPageMetadata, resolveSeoLocale } from '@/lib/seo';
import { requireLocale } from '@/i18n/requireLocale';
import type { LegalPage } from '@/payload-types';
import styles from '@/components/catalog/CatalogPage.module.scss';

export const revalidate = 300;

// Пустой список: страницы рендерятся при первом заходе и кэшируются (ISR),
// чтобы сборка в CI обходилась без работающей базы.
export function generateStaticParams() {
  return [];
}

const legalSlugs = ['privacy', 'terms', 'refund', 'contact'] satisfies LegalPage['slug'][];

const isLegalSlug = (slug: string): slug is LegalPage['slug'] =>
  legalSlugs.includes(slug as LegalPage['slug']);

// Один запрос на рендер: generateMetadata и страница читают ту же запись.
const loadLegalPage = cache((slug: LegalPage['slug'], locale: AppLocale) =>
  getLegalPage(slug, locale)
);

// Title — заголовок страницы из Payload, description — её первый абзац.
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; legalSlug: string }>;
}): Promise<Metadata> {
  const { legalSlug, locale } = await params;
  const seoLocale = resolveSeoLocale(locale);

  if (!seoLocale || !isLegalSlug(legalSlug)) {
    return {};
  }

  const page = await loadLegalPage(legalSlug, seoLocale);

  if (!page) {
    return {};
  }

  return buildPageMetadata({
    description: richTextToParagraphs(page.body)[0] || page.title,
    locale: seoLocale,
    path: `/${page.slug}`,
    title: page.title
  });
}

export default async function LegalPageRoute({
  params
}: {
  params: Promise<{ locale: string; legalSlug: string }>;
}) {
  const { legalSlug, locale } = await params;
  const safeLocale = requireLocale(locale);

  if (!isLegalSlug(legalSlug)) {
    notFound();
  }
  const page = await loadLegalPage(legalSlug, safeLocale);

  if (!page) {
    notFound();
  }

  const paragraphs = richTextToParagraphs(page.body);

  return (
    <>
      <main className={styles.shell}>
        <Section>
          <SectionHeader as="h1" kicker="MotoPhD" title={page.title} />
          <div className={styles.prose}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>
      </main>
      <Footer compact />
    </>
  );
}
