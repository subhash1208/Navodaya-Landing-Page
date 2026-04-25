import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BRAND } from '@/constants';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.FULL_NAME} — ${BRAND.TAGLINE}`,
    template: `%s | ${BRAND.NAME}`,
  },
  description: `${BRAND.FULL_NAME}. ${BRAND.MISSION} Based in ${BRAND.LOCATION}.`,
  keywords: ['disposable hygiene products', 'hotel amenities', 'spa salon disposables', 'Hyderabad supplier', 'care kits'],
  authors: [{ name: BRAND.FULL_NAME }],
  metadataBase: new URL('https://www.navodaya.group'),
  openGraph: {
    title: BRAND.FULL_NAME,
    description: BRAND.TAGLINE,
    type: 'website',
    locale: 'en_IN',
    siteName: BRAND.FULL_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.FULL_NAME,
    description: BRAND.TAGLINE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
          onFocus={(e) => {
            Object.assign(e.currentTarget.style, {
              position: 'fixed', top: '16px', left: '16px', zIndex: '100',
              width: 'auto', height: 'auto', padding: '8px 16px',
              margin: '0', overflow: 'visible', clip: 'auto',
              background: '#1E40AF', color: '#FFFFFF',
              borderRadius: '8px', fontSize: '14px', fontWeight: 500,
              textDecoration: 'none',
            });
          }}
          onBlur={(e) => {
            Object.assign(e.currentTarget.style, {
              position: 'absolute', width: '1px', height: '1px',
              padding: '0', margin: '-1px', overflow: 'hidden',
              clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
            });
          }}
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
