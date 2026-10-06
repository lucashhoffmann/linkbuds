import type { ReactNode } from 'react';
import {
  Asterisk,
  ExternalLink,
  Link2,
  Mail,
  Phone,
  Share2,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { resolveLinkHref } from '@/app/modules/link-pages/utils/contact-url.util';
import type {
  FooterSettings,
  AnalyticsTargetType,
  LinkPageImage,
  LinkPageLink,
  LinkPageSocialLink,
  LinkPageVideo,
  LinkPageViewModel,
} from '@/app/modules/link-pages/types/link-pages.types';
import {
  mediaHeight,
  videoEmbed,
} from '@/app/modules/link-pages/utils/media.util';
import {
  contentKey,
  orderContent,
} from '@/app/modules/link-pages/utils/content-order.util';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';
import { linkPageDesignTokens } from '../design-system/link-page-design-tokens';
import {
  socialPlatformIcons,
  socialPlatformLabels,
} from './social-platform-icons';

type TrackFn = (targetType: AnalyticsTargetType, targetId: string) => void;

async function shareLinkPage(linkPage: LinkPageViewModel, preview: boolean) {
  if (preview || typeof window === 'undefined') {
    return;
  }

  const payload = {
    title: linkPage.title,
    url: window.location.href,
  };

  if (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    typeof navigator.share === 'function'
  ) {
    await navigator.share(payload);
    return;
  }

  await navigator.clipboard?.writeText(payload.url);
}

function LinkBudsBrandingBar({
  linkPage,
  preview,
}: {
  linkPage: LinkPageViewModel;
  preview: boolean;
}) {
  if (linkPage.footerMode !== 'LINKBUDS') {
    return null;
  }

  return (
    <div className='mb-8 flex items-center justify-between'>
      <span
        aria-label='LinkBuds'
        className='flex size-9 items-center justify-center rounded-full bg-white/85 text-slate-950 shadow-sm ring-1 ring-black/5 backdrop-blur'
      >
        <Asterisk className='size-4' />
      </span>
      <button
        type='button'
        aria-label='Compartilhar LinkPage'
        className='flex size-9 items-center justify-center rounded-full bg-white/85 text-slate-950 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none'
        onClick={() => void shareLinkPage(linkPage, preview)}
      >
        <Share2 className='size-4' />
      </button>
    </div>
  );
}

export function LinkPageShell({
  children,
  linkPage,
  preview = false,
}: {
  children: ReactNode;
  linkPage: LinkPageViewModel;
  preview?: boolean;
}) {
  const style =
    linkPage.backgroundType === 'IMAGE' && linkPage.backgroundImageUrl
      ? {
          backgroundImage: `linear-gradient(rgba(255,255,255,.78), rgba(255,255,255,.78)), url(${linkPage.backgroundImageUrl})`,
        }
      : linkPage.backgroundType === 'GRADIENT'
        ? {
            backgroundImage: `linear-gradient(180deg, ${linkPage.backgroundColor}, ${linkPage.backgroundGradientColor ?? '#FFFFFF'})`,
          }
        : { backgroundColor: linkPage.backgroundColor };

  // Background fills the whole frame, content stays a centered column, same
  // as the public page — so Desktop/Tablet previews match reality.
  return (
    <main
      data-testid='link-page-shell'
      data-preview={preview ? 'true' : 'false'}
      className={cn(
        'w-full bg-cover bg-center text-slate-950',
        preview
          ? 'flex min-h-full flex-col p-5'
          : 'min-h-dvh px-4 py-6 sm:px-6 sm:py-10',
      )}
      style={style}
    >
      <div
        className={cn(
          linkPageDesignTokens.page.widthClass,
          'mx-auto flex flex-1 flex-col',
          !preview && 'min-h-[calc(100dvh-3rem)] sm:min-h-[calc(100dvh-5rem)]',
        )}
      >
        <LinkBudsBrandingBar
          linkPage={linkPage}
          preview={preview}
        />
        {children}
      </div>
    </main>
  );
}

export function LinkPageHeader({ linkPage }: { linkPage: LinkPageViewModel }) {
  return (
    <header className='text-center'>
      {linkPage.avatarUrl ? (
        <img
          alt={linkPage.title}
          src={linkPage.avatarUrl}
          className={cn(linkPageDesignTokens.avatar.className, 'mx-auto')}
        />
      ) : (
        <div className='mx-auto flex size-20 items-center justify-center rounded-full bg-white/80 ring-4 ring-white/60'>
          <Link2 className='size-8' />
        </div>
      )}
      <h1
        className={cn(
          'mt-4 text-2xl tracking-tight',
          (linkPage.titleBold ?? true) ? 'font-semibold' : 'font-normal',
        )}
        style={{ color: linkPage.titleColor ?? undefined }}
      >
        {linkPage.title}
      </h1>
      {linkPage.subtitle && (
        <p
          className={cn(
            'mt-2 text-sm leading-relaxed text-slate-600',
            linkPage.subtitleBold && 'font-semibold',
          )}
          style={{ color: linkPage.subtitleColor ?? undefined }}
        >
          {linkPage.subtitle}
        </p>
      )}
    </header>
  );
}

function itemStyle(item: {
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderEnabled: boolean;
}) {
  return {
    color: item.textColor,
    backgroundColor: item.backgroundColor,
    borderColor: item.borderColor,
    borderWidth: item.borderEnabled ? 1 : 0,
  };
}

function LinkActionIcon({
  className,
  link,
}: {
  className?: string;
  link: LinkPageLink;
}) {
  if (link.kind === 'CONTACT') {
    if (link.contactType === 'WHATSAPP') {
      return (
        <FaWhatsapp
          aria-hidden='true'
          className={className}
          data-testid='link-action-icon-whatsapp'
        />
      );
    }

    if (link.contactType === 'EMAIL') {
      return (
        <Mail
          aria-hidden='true'
          className={className}
        />
      );
    }

    if (link.contactType === 'PHONE') {
      return (
        <Phone
          aria-hidden='true'
          className={className}
        />
      );
    }
  }

  return (
    <ExternalLink
      aria-hidden='true'
      className={className}
    />
  );
}

export function HorizontalLinkCards({
  links,
  onTrack,
}: {
  links: LinkPageLink[];
  onTrack?: TrackFn;
}) {
  if (!links.length) return null;

  return (
    <section className={linkPageDesignTokens.spacing.section}>
      <div className='flex snap-x gap-3 overflow-x-auto pb-2'>
        {links.map((link) => (
          <a
            key={link.id}
            href={resolveLinkHref(link)}
            className={cn(
              linkPageDesignTokens.horizontalCard.className,
              'snap-start',
            )}
            style={itemStyle(link)}
            onClick={() => onTrack?.('HORIZONTAL_LINK', link.id)}
          >
            <span className='line-clamp-3 text-sm font-semibold'>
              {link.label}
            </span>
            <LinkActionIcon
              link={link}
              className='mt-4 size-4 opacity-70'
            />
          </a>
        ))}
      </div>
    </section>
  );
}

/**
 * Vertical links, images and videos in the one order the owner set in the
 * editor (horizontal links keep their own carousel).
 */
export function ContentStream({
  images,
  links,
  onTrack,
  videos,
}: {
  images?: LinkPageImage[];
  links: LinkPageLink[];
  onTrack?: TrackFn;
  videos?: LinkPageVideo[];
}) {
  const items = orderContent(links, images, videos);
  if (!items.length) return null;

  return (
    <section
      className={cn(
        linkPageDesignTokens.spacing.section,
        linkPageDesignTokens.spacing.stack,
      )}
    >
      {items.map((entry) =>
        entry.type === 'IMAGE' ? (
          <ContentImage
            key={contentKey(entry)}
            image={entry.item}
            onTrack={onTrack}
          />
        ) : entry.type === 'VIDEO' ? (
          <VideoCard
            key={contentKey(entry)}
            video={entry.item}
          />
        ) : (
          <VerticalLinkItem
            key={contentKey(entry)}
            link={entry.item}
            onTrack={onTrack}
          />
        ),
      )}
    </section>
  );
}

function VerticalLinkItem({
  link,
  onTrack,
}: {
  link: LinkPageLink;
  onTrack?: TrackFn;
}) {
  if (link.kind === 'PREVIEW') {
    return (
      <PreviewLinkCard
        link={link}
        onTrack={onTrack}
      />
    );
  }

  return (
    <a
      href={resolveLinkHref(link)}
      className={cn(
        linkPageDesignTokens.verticalLink.className,
        'flex items-center justify-between',
      )}
      style={itemStyle(link)}
      onClick={() => onTrack?.('VERTICAL_LINK', link.id)}
    >
      <span>{link.label}</span>
      <LinkActionIcon
        link={link}
        className='size-4 opacity-70'
      />
    </a>
  );
}

function linkHostname(url: string | null) {
  try {
    return new URL(url ?? '').hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function PreviewLinkCard({
  link,
  onTrack,
}: {
  link: LinkPageLink;
  onTrack?: TrackFn;
}) {
  const hostname = linkHostname(link.url);

  return (
    <a
      href={resolveLinkHref(link)}
      data-testid='preview-link-card'
      className='block overflow-hidden rounded-lg shadow-sm'
      style={itemStyle(link)}
      onClick={() => onTrack?.('VERTICAL_LINK', link.id)}
    >
      {link.previewImageUrl && (
        <img
          src={link.previewImageUrl}
          alt=''
          loading='lazy'
          className='w-full object-cover'
          style={{ height: mediaHeight(link.displaySize, link.customHeight) }}
        />
      )}
      <span className='block px-4 py-3'>
        <span className='block text-sm font-semibold'>{link.label}</span>
        {link.previewDescription && (
          <span className='mt-1 line-clamp-2 block text-xs opacity-75'>
            {link.previewDescription}
          </span>
        )}
        {hostname && (
          <span className='mt-2 block text-xs opacity-60'>{hostname}</span>
        )}
      </span>
    </a>
  );
}

export function SocialLinks({
  links,
  onTrack,
}: {
  links: LinkPageSocialLink[];
  onTrack?: TrackFn;
}) {
  if (!links.length) return null;

  return (
    <section className='mt-5 flex flex-wrap justify-center gap-2'>
      {links.map((link) => {
        const Icon = socialPlatformIcons[link.platform];
        const label = socialPlatformLabels[link.platform];
        return (
          <a
            key={link.id}
            href={link.url}
            className={cn(
              linkPageDesignTokens.socialIcon.className,
              'flex items-center justify-center text-slate-800',
            )}
            aria-label={label}
            onClick={() => onTrack?.('SOCIAL_LINK', link.id)}
          >
            <Icon
              className='size-4'
              data-testid={`social-icon-${link.platform.toLowerCase()}`}
            />
          </a>
        );
      })}
    </section>
  );
}

function ContentImage({
  image,
  onTrack,
}: {
  image: LinkPageImage;
  onTrack?: TrackFn;
}) {
  const content = (
    <img
      src={image.imageUrl}
      alt={image.altText ?? ''}
      className={linkPageDesignTokens.contentImage.className}
    />
  );

  if (!image.targetUrl) {
    return <div>{content}</div>;
  }

  return (
    <a
      href={image.targetUrl}
      className='block'
      onClick={() => onTrack?.('IMAGE', image.id)}
    >
      {content}
    </a>
  );
}

/** Same card shape as PreviewLinkCard, with a player instead of the image. */
function VideoCard({ video }: { video: LinkPageVideo }) {
  const embed = videoEmbed(video.url, video.autoplay, video.controls);
  if (!embed) return null;

  const height = mediaHeight(video.size, video.customHeight);

  return (
    <div
      data-testid='video-card'
      className='overflow-hidden rounded-lg bg-white text-slate-900 shadow-sm'
    >
      {embed.type === 'iframe' ? (
        <iframe
          src={embed.src}
          title={video.title ?? 'Vídeo'}
          className='block w-full border-0'
          style={{ height }}
          loading='lazy'
          allow='autoplay; encrypted-media; picture-in-picture; fullscreen'
          allowFullScreen
        />
      ) : (
        <video
          src={embed.src}
          className='block w-full bg-black object-cover'
          style={{ height }}
          controls={video.controls}
          playsInline
          autoPlay={video.autoplay}
          muted={video.autoplay}
          loop={video.autoplay}
          preload='metadata'
          // Without controls, a tap still plays/pauses.
          onClick={(event) => {
            if (video.controls) return;
            const player = event.currentTarget;
            if (player.paused) void player.play();
            else player.pause();
          }}
        />
      )}
      {video.title && (
        <span className='block px-4 py-3 text-sm font-semibold'>
          {video.title}
        </span>
      )}
    </div>
  );
}

const footerFontClass = {
  SMALL: 'text-xs',
  MEDIUM: 'text-sm',
  LARGE: 'text-base',
} as const;

const footerLogoClass = {
  SMALL: 'size-5',
  MEDIUM: 'size-7',
  LARGE: 'size-10',
} as const;

export function LinkPageFooter({
  linkPage,
}: {
  linkPage: FooterSettings &
    Pick<LinkPageViewModel, 'title' | 'footerColor' | 'footerBold'>;
}) {
  if (linkPage.footerMode === 'HIDDEN') return null;

  if (linkPage.footerMode === 'CUSTOM') {
    const style = linkPage.footerStyle ?? 'TEXT';
    const boxed = style !== 'TEXT';
    const border = boxed ? linkPage.footerBorderColor : null;
    const Tag = linkPage.footerUrl ? 'a' : 'span';

    return (
      <footer
        className={cn(
          'mt-auto pt-8 text-center',
          footerFontClass[linkPage.footerFontSize ?? 'SMALL'],
          boxed ? 'text-slate-950' : 'text-slate-500',
          linkPage.footerBold && 'font-semibold',
        )}
      >
        <Tag
          href={linkPage.footerUrl ?? undefined}
          className={cn(
            'inline-flex max-w-full items-center justify-center gap-2',
            boxed && 'px-4 py-2 shadow-lg',
            boxed && !border && 'ring-1 ring-black/5',
            style === 'PILL' && 'rounded-full',
            style === 'BOX' && 'rounded-lg',
          )}
          style={{
            color: linkPage.footerColor ?? undefined,
            backgroundColor: boxed
              ? (linkPage.footerBackgroundColor ?? '#FFFFFF')
              : undefined,
            border: border ? `1px solid ${border}` : undefined,
          }}
        >
          {linkPage.footerLogoUrl && (
            <img
              src={linkPage.footerLogoUrl}
              alt=''
              className={cn(
                'rounded object-cover',
                footerLogoClass[linkPage.footerLogoSize ?? 'SMALL'],
              )}
            />
          )}
          {linkPage.footerText || 'Com LinkBuds'}
        </Tag>
      </footer>
    );
  }

  return (
    <footer className='mt-auto pt-8 text-center text-xs text-slate-500'>
      <a
        href={routes.register}
        className='inline-flex max-w-full items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg ring-1 ring-black/5 transition-colors hover:bg-slate-50'
      >
        Junte-se a {linkPage.title} no LinkBuds
      </a>
    </footer>
  );
}
