import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { ProductOptions } from '@/components/ui/ProductOptions';
import type { ProductOptionAxis, ProductVariant } from '@/types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  MessageSquare: (props: any) => <svg data-testid="message" {...props} />,
}));

const VARIANTS: ProductVariant[] = [
  { label: 'Red Handle — Screw Socket' },
  { label: 'Blue Handle — Screw Socket' },
  { label: 'Green Handle — Clip Socket' },
];

const AXES: ProductOptionAxis[] = [
  { name: 'Size', values: ['500 ML', '5 L'] },
  { name: 'Fragrance', values: ['Lavender', 'Citrus', 'Rose'] },
];

function renderOptions(props: Partial<ComponentProps<typeof ProductOptions>> = {}) {
  return render(
    <ProductOptions
      slug="test-product"
      secondaryAction={<a href="https://example.test/products">More in Category</a>}
      {...props}
    >
      <p>Pricing on Request</p>
    </ProductOptions>,
  );
}

const quoteLink = () => screen.getByRole('link', { name: /request a quote/i });
const quoteHref = () => quoteLink().getAttribute('href')!;
/** Decoded rather than string-matched, so the assertion is about the value, not the encoding. */
const quoteVariant = () => new URL(quoteHref(), 'https://example.test').searchParams.get('variant');

