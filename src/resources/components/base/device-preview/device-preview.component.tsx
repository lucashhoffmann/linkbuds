import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<PreviewDevice, number> = {
  desktop: 1024,
  tablet: 768,
  mobile: 390,
};

const DEVICE_LABEL: Record<PreviewDevice, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  wrap = false,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
  /** Let options flow into more rows on narrow screens instead of clipping. */
  wrap?: boolean;
}) {
  return (
    <div
      role='radiogroup'
      aria-label={label}
      className={cn(
        'bg-muted inline-flex rounded-full p-1',
        wrap && 'flex flex-wrap rounded-2xl [&>button]:flex-auto',
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          role='radio'
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'text-muted-foreground rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            value === option.value && 'bg-card text-foreground shadow-xs',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Renders children inside a device-width frame, scaled down to fit the
 * available width (the page keeps its real layout at that width).
 */
export function DevicePreview({
  children,
  defaultDevice = 'mobile',
  className,
}: {
  children: ReactNode;
  defaultDevice?: PreviewDevice;
  className?: string;
}) {
  const [device, setDevice] = useState<PreviewDevice>(defaultDevice);
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const frameWidth = DEVICE_WIDTH[device];
  const scale = availableWidth ? Math.min(1, availableWidth / frameWidth) : 1;

  useEffect(() => {
    const element = containerRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(([entry]) =>
      setAvailableWidth(entry.contentRect.width),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn('flex min-h-0 flex-col items-center gap-4', className)}>
      <SegmentedControl
        label='Dispositivo da prévia'
        value={device}
        onChange={setDevice}
        options={(Object.keys(DEVICE_WIDTH) as PreviewDevice[]).map(
          (value) => ({
            value,
            label: DEVICE_LABEL[value],
          }),
        )}
      />
      <div
        ref={containerRef}
        className='flex w-full min-w-0 justify-center'
      >
        {/* `zoom` (not transform) so the scaled height shrinks too. */}
        <div
          style={{ width: frameWidth, zoom: scale }}
          className='bg-card overflow-hidden rounded-3xl border shadow-sm'
        >
          {children}
        </div>
      </div>
    </div>
  );
}
