import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface ISelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  errorMessage?: string;
}

const Select = React.forwardRef<HTMLSelectElement, ISelectProps>(
  ({ className, error, errorMessage, children, ...props }, ref) => {
    return (
      <>
        <select
          className={cn(
            `border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:border-ring flex h-12 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 ${
              errorMessage && 'border-destructive focus-visible:ring-destructive/20'
            } ${error && 'border-destructive focus-visible:ring-destructive/20'}`,
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {errorMessage && (
          <span className='text-destructive text-sm'>{errorMessage}</span>
        )}
      </>
    );
  },
);

Select.displayName = 'Select';

export { Select };
