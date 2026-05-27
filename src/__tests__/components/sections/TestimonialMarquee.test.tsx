import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialMarquee } from '@/components/sections/TestimonialMarquee';

describe('TestimonialMarquee', () => {
  it('renders section with aria-label', () => {
    const { container } = render(<TestimonialMarquee />);
    const section = container.querySelector('[aria-label="Client testimonials"]');
    expect(section).toBeTruthy();
  });

  it('renders heading', () => {
    render(<TestimonialMarquee />);
    expect(screen.getByText('What Our Clients Say')).toBeTruthy();
  });

  it('renders subtitle', () => {
    render(<TestimonialMarquee />);
    expect(screen.getByText(/Trusted by hotels, hospitals/)).toBeTruthy();
  });

  it('renders testimonial rows', () => {
    render(<TestimonialMarquee />);
    // Multiple copies of testimonials exist
    const names = screen.getAllByText('Rajesh Kumar');
    expect(names.length).toBeGreaterThan(0);
  });

  it('renders testimonial quotes', () => {
    render(<TestimonialMarquee />);
    const quotes = screen.getAllByText(/game-changer/);
    expect(quotes.length).toBeGreaterThan(0);
  });

  it('renders testimonial roles', () => {
    render(<TestimonialMarquee />);
    const roles = screen.getAllByText(/GM, Grand Palace Hotels/);
    expect(roles.length).toBeGreaterThan(0);
  });
});
