import { type Dispatch, type SetStateAction } from 'react';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { ColorPicker } from '@/resources/components/ui/color-picker';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import type { AutosaveStatus } from './editor.types';
import {
  BorderEnabledField,
  Field,
  EditorSection,
} from './editor-fields.component';

// Renderer defaults (text-slate-950/600, title bold), shown while unset.
const textColorFields = [
  {
    key: 'titleColor',
    boldKey: 'titleBold',
    label: 'Cor do título',
    fallback: '#020617',
    boldFallback: true,
  },
  {
    key: 'subtitleColor',
    boldKey: 'subtitleBold',
    label: 'Cor do subtítulo',
    fallback: '#475569',
    boldFallback: false,
  },
] as const;

export function AppearanceTab({
  draft,
  status,
  setDraft,
}: {
  draft: LinkPageDetail;
  status: AutosaveStatus;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  const { backgroundType } = draft;

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
            value={backgroundType}
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
            <option value='GRADIENT'>Gradiente</option>
          </Select>
        </Field>
        {backgroundType === 'IMAGE' ? (
          <div className='md:col-span-2'>
            <Field label='URL da imagem de fundo'>
              <Input
                placeholder='https://...'
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
        ) : (
          <>
            <Field
              label={
                backgroundType === 'GRADIENT' ? 'Cor inicial' : 'Cor de fundo'
              }
            >
              <ColorPicker
                label={
                  backgroundType === 'GRADIENT' ? 'Cor inicial' : 'Cor de fundo'
                }
                value={draft.backgroundColor}
                onChange={(backgroundColor) =>
                  setDraft((current) => ({ ...current, backgroundColor }))
                }
              />
            </Field>
            {backgroundType === 'GRADIENT' && (
              <Field label='Cor final'>
                <ColorPicker
                  label='Cor final'
                  value={draft.backgroundGradientColor ?? '#FFFFFF'}
                  onChange={(backgroundGradientColor) =>
                    setDraft((current) => ({
                      ...current,
                      backgroundGradientColor,
                    }))
                  }
                />
              </Field>
            )}
          </>
        )}
      </div>
      <div className='grid gap-4 border-t pt-4'>
        <h3 className='text-muted-foreground text-sm font-medium'>Textos</h3>
        {textColorFields.map(
          ({ key, boldKey, label, fallback, boldFallback }) => (
            <Field
              key={key}
              label={label}
            >
              <div className='flex gap-2'>
                <ColorPicker
                  label={label}
                  value={draft[key] ?? fallback}
                  onChange={(color) =>
                    setDraft((current) => ({ ...current, [key]: color }))
                  }
                  className='flex-1'
                />
                <Button
                  type='button'
                  variant='outline'
                  className='h-12'
                  disabled={!draft[key]}
                  onClick={() =>
                    setDraft((current) => ({ ...current, [key]: null }))
                  }
                >
                  Padrão
                </Button>
                <BorderEnabledField
                  label='Negrito'
                  checked={draft[boldKey] ?? boldFallback}
                  onChange={(bold) =>
                    setDraft((current) => ({ ...current, [boldKey]: bold }))
                  }
                />
              </div>
            </Field>
          ),
        )}
      </div>
    </EditorSection>
  );
}
