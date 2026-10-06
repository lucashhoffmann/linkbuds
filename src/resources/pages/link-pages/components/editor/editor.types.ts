import type { LinkPageLink } from '@/app/modules/link-pages/types/link-pages.types';

export type Tab =
  'form' | 'content' | 'appearance' | 'settings' | 'analytics' | 'branding';
export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
export type LinkClickCountMap = Record<string, number>;
export type LinkPageLinkStyle = Pick<
  LinkPageLink,
  'backgroundColor' | 'borderColor' | 'borderEnabled' | 'textColor'
>;
export type LinkFormValues = Omit<LinkPageLink, 'active' | 'id' | 'sortOrder'>;
