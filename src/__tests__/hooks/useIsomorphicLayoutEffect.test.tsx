import { describe, it, expect, vi, afterEach } from 'vitest';
import { useEffect, useLayoutEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useTypewriter } from '@/hooks/useTypewriter';

describe('useIsomorphicLayoutEffect', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('resolves to useLayoutEffect in a browser-like environment', () => {
    // jsdom defines `window`, so this is the client branch. Resolving to `useEffect` here
    // would break the whole point of the hook: `useEffect` runs after paint, so a component
    // that server-renders its finished state would flash that state for a frame.
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
    expect(useIsomorphicLayoutEffect).not.toBe(useEffect);
  });

  it('falls back to useEffect where there is no window', async () => {
    // The branch that only ever executes on the server. The module picks its implementation
    // at import time, so the global has to be stubbed before a fresh import — re-importing
    // without resetModules would just hand back the cached client-side binding.
    vi.resetModules();
    vi.stubGlobal('window', undefined);

    const { useIsomorphicLayoutEffect: serverVariant } =
      await import('@/hooks/useIsomorphicLayoutEffect');

    expect(serverVariant).toBe(useEffect);
    expect(serverVariant).not.toBe(useLayoutEffect);
  });

  it('is a usable hook, not just a reference', () => {
    const calls: string[] = [];
    function Probe() {
      useIsomorphicLayoutEffect(() => {
        calls.push('ran');
      }, []);
      return null;
    }
    // On the server neither effect runs, so this asserts it is *callable* during SSR without
    // throwing — the reason the useEffect fallback exists at all.
    expect(renderToStaticMarkup(<Probe />)).toBe('');
    expect(calls).toEqual([]);
  });
});

describe('useTypewriter server rendering', () => {
  function Probe({ text }: { text: string }) {
    const { displayed } = useTypewriter({ text });
    return <span>{displayed}</span>;
  }

  it('server-renders the complete text rather than an empty string', () => {
    // The hook holds `text` as its initial state and only winds back to '' in a layout
    // effect, which never runs on the server. Before this, the initial state was '' and
    // every server-rendered typewriter shipped an empty element.
    expect(renderToStaticMarkup(<Probe text="Hello world" />)).toBe('<span>Hello world</span>');
  });
});
