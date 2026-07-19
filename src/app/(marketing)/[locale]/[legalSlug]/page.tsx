import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Footer } from '@/components/prototype/Footer';
import { getLegalPage, richTextToParagraphs, toAppLocale } from '@/lib/data';
import type { LegalPage } from '@/payload-types';
import styles from '@/components/catalog/CatalogPage.module.scss';

export const dynamic = 'force-dynamic';

const legalSlugs = ['privacy', 'terms', 'refund', 'contact'] satisfies LegalPage['slug'][];

const isLegalSlug = (slug: string): slug is LegalPage['slug'] =>
  legalSlugs.includes(slug as LegalPage['slug']);

export default async function LegalPageRoute({
  params
}: {
  params: Promise<{ locale: string; legalSlug: string }>;
}) {
  await connection();

  const { legalSlug, locale } = await params;

  if (!isLegalSlug(legalSlug)) {
    notFound();
  }

  const safeLocale = toAppLocale(locale);
  const page = await getLegalPage(legalSlug, safeLocale);

  if (!page) {
    notFound();
  }

  const paragraphs = richTextToParagraphs(page.body);

  return (
    <>
      <main className={styles.catalogShell}>
        <section className={styles.catalogInner}>
          <div className={styles.section__label}>MotoPhD</div>
          <h1 className={styles.section__title}>{page.title}</h1>
          <div className={styles.section__sub}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      </main>
      <Footer compact />
    </>
  );
}
