import { type Dispatch, type SetStateAction } from 'react';
import type {
  LinkPageDetail,
  SocialPlatform,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import { socialPlatformLabels } from '../../renderer/social-platform-icons';
import type { AutosaveStatus } from './editor.types';
import { Field, EditorSection } from './editor-fields.component';

export function SettingsTab({
  draft,
  status,
  setDraft,
}: {
  draft: LinkPageDetail;
  status: AutosaveStatus;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  return (
    <EditorSection
      title='Configurações'
      status={status}
    >
      <div className='grid items-start gap-4 md:grid-cols-2'>
        <Field label='Nome interno'>
          <Input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>
        <Field label='Slug'>
          <Input
            value={draft.slug}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                slug: event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, ''),
              }))
            }
          />
        </Field>
        <Field label='Status'>
          <Select
            value={draft.status}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                status: event.target.value as LinkPageDetail['status'],
              }))
            }
          >
            <option value='ACTIVE'>Ativa</option>
            <option value='INACTIVE'>Inativa</option>
          </Select>
        </Field>
        {draft.type === 'POST' && (
          <>
            <Field label='Rede do post'>
              <Select
                value={draft.postNetwork ?? ''}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    postNetwork: (event.target.value ||
                      null) as SocialPlatform | null,
                  }))
                }
              >
                <option value=''>Não informar</option>
                {Object.entries(socialPlatformLabels).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label='Link do post original'>
              <Input
                placeholder='https://instagram.com/p/...'
                value={draft.postUrl ?? ''}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    postUrl: event.target.value || null,
                  }))
                }
              />
            </Field>
          </>
        )}
        <Field label='URL pública'>
          <p className='bg-muted/50 flex h-12 items-center truncate rounded-md border px-3 text-sm font-medium'>
            /p/
            {draft.publicPath
              .split('/')
              .slice(0, -1)
              .concat(draft.slug)
              .join('/')}
          </p>
        </Field>
      </div>
    </EditorSection>
  );
}
