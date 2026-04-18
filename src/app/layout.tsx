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
      <body className="min-h-screen antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[--color-brand-primary] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
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
