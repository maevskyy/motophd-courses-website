import type { MetadataRoute } from 'next';

import { locales } from '@/i18n/locales';
import { localizedPath } from './urls';

// Приватные разделы под локалью: checkout и login — из (marketing),
// dashboard/feedback/learn — кабинет и плеер из (app).
export const PRIVATE_LOCALE_SEGMENTS = ['checkout', 'login', 'dashboard', 'feedback', 'learn'];

// Публичные картинки Payload (обложки курсов в og:image) живут под /api:
// без явного Allow боты соцсетей не смогут забрать превью. Остальной /api закрыт.
export const PUBLIC_MEDIA_PATH = '/api/media/file/';

export const buildRobots = (siteUrl: string): MetadataRoute.Robots => ({
  rules: [
    {
      allow: ['/', PUBLIC_MEDIA_PATH],
      disallow: [
        '/admin',
        '/api',
        ...locales.flatMap((locale) =>
          PRIVATE_LOCALE_SEGMENTS.map((segment) => localizedPath(locale, `/${segment}`))
        )
      ],
      userAgent: '*'
    }
  ],
  sitemap: `${siteUrl}/sitemap.xml`
});
