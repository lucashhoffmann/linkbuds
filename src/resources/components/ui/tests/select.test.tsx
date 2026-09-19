import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from '../select';

describe('Select', () => {
  it('selects an option and keeps its form value', () => {
    render(
      <Select aria-label='Status'>
        <option value='ACTIVE'>Ativa</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: 'Status' });

    expect(select).toHaveClass('h-12');
    expect(select).toHaveClass('w-full');

    fireEvent.click(select);
    fireEvent.click(screen.getByRole('option', { name: 'Ativa' }));

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Ativa',
    );
  });
});
