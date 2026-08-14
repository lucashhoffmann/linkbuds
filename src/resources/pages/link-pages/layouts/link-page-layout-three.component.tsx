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

export function LinkPageLayoutThree({
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
      <HorizontalLinkCards
        links={horizontalLinks}
        onTrack={onTrack}
      />
      <LinkPageHeader linkPage={linkPage} />
      <ContentImages
        images={linkPage.images}
        onTrack={onTrack}
      />
      <VerticalLinks
        links={verticalLinks}
        onTrack={onTrack}
      />
      <SocialLinks
        links={linkPage.socialLinks}
        onTrack={onTrack}
      />
      <LinkPageFooter linkPage={linkPage} />
    </LinkPageShell>
  );
}
