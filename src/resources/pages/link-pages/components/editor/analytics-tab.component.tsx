import { useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  Clock3,
  FileDown,
  FileJson,
  Lock,
  MousePointerClick,
  Radio,
  Users,
} from 'lucide-react';
import { useLinkPageAnalyticsInsightsUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  LinkPageAnalyticsGroupItem,
  LinkPageAnalyticsTimeseriesPoint,
  LinkPageDetail,
} from '@/app/modules/link-pages/types/link-pages.types';
import { SegmentedControl } from '@/resources/components/base/device-preview/device-preview.component';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { toast } from 'sonner';
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

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
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
        ),
      );
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
              onClick={() => void copyJson()}
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
          </div>
        )}
        {isFull && (
          <div className='grid gap-2 @xs:grid-cols-2 print:hidden'>
            <Field label='De'>
              <Input
                type='date'
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </Field>
            <Field label='Até'>
              <Input
                type='date'
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
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

      <div className='grid grid-cols-2 gap-3 @md:grid-cols-3 @4xl:grid-cols-6'>
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
          value={formatPercent(summary?.clickThroughRate ?? 0)}
        />
        <MetricCard
          icon={<Clock3 className='size-4' />}
          label='Duração média'
          value={formatDuration(summary?.averageDurationMs ?? 0)}
        />
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
                  label: new Date(point.date).toLocaleDateString('pt-BR'),
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
        />
      </div>
    </div>
  );
}

export function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
        {icon}
        <span>{label}</span>
      </div>
      <p className='mt-2 text-xl font-semibold'>{value}</p>
    </div>
  );
}

export function AnalyticsPanel({
  children,
  icon,
  locked = false,
  title,
}: {
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
        {locked && <Lock className='text-muted-foreground size-4' />}
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
    <div className='flex h-44 items-end gap-1'>
      {points.map((point) => {
        const count = toNumber(point.count);
        const height = max ? Math.max(6, (count / max) * 100) : 6;
        const date = new Date(point.date);

        return (
          <div
            key={point.date}
            className='flex min-w-5 flex-1 flex-col items-center gap-2'
            title={`${date.toLocaleDateString('pt-BR')}: ${formatNumber(count)}`}
          >
            <div
              className='bg-primary w-full rounded-t-sm print:[print-color-adjust:exact]'
              style={{ height: `${height}%` }}
            />
            <span className='text-muted-foreground text-[10px]'>
              {date.getDate()}
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
  chart = false,
  items,
  locked,
  title,
}: {
  chart?: boolean;
  items: LinkPageAnalyticsGroupItem[];
  locked: boolean;
  title: string;
}) {
  return (
    <AnalyticsPanel
      title={title}
      locked={locked}
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
