import type { FormLimit } from '@/app/modules/link-pages/types/link-pages.types';
import { cn } from '@/shared/lib/utils';

/** Answers of the current cohort toward the form's response limit. */
export function FormLimitBar({
  limit,
  className,
  showPercent = false,
}: {
  limit: FormLimit;
  className?: string;
  /** Off where a big percent is already shown (analytics card). */
  showPercent?: boolean;
}) {
  const percent = Math.min(100, Math.round((limit.current / limit.max) * 100));

  return (
    <div className={cn('grid gap-1', className)}>
      <div
        role='progressbar'
        aria-label={`Respostas do corte ${limit.cohort}`}
        aria-valuemin={0}
        aria-valuemax={limit.max}
        aria-valuenow={limit.current}
        className='bg-primary/15 h-1.5 overflow-hidden rounded-full'
      >
        <div
          className='bg-primary h-full rounded-full transition-[width]'
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className='text-muted-foreground text-xs tabular-nums'>
        {showPercent && (
          <span className='text-foreground font-medium'>{percent}% · </span>
        )}
        {limit.current}/{limit.max} · corte {limit.cohort}
        {limit.closed && ' · encerrado'}
      </p>
    </div>
  );
}
