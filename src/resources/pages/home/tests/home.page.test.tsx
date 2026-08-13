import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '../home.page';

vi.mock('@/app/modules/auth/hooks', () => ({
  useSession: () => ({
    company: {
      name: 'Linkbuds',
      email: 'company@example.com',
    },
    userAuthenticated: {
      name: 'User Test',
    },
  }),
}));

describe('HomePage', () => {
  it('renders the authenticated landing content', () => {
    render(<HomePage />);

    expect(screen.getByText('User Test')).toBeInTheDocument();
    expect(screen.getByText('Linkbuds')).toBeInTheDocument();
    expect(screen.getByText('company@example.com')).toBeInTheDocument();
  });
});
