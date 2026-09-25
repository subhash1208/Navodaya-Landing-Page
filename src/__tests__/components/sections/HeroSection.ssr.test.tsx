import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import HeroSection from '@/components/sections/HeroSection';
import { IntroFinishedContext } from '@/hooks/useIntroFinished';

/**
 * Server-rendering regression tests for the hero.
 *
 * These deliberately do NOT mock `motion/react`. Every other spec in this directory replaces
 * it with a passthrough that strips `initial` and `animate`, which is correct for behavioural
 * tests but makes it structurally impossible to catch the bug these tests exist for: motion
 * serialises its `initial` prop into inline styles during SSR, so `initial={{ opacity: 0 }}`
 * ships real copy to the browser at `opacity: 0`. A mock that discards `initial` reports that
 * as fine.
 *
 * `renderToStaticMarkup` never runs effects, so it observes the true server branch — the one
 * jsdom tests can never reach, because Testing Library flushes effects before you can assert.
 *
 * The bug: `line2Visible` and `contentVisible` both started `false` and gated their content
 * behind `{visible && ...}`, and `useTypewriter` started at `''`. The server therefore emitted
 * an `<h1>` holding nothing but a blinking cursor span, no mission copy, and neither CTA link.
 * Gates 1-9 were all green while this shipped.
 */

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: Record<string, unknown>) => <img {...props} />,
}));

describe('HeroSection server rendering', () => {
  const html = renderToStaticMarkup(<HeroSection />);

  it('server-renders the full headline as real text', () => {
    expect(html).toContain('Premium Hygiene &amp; Care');
    expect(html).toContain('Solutions for Every Industry');
  });

  it('server-renders an h1 that is not text-empty', () => {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';
    expect(h1).not.toBe('');

    // Strip tags — a heading whose only content is a decorative cursor <span> reads as empty
    // to a crawler and to the accessibility tree, which is exactly what used to ship.
    const headingText = h1.replace(/<[^>]*>/g, '').trim();
    expect(headingText.length).toBeGreaterThan(0);
    expect(headingText).toContain('Premium Hygiene');
  });

  it('server-renders the mission copy', () => {
    expect(html).toContain('Navodaya');
  });

  it('server-renders both call-to-action links with real hrefs', () => {
    expect(html).toContain('Explore Products');
    expect(html).toContain('Get a Quote');
    expect(html).toMatch(/href="\/products"/);
    expect(html).toMatch(/href="\/#contact"/);
  });

  it('server-renders the specimen plate photograph with its alt text', () => {
    // `initial={false}` on the plate's motion.figure means the server emits the visible
    // state. The opacity assertion below is the general guard; this one proves the image
    // and its alt reach the HTML at all, which the old canvas graph never did — it was
    // `aria-hidden` and painted nothing until rAF ran.
    expect(html).toContain('/hero/cup-three-quarter.webp');
    expect(html).toContain('single-use paper cup');
    expect(html).toContain('Branded Paper Cup');
  });

  it('does not ship hero content at opacity:0', () => {
    // motion writes `initial` into the inline style attribute during SSR. With `initial={false}`
    // it renders at the `animate` value instead, which is the visible state on the server.
    // A match here means some element went back to `initial={{ opacity: 0 }}` and is now
    // invisible to anyone whose JS has not run — the badge did exactly that until 2026-09-18.
    const inlineStyles = html.match(/style="[^"]*"/g) ?? [];
    expect(inlineStyles.filter((s) => /opacity:\s*0[;"]/.test(s))).toEqual([]);
  });

  it('server-renders the full hero even while the intro gate is closed', () => {
    // `IntroFinishedContext` is false during SSR (LoadingScreen has not decided yet), and it
    // suppresses the client entrance animation. It must not suppress the server HTML: the
    // seeded "finished" state is what makes the page crawlable, and gating that on the
    // overlay would re-open the exact SSR hole these tests were written for.
    const gated = renderToStaticMarkup(
      <IntroFinishedContext.Provider value={false}>
        <HeroSection />
      </IntroFinishedContext.Provider>,
    );

    expect(gated).toContain('Premium Hygiene &amp; Care');
    expect(gated).toContain('Solutions for Every Industry');
    expect(gated).toMatch(/href="\/products"/);
    expect(gated).toMatch(/href="\/#contact"/);
    expect((gated.match(/style="[^"]*"/g) ?? []).filter((s) => /opacity:\s*0[;"]/.test(s))).toEqual(
      [],
    );
  });
});
