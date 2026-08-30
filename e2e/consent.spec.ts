import { expect, test } from '@playwright/test';

const TRACKER_PATTERN = /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr/;

test('no tracker is contacted before consent, and accepting loads them', async ({
  context,
  page
}) => {
  await context.clearCookies();

  const trackerRequests: string[] = [];

  // Проверяем фактические запросы, а не наличие тега: трекер мог бы приехать
  // через fetch или img-пиксель и DOM-ассерт этого не увидел бы.
  page.on('request', (request) => {
    if (TRACKER_PATTERN.test(request.url())) {
      trackerRequests.push(request.url());
    }
  });

  await page.goto('/en');

  await expect(page.getByRole('dialog', { name: 'Your privacy matters' })).toBeVisible();
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  expect(trackerRequests).toEqual([]);

  await page.getByRole('button', { name: 'Accept all' }).click();

  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(1);
  await expect.poll(() => trackerRequests.length).toBeGreaterThan(0);
});

test('withdrawing consent stops tracking and clears analytics cookies', async ({
  context,
  page
}) => {
  await context.clearCookies();
  await page.goto('/en');
  await page.getByRole('button', { name: 'Accept all' }).click();
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await page.getByRole('button', { name: 'Necessary only' }).click();

  // После отзыва страница перезагружается: скриптов быть не должно.
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);

  const cookies = await context.cookies();

  expect(cookies.find((cookie) => cookie.name === 'motophd_consent')?.value).toBe('necessary');
  expect(cookies.filter((cookie) => cookie.name.startsWith('_ga'))).toEqual([]);
});
