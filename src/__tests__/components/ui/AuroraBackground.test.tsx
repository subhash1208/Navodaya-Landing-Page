import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

describe('AuroraBackground', () => {
  it('renders with className prop', () => {
    const { container } = render(<AuroraBackground className="absolute inset-0" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeTruthy();
    // cn() merges tailwind classes — 'absolute' overrides 'relative'
    expect(wrapper.className).toContain('absolute');
    expect(wrapper.className).toContain('inset-0');
  });

  it('renders children', () => {
    render(
      <AuroraBackground>
        <span data-testid="child">Hello</span>
      </AuroraBackground>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('renders aurora layer with aria-hidden', () => {
    const { container } = render(<AuroraBackground />);
    const ariaHidden = container.querySelector('[aria-hidden="true"]');
    expect(ariaHidden).toBeTruthy();
  });

  it('renders without className', () => {
    const { container } = render(<AuroraBackground />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('relative');
  });

  it('renders without children', () => {
    const { container } = render(<AuroraBackground />);
    expect(container.firstElementChild).toBeTruthy();
  });
});
