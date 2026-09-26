import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimateIn, Stagger, StaggerItem } from '@/components/ui/AnimateIn';

vi.mock('motion/react', () => {
  // The component per tag is CACHED. A bare `get` handler returns a fresh function on every
  // property access, so `motion.div` is a different component type on every render and React
  // tears down and rebuilds the whole subtree — silently destroying uncontrolled input values
  // and breaking any `toBe` node-identity assertion. The real `motion.div` is a stable
  // reference. Same pattern as ContactSection.test.tsx:17-31.
  const cache = new Map<string, React.ComponentType<any>>();
  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag) => {
          const key = String(tag);
          let component = cache.get(key);
          if (!component) {
            component = (props: any) => {
              const {
                initial,
                animate,
                exit,
                transition,
                whileInView,
                variants,
                viewport,
                ...rest
              } = props;
              // `initial` and `animate` are surfaced as data attributes rather than dropped:
              // they are the props that decide whether the server ships `style="opacity:0"`,
              // so a mock that silently discards them cannot tell a working reveal from a
              // broken one.
              return (
                <div
                  data-testid={`motion-${key}`}
                  data-initial={JSON.stringify(initial ?? null)}
                  data-animate={JSON.stringify(animate ?? null)}
                  data-while-in-view={JSON.stringify(whileInView ?? null)}
                  data-variants={JSON.stringify(variants ?? null)}
                  {...rest}
                />
              );
            };
            cache.set(key, component);
          }
          return component;
        },
      },
    ),
  };
});

function setReducedMotion(reduce: boolean) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('AnimateIn', () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

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

  it('never passes an animatable `initial`, so the server cannot ship opacity:0', () => {
    const { container } = render(
      <AnimateIn>
        <span>Crawlable</span>
      </AnimateIn>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');
    expect(motionDiv?.getAttribute('data-initial')).toBe('false');
  });

  it('winds back to hidden after the layout effect, then reveals on scroll into view', () => {
    const { container } = render(
      <AnimateIn direction="left">
        <span>Reveal me</span>
      </AnimateIn>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');

    // Testing Library flushes the layout effect before this assertion, so `animate` is the
    // wound-back hidden target — the state the reveal animates away from.
    expect(JSON.parse(motionDiv?.getAttribute('data-animate') ?? 'null')).toMatchObject({
      opacity: 0,
      x: 40,
      y: 0,
    });

    // …and the in-view gesture, which outranks `animate`, restores it.
    expect(JSON.parse(motionDiv?.getAttribute('data-while-in-view') ?? 'null')).toMatchObject({
      opacity: 1,
      x: 0,
      y: 0,
    });
  });

  it('renders content visible and never winds back under prefers-reduced-motion', () => {
    setReducedMotion(true);

    const { container } = render(
      <AnimateIn direction="up">
        <span>Always visible</span>
      </AnimateIn>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');

    expect(screen.getByText('Always visible')).toBeTruthy();
    expect(JSON.parse(motionDiv?.getAttribute('data-animate') ?? 'null')).toMatchObject({
      opacity: 1,
      x: 0,
      y: 0,
    });
  });

  it('carries the reveal timing on the in-view target, not on a shared transition prop', () => {
    // `whileInView` outranks `animate`; a single top-level `transition` would be shared by the
    // instant wind-back and the 0.6s reveal, so one of the two would get the wrong duration.
    const { container } = render(
      <AnimateIn delay={0.3}>
        <span>Timed</span>
      </AnimateIn>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');

    expect(JSON.parse(motionDiv?.getAttribute('data-while-in-view') ?? 'null').transition).toEqual({
      duration: 0.6,
      delay: 0.3,
      ease: [0.34, 1.06, 0.64, 1],
    });
    expect(JSON.parse(motionDiv?.getAttribute('data-animate') ?? 'null').transition).toEqual({
      duration: 0,
    });
  });
});

describe('Stagger', () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

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

  it('never passes an animatable `initial`, so the server cannot ship opacity:0', () => {
    // `initial="hidden"` is the whole defect: motion resolves that label against each child's
    // variants and serialises the result into the child's inline style on the server.
    const { container } = render(
      <Stagger>
        <span>Crawlable</span>
      </Stagger>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');
    expect(motionDiv?.getAttribute('data-initial')).toBe('false');
  });

  it('winds back to the hidden label after the layout effect, then reveals on scroll into view', () => {
    const { container } = render(
      <Stagger>
        <span>Reveal me</span>
      </Stagger>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');

    // Testing Library flushes the layout effect before this assertion.
    expect(motionDiv?.getAttribute('data-animate')).toBe('"hidden"');
    // …and the in-view gesture, which outranks `animate`, restores it.
    expect(motionDiv?.getAttribute('data-while-in-view')).toBe('"visible"');
  });

  it('renders content visible and never winds back under prefers-reduced-motion', () => {
    setReducedMotion(true);

    const { container } = render(
      <Stagger>
        <span>Always visible</span>
      </Stagger>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');

    expect(screen.getByText('Always visible')).toBeTruthy();
    expect(motionDiv?.getAttribute('data-animate')).toBe('"visible"');
  });

  it('keeps the stagger delay on the visible variant so children still cascade', () => {
    const { container, rerender } = render(
      <Stagger>
        <span>Default</span>
      </Stagger>,
    );
    const variants = (el: Element | null) =>
      JSON.parse(el?.getAttribute('data-variants') ?? 'null');

    expect(variants(container.querySelector('[data-testid="motion-div"]')).visible).toEqual({
      transition: { staggerChildren: 0.1 },
    });

    rerender(
      <Stagger staggerDelay={0.25}>
        <span>Custom</span>
      </Stagger>,
    );
    expect(variants(container.querySelector('[data-testid="motion-div"]')).visible).toEqual({
      transition: { staggerChildren: 0.25 },
    });
  });
});

describe('StaggerItem', () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

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

  it('inherits initial and animate from Stagger rather than declaring its own', () => {
    // The parent owns the wind-back state; the child must stay a pure variant node so motion's
    // variant context reaches it. A child that declared its own `initial` would opt out.
    const { container } = render(
      <StaggerItem>
        <span>Inheriting</span>
      </StaggerItem>,
    );
    const motionDiv = container.querySelector('[data-testid="motion-div"]');

    expect(motionDiv?.getAttribute('data-initial')).toBe('null');
    expect(motionDiv?.getAttribute('data-animate')).toBe('null');
  });

  it('winds back instantly but reveals over 0.5s', () => {
    const { container } = render(
      <StaggerItem>
        <span>Timed</span>
      </StaggerItem>,
    );
    const variants = JSON.parse(
      container.querySelector('[data-testid="motion-div"]')?.getAttribute('data-variants') ??
        'null',
    );

    expect(variants.hidden).toEqual({ opacity: 0, y: 32, transition: { duration: 0 } });
    expect(variants.visible).toEqual({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.34, 1.06, 0.64, 1] },
    });
  });
});
