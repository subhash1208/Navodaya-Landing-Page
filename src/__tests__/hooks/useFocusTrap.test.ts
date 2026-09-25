import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

/**
 * Looked up by DOM `id` rather than a forwarded ref (see the hook's own doc comment),
 * so these tests build the trapped region directly in `document.body` rather than
 * rendering it through React — that mirrors exactly what the hook itself reads.
 */
function buildTrap(id: string, focusableCount = 2) {
  const container = document.createElement('div');
  container.id = id;
  for (let i = 0; i < focusableCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = `item-${i}`;
    btn.dataset.testid = `item-${i}`;
    container.appendChild(btn);
  }
  document.body.appendChild(container);
  return container;
}

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    container = buildTrap('trap-container');
  });

  afterEach(() => {
    container.remove();
  });

  it('does nothing when inactive', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    renderHook(() => useFocusTrap('trap-container', false, onClose));
    expect(addSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
  });

  it('does nothing when the container id does not exist', () => {
    expect(() => renderHook(() => useFocusTrap('does-not-exist', true, onClose))).not.toThrow();
  });

  it('wraps Tab from the last focusable element back to the first', () => {
    renderHook(() => useFocusTrap('trap-container', true, onClose));

    const first = container.querySelector<HTMLButtonElement>('[data-testid="item-0"]')!;
    const last = container.querySelector<HTMLButtonElement>('[data-testid="item-1"]')!;
    last.focus();
    expect(document.activeElement).toBe(last);

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(event);

    expect(document.activeElement).toBe(first);
    expect(event.defaultPrevented).toBe(true);
  });

  it('wraps Shift+Tab from the first focusable element back to the last', () => {
    renderHook(() => useFocusTrap('trap-container', true, onClose));

    const first = container.querySelector<HTMLButtonElement>('[data-testid="item-0"]')!;
    const last = container.querySelector<HTMLButtonElement>('[data-testid="item-1"]')!;
    first.focus();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );

    expect(document.activeElement).toBe(last);
  });

  it('pulls focus into the container on Tab when focus sits outside it', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    renderHook(() => useFocusTrap('trap-container', true, onClose));

    const first = container.querySelector<HTMLButtonElement>('[data-testid="item-0"]')!;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(document.activeElement).toBe(first);
    outside.remove();
  });

  it('pulls focus into the container on Shift+Tab when focus sits outside it', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    renderHook(() => useFocusTrap('trap-container', true, onClose));

    const last = container.querySelector<HTMLButtonElement>('[data-testid="item-1"]')!;
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );

    expect(document.activeElement).toBe(last);
    outside.remove();
  });

  it('ignores Tab when the container has no focusable elements', () => {
    const empty = document.createElement('div');
    empty.id = 'empty-trap';
    document.body.appendChild(empty);
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    renderHook(() => useFocusTrap('empty-trap', true, onClose));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(document.activeElement).toBe(outside);
    empty.remove();
    outside.remove();
  });

  it('ignores keys other than Tab and Escape', () => {
    renderHook(() => useFocusTrap('trap-container', true, onClose));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose and restores focus to restoreRef on Escape', () => {
    const toggle = document.createElement('button');
    document.body.appendChild(toggle);
    const restoreRef = createRef<HTMLElement>();
    restoreRef.current = toggle;

    renderHook(() => useFocusTrap('trap-container', true, onClose, restoreRef));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(toggle);
    toggle.remove();
  });

  it('calls onClose on Escape even without a restoreRef', () => {
    expect(() => {
      renderHook(() => useFocusTrap('trap-container', true, onClose));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }).not.toThrow();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('removes the keydown listener when it becomes inactive', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { rerender } = renderHook(
      ({ active }) => useFocusTrap('trap-container', active, onClose),
      {
        initialProps: { active: true },
      },
    );

    rerender({ active: false });

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('removes the keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useFocusTrap('trap-container', true, onClose));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
