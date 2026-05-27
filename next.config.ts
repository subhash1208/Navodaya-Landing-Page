import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add CDN/storage domains here when real product photos are available
      // e.g. { protocol: 'https', hostname: 'cdn.navodaya.group' }
    ],
  },
};

export default nextConfig;
