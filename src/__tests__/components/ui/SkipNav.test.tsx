import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipNav } from '@/components/ui/SkipNav';

describe('SkipNav', () => {
  it('renders skip to content link', () => {
    render(<SkipNav />);
    expect(screen.getByText('Skip to content')).toBeTruthy();
  });

  it('links to #main-content', () => {
    render(<SkipNav />);
    const link = screen.getByText('Skip to content');
    expect(link.getAttribute('href')).toBe('#main-content');
  });

  it('is visually hidden by default', () => {
    render(<SkipNav />);
    const link = screen.getByText('Skip to content') as HTMLElement;
    expect(link.style.width).toBe('1px');
    expect(link.style.height).toBe('1px');
    expect(link.style.overflow).toBe('hidden');
  });

  it('becomes visible on focus', () => {
    render(<SkipNav />);
    const link = screen.getByText('Skip to content') as HTMLElement;
    fireEvent.focus(link);
    expect(link.style.width).toBe('auto');
    expect(link.style.height).toBe('auto');
    expect(link.style.position).toBe('fixed');
  });

  it('hides again on blur', () => {
    render(<SkipNav />);
    const link = screen.getByText('Skip to content') as HTMLElement;
    fireEvent.focus(link);
    fireEvent.blur(link);
    expect(link.style.width).toBe('1px');
    expect(link.style.height).toBe('1px');
    expect(link.style.overflow).toBe('hidden');
  });
});
