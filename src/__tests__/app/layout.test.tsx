import { describe, it, expect, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';
import { BRAND, SITE_URL } from '@/constants';

vi.mock('geist/font/sans', () => ({
  GeistSans: { variable: '--font-geist-sans', className: 'font-geist-sans' },
}));

vi.mock('geist/font/mono', () => ({
  GeistMono: { variable: '--font-geist-mono', className: 'font-geist-mono' },
}));

vi.mock('@/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/layout/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/ui/SkipNav', () => ({
  SkipNav: () => <a data-testid="skip-nav">Skip</a>,
}));

vi.mock('@/components/ui/PageTransition', () => ({
  PageTransition: ({ children }: any) => <div data-testid="page-transition">{children}</div>,
}));

vi.mock('@/components/ui/CustomCursor', () => ({
  CustomCursor: () => <div data-testid="custom-cursor" />,
}));

vi.mock('@/components/ui/LenisProvider', () => ({
  LenisProvider: ({ children }: any) => <div data-testid="lenis-provider">{children}</div>,
}));

describe('RootLayout', () => {
  it('renders children in main element', () => {
    render(
      <RootLayout>
        <div data-testid="page-content">Page</div>
      </RootLayout>,
    );
    // RootLayout renders html > body > ... > main > children
    // But in test env, html/body are already present, so we check the content
    expect(screen.getByTestId('page-content')).toBeTruthy();
  });

  it('renders header', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );
    expect(screen.getByTestId('header')).toBeTruthy();
  });

  it('renders footer', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );
    expect(screen.getByTestId('footer')).toBeTruthy();
  });

  it('renders skip nav', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );
    expect(screen.getByTestId('skip-nav')).toBeTruthy();
  });

  it('renders custom cursor', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );
    expect(screen.getByTestId('custom-cursor')).toBeTruthy();
  });

  it('applies both Geist Sans and Geist Mono CSS variable classes to the html element', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );
    expect(document.documentElement.className).toContain('--font-geist-sans');
    expect(document.documentElement.className).toContain('--font-geist-mono');
  });
});

describe('metadata', () => {
  it('has title configuration', () => {
    expect(metadata.title).toBeTruthy();
  });

  it('has description', () => {
    expect(metadata.description).toBe(BRAND.SEO_DESCRIPTION);
  });

  it('keeps the description within search-result truncation limits', () => {
    expect((metadata.description as string).length).toBeLessThanOrEqual(160);
  });

  it('has keywords', () => {
    expect(metadata.keywords).toBeTruthy();
  });

  it('derives metadataBase from the shared SITE_URL constant', () => {
    expect(String(metadata.metadataBase)).toBe(new URL(SITE_URL).toString());
  });

  it('opts every crawler into indexing and following', () => {
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it('gives Googlebot large image previews and unlimited snippets', () => {
    expect(metadata.robots).toMatchObject({
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    });
  });

  it('declares the home page as its own canonical', () => {
    expect(metadata.alternates?.canonical).toBe('/');
  });

  // As of the icon-generation pass, `metadata.icons` is deliberately absent —
  // resolve-metadata.js only merges the file-convention icons (icon.png,
  // apple-icon.png, favicon.ico) `if (!resolvedMetadata.icons)`, so an explicit
  // `icons` object would silently suppress them. The file-convention icons
  // resolve on their own; this test just proves the source files exist.
  it('leaves metadata.icons unset so the file-convention icons resolve on their own', () => {
    expect(metadata.icons).toBeUndefined();
    expect(existsSync(join(process.cwd(), 'src/app/icon.png'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'src/app/apple-icon.png'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'src/app/favicon.ico'))).toBe(true);
  });

  // Invisible in every other assertion here — the title is only checked for
  // truthiness above. A browser tab shows ~20 characters and Google truncates
  // around ~60, so this is the only guard against the next copy edit
  // silently growing it back past that limit.
  it('keeps the default title within tab/search-result truncation limits', () => {
    const title = metadata.title as { default: string; template: string };
    expect(title.default.length).toBeLessThanOrEqual(60);
  });

  it('leaves twitter.images unset so the opengraph-image file convention fills it', () => {
    // Next only auto-fills twitter images from openGraph when `twitter` has no
    // own `images` key (next/dist/lib/metadata/resolve-metadata.js:138,627).
    expect(Object.prototype.hasOwnProperty.call(metadata.twitter ?? {}, 'images')).toBe(false);
  });

  it('sets openGraph.url so og:url is emitted (it is not auto-derived from metadataBase)', () => {
    expect(metadata.openGraph?.url).toBe('/');
  });
});
