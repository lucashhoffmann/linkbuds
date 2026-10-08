import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkPagesPage } from '../link-pages.page';

const mocks = vi.hoisted(() => ({
  useGetLinkPageUseCase: vi.fn(),
  useLinkPageMutations: vi.fn(),
  useLinkPagesOverviewUseCase: vi.fn(),
  useListLinkPagesUseCase: vi.fn(),
  usePublicPageUrl: vi.fn(),
  useIsMobile: vi.fn(),
  confirmAction: vi.fn(),
}));

vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useGetLinkPageUseCase: mocks.useGetLinkPageUseCase,
  useLinkPageMutations: mocks.useLinkPageMutations,
  useLinkPagesOverviewUseCase: mocks.useLinkPagesOverviewUseCase,
  useListLinkPagesUseCase: mocks.useListLinkPagesUseCase,
  usePublicPageUrl: mocks.usePublicPageUrl,
}));

vi.mock('@/resources/components/base', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  confirmAction: mocks.confirmAction,
}));

vi.mock('@/shared/hooks/use-mobile', () => ({
  useIsMobile: mocks.useIsMobile,
}));

const base = {
  companyId: 'company-id',
  status: 'ACTIVE',
  layout: 'LAYOUT_1',
  title: '',
  subtitle: null,
  postNetwork: null,
  postUrl: null,
  createdAt: '',
  updatedAt: '',
};

const items = [
  {
    ...base,
    id: 'agency',
    name: 'Agência X',
    slug: 'agencia-x',
    publicPath: 'agencia-x',
    type: 'AGENCY',
    parentPageId: null,
  },
  {
    ...base,
    id: 'bio',
    name: 'Pizzaria',
    slug: 'pizzaria',
    publicPath: 'pizzaria',
    type: 'CLIENT',
    parentPageId: null,
  },
  {
    ...base,
    id: 'post',
    name: 'Promo terça',
    slug: 'promo',
    publicPath: 'pizzaria/promo',
    type: 'POST',
    parentPageId: 'bio',
  },
  {
    ...base,
    id: 'post-2',
    name: 'Black Friday',
    slug: 'black',
    publicPath: 'pizzaria/black',
    type: 'POST',
    postNetwork: 'INSTAGRAM',
    parentPageId: 'bio',
  },
];

function renderPage(path = '/link-pages') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LinkPagesPage />
    </MemoryRouter>,
  );
}

describe('LinkPagesPage', () => {
  const createPost = { mutate: vi.fn() };
  const update = { mutate: vi.fn(), isPending: false };

  beforeEach(() => {
    createPost.mutate.mockReset();
    update.mutate.mockReset();
    mocks.useIsMobile.mockReturnValue(false);
    mocks.useGetLinkPageUseCase.mockReturnValue({ data: undefined });
    mocks.useLinkPageMutations.mockReturnValue({
      remove: { mutate: vi.fn() },
      createPost,
      update,
    });
    mocks.usePublicPageUrl.mockReturnValue((page: { publicPath: string }) => ({
      path: `/p/${page.publicPath}`,
      url: `https://links.agencia.com/p/${page.publicPath}`,
    }));
    mocks.useLinkPagesOverviewUseCase.mockReturnValue({
      data: { pages: [{ id: 'post-2', pageViews: 7 }] },
    });
    mocks.useListLinkPagesUseCase.mockReturnValue({
      data: {
        items,
        usage: {
          maxClientPages: 1,
          remainingClientPages: 0,
          usedClientPages: 1,
        },
      },
      isLoading: false,
    });
  });

  it('lists the agency page, clients and their posts, with client quota', () => {
    renderPage();

    expect(screen.getByText('1 de 1 clientes')).toBeInTheDocument();
    expect(screen.getAllByText('Agência X').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: 'Pizzaria' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Promo terça' }),
    ).toBeInTheDocument();
    // Quota reached: new client disabled.
    expect(screen.getByRole('button', { name: /Cliente/ })).toBeDisabled();
  });

  it('shows the status badge and deactivates only after confirming', async () => {
    renderPage();

    expect(screen.getAllByText('Ativa').length).toBeGreaterThan(0);

    mocks.confirmAction.mockResolvedValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));
    await waitFor(() => expect(mocks.confirmAction).toHaveBeenCalledTimes(1));
    expect(update.mutate).not.toHaveBeenCalled();

    mocks.confirmAction.mockResolvedValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));
    await waitFor(() =>
      expect(update.mutate).toHaveBeenCalledWith(
        { status: 'INACTIVE' },
        expect.anything(),
      ),
    );
  });

  it('selects a client and creates a post under it from the canvas', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Pizzaria' }));
    expect(screen.getByText('/p/pizzaria')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Novo link de post' }));
    fireEvent.change(screen.getByLabelText('Nome do post'), {
      target: { value: 'Black Friday' },
    });
    expect(screen.getByText('/p/pizzaria/black-friday')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(createPost.mutate).toHaveBeenCalledWith(
      {
        parentId: 'bio',
        name: 'Black Friday',
        slug: 'black-friday',
        postUrl: null,
      },
      expect.any(Object),
    );
  });

  it('opens posts with their nested public path and no "new post" form', () => {
    renderPage('/link-pages?p=post');

    expect(screen.getByText('/p/pizzaria/promo')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Novo link de post' }),
    ).not.toBeInTheDocument();
  });

  it('lists the bio posts by accesses, badges the top one and previews on view', () => {
    renderPage('/link-pages?p=bio');

    fireEvent.click(screen.getByRole('radio', { name: 'Meus posts' }));
    const names = screen
      .getAllByRole('button', { name: /^Visualizar / })
      .map((button) => button.getAttribute('aria-label'));
    expect(names).toEqual([
      'Visualizar Black Friday',
      'Visualizar Promo terça',
    ]);
    expect(screen.getByText('7 acessos')).toBeInTheDocument();
    expect(screen.getAllByText('Mais acessado')).toHaveLength(1);

    fireEvent.click(
      screen.getByRole('button', { name: 'Visualizar Promo terça' }),
    );
    expect(screen.getByText('/p/pizzaria/promo')).toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: 'Meus posts' }),
    ).not.toBeInTheDocument();
  });

  it('shows the post network and filters posts by search', () => {
    renderPage('/link-pages?p=bio');

    fireEvent.click(screen.getByRole('radio', { name: 'Meus posts' }));
    expect(screen.getByRole('img', { name: 'Instagram' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar posts'), {
      target: { value: 'promo' },
    });
    expect(
      screen.queryByRole('button', { name: 'Visualizar Black Friday' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Visualizar Promo terça' }),
    ).toBeInTheDocument();
  });

  it('opens public links on the configured custom domain', () => {
    renderPage();

    expect(
      screen.getByRole('link', { name: 'Abrir link de Pizzaria' }),
    ).toHaveAttribute('href', 'https://links.agencia.com/p/pizzaria');
  });
});
