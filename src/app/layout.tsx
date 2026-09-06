import type { Metadata } from 'next';

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  getSiteUrl,
  SITE_NAME
} from '@/lib/seo';

// Дефолт и шаблон: страницы отдают свой title через generateMetadata,
// а суффикс бренда и og:image-заглушку добирают отсюда.
export const metadata: Metadata = {
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    siteName: SITE_NAME,
    type: 'website'
  },
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
