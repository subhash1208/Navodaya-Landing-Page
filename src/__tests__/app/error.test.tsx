import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RootError from '@/app/error';

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

describe('RootError', () => {
  const mockError = new Error('Root boundary failure');
  const mockReset = vi.fn();

  it('renders the error heading', () => {
    render(<RootError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders the error message', () => {
    render(<RootError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Root boundary failure')).toBeTruthy();
  });

  it('falls back to a generic message when error.message is empty', () => {
    render(<RootError error={new Error('')} reset={mockReset} />);
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
  });

  it('shows the digest when one is present', () => {
    const withDigest = Object.assign(new Error('boom'), { digest: 'abc123' });
    render(<RootError error={withDigest} reset={mockReset} />);
    expect(screen.getByText(/abc123/)).toBeTruthy();
  });

  it('omits the digest line when there is no digest', () => {
    render(<RootError error={mockError} reset={mockReset} />);
    expect(screen.queryByText(/Reference:/)).toBeNull();
  });

  it('calls reset when Try again is clicked', () => {
    const reset = vi.fn();
    render(<RootError error={mockError} reset={reset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('offers a link back to the home page', () => {
    render(<RootError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Go Home').closest('a')?.getAttribute('href')).toBe('/');
  });
});
