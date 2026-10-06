import { type ReactNode } from 'react';
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
  onChange,
}: {
  checked: boolean;
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
      Borda
    </label>
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
