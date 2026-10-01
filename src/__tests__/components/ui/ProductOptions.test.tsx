import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { ProductOptions } from '@/components/ui/ProductOptions';

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

const MODELS = ['Screw Socket', 'Metal Band', 'Elephant'];
const COLOURS = ['Red', 'Blue', 'Maroon'];

/**
 * `ProductOptions` is CONTROLLED — `ProductConfigurator` owns the state. These specs therefore
 * assert what the component paints for a given selection and what it reports back through
 * `onSelect`; the state transitions those callbacks drive are covered end to end against the real
 * component pair in `ProductConfigurator.test.tsx`.
 */
function renderOptions(props: Partial<ComponentProps<typeof ProductOptions>> = {}) {
  const onSelect = vi.fn();
  const result = render(
    <ProductOptions
      slug="test-product"
      modelRow={{ name: 'Model', values: MODELS }}
      colourRow={{ name: 'Colour', values: COLOURS }}
      selection={{ model: MODELS[0], colour: COLOURS[0] }}
      onSelect={onSelect}
      secondaryAction={<a href="https://example.test/products">More in Category</a>}
      {...props}
    >
      <p>Pricing on Request</p>
    </ProductOptions>,
  );
  return { ...result, onSelect };
}

const quoteLink = () => screen.getByRole('link', { name: /request a quote/i });
const quoteHref = () => quoteLink().getAttribute('href')!;
/** Decoded rather than string-matched, so the assertion is about the value, not the encoding. */
const quoteVariant = () => new URL(quoteHref(), 'https://example.test').searchParams.get('variant');

