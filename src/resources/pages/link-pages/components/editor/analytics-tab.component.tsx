import { lazy, Suspense, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Hourglass,
  Trophy,
  Clock3,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Globe,
  Info,
  Lock,
  Maximize2,
  MousePointerClick,
  PanelLeftClose,
  Radio,
  Target,
  Users,
} from 'lucide-react';
import { useLinkPageAnalyticsInsightsUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  FormLimit,
  LinkPageAnalyticsGroupItem,
  LinkPageAnalyticsSummary,
  LinkPageAnalyticsTimeseriesPoint,
  LinkPageDetail,
} from '@/app/modules/link-pages/types/link-pages.types';
import { SegmentedControl } from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import { Calendar } from '@/resources/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/resources/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/resources/components/ui/tooltip';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { downloadCsv } from '@/app/modules/link-pages/utils/csv.util';
import {
  dateInputValue,
  startOfDayIso,
  endOfDayIso,
  toNumber,
  formatNumber,
  formatPercent,
  formatDuration,
  targetLabel,
} from './editor.utils';
import { Field } from './editor-fields.component';
import { FormLimitBar } from '../form-limit-bar.component';

// Lazy: the world map asset only loads when the globe is opened.
const CountriesGlobeDialog = lazy(() =>
  import('./countries-globe-dialog.component').then((module) => ({
    default: module.CountriesGlobeDialog,
  })),
);

/** Compact last-30-days summary shown beside the page preview. */
export function AnalyticsSummary({
  linkPage,
  onShowAll,
  onHide,
}: {
  linkPage: LinkPageDetail;
  onShowAll: () => void;
  onHide: () => void;
}) {
  const insights = useLinkPageAnalyticsInsightsUseCase(linkPage.id, {
    from: startOfDayIso(dateInputValue(30)),
    to: endOfDayIso(dateInputValue(0)),
  });
  const data = insights.data;
  const summary = data?.summary;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 font-medium whitespace-nowrap'>
          <BarChart3 className='size-4' />
          {data?.tier === 'FULL' ? 'Últimos 30 dias' : 'Últimos 7 dias'}
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={onHide}
        >
          <PanelLeftClose className='size-4' />
          Ocultar
        </Button>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <MetricCard
          icon={<Activity className='size-4' />}
          label='Visualizações'
          value={formatNumber(summary?.pageViews)}
        />
        <MetricCard
          icon={<Users className='size-4' />}
          label='Visitantes'
          value={formatNumber(summary?.uniqueVisitors)}
        />
        <MetricCard
          icon={<MousePointerClick className='size-4' />}
          label='Cliques'
          value={formatNumber(summary?.totalClicks)}
        />
        <MetricCard
          icon={<BarChart3 className='size-4' />}
          label='CTR'
          value={formatPercent(summary?.clickThroughRate ?? 0)}
        />
        {linkPage.type === 'FORM' && (
          <>
            <MetricCard
              icon={<Clock3 className='size-4' />}
              label='Duração média'
              hint='Tempo médio de permanência na página.'
              value={formatDuration(summary?.averageDurationMs ?? 0)}
            />
            <FormMetricCards
              summary={summary}
              limit={data?.formLimit}
            />
          </>
        )}
      </div>
      <AnalyticsPanel
        title='Principais links'
        icon={<MousePointerClick className='size-4' />}
      >
        <RankedList
          chart
          emptyLabel='Nenhum clique registrado no período.'
          items={(data?.topTargets ?? []).slice(0, 5).map((target) => ({
            label: targetLabel(linkPage, target),
            count: toNumber(target.clicks),
          }))}
        />
      </AnalyticsPanel>
      <Button
        variant='outline'
        size='sm'
        className='w-full'
        onClick={onShowAll}
      >
        Ver análises completas
      </Button>
    </div>
  );
}

