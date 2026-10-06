import { useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  Clock3,
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
import { Input } from '@/resources/components/ui/input';
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
  const data = insights.data;
  const isFull = data?.tier === 'FULL';
  const summary = data?.summary;

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
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
          <div className='grid gap-2 sm:grid-cols-2'>
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

      <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6'>
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

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
        <AnalyticsPanel
          title='Principais links'
          icon={<MousePointerClick className='size-4' />}
        >
          <RankedList
            emptyLabel='Nenhum clique registrado no período.'
            items={(data?.topTargets ?? []).map((target) => ({
              label: targetLabel(linkPage, target),
              value: formatNumber(target.clicks),
            }))}
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          title='Visitas por dia'
          icon={<CalendarDays className='size-4' />}
          locked={!data?.limits.advancedDimensionsEnabled}
        >
          {data?.limits.advancedDimensionsEnabled ? (
            <TimeseriesBars points={data.timeseries} />
          ) : (
            <LockedAnalyticsLabel />
          )}
        </AnalyticsPanel>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <AnalyticsGroupPanel
          title='Origens'
          items={data?.sources ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
        />
        <AnalyticsGroupPanel
          title='Dispositivos'
          items={data?.devices ?? []}
          locked={!data?.limits.advancedDimensionsEnabled}
        />
        <AnalyticsGroupPanel
          title='Países'
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
  emptyLabel,
  items,
}: {
  emptyLabel: string;
  items: Array<{ label: string; value: string }>;
}) {
  if (!items.length) {
    return <p className='text-muted-foreground text-sm'>{emptyLabel}</p>;
  }

  return (
    <div className='grid gap-2'>
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className='bg-muted/30 flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm'
        >
          <span className='min-w-0 truncate'>
            {index + 1}. {item.label}
          </span>
          <span className='font-medium'>{item.value}</span>
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
              className='bg-primary w-full rounded-t-sm'
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
  items,
  locked,
  title,
}: {
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
          emptyLabel='Sem dados no período.'
          items={items.map((item) => ({
            label: item.label,
            value: formatNumber(item.count),
          }))}
        />
      )}
    </AnalyticsPanel>
  );
}
