import { expect, test, type Page } from '@playwright/test';

const createGuestEmail = (label: string) =>
  `checkout-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@motophd.test`;

const startCheckout = async (page: Page, email: string, promoCode?: string) => {
  await page.goto('/en/courses/lean');
  await page.locator('#checkout-email').fill(email);

  if (promoCode) {
    await page.locator('#checkout-promo').fill(promoCode);
  }

  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'PAY' }).click();

  await expect(page).toHaveURL(/\/en\/checkout\/mock\?order=/);
};

const pay = async (page: Page) => {
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/checkout\/success\?order=.*signedIn=1/);
};

const getOwnPurchases = async (page: Page) => {
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/purchases?depth=0&limit=10');

    return {
      body: await result.json(),
      ok: result.ok
    };
  });

  expect(response.ok).toBe(true);

  return response.body.docs as Array<{
    amount: number;
    provider: string;
    status: string;
  }>;
};

test('guest payment creates one paid mock purchase and opens the course', async ({ page }) => {
  await startCheckout(page, createGuestEmail('paid'));
  await pay(page);

  await page.goto('/en/learn/lean');
  await expect(page.getByText('Lesson Notes')).toBeVisible();

  expect(await getOwnPurchases(page)).toEqual([
    expect.objectContaining({ provider: 'mock', status: 'paid' })
  ]);
});

test('MOTO10 applies the server-side amount of 26.10', async ({ page }) => {
  await startCheckout(page, createGuestEmail('promo'), 'MOTO10');
  await pay(page);

  expect(await getOwnPurchases(page)).toEqual([
    expect.objectContaining({ amount: 26.1, provider: 'mock', status: 'paid' })
  ]);
});

test('declining payment leaves the purchase pending and access closed', async ({ page }) => {
  const email = 'checkout-decline@motophd.com';

  await page.goto('/en/courses/lean');
  await page.locator('#checkout-email').fill(email);
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'PAY' }).click();
  await page.getByRole('button', { name: 'Decline', exact: true }).click();

  await expect(page).toHaveURL(/\/en\/checkout\/fail\?order=/);
  expect((await page.context().cookies()).some(({ name }) => name === 'payload-token')).toBe(false);

  await page.goto('/en/learn/lean');
  await expect(page).toHaveURL(/\/en\/login\?/);

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill('checkout-decline1234');
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();
  await expect(page).toHaveURL(/\/en\/courses\/lean\?access=denied$/);

  // Покупки decline-юзера чистит только сид, а между e2e-прогонами он не
  // гоняется — pending-заказы прошлых прогонов копятся. Считать их нельзя,
  // важно одно: ни один не стал paid.
  const purchases = await getOwnPurchases(page);

  expect(purchases.length).toBeGreaterThan(0);

  for (const purchase of purchases) {
    expect(purchase).toEqual(expect.objectContaining({ provider: 'mock', status: 'pending' }));
  }
});
