import type { MetadataRoute } from 'next';

import { buildRobots, getSiteUrl } from '@/lib/seo';

// В рантайме, а не при сборке: APP_URL задан только на сервере, в Docker-сборке
// его нет — статический robots.txt запёк бы фолбэк-домен навсегда.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return buildRobots(getSiteUrl());
}
