import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  videos: [],
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
    expect(shell).toHaveClass('min-h-full');
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

  it('renders video blocks with muted autoplay embeds and the chosen size', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          videos: [
            {
              id: 'video-yt',
              url: 'https://youtu.be/dQw4w9WgXcQ',
              title: 'Tour da loja',
              autoplay: true,
              controls: true,
              size: 'CUSTOM',
              customHeight: 400,
              sortOrder: 0,
              active: true,
            },
            {
              id: 'video-file',
              url: 'https://cdn.example.com/promo.mp4',
              title: null,
              autoplay: false,
              controls: false,
              size: 'SMALL',
              customHeight: null,
              sortOrder: 1,
              active: true,
            },
            {
              id: 'video-bad',
              url: 'https://example.com/"><script>',
              title: null,
              autoplay: false,
              controls: false,
              size: 'MEDIUM',
              customHeight: null,
              sortOrder: 2,
              active: true,
            },
          ],
        }}
      />,
    );

    const [youtube, file] = screen.getAllByTestId('video-card');
    expect(screen.getAllByTestId('video-card')).toHaveLength(2);
    const iframe = youtube.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0&autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ',
    );
    expect(iframe).toHaveStyle({ height: '400px' });
    expect(youtube).toHaveTextContent('Tour da loja');
    const video = file.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://cdn.example.com/promo.mp4');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).not.toHaveAttribute('controls');
    expect(video).toHaveStyle({ height: '140px' });
  });

  it('interleaves vertical links, images and videos by the shared order', () => {
    const link = (id: string, sortOrder: number) => ({
      id,
      placement: 'VERTICAL' as const,
      kind: 'LINK' as const,
      label: id,
      url: `https://example.com/${id}`,
      contactType: null,
      contactValue: null,
      textColor: '#111827',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderEnabled: true,
      sortOrder,
      active: true,
    });
    const { container } = render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          links: [link('link-1', 0), link('link-2', 3)],
          images: [
            {
              id: 'image-1',
              imageUrl: 'https://example.com/foto.png',
              altText: 'Foto',
              targetUrl: null,
              sortOrder: 2,
              active: true,
            },
          ],
          videos: [
            {
              id: 'video-1',
              url: 'https://youtu.be/dQw4w9WgXcQ',
              title: 'Vídeo',
              autoplay: false,
              controls: true,
              size: 'MEDIUM',
              customHeight: null,
              sortOrder: 1,
              active: true,
            },
          ],
        }}
      />,
    );

    const order = Array.from(
      container.querySelectorAll(
        'a[href^="https://example.com/link"], [data-testid="video-card"], img[alt="Foto"]',
      ),
    ).map(
      (element) =>
        element.getAttribute('href') ?? element.getAttribute('alt') ?? 'video',
    );
    expect(order).toEqual([
      'https://example.com/link-1',
      'video',
      'Foto',
      'https://example.com/link-2',
    ]);
  });

  it('sizes the preview card image from displaySize', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          links: [
            {
              id: 'preview-large',
              placement: 'VERTICAL',
              kind: 'PREVIEW',
              label: 'Loja',
              url: 'https://loja.example.com',
              contactType: null,
              contactValue: null,
              previewImageUrl: 'https://loja.example.com/og.png',
              previewDescription: null,
              displaySize: 'LARGE',
              customHeight: null,
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

    expect(
      screen.getByTestId('preview-link-card').querySelector('img'),
    ).toHaveStyle({ height: '320px' });
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

  it('steps through a questionnaire, sends choices and shows the score', async () => {
    const onSubmitForm = vi
      .fn()
      .mockResolvedValue({ ok: true, score: { score: 1, max: 2 } });

    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          form: {
            mode: 'QUESTIONNAIRE',
            scoring: { kind: 'CORRECT', show: true },
            submitLabel: 'Enviar',
            successMessage: 'Valeu!',
            fields: [
              {
                id: 'capital',
                type: 'CHOICE',
                label: 'Capital?',
                required: true,
                options: ['Rio', 'Brasília'],
                allowOther: true,
              },
              {
                id: 'primos',
                type: 'MULTI_CHOICE',
                label: 'Primos?',
                required: false,
                options: ['2', '3', '4'],
              },
            ],
          },
        }}
        onSubmitForm={onSubmitForm}
      />,
    );

    expect(screen.getByText('Pergunta 1 de 2')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Brasília'));
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    fireEvent.click(await screen.findByLabelText('2'));
    fireEvent.click(screen.getByLabelText('3'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() =>
      expect(onSubmitForm).toHaveBeenCalledWith(
        { capital: 'Brasília', primos: ['2', '3'] },
        '',
      ),
    );
    expect(await screen.findByText('Sua nota: 1/2')).toBeInTheDocument();
  });

  it('renders a centered pill text block with its background', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          texts: [
            {
              id: 'text-id',
              content: [{ text: 'Promoção' }],
              style: 'PILL',
              align: 'CENTER',
              backgroundColor: '#EF4444',
              borderColor: null,
              sortOrder: 0,
              active: true,
            },
          ],
        }}
      />,
    );

    const block = screen.getByTestId('text-block');

    expect(block).toHaveTextContent('Promoção');
    expect(block).toHaveClass('rounded-3xl', 'inline-block');
    expect(block).toHaveStyle({ backgroundColor: '#EF4444' });
    expect(block.parentElement).toHaveClass('text-center');
  });

  it('stretches a full-width box text block', () => {
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          texts: [
            {
              id: 'text-id',
              content: [{ text: 'Aviso' }],
              style: 'BOX',
              fullWidth: true,
              sortOrder: 0,
              active: true,
            },
          ],
        }}
      />,
    );

    expect(screen.getByTestId('text-block')).not.toHaveClass('inline-block');
  });

  it('renders link shape, alignment, size and full-width horizontal cards', () => {
    const base = {
      kind: 'LINK' as const,
      url: 'https://example.com',
      contactType: null,
      contactValue: null,
      textColor: '#111827',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderEnabled: true,
      sortOrder: 0,
      active: true,
    };
    render(
      <LinkPageRenderer
        linkPage={{
          ...page,
          links: [
            {
              ...base,
              id: 'pill',
              placement: 'VERTICAL',
              label: 'Agendar horário',
              shape: 'PILL',
              align: 'CENTER',
              displaySize: 'LARGE',
            },
            {
              ...base,
              id: 'wide',
              placement: 'HORIZONTAL',
              label: 'Post 1234',
              fullWidth: true,
              displaySize: 'CUSTOM',
              customHeight: 200,
            },
          ],
        }}
      />,
    );

    const pill = screen.getByRole('link', { name: 'Agendar horário' });
    expect(pill).toHaveClass('rounded-[2rem]', 'justify-center');
    expect(pill).toHaveStyle({ minHeight: '64px' });

    const wide = screen.getByRole('link', { name: 'Post 1234' });
    expect(wide).toHaveClass('w-full', 'rounded-lg');
    expect(wide).toHaveStyle({ height: '200px' });
  });
});
