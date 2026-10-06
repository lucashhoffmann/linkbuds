import { useState, type FormEvent } from 'react';
import type {
  FormConfig,
  FormField,
} from '@/app/modules/link-pages/types/link-pages.types';
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from '@/resources/components/ui/questionnaire';
import { cn } from '@/shared/lib/utils';
import { linkPageDesignTokens } from '../design-system/link-page-design-tokens';
import type { FormValue } from './link-page-renderer-parts';

// Same look as the list-mode inputs (shadcn default is a compact h-8).
const inputClass =
  'h-auto min-h-0 sm:min-h-0 rounded-lg border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 md:text-sm';

const inputTypes = {
  TEXT: 'text',
  TEXTAREA: 'text',
  EMAIL: 'email',
  PHONE: 'tel',
  URL: 'url',
  NUMBER: 'number',
  DATE: 'date',
} as const;

/** Reads one field's answer from the native form (the primitive names inputs by item). */
function readAnswer(data: FormData, field: FormField): FormValue {
  const values = data
    .getAll(field.id)
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (field.type === 'CHECKBOX') return values.length > 0;
  if (field.type === 'MULTI_CHOICE') return values;
  return values[0] ?? '';
}

function QuestionnaireField({ field }: { field: FormField }) {
  if (field.type === 'CHECKBOX') {
    return (
      <QuestionnaireChoices>
        <QuestionnaireChoice value='true'>Sim, concordo</QuestionnaireChoice>
      </QuestionnaireChoices>
    );
  }

  if (
    field.type === 'SELECT' ||
    field.type === 'CHOICE' ||
    field.type === 'MULTI_CHOICE'
  ) {
    return (
      <QuestionnaireChoices>
        {(field.options ?? []).filter(Boolean).map((option) => (
          <QuestionnaireChoice
            key={option}
            value={option}
          >
            {option}
          </QuestionnaireChoice>
        ))}
        {field.allowOther && field.type !== 'SELECT' && (
          <QuestionnaireInput
            aria-label={`${field.label}: outra resposta`}
            maxLength={500}
            className={inputClass}
            placeholder={field.placeholder || 'Outra resposta...'}
          />
        )}
      </QuestionnaireChoices>
    );
  }

  return (
    <QuestionnaireInput
      aria-label={field.label}
      type={inputTypes[field.type]}
      className={inputClass}
      maxLength={field.type === 'TEXTAREA' ? 5000 : 500}
      placeholder={
        field.placeholder ??
        (field.type === 'PHONE' ? '(00) 00000-0000' : undefined)
      }
      {...(field.type === 'PHONE' && {
        inputMode: 'tel' as const,
        autoComplete: 'tel-national',
      })}
    />
  );
}

/** QUESTIONNAIRE mode: one field per step (shadcn Questionnaire). The API validates again. */
export function FormQuestionnaire({
  form,
  preview,
  sending,
  error,
  onSubmit,
}: {
  form: FormConfig;
  preview: boolean;
  sending: boolean;
  error?: { message: string; invalid: string[] };
  onSubmit: (answers: Record<string, FormValue>, website: string) => void;
}) {
  const fields = form.fields;
  const [item, setItem] = useState(fields[0]?.id);
  // API rejected a field: jump back to the first one it flagged.
  const [errorShown, setErrorShown] = useState(error);
  if (error !== errorShown) {
    setErrorShown(error);
    const invalid = fields.find((field) => error?.invalid.includes(field.id));
    if (invalid) setItem(invalid.id);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit(
      Object.fromEntries(
        fields.map((field) => [field.id, readAnswer(data, field)]),
      ),
      String(data.get('website') ?? ''),
    );
  }

  if (!fields.length) return null;

  return (
    <Questionnaire
      noValidate={false}
      item={item}
      onItemChange={setItem}
      items={fields.map((field) => ({
        name: field.id,
        required: field.required,
      }))}
      onSubmit={submit}
      className={cn(
        linkPageDesignTokens.spacing.section,
        'rounded-2xl bg-white/90 p-4 text-slate-950 shadow-sm',
      )}
    >
      <QuestionnaireProgress
        render={(props, state) => (
          <div {...props}>
            Pergunta {state.current} de {state.total}
          </div>
        )}
      />
      {fields.map((field) => (
        <QuestionnaireItem
          key={field.id}
          name={field.id}
          required={field.required}
          multiple={field.type === 'MULTI_CHOICE' || field.type === 'CHECKBOX'}
          invalid={error?.invalid.includes(field.id)}
        >
          <QuestionnaireTitle>
            {field.label}
            {field.required && ' *'}
          </QuestionnaireTitle>
          <QuestionnaireField field={field} />
          <QuestionnaireError>
            {error?.invalid.includes(field.id)
              ? 'Confira esta resposta.'
              : field.required
                ? 'Responda para continuar.'
                : 'Responda ou pule esta pergunta.'}
          </QuestionnaireError>
        </QuestionnaireItem>
      ))}
      {/* Honeypot: hidden from people, bots tend to fill every input. */}
      <input
        type='text'
        name='website'
        tabIndex={-1}
        autoComplete='off'
        aria-hidden='true'
        className='absolute -left-[9999px] h-0 w-0 opacity-0'
      />
      {error && (
        <p
          role='alert'
          className='text-sm text-red-600'
        >
          {error.message}
        </p>
      )}
      <QuestionnaireActions>
        <QuestionnairePrevious>Voltar</QuestionnairePrevious>
        <QuestionnaireSkip>Pular</QuestionnaireSkip>
        <QuestionnaireNext>Próxima</QuestionnaireNext>
        <QuestionnaireSubmit
          disabled={sending}
          title={
            preview ? 'Prévia: o envio funciona na página publicada' : undefined
          }
        >
          {sending ? 'Enviando...' : form.submitLabel}
        </QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
