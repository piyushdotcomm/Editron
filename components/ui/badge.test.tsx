import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge component', () => {
  it('renders correctly', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText(/new/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('applies the correct variant classes', () => {
    const { rerender } = render(<Badge variant="destructive">Destructive</Badge>);
    let badge = screen.getByText(/destructive/i);
    expect(badge).toHaveClass('bg-destructive');

    rerender(<Badge variant="outline">Outline</Badge>);
    badge = screen.getByText(/outline/i);
    expect(badge).toHaveClass('text-foreground');
  });

  it('merges custom classNames correctly', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    const badge = screen.getByText(/badge/i);
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveClass('bg-primary'); // default variant
  });

  it('renders as a different component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="https://example.com">Link Badge</a>
      </Badge>
    );
    const link = screen.getByRole('link', { name: /link badge/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('bg-primary');
  });
});
