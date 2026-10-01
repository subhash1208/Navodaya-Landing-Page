import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, MessageSquare, Package, Tag, ArrowLeft } from 'lucide-react';
import { PRODUCTS, ROUTES, BRAND, productSummary, productsInCategory } from '@/constants';
import { ProductViewer } from '@/components/ui/ProductViewer';
import { ProductCard } from '@/components/ui/ProductCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate a page for every product in the catalogue at build time (SSG)
export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: 'Product Not Found' };

  // `productSummary` rather than `product.description`: the client's catalogue supplies no
  // product copy, so the raw field is `undefined` for all of them and would stringify into the
  // meta description as the literal word "undefined".
  const summary = productSummary(product);

  return {
    title: product.name,
    description: `${summary} Request a quote from ${BRAND.NAME}.`,
    alternates: { canonical: ROUTES.PRODUCT(slug) },
    openGraph: {
      title: `${product.name} | ${BRAND.NAME}`,
      description: summary,
      url: ROUTES.PRODUCT(slug),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) notFound();

  // Related: same category, exclude current, max 4. Goes through `productsInCategory` so the
  // three products with a `secondaryCategory` appear alongside both of their ranges.
  const related = productsInCategory(product.category.slug)
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  const variants = product.variants ?? [];
  const specs = [
    { label: 'Category', value: product.category.name, icon: Tag },
    ...(product.material ? [{ label: 'Material', value: product.material, icon: Package }] : []),
    ...(variants.length > 1
      ? [{ label: 'Options', value: `${variants.length} available`, icon: Package }]
      : []),
    { label: 'Availability', value: 'Bulk Orders Welcome', icon: Package },
  ];

  // The slug, not the name: the destination rebuilds the select's option value with
  // `productEnquiryLabel`, which names the product's PRIMARY category — and the three
  // dual-category products are listed under both of their optgroups carrying that same
  // primary-category value. A bare name cannot say which of the two ranges is primary, so it
  // could not be resolved back to a matching option. It also needs no URL encoding.
  const quoteUrl = `/?product=${product.slug}#contact`;

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Page header */}
      <div className="bg-paper border-b border-grey-100">
        <div className="container mx-auto py-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-grey-500 flex-wrap"
          >
            <Link
              href="/"
              className="hover:text-brand-blue transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue rounded"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <Link
              href={ROUTES.PRODUCTS}
              className="hover:text-brand-blue transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue rounded"
            >
              Products
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <Link
              href={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
              className="hover:text-brand-blue transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue rounded"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="text-ink font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto py-10">
        {/* Main product layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left — 360° viewer */}
          <div>
            <ProductViewer productName={product.name} image={product.image} />
          </div>

          {/* Right — product info */}
          <div className="flex flex-col">
            {/* Category badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-blue bg-grey-50 border border-grey-200 px-3 py-1.5 rounded-full self-start mb-4">
              {product.category.name}
            </span>

            <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-brand-blue mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-grey-500 leading-relaxed mb-8 text-base">
              {productSummary(product)}
            </p>

            {/* Available options — the catalogue's real variant data, when a product has any */}
            {variants.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-grey-600 mb-3">
                  Available Options
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <li
                      key={v.label}
                      className="border border-grey-200 bg-paper px-3 py-1.5 font-mono text-xs text-grey-600"
                    >
                      {v.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specs table */}
            <div className="bg-grey-100 p-5 mb-8 border border-grey-200">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-grey-600 mb-4">
                Product Specifications
              </h2>
              <dl className="space-y-3">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 text-sm">
                    <dt className="text-grey-600 font-medium shrink-0">{label}</dt>
                    <dd className="text-ink font-semibold text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Pricing note */}
            <div className="bg-grey-50 border border-grey-200 p-4 mb-8">
              <p className="text-sm text-brand-blue font-medium mb-1">Pricing on Request</p>
              <p className="text-xs text-grey-500 leading-relaxed">
                We offer flexible B2B pricing based on order quantity and requirements. Contact us
                for a custom quote tailored to your business.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Link
                href={quoteUrl}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-blue text-paper font-semibold text-sm hover:bg-brand-blue/90 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper min-h-[44px]"
                data-cursor-invert
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Request a Quote
              </Link>
              <Link
                href={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-grey-200 text-grey-600 font-semibold text-sm hover:border-ink hover:text-ink transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                More in Category
              </Link>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="related-heading" className="text-lg font-bold text-brand-blue">
                Related Products
              </h2>
              <Link
                href={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                className="text-sm font-medium text-brand-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
