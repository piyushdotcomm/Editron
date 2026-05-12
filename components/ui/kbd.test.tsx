import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Kbd, KbdGroup } from './kbd';

describe('Kbd components', () => {
  it('renders keyboard shortcut text', () => {
    render(<Kbd>⌘K</Kbd>);

    expect(screen.getByText('⌘K')).toHaveAttribute('data-slot', 'kbd');
  });

  it('merges custom class names', () => {
    render(<Kbd className="uppercase">esc</Kbd>);

    expect(screen.getByText('esc')).toHaveClass('uppercase');
  });

  it('groups multiple keys', () => {
    render(
      <KbdGroup aria-label="Save shortcut">
        <Kbd>Ctrl</Kbd>
        <Kbd>S</Kbd>
      </KbdGroup>
    );

    expect(screen.getByLabelText('Save shortcut')).toHaveAttribute(
      'data-slot',
      'kbd-group'
    );
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});
