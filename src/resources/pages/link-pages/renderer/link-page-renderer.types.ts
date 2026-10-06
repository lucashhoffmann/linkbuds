import type { SubmitFormFn } from './link-page-renderer-parts';
import type {
  AnalyticsTargetType,
  LinkPageLink,
  LinkPageViewModel,
} from '@/app/modules/link-pages/types/link-pages.types';

export type LinkPageRendererProps = {
  linkPage: LinkPageViewModel;
  preview?: boolean;
  onTrack?: (targetType: AnalyticsTargetType, targetId: string) => void;
  /** FORM pages; omitted in previews. */
  onSubmitForm?: SubmitFormFn;
};

export type LinkPageLayoutProps = LinkPageRendererProps & {
  horizontalLinks: LinkPageLink[];
  verticalLinks: LinkPageLink[];
};
