import { type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import type {
  FormConfig,
  FormField,
  FormFieldType,
  FormMode,
  FormScoring,
  LinkPageDetail,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import { Switch } from '@/resources/components/ui/switch';
import { cn } from '@/shared/lib/utils';
import type { AutosaveStatus } from './editor.types';
import { EditorSection, Field } from './editor-fields.component';
import { DragHandle } from './links-manager.component';

const fieldTypeLabels: Record<FormFieldType, string> = {
  TEXT: 'Texto curto',
  TEXTAREA: 'Texto longo',
  EMAIL: 'Email',
  PHONE: 'Telefone',
  URL: 'Link',
  NUMBER: 'Número',
  DATE: 'Data',
  SELECT: 'Lista de opções',
  CHOICE: 'Escolha única',
  MULTI_CHOICE: 'Múltipla escolha',
  CHECKBOX: 'Caixa de seleção (aceite)',
};

const optionTypes: FormFieldType[] = ['SELECT', 'CHOICE', 'MULTI_CHOICE'];

function newFieldId() {
  return `campo-${Math.random().toString(36).slice(2, 10)}`;
}

/** What autosave sends: blank options dropped (with their points). */
export function cleanFormConfig(form: FormConfig): FormConfig {
  return {
    ...form,
    redirectUrl: form.redirectUrl?.trim() || null,
    fields: form.fields.map(({ options, points, allowOther, ...field }) => {
      if (!optionTypes.includes(field.type)) return field;
      const kept = (options ?? []).flatMap((option, index) =>
        option.trim()
          ? [{ option: option.trim(), point: points?.[index] ?? 0 }]
          : [],
      );
      return {
        ...field,
        options: kept.map(({ option }) => option),
        points: kept.map(({ point }) => point),
        ...(field.type !== 'SELECT' && { allowOther }),
      };
    }),
  };
}

/** Option row that drags by its handle; ids are indexes (options can repeat). */
function SortableOption({
  index,
  label,
  children,
}: {
  index: number;
  label: string;
  children: ReactNode;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: String(index) });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2',
        isDragging && 'relative z-10 opacity-70',
      )}
    >
      <DragHandle
        label={label}
        {...attributes}
        {...listeners}
      />
      {children}
    </li>
  );
}

/**
 * One row per option: text, score control (when scoring is on) and remove.
 * `points` stays aligned with `options` by index.
 */
