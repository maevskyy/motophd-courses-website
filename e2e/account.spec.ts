import { expect, test, type Page } from '@playwright/test';

// Кабинет и восстановление пароля (MOT-12 / MOT-10).
// Аккаунты из сида: passwd@ — только для смены пароля (сид возвращает пароль
// на место), feedback@ — оплаченный feedback-тариф для гейта /feedback.

const signIn = async (page: Page, email: string, password: string) => {
  await page.goto('/en/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Sign In to My Dashboard' }).click();
};

test('password change: the old password dies, the new one works', async ({ page }) => {
  await signIn(page, 'passwd@motophd.com', 'passwd1234');
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // Неверный текущий пароль — здесь же, на выделенном аккаунте: Payload
  // ведёт сессии в базе, и неверные попытки на общем student@ инвалидируют
  // сессии параллельных тестов.
  await page.getByRole('button', { name: 'Profile' }).click();
  await page.locator('#current-password').fill('not-the-password');
  await page.locator('#new-password').fill('whatever123');
  await page.locator('#confirm-password').fill('whatever123');
  await page.getByRole('button', { name: 'Change Password' }).click();
  await expect(page.getByText('Current password is incorrect.')).toBeVisible();

  await page.locator('#current-password').fill('passwd1234');
  await page.locator('#new-password').fill('passwd5678x');
  await page.locator('#confirm-password').fill('passwd5678x');
  await page.getByRole('button', { name: 'Change Password' }).click();
  await expect(page.getByText('Password changed.')).toBeVisible();

  // Смена не разлогинила: кабинет всё ещё открыт.
  await page.reload();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/en$/);

  // Старый пароль мёртв.
  await signIn(page, 'passwd@motophd.com', 'passwd1234');
  await expect(page.getByText('Incorrect email or password')).toBeVisible();

  // Новый работает; возвращаем исходный, чтобы прогон был идемпотентным.
  await signIn(page, 'passwd@motophd.com', 'passwd5678x');
  await expect(page).toHaveURL(/\/en\/dashboard$/);
  await page.getByRole('button', { name: 'Profile' }).click();
  await page.locator('#current-password').fill('passwd5678x');
  await page.locator('#new-password').fill('passwd1234');
  await page.locator('#confirm-password').fill('passwd1234');
  await page.getByRole('button', { name: 'Change Password' }).click();
  await expect(page.getByText('Password changed.')).toBeVisible();
});

test('feedback page opens only for the feedback tier', async ({ page }) => {
  // Студент со standard-тарифом отлетает в кабинет.
  await signIn(page, 'student@motophd.com', 'student1234');
  await expect(page).toHaveURL(/\/en\/dashboard$/);
  await page.goto('/en/feedback');
  await expect(page).toHaveURL(/\/en\/dashboard$/);
});

test('feedback tier owner sees the purchase history and the instructions', async ({ page }) => {
  // Один логин feedback@ на весь сценарий: параллельные логины одного юзера
  // роняют друг другу сессии Payload, поэтому у каждого юзера — один тест.
  await signIn(page, 'feedback@motophd.com', 'feedback1234');
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  await page.getByRole('button', { name: 'Profile' }).click();
  await expect(page.getByText('Purchase History')).toBeVisible();
  await expect(page.getByText('Paid', { exact: true })).toBeVisible();

  await page.goto('/en/feedback');
  await expect(page.getByRole('heading', { name: 'Personal Feedback' })).toBeVisible();
  await expect(page.getByText('1 video review + 1 Zoom call (45 minutes)')).toBeVisible();
});

test('anonymous feedback visitors go through login first', async ({ page }) => {
  await page.goto('/en/feedback');

  await expect(page).toHaveURL(/\/en\/login\?/);
  expect(new URL(page.url()).searchParams.get('next')).toBe('/en/feedback');
});

test('forgot password answers neutrally for any email', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page).toHaveURL(/\/en\/login\/forgot$/);

  await page.locator('#forgot-email').fill('nobody@nowhere.example');
  await page.getByRole('button', { name: 'Send reset link' }).click();

  await expect(page.getByText('If the account exists, we sent a reset link.')).toBeVisible();
});

test('reset page rejects a garbage token', async ({ page }) => {
  await page.goto('/en/login/reset?token=garbage-token');
  await page.locator('#reset-password').fill('brand-new-pass1');
  await page.locator('#reset-confirm').fill('brand-new-pass1');
  await page.getByRole('button', { name: 'Save new password' }).click();

  await expect(page.getByText('The link is invalid or expired.')).toBeVisible();
});
