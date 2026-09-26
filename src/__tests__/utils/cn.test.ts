import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn() utility', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('handles empty string', () => {
    expect(cn('')).toBe('');
  });

  it('handles arrays', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
  });

  // Regression guard for the whole class of bug, not just the one instance that was found.
  // `tailwind-merge` knows nothing of this repo's custom `fontSize` scale, so before `cn()` was
  // built with `extendTailwindMerge` it filed every one of these tokens in the text-COLOUR group
  // and dropped it when merged against a real colour — silently, with no error.
  describe('custom font-size tokens survive a merge against a text colour', () => {
    const SIZE_TOKENS = [
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
    ];

    it.each(SIZE_TOKENS)('keeps %s alongside text-grey-500', (token) => {
      const result = cn(token, 'text-grey-500');
      expect(result).toContain(token);
      expect(result).toContain('text-grey-500');
    });

    it('still resolves a genuine size-vs-size conflict (last wins)', () => {
      expect(cn('text-body-sm', 'text-data')).toBe('text-data');
    });

    it('still resolves a genuine colour-vs-colour conflict (last wins)', () => {
      expect(cn('text-grey-400', 'text-grey-500')).toBe('text-grey-500');
    });

    it('keeps text-body-sm on the contact textarea class string', () => {
      const inputClass =
        'w-full px-4 py-3 bg-transparent border border-grey-500 text-body-sm text-paper placeholder:text-grey-400 outline-none transition-colors duration-150 focus:border-paper min-h-[44px]';
      const merged = cn(inputClass, 'resize-none min-h-[88px]');
      expect(merged).toContain('text-body-sm');
      expect(merged).toContain('min-h-[88px]');
      expect(merged).not.toContain('min-h-[44px]');
    });
  });
});
