import type {
  LinkPageImage,
  LinkPageLink,
  LinkPageVideo,
} from '../types/link-pages.types';

/** Links, images and videos share one `sortOrder` space per page. */
export type ContentItem =
  | { type: 'LINK'; item: LinkPageLink }
  | { type: 'IMAGE'; item: LinkPageImage }
  | { type: 'VIDEO'; item: LinkPageVideo };

export type ContentType = ContentItem['type'];

// Tie-break for rows saved before the shared order existed.
const typeRank: Record<ContentType, number> = { LINK: 0, IMAGE: 1, VIDEO: 2 };

export function contentKey(entry: ContentItem) {
  return `${entry.type}:${entry.item.id}`;
}

export function orderContent(
  links: LinkPageLink[],
  images: LinkPageImage[] = [],
  videos: LinkPageVideo[] = [],
): ContentItem[] {
  return [
    ...links.map((item) => ({ type: 'LINK' as const, item })),
    ...images.map((item) => ({ type: 'IMAGE' as const, item })),
    ...videos.map((item) => ({ type: 'VIDEO' as const, item })),
  ].sort(
    (a, b) =>
      a.item.sortOrder - b.item.sortOrder ||
      typeRank[a.type] - typeRank[b.type],
  );
}

/** Next free position, so a new link/image/video lands at the end. */
export function nextSortOrder(page: {
  links: LinkPageLink[];
  images?: LinkPageImage[];
  videos?: LinkPageVideo[];
}) {
  const orders = [
    ...page.links,
    ...(page.images ?? []),
    ...(page.videos ?? []),
  ].map((item) => item.sortOrder);
  return orders.length ? Math.max(...orders) + 1 : 0;
}
