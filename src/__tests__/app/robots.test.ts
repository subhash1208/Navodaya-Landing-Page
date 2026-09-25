import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';
import { SITE_URL } from '@/constants';

describe('robots', () => {
  it('allows every user agent to crawl the whole site', () => {
    const rules = robots().rules;
    expect(Array.isArray(rules)).toBe(false);
    expect(rules).toMatchObject({ userAgent: '*', allow: '/' });
  });

  it('disallows nothing', () => {
    expect(robots().rules).not.toHaveProperty('disallow');
  });

  it('points at the absolute sitemap URL on the SITE_URL origin', () => {
    const { sitemap } = robots();
    expect(sitemap).toBe(`${new URL(SITE_URL).origin}/sitemap.xml`);
    expect(new URL(sitemap as string).pathname).toBe('/sitemap.xml');
  });
});
