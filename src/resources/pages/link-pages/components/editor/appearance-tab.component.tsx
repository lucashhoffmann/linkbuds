import { type Dispatch, type SetStateAction } from 'react';
import type {
  LinkPageDetail,
  LinkPageFooterStyle,
} from '@/app/modules/link-pages/types/link-pages.types';
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

// Renderer defaults (text-slate-950/600/500, title bold), shown while unset.
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
  {
    key: 'footerColor',
    boldKey: 'footerBold',
    label: 'Cor do rodapé',
    fallback: '#64748B',
    boldFallback: false,
  },
] as const;

// Renderer defaults: white background, subtle ring instead of a border.
const footerBoxFields = [
  { key: 'footerBackgroundColor', label: 'Fundo', fallback: '#FFFFFF' },
  { key: 'footerBorderColor', label: 'Borda', fallback: '#E2E8F0' },
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
      {draft.footerMode === 'CUSTOM' && (
        <div className='grid gap-4 border-t pt-4 md:grid-cols-3'>
          <h3 className='text-muted-foreground text-sm font-medium md:col-span-3'>
            Rodapé personalizado
          </h3>
          <Field label='Estilo'>
            <Select
              value={draft.footerStyle ?? 'TEXT'}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  footerStyle: event.target.value as LinkPageFooterStyle,
                }))
              }
            >
              <option value='TEXT'>Só texto</option>
              <option value='PILL'>Pílula</option>
              <option value='BOX'>Caixa</option>
            </Select>
          </Field>
          {draft.footerStyle &&
            draft.footerStyle !== 'TEXT' &&
            footerBoxFields.map(({ key, label, fallback }) => (
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
                </div>
              </Field>
            ))}
        </div>
      )}
    </EditorSection>
  );
}
