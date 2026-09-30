import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from '@/app/global-error';

describe('GlobalError', () => {
  const mockError = new Error('layout exploded');
  const noop = () => {};

  it('renders its own html and body, because it replaces the root layout', () => {
    const html = renderToStaticMarkup(<GlobalError error={mockError} reset={noop} />);
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('<body');
    expect(html).toContain('Something went wrong');
  });

  it('sets a document title without a metadata export', () => {
    const html = renderToStaticMarkup(<GlobalError error={mockError} reset={noop} />);
    expect(html).toContain('<title>Something went wrong</title>');
  });

  it('imports nothing that the failed layout owns', async () => {
    // A global error boundary renders with no stylesheet, no fonts and no
    // providers, so it must style itself inline.
    const html = renderToStaticMarkup(<GlobalError error={mockError} reset={noop} />);
    expect(html).toContain('background-color:#FAF8F2');
    expect(html).toContain('color:#0C0B08');
  });

  it('renders the digest when one is present', () => {
    const withDigest = Object.assign(new Error('boom'), { digest: 'deadbeef' });
    const html = renderToStaticMarkup(<GlobalError error={withDigest} reset={noop} />);
    expect(html).toContain('deadbeef');
  });

  it('omits the digest line when there is none', () => {
    const html = renderToStaticMarkup(<GlobalError error={mockError} reset={noop} />);
    expect(html).not.toContain('Reference:');
  });

  it('calls reset when Try again is clicked', () => {
    const reset = vi.fn();
    render(<GlobalError error={mockError} reset={reset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('keeps the digest reference on a grey that clears WCAG 1.4.3 against paper', () => {
    // grey-400 (#8E897C) on paper (#FAF8F2) is 3.28:1 at 12px normal weight, below the 4.5:1
    // threshold. grey-600 (#524E46) is 7.79:1 on the same ground (tailwind.config.ts).
    const withDigest = Object.assign(new Error('boom'), { digest: 'deadbeef' });
    const html = renderToStaticMarkup(<GlobalError error={withDigest} reset={noop} />);
    expect(html).toContain('color:#524E46');
    expect(html).not.toContain('color:#8E897C');
  });
});