describe('ProductOptions', () => {
  describe('rendering the two catalogue shapes', () => {
    it('renders a single "Model" row for the variants shape', () => {
      renderOptions({ variants: VARIANTS });
      const groups = screen.getAllByRole('radiogroup');
      expect(groups).toHaveLength(1);
      expect(groups[0].getAttribute('aria-label')).toBeNull();
      expect(screen.getByRole('radiogroup', { name: 'Model' })).toBeTruthy();
      expect(screen.getAllByRole('radio')).toHaveLength(VARIANTS.length);
      VARIANTS.forEach((v) => expect(screen.getByRole('radio', { name: v.label })).toBeTruthy());
    });

    it('renders one row per axis for the optionAxes shape', () => {
      renderOptions({ optionAxes: AXES });
      expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
      expect(screen.getByRole('radiogroup', { name: 'Size' })).toBeTruthy();
      expect(screen.getByRole('radiogroup', { name: 'Fragrance' })).toBeTruthy();
      expect(screen.getAllByRole('radio')).toHaveLength(5);
    });

    it('prefers optionAxes when both shapes are somehow present', () => {
      // The catalogue guarantees a product carries one or the other, never both. Pinned anyway so
      // the resolution is a decision rather than an accident of ordering.
      renderOptions({ variants: VARIANTS, optionAxes: AXES });
      expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
      expect(screen.queryByRole('radiogroup', { name: 'Model' })).toBeNull();
    });

    it('renders no option rows at all when the product has neither', () => {
      renderOptions();
      expect(screen.queryByRole('radiogroup')).toBeNull();
      expect(screen.queryByText('Available Options')).toBeNull();
      // The children and both CTAs still render — the boundary wraps them regardless.
      expect(screen.getByText('Pricing on Request')).toBeTruthy();
      expect(quoteLink()).toBeTruthy();
      expect(screen.getByRole('link', { name: 'More in Category' })).toBeTruthy();
    });

    it('renders an empty variants array as no options', () => {
      renderOptions({ variants: [] });
      expect(screen.queryByRole('radiogroup')).toBeNull();
    });

    it('renders an empty optionAxes array as no options', () => {
      renderOptions({ optionAxes: [] });
      expect(screen.queryByRole('radiogroup')).toBeNull();
    });

    it('renders a single-variant product as one chip', () => {
      renderOptions({ variants: [{ label: 'One Size' }] });
      expect(screen.getAllByRole('radio')).toHaveLength(1);
    });
  });

  describe('selection', () => {
    it('starts with nothing selected', () => {
      renderOptions({ optionAxes: AXES });
      screen
        .getAllByRole('radio')
        .forEach((radio) => expect(radio.getAttribute('aria-checked')).toBe('false'));
    });

    it('checks the clicked chip and shows the chosen value beside the axis name', () => {
      renderOptions({ optionAxes: AXES });
      const chip = screen.getByRole('radio', { name: '5 L' });
      fireEvent.click(chip);
      expect(chip.getAttribute('aria-checked')).toBe('true');
      // The dark ground the checked chip paints needs the cursor-inversion marker.
      expect(chip.getAttribute('data-cursor-invert')).toBe('true');
      // Feedback beside the label, outside the element the group is named by.
      const size = screen.getByRole('radiogroup', { name: 'Size' });
      expect(size.previousElementSibling?.textContent).toBe('Size5 L');
    });

    it('deselects the previous chip when a second one in the same row is clicked', () => {
      renderOptions({ variants: VARIANTS });
      const first = screen.getByRole('radio', { name: VARIANTS[0].label });
      const second = screen.getByRole('radio', { name: VARIANTS[1].label });
      fireEvent.click(first);
      fireEvent.click(second);
      expect(first.getAttribute('aria-checked')).toBe('false');
      expect(second.getAttribute('aria-checked')).toBe('true');
      expect(first.getAttribute('data-cursor-invert')).toBeNull();
    });

    it('keeps the two axes independent', () => {
      renderOptions({ optionAxes: AXES });
      fireEvent.click(screen.getByRole('radio', { name: '500 ML' }));
      fireEvent.click(screen.getByRole('radio', { name: 'Citrus' }));
      expect(screen.getByRole('radio', { name: '500 ML' }).getAttribute('aria-checked')).toBe(
        'true',
      );
      expect(screen.getByRole('radio', { name: 'Citrus' }).getAttribute('aria-checked')).toBe(
        'true',
      );
    });
  });

  describe('roving tabindex and keyboard interaction', () => {
    it('puts the single tab stop on the first chip while the row is unchecked', () => {
      renderOptions({ variants: VARIANTS });
      const tabbable = screen
        .getAllByRole('radio')
        .filter((r) => r.getAttribute('tabindex') === '0');
      expect(tabbable).toHaveLength(1);
      expect(tabbable[0].textContent).toBe(VARIANTS[0].label);
    });

    it('moves the tab stop onto the checked chip', () => {
      renderOptions({ variants: VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: VARIANTS[2].label }));
      const tabbable = screen
        .getAllByRole('radio')
        .filter((r) => r.getAttribute('tabindex') === '0');
      expect(tabbable).toHaveLength(1);
      expect(tabbable[0].textContent).toBe(VARIANTS[2].label);
    });

    it.each([
      ['ArrowRight', 0, 1],
      ['ArrowDown', 0, 1],
      ['ArrowLeft', 0, 2],
      ['ArrowRight', 2, 0],
      ['ArrowDown', 2, 0],
      ['ArrowUp', 1, 0],
      ['Home', 2, 0],
      ['End', 0, 2],
    ])('%s moves focus from chip %i to chip %i and checks it', (key, from, to) => {
      renderOptions({ variants: VARIANTS });
      const radios = screen.getAllByRole('radio');
      fireEvent.keyDown(radios[from], { key });
      expect(document.activeElement).toBe(radios[to]);
      expect(radios[to].getAttribute('aria-checked')).toBe('true');
    });

    it('ignores keys the pattern does not define', () => {
      renderOptions({ variants: VARIANTS });
      const radios = screen.getAllByRole('radio');
      fireEvent.keyDown(radios[0], { key: 'a' });
      radios.forEach((r) => expect(r.getAttribute('aria-checked')).toBe('false'));
    });

    it('keeps arrow navigation inside the row it started in', () => {
      renderOptions({ optionAxes: AXES });
      const fragrance = screen.getByRole('radiogroup', { name: 'Fragrance' });
      const chips = Array.from(fragrance.querySelectorAll('button'));
      fireEvent.keyDown(chips[0], { key: 'End' });
      expect(document.activeElement).toBe(chips[2]);
      screen
        .getByRole('radiogroup', { name: 'Size' })
        .querySelectorAll('button')
        .forEach((c) => expect(c.getAttribute('aria-checked')).toBe('false'));
    });
  });

  describe('quote link', () => {
    it('is byte-identical to the pre-selector link when nothing is chosen', () => {
      renderOptions({ optionAxes: AXES });
      expect(quoteHref()).toBe('/?product=test-product#contact');
    });

    it('carries the variant label for the variants shape', () => {
      renderOptions({ variants: VARIANTS });
      fireEvent.click(screen.getByRole('radio', { name: VARIANTS[0].label }));
      expect(quoteVariant()).toBe('Red Handle — Screw Socket');
      expect(quoteHref()).toContain('product=test-product');
      expect(quoteHref().endsWith('#contact')).toBe(true);
    });

    it('joins the chosen axis values', () => {
      renderOptions({ optionAxes: AXES });
      fireEvent.click(screen.getByRole('radio', { name: '500 ML' }));
      fireEvent.click(screen.getByRole('radio', { name: 'Lavender' }));
      expect(quoteVariant()).toBe('500 ML · Lavender');
    });

    it('includes only the axes the visitor actually chose', () => {
      renderOptions({ optionAxes: AXES });
      fireEvent.click(screen.getByRole('radio', { name: 'Rose' }));
      expect(quoteVariant()).toBe('Rose');
    });

    it('reflects a changed selection rather than appending to it', () => {
      renderOptions({ optionAxes: AXES });
      fireEvent.click(screen.getByRole('radio', { name: '5 L' }));
      fireEvent.click(screen.getByRole('radio', { name: '500 ML' }));
      expect(quoteVariant()).toBe('500 ML');
    });
  });
});
