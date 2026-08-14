import type {
  AnalyticsTargetType,
  LinkPageLink,
  LinkPageViewModel,
} from '@/app/modules/link-pages/types/link-pages.types';

export type LinkPageRendererProps = {
  linkPage: LinkPageViewModel;
  preview?: boolean;
  onTrack?: (targetType: AnalyticsTargetType, targetId: string) => void;
};

export type LinkPageLayoutProps = LinkPageRendererProps & {
  horizontalLinks: LinkPageLink[];
  verticalLinks: LinkPageLink[];
};
