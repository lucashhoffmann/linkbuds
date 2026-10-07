import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { useLinkPageMutations } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { CodeBlock } from '@/resources/components/base';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/resources/components/ui/dialog';
import { Input } from '@/resources/components/ui/input';
import { EditorSection, Field } from './editor/editor-fields.component';
import {
  ga4MeasurementIdPattern,
  gtmContainerIdPattern,
  isTrackingIdValid,
  trackingIdsPayload,
} from './editor/editor.utils';
import { googleSheetsScript } from './editor/google-sheets-script';
import { useAutosaveSection } from './editor/use-autosave-section';

// Same rule as the API (`appsScriptUrlPattern`); shown inline before autosave fails.
const appsScriptUrlPattern =
  /^https:\/\/script\.google\.com\/macros\/s\/[\w-]{10,200}\/exec$/;

type IntegrationValues = Pick<
  LinkPageDetail,
  'gtmContainerId' | 'ga4MeasurementId' | 'formWebhookUrl'
>;

/**
 * "Integrações" of a page, same in the editor and the page canvas. Saves on
 * its own (autosave): Google tags on bios, Google Sheets on forms.
 */
export function IntegrationsPanel({ linkPage }: { linkPage: LinkPageDetail }) {
  const mutations = useLinkPageMutations(linkPage.id);
  const [values, setValues] = useState<IntegrationValues>({
    gtmContainerId: linkPage.gtmContainerId,
    ga4MeasurementId: linkPage.ga4MeasurementId,
    formWebhookUrl: linkPage.formWebhookUrl ?? null,
  });
  const isBio = !linkPage.parentPageId;
  const isForm = linkPage.type === 'FORM';
  const webhookUrl = values.formWebhookUrl ?? '';
  const webhookValid = !webhookUrl || appsScriptUrlPattern.test(webhookUrl);
  // Invalid values stay local until fixed; valid ones save.
  const payload = {
    ...(isBio ? trackingIdsPayload(values) : {}),
    ...(isForm && webhookValid ? { formWebhookUrl: webhookUrl || null } : {}),
  };
  const status = useAutosaveSection(payload, (changes) =>
    Object.keys(changes).length
      ? mutations.update.mutateAsync(changes)
      : Promise.resolve(),
  );
  const set = (patch: Partial<IntegrationValues>) =>
    setValues((current) => ({ ...current, ...patch }));

  return (
    <EditorSection
      title='Integrações'
      status={status}
    >
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {isBio ? (
          <GoogleTagsCard
            values={values}
            onChange={set}
          />
        ) : (
          <div className='rounded-md border p-4'>
            <IntegrationCard
              icon='G'
              title='Google'
              subtitle='Usa o Tag Manager / GA4 da página principal'
            />
          </div>
        )}
        {isForm && (
          <GoogleSheetsCard
            value={webhookUrl}
            valid={webhookValid}
            onChange={(formWebhookUrl) =>
              set({ formWebhookUrl: formWebhookUrl.trim() || null })
            }
          />
        )}
      </div>
      {!isBio && (
        <p className='text-muted-foreground text-xs'>
          Tag Manager e GA4 são configurados na página principal e valem para os
          posts e formulários dela.
        </p>
      )}
    </EditorSection>
  );
}

function IntegrationCard({
  icon,
  title,
  subtitle,
  connected = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  connected?: boolean;
}) {
  return (
    <span className='flex items-center gap-3'>
      <span className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-md text-lg font-bold'>
        {icon}
      </span>
      <span className='grid min-w-0 gap-0.5'>
        <span className='flex items-center gap-2 text-sm font-semibold'>
          {title}
          {connected && (
            <span className='rounded-full bg-[#d8ecd9] px-2 py-0.5 text-xs font-medium text-[#24592b]'>
              Conectado
            </span>
          )}
        </span>
        <span className='text-muted-foreground truncate text-xs'>
          {subtitle}
        </span>
      </span>
    </span>
  );
}

