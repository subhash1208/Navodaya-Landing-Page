import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsError from '@/app/products/error';

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

describe('ProductsError', () => {
  const mockError = new Error('Test error message');
  const mockReset = vi.fn();

  it('renders error heading', () => {
    render(<ProductsError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders error message', () => {
    render(<ProductsError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeTruthy();
  });

  it('renders default message when error.message is empty', () => {
    const emptyError = new Error('');
    render(<ProductsError error={emptyError} reset={mockReset} />);
    expect(
      screen.getByText('Failed to load the product catalogue. Please try again.'),
    ).toBeTruthy();
  });

  it('renders Try again button', () => {
    render(<ProductsError error={mockError} reset={mockReset} />);
    const btn = screen.getByText('Try again');
    expect(btn).toBeTruthy();
  });

  it('calls reset on Try again click', () => {
    render(<ProductsError error={mockError} reset={mockReset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('renders Go Home link', () => {
    render(<ProductsError error={mockError} reset={mockReset} />);
    const link = screen.getByText('Go Home');
    expect(link.closest('a')?.getAttribute('href')).toBe('/');
  });
});
