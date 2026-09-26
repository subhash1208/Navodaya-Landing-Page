import { ImageResponse } from 'next/og';
import { BRAND } from '@/constants';

export const alt = `${BRAND.FULL_NAME} — ${BRAND.TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// SEALED specimen plate: ink on paper, monospace labels, hairline rules, and the
// category identifier colours as a single thin accent bar. Hex values mirror the
// `ink` / `paper` / `grey` / `category` tokens in tailwind.config.ts — satori has
// no access to Tailwind, so they are necessarily literal here.
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FAFAF8',
        color: '#0A0B0D',
        padding: '72px 80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'monospace',
            fontSize: 22,
            letterSpacing: 8,
            color: '#6B6B64',
          }}
        >
          {BRAND.LOCATION.toUpperCase()}
        </div>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: 1,
            backgroundColor: '#D4D4D0',
            marginTop: 28,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
          {BRAND.FULL_NAME}
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#4F4F49', marginTop: 24 }}>
          {BRAND.TAGLINE}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', width: '100%', height: 1, backgroundColor: '#D4D4D0' }} />
        <div style={{ display: 'flex', marginTop: 28 }}>
          <div style={{ display: 'flex', width: 120, height: 6, backgroundColor: '#1B4DFF' }} />
          <div style={{ display: 'flex', width: 120, height: 6, backgroundColor: '#B8561E' }} />
          <div style={{ display: 'flex', width: 120, height: 6, backgroundColor: '#2E7D5B' }} />
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'monospace',
            fontSize: 22,
            letterSpacing: 4,
            color: '#6B6B64',
            marginTop: 24,
          }}
        >
          {BRAND.WEBSITE.toUpperCase()}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
