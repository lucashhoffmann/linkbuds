import * as React from 'react';
import { Check } from 'lucide-react';
import { Popover } from 'radix-ui';
import { cn } from '@/shared/lib/utils';

const hexColor = /^#[0-9A-F]{6}$/;
const palette = [
  '#111827',
  '#374151',
  '#6B7280',
  '#FFFFFF',
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#D946EF',
  '#EC4899',
  '#25D366',
];

function validHex(value: string) {
  return hexColor.test(value.toUpperCase());
}

export function ColorPicker({
  className,
  label,
  onChange,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string | null>(null);
  const inputId = React.useId();
  const valueId = React.useId();
  const color = validHex(value) ? value.toUpperCase() : '#000000';
  const hex = inputValue ?? color;
  const currentColor = validHex(hex) ? hex.toUpperCase() : color;

  const updateColor = (nextValue: string) => {
    const nextHex = nextValue.toUpperCase();
    setInputValue(nextHex);

    if (validHex(nextHex)) onChange(nextHex);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setInputValue(null);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type='button'
          aria-label={label}
          aria-describedby={valueId}
          className={cn(
            'border-input bg-background hover:bg-accent focus-visible:ring-ring/50 flex h-12 items-center gap-2 rounded-md border px-2 text-left shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none',
            className,
          )}
        >
          <span
            aria-hidden='true'
            className='size-7 shrink-0 rounded border border-black/10'
            style={{ backgroundColor: currentColor }}
          />
          <span
            id={valueId}
            className='font-mono text-xs'
          >
            {currentColor}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        {/* z-[90]: above dialogs (z-[80]), same layer as primitive-combobox. */}
        <Popover.Content
          align='start'
          sideOffset={8}
          className='bg-popover text-popover-foreground z-[90] w-64 rounded-md border p-3 shadow-md outline-none'
        >
          <div
            className='grid grid-cols-4 gap-2'
            aria-label='Cores sugeridas'
          >
            {palette.map((paletteColor) => (
              <button
                key={paletteColor}
                type='button'
                aria-label={`Selecionar ${paletteColor}`}
                aria-pressed={currentColor === paletteColor}
                className='focus-visible:ring-ring/50 flex size-10 items-center justify-center rounded-md border border-black/10 focus-visible:ring-[3px] focus-visible:outline-none'
                style={{ backgroundColor: paletteColor }}
                onClick={() => updateColor(paletteColor)}
              >
                {currentColor === paletteColor && (
                  <Check
                    aria-hidden='true'
                    className={cn(
                      'size-4',
                      paletteColor === '#FFFFFF' || paletteColor === '#EAB308'
                        ? 'text-slate-950'
                        : 'text-white',
                    )}
                  />
                )}
              </button>
            ))}
          </div>
          <label
            htmlFor={inputId}
            className='mt-3 grid gap-1 text-xs font-medium'
          >
            HEX
            <input
              id={inputId}
              value={hex}
              inputMode='text'
              maxLength={7}
              aria-label='Valor hexadecimal'
              className='border-input bg-background focus-visible:ring-ring/50 h-10 rounded-md border px-3 font-mono text-sm uppercase shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
              onChange={(event) => updateColor(event.target.value)}
              onBlur={() => {
                if (!validHex(hex)) setInputValue(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !validHex(hex))
                  setInputValue(null);
              }}
            />
          </label>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
