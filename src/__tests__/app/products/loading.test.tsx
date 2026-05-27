import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProductsLoading from '@/app/products/loading';

describe('ProductsLoading', () => {
  it('renders loading skeleton', () => {
    const { container } = render(<ProductsLoading />);
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('renders loading label', () => {
    const { container } = render(<ProductsLoading />);
    expect(container.querySelector('[aria-label="Loading products"]')).toBeTruthy();
  });

  it('renders skeleton items', () => {
    const { container } = render(<ProductsLoading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders category filter skeletons', () => {
    const { container } = render(<ProductsLoading />);
    const roundedPills = container.querySelectorAll('.rounded-full.animate-pulse');
    expect(roundedPills.length).toBe(4);
  });
});
