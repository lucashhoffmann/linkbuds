import type { LinkPageLink } from '../types/link-pages.types';

export function resolveLinkHref(link: LinkPageLink) {
  if (link.kind === 'LINK') {
    return link.url ?? '#';
  }

  if (link.contactType === 'WHATSAPP') {
    return `https://wa.me/${(link.contactValue ?? '').replace(/\D/g, '')}`;
  }

  if (link.contactType === 'EMAIL') {
    return `mailto:${link.contactValue ?? ''}`;
  }

  if (link.contactType === 'PHONE') {
    return `tel:${link.contactValue ?? ''}`;
  }

  return '#';
}
