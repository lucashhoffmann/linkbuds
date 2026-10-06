import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/app/modules/auth/hooks';
import { useEntitlements } from '@/app/modules/auth/hooks/use-entitlements';
import { LinkPageFooter } from '@/resources/pages/link-pages/renderer/link-page-renderer-parts';
import type { FooterSettings } from '@/app/modules/link-pages/types/link-pages.types';
import { useFooterDefaultUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { FooterEditor } from '@/resources/pages/link-pages/components/editor/footer-editor.component';
import { confirmAction } from '@/resources/components/base';
import { Button } from '@/resources/components/ui/button';
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
  const { company } = useSession();
  const [draft, setDraft] = useState(initial);

  async function save() {
    const applyToExisting = await confirmAction({
      title: 'Aplicar a todas as páginas?',
      description:
        'O rodapé padrão vale para páginas novas. Quer substituir também o rodapé de todas as páginas existentes?',
      confirmLabel: 'Aplicar a todas',
      cancelLabel: 'Só páginas novas',
    });
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

      <FooterEditor
        value={draft}
        whiteLabel={whiteLabel}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      />

      {draft.footerMode !== 'HIDDEN' && (
        <div className='bg-muted/60 flex justify-center rounded-xl border p-6 [&>footer]:m-0 [&>footer]:p-0'>
          <LinkPageFooter linkPage={{ ...draft, title: company?.name ?? '' }} />
        </div>
      )}

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
