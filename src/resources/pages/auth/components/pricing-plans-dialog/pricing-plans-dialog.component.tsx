import { type ReactNode } from 'react';
import { Check, CornerDownRight, Globe, Link2 } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/resources/components/ui/dialog';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';
import type {
  BillingCycle,
  PricingPlan,
} from '@/app/modules/pricing-plans/types/pricing-plans.types';
import { usePricingPlansDialogComponent } from './use-pricing-plans-dialog.component';

interface IPricingPlansDialogProps {
  trigger: ReactNode;
}

interface IPricingPlansContentProps {
  title: ReactNode;
  description: ReactNode;
  /** CTA of each card; lets the logged-in variant point at billing instead of sign-up. */
  renderAction: (plan: PricingPlan, billingCycle: BillingCycle) => ReactNode;
}

/** Quotas are the selling point: "Até 30 páginas" → "Até **30** páginas". */
function withBoldNumbers(text: string) {
  return text
    .split(/(\d+)/)
    .map((part, index) =>
      index % 2 ? <strong key={index}>{part}</strong> : part,
    );
}

export function PricingPlansDialog({ trigger }: IPricingPlansDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-h-[calc(100dvh-1rem)] overflow-hidden p-0 sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl'>
        <PricingPlansContent
          title='Planos simples e transparentes'
          description='Escolha o plano ideal para gerenciar links, formulários e questionários, seus e de seus clientes, com métricas de tudo.'
          // ponytail: custom conditions start from an account; swap for a contact channel when one exists.
          renderAction={(plan) => (
            <DialogClose asChild>
              <Button
                asChild
                className='h-9 w-full'
                variant={plan.featured ? 'default' : 'outline'}
              >
                <RouterLink to={routes.register}>{plan.action}</RouterLink>
              </Button>
            </DialogClose>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Plans header, cycle toggle and cards; goes inside a DialogContent. */
export function PricingPlansContent({
  title,
  description,
  renderAction,
}: IPricingPlansContentProps) {
  const {
    billingCycle,
    errorPricingPlans,
    formatPlanInstallments,
    formatPlanMonthlyPrice,
    formatPlanYearlyTotal,
    isLoadingPricingPlans,
    pricingPlans,
    refetchPricingPlans,
    setBillingCycle,
    yearlyDiscountPercent,
  } = usePricingPlansDialogComponent();
  const catalogPlans = pricingPlans.filter((plan) => !plan.custom);
  const customPlan = pricingPlans.find((plan) => plan.custom);
  // Only claimed while every plan really includes it (plans are editable in the DB).
  const domainOnEveryPlan =
    catalogPlans.length > 0 && catalogPlans.every((plan) => plan.customDomain);

  return (
    <div className='flex max-h-[calc(100dvh-1rem)] flex-col gap-3 p-4 sm:p-5'>
      <DialogHeader className='shrink-0 items-stretch gap-3 pr-6 text-left sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0 space-y-2'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md'>
              <Link2 className='size-4' />
            </div>
            <DialogTitle className='text-xl leading-tight font-semibold tracking-tight sm:text-2xl'>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className='max-w-2xl text-sm'>
            {description}
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
          <div className='flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain pr-1'>
            {domainOnEveryPlan && (
              <div className='border-primary/40 bg-primary/10 flex items-center gap-3 rounded-lg border p-3'>
                <div className='bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md'>
                  <Globe className='size-4' />
                </div>
                <p className='text-sm leading-snug'>
                  <span className='font-semibold'>
                    Domínio próprio em todos os planos, inclusive no Grátis.
                  </span>{' '}
                  <span className='text-muted-foreground'>
                    Seus links no endereço da sua marca, como{' '}
                    <span className='text-foreground font-medium'>
                      links.suaagencia.com
                    </span>
                    .
                  </span>
                </p>
              </div>
            )}
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {catalogPlans.map((plan) => (
                <article
                  key={plan.code}
                  className={cn(
                    'bg-card text-card-foreground relative flex flex-col rounded-lg border p-4 shadow-xs',
                    plan.featured &&
                      'border-primary ring-primary shadow-md ring-1',
                  )}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-lg font-semibold tracking-tight'>
                      {plan.name}
                    </p>
                    <span
                      className={cn(
                        'bg-secondary text-secondary-foreground shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        plan.featured && 'bg-primary text-primary-foreground',
                      )}
                    >
                      {plan.label}
                    </span>
                  </div>
                  {/* Fixed 3-line slot keeps prices aligned across cards. */}
                  <p className='text-muted-foreground mt-1 line-clamp-3 text-sm leading-snug lg:min-h-[3lh]'>
                    {plan.description}
                  </p>

                  <p className='mt-3 text-2xl font-semibold tracking-tight'>
                    {formatPlanMonthlyPrice(plan)}
                  </p>
                  <p className='text-muted-foreground min-h-[1lh] text-xs'>
                    {billingCycle === 'yearly' &&
                      plan.priceCents !== null &&
                      `cobrado ${formatPlanYearlyTotal(plan)}/ano${
                        formatPlanInstallments(plan)
                          ? ` · ${formatPlanInstallments(plan)}`
                          : ''
                      }`}
                  </p>

                  <div className='mt-3'>{renderAction(plan, billingCycle)}</div>

                  <ul className='mt-4 space-y-2 border-t pt-4 text-xs leading-tight'>
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className='flex gap-2'
                      >
                        <Check className='text-primary mt-px size-3.5 shrink-0' />
                        <span>{withBoldNumbers(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {customPlan && (
              <article className='bg-muted/40 flex flex-col gap-3 rounded-lg border border-dashed p-4 md:flex-row md:items-center md:justify-between'>
                <div className='min-w-0 space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='font-semibold'>{customPlan.name}</p>
                    <span className='text-muted-foreground text-sm'>
                      {customPlan.priceLabel}
                    </span>
                  </div>
                  <p className='text-muted-foreground text-sm'>
                    {customPlan.description}
                  </p>
                  <ul className='flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs'>
                    {customPlan.features.map((feature) => (
                      <li
                        key={feature}
                        className='flex items-center gap-1.5'
                      >
                        <Check className='text-primary size-3.5 shrink-0' />
                        <span>{withBoldNumbers(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='shrink-0'>
                  {renderAction(customPlan, billingCycle)}
                </div>
              </article>
            )}
          </div>
        )}
    </div>
  );
}
