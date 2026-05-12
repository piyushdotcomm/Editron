import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge component', () => {
  it('renders its content', () => {
    render(<Badge>Stable</Badge>);

    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="secondary">Beta</Badge>);

    expect(screen.getByText('Beta')).toHaveClass(
      'bg-secondary',
      'text-secondary-foreground'
    );
  });

  it('merges custom class names', () => {
    render(<Badge className="tracking-wide">Preview</Badge>);

    expect(screen.getByText('Preview')).toHaveClass('tracking-wide');
  });
});
