import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, MessageSquare, Package, Tag, ArrowLeft } from 'lucide-react';
import { PRODUCTS, PRODUCT_CATEGORIES, ROUTES, BRAND } from '@/constants';
import { ProductViewer } from '@/components/ui/ProductViewer';
import { ProductCard } from '@/components/ui/ProductCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate all 51 product pages at build time (SSG)
export async function generateStaticParams() {
  return PRODUCTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find(p => p.slug === slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: `${product.description} — ${product.category.name}. Request a quote from ${BRAND.FULL_NAME}, ${BRAND.LOCATION}.`,
    openGraph: {
      title: `${product.name} | ${BRAND.NAME}`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find(p => p.slug === slug);

  if (!product) notFound();

  // Related: same category, exclude current, max 4
  const related = PRODUCTS
    .filter(p => p.category.id === product.category.id && p.slug !== slug)
    .slice(0, 4);

  const specs = [
    { label: 'Category', value: product.category.name, icon: Tag },
    ...(product.material ? [{ label: 'Material', value: product.material, icon: Package }] : []),
    { label: 'Type', value: 'Disposable / Single-use', icon: Package },
    { label: 'Availability', value: 'In Stock — Bulk Orders Welcome', icon: Package },
  ];

  const quoteUrl = `${ROUTES.CONTACT}?product=${encodeURIComponent(product.name)}`;

  return (
    <div className="min-h-screen bg-(--color-)">

      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
            <Link href="/" className="hover:text-(--color-) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--color-) rounded">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <Link href={ROUTES.PRODUCTS} className="hover:text-(--color-) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--color-) rounded">
              Products
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <Link
              href={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
              className="hover:text-(--color-) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--color-) rounded"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="text-(--color-) font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Main product layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">

          {/* Left — 360° viewer */}
          <div>
            <ProductViewer productName={product.name} />
          </div>

          {/* Right — product info */}
          <div className="flex flex-col">
            {/* Category badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-(--color-) bg-sky-50 px-3 py-1.5 rounded-full self-start mb-4">
              {product.category.icon} {product.category.name}
            </span>

            <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-(--color-) mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-slate-500 leading-relaxed mb-8 text-base">
              {product.description}
            </p>

            {/* Specs table */}
            <div className="bg-(--color-) rounded-xl p-5 mb-8 border border-slate-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Product Specifications
              </h2>
              <dl className="space-y-3">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 text-sm">
                    <dt className="text-slate-500 font-medium shrink-0">{label}</dt>
                    <dd className="text-(--color-) font-semibold text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Pricing note */}
            <div className="bg-(--color-) border border-(--color-)/15 rounded-xl p-4 mb-8">
              <p className="text-sm text-(--color-) font-medium mb-1">Pricing on Request</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                We offer flexible B2B pricing based on order quantity and requirements.
                Contact us for a custom quote tailored to your business.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Link
                href={quoteUrl}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-(--color-) text-white font-semibold text-sm hover:bg-(--color-)/90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(30,64,175,0.3)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-) focus-visible:ring-offset-2 min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Request a Quote
              </Link>
              <Link
                href={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-(--color-) hover:text-(--color-) transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-) min-h-[44px]"
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
              <h2 id="related-heading" className="text-lg font-bold text-(--color-)">
                Related Products
              </h2>
              <Link
                href={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                className="text-sm font-medium text-(--color-) hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-) rounded"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