describe('ProductOptions', () => {
  describe('the two rows', () => {
    it('renders the model row and the colour row, in that order', () => {
      renderOptions();
      const groups = screen.getAllByRole('radiogroup');
      expect(groups).toHaveLength(2);
      expect(groups[0]).toBe(screen.getByRole('radiogroup', { name: 'Model' }));
      expect(groups[1]).toBe(screen.getByRole('radiogroup', { name: 'Colour' }));
      expect(screen.getAllByRole('radio')).toHaveLength(MODELS.length + COLOURS.length);
    });

    it('renders no colour row at all when the selected model has no colours', () => {
      renderOptions({
        colourRow: { name: 'Colour', values: [] },
        selection: { model: 'Elephant' },
      });
      expect(screen.getAllByRole('radiogroup')).toHaveLength(1);
      expect(screen.queryByRole('radiogroup', { name: 'Colour' })).toBeNull();
    });

    it('renders exactly one colour tab when the model offers one colour', () => {
      // The client asked for this explicitly — a single-option row is shown, not hidden.
      renderOptions({
        colourRow: { name: 'Colour', values: ['Blue'] },
        selection: { model: 'Metal Band', colour: 'Blue' },
      });
      const colours = screen.getByRole('radiogroup', { name: 'Colour' });
      expect(colours.querySelectorAll('button')).toHaveLength(1);
    });

    it('uses the axes own names for an optionAxes product', () => {
      renderOptions({
        modelRow: { name: 'Size', values: ['1 L', '5 L'] },
        colourRow: { name: 'Fragrance', values: ['Rose', 'Lemon'] },
        selection: { model: '1 L', colour: 'Rose' },
      });
      expect(screen.getByRole('radiogroup', { name: 'Size' })).toBeTruthy();
      expect(screen.getByRole('radiogroup', { name: 'Fragrance' })).toBeTruthy();
      expect(screen.queryByRole('radiogroup', { name: 'Model' })).toBeNull();
    });

    it('renders no option block when the product has neither axis', () => {
      renderOptions({
        modelRow: { name: 'Model', values: [] },
        colourRow: { name: 'Colour', values: [] },
        selection: { model: '' },
      });
      expect(screen.queryByRole('radiogroup')).toBeNull();
      expect(screen.queryByText('Available Options')).toBeNull();
      // The children and both CTAs still render — the boundary wraps them regardless.
      expect(screen.getByText('Pricing on Request')).toBeTruthy();
      expect(quoteLink()).toBeTruthy();
      expect(screen.getByRole('link', { name: 'More in Category' })).toBeTruthy();
    });

    it('names the current selection beside the row heading', () => {
      renderOptions();
      const colours = screen.getByRole('radiogroup', { name: 'Colour' });
      expect(colours.previousElementSibling?.textContent).toBe('Colour:Red');
    });

    it('omits the colon when the row carries no selection', () => {
      renderOptions({ selection: { model: MODELS[0], colour: undefined } });
      const colours = screen.getByRole('radiogroup', { name: 'Colour' });
      expect(colours.previousElementSibling?.textContent).toBe('Colour');
    });
  });

  describe('swatch styling', () => {
    it('marks every colour chip with a swatch and no model chip with one', () => {
      renderOptions();
      const colours = screen.getByRole('radiogroup', { name: 'Colour' });
      const models = screen.getByRole('radiogroup', { name: 'Model' });
      expect(colours.querySelectorAll('[data-swatch]')).toHaveLength(COLOURS.length);
      expect(models.querySelectorAll('[data-swatch]')).toHaveLength(0);
    });

    it('gives the fragrance row of an optionAxes product the same swatch tabs', () => {
      // The client overruled the recommendation to leave these as plain chips.
      renderOptions({
        modelRow: { name: 'Size', values: ['1 L'] },
        colourRow: { name: 'Fragrance', values: ['Rose', 'Lemon'] },
        selection: { model: '1 L', colour: 'Rose' },
      });
      expect(
        screen.getByRole('radiogroup', { name: 'Fragrance' }).querySelectorAll('[data-swatch]'),
      ).toHaveLength(2);
    });

    it('hides the swatch from assistive technology — it names nothing the chip does not', () => {
      renderOptions();
      const swatch = screen
        .getByRole('radiogroup', { name: 'Colour' })
        .querySelector('[data-swatch]');
      expect(swatch?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('selected-state paint', () => {
    it('paints the checked chip brand blue rather than ink', () => {
      // Both this component and ProductGrid moved onto brand blue in the same pass so the site has
      // one selected-state language. `paper` on `brand.blue` is 7.15:1.
      const chip = renderOptions().container.querySelector('[role="radio"]')!;
      expect(chip.className).toContain('aria-checked:bg-brand-blue');
      expect(chip.className).toContain('aria-checked:text-paper');
      expect(chip.className).not.toContain('aria-checked:bg-ink');
    });

    it('marks the checked chip for cursor inversion and leaves the others alone', () => {
      renderOptions();
      expect(
        screen.getByRole('radio', { name: MODELS[0] }).getAttribute('data-cursor-invert'),
      ).toBe('true');
      expect(
        screen.getByRole('radio', { name: MODELS[1] }).getAttribute('data-cursor-invert'),
      ).toBeNull();
    });

    it('checks exactly the selected chip in each row', () => {
      renderOptions({ selection: { model: MODELS[1], colour: COLOURS[2] } });
      const checked = screen
        .getAllByRole('radio')
        .filter((r) => r.getAttribute('aria-checked') === 'true')
        .map((r) => r.textContent);
      expect(checked).toEqual([MODELS[1], COLOURS[2]]);
    });

    it('respects prefers-reduced-motion declaratively on every chip', () => {
      renderOptions();
      screen
        .getAllByRole('radio')
        .forEach((chip) => expect(chip.className).toContain('motion-reduce:transition-none'));
    });

    it('lifts every chip to a 44px hit area', () => {
      renderOptions();
      screen
        .getAllByRole('radio')
        .forEach((chip) => expect(chip.className).toContain('before:inset-y-[-5px]'));
    });
  });

  describe('reporting selection', () => {
    it('reports a model click on the model axis', () => {
      const { onSelect } = renderOptions();
      fireEvent.click(screen.getByRole('radio', { name: MODELS[2] }));
      expect(onSelect).toHaveBeenCalledWith('model', MODELS[2]);
    });

    it('reports a colour click on the colour axis', () => {
      const { onSelect } = renderOptions();
      fireEvent.click(screen.getByRole('radio', { name: COLOURS[1] }));
      expect(onSelect).toHaveBeenCalledWith('colour', COLOURS[1]);
    });
  });

  describe('roving tabindex and keyboard interaction', () => {
    it('puts one tab stop per row, on the checked chip', () => {
      renderOptions({ selection: { model: MODELS[2], colour: COLOURS[1] } });
      const tabbable = screen
        .getAllByRole('radio')
        .filter((r) => r.getAttribute('tabindex') === '0')
        .map((r) => r.textContent);
      expect(tabbable).toEqual([MODELS[2], COLOURS[1]]);
    });

    it('falls back to the first chip when a row carries no selection', () => {
      renderOptions({ selection: { model: '', colour: undefined } });
      const tabbable = screen
        .getAllByRole('radio')
        .filter((r) => r.getAttribute('tabindex') === '0')
        .map((r) => r.textContent);
      expect(tabbable).toEqual([MODELS[0], COLOURS[0]]);
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
    ])('%s moves focus from model chip %i to %i and selects it', (key, from, to) => {
      const { onSelect } = renderOptions();
      const models = Array.from(
        screen.getByRole('radiogroup', { name: 'Model' }).querySelectorAll('button'),
      );
      fireEvent.keyDown(models[from], { key });
      expect(document.activeElement).toBe(models[to]);
      expect(onSelect).toHaveBeenCalledWith('model', MODELS[to]);
    });

    it('ignores keys the pattern does not define', () => {
      const { onSelect } = renderOptions();
      fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: 'a' });
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('keeps arrow navigation inside the row it started in', () => {
      const { onSelect } = renderOptions();
      const colours = Array.from(
        screen.getByRole('radiogroup', { name: 'Colour' }).querySelectorAll('button'),
      );
      fireEvent.keyDown(colours[0], { key: 'End' });
      expect(document.activeElement).toBe(colours[2]);
      expect(onSelect).toHaveBeenCalledWith('colour', COLOURS[2]);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('quote link', () => {
    it('is byte-identical to the pre-selector link for a product with no options', () => {
      renderOptions({
        modelRow: { name: 'Model', values: [] },
        colourRow: { name: 'Colour', values: [] },
        selection: { model: '' },
      });
      expect(quoteHref()).toBe('/?product=test-product#contact');
    });

    it('carries the model alone when the model has no colours', () => {
      renderOptions({
        colourRow: { name: 'Colour', values: [] },
        selection: { model: 'Elephant' },
      });
      expect(quoteVariant()).toBe('Elephant');
      expect(quoteHref()).toContain('product=test-product');
      expect(quoteHref().endsWith('#contact')).toBe(true);
    });

    it('joins the model and the colour', () => {
      renderOptions({ selection: { model: 'Metal Band', colour: 'Blue' } });
      expect(quoteVariant()).toBe('Metal Band · Blue');
    });
  });
});
