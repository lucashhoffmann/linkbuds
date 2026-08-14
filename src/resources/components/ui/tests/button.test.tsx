import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('renders saving state with spinner label and disables the button', () => {
    render(<Button isSaving>Salvar</Button>);

    const button = screen.getByRole('button', { name: /salvando/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('Salvando...');
  });
});
