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
      //
      // mobile-nav.spec.ts is excluded for the same reason in a different key: it
      // drives Tab-key focus containment, and WebKit gates Tab focus on links behind a
      // platform "full keyboard access" preference that Playwright does not set. The
      // spec pins its own 390x844 viewport via test.use({ viewport }), so it already
      // exercises the mobile layout under chromium where the keyboard model is stable.
      testIgnore: ['**/visual-regression.spec.ts', '**/mobile-nav.spec.ts'],
    },
  ],
  webServer: {
    // pnpm, not npm — `npm install` in this repo would create a competing
    // package-lock.json and a flat node_modules, breaking pnpm's linked store.
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    // Positive "this is not a deployed environment" marker for the contact action's
    // fail-closed discriminator (src/app/actions/contact.ts). `next start` runs with
    // NODE_ENV=production, so without this the sentinel RESEND_API_KEY would — correctly —
    // be refused as a misconfiguration and the contact-form happy path would fail.
    //
    // This MERGES rather than replaces: Playwright spreads `webServer.env` on top of the
    // full parent `process.env` (playwright 1.60.0,
    // node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/lib/runner/index.js:831-836
    // — `{ ...DEFAULT_ENVIRONMENT_VARIABLES, ...process.env, ...this._options.env }`), so
    // nothing `next start` needs is lost. Values must be strings.
    env: { E2E: '1' },
  },
});
