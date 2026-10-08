import { Globe2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '@/app/modules/auth/hooks';
import { useEntitlements } from '@/app/modules/auth/hooks/use-entitlements';
import { useCompanyDomainUseCase } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import { routes } from '@/shared/constants/router.constants';
import { cn } from '@/shared/lib/utils';
import { AccountSection } from './components/account-section.component';
import { AgencyNameSection } from './components/agency-name-section/agency-name-section.component';
import { BillingHistorySection } from './components/billing-history-section.component';
import { BillingSection } from './components/billing-section/billing-section.component';
import { DomainPanel } from './components/domain-panel.component';
import { FooterDefaultSection } from './components/footer-default-section.component';

const SETTINGS_TABS = [
  { label: 'Plano', to: routes.settings },
  { label: 'Histórico', to: routes.settingsHistory },
  { label: 'Domínio', to: routes.settingsDomain },
  { label: 'Rodapé', to: routes.settingsFooter },
  { label: 'Conta', to: routes.settingsAccount },
];

function SettingsLayout({ children }: { children: ReactNode }) {
  const { company } = useSession();

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-8'>
      <header>
        <h1 className='text-xl font-semibold tracking-tight'>Configurações</h1>
        <p className='text-muted-foreground text-sm'>{company?.name}</p>
      </header>

      <nav className='flex gap-1 border-b'>
        {SETTINGS_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {children}
    </div>
  );
}

export function SettingsPage() {
  return (
    <SettingsLayout>
      <BillingSection />
    </SettingsLayout>
  );
}

export function HistorySettingsPage() {
  return (
    <SettingsLayout>
      <BillingHistorySection />
    </SettingsLayout>
  );
}

export function DomainSettingsPage() {
  const entitlements = useEntitlements();
  const domain = useCompanyDomainUseCase(entitlements.customDomain);

  return (
    <SettingsLayout>
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
    </SettingsLayout>
  );
}

export function AccountSettingsPage() {
  return (
    <SettingsLayout>
      <AgencyNameSection />
      <AccountSection />
    </SettingsLayout>
  );
}

export function FooterSettingsPage() {
  return (
    <SettingsLayout>
      <FooterDefaultSection />
    </SettingsLayout>
  );
}
