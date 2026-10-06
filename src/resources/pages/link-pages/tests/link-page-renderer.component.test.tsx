import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicLinkPage } from '@/app/modules/link-pages/types/link-pages.types';
import { LinkPageRenderer } from '../renderer/link-page-renderer.component';

const page: PublicLinkPage = {
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
  links: [],
  socialLinks: [],
  images: [],
};

describe('LinkPageRenderer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fills the preview frame with the background', () => {
    render(
      <LinkPageRenderer
        linkPage={page}
        preview
      />,
    );

    const shell = screen.getByTestId('link-page-shell');

    expect(shell).toHaveAttribute('data-preview', 'true');
    expect(shell).toHaveClass('w-full');
    expect(shell).not.toHaveClass('max-w-[430px]');
    expect(shell).toHaveClass('min-h-[720px]');
    expect(shell).not.toHaveClass('rounded-[28px]');
    expect(shell).not.toHaveClass('shadow-2xl');
  });

  it('renders LinkBuds branding when footer mode is LinkBuds', () => {
    render(<LinkPageRenderer linkPage={page} />);

    expect(screen.getByLabelText('LinkBuds')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compartilhar LinkPage' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Junte-se a Cliente Roma no LinkBuds',
      }),
    ).toHaveAttribute('href', '/register');
    // Non-functional footer texts were removed (no report/privacy pages yet).
    expect(
      screen.queryByText('Denunciar · Privacidade'),
    ).not.toBeInTheDocument();
  });

  it('renders preview links as a card with image, description and host', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          links: [
            {
              id: 'preview-link',
              placement: 'VERTICAL',
              kind: 'PREVIEW',
              label: 'Loja Roma',
              url: 'https://www.loja.example.com/promo',
              contactType: null,
              contactValue: null,
              previewImageUrl: 'https://loja.example.com/og.png',
              previewDescription: 'Pizzas com 25% off',
              textColor: '#111827',
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              borderEnabled: true,
              sortOrder: 0,
              active: true,
            },
          ],
        }}
      />,
    );

    const card = screen.getByTestId('preview-link-card');
    expect(card).toHaveAttribute('href', 'https://www.loja.example.com/promo');
    expect(card.querySelector('img')).toHaveAttribute(
      'src',
      'https://loja.example.com/og.png',
    );
    expect(card).toHaveTextContent('Loja Roma');
    expect(card).toHaveTextContent('Pizzas com 25% off');
    expect(card).toHaveTextContent('loja.example.com');
  });

  it('uses a WhatsApp icon for WhatsApp contact links', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          links: [
            {
              id: 'whatsapp-link',
              placement: 'VERTICAL',
              kind: 'CONTACT',
              label: 'Chamar no WhatsApp',
              url: null,
              contactType: 'WHATSAPP',
              contactValue: '55 (11) 99999-9999',
              textColor: '#FFFFFF',
              backgroundColor: '#25D366',
              borderColor: '#25D366',
              borderEnabled: false,
              sortOrder: 0,
              active: true,
            },
          ],
        }}
      />,
    );

    expect(screen.getByTestId('link-action-icon-whatsapp')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Chamar no WhatsApp' }),
    ).toHaveAttribute('href', 'https://wa.me/5511999999999');
  });

  it('does not render LinkBuds branding when footer mode is hidden', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          footerMode: 'HIDDEN',
        }}
      />,
    );

    expect(screen.queryByLabelText('LinkBuds')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Compartilhar LinkPage' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Junte-se a Cliente Roma no LinkBuds',
      }),
    ).not.toBeInTheDocument();
  });

  it('keeps the custom footer without LinkBuds branding', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          footerMode: 'CUSTOM',
          footerText: 'Meu rodapé',
          footerUrl: 'https://example.com',
        }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Meu rodapé' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
    expect(screen.queryByLabelText('LinkBuds')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Junte-se a Cliente Roma no LinkBuds',
      }),
    ).not.toBeInTheDocument();
  });

  it('copies the current URL when native share is unavailable', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<LinkPageRenderer linkPage={page} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Compartilhar LinkPage' }),
    );

    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it('does not share or copy when clicking share in preview mode', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <LinkPageRenderer
        linkPage={page}
        preview
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Compartilhar LinkPage' }),
    );

    expect(share).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });
});