function CardDialog({
  trigger,
  title,
  description,
  children,
  footer,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  /** Extra actions next to "Concluir". */
  footer?: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type='button'
          className='bg-card hover:border-ring focus-visible:ring-ring/50 rounded-md border p-4 text-left transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
        >
          {trigger}
        </button>
      </DialogTrigger>
      {/* Header/footer stay put; only the body scrolls (min-w-0: long code can't widen the modal). */}
      <DialogContent className='flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl'>
        <DialogHeader className='border-b p-6 pr-12'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className='min-h-0 min-w-0 flex-1 overflow-y-auto p-6'>
          {children}
        </div>
        <DialogFooter className='border-t px-6 py-4'>
          {footer}
          <DialogClose asChild>
            <Button>Concluir</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoogleTagsCard({
  values,
  onChange,
}: {
  values: IntegrationValues;
  onChange: (patch: Partial<IntegrationValues>) => void;
}) {
  const connected = [values.gtmContainerId, values.ga4MeasurementId].filter(
    Boolean,
  );

  return (
    <CardDialog
      title='Google'
      description='Os scripts carregam só na página pública. Valem também para os posts e formulários desta página principal.'
      trigger={
        <IntegrationCard
          icon='G'
          title='Google'
          subtitle={
            connected.length
              ? connected.join(' · ')
              : 'Tag Manager e Analytics 4'
          }
          connected={connected.length > 0}
        />
      }
    >
      <div className='grid gap-4'>
        <TrackingIdField
          label='Google Tag Manager'
          placeholder='GTM-XXXXXXX'
          pattern={gtmContainerIdPattern}
          value={values.gtmContainerId}
          onChange={(gtmContainerId) => onChange({ gtmContainerId })}
        />
        <TrackingIdField
          label='Google Analytics 4'
          placeholder='G-XXXXXXXXXX'
          pattern={ga4MeasurementIdPattern}
          value={values.ga4MeasurementId}
          onChange={(ga4MeasurementId) => onChange({ ga4MeasurementId })}
        />
        <p className='text-muted-foreground text-xs'>
          Já usa GA4 dentro do GTM? Preencha só o GTM para não contar em dobro.
        </p>
      </div>
    </CardDialog>
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

function CopyScriptButton({
  variant = 'default',
}: {
  variant?: 'default' | 'outline';
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(googleSheetsScript);
      setCopied(true);
      toast.success('Script copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  return (
    <Button
      type='button'
      variant={variant}
      onClick={() => void copy()}
    >
      {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
      {copied ? 'Copiado' : 'Copiar script'}
    </Button>
  );
}

/** Apps Script bridge: each answer becomes a row in the agency's sheet. */
function GoogleSheetsCard({
  value,
  valid,
  onChange,
}: {
  value: string;
  valid: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <CardDialog
      title='Google Sheets'
      description='Cada resposta vira uma linha na sua planilha (uma aba por formulário).'
      footer={<CopyScriptButton variant='outline' />}
      trigger={
        <IntegrationCard
          icon='S'
          title='Google Sheets'
          subtitle={
            value && valid ? 'Respostas indo para a planilha' : 'Não conectado'
          }
          connected={Boolean(value) && valid}
        />
      }
    >
      <div className='flex min-w-0 flex-col gap-4'>
        <ol className='text-muted-foreground list-decimal space-y-2 pl-5 text-sm'>
          <li>
            Abra a planilha no Google Sheets → <b>Extensões → Apps Script</b>.
          </li>
          <li>
            <span className='flex flex-wrap items-center gap-x-3 gap-y-2'>
              Apague o código que aparecer e cole o script do LinkBuds.
              <CopyScriptButton />
            </span>
          </li>
          <li>
            <b>Implantar → Nova implantação</b> → tipo <b>App da Web</b>,
            executar como <b>Eu</b>, acesso <b>Qualquer pessoa</b> → Implantar e
            autorizar.
          </li>
          <li>
            Copie a <b>URL do app da Web</b> (termina em <code>/exec</code>) e
            cole abaixo.
          </li>
          <li>
            Respostas anteriores: tab <b>Respostas</b> →{' '}
            <b>Enviar pendentes à planilha</b>.
          </li>
        </ol>
        <Field label='URL do app da Web'>
          <Input
            type='url'
            placeholder='https://script.google.com/macros/s/.../exec'
            aria-invalid={!valid || undefined}
            errorMessage={
              valid
                ? ''
                : 'Use a URL do app da Web do Apps Script (começa com https://script.google.com/macros/s/ e termina em /exec).'
            }
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
        <details className='text-sm'>
          <summary className='text-muted-foreground hover:text-foreground cursor-pointer font-medium'>
            Ver script
          </summary>
          <CodeBlock
            code={googleSheetsScript}
            className='mt-2'
          />
        </details>
        <p className='text-muted-foreground text-xs'>
          A URL fica só no painel (não aparece na página pública). Mudou o
          script? Faça <b>Gerenciar implantações → Editar → Nova versão</b>.
        </p>
      </div>
    </CardDialog>
  );
}
