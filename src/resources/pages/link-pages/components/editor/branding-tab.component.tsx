import { type Dispatch, type SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Globe2, Lock } from 'lucide-react';
import type {
  LinkPageDetail,
  LinkPageFooterMode,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import { routes } from '@/shared/constants/router.constants';
import type { AutosaveStatus } from './editor.types';
import { Field, EditorSection } from './editor-fields.component';

export function BrandingTab({
  draft,
  enabled,
  status,
  setDraft,
}: {
  draft: LinkPageDetail;
  enabled: boolean;
  status: AutosaveStatus;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  return (
    <EditorSection
      title='Marca'
      status={status}
    >
      <div className='bg-muted/40 flex flex-col gap-3 rounded-md border p-4 text-sm sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-start gap-3'>
          <Globe2 className='mt-0.5 size-4 shrink-0' />
          <div>
            <p className='font-medium'>Domínio próprio</p>
            <p className='text-muted-foreground mt-1'>
              O apontamento DNS fica em Configurações, na aba Domínio.
            </p>
          </div>
        </div>
        <Button
          asChild
          size='sm'
          variant='outline'
          className='shrink-0'
        >
          <RouterLink to={routes.settingsDomain}>Configurar domínio</RouterLink>
        </Button>
      </div>
      {!enabled && (
        <div className='bg-muted/40 flex items-center gap-3 rounded-md border p-4 text-sm'>
          <Lock className='size-4' />
          Marca branca está disponível em planos com o recurso habilitado. O
          modo Com LinkBuds permanece permitido.
        </div>
      )}
      <Field label='Rodapé'>
        <Select
          value={draft.footerMode}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerMode: event.target.value as LinkPageFooterMode,
            }))
          }
        >
          <option value='LINKBUDS'>Com LinkBuds</option>
          <option
            value='CUSTOM'
            disabled={!enabled}
          >
            Rodapé personalizado
          </option>
          <option
            value='HIDDEN'
            disabled={!enabled}
          >
            Ocultar rodapé
          </option>
        </Select>
      </Field>
      <div className='grid gap-3 md:grid-cols-3'>
        <Input
          placeholder='Texto'
          value={draft.footerText ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerText: event.target.value || null,
            }))
          }
        />
        <Input
          placeholder='URL'
          value={draft.footerUrl ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerUrl: event.target.value || null,
            }))
          }
        />
        <Input
          placeholder='URL do logo'
          value={draft.footerLogoUrl ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              footerLogoUrl: event.target.value || null,
            }))
          }
        />
      </div>
    </EditorSection>
  );
}
