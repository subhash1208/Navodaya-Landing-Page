import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('NotFound', () => {
  it('renders 404 text', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('renders Page Not Found heading', () => {
    render(<NotFound />);
    expect(screen.getByText('Page Not Found')).toBeTruthy();
  });

  it('renders description', () => {
    render(<NotFound />);
    expect(screen.getByText(/doesn't exist or has been moved/)).toBeTruthy();
  });

  it('renders Go Home link', () => {
    render(<NotFound />);
    const homeLink = screen.getByText('Go Home');
    expect(homeLink).toBeTruthy();
    expect(homeLink.closest('a')?.getAttribute('href')).toBe('/');
  });

  it('renders Browse Products link', () => {
    render(<NotFound />);
    const productsLink = screen.getByText('Browse Products');
    expect(productsLink).toBeTruthy();
    expect(productsLink.closest('a')?.getAttribute('href')).toBe('/products');
  });
});
