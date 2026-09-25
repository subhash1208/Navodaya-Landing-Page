import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

/**
 * Server-rendering regression guard for the wrapper that gates the whole homepage.
 *
 * `LoadingScreen` used to return ONLY an empty `aria-hidden` overlay while `show === null` —
 * the state during server render and the client's first pre-effect pass. The server-rendered
 * HTML for the entire site was therefore one empty div: no <h1>, no copy, no links.
 *
 * This lives in its own file rather than beside the behavioural specs because `vi.mock` is
 * file-scoped and hoisted: the behavioural file replaces `motion/react` with a passthrough
 * that strips `initial` and `animate`, and those are exactly the props that serialise into
 * inline `style` during server render. An SSR assertion made under that mock cannot observe
 * the defect it exists for. Only `next/image` is mocked here — it is the one thing that is
 * genuinely awkward to render outside a Next request.
 *
 * `renderToStaticMarkup` never runs effects, so it reaches the true server branch that jsdom
 * cannot: Testing Library flushes effects before you can assert.
 */

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

describe('LoadingScreen server rendering', () => {
  it('includes children in the server-rendered markup', () => {
    const html = renderToStaticMarkup(
      <LoadingScreen>
        <h1>Real content</h1>
      </LoadingScreen>,
    );

    expect(html).toContain('Real content');
    expect(html).toContain('<h1>');
  });

  it('never ships a content-hiding inline style on the server', () => {
    const html = renderToStaticMarkup(
      <LoadingScreen>
        <h1>Real content</h1>
        <a href="https://example.com/catalogue">Products</a>
      </LoadingScreen>,
    );

    // The undecided branch must reach no `motion` element at all, so nothing can serialise
    // an `initial` target into markup. `opacity:0` or a transform on the server is the exact
    // shape of the defect: real copy present in the DOM and invisible without JavaScript.
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('transform:');
    expect(html).toContain('href="https://example.com/catalogue"');
  });
});
