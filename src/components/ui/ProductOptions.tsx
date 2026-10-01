'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProductSelection, ProductSelectionAxis } from '@/components/ui/ProductConfigurator';

/**
 * Joins the model and the colour into the one string the quote link carries. Matches the separator
 * the catalogue's own pre-composed variant labels are built around.
 */
const VALUE_SEPARATOR = ' · ';

/**
 * Selected state is **brand blue**, not the ink inversion these chips shipped with. `paper` on
 * `brand.blue` measures **7.15:1** (the figure `tailwind.config.ts` records for that pair, and the
 * ratio is symmetric), well clear of the 4.5:1 bar. `ProductGrid.tsx`'s `SUB_CHIP_CLASS` moved to
 * the same pair in the same pass, so the site has one selected-state language rather than two —
 * which was the whole reason the chips were lifted from there in the first place. `brand.blue` is
 * a LIGHT-surfaces-only token per the palette comment, and every surface these chips sit on
 * (`paper`, `grey-50`) is light.
 *
 * `aria-checked` carries the same fact to assistive technology and drives the paint through
 * Tailwind's `aria-checked:` variant, so no conditional class is needed.
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
  "relative inline-flex items-center border border-grey-200 px-3 py-2.5 font-mono text-label uppercase text-grey-500 transition-colors duration-200 motion-reduce:transition-none hover:border-grey-400 hover:text-ink aria-checked:border-brand-blue aria-checked:bg-brand-blue aria-checked:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 before:absolute before:inset-x-0 before:inset-y-[-5px] before:content-['']";

/**
 * The secondary row's chips carry a swatch mark, which is the Flipkart-style affordance the client
 * asked for on the colour row — and, by their explicit decision, on the fragrance row of the four
 * `optionAxes` products too. `group` is what lets the mark repaint with the chip; the mark itself
 * is a palette token rather than the literal hue it names, because the SEALED palette has no red,
 * green or yellow and an arbitrary hex here would be the off-palette mistake two files were
 * corrected for recently.
 */
const SWATCH_CHIP_CLASS = cn(CHIP_CLASS, 'group gap-2');

const SWATCH_CLASS =
  'h-3 w-3 shrink-0 border border-grey-300 bg-grey-50 transition-colors duration-200 motion-reduce:transition-none group-aria-checked:border-paper group-aria-checked:bg-paper';

/** One selectable row. `values` empty means the row is not rendered at all. */
export interface ProductOptionRow {
  name: string;
  values: string[];
}

interface ProductOptionsProps {
  /**
   * The product's slug, and nothing else about the product. Narrow and presentational on purpose —
   * same precedent as `ProductViewer`, which takes `productName`/`image` rather than the catalogue
   * type.
   */
  slug: string;
  /** Primary axis: the models (or axis 0 of an `optionAxes` product). */
  modelRow: ProductOptionRow;
  /**
   * Secondary axis, already narrowed to the selected model by the owner of the state. Empty when
   * the selected model has no colours — which is a per-model fact, not a per-product one: a single
   * product routinely mixes models that have colours with models that have none.
   */
  colourRow: ProductOptionRow;
  /** The current selection. Never partially resolved — the owner computes it synchronously. */
  selection: ProductSelection;
  onSelect: (axis: ProductSelectionAxis, value: string) => void;
  /**
   * Whatever markup sits between the option rows and the quote CTA — the specs table and the
   * pricing note. Passed through rather than re-implemented here: server-rendered children handed
   * to a client component stay server-rendered and cost no client JS.
   */
  children: ReactNode;
  /** The CTA rendered beside "Request a Quote". Server-rendered, for the same reason as `children`. */
  secondaryAction: ReactNode;
}

