import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import linkPagesService from '@/app/modules/link-pages/service/link-pages.service';
import type { PublicLinkPage } from '@/app/modules/link-pages/types/link-pages.types';
import { PublicLinkPagePage } from '../public-link-page.page';

const publicPage: PublicLinkPage = {
  id: 'page-id',
  name: 'Cliente Roma',
  slug: 'cliente-roma',
  status: 'ACTIVE',
  layout: 'LAYOUT_1',
  backgroundType: 'SOLID',
  backgroundColor: '#F8FAFC',
  backgroundImageUrl: null,
  avatarUrl: null,
  title: 'Cliente Roma',
  subtitle: 'Pizza artesanal',
  footerMode: 'LINKSBUDS',
  footerText: null,
  footerUrl: null,
  footerLogoUrl: null,
  links: [
    {
      id: 'link-id',
      placement: 'VERTICAL',
      kind: 'LINK',
      label: 'Reservar mesa',
      url: 'https://example.com/reservas',
      contactType: null,
      contactValue: null,
      textColor: '#111827',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderEnabled: true,
      sortOrder: 0,
      active: true,
    },
  ],
  socialLinks: [],
  images: [],
};

function getMeta(attribute: 'name' | 'property', key: string) {
  return document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    ?.getAttribute('content');
}

function getCanonical() {
  return document.head
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.getAttribute('href');
}

function renderPublicPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  window.history.pushState({}, '', '/p/cliente-roma');

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/p/cliente-roma']}>
        <Routes>
          <Route
            path='/p/:slug'
            element={<PublicLinkPagePage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PublicLinkPagePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.title = 'linkbuds';
    document.head
      .querySelectorAll('[data-linkbuds-seo="true"]')
      .forEach((element) => element.remove());
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.spyOn(linkPagesService, 'getPublic').mockResolvedValue(publicPage);
    vi.spyOn(linkPagesService, 'trackEvent').mockResolvedValue(undefined);
    vi.spyOn(linkPagesService, 'trackEventBeacon').mockReturnValue(true);
    vi.spyOn(linkPagesService, 'trackPresence').mockResolvedValue({
      onlineNow: 1,
    });
  });

  it('renders a public LinkPage and tracks page view, presence plus link click', async () => {
    renderPublicPage();

    expect(await screen.findByText('Cliente Roma')).toBeInTheDocument();
    const shell = screen.getByTestId('link-page-shell');

    expect(shell).toHaveAttribute('data-preview', 'false');
    expect(shell).toHaveClass('min-h-dvh');
    expect(shell).toHaveClass('w-full');
    expect(shell).not.toHaveClass('max-w-[390px]');
    expect(shell).not.toHaveClass('shadow-2xl');
    expect(
      screen.getByRole('link', {
        name: 'Junte-se a Cliente Roma no LinksBuds',
      }),
    ).toHaveAttribute('href', '/register');
    expect(screen.getByText('Denunciar · Privacidade')).toBeInTheDocument();
    expect(screen.getByText('Mais do LinksBuds')).toBeInTheDocument();
    expect(document.title).toBe('Cliente Roma | LinksBuds');
    expect(getCanonical()).toContain('/p/cliente-roma');
    expect(getMeta('name', 'description')).toBe('Pizza artesanal');
    expect(getMeta('name', 'robots')).toBe('index,follow');
    expect(getMeta('property', 'og:title')).toBe('Cliente Roma | LinksBuds');
    expect(getMeta('property', 'og:type')).toBe('website');

    await waitFor(() => {
      expect(linkPagesService.trackEvent).toHaveBeenCalledWith(
        'page-id',
        expect.objectContaining({
          eventType: 'PAGE_VIEW',
          eventId: expect.any(String),
          sessionId: expect.any(String),
          visitorId: expect.any(String),
        }),
      );
    });

    await waitFor(() => {
      expect(linkPagesService.trackPresence).toHaveBeenCalledWith(
        'page-id',
        expect.any(String),
      );
    });

    const bookingLink = screen.getByRole('link', { name: /reservar mesa/i });
    bookingLink.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(bookingLink);

    expect(linkPagesService.trackEventBeacon).toHaveBeenCalledWith(
      'page-id',
      expect.objectContaining({
        eventId: expect.any(String),
        eventType: 'LINK_CLICK',
        targetId: 'link-id',
        targetType: 'VERTICAL_LINK',
      }),
    );
  });

  it('marks missing public LinkPages as noindex', async () => {
    vi.spyOn(linkPagesService, 'getPublic').mockRejectedValueOnce(
      new Error('not found'),
    );

    renderPublicPage();

    expect(
      await screen.findByText('LinkPage não encontrada'),
    ).toBeInTheDocument();
    expect(document.title).toBe('LinkPage nao encontrada | LinksBuds');
    expect(getMeta('name', 'robots')).toBe('noindex');
  });
});