function OptionsEditor({
  field,
  kind,
  onChange,
}: {
  field: FormField;
  kind: FormScoring['kind'] | null;
  onChange: (patch: Pick<FormField, 'options' | 'points'>) => void;
}) {
  const options = field.options ?? [];
  const points = options.map((_, index) => field.points?.[index] ?? 0);
  const multiple = field.type === 'MULTI_CHOICE';
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const setPoint = (index: number, point: number) =>
    onChange({
      options,
      points: points.map((current, i) =>
        i === index
          ? point
          : // Single answer: only one option can be the right one.
            kind === 'CORRECT' && !multiple && point
            ? 0
            : current,
      ),
    });

  return (
    <Field
      label={
        kind === 'CORRECT'
          ? 'Opções (marque a correta)'
          : kind === 'POINTS'
            ? 'Opções e pontos'
            : 'Opções'
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const from = Number(active.id);
          const to = Number(over.id);
          onChange({
            options: arrayMove(options, from, to),
            points: arrayMove(points, from, to),
          });
        }}
      >
        <SortableContext
          items={options.map((_, index) => String(index))}
          strategy={verticalListSortingStrategy}
        >
          <ul className='grid gap-2'>
            {options.map((option, index) => (
              <SortableOption
                key={index}
                index={index}
                label={option || `Opção ${index + 1}`}
              >
                {kind === 'CORRECT' && (
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    name={`correta-${field.id}`}
                    aria-label={`Opção ${index + 1} é correta`}
                    title='Correta'
                    className='size-4 shrink-0'
                    checked={points[index] > 0}
                    onChange={(event) =>
                      setPoint(index, event.target.checked ? 1 : 0)
                    }
                  />
                )}
                <Input
                  aria-label={`Opção ${index + 1}`}
                  placeholder={`Opção ${index + 1}`}
                  maxLength={120}
                  value={option}
                  onChange={(event) =>
                    onChange({
                      options: options.map((current, i) =>
                        i === index ? event.target.value : current,
                      ),
                      points,
                    })
                  }
                />
                {kind === 'POINTS' && (
                  <Input
                    type='number'
                    aria-label={`Pontos da opção ${index + 1}`}
                    title='Pontos'
                    min={-1000}
                    max={1000}
                    className='w-24 shrink-0'
                    value={points[index]}
                    onChange={(event) =>
                      setPoint(
                        index,
                        Math.max(
                          -1000,
                          Math.min(
                            1000,
                            Math.trunc(Number(event.target.value)),
                          ),
                        ) || 0,
                      )
                    }
                  />
                )}
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label={`Remover opção ${index + 1}`}
                  disabled={options.length <= 1}
                  onClick={() =>
                    onChange({
                      options: options.filter((_, i) => i !== index),
                      points: points.filter((_, i) => i !== index),
                    })
                  }
                >
                  <X className='size-4' />
                </Button>
              </SortableOption>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='justify-self-start'
        disabled={options.length >= 30}
        onClick={() =>
          onChange({
            options: [...options, `Opção ${options.length + 1}`],
            points: [...points, 0],
          })
        }
      >
        <Plus className='size-4' />
        Adicionar opção
      </Button>
      {kind === 'CORRECT' && multiple && (
        <p className='text-muted-foreground text-xs'>
          Acerta quem marcar exatamente as corretas.
        </p>
      )}
    </Field>
  );
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
      <div className='grid gap-4 md:grid-cols-2'>
        <Field label='Exibição'>
          <Select
            aria-label='Exibição'
            value={form.mode ?? 'LIST'}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                mode: event.target.value as FormMode,
              }))
            }
          >
            <option value='LIST'>Lista (todos os campos numa tela)</option>
            <option value='QUESTIONNAIRE'>
              Questionário (uma pergunta por vez)
            </option>
          </Select>
        </Field>
        <Field label='Pontuação'>
          <Select
            aria-label='Pontuação'
            value={
              form.scoring ? (form.scoring.show ? 'SHOWN' : 'HIDDEN') : 'OFF'
            }
            onChange={(event) => {
              const value = event.target.value;
              setForm((current) => ({
                ...current,
                scoring:
                  value === 'OFF'
                    ? null
                    : {
                        kind: current.scoring?.kind ?? 'CORRECT',
                        show: value === 'SHOWN',
                      },
              }));
            }}
          >
            <option value='OFF'>Só coletar respostas</option>
            <option value='HIDDEN'>Pontuar sem mostrar ao visitante</option>
            <option value='SHOWN'>Pontuar e mostrar a nota no final</option>
          </Select>
        </Field>
        {form.scoring && (
          <Field label='Como pontuar'>
            <Select
              aria-label='Como pontuar'
              value={form.scoring.kind}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  scoring: {
                    show: current.scoring?.show ?? false,
                    kind: event.target.value as FormScoring['kind'],
                  },
                }))
              }
            >
              <option value='CORRECT'>
                Opção correta (acertos / perguntas)
              </option>
              <option value='POINTS'>Pontos por opção (soma)</option>
            </Select>
            <p className='text-muted-foreground text-xs'>
              Vale para Lista, Escolha única e Múltipla escolha. Perguntas sem
              pontos não contam. A nota aparece em Respostas, CSV, planilha e
              Análises.
            </p>
          </Field>
        )}
      </div>
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
                  const withOptions = optionTypes.includes(type);
                  patchField(field.id, {
                    type,
                    options: withOptions
                      ? (field.options ?? ['Opção 1'])
                      : undefined,
                    points: withOptions ? field.points : undefined,
                    allowOther:
                      type === 'CHOICE' || type === 'MULTI_CHOICE'
                        ? field.allowOther
                        : undefined,
                    unique:
                      type === 'CHECKBOX' || type === 'MULTI_CHOICE'
                        ? undefined
                        : field.unique,
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
                    : field.type === 'CHOICE' || field.type === 'MULTI_CHOICE'
                      ? 'Texto do campo "Outro" (opcional)'
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
            {optionTypes.includes(field.type) && (
              <OptionsEditor
                field={field}
                kind={form.scoring?.kind ?? null}
                onChange={(patch) => patchField(field.id, patch)}
              />
            )}
            <div className='flex flex-wrap items-center gap-2'>
              <div className='mr-auto flex flex-wrap items-center gap-x-4 gap-y-1'>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={field.required}
                    onChange={(event) =>
                      patchField(field.id, { required: event.target.checked })
                    }
                  />
                  Obrigatório
                </label>
                {(field.type === 'CHOICE' || field.type === 'MULTI_CHOICE') && (
                  <label className='flex items-center gap-2 text-sm'>
                    <input
                      type='checkbox'
                      checked={field.allowOther ?? false}
                      onChange={(event) =>
                        patchField(field.id, {
                          allowOther: event.target.checked,
                        })
                      }
                    />
                    Permitir &quot;Outro&quot; (texto livre)
                  </label>
                )}
                {field.type !== 'CHECKBOX' && field.type !== 'MULTI_CHOICE' && (
                  <label
                    className='flex items-center gap-2 text-sm'
                    title='Recusa um novo envio com o mesmo valor neste corte (ex.: um por email)'
                  >
                    <input
                      type='checkbox'
                      checked={field.unique ?? false}
                      onChange={(event) =>
                        patchField(field.id, { unique: event.target.checked })
                      }
                    />
                    Resposta única
                  </label>
                )}
              </div>
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
        <div className='md:col-span-2'>
          <h3 className='text-sm font-semibold'>Finalização</h3>
          <p className='text-muted-foreground text-xs'>
            O que o visitante vê ao enviar o formulário.
          </p>
        </div>
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
        <div className='md:col-span-2'>
          <Field label='Redirecionar após enviar (opcional)'>
            <Input
              type='url'
              maxLength={2000}
              placeholder='https://... (vazio = só mostra a mensagem)'
              value={form.redirectUrl ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  redirectUrl: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <Field label='Limite de respostas (opcional)'>
          <Input
            type='number'
            aria-label='Limite de respostas'
            min={1}
            max={1000000}
            placeholder='Sem limite'
            value={form.maxResponses ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                maxResponses: event.target.value
                  ? Math.max(1, Math.trunc(Number(event.target.value)))
                  : null,
              }))
            }
          />
          <p className='text-muted-foreground text-xs'>
            Ao atingir, o formulário fecha. Reabra em Respostas.
          </p>
        </Field>
        <label className='flex items-center gap-2 text-sm md:col-span-2'>
          <Switch
            checked={form.successAnimation !== false}
            onCheckedChange={(checked) =>
              setForm((current) => ({ ...current, successAnimation: checked }))
            }
          />
          Animação de confirmação (check) após enviar
        </label>
      </div>
      <p className='text-muted-foreground text-xs'>
        Cada envio guarda as respostas com data, IP, país e dispositivo. Veja em
        Páginas → este formulário → Respostas.
      </p>
    </EditorSection>
  );
}
