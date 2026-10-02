import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductConfigurator } from '@/components/ui/ProductConfigurator';
import { PRODUCTS, productSummary } from '@/constants';

// Only `next/image` is mocked, and only because it reaches for the Next image loader config that
// does not exist outside a Next runtime. Nothing else is stubbed: the point of this file is to
// assert what the SERVER emits, so stubbing the subject would defeat it entirely.
vi.mock('next/image', () => ({
  default: ({ fill, fetchPriority, ...props }: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const MOP = PRODUCTS.find((p) => p.slug === 'mop-set')!;

/**
 * Gate 10, as a unit test.
 *
 * `ProductConfigurator` is a client component that wraps the whole top half of a product page —
 * exactly the shape that shipped an empty homepage to crawlers once before. jsdom renders it AFTER
 * effects, so a `useEffect`-resolved default would look fine in every other spec in this repo and
 * still send a crawler a page with no heading, no copy, no links and no image.
 *
 * `renderToStaticMarkup` is the server pass with no effects and no hydration. What is asserted
 * below is literally the bytes a crawler receives.
 */
describe('ProductConfigurator — server-rendered HTML', () => {
  const html = renderToStaticMarkup(
    <ProductConfigurator
      slug={MOP.slug}
      productName={MOP.name}
      image={MOP.image}
      variants={MOP.variants}
      optionAxes={MOP.optionAxes}
      header={
        <>
          <h1>{MOP.name}</h1>
          <p>{productSummary(MOP)}</p>
        </>
      }
      // Absolute and external on purpose: `@next/next/no-html-link-for-pages` lints TEST files
      // too, and an internal-looking `href` in a fixture fails gate 2.
      secondaryAction={
        <a href="https://example.test/products?category=cleaning-tools">More in Category</a>
      }
    >
      <dl>
        <dt>Category</dt>
        <dd>{MOP.category.name}</dd>
      </dl>
    </ProductConfigurator>,
  );

  it('contains the page heading', () => {
    expect(html).toContain(`<h1>${MOP.name}</h1>`);
  });

  it('contains the body copy', () => {
    expect(html).toContain(productSummary(MOP));
  });

  it('contains both links — the quote CTA and the category link', () => {
    expect(html).toContain(`href="/?product=${MOP.slug}`);
    expect(html).toContain('href="https://example.test/products?category=cleaning-tools"');
    expect(html).toContain('More in Category');
  });

  it('contains the server-rendered children', () => {
    expect(html).toContain('<dt>Category</dt>');
  });

  it('resolves the default selection during the server pass, not in an effect', () => {
    // The first model and its first colour are already CHECKED in the emitted HTML. If the default
    // were resolved in a `useEffect`, every chip here would read `aria-checked="false"`.
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('Screw Socket');
    expect(html).toContain('>Red<');
  });

  it('emits the product photograph, not the placeholder, for that default selection', () => {
    expect(html).toContain(MOP.image!);
    expect(html).not.toContain('photograph coming soon');
  });

  it('emits both option rows with their accessible names', () => {
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('>Model<');
    expect(html).toContain('>Colour<');
  });

  it('emits no inline opacity:0 anywhere — content must be visible before hydration', () => {
    // `motion` serialises an `initial` prop into inline styles during server render. Nothing here
    // uses `motion`, and this assertion is what keeps it that way.
    expect(html).not.toContain('opacity:0');
  });
});
