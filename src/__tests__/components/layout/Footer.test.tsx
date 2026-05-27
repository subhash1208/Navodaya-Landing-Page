import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

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
    expect(screen.getByText('info@navodaya.group')).toBeTruthy();
    expect(screen.getByText('+91 83286 05812')).toBeTruthy();
    expect(screen.getByText('Gandhi Nagar, Hyderabad')).toBeTruthy();
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
    expect(screen.getByText('www.navodaya.group')).toBeTruthy();
  });

  it('renders Quick Links heading', () => {
    render(<Footer />);
    expect(screen.getByText('Quick Links')).toBeTruthy();
  });

  it('renders Contact Us heading', () => {
    render(<Footer />);
    expect(screen.getByText('Contact Us')).toBeTruthy();
  });
});
