import { Fragment, useState } from 'react';
import {
  ChevronDown,
  ClipboardList,
  Download,
  Eye,
  Inbox,
  Pencil,
  Sheet,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link as RouterLink } from 'react-router-dom';
import type {
  FormAnswerValue,
  FormField,
  LinkPageSummary,
} from '@/app/modules/link-pages/types/link-pages.types';
import {
  useFormSubmissionsUseCase,
  useLinkPagesOverviewUseCase,
} from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { toCsv } from '@/app/modules/link-pages/utils/csv.util';
import { confirmAction } from '@/resources/components/base';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';

const action =
  'text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-md';

/** A bio's forms with their response count (all-time). */
export function FormsTab({
  forms,
  onView,
  onResponses,
  onRemove,
}: {
  forms: LinkPageSummary[];
  onView: (form: LinkPageSummary) => void;
  onResponses: (form: LinkPageSummary) => void;
  onRemove: (form: LinkPageSummary) => void;
}) {
  const overview = useLinkPagesOverviewUseCase();
  const counts = new Map(
    (overview.data?.pages ?? []).map((page) => [page.id, page.submissions]),
  );
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const visible = forms.filter(
    (form) =>
      !term || `${form.name} ${form.publicPath}`.toLowerCase().includes(term),
  );

  if (forms.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>
        Nenhum formulário ainda. Use “Novo formulário” acima.
      </p>
    );
  }

  return (
    <div className='grid gap-3'>
      <Input
        type='search'
        aria-label='Buscar formulários'
        placeholder='Buscar por nome ou link'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {visible.length === 0 ? (
        <p className='text-muted-foreground text-sm'>
          Nenhum formulário encontrado.
        </p>
      ) : (
        <ul className='bg-card divide-y rounded-xl border'>
          {visible.map((form) => {
            const count = counts.get(form.id) ?? 0;

            return (
              <li
                key={form.id}
                className='flex items-center gap-3 px-3 py-2'
              >
                <span
                  aria-hidden='true'
                  className='bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md'
                >
                  <ClipboardList className='size-3.5' />
                </span>
                <div className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-medium'>
                    {form.name}
                  </span>
                  <p className='text-muted-foreground truncate text-xs'>
                    /p/{form.publicPath}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => onResponses(form)}
                  className='text-muted-foreground hover:text-foreground shrink-0 text-sm tabular-nums underline-offset-2 hover:underline'
                >
                  {count} {count === 1 ? 'resposta' : 'respostas'}
                </button>
                <div className='flex items-center'>
                  <button
                    type='button'
                    onClick={() => onResponses(form)}
                    title='Respostas'
                    aria-label={`Respostas de ${form.name}`}
                    className={action}
                  >
                    <Inbox className='size-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => onView(form)}
                    title='Visualizar'
                    aria-label={`Visualizar ${form.name}`}
                    className={action}
                  >
                    <Eye className='size-4' />
                  </button>
                  <RouterLink
                    to={routes.linkPages.edit(form.id)}
                    title='Editar'
                    aria-label={`Editar ${form.name}`}
                    className={action}
                  >
                    <Pencil className='size-4' />
                  </RouterLink>
                  <button
                    type='button'
                    onClick={() => onRemove(form)}
                    title='Excluir'
                    aria-label={`Excluir ${form.name}`}
                    className={cn(action, 'hover:text-destructive')}
                  >
                    <Trash2 className='size-4' />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatValue(value: FormAnswerValue | undefined) {
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  return value ?? '';
}

const MAX_COLUMNS = 3;

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

/** Answers of one form, newest first, with visitor data and CSV export. */
export function ResponsesTab({
  form,
  fields,
  sheetConnected,
}: {
  form: LinkPageSummary;
  /** Current fields: column order. Answers to removed fields still show. */
  fields: FormField[];
  /** Google Sheets webhook set in the editor. */
  sheetConnected: boolean;
}) {
  const submissions = useFormSubmissionsUseCase(form.id);
  const allItems = submissions.data?.items ?? [];
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const total = submissions.data?.total ?? 0;
  const pending = allItems.filter((item) => !item.webhookDeliveredAt).length;

  function resend() {
    submissions.resend.mutate(undefined, {
      onSuccess: ({ sent, failed }) =>
        failed
          ? toast.error(
              `${sent} enviada(s), ${failed} com falha. Confira o script e a implantação da planilha.`,
            )
          : toast.success(`${sent} resposta(s) enviada(s) para a planilha.`),
    });
  }
  const columns = [
    ...fields.map(({ id, label }) => ({ id, label })),
    ...allItems
      .flatMap((item) => item.answers)
      .filter(
        (answer, index, all) =>
          !fields.some((field) => field.id === answer.id) &&
          all.findIndex((other) => other.id === answer.id) === index,
      )
      .map(({ id, label }) => ({ id, label: `${label} (removido)` })),
  ];
  const term = query.trim().toLowerCase();
  const rows = allItems
    .map((item) => {
      const byId = new Map(item.answers.map((answer) => [answer.id, answer]));

      return {
        item,
        values: columns.map((column) =>
          formatValue(byId.get(column.id)?.value),
        ),
        device: [item.deviceType, item.browser, item.operatingSystem]
          .filter(Boolean)
          .join(' · '),
        // Local YYYY-MM-DD, comparable with <input type="date"> values.
        day: new Date(item.createdAt).toLocaleDateString('sv-SE'),
      };
    })
    .filter(
      ({ item, values, device, day }) =>
        (!from || day >= from) &&
        (!to || day <= to) &&
        (!term ||
          [...values, item.ipAddress, item.countryCode, device]
            .join(' ')
            .toLowerCase()
            .includes(term)),
    );
  const filtered = Boolean(term || from || to);
  // Table shows the first fields; the rest open per row.
  const shown = columns.slice(0, MAX_COLUMNS);
  const hidden = columns.length - shown.length;

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function exportCsv() {
    const csv = toCsv([
      [
        'Data',
        ...columns.map((column) => column.label),
        'IP',
        'País',
        'Dispositivo',
      ],
      ...rows.map(({ item, values, device }) => [
        dateFormat.format(new Date(item.createdAt)),
        ...values,
        item.ipAddress,
        item.countryCode,
        device,
      ]),
    ]);
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `respostas-${form.slug}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function remove(id: string) {
    const confirmed = await confirmAction({
      title: 'Excluir esta resposta?',
      description: 'Essa ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      destructive: true,
    });

    if (confirmed) submissions.remove.mutate(id);
  }

  if (submissions.isLoading) {
    return <p className='text-muted-foreground text-sm'>Carregando...</p>;
  }

  if (allItems.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>
        Nenhuma resposta ainda. Compartilhe o link do formulário.
      </p>
    );
  }

  return (
    <div className='grid gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <p className='text-muted-foreground mr-auto text-sm'>
          {filtered && `${rows.length} de `}
          {total} {total === 1 ? 'resposta' : 'respostas'}
          {total > allItems.length &&
            ` · mostrando as ${allItems.length} mais recentes`}
        </p>
        {sheetConnected && pending > 0 && (
          <Button
            variant='outline'
            size='sm'
            disabled={submissions.resend.isPending}
            onClick={resend}
          >
            <Sheet className='size-4' />
            {submissions.resend.isPending
              ? 'Enviando...'
              : `Enviar ${pending} pendente(s) à planilha`}
          </Button>
        )}
        <Button
          variant='outline'
          size='sm'
          disabled={rows.length === 0}
          onClick={exportCsv}
        >
          <Download className='size-4' />
          Exportar CSV
        </Button>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          type='search'
          aria-label='Buscar respostas'
          placeholder='Buscar em qualquer campo'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className='min-w-48 flex-1'
        />
        <Input
          type='date'
          aria-label='De'
          title='De'
          value={from}
          max={to || undefined}
          onChange={(event) => setFrom(event.target.value)}
          className='w-auto'
        />
        <Input
          type='date'
          aria-label='Até'
          title='Até'
          value={to}
          min={from || undefined}
          onChange={(event) => setTo(event.target.value)}
          className='w-auto'
        />
        {filtered && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setQuery('');
              setFrom('');
              setTo('');
            }}
          >
            Limpar
          </Button>
        )}
      </div>
      {rows.length === 0 ? (
        <p className='text-muted-foreground text-sm'>
          Nenhuma resposta encontrada com esses filtros.
        </p>
      ) : (
        <div className='bg-card overflow-x-auto rounded-xl border'>
          <table className='w-full text-left text-sm'>
            <thead className='text-muted-foreground border-b text-xs'>
              <tr>
                <th className='px-3 py-2 font-medium whitespace-nowrap'>
                  Data
                </th>
                {shown.map((column) => (
                  <th
                    key={column.id}
                    className='px-3 py-2 font-medium whitespace-nowrap'
                  >
                    {column.label}
                  </th>
                ))}
                <th className='px-3 py-2 font-medium'>IP</th>
                <th className='px-3 py-2 font-medium'>País</th>
                <th className='px-3 py-2 font-medium'>Dispositivo</th>
                <th className='px-3 py-2'>
                  <span className='sr-only'>Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {rows.map(({ item, values, device }) => {
                const open = expanded.has(item.id);

                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td className='px-3 py-2 whitespace-nowrap tabular-nums'>
                        {dateFormat.format(new Date(item.createdAt))}
                      </td>
                      {values.slice(0, MAX_COLUMNS).map((value, index) => (
                        <td
                          key={columns[index].id}
                          className='max-w-64 truncate px-3 py-2'
                          title={value}
                        >
                          {value}
                        </td>
                      ))}
                      <td className='px-3 py-2 font-mono text-xs whitespace-nowrap'>
                        {item.ipAddress ?? '—'}
                      </td>
                      <td className='px-3 py-2'>{item.countryCode ?? '—'}</td>
                      <td className='px-3 py-2 whitespace-nowrap'>
                        {device || '—'}
                      </td>
                      <td className='px-1 py-1'>
                        <div className='flex items-center justify-end'>
                          {hidden > 0 && (
                            <button
                              type='button'
                              onClick={() => toggle(item.id)}
                              aria-expanded={open}
                              title={
                                open
                                  ? 'Recolher'
                                  : `Ver mais ${hidden} campo(s)`
                              }
                              aria-label={
                                open ? 'Recolher resposta' : 'Expandir resposta'
                              }
                              className={action}
                            >
                              <ChevronDown
                                className={cn(
                                  'size-4 transition-transform',
                                  open && 'rotate-180',
                                )}
                              />
                            </button>
                          )}
                          <button
                            type='button'
                            onClick={() => void remove(item.id)}
                            title='Excluir resposta'
                            aria-label='Excluir resposta'
                            className={cn(action, 'hover:text-destructive')}
                          >
                            <Trash2 className='size-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className='bg-muted/40'>
                        <td
                          colSpan={shown.length + 5}
                          className='px-3 py-3'
                        >
                          <dl className='grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
                            {columns.slice(MAX_COLUMNS).map((column, index) => (
                              <div
                                key={column.id}
                                className='min-w-0'
                              >
                                <dt className='text-muted-foreground text-xs'>
                                  {column.label}
                                </dt>
                                <dd className='break-words whitespace-pre-wrap'>
                                  {values[MAX_COLUMNS + index] || '—'}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
