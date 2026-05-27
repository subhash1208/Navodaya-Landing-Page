import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimateIn, Stagger, StaggerItem } from '@/components/ui/AnimateIn';

vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) => (props: any) => {
        const { initial, animate, exit, transition, whileInView, variants, viewport, ...rest } =
          props;
        return <div data-testid={`motion-${String(tag)}`} {...rest} />;
      },
    },
  ),
}));

describe('AnimateIn', () => {
  it('renders children', () => {
    render(
      <AnimateIn>
        <span>Content</span>
      </AnimateIn>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('applies className', () => {
    const { container } = render(
      <AnimateIn className="my-class">
        <span>Test</span>
      </AnimateIn>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');
    expect(motionDiv?.className).toContain('my-class');
  });

  it('renders with direction up (default)', () => {
    render(
      <AnimateIn>
        <span>Up</span>
      </AnimateIn>,
    );
    expect(screen.getByText('Up')).toBeTruthy();
  });

  it('renders with direction down', () => {
    render(
      <AnimateIn direction="down">
        <span>Down</span>
      </AnimateIn>,
    );
    expect(screen.getByText('Down')).toBeTruthy();
  });

  it('renders with direction left', () => {
    render(
      <AnimateIn direction="left">
        <span>Left</span>
      </AnimateIn>,
    );
    expect(screen.getByText('Left')).toBeTruthy();
  });

  it('renders with direction right', () => {
    render(
      <AnimateIn direction="right">
        <span>Right</span>
      </AnimateIn>,
    );
    expect(screen.getByText('Right')).toBeTruthy();
  });

  it('renders with direction none', () => {
    render(
      <AnimateIn direction="none">
        <span>None</span>
      </AnimateIn>,
    );
    expect(screen.getByText('None')).toBeTruthy();
  });

  it('accepts delay prop', () => {
    render(
      <AnimateIn delay={0.5}>
        <span>Delayed</span>
      </AnimateIn>,
    );
    expect(screen.getByText('Delayed')).toBeTruthy();
  });

  it('accepts style prop', () => {
    const { container } = render(
      <AnimateIn style={{ color: 'red' }}>
        <span>Styled</span>
      </AnimateIn>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');
    expect(motionDiv).toBeTruthy();
  });
});

describe('Stagger', () => {
  it('renders children', () => {
    render(
      <Stagger>
        <span>Child</span>
      </Stagger>,
    );
    expect(screen.getByText('Child')).toBeTruthy();
  });

  it('accepts staggerDelay prop', () => {
    render(
      <Stagger staggerDelay={0.2}>
        <span>Staggered</span>
      </Stagger>,
    );
    expect(screen.getByText('Staggered')).toBeTruthy();
  });

  it('accepts className and style', () => {
    const { container } = render(
      <Stagger className="stagger-class" style={{ gap: '8px' }}>
        <span>Item</span>
      </Stagger>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');
    expect(motionDiv?.className).toContain('stagger-class');
  });
});

describe('StaggerItem', () => {
  it('renders children', () => {
    render(
      <StaggerItem>
        <span>Item</span>
      </StaggerItem>,
    );
    expect(screen.getByText('Item')).toBeTruthy();
  });

  it('accepts className and style', () => {
    const { container } = render(
      <StaggerItem className="item-class" style={{ padding: '4px' }}>
        <span>Styled Item</span>
      </StaggerItem>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');
    expect(motionDiv?.className).toContain('item-class');
  });
});
