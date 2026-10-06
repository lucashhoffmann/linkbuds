'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/resources/components/ui/command';
import { Button } from '@/resources/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/resources/components/ui/popover';
import { cn } from '@/shared/lib/utils';

const comboboxMenu =
  // Above dialogs (z-[80]): a select inside a modal must open on top of it.
  'z-[90] rounded-md border bg-popover p-1 text-popover-foreground shadow-md';

const comboboxMenuItem =
  'rounded-sm px-3 py-2 text-sm outline-none transition hover:bg-accent hover:text-accent-foreground data-[selected=true]:!bg-accent data-[selected=true]:!text-accent-foreground';

export interface ComboboxOption {
  disabled?: boolean;
  label: React.ReactNode;
  value: string;
}

interface BjorkComboboxProps extends Omit<
  React.ComponentProps<typeof Button>,
  'children' | 'defaultValue' | 'name' | 'onChange' | 'value'
> {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  value?: string;
}

export function BjorkCombobox({
  className,
  defaultValue,
  disabled,
  name,
  onValueChange,
  options,
  placeholder = 'Selecionar...',
  required,
  value: controlledValue,
  'aria-label': ariaLabel,
  ...props
}: BjorkComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? options[0]?.value ?? '',
  );
  const value = controlledValue ?? uncontrolledValue;
  const selectedOption = options.find((option) => option.value === value);

  const select = (nextValue: string) => {
    if (controlledValue === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-label={
            ariaLabel ?? selectedOption?.label?.toString() ?? placeholder
          }
          disabled={disabled}
          className={cn('h-12 w-[220px] justify-between', className)}
          {...props}
        >
          <span className='truncate'>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronsUpDown
            className='opacity-45'
            aria-hidden='true'
          />
        </Button>
      </PopoverTrigger>
      {name && (
        <input
          type='hidden'
          name={name}
          value={value}
          disabled={disabled}
          required={required}
        />
      )}
      <PopoverContent
        className={cn(
          'w-[max(220px,var(--radix-popover-trigger-width))] p-0',
          comboboxMenu,
        )}
      >
        <Command className='text-popover-foreground bg-transparent'>
          <CommandInput
            placeholder='Pesquisar...'
            className='text-foreground placeholder:text-muted-foreground'
          />
          <CommandList>
            <CommandEmpty className='text-muted-foreground py-6 text-center text-sm'>
              Nenhuma opção encontrada.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label?.toString() ?? option.value}
                  disabled={option.disabled}
                  onSelect={() => select(option.value)}
                  className={comboboxMenuItem}
                >
                  <Check
                    className={cn(
                      'text-primary mr-1 size-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden='true'
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default BjorkCombobox;
