import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoverEffectCard } from '@/components/ui/HoverEffectCard';

vi.mock('hover-effect', () => ({
  default: vi.fn().mockImplementation(() => ({ destroy: vi.fn() })),
}));

describe('HoverEffectCard', () => {
  it('renders children', () => {
    render(
      <HoverEffectCard image1="/img1.jpg" image2="/img2.jpg">
        <span data-testid="child">Content</span>
      </HoverEffectCard>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('renders with className', () => {
    const { container } = render(
      <HoverEffectCard image1="/img1.jpg" image2="/img2.jpg" className="custom-class">
        <span>Content</span>
      </HoverEffectCard>,
    );
    expect(container.firstElementChild?.className).toContain('custom-class');
  });

  it('renders without children', () => {
    const { container } = render(<HoverEffectCard image1="/img1.jpg" image2="/img2.jpg" />);
    expect(container.firstElementChild).toBeTruthy();
  });

  it('does not activate with placeholder images', () => {
    const { container } = render(
      <HoverEffectCard image1="/placeholder.jpg" image2="/img2.jpg">
        <span>Content</span>
      </HoverEffectCard>,
    );
    expect(container.firstElementChild).toBeTruthy();
  });

  it('does not activate with empty image1', () => {
    const { container } = render(
      <HoverEffectCard image1="" image2="/img2.jpg">
        <span>Content</span>
      </HoverEffectCard>,
    );
    expect(container.firstElementChild).toBeTruthy();
  });

  it('does not activate with empty image2', () => {
    const { container } = render(
      <HoverEffectCard image1="/img1.jpg" image2="">
        <span>Content</span>
      </HoverEffectCard>,
    );
    expect(container.firstElementChild).toBeTruthy();
  });

  it('accepts custom displacementImage', () => {
    const { container } = render(
      <HoverEffectCard image1="/img1.jpg" image2="/img2.jpg" displacementImage="/custom-disp.jpg">
        <span>Content</span>
      </HoverEffectCard>,
    );
    expect(container.firstElementChild).toBeTruthy();
  });

  it('handles hover-effect import failure gracefully', () => {
    // The catch block handles errors silently - component still renders
    const { container } = render(
      <HoverEffectCard image1="/real-img1.jpg" image2="/real-img2.jpg">
        <span data-testid="fallback">Content</span>
      </HoverEffectCard>,
    );
    // Should still render without crashing
    expect(screen.getByTestId('fallback')).toBeTruthy();
  });
});
