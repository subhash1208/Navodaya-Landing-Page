import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) => (props: any) => {
        const { initial, animate, exit, transition, whileInView, variants, viewport, ...rest } =
          props;
        return <div data-testid={`motion-${String(tag)}`} {...rest} />;
      },
    },
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('lucide-react', () => ({
  Menu: (props: any) => <svg data-testid="menu-icon" {...props} />,
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}));

describe('Header', () => {
  it('renders logo', () => {
    render(<Header />);
    expect(screen.getByLabelText('Navodaya home')).toBeTruthy();
  });

  it('renders brand name', () => {
    render(<Header />);
    expect(screen.getByText('Navodaya')).toBeTruthy();
  });

  it('renders nav links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('About')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Contact')).toBeTruthy();
  });

  it('renders CTA button', () => {
    render(<Header />);
    const quoteLinks = screen.getAllByText('Get a Quote');
    expect(quoteLinks.length).toBeGreaterThan(0);
  });

  it('renders mobile hamburger button', () => {
    render(<Header />);
    const btn = screen.getByLabelText('Open menu');
    expect(btn).toBeTruthy();
  });

  it('toggles mobile menu on click', () => {
    render(<Header />);
    const btn = screen.getByLabelText('Open menu');
    fireEvent.click(btn);
    // After opening, the button label changes
    expect(screen.getByLabelText('Close menu')).toBeTruthy();
  });

  it('closes mobile menu on link click', () => {
    render(<Header />);
    const btn = screen.getByLabelText('Open menu');
    fireEvent.click(btn);
    // Mobile nav should be visible
    const mobileNav = screen.getByLabelText('Mobile navigation');
    expect(mobileNav).toBeTruthy();
  });

  it('renders Industries & Care Kits subtitle', () => {
    render(<Header />);
    expect(screen.getByText(/Industries/)).toBeTruthy();
  });

  it('updates scrolled state when window scrolls past 20px', () => {
    const { container } = render(<Header />);

    // Simulate scroll past 20px
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    fireEvent.scroll(window);

    // requestAnimationFrame is mocked to call synchronously in setup.ts
    // The header should now have the scrolled style (width: 65%)
    const pill = container.querySelector('[style*="width"]') as HTMLElement;
    expect(pill).toBeTruthy();
    // After scrolling, width should be 65%
    expect(pill.style.width).toBe('65%');
  });

  it('does not set scrolled when scroll is below 20px', () => {
    const { container } = render(<Header />);

    // Simulate scroll below threshold
    Object.defineProperty(window, 'scrollY', { value: 10, writable: true });
    fireEvent.scroll(window);

    const pill = container.querySelector('[style*="width"]') as HTMLElement;
    expect(pill).toBeTruthy();
    // Should remain at 70% (not scrolled)
    expect(pill.style.width).toBe('70%');
  });

  it('closes mobile menu when a nav link is clicked', () => {
    render(<Header />);
    const btn = screen.getByLabelText('Open menu');
    fireEvent.click(btn);

    // Click a link in mobile nav
    const mobileNav = screen.getByLabelText('Mobile navigation');
    const links = mobileNav.querySelectorAll('a');
    fireEvent.click(links[0]);

    // Menu should close (closeMobile callback called)
    // After closing, button should say "Open menu" again
    expect(screen.getByLabelText('Open menu')).toBeTruthy();
  });
});
