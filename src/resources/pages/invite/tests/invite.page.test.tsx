import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvitePage } from '../invite.page';

const mocks = vi.hoisted(() => ({
  useInvitePreviewUseCase: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock('@/app/modules/team/use-cases/use-team.use-case', () => ({
  useInvitePreviewUseCase: mocks.useInvitePreviewUseCase,
}));

vi.mock('@/app/modules/auth/client', () => ({
  authClient: { useSession: mocks.useSession },
  isGoogleAuthEnabled: () => false,
}));

function renderInvite() {
  return render(
    <MemoryRouter initialEntries={['/invite/token-123']}>
      <Routes>
        <Route
          path='/invite/:token'
          element={<InvitePage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

const invite = {
  companyName: 'Agência X',
  email: 'bia@agencia.com',
  expiresAt: '2026-10-10T00:00:00Z',
};

describe('InvitePage', () => {
  beforeEach(() => {
    mocks.useSession.mockReturnValue({ data: null, isPending: false });
    mocks.useInvitePreviewUseCase.mockReturnValue({
      data: invite,
      isLoading: false,
    });
  });

  it('explains invalid or expired links', () => {
    mocks.useInvitePreviewUseCase.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    renderInvite();

    expect(screen.getByText('Convite inválido')).toBeInTheDocument();
  });

  it('offers sign-up when signed out', () => {
    renderInvite();

    expect(
      screen.getByText('Você foi convidado para Agência X'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar acesso e entrar' }),
    ).toBeInTheDocument();
  });

  it('accepts only with the invited email signed in', () => {
    mocks.useSession.mockReturnValue({
      data: { user: { email: 'Bia@Agencia.com' } },
      isPending: false,
    });
    const { unmount } = renderInvite();
    expect(
      screen.getByRole('button', { name: 'Aceitar convite' }),
    ).toBeInTheDocument();
    unmount();

    mocks.useSession.mockReturnValue({
      data: { user: { email: 'outra@agencia.com' } },
      isPending: false,
    });
    renderInvite();
    expect(
      screen.queryByRole('button', { name: 'Aceitar convite' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });
});
