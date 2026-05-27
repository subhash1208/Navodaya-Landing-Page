import { describe, it, expect } from 'vitest';
import { BRAND, NAV_LINKS, ROUTES, ANIMATION } from '@/constants';

describe('BRAND constants', () => {
  it('has all required fields', () => {
    expect(BRAND.NAME).toBeTruthy();
    expect(BRAND.FULL_NAME).toBeTruthy();
    expect(BRAND.TAGLINE).toBeTruthy();
    expect(BRAND.MISSION).toBeTruthy();
    expect(BRAND.EMAIL).toBeTruthy();
    expect(BRAND.PHONE).toBeTruthy();
    expect(BRAND.WEBSITE).toBeTruthy();
    expect(BRAND.LOCATION).toBeTruthy();
  });

  it('email is valid format', () => {
    expect(BRAND.EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('phone starts with +91', () => {
    expect(BRAND.PHONE).toMatch(/^\+91/);
  });

  it('website is navodaya.group', () => {
    expect(BRAND.WEBSITE).toContain('navodaya.group');
  });
});

describe('NAV_LINKS', () => {
  it('has at least 4 links', () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(4);
  });

  it('every link has label and href', () => {
    for (const link of NAV_LINKS) {
      expect(link.label, 'Link missing label').toBeTruthy();
      expect(link.href, `${link.label} missing href`).toBeTruthy();
    }
  });

  it('includes Home, About, Products, Contact', () => {
    const labels = NAV_LINKS.map((l) => l.label);
    expect(labels).toContain('Home');
    expect(labels).toContain('About');
    expect(labels).toContain('Products');
    expect(labels).toContain('Contact');
  });

  it('Home links to /', () => {
    const home = NAV_LINKS.find((l) => l.label === 'Home');
    expect(home?.href).toBe('/');
  });
});

describe('ROUTES', () => {
  it('HOME is /', () => {
    expect(ROUTES.HOME).toBe('/');
  });

  it('PRODUCTS is /products', () => {
    expect(ROUTES.PRODUCTS).toBe('/products');
  });

  it('PRODUCT generates correct slug URL', () => {
    expect(ROUTES.PRODUCT('surgeon-cap')).toBe('/products/surgeon-cap');
  });

  it('CONTACT is /#contact', () => {
    expect(ROUTES.CONTACT).toBe('/#contact');
  });
});

describe('ANIMATION constants', () => {
  it('has duration values', () => {
    expect(ANIMATION.DURATION.MICRO).toBeGreaterThan(0);
    expect(ANIMATION.DURATION.COMPONENT).toBeGreaterThan(0);
    expect(ANIMATION.DURATION.PAGE).toBeGreaterThan(0);
    expect(ANIMATION.DURATION.LOADING).toBeGreaterThan(0);
  });

  it('loading duration is <= 4000ms', () => {
    expect(ANIMATION.DURATION.LOADING).toBeLessThanOrEqual(4000);
  });

  it('has stagger value', () => {
    expect(ANIMATION.STAGGER).toBeGreaterThan(0);
  });

  it('has threshold between 0 and 1', () => {
    expect(ANIMATION.THRESHOLD).toBeGreaterThan(0);
    expect(ANIMATION.THRESHOLD).toBeLessThanOrEqual(1);
  });
});
