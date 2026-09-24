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
};

export default nextConfig;
