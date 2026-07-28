import { expect, test } from '@playwright/test';

test('health endpoint responds', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.ok()).toBe(true);
});

test('home page renders in English', async ({ page }) => {
  await page.goto('/en');

  const nav = page.getByRole('navigation');

  await expect(nav.getByRole('link', { exact: true, name: 'Courses' })).toBeVisible();
  await expect(nav).toContainText('MOTO');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('home page renders in Russian', async ({ page }) => {
  await page.goto('/ru');

  await expect(
    page.getByRole('navigation').getByRole('link', { exact: true, name: 'Курсы' })
  ).toBeVisible();
});

test('language switcher toggles the locale', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('link', { name: /EN.*RU/ }).click();

  await expect(page).toHaveURL(/\/ru(\/|$)/);
  await expect(
    page.getByRole('navigation').getByRole('link', { exact: true, name: 'Курсы' })
  ).toBeVisible();
});

test('catalog lists seeded courses', async ({ page }) => {
  await page.goto('/en/courses');

  await expect(page.locator('a[href*="/en/courses/"]').first()).toBeVisible();
});

test('course page opens from the catalog', async ({ page }) => {
  await page.goto('/en/courses');
  await page.locator('a[href*="/en/courses/"]').first().click();

  await expect(page).toHaveURL(/\/en\/courses\/.+/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('login page shows the form', async ({ page }) => {
  await page.goto('/en/login');

  await expect(page.locator('#login-email')).toBeVisible();
  await expect(page.locator('#login-password')).toBeVisible();
});

test('legal page renders content from Payload', async ({ page }) => {
  await page.goto('/en/privacy');

  await expect(page.locator('h1').first()).toBeVisible();
});

test('admin panel responds', async ({ request }) => {
  const response = await request.get('/admin');

  expect(response.status()).toBe(200);
});
