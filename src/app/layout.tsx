import type { Metadata } from 'next';
import { Inter, Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { BRAND } from '@/constants';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SkipNav } from '@/components/ui/SkipNav';
import { PageTransition } from '@/components/ui/PageTransition';
import { CustomCursor } from '@/components/ui/CustomCursor';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
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
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <SkipNav />
        <CustomCursor />
        <PageTransition>
          <Header />
          <main id="main-content" className="pt-16">
            {children}
          </main>
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
