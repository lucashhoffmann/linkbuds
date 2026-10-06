import type { LinkPageMediaSize } from '../types/link-pages.types';

export const mediaSizeOptions: Array<{
  value: LinkPageMediaSize;
  label: string;
}> = [
  { value: 'SMALL', label: 'Pequeno' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'LARGE', label: 'Grande' },
  { value: 'CUSTOM', label: 'Customizado' },
];

const mediaHeights = { SMALL: 140, MEDIUM: 210, LARGE: 320 } as const;

/** Media height in px; CUSTOM falls back to MEDIUM while the height is empty. */
export function mediaHeight(
  size: LinkPageMediaSize | undefined,
  customHeight: number | null | undefined,
) {
  if (size === 'CUSTOM') return customHeight || mediaHeights.MEDIUM;
  return mediaHeights[size ?? 'MEDIUM'];
}

export type VideoEmbed =
  { type: 'iframe'; src: string } | { type: 'file'; src: string };

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function youtubeId(url: URL, host: string) {
  if (host === 'youtu.be') return url.pathname.split('/')[1];
  return (
    url.searchParams.get('v') ??
    url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1]
  );
}

/**
 * Same hosts the API accepts. IDs are matched to [\w-] / digits before going
 * into the iframe src, so a crafted URL can't inject anything.
 * Autoplay only works muted (browser policy), so it always mutes.
 */
export function videoEmbed(
  value: string,
  autoplay: boolean,
  controls = true,
): VideoEmbed | null {
  const url = parseUrl(value);
  if (!url) return null;

  const host = url.hostname.replace(/^www\./, '');

  if (['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
    const id = youtubeId(url, host);
    if (!id || !/^[\w-]{6,}$/.test(id)) return null;
    const params = new URLSearchParams({ playsinline: '1', rel: '0' });
    if (!controls) params.set('controls', '0');
    if (autoplay) {
      params.set('autoplay', '1');
      params.set('mute', '1');
      params.set('loop', '1');
      params.set('playlist', id);
    }
    return {
      type: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${id}?${params}`,
    };
  }

  if (['vimeo.com', 'player.vimeo.com'].includes(host)) {
    const id = url.pathname.match(/\/(\d+)/)?.[1];
    if (!id) return null;
    const params = new URLSearchParams();
    if (autoplay) {
      params.set('autoplay', '1');
      params.set('muted', '1');
      params.set('loop', '1');
    }
    // Vimeo only honors controls=0 on paid accounts; free ones keep the bar.
    if (!controls) params.set('controls', '0');
    const query = params.toString() ? `?${params}` : '';
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${id}${query}`,
    };
  }

  if (
    ['http:', 'https:'].includes(url.protocol) &&
    /\.(mp4|webm|mov)$/i.test(url.pathname)
  ) {
    return { type: 'file', src: url.href };
  }

  return null;
}
