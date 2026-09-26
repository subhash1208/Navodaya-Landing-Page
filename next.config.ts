import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Next 16 defaults to ['image/webp'] alone; AVIF is typically 20-30% smaller
    // on photographic content and Next falls back automatically where unsupported.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add CDN/storage domains here when real product photos are available
      // e.g. { protocol: 'https', hostname: 'cdn.navodaya.group' }
    ],
  },
  // Drop `X-Powered-By: Next.js` — free version disclosure on every response.
  poweredByHeader: false,
  // No Content-Security-Policy here on purpose: a strict CSP breaks Next's
  // inline bootstrap scripts and Motion's inline styles, and there is no time
  // to test one before the first deploy. Tracked as follow-up work.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            // `preload` is deliberately omitted — it is effectively
            // irreversible and this is a first production deploy.
            value: 'max-age=31536000; includeSubDomains',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
