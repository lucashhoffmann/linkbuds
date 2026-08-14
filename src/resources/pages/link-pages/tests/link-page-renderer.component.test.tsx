import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicLinkPage } from '@/app/modules/link-pages/types/link-pages.types';
import { LinkPageRenderer } from '../renderer/link-page-renderer.component';

const page: PublicLinkPage = {
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
  links: [],
  socialLinks: [],
  images: [],
};

describe('LinkPageRenderer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the compact shell when rendering a preview', () => {
    render(
      <LinkPageRenderer
        linkPage={page}
        preview
      />,
    );

    const shell = screen.getByTestId('link-page-shell');

    expect(shell).toHaveAttribute('data-preview', 'true');
    expect(shell).toHaveClass('max-w-[390px]');
    expect(shell).toHaveClass('min-h-[720px]');
    expect(shell).toHaveClass('rounded-[28px]');
    expect(shell).toHaveClass('shadow-2xl');
  });

  it('renders LinksBuds branding when footer mode is LinksBuds', () => {
    render(<LinkPageRenderer linkPage={page} />);

    expect(screen.getByLabelText('LinksBuds')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compartilhar LinkPage' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Junte-se a Cliente Roma no LinksBuds',
      }),
    ).toHaveAttribute('href', '/register');
    expect(screen.getByText('Report · Privacy')).toBeInTheDocument();
    expect(screen.getByText('More from LinksBuds')).toBeInTheDocument();
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

  it('does not render LinksBuds branding when footer mode is hidden', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          footerMode: 'HIDDEN',
        }}
      />,
    );

    expect(screen.queryByLabelText('LinksBuds')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Compartilhar LinkPage' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Junte-se a Cliente Roma no LinksBuds',
      }),
    ).not.toBeInTheDocument();
  });

  it('keeps the custom footer without LinksBuds branding', () => {
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
    expect(screen.queryByLabelText('LinksBuds')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Junte-se a Cliente Roma no LinksBuds',
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

    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar LinkPage' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar LinkPage' }));

    expect(share).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });
});
