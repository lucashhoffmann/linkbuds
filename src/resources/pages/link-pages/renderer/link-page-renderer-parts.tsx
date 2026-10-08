import { useState, type FormEvent, type ReactNode } from 'react';
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
  FormConfig,
  FormField,
  LinkPageImage,
  LinkPageLink,
  LinkPageLinkShape,
  LinkPageSocialLink,
  LinkPageText,
  LinkPageTextAlign,
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
import { textRunStyle } from '@/app/modules/link-pages/utils/text-runs.util';
import { formatPhone } from '@/resources/pages/settings/components/subscribe-dialog/payment-format.util';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';
import { linkPageDesignTokens } from '../design-system/link-page-design-tokens';
import { FormQuestionnaire } from './form-questionnaire';
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

// PILL radius is past half of any preset height, so short buttons read as full pills.
const linkShapeClass: Record<LinkPageLinkShape, string> = {
  ROUNDED: 'rounded-lg',
  PILL: 'rounded-[2rem]',
  SQUARE: 'rounded-none',
};

const linkHeights = {
  VERTICAL: { SMALL: 44, MEDIUM: 56, LARGE: 64 },
  HORIZONTAL: { SMALL: 80, MEDIUM: 112, LARGE: 160 },
} as const;

/** Button/card height in px; CUSTOM falls back to MEDIUM while empty. */
function linkHeight(link: LinkPageLink) {
  const heights = linkHeights[link.placement];
  const size = link.displaySize ?? 'MEDIUM';
  if (size === 'CUSTOM') return link.customHeight || heights.MEDIUM;
  return heights[size];
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
              linkShapeClass[link.shape ?? 'ROUNDED'],
              link.fullWidth ? 'w-full' : 'w-36',
              link.align === 'CENTER'
                ? 'items-center justify-center text-center'
                : 'text-left',
              'snap-start',
            )}
            style={{ ...itemStyle(link), height: linkHeight(link) }}
            onClick={() => onTrack?.('HORIZONTAL_LINK', link.id)}
          >
            <span className='line-clamp-3 text-sm font-semibold'>
              {link.label}
            </span>
            <LinkActionIcon
              link={link}
              className={cn(
                'size-4 shrink-0 opacity-70',
                link.align === 'CENTER' ? 'mt-2' : 'mt-4',
              )}
            />
          </a>
        ))}
      </div>
    </section>
  );
}

/**
 * Vertical links, images, videos and texts in the one order the owner set in
 * the editor (horizontal links keep their own carousel).
 */
export function ContentStream({
  images,
  links,
  onTrack,
  texts,
  videos,
}: {
  images?: LinkPageImage[];
  links: LinkPageLink[];
  onTrack?: TrackFn;
  texts?: LinkPageText[];
  videos?: LinkPageVideo[];
}) {
  const items = orderContent(links, images, videos, texts);
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
        ) : entry.type === 'TEXT' ? (
          <TextBlock
            key={contentKey(entry)}
            text={entry.item}
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

/** Runs render as React text nodes: stored content can never become markup. */
function TextBlock({ text }: { text: LinkPageText }) {
  const style = text.style ?? 'TEXT';
  const boxed = style !== 'TEXT';
  const border = boxed ? text.borderColor : null;

  return (
    <div className={cn(!boxed && 'px-1', textAlignClass[text.align ?? 'LEFT'])}>
      <p
        data-testid='text-block'
        className={cn(
          'text-base leading-relaxed break-words whitespace-pre-wrap',
          boxed && 'px-4 py-2 text-slate-950 shadow-lg',
          boxed && !border && 'ring-1 ring-black/5',
          boxed && !text.fullWidth && 'inline-block max-w-full',
          style === 'PILL' && 'rounded-3xl',
          style === 'BOX' && 'rounded-lg py-3',
        )}
        style={{
          backgroundColor: boxed
            ? (text.backgroundColor ?? '#FFFFFF')
            : undefined,
          border: border ? `1px solid ${border}` : undefined,
        }}
      >
        {text.content.map((run, index) => (
          <span
            key={index}
            style={textRunStyle(run)}
          >
            {run.text}
          </span>
        ))}
      </p>
    </div>
  );
}

const textAlignClass: Record<LinkPageTextAlign, string> = {
  LEFT: 'text-left',
  CENTER: 'text-center',
  RIGHT: 'text-right',
};

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
        linkShapeClass[link.shape ?? 'ROUNDED'],
        link.align === 'CENTER'
          ? 'justify-center px-10 text-center'
          : 'justify-between',
      )}
      style={{ ...itemStyle(link), minHeight: linkHeight(link) }}
      onClick={() => onTrack?.('VERTICAL_LINK', link.id)}
    >
      <span>{link.label}</span>
      <LinkActionIcon
        link={link}
        className={cn(
          'size-4 shrink-0 opacity-70',
          link.align === 'CENTER' && 'absolute right-5',
        )}
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

