import type { Metadata } from 'next';

import { locales, type Locale } from '@/i18n/locales';
import { getSiteUrl } from './siteUrl';
import { buildLanguageAlternates, canonicalUrl, toAbsoluteUrl } from './urls';

export const SITE_NAME = 'MotoPhD Online';

export const DEFAULT_TITLE = 'MotoPhD Online — Motorcycle Performance Education';

export const DEFAULT_DESCRIPTION = 'Premium online motorcycle education by MotoPhD.';

export const DESCRIPTION_MAX_LENGTH = 160;

export type SeoImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

// Статический дефолт (public/og-default.png): у соцсетей всегда есть превью,
// даже у страниц без собственной картинки.
export const DEFAULT_OG_IMAGE: SeoImage = {
  alt: SITE_NAME,
  height: 630,
  url: '/og-default.png',
  width: 1200
};

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  uk: 'uk_UA'
};

export type PageMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description?: string | null;
  image?: SeoImage | null;
  absoluteTitle?: boolean;
  siteUrl?: string;
};

// Сниппет Google обрезается около 160 символов: режем по границе слова,
// чтобы описание из Payload не заканчивалось на полуслове.
export const toDescription = (value?: string | null, maxLength = DESCRIPTION_MAX_LENGTH) => {
  const text = (value || '').replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) {
    return text;
  }

  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');

  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/, '')}…`;
};

export const buildPageMetadata = ({
  absoluteTitle = false,
  description,
  image,
  locale,
  path,
  siteUrl = getSiteUrl(),
  title
}: PageMetadataInput): Metadata => {
  const canonical = canonicalUrl(siteUrl, locale, path);
  const languages = buildLanguageAlternates(siteUrl, path);
  const resolvedDescription = toDescription(description) || DEFAULT_DESCRIPTION;
  const resolvedImage = image || DEFAULT_OG_IMAGE;
  const imageUrl = toAbsoluteUrl(siteUrl, resolvedImage.url);

  return {
    alternates: {
      canonical,
      languages
    },
    description: resolvedDescription,
    openGraph: {
      alternateLocale: locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => OG_LOCALES[candidate]),
      description: resolvedDescription,
      images: [
        {
          alt: resolvedImage.alt || title,
          height: resolvedImage.height,
          url: imageUrl,
          width: resolvedImage.width
        }
      ],
      locale: OG_LOCALES[locale],
      siteName: SITE_NAME,
      title,
      type: 'website',
      url: canonical
    },
    title: absoluteTitle ? { absolute: title } : title,
    twitter: {
      card: 'summary_large_image',
      description: resolvedDescription,
      images: [imageUrl],
      title
    }
  };
};
