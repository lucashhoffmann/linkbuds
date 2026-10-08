import { AxiosError } from 'axios';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import linkPagesService from '@/app/modules/link-pages/service/link-pages.service';
import type { PublicLinkPage } from '@/app/modules/link-pages/types/link-pages.types';
import {
  PublicLinkPagePage,
  isDomainHomeUnavailable,
} from '../public-link-page.page';

const publicPage: PublicLinkPage = {
  id: 'page-id',
  name: 'Cliente Roma',
  slug: 'cliente-roma',
  status: 'ACTIVE',
  parentSlug: null,
  postNetwork: null,
  postUrl: null,
  layout: 'LAYOUT_1',
  backgroundType: 'SOLID',
  backgroundColor: '#F8FAFC',
  backgroundImageUrl: null,
  avatarUrl: null,
  title: 'Cliente Roma',
  subtitle: 'Pizza artesanal',
  footerMode: 'LINKBUDS',
  footerText: null,
  footerUrl: null,
  footerLogoUrl: null,
  gtmContainerId: null,
  ga4MeasurementId: null,
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
  videos: [],
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
          <Route
            path='/'
            element={<p>raiz do domínio</p>}
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
    // App host: `_home` (custom-domain root) does not exist.
    vi.spyOn(linkPagesService, 'getPublic').mockImplementation((slug) =>
      slug === '_home'
        ? Promise.reject(new Error('not found'))
        : Promise.resolve(publicPage),
    );
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
    expect(shell).not.toHaveClass('max-w-[430px]');
    expect(shell).not.toHaveClass('shadow-2xl');
    expect(
      screen.getByRole('link', {
        name: 'Junte-se a Cliente Roma no LinkBuds',
      }),
    ).toHaveAttribute('href', '/register');
    // Non-functional footer texts were removed (no report/privacy pages yet).
    expect(
      screen.queryByText('Denunciar · Privacidade'),
    ).not.toBeInTheDocument();
    expect(document.title).toBe('Cliente Roma | LinkBuds');
    expect(getCanonical()).toContain('/p/cliente-roma');
    expect(getMeta('name', 'description')).toBe('Pizza artesanal');
    expect(getMeta('name', 'robots')).toBe('index,follow');
    expect(getMeta('property', 'og:title')).toBe('Cliente Roma | LinkBuds');
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
      await screen.findByText('LinkBud não encontrado'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Criar meu LinkBud' }),
    ).toHaveAttribute('href', '/register');
    expect(document.title).toBe('Página não encontrada | LinkBuds');
    expect(getMeta('name', 'robots')).toBe('noindex');
  });

  it('moves the agency page to the root of its custom domain', async () => {
    // Custom domain: `_home` resolves to this same page.
    vi.spyOn(linkPagesService, 'getPublic').mockResolvedValue(publicPage);
    vi.spyOn(linkPagesService, 'trackEvent').mockResolvedValue(undefined);
    vi.spyOn(linkPagesService, 'trackPresence').mockResolvedValue({
      online: 0,
    } as never);

    renderPublicPage();

    expect(await screen.findByText('raiz do domínio')).toBeInTheDocument();
    expect(linkPagesService.getPublic).toHaveBeenCalledWith('_home');
  });

  it('tells an inactive agency page on a custom domain from the app host', () => {
    const apiError = (errorCode: string) =>
      new AxiosError('not found', '404', undefined, undefined, {
        data: { errorCode },
        status: 404,
      } as never);

    expect(
      isDomainHomeUnavailable(apiError('LINK_PAGE_DOMAIN_HOME_UNAVAILABLE')),
    ).toBe(true);
    expect(isDomainHomeUnavailable(apiError('LINK_PAGE_NOT_FOUND'))).toBe(
      false,
    );
    expect(isDomainHomeUnavailable(new Error('network'))).toBe(false);
  });
});
