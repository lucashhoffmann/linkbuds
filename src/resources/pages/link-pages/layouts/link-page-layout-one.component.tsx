import {
  ContentStream,
  HorizontalLinkCards,
  LinkPageFooter,
  LinkPageHeader,
  LinkPageShell,
  SocialLinks,
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
      <ContentStream
        links={verticalLinks}
        images={linkPage.images}
        videos={linkPage.videos}
        onTrack={onTrack}
      />
      <LinkPageFooter linkPage={linkPage} />
    </LinkPageShell>
  );
}
