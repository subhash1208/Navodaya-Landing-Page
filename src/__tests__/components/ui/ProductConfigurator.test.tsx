import { describe, it, expect, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductConfigurator } from '@/components/ui/ProductConfigurator';
import type { ProductOptionAxis, ProductVariant } from '@/types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// File-scope, and it strips `fill` — jsdom would warn about a non-boolean attribute otherwise.
vi.mock('next/image', () => ({
  default: ({ fill, ...props }: any) => <img {...props} />,
}));

vi.mock('lucide-react', () => ({
  MessageSquare: (props: any) => <svg data-testid="message" {...props} />,
  RotateCcw: (props: any) => <svg data-testid="rotate-icon" {...props} />,
  ZoomIn: (props: any) => <svg data-testid="zoom-in-icon" {...props} />,
  ZoomOut: (props: any) => <svg data-testid="zoom-out-icon" {...props} />,
  Camera: (props: any) => <svg data-testid="camera-icon" {...props} />,
}));

/**
 * The real `mop-set` matrix, abbreviated: models with colours and models with none, in one
 * product. That mix is the case the whole feature turns on — the colour row has to appear and
 * disappear as the model changes rather than being decided once per product.
 */
const MOP_VARIANTS: ProductVariant[] = [
  { label: 'Red Handle — Screw Socket', model: 'Screw Socket', colour: 'Red' },
  { label: 'Blue Handle — Metal Band', model: 'Metal Band', colour: 'Blue' },
  { label: 'Blue Yarn — Screw Hub', model: 'Screw Hub', colour: 'Blue' },
  { label: 'Elephant', model: 'Elephant' },
  { label: 'Maroon Handle — Coarse Twist', model: 'Coarse Twist', colour: 'Maroon' },
  { label: 'Eagle', model: 'Eagle' },
];

/** The real `wheeled-dust-bin` shape, trimmed: two models, the second offered in fewer colours. */
const BIN_VARIANTS: ProductVariant[] = [
  { label: '120 L — Blue', model: '120 L', colour: 'Blue' },
  { label: '120 L — Green', model: '120 L', colour: 'Green' },
  { label: '120 L — Red', model: '120 L', colour: 'Red' },
  { label: '120 L — Yellow', model: '120 L', colour: 'Yellow' },
  { label: '240 L — Blue', model: '240 L', colour: 'Blue' },
  { label: '240 L — Green', model: '240 L', colour: 'Green' },
];

/** The real `broom` shape: seven models, not one of which names a colour. */
const BROOM_VARIANTS: ProductVariant[] = [
  { label: 'Blue Bell', model: 'Blue Bell' },
  { label: 'Soft Grass', model: 'Soft Grass' },
];

/**
 * The real `air-freshener-room-spray` matrix, verbatim: four variants sharing ONE model and
 * differing only by `fragrance`. This is the shape that regressed — `ProductVariant`'s contract
 * states the secondary axis as `colour ?? fragrance`, and an implementation that read `colour`
 * alone de-duplicated these four to a single dead chip, leaving three fragrances unreachable by
 * any input and dropping the fragrance out of the quote link entirely.
 */
const SPRAY_VARIANTS: ProductVariant[] = [
  { label: '220 ML — Citrus', model: '220 ML', fragrance: 'Citrus' },
  { label: '220 ML — Rose', model: '220 ML', fragrance: 'Rose' },
  { label: '220 ML — Bliss', model: '220 ML', fragrance: 'Bliss' },
  { label: '220 ML — Breeze', model: '220 ML', fragrance: 'Breeze' },
];

const AXES: ProductOptionAxis[] = [
  { name: 'Size', values: ['1 L', '5 L'] },
  { name: 'Fragrance', values: ['Rose', 'Jasmine', 'Lemon'] },
];

function renderConfigurator(props: Partial<React.ComponentProps<typeof ProductConfigurator>> = {}) {
  return render(
    <ProductConfigurator
      slug="mop-set"
      productName="Cotton Wet Mop"
      header={<h1>Cotton Wet Mop</h1>}
      secondaryAction={<a href="https://example.test/products">More in Category</a>}
      {...props}
    >
      <p>Pricing on Request</p>
    </ProductConfigurator>,
  );
}

const rowValues = (name: string) =>
  Array.from(screen.getByRole('radiogroup', { name }).querySelectorAll('button')).map(
    (b) => b.textContent,
  );
const checkedIn = (name: string) =>
  screen
    .getByRole('radiogroup', { name })
    .querySelector('[aria-checked="true"]')
    ?.textContent?.trim();
