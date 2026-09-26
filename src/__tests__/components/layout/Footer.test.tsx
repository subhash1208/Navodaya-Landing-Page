import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';
import { BRAND } from '@/constants';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  Mail: (props: any) => <svg data-testid="mail-icon" {...props} />,
  Phone: (props: any) => <svg data-testid="phone-icon" {...props} />,
  MapPin: (props: any) => <svg data-testid="map-icon" {...props} />,
}));

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />);
    expect(screen.getByText('Navodaya')).toBeTruthy();
  });

  it('renders brand full name', () => {
    render(<Footer />);
    expect(screen.getByText('Navodaya Industries and Care Kits')).toBeTruthy();
  });

  it('renders nav links', () => {
    render(<Footer />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
    // 'Products' appears both as nav link and heading, use getAllByText
    const productsElements = screen.getAllByText('Products');
    expect(productsElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Contact')).toBeTruthy();
  });

  it('renders product category links', () => {
    render(<Footer />);
    expect(screen.getByText('Disposable Hygiene & Safety')).toBeTruthy();
    expect(screen.getByText('Hotel Slippers & Guest Amenities')).toBeTruthy();
    expect(screen.getByText('Disposable Spa & Salon')).toBeTruthy();
  });

  it('renders contact info', () => {
    render(<Footer />);
    expect(screen.getByText(BRAND.EMAIL)).toBeTruthy();
    expect(screen.getByText(BRAND.PHONE)).toBeTruthy();
    expect(screen.getByText(BRAND.LOCATION)).toBeTruthy();
  });

  it('renders View All Products link', () => {
    render(<Footer />);
    expect(screen.getByText('View All Products →')).toBeTruthy();
  });

  it('renders copyright', () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/)).toBeTruthy();
  });

  it('renders website link', () => {
    render(<Footer />);
    expect(screen.getByText(BRAND.WEBSITE)).toBeTruthy();
  });

  it('renders Quick Links heading', () => {
    render(<Footer />);
    expect(screen.getByText('Quick Links')).toBeTruthy();
  });

  it('renders Contact Us heading', () => {
    render(<Footer />);
    expect(screen.getByText('Contact Us')).toBeTruthy();
  });

  it('gives every footer link an expanded touch target without changing visible spacing', () => {
    render(<Footer />);
    // A `relative` + absolutely-positioned invisible `::before` grows the hit area
    // toward 44x44 without moving anything in the visible flow — every anchor in the
    // footer must carry the pattern, not just the visible text/padding classes.
    const links = [
      screen.getByText('Home'),
      screen.getByText('Disposable Hygiene & Safety'),
      screen.getByText('View All Products →'),
      screen.getByText(BRAND.EMAIL),
      screen.getByText(BRAND.PHONE),
      screen.getByText(BRAND.WEBSITE),
    ];

    for (const link of links) {
      expect(link.className).toContain('relative');
      expect(link.className).toContain('before:inset-x-[-14px]');
      expect(link.className).toContain("before:content-['']");
    }
  });
});
