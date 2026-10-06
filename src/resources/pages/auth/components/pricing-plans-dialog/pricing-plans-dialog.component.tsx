import { type ReactNode } from 'react';
import { Check, CornerDownRight, Link2 } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/resources/components/ui/dialog';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';
import { usePricingPlansDialogComponent } from './use-pricing-plans-dialog.component';

interface IPricingPlansDialogProps {
  trigger: ReactNode;
}

export function PricingPlansDialog({ trigger }: IPricingPlansDialogProps) {
  const {
    billingCycle,
    errorPricingPlans,
    formatPlanMonthlyPrice,
    formatPlanYearlyTotal,
    isLoadingPricingPlans,
    pricingPlans,
    refetchPricingPlans,
    setBillingCycle,
    yearlyDiscountPercent,
  } = usePricingPlansDialogComponent();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-h-[calc(100dvh-1rem)] overflow-hidden p-0 sm:max-w-5xl'>
        <div className='flex max-h-[calc(100dvh-1rem)] flex-col gap-3 p-4 sm:p-5'>
          <DialogHeader className='shrink-0 items-stretch gap-3 pr-6 text-left sm:flex-row sm:items-start sm:justify-between'>
            <div className='min-w-0 space-y-2'>
              <div className='flex min-w-0 items-center gap-3'>
                <div className='bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md'>
                  <Link2 className='size-4' />
                </div>
                <DialogTitle className='text-xl leading-tight font-semibold tracking-tight sm:text-2xl'>
                  Planos simples e transparentes
                </DialogTitle>
              </div>
              <DialogDescription className='max-w-2xl text-sm'>
                Escolha o plano ideal para metrificar, controlar e gerenciar
                seus links e de seus clientes.
              </DialogDescription>
            </div>

            <div className='flex shrink-0 justify-center sm:pt-1'>
              <div className='inline-flex flex-col items-center gap-1.5'>
                <div className='bg-background inline-flex rounded-xl border p-1 shadow-xs'>
                  <Button
                    type='button'
                    size='sm'
                    variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                    aria-pressed={billingCycle === 'monthly'}
                    className='h-7 rounded-lg px-3 text-xs'
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Mensal
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                    aria-pressed={billingCycle === 'yearly'}
                    className='h-7 rounded-lg px-3 text-xs'
                    onClick={() => setBillingCycle('yearly')}
                  >
                    Anual
                  </Button>
                </div>
                <div className='flex items-center gap-1.5'>
                  <CornerDownRight className='size-3.5' />
                  <span className='bg-secondary text-secondary-foreground rounded-full border px-2.5 py-1 text-[11px] font-semibold'>
                    {yearlyDiscountPercent}% desconto
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {isLoadingPricingPlans && (
            <div className='bg-muted/30 rounded-md border p-6 text-center text-sm'>
              Carregando planos...
            </div>
          )}

          {errorPricingPlans && !isLoadingPricingPlans && (
            <div className='bg-muted/30 flex flex-col items-center gap-3 rounded-md border p-6 text-center text-sm'>
              <span>Nao foi possivel carregar os planos.</span>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => void refetchPricingPlans()}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoadingPricingPlans &&
            !errorPricingPlans &&
            pricingPlans.length === 0 && (
              <div className='bg-muted/30 rounded-md border p-6 text-center text-sm'>
                Nenhum plano ativo no momento.
              </div>
            )}

          {!isLoadingPricingPlans &&
            !errorPricingPlans &&
            pricingPlans.length > 0 && (
              <div className='grid min-h-0 content-start gap-3 overflow-y-auto overscroll-contain pr-1 lg:grid-cols-3'>
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.code}
                    className={cn(
                      'bg-card text-card-foreground flex flex-col rounded-lg border p-3 shadow-xs sm:p-4',
                      plan.featured && 'border-primary shadow-md',
                    )}
                  >
                    <div className='space-y-2.5'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0'>
                          <p className='text-xl font-semibold tracking-tight'>
                            {plan.name}
                          </p>
                          <p className='text-muted-foreground mt-1.5 text-sm leading-snug'>
                            {plan.description}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'bg-secondary text-secondary-foreground max-w-32 shrink-0 rounded-full px-2 py-1 text-center text-[10px] leading-tight font-medium sm:text-[11px]',
                            plan.featured &&
                              'bg-primary text-primary-foreground',
                          )}
                        >
                          {plan.label}
                        </span>
                      </div>

                      <p className='text-2xl font-semibold tracking-tight'>
                        {formatPlanMonthlyPrice(plan)}
                      </p>
                      {billingCycle === 'yearly' &&
                        plan.priceCents !== null && (
                          <p className='text-muted-foreground -mt-2 text-xs'>
                            cobrado {formatPlanYearlyTotal(plan)}/ano
                          </p>
                        )}
                    </div>

                    {/* ponytail: custom conditions start from an account; swap for a contact channel when one exists. */}
                    <Button
                      asChild
                      className='mt-3 h-8 w-full'
                      variant={plan.featured ? 'default' : 'outline'}
                    >
                      <RouterLink to={routes.register}>
                        {plan.action}
                      </RouterLink>
                    </Button>

                    <ul className='mt-3 space-y-1.5 text-xs leading-tight'>
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className='flex gap-2.5'
                        >
                          <Check className='text-primary mt-0.5 size-3.5 shrink-0' />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
