'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import type { ProductOptionAxis, ProductVariant } from '@/types';

/** Row name for the `variants` shape, which is a single unnamed list of discrete SKUs. */
const MODEL_ROW_NAME = 'Model';

/**
 * Joins the values chosen across several axes into the one string the quote link carries.
 * Matches the separator the catalogue's own pre-composed variant labels are built around.
 */
const VALUE_SEPARATOR = ' · ';

/**
 * Selected state is a full inversion — dark ground, light text — not a hue swap, so it survives any
 * colour-vision deficiency; `aria-checked` carries the same fact to assistive technology, and
 * drives the paint through Tailwind's `aria-checked:` variant so no conditional class (and so no
 * `cn()` call) is needed. Lifted from `ProductGrid.tsx`'s `SUB_CHIP_CLASS` deliberately: a second
 * visual language for the same kind of control on the same site would read as a defect. The one
 * substantive change is `aria-pressed:` → `aria-checked:` — those chips are independent toggles,
 * these are mutually exclusive radios.
 *
 * `py-2.5` (10px) plus the 14.3px `text-label` line box and the 1px border gives a 36.3px box;
 * `before:inset-y-[-5px]` grows the invisible hit area to 46.3px, clearing the 44px WCAG
 * 2.5.5/2.5.8 floor. The row's `gap-y-2.5` (10px) is exactly what two stacked rows' hit areas claim
 * between them, so the expansion never steals a tap from the row above or below.
 *
 * `motion-reduce:transition-none` is the `prefers-reduced-motion` respect this repo requires on
 * every new animation — declarative, so it is right in the server HTML and needs no effect or
 * cleanup.
 */
const CHIP_CLASS =
  "relative inline-flex items-center border border-grey-200 px-3 py-2.5 font-mono text-label uppercase text-grey-500 transition-colors duration-200 motion-reduce:transition-none hover:border-grey-400 hover:text-ink aria-checked:border-ink aria-checked:bg-ink aria-checked:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 before:absolute before:inset-x-0 before:inset-y-[-5px] before:content-['']";

interface ProductOptionsProps {
  /**
   * The product's slug, and nothing else about the product. Narrow and presentational on purpose —
   * same precedent as `ProductViewer`, which takes `productName`/`image` rather than the catalogue
   * type.
   */
  slug: string;
  /** The closed list of real SKUs, when the source named them. Mutually exclusive with `optionAxes`. */
  variants?: ProductVariant[];
  /** Independent option dimensions. Mutually exclusive with `variants`. */
  optionAxes?: ProductOptionAxis[];
  /**
   * Whatever markup sits between the option rows and the quote CTA — the specs table and the
   * pricing note. Passed through rather than re-implemented here: server-rendered children handed
   * to a client component stay server-rendered and cost no client JS, which is what keeps this
   * boundary down to the two things that genuinely share state (the chips and the CTA's href).
   */
  children: ReactNode;
  /** The CTA rendered beside "Request a Quote". Server-rendered, for the same reason as `children`. */
  secondaryAction: ReactNode;
}