export type FormSubmitResult =
  | { ok: true; score?: { score: number; max: number } | null }
  | { ok: false; message: string; invalid: string[] };

export type FormValue = string | boolean | string[];

export type SubmitFormFn = (
  answers: Record<string, FormValue>,
  /** Honeypot value; real visitors leave it empty. */
  website: string,
) => Promise<FormSubmitResult>;

// Mirrors the API: DDD + landline (8 digits) or mobile (9 + 8).
const PHONE_PATTERN = String.raw`\([1-9]{2}\) (9\d{4}|[2-8]\d{3})-\d{4}`;

const formInputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-500 aria-invalid:border-red-500';

/** CHOICE / MULTI_CHOICE in list mode: native radios/checkboxes + optional "Outro". */
function ChoiceControl({
  field,
  value,
  invalid,
  onChange,
}: {
  field: FormField;
  value: FormValue | undefined;
  invalid: boolean;
  onChange: (value: FormValue) => void;
}) {
  const multiple = field.type === 'MULTI_CHOICE';
  const options = (field.options ?? []).filter(Boolean);
  const chosen = Array.isArray(value)
    ? value
    : typeof value === 'string' && value
      ? [value]
      : [];
  const other = chosen.find((item) => !options.includes(item)) ?? '';
  const picked = chosen.filter((item) => options.includes(item));
  const emit = (next: string[]) =>
    onChange(multiple ? next : (next.at(-1) ?? ''));

  return (
    <fieldset
      className='grid gap-1.5'
      aria-invalid={invalid || undefined}
    >
      <legend className='mb-1 text-sm font-medium'>
        {field.label}
        {field.required && ' *'}
      </legend>
      {options.map((option) => (
        <label
          key={option}
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm',
            invalid ? 'border-red-500' : 'border-slate-200',
          )}
        >
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={field.id}
            value={option}
            required={field.required && !multiple && !other}
            checked={picked.includes(option)}
            onChange={(event) =>
              emit(
                multiple
                  ? event.target.checked
                    ? [...chosen, option]
                    : chosen.filter((item) => item !== option)
                  : [option],
              )
            }
          />
          {option}
        </label>
      ))}
      {field.allowOther && (
        <input
          aria-label={`${field.label}: outra resposta`}
          maxLength={500}
          placeholder={field.placeholder || 'Outra resposta...'}
          className={formInputClass}
          value={other}
          onChange={(event) => {
            const text = event.target.value;
            emit(multiple ? [...picked, ...(text ? [text] : [])] : [text]);
          }}
        />
      )}
    </fieldset>
  );
}

