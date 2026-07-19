import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true
};

export default withPayload(withNextIntl(nextConfig));
