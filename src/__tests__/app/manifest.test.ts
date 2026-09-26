import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import manifest from '@/app/manifest';
import { BRAND } from '@/constants';

describe('manifest', () => {
  it('carries the required installability fields', () => {
    const m = manifest();
    expect(m.name).toContain(BRAND.FULL_NAME);
    expect(m.short_name).toBe(BRAND.NAME);
    expect(m.description).toBe(BRAND.MISSION);
    expect(m.start_url).toBe('/');
    expect(m.display).toBe('standalone');
  });

  it('uses the SEALED ink and paper tokens for its colours', () => {
    const m = manifest();
    expect(m.theme_color).toBe('#0A0B0D');
    expect(m.background_color).toBe('#FAFAF8');
  });

  it('references only icon files that exist in public/', () => {
    const icons = manifest().icons ?? [];
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon.src.startsWith('/')).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', icon.src))).toBe(true);
    }
  });

  it('declares the real 200x200 PNG dimensions for the logo icon', () => {
    const icons = manifest().icons ?? [];
    expect(icons[0]).toMatchObject({
      src: '/navodaya-logo.png',
      sizes: '200x200',
      type: 'image/png',
    });
  });
});
