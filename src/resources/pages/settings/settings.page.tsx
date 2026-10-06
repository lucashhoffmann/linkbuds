import { Globe2 } from 'lucide-react';
import { useSession } from '@/app/modules/auth/hooks';
import { useEntitlements } from '@/app/modules/auth/hooks/use-entitlements';
import { useCompanyDomainUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { BillingSection } from './components/billing-section.component';
import { DomainPanel } from './components/domain-panel.component';

export function SettingsPage() {
  const { company } = useSession();
  const entitlements = useEntitlements();
  const domain = useCompanyDomainUseCase(entitlements.customDomain);

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-8'>
      <header>
        <h1 className='text-xl font-semibold tracking-tight'>Configurações</h1>
        <p className='text-muted-foreground text-sm'>{company?.name}</p>
      </header>

      <BillingSection />

      <section className='bg-card rounded-2xl border p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h2 className='font-semibold'>Domínio próprio</h2>
            <p className='text-muted-foreground text-sm'>
              Publique as páginas da agência e dos clientes no seu domínio.
            </p>
          </div>
          <Globe2 className='text-muted-foreground size-5' />
        </div>
        {entitlements.customDomain ? (
          <DomainPanel domain={domain} />
        ) : (
          <p className='bg-muted mt-3 rounded-xl p-3 text-sm'>
            Domínio próprio não está incluído no seu plano.
          </p>
        )}
      </section>
    </div>
  );
}
