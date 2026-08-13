import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  ({ className, type, error, errorMessage, ...props }, ref) => {
    return (
      <>
        <input
          type={type}
          className={cn(
            `border-input placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:border-ring flex h-12 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 ${
              errorMessage && 'border-destructive focus-visible:ring-destructive/20'
            } ${error && 'border-destructive focus-visible:ring-destructive/20'}`,
            className,
          )}
          ref={ref}
          {...props}
        />
        {errorMessage && (
          <span className='text-destructive text-sm'>{errorMessage as string}</span>
        )}
      </>
    );
  },
);
Input.displayName = 'Input';

export { Input };
