# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: consent.spec.ts >> analytics scripts load only after accepting cookies
- Location: e2e/consent.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Your privacy matters' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Your privacy matters' })

```

```yaml
- 'heading "Application error: a server-side exception has occurred while loading 127.0.0.1 (see the server logs for more information)." [level=2]'
- paragraph: "Digest: 2265899145"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('analytics scripts load only after accepting cookies', async ({ context, page }) => {
  4  |   await context.clearCookies();
  5  |   await page.goto('/en');
  6  | 
> 7  |   await expect(page.getByRole('dialog', { name: 'Your privacy matters' })).toBeVisible();
     |                                                                            ^ Error: expect(locator).toBeVisible() failed
  8  |   await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  9  |   await expect(page.locator('script#meta-pixel-loader')).toHaveCount(0);
  10 | 
  11 |   await page.getByRole('button', { name: 'Accept all' }).click();
  12 | 
  13 |   await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(1);
  14 |   await expect(page.locator('script#meta-pixel-loader')).toContainText('connect.facebook');
  15 | });
  16 | 
```