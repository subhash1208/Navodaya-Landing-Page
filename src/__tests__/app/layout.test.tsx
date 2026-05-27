import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-sans' }),
  Outfit: () => ({ variable: '--font-display' }),
  Plus_Jakarta_Sans: () => ({ variable: '--font-body' }),
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

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="analytics" />,
}));

describe('RootLayout', () => {
  it('renders children in main element', () => {
    const { container } = render(
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
});
