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
});
