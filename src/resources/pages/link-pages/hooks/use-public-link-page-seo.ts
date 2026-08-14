import { useEffect } from 'react';
import type { PublicLinkPage } from '@/app/modules/link-pages/types/link-pages.types';

const defaultTitle = 'linkbuds';
const seoMarker = 'data-linkbuds-seo';

function currentCanonicalUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}${window.location.pathname}`;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute(seoMarker, 'true');
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function removeMeta(attribute: 'name' | 'property', key: string) {
  document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    ?.remove();
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    element.setAttribute(seoMarker, 'true');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function clearDynamicSeo() {
  document.head
    .querySelectorAll(`[${seoMarker}="true"]`)
    .forEach((element) => element.remove());
}

function resolveSeoImage(linkPage: PublicLinkPage) {
  return linkPage.avatarUrl ?? linkPage.images[0]?.imageUrl ?? null;
}

export function usePublicLinkPageSeo(
  linkPage: PublicLinkPage | undefined,
  notFound: boolean,
) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (notFound) {
      clearDynamicSeo();
      document.title = 'LinkPage nao encontrada | LinksBuds';
      upsertMeta('name', 'robots', 'noindex');
      return () => {
        clearDynamicSeo();
        document.title = defaultTitle;
      };
    }

    if (!linkPage) {
      return undefined;
    }

    const title = `${linkPage.title} | LinksBuds`;
    const description =
      linkPage.subtitle || `Confira ${linkPage.title} no LinksBuds.`;
    const canonicalUrl = currentCanonicalUrl();
    const imageUrl = resolveSeoImage(linkPage);

    clearDynamicSeo();
    document.title = title;
    upsertCanonical(canonicalUrl);
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', 'index,follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');

    if (imageUrl) {
      upsertMeta('property', 'og:image', imageUrl);
      upsertMeta('name', 'twitter:image', imageUrl);
    } else {
      removeMeta('property', 'og:image');
      removeMeta('name', 'twitter:image');
    }

    return () => {
      clearDynamicSeo();
      document.title = defaultTitle;
    };
  }, [linkPage, notFound]);
}
