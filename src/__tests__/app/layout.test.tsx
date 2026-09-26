import { describe, it, expect, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';
import { SITE_URL } from '@/constants';

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
    expect(metadata.description).toContain('Navodaya');
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

  it('references only icon assets that exist on disk', () => {
    const icons = metadata.icons as { icon: string; shortcut: string; apple: string };
    expect(icons.icon).toBe('/favicon.ico');
    expect(icons.shortcut).toBe('/favicon.ico');
    expect(icons.apple).toBe('/navodaya-logo.png');
    expect(existsSync(join(process.cwd(), 'src/app/favicon.ico'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'public/navodaya-logo.png'))).toBe(true);
  });

  it('leaves twitter.images unset so the opengraph-image file convention fills it', () => {
    // Next only auto-fills twitter images from openGraph when `twitter` has no
    // own `images` key (next/dist/lib/metadata/resolve-metadata.js:138,627).
    expect(Object.prototype.hasOwnProperty.call(metadata.twitter ?? {}, 'images')).toBe(false);
  });
});
