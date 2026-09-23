import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
      // Visual regression runs on chromium only. The spec sets its own viewports via
      // test.use({ viewport }), so running it here adds engine variance (iPhone 14 is
      // WebKit) rather than mobile-layout coverage — and would require a second full
      // set of `-mobile-win32.png` baselines to maintain for no extra signal.
      testIgnore: '**/visual-regression.spec.ts',
    },
  ],
  webServer: {
    // pnpm, not npm — `npm install` in this repo would create a competing
    // package-lock.json and a flat node_modules, breaking pnpm's linked store.
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
