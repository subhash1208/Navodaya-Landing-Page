import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarqueeStrip } from '@/components/ui/MarqueeStrip';

describe('MarqueeStrip', () => {
  it('renders marquee content', () => {
    render(<MarqueeStrip />);
    // Multiple copies exist, just check at least one
    const items = screen.getAllByText('51+ Products');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders all marquee items', () => {
    render(<MarqueeStrip />);
    expect(screen.getAllByText('3 Categories').length).toBeGreaterThan(0);
    expect(screen.getAllByText('B2B Focused').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hotels').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hospitals').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Spas').length).toBeGreaterThan(0);
  });

  it('has aria-hidden on the container', () => {
    const { container } = render(<MarqueeStrip />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders fade edge elements', () => {
    const { container } = render(<MarqueeStrip />);
    const fadeEdges = container.querySelectorAll('.pointer-events-none');
    expect(fadeEdges.length).toBeGreaterThanOrEqual(2);
  });
});
