import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import linkPagesService from '@/app/modules/link-pages/service/link-pages.service';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { LinkPageNewPage } from '../link-page-new.page';

const createdPage: LinkPageDetail = {
  id: 'new-page-id',
  companyId: 'company-id',
  name: 'Cliente Roma',
  slug: 'cliente-roma',
  type: 'CLIENT',
  status: 'ACTIVE',
  layout: 'LAYOUT_2',
  title: 'Cliente Roma',
  subtitle: null,
  backgroundType: 'SOLID',
  backgroundColor: '#FFFFFF',
  backgroundImageUrl: null,
  avatarUrl: null,
  footerMode: 'LINKSBUDS',
  footerText: null,
  footerUrl: null,
  footerLogoUrl: null,
  links: [],
  socialLinks: [],
  images: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderLinkPageNewPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/link-pages/new']}>
        <Routes>
          <Route
            path='/link-pages/new'
            element={<LinkPageNewPage />}
          />
          <Route
            path='/link-pages/:id/edit'
            element={<div>Editor aberto</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LinkPageNewPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(linkPagesService, 'create').mockResolvedValue(createdPage);
  });

  it('renders layout previews and creates with the selected layout', async () => {
    const user = userEvent.setup();

    renderLinkPageNewPage();

    expect(screen.getByRole('button', { name: /Layout 1/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Layout 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Layout 3/i })).toBeInTheDocument();
    expect(screen.getByText('Sua nova LinkPage')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome interno'), 'Cliente Roma');
    expect(screen.getByLabelText('Slug')).toHaveValue('cliente-roma');
    expect(screen.getByText('Cliente Roma')).toBeInTheDocument();
    expect(screen.getByText('linksbuds.com/p/cliente-roma')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Layout 2/i }));
    expect(screen.getByRole('button', { name: /Layout 2/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Criar e editar' }));

    await waitFor(() => {
      expect(linkPagesService.create).toHaveBeenCalledWith({
        name: 'Cliente Roma',
        slug: 'cliente-roma',
        layout: 'LAYOUT_2',
      });
    });
    expect(await screen.findByText('Editor aberto')).toBeInTheDocument();
  });
});
