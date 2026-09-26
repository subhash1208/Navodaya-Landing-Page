import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimateIn, Stagger, StaggerItem } from '@/components/ui/AnimateIn';

/**
 * Server-rendering regression tests for the scroll-reveal wrapper.
 *
 * These deliberately do NOT mock `motion/react`. `AnimateIn.test.tsx` replaces it with a
 * passthrough that strips `initial` and `animate`, which is right for behaviour and fatal
 * here: motion serialises those props into inline styles during server render, so a mock that
 * discards them reports `initial={{ opacity: 0 }}` as fine while the server ships
 * `style="opacity:0"` over real copy.
 *
 * `renderToStaticMarkup` never runs effects, so it observes the true server branch — the one
 * jsdom can never reach, because Testing Library flushes effects before you can assert.
 *
 * The bug: `AnimateIn` passed `initial={{ opacity: 0, x, y }}`, and
 * `ProductCategoriesSection.tsx:94` and `:160` wrap that section's heading, description and
 * "Browse all products" CTA in it. All three were invisible to a crawler and to a no-JS
 * visitor. Gates 1-9 were all green.
 */

const OPACITY_ZERO = /opacity:\s*0[;"]/;

function inlineStyles(html: string) {
  return html.match(/style="[^"]*"/g) ?? [];
}

describe('AnimateIn server rendering', () => {
  it('server-renders its children as real text', () => {
    const html = renderToStaticMarkup(
      <AnimateIn>
        <h2>Our Product Range</h2>
        <p>Browse the catalogue.</p>
        <a href="#products">Browse all products</a>
      </AnimateIn>,
    );

    expect(html).toContain('Our Product Range');
    expect(html).toContain('Browse the catalogue.');
    expect(html).toMatch(/href="#products"/);
  });

  it('does not ship content at opacity:0', () => {
    const html = renderToStaticMarkup(
      <AnimateIn>
        <span>Visible to crawlers</span>
      </AnimateIn>,
    );

    expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
  });

  it('does not ship an offset transform for any direction', () => {
    // `initial={{ x: 40 }}` serialises to `translateX(40px)` the same way opacity does, which
    // pushes server-rendered copy out of position for a no-JS visitor.
    for (const direction of ['up', 'down', 'left', 'right', 'none'] as const) {
      const html = renderToStaticMarkup(
        <AnimateIn direction={direction}>
          <span>{direction}</span>
        </AnimateIn>,
      );

      expect(html).toContain(`<span>${direction}</span>`);
      expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
      expect(html).not.toMatch(/translate[XY]\(-?[1-9]/);
    }
  });

  it('keeps the caller-supplied className and style on the server element', () => {
    const html = renderToStaticMarkup(
      <AnimateIn className="mb-12" style={{ maxWidth: '40rem' }}>
        <span>Styled</span>
      </AnimateIn>,
    );

    expect(html).toContain('mb-12');
    expect(html).toContain('max-width:40rem');
    expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
  });

  it('a delay does not gate the server-rendered content', () => {
    const html = renderToStaticMarkup(
      <AnimateIn delay={0.4}>
        <span>Delayed but present</span>
      </AnimateIn>,
    );

    expect(html).toContain('Delayed but present');
    expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
  });
});

/**
 * Same defect class, second occurrence. `Stagger` passed `initial="hidden"`, which motion
 * resolves against each `StaggerItem`'s own variants — `{ opacity: 0, y: 32 }` — and writes into
 * that child's inline style during server render. Every staggered item shipped
 * `style="opacity:0;transform:translateY(32px)"`.
 *
 * The child carries no `initial`/`animate` of its own by design: motion's variant context
 * propagates the parent's down to it (`framer-motion/.../use-visual-state.mjs`, `makeLatestValues`
 * — a variant node with `initial === undefined` inherits `context.initial`). So the parent's
 * `initial={false}` is what makes the child seed from the *visible* label instead of the hidden
 * one, and a regression in the parent alone would re-hide every child.
 */
describe('Stagger server rendering', () => {
  it('server-renders each staggered child as real text', () => {
    const html = renderToStaticMarkup(
      <Stagger>
        <StaggerItem>
          <h3>Hygiene & Safety</h3>
        </StaggerItem>
        <StaggerItem>
          <p>Non-woven fabrics and protective wear.</p>
        </StaggerItem>
        <StaggerItem>
          <a href="#products">Browse all products</a>
        </StaggerItem>
      </Stagger>,
    );

    expect(html).toContain('Hygiene &amp; Safety');
    expect(html).toContain('Non-woven fabrics and protective wear.');
    expect(html).toMatch(/href="#products"/);
  });

  it('does not ship any staggered child at opacity:0', () => {
    const html = renderToStaticMarkup(
      <Stagger staggerDelay={0.2}>
        <StaggerItem>
          <span>First</span>
        </StaggerItem>
        <StaggerItem>
          <span>Second</span>
        </StaggerItem>
      </Stagger>,
    );

    expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
  });

  it('does not ship the staggered offset transform', () => {
    // `{ y: 32 }` serialises to `translateY(32px)`, which pushes server-rendered copy out of
    // position for a no-JS visitor exactly the way opacity hides it.
    const html = renderToStaticMarkup(
      <Stagger>
        <StaggerItem>
          <span>Offset me</span>
        </StaggerItem>
      </Stagger>,
    );

    expect(html).toContain('<span>Offset me</span>');
    expect(html).not.toMatch(/translate[XY]\(-?[1-9]/);
  });

  it('keeps the caller-supplied className and style on both server elements', () => {
    const html = renderToStaticMarkup(
      <Stagger className="grid gap-6" style={{ maxWidth: '60rem' }}>
        <StaggerItem className="card" style={{ padding: '2rem' }}>
          <span>Styled</span>
        </StaggerItem>
      </Stagger>,
    );

    expect(html).toContain('grid gap-6');
    expect(html).toContain('max-width:60rem');
    expect(html).toContain('class="card"');
    expect(html).toContain('padding:2rem');
    expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
  });

  it('renders a StaggerItem used outside a Stagger as visible text', () => {
    const html = renderToStaticMarkup(
      <StaggerItem>
        <span>Orphan item</span>
      </StaggerItem>,
    );

    expect(html).toContain('Orphan item');
    expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
  });
});
