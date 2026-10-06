import { type Dispatch, type SetStateAction } from 'react';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { ColorPicker } from '@/resources/components/ui/color-picker';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import type { AutosaveStatus } from './editor.types';
import { Field, EditorSection } from './editor-fields.component';

export function AppearanceTab({
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
      title='Aparência'
      status={status}
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <Field label='Modelo'>
          <Select
            value={draft.layout}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                layout: event.target.value as LinkPageDetail['layout'],
              }))
            }
          >
            <option value='LAYOUT_1'>Modelo 1</option>
            <option value='LAYOUT_2'>Modelo 2</option>
            <option value='LAYOUT_3'>Modelo 3</option>
          </Select>
        </Field>
        <Field label='Plano de fundo'>
          <Select
            value={draft.backgroundType}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                backgroundType: event.target
                  .value as LinkPageDetail['backgroundType'],
              }))
            }
          >
            <option value='SOLID'>Cor sólida</option>
            <option value='IMAGE'>Imagem</option>
          </Select>
        </Field>
        <Field label='Cor sólida'>
          <ColorPicker
            label='Cor sólida'
            value={draft.backgroundColor}
            onChange={(backgroundColor) =>
              setDraft((current) => ({ ...current, backgroundColor }))
            }
          />
        </Field>
        <Field label='Imagem de fundo'>
          <Input
            value={draft.backgroundImageUrl ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                backgroundImageUrl: event.target.value || null,
              }))
            }
          />
        </Field>
      </div>
    </EditorSection>
  );
}
