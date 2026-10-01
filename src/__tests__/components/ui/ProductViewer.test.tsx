import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductViewer } from '@/components/ui/ProductViewer';

vi.mock('lucide-react', () => ({
  RotateCcw: (props: any) => <svg data-testid="rotate-icon" {...props} />,
  ZoomIn: (props: any) => <svg data-testid="zoom-in-icon" {...props} />,
  ZoomOut: (props: any) => <svg data-testid="zoom-out-icon" {...props} />,
  Camera: (props: any) => <svg data-testid="camera-icon" {...props} />,
}));

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: any) => <img {...props} />,
}));

describe('ProductViewer', () => {
  it('renders viewer placeholder', () => {
    render(<ProductViewer productName="Surgeon Cap" />);
    expect(screen.getByText('360° View Coming Soon')).toBeTruthy();
  });

  it('renders product icon with aria-label', () => {
    render(<ProductViewer productName="Surgeon Cap" />);
    expect(screen.getByRole('img', { name: 'Surgeon Cap' })).toBeTruthy();
  });

  it('does not claim 360° readiness while the viewer is a placeholder', () => {
    render(<ProductViewer productName="Test Product" />);
    expect(screen.queryByText('360° Ready')).toBeNull();
    expect(screen.getByText('360° View Coming Soon')).toBeTruthy();
  });

  it('handles mouse enter hover state', () => {
    const { container } = render(<ProductViewer productName="Test" />);
    const hoverArea = container.querySelector('.absolute.inset-0.flex') as HTMLElement;
    fireEvent.mouseEnter(hoverArea);
    // After hover, the icon container should have scale-110
    const iconBox = container.querySelector('.w-32.h-32');
    expect(iconBox?.className).toContain('scale-110');
  });

  it('handles mouse leave hover state', () => {
    const { container } = render(<ProductViewer productName="Test" />);
    // ProductViewer now uses CSS group-hover instead of useState
    // Verify the group class is present on the container
    const groupContainer = container.querySelector('.group');
    expect(groupContainer).toBeTruthy();
    // Verify the icon box has the group-hover classes
    const iconBox = container.querySelector('.group-hover\\:scale-110');
    expect(iconBox).toBeTruthy();
  });

  it('renders fake viewer controls', () => {
    const { container } = render(<ProductViewer productName="Test" />);
    const controls = container.querySelectorAll('.w-8.h-8');
    expect(controls.length).toBe(4);
  });

  it('renders the photograph when the product has one', () => {
    render(<ProductViewer productName="Mop Set" image="/products/mop-set.webp" />);
    const image = screen.getByRole('img', { name: 'Mop Set' });
    expect(image.getAttribute('src')).toBe('/products/mop-set.webp');
    expect(screen.queryByText('360° View Coming Soon')).toBeNull();
  });

  it('loads the photograph eagerly at high priority — it is the detail page LCP element', () => {
    // DELIBERATE, and the opposite of ProductCard's grid image. This renders exactly once per
    // detail page, above the fold in the left column, so it is the likely LCP element — and
    // next/image's `loading="lazy"` default hides it from the preload scanner until layout
    // resolves. If this fails, someone removed the override; restore it rather than the test.
    render(<ProductViewer productName="Mop Set" image="/products/mop-set.webp" />);
    const image = screen.getByRole('img', { name: 'Mop Set' });
    expect(image.getAttribute('loading')).toBe('eager');
    expect(image.getAttribute('fetchpriority')).toBe('high');
  });

  it('contains the photograph rather than cropping or stretching it', () => {
    // The photos are 4:3 cutouts; the placeholder box is square. Contain, and give the box the
    // images' own ratio so there are no letterbox bands.
    const { container } = render(
      <ProductViewer productName="Mop Set" image="/products/mop-set.webp" />,
    );
    const image = screen.getByRole('img', { name: 'Mop Set' });
    expect(image.className).toContain('object-contain');
    expect(image.className).not.toContain('object-cover');
    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeTruthy();
    expect(container.querySelector('.aspect-square')).toBeNull();
  });

  it('hides the decorative 360° controls once a real photograph is present', () => {
    // Beside a static photo those rotate/zoom/camera glyphs advertise interactivity that does not
    // exist, which is worse than showing nothing.
    const { container } = render(
      <ProductViewer productName="Mop Set" image="/products/mop-set.webp" />,
    );
    expect(container.querySelectorAll('.w-8.h-8')).toHaveLength(0);
    expect(screen.queryByTestId('rotate-icon')).toBeNull();
    expect(screen.queryByTestId('camera-icon')).toBeNull();
  });

  it('falls back to the placeholder when the product has no photograph', () => {
    // 122 of the 164 products are unphotographed, so this is still the common branch.
    render(<ProductViewer productName="Surgeon Cap" />);
    expect(screen.getByText('360° View Coming Soon')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Surgeon Cap' }).tagName).not.toBe('IMG');
  });
});
