import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductError from '@/app/products/[slug]/error';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  AlertTriangle: (props: any) => <svg data-testid="alert-icon" {...props} />,
}));

describe('ProductError', () => {
  const mockError = new Error('Product load failed');
  const mockReset = vi.fn();

  it('renders error heading', () => {
    render(<ProductError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Failed to load product')).toBeTruthy();
  });

  it('renders error message', () => {
    render(<ProductError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Product load failed')).toBeTruthy();
  });

  it('renders default message when error.message is empty', () => {
    const emptyError = new Error('');
    render(<ProductError error={emptyError} reset={mockReset} />);
    expect(screen.getByText('This product could not be loaded. Please try again.')).toBeTruthy();
  });

  it('renders Try again button', () => {
    render(<ProductError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('calls reset on Try again click', () => {
    render(<ProductError error={mockError} reset={mockReset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('renders Browse Products link', () => {
    render(<ProductError error={mockError} reset={mockReset} />);
    const link = screen.getByText('Browse Products');
    expect(link.closest('a')?.getAttribute('href')).toBe('/products');
  });
});