const photograph = () => document.querySelector('img');
const placeholderLabel = () =>
  document.querySelector('[role="img"][aria-label]')?.getAttribute('aria-label');
const quoteVariant = () =>
  new URL(
    screen.getByRole('link', { name: /request a quote/i }).getAttribute('href')!,
    'https://example.test',
  ).searchParams.get('variant');

describe('ProductConfigurator', () => {
  describe('default selection', () => {
    it('checks the first model and that model’s first colour on the very first render', () => {
      // Computed synchronously from props, never in an effect — an effect does not run on the
      // server, so a default resolved there would ship an unselected, image-less page.
      renderConfigurator({ variants: MOP_VARIANTS });
      expect(checkedIn('Model')).toBe('Screw Socket');
      expect(checkedIn('Colour')).toBe('Red');
    });

    it('checks axis 0’s and axis 1’s first values for an optionAxes product', () => {
      renderConfigurator({ optionAxes: AXES });
      expect(checkedIn('Size')).toBe('1 L');
      expect(checkedIn('Fragrance')).toBe('Rose');
    });
  });

  describe('the colour row is derived from the selected model', () => {
    it('offers every colour the first model has', () => {
      renderConfigurator({ variants: BIN_VARIANTS });
      expect(rowValues('Model')).toEqual(['120 L', '240 L']);
      expect(rowValues('Colour')).toEqual(['Blue', 'Green', 'Red', 'Yellow']);
    });

    it('narrows to the new model’s colours when the model changes', () => {
      renderConfigurator({ variants: BIN_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: '240 L' }));
      expect(rowValues('Colour')).toEqual(['Blue', 'Green']);
    });

    it('shows exactly one colour tab for a model with one colour', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Metal Band' }));
      expect(rowValues('Colour')).toEqual(['Blue']);
    });

    it('removes the colour row entirely for a model with no colours', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Elephant' }));
      expect(screen.queryByRole('radiogroup', { name: 'Colour' })).toBeNull();
      expect(screen.getAllByRole('radiogroup')).toHaveLength(1);
    });

    it('brings the colour row back when a colourful model is reselected', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Eagle' }));
      expect(screen.queryByRole('radiogroup', { name: 'Colour' })).toBeNull();
      fireEvent.click(screen.getByRole('radio', { name: 'Coarse Twist' }));
      expect(rowValues('Colour')).toEqual(['Maroon']);
    });

    it('renders no colour row at all for a product whose models never name a colour', () => {
      // `broom`'s 'Blue Bell' is a MODEL, not a colour.
      renderConfigurator({ variants: BROOM_VARIANTS });
      expect(screen.getAllByRole('radiogroup')).toHaveLength(1);
      expect(rowValues('Model')).toEqual(['Blue Bell', 'Soft Grass']);
    });

    it('de-duplicates models while keeping catalogue order', () => {
      renderConfigurator({ variants: BIN_VARIANTS });
      expect(rowValues('Model')).toEqual(['120 L', '240 L']);
    });

    it('keeps an optionAxes product’s second axis unnarrowed — the axes are independent', () => {
      renderConfigurator({ optionAxes: AXES });
      fireEvent.click(screen.getByRole('radio', { name: '5 L' }));
      expect(rowValues('Fragrance')).toEqual(['Rose', 'Jasmine', 'Lemon']);
    });
  });

  describe('the secondary row falls back to `fragrance` when no colour is named', () => {
    it('offers all four fragrances of a one-model, fragrance-only product', () => {
      renderConfigurator({ slug: 'air-freshener-room-spray', variants: SPRAY_VARIANTS });
      expect(rowValues('Model')).toEqual(['220 ML']);
      expect(rowValues('Fragrance')).toEqual(['Citrus', 'Rose', 'Bliss', 'Breeze']);
      expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
    });

    it('labels that row from the field that supplied it, never `Colour`', () => {
      renderConfigurator({ slug: 'air-freshener-room-spray', variants: SPRAY_VARIANTS });
      expect(screen.queryByRole('radiogroup', { name: 'Colour' })).toBeNull();
      expect(checkedIn('Fragrance')).toBe('Citrus');
    });

    it('keeps `Colour` as the row name whenever a colour IS named', () => {
      renderConfigurator({ variants: BIN_VARIANTS });
      expect(screen.queryByRole('radiogroup', { name: 'Fragrance' })).toBeNull();
      expect(rowValues('Colour')).toEqual(['Blue', 'Green', 'Red', 'Yellow']);
    });

    it('carries the selected fragrance into the quote link', () => {
      // Without this the enquiry reads "Option requested: 220 ML" and the business loses the
      // fragrance from every quote for this product.
      renderConfigurator({ slug: 'air-freshener-room-spray', variants: SPRAY_VARIANTS });
      expect(quoteVariant()).toBe('220 ML · Citrus');
      fireEvent.click(screen.getByRole('radio', { name: 'Rose' }));
      expect(quoteVariant()).toBe('220 ML · Rose');
    });

    it('renders the fragrance chips in swatch style, as the client asked', () => {
      renderConfigurator({ slug: 'air-freshener-room-spray', variants: SPRAY_VARIANTS });
      const row = screen.getByRole('radiogroup', { name: 'Fragrance' });
      expect(row.querySelectorAll('[data-swatch="true"]')).toHaveLength(4);
    });

    it('names the chosen fragrance in the placeholder panel', () => {
      renderConfigurator({ slug: 'air-freshener-room-spray', variants: SPRAY_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Breeze' }));
      expect(placeholderLabel()).toBe('Cotton Wet Mop, 220 ML, Breeze — photograph coming soon');
    });
  });

  describe('carrying the colour across a model change', () => {
    it('keeps the chosen colour when the new model is offered in it', () => {
      renderConfigurator({ variants: BIN_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Green' }));
      fireEvent.click(screen.getByRole('radio', { name: '240 L' }));
      expect(checkedIn('Colour')).toBe('Green');
    });

    it('falls back to the new model’s first colour when it is not', () => {
      renderConfigurator({ variants: BIN_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Yellow' }));
      fireEvent.click(screen.getByRole('radio', { name: '240 L' }));
      expect(checkedIn('Colour')).toBe('Blue');
    });

    it('drops the colour entirely when the new model has none', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Elephant' }));
      expect(quoteVariant()).toBe('Elephant');
    });
  });

  describe('image precedence', () => {
    it('shows the product photograph for the default selection', () => {
      renderConfigurator({ variants: BIN_VARIANTS, image: '/products/wheeled-dust-bin.webp' });
      expect(photograph()?.getAttribute('src')).toBe('/products/wheeled-dust-bin.webp');
      expect(placeholderLabel()).toBeUndefined();
    });

    it('swaps to the placeholder when only the COLOUR changes', () => {
      // The client's "for now even if we click a different color it needs to be change".
      renderConfigurator({ variants: BIN_VARIANTS, image: '/products/wheeled-dust-bin.webp' });
      fireEvent.click(screen.getByRole('radio', { name: 'Red' }));
      expect(photograph()).toBeNull();
      expect(placeholderLabel()).toContain('Red');
    });

    it('swaps to the placeholder when only the MODEL changes', () => {
      renderConfigurator({ variants: BIN_VARIANTS, image: '/products/wheeled-dust-bin.webp' });
      fireEvent.click(screen.getByRole('radio', { name: '240 L' }));
      expect(photograph()).toBeNull();
      expect(placeholderLabel()).toContain('240 L');
    });

    it('returns to the photograph when the default is reselected', () => {
      renderConfigurator({ variants: BIN_VARIANTS, image: '/products/wheeled-dust-bin.webp' });
      fireEvent.click(screen.getByRole('radio', { name: '240 L' }));
      fireEvent.click(screen.getByRole('radio', { name: '120 L' }));
      expect(photograph()?.getAttribute('src')).toBe('/products/wheeled-dust-bin.webp');
    });

    it('prefers a variant’s own photograph over everything else', () => {
      // Nothing in the catalogue populates `ProductVariant.image` yet; this is the infrastructure
      // the client asked for, so it is exercised against a fixture that does.
      const withVariantPhoto: ProductVariant[] = [
        ...BIN_VARIANTS.slice(0, 4),
        { label: '240 L — Blue', model: '240 L', colour: 'Blue', image: '/products/bin-240.webp' },
      ];
      renderConfigurator({ variants: withVariantPhoto, image: '/products/wheeled-dust-bin.webp' });
      fireEvent.click(screen.getByRole('radio', { name: '240 L' }));
      expect(photograph()?.getAttribute('src')).toBe('/products/bin-240.webp');
    });

    it('shows the placeholder for every selection when the product has no photograph', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      expect(photograph()).toBeNull();
      expect(placeholderLabel()).toContain('Screw Socket');
    });

    it('shows the photograph unconditionally for a product with no options', () => {
      renderConfigurator({ image: '/products/surgeon-cap.webp' });
      expect(screen.queryByRole('radiogroup')).toBeNull();
      expect(photograph()?.getAttribute('src')).toBe('/products/surgeon-cap.webp');
    });

    it('falls back to the legacy viewer panel for a product with neither options nor a photo', () => {
      renderConfigurator();
      expect(screen.getByText('360° View Coming Soon')).toBeTruthy();
    });
  });

  describe('placeholder panel', () => {
    it('names the product, the model and the colour', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      expect(placeholderLabel()).toBe('Cotton Wet Mop, Screw Socket, Red — photograph coming soon');
      // Scoped to the panel: the model and colour names also appear on the chips, so an unscoped
      // `getByText` matches twice and proves nothing about the panel.
      const panel = document.querySelector('[role="img"][aria-label]')!;
      expect(panel.textContent).toContain('Screw Socket');
      expect(panel.textContent).toContain('Red');
    });

    it('names only the model when the model has no colour', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: 'Eagle' }));
      expect(placeholderLabel()).toBe('Cotton Wet Mop, Eagle — photograph coming soon');
    });

    it('occupies the same aspect box as the photograph, so nothing reflows on selection', () => {
      const { container } = renderConfigurator({
        variants: BIN_VARIANTS,
        image: '/products/wheeled-dust-bin.webp',
      });
      expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeTruthy();
      fireEvent.click(screen.getByRole('radio', { name: 'Red' }));
      expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeTruthy();
      expect(container.querySelector('.aspect-square')).toBeNull();
    });

    it('reads as a deliberate placeholder rather than a broken image', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      expect(screen.getByText('Photograph Coming Soon')).toBeTruthy();
      expect(document.querySelector('.border-dashed')).toBeTruthy();
    });

    it('uses palette tokens that clear the 4.5:1 text floor', () => {
      // `grey-600` on `grey-100` is 6.71:1. `grey-400` would have been 3.28:1 — the exact mistake
      // this repo has already shipped once.
      renderConfigurator({ variants: MOP_VARIANTS });
      const panel = document.querySelector('[role="img"][aria-label]')!;
      expect(panel.className).toContain('bg-grey-100');
      expect(panel.innerHTML).toContain('text-grey-600');
      expect(panel.innerHTML).not.toContain('text-grey-400');
      expect(panel.innerHTML).not.toContain('amber');
    });
  });

  describe('the quote link', () => {
    it('carries the default combination before the visitor touches anything', () => {
      renderConfigurator({ variants: MOP_VARIANTS });
      expect(quoteVariant()).toBe('Screw Socket · Red');
    });

    it('follows the selection', () => {
      renderConfigurator({ variants: BIN_VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: '240 L' }));
      fireEvent.click(screen.getByRole('radio', { name: 'Green' }));
      expect(quoteVariant()).toBe('240 L · Green');
    });

    it('carries no variant at all for a product with no options', () => {
      renderConfigurator({ slug: 'surgeon-cap' });
      expect(screen.getByRole('link', { name: /request a quote/i }).getAttribute('href')).toBe(
        '/?product=surgeon-cap#contact',
      );
    });
  });

  describe('fragment shape — the column must never remount', () => {
    it('keeps the server-rendered children mounted across model and colour changes', () => {
      // A remount is invisible to any assertion that reads rendered text: the text is identical
      // before and after. Node identity, surviving uncontrolled state and a mount counter are the
      // only three things that catch it. This repo has already shipped the defect once, on the
      // homepage, where it silently erased anything typed into the contact form.
      const mounted = vi.fn();
      function Probe() {
        useEffect(() => {
          mounted();
        }, []);
        return <input data-testid="probe" defaultValue="" />;
      }

      render(
        <ProductConfigurator
          slug="mop-set"
          productName="Cotton Wet Mop"
          variants={MOP_VARIANTS}
          header={<h1>Cotton Wet Mop</h1>}
          secondaryAction={<a href="https://example.test/products">More in Category</a>}
        >
          <Probe />
        </ProductConfigurator>,
      );

      const before = screen.getByTestId('probe') as HTMLInputElement;
      before.value = 'typed while browsing models';

      // 'Elephant' removes the colour row; 'Coarse Twist' brings it back. Both are exactly the
      // transitions that would slide `children` onto a different index if the fragment collapsed.
      fireEvent.click(screen.getByRole('radio', { name: 'Elephant' }));
      fireEvent.click(screen.getByRole('radio', { name: 'Coarse Twist' }));
      fireEvent.click(screen.getByRole('radio', { name: 'Maroon' }));

      const after = screen.getByTestId('probe') as HTMLInputElement;
      expect(after).toBe(before);
      expect(after.value).toBe('typed while browsing models');
      expect(mounted).toHaveBeenCalledTimes(1);
    });
  });
});
