import {
  ClipboardList,
  ImageIcon,
  Link2,
  ListChecks,
  Lock,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from '@/app/modules/auth/hooks';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import {
  markSeen,
  wasSeen,
} from '@/resources/pages/home/components/agency-promo-dialog.component';
import { cn } from '@/shared/lib/utils';

/** Long enough to read the step text and look at the mockup. */
export const STEP_MS = 6000;

// v2: re-shows the dialog to everyone who saw it before the questionnaire step.
const SEEN_KEY = 'lb-subpages-promo-v2';

const steps = [
  {
    icon: Link2,
    label: 'Link de post',
    path: 'cliente/promo-do-post',
    title: 'Um link para cada post',
    description:
      'Crie uma sub-página para a publicação e veja qual post gerou contato: página principal → post → WhatsApp.',
  },
  {
    icon: ClipboardList,
    label: 'Formulário',
    path: 'cliente/orcamento',
    title: 'Formulários que captam contatos',
    description:
      'Monte campos como nome, email e telefone. Cada envio vira uma resposta no painel.',
  },
  {
    icon: ListChecks,
    label: 'Questionário',
    path: 'cliente/quiz',
    title: 'Questionários com nota',
    description:
      'Uma pergunta por tela, com pontos por opção. Cada resposta chega com a nota no painel.',
  },
];

function PostMockup() {
  return (
    <>
      <span className='bg-primary/15 text-primary flex aspect-[4/3] w-full items-center justify-center rounded-lg'>
        <ImageIcon className='size-6' />
      </span>
      <span className='bg-muted h-2 w-28 rounded-full' />
      <span className='bg-primary text-primary-foreground motion-safe:animate-lb-tap flex h-7 w-full items-center justify-center gap-1 rounded-lg text-[10px] font-medium'>
        <MessageCircle className='size-3' />
        Chamar no WhatsApp
      </span>
    </>
  );
}

function FormMockup() {
  return (
    <>
      <span className='bg-muted h-2 w-24 rounded-full' />
      {['Nome', 'Email', 'Telefone'].map((field) => (
        <span
          key={field}
          className='text-muted-foreground flex h-7 w-full items-center rounded-lg border px-2 text-[10px]'
        >
          {field}
        </span>
      ))}
      <span className='bg-primary text-primary-foreground motion-safe:animate-lb-tap flex h-7 w-full items-center justify-center rounded-lg text-[10px] font-medium'>
        Enviar
      </span>
    </>
  );
}

function QuizMockup() {
  return (
    <>
      <span className='text-muted-foreground text-[10px]'>Pergunta 2 de 5</span>
      <span className='bg-muted h-1 w-full overflow-hidden rounded-full'>
        <span className='bg-primary block h-full w-2/5' />
      </span>
      <span className='bg-muted mt-1 h-2 w-32 rounded-full' />
      {['Opção A', 'Opção B', 'Opção C'].map((option, i) => (
        <span
          key={option}
          className={cn(
            'flex h-6 w-full items-center rounded-lg border px-2 text-[10px]',
            i === 1
              ? 'border-primary text-primary font-medium'
              : 'text-muted-foreground',
          )}
        >
          {option}
        </span>
      ))}
      <span className='bg-primary text-primary-foreground motion-safe:animate-lb-tap flex h-7 w-full items-center justify-center rounded-lg text-[10px] font-medium'>
        Próxima
      </span>
    </>
  );
}

const mockups = [PostMockup, FormMockup, QuizMockup];

/** Mini browser with the current step's sub-page. */
function SubPageMockup({ step }: { step: number }) {
  const Mockup = mockups[step];
  return (
    <div
      aria-hidden
      className='bg-background mx-auto w-full max-w-72 overflow-hidden rounded-xl border shadow-sm'
    >
      <div className='bg-muted flex items-center gap-2 border-b px-3 py-2'>
        <span className='flex gap-1'>
          <span className='size-2 rounded-full bg-red-400' />
          <span className='size-2 rounded-full bg-amber-400' />
          <span className='size-2 rounded-full bg-emerald-400' />
        </span>
        <span className='bg-background flex min-w-0 flex-1 items-center gap-1 rounded-md px-2 py-0.5 text-[11px]'>
          <Lock className='text-muted-foreground size-3 shrink-0' />
          <span className='truncate'>
            linkbuds.com/p/
            <span className='text-primary font-semibold'>
              {steps[step].path}
            </span>
          </span>
        </span>
      </div>
      {/* Keyed so each step pops in fresh. */}
      <div
        key={step}
        className='motion-safe:animate-lb-pop flex h-48 flex-col items-center gap-2 px-6 pt-4 pb-3'
      >
        <Mockup />
      </div>
    </div>
  );
}

/**
 * Shown once on Páginas: explains post links, forms and questionnaires,
 * cycling the steps on a timer until the user picks one.
 */
export function SubPagesPromoDialog() {
  const { company } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const key = company ? `${SEEN_KEY}:${company.id}` : null;
  const open = Boolean(key && !dismissed && !wasSeen(key));

  useEffect(() => {
    if (!open || !autoplay) return;
    const timer = setTimeout(
      () => setStep((s) => (s + 1) % steps.length),
      STEP_MS,
    );
    return () => clearTimeout(timer);
  }, [open, autoplay, step]);

  function close() {
    if (key) markSeen(key);
    setDismissed(true);
  }

  if (!company) return null;

  const current = steps[step];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && close()}
    >
      <DialogContent className='gap-5 overflow-hidden sm:max-w-md'>
        <div className='from-primary/15 via-primary/5 -mx-6 -mt-6 bg-gradient-to-b to-transparent px-6 pt-8 pb-2'>
          <SubPageMockup step={step} />
        </div>
        <div
          role='tablist'
          aria-label='Recursos'
          className='grid grid-cols-3 gap-2'
        >
          {steps.map((s, i) => (
            <button
              key={s.label}
              type='button'
              role='tab'
              aria-selected={i === step}
              onClick={() => {
                setStep(i);
                setAutoplay(false);
              }}
              className={cn(
                'grid gap-1.5 text-left text-xs font-medium',
                i === step ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <span className='bg-muted h-1 overflow-hidden rounded-full'>
                {i === step && (
                  <span
                    key={step}
                    className={cn(
                      'bg-primary block h-full origin-left',
                      autoplay && 'animate-lb-progress',
                    )}
                    style={{ animationDuration: `${STEP_MS}ms` }}
                  />
                )}
              </span>
              <span className='flex items-center gap-1'>
                <s.icon className='size-3.5' />
                {i + 1}. {s.label}
              </span>
            </button>
          ))}
        </div>
        <div className='grid gap-2'>
          <span className='text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase'>
            <Sparkles className='size-3.5' />
            Novidade nas páginas
          </span>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>{current.description}</DialogDescription>
        </div>
        <p className='text-muted-foreground text-xs'>
          Selecione um cliente e use os botões de post ou formulário para criar.
          O questionário é um modo do formulário.
        </p>
        <div className='flex justify-end'>
          <Button onClick={close}>Entendi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