function FormFieldControl({
  field,
  value,
  invalid,
  onChange,
}: {
  field: FormField;
  value: FormValue | undefined;
  invalid: boolean;
  onChange: (value: FormValue) => void;
}) {
  const id = `form-field-${field.id}`;

  if (field.type === 'CHOICE' || field.type === 'MULTI_CHOICE') {
    return (
      <ChoiceControl
        field={field}
        value={value}
        invalid={invalid}
        onChange={onChange}
      />
    );
  }

  const common = {
    id,
    name: field.id,
    required: field.required,
    'aria-invalid': invalid || undefined,
  };

  if (field.type === 'CHECKBOX') {
    return (
      <label className='flex items-start gap-2 text-sm'>
        <input
          {...common}
          type='checkbox'
          className='mt-0.5 size-4'
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          {field.label}
          {field.required && ' *'}
        </span>
      </label>
    );
  }

  const text = typeof value === 'string' ? value : '';
  const control =
    field.type === 'TEXTAREA' ? (
      <textarea
        {...common}
        rows={4}
        maxLength={5000}
        placeholder={field.placeholder ?? undefined}
        className={formInputClass}
        value={text}
        onChange={(event) => onChange(event.target.value)}
      />
    ) : field.type === 'SELECT' ? (
      <select
        {...common}
        className={formInputClass}
        value={text}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value=''>{field.placeholder || 'Selecione'}</option>
        {(field.options ?? []).filter(Boolean).map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    ) : (
      <input
        {...common}
        type={
          {
            TEXT: 'text',
            EMAIL: 'email',
            PHONE: 'tel',
            URL: 'url',
            NUMBER: 'number',
            DATE: 'date',
          }[field.type]
        }
        maxLength={field.type === 'TEXT' ? 500 : undefined}
        placeholder={
          field.placeholder ??
          (field.type === 'PHONE' ? '(00) 00000-0000' : undefined)
        }
        {...(field.type === 'PHONE' && {
          inputMode: 'tel' as const,
          autoComplete: 'tel-national',
          pattern: PHONE_PATTERN,
          title: 'Telefone com DDD, ex.: (42) 98811-2334',
        })}
        className={formInputClass}
        value={text}
        onChange={(event) =>
          onChange(
            field.type === 'PHONE'
              ? formatPhone(event.target.value)
              : event.target.value,
          )
        }
      />
    );

  return (
    <div className='grid gap-1'>
      <label
        htmlFor={id}
        className='text-sm font-medium'
      >
        {field.label}
        {field.required && ' *'}
      </label>
      {control}
    </div>
  );
}

/** FORM pages: native inputs; the API validates again. Preview never submits. */
export function FormBlock({
  form,
  preview = false,
  onSubmit,
}: {
  form?: FormConfig | null;
  preview?: boolean;
  onSubmit?: SubmitFormFn;
}) {
  const [values, setValues] = useState<Record<string, FormValue>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Extract<FormSubmitResult, { ok: true }>>();
  const [error, setError] = useState<{ message: string; invalid: string[] }>();

  if (!form) return null;

  if (form.closedAt && !sent) {
    return (
      <section
        role='status'
        className={cn(
          linkPageDesignTokens.spacing.section,
          'rounded-2xl bg-white/90 p-6 text-center text-sm font-medium text-slate-700 shadow-sm',
        )}
      >
        Este formulário não está mais recebendo respostas.
      </section>
    );
  }

  if (sent) {
    const animated = form.successAnimation !== false;

    return (
      <section
        role='status'
        className={cn(
          linkPageDesignTokens.spacing.section,
          animated && 'animate-lb-pop',
          'grid justify-items-center gap-3 rounded-2xl bg-white/90 p-6 text-center text-sm font-medium shadow-sm',
        )}
      >
        {animated && (
          <svg
            aria-hidden='true'
            viewBox='0 0 52 52'
            className='size-14 text-emerald-600'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle
              cx='26'
              cy='26'
              r='24'
              pathLength='1'
              strokeDasharray='1'
              className='animate-lb-draw'
            />
            <path
              d='M15 27l7 7 15-15'
              pathLength='1'
              strokeDasharray='1'
              className='animate-lb-draw [animation-delay:0.4s]'
            />
          </svg>
        )}
        <p className={cn(animated && 'animate-lb-pop [animation-delay:0.6s]')}>
          {form.successMessage}
        </p>
        {sent.score && (
          <p
            className={cn(
              animated && 'animate-lb-pop [animation-delay:0.7s]',
              'text-2xl font-bold tabular-nums',
            )}
          >
            Sua nota: {sent.score.score}/{sent.score.max}
          </p>
        )}
        {form.redirectUrl && (
          <a
            href={form.redirectUrl}
            className={cn(
              animated && 'animate-lb-pop [animation-delay:0.8s]',
              'text-xs underline underline-offset-2 opacity-70',
            )}
          >
            Redirecionando... toque se não abrir
          </a>
        )}
      </section>
    );
  }

  async function send(answers: Record<string, FormValue>, website: string) {
    if (preview || !onSubmit) return;

    setSending(true);
    const result = await onSubmit(answers, website);
    setSending(false);

    if (result.ok) {
      setSent(result);
      // Let the check animation play before leaving the page.
      if (form?.redirectUrl) {
        const url = form.redirectUrl;
        setTimeout(() => window.location.assign(url), 1800);
      }
    } else {
      setError(result);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const website = String(
      new FormData(event.currentTarget).get('website') ?? '',
    );
    void send(values, website);
  }

  if (form.mode === 'QUESTIONNAIRE') {
    return (
      <FormQuestionnaire
        form={form}
        preview={preview}
        sending={sending}
        error={error}
        onSubmit={(answers, website) => void send(answers, website)}
      />
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        linkPageDesignTokens.spacing.section,
        'grid gap-3 rounded-2xl bg-white/90 p-4 shadow-sm',
      )}
    >
      {form.fields.map((field) => (
        <FormFieldControl
          key={field.id}
          field={field}
          value={values[field.id]}
          invalid={error?.invalid.includes(field.id) ?? false}
          onChange={(value) =>
            setValues((current) => ({ ...current, [field.id]: value }))
          }
        />
      ))}
      {/* Honeypot: hidden from people, bots tend to fill every input. */}
      <input
        type='text'
        name='website'
        tabIndex={-1}
        autoComplete='off'
        aria-hidden='true'
        className='absolute -left-[9999px] h-0 w-0 opacity-0'
      />
      {error && (
        <p
          role='alert'
          className='text-sm text-red-600'
        >
          {error.message}
        </p>
      )}
      <button
        type='submit'
        disabled={sending}
        title={
          preview ? 'Prévia: o envio funciona na página publicada' : undefined
        }
        className={cn(
          linkPageDesignTokens.verticalLink.className,
          'bg-slate-900 text-white disabled:opacity-60',
        )}
      >
        {sending ? 'Enviando...' : form.submitLabel}
      </button>
    </form>
  );
}
