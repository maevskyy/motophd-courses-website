import { expect, test, type Page } from '@playwright/test';

// Сквозные сценарии, которых нет в smoke (MOT-100): одна сессия на аккаунт,
// кабинет, 404, админка, возврат из банка и мобильная вёрстка.

const signIn = async (page: Page, email: string, password: string) => {
  await page.goto('/en/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
};

test('signing in on a second device ends the first session', async ({ browser }) => {
  const first = await browser.newContext();
  const second = await browser.newContext();
  const firstPage = await first.newPage();
  const secondPage = await second.newPage();

  await signIn(firstPage, 'guest@motophd.com', 'guest1234');
  await signIn(secondPage, 'guest@motophd.com', 'guest1234');

  await firstPage.goto('/en/dashboard');
  await expect(firstPage).toHaveURL(/\/en\/login\?/);

  await secondPage.goto('/en/dashboard');
  await expect(secondPage).toHaveURL(/\/en\/dashboard$/);

  await first.close();
  await second.close();
});

test('student dashboard lists the purchased course and opens it', async ({ page }) => {
  await signIn(page, 'student@motophd.com', 'student1234');

  const courseLink = page.locator('a[href*="/learn/lean"]').first();

  await expect(courseLink).toBeVisible();
  await courseLink.click();
  await expect(page).toHaveURL(/\/en\/learn\/lean/);
  await expect(page.locator('h1')).toHaveText('Level 01 — Theory');
});

test('unknown pages and courses answer 404', async ({ page }) => {
  for (const path of ['/en/no-such-page', '/ru/courses/no-such-course']) {
    const response = await page.goto(path);

    expect(response?.status(), path).toBe(404);
  }
});

test('bank return redirects to the public site, never to the container address', async ({
  request
}) => {
  // За Caddy request.url — это https://0.0.0.0:3000 (MOT-98): после оплаты
  // покупатель уходил на недоступный адрес.
  for (const [transactionStatus, page] of [
    ['Approved', 'success'],
    ['Declined', 'fail']
  ]) {
    const response = await request.post('/api/payments/wayforpay/return?locale=ru&order=e2e-order', {
      form: { orderReference: 'e2e-order', transactionStatus },
      maxRedirects: 0
    });
    const location = response.headers().location || '';

    expect(response.status()).toBe(303);
    expect(location).not.toContain('0.0.0.0');
    expect(new URL(location).pathname).toBe(`/ru/checkout/${page}`);
  }
});

test('admin signs in and opens a course with its prices', async ({ page }) => {
  test.slow();
  await page.goto('/admin/login');
  await page.locator('#field-email').fill('admin@motophd.com');
  await page.locator('#field-password').fill('admin1234');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin\/?$/);

  await page.goto('/admin/collections/courses');
  await page.getByRole('link', { name: 'Motorcycle Leaning Without Fear' }).first().click();

  await expect(page).toHaveURL(/\/admin\/collections\/courses\/\d+/);
  await expect(page.locator('#field-priceStandard')).toHaveValue('29');
  await expect(page.locator('#field-priceFeedback')).toHaveValue('129');
});

test.describe('phone layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const expectNoHorizontalScroll = async (page: Page, path: string) => {
    // Не networkidle: hero-видео лендинга держит сеть занятой.
    await page.goto(path, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );

    expect(overflow, `${path} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(0);
  };

  test('public pages fit the screen without sideways scroll', async ({ page }) => {
    test.slow();

    for (const path of [
      '/en',
      '/uk',
      '/en/courses',
      '/en/courses/lean',
      '/en/login',
      '/en/privacy',
      '/en/checkout/success?order=x',
      '/en/checkout/fail?order=x'
    ]) {
      await expectNoHorizontalScroll(page, path);
    }
  });

  test('dashboard and player fit the screen without sideways scroll', async ({ page }) => {
    test.slow();
    await signIn(page, 'student@motophd.com', 'student1234');

    for (const path of ['/en/dashboard', '/en/learn/lean']) {
      await expectNoHorizontalScroll(page, path);
    }
  });
});
