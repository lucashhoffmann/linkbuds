import { cn } from '@/shared/lib/utils';
import { ArrowUpRight, Check, ChevronRight, Globe2 } from 'lucide-react';
import type { ReactNode } from 'react';

const centerLinks = ['Agendar horário', 'Promoção do post', 'Ver cardápio'];
const funnelSteps = ['Bio', 'Post', 'Contato'];
const barHeights = ['h-[40%]', 'h-[65%]', 'h-[50%]', 'h-[85%]', 'h-full'];

function Phone({
  className,
  delay,
  children,
}: {
  className: string;
  delay?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('absolute', className)}>
      <div
        style={{ animationDelay: delay }}
        className='bg-card motion-safe:animate-lb-float flex size-full flex-col items-center overflow-hidden rounded-[1.8em] border shadow-xl'
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Animated promo scene for the auth page. Everything is sized in `em` off the
 * root font-size, so the whole scene scales with the viewport like an image.
 */
export function AuthHeroShowcase() {
  return (
    <div
      role='img'
      aria-label='Prévia animada: páginas de links de clientes, link de post, domínio próprio e métricas de cliques'
      className='relative h-[26em] w-[34em] max-w-full shrink-0 self-start text-[clamp(8px,min(1.45vh,1.15vw),14px)] select-none'
    >
      {/* Client bio (left) */}
      <Phone
        className='top-[3.5em] left-[1em] h-[20em] w-[10.5em] -rotate-6'
        delay='-2s'
      >
        <div className='flex h-[5em] w-full justify-center bg-teal-100 dark:bg-teal-950'>
          <span className='mt-[2.6em] flex size-[3.6em] items-center justify-center rounded-full border-[0.2em] border-(--card) bg-teal-600 text-white'>
            <b className='text-[1.2em]'>C</b>
          </span>
        </div>
        <span className='mt-[2em] text-[0.75em] font-semibold'>
          Clara Estética
        </span>
        <span className='text-muted-foreground text-[0.5em]'>
          @claraestetica
        </span>
        <div className='mt-[1em] flex w-full flex-col gap-[0.6em] px-[1em]'>
          {['w-3/4', 'w-1/2', 'w-2/3'].map((width, index) => (
            <div
              key={index}
              className='flex h-[2em] items-center gap-[0.5em] rounded-full border px-[0.5em]'
            >
              <span className='size-[1em] shrink-0 rounded-full bg-teal-200 dark:bg-teal-800' />
              <span className={cn('bg-muted h-[0.4em] rounded-full', width)} />
            </div>
          ))}
        </div>
      </Phone>

      {/* Post link (right) */}
      <Phone
        className='top-[3.5em] right-[1em] h-[20em] w-[10.5em] rotate-6'
        delay='-4s'
      >
        <div className='relative m-[0.8em] mb-0 h-[8.5em] w-[calc(100%-1.6em)] rounded-[1.1em] bg-linear-to-br from-amber-200 via-orange-300 to-rose-300'>
          <span className='absolute top-[0.5em] right-[0.5em] flex size-[1.6em] items-center justify-center rounded-full bg-white/90 text-slate-900'>
            <ArrowUpRight className='size-[1em]' />
          </span>
          <span className='absolute bottom-[0.5em] left-[0.5em] rounded-full bg-white/90 px-[0.6em] py-[0.2em] text-slate-900'>
            <b className='block text-[0.5em]'>Post 1234</b>
          </span>
        </div>
        <span className='mt-[0.8em] text-[0.7em] font-semibold'>
          Promoção de inverno
        </span>
        <span className='text-muted-foreground text-[0.5em]'>
          só até domingo
        </span>
        <div className='bg-primary text-primary-foreground mt-[1em] flex h-[2.2em] w-[calc(100%-2em)] items-center justify-center rounded-full'>
          <span className='text-[0.6em] font-medium'>Falar no WhatsApp</span>
        </div>
        <div className='mt-[0.6em] flex h-[2.2em] w-[calc(100%-2em)] items-center justify-center rounded-full border'>
          <span className='bg-muted h-[0.4em] w-1/2 rounded-full' />
        </div>
      </Phone>

      {/* Client bio (center): links stagger in, visitor taps the post link */}
      <Phone className='top-[0.5em] left-[10.5em] z-10 h-[25em] w-[13em]'>
        <span className='bg-primary text-primary-foreground mt-[2em] flex size-[4em] items-center justify-center rounded-full'>
          <b className='text-[1.4em]'>A</b>
        </span>
        <span className='mt-[0.6em] text-[0.95em] font-semibold tracking-tight'>
          Studio Aurora
        </span>
        <span className='text-muted-foreground text-[0.55em]'>
          Café · Brunch · Eventos
        </span>
        <div className='mt-[0.8em] flex gap-[0.4em]'>
          {[0, 1, 2].map((chip) => (
            <span
              key={chip}
              className='bg-muted size-[1.4em] rounded-full'
            />
          ))}
        </div>
        <div className='mt-[1.2em] flex w-full flex-col gap-[0.7em] px-[1.2em]'>
          {centerLinks.map((label, index) => (
            <div
              key={label}
              style={{ animationDelay: `${index * 150}ms` }}
              className={cn(
                'motion-safe:animate-lb-link relative flex h-[2.6em] items-center justify-center rounded-full border',
                index === 1 &&
                  'bg-primary text-primary-foreground border-transparent',
              )}
            >
              <span className='text-[0.65em] font-medium'>{label}</span>
              {index === 1 && (
                <span className='absolute right-[1.2em] size-[1.6em] motion-reduce:hidden'>
                  <span className='animate-lb-tap bg-primary-foreground block size-full rounded-full' />
                </span>
              )}
            </div>
          ))}
        </div>
        <span className='text-muted-foreground mt-auto mb-[1em] text-[0.5em] font-medium'>
          LinkBuds
        </span>
      </Phone>

      {/* Custom domain */}
      <div className='bg-card absolute top-0 left-0 z-20 flex items-center gap-[0.4em] rounded-full border py-[0.4em] pr-[0.5em] pl-[0.7em] shadow-lg'>
        <Globe2 className='size-[0.9em]' />
        <span className='text-[0.6em] font-medium'>links.suaagencia.com</span>
        <span className='bg-primary text-primary-foreground flex size-[1.1em] items-center justify-center rounded-full'>
          <Check className='size-[0.7em]' />
        </span>
      </div>

      {/* Clicks */}
      <div className='bg-card absolute bottom-0 left-0 z-20 flex items-end gap-[0.9em] rounded-[1em] border p-[0.8em] shadow-lg'>
        <div className='flex flex-col'>
          <span className='text-muted-foreground text-[0.55em]'>
            Cliques na semana
          </span>
          <span className='text-[1.1em] leading-tight font-semibold'>
            1.284
          </span>
          <span className='text-[0.55em] font-medium text-emerald-600 dark:text-emerald-400'>
            +38%
          </span>
        </div>
        <div className='flex h-[2.6em] items-end gap-[0.25em]'>
          {barHeights.map((height, index) => (
            <span
              key={height}
              style={{ animationDelay: `${index * 200}ms` }}
              className={cn(
                'bg-primary motion-safe:animate-lb-bar w-[0.45em] origin-bottom rounded-full',
                height,
              )}
            />
          ))}
        </div>
      </div>

      {/* Funnel: lights up in step with the tap on the center phone */}
      <div className='bg-card absolute top-0 right-0 z-20 flex items-center gap-[0.3em] rounded-full border px-[0.9em] py-[0.5em] shadow-lg'>
        {funnelSteps.map((step, index) => (
          <span
            key={step}
            style={{ animationDelay: `${0.3 + index * 0.9}s` }}
            className='motion-safe:animate-lb-step flex items-center gap-[0.3em]'
          >
            {index > 0 && <ChevronRight className='size-[0.8em]' />}
            <span className='text-[0.65em] font-semibold whitespace-nowrap'>
              {step}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
