import {
  ContentImages,
  HorizontalLinkCards,
  LinkPageFooter,
  LinkPageHeader,
  LinkPageShell,
  SocialLinks,
  VerticalLinks,
} from '../renderer/link-page-renderer-parts';
import type { LinkPageLayoutProps } from '../renderer/link-page-renderer.types';

export function LinkPageLayoutOne({
  horizontalLinks,
  linkPage,
  onTrack,
  preview,
  verticalLinks,
}: LinkPageLayoutProps) {
  return (
    <LinkPageShell
      linkPage={linkPage}
      preview={preview}
    >
      <LinkPageHeader linkPage={linkPage} />
      <SocialLinks
        links={linkPage.socialLinks}
        onTrack={onTrack}
      />
      <HorizontalLinkCards
        links={horizontalLinks}
        onTrack={onTrack}
      />
      <VerticalLinks
        links={verticalLinks}
        onTrack={onTrack}
      />
      <ContentImages
        images={linkPage.images}
        onTrack={onTrack}
      />
      <LinkPageFooter linkPage={linkPage} />
    </LinkPageShell>
  );
}
