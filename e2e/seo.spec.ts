import { expect, test, type Page } from '@playwright/test';

// SEO-проверки не логинятся: параллельные логины одного сид-аккаунта
// роняют друг другу сессии (MOT-36), а head страницы виден анониму.

const headAttribute = (page: Page, selector: string, attribute: string) =>
  page.locator(`head ${selector}`).first().getAttribute(attribute);

test('robots.txt closes admin, api and private sections and links the sitemap', async ({
  request
}) => {
  const response = await request.get('/robots.txt');
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toMatch(/^User-Agent: \*$/im);
  expect(body).toMatch(/^Disallow: \/admin$/m);
  expect(body).toMatch(/^Disallow: \/api$/m);
  expect(body).toMatch(/^Disallow: \/en\/checkout$/m);
  expect(body).toMatch(/^Disallow: \/ru\/login$/m);
  expect(body).toMatch(/^Disallow: \/en\/dashboard$/m);
  expect(body).toMatch(/^Disallow: \/ru\/learn$/m);
  expect(body).toMatch(/^Sitemap: https?:\/\/[^/\s]+\/sitemap\.xml$/m);
});

test('sitemap.xml lists both locales with hreflang alternates', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/xml');

  for (const path of [
    '/en',
    '/ru',
    '/en/courses',
    '/ru/courses',
    '/en/courses/lean',
    '/ru/courses/lean',
    '/en/privacy',
    '/ru/privacy'
  ]) {
    expect(body, `sitemap lacks ${path}`).toMatch(
      new RegExp(`<loc>https?://[^<]+${path.replace(/\//g, '\\/')}</loc>`)
    );
  }

  expect(body).toMatch(/hreflang="en" href="https?:\/\/[^"]+\/en\/courses\/lean"/);
  expect(body).toMatch(/hreflang="ru" href="https?:\/\/[^"]+\/ru\/courses\/lean"/);
  expect(body).toMatch(/hreflang="x-default" href="https?:\/\/[^"]+\/en\/courses\/lean"/);
  expect(body).not.toContain('/checkout');
  expect(body).not.toContain('/login');
  expect(body).not.toContain('/dashboard');
});

test('course page head carries canonical, hreflang, description and social cards', async ({
  page,
  request
}) => {
  await page.goto('/en/courses/lean');

  expect(await headAttribute(page, 'link[rel="canonical"]', 'href')).toMatch(
    /\/en\/courses\/lean$/
  );
  expect(await headAttribute(page, 'link[rel="alternate"][hreflang="ru"]', 'href')).toMatch(
    /\/ru\/courses\/lean$/
  );
  expect(await headAttribute(page, 'link[rel="alternate"][hreflang="en"]', 'href')).toMatch(
    /\/en\/courses\/lean$/
  );
  expect(await headAttribute(page, 'link[rel="alternate"][hreflang="x-default"]', 'href')).toMatch(
    /\/en\/courses\/lean$/
  );

  await expect(page).toHaveTitle(/Motorcycle Leaning Without Fear/);
  expect(await headAttribute(page, 'meta[name="description"]', 'content')).not.toBe('');
  expect(await headAttribute(page, 'meta[property="og:title"]', 'content')).toContain(
    'Motorcycle Leaning Without Fear'
  );
  expect(await headAttribute(page, 'meta[property="og:locale"]', 'content')).toBe('en_US');
  expect(await headAttribute(page, 'meta[property="og:url"]', 'content')).toMatch(
    /\/en\/courses\/lean$/
  );
  expect(await headAttribute(page, 'meta[name="twitter:card"]', 'content')).toBe(
    'summary_large_image'
  );

  // Картинка — абсолютный URL на прод-домен; проверяем, что тот же путь
  // отдаётся этим сервером, не ходя наружу.
  const ogImage = await headAttribute(page, 'meta[property="og:image"]', 'content');

  expect(ogImage).toMatch(/^https?:\/\//);

  const imageResponse = await request.get(new URL(ogImage as string).pathname);

  expect(imageResponse.status()).toBe(200);
  expect(imageResponse.headers()['content-type']).toContain('image/');
});

test('russian course page mirrors the english one in hreflang and locale', async ({ page }) => {
  await page.goto('/ru/courses/lean');

  expect(await headAttribute(page, 'link[rel="canonical"]', 'href')).toMatch(
    /\/ru\/courses\/lean$/
  );
  expect(await headAttribute(page, 'link[rel="alternate"][hreflang="en"]', 'href')).toMatch(
    /\/en\/courses\/lean$/
  );
  expect(await headAttribute(page, 'meta[property="og:locale"]', 'content')).toBe('ru_RU');
  await expect(page).toHaveTitle(/Как перестать бояться наклонять мотоцикл/);
});

test('landing, catalog and legal pages carry localized titles and canonicals', async ({ page }) => {
  await page.goto('/ru');
  expect(await headAttribute(page, 'link[rel="canonical"]', 'href')).toMatch(/\/ru$/);
  expect(await headAttribute(page, 'link[rel="alternate"][hreflang="en"]', 'href')).toMatch(
    /\/en$/
  );
  await expect(page).toHaveTitle(/MotoPhD Online/);

  await page.goto('/en/courses');
  expect(await headAttribute(page, 'link[rel="canonical"]', 'href')).toMatch(/\/en\/courses$/);
  await expect(page).toHaveTitle(/The MotoPhD Curriculum/);

  await page.goto('/en/privacy');
  expect(await headAttribute(page, 'link[rel="canonical"]', 'href')).toMatch(/\/en\/privacy$/);
  expect(await headAttribute(page, 'link[rel="alternate"][hreflang="ru"]', 'href')).toMatch(
    /\/ru\/privacy$/
  );
  expect(await headAttribute(page, 'meta[name="description"]', 'content')).not.toBe('');
});

test('private pages are marked noindex', async ({ request }) => {
  // Логин — динамическая страница: Next стримит её метаданные в конец body,
  // в head их переносит уже браузер. Бот читает сырой HTML — его и проверяем.
  const response = await request.get('/en/login');

  expect(response.status()).toBe(200);
  expect(await response.text()).toMatch(/<meta name="robots" content="noindex,\s*nofollow"\/?>/);
});

test('favicon and icon are served and linked from the head', async ({ page, request }) => {
  const favicon = await request.get('/favicon.ico');

  expect(favicon.status()).toBe(200);
  expect(favicon.headers()['content-type']).toContain('image/');

  const icon = await request.get('/icon.png');

  expect(icon.status()).toBe(200);
  expect(icon.headers()['content-type']).toContain('image/png');

  await page.goto('/en');

  expect(await headAttribute(page, 'link[rel="icon"]', 'href')).toMatch(
    /\/(favicon\.ico|icon\.png)/
  );
});
