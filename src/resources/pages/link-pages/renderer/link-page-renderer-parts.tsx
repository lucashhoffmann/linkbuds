import type { ReactNode } from 'react';
import { Asterisk, ExternalLink, Link2, Mail, Phone, Share2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { resolveLinkHref } from '@/app/modules/link-pages/utils/contact-url.util';
import type {
  AnalyticsTargetType,
  LinkPageImage,
  LinkPageLink,
  LinkPageSocialLink,
  LinkPageViewModel,
} from '@/app/modules/link-pages/types/link-pages.types';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';
import { linkPageDesignTokens } from '../design-system/link-page-design-tokens';
import {
  socialPlatformIcons,
  socialPlatformLabels,
} from './social-platform-icons';

type TrackFn = (targetType: AnalyticsTargetType, targetId: string) => void;

async function shareLinkPage(
  linkPage: LinkPageViewModel,
  preview: boolean,
) {
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

function LinksBudsBrandingBar({
  linkPage,
  preview,
}: {
  linkPage: LinkPageViewModel;
  preview: boolean;
}) {
  if (linkPage.footerMode !== 'LINKSBUDS') {
    return null;
  }

  return (
    <div className='mb-8 flex items-center justify-between'>
      <span
        aria-label='LinksBuds'
        className='flex size-9 items-center justify-center rounded-full bg-white/85 text-slate-950 shadow-sm ring-1 ring-black/5 backdrop-blur'
      >
        <Asterisk className='size-4' />
      </span>
      <button
        type='button'
        aria-label='Compartilhar LinkPage'
        className='flex size-9 items-center justify-center rounded-full bg-white/85 text-slate-950 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none backdrop-blur'
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
      : { backgroundColor: linkPage.backgroundColor };

  if (preview) {
    return (
      <main
        data-testid='link-page-shell'
        data-preview='true'
        className={cn(
          linkPageDesignTokens.page.widthClass,
          linkPageDesignTokens.page.minHeightClass,
          linkPageDesignTokens.radius.page,
          'mx-auto flex flex-col overflow-hidden bg-cover bg-center p-5 text-slate-950 shadow-2xl',
        )}
        style={style}
      >
        <LinksBudsBrandingBar
          linkPage={linkPage}
          preview={preview}
        />
        {children}
      </main>
    );
  }

  return (
    <main
      data-testid='link-page-shell'
      data-preview='false'
      className='min-h-dvh w-full bg-cover bg-center px-4 py-6 text-slate-950 sm:px-6 sm:py-10'
      style={style}
    >
      <div className='mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[430px] flex-col sm:min-h-[calc(100dvh-5rem)]'>
        <LinksBudsBrandingBar
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
      <h1 className='mt-4 text-2xl font-semibold tracking-tight'>
        {linkPage.title}
      </h1>
      {linkPage.subtitle && (
        <p className='mt-2 text-sm leading-relaxed text-slate-600'>
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
            className={cn(linkPageDesignTokens.horizontalCard.className, 'snap-start')}
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

export function VerticalLinks({
  links,
  onTrack,
}: {
  links: LinkPageLink[];
  onTrack?: TrackFn;
}) {
  if (!links.length) return null;

  return (
    <section
      className={cn(linkPageDesignTokens.spacing.section, linkPageDesignTokens.spacing.stack)}
    >
      {links.map((link) => (
        <a
          key={link.id}
          href={resolveLinkHref(link)}
          className={cn(linkPageDesignTokens.verticalLink.className, 'flex items-center justify-between')}
          style={itemStyle(link)}
          onClick={() => onTrack?.('VERTICAL_LINK', link.id)}
        >
          <span>{link.label}</span>
          <LinkActionIcon
            link={link}
            className='size-4 opacity-70'
          />
        </a>
      ))}
    </section>
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

export function ContentImages({
  images,
  onTrack,
}: {
  images: LinkPageImage[];
  onTrack?: TrackFn;
}) {
  if (!images.length) return null;

  return (
    <section className={cn(linkPageDesignTokens.spacing.section, 'space-y-3')}>
      {images.map((image) => {
        const content = (
          <img
            src={image.imageUrl}
            alt={image.altText ?? ''}
            className={linkPageDesignTokens.contentImage.className}
          />
        );

        if (!image.targetUrl) {
          return <div key={image.id}>{content}</div>;
        }

        return (
          <a
            key={image.id}
            href={image.targetUrl}
            onClick={() => onTrack?.('IMAGE', image.id)}
          >
            {content}
          </a>
        );
      })}
    </section>
  );
}

export function LinkPageFooter({ linkPage }: { linkPage: LinkPageViewModel }) {
  if (linkPage.footerMode === 'HIDDEN') return null;

  if (linkPage.footerMode === 'CUSTOM') {
    const content = (
      <span className='inline-flex items-center justify-center gap-2'>
        {linkPage.footerLogoUrl && (
          <img
            src={linkPage.footerLogoUrl}
            alt=''
            className='size-5 rounded object-cover'
          />
        )}
        {linkPage.footerText || 'Powered by LinksBuds'}
      </span>
    );

    return (
      <footer className='mt-8 text-center text-xs text-slate-500'>
        {linkPage.footerUrl ? <a href={linkPage.footerUrl}>{content}</a> : content}
      </footer>
    );
  }

  return (
    <footer className='mt-auto pt-8 text-center text-xs text-slate-500'>
      <a
        href={routes.register}
        className='inline-flex max-w-full items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg ring-1 ring-black/5 transition-colors hover:bg-slate-50'
      >
        Junte-se a {linkPage.title} no LinksBuds
      </a>
      <div className='mt-5 leading-tight text-white/90 mix-blend-difference'>
        <p>Report · Privacy</p>
        <p>More from LinksBuds</p>
      </div>
    </footer>
  );
}
