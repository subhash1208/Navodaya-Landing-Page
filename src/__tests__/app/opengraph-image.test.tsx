import { describe, it, expect, vi } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BRAND } from '@/constants';

// `next/og` runs satori + resvg and cannot execute under jsdom, so the boundary
// is mocked — never the module under test. The mock records what the route
// handed to ImageResponse so the real element can still be asserted against.
const captured = vi.hoisted(() => ({
  element: null as ReactElement | null,
  options: null as Record<string, unknown> | null,
}));

vi.mock('next/og', () => ({
  ImageResponse: class {
    readonly ok = true;
    constructor(element: ReactElement, options: Record<string, unknown>) {
      captured.element = element;
      captured.options = options;
    }
  },
}));

import Image, { alt, size, contentType } from '@/app/opengraph-image';

describe('opengraph-image metadata', () => {
  it('declares the 1200x630 social card size', () => {
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  it('declares a PNG content type', () => {
    expect(contentType).toBe('image/png');
  });

  it('has alt text naming the brand and tagline', () => {
    expect(alt).toContain(BRAND.FULL_NAME);
    expect(alt).toContain(BRAND.TAGLINE);
  });
});

describe('opengraph-image generation', () => {
  it('produces an ImageResponse', () => {
    expect(Image()).toBeTruthy();
  });

  it('passes the declared size through to ImageResponse', () => {
    Image();
    expect(captured.options).toMatchObject({ width: 1200, height: 630 });
  });

  it('renders the brand name, tagline and website in SEALED colours', () => {
    Image();
    const html = renderToStaticMarkup(captured.element as ReactElement);
    expect(html).toContain(BRAND.FULL_NAME);
    expect(html).toContain(BRAND.TAGLINE);
    expect(html).toContain(BRAND.WEBSITE.toUpperCase());
    expect(html).toContain('background-color:#FAFAF8');
    expect(html).toContain('color:#0A0B0D');
  });
});
