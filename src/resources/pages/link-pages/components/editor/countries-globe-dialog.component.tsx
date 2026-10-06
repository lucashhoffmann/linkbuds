import { useState } from 'react';
import { Globe as GlobeIcon, Radio, ZoomIn, ZoomOut } from 'lucide-react';
import { useLinkPageAnalyticsGeoUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type { LinkPageAnalyticsGeoVisit } from '@/app/modules/link-pages/types/link-pages.types';
import { SegmentedControl } from '@/resources/components/base/device-preview/device-preview.component';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import { Button } from '@/resources/components/ui/button';
import { Globe, GlobePin, GlobeSvg } from '@/resources/components/ui/globe';
import { COUNTRY_POINTS } from '@/resources/components/ui/globe-utils/world-map';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/resources/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { formatNumber } from './editor.utils';

type Mode = 'realtime' | 'visitors';

const countryZoom = 4;

const countryNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

function countryName(code: string) {
  if (code === 'unknown') return 'Desconhecido';
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function CountriesGlobeDialog({
  linkPageId,
  open,
  onOpenChange,
  from,
  to,
}: {
  linkPageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  to?: string;
}) {
  const [mode, setMode] = useState<Mode>('visitors');
  const [selected, setSelected] = useState<string | null>(null);
  const realtime = mode === 'realtime';
  const geo = useLinkPageAnalyticsGeoUseCase(
    linkPageId,
    { realtime, from, to },
    open,
  );
  const locations = geo.data?.locations ?? [];
  const max = Math.max(...locations.map((location) => location.count), 1);
  // Zoom follows the clicked country, else the one with most visits.
  const [focusCode, setFocusCode] = useState<string | null>(null);
  const [showWorld, setShowWorld] = useState(false);
  const focusTarget =
    (focusCode && COUNTRY_POINTS[focusCode] ? focusCode : null) ??
    locations.find((location) => COUNTRY_POINTS[location.countryCode])
      ?.countryCode;
  const focusPoint = focusTarget ? COUNTRY_POINTS[focusTarget] : undefined;
  const zoom = !showWorld && focusPoint ? countryZoom : 1;

  function focusCountry(code: string | null) {
    setFocusCode(code);
    setShowWorld(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='flex h-[100dvh] w-screen max-w-none flex-col gap-4 rounded-none sm:max-w-none'>
        <DialogHeader className='flex-row flex-wrap items-center justify-between gap-3 pr-8'>
          <div>
            <DialogTitle className='flex items-center gap-2'>
              <GlobeIcon className='size-4' />
              Países
            </DialogTitle>
            <DialogDescription>
              {realtime
                ? 'Quem está na página agora. Atualiza a cada 10 segundos.'
                : 'Visitas do período selecionado.'}{' '}
              Clique num país para ver as visitas.
            </DialogDescription>
          </div>
          <SegmentedControl
            label='Modo do globo'
            value={mode}
            onChange={(value) => {
              setMode(value);
              setSelected(null);
              focusCountry(null);
            }}
            options={[
              { value: 'realtime', label: 'Tempo real' },
              { value: 'visitors', label: 'Visitantes' },
            ]}
          />
        </DialogHeader>

        <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]'>
          <div className='relative flex min-h-0 items-center overflow-hidden rounded-md'>
            {focusTarget && (
              <Button
                variant='outline'
                size='sm'
                className='absolute top-2 right-2 z-10'
                onClick={() => setShowWorld(zoom > 1)}
              >
                {zoom > 1 ? (
                  <>
                    <ZoomOut className='size-4' />
                    Ver mundo todo
                  </>
                ) : (
                  <>
                    <ZoomIn className='size-4' />
                    Zoom em {countryName(focusTarget)}
                  </>
                )}
              </Button>
            )}
            <Globe>
              <GlobeSvg
                focus={
                  focusPoint
                    ? { x: focusPoint[0], y: focusPoint[1], zoom }
                    : null
                }
              >
                {locations.map((location) => {
                  const point = COUNTRY_POINTS[location.countryCode];
                  if (!point) return null;
                  // Divided by zoom so pins keep their on-screen size.
                  const scale = (0.6 + Math.sqrt(location.count / max)) / zoom;

                  return (
                    <Popover
                      key={location.countryCode}
                      open={selected === location.countryCode}
                      onOpenChange={(next) =>
                        setSelected(next ? location.countryCode : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <GlobePin
                          x={point[0]}
                          y={point[1]}
                          role='button'
                          tabIndex={0}
                          aria-label={`${countryName(location.countryCode)}: ${location.count} visita${location.count === 1 ? '' : 's'}`}
                          className='cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-current'
                          style={{
                            transformOrigin: `${point[0]}px ${point[1]}px`,
                            transform: `scale(${scale})`,
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setSelected(location.countryCode);
                            }
                          }}
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        side='top'
                        updatePositionStrategy='always'
                        className='z-[90] w-80 p-3'
                      >
                        <CountryVisits
                          code={location.countryCode}
                          count={location.count}
                          visits={location.visits}
                        />
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </GlobeSvg>
            </Globe>
          </div>

          <aside className='flex min-h-0 flex-col rounded-md border p-3'>
            <div className='flex items-center justify-between text-sm font-medium'>
              <span className='flex items-center gap-2'>
                {realtime && <Radio className='text-primary size-4' />}
                {realtime ? 'Online agora' : 'Visitas'}
              </span>
              <span>{formatNumber(geo.data?.total ?? 0)}</span>
            </div>
            <div className='mt-3 grid min-h-0 gap-1 overflow-y-auto text-sm'>
              {geo.isLoading && (
                <p className='text-muted-foreground'>Carregando...</p>
              )}
              {!geo.isLoading && !locations.length && (
                <p className='text-muted-foreground'>
                  {realtime
                    ? 'Ninguém na página agora.'
                    : 'Sem visitas no período.'}
                </p>
              )}
              {locations.map((location) => {
                const active = selected === location.countryCode;
                const pinned = Boolean(COUNTRY_POINTS[location.countryCode]);

                return (
                  <div key={location.countryCode}>
                    <button
                      type='button'
                      aria-expanded={active}
                      onClick={() => {
                        setSelected(active ? null : location.countryCode);
                        if (!active && pinned)
                          focusCountry(location.countryCode);
                      }}
                      className={cn(
                        'hover:bg-muted flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left',
                        active && 'bg-muted',
                      )}
                    >
                      <span className='min-w-0 truncate'>
                        {countryName(location.countryCode)}
                      </span>
                      <span className='font-medium'>
                        {formatNumber(location.count)}
                      </span>
                    </button>
                    {/* No pin to anchor a popover: show the visits inline. */}
                    {active && !pinned && (
                      <div className='px-3 pb-2'>
                        <CountryVisits
                          code={location.countryCode}
                          count={location.count}
                          visits={location.visits}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CountryVisits({
  code,
  count,
  visits,
}: {
  code: string;
  count: number;
  visits: LinkPageAnalyticsGeoVisit[];
}) {
  return (
    <div className='text-sm'>
      <div className='flex items-center justify-between gap-2'>
        <p className='font-medium'>{countryName(code)}</p>
        <p className='text-muted-foreground tabular-nums'>
          {formatNumber(count)} visita{count === 1 ? '' : 's'}
        </p>
      </div>
      <ul className='mt-2 grid max-h-64 gap-1 overflow-y-auto'>
        {visits.map((visit, index) => (
          <li
            key={`${visit.createdAt}-${index}`}
            className='bg-muted/40 rounded-md px-2 py-1.5'
          >
            <div className='flex justify-between gap-2 text-xs'>
              <span className='font-mono'>{visit.ipAddress ?? 'IP —'}</span>
              <span className='text-muted-foreground'>
                {new Date(visit.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className='text-muted-foreground truncate text-xs'>
              {[visit.deviceType, visit.browser, visit.operatingSystem]
                .filter(Boolean)
                .join(' · ') || 'Dispositivo desconhecido'}
              {visit.source ? ` · ${visit.source}` : ''}
            </p>
          </li>
        ))}
      </ul>
      {count > visits.length && (
        <p className='text-muted-foreground mt-1 text-xs'>
          Mostrando as {visits.length} mais recentes.
        </p>
      )}
    </div>
  );
}
