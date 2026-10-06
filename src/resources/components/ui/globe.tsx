import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import {
  WORLD_MAP_PATH,
  WORLD_MAP_VIEWBOX,
} from '@/resources/components/ui/globe-utils/world-map';

const [, , MAP_WIDTH, MAP_HEIGHT] = WORLD_MAP_VIEWBOX.split(' ').map(Number);

export type GlobeFocus = { x: number; y: number; zoom: number };

/** Transform that zooms into `focus`, keeping the view inside the map. */
function focusTransform(focus?: GlobeFocus | null) {
  if (!focus || focus.zoom <= 1) return 'translate(0px, 0px) scale(1)';
  const { x, y, zoom } = focus;
  const clamp = (value: number, max: number) =>
    Math.min(Math.max(value, 0), max);
  const left = clamp(x - MAP_WIDTH / zoom / 2, MAP_WIDTH - MAP_WIDTH / zoom);
  const top = clamp(y - MAP_HEIGHT / zoom / 2, MAP_HEIGHT - MAP_HEIGHT / zoom);

  return `translate(${-left * zoom}px, ${-top * zoom}px) scale(${zoom})`;
}

export function GlobeGlow({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-full blur-3xl',
        className,
      )}
      {...props}
    />
  );
}

/**
 * World map; children are drawn in map coordinates (see COUNTRY_POINTS).
 * `focus` zooms (animated) into a point; children scale with the map.
 */
export function GlobeSvg({
  className,
  children,
  focus,
  ...props
}: React.ComponentProps<'svg'> & { focus?: GlobeFocus | null }) {
  const gradientId = React.useId();

  return (
    <svg
      viewBox={WORLD_MAP_VIEWBOX}
      className={cn('size-full', className)}
      preserveAspectRatio='xMidYMid meet'
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1='0'
          y1='0'
          x2='0'
          y2='1'
        >
          <stop
            offset='0.27'
            stopColor='var(--primary)'
          />
          <stop
            offset='0.74'
            stopColor='var(--foreground)'
          />
        </linearGradient>
      </defs>
      <g
        className='motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out'
        style={{ transform: focusTransform(focus) }}
      >
        <path
          d={WORLD_MAP_PATH}
          fill={`url(#${gradientId})`}
          fillOpacity='0.15'
          stroke='var(--foreground)'
          strokeOpacity='0.12'
          strokeWidth='0.75'
          vectorEffect='non-scaling-stroke'
        />
        {children}
      </g>
    </svg>
  );
}

export function Globe({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative flex aspect-[1000/411] w-full items-center justify-center',
        className,
      )}
      {...props}
    />
  );
}

export function GlobePin({
  x,
  y,
  ...props
}: React.ComponentProps<'g'> & { x: number; y: number }) {
  return (
    <g {...props}>
      <circle
        cx={x}
        cy={y}
        r='4'
        className='fill-primary'
      />
      <circle
        cx={x}
        cy={y}
        r='12'
        className='fill-primary/20 animate-pulse'
      />
    </g>
  );
}

export default Globe;
