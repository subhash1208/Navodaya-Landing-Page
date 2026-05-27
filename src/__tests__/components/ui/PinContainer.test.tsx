import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PinContainer } from '@/components/ui/PinContainer';

describe('PinContainer', () => {
  it('renders children', () => {
    render(
      <PinContainer>
        <span data-testid="child">Content</span>
      </PinContainer>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('applies className', () => {
    const { container } = render(
      <PinContainer className="extra">
        <span>Content</span>
      </PinContainer>,
    );
    expect(container.firstElementChild?.className).toContain('extra');
  });

  it('applies tilt transform on mouse enter', () => {
    const { container } = render(
      <PinContainer>
        <span>Content</span>
      </PinContainer>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);
    const inner = wrapper.firstElementChild as HTMLElement;
    expect(inner.style.transform).toContain('rotateX(8deg)');
  });

  it('resets transform on mouse leave', () => {
    const { container } = render(
      <PinContainer>
        <span>Content</span>
      </PinContainer>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    const inner = wrapper.firstElementChild as HTMLElement;
    expect(inner.style.transform).toContain('rotateX(0deg)');
  });
});
