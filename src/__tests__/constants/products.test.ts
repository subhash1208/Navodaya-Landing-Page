import { describe, it, expect } from 'vitest';
import { PRODUCTS, PRODUCT_CATEGORIES, productSummary } from '@/constants';

describe('Product Data Integrity', () => {
  it('has the client catalogue in full', () => {
    // Exact, not `>=`: this is the reconciled count from the client's spreadsheet
    // (dev-tools/catalogue/catalogue-final.json), so a drift in either direction is a
    // regeneration bug rather than a product launch.
    expect(PRODUCTS.length).toBe(164);
  });

  it('has 4 categories', () => {
    expect(PRODUCT_CATEGORIES.length).toBe(4);
  });

  it('every product has required fields', () => {
    for (const product of PRODUCTS) {
      expect(product.name, `Product missing name`).toBeTruthy();
      expect(product.slug, `${product.name} missing slug`).toBeTruthy();
      expect(product.category, `${product.name} missing category`).toBeTruthy();
      expect(product.category.id, `${product.name} missing category.id`).toBeTruthy();
      // `description` is deliberately NOT asserted: the client's catalogue supplies no product
      // copy, so every product is currently without one and `productSummary()` composes the
      // displayed sentence from the data that does exist.
      expect(productSummary(product), `${product.name} has no displayable summary`).toBeTruthy();
    }
  });

  it('every product slug is unique', () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('every product slug is URL-safe', () => {
    for (const product of PRODUCTS) {
      expect(product.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('every product belongs to a valid category', () => {
    const categoryIds = new Set(PRODUCT_CATEGORIES.map((c) => c.id));
    for (const product of PRODUCTS) {
      expect(
        categoryIds.has(product.category.id),
        `${product.name} has invalid category ID: ${product.category.id}`,
      ).toBe(true);
    }
  });

  it('every category has at least one product', () => {
    for (const category of PRODUCT_CATEGORIES) {
      const count = PRODUCTS.filter((p) => p.category.id === category.id).length;
      expect(count, `Category "${category.name}" has no products`).toBeGreaterThan(0);
    }
  });

  it('every category has required fields', () => {
    for (const category of PRODUCT_CATEGORIES) {
      expect(category.name, 'Category missing name').toBeTruthy();
      expect(category.slug, `${category.name} missing slug`).toBeTruthy();
      expect(category.id, `${category.name} missing id`).toBeTruthy();
    }
  });
});

// The client's spreadsheet listed sizes in one column and fragrances in another for four cleaning
// chemicals. The build script used to multiply the two columns together, inventing 51 size/fragrance
// SKUs the client never quoted — on a site whose entire purpose is taking quote requests. Those four
// products now carry `optionAxes` (independent dimensions) instead of `variants` (named SKUs).
describe('Product option axes', () => {
  const AXIS_SLUGS = [
    'air-freshener-concentrate',
    'hand-wash',
    'floor-cleaner',
    'herbal-deodoriser-phenyl',
  ];
  const withAxes = PRODUCTS.filter((p) => p.optionAxes);

  it('never carries both variants and optionAxes, because crossing the axes back into variants is the fabrication this split removed', () => {
    // DO NOT DELETE AS REDUNDANT. `variants` is a closed list of SKUs the supplier named;
    // `optionAxes` are dimensions whose combinations the source never asserted as stocked. A
    // product holding both means someone re-derived one from the other, which is exactly how the
    // 51 fabricated size/fragrance combinations got into the catalogue the first time.
    const both = PRODUCTS.filter((p) => p.variants && p.optionAxes);
    expect(
      both.map((p) => p.slug),
      'product carries variants AND optionAxes',
    ).toEqual([]);
  });

  it('carries axes on exactly the four products whose source listed two separate attribute columns', () => {
    expect(withAxes.map((p) => p.slug).sort()).toEqual([...AXIS_SLUGS].sort());
  });

  it('gives every axis a name and at least two distinct values', () => {
    for (const product of withAxes) {
      expect(product.optionAxes?.length, `${product.name} has no axes`).toBeGreaterThanOrEqual(2);
      for (const axis of product.optionAxes ?? []) {
        expect(axis.name, `${product.name} has an unnamed axis`).toBeTruthy();
        // Fewer than two values is not an axis — it is a fixed property of the product and
        // belongs in `notes`, the same rule the build script applies to one-element `variants`.
        expect(
          axis.values.length,
          `${product.name} axis "${axis.name}" has fewer than 2 values`,
        ).toBeGreaterThanOrEqual(2);
        expect(
          new Set(axis.values).size,
          `${product.name} axis "${axis.name}" has duplicate values`,
        ).toBe(axis.values.length);
        for (const value of axis.values) {
          expect(value, `${product.name} axis "${axis.name}" has an empty value`).toBeTruthy();
        }
      }
    }
  });

  it('leaves the four axis-carrying products with no variants at all', () => {
    for (const slug of AXIS_SLUGS) {
      const product = PRODUCTS.find((p) => p.slug === slug);
      expect(product, `${slug} is not in the catalogue`).toBeTruthy();
      expect(product?.variants, `${slug} still carries crossed variants`).toBeUndefined();
    }
  });

  it('holds 212 real variants across 65 products, down from the 263 that included the fabrications', () => {
    // Exact, not `>=`: 212 is what the supplier's delimited cells actually listed. A rise means a
    // cross-product has been reintroduced somewhere; a fall means a real option was dropped.
    const variantCarrying = PRODUCTS.filter((p) => p.variants);
    expect(variantCarrying.length).toBe(65);
    expect(variantCarrying.reduce((total, p) => total + (p.variants?.length ?? 0), 0)).toBe(212);
  });
});

// The photo-extraction pipeline produced 54 candidate images; a full-resolution visual audit
// approved 42 and rejected 12. These tests lock that audit's outcome into the data layer, because
// the rejection reason is a client requirement rather than a matter of taste.
describe('Product photographs', () => {
  const photographed = PRODUCTS.filter((p) => p.image);

  it('carries a photograph on exactly the 42 approved products', () => {
    // Exact, not `>=`: 42 is the approved count. A higher number means an unapproved photo was
    // wired in; a lower one means the emitter dropped the key.
    expect(photographed.length).toBe(42);
  });

  it('points every photograph at its own product slug under /products', () => {
    for (const product of photographed) {
      expect(product.image, `${product.name} has a mismatched image path`).toBe(
        `/products/${product.slug}.webp`,
      );
      expect(product.slug, `${product.name} slug diverges from id`).toBe(product.id);
    }
  });

  it('never ships a photograph for a slug the audit rejected', () => {
    // These 12 candidates carry third-party supplier branding or are mis-mapped. The client's
    // binding requirement is that supplier branding never appears in a product image, so a photo
    // reappearing on any of these is a client-requirement violation, not a cosmetic regression.
    const REJECTED = [
      'long-wiper',
      'double-rubber-wiper',
      'brush-set-wooden',
      'tiles-scrubber',
      'cobweb-brush',
      'sink-brush',
      'dry-mop-refill',
      'glass-cleaning-kit-box',
      'steel-swing-lid-dust-bin',
      'bucket',
      'pedal-dust-bin',
      'dust-pan',
    ];
    for (const slug of REJECTED) {
      const product = PRODUCTS.find((p) => p.slug === slug);
      expect(product, `rejected slug "${slug}" is not in the catalogue at all`).toBeTruthy();
      expect(product?.image, `rejected photograph shipped for "${slug}"`).toBeUndefined();
    }
  });
});

// The product page renders two selector rows: a primary `model` row, and a `colour` row narrowed
// by the model chosen. These tests lock the decomposition that makes that possible — it was
// recovered by `dev-tools/catalogue/_models.py` from labels that had already been composed, so a
// regression here is silent in the UI (a chip row simply goes empty or shows a nonsense value).
describe('Variant selection axes', () => {
  const VARIANTS = PRODUCTS.flatMap((p) => (p.variants ?? []).map((v) => ({ p, v })));

  const matrix = (slug: string) => {
    const product = PRODUCTS.find((p) => p.slug === slug);
    expect(product?.variants, `${slug} has no variants`).toBeTruthy();
    const byModel = new Map<string, string[]>();
    for (const variant of product!.variants!) {
      const colours = byModel.get(variant.model) ?? [];
      if (variant.colour) colours.push(variant.colour);
      byModel.set(variant.model, colours);
    }
    return byModel;
  };

  it('gives every variant a non-empty model, because the primary selector row must never be empty', () => {
    // This is the whole premise of the two-axis UI. A variant with no model would render a
    // product whose first chip row is blank and therefore unselectable — so `model` is required
    // on `ProductVariant` rather than optional, and this asserts the data honours that.
    expect(VARIANTS.length).toBe(212);
    for (const { p, v } of VARIANTS) {
      expect(typeof v.model, `${p.slug} / "${v.label}" has a non-string model`).toBe('string');
      expect(v.model.trim(), `${p.slug} / "${v.label}" has an empty model`).not.toBe('');
    }
  });

  it('never stores a colour outside the literal-colour vocabulary the source records', () => {
    // The decomposition splits labels on an em-dash, so the failure mode is a non-colour word
    // landing in `colour` — a finish ("Printed"), a shape ("Wide"), a capacity ("35 cm"). None of
    // those may ever reach the colour swatch row, so the vocabulary is closed, not a `>=` check.
    const VOCABULARY = ['Black', 'Blue', 'Green', 'Grey', 'Maroon', 'Red', 'White', 'Yellow'];
    const seen = new Set<string>();
    for (const { p, v } of VARIANTS) {
      if (!v.colour) continue;
      expect(VOCABULARY, `${p.slug} / "${v.label}" stores a non-colour as colour`).toContain(
        v.colour,
      );
      seen.add(v.colour);
    }
    expect([...seen].sort()).toEqual(VOCABULARY);
  });

  it('splits exactly 60 of the 212 variants onto a colour axis', () => {
    // Exact, not `>=`. A rise means a word was promoted into `colour` that the source never called
    // a colour; a fall means a real colour option stopped reaching the swatch row.
    expect(VARIANTS.filter(({ v }) => v.colour).length).toBe(60);
    expect(VARIANTS.filter(({ v }) => !v.colour).length).toBe(152);
  });

  it('keeps a colour word inside the model when the model is named after one', () => {
    // "Blue Bell" is a broom model, not a blue broom. A naive first-word rule extracts `Blue` and
    // produces a one-swatch colour row the supplier never offered — this is the guard against it.
    const blueBell = PRODUCTS.find((p) => p.slug === 'broom')?.variants?.find(
      (v) => v.label === 'Blue Bell',
    );
    expect(blueBell?.model).toBe('Blue Bell');
    expect(blueBell?.colour).toBeUndefined();
  });

  it('reproduces the client-verified mop-set model x colour matrix exactly', () => {
    // mop-set is the only product whose labels put the colour LEFT of the dash, and its 11 labels
    // were hand-composed from catalogue photographs rather than recovered from a source column —
    // so no rule derives them and `_models.py` carries an explicit table. This is that table's
    // acceptance test. Note `Slim Head` has NO colour: its label reads "Printed Handle", and
    // `Printed` is a finish, not a colour.
    expect(Object.fromEntries(matrix('mop-set'))).toEqual({
      'Screw Socket': ['Red'],
      'Metal Band': ['Blue'],
      'Screw Hub': ['Blue'],
      Elephant: [],
      'Slim Head': [],
      'Wide Clamp — Looped Yarn, Heavy Duty': [],
      'Coarse Twist': ['Maroon'],
      'Disc Fitting': ['Blue'],
      'Clamp Fitting': ['Blue'],
      'Butterfly Jumbo': [],
      Eagle: [],
    });
  });

  it('recovers the two clean capacity x colour grids the source really does stock', () => {
    const FOUR = ['Blue', 'Green', 'Red', 'Yellow'];
    expect(Object.fromEntries(matrix('wheeled-dust-bin'))).toEqual({
      '120 L': FOUR,
      '240 L': FOUR,
    });
    expect(Object.fromEntries(matrix('pedal-dust-bin'))).toEqual({
      '15 L': FOUR,
      '20 L': FOUR,
      '30 L': FOUR,
      '45 L': FOUR,
      // Two source rows state a size word and neither a capacity nor a colour. They are real rows,
      // so they survive as colourless models rather than being quietly folded into the grid above.
      Small: [],
      Medium: [],
    });
  });

  it('preserves the swing-lid orphan rather than deduplicating it into the 60 L grid', () => {
    // The source carries an unexplained colourless 60 L row alongside a full 60 L four-colour set.
    // Merging them would be a judgement the source does not support, so it stays a distinct model.
    expect(Object.fromEntries(matrix('swing-lid-dust-bin'))).toEqual({
      '60 L': ['Blue', 'Green', 'Red', 'Yellow'],
      '30 L': [],
      '60 L (no colour stated)': [],
    });
  });

  it('falls back to the label as the model wherever the source named no model', () => {
    // Seven broom models, all bare supplier words with no colour and no dash. The honest primary
    // axis value is the label itself — this is the third and most common derivation rule.
    expect([...matrix('broom').keys()]).toEqual([
      'Hunter',
      'Blue Bell',
      'XL',
      'Lily',
      'Jumbo',
      'Daisy',
      'Dolly',
    ]);
  });

  it('ships no per-variant photograph yet, so the UI must keep its placeholder branch', () => {
    // The `image` slot exists so real photographs drop in without a second schema change. Until
    // they do, every variant renders a named placeholder — a photo appearing here before the UI
    // stage is ready would be an invented path, which the pipeline is forbidden to produce.
    expect(VARIANTS.filter(({ v }) => v.image).length).toBe(0);
  });
});
