import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100';
const analyticsTestEnvironment = {
  ...process.env,
  NEXT_PUBLIC_GA4_ID: 'G-TEST123',
  NEXT_PUBLIC_META_PIXEL_ID: '123456789'
};

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  retries: process.env.CI ? 1 : 0,
  testDir: './e2e',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm start -p 3100',
        env: analyticsTestEnvironment,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: `${baseURL}/api/health`
      }
});
