import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { BRAND, SITE_URL } from '@/constants';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SkipNav } from '@/components/ui/SkipNav';
import { PageTransition } from '@/components/ui/PageTransition';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Analytics } from '@vercel/analytics/react';
import { LenisProvider } from '@/components/ui/LenisProvider';

export const metadata: Metadata = {
  title: {
    default: `${BRAND.FULL_NAME} — ${BRAND.TAGLINE}`,
    template: `%s | ${BRAND.NAME}`,
  },
  description: `${BRAND.FULL_NAME}. ${BRAND.MISSION} Based in ${BRAND.LOCATION}.`,
  keywords: [
    'disposable hygiene products',
    'hotel amenities',
    'spa salon disposables',
    'Hyderabad supplier',
    'care kits',
  ],
  authors: [{ name: BRAND.FULL_NAME }],
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: '/' },
  // Only assets that actually exist: `src/app/favicon.ico` is served at
  // /favicon.ico by the file convention, and `public/navodaya-logo.png` is the
  // repo's only PNG icon.
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/navodaya-logo.png',
  },
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <SkipNav />
        <CustomCursor />
        <LenisProvider>
          <PageTransition>
            <Header />
            <main id="main-content" className="pt-20">
              {children}
            </main>
            <Footer />
          </PageTransition>
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}
