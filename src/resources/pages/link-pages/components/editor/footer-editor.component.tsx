import type {
  FooterSettings,
  LinkPageFooterMode,
  LinkPageFooterSize,
  LinkPageFooterStyle,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { ColorPicker } from '@/resources/components/ui/color-picker';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import { BorderEnabledField, Field } from './editor-fields.component';

type ColorKey = 'footerColor' | 'footerBackgroundColor' | 'footerBorderColor';

// Select reads its direct <option> children, so no Fragment wrapper.
const sizeOptions = [
  ['SMALL', 'Pequeno'],
  ['MEDIUM', 'Médio'],
  ['LARGE', 'Grande'],
] as const;

function FooterStyleFields({
  value,
  disabled,
  onChange,
}: {
  value: FooterSettings;
  disabled?: boolean;
  onChange: (patch: Partial<FooterSettings>) => void;
}) {
  const style = value.footerStyle ?? 'TEXT';
  const boxed = style !== 'TEXT';

  // Fallbacks mirror the renderer defaults shown while unset.
  const colorField = (key: ColorKey, label: string, fallback: string) => (
    <Field label={label}>
      <div className='flex gap-2'>
        <ColorPicker
          label={label}
          value={value[key] ?? fallback}
          onChange={(color) => onChange({ [key]: color })}
          className='flex-1'
        />
        <Button
          type='button'
          variant='outline'
          className='h-12'
          disabled={disabled || !value[key]}
          onClick={() => onChange({ [key]: null })}
        >
          Padrão
        </Button>
      </div>
    </Field>
  );

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Field label='Estilo'>
        <Select
          value={style}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              footerStyle: event.target.value as LinkPageFooterStyle,
            })
          }
        >
          <option value='TEXT'>Só texto</option>
          <option value='PILL'>Pílula</option>
          <option value='BOX'>Caixa</option>
        </Select>
      </Field>
      <Field label='Tamanho da fonte'>
        <Select
          value={value.footerFontSize ?? 'SMALL'}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              footerFontSize: event.target.value as LinkPageFooterSize,
            })
          }
        >
          {sizeOptions.map(([size, label]) => (
            <option
              key={size}
              value={size}
            >
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label='Tamanho do logo'>
        <Select
          value={value.footerLogoSize ?? 'SMALL'}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              footerLogoSize: event.target.value as LinkPageFooterSize,
            })
          }
        >
          {sizeOptions.map(([size, label]) => (
            <option
              key={size}
              value={size}
            >
              {label}
            </option>
          ))}
        </Select>
      </Field>
      {colorField('footerColor', 'Cor do texto', boxed ? '#020617' : '#64748B')}
      <Field label='Peso do texto'>
        <BorderEnabledField
          label='Negrito'
          checked={value.footerBold ?? false}
          onChange={(footerBold) => onChange({ footerBold })}
        />
      </Field>
      <div className='hidden md:block' />
      {boxed && colorField('footerBackgroundColor', 'Fundo', '#FFFFFF')}
      {boxed && colorField('footerBorderColor', 'Borda', '#E2E8F0')}
    </div>
  );
}

const contentFields = [
  ['footerText', 'Texto', 'Ex.: Feito por Agência X'],
  ['footerUrl', 'Link ao clicar', 'https://...'],
  ['footerLogoUrl', 'URL do logo', 'https://.../logo.png'],
] as const;

/** Footer mode + CUSTOM content/look; used by the page Marca tab and the company default. */
export function FooterEditor({
  value,
  whiteLabel,
  onChange,
}: {
  value: FooterSettings;
  /** Without it only "Com LinkBuds" is selectable. */
  whiteLabel: boolean;
  onChange: (patch: Partial<FooterSettings>) => void;
}) {
  return (
    <div className='grid gap-4'>
      <Field label='Rodapé'>
        <Select
          value={value.footerMode}
          onChange={(event) =>
            onChange({ footerMode: event.target.value as LinkPageFooterMode })
          }
        >
          <option value='LINKBUDS'>Com LinkBuds</option>
          <option
            value='CUSTOM'
            disabled={!whiteLabel}
          >
            Rodapé personalizado
          </option>
          <option
            value='HIDDEN'
            disabled={!whiteLabel}
          >
            Ocultar rodapé
          </option>
        </Select>
      </Field>
      {value.footerMode === 'CUSTOM' && (
        <>
          <div className='grid gap-4 md:grid-cols-3'>
            {contentFields.map(([key, label, placeholder]) => (
              <Field
                key={key}
                label={label}
              >
                <Input
                  placeholder={placeholder}
                  disabled={!whiteLabel}
                  value={value[key] ?? ''}
                  onChange={(event) =>
                    onChange({ [key]: event.target.value || null })
                  }
                />
              </Field>
            ))}
          </div>
          <FooterStyleFields
            value={value}
            disabled={!whiteLabel}
            onChange={onChange}
          />
        </>
      )}
    </div>
  );
}
