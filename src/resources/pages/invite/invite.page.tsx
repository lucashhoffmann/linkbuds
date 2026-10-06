import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authClient, isGoogleAuthEnabled } from '@/app/modules/auth/client';
import authService from '@/app/modules/auth/service/auth.service';
import teamService from '@/app/modules/team/service/team.service';
import { useInvitePreviewUseCase } from '@/app/modules/team/use-cases/use-team.use-case';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { routes } from '@/shared/constants/router.constants';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';

/**
 * Public route on purpose: accepting must happen before any protected route,
 * because those provision a company of the person's own on first access.
 */
export function InvitePage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const preview = useInvitePreviewUseCase(token);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      await action();
      navigate(routes.home);
    } catch (error) {
      axiosErrorHandler(error);
    } finally {
      setBusy(false);
    }
  }

  function handleRegister(event: FormEvent) {
    event.preventDefault();
    const email = preview.data?.email ?? '';

    void run(async () => {
      await authService.registerService({
        name,
        email,
        password,
        inviteToken: token,
      });
      await authClient.signIn.email({ email, password });
    });
  }

  if (preview.isLoading || isSessionPending) {
    return (
      <InviteShell>
        <p className='text-muted-foreground text-sm'>Carregando convite...</p>
      </InviteShell>
    );
  }

  if (!preview.data) {
    return (
      <InviteShell>
        <h1 className='text-lg font-semibold'>Convite inválido</h1>
        <p className='text-muted-foreground text-sm'>
          O link expirou, foi revogado ou já foi usado. Peça um novo link a quem
          te convidou.
        </p>
      </InviteShell>
    );
  }

  const invite = preview.data;
  const sessionEmail = session?.user?.email?.toLowerCase();

  return (
    <InviteShell>
      <h1 className='text-lg font-semibold'>
        Você foi convidado para {invite.companyName}
      </h1>
      <p className='text-muted-foreground text-sm'>
        Convite para <strong>{invite.email}</strong>.
      </p>

      {sessionEmail === invite.email.toLowerCase() && (
        <Button
          disabled={busy}
          onClick={() => void run(() => teamService.acceptInvite(token))}
        >
          Aceitar convite
        </Button>
      )}

      {sessionEmail && sessionEmail !== invite.email.toLowerCase() && (
        <div className='grid gap-2 text-sm'>
          <p>
            Você está conectado como {session?.user?.email}. Saia para entrar
            com {invite.email}.
          </p>
          <Button
            variant='outline'
            onClick={() => void authClient.signOut()}
          >
            Sair
          </Button>
        </div>
      )}

      {!sessionEmail && (
        <form
          className='grid gap-3'
          onSubmit={handleRegister}
        >
          <div className='grid gap-1.5'>
            <Label htmlFor='invite-name'>Seu nome</Label>
            <Input
              id='invite-name'
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='invite-password'>Crie uma senha</Label>
            <Input
              id='invite-password'
              type='password'
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button
            type='submit'
            disabled={busy}
          >
            Criar acesso e entrar
          </Button>
          {isGoogleAuthEnabled() && (
            <Button
              type='button'
              variant='outline'
              onClick={() =>
                void authClient.signIn.social({
                  provider: 'google',
                  callbackURL: window.location.href,
                })
              }
            >
              Continuar com Google ({invite.email})
            </Button>
          )}
          <p className='text-muted-foreground text-xs'>
            Cada email participa de uma única conta LinkBuds. Se este email já
            tem conta, peça o convite para outro email.
          </p>
        </form>
      )}
    </InviteShell>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className='bg-background flex min-h-svh items-center justify-center p-4'>
      <div className='grid w-full max-w-sm gap-4 rounded-lg border p-6'>
        {children}
      </div>
    </main>
  );
}