export function ProductOptions({
  slug,
  variants,
  optionAxes,
  children,
  secondaryAction,
}: ProductOptionsProps) {
  // Both catalogue shapes reduce to the same thing on screen: a named row of mutually exclusive
  // values. `optionAxes` gives one row per axis; `variants` gives a single row of pre-composed SKU
  // labels. A product carries one or the other, never both (see `ProductItem` in `src/types`).
  const rows: ProductOptionAxis[] =
    optionAxes && optionAxes.length > 0
      ? optionAxes
      : variants && variants.length > 0
        ? [{ name: MODEL_ROW_NAME, values: variants.map((v) => v.label) }]
        : [];

  /**
   * Nothing is preselected, and that is load-bearing rather than an oversight. Preselecting one
   * value on each axis would assert that the resulting combination — 5 L × Citrus, say — is a
   * stocked SKU, which is exactly the fabricated-variant problem the catalogue's data layer was
   * rebuilt to remove. The site must not reintroduce it in the UI. The quote CTA therefore has to
   * work with no selection, and does: it omits the parameter entirely.
   */
  const [selected, setSelected] = useState<Record<number, string>>({});

  const chipRefs = useRef<(HTMLButtonElement | null)[][]>([]);

  const chosen = rows
    .map((_, rowIndex) => selected[rowIndex])
    .filter(Boolean)
    .join(VALUE_SEPARATOR);

  // The slug, not the name: the destination rebuilds the select's option value with
  // `productEnquiryLabel`, which names the product's PRIMARY category — and the three
  // dual-category products are listed under both of their optgroups carrying that same
  // primary-category value. A bare name cannot say which of the two ranges is primary, so it
  // could not be resolved back to a matching option.
  //
  // `URLSearchParams` rather than string concatenation, so the composed option string is encoded
  // once and correctly; applying `encodeURIComponent` on top of it would double-encode. With
  // nothing selected the `variant` key is absent and the result is byte-identical to the link this
  // page carried before the selector existed.
  const params = new URLSearchParams({ product: slug });
  if (chosen) params.set('variant', chosen);
  const quoteUrl = `/?${params.toString()}#contact`;

  const select = (rowIndex: number, value: string) => {
    setSelected((current) => ({ ...current, [rowIndex]: value }));
  };

  /**
   * The APG radio group's keyboard interaction, with **automatic** activation: an arrow key moves
   * focus to the next radio AND checks it, which is what the pattern specifies rather than an
   * option it leaves open (https://www.w3.org/WAI/ARIA/apg/patterns/radio/). That differs from the
   * manual activation `ProductGrid`'s tablist chose, and the difference is justified — activating a
   * tab there re-filters a 164-product grid and rewrites the URL, whereas checking a radio here
   * only repaints one chip and recomputes one `href`. Both wrap-around cases are required by the
   * pattern. `Home`/`End` are a superset the pattern does not define but does not forbid, carried
   * over from the tablist so the two control families behave alike.
   *
   * `Space`/`Enter` are not handled: a native `<button>` already fires `onClick` for both, which is
   * the check.
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    index: number,
  ) => {
    const { values } = rows[rowIndex];
    const last = values.length - 1;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    chipRefs.current[rowIndex]?.[next]?.focus();
    select(rowIndex, values[next]);
  };

  return (
    <>
      {rows.length > 0 && (
        <div className="mb-8 flex flex-col gap-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-grey-600">
            Available Options
          </h2>
          {rows.map((row, rowIndex) => {
            // Deterministic rather than `useId()`: the slug is unique across the catalogue and the
            // row index is stable, so this needs no hook and is identical on server and client.
            const labelId = `${slug}-option-${rowIndex}`;
            const value = selected[rowIndex];
            return (
              <div key={row.name}>
                <p className="mb-2 flex flex-wrap items-baseline gap-2 font-mono text-label uppercase text-grey-500">
                  {/*
                    The id is on the axis name alone, not on the paragraph: the chosen value sits
                    beside it as feedback, and folding that into the group's accessible name would
                    make the name change every time the visitor picks something.
                  */}
                  <span id={labelId}>{row.name}</span>
                  {value && <span className="text-ink">{value}</span>}
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby={labelId}
                  className="flex flex-wrap gap-x-2 gap-y-2.5"
                >
                  {row.values.map((optionValue, index) => {
                    const checked = value === optionValue;
                    return (
                      <button
                        key={optionValue}
                        ref={(node) => {
                          (chipRefs.current[rowIndex] ??= [])[index] = node;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        // Roving tabindex, per the pattern's Keyboard Interaction section: Tab
                        // enters the group exactly once. With nothing checked it lands on the first
                        // radio, which is the pattern's stated behaviour for an unchecked group.
                        tabIndex={checked || (!value && index === 0) ? 0 : -1}
                        onKeyDown={(event) => handleKeyDown(event, rowIndex, index)}
                        onClick={() => select(rowIndex, optionValue)}
                        className={CHIP_CLASS}
                        // The checked chip is an ink ground, on which the custom cursor's own ink
                        // ring would be invisible — same marker the other dark surfaces carry.
                        data-cursor-invert={checked || undefined}
                      >
                        {optionValue}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {children}

      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
        <Link
          href={quoteUrl}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-blue text-paper font-semibold text-sm hover:bg-brand-blue/90 hover:-translate-y-0.5 transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper min-h-[44px]"
          data-cursor-invert
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          Request a Quote
        </Link>
        {secondaryAction}
      </div>
    </>
  );
}
