import type { MetadataRoute } from 'next';
import { PRODUCTS, ROUTES, SITE_URL } from '@/constants';

const absolute = (path: string) => new URL(path, SITE_URL).toString();

// `lastModified` is deliberately omitted: the catalogue is a static literal in
// `src/constants/index.ts`, so a build-time `new Date()` would restamp all
// entries on every deploy and report a change that never happened.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absolute(ROUTES.HOME), changeFrequency: 'monthly', priority: 1 },
    { url: absolute(ROUTES.PRODUCTS), changeFrequency: 'monthly', priority: 0.8 },
    ...PRODUCTS.map((product) => ({
      url: absolute(ROUTES.PRODUCT(product.slug)),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