export function AnalyticsTab({ linkPage }: { linkPage: LinkPageDetail }) {
  const [fromDate, setFromDate] = useState(() => dateInputValue(30));
  const [toDate, setToDate] = useState(() => dateInputValue(0));
  const insights = useLinkPageAnalyticsInsightsUseCase(linkPage.id, {
    from: fromDate ? startOfDayIso(fromDate) : undefined,
    to: toDate ? endOfDayIso(toDate) : undefined,
  });
  const [view, setView] = useState<'list' | 'chart'>('chart');
  const data = insights.data;
  const isFull = data?.tier === 'FULL';
  const summary = data?.summary;
  const chart = view === 'chart';
  const printRef = useRef<HTMLDivElement>(null);
  const [globeOpened, setGlobeOpened] = useState(false);
  const [globeOpen, setGlobeOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

  /** Print only the panel in a clean window; the user saves it as PDF. */
  function exportPdf() {
    const win = window.open('', '_blank');
    if (!win || !printRef.current) {
      toast.error('Permita pop-ups para exportar o PDF.');
      return;
    }
    const styles = [
      ...document.querySelectorAll('style, link[rel="stylesheet"]'),
    ]
      .map((node) =>
        node instanceof HTMLLinkElement
          ? `<link rel="stylesheet" href="${node.href}">`
          : node.outerHTML,
      )
      .join('');
    win.document.write(
      `<!doctype html><html class="${document.documentElement.className}"><head><title>Análises - ${linkPage.name}</title>${styles}</head><body class="p-6">${printRef.current.outerHTML}</body></html>`,
    );
    win.document.close();
    win.addEventListener('load', () => {
      win.print();
      win.close();
    });
  }

  /** One sheet, long format (Seção; Item; Valor): opens in Excel as-is. */
  function exportCsv() {
    if (!data) return;
    const s = data.summary;
    const group = (section: string, items: LinkPageAnalyticsGroupItem[]) =>
      items.map((item) => [section, item.label, toNumber(item.count)]);
    downloadCsv(`analises-${linkPage.slug}-${fromDate}_${toDate}.csv`, [
      ['Seção', 'Item', 'Valor'],
      ['Período', 'De', fromDate],
      ['Período', 'Até', toDate],
      ['Resumo', 'Visualizações', toNumber(s.pageViews)],
      ['Resumo', 'Visitantes', toNumber(s.uniqueVisitors)],
      ['Resumo', 'Cliques', toNumber(s.totalClicks)],
      ['Resumo', 'CTR', formatPercent(s.clickThroughRate ?? 0)],
      ['Resumo', 'Duração média', formatDuration(s.averageDurationMs ?? 0)],
      ...(linkPage.type === 'FORM'
        ? [
            ['Resumo', 'Respostas', s.formSubmissions ?? 0],
            [
              'Resumo',
              'Tempo p/ responder',
              formatDuration(s.averageFormDurationMs ?? 0),
            ],
            ...(s.averageFormScore
              ? [
                  [
                    'Resumo',
                    'Nota média',
                    `${s.averageFormScore.score}/${s.averageFormScore.max}`,
                  ],
                ]
              : []),
          ]
        : []),
      ...data.topTargets.map((target) => [
        'Principais links',
        targetLabel(linkPage, target),
        toNumber(target.clicks),
      ]),
      ...data.timeseries.map((point) => [
        'Visitas por dia',
        point.date.slice(0, 10),
        toNumber(point.count),
      ]),
      ...group('Origens', data.sources),
      ...group('Dispositivos', data.devices),
      ...group('Países', data.countries),
      ...(data.visitorIps ?? []).map((visitor) => [
        'IPs dos visitantes',
        visitor.ip,
        visitor.count,
      ]),
    ]);
  }

  const json = jsonOpen
    ? JSON.stringify(
        {
          page: { name: linkPage.name, path: linkPage.publicPath },
          ...data,
          topTargets: data?.topTargets.map((target) => ({
            ...target,
            label: targetLabel(linkPage, target),
          })),
        },
        null,
        2,
      )
    : '';

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
      toast.success('JSON copiado — cole na sua IA');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  return (
    <div
      ref={printRef}
      className='@container space-y-5'
    >
      <div className='flex flex-col gap-3 @4xl:flex-row @4xl:items-center @4xl:justify-between'>
        <div>
          <div className='flex items-center gap-2 font-medium'>
            <BarChart3 className='size-4' />
            Análises
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            {isFull
              ? 'Análises completas por período.'
              : 'Plano grátis: janela básica fixa dos últimos 7 dias.'}
          </p>
        </div>
        {isFull && (
          <div className='flex flex-wrap items-center gap-2 print:hidden'>
            <SegmentedControl
              label='Visualização'
              value={view}
              onChange={setView}
              options={[
                { value: 'chart', label: 'Gráficos' },
                { value: 'list', label: 'Lista' },
              ]}
            />
            <Button
              variant='outline'
              size='sm'
              disabled={!data}
              onClick={() => setJsonOpen(true)}
            >
              <FileJson className='size-4' />
              Copiar JSON (IA)
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={!data}
              onClick={exportPdf}
            >
              <FileDown className='size-4' />
              PDF
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={!data}
              onClick={exportCsv}
            >
              <FileSpreadsheet className='size-4' />
              CSV
            </Button>
          </div>
        )}
        {isFull && (
          <div className='grid gap-2 @xs:grid-cols-2 print:hidden'>
            <Field label='De'>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
              />
            </Field>
            <Field label='Até'>
              <DatePicker
                value={toDate}
                onChange={setToDate}
              />
            </Field>
          </div>
        )}
      </div>

      {insights.isLoading && (
        <div className='rounded-md border p-4 text-sm'>
          Carregando análises...
        </div>
      )}

      <div
        className={`grid grid-cols-2 gap-3 @md:grid-cols-3 ${linkPage.type === 'FORM' ? '' : '@4xl:grid-cols-6'}`}
      >
        <MetricCard
          icon={<Radio className='size-4' />}
          label='Online agora'
          value={formatNumber(summary?.onlineNow)}
        />
        <MetricCard
          icon={<Activity className='size-4' />}
          label='Visualizações'
          value={formatNumber(summary?.pageViews)}
        />
        <MetricCard
          icon={<Users className='size-4' />}
          label='Visitantes'
          value={formatNumber(summary?.uniqueVisitors)}
        />
        <MetricCard
          icon={<MousePointerClick className='size-4' />}
          label='Cliques'
          value={formatNumber(summary?.totalClicks)}
        />
        <MetricCard
          icon={<BarChart3 className='size-4' />}
          label='CTR'
          hint='Taxa de cliques: cliques ÷ visualizações. Mostra quantas visitas resultaram em clique em algum link.'
          value={formatPercent(summary?.clickThroughRate ?? 0)}
        />
        <MetricCard
          icon={<Clock3 className='size-4' />}
          label='Duração média'
          value={formatDuration(summary?.averageDurationMs ?? 0)}
        />
        {linkPage.type === 'FORM' && (
          <FormMetricCards
            summary={summary}
            limit={data?.formLimit}
          />
        )}
      </div>

      <div className='grid gap-4 @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
        <AnalyticsPanel
          title='Principais links'
          icon={<MousePointerClick className='size-4' />}
        >
          <RankedList
            chart={chart}
            emptyLabel='Nenhum clique registrado no período.'
            items={(data?.topTargets ?? []).map((target) => ({
              label: targetLabel(linkPage, target),
              count: toNumber(target.clicks),
            }))}
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          title='Visitas por dia'
          icon={<CalendarDays className='size-4' />}
          locked={!data?.limits.advancedDimensionsEnabled}
        >
          {data?.limits.advancedDimensionsEnabled ? (
            chart ? (
              <TimeseriesBars points={data.timeseries} />
            ) : (
              <RankedList
                emptyLabel='Sem visitas no período.'
                items={data.timeseries.map((point) => ({
                  label: new Date(point.date).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC',
                  }),
                  count: toNumber(point.count),
                }))}
              />
            )
          ) : (
            <LockedAnalyticsLabel />
          )}
        </AnalyticsPanel>
      </div>

      <div className='grid gap-4 @lg:grid-cols-3'>
        <AnalyticsGroupPanel
          title='Origens'
          chart={chart}
          items={data?.sources ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
        />
        <AnalyticsGroupPanel
          title='Dispositivos'
          chart={chart}
          items={data?.devices ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
        />
        <AnalyticsGroupPanel
          title='Países'
          chart={chart}
          items={data?.countries ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
          action={
            isFull && (
              <Button
                variant='ghost'
                size='icon'
                className='size-7 print:hidden'
                aria-label='Expandir países no globo'
                onClick={() => {
                  setGlobeOpened(true);
                  setGlobeOpen(true);
                }}
              >
                <Maximize2 className='size-4' />
              </Button>
            )
          }
        />
      </div>

      <Dialog
        open={jsonOpen}
        onOpenChange={setJsonOpen}
      >
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>JSON para IA</DialogTitle>
            <DialogDescription>
              Copie os dados do período e cole no ChatGPT, Claude ou Gemini com
              um pedido como: “Analise estas métricas da minha página de links e
              sugira melhorias para aumentar os cliques”.
            </DialogDescription>
          </DialogHeader>
          <pre className='bg-muted/40 max-h-[50vh] overflow-auto rounded-md border p-3 font-mono text-xs'>
            {json}
          </pre>
          <DialogFooter>
            <Button onClick={() => void copyJson()}>
              <FileJson className='size-4' />
              Copiar JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {globeOpened && (
        <Suspense fallback={null}>
          <CountriesGlobeDialog
            linkPageId={linkPage.id}
            open={globeOpen}
            onOpenChange={setGlobeOpen}
            from={fromDate ? startOfDayIso(fromDate) : undefined}
            to={toDate ? endOfDayIso(toDate) : undefined}
          />
        </Suspense>
      )}

      <AnalyticsPanel
        title='IPs dos visitantes'
        icon={<Globe className='size-4' />}
      >
        {data?.visitorIps?.length ? (
          <div className='grid max-h-80 gap-1 overflow-y-auto text-sm'>
            {data.visitorIps.map((visitor) => (
              <div
                key={visitor.ip}
                className='bg-muted/30 flex items-center justify-between gap-3 rounded-md px-3 py-2'
              >
                <span className='min-w-0 truncate font-mono'>{visitor.ip}</span>
                <span className='text-muted-foreground shrink-0 text-xs'>
                  {formatNumber(visitor.count)} visita
                  {visitor.count === 1 ? '' : 's'} ·{' '}
                  {new Date(visitor.lastSeenAt).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Nenhum IP registrado no período.
          </p>
        )}
      </AnalyticsPanel>
    </div>
  );
}

/** Answers and answer rate (answers ÷ visitors) for form pages. */
function FormMetricCards({
  summary,
  limit,
}: {
  summary: LinkPageAnalyticsSummary | undefined;
  limit: FormLimit | null | undefined;
}) {
  const answers = summary?.formSubmissions ?? 0;
  const visitors = summary?.uniqueVisitors ?? 0;
  return (
    <>
      <MetricCard
        icon={<ClipboardList className='size-4' />}
        label='Respostas'
        value={formatNumber(answers)}
      />
      <MetricCard
        icon={<ClipboardCheck className='size-4' />}
        label='Taxa de resposta'
        hint='Respostas ÷ visitantes. Quanto menor, mais gente visitou o formulário sem responder.'
        value={formatPercent(visitors ? answers / visitors : 0)}
      />
      <MetricCard
        icon={<Hourglass className='size-4' />}
        label='Tempo p/ responder'
        hint='Tempo médio entre abrir o formulário e enviar a resposta.'
        value={formatDuration(summary?.averageFormDurationMs ?? 0)}
      />
      {summary?.averageFormScore && (
        <MetricCard
          icon={<Trophy className='size-4' />}
          label='Nota média'
          hint='Média da pontuação das respostas no período (questionário com pontuação).'
          value={`${summary.averageFormScore.score.toLocaleString('pt-BR')}/${summary.averageFormScore.max.toLocaleString('pt-BR')}`}
        />
      )}
      {limit && (
        <div className='rounded-md border p-3'>
          <div className='text-muted-foreground flex items-center gap-2 text-xs'>
            <Target className='size-4' />
            <span>Limite de respostas</span>
          </div>
          <p className='mt-2 text-xl font-semibold'>
            {formatPercent(limit.current / limit.max)}
          </p>
          <FormLimitBar
            limit={limit}
            className='mt-2'
          />
        </div>
      )}
    </>
  );
}

export function MetricCard({
  hint,
  icon,
  label,
  value,
}: {
  hint?: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
        {icon}
        <span>{label}</span>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                aria-label={`Sobre ${label}`}
                className='hover:text-foreground print:hidden'
              >
                <Info className='size-3.5' />
              </TooltipTrigger>
              <TooltipContent className='max-w-60'>{hint}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className='mt-2 text-xl font-semibold'>{value}</p>
    </div>
  );
}

export function AnalyticsPanel({
  action,
  children,
  icon,
  locked = false,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  locked?: boolean;
  title: string;
}) {
  return (
    <section className='rounded-md border p-4'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 font-medium'>
          {icon}
          {title}
        </div>
        {locked ? <Lock className='text-muted-foreground size-4' /> : action}
      </div>
      <div className='mt-3'>{children}</div>
    </section>
  );
}

export function RankedList({
  chart = false,
  emptyLabel,
  items,
}: {
  chart?: boolean;
  emptyLabel: string;
  items: Array<{ label: string; count: number }>;
}) {
  if (!items.length) {
    return <p className='text-muted-foreground text-sm'>{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className='grid gap-2'>
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className='bg-muted/30 relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-3 py-2 text-sm'
        >
          {/* Chart mode: proportional bar behind the row. */}
          {chart && (
            <div
              aria-hidden='true'
              className='bg-primary/15 absolute inset-y-0 left-0 print:[print-color-adjust:exact]'
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          )}
          <span className='relative min-w-0 truncate'>
            {index + 1}. {item.label}
          </span>
          <span className='relative font-medium'>
            {formatNumber(item.count)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TimeseriesBars({
  points,
}: {
  points: LinkPageAnalyticsTimeseriesPoint[];
}) {
  const max = Math.max(...points.map((point) => toNumber(point.count)), 0);

  if (!points.length) {
    return (
      <p className='text-muted-foreground text-sm'>Sem visitas no período.</p>
    );
  }

  return (
    <div className='flex h-44 gap-1'>
      {points.map((point) => {
        const count = toNumber(point.count);
        // Sqrt scale: small counts stay visible, the max is still the tallest.
        const height = count && max ? 8 + 92 * Math.sqrt(count / max) : 0;
        const date = new Date(point.date);

        return (
          <div
            key={point.date}
            className='flex h-full min-w-5 flex-1 flex-col items-center gap-1'
            title={`${date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}: ${formatNumber(count)}`}
          >
            <span className='text-[10px] font-medium'>
              {count ? formatNumber(count) : ''}
            </span>
            <div className='relative w-full flex-1'>
              <div
                className='bg-primary absolute inset-x-0 bottom-0 mx-auto max-w-8 rounded-t-sm print:[print-color-adjust:exact]'
                style={{ height: `${height}%` }}
              />
            </div>
            <span className='text-muted-foreground self-stretch border-t pt-1 text-center text-[10px] whitespace-nowrap'>
              {date.toLocaleDateString('pt-BR', {
                timeZone: 'UTC',
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LockedAnalyticsLabel() {
  return (
    <p className='text-muted-foreground text-sm'>
      Disponível nos planos Agência e Personalizado.
    </p>
  );
}

export function AnalyticsGroupPanel({
  action,
  chart = false,
  items,
  locked,
  title,
}: {
  action?: ReactNode;
  chart?: boolean;
  items: LinkPageAnalyticsGroupItem[];
  locked: boolean;
  title: string;
}) {
  return (
    <AnalyticsPanel
      title={title}
      locked={locked}
      action={action}
    >
      {locked ? (
        <LockedAnalyticsLabel />
      ) : (
        <RankedList
          chart={chart}
          emptyLabel='Sem dados no período.'
          items={items.map((item) => ({
            label: item.label,
            count: toNumber(item.count),
          }))}
        />
      )}
    </AnalyticsPanel>
  );
}

// value/onChange use 'yyyy-MM-dd', same shape the native date input had.
function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-between font-normal'
        >
          {selected ? format(selected, 'dd/MM/yyyy') : 'Selecionar data'}
          <CalendarDays className='size-4 opacity-60' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0'
        align='start'
      >
        <Calendar
          mode='single'
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, 'yyyy-MM-dd'));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