export function ProductOptions({
  slug,
  modelRow,
  colourRow,
  selection,
  onSelect,
  children,
  secondaryAction,
}: ProductOptionsProps) {
  // Two rows at most, and the colour row is always last, so a model with no colours removes the
  // final entry rather than shifting the model row's index. The outer fragment's three slots below
  // are fixed regardless — see the comment on the return.
  const rows: (ProductOptionRow & { axis: ProductSelectionAxis; value?: string })[] = [];
  if (modelRow.values.length > 0) {
    rows.push({ ...modelRow, axis: 'model', value: selection.model });
  }
  if (colourRow.values.length > 0) {
    rows.push({ ...colourRow, axis: 'colour', value: selection.colour });
  }

  const chipRefs = useRef<(HTMLButtonElement | null)[][]>([]);

  // The slug, not the name: the destination rebuilds the select's option value with
  // `productEnquiryLabel`, which names the product's PRIMARY category — and the three
  // dual-category products are listed under both of their optgroups carrying that same
  // primary-category value. A bare name cannot say which of the two ranges is primary, so it
  // could not be resolved back to a matching option.
  //
  // `URLSearchParams` rather than string concatenation, so the composed option string is encoded
  // once and correctly; applying `encodeURIComponent` on top of it would double-encode. A product
  // with no options at all contributes no `variant` key, and the result is then byte-identical to
  // the link this page carried before the selector existed.
  //
  // The destination writes this into the message as "Option requested: …", which is deliberately a
  // REQUEST rather than a SKU — the source never asserted that every fragrance is stocked in every
  // size, and preselecting a combination in the UI must not turn into a claim that it exists.
  const chosen = rows
    .map((row) => row.value)
    .filter(Boolean)
    .join(VALUE_SEPARATOR);
  const params = new URLSearchParams({ product: slug });
  if (chosen) params.set('variant', chosen);
  const quoteUrl = `/?${params.toString()}#contact`;

  /**
   * The APG radio group's keyboard interaction, with **automatic** activation: an arrow key moves
   * focus to the next radio AND checks it, which is what the pattern specifies rather than an
   * option it leaves open (https://www.w3.org/WAI/ARIA/apg/patterns/radio/). That differs from the
   * manual activation `ProductGrid`'s tablist chose, and the difference is justified — activating a
   * tab there re-filters a 164-product grid and rewrites the URL, whereas checking a radio here
   * repaints one chip, swaps one image and recomputes one `href`. Both wrap-around cases are
   * required by the pattern. `Home`/`End` are a superset the pattern does not define but does not
   * forbid, carried over from the tablist so the two control families behave alike.
   *
   * `Space`/`Enter` are not handled: a native `<button>` already fires `onClick` for both, which is
   * the check.
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    index: number,
  ) => {
    const { values, axis } = rows[rowIndex];
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
    onSelect(axis, values[next]);
  };

  // Three fixed slots — option block (may be `null`), `children`, CTA row — and the shape never
  // changes between renders. React reconciles fragment children by position, so a branch that
  // collapsed the array instead of leaving `null` behind would slide `children` onto a different
  // index and remount the whole column. `mt-auto` on the CTA row resolves against the column's
  // `flex flex-col` and depends on that row staying the last child.
  return (
    <>
      {rows.length > 0 ? (
        <div className="mb-8 flex flex-col gap-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-grey-600">
            Available Options
          </h2>
          {rows.map((row, rowIndex) => {
            // Deterministic rather than `useId()`: the slug is unique across the catalogue and the
            // axis name is stable, so this needs no hook and is identical on server and client.
            const labelId = `${slug}-option-${row.axis}`;
            const swatched = row.axis === 'colour';
            return (
              <div key={row.axis}>
                <p className="mb-2 flex flex-wrap items-baseline gap-x-1 gap-y-1 font-mono text-label uppercase text-grey-500">
                  {/*
                    The id is on the axis name alone, not on the paragraph: the chosen value sits
                    beside it as feedback (the "Colour: Blue" reading the client asked for), and
                    folding that into the group's accessible name would make the name change every
                    time the visitor picks something. The colon is its own `aria-hidden` element for
                    the same reason — it is punctuation between two spans, not part of either.
                  */}
                  <span id={labelId}>{row.name}</span>
                  {row.value ? (
                    <>
                      <span aria-hidden="true" className="-ml-1">
                        :
                      </span>
                      <span className="ml-1 text-ink">{row.value}</span>
                    </>
                  ) : null}
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby={labelId}
                  className="flex flex-wrap gap-x-2 gap-y-2.5"
                >
                  {row.values.map((optionValue, index) => {
                    const checked = row.value === optionValue;
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
                        // enters the group exactly once. A default is always resolved, so this
                        // lands on the checked chip; the `index === 0` arm covers the case where a
                        // row somehow carries no selection.
                        tabIndex={checked || (!row.value && index === 0) ? 0 : -1}
                        onKeyDown={(event) => handleKeyDown(event, rowIndex, index)}
                        onClick={() => onSelect(row.axis, optionValue)}
                        className={swatched ? SWATCH_CHIP_CLASS : CHIP_CLASS}
                        // The checked chip is a brand-blue ground, on which the custom cursor's own
                        // ink ring would be invisible — same marker the other dark surfaces carry.
                        data-cursor-invert={checked || undefined}
                      >
                        {swatched ? (
                          <span aria-hidden="true" data-swatch="true" className={SWATCH_CLASS} />
                        ) : null}
                        {optionValue}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

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
