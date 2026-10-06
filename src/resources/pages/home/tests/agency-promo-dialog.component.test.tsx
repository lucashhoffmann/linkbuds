import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgencyPromoDialog } from '../components/agency-promo-dialog.component';

const mocks = vi.hoisted(() => ({ useSession: vi.fn() }));

vi.mock('@/app/modules/auth/hooks', () => ({ useSession: mocks.useSession }));

function renderWith(unlocked: boolean) {
  mocks.useSession.mockReturnValue({
    company: {
      id: 'c1',
      name: 'Agência Sol',
      entitlements: { customDomain: unlocked, whiteLabel: unlocked },
    },
  });
  return render(
    <MemoryRouter>
      <AgencyPromoDialog />
    </MemoryRouter>,
  );
}

describe('AgencyPromoDialog', () => {
  beforeEach(() => localStorage.clear());

  it('pitches the upgrade to plans without domain and footer', () => {
    renderWith(false);

    expect(screen.getByRole('link', { name: /Fazer upgrade/ })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('points unlocked plans to the domain settings', () => {
    renderWith(true);

    expect(
      screen.getByRole('link', { name: /Conhecer funcionalidade/ }),
    ).toHaveAttribute('href', '/settings/domain');
  });

  it('shows only once per company and plan state', () => {
    const { unmount } = renderWith(false);
    fireEvent.click(screen.getByRole('button', { name: 'Agora não' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();

    renderWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    renderWith(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
