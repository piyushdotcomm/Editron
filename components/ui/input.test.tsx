import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './input';

describe('Input component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText(/enter text/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Type here" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/type here/i);
    
    fireEvent.change(input, { target: { value: 'Hello World' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toBe('Hello World');
  });

  it('can be disabled', () => {
    render(<Input placeholder="Disabled input" disabled />);
    const input = screen.getByPlaceholderText(/disabled input/i);
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Input placeholder="Custom class" className="custom-test-class" />);
    const input = screen.getByPlaceholderText(/custom class/i);
    expect(input).toHaveClass('custom-test-class');
  });
});
