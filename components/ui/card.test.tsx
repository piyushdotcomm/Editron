import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

describe('Card components', () => {
  it('renders a composed card structure', () => {
    render(
      <Card aria-label="Project summary">
        <CardHeader>
          <CardTitle>Launch plan</CardTitle>
          <CardDescription>Ready for review</CardDescription>
          <CardAction>
            <button type="button">Open</button>
          </CardAction>
        </CardHeader>
        <CardContent>Three pending tasks</CardContent>
        <CardFooter>Updated today</CardFooter>
      </Card>
    );

    expect(screen.getByLabelText('Project summary')).toHaveAttribute(
      'data-slot',
      'card'
    );
    expect(screen.getByText('Launch plan')).toHaveAttribute(
      'data-slot',
      'card-title'
    );
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
    expect(screen.getByText('Three pending tasks')).toHaveAttribute(
      'data-slot',
      'card-content'
    );
  });

  it('merges class names on child slots', () => {
    render(<CardFooter className="justify-between">Footer</CardFooter>);

    expect(screen.getByText('Footer')).toHaveClass(
      'flex',
      'justify-between'
    );
  });
});
