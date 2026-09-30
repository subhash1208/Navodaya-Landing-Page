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

  it('marks the Try again CTA for cursor inversion on the brand-blue background', () => {
    render(<RootError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Try again').hasAttribute('data-cursor-invert')).toBe(true);
  });

  it('offers a link back to the home page', () => {
    render(<RootError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Go Home').closest('a')?.getAttribute('href')).toBe('/');
  });

  it('keeps the digest reference on a grey that clears WCAG 1.4.3 against paper', () => {
    // grey-400 (#8E897C) on paper (#FAF8F2) is 3.28:1 at text-xs (12px) normal weight, below
    // the 4.5:1 threshold. grey-600 (#524E46) is 7.79:1 on the same ground.
    const withDigest = Object.assign(new Error('boom'), { digest: 'abc123' });
    render(<RootError error={withDigest} reset={mockReset} />);
    expect(screen.getByText(/abc123/).className).toContain('text-grey-600');
    expect(screen.getByText(/abc123/).className).not.toContain('text-grey-400');
  });

  it('replaces the amber alert icon with a SEALED-palette grey token', () => {
    render(<RootError error={mockError} reset={mockReset} />);
    const icon = screen.getByTestId('alert-icon');
    // `className` on an <svg> is an SVGAnimatedString, not a plain string — read the attribute.
    expect(icon.getAttribute('class')).toContain('text-grey-400');
    expect(icon.getAttribute('class')).not.toContain('amber');
  });
});
