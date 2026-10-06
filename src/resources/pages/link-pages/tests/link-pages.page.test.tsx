import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkPagesPage } from '../link-pages.page';

const mocks = vi.hoisted(() => ({
  useGetLinkPageUseCase: vi.fn(),
  useLinkPageMutations: vi.fn(),
  useListLinkPagesUseCase: vi.fn(),
  useIsMobile: vi.fn(),
}));

vi.mock('@/app/modules/link-pages/use-cases/use-link-pages.use-case', () => ({
  useGetLinkPageUseCase: mocks.useGetLinkPageUseCase,
  useLinkPageMutations: mocks.useLinkPageMutations,
  useListLinkPagesUseCase: mocks.useListLinkPagesUseCase,
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

  beforeEach(() => {
    createPost.mutate.mockReset();
    mocks.useIsMobile.mockReturnValue(false);
    mocks.useGetLinkPageUseCase.mockReturnValue({ data: undefined });
    mocks.useLinkPageMutations.mockReturnValue({
      remove: { mutate: vi.fn() },
      createPost,
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
      screen.getByRole('button', { name: /Pizzaria/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Promo terça/ }),
    ).toBeInTheDocument();
    // Quota reached: new client disabled.
    expect(screen.getByRole('button', { name: /Cliente/ })).toBeDisabled();
  });

  it('selects a client and creates a post under it from the canvas', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Pizzaria/ }));
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
});
