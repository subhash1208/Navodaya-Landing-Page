import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CounterStat } from '@/components/ui/CounterStat';

const mockFromTo = vi.fn();
const mockTo = vi.fn();
const mockCreate = vi.fn();
const mockGetAll = vi.fn().mockReturnValue([]);

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: (...args: any[]) => mockFromTo(...args),
    to: (...args: any[]) => mockTo(...args),
    set: vi.fn(),
    context: vi.fn().mockReturnValue({ revert: vi.fn() }),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: (...args: any[]) => mockCreate(...args),
    getAll: () => mockGetAll(),
  },
}));

describe('CounterStat', () => {
  beforeEach(() => {
    mockFromTo.mockClear();
    mockTo.mockClear();
    mockCreate.mockClear();
    mockGetAll.mockClear().mockReturnValue([]);
  });

  it('renders numeric value', () => {
    render(<CounterStat value="51+" label="Products in catalogue" />);
    expect(screen.getByText('51+')).toBeTruthy();
  });

  it('renders label', () => {
    render(<CounterStat value="3" label="Product categories" />);
    expect(screen.getByText('Product categories')).toBeTruthy();
  });

  it('renders non-numeric value (e.g. HYD)', () => {
    render(<CounterStat value="HYD" label="Based in Hyderabad" />);
    expect(screen.getByText('HYD')).toBeTruthy();
  });

  it('renders percentage value', () => {
    render(<CounterStat value="100%" label="B2B focused" />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('has aria-label on the value element', () => {
    render(<CounterStat value="51+" label="Products" />);
    const el = screen.getByLabelText('51+');
    expect(el).toBeTruthy();
  });

  it('creates ScrollTrigger for numeric values', async () => {
    await act(async () => {
      render(<CounterStat value="51+" label="Products" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        start: 'top 85%',
        once: true,
      }),
    );
  });

  it('calls gsap.fromTo for non-numeric values (fade in with scale)', async () => {
    mockCreate.mockImplementation((config: any) => {
      if (config.onEnter) config.onEnter();
      return { kill: vi.fn() };
    });

    await act(async () => {
      render(<CounterStat value="HYD" label="Based in Hyderabad" />);
      // Wait for dynamic import to resolve
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(mockFromTo).toHaveBeenCalled();
  });

  it('executes onEnter callback which starts counter animation', async () => {
    // Capture the onEnter callback
    mockCreate.mockImplementation((config: any) => {
      if (config.onEnter) config.onEnter();
      return { kill: vi.fn() };
    });

    await act(async () => {
      render(<CounterStat value="51+" label="Products" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // gsap.to should have been called with the counter animation
    expect(mockTo).toHaveBeenCalledWith(
      expect.objectContaining({ val: 0 }),
      expect.objectContaining({
        val: 51,
        ease: 'power2.out',
        onUpdate: expect.any(Function),
        onComplete: expect.any(Function),
      }),
    );
  });

  it('onUpdate callback updates element textContent', async () => {
    mockCreate.mockImplementation((config: any) => {
      if (config.onEnter) config.onEnter();
      return { kill: vi.fn() };
    });

    let capturedOnUpdate: (() => void) | undefined;
    let capturedOnComplete: (() => void) | undefined;
    mockTo.mockImplementation((_target: any, vars: any) => {
      capturedOnUpdate = vars.onUpdate;
      capturedOnComplete = vars.onComplete;
      return {};
    });

    let container: any;
    await act(async () => {
      const result = render(<CounterStat value="51+" label="Products" />);
      container = result.container;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const numEl = container.querySelector('[aria-label="51+"]') as HTMLElement;

    // Call onUpdate
    if (capturedOnUpdate) capturedOnUpdate();
    expect(numEl.textContent).toBe('0+');

    // Call onComplete
    if (capturedOnComplete) capturedOnComplete();
    expect(numEl.textContent).toBe('51+');
  });

  it('uses shorter duration for small numbers', async () => {
    mockCreate.mockImplementation((config: any) => {
      if (config.onEnter) config.onEnter();
      return { kill: vi.fn() };
    });

    await act(async () => {
      render(<CounterStat value="3" label="Categories" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // For numbers <= 10, duration should be 0.8
    expect(mockTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 0.8 }),
    );
  });

  it('uses longer duration for large numbers', async () => {
    mockCreate.mockImplementation((config: any) => {
      if (config.onEnter) config.onEnter();
      return { kill: vi.fn() };
    });

    await act(async () => {
      render(<CounterStat value="100%" label="B2B focused" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // For numbers > 10, duration should be 1.5
    expect(mockTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 1.5 }),
    );
  });
});
