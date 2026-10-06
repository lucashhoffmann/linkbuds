import { type Dispatch, type SetStateAction } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type {
  FormConfig,
  FormField,
  FormFieldType,
  LinkPageDetail,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import type { AutosaveStatus } from './editor.types';
import { EditorSection, Field } from './editor-fields.component';

const fieldTypeLabels: Record<FormFieldType, string> = {
  TEXT: 'Texto curto',
  TEXTAREA: 'Texto longo',
  EMAIL: 'Email',
  PHONE: 'Telefone',
  NUMBER: 'Número',
  DATE: 'Data',
  SELECT: 'Lista de opções',
  CHECKBOX: 'Caixa de seleção (aceite)',
};

function newFieldId() {
  return `campo-${Math.random().toString(36).slice(2, 10)}`;
}

/** What autosave sends: options typed one per line, blanks dropped. */
export function cleanFormConfig(form: FormConfig): FormConfig {
  return {
    ...form,
    fields: form.fields.map(({ options, ...field }) =>
      field.type === 'SELECT'
        ? {
            ...field,
            options: (options ?? [])
              .map((option) => option.trim())
              .filter(Boolean),
          }
        : field,
    ),
  };
}

/** FORM pages: build the fields; answers live in the page canvas (Respostas). */
export function FormTab({
  draft,
  status,
  setDraft,
}: {
  draft: LinkPageDetail;
  status: AutosaveStatus;
  setDraft: Dispatch<SetStateAction<LinkPageDetail>>;
}) {
  const form = draft.form;
  if (!form) return null;

  const setForm = (update: (form: FormConfig) => FormConfig) =>
    setDraft((current) =>
      current.form ? { ...current, form: update(current.form) } : current,
    );
  const setFields = (update: (fields: FormField[]) => FormField[]) =>
    setForm((current) => ({ ...current, fields: update(current.fields) }));
  const patchField = (id: string, patch: Partial<FormField>) =>
    setFields((fields) =>
      fields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  const move = (index: number, offset: number) =>
    setFields((fields) => {
      const next = [...fields];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });

  return (
    <EditorSection
      title='Formulário'
      status={status}
    >
      <ol className='grid gap-3'>
        {form.fields.map((field, index) => (
          <li
            key={field.id}
            className='grid gap-3 rounded-xl border p-3'
          >
            <div className='grid gap-2 sm:grid-cols-[1fr_12rem]'>
              <Input
                aria-label={`Rótulo do campo ${index + 1}`}
                placeholder='Rótulo'
                maxLength={120}
                value={field.label}
                onChange={(event) =>
                  patchField(field.id, { label: event.target.value })
                }
              />
              <Select
                aria-label={`Tipo do campo ${index + 1}`}
                value={field.type}
                onChange={(event) => {
                  const type = event.target.value as FormFieldType;
                  patchField(field.id, {
                    type,
                    options:
                      type === 'SELECT'
                        ? (field.options ?? ['Opção 1'])
                        : undefined,
                  });
                }}
              >
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            {field.type !== 'CHECKBOX' && (
              <Input
                aria-label={`Texto de exemplo do campo ${index + 1}`}
                placeholder={
                  field.type === 'SELECT'
                    ? 'Texto antes de escolher (opcional)'
                    : 'Texto de exemplo (opcional)'
                }
                maxLength={120}
                value={field.placeholder ?? ''}
                onChange={(event) =>
                  patchField(field.id, {
                    placeholder: event.target.value || null,
                  })
                }
              />
            )}
            {field.type === 'SELECT' && (
              <Field label='Opções (uma por linha)'>
                <textarea
                  aria-label={`Opções do campo ${index + 1}`}
                  rows={3}
                  className='border-input bg-background rounded-md border px-3 py-2 text-sm'
                  value={(field.options ?? []).join('\n')}
                  onChange={(event) =>
                    patchField(field.id, {
                      options: event.target.value.split('\n'),
                    })
                  }
                />
              </Field>
            )}
            <div className='flex flex-wrap items-center gap-2'>
              <label className='mr-auto flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={field.required}
                  onChange={(event) =>
                    patchField(field.id, { required: event.target.checked })
                  }
                />
                Obrigatório
              </label>
              <Button
                type='button'
                variant='outline'
                size='icon'
                aria-label={`Subir campo ${field.label}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className='size-4' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                aria-label={`Descer campo ${field.label}`}
                disabled={index === form.fields.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className='size-4' />
              </Button>
              <Button
                type='button'
                variant='destructive'
                size='icon'
                aria-label={`Remover campo ${field.label}`}
                onClick={() =>
                  setFields((fields) =>
                    fields.filter((item) => item.id !== field.id),
                  )
                }
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        type='button'
        variant='outline'
        disabled={form.fields.length >= 30}
        onClick={() =>
          setFields((fields) => [
            ...fields,
            {
              id: newFieldId(),
              type: 'TEXT',
              label: 'Novo campo',
              required: false,
            },
          ])
        }
      >
        <Plus className='size-4' />
        Adicionar campo
      </Button>
      <div className='grid gap-4 border-t pt-4 md:grid-cols-2'>
        <Field label='Texto do botão'>
          <Input
            maxLength={40}
            value={form.submitLabel}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                submitLabel: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='Mensagem após enviar'>
          <Input
            maxLength={300}
            value={form.successMessage}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                successMessage: event.target.value,
              }))
            }
          />
        </Field>
      </div>
      <p className='text-muted-foreground text-xs'>
        Cada envio guarda as respostas com data, IP, país e dispositivo. Veja em
        Páginas → este formulário → Respostas.
      </p>
    </EditorSection>
  );
}
