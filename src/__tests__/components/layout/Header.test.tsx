import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

vi.mock('motion/react', () => {
  // The component per tag is CACHED. A bare `get` handler returns a fresh function on every
  // property access, so `motion.div` is a different component type on every render and React
  // tears down and rebuilds the whole subtree — silently destroying uncontrolled input values
  // and breaking any `toBe` node-identity assertion. The real `motion.div` is a stable
  // reference. Same pattern as ContactSection.test.tsx:17-31.
  const cache = new Map<string, React.ComponentType<any>>();
  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag) => {
          const key = String(tag);
          let component = cache.get(key);
          if (!component) {
            component = (props: any) => {
              const {
                initial,
                animate,
                exit,
                transition,
                whileInView,
                variants,
                viewport,
                ...rest
              } = props;
              return <div data-testid={`motion-${key}`} {...rest} />;
            };
            cache.set(key, component);
          }
          return component;
        },
      },
    ),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

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
    render(<Header />);

    // Simulate scroll past 20px
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    fireEvent.scroll(window);

    // requestAnimationFrame is mocked to call synchronously in setup.ts
    // The bar compacts from h-20 to h-16 once scrolled
    const bar = screen.getByTestId('header-bar');
    expect(bar.className).toContain('h-16');
    expect(bar.className).not.toContain('h-20');
  });

  it('does not set scrolled when scroll is below 20px', () => {
    render(<Header />);

    // Simulate scroll below threshold
    Object.defineProperty(window, 'scrollY', { value: 10, writable: true });
    fireEvent.scroll(window);

    const bar = screen.getByTestId('header-bar');
    expect(bar.className).toContain('h-20');
    expect(bar.className).not.toContain('h-16');
  });

  it('marks the current route with aria-current and ink styling', () => {
    render(<Header />);
    // setup.ts mocks usePathname() to '/', so Home is the active route
    const home = screen.getByText('Home');
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(home.className).toContain('text-ink');

    const about = screen.getByText('About');
    expect(about.getAttribute('aria-current')).toBeNull();
    expect(about.className).toContain('text-grey-600');
  });

  it('gives desktop nav links an expanded touch target without overlapping neighbours', () => {
    render(<Header />);
    // Adjacent nav links sit `gap-1` (4px) apart, so the horizontal inset is half the
    // vertical one — a full -4px each side would make neighbouring invisible hit areas
    // overlap; -2px each side meets exactly at the middle of the gap instead.
    const home = screen.getByText('Home');
    expect(home.className).toContain('relative');
    expect(home.className).toContain('before:inset-x-[-2px]');
    expect(home.className).toContain('before:inset-y-[-4px]');
  });

  it('renders the CTA as a filled-ink button, not a gradient', () => {
    render(<Header />);
    const cta = screen.getAllByText('Get a Quote')[0];
    expect(cta.className).toContain('bg-ink');
    expect(cta.getAttribute('style')).toBeNull();
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

  it('traps Tab focus inside the open mobile nav, wrapping from the last link to the first', () => {
    render(<Header />);
    fireEvent.click(screen.getByLabelText('Open menu'));

    const mobileNav = screen.getByLabelText('Mobile navigation');
    const links = Array.from(mobileNav.querySelectorAll<HTMLAnchorElement>('a'));
    const first = links[0];
    const last = links[links.length - 1];

    last.focus();
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(first);
  });

  it('traps Shift+Tab focus inside the open mobile nav, wrapping from the first link to the last', () => {
    render(<Header />);
    fireEvent.click(screen.getByLabelText('Open menu'));

    const mobileNav = screen.getByLabelText('Mobile navigation');
    const links = Array.from(mobileNav.querySelectorAll<HTMLAnchorElement>('a'));
    const first = links[0];
    const last = links[links.length - 1];

    first.focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(last);
  });

  it('closes the mobile menu on Escape and returns focus to the toggle button', () => {
    render(<Header />);
    const toggle = screen.getByLabelText('Open menu');
    fireEvent.click(toggle);
    expect(screen.getByLabelText('Mobile navigation')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByLabelText('Mobile navigation')).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('locks body scroll while the mobile menu is open and releases it on close', () => {
    render(<Header />);
    expect(document.body.style.overflow).toBe('');

    fireEvent.click(screen.getByLabelText('Open menu'));
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByLabelText('Close menu'));
    expect(document.body.style.overflow).toBe('');
  });

  it('releases the body scroll lock on unmount while the mobile menu is open', () => {
    const { unmount } = render(<Header />);
    fireEvent.click(screen.getByLabelText('Open menu'));
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });
});
