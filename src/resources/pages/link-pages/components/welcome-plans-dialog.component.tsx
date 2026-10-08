import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSession } from '@/app/modules/auth/hooks';
import type { IBillingQuote } from '@/app/modules/billing/types/billing.types';
import { useBillingQuoteUseCase } from '@/app/modules/billing/use-cases/use-billing.use-case';
import { PricingPlansContent } from '@/resources/pages/auth/components/pricing-plans-dialog/pricing-plans-dialog.component';
import { SubscribeDialog } from '@/resources/pages/settings/components/subscribe-dialog/subscribe-dialog.component';
import { Button } from '@/resources/components/ui/button';
import { Dialog, DialogContent } from '@/resources/components/ui/dialog';
import { routes } from '@/shared/constants/router.constants';

interface IWelcomePlansDialogProps {
  onClose: () => void;
}

/** First access after sign-up: everyone starts on Grátis, so pitch the plans once. */
export function WelcomePlansDialog({ onClose }: IWelcomePlansDialogProps) {
  const { company, userAuthenticated } = useSession();
  const planCode = company?.entitlements.planCode;
  const firstName = userAuthenticated?.name.split(' ')[0];
  const isOwner = userAuthenticated?.role === 'OWNER';
  // Charged prices (card fee included): what the checkout needs.
  const quote = useBillingQuoteUseCase(isOwner);
  const [selected, setSelected] = useState<IBillingQuote | null>(null);

  return (
    <>
      <Dialog
        open={!selected}
        onOpenChange={(next) => !next && onClose()}
      >
        <DialogContent className='max-h-[calc(100dvh-1rem)] overflow-hidden p-0 sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl'>
          <PricingPlansContent
            title={
              firstName ? `Bem-vindo, ${firstName}!` : 'Bem-vindo ao LinkBuds!'
            }
            description='Sua conta começa no plano Grátis. Faça upgrade quando quiser para atender mais clientes, liberar mais formulários e métricas completas.'
            renderAction={(plan, billingCycle) => {
              if (plan.code === planCode) {
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

              const cycle = billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY';
              const checkout = quote.data?.quotes.find(
                (item) =>
                  item.planCode === plan.code && item.billingCycle === cycle,
              );

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
        onClose={() => {
          setSelected(null);
          onClose();
        }}
        onQuoteChanged={() => {
          setSelected(null);
          void quote.refetch();
        }}
      />
    </>
  );
}
