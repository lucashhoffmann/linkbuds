import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useEntitlements } from '@/app/modules/auth/hooks/use-entitlements';
import type {
  FooterSettings,
  LinkPageFooterMode,
} from '@/app/modules/link-pages/types/link-pages.types';
import { useFooterDefaultUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';

export function FooterDefaultSection() {
  const footer = useFooterDefaultUseCase();

  if (!footer.data) {
    return <Loader2 className='mx-auto size-5 animate-spin' />;
  }

  return (
    <FooterDefaultForm
      initial={footer.data}
      update={footer.update}
    />
  );
}

function FooterDefaultForm({
  initial,
  update,
}: {
  initial: FooterSettings;
  update: ReturnType<typeof useFooterDefaultUseCase>['update'];
}) {
  const { whiteLabel } = useEntitlements();
  const [draft, setDraft] = useState(initial);
  const [applyToExisting, setApplyToExisting] = useState(false);

  async function save() {
    try {
      await update.mutateAsync({ ...draft, applyToExisting });
      toast.success(
        applyToExisting
          ? 'Rodapé aplicado a todas as páginas'
          : 'Rodapé padrão salvo',
      );
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  const textField = (
    key: 'footerText' | 'footerUrl' | 'footerLogoUrl',
    placeholder: string,
  ) => (
    <Input
      placeholder={placeholder}
      disabled={!whiteLabel}
      value={draft[key] ?? ''}
      onChange={(event) =>
        setDraft((current) => ({
          ...current,
          [key]: event.target.value || null,
        }))
      }
    />
  );

  return (
    <section className='bg-card flex flex-col gap-4 rounded-2xl border p-4'>
      <div>
        <h2 className='font-semibold'>Rodapé padrão</h2>
        <p className='text-muted-foreground text-sm'>
          Usado em toda página nova. Cada página ainda pode ter o seu na aba
          Marca.
        </p>
      </div>

      {!whiteLabel && (
        <div className='bg-muted/40 flex items-center gap-3 rounded-md border p-4 text-sm'>
          <Lock className='size-4 shrink-0' />
          Marca branca está disponível em planos com o recurso habilitado.
        </div>
      )}

      <Select
        value={draft.footerMode}
        disabled={!whiteLabel}
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            footerMode: event.target.value as LinkPageFooterMode,
          }))
        }
      >
        <option value='LINKBUDS'>Com LinkBuds</option>
        <option value='CUSTOM'>Rodapé personalizado</option>
        <option value='HIDDEN'>Ocultar rodapé</option>
      </Select>

      {draft.footerMode === 'CUSTOM' && (
        <div className='grid gap-3 md:grid-cols-3'>
          {textField('footerText', 'Texto')}
          {textField('footerUrl', 'URL')}
          {textField('footerLogoUrl', 'URL do logo')}
        </div>
      )}

      <label className='flex items-center gap-2 text-sm'>
        <input
          type='checkbox'
          checked={applyToExisting}
          disabled={!whiteLabel}
          onChange={(event) => setApplyToExisting(event.target.checked)}
        />
        Aplicar também às páginas existentes (substitui o rodapé de cada uma)
      </label>

      <Button
        className='self-end'
        disabled={!whiteLabel || update.isLoading}
        onClick={save}
      >
        {update.isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Salvar
      </Button>
    </section>
  );
}
