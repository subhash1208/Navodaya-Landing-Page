import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';

// Nothing is gated behind auth and every route is public marketing content, so
// there is no genuine reason to disallow a path. The sitemap is the only thing
// that must be absolute — crawlers reject a relative `Sitemap:` directive.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}
