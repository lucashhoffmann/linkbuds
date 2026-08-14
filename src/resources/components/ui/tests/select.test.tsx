import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from '../select';

describe('Select', () => {
  it('matches the base input sizing classes', () => {
    render(
      <Select aria-label='Status'>
        <option value='ACTIVE'>Ativa</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: 'Status' });

    expect(select).toHaveClass('h-12');
    expect(select).toHaveClass('w-full');
  });
});
