import { arrayMove } from '@dnd-kit/sortable';
import type {
  LinkPageAnalyticsTarget,
  LinkPageDetail,
  LinkPageLink,
} from '@/app/modules/link-pages/types/link-pages.types';
import { socialPlatformLabels } from '../../renderer/social-platform-icons';
import type { Tab, LinkPageLinkStyle, LinkFormValues } from './editor.types';

export const defaultLinkStyle: LinkPageLinkStyle = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E5E7EB',
  borderEnabled: true,
  textColor: '#111827',
};
export const whatsAppLinkStyle: LinkPageLinkStyle = {
  backgroundColor: '#25D366',
  borderColor: '#25D366',
  borderEnabled: false,
  textColor: '#FFFFFF',
};

export function createLinkForm(): LinkFormValues {
  return {
    ...defaultLinkStyle,
    placement: 'VERTICAL',
    kind: 'LINK',
    label: '',
    url: '',
    contactType: null,
    contactValue: null,
  };
}

export const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'content', label: 'Conteúdo' },
  { id: 'appearance', label: 'Aparência' },
  { id: 'settings', label: 'Configurações' },
  { id: 'analytics', label: 'Análises' },
  { id: 'branding', label: 'Marca' },
];

export function dateInputValue(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return date.toISOString().slice(0, 10);
}

export function startOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

export function endOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}

export function toNumber(value: number | string | undefined) {
  return Number(value ?? 0);
}

export function formatNumber(value: number | string | undefined) {
  return new Intl.NumberFormat('pt-BR').format(toNumber(value));
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatDuration(milliseconds: number) {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  return `${Math.round(milliseconds / 1000)}s`;
}

export function targetLabel(
  linkPage: LinkPageDetail,
  target: LinkPageAnalyticsTarget,
) {
  if (
    target.targetType === 'HORIZONTAL_LINK' ||
    target.targetType === 'VERTICAL_LINK'
  ) {
    return (
      linkPage.links.find((link) => link.id === target.targetId)?.label ??
      'Link removido'
    );
  }

  if (target.targetType === 'SOCIAL_LINK') {
    const platform = linkPage.socialLinks.find(
      (link) => link.id === target.targetId,
    )?.platform;

    return platform ? socialPlatformLabels[platform] : 'Rede removida';
  }

  return (
    linkPage.images.find((image) => image.id === target.targetId)?.altText ??
    'Imagem'
  );
}

export function reorderLinksForDrop(
  links: LinkPageLink[],
  activeId: string,
  overId: string,
) {
  const oldIndex = links.findIndex((link) => link.id === activeId);
  const newIndex = links.findIndex((link) => link.id === overId);

  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
    return links;
  }

  return arrayMove(links, oldIndex, newIndex).map((link, sortOrder) => ({
    ...link,
    sortOrder,
  }));
}

// Same formats the API enforces; invalid values stay local until fixed.
export const gtmContainerIdPattern = /^GTM-[A-Z0-9]{4,12}$/;
export const ga4MeasurementIdPattern = /^G-[A-Z0-9]{4,16}$/;

export function isTrackingIdValid(value: string | null, pattern: RegExp) {
  return !value || pattern.test(value);
}

export function trackingIdsPayload(draft: LinkPageDetail) {
  return {
    ...(isTrackingIdValid(draft.gtmContainerId, gtmContainerIdPattern)
      ? { gtmContainerId: draft.gtmContainerId }
      : {}),
    ...(isTrackingIdValid(draft.ga4MeasurementId, ga4MeasurementIdPattern)
      ? { ga4MeasurementId: draft.ga4MeasurementId }
      : {}),
  };
}
