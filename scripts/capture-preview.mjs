// Throwaway client-preview capture. NOT a test — deliberately outside e2e/ so it
// never joins quality gate 7. Run with the production server already up on :3000.
//   pnpm exec node scripts/capture-preview.mjs
// Bare `playwright` is not a dependency here — only `@playwright/test`, which
// re-exports the same browser launchers.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://localhost:3000';
const OUT = 'design-preview';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const PAGES = [
  { slug: '01-home', path: '/' },
  { slug: '02-products', path: '/products' },
  { slug: '03-surgeon-cap', path: '/products/surgeon-cap' },
  { slug: '04-not-found', path: '/nonexistent-page-xyz' },
];

const only = process.argv.slice(2);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const page of PAGES) {
    const file = `${OUT}/${page.slug}-${vp.name}.png`;
    if (only.length && !only.some((a) => file.includes(a))) continue;

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const tab = await context.newPage();
    await tab.goto(BASE + page.path, { waitUntil: 'networkidle', timeout: 60000 });

    // LoadingScreen holds an intro overlay for ~4s on first visit in a session.
    await tab.waitForTimeout(6000);

    // Below-fold sections are dynamic() imports and reveal via ScrollTrigger /
    // whileInView, all `once: true`. Walk the page so they mount and play out,
    // then return to the top — the reveals stay revealed.
    await tab.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      const pause = (ms) => new Promise((r) => setTimeout(r, ms));
      let y = 0;
      for (let i = 0; i < 60; i++) {
        y += step;
        window.scrollTo(0, y);
        await pause(450);
        if (y >= document.body.scrollHeight) break;
      }
      window.scrollTo(0, document.body.scrollHeight);
      await pause(1500);
      window.scrollTo(0, 0);
      await pause(2000);
    });

    await tab.waitForTimeout(1500);
    await tab.screenshot({ path: file, fullPage: true });
    console.log(`captured ${file}`);
    await context.close();
  }
}

await browser.close();
console.log('done');
