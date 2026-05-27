import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

vi.mock('@/components/sections/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero</div>,
}));

vi.mock('@/components/sections/AboutSection', () => ({
  default: () => <div data-testid="about-section">About</div>,
}));

vi.mock('@/components/sections/ProductCategoriesSection', () => ({
  default: () => <div data-testid="products-section">Products</div>,
}));

vi.mock('@/components/sections/WhyUsSection', () => ({
  default: () => <div data-testid="why-us-section">WhyUs</div>,
}));

vi.mock('@/components/sections/ContactSection', () => ({
  default: () => <div data-testid="contact-section">Contact</div>,
}));

vi.mock('@/components/ui/LoadingScreen', () => ({
  LoadingScreen: ({ children }: any) => <div data-testid="loading-screen">{children}</div>,
}));

vi.mock('@/components/ui/MarqueeStrip', () => ({
  MarqueeStrip: () => <div data-testid="marquee-strip">Marquee</div>,
}));

vi.mock('@/components/sections/TestimonialMarquee', () => ({
  TestimonialMarquee: () => <div data-testid="testimonial-marquee">Testimonials</div>,
}));

describe('HomePage', () => {
  it('renders all sections', () => {
    render(<HomePage />);
    expect(screen.getByTestId('hero-section')).toBeTruthy();
    expect(screen.getByTestId('about-section')).toBeTruthy();
    expect(screen.getByTestId('products-section')).toBeTruthy();
    expect(screen.getByTestId('why-us-section')).toBeTruthy();
    expect(screen.getByTestId('contact-section')).toBeTruthy();
  });

  it('renders loading screen wrapper', () => {
    render(<HomePage />);
    expect(screen.getByTestId('loading-screen')).toBeTruthy();
  });

  it('renders marquee strip', () => {
    render(<HomePage />);
    expect(screen.getByTestId('marquee-strip')).toBeTruthy();
  });

  it('renders testimonial marquee', () => {
    render(<HomePage />);
    expect(screen.getByTestId('testimonial-marquee')).toBeTruthy();
  });
});
