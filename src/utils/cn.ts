import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `tailwind-merge` has no visibility into the custom `fontSize` scale in `tailwind.config.ts`, so
 * it files every unrecognised `text-*` class in the text-COLOUR group. That made
 * `twMerge('text-body-sm', 'text-paper')` return only `text-paper` — the size token was dropped
 * silently, with no error and no failing test. Registering the whole custom scale in the
 * `font-size` group is what keeps a size and a colour from conflicting.
 *
 * Every key of `theme.extend.fontSize` must appear here. A token added to the Tailwind config and
 * not to this list reintroduces the same silent failure.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display-1',
        'text-display-2',
        'text-display-3',
        'text-heading-1',
        'text-heading-2',
        'text-body-lg',
        'text-body',
        'text-body-sm',
        'text-data',
        'text-label',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
