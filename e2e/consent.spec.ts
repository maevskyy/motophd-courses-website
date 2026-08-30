import { expect, test } from '@playwright/test';

test('analytics scripts load only after accepting cookies', async ({ context, page }) => {
  await context.clearCookies();
  await page.goto('/en');

  await expect(page.getByRole('dialog', { name: 'Your privacy matters' })).toBeVisible();
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  await expect(page.locator('script#meta-pixel-loader')).toHaveCount(0);

  await page.getByRole('button', { name: 'Accept all' }).click();

  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(1);
  await expect(page.locator('script#meta-pixel-loader')).toContainText('connect.facebook');
});
