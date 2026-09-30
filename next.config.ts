import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Метаданные (title, canonical, hreflang, og) — всегда в <head>, для всех.
  // Иначе Next 15 отдаёт <head>, как только готова страница, а метаданные
  // дописывает позже в <body>: страницы витрины из кэша готовы мгновенно, и
  // canonical уезжал в <body>, где поисковики его не учитывают.
  htmlLimitedBots: /.*/,
  output: 'standalone',
  reactStrictMode: true
};

export default withPayload(withNextIntl(nextConfig));
