import { ArrowRight } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { PricingPlansContent } from '@/resources/pages/auth/components/pricing-plans-dialog/pricing-plans-dialog.component';
import { SubscribeDialog } from '@/resources/pages/settings/components/subscribe-dialog/subscribe-dialog.component';
import { Button } from '@/resources/components/ui/button';
import { Dialog, DialogContent } from '@/resources/components/ui/dialog';
import { routes } from '@/shared/constants/router.constants';
import { useWelcomePlansDialog } from './use-welcome-plans-dialog.component';

interface IWelcomePlansDialogProps {
  onClose: () => void;
}

/** First access after sign-up: everyone starts on Grátis, so pitch the plans once. */
export function WelcomePlansDialog({ onClose }: IWelcomePlansDialogProps) {
  const {
    title,
    currentPlanCode,
    selected,
    setSelected,
    checkoutFor,
    closeCheckout,
    onQuoteChanged,
  } = useWelcomePlansDialog(onClose);

  return (
    <>
      <Dialog
        open={!selected}
        onOpenChange={(next) => !next && onClose()}
      >
        <DialogContent className='max-h-[calc(100dvh-1rem)] overflow-hidden p-0 sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl'>
          <PricingPlansContent
            title={title}
            description='Sua conta começa no plano Grátis. Faça upgrade quando quiser para atender mais clientes, liberar mais formulários e métricas completas.'
            renderAction={(plan, billingCycle) => {
              if (plan.code === currentPlanCode) {
                return (
                  <Button
                    variant='outline'
                    className='h-9 w-full'
                    onClick={onClose}
                  >
                    Continuar no {plan.name}
                  </Button>
                );
              }

              const checkout = checkoutFor(plan.code, billingCycle);

              if (checkout) {
                return (
                  <Button
                    className='h-9 w-full'
                    variant={plan.featured ? 'default' : 'outline'}
                    onClick={() => setSelected(checkout)}
                  >
                    Assinar {plan.name}
                    <ArrowRight className='size-4' />
                  </Button>
                );
              }

              // No self-serve price (custom plan, billing off): settings has the contact info.
              return (
                <Button
                  asChild
                  className='h-9 w-full'
                  variant={plan.featured ? 'default' : 'outline'}
                  onClick={onClose}
                >
                  <RouterLink to={routes.settings}>
                    {plan.custom ? plan.action : 'Fazer upgrade'}
                    <ArrowRight className='size-4' />
                  </RouterLink>
                </Button>
              );
            }}
          />
        </DialogContent>
      </Dialog>

      <SubscribeDialog
        quote={selected}
        onClose={closeCheckout}
        onQuoteChanged={onQuoteChanged}
      />
    </>
  );
}
