'use client';

import { useState, type ReactNode } from 'react';
import type { ProductOptionAxis, ProductVariant } from '@/types';
import { ProductOptions, type ProductOptionRow } from '@/components/ui/ProductOptions';
import { ProductViewer } from '@/components/ui/ProductViewer';

/** Row name for the `variants` shape, whose primary axis the catalogue does not name. */
const MODEL_ROW_NAME = 'Model';

/** Row name for the `variants` shape's secondary axis when the source recorded a literal colour. */
const COLOUR_ROW_NAME = 'Colour';

/** Row name for the same axis when the source recorded a fragrance instead. */
const FRAGRANCE_ROW_NAME = 'Fragrance';

/** Which of the two rows a selection came from. */
export type ProductSelectionAxis = 'model' | 'colour';

export interface ProductSelection {
  /** Always set when the product has options at all — `ProductVariant.model` is a required field. */
  model: string;
  /** Absent when the selected model has no colours, which is a per-MODEL fact, not a per-product one. */
  colour?: string;
}

interface ProductConfiguratorProps {
  slug: string;
  productName: string;
  /** The product-level photograph, when one exists. Shown for the default selection only. */
  image?: string;
  variants?: ProductVariant[];
  optionAxes?: ProductOptionAxis[];
  /**
   * The category badge, `<h1>` and summary. A node rather than props so this markup stays
   * server-rendered: a Server Component's output handed to a Client Component as a prop is sent as
   * RSC payload, not compiled into the client bundle.
   */
  header: ReactNode;
  /** The specs table and the pricing note. Server-rendered, for the same reason as `header`. */
  children: ReactNode;
  /** The "More in Category" link. Server-rendered, for the same reason as `header`. */
  secondaryAction: ReactNode;
}

