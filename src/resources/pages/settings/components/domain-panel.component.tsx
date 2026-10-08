import { confirmAction } from '@/resources/components/base';
import { Copy } from 'lucide-react';
import { type FormEvent } from 'react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import type { CompanyDomain } from '@/app/modules/link-pages/types/link-pages.types';
import type { useCompanyDomainUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';

const DOMAIN_STATUS: Record<
  CompanyDomain['status'],
  { label: string; help: string }
> = {
  PENDING: {
    label: 'Aguardando DNS',
    help: 'Crie os dois registros abaixo. Verificamos sozinhos a cada 2 minutos e o status muda aqui; para checar na hora, clique em Verificar.',
  },
  VERIFIED: {
    label: 'Falta o apontamento',
    help: 'Posse confirmada. Crie o registro de apontamento (CNAME); verificamos sozinhos a cada 2 minutos ou clique em Verificar.',
  },
  ACTIVE: {
    label: 'Ativo',
    help: 'Suas páginas já abrem neste domínio, com HTTPS.',
  },
  FAILED: {
    label: 'Falhou',
    help: 'O registro TXT sumiu. Recrie-o e clique em Verificar.',
  },
};

export function DomainPanel({
  domain,
}: {
  domain: ReturnType<typeof useCompanyDomainUseCase>;
}) {
  const currentDomain = domain.data;
  const createDomain = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const hostname = String(formData.get('hostname') ?? '');
    if (hostname) domain.create.mutate(hostname);
  };

  if (currentDomain) {
    const status = DOMAIN_STATUS[currentDomain.status];
    const active = currentDomain.status === 'ACTIVE';

    return (
      <div className='mt-3 rounded-md border p-3 text-sm'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
          <p className='min-w-0 font-medium break-all'>
            {currentDomain.hostname}
          </p>
          <span
            className={cn(
              'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
              active
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
            )}
          >
            <span
              aria-hidden='true'
              className={cn(
                'size-1.5 rounded-full',
                active ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            {status.label}
          </span>
        </div>
        <p
          className={cn(
            'mt-2 rounded-md px-3 py-2 text-xs',
            active
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
          )}
        >
          {status.help}
          {active && (
            <>
              {' '}
              <a
                href={`https://${currentDomain.hostname}`}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium underline'
              >
                Abrir {currentDomain.hostname}
              </a>
            </>
          )}
        </p>
        <div className='bg-muted/40 mt-3 grid gap-3 rounded-md p-3'>
          <p className='text-muted-foreground'>
            Crie os dois registros no provedor do domínio. A propagação do DNS
            pode levar alguns minutos; checamos automaticamente até 72h.
          </p>
          {currentDomain.dnsRecords.map((record) => (
            <div
              key={record.type}
              className='grid gap-2 md:grid-cols-[auto_1fr_1fr]'
            >
              <DnsInstructionItem
                label={
                  record.purpose === 'OWNERSHIP' ? '1. Posse' : '2. Apontamento'
                }
                value={record.type}
              />
              <DnsInstructionItem
                label='Host / Nome'
                value={record.name}
                copyable
              />
              <DnsInstructionItem
                label='Valor / Destino'
                value={record.value}
                copyable
              />
            </div>
          ))}
          <p className='text-muted-foreground text-xs'>
            Se o provedor completar o domínio sozinho, informe só a parte antes
            dele (ex.: <code>_linkbuds.www</code> ou <code>@</code> para a
            raiz). Domínio raiz sem CNAME? Use ALIAS/ANAME para o mesmo destino.
          </p>
        </div>
        <div className='mt-3 flex gap-2'>
          <Button
            type='button'
            size='sm'
            variant={active ? 'outline' : 'default'}
            disabled={domain.verify.isPending}
            onClick={() => domain.verify.mutate(currentDomain.id)}
          >
            {domain.verify.isPending ? 'Verificando…' : 'Verificar'}
          </Button>
          <Button
            type='button'
            size='sm'
            variant='destructive'
            onClick={async () => {
              if (
                await confirmAction({
                  title: `Remover ${currentDomain.hostname}?`,
                  description:
                    'A página deixa de responder neste domínio imediatamente.',
                  confirmLabel: 'Remover',
                  destructive: true,
                })
              ) {
                domain.remove.mutate(currentDomain.id);
              }
            }}
          >
            Remover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className='mt-3 flex flex-col gap-3'
      onSubmit={createDomain}
    >
      <div className='text-muted-foreground bg-muted/40 rounded-md p-3 text-sm'>
        Depois de salvar o domínio, vamos mostrar os registros DNS exatos para
        configurar.
      </div>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
        <div className='flex-1'>
          <Label htmlFor='hostname'>Domínio</Label>
          <Input
            id='hostname'
            name='hostname'
            placeholder='www.suaagencia.com'
          />
        </div>
        <Button
          type='submit'
          disabled={domain.create.isPending}
        >
          Salvar domínio
        </Button>
      </div>
    </form>
  );
}

function DnsInstructionItem({
  help,
  label,
  value,
  copyable = false,
}: {
  help?: string;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copiado');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  return (
    <div className='min-w-0'>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <div className='bg-background mt-1 flex items-start gap-1 rounded-lg px-2 py-1'>
        {/* Full value, wrapped: it has to be copied exactly. */}
        <code className='min-w-0 flex-1 py-0.5 text-xs break-all'>{value}</code>
        {copyable && (
          <button
            type='button'
            onClick={() => void copy()}
            aria-label={`Copiar ${label}`}
            className='text-muted-foreground hover:text-foreground -m-1 flex size-8 shrink-0 items-center justify-center rounded-md'
          >
            <Copy className='size-3.5' />
          </button>
        )}
      </div>
      {help && <p className='text-muted-foreground mt-1 text-xs'>{help}</p>}
    </div>
  );
}
