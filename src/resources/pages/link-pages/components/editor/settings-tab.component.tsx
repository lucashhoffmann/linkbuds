import { type Dispatch, type SetStateAction } from 'react';
import type {
  LinkPageDetail,
  SocialPlatform,
} from '@/app/modules/link-pages/types/link-pages.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/resources/components/ui/dialog';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import { socialPlatformLabels } from '../../renderer/social-platform-icons';
import type { AutosaveStatus } from './editor.types';
import {
  ga4MeasurementIdPattern,
  gtmContainerIdPattern,
  isTrackingIdValid,
} from './editor.utils';
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
      {!draft.parentPageId && (
        <div className='mt-6 grid gap-4 border-t pt-6'>
          <div>
            <h3 className='text-sm font-semibold'>Integrações</h3>
            <p className='text-muted-foreground text-xs'>
              Valem também para os posts desta bio.
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <GoogleIntegrationCard
              draft={draft}
              setDraft={setDraft}
            />
          </div>
        </div>
      )}
    </EditorSection>
  );
}

function GoogleIntegrationCard({
  draft,
  setDraft,
}: {
  draft: LinkPageDetail;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  const connected = [draft.gtmContainerId, draft.ga4MeasurementId].filter(
    Boolean,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type='button'
          className='bg-card hover:border-ring focus-visible:ring-ring/50 flex items-center gap-3 rounded-md border p-4 text-left transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
        >
          <span className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-md text-lg font-bold'>
            G
          </span>
          <span className='grid min-w-0 gap-0.5'>
            <span className='text-sm font-semibold'>Google</span>
            <span className='text-muted-foreground truncate text-xs'>
              {connected.length
                ? connected.join(' · ')
                : 'Tag Manager e Analytics 4'}
            </span>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google</DialogTitle>
          <DialogDescription>
            Os scripts carregam só na página pública. Valem também para os posts
            desta bio.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <TrackingIdField
            label='Google Tag Manager'
            placeholder='GTM-XXXXXXX'
            pattern={gtmContainerIdPattern}
            value={draft.gtmContainerId}
            onChange={(gtmContainerId) =>
              setDraft((current) => ({ ...current, gtmContainerId }))
            }
          />
          <TrackingIdField
            label='Google Analytics 4'
            placeholder='G-XXXXXXXXXX'
            pattern={ga4MeasurementIdPattern}
            value={draft.ga4MeasurementId}
            onChange={(ga4MeasurementId) =>
              setDraft((current) => ({ ...current, ga4MeasurementId }))
            }
          />
          <p className='text-muted-foreground text-xs'>
            Já usa GA4 dentro do GTM? Preencha só o GTM para não contar em
            dobro.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TrackingIdField({
  label,
  placeholder,
  pattern,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  pattern: RegExp;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const invalid = !isTrackingIdValid(value, pattern);

  return (
    <Field label={label}>
      <Input
        placeholder={placeholder}
        value={value ?? ''}
        aria-invalid={invalid}
        errorMessage={invalid ? `Formato inválido. Ex.: ${placeholder}` : ''}
        onChange={(event) =>
          onChange(event.target.value.trim().toUpperCase() || null)
        }
      />
    </Field>
  );
}

// Every plan has analytics; the API applies the BASIC/FULL tier.
