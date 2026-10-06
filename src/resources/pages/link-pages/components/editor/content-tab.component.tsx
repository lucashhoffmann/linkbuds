import { type Dispatch, type SetStateAction } from 'react';
import { useLinkPageMutations } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { Input } from '@/resources/components/ui/input';
import type { AutosaveStatus, LinkClickCountMap } from './editor.types';
import { Field, EditorSection } from './editor-fields.component';
import { LinksManager } from './links-manager.component';
import { SocialManager } from './social-manager.component';

export function ContentTab({
  clicksByLinkId,
  draft,
  headerStatus,
  mutations,
  setDraft,
}: {
  clicksByLinkId: LinkClickCountMap;
  draft: LinkPageDetail;
  headerStatus: AutosaveStatus;
  mutations: ReturnType<typeof useLinkPageMutations>;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  return (
    <div className='space-y-6'>
      <EditorSection
        title='Cabeçalho'
        status={headerStatus}
      >
        <div className='grid gap-3 md:grid-cols-2'>
          <Field label='URL do avatar'>
            <Input
              value={draft.avatarUrl ?? ''}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  avatarUrl: event.target.value || null,
                }))
              }
            />
          </Field>
          <Field label='Título'>
            <Input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </Field>
          <Field label='Subtítulo'>
            <Input
              value={draft.subtitle ?? ''}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  subtitle: event.target.value || null,
                }))
              }
            />
          </Field>
        </div>
      </EditorSection>

      <LinksManager
        clicksByLinkId={clicksByLinkId}
        draft={draft}
        mutations={mutations}
        setDraft={setDraft}
      />
      <SocialManager
        draft={draft}
        mutations={mutations}
      />
    </div>
  );
}
