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

export function LinkPageLayoutTwo({
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
      <div className='rounded-2xl bg-white/70 p-4 backdrop-blur'>
        <LinkPageHeader linkPage={linkPage} />
      </div>
      <VerticalLinks
        links={verticalLinks}
        onTrack={onTrack}
      />
      <HorizontalLinkCards
        links={horizontalLinks}
        onTrack={onTrack}
      />
      <ContentImages
        images={linkPage.images}
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
