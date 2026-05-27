import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MagneticWrapper } from '@/components/ui/MagneticWrapper';

vi.mock('@/hooks/useMagneticHover', () => ({
  useMagneticHover: () => ({ current: null }),
}));

describe('MagneticWrapper', () => {
  it('renders children', () => {
    render(
      <MagneticWrapper>
        <span data-testid="child">Hello</span>
      </MagneticWrapper>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('applies className', () => {
    const { container } = render(
      <MagneticWrapper className="custom-class">
        <span>Content</span>
      </MagneticWrapper>,
    );
    expect(container.firstElementChild?.className).toContain('custom-class');
  });

  it('renders without className', () => {
    const { container } = render(
      <MagneticWrapper>
        <span>Content</span>
      </MagneticWrapper>,
    );
    expect(container.firstElementChild).toBeTruthy();
  });
});
