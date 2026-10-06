import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ConfirmDialog, confirmAction } from './confirm-dialog.component';

describe('confirmAction', () => {
  it('resolves true on confirm and false on cancel', async () => {
    render(<ConfirmDialog />);

    let result!: Promise<boolean>;
    act(() => {
      result = confirmAction({ title: 'Remover?', confirmLabel: 'Remover' });
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Remover' }));
    await expect(result).resolves.toBe(true);

    act(() => {
      result = confirmAction({ title: 'Remover?' });
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    await expect(result).resolves.toBe(false);
  });
});
