import { ArrowRight, Globe, Lock, PanelBottom, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSession } from '@/app/modules/auth/hooks';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import { routes } from '@/shared/constants/router.constants';

/** Old value fades out while the agency's own value fades in, on a loop. */
export function Swap({ from, to }: { from: string; to: string }) {
  return (
    <span className='relative inline-grid min-w-0'>
      <span className='motion-safe:animate-lb-swap-out col-start-1 row-start-1 truncate motion-reduce:invisible'>
        {from}
      </span>
      <span className='motion-safe:animate-lb-swap-in text-primary col-start-1 row-start-1 truncate font-semibold'>
        {to}
      </span>
    </span>
  );
}

/** Mini browser showing a client page moving to the agency's domain/footer. */
function PageMockup({ agency }: { agency: string }) {
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
        <span className='bg-background ring-primary/40 flex min-w-0 flex-1 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] ring-1'>
          <Lock className='text-muted-foreground size-3 shrink-0' />
          <Swap
            from='linkbuds.com/p/cliente'
            to='links.cliente.com.br'
          />
        </span>
      </div>
      <div className='flex flex-col items-center gap-2 px-6 pt-4 pb-3'>
        <span className='bg-primary/20 size-10 rounded-full' />
        <span className='bg-muted h-2 w-20 rounded-full' />
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className='bg-muted h-6 w-full rounded-lg'
          />
        ))}
        <span className='ring-primary/40 mt-1 max-w-full rounded-full px-2 py-0.5 text-[10px] ring-1'>
          <Swap
            from='Feito com LinkBuds'
            to={agency}
          />
        </span>
      </div>
    </div>
  );
}

const SEEN_KEY = 'lb-agency-promo';

function wasSeen(key: string) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markSeen(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // Storage blocked: the promo just shows again next visit.
  }
}

/**
 * Shown once on Home: plans without custom domain + footer get the upgrade
 * pitch, plans that already unlock them get pointed at the settings.
 */
export function AgencyPromoDialog() {
  const { company } = useSession();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const unlocked = Boolean(
    company?.entitlements.customDomain && company.entitlements.whiteLabel,
  );
  // Per company and per state, so an upgrade shows the "try it" version once.
  const key = company
    ? `${SEEN_KEY}:${company.id}:${unlocked ? 'unlocked' : 'locked'}`
    : null;

  const open = Boolean(key && key !== dismissed && !wasSeen(key));

  function onOpenChange(next: boolean) {
    if (next || !key) return;
    markSeen(key);
    setDismissed(key);
  }

  if (!company) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='gap-5 overflow-hidden sm:max-w-md'>
        <div className='from-primary/15 via-primary/5 -mx-6 -mt-6 bg-gradient-to-b to-transparent px-6 pt-8 pb-2'>
          <PageMockup agency={company.name} />
        </div>
        <div className='grid gap-2'>
          <span className='text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase'>
            <Sparkles className='size-3.5' />
            {unlocked ? 'Liberado no seu plano' : 'Plano Agência'}
          </span>
          <DialogTitle>
            Páginas dos clientes com a cara da sua agência
          </DialogTitle>
          <DialogDescription>
            {unlocked
              ? 'Seu plano já inclui domínio próprio e rodapé personalizado. Configure em poucos minutos.'
              : 'No plano Agência, as páginas dos seus clientes rodam no seu domínio e com o rodapé da sua agência.'}
          </DialogDescription>
        </div>
        <ul className='grid gap-2 text-sm'>
          <li className='flex items-center gap-2'>
            <Globe className='text-muted-foreground size-4 shrink-0' />
            Domínio próprio no lugar de linkbuds.com
          </li>
          <li className='flex items-center gap-2'>
            <PanelBottom className='text-muted-foreground size-4 shrink-0' />
            Rodapé com a marca da sua agência
          </li>
        </ul>
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button
            variant='ghost'
            onClick={() => onOpenChange(false)}
          >
            Agora não
          </Button>
          <Button
            asChild
            onClick={() => onOpenChange(false)}
          >
            <RouterLink to={unlocked ? routes.settingsDomain : routes.settings}>
              {unlocked ? 'Conhecer funcionalidade' : 'Fazer upgrade'}
              <ArrowRight className='size-4' />
            </RouterLink>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
