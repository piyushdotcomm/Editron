import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils/cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should resolve tailwind conflicts', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('p-4', true && 'text-lg', false && 'bg-blue-500')).toBe('p-4 text-lg');
  });
});
