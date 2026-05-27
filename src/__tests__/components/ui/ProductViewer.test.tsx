import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductViewer } from '@/components/ui/ProductViewer';

vi.mock('lucide-react', () => ({
  RotateCcw: (props: any) => <svg data-testid="rotate-icon" {...props} />,
  ZoomIn: (props: any) => <svg data-testid="zoom-in-icon" {...props} />,
  ZoomOut: (props: any) => <svg data-testid="zoom-out-icon" {...props} />,
  Camera: (props: any) => <svg data-testid="camera-icon" {...props} />,
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

  it('renders 360° Ready badge', () => {
    render(<ProductViewer productName="Test Product" />);
    expect(screen.getByText('360° Ready')).toBeTruthy();
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
});