/** Order-preserving de-duplication. The catalogue's own order is the order the client expects. */
function distinct(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

/**
 * The primary row's values: axis 0 for an `optionAxes` product, the distinct `model` values
 * otherwise. `model` is required on every variant precisely so this can never come back empty for
 * a product that has variants.
 */
function modelsOf(variants?: ProductVariant[], axes?: ProductOptionAxis[]): string[] {
  if (axes) return axes[0].values;
  if (variants && variants.length > 0) return distinct(variants.map((v) => v.model));
  return [];
}

/**
 * The secondary row for ONE model — both its values and its NAME, because the two are inseparable:
 * the row is labelled by whichever field supplied the values, and a fragrance row labelled `Colour`
 * would be a defect of its own.
 *
 * `ProductVariant`'s contract (`src/types/index.ts`) states this axis as `colour ?? fragrance`, and
 * both arms are live in the catalogue. `air-freshener-room-spray` carries four variants that share
 * `model: '220 ML'` and differ ONLY by `fragrance`; narrowing on `colour` alone de-duplicated them
 * to a single dead chip and made three of the four fragrances unreachable by any input — including
 * in the quote link, so the business lost the fragrance from every enquiry for that product.
 *
 * `material` is deliberately NOT a third arm. Where the source named a material it is already
 * mirrored into `model` (`shoe-cover`'s two materials are two distinct models), so promoting it
 * here would duplicate the primary row rather than add a choice.
 *
 * Empty is a real and common answer: 152 of the 212 variants in the catalogue name no colour, and
 * a single product routinely mixes models that have one with models that have none (`mop-set`,
 * `pedal-dust-bin` and `swing-lid-dust-bin` all do), so this is recomputed on every model change
 * rather than decided once per product. When it is empty the name is unused — `ProductOptions`
 * drops a row with no values entirely.
 *
 * An `optionAxes` product has no such narrowing to do: its axes are independent by construction,
 * which is the entire reason that shape exists, and axis 1 already carries its own name.
 */
function secondaryRowOf(
  model: string,
  variants?: ProductVariant[],
  axes?: ProductOptionAxis[],
): ProductOptionRow {
  if (axes) {
    return { name: axes[1]?.name ?? COLOUR_ROW_NAME, values: axes[1]?.values ?? [] };
  }
  const matching = variants?.filter((v) => v.model === model) ?? [];
  const values = distinct(
    matching.map((v) => v.colour ?? v.fragrance).filter((value): value is string => Boolean(value)),
  );
  // Follows the field that actually supplied the values. A model mixing both is not a shape the
  // catalogue contains, and `colour` wins per-variant above, so `colour` wins the label too.
  const name = matching.some((v) => v.colour) ? COLOUR_ROW_NAME : FRAGRANCE_ROW_NAME;
  return { name, values };
}

/**
 * Owns the product page's option selection and renders the two columns it drives.
 *
 * **Why the state is lifted here rather than shared through context.** The image (left column) and
 * the option rows plus quote CTA (right column) are siblings under one `lg:grid-cols-2`, and they
 * are the only two consumers there will ever be. A context provider would need a client component
 * at exactly this position anyway — to hold the `useState` — so it would buy an extra indirection
 * and a second module for no additional reach. The grid itself moved in here with the state so
 * `page.tsx` stays an async Server Component and the two columns stay siblings in the DOM.
 *
 * **The default selection is computed synchronously during render, never in an effect.** An effect
 * does not run on the server, so a default resolved there would make the server emit an unselected,
 * image-less page — the exact shape of the `LoadingScreen` defect gate 10 exists for. `useState`'s
 * initialiser runs during the server render, so the HTML a crawler receives already has the first
 * model checked and the real photograph in place.
 */
export function ProductConfigurator({
  slug,
  productName,
  image,
  variants,
  optionAxes,
  header,
  children,
  secondaryAction,
}: ProductConfiguratorProps) {
  // A product carries one shape or the other, never both (see `ProductItem`). Resolving the axes
  // once here makes that precedence a single decision rather than one per helper call.
  const axes = optionAxes && optionAxes.length > 0 ? optionAxes : undefined;
  const models = modelsOf(variants, axes);
  const hasOptions = models.length > 0;

  const defaultModel = models[0] ?? '';
  const defaultColour = secondaryRowOf(defaultModel, variants, axes).values[0];

  const [selection, setSelection] = useState<ProductSelection>({
    model: defaultModel,
    colour: defaultColour,
  });

  const colourRow = secondaryRowOf(selection.model, variants, axes);

  const select = (axis: ProductSelectionAxis, value: string) => {
    setSelection((current) => {
      if (axis === 'colour') return { ...current, colour: value };
      // The previously chosen colour survives a model change only when the new model is actually
      // offered in it; otherwise it falls back to that model's first colour, or to none at all.
      const next = secondaryRowOf(value, variants, axes).values;
      return {
        model: value,
        colour: current.colour && next.includes(current.colour) ? current.colour : next[0],
      };
    });
  };

  /**
   * Image precedence, in order:
   *
   * 1. the selected variant's own photograph — nothing populates `ProductVariant.image` yet, so
   *    this branch is the infrastructure the client asked for rather than a live path;
   * 2. the product's own photograph, but ONLY for the default selection, because that is the
   *    combination the single existing photo actually shows;
   * 3. nothing, which `ProductViewer` renders as the named placeholder panel.
   *
   * A product with no options at all skips the whole question — there is no selection that could
   * make its photo wrong, so it keeps the behaviour it had before the selector existed.
   */
  const variantImage = axes
    ? undefined
    : variants?.find(
        (v) => v.model === selection.model && (v.colour ?? v.fragrance) === selection.colour,
      )?.image;
  const isDefaultSelection = selection.model === defaultModel && selection.colour === defaultColour;
  const shownImage = hasOptions
    ? (variantImage ?? (isDefaultSelection ? image : undefined))
    : image;

  return (
    <div className="grid lg:grid-cols-2 gap-12 mb-16">
      {/* Left — photograph or named placeholder */}
      <div>
        <ProductViewer
          productName={productName}
          image={shownImage}
          selection={hasOptions ? selection : undefined}
        />
      </div>

      {/* Right — product info */}
      <div className="flex flex-col">
        {header}
        <ProductOptions
          slug={slug}
          modelRow={{ name: axes ? axes[0].name : MODEL_ROW_NAME, values: models }}
          colourRow={colourRow}
          selection={selection}
          onSelect={select}
          secondaryAction={secondaryAction}
        >
          {children}
        </ProductOptions>
      </div>
    </div>
  );
}
