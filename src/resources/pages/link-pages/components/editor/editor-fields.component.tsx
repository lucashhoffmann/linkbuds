import { type ReactNode } from 'react';
import type { LinkPageMediaSize } from '@/app/modules/link-pages/types/link-pages.types';
import { mediaSizeOptions } from '@/app/modules/link-pages/utils/media.util';
import { Input } from '@/resources/components/ui/input';
import { Button } from '@/resources/components/ui/button';
import { ColorPicker } from '@/resources/components/ui/color-picker';
import { Label } from '@/resources/components/ui/label';
import type { AutosaveStatus } from './editor.types';

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className='grid gap-2'>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className='grid gap-2 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <ColorPicker
        label={label}
        value={value}
        onChange={onChange}
        className='w-full'
      />
    </label>
  );
}

export function BorderEnabledField({
  checked,
  label = 'Borda',
  onChange,
}: {
  checked: boolean;
  label?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className='border-input bg-background flex h-12 items-center gap-2 rounded-md border px-3 text-sm shadow-xs'>
      <input
        type='checkbox'
        className='size-4'
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export function MediaSizeField({
  customHeight,
  id,
  onChange,
  size,
}: {
  customHeight: number | null;
  id: string;
  onChange: (value: {
    size: LinkPageMediaSize;
    customHeight: number | null;
  }) => void;
  size: LinkPageMediaSize;
}) {
  return (
    <div className='grid gap-3 sm:grid-cols-2'>
      <div className='grid gap-2'>
        <Label htmlFor={`${id}-size`}>Tamanho</Label>
        <select
          id={`${id}-size`}
          className='border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring h-12 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none'
          value={size}
          onChange={(event) => {
            const next = event.target.value as LinkPageMediaSize;
            onChange({
              size: next,
              customHeight: next === 'CUSTOM' ? (customHeight ?? 240) : null,
            });
          }}
        >
          {mediaSizeOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {size === 'CUSTOM' && (
        <div className='grid gap-2'>
          <Label htmlFor={`${id}-height`}>Altura (px)</Label>
          <Input
            id={`${id}-height`}
            type='number'
            min={80}
            max={800}
            required
            value={customHeight ?? ''}
            onChange={(event) =>
              onChange({
                size,
                customHeight: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
          />
        </div>
      )}
    </div>
  );
}

export function EditorSection({
  action,
  children,
  status,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  status?: AutosaveStatus;
  title: string;
}) {
  return (
    <section className='space-y-4 border-b pb-6 last:border-b-0 last:pb-0'>
      <div className='flex min-h-8 items-center justify-between gap-3'>
        <h2 className='font-semibold'>{title}</h2>
        {status ? <AutosaveStatusButton status={status} /> : action}
      </div>
      {children}
    </section>
  );
}

export function AutosaveStatusButton({ status }: { status: AutosaveStatus }) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'saving') {
    return (
      <Button
        type='button'
        size='sm'
        variant='ghost'
        isSaving
      />
    );
  }

  const labelByStatus: Record<
    Exclude<AutosaveStatus, 'idle' | 'saving'>,
    string
  > = {
    dirty: 'Aguardando...',
    error: 'Erro ao salvar',
    saved: 'Salvo',
  };

  return (
    <Button
      type='button'
      size='sm'
      variant='ghost'
      className='text-muted-foreground pointer-events-none'
      disabled
    >
      {labelByStatus[status]}
    </Button>
  );
}
