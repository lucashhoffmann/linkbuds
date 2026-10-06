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

export function LinkPageLayoutTwo({
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
      <div className='rounded-2xl bg-white/70 p-4 backdrop-blur'>
        <LinkPageHeader linkPage={linkPage} />
      </div>
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
      <HorizontalLinkCards
        links={horizontalLinks}
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
