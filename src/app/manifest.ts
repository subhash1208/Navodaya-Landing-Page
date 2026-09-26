import type { MetadataRoute } from 'next';
import { BRAND } from '@/constants';

// `public/navodaya-logo.png` is the only real icon asset in the repo (200x200).
// Never list an icon file that does not exist — browsers fail the install
// prompt silently when a declared icon 404s.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.FULL_NAME} — ${BRAND.TAGLINE}`,
    short_name: BRAND.NAME,
    description: BRAND.MISSION,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8', // paper
    theme_color: '#0A0B0D', // ink
    icons: [
      {
        src: '/navodaya-logo.png',
        sizes: '200x200',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
