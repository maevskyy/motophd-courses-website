import { expect, test, type Page } from '@playwright/test';

// Докупка обратной связи из кабинета (MOT-21). Свой гость с уникальным email:
// параллельные логины сид-пользователей роняют друг другу сессии (MOT-36).
const createGuestEmail = (label: string) =>
  `checkout-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@motophd.test`;

const upgradeButton = (page: Page) => page.getByRole('button', { name: 'Add personal feedback' });

const payInMockBank = async (page: Page) => {
  await expect(page).toHaveURL(/\/en\/checkout\/mock\?order=/);
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/checkout\/success\?order=/);
};

const getOwnPurchases = async (page: Page) => {
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/purchases?depth=0&limit=10&sort=createdAt');

    return {
      body: await result.json(),
      ok: result.ok
    };
  });

  expect(response.ok).toBe(true);

  return response.body.docs as Array<{ amount: number; status: string; tier: string }>;
};

test('standard buyer adds feedback from the dashboard and pays only the difference', async ({
  page,
  request
}) => {
  const courseResponse = await request.get('/api/courses?where[slug][equals]=lean&limit=1&depth=0');
  const course = (await courseResponse.json()).docs[0] as {
    priceFeedback: number;
    priceStandard: number;
  };

  // Гость покупает standard через mock-чекаут и автоматически входит в кабинет.
  await page.goto('/en/courses/lean');
  // Cookie-баннер висит поверх карточек кабинета и перехватывает клик по кнопке.
  await page.getByRole('button', { name: 'Necessary only' }).click();
  await page.locator('#checkout-email').fill(createGuestEmail('upgrade'));
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'PAY' }).click();
  await payInMockBank(page);
  await expect(page).toHaveURL(/signedIn=1/);

  await page.goto('/en/dashboard');
  await expect(upgradeButton(page)).toBeVisible();

  // Клик ведёт в тот же чекаут, но уже с тарифом feedback_upgrade.
  await upgradeButton(page).click();
  await payInMockBank(page);

  await page.goto('/en/dashboard');
  // Название курса — ссылка в resume-карточке; уроки ниже тоже ссылки на /learn/lean/.
  await expect(page.getByRole('link', { name: 'Motorcycle Leaning Without Fear' })).toBeVisible();
  await expect(upgradeButton(page)).toHaveCount(0);

  expect(await getOwnPurchases(page)).toEqual([
    expect.objectContaining({ amount: course.priceStandard, status: 'paid', tier: 'standard' }),
    expect.objectContaining({
      amount: course.priceFeedback - course.priceStandard,
      status: 'paid',
      tier: 'feedback_upgrade'
    })
  ]);

  await page.goto('/en/feedback');
  await expect(page.getByRole('heading', { name: 'Personal Feedback' })).toBeVisible();
});
