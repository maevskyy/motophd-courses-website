import { expect, test, type APIRequestContext, type Browser } from '@playwright/test';

// Региональные цены: страницы одни на всех (кэш), цену для страны выбирает
// браузер по /cdn-cgi/trace, а оплата считает по заголовку CF-IPCountry.
// Локально Cloudflare нет — подставляем и то и другое сами. Антарктида
// (AQ), чтобы строка цены не пересеклась с настоящими регионами.
test.describe.configure({ mode: 'serial' });

const REGION = { countries: ['AQ'], priceFeedback: 60, priceStandard: 15 };

let token: string;
let courseId: number;
let originalRows: unknown[];

const adminHeaders = () => ({ Authorization: `JWT ${token}` });

// Посетитель из AQ: Cloudflare сказал бы это и браузеру, и серверу.
const regionalVisitor = async (browser: Browser) => {
  const context = await browser.newContext({ extraHTTPHeaders: { 'cf-ipcountry': 'AQ' } });

  await context.route('**/cdn-cgi/trace', (route) =>
    route.fulfill({ body: 'fl=1\nloc=AQ\ncolo=TBS\n', contentType: 'text/plain' })
  );

  return context;
};

const setRegionalPrices = (request: APIRequestContext, rows: unknown[]) =>
  request.patch(`/api/courses/${courseId}`, {
    data: { regionalPrices: rows },
    headers: adminHeaders()
  });

test.beforeAll(async ({ request }) => {
  const login = await request.post('/api/users/login', {
    data: { email: 'admin@motophd.com', password: 'admin1234' }
  });
  token = (await login.json()).token;

  const courses = await request.get('/api/courses?where[slug][equals]=lean&depth=0', {
    headers: adminHeaders()
  });
  const course = (await courses.json()).docs[0];
  courseId = course.id;
  originalRows = (course.regionalPrices ?? []).map(
    ({ countries, priceFeedback, priceStandard }: Record<string, unknown>) => ({
      countries,
      priceFeedback,
      priceStandard
    })
  );

  expect((await setRegionalPrices(request, [...originalRows, REGION])).ok()).toBe(true);
});

test.afterAll(async ({ request }) => {
  await setRegionalPrices(request, originalRows);
});

test('a visitor from a listed country sees the regional prices', async ({ browser }) => {
  const regional = await regionalVisitor(browser);
  const page = await regional.newPage();

  await page.goto('/en/courses/lean');
  await expect(page.locator('#pricing')).toContainText('€15');
  await expect(page.locator('#pricing')).toContainText('€60');
  await regional.close();
});

test('everyone else keeps the default prices', async ({ page }) => {
  await page.goto('/en/courses/lean');
  await expect(page.locator('#pricing')).toContainText('€29');
  await expect(page.locator('#pricing')).not.toContainText('€15');
});

test('the regional visitor is charged the regional price', async ({ browser }) => {
  const regional = await regionalVisitor(browser);
  const page = await regional.newPage();
  const email = `regional-${Date.now()}@motophd.test`;

  await page.goto('/en/courses/lean');
  await page.locator('#checkout-email').fill(email);
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'PAY' }).click();
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/checkout\/success\?order=.*signedIn=1/);

  const purchases = await page.evaluate(async () => {
    const result = await fetch('/api/purchases?depth=0&limit=10');

    return (await result.json()).docs as Array<{ amount: number; status: string }>;
  });

  expect(purchases).toEqual([expect.objectContaining({ amount: 15, status: 'paid' })]);
  await regional.close();
});

test('the site reports the visitor country for checks', async ({ request }) => {
  const response = await request.get('/api/geo', { headers: { 'cf-ipcountry': 'aq' } });

  expect(await response.json()).toEqual({ country: 'AQ' });
});
