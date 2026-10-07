import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  STEP_MS,
  SubPagesPromoDialog,
} from '../components/sub-pages-promo-dialog.component';

const mocks = vi.hoisted(() => ({ useSession: vi.fn() }));

vi.mock('@/app/modules/auth/hooks', () => ({ useSession: mocks.useSession }));

describe('SubPagesPromoDialog', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    mocks.useSession.mockReturnValue({ company: { id: 'c1' } });
  });

  afterEach(() => vi.useRealTimers());

  it('cycles post, form and questionnaire steps on its own', () => {
    render(<SubPagesPromoDialog />);
    expect(screen.getByText('Um link para cada post')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(STEP_MS));
    expect(
      screen.getByText('Formulários que captam contatos'),
    ).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(STEP_MS));
    expect(screen.getByText('Questionários com nota')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(STEP_MS));
    expect(screen.getByText('Um link para cada post')).toBeInTheDocument();
  });

  it('stops alternating once a step is picked', () => {
    render(<SubPagesPromoDialog />);
    fireEvent.click(screen.getByRole('tab', { name: /Formulário/ }));

    act(() => vi.advanceTimersByTime(STEP_MS * 2));
    expect(
      screen.getByText('Formulários que captam contatos'),
    ).toBeInTheDocument();
  });

  it('shows only once per company', () => {
    const { unmount } = render(<SubPagesPromoDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();

    render(<SubPagesPromoDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
