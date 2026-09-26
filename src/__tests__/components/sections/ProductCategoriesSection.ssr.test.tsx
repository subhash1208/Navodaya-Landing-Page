import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ProductCategoriesSection from '@/components/sections/ProductCategoriesSection';
import { PRODUCT_CATEGORIES, ROUTES } from '@/constants';

/**
 * Server-rendering regression test for the section that paid for `AnimateIn`'s SSR defect.
 *
 * `ProductCategoriesSection.tsx:94` and `:160` wrap the section heading, its description and the
 * "View Full Product Catalogue" CTA in `AnimateIn`. While that component passed
 * `initial={{ opacity: 0, … }}`, motion serialised it into inline styles during server render and
 * all three shipped invisible to crawlers and to no-JS visitors.
 *
 * `motion/react` is deliberately NOT mocked. The behavioural specs replace it with a passthrough
 * that strips `initial` and `animate` — the exact props that serialise — so a mocked version of
 * this file would report the defect as fixed while the server still shipped `opacity:0`.
 *
 * `renderToStaticMarkup` never runs effects, so the GSAP card reveal in this component's
 * `useEffect` never fires here. That is the point: it is what a crawler sees.
 */

// The only boundary that genuinely cannot render on a server as itself. `next/link` and
// `lucide-react` both emit plain markup and are left real.
vi.mock('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

const OPACITY_ZERO = /opacity:\s*0[;"]/;

function inlineStyles(html: string) {
  return html.match(/style="[^"]*"/g) ?? [];
}

describe('ProductCategoriesSection server rendering', () => {
  it('ships the section heading as real text', () => {
    const html = renderToStaticMarkup(<ProductCategoriesSection />);

    expect(html).toContain('Our Product Categories');
    expect(html).toContain('id="products-heading"');
  });

  it('ships the description copy', () => {
    const html = renderToStaticMarkup(<ProductCategoriesSection />);

    expect(html).toContain(
      'Three focused ranges covering every hygiene and care need across industries.',
    );
  });

  it('ships the catalogue CTA as a crawlable link', () => {
    const html = renderToStaticMarkup(<ProductCategoriesSection />);

    expect(html).toContain('View Full Product Catalogue');
    expect(html).toContain(`href="${ROUTES.PRODUCTS}"`);
  });

  it('ships every category card with its name and its own link', () => {
    const html = renderToStaticMarkup(<ProductCategoriesSection />);

    for (const category of PRODUCT_CATEGORIES) {
      // Category names carry an ampersand, which React escapes in the server markup.
      expect(html).toContain(category.name.replaceAll('&', '&amp;'));
      expect(html).toContain(`href="${ROUTES.PRODUCTS}?category=${category.slug}"`);
    }
  });

  it('renders nothing at opacity:0 and nothing offset off-position', () => {
    const html = renderToStaticMarkup(<ProductCategoriesSection />);

    expect(inlineStyles(html).filter((s) => OPACITY_ZERO.test(s))).toEqual([]);
    expect(html).not.toMatch(/translate[XY]\(-?[1-9]/);
  });
});
