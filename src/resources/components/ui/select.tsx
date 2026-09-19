import * as React from 'react';

import {
  BjorkCombobox,
  type ComboboxOption,
} from '@/resources/components/ui/primitive-combobox';
import { cn } from '@/shared/lib/utils';

export interface ISelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  children: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
}

function Select({
  children,
  className,
  defaultValue,
  error,
  errorMessage,
  onChange,
  value,
  ...props
}: ISelectProps) {
  const { 'aria-label': ariaLabel, disabled, id, name, required } = props;
  const options = React.Children.toArray(children).flatMap((child) => {
    if (
      !React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(
        child,
      )
    )
      return [];

    return [
      {
        disabled: child.props.disabled,
        label: child.props.children,
        value: String(child.props.value ?? child.props.children),
      } satisfies ComboboxOption,
    ];
  });

  return (
    <>
      <BjorkCombobox
        aria-label={ariaLabel}
        disabled={disabled}
        id={id}
        name={name}
        options={options}
        required={required}
        value={value?.toString()}
        defaultValue={defaultValue?.toString()}
        onValueChange={(nextValue) =>
          onChange?.({
            target: { value: nextValue },
          } as React.ChangeEvent<HTMLSelectElement>)
        }
        className={cn(
          'w-full',
          (errorMessage || error) &&
            'border-destructive focus-visible:ring-destructive/20',
          className,
        )}
      />
      {errorMessage && (
        <span className='text-destructive text-sm'>{errorMessage}</span>
      )}
    </>
  );
}

export { Select };
