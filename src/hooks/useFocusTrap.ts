'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab / Shift-Tab focus inside the element with id `containerId` while `active` is
 * true, and closes on Escape via `onClose` — restoring focus to `restoreRef` (typically
 * the control that opened the trapped region) as part of the same keystroke.
 *
 * Looked up by `id` rather than a ref forwarded onto the container. The trapped element
 * this was built for (`Header`'s mobile nav) is a `motion.nav`, and this repo's test
 * mocks for `motion/react` are plain function components that do not forward refs — a
 * ref prop would silently read `null` under those mocks. An `id` lookup works
 * identically against the real animated element and the mock, since both render the
 * same `id` attribute.
 *
 * Does not steal focus on open, and does not restore focus on an ordinary close (e.g.
 * clicking a link inside the trapped region) — only Escape restores focus, since a link
 * click already has its own destination for focus to land on.
 */
export function useFocusTrap(
  containerId: string,
  active: boolean,
  onClose: () => void,
  restoreRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        restoreRef?.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || !container.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last || !container.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [containerId, active, onClose, restoreRef]);
}
