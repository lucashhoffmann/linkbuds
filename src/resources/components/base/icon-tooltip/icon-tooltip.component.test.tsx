import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IconTooltip } from './icon-tooltip.component';

describe('IconTooltip', () => {
  it('shows label for icon-only buttons and ignores text buttons', () => {
    render(
      <>
        <IconTooltip />
        <button
          type='button'
          title='Editar'
          aria-label='Editar formulário'
        >
          <svg />
        </button>
        <button
          type='button'
          aria-label='Salvar tudo'
        >
          Salvar
        </button>
      </>,
    );

    const icon = screen.getByRole('button', { name: 'Editar formulário' });
    fireEvent.pointerOver(icon, { pointerType: 'mouse' });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Editar');
    expect(icon).not.toHaveAttribute('title');

    fireEvent.pointerOver(screen.getByText('Salvar'), { pointerType: 'mouse' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
