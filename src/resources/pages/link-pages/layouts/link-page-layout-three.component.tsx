import {
  ContentStream,
  FormBlock,
  HorizontalLinkCards,
  LinkPageFooter,
  LinkPageHeader,
  LinkPageShell,
  SocialLinks,
} from '../renderer/link-page-renderer-parts';
import type { LinkPageLayoutProps } from '../renderer/link-page-renderer.types';

export function LinkPageLayoutThree({
  horizontalLinks,
  linkPage,
  onSubmitForm,
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
      <FormBlock
        form={linkPage.form}
        preview={preview}
        onSubmit={onSubmitForm}
      />
      <ContentStream
        links={verticalLinks}
        images={linkPage.images}
        videos={linkPage.videos}
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
